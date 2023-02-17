import {
  Box,
  Flex,
  Grid,
  Image,
  Text,
  Chip,
  Badge,
  useMantineTheme,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";
import ProspectDetailsDrawer from "../../drawers/ProspectDetailsDrawer";

import { useRecoilState, useRecoilValue } from "recoil";
import {
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

const ALL_PROSPECT_STATUSES = [
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'SENT_OUTREACH', label: 'Sent Outreach' },
  { value: 'RESPONDED', label: 'Bumped' },
  { value: 'ACTIVE_CONVO', label: 'Active Conversation' },
  { value: 'SCHEDULING', label: 'Scheduling' },
  { value: 'DEMO_SET', label: 'Demo Set' },
  { value: 'DEMO_WON', label: 'Demo Complete' },
  { value: 'DEMO_LOSS', label: 'Demo Missed' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'NOT_QUALIFIED', label: 'Not Qualified' },
];
export { ALL_PROSPECT_STATUSES };

export function getDefaultStatuses(selectorType: string){
  if(selectorType === 'accepted'){
    return ['ACCEPTED'];
  } else if(selectorType === 'bumped'){
    return ['RESPONDED'];
  } else if(selectorType === 'active'){
    return ['ACTIVE_CONVO', 'SCHEDULING'];
  } else if(selectorType === 'demo'){
    return ['DEMO_SET', 'DEMO_WON', 'DEMO_LOSS'];
  }
  return [];
}
export function getSelectorTypeFromStatuses(statuses: string[]){
  let statusesSet = new Set(statuses);
  let potentialTypes = [];

  // Order matters here, the first added is the most likely to be set
  if(statusesSet.has('DEMO_SET') && statusesSet.has('DEMO_WON') && statusesSet.has('DEMO_LOSS')){
    potentialTypes.push('demo');
  }
  if(statusesSet.has('ACTIVE_CONVO') && statusesSet.has('SCHEDULING')){
    potentialTypes.push('active');
  }
  if(statusesSet.has('RESPONDED')){
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
  }, [search, statuses]);

  useEffect(() => {
    let potentialTypes = getSelectorTypeFromStatuses(statuses);
    // potentialTypes is in order of most to least difficult to match.
    // Update the selector type to hardest to match.
    setSelectorType(potentialTypes[0]);
  }, [statuses]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-pipeline-prospects`,
      { page, sortStatus, statuses, search },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, statuses, search }] = queryKey;

      // TODO: Remove console.log
      //console.log(page, sortStatus, statuses, search);
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
      return res.prospects.map((prospect: any) => {
        return {
          id: prospect.id,
          full_name: prospect.full_name,
          company: prospect.company,
          title: prospect.title,
          industry: prospect.industry,
          status: prospect.status,
        };
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <Grid grow>
        <Grid.Col span={4}>
          <TextInput
            label="Search Prospects"
            placeholder="Search by Name, Company, or Title"
            mb="md"
            name="search prospects"
            width={"500px"}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IconSearch size={14} />}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <MultiSelect
            data={ALL_PROSPECT_STATUSES}
            mb="md"
            label="Filter by Status"
            placeholder="Select statuses"
            searchable
            nothingFound="Nothing found"
            value={statuses}
            onChange={setStatuses}
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
            sortable: true,
            render: ({ status }) => {
              return (
                <Badge color={valueToColor(theme, formatToLabel(status))}>
                  {formatToLabel(status)}
                </Badge>
              );
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
