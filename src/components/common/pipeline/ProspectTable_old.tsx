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
import { useEffect, useRef, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { formatToLabel, nameToInitials, valueToColor } from "@utils/general";
import { StatGridInfo } from "./PipelineSelector";
import { useDebouncedState, usePrevious } from "@mantine/hooks";
import { logout } from "@auth/core";
import getChannels from "@utils/requests/getChannels";
import { Channel } from "src/main";
import _ from "lodash";
import FlexSeparate from "@common/library/FlexSeparate";

/**
 * Gets the default statuses for a given selector type (based on channel)
 * @param selectorType
 * @param data_channels
 * @param channel
 * @returns - An array of default statuses
 */
function getDefaultStatuses(
  selectorType: string,
  data_channels: any,
  channel: Channel
) {
  const overallStatusFromSelectorType = (() => {
    if (selectorType === "accepted") {
      return "ACCEPTED";
    } else if (selectorType === "bumped") {
      return "BUMPED";
    } else if (selectorType === "active") {
      return "ACTIVE_CONVO";
    } else if (selectorType === "demo") {
      return "DEMO";
    }
    return "";
  })();

  const defaultStatuses = [];
  for (const status of Object.keys(data_channels.extra[channel])) {
    if (!status) {
      continue;
    }
    const overallStatus =
      data_channels.extra[channel][status].sellscale_enum_val;
    if (overallStatus === overallStatusFromSelectorType) {
      defaultStatuses.push(status);
    }
  }

  return defaultStatuses;
}

/**
 * Get a selector type from an array of statuses
 * @param statuses
 * @param data_channels
 * @param channel
 * @returns - A selector type
 */
function getSelectorTypeFromStatuses(
  statuses: string[] | null,
  data_channels: any,
  channel: Channel
) {
  if (!statuses) {
    return "all";
  }

  const acceptedDefaults = getDefaultStatuses(
    "accepted",
    data_channels,
    channel
  ).sort();
  const bumpedDefaults = getDefaultStatuses(
    "bumped",
    data_channels,
    channel
  ).sort();
  const activeDefaults = getDefaultStatuses(
    "active",
    data_channels,
    channel
  ).sort();
  const demoDefaults = getDefaultStatuses(
    "demo",
    data_channels,
    channel
  ).sort();
  const allDefaults = getDefaultStatuses("all", data_channels, channel).sort();

  const uniqueStatuses = Array.from(new Set(statuses)).sort();

  if (_.isEqual(acceptedDefaults, uniqueStatuses)) {
    return "accepted";
  }
  if (_.isEqual(bumpedDefaults, uniqueStatuses)) {
    return "bumped";
  }
  if (_.isEqual(activeDefaults, uniqueStatuses)) {
    return "active";
  }
  if (_.isEqual(demoDefaults, uniqueStatuses)) {
    return "demo";
  }
  if (_.isEqual(allDefaults, uniqueStatuses)) {
    return "all";
  }
  return "";
}

const PAGE_SIZE = 20;

export default function ProspectTable_old(props: { personaSpecific?: number }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  const [selectorType, setSelectorType] = useRecoilState(
    prospectSelectorTypeState
  );
  const userToken = useRecoilValue(userTokenState);
  const totalRecords = useRef(0);

  const [search, setSearch] = useDebouncedState("", 200);
  const [statuses, setStatuses] = useState<string[] | null>(null);
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
    setSelectorType(
      getSelectorTypeFromStatuses(statuses, data_channels, channel)
    );
  }, [statuses]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-pipeline-prospects-${props.personaSpecific ?? "all"}}`,
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
            channel: channel.length > 0 ? channel : "SELLSCALE",
            status: statuses?.length > 0 ? statuses : undefined,
            persona_id: props.personaSpecific,
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            ordering: [
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
          img_url: prospect.img_url,
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
          scheduling:
            prospect.linkedin_status === "SCHEDULING" ||
            prospect.email_status === "SCHEDULING",
        };
      });
    },
    refetchOnWindowFocus: false,
  });

  const { data: data_channels, refetch: refetch_channels } = useQuery({
    queryKey: [`query-get-channels-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data_channels && selectorType) {
      setStatuses(getDefaultStatuses(selectorType, data_channels, channel));
    }
  }, [selectorType, channel]);

  return (
    <Box>
      <Grid grow>
        <Grid.Col span={5}>
          <TextInput
            label="Search Contacts"
            placeholder="Search by Name, Company, or Title"
            mb="md"
            name="search contacts"
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
                  Object.keys(data_channels.extra)
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
                  data_channels.extra[channel].statuses_available
                    .map((status: string) => {
                      return {
                        label: formatToLabel(
                          data_channels.extra[channel][status].enum_val
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

      <DataTable
        withBorder
        height={"min(670px, 100vh - 200px)"}
        verticalAlignment="top"
        loaderColor="teal"
        highlightOnHover
        noRecordsText={"No prospects yet! Check back soon..."}
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
                  <Avatar
                    src={x.img_url}
                    alt={x.full_name}
                    color={valueToColor(theme, x.full_name)}
                    radius="lg"
                    size={30}
                  >{nameToInitials(x.full_name)}</Avatar>
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
            accessor: "channels",
            render: ({ channels }) => {
              return channels.map((c: string, index: number) => (
                <Badge
                  key={index}
                  color={valueToColor(theme, formatToLabel(c))}
                >
                  {formatToLabel(c)}
                </Badge>
              ));
            },
          },
          {
            accessor: "status",
            title: (
              <FlexSeparate>
                <Text>
                  {`${formatToLabel(
                    channel.replace("SELLSCALE", "Overall")
                  )} Status`}
                </Text>
                <ActionIcon
                  size="sm"
                  onClick={() => {
                    refetch();
                    refetch_channels();
                  }}
                >
                  <IconRefresh size="0.875rem" />
                </ActionIcon>
              </FlexSeparate>
            ),
            render: ({ status }) => {
              return (
                <Badge color={valueToColor(theme, formatToLabel(status))}>
                  {formatToLabel(status)}
                </Badge>
              );
            },
          },
          {
            accessor: "review_details",
            title: "Last Reviewed",
            sortable: false,
            hidden: selectorType !== "bumped",
            render: ({ review_details }) => {
              let last_reviewed = review_details.last_reviewed;
              let times_bumped = review_details.times_bumped;
              if (!last_reviewed) {
                return null;
              }
              return (
                <>
                  <Badge>{last_reviewed?.substring(0, 16)}</Badge>
                  {times_bumped > 0 && (
                    <Badge color="red">{`Bumped ${times_bumped} time${
                      times_bumped > 1 ? "s" : ""
                    }`}</Badge>
                  )}
                </>
              );
            },
          },
          {
            accessor: "review_details",
            title: "Scheduling",
            sortable: false,
            hidden: selectorType !== "active",
            render: ({ scheduling }) => {
              if (!scheduling) {
                return null;
              }
              return (
                <>
                  <Badge>Scheduling</Badge>
                </>
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

      {opened && <ProspectDetailsDrawer />}
    </Box>
  );
}
