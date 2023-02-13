import { Box, Flex, Grid, Image, Text, Chip, Group, Badge, Avatar } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { forwardRef, useEffect, useRef, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";
import ProspectDetailsDrawer from "../../drawers/ProspectDetailsDrawer";
import { IconCalendar } from "@tabler/icons";

import { useRecoilState } from "recoil";
import { prospectDrawerOpenState } from "../../atoms/personaAtoms";
import { campaignDrawerOpenState } from "@atoms/campaignAtoms";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { useQuery } from "react-query";
import { temp_delay } from "@utils/general";
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

const PAGE_SIZE = 20;

function defaultFilterDate() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  return [today, oneYearAgo] satisfies DateRangePickerValue;
}

export default function ProspectTable() {

  const [opened, setOpened] = useRecoilState(campaignDrawerOpenState);

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
      <div style={{ display: 'flex',  }}>
        <MultiSelect
            data={FAKER_REPRESENTATIVES}
            label="Representatives"
            placeholder="Pick representatives"
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
          />
          <DateRangePicker
            label="Filter by Date"
            placeholder="Pick date range"
            icon={<IconCalendar size={16} />}
            value={filterDate}
            onChange={setFilterDate}
          />
      </div>


      <DataTable
          verticalAlignment="top"
          loaderColor="teal"
          noRecordsText={"No campaigns found"}
          fetching={isFetching}
          columns={[ 
            {
              accessor: "status",
              title: "Status",
              sortable: true,
              render: ({ status }) => {
                return (
                  <Badge>{status.replaceAll("_", " ").toLowerCase()}</Badge>
                );
              },
            },
            {
              accessor: "type",
              title: "Type",
              sortable: true,
              render: ({ type }) => {
                return (
                  <Badge>{type.replaceAll("_", " ").toLowerCase()}</Badge>
                );
              },
            },
            {
              accessor: "startDate",
              title: "Start",
              sortable: true,
              render: ({ startDate }) => {
                return (
                  <Text>{startDate.toTimeString()}</Text>
                );
              },
            },
            {
              accessor: "endDate",
              title: "End",
              sortable: true,
              render: ({ endDate }) => {
                return (
                  <Text>{endDate.toTimeString()}</Text>
                );
              },
            },
            {
              accessor: "name",
              title: "Name",
              sortable: true,
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
          onRowClick={({ id }) => setOpened(true)}
        />

      <DataTable
        withBorder
        records={data}
        verticalSpacing="sm"
        highlightOnHover
        onRowClick={(prospect, row_index) => {
          setOpened(true);
        }}
        columns={[
          {
            accessor: "full_name",
            render: (x: any) => {
              return (
                <Flex>
                  <Image
                    src={
                      `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                        x.full_name
                      )}`
                    }
                    radius="lg"
                    height={30}
                    width={30}
                  ></Image>
                  <Text ml="md">{x.full_name}</Text>
                </Flex>
              );
            },
          },
          { accessor: "company" },
          { accessor: "title" },
          { accessor: "industry" },
          {
            accessor: "status",
            render: (x: any) => {
              return (
                <Chip defaultChecked color="teal">
                  {x.status.replaceAll("_", " ").toLowerCase()}
                </Chip>
              );
            },
          },
        ]}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
      />
      <ProspectDetailsDrawer />
    </Box>
  );
}
