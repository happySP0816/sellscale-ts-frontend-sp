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
import { useQuery } from "@tanstack/react-query";
import { formatDate, valueToColor } from "@utils/general";
import { chunk } from "lodash";
import { faker } from "@faker-js/faker";
import { logout } from "@auth/core";
import { userTokenState } from "@atoms/userAtoms";
import { useDebouncedState, useMediaQuery } from "@mantine/hooks";
import { API_URL, SCREEN_SIZES } from "@constants/data";
import { Campaign, Channel } from "src";
import { currentProjectState } from "@atoms/personaAtoms";

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
        <Avatar src={proxyURL(image)} />

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

export default function CampaignTable(props: { type?: Channel }) {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  const [opened, setOpened] = useRecoilState(campaignDrawerOpenState);
  const [campaignId, setCampaignId] = useRecoilState(campaignDrawerIdState);
  const userToken = useRecoilValue(userTokenState);
  const totalRecords = useRef(0);

  const currentProject = useRecoilValue(currentProjectState);

  const [search, setSearch] = useDebouncedState("", 200);
  //const [filterDate, setFilterDate] = useState<DateRangePickerValue>([null, null]);
  //const [type, setType] = useState<string | null>(null);
  const type = props.type;

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
    queryKey: [`query-campaigns-data`, { page, sortStatus, search, type }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, search, type }] = queryKey;

      totalRecords.current = 0;

      const response = await fetch(`${API_URL}/campaigns/all_campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: search.length > 0 ? search : undefined,
          campaign_type: type ? [type] : undefined,
          status: ["COMPLETE"],
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          archetype_id: currentProject?.id || -1,
          //campaign_start_date: filterDate[0] ? formatDate(new Date(filterDate[0])) : undefined,
          //campaign_end_date: filterDate[1] ? formatDate(new Date(filterDate[1])) : undefined,
          filters: [
            {
              field: sortStatus.columnAccessor,
              direction: sortStatus.direction === "asc" ? 1 : -1,
            },
          ],
          include_analytics: true,
        }),
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.outbound_campaigns) {
        return [];
      }

      totalRecords.current = res.total_count;

      return res.outbound_campaigns.map((campaign: any) => {
        const total_prospects = campaign.prospect_ids.length;

        let total_sent = 0;
        let total_opened = 0;
        let total_replied = 0;
        let total_demo_count = 0;
        if (
          campaign.analytics != null ||
          typeof campaign.analytics != "string"
        ) {
          total_sent =
            campaign.analytics?.email_sent?.length > 0
              ? campaign.analytics.email_sent.length
              : 0;
          total_opened =
            campaign.analytics?.email_opened?.length > 0
              ? campaign.analytics.email_opened.length
              : 0;
          total_replied =
            campaign.analytics?.email_replied?.length > 0
              ? campaign.analytics.email_replied.length
              : 0;
          total_demo_count =
            campaign.analytics?.prospect_demo_set?.length > 0
              ? campaign.analytics.prospect_demo_set.length
              : 0;
        }
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

          // Linkedin Analytics
          num_acceptances: campaign.analytics?.["# Acceptances"],
          num_replies: campaign.analytics?.["# Replies"],
          num_demos: campaign.analytics?.["# Demos"],
          demos: campaign.analytics?.["Companies Demos"],

          // Email Analytics
          total_prospects: total_prospects,
          analytics_sent: total_sent,
          analytics_open_rate: total_opened / total_prospects,
          analytics_reply_rate: total_replied / total_prospects,
          analytics_demo_count: total_demo_count,
        };
      }) as Campaign[];
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <div
        style={{
          display: "flex",
          flexWrap: smScreenOrLess ? "wrap" : "nowrap",
        }}
      >
        <TextInput
          label="Search Campaigns"
          placeholder="Search by Campaign Name"
          name="search campaigns"
          width={"500px"}
          onChange={(e) => setSearch(e.currentTarget.value)}
          icon={<IconSearch size={14} />}
          style={
            smScreenOrLess
              ? { maxWidth: "100%", flexBasis: "100%" }
              : { maxWidth: "60%", flexBasis: "60%" }
          }
          px={"xs"}
        />
        {/*
        <DateRangePicker
          label="Filter by Date"
          placeholder="Pick date range"
          icon={<IconCalendar size={16} />}
          value={filterDate}
          onChange={setFilterDate}
          inputFormat="MMM D, YYYY"
          amountOfMonths={2}
          style={(smScreenOrLess) ? { maxWidth: "100%", flexBasis: "100%" } : { maxWidth: "40%", flexBasis: "40%" }}
          px={"xs"}
        />
        */}
        {/*
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
        */}
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
        noRecordsText={"No campaigns generated yet! Check back soon..."}
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
          /*
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
          */
          {
            accessor: "name",
            title: "Name",
            sortable: true,
            ellipsis: true,
            width: "20vw",
          },
          {
            accessor: "prospect_ids",
            title: "# Prospects",
            sortable: true,
            render: ({ prospect_ids }) => {
              return <Text>{prospect_ids.length}</Text>;
            },
          },
          {
            accessor: "num_acceptances",
            title: "# Acceptances",
            hidden: type !== "LINKEDIN",
            sortable: true,
            render: ({ num_acceptances }) => {
              return <Text>{num_acceptances}</Text>;
            },
          },
          {
            accessor: "num_replies",
            title: "# Replies",
            hidden: type !== "LINKEDIN",
            sortable: true,
            render: ({ num_replies }) => {
              return <Text>{num_replies}</Text>;
            },
          },
          {
            accessor: "num_demos",
            title: "# Demos",
            hidden: type !== "LINKEDIN",
            sortable: true,
            render: ({ num_demos }) => {
              return <Text>{num_demos}</Text>;
            },
          },
          {
            accessor: "demos",
            title: "Demos",
            hidden: type !== "LINKEDIN",
            sortable: true,
            render: ({ demos }) => {
              return (
                demos &&
                demos.map((demo: any) => {
                  return (
                    <Badge
                      color={valueToColor(theme, demo)}
                      style={{ marginRight: 5 }}
                    >
                      {demo}
                    </Badge>
                  );
                })
              );
            },
          },
          {
            accessor: "# Emails Sent",
            title: "# Sent",
            hidden: type !== "EMAIL",
            sortable: true,
            render: ({ analytics_sent }) => {
              return <Text>{analytics_sent}</Text>;
            },
          },
          {
            accessor: "open_rate",
            title: "Open Rate %",
            hidden: type !== "EMAIL",
            sortable: false,
            render: ({ analytics_open_rate }) => {
              return <Text>{(analytics_open_rate * 100).toFixed(2)} %</Text>;
            },
          },
          {
            accessor: "reply_rate",
            hidden: type !== "EMAIL",
            title: "Reply Rate %",
            sortable: false,
            render: ({ analytics_reply_rate }) => {
              return <Text>{(analytics_reply_rate * 100).toFixed(2)} %</Text>;
            },
          },
          {
            accessor: "num_demos",
            hidden: type !== "EMAIL",
            title: "# Demos",
            sortable: false,
            render: ({ analytics_demo_count }) => {
              return <Text>{analytics_demo_count}</Text>;
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
