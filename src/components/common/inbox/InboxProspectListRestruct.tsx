import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Flex,
  Group,
  Indicator,
  Input,
  Loader,
  LoadingOverlay,
  Menu,
  Popover,
  ScrollArea,
  Select,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconSearch, IconAdjustmentsFilled, IconInfoCircle, IconClock, IconStar, IconBellOff, IconSparkles, IconRobotFace } from "@tabler/icons-react";
import _ from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import { forwardRef, useEffect, useState } from "react";
import { HEADER_HEIGHT } from "./InboxProspectConvo";
import { labelizeConvoSubstatus, prospectStatuses, nurturingProspectStatuses, getStatusDetails, labelizeStatus } from "./utils";
import InboxProspectListFilter, { InboxProspectListFilterState, defaultInboxProspectListFilterState } from "./InboxProspectListFilter";
import { IconAlarm, IconAlertCircle, IconBolt, IconChevronUp, IconEdit, IconGridDots, IconMoodSmile, IconUser } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import { INBOX_PAGE_HEIGHT, ProspectBucketRecord, ProspectBuckets } from "../../pages/InboxRestructurePage";
import { mainTabState, openedProspectIdState, openedProspectListState } from "@atoms/inboxAtoms";
import { useDisclosure } from "@mantine/hooks";
import { NAV_BAR_SIDE_WIDTH } from "@constants/data";
import { ProspectConvoCard } from "./InboxProspectList";
import { currentInboxCountState } from "@atoms/personaAtoms";
import { openContextModal } from "@mantine/modals";
import { adminDataState, userDataState, userTokenState } from "@atoms/userAtoms";
import { impersonateSDR } from "@auth/core";
import { ClientSDR } from "src";

