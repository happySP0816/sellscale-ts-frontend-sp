import {
  Box,
  Flex,
  Grid,
  Image,
  Text,
  Chip,
  Badge,
  useMantineTheme,
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
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectStatusesState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { formatToLabel, valueToColor } from "@utils/general";
import { useDebouncedState } from "@mantine/hooks";
import { Prospect } from "src/main";
import { chunk } from "lodash";
import { useQuery } from "react-query";
import getChannels from "@utils/requests/getChannels";

const PAGE_SIZE = 10;

export default function CampaignProspects({
  prospects,
}: {
  prospects: Prospect[];
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [search, setSearch] = useDebouncedState("", 200);
  const [statuses, setStatuses] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "full_name",
    direction: "asc",
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  useEffect(() => {
    setPage(1);
  }, [search, statuses]);

  const { data: data_channels } = useQuery({
    queryKey: [
      `query-get-channels-campaign-prospects`,
    ],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  // Split prospects into pages => data
  const getData = (page: number) => {

    // Filter prospects by search
    let filteredProspects = prospects;
    if (search.trim() !== "") {
      filteredProspects = filteredProspects.filter((prospect) => {
        return (
          prospect.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          prospect.company?.toLowerCase().includes(search.toLowerCase()) ||
          prospect.title?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Filter prospects by statuses
    if (statuses.length > 0) {
      filteredProspects = filteredProspects.filter((prospect) => {
        return statuses.includes(prospect.status);
      });
    }

    totalRecords.current = filteredProspects.length;
    return chunk(filteredProspects, PAGE_SIZE)[page - 1];
  };

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
        height={"min(670px, 100vh - 300px)"}
        verticalAlignment="top"
        loaderColor="teal"
        highlightOnHover
        noRecordsText={"No prospects found"}
        onRowClick={(prospect, row_index) => {
          // TODO: Made make clicking on the row do something
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
        records={getData(page)}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        paginationColor="teal"
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
      />
    </Box>
  );
}
