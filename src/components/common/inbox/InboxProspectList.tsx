import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Checkbox,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Indicator,
  Input,
  Loader,
  LoadingOverlay,
  Modal,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconSearch,
  IconAdjustmentsFilled,
  IconCircle4Filled,
  IconCircle1Filled,
  IconCircle2Filled,
  IconCircle3Filled,
  IconStarFilled,
  IconInfoCircle,
  IconClock,
} from "@tabler/icons-react";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import {
  fetchingProspectIdState,
  nurturingModeState,
  openedProspectIdState,
  openedProspectLoadingState,
  tempHiddenProspectsState,
} from "@atoms/inboxAtoms";
import { Prospect, ProspectShallow } from "src";
import { forwardRef, useEffect, useState } from "react";
import { HEADER_HEIGHT } from "./InboxProspectConvo";
import {
  labelizeConvoSubstatus,
  prospectStatuses,
  nurturingProspectStatuses,
  getStatusDetails,
} from "./utils";
import InboxProspectListFilter, {
  InboxProspectListFilterState,
  defaultInboxProspectListFilterState,
} from "./InboxProspectListFilter";
import {
  convertDateToCasualTime,
  convertDateToLocalTime,
  convertDateToShortFormat,
  isWithinLastXDays,
  proxyURL,
  removeExtraCharacters,
  removeHTML,
} from "@utils/general";
import loaderWithText from "@common/library/loaderWithText";
import { icpFitToIcon } from "@common/pipeline/ICPFitAndReason";
import { NAV_HEADER_HEIGHT } from "@nav/old/MainHeader";
import { INBOX_PAGE_HEIGHT } from "@pages/InboxPage";
import {
  currentInboxCountState,
  currentProjectState,
} from "@atoms/personaAtoms";

interface StatusSelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
  count: number;
  label: string;
}
const StatusSelectItem = forwardRef<HTMLDivElement, StatusSelectItemProps>(
  ({ count, label, ...others }: StatusSelectItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group spacing={0} position="apart" noWrap>
        <Text size="xs" sx={{ whiteSpace: "nowrap" }}>
          {label}
        </Text>
        {count >= 0 && (
          <Text size="xs" fw={600}>
            {count}
          </Text>
        )}
      </Group>
    </div>
  )
);

export function ProspectConvoCard(props: {
  id: number;
  name: string;
  title: string;
  img_url: string;
  latest_msg: string;
  latest_msg_time: string;
  latest_msg_from_sdr: boolean;
  new_msg_count: number;
  icp_fit: number;
  opened: boolean;
}) {
  const fetchingProspectId = useRecoilValue(fetchingProspectIdState);

  return (
    <>
      <Flex
        p={10}
        wrap="nowrap"
        sx={{
          overflow: "hidden",
          cursor: "pointer",
          backgroundColor: props.opened ? "white" : "initial",
        }}
      >
        <div style={{ flex: 0 }}>
          <Indicator
            position="top-start"
            offset={5}
            inline
            label={icpFitToIcon(props.icp_fit)}
            size={0}
            m={5}
          >
            <Avatar size="md" radius="xl" src={proxyURL(props.img_url)} />
          </Indicator>
        </div>
        <div style={{ flexGrow: 1 }}>
          <Stack spacing={0}>
            <Group position="apart" sx={{ flexWrap: "nowrap" }}>
              <Title size={13} fw={500}>
                {props.name}
              </Title>
              <Text c="dimmed" size={10}>
                {props.latest_msg_time}
              </Text>
            </Group>
            <Group position="apart" sx={{ flexWrap: "nowrap" }}>
              <Text
                size={12}
                truncate
                fw={!props.opened && !props.latest_msg_from_sdr ? 600 : 300}
              >
                {_.truncate(props.latest_msg, { length: 30 })}
              </Text>
              {fetchingProspectId === props.id && (
                <Tooltip label="Sending message..." position="top">
                  <Loader size="xs" variant="dots" />
                </Tooltip>
              )}
              {/* {!props.opened && !props.latest_msg_from_sdr && props.new_msg_count > 0 && <Badge variant='filled'>{props.new_msg_count}</Badge>} */}
            </Group>
            <Text size={10} c="dimmed" fs="italic">
              {props.title}
            </Text>
          </Stack>
        </div>
      </Flex>
      <Divider />
    </>
  );
}

