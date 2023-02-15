import { Box, Flex, Image, Text, Chip, Group, Badge, Avatar, useMantineTheme } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { forwardRef, useEffect, useRef, useState } from "react";
import { MultiSelect } from "@mantine/core";
import CampaignDetailsDrawer from "@drawers/CampaignDetailsDrawer";
import { IconCalendar, IconUsers } from "@tabler/icons";

import { useRecoilState } from "recoil";
import { activeCampaignState, campaignDrawerOpenState } from "@atoms/campaignAtoms";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { useQuery } from "react-query";
import { temp_delay, valueToColor } from "@utils/general";
import { chunk } from "lodash";
import { faker } from "@faker-js/faker";
import { Campaign } from "src/main";

const FAKER_DATA: Campaign[] = Array.from({ length: 100 }).map((_, index) => ({
  uuid: faker.datatype.uuid(),
  id: faker.datatype.number(),
  name: faker.lorem.words(5),
  prospectIds: Array.from({ length: 10 }).map((_, index) => faker.datatype.number()),
  type: faker.datatype.boolean() ? 'EMAIL' : 'LINKEDIN',
  ctaIds: Array.from({ length: 10 }).map((_, index) => faker.datatype.number()),
  personaId: faker.datatype.number(),
  clientSDRId: faker.datatype.number(),
  startDate: faker.date.past(),
  endDate: faker.date.future(),
  status: 'PENDING',
  briefFeedbackSummary: faker.lorem.words(10),
  editingDueDate: faker.date.future(),
}));

const FAKER_REPRESENTATIVES = Array.from({ length: 10 }).map((_, index) => {
  const name = faker.lorem.words(2);
  return {
    image: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name)}`,
    label: name,
    value: name,
    description: faker.lorem.words(5),
  };
});

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

const SelectRepresent = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref: any) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />

        <div>
          <Text>{label}</Text>
          <Text size="xs" color="dimmed">
            {description}
          </Text>
        </div>
      </Group>
    </div>
  )
);

const PAGE_SIZE = 10;

function defaultFilterDate() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  return [today, oneYearAgo] satisfies DateRangePickerValue;
}

export default function ProspectTable() {

  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(campaignDrawerOpenState);
  const [activeCampaign, setActiveCampaign] = useRecoilState(activeCampaignState);

  const [represent, setRepresent] = useState('');
  const [filterDate, setFilterDate] = useState<DateRangePickerValue>(defaultFilterDate);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "id",
    direction: "asc",
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-campaign-data`, { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      await temp_delay(1000);
      totalRecords.current = FAKER_DATA.length;
      const pageData = chunk(FAKER_DATA, PAGE_SIZE)[page - 1];
      return pageData;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <div style={{ display: 'flex' }}>
        <MultiSelect
            data={FAKER_REPRESENTATIVES}
            label="Representatives"
            placeholder="Pick representatives"
            icon={<IconUsers size={16} />}
            itemComponent={SelectRepresent}
            searchable
            searchValue={represent}
            onSearchChange={setRepresent}
            nothingFound="Nothing found"
            clearButtonLabel="Clear selection"
            clearable
            maxDropdownHeight={400}
            filter={(value, selected, item) =>
              !selected &&
              (item.label?.toLowerCase().includes(value.toLowerCase().trim()) ||
                item.description.toLowerCase().includes(value.toLowerCase().trim()))
            }
            style={{ maxWidth: '50%', flexBasis: '50%', }}
            p={'xs'}
          />
          <DateRangePicker
            label="Filter by Date"
            placeholder="Pick date range"
            icon={<IconCalendar size={16} />}
            value={filterDate}
            onChange={setFilterDate}
            inputFormat="MMM D, YYYY"
            amountOfMonths={2}
            style={{ maxWidth: '50%', flexBasis: '50%', }}
            p={'xs'}
          />
      </div>


      <DataTable
          height={'min(670px, 100vh - 200px)'}
          verticalAlignment="top"
          loaderColor="teal"
          highlightOnHover
          noRecordsText={"No campaigns found"}
          fetching={isFetching}
          columns={[ 
            {
              accessor: "status",
              title: "Status",
              sortable: true,
              render: ({ status }) => {
                return (
                  <Badge color={valueToColor(theme, status)}>{status.replaceAll("_", " ")}</Badge>
                );
              },
            },
            {
              accessor: "type",
              title: "Type",
              sortable: true,
              render: ({ type }) => {
                return (
                  <Badge color={valueToColor(theme, type)}>{type.replaceAll("_", " ")}</Badge>
                );
              },
            },
            {
              accessor: "startDate",
              title: "Start",
              sortable: true,
              render: ({ startDate }) => {
                return (
                  <Text>
                    {startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                );
              },
            },
            {
              accessor: "endDate",
              title: "End",
              sortable: true,
              render: ({ endDate }) => {
                return (
                  <Text>
                    {endDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                );
              },
            },
            {
              accessor: "name",
              title: "Name",
              sortable: true,
              ellipsis: true,
            },
            {
              accessor: "prospectIds",
              title: "# Prospects",
              sortable: true,
              render: ({ prospectIds }) => {
                return (
                  <Text>{prospectIds.length}</Text>
                );
              },
            },
            {
              accessor: "acceptedCount",
              title: "# Accepted",
              sortable: true,
            },
            {
              accessor: "respondedCount",
              title: "# Responded",
              sortable: true,
            },
            {
              accessor: "schedulingCount",
              title: "# Scheduling",
              sortable: true,
            },
          ]}
          records={(data) ? data.map((d) => {
            return {
              ...d,
              acceptedCount: 1,
              respondedCount: 1,
              schedulingCount: 1,
            }
          }) : undefined}
          page={page}
          onPageChange={setPage}
          totalRecords={totalRecords.current}
          recordsPerPage={PAGE_SIZE}
          paginationColor="teal"
          sortStatus={sortStatus}
          onSortStatusChange={handleSortStatusChange}
          onRowClick={(data) => { setActiveCampaign(data satisfies Campaign); setOpened(true); }}
        />
      <CampaignDetailsDrawer />
    </Box>
  );
}
