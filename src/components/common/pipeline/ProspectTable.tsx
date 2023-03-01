import {
  Box,
  Flex,
  Grid,
  Image,
  Text,
  Chip,
  Badge,
  useMantineTheme,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";
import ProspectDetailsDrawer from "../../drawers/ProspectDetailsDrawer";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectChannelState,
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectStatusesState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { useQuery } from "react-query";
import { formatToLabel, valueToColor } from "@utils/general";
import { StatGridInfo } from "./PipelineSelector";
import { useDebouncedState, usePrevious } from "@mantine/hooks";
import { logout } from "@auth/core";
import getChannels from "@utils/requests/getChannels";

const ALL_PROSPECT_STATUSES = [
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'ACTIVE_CONVO', label: 'Active Conversation' },
  { value: 'BUMPED', label: 'Bumped' },
  { value: 'DEMO', label: 'Demo Set' },
  { value: 'PROSPECTED', label: 'Prospected' },
  { value: 'REMOVED', label: 'Removed' },
  { value: 'SENT_OUTREACH', label: 'Sent Outreach' },
];
const ALL_PROSPECT_CHANNELS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'EMAIL', label: 'Email' },
  //TODO: { value: 'NONE', label: 'None' },
];
export { ALL_PROSPECT_STATUSES, ALL_PROSPECT_CHANNELS };

export function getDefaultStatuses(selectorType: string){
  if(selectorType === 'accepted'){
    return ['ACCEPTED'];
  } else if(selectorType === 'bumped'){
    return ['BUMPED'];
  } else if(selectorType === 'active'){
    return ['ACTIVE_CONVO'];
  } else if(selectorType === 'demo'){
    return ['DEMO'];
  }
  return [];
}
export function getSelectorTypeFromStatuses(statuses: string[]){
  let statusesSet = new Set(statuses);
  let potentialTypes = [];

  // Order matters here, the first added is the most likely to be set
  if(statusesSet.has('DEMO')){
    potentialTypes.push('demo');
  }
  if(statusesSet.has('ACTIVE_CONVO')){
    potentialTypes.push('active');
  }
  if(statusesSet.has('BUMPED')){
    potentialTypes.push('bumped');
  }
  if(statusesSet.has('ACCEPTED')){
    potentialTypes.push('accepted');
  }
  potentialTypes.push('all');
  return potentialTypes;
}

const PAGE_SIZE = 20;

export default function ProspectTable({
  selectorData,
}: {
  selectorData: Map<string, StatGridInfo>;
}) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  const [selectorType, setSelectorType] = useRecoilState(prospectSelectorTypeState);
  const userToken = useRecoilValue(userTokenState);
  const totalRecords = useRef(0);

  const [search, setSearch] = useDebouncedState("", 200);
  const [statuses, setStatuses] = useRecoilState(prospectStatusesState);
  const [channel, setChannel] = useRecoilState(prospectChannelState);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "full_name",
    direction: "asc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  useEffect(() => {
    setPage(1);
  }, [search, statuses, channel]);

  useEffect(() => {
    let potentialTypes = getSelectorTypeFromStatuses(statuses);
    // potentialTypes is in order of most to least difficult to match.
    // Update the selector type to hardest to match.
    setSelectorType(potentialTypes[0]);
  }, [statuses]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-pipeline-prospects`,
      { page, sortStatus, statuses, search, channel },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, statuses, search, channel }] = queryKey;

      totalRecords.current = 0;

      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/prospect/get_prospects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: search.length > 0 ? search : undefined,
            channel: channel.length > 0 ? channel : 'SELLSCALE',
            status: statuses.length > 0 ? statuses : undefined,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            filters: [
              {
                field: sortStatus.columnAccessor,
                direction: sortStatus.direction === 'asc' ? 1 : -1,
              },
            ],
          }),
        }
      );
      if(response.status === 401){ logout() }
      const res = await response.json();
      if (!res || !res.prospects) {
        return [];
      }

      totalRecords.current = res.total_count;

      console.log(res.prospects);
      return res.prospects.map((prospect: any) => {
        return {
          id: prospect.id,
          full_name: prospect.full_name,
          company: prospect.company,
          title: prospect.title,
          industry: prospect.industry,
          status: prospect.overall_status || prospect.status,
          channels: [
            prospect.approved_outreach_message_id ? 'LINKEDIN' : undefined,
            prospect.approved_prospect_email_id ? 'EMAIL' : undefined
          ].filter((x) => x),
        };
      });
    },
    refetchOnWindowFocus: false,
  });


  const { data: data_channels } = useQuery({
    queryKey: [
      `query-get-channels-prospects`,
    ],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <Box>
      <Grid grow>
        <Grid.Col span={5}>
          <TextInput
            label="Search Prospects"
            placeholder="Search by Name, Company, or Title"
            mb="md"
            name="search prospects"
            width={"500px"}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IconSearch size={14} />}
            className='truncate'
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <MultiSelect
            data={
              // If channels are not loaded or failed to fetch, don't show anything
              (!data_channels || data_channels.status !== 'success') ? [] : 
              // Otherwise, show overall statuses
                data_channels.extra['SELLSCALE'].statuses_available.map((status: string) => {
              return {
                label: data_channels.extra['SELLSCALE'][status].name,
                value: status,
              };
            })}
            mb="md"
            label="Filter by Overall Status"
            placeholder="Select statuses"
            searchable
            nothingFound="Nothing found"
            value={statuses}
            onChange={setStatuses}
            className='truncate'
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Select
            data={
              // If channels are not loaded or failed to fetch, don't show anything
              (!data_channels || data_channels.status !== 'success') ? [] : 
              // Otherwise, show channels (other than SELLSCALE)
                Object.keys(data_channels.extra).filter(x => x !== 'SELLSCALE').map((channel) => {
              return {
                label: formatToLabel(channel),
                value: channel,
              };
            })}
            mb="md"
            clearable
            label="Filter by Channel"
            placeholder="Select channel"
            value={channel}
            onChange={(value) => value ? setChannel(value) : setChannel('')}
            className='truncate'
          />
        </Grid.Col>
      </Grid>

      <DataTable
        withBorder
        height={'min(670px, 100vh - 200px)'}
        verticalAlignment="top"
        loaderColor="teal"
        highlightOnHover
        noRecordsText={"No prospects found"}
        fetching={isFetching}
        onRowClick={(prospect, row_index) => {
          setProspectId(prospect.id);
          setOpened(true);
        }}
        columns={[
          {
            accessor: "full_name",
            sortable: true,
            render: (x: any) => {
              return (
                <Flex>
                  <Image
                    src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                      x.full_name
                    )}`}
                    radius="lg"
                    height={30}
                    width={30}
                  ></Image>
                  <Text ml="md">{x.full_name}</Text>
                </Flex>
              );
            },
          },
          {
            accessor: "company",
            sortable: true,
          },
          {
            accessor: "title",
            sortable: true,
          },
          {
            accessor: "status",
            title: 'Overall Status',
            render: ({ status }) => {
              return (
                <Badge color={valueToColor(theme, formatToLabel(status))}>
                  {formatToLabel(status)}
                </Badge>
              );
            },
          },
          {
            accessor: "channels",
            render: ({ channels }) => {
              return channels.map((c: string, index: number) => (
                <Badge key={index} color={valueToColor(theme, formatToLabel(c))}>
                  {formatToLabel(c)}
                </Badge>
              ));
            },
          },
        ]}
        records={data}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        paginationColor="teal"
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
      />

      <ProspectDetailsDrawer />
    </Box>
  );
}