export default function ProspectList(props: {
  prospects: ProspectShallow[];
  isFetching: boolean;
  all?: boolean;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );
  const [showPurgatorySection, setShowPurgatorySection] = useState(true);
  const currentProject = useRecoilValue(currentProjectState);
  const [currentInboxCount, setCurrentInboxCount] = useRecoilState(
    currentInboxCountState
  );
  const [openedProspectLoading, setOpenedProspectLoading] = useRecoilState(
    openedProspectLoadingState
  );
  const tempHiddenProspects = useRecoilValue(tempHiddenProspectsState);

  const nurturingMode = useRecoilValue(nurturingModeState);

  const filterSelectOptions = (
    nurturingMode ? nurturingProspectStatuses : prospectStatuses
  ).map((status) => ({
    ...status,
    count: -1,
  }));
  filterSelectOptions.unshift({ label: "All Convos", value: "ALL", count: -1 });

  const [segmentedSection, setSegmentedSection] = useState("RECOMMENDED");
  const [filterSelectValue, setFilterSelectValue] = useState(
    filterSelectOptions[0].value
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filtersState, setFiltersState] =
    useState<InboxProspectListFilterState>({
      recentlyContacted: "ALL",
      respondedLast: "ALL",
      channel: "SELLSCALE",
    });

  // Sort out uninitiated prospects and temp fill in unknown data
  let prospects =
    props.prospects
      ?.filter((p) => {
        // Only show prospects that are of a status we can filter/sort by
        return filterSelectOptions.find(
          (option) => option.value === p.linkedin_status
        );
      })
      .map((p) => {
        const li_soonest =
          new Date(p.li_last_message_timestamp).getTime() >
          new Date(p.email_last_message_timestamp || -1).getTime();
        const is_last_message_from_sdr = li_soonest
          ? p.li_is_last_message_from_sdr
          : p.email_is_last_message_from_sdr;
        const last_message_from_sdr = li_soonest
          ? p.li_last_message_from_sdr
          : removeHTML(p.email_last_message_from_sdr);
        const last_message_from_prospect = li_soonest
          ? p.li_last_message_from_prospect
          : removeHTML(p.email_last_message_from_prospect);
        const last_message_timestamp = li_soonest
          ? p.li_last_message_timestamp
          : p.email_last_message_timestamp;
        const unread_messages = li_soonest
          ? p.li_unread_messages
          : p.email_unread_messages;

        // Hack to temp hide prospect when we send a message
        let is_purgatory = p.hidden_until
          ? new Date(p.hidden_until).getTime() > new Date().getTime()
          : false;
        if (tempHiddenProspects.includes(p.id)) {
          is_purgatory = true;
        }

        return {
          id: p.id,
          name: _.truncate(p.full_name, {
            length: 48,
            separator: " ",
          }),
          img_url: p.img_url,
          icp_fit: p.icp_fit_score,
          latest_msg:
            is_last_message_from_sdr || nurturingMode
              ? `You: ${last_message_from_sdr || "..."}`
              : `${p.first_name}: ${
                  last_message_from_prospect || "No message found"
                }`,
          latest_msg_time: convertDateToCasualTime(
            new Date(last_message_timestamp || -1)
          ),
          latest_msg_datetime: new Date(last_message_timestamp || -1),
          latest_msg_from_sdr: is_last_message_from_sdr || nurturingMode,
          title: _.truncate(p.title, {
            length: 48,
            separator: " ",
          }),
          new_msg_count: unread_messages,
          persona_id: p.archetype_id,
          linkedin_status: p.linkedin_status,
          overall_status: p.overall_status,
          email_status: p.email_status,
          in_purgatory: is_purgatory,
          purgatory_until: p.hidden_until,
        };
      })
      .sort(
        (a, b) =>
          _.findIndex(
            filterSelectOptions,
            (o) => o.value === a.linkedin_status
          ) -
            _.findIndex(
              filterSelectOptions,
              (o) => o.value === b.linkedin_status
            ) ||
          (!b.latest_msg_from_sdr && b.new_msg_count ? 1 : 0) -
            (!a.latest_msg_from_sdr && a.new_msg_count ? 1 : 0) ||
          b.icp_fit - a.icp_fit ||
          removeExtraCharacters(a.name).localeCompare(
            removeExtraCharacters(b.name)
          )
      ) ?? [];

  // Filter by search
  if (searchFilter.trim()) {
    prospects = prospects.filter((p) => {
      return (
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.title.toLowerCase().includes(searchFilter.toLowerCase())
      );
    });
  }
  // Filter by status
  if (filterSelectValue !== "ALL") {
    prospects = prospects.filter((p) => {
      return p.linkedin_status === filterSelectValue;
    });
  }
  // Advanced filters
  if (filtersState) {
    if (filtersState.recentlyContacted === "HIDE") {
      prospects = prospects.filter((p) => !p.in_purgatory);
    } else if (filtersState.recentlyContacted === "SHOW") {
      prospects = prospects.filter((p) => p.in_purgatory);
    }

    if (filtersState.channel === "LINKEDIN") {
      prospects = prospects.filter((p) => p.linkedin_status);
    } else if (filtersState.channel === "EMAIL") {
      prospects = prospects.filter((p) => p.email_status);
    }

    if (currentProject?.id) {
      prospects = prospects.filter(
        (p) => p.persona_id + "" === currentProject?.id + ""
      );
    }

    if (filtersState.respondedLast === "THEM") {
      prospects = prospects.filter((p) => !p.latest_msg_from_sdr);
    } else if (filtersState.respondedLast === "YOU") {
      prospects = prospects.filter((p) => p.latest_msg_from_sdr);
    }
  }

  // Recommended Filter
  if (segmentedSection === "RECOMMENDED") {
    if (!nurturingMode) {
      //prospects = prospects.filter((p) => p.overall_status === 'ACTIVE_CONVO');
    }
    // prospects = prospects.filter((p) => !p.latest_msg_from_sdr || isWithinLastXDays(p.latest_msg_datetime, 3)); // todo(Aakash) - uncomment this to show only prospects that have been responded to in the last 3 days
    // prospects = prospects.filter((p) => !p.in_purgatory);
  }

  // sort by if in purgatory
  prospects = prospects.sort(
    (a, b) => (a.in_purgatory ? 1 : 0) - (b.in_purgatory ? 1 : 0)
  );

  useEffect(() => {
    if (prospects.length > 0 && openedProspectId === -1) {
      setOpenedProspectId(prospects[0].id);
    }
  }, [props.prospects]);

  useEffect(() => {
    if (segmentedSection === "RECOMMENDED") {
      setFilterSelectValue("ALL");
    }
  }, [segmentedSection]);

  setCurrentInboxCount(prospects.filter((p) => !p.in_purgatory).length);

  return (
    <div>
      <LoadingOverlay
        loader={loaderWithText("")}
        visible={props.isFetching && props.prospects.length === 0}
      />
      <Stack
        spacing={0}
        h={"100%"}
        sx={(theme) => ({
          backgroundColor: theme.colors.gray[1],
          position: "relative",
        })}
      >
        <Container pt={20} pb={10} px={20} m={0}>
          <Input
            styles={{
              input: {
                borderColor: searchFilter.trim()
                  ? theme.colors.blue[theme.fn.primaryShade()]
                  : undefined,
              },
            }}
            icon={<IconSearch size="1.0rem" />}
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.currentTarget.value)}
            radius={theme.radius.lg}
            placeholder="Search..."
          />
        </Container>
        <Group
          spacing={0}
          pt={0}
          pb={5}
          px={20}
          m={0}
          position="apart"
          sx={{ flexWrap: "nowrap" }}
        >
          <SegmentedControl
            size="xs"
            value={segmentedSection}
            onChange={setSegmentedSection}
            styles={{
              label: {
                padding: "0.1875rem 0.1rem",
              },
            }}
            data={[
              // { label: (
              //   <Text mx={10} my={5}>Recommended</Text>
              // ), value: 'RECOMMENDED' },
              {
                label: (
                  <Select
                    data={filterSelectOptions.map((o) => {
                      let count = o.count;
                      if (o.value !== "ALL") {
                        count = props.prospects.filter(
                          (p) => p.linkedin_status === o.value
                        ).length;
                      }
                      return {
                        ...o,
                        count,
                      };
                    })}
                    withinPortal
                    variant="unstyled"
                    size="xs"
                    itemComponent={StatusSelectItem}
                    value={filterSelectValue}
                    onClick={(e) => setSegmentedSection("SELECT")}
                    onChange={(value) => {
                      if (value) {
                        setFilterSelectValue(value);
                      }
                    }}
                    styles={(theme) => ({
                      input: {
                        color:
                          filterSelectValue !== filterSelectOptions[0].value
                            ? theme.colors.blue[7]
                            : theme.colors.gray[7],
                        fontSize: 11,
                        fontWeight: 600,
                        maxWidth: 130,
                        paddingLeft: 10,
                      },
                      wrapper: {
                        width: 130,
                      },
                    })}
                  />
                ),
                value: "SELECT",
              },
            ]}
          />

          <ActionIcon
            variant="transparent"
            color={
              _.isEqual(filtersState, defaultInboxProspectListFilterState) ||
              !filtersState
                ? "gray.6"
                : "blue.6"
            }
            onClick={() => setFilterModalOpen(true)}
          >
            <IconAdjustmentsFilled size="1.125rem" />
          </ActionIcon>
        </Group>
        <Divider />
        <ScrollArea
          h={`calc(${INBOX_PAGE_HEIGHT} - ${HEADER_HEIGHT}px)`}
          sx={{ overflowX: "hidden" }}
        >
          {[false, true].map((in_purgatory_section, i) => {
            return (
              <div key={i}>
                {in_purgatory_section && (
                  <Container pt="24px" pb="24px">
                    <Divider
                      ta="center"
                      fz={7}
                      fw={500}
                      color="gray"
                      labelPosition="center"
                      label={
                        prospects.filter((p) => p.in_purgatory).length +
                        " Prospect" +
                        (prospects.filter((p) => p.in_purgatory).length > 1
                          ? "s"
                          : "") +
                        " Snoozed"
                      }
                    />
                    <Text
                      color="blue"
                      align="center"
                      fw={600}
                      fz={12}
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowPurgatorySection(!showPurgatorySection)
                      }
                    >
                      {showPurgatorySection ? "View" : "Hide"} Prospect
                      {prospects.filter((p) => p.in_purgatory).length > 1
                        ? "s"
                        : ""}
                    </Text>
                  </Container>
                )}
                {((in_purgatory_section && !showPurgatorySection) ||
                  !in_purgatory_section) &&
                  prospects
                    .filter(
                      (prospect) =>
                        prospect.in_purgatory == in_purgatory_section
                    )
                    .map((prospect, i: number) => (
                      <div key={i}>
                        {filterSelectValue === "ALL" &&
                          (!prospects[i - 1] ||
                            prospect.linkedin_status !==
                              prospects[i - 1].linkedin_status) && (
                            <div
                              style={{
                                backgroundColor:
                                  prospect.linkedin_status ===
                                  "ACTIVE_CONVO_REVIVAL"
                                    ? "#2c8c91"
                                    : prospect.in_purgatory
                                    ? "#858585"
                                    : "#25262b",
                                padding: "4px",
                                position: "relative",
                              }}
                            >
                              <Text color="white" ta="center" fz={11} fw={700}>
                                {labelizeConvoSubstatus(
                                  prospect.linkedin_status
                                )}
                              </Text>
                              <Text color="white" ta="center" fz={9} fw={300}>
                                {
                                  prospects.filter(
                                    (p) =>
                                      p.linkedin_status ===
                                      prospect.linkedin_status
                                  ).length
                                }{" "}
                                prospect(s)
                              </Text>
                              <Box
                                sx={{ position: "absolute", right: 5, top: 2 }}
                              >
                                <Tooltip
                                  label={
                                    <Text ta="center">
                                      {
                                        getStatusDetails(
                                          prospect.linkedin_status
                                        )?.description
                                      }
                                    </Text>
                                  }
                                  position="bottom"
                                  withArrow
                                  withinPortal
                                  multiline
                                  width={260}
                                >
                                  <IconInfoCircle color="#fff" size="0.9rem" />
                                </Tooltip>
                              </Box>
                            </div>
                          )}
                        <Box sx={{ position: "relative" }}>
                          <Container
                            p={0}
                            m={0}
                            onClick={() => {
                              if (!openedProspectLoading) {
                                setOpenedProspectLoading(true);
                                setOpenedProspectId(prospect.id);
                              }
                            }}
                            opacity={prospect.in_purgatory ? 0.5 : 1}
                          >
                            <ProspectConvoCard
                              id={prospect.id}
                              name={prospect.name}
                              title={prospect.title}
                              img_url={prospect.img_url}
                              latest_msg={prospect.latest_msg}
                              latest_msg_time={prospect.latest_msg_time}
                              icp_fit={prospect.icp_fit}
                              new_msg_count={prospect.new_msg_count || 0}
                              latest_msg_from_sdr={prospect.latest_msg_from_sdr}
                              opened={prospect.id === openedProspectId}
                            />
                          </Container>
                          {prospect.in_purgatory && (
                            <Tooltip
                              label={`Snoozed until ${convertDateToLocalTime(new Date(prospect.purgatory_until))}`}
                              withArrow
                              withinPortal
                            >
                              <ActionIcon
                                variant="subtle"
                                radius='xl'
                                sx={{ position: 'absolute', right: 10, top: 30 }}
                              >
                                <IconClock size="1.125rem" />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Box>
                      </div>
                    ))}
              </div>
            );
          })}
          {prospects.length === 0 && (
            <Text mt={20} fz="sm" ta="center" c="dimmed" fs="italic">
              No active conversations found.
            </Text>
          )}

          <Box h="50px"></Box>
        </ScrollArea>
        <Text
          sx={{
            position: "absolute",
            top: HEADER_HEIGHT,
            right: 5,
            zIndex: 100,
          }}
          fs="italic"
          fz={8}
          c="dimmed"
        >
          {prospects.length} convos
        </Text>
      </Stack>

      <InboxProspectListFilter
        open={filterModalOpen}
        setOpen={setFilterModalOpen}
        filters={filtersState}
        setFilters={setFiltersState}
        all={props.all}
      />
    </div>
  );
}
