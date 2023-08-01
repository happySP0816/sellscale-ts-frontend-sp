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
  Tooltip,
  Avatar,
  Button,
  Switch,
  Group,
  SegmentedControl,
  Card,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconRefresh, IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";
import ProspectDetailsDrawer from "../../drawers/ProspectDetailsDrawer";
import ICPFitPill from "./ICPFitAndReason";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectChannelState,
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectShowPurgatoryState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatToLabel, nameToInitials, proxyURL, valueToColor } from "@utils/general";
import { StatGridInfo } from "./PipelineSelector";
import { useDebouncedState, usePrevious } from "@mantine/hooks";
import { logout } from "@auth/core";
import getChannels from "@utils/requests/getChannels";
import { Channel, PersonaOverview, Prospect } from "src";
import _ from "lodash";
import FlexSeparate from "@common/library/FlexSeparate";
import { API_URL } from "@constants/data";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { currentProjectState } from '@atoms/personaAtoms';
import BulkActions from "@common/persona/BulkActions";

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
  for (const status of Object.keys(data_channels.data[channel] || {})) {
    if (!status) {
      continue;
    }
    const overallStatus =
      data_channels.data[channel][status].sellscale_enum_val;
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
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );

  const [search, setSearch] = useDebouncedState("", 200);
  const [statuses, setStatuses] = useState<string[] | null>(null);
  const [channel, setChannel] = useRecoilState(prospectChannelState);
  const [showPurgatory, setShowPurgatory] = useRecoilState(
    prospectShowPurgatoryState
  );
  const queryClient = useQueryClient();

  const [personas, setPersonas] = useState<PersonaOverview[]>([]);
  const [personaId, setPersonaId] = useState<number | null>(null);

  const [bumpedCount, setBumpedCount] = useState("all");

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "full_name",
    direction: "asc",
  });
  const [selectedRecords, setSelectedRecords] = useState<Prospect[]>([]);

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
      `query-pipeline-prospects-${props.personaSpecific ?? "all"}`,
      {
        page,
        sortStatus,
        statuses,
        search,
        channel,
        showPurgatory,
        bumpedCount,
        personaId,
      },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [
        _key,
        {
          page,
          sortStatus,
          statuses,
          search,
          channel,
          showPurgatory,
          bumpedCount,
          personaId,
        },
      ]: any = queryKey;

      totalRecords.current = 0;

      const response = await fetch(`${API_URL}/prospect/get_prospects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: search.length > 0 ? search : undefined,
          channel: channel.length > 0 ? channel : "SELLSCALE",
          status: statuses?.length > 0 ? statuses : undefined,
          persona_id: props.personaSpecific ?? personaId ?? undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          ordering: [
            {
              field: sortStatus.columnAccessor,
              direction: sortStatus.direction === "asc" ? 1 : -1,
            },
          ],
          bumped:
            statuses?.includes("BUMPED") || statuses?.includes("RESPONDED")
              ? bumpedCount
              : "all",
          show_purgatory: showPurgatory,
        }),
      });
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
          archetype: prospect.archetype_name,
          company: prospect.company,
          title: prospect.title,
          industry: prospect.industry,
          img_url: prospect.img_url,
          icp_fit_score: prospect.icp_fit_score,
          icp_fit_reason: prospect.icp_fit_reason,
          hidden_until: prospect.hidden_until,
          demo_date: prospect.demo_date,
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

  useEffect(() => {
    (async () => {
      const response = await getPersonasOverview(userToken);
      const result =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      setPersonas(result);
    })();
  }, []);

  useEffect(() => {
    console.log(selectedRecords)
  }, [selectedRecords])

  return (
    <Box>
      <Grid grow>
        <Grid.Col span={3}>
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
        <Grid.Col span={1}>
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
        <Grid.Col span={3}>
          <MultiSelect
            data={
              // If channels are not loaded or failed to fetch, don't show anything
              !data_channels || data_channels.status !== "success"
                ? []
                : // Otherwise, show {channel} statuses
                (data_channels.data[channel]
                  ? data_channels.data[channel].statuses_available
                  : []
                )
                  .map((status: string) => {
                    let label = formatToLabel(
                      data_channels.data[channel][status]?.enum_val
                    );
                    // Patch for Active Convo to show Unassigned
                    if (label === "Active Convo" && channel === "LINKEDIN") {
                      label = "Active Convo Unassigned";
                    }

                    return {
                      label: label,
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
        <Grid.Col span={2}>
          <Select
            data={personas.map((persona) => {
              return {
                label: persona.name,
                value: persona.id + "",
              };
            })}
            mb="md"
            clearable
            label="Filter by Persona"
            placeholder="Select persona"
            defaultValue={currentProject?.id + ""}
            onChange={(value) =>
              value ? setPersonaId(+value) : setPersonaId(null)
            }
            className="truncate"
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Switch.Group
            label={
              showPurgatory
                ? "Show prospects that need contacting"
                : "Recently Contacted Prospects"
            }
            onChange={(value) => {
              setShowPurgatory(!showPurgatory);
            }}
          >
            <Group>
              <Switch value="purgatory" />
            </Group>
          </Switch.Group>
        </Grid.Col>
      </Grid>

      {
        selectedRecords.length > 0 && (
          <BulkActions selectedProspects={selectedRecords} backFunc={() => {
            setSelectedRecords([])
            refetch()
          }}/>
        )
      }

      {(statuses?.includes("BUMPED") || statuses?.includes("RESPONDED")) && (
        <SegmentedControl
          value={bumpedCount}
          onChange={setBumpedCount}
          radius={12}
          color="orange"
          size="xs"
          pb={10}
          data={[
            { label: "All", value: "all" },
            { label: "Bumped #1", value: "1" },
            { label: "Bumped #2", value: "2" },
            { label: "Bumped #3+", value: "3" },
          ]}
        />
      )}

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
                    src={proxyURL(x.img_url)}
                    alt={x.full_name}
                    color={valueToColor(theme, x.full_name)}
                    radius="lg"
                    size={30}
                  >
                    {nameToInitials(x.full_name)}
                  </Avatar>
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
              <Text>
                {`${formatToLabel(
                  channel.replace("SELLSCALE", "Overall")
                )} Status`}
              </Text>
            ),
            render: ({ status, review_details }) => {
              return (
                <>
                  <Badge color={valueToColor(theme, formatToLabel(status))}>
                    {status === "BUMPED" || status === "RESPONDED" ? (
                      <>
                        {formatToLabel(status)} #
                        {review_details.times_bumped &&
                          review_details.times_bumped >= 1
                          ? review_details.times_bumped
                          : "?"}
                      </>
                    ) : (
                      <>
                        {formatToLabel(
                          status.includes("ACTIVE_CONVO")
                            ? "ACTIVE_CONVO"
                            : status
                        )}
                      </>
                    )}
                  </Badge>
                  {status.includes("ACTIVE_CONVO_") && (
                    <Badge>
                      {(status.includes("ACTIVE_CONVO_")
                        ? status.replace("ACTIVE_CONVO_", "")
                        : ""
                      ).replaceAll("_", " ")}
                    </Badge>
                  )}
                </>
              );
            },
          },
          {
            accessor: "icp_fit_score",
            title: <Text>ICP Fit</Text>,
            sortable: true,
            render: ({ icp_fit_score, icp_fit_reason, archetype }) => {
              return (
                <>
                  <ICPFitPill
                    icp_fit_score={icp_fit_score}
                    icp_fit_reason={icp_fit_reason}
                    archetype={archetype}
                  />
                </>
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
              if (!last_reviewed) {
                return null;
              }
              return (
                <>
                  <Badge>{last_reviewed?.substring(0, 16)}</Badge>
                </>
              );
            },
          },
          {
            accessor: "archetype",
            title: (
              <FlexSeparate>
                <Text>Persona</Text>
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
            render: ({ archetype }) => {
              return (
                <>
                  <Badge color={valueToColor(theme, archetype)}>
                    {_.truncate(archetype, {
                      length: 24,
                      separator: "",
                    })}
                  </Badge>
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
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        isRecordSelectable={(record) => selectedRecords.length < 100 || selectedRecords.includes(record)}
      />

      {opened && <ProspectDetailsDrawer />}
    </Box>
  );
}
