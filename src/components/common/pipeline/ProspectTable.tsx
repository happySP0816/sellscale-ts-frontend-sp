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
  ActionIcon,
  Avatar,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconRefresh, IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";
import ProspectDetailsDrawer from "../../drawers/ProspectDetailsDrawer";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectChannelState,
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectSelectorTypeState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { formatToLabel, nameToInitials, valueToColor } from "@utils/general";
import { StatGridInfo } from "./PipelineSelector";
import { useDebouncedState, usePrevious } from "@mantine/hooks";
import { logout } from "@auth/core";
import getChannels from "@utils/requests/getChannels";
import { Channel } from "src";
import _ from "lodash";
import FlexSeparate from "@common/library/FlexSeparate";
import React, { useMemo } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_Virtualizer,
  MRT_SortingState,
} from "mantine-react-table";
import { Tooltip } from "@mantine/core";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { API_URL } from "@constants/data";

const fetchSize = 20;

/* TODO: IN PROGRESS.
  This is a work in progress to convert over to MRT. The goal is to have a table that is as performant as the current one, but with more features and less code.
  This change will need to be properly descoped and tested before it is used in production.
*/
export default function ProspectTable({
  selectorData,
}: {
  selectorData: Map<string, StatGridInfo>;
}) {
  const theme = useMantineTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
  const rowVirtualizerInstanceRef = useRef<
    MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>
  >(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const userToken = useRecoilValue(userTokenState);

  // TODO: Remove this
  const [search, setSearch] = useDebouncedState("", 200);
  const [statuses, setStatuses] = useState<string[] | null>(null);
  const [channel, setChannel] = useRecoilState(prospectChannelState);
  const [selectorType, setSelectorType] = useRecoilState(
    prospectSelectorTypeState
  );
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  // ??

  const {
    data,
    fetchNextPage,
    isError,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      `query-infinite-pipeline-prospects`,
      columnFilters,
      globalFilter,
      sorting,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`${API_URL}/prospect/get_prospects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "", //search.length > 0 ? search : undefined,
          channel: "SELLSCALE", //channel.length > 0 ? channel : "SELLSCALE",
          status: undefined, //statuses?.length > 0 ? statuses : undefined,
          limit: fetchSize,
          offset: pageParam * fetchSize,
          ordering: [],
        }),
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.prospects) {
        return [] as any;
      }

      // TODO: Fix this
      const channel = "SELLSCALE";

      return {
        data: res.prospects.map((prospect: any) => {
          return {
            id: prospect.id,
            full_name: prospect.full_name,
            company: prospect.company,
            title: prospect.title,
            industry: prospect.industry,
            status:
              channel === "SELLSCALE"
                ? prospect.overall_status
                : channel === "EMAIL"
                ? prospect.email_status
                : prospect.linkedin_status,
            channels: [
              prospect.linkedin_status &&
              prospect.linkedin_status !== "PROSPECTED"
                ? "LINKEDIN"
                : undefined,
              prospect.email_status ? "EMAIL" : undefined,
            ].filter((x) => x),
            review_details: {
              last_reviewed: prospect.last_reviewed,
              times_bumped: prospect.times_bumped,
            },
            meta: {
              totalRowCount: res.total_count,
            },
          };
        }),
        meta: {
          totalRowCount: res.total_count,
        },
      };
    },
    getNextPageParam: (_lastGroup, groups) => groups.length,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap((page: any) => page.data) ?? [],
    [data]
  );

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

        //once the user has scrolled within 400px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  //scroll to top of table when sorting or filters change
  useEffect(() => {
    if (rowVirtualizerInstanceRef.current) {
      rowVirtualizerInstanceRef.current.scrollToIndex(0);
    }
  }, [sorting, columnFilters, globalFilter]);

  //a check on mount to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const columns = useMemo<MRT_ColumnDef[]>(() => {
    let result: MRT_ColumnDef[] = [
      {
        accessorKey: "full_name",
        header: "Name",
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Avatar
              src={null}
              alt={renderedCellValue + ""}
              color={valueToColor(theme, renderedCellValue + "")}
              size={30}
              radius={30}
            >
              {nameToInitials(renderedCellValue + "")}
            </Avatar>
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: "company",
        header: "company",
      },
      {
        accessorKey: "title",
        header: "title",
      },
      {
        accessorKey: "channels",
        header: "channels",
      },
      {
        accessorKey: "status",
        header: "status",
      },
    ];
    if (selectorType === "bumped") {
      result.push({
        accessorKey: "review_details",
        header: "review_details",
        Cell: ({ cell }) => {
          const review_details = cell.getValue<{
            last_reviewed: string;
            times_bumped: number;
          }>();
          let last_reviewed = review_details.last_reviewed;
          if (!last_reviewed) {
            return null;
          }
          return (
            <>
              <Badge>{last_reviewed?.substring(0, 16)}</Badge>
            </>
          );
        },
      });
    }
    return result;
  }, [selectorType]) as MRT_ColumnDef<any>[];

  const { data: data_channels, refetch: refetch_channels } = useQuery({
    queryKey: [`query-get-channels-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

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
            className="truncate"
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Select
            data={
              // If channels are not loaded or failed to fetch, don't show anything
              !data_channels || data_channels.status !== "success"
                ? []
                : // Otherwise, show channels (other than SELLSCALE)
                  Object.keys(data_channels.data)
                    .filter((x) => x !== "SELLSCALE")
                    .map((channel) => {
                      return {
                        label: formatToLabel(channel),
                        value: channel,
                      };
                    })
            }
            mb="md"
            clearable
            label="Filter by Channel"
            placeholder="Select channel"
            value={channel}
            onChange={(value) =>
              value ? setChannel(value as Channel) : setChannel("SELLSCALE")
            }
            className="truncate"
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <MultiSelect
            data={
              // If channels are not loaded or failed to fetch, don't show anything
              !data_channels || data_channels.status !== "success"
                ? []
                : // Otherwise, show {channel} statuses
                  data_channels?.data[channel]?.statuses_available
                    .map((status: string) => {
                      return {
                        label: formatToLabel(
                          data_channels.data[channel][status].enum_val
                        ),
                        value: status,
                      };
                    })
                    .sort((a: any, b: any) => a.label.localeCompare(b.label))
            }
            mb="md"
            label={`Filter by ${formatToLabel(
              channel.replace("SELLSCALE", "Overall")
            )} Status`}
            placeholder="Select statuses"
            searchable
            nothingFound="Nothing found"
            value={statuses ? statuses : []}
            onChange={(value) => {
              setStatuses(value);
              setSelectorType("");
            }}
            className="truncate"
          />
        </Grid.Col>
      </Grid>

      <MantineReactTable
        columns={columns}
        data={flatData}
        enablePagination={false}
        enableRowNumbers
        enableRowVirtualization //optional, but recommended if it is likely going to be more than 100 rows
        manualFiltering
        manualSorting
        mantineTableContainerProps={{
          ref: tableContainerRef, //get access to the table container element
          sx: { maxHeight: "600px" }, //give the table a max height
          onScroll: (
            // @ts-ignore
            event: UIEvent<HTMLDivElement> //add an event listener to the table container element
          ) => fetchMoreOnBottomReached(event.target as HTMLDivElement),
        }}
        mantineToolbarAlertBannerProps={
          isError
            ? {
                color: "error",
                children: "Error loading data",
              }
            : undefined
        }
        onColumnFiltersChange={setColumnFilters}
        onGlobalFilterChange={setGlobalFilter}
        onSortingChange={setSorting}
        renderBottomToolbarCustomActions={() => (
          <Text>
            Fetched {totalFetched} of {totalDBRowCount} total rows.
          </Text>
        )}
        state={{
          columnFilters,
          globalFilter,
          isLoading,
          showAlertBanner: isError,
          showProgressBars: isFetching,
          showSkeletons: isFetching,
          sorting,
        }}
        rowVirtualizerInstanceRef={rowVirtualizerInstanceRef} //get access to the virtualizer instance
        rowVirtualizerProps={{ overscan: 10 }}
        mantineProgressProps={({ isTopToolbar }) => ({
          color: "teal",
          sx: {
            display: isTopToolbar ? "none" : "block", //hide top progress bar
          },
        })}
      />

    </Box>
  );
}
