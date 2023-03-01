import {
  Box,
  Flex,
  Image,
  Text,
  Chip,
  Group,
  Badge,
  Avatar,
  useMantineTheme,
  Grid,
  Select,
  TextInput,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { forwardRef, useEffect, useRef, useState } from "react";
import { MultiSelect } from "@mantine/core";
import CampaignDetailsDrawer from "@drawers/CampaignDetailsDrawer";
import { IconCalendar, IconSearch, IconUsers } from "@tabler/icons";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  campaignDrawerIdState,
  campaignDrawerOpenState,
} from "@atoms/campaignAtoms";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { useQuery } from "react-query";
import { formatDate, temp_delay, valueToColor } from "@utils/general";
import { chunk } from "lodash";
import { faker } from "@faker-js/faker";
import { Campaign } from "src/main";
import { logout } from "@auth/core";
import { userTokenState } from "@atoms/userAtoms";
import { useDebouncedState, useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "@constants/data";

/* For if we want to add something like this in the future:
interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
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
*/

const ALL_CAMPAIGN_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "NEEDS_REVIEW", label: "Needs Review" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "INITIAL_EDIT_COMPLETE", label: "Initial Edit Complete" },
  { value: "READY_TO_SEND", label: "Ready to Send" },
  { value: "COMPLETE", label: "Complete" },
  { value: "CANCELLED", label: "Cancelled" },
];
export { ALL_CAMPAIGN_STATUSES };

const ALL_TYPES = [
  { value: "EMAIL", label: "Email" },
  { value: "LINKEDIN", label: "LinkedIn" },
];

const PAGE_SIZE = 20;

export default function CampaignTable() {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  const [opened, setOpened] = useRecoilState(campaignDrawerOpenState);
  const [campaignId, setCampaignId] = useRecoilState(campaignDrawerIdState);
  const userToken = useRecoilValue(userTokenState);
  const totalRecords = useRef(0);

  const [search, setSearch] = useDebouncedState("", 200);
  const [filterDate, setFilterDate] =
    useState<DateRangePickerValue>([null, null]);
  const [type, setType] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "campaign_start_date",
    direction: "desc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-campaigns-data`,
      { page, sortStatus, search, filterDate, type },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, search, filterDate, type }] =
        queryKey;

      totalRecords.current = 0;

      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/campaigns/all_campaigns`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: search.length > 0 ? search : undefined,
            campaign_type: type ? [type] : undefined,
            status: ['COMPLETE'],
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            campaign_start_date: filterDate[0] ? formatDate(new Date(filterDate[0])) : undefined,
            campaign_end_date: filterDate[1] ? formatDate(new Date(filterDate[1])) : undefined,
            filters: [
              {
                field: sortStatus.columnAccessor,
                direction: sortStatus.direction === "asc" ? 1 : -1,
              },
            ],
          }),
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.outbound_campaigns) {
        return [];
      }

      totalRecords.current = res.total_count;

      return res.outbound_campaigns.map((campaign: any) => {
        return {
          uuid: campaign.uuid,
          id: campaign.id,
          name: campaign.canonical_name || campaign.name,
          prospect_ids: campaign.prospect_ids,
          campaign_type: campaign.campaign_type,
          ctas: campaign.ctas,
          client_archetype_id: campaign.client_archetype_id,
          client_sdr_id: campaign.client_sdr_id,
          campaign_start_date: campaign.campaign_start_date,
          campaign_end_date: campaign.campaign_end_date,
          status: campaign.status,
        };
      }) as Campaign[];
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <div style={{ display: "flex", flexWrap: (smScreenOrLess) ? 'wrap' : 'nowrap' }}>
        <TextInput
          label="Search Campaigns"
          placeholder="Search by Campaign Name"
          name="search campaigns"
          width={"500px"}
          onChange={(e) => setSearch(e.currentTarget.value)}
          icon={<IconSearch size={14} />}
          style={(smScreenOrLess) ? { maxWidth: "100%", flexBasis: "100%" } : { maxWidth: "33%", flexBasis: "33%" }}
          px={"xs"}
        />
        <DateRangePicker
          label="Filter by Date"
          placeholder="Pick date range"
          icon={<IconCalendar size={16} />}
          value={filterDate}
          onChange={setFilterDate}
          inputFormat="MMM D, YYYY"
          amountOfMonths={2}
          style={(smScreenOrLess) ? { maxWidth: "100%", flexBasis: "100%" } : { maxWidth: "33%", flexBasis: "33%" }}
          px={"xs"}
        />
        <Select
          label="Filter by Type"
          placeholder="Select a type"
          data={ALL_TYPES}
          value={type}
          onChange={setType}
          searchable
          clearable
          style={(smScreenOrLess) ? { maxWidth: "100%", flexBasis: "100%" } : { maxWidth: "33%", flexBasis: "33%" }}
          px={"xs"}
        />
      </div>

      {/* For if we want to add something like this in the future:
        <MultiSelect
          data={FAKER_REPRESENTATIVES}
          label="Select Representatives"
          placeholder="Representatives"
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
              item.description
                .toLowerCase()
                .includes(value.toLowerCase().trim()))
          }
          style={{ maxWidth: "50%", flexBasis: "50%" }}
          p={"xs"}
        />
        */}

      <DataTable
        withBorder
        height={"min(670px, 100vh - 200px)"}
        verticalAlignment="top"
        mt="md"
        loaderColor="teal"
        highlightOnHover
        noRecordsText={"No campaigns found"}
        fetching={isFetching}
        rowSx={{ height: 50 }}
        columns={[
          {
            accessor: "campaign_start_date",
            title: "Start",
            sortable: true,
            render: ({ campaign_start_date }) => {
              return (
                <Text>
                  {new Date(campaign_start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              );
            },
          },
          {
            accessor: "campaign_end_date",
            title: "End",
            sortable: true,
            render: ({ campaign_end_date }) => {
              return (
                <Text>
                  {new Date(campaign_end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              );
            },
          },
          {
            accessor: "campaign_type",
            title: "Type",
            sortable: true,
            render: ({ campaign_type }) => {
              return (
                <Badge color={valueToColor(theme, campaign_type)}>
                  {campaign_type.replaceAll("_", " ")}
                </Badge>
              );
            },
          },
          {
            accessor: "name",
            title: "Name",
            sortable: true,
            ellipsis: true,
            width: '20vw',
          },
          {
            accessor: "prospect_ids",
            title: "# Prospects",
            sortable: true,
            render: ({ prospect_ids }) => {
              return <Text>{prospect_ids.length}</Text>;
            },
          },
        ]}
        records={data}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        paginationColor="teal"
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        onRowClick={(data) => {
          setCampaignId(data.id);
          setOpened(true);
        }}
      />
      <CampaignDetailsDrawer />
    </Box>
  );
}