export function InboxProspectListRestruct(props: { buckets: ProspectBuckets }) {
  const theme = useMantineTheme();
  const [openedList, setOpenedList] = useRecoilState(openedProspectListState);
  const adminData = useRecoilValue(adminDataState);
  const [userToken, setUserToken] = useRecoilState(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);

  const [searchFilter, setSearchFilter] = useState("");
  const [mainTab, setMainTab] = useRecoilState(mainTabState);
  const [selectedUser, setSelectedUser] = useState("all");

  const inboxTab = (() => {
    if (mainTab === "manual_bucket") return "manual";
    if (mainTab === "ai_bucket") return "ai";
    return "other";
  })();
  const setInboxTab = (tab: string) => {
    if (tab === "manual") setMainTab("manual_bucket");
    if (tab === "ai") setMainTab("ai_bucket");
    // Else don't set
  };

  // @ts-ignore
  const bucket = props.buckets[mainTab] as ProspectBucketRecord[];

  const prospects = bucket
    .filter((p) => !["REMOVED", "NULL"].includes((p.overall_status ?? "NULL").toUpperCase()))
    .filter(
      (p) =>
        p.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.company?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .filter((p) => selectedUser === "all" || p.client_sdr_name === selectedUser);

  const unfilteredProspects = bucket
    .filter((p) => !["REMOVED", "NULL"].includes((p.overall_status ?? "NULL").toUpperCase()))
    .filter(
      (p) =>
        p.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.company?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(searchFilter.toLowerCase())
    );
  const unfilteredProspectsGrouped = Object.entries(
    _.groupBy(
      unfilteredProspects.map((p) => ({
        ...p,
        status: p.status_email ?? p.status_linkedin,
      })),
      (p) => p.status
    )
  )
    .sort((a, b) => {
      if (a[0].toLowerCase().includes("scheduling")) return -1;
      if (b[0].toLowerCase().includes("scheduling")) return 1;
      return b[0].localeCompare(a[0]);
    })
    .filter((group) => {
      // if (group[0].toLowerCase().includes('sent_outreach')) return false;
      // if (group[0].toLowerCase().includes('email_opened')) return false;
      return true;
    });

  const prospectGroups = Object.entries(
    _.groupBy(
      prospects.map((p) => ({
        ...p,
        status: p.status_email ?? p.status_linkedin,
      })),
      (p) => p.status
    )
  )
    .sort((a, b) => {
      if (a[0].toLowerCase().includes("scheduling")) return -1;
      if (b[0].toLowerCase().includes("scheduling")) return 1;
      return b[0].localeCompare(a[0]);
    })
    .filter((group) => {
      // if (group[0].toLowerCase().includes('sent_outreach')) return false;
      // if (group[0].toLowerCase().includes('email_opened')) return false;
      return true;
    });

  return (
    <>
      <Drawer
        opened={openedList}
        onClose={() => setOpenedList(false)}
        title={
          <Flex direction="row" align="center" gap="md">
            <Title order={4}>Conversations</Title>
            {adminData?.role === "ADMIN" && (
              <Select
                placeholder="Select Name"
                data={[
                  { value: "all", label: "All", image: null },
                  ...Array.from(
                    new Map(
                      unfilteredProspectsGrouped
                        .flatMap((group) => group[1])
                        .map((prospect) => [
                          prospect.client_sdr_name,
                          {
                            value: prospect.client_sdr_name,
                            label: prospect.client_sdr_name,
                            image: prospect.client_sdr_img_url,
                          },
                        ])
                    ).values()
                  ),
                ]}
                itemComponent={({ value, label, image, ...others }) => (
                  <div {...others} style={{ display: "flex", alignItems: "center" }}>
                    {image && <Avatar src={image} size="sm" mr="sm" />}
                    {label}
                  </div>
                )}
                value={selectedUser}
                onChange={(value) => {
                  if (value !== null) {
                    if (value !== "all") {
                      const getFromLocalStorage = (): ClientSDR[] => {
                        const data = localStorage.getItem("admin-sdrs-view");
                        return data ? JSON.parse(data) : [];
                      };
                      const sdrs: ClientSDR[] = getFromLocalStorage();
                      const sdr = sdrs?.find((sdr) => sdr?.sdr_name === value);
                      if (sdr) {
                        impersonateSDR(adminData, sdr, setUserToken, setUserData, false);
                      } else {
                        console.error("SDR not found");
                      }
                    }
                    // console.log('selected user is', value);
                    setSelectedUser(value);
                  }
                }}
              />
            )}
          </Flex>
        }
        style={{
          marginLeft: NAV_BAR_SIDE_WIDTH,
        }}
        styles={{
          body: {
            padding: 0,
          },
          header: {
            backgroundColor: theme.colors.gray[1],
            paddingBottom: 0,
          },
        }}
        size="sm"
      >
        <ScrollArea h={"92vh"}>
          <Stack
            spacing={0}
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[1],
              position: "relative",
            })}
          >
            {/* Section tabs */}
            <Tabs
              value={inboxTab}
              onTabChange={(value) => {
                setInboxTab(value as string);
              }}
              styles={(theme) => ({
                tab: {
                  ...theme.fn.focusStyles(),
                  fontWeight: 600,
                  color: theme.colors.gray[5],
                  "&[data-active]": {
                    color: theme.colors.blue[theme.fn.primaryShade()],
                  },
                  paddingTop: rem(6),
                  paddingBottom: rem(6),
                },
              })}
            >
              <Tabs.List grow>
                <Tabs.Tab value="manual">
                  <Indicator size={6} disabled={props.buckets.manual_bucket.length === 0}>
                    <Tooltip label="Messages you're responsible for." withinPortal position="right">
                      <Group spacing={5} noWrap>
                        <IconMoodSmile size="1rem" />
                        {mainTab === "manual_bucket" && <Text>Human Inbox</Text>}
                      </Group>
                    </Tooltip>
                  </Indicator>
                </Tabs.Tab>
                <Tabs.Tab value="ai">
                  <Indicator size={6} disabled={props.buckets.ai_bucket.length === 0}>
                    <Group spacing={5} noWrap>
                      <IconRobotFace size="1rem" />
                      {mainTab === "ai_bucket" && <Text>AI Inbox</Text>}
                    </Group>
                  </Indicator>
                </Tabs.Tab>
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Tabs.Tab value="other">
                      <Group spacing={5} noWrap>
                        <IconGridDots size="1rem" />
                        {inboxTab === "other" && <Text>{_.startCase(mainTab.split("_bucket")[0])}</Text>}
                      </Group>
                    </Tabs.Tab>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>
                      <Group spacing={5} noWrap>
                        <IconGridDots size="1rem" />
                        <Text fz={14} fw={600}>
                          Other Views
                        </Text>
                      </Group>
                    </Menu.Label>
                    <Menu.Divider />
                    <Menu.Item
                      onClick={() => {
                        setMainTab("snoozed_bucket");
                      }}
                    >
                      <Group spacing={5} noWrap position="apart">
                        <Text>Snoozed</Text>
                        <Badge>{props.buckets.snoozed_bucket.length}</Badge>
                      </Group>
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setMainTab("demo_bucket");
                      }}
                    >
                      <Group spacing={5} noWrap position="apart">
                        <Text>Demo Set</Text>
                        <Badge>{props.buckets.demo_bucket.length}</Badge>
                      </Group>
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setMainTab("crm_bucket");
                      }}
                    >
                      <Group spacing={5} noWrap position="apart">
                        <Text>CRM Sync</Text>
                        <Badge>{props.buckets.crm_bucket.length}</Badge>
                      </Group>
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        setMainTab("outreach_bucket");
                      }}
                    >
                      <Group spacing={5} noWrap position="apart">
                        <Text>Sent Outreach</Text>
                        <Badge>{props.buckets.outreach_bucket.length}</Badge>
                      </Group>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Tabs.List>
            </Tabs>
            <>
              <Stack spacing={0}>
                {inboxTab === "manual" ? (
                  <Box bg={"#E4E5E6"} p={"md"}>
                    <Text size={"sm"} color="gray">
                      Off load some of the messages you have to respond to by assigning them to your AI!
                    </Text>
                    <Flex
                      align={"center"}
                      gap={3}
                      className="hover:cursor-pointer"
                      onClick={() =>
                        openContextModal({
                          modal: "assignConversationAIModal",
                          title: (
                            <Flex align={"center"} justify={"space-between"}>
                              <Text
                                size={"24px"}
                                fw={600}
                                color="gray"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                                mr={"20rem"}
                              >
                                Assign Conversations to the AI
                              </Text>
                            </Flex>
                          ),
                          styles: {
                            content: {
                              minWidth: "800px",
                            },
                          },
                          innerProps: {},
                        })
                      }
                    >
                      <IconEdit size={"0.9rem"} color="#228BE6" />
                      <Text fw={500} underline size={"sm"} color="#228BE6">
                        Edit who responds on what here
                      </Text>
                    </Flex>
                  </Box>
                ) : inboxTab === "ai" ? (
                  <>
                    <Box bg={"#E4E5E6"} p={"md"}>
                      <Text size={"sm"} color="gray">
                        AI index performance revival rate
                      </Text>
                      <Flex align={"center"} gap={3} className="hover:cursor-pointer">
                        {/* <IconEdit size={"0.9rem"} color="#888" />
                        <Tooltip label="Coming soon.">
                          <Text fw={500} underline size={"sm"} color="#888">
                            Edit reply frameworks
                          </Text>
                        </Tooltip> */}
                        <Flex align={"center"} w={"100%"} justify={"space-between"}>
                          <Text fw={600} size={"sm"}>
                            Revival Rate: {25}%
                          </Text>
                          <Tooltip
                            arrowOffset={10}
                            arrowSize={4}
                            bg={"white"}
                            label={
                              <Box>
                                <Flex align={"center"} gap={4} py={6}>
                                  <Badge variant="light" leftSection={<IconUser size={"0.9rem"} className="mt-1" />}>
                                    {5}
                                  </Badge>
                                  <Text color="gray" size={"sm"} fw={500}>
                                    Prospects Responded
                                  </Text>
                                </Flex>
                                <Divider my={6} />
                                <Flex align={"center"} gap={4} py={6}>
                                  <Badge variant="light" leftSection={<IconBolt size={"0.9rem"} className="mt-1" />}>
                                    {25}
                                  </Badge>
                                  <Text color="gray" size={"sm"} fw={500}>
                                    AI Revival Attempted
                                  </Text>
                                </Flex>
                              </Box>
                            }
                            withArrow
                            position="right"
                          >
                            <IconInfoCircle size={"1rem"} color="#228be6" />
                          </Tooltip>
                        </Flex>
                      </Flex>
                    </Box>
                    <Flex bg={"#FFFAEA"} align={"center"} gap={"xs"} px={"md"} py={"sm"}>
                      <IconAlarm size={"0.9rem"} color="orange" />
                      <Text color="orange">
                        AI set to clear inbox in <Badge color="orange">{"03"}</Badge>days
                      </Text>
                    </Flex>
                  </>
                ) : (
                  <></>
                )}
                {/* Search bar */}
                <Input
                  p={5}
                  sx={{ flex: 1 }}
                  styles={{
                    input: {
                      backgroundColor: theme.white,
                      border: `1px solid ${theme.colors.gray[2]}`,
                      "&:focus-within": {
                        borderColor: theme.colors.gray[4],
                      },
                      "&::placeholder": {
                        color: theme.colors.gray[6],
                        fontWeight: 500,
                      },
                    },
                  }}
                  icon={<IconSearch size="1.0rem" />}
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.metaKey && event.key === "'") event.preventDefault();
                  }}
                  radius={theme.radius.md}
                  placeholder="Search..."
                />

                <ScrollArea h={"calc(92vh - 90px)"}>
                  <Stack spacing={0}>
                    {/* Grouped prospects by overall status */}
                    {prospectGroups.map((group, index) => (
                      <Box key={index}>
                        <Box bg="blue.1" py={"sm"} px={"md"} color="blue">
                          <Flex w="100%">
                            <Text color="blue" ta="center" fz={14} fw={700}>
                              {labelizeConvoSubstatus(group[0])}
                            </Text>
                            <Badge color="blue" size="xs" ml="xs" mt="2px">
                              {group[1].length}
                            </Badge>
                          </Flex>
                        </Box>
                        {/* List of prospects in that group */}
                        <Stack spacing={0}>
                          {group[1].map((prospect, index) => (
                            <Box
                              key={index}
                              onClick={() => {
                                setOpenedProspectId(prospect.prospect_id);
                                setOpenedList(false);
                              }}
                            >
                              <ProspectConvoCard
                                client_sdr_name={prospect.client_sdr_name}
                                client_sdr_img_url={prospect.client_sdr_img_url || ""}
                                id={prospect.prospect_id}
                                name={prospect.full_name}
                                title={prospect.title}
                                img_url={""}
                                latest_msg={prospect.email_last_message_from_prospect ?? ""}
                                latest_msg_time={prospect.li_last_message_timestamp ?? ""}
                                icp_fit={-1}
                                new_msg_count={0}
                                latest_msg_from_sdr={false}
                                default_channel={mainTab !== "snoozed" ? "LINKEDIN" : undefined}
                                opened={prospect.prospect_id === openedProspectId}
                                snoozed_until={prospect.hidden_until}
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </ScrollArea>
              </Stack>
            </>
          </Stack>
          {prospectGroups.length === 0 && (
            <Text ta="center" fz="sm" c="dimmed" fs="italic" py="sm">
              No prospects found.
            </Text>
          )}
        </ScrollArea>
      </Drawer>

      {/* <Button
        onClick={() => {
          setOpenedList(true);
        }}
      >
        Open drawer
      </Button> */}
    </>
  );
}
