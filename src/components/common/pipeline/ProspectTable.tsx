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
import { useEffect, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";
import ProspectDetailsDrawer from "../../drawers/ProspectDetailsDrawer";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectDrawerOpenState,
  prospectSelectorTypeState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { useQuery } from "react-query";
import { valueToColor } from "@utils/general";
import { StatGridInfo } from "./PipelineSelector";
import { useDebouncedState } from "@mantine/hooks";

const ALL_STATUSES = [
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'SENT_OUTREACH', label: 'Sent Outreach' },
  { value: 'RESPONDED', label: 'Responded' },
  { value: 'ACTIVE_CONVO', label: 'Active Conversation' },
  { value: 'SCHEDULING', label: 'Scheduling' },
  { value: 'DEMO_SET', label: 'Demo Set' },
  { value: 'DEMO_WON', label: 'Demo Complete' },
  { value: 'DEMO_LOSS', label: 'Demo Missed' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'NOT_QUALIFIED', label: 'Not Qualified' },
];

function getInniateStatuses(selectorType: string){
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

const PAGE_SIZE = 20;

export default function ProspectTable({
  selectorData,
}: {
  selectorData: Map<string, StatGridInfo>;
}) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const selectorType = useRecoilValue(prospectSelectorTypeState);
  const userToken = useRecoilValue(userTokenState);

  const [search, setSearch] = useDebouncedState("", 200);
  const [statuses, setStatuses] = useState<string[]>([]);

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

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-pipeline-prospects`,
      { page, sortStatus, statuses, search },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, statuses, search }] = queryKey;
      const filterStatuses = [...statuses, ...getInniateStatuses(selectorType)];

      console.log(page, sortStatus, filterStatuses, search);

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
            status: filterStatuses.length > 0 ? filterStatuses : undefined,
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
      const res = await response.json();
      if (!res) {
        return [];
      }

      return res.map((prospect: any) => {
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
  });

  return (
    <Box>
      <Grid grow>
        <Grid.Col span={4}>
          <TextInput
            label="Search Prospects"
            placeholder="Search by Name, Company, Title, or Industry"
            mb="md"
            width={"500px"}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IconSearch size={14} />}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <MultiSelect
            data={ALL_STATUSES.filter((status) => !getInniateStatuses(selectorType).includes(status.value))}
            mb="md"
            label="Filter by Status"
            placeholder="Pick all that you like"
            searchable
            nothingFound="Nothing found"
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
            accessor: "industry",
            sortable: true,
          },
          {
            accessor: "status",
            sortable: true,
            render: ({ status }) => {
              return (
                <Badge color={valueToColor(theme, status)}>
                  {status.replaceAll("_", " ")}
                </Badge>
              );
            },
          },
        ]}
        records={data}
        totalRecords={+(selectorData.get(selectorType)?.value || PAGE_SIZE)}
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
