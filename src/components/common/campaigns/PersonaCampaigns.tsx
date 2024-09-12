import { openedProspectIdState } from "@atoms/inboxAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
import PageFrame from "@common/PageFrame";
import EmailQueuedMessages from "@common/emails/EmailQueuedMessages";
import LinkedinQueuedMessages from "@common/messages/LinkedinQueuedMessages";
import EmojiPicker from "emoji-picker-react";
import { IconFlagCancel, IconMessage, IconPencil, IconPointerCancel } from "@tabler/icons-react";

import posthog from "posthog-js";

import {
  Tooltip,
  Stack,
  Group,
  Avatar,
  Title,
  Button,
  Divider,
  Box,
  Modal,
  Popover,
  Text,
  Paper,
  ActionIcon,
  Center,
  Switch,
  useMantineTheme,
  ScrollArea,
  Tabs,
  Loader,
  Collapse,
  Flex,
  RingProgress,
  MantineColor,
  Badge,
  CloseButton,
  Anchor,
  ThemeIcon,
  Grid,
  Progress,
  List,
  Menu,
  SegmentedControl,
  Card,
  Indicator,
  ColorSwatch,
  Checkbox,
} from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconBrandLinkedin,
  IconBriefcase,
  IconBuilding,
  IconBulb,
  IconCalendar,
  IconChargingPile,
  IconChartArcs,
  IconCheck,
  IconChecks,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCopy,
  IconEdit,
  IconExternalLink,
  IconFlower,
  IconList,
  IconLoader,
  IconMail,
  IconMailbox,
  IconMan,
  IconPhoto,
  IconPlaystationCircle,
  IconPlus,
  IconPoint,
  IconRefresh,
  IconSeeding,
  IconSend,
  IconTarget,
  IconTargetArrow,
  IconToggleRight,
  IconX,
} from "@tabler/icons";
import { IconArrowDown, IconArrowUp, IconClipboard, IconMessageCheck } from "@tabler/icons-react";
import { navigateToPage } from "@utils/documentChange";
import { convertDateToShortFormatWithoutTime, formatToLabel } from "@utils/general";
import { getPersonasActivity, getPersonasCampaignView, getPersonasOverview } from "@utils/requests/getPersonas";
import _ from "lodash";
import moment from "moment";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { PersonaOverview } from "src";
import { API_URL } from "@constants/data";
import CampaignGraph from "./campaigngraph";
import { showNotification } from "@mantine/notifications";
import { CampaignAnalyticsData } from "./CampaignAnalytics";
import { TodayActivityData } from "./OverallPipeline/TodayActivity";
import UserStatusToggle from "./UserStatusToggle";
import AllCampaign from "../../PersonaCampaigns/AllCampaign";
import TriggersList from "@pages/TriggersList";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import ClientCampaignView from "@pages/ClientCampaignView/ClientCampaignView";
import { ListItem } from "@mantine/core/lib/List/ListItem/ListItem";
import Utilization from "@pages/Utilization/Utilization";
import AccountBased from "@pages/AccountBased";
import WebsiteIntent from "./websiteIntent/WebsiteIntent";
import ChampionChange from "./champion/Championchange";
import ComingSoonCard from "@common/library/ComingSoonCard";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useStrategiesApi } from "@pages/Strategy/StrategyApi";

export type CampaignPersona = {
  id: number;
  name: string;
  email_eligible: number;
  email_used: number;
  email_queued: number;
  email_sent: number;
  email_opened: number;
  email_replied: number;
  email_demo: number;
  email_bounced: number;
  email_removed: number;
  li_eligible: number;
  li_used: number;
  li_queued: number;
  li_sent: number;
  li_opened: number;
  li_replied: number;
  li_demo: number;
  li_failed: number;
  li_removed: number;
  active: boolean;
  linkedin_active: boolean;
  email_active: boolean;
  created_at: string;
  emoji: string;
  total_sent: number;
  total_opened: number;
  total_replied: number;
  total_pos_replied: number;
  total_demo: number;
  total_prospects: number;
  total_prospects_left_linkedin: number;
  total_prospects_left_email: number;
  total_used: number;
  sdr_name: string;
  sdr_img_url: string;
  sdr_id: number;
  smartlead_campaign_id?: number;
  meta_data?: Record<string, any>;
  first_message_delay_days?: number;
  email_to_linkedin_connection?: string;
  cycle?: number;
  setup_status?: string;
};

export default function PersonaCampaigns() {
  const navigate = useNavigate();

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [projects, setProjects] = useState<PersonaOverview[]>([]);
  const [personas, setPersonas] = useState<CampaignPersona[]>([]);

  const [search, setSearch] = useState<string>("");

  const [currentTab, setCurrentTab] = useState<string>("overview");

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  let filteredProjects = personas.filter((personas) => personas.name.toLowerCase().includes(search.toLowerCase()));
  let allProjects = personas;

  const [campaignAnalyticData, setCampaignAnalyticData] = useState<CampaignAnalyticsData>({
    sentOutreach: 0,
    accepted: 0,
    activeConvos: 0,
    demos: 0,
  });
  const [aiActivityData, setAiActivityData] = useState<TodayActivityData>({
    totalActivity: 0,
    newOutreach: 0,
    newBumps: 0,
    newReplies: 0,
  });
  const [currentEmailSla, setCurrentEmailSla] = useState<number>(0);
  const [currentLinkedInSLA, setCurrentLinkedInSLA] = useState<number>(0);
  const [showInactivePersonas, setShowInactivePersonas] = useState<boolean>(false);
  const [showAdvancedTabs, setShowAdvancedTabs] = useState<boolean>(false);
  const [showActiveCampaigns, setShowActiveCampaigns] = useState<boolean>(true);
  const [showInactiveCampaigns, setShowInactiveCampaigns] = useState<boolean>(false);
  const [showSetupCampaigns, setShowSetupCampaigns] = useState<boolean>(true);

  let [loadingPersonas, setLoadingPersonas] = useState<boolean>(true);

  const [campaignViewMode, setCampaignViewMode] = useState<"node-view" | "list-view" | "cycle-view">("list-view");

  const fetchCampaignPersonas = async () => {
    if (!isLoggedIn()) return;
    setLoadingPersonas(true);

    // Get Personas Campaign View
    const response = await getPersonasCampaignView(userToken);
    const result = response.status === "success" ? (response.data as CampaignPersona[]) : [];

    // Aggregate campaign analytics
    let analytics = {
      sentOutreach: 0,
      accepted: 0,
      activeConvos: 0,
      demos: 0,
    };
    for (const campaign of response.data) {
      analytics.sentOutreach += campaign.li_sent;
      analytics.accepted += campaign.li_opened;
      analytics.activeConvos += campaign.li_replied;
      analytics.demos += campaign.li_demo;
    }
    setCampaignAnalyticData(analytics);

    // Get LinkedIn SLA
    if (userData.sla_schedules) {
      for (const schedule of userData.sla_schedules) {
        if (moment(schedule.start_date) < moment() && moment() <= moment(schedule.start_date).add(7, "days")) {
          setCurrentEmailSla(schedule.email_volume);
          setCurrentLinkedInSLA(schedule.linkedin_volume);
        }
      }
    }

    // Set the Personas
    setPersonas(result);
    setLoadingPersonas(false);

    // Get Personas Overview
    const response2 = await getPersonasOverview(userToken);
    const result2 = response2.status === "success" ? (response2.data as PersonaOverview[]) : [];
    setProjects(result2);

    // Get AI Activity
    const response3 = await getPersonasActivity(userToken);
    const result3 = response3.status === "success" ? response3.data : [];
    if (result3.activities && result3.activities.length > 0) {
      const newOutreach = result3.activities[0].messages_sent;
      const newBumps = result3.activities[0].bumps_sent;
      const newReplies = result3.activities[0].replies_sent;
      const totalActivity = newOutreach + newBumps + newReplies;
      const activity_data = {
        totalActivity: totalActivity,
        newOutreach: newOutreach,
        newBumps: newBumps,
        newReplies: newReplies,
      };
      setAiActivityData(activity_data);
    }
  };

  useEffect(() => {
    fetchCampaignPersonas();
    posthog.onFeatureFlags(function () {
      if (posthog.isFeatureEnabled("view_intent_tabs")) {
        setShowAdvancedTabs(true);
      }
    });
  }, []);

  // sort personas by persona.active then persona.created_at in desc order
  filteredProjects.sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    if (moment(a.created_at).isAfter(moment(b.created_at))) return -1;
    if (moment(a.created_at).isBefore(moment(b.created_at))) return 1;
    return 0;
  });

  const campaignsSectionHeader = (
    <>
      <Group position="apart" mb="xs">
        <Group>
          <Title color="gray.6" order={3}>
            {userData?.sdr_name.split(" ")[0]}'s Campaigns
          </Title>
        </Group>

        <Group>
          {userData?.warmup_linkedin_complete ? (
            <Button
              leftIcon={<IconBrandLinkedin size="1.4rem" color="white" fill="#228be6" />}
              variant="outline"
              radius="md"
              onClick={() => {
                navigateToPage(navigate, `/settings/linkedin`);
              }}
            >
              Weekly LinkedIn Vol:
              {currentLinkedInSLA}
            </Button>
          ) : (
            <Tooltip label="Your LinkedIn account is in a warmup phase. Explore more." withArrow withinPortal>
              <Button
                leftIcon={<IconBrandLinkedin size="1.4rem" color="white" fill="#228be6" />}
                variant="outline"
                radius="md"
                onClick={() => {
                  navigateToPage(navigate, `/settings/linkedin`);
                }}
              >
                LINKEDIN WARMING UP:
                <Text color="blue" mt={2} mx={4} size={"md"} fw={700}>
                  {currentLinkedInSLA}
                </Text>{" "}
              </Button>
            </Tooltip>
          )}

          <Button
            leftIcon={<IconMail size="1.4rem" color="white" fill="#fd7e14" />}
            variant="outline"
            color="orange"
            radius="md"
            onClick={() => {
              navigateToPage(navigate, `/settings/email`);
            }}
          >
            Weekly Email Vol: {currentEmailSla}
          </Button>

          {/* <SegmentedControl
            onChange={(value: any) => {
              setCampaignViewMode(value);
            }}
            data={[
              {
                value: 'list-view',
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconList size='1rem' />
                    <span>List</span>
                  </Center>
                ),
              },
              {
                value: 'cycle-view',
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconFlower size='1rem' />
                    <span>Cycles</span>
                  </Center>
                ),
              },
            ]}
          /> */}

          <Button.Group>
            <Button
              radius="md"
              leftIcon={<IconPlus size="1rem" />}
              onClick={() => {
                openContextModal({
                  modal: "uploadProspects",
                  title: (
                    <Title order={3} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      {/* <IconTargetArrow color="#228be6" /> Request Campaign */}
                      <IconTargetArrow color="#228be6" /> Create Campaign
                    </Title>
                  ),
                  innerProps: { mode: "CREATE-ONLY" },
                  styles: {
                    content: {
                      minWidth: "800px",
                    },
                  },
                });
              }}
            >
              Create New Campaign
            </Button>
            <Menu shadow="md" width={260} position="bottom-end" radius="md">
              <Menu.Target>
                <Button
                  style={{
                    borderLeft: "1px solid #e9ecef",
                  }}
                  radius="md"
                  px={10}
                >
                  <IconChevronDown size="1rem" />
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  icon={<IconCopy size="1rem" />}
                  onClick={() => {
                    openContextModal({
                      modal: "duplicateCampaign",
                      title: <Title order={3}>Duplicate Campaign</Title>,
                      innerProps: {
                        fetchAllCampaigns: fetchCampaignPersonas,
                      },
                    });
                  }}
                >
                  Duplicate Campaign
                </Menu.Item>
                <Menu.Item
                  icon={<IconMail size="1rem" />}
                  onClick={() => {
                    openContextModal({
                      modal: "singleEmailCampaignModal",
                      title: <Title order={3}>Single Email Campaign</Title>,
                      innerProps: {
                        setCurrentTab: setCurrentTab,
                        fetchAllCampaigns: fetchCampaignPersonas,
                      },
                    });
                  }}
                >
                  Single Email Campaign
                </Menu.Item>
                <Menu.Item
                  icon={<IconMail size="1rem" />}
                  onClick={() => {
                    openContextModal({
                      modal: "singleEmailCampaignBetaModal",
                      title: <Title order={3}>Single Email Campaign (BETA)</Title>,
                      innerProps: {
                        setCurrentTab: setCurrentTab,
                        fetchAllCampaigns: fetchCampaignPersonas,
                      },
                      styles: {
                        content: {
                          minWidth: "750px",
                        },
                      },
                    });
                  }}
                >
                  Single Email Campaign (BETA)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Button.Group>
        </Group>
      </Group>
    </>
  );

  return (
    <PageFrame>
      <Stack>
        <Tabs onTabChange={(value) => setCurrentTab(value as string)} value={currentTab} keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="overview" icon={<IconClipboard size="0.8rem" />} fz="xs">
              {userData?.sdr_name.split(" ")[0]}'s Campaigns
            </Tabs.Tab>
            <Tabs.Tab value="all-campaigns" icon={<IconClipboard size="0.8rem" />} fz="xs">
              {userData?.client?.company}'s Campaigns
            </Tabs.Tab>
            {showAdvancedTabs && (
              <>
                <Tabs.Tab value="triggers" icon={<IconTarget size="0.8rem" />} fz="xs">
                  Triggers
                </Tabs.Tab>
                <Tabs.Tab value="website-intent" icon={<IconBrandLinkedin size="0.8rem" />} fz="xs">
                  Website Intent
                </Tabs.Tab>
                <Tabs.Tab value="champion-change" icon={<IconBrandLinkedin size="0.8rem" />} fz="xs">
                  Champion Change
                </Tabs.Tab>
                <Tabs.Tab value="account-based" icon={<IconBrandLinkedin size="0.8rem" />} fz="xs">
                  Account Based
                </Tabs.Tab>
              </>
            )}
            <Tabs.Tab value="linkedin" icon={<IconBrandLinkedin size="0.8rem" />} ml="auto" fz="xs">
              Queued LinkedIns
            </Tabs.Tab>
            <Tabs.Tab value="email" icon={<IconMail size="0.8rem" />} fz="xs">
              Queued Emails
            </Tabs.Tab>
          </Tabs.List>

          {/* <Tabs.Panel value='utilization' pt='xs'>
            <Utilization />
          </Tabs.Panel> */}

          <Tabs.Panel value="website-intent" pt="xs">
            <WebsiteIntent />
          </Tabs.Panel>
          <Tabs.Panel value="champion-change" pt="xs">
            <ChampionChange />
          </Tabs.Panel>
          <Tabs.Panel value="account-based" pt="xs">
            <AccountBased />
          </Tabs.Panel>

          <Tabs.Panel value="triggers" pt="xs">
            <TriggersList />
          </Tabs.Panel>

          <Tabs.Panel value="all-campaigns" pt="xs">
            <AllCampaign campaigns={allProjects} />
          </Tabs.Panel>

          <Tabs.Panel value="overview" pt="xs">
            <Stack>
              {campaignsSectionHeader}

              <ScrollArea h={"78vh"}>
                <Stack spacing={0}>
                  {loadingPersonas && (
                    <Center h={200}>
                      <Loader />
                    </Center>
                  )}

                  {campaignViewMode === "cycle-view" && !loadingPersonas && (
                    <PersonCampaignTable
                      showCycles
                      campaignViewMode={"node-view"}
                      projects={projects}
                      filteredProjects={filteredProjects
                        .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                        .sort((a, b) => {
                          if (a.cycle && b.cycle) {
                            return a.cycle - b.cycle;
                          } else if (a.cycle) {
                            return -1;
                          } else if (b.cycle) {
                            return 1;
                          } else {
                            return 0;
                          }
                        })}
                      onPersonaActiveStatusUpdate={async (id: number, active: boolean) => {
                        setProjects((cur) => {
                          const temp = [...cur].map((e) => {
                            if (e.id === id) {
                              e.active = active;
                              return e;
                            }
                            return e;
                          });
                          return temp;
                        });
                        await fetchCampaignPersonas();
                      }}
                    />
                  )}

                  {/* ACTIVE CAMPAIGNS */}
                  <Card withBorder mb="md" p={0}>
                    <Flex p="md">
                      <ColorSwatch color="#238BE6" mr="md" />
                      <Box>
                        <Title order={4} mb="0">
                          {
                            filteredProjects
                              .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                              .filter((persona: CampaignPersona) => persona.setup_status == "ACTIVE").length
                          }{" "}
                          Active Campaigns
                        </Title>
                        <Text size="sm" color="gray" mt={0}>
                          These campaigns are currently active and sending messages.
                        </Text>
                      </Box>
                      <ActionIcon ml="auto" mr="xs" mt="xs">
                        <IconChevronDown
                          size="2rem"
                          onClick={() => setShowActiveCampaigns(!showActiveCampaigns)}
                          style={{
                            transform: showActiveCampaigns ? "rotate(180deg)" : "",
                          }}
                        />
                      </ActionIcon>
                    </Flex>
                    {showActiveCampaigns && (
                      <PersonCampaignTable
                        campaignViewMode={"node-view"}
                        projects={projects}
                        filteredProjects={filteredProjects
                          .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                          .filter((persona: CampaignPersona) => persona.setup_status == "ACTIVE")}
                        onPersonaActiveStatusUpdate={async (id: number, active: boolean) => {
                          setProjects((cur) => {
                            const temp = [...cur].map((e) => {
                              if (e.id === id) {
                                e.active = active;
                                return e;
                              }
                              return e;
                            });
                            return temp;
                          });
                          await fetchCampaignPersonas();
                        }}
                      />
                    )}
                  </Card>

                  {/* SETUP CAMPAIGNS */}
                  <Card withBorder mb="md" p={0}>
                    <Flex p="md">
                      <ColorSwatch color="#FAB007" mr="md" />
                      <Box>
                        <Title order={4} mb="0">
                          {
                            filteredProjects
                              .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                              .filter((persona: CampaignPersona) => persona.setup_status == "SETUP").length
                          }{" "}
                          Setup Campaigns
                        </Title>
                        <Text size="sm" color="gray" mt={0}>
                          These campaigns are currently being set up.
                        </Text>
                      </Box>
                      <ActionIcon ml="auto" mr="xs" mt="xs">
                        <IconChevronDown
                          size="2rem"
                          onClick={() => setShowSetupCampaigns(!showSetupCampaigns)}
                          style={{
                            transform: showSetupCampaigns ? "rotate(180deg)" : "",
                          }}
                        />
                      </ActionIcon>
                    </Flex>
                    {showSetupCampaigns && (
                      <PersonCampaignTable
                        campaignViewMode={"node-view"}
                        projects={projects}
                        filteredProjects={filteredProjects
                          .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                          .filter((persona: CampaignPersona) => persona.setup_status == "SETUP")}
                        onPersonaActiveStatusUpdate={async (id: number, active: boolean) => {
                          setProjects((cur) => {
                            const temp = [...cur].map((e) => {
                              if (e.id === id) {
                                e.active = active;
                                return e;
                              }
                              return e;
                            });
                            return temp;
                          });
                          await fetchCampaignPersonas();
                        }}
                      />
                    )}
                  </Card>

                  {/* INACTIVE CAMPAIGNS */}
                  <Card withBorder mb="md" p={0}>
                    <Flex p="md">
                      <ColorSwatch color="#FA5352" mr="md" />
                      <Box>
                        <Title order={4} mb="0">
                          {
                            filteredProjects
                              .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                              .filter((persona: CampaignPersona) => persona.setup_status == "INACTIVE").length
                          }{" "}
                          Inactive Campaigns
                        </Title>
                        <Text size="sm" color="gray" mt={0}>
                          These campaigns are not currently sending messages.
                        </Text>
                      </Box>
                      <ActionIcon ml="auto" mr="xs" mt="xs">
                        <IconChevronDown
                          size="2rem"
                          onClick={() => setShowInactiveCampaigns(!showInactiveCampaigns)}
                          style={{
                            transform: showInactiveCampaigns ? "rotate(180deg)" : "",
                          }}
                        />
                      </ActionIcon>
                    </Flex>
                    {showInactiveCampaigns && (
                      <PersonCampaignTable
                        campaignViewMode={"node-view"}
                        projects={projects}
                        filteredProjects={filteredProjects
                          .filter((persona: CampaignPersona) => persona.sdr_id === userData?.id)
                          .filter((persona: CampaignPersona) => persona.setup_status == "INACTIVE")}
                        onPersonaActiveStatusUpdate={async (id: number, active: boolean) => {
                          setProjects((cur) => {
                            const temp = [...cur].map((e) => {
                              if (e.id === id) {
                                e.active = active;
                                return e;
                              }
                              return e;
                            });
                            return temp;
                          });
                          await fetchCampaignPersonas();
                        }}
                      />
                    )}
                  </Card>

                  {/* OLD VIEW START */}
                  {/* {!loadingPersonas && campaignViewMode === "list-view" && (
                    <PersonCampaignTable
                      campaignViewMode={"node-view"}
                      projects={projects}
                      filteredProjects={filteredProjects
                        .filter(
                          (persona: CampaignPersona) =>
                            persona.sdr_id === userData?.id
                        )
                        .filter((persona) => persona.active)}
                      onPersonaActiveStatusUpdate={async (
                        id: number,
                        active: boolean
                      ) => {
                        setProjects((cur) => {
                          const temp = [...cur].map((e) => {
                            if (e.id === id) {
                              e.active = active;
                              return e;
                            }
                            return e;
                          });
                          return temp;
                        });
                        await fetchCampaignPersonas();
                      }}
                    />
                  )}
                  {showInactivePersonas &&
                    !loadingPersonas &&
                    campaignViewMode === "list-view" && (
                      <>
                        <PersonCampaignTable
                          hideHeader
                          campaignViewMode={"node-view"}
                          projects={projects}
                          filteredProjects={filteredProjects
                            .filter((persona) => !persona.active)
                            .filter(
                              (persona: CampaignPersona) =>
                                persona.sdr_id === userData?.id
                            )}
                          onPersonaActiveStatusUpdate={async (
                            id: number,
                            active: boolean
                          ) => {
                            setProjects((cur) => {
                              const temp = [...cur].map((e) => {
                                if (e.id === id) {
                                  e.active = active;
                                  return e;
                                }
                                return e;
                              });
                              return temp;
                            });
                            await fetchCampaignPersonas();
                          }}
                        />
                      </>
                    )}

                  {campaignViewMode === "list-view" &&
                    filteredProjects
                      .filter((persona) => !persona.active)
                      .filter(
                        (persona: CampaignPersona) =>
                          persona.sdr_id === userData?.id
                      ).length > 0 && (
                      <Button
                        color="gray"
                        // leftIcon={<IconCalendar color="gray" size="0.8rem"></IconCalendar>}
                        rightIcon={
                          showInactivePersonas ? (
                            <IconChevronUp size={"0.8rem"} />
                          ) : (
                            <IconChevronDown size={"0.8rem"} />
                          )
                        }
                        variant="outline"
                        size="xs"
                        w="300px"
                        ml="auto"
                        mr="auto"
                        sx={{ borderRadius: "0.5rem" }}
                        onClick={() =>
                          setShowInactivePersonas(!showInactivePersonas)
                        }
                        mt="md"
                        mb="md"
                      >
                        {showInactivePersonas ? "Hide" : "Show"}{" "}
                        {
                          filteredProjects
                            .filter((persona) => !persona.active)
                            .filter(
                              (persona: CampaignPersona) =>
                                persona.sdr_id === userData?.id
                            ).length
                        }{" "}
                        Inactive Campaign
                        {filteredProjects
                          .filter((persona) => !persona.active)
                          .filter(
                            (persona: CampaignPersona) =>
                              persona.sdr_id === userData?.id
                          ).length > 1
                          ? "s"
                          : ""}
                      </Button>
                    )} */}
                  {/* OLD VIEW END */}

                  {!loadingPersonas && filteredProjects.length === 0 && (
                    <Center h={200}>
                      <Text fs="italic" c="dimmed">
                        No campaigns found.
                      </Text>
                    </Center>
                  )}
                </Stack>
              </ScrollArea>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="linkedin" pt="xs">
            <Group position="center" noWrap>
              <LinkedinQueuedMessages all />
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="email" pt="xs">
            <Group position="center" noWrap>
              <EmailQueuedMessages all />
            </Group>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </PageFrame>
  );
}

type ChannelSection = {
  id: number;
  type: string;
  active: boolean;
  icon: ReactNode;
  sends: number;
  opens: number;
  replies: number;
  date: string;
};

export function PersonCampaignCard(props: {
  showAvatar?: boolean;
  persona: CampaignPersona;
  project?: PersonaOverview;
  viewMode: "node-view" | "list-view";
  showCycles?: boolean;
  onPersonaActiveStatusUpdate?: (id: number, active: boolean) => void;
}) {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);
  const [opened, { open, close, toggle }] = useDisclosure(false); //props.persona.active
  const [inactiveChannelsOpened, setInactiveChannelsOpened] = useState(false);
  const [emoji, setEmojiState] = useState<string>(props.persona.emoji || "⬜️");
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();

  const userToken = useRecoilValue(userTokenState);

  let total_replied = props.persona.total_replied;
  let total_pos_replied = props.persona.total_pos_replied;
  let total_opened = props.persona.total_opened;
  let total_sent = props.persona.total_sent;

  const userData = useRecoilValue(userDataState);

  const [value, setValue] = useState<string>("");
  const [campaignList, setCampaignList] = useState<Record<string, any>[]>([]);
  const [campaignName, setCampaignName] = useState("");

  const isMyCampaign = userData.id === props.persona.sdr_id;

  const setEmoji = (emoji: string) => {
    setEmojiState(emoji);
    fetch(`${API_URL}/client/persona/update_emoji`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        persona_id: props.persona.id,
        emoji: emoji,
      }),
    });
  };

  const types: ChannelSection[] = [
    {
      id: 1,
      type: "LinkedIn",
      active: props.persona.linkedin_active,
      icon: <IconBrandLinkedin size="0.925rem" />,
      sends: props.persona.li_sent,
      opens: props.persona.li_opened,
      replies: props.persona.li_replied,
      date: props.persona.created_at,
    },
    {
      id: 2,
      type: "Email",
      active: props.persona.email_active,
      icon: <IconMail size="0.925rem" />,
      sends: props.persona.email_sent,
      opens: props.persona.email_opened,
      replies: props.persona.email_replied,
      date: props.persona.created_at,
    },
    {
      id: 3,
      type: "Not Interested",
      active: false,
      icon: <IconSeeding size="0.925rem" />,
      sends: 0,
      opens: 0,
      replies: 0,
      date: props.persona.created_at,
    },
  ];
  const [popoverOpened, { close: closePopover, open: openPopover }] = useDisclosure(false);

  const [statuspopoverOpened, { close: statusclosePopover, open: statusopenPopover }] = useDisclosure(false);

  const [channelOpened, { open: channelOpen, close: channelClose }] = useDisclosure(false);

  const ChannelModal = () => {
    return (
      <Modal
        opened={channelOpened}
        onClose={channelClose}
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
        centered
        size="70rem"
        withCloseButton={false}
        padding={0}
        radius={"md"}
      >
        <Modal.Header
          bg={
            value === "sent"
              ? "#228be6"
              : value === "open"
              ? "#fd4efe"
              : value === "reply"
              ? "orange"
              : value === "demo"
              ? "green"
              : value === "pos_reply"
              ? "purple"
              : ""
          }
        >
          <Flex justify={"space-between"} w={"100%"} align={"center"} px={43} py={25}>
            <Text size={"lg"} color="white">
              Outreach for: <span className=" font-semibold text-[20px]"> {campaignName ? campaignName : "Coming soon! ⚠️ - This is all mock data..."}</span>
            </Text>
            <CloseButton
              aria-label="Close modal"
              onClick={channelClose}
              variant="outline"
              radius="xl"
              style={{
                borderColor: "white",
                color: "white",
              }}
            />
          </Flex>
        </Modal.Header>
        <Modal.Body mt={20} px={20}>
          <Group
            grow
            style={{
              justifyContent: "center",
              gap: "0px",
            }}
          >
            <Box
              w={"100%"}
              onClick={() => {
                setValue("sent");
              }}
            >
              <StatModalDisplay
                color="#228be6"
                icon={<IconSend color={theme.colors.blue[6]} size="20" />}
                label="Sent"
                percentcolor="#e7f5ff"
                total={total_sent ?? 0}
                border={value === "sent" ? "#228be6" : ""}
                percentage={Math.floor(((total_sent ?? 0) / (total_sent || 1)) * 100)}
              />
            </Box>
            <Box
              w={"100%"}
              onClick={() => {
                setValue("open");
              }}
            >
              <StatModalDisplay
                color="#fd4efe"
                icon={<IconChecks color={"#fd4efe"} size="20" />}
                label="Open"
                percentcolor="#ffedff"
                border={value === "open" ? "#fd4efe" : ""}
                total={total_opened ?? 0}
                percentage={Math.floor(((total_opened ?? 0) / (total_sent || 1)) * 100)}
              />
            </Box>
            <Box
              w={"100%"}
              onClick={() => {
                setValue("reply");
              }}
            >
              <StatModalDisplay
                color="#fd7e14"
                icon={<IconMessage color={theme.colors.orange[6]} size="20" />}
                label="Reply"
                percentcolor="#fff5ee"
                border={value === "reply" ? "#fd7e14" : ""}
                total={total_replied ?? 0}
                percentage={Math.floor(((total_replied ?? 0) / (total_opened || 1)) * 100)}
              />
            </Box>
            <Box
              w={"100%"}
              onClick={() => {
                setValue("pos_reply");
              }}
            >
              <StatModalDisplay
                color="#14B887"
                icon={<IconMessage color={theme.colors.teal[6]} size="20" />}
                label="(+)Reply"
                percentcolor="#E8F6F2"
                border={value === "total_pos_replied" ? "#CFF1E7" : ""}
                total={total_pos_replied ?? 0}
                percentage={Math.floor(((total_pos_replied ?? 0) / (total_replied || 1)) * 100)}
              />
            </Box>
            <Box
              w={"100%"}
              onClick={() => {
                setValue("demo");
              }}
            >
              <StatModalDisplay
                color="#40c057"
                icon={<IconCalendar color={theme.colors.green[6]} size="20" />}
                label="Demo"
                percentcolor="#e2f6e7"
                border={value === "demo" ? "#40c057" : ""}
                total={props.persona.total_demo ?? 0}
                percentage={Math.floor(((props.persona.total_demo ?? 0) / (total_pos_replied || 1)) * 100)}
              />
            </Box>
          </Group>
          <ScrollArea h={600} scrollbarSize={6}>
            <Flex direction={"column"} gap={20} my={20}>
              {filteredCampaignList?.map((item, index) => {
                return (
                  <Group
                    grow
                    style={{
                      justifyContent: "start",
                      gap: "0px",
                    }}
                    key={index}
                  >
                    <Flex
                      mx={25}
                      w={"100%"}
                      style={{
                        borderRadius: "10px",
                        border: "3px solid #e9ecef",
                      }}
                    >
                      <Box
                        px={15}
                        py={12}
                        style={{
                          borderRight: "3px solid #e9ecef",
                          position: "relative",
                        }}
                        w={"30rem"}
                      >
                        <Flex align={"center"} gap={10} mb={8}>
                          <Avatar src={item.img_url} radius="xl" size="lg" />
                          <Button
                            style={{
                              position: "absolute",
                              top: 15,
                              right: 10,
                            }}
                            size="xs"
                            variant="default"
                            compact
                            component="a"
                            target="_blank"
                            href={`/prospects/${item.prospect_id}`}
                          >
                            Open Convo
                          </Button>
                          <Box>
                            <Flex align={"center"} gap={10}>
                              <Text fw={600}>{item.prospect_name}</Text>
                            </Flex>
                            <Flex align={"center"} gap={10} w={"100%"} mt={3}>
                              <Text>ICP Score: </Text>
                              <Badge
                                color={
                                  item.prospect_icp_fit_score == "VERY HIGH"
                                    ? "green"
                                    : item.prospect_icp_fit_score == "HIGH"
                                    ? "blue"
                                    : item.prospect_icp_fit_score == "MEDIUM"
                                    ? "yellow"
                                    : item.prospect_icp_fit_score == "LOW"
                                    ? "orange"
                                    : item.prospect_icp_fit_score == "VERY LOW"
                                    ? "red"
                                    : "gray"
                                }
                                fw={600}
                              >
                                {item.prospect_icp_fit_score}
                              </Badge>
                            </Flex>
                          </Box>
                        </Flex>
                        <Flex gap={6}>
                          <div className="mt-1">
                            <IconMan size={20} color="#817e7e" />
                          </div>
                          <Text color="#817e7e" mt={3}>
                            {campaignName}
                          </Text>
                        </Flex>
                        <Flex gap={6}>
                          <div className="mt-1">
                            <IconBriefcase size={20} color="#817e7e" />
                          </div>
                          <Text color="#817e7e" mt={3}>
                            {item.prospect_title}
                          </Text>
                        </Flex>
                        <Flex gap={6}>
                          <div className="mt-1">
                            <IconBuilding size={20} color="#817e7e" />
                          </div>
                          <Text color="#817e7e" mt={3}>
                            {item.prospect_company}
                          </Text>
                        </Flex>
                      </Box>
                      <Box px={15} py={12} w={"100%"}>
                        <Flex justify={"space-between"}>
                          <Text color="#817e7e" fw={600}>
                            {item?.last_message_from_prospect?.includes("no response yet.") ? "Last Message From You:" : "Last Message From Prospect:"}
                          </Text>
                          <Text color="#817e7e">{item.last_message_timestamp}</Text>
                        </Flex>
                        <Box
                          bg={
                            value === "sent"
                              ? "#e7f5ff"
                              : value === "open"
                              ? "#ffedff"
                              : value === "reply"
                              ? "#fff5ee"
                              : value === "pos_reply"
                              ? "#F6E4FF"
                              : "#e2f6e7"
                          }
                          p={20}
                          mt={15}
                          style={{
                            borderRadius: "10px",
                          }}
                        >
                          <Text fw={500}>
                            {item?.last_message_from_prospect?.includes("no response yet.")
                              ? item?.last_message_from_prospect.split("no response yet.###")[1]
                              : item?.last_message_from_prospect}
                          </Text>
                        </Box>
                      </Box>
                    </Flex>
                  </Group>
                );
              })}
            </Flex>
          </ScrollArea>
        </Modal.Body>
      </Modal>
    );
  };

  const handleChannelOpen = async (type: string, id: number, campaign_name: string) => {
    setValue(type);
    setCampaignName(campaign_name);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${userToken}`);

    var requestOptions: any = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(`${API_URL}/analytics/get_campaign_drilldown/${id}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        channelOpen();

        const parsedResult = JSON.parse(result).analytics;
        parsedResult.forEach((item: any) => {
          if (item?.last_message_from_prospect?.includes("no response yet.")) {
            item.no_response_yet = true;
          } else {
            item.no_response_yet = false;
          }
        });
        setCampaignList(parsedResult);

        setCampaignList(JSON.parse(result).analytics);
      })
      .catch((error) => console.log("error", error));
  };

  const filteredCampaignList = useMemo(() => {
    if (value === "sent") {
      return campaignList?.filter((item: any) => item.to_status === "SENT_OUTREACH");
    } else if (value === "open") {
      return campaignList?.filter((item: any) => item.to_status === "ACCEPTED" || item.to_status === "EMAIL_OPENED");
    } else if (value === "reply") {
      return campaignList?.filter(
        (item: any) => item.to_status.includes("ACTIVE_CONVO") // will catch all active convo statuses
      );
    } else if (value === "demo") {
      return campaignList?.filter((item: any) => item.to_status === "DEMO_SET");
    } else if (value === "pos_reply") {
      return campaignList?.filter((item: any) => ["ACTIVE_CONVO_SCHEDULING", "ACTIVE_CONVO_NEXT_STEPS", "ACTIVE_CONVO_QUESTION"].includes(item.to_status));
    }
  }, [value, campaignList]);

  const unusedProspects = (props.project?.num_unused_email_prospects ?? 0) + (props.project?.num_unused_li_prospects ?? 0);

  // Calculate the completion percentage as following:
  // Numerator: Number of successful sends to prospects on active channels
  // Denominator: Total number of eligible prospects on active channels
  let liNumerator = 0;
  let liDenominator = 0;
  let linkedinCompletionPercentage;
  console.log(props.persona.name, props.persona);
  if (props.persona.total_prospects_left_linkedin == 0 && props.persona.li_sent > 0) {
    // LI: If we have no more eligible prospects and we've sent some messages, then we can assume LI is complete
    liNumerator += props.persona.li_used;
    liDenominator += props.persona.li_used;
  } else if (props.persona.li_sent) {
    // LI: Otherwise if we have prospects left and have sent messages, then we calculate the completion percentage
    liNumerator += props.persona.li_used;
    liDenominator += props.persona.li_used + props.persona.total_prospects_left_linkedin;
  } else if (props.persona.li_queued && props.persona.linkedin_active) {
    liNumerator += props.persona.li_sent ? props.persona.li_used : 0; // This is weird logic. It checks to make sure that we don't count the LI used if we haven't sent any messages yet. Usually happens at the beginning of campaigns.
    liDenominator += props.persona.li_used + props.persona.total_prospects_left_linkedin;
  }
  linkedinCompletionPercentage = Math.min(100, Math.floor((liNumerator / liDenominator) * 100)) || 0;

  let emailNumerator = 0;
  let emailDenominator = 0;
  let emailCompletionPercentage;
  if (props.persona.total_prospects_left_email == 0 && props.persona.email_sent > 0) {
    // Email: If we have no more eligible prospects and we've sent some messages, then we can assume Email is complete
    emailNumerator += props.persona.email_used;
    emailDenominator += props.persona.email_used;
  } else if (props.persona.email_sent) {
    // Email: Otherwise if we have prospects left and have sent messages, then we calculate the completion percentage
    emailNumerator += props.persona.email_used;
    emailDenominator += props.persona.email_used + props.persona.total_prospects_left_email;
  }
  emailCompletionPercentage = Math.min(100, Math.floor((emailNumerator / emailDenominator) * 100)) || 0;

  let completionNumerator = 0;
  let completionDenominator = 0;
  if (props.persona.linkedin_active || props.persona.total_prospects_left_linkedin == 0) {
    // LI: If this channel is active or we have no more prospects left, then we include it in the completion percentage
    completionNumerator += liNumerator;
    completionDenominator += liDenominator;
  }
  if (
    // Email: If this channel is active or we have no more prospects left, then we include it in the completion percentage
    props.persona.email_active ||
    props.persona.total_prospects_left_email == 0
  ) {
    completionNumerator += emailNumerator;
    completionDenominator += emailDenominator;
  }
  const completionPercentage = Math.min(100, Math.floor((completionNumerator / completionDenominator) * 100)) || 0;
  let numberOfRings = 0;
  if (linkedinCompletionPercentage > 0 || props.persona.linkedin_active) numberOfRings++;
  if (emailCompletionPercentage > 0 || props.persona.email_active) numberOfRings++;
  if (numberOfRings === 0) numberOfRings = 1;
  let completionsActiveSpan = 12;
  if (linkedinCompletionPercentage > 0 && emailCompletionPercentage > 0) {
    completionsActiveSpan = 6;
  }

  const [tieopened, setTieOpened] = useState(false);

  const [strategies, setStrategies] = useState([]);

  const { getAllStrategies } = useStrategiesApi(userToken);

  const handleStrategy = async () => {
    setTieOpened(!tieopened);
    const response = await getAllStrategies();
    setStrategies(response);
  };

  return (
    <Paper ref={ref} id="child">
      <ChannelModal />
      <Stack
        spacing={0}
        sx={{
          cursor: "pointer",
        }}
      >
        <Group
          // position="apart"
          sx={(theme) => ({
            backgroundColor: isMyCampaign ? "" : theme.colors.gray[1],
            borderRadius: "0.5rem 0.5rem 0 0",
            border: "solid 1px " + theme.colors.gray[2],
            position: "relative",
            flexWrap: "nowrap",
          })}
          // p={'4px'}
          pl="xs"
          pr="xs"
          spacing={0}
        >
          <Group sx={{ width: "130px", padding: "0 4px" }}>
            <Flex
              onClick={() => {
                navigateToPage(navigate, `/contacts`, new URLSearchParams(`?campaign_id=${props.persona.id}`));
              }}
              mt={5}
              w={"100%"}
              gap={"5px"}
              align={"center"}
            >
              <Popover
                width={340 * numberOfRings}
                position="right"
                withArrow
                withinPortal
                shadow="md"
                opened={popoverOpened}
                styles={{
                  dropdown: {
                    pointerEvents: "none",
                    border: "2px solid #228be6",
                    borderRadius: "8px",
                  },
                  arrow: {
                    border: "2px solid #228be6",
                  },
                }}
              >
                <Popover.Target>
                  {/* <Button variant="outline" radius="xl" size="sm" h={55} color="gray" sx={{ border: "solid 1px #f1f1f1" }} maw={"fit-content"}> */}
                  <Flex align={"center"} gap={"xs"}>
                    <RingProgress
                      onMouseEnter={openPopover}
                      onMouseLeave={closePopover}
                      size={35}
                      thickness={3}
                      label={
                        // <Text size="xs" align="center">
                        //   {completionPercentage}%
                        // </Text>
                        <IconPoint color="white" fill="#F1F3F5" className="mt-2" />
                      }
                      variant="animated"
                      sections={[
                        {
                          value: completionPercentage,
                          color: completionPercentage >= 100 ? "green" : "blue",
                        },
                      ]}
                    />
                    {/* </Button> */}
                    <Text size="xs" fw={600} color="gray" align="center">
                      {completionPercentage}%
                    </Text>
                  </Flex>
                </Popover.Target>
                <Popover.Dropdown>
                  <Flex gap={"lg"} align={"center"}>
                    {/* Empty State */}
                    {linkedinCompletionPercentage === 0 && emailCompletionPercentage === 0 && !props.persona.linkedin_active && !props.persona.email_active && (
                      <Flex align="center" justify={"center"} w="100%">
                        <Text size="sm" color="gray">
                          No channels have been activated yet
                        </Text>
                      </Flex>
                    )}

                    {/* LinkedIn */}
                    {(linkedinCompletionPercentage > 0 || props.persona.linkedin_active) && (
                      <CampaignProgressDropdown
                        persona={props.persona}
                        numerator={liNumerator}
                        denominator={liDenominator}
                        completionPercentage={linkedinCompletionPercentage}
                        channel="LINKEDIN"
                      />
                    )}
                    {(linkedinCompletionPercentage > 0 || props.persona.linkedin_active) && (emailCompletionPercentage > 0 || props.persona.email_active) && (
                      <Divider orientation="vertical" />
                    )}

                    {/* Email */}
                    {(emailCompletionPercentage > 0 || props.persona.email_active) && (
                      <CampaignProgressDropdown
                        persona={props.persona}
                        numerator={emailNumerator}
                        denominator={emailDenominator}
                        completionPercentage={emailCompletionPercentage}
                        channel="EMAIL"
                      />
                    )}
                  </Flex>
                </Popover.Dropdown>
              </Popover>
              <Popover width={350} position="bottom" shadow="lg" opened={statuspopoverOpened}>
                <Popover.Target>
                  <Box>
                    <Badge
                      size="xs"
                      color={
                        props.persona.setup_status == "SETUP"
                          ? "yellow"
                          : props.persona.setup_status == "ACTIVE"
                          ? "blue"
                          : props.persona.setup_status == "INACTIVE"
                          ? "red"
                          : "gray"
                      }
                      onMouseEnter={statusopenPopover}
                      onMouseLeave={statusclosePopover}
                    >
                      {props.persona.setup_status}
                    </Badge>
                    {!!props.persona.smartlead_campaign_id && (
                      <Tooltip label="This email campaign is set up correctly." withArrow>
                        <Badge size="xs" color={"violet"} ml="4px">
                          {"🔗"}
                        </Badge>
                      </Tooltip>
                    )}
                  </Box>
                </Popover.Target>
                <Popover.Dropdown sx={{ borderRadius: "8px" }} p={"xl"}>
                  <Flex gap={"sm"} align={"center"}>
                    <IconLoader color="#228be6" />{" "}
                    <Text fw={700} size={"lg"}>
                      Campaign Status Overview
                    </Text>
                  </Flex>
                  <Box mt={"md"}>
                    <Flex align={"center"} gap={"5px"}>
                      <Flex w={"fit-content"}>
                        <Text tt={"uppercase"} w={"100%"} fw={600}>
                          prospecting
                        </Text>
                      </Flex>
                      <Divider w={"100%"} />
                      <Flex w={"fit-content"}>
                        <IconCircleCheck color="white" size={"1.2rem"} fill="green" />
                      </Flex>
                    </Flex>
                    <Text color="gray" size={"xs"}>
                      Find prospects.
                    </Text>
                  </Box>
                  <Box mt={"sm"}>
                    <Flex align={"center"} gap={"5px"}>
                      <Flex w={"fit-content"}>
                        <Text tt={"uppercase"} w={"160px"} fw={600}>
                          linkedin sequence
                        </Text>
                      </Flex>
                      <Divider w={"100%"} />
                      <Flex w={"fit-content"}>
                        <IconCircleCheck color="white" size={"1.2rem"} fill="green" />
                      </Flex>
                    </Flex>
                    <Text color="gray" size={"xs"}>
                      Create linkedin sequence.
                    </Text>
                  </Box>
                  <Box mt={"sm"}>
                    <Flex align={"center"} gap={"5px"}>
                      <Flex w={"fit-content"}>
                        <Text tt={"uppercase"} w={"135px"} fw={600}>
                          email sequence
                        </Text>
                      </Flex>
                      <Divider w={"100%"} />
                      <Flex w={"fit-content"}>
                        <IconCircleCheck color="white" size={"1.2rem"} fill="green" />
                      </Flex>
                    </Flex>
                    <Text color="gray" size={"xs"}>
                      Create email sequence.
                    </Text>
                  </Box>
                  <Box mt={"sm"}>
                    <Flex align={"center"} gap={"5px"}>
                      <Flex w={"fit-content"}>
                        <Text tt={"uppercase"} w={"100%"} fw={600}>
                          verification
                        </Text>
                      </Flex>
                      <Divider w={"100%"} />
                      <Flex w={"fit-content"}>
                        <IconCircleCheck color="white" size={"1.2rem"} fill="green" />
                      </Flex>
                    </Flex>
                    <Text color="gray" size={"xs"}>
                      Verify prospects.
                    </Text>
                  </Box>
                </Popover.Dropdown>
              </Popover>
            </Flex>
          </Group>
          <Divider orientation="vertical" ml="xs" mr="xs" />
          <Group w={"350px"}>
            <Flex direction={"column"} w={"100%"}>
              <Flex gap={"xs"} justify={"space-between"}>
                <Flex gap={"xs"}>
                  <Popover position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Avatar
                        variant="transparent"
                        color={"gray"}
                        radius="xl"
                        size="sm"
                        sx={{
                          backgroundColor: "#ffffff22",
                          marginTop: "auto",
                          marginBottom: "auto",
                        }}
                      >
                        <Text fz="lg">{emoji}</Text>
                      </Avatar>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <EmojiPicker
                        onEmojiClick={(event: any, _: any) => {
                          const emoji = event.emoji;
                          setEmoji(emoji);
                        }}
                      />
                    </Popover.Dropdown>
                  </Popover>
                  <Tooltip label={props.persona.name + " - " + +total_sent + " / " + props.persona.total_prospects + " prospects sent"} withArrow>
                    <Box>
                      {props.persona.cycle && props.showCycles && (
                        <Badge size="xs" mt="xs" color={deterministicMantineColor(props.persona.cycle + "")}>
                          Cycle #{props.persona.cycle}
                        </Badge>
                      )}
                      <Text
                        mt={4}
                        fz={"xs"}
                        c={"gray.7"}
                        fw={600}
                        onClick={() => {
                          if (props.persona.sdr_id != userData?.id) return;

                          if (props.project) {
                            setCurrentProject(props.project);
                          }

                          if (props.persona.email_sent > props.persona.li_sent) {
                            window.location.href = `/campaign_v2/${props.persona.id}`;
                          } else {
                            window.location.href = `/campaign_v2/${props.persona.id}`;
                          }
                        }}
                      >
                        {props.persona.name.substring(0, 38)} {props.persona.name.length > 38 ? "..." : ""}
                      </Text>
                      {props.showAvatar && (
                        <Flex align="center">
                          <Avatar radius="xl" size="sm" src={props.persona.sdr_img_url}></Avatar>
                          <Text mt={2} fz={"xs"} c={"gray.5"}>
                            &nbsp; {props.persona.sdr_name}
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Tooltip>
                </Flex>
                <Box>
                  <Flex>
                    {/* {props.persona.li_sent > 0 && (
                      <ActionIcon
                        variant='subtle'
                        radius='md'
                        color={props.persona.active ? 'bliue' : 'gray'}
                        onClick={() => {
                          if (props.project == undefined) return;
                          setOpenedProspectId(-1);
                          setCurrentProject(props.project);
                          navigateToPage(navigate, `/setup/linkedin/${props.persona.id}`));
                        }}
                      >
                        <IconBrandLinkedin size='1rem' color={props.persona.active ? theme.colors.blue[6] : 'gray'} />
                      </ActionIcon>
                    )} */}
                    {/* {props.persona.email_sent > 0 && (
                      <ActionIcon
                        variant='subtle'
                        radius='md'
                        color={props.persona.active ? 'yellow' : 'gray'}
                        onClick={() => {
                          if (props.project == undefined) return;
                          setOpenedProspectId(-1);
                          setCurrentProject(props.project);
                          navigateToPage(navigate, `/setup/email/${props.persona.id}`));
                        }}
                      >
                        <IconMail size='1rem' color={props.persona.active ? theme.colors.yellow[6] : 'gray'} />
                      </ActionIcon>
                    )} */}
                  </Flex>

                  <Flex align={"center"}>
                    {props.persona.sdr_id == userData?.id && (
                      <ActionIcon
                        ml="0"
                        onClick={() => {
                          if (props.project == undefined) return;
                          setOpenedProspectId(-1);
                          setCurrentProject(props.project);
                          window.location.href = `/persona/settings?campaign_id=${props.persona.id}`;
                        }}
                      >
                        <IconEdit size="0.9rem" color="gray" />
                      </ActionIcon>
                    )}
                    {/* {props.persona.sdr_id == userData?.id && (
                      <Popover withArrow width={300} position="right" offset={{ mainAxis: 7, crossAxis: 16 }} opened={tieopened} onChange={setTieOpened}>
                        <Popover.Target>
                          <Badge
                            variant="filled"
                            size="sm"
                            mr="xs"
                            styles={{
                              inner: {
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: "lighter",
                              },
                            }}
                            onClick={handleStrategy}
                          >
                            <IconBulb size={"0.9rem"} />
                            <Text size={"xs"} mt={3}>
                              {4}
                            </Text>
                          </Badge>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <Flex align={"center"} gap={5}>
                            <IconTargetArrow size={"0.9rem"} color="#228be6" />
                            <Text color="gray" fw={500} size={"sm"}>
                              Tie to strategies:
                            </Text>
                          </Flex>
                          <Paper mt={"sm"} withBorder radius={"sm"} p={"sm"}>
                            <ScrollArea h={300}>
                              {strategies &&
                                strategies.map((item: any, index) => {
                                  return (
                                    <Checkbox
                                      label={item.title}
                                      mt={"sm"}
                                      size={"xs"}
                                      key={index}
                                      onClick={() => {
                                        if (item.title === "Khoa Testing 3" || item.title === "General Pul") alert("Attaching to 2 Strategies");
                                      }}
                                    />
                                  );
                                })}
                            </ScrollArea>
                          </Paper>
                          <Button fullWidth mt={"sm"} size="sm">
                            Save
                          </Button>
                        </Popover.Dropdown>
                      </Popover>
                    )} */}
                    {/* {
                      <Anchor
                        href={`/campaigns/${props.persona.id}`}
                        sx={{
                          fontSize: "10px",
                          marginLeft: "8px",
                        }}
                      >
                        🔎
                      </Anchor>
                    } */}
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </Group>
          <Divider orientation="vertical" />
          {/* <Group sx={{ flex: '6%' }}>
            <Flex>
              <Avatar src={props.persona.sdr_img_url} radius='xl' size='sm' />
              <Text size='xs' fw='450' mt='2px' ml='xs'>
                {props.persona.sdr_name.split(' ')[0]}
              </Text>
            </Flex>
          </Group> */}
          {/* <Divider orientation='vertical' ml='xs' mr='xs' /> */}
          <Flex h={"67px"}>
            <Flex
              w={"100%"}
              onClick={() => {
                handleChannelOpen("sent", props.persona.id, props.persona.name);
              }}
              bg={"#f9fbfe"}
            >
              <Flex w={"100%"} justify={"center"} h={"100%"} align={"center"}>
                <StatDisplay
                  color="blue"
                  width="w-[93px]"
                  icon={<IconSend color={theme.colors.blue[6]} size="0.9rem" />}
                  label="Sent"
                  total={total_sent ?? 0}
                  percentage={Math.floor(((total_sent ?? 0) / (total_sent || 1)) * 100)}
                  percentColor="#eaf3ff"
                  hoverColor="hover:bg-[#cadef9]"
                />
              </Flex>
            </Flex>
            <Divider orientation="vertical" />
            <Flex
              // w={'12%'}
              w={"100%"}
              onClick={() => {
                handleChannelOpen("open", props.persona.id, props.persona.name);
              }}
              bg={"#fdf9fe	"}
            >
              <Flex w={"100%"} justify={"center"} h={"100%"} align={"center"}>
                <StatDisplay
                  color="pink"
                  width="w-[93px]"
                  icon={<IconChecks color={theme.colors.pink[6]} size="0.9rem" />}
                  label="Open"
                  total={total_opened ?? 0}
                  percentage={Math.floor(((total_opened ?? 0) / (total_sent || 1)) * 100)}
                  percentColor="#ffeeff"
                  hoverColor="hover:bg-[#fbdefb]"
                />
              </Flex>
            </Flex>
            <Divider orientation="vertical" />
            <Flex
              // w={'12%'}
              w={"100%"}
              onClick={() => {
                handleChannelOpen("reply", props.persona.id, props.persona.name);
              }}
              bg={"#fffbf8"}
              p={0}
            >
              <Flex w={"100%"} justify={"center"} h={"100%"} align={"center"}>
                <StatDisplay
                  color="orange"
                  width="w-[93px]"
                  icon={<IconMessage color={theme.colors.orange[6]} size="0.9rem" />}
                  label="Reply"
                  total={total_replied ?? 0}
                  percentage={Math.floor(((total_replied ?? 0) / (total_opened || 1)) * 100)}
                  percentColor="#f9e7dc"
                  hoverColor="hover:bg-[#f8f3f0]"
                />
              </Flex>
            </Flex>
            <Divider orientation="vertical" />
            <Flex
              // w={'12%'}
              w={"100%"}
              onClick={() => {
                handleChannelOpen("pos_reply", props.persona.id, props.persona.name);
              }}
              bg={"#f8fbf9"}
            >
              <Flex w={"100%"} justify={"center"} h={"100%"} align={"center"}>
                <StatDisplay
                  color="#14B887"
                  width="w-[93px]"
                  icon={<IconMessage color={theme.colors.teal[6]} size="0.9rem" />}
                  label="(+)Reply"
                  total={total_pos_replied ?? 0}
                  percentage={Math.floor(((total_pos_replied ?? 0) / (total_replied || 1)) * 100)}
                  percentColor="#CFF1E7"
                  hoverColor="hover:bg-[#E8F6F2]"
                />
              </Flex>
            </Flex>
            <Divider orientation="vertical" />
            <Flex
              w={"100%"}
              // w={'12%'}
              onClick={() => {
                handleChannelOpen("demo", props.persona.id, props.persona.name);
              }}
              bg={"#f8fbf9"}
            >
              <Flex w={"100%"} justify={"center"} h={"100%"} align={"center"}>
                <StatDisplay
                  color="green"
                  width="w-[93px]"
                  icon={<IconCalendar color={theme.colors.green[6]} size="0.9rem" />}
                  label="Demo"
                  total={props.persona.total_demo ?? 0}
                  percentage={Math.floor(((props.persona.total_demo ?? 0) / (total_pos_replied || 1)) * 100)}
                  percentColor="#e2f6e7"
                  hoverColor="hover:bg-[#d9f5e0]"
                />
              </Flex>
            </Flex>
          </Flex>
          <Divider orientation="vertical" mr="xs" />
          <Flex w={"93px"} gap={"sm"} justify={"center"}>
            {/* <Button
                w={60}
                radius="xl"
                size="xs"
                compact
                mt={"auto"}
                sx={(theme) => ({
                  color: theme.colors.blue[6],
                  backgroundColor: theme.colors.blue[0],
                })}
                onClick={() => {
                  if (props.project == undefined) return;
                  setOpenedProspectId(-1);
                  setCurrentProject(props.project);
                  window.location.href = `/persona/settings?campaign_id=${props.persona.id}`;
                }}
              >
                Edit
              </Button> */}

            <Group noWrap>
              <Stack spacing={5}>
                <Center>
                  <ThemeIcon size="xs" color={props.persona.email_active ? undefined : "gray.4"}>
                    <IconMail style={{ width: "90%", height: "90%" }} />
                  </ThemeIcon>
                </Center>
                <UserStatusToggle
                  projectId={props.persona.id}
                  isActive={props.persona.email_active}
                  onChangeUserStatusSuccess={(status: boolean) => {
                    const result = postTogglePersonaActive(userToken, props.persona.id, "email", !props.persona.email_active).then((res) => {
                      // setPersonaActive(status);
                      props.onPersonaActiveStatusUpdate?.(props.persona?.id ?? 0, status);
                    });
                  }}
                />
              </Stack>
              <Stack spacing={5}>
                <Center>
                  <ThemeIcon size="xs" color={props.persona.linkedin_active ? undefined : "gray.4"}>
                    <IconBrandLinkedin style={{ width: "90%", height: "90%" }} />
                  </ThemeIcon>
                </Center>
                <UserStatusToggle
                  projectId={props.persona.id}
                  isActive={props.persona.linkedin_active}
                  onChangeUserStatusSuccess={(status: boolean) => {
                    const result = postTogglePersonaActive(userToken, props.persona.id, "linkedin", !props.persona.linkedin_active).then((res) => {
                      // setPersonaActive(status);
                      props.onPersonaActiveStatusUpdate?.(props.persona?.id ?? 0, status);
                    });
                  }}
                />
              </Stack>
            </Group>
          </Flex>
          <Divider orientation="vertical" ml="xs" mr="xs" />
          <Flex w={"5%"} align={"center"} direction={"column"} justify={"center"}>
            {/* <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            >
            </Box> */}
            {/* <Stack pb={5}>
              <Center>
                <Badge size='xs' color={props.persona.active ? 'blue' : 'gray'}>
                  {props.persona.active ? 'Active' : 'Inactive'}
                </Badge>
                {!!props.persona.smartlead_campaign_id && (
                  <Tooltip label='Synced with SmartLead' withArrow>
                    <Badge size='xs' color={'violet'}>
                      {'Synced'}
                    </Badge>
                  </Tooltip>
                )}
              </Center>
            </Stack> */}

            <Stack>
              <Center>
                <ActionIcon
                  color={props.persona?.sdr_id === userData?.id ? "blue" : "gray"}
                  sx={{
                    opacity: props.persona?.sdr_id === userData?.id ? 1 : 0.5,
                  }}
                  variant="filled"
                  radius="lg"
                  onClick={() => {
                    if (props.persona?.sdr_id === userData?.id) {
                      toggle();
                    } else {
                      showNotification({
                        title: "You cannot edit this campaign",
                        message: "You are not the owner of this campaign",
                        color: "gray",
                        autoClose: 5000,
                      });
                    }
                  }}
                >
                  {opened ? <IconChevronUp size="1.1rem" /> : <IconChevronDown size="1.1rem" />}
                </ActionIcon>
              </Center>
            </Stack>
          </Flex>
        </Group>
        <Collapse in={opened}>
          {props.viewMode === "node-view" && (
            <Box>
              <CampaignGraph
                emailToLinkedinConnectionType={props.persona.email_to_linkedin_connection}
                personaId={props.persona.id}
                unusedProspects={`${unusedProspects}/${props.project?.num_prospects ?? 0}`}
                sections={types}
                onChannelClick={(sectionType: string) => {
                  if (props.project == undefined) return;
                  setOpenedProspectId(-1);
                  setCurrentProject(props.project);
                  navigateToPage(navigate, `/campaign_v2/${sectionType.toLowerCase()}/${props.persona.id}`);
                }}
              />
            </Box>
          )}
          {props.viewMode === "list-view" && (
            <Box>
              {types.map((section, index) => {
                if (!section.active && props.persona.active) return null;

                return (
                  <Box key={index}>
                    {index > 0 && <Divider mb="xs" />}
                    <PersonCampaignCardSection
                      section={section}
                      onClick={() => {
                        if (props.project == undefined) return;
                        setOpenedProspectId(-1);
                        setCurrentProject(props.project);
                        navigateToPage(navigate, `/campaign_v2/${section.type.toLowerCase()}/${props.persona.id}`);
                      }}
                    />
                  </Box>
                );
              })}
              {props.persona.active && (
                <>
                  <Collapse in={inactiveChannelsOpened}>
                    {types.map((section, index) => {
                      if (section.active) return null;

                      return (
                        <Box key={index}>
                          {index > 0 && <Divider mb="xs" />}
                          <PersonCampaignCardSection
                            section={section}
                            onClick={() => {
                              if (props.project == undefined) return;
                              setOpenedProspectId(-1);
                              setCurrentProject(props.project);
                              navigateToPage(navigate, `/campaign_v2/${section.type.toLowerCase()}/${props.persona.id}`);
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Collapse>
                  <Divider mb="xs" />
                  <Button
                    w="100%"
                    variant="subtle"
                    size="xs"
                    color="gray"
                    onClick={() => setInactiveChannelsOpened(!inactiveChannelsOpened)}
                    leftIcon={inactiveChannelsOpened ? <IconArrowUp size="0.7rem" /> : <IconArrowDown size="0.7rem" />}
                  >
                    {inactiveChannelsOpened ? "Hide" : "Show"} {types.filter((x) => !x.active).length} Inactive Channel
                    {types.filter((x) => !x.active).length > 1 ? "s" : ""}
                  </Button>
                </>
              )}
            </Box>
          )}
        </Collapse>
      </Stack>
    </Paper>
  );
}

function CampaignProgressDropdown(props: {
  persona: CampaignPersona;
  numerator: number;
  denominator: number;
  completionPercentage: number;
  channel: "LINKEDIN" | "EMAIL";
}) {
  let channel;
  let channel_total_prospect;
  let total_usabled;
  let total_used;
  let total_queued;
  let total_sent;
  let total_prospected;
  let total_opened;
  let total_replied;
  let total_demo;
  let total_other;
  if (props.channel === "LINKEDIN") {
    channel = "LinkedIn";
    channel_total_prospect = props.persona.li_eligible;
    total_usabled = props.persona.total_prospects_left_linkedin;
    total_used = props.persona.li_used;
    total_queued = props.persona.li_queued;
    total_sent = props.persona.li_sent;
    total_prospected = props.persona.li_eligible;
    total_opened = props.persona.li_opened;
    total_replied = props.persona.li_replied;
    total_demo = props.persona.li_demo;
    total_other = props.persona.li_failed + props.persona.li_removed;
  } else if (props.channel === "EMAIL") {
    channel = "Email";
    channel_total_prospect = props.persona.email_eligible;
    total_usabled = props.persona.total_prospects_left_email;
    total_used = props.persona.email_used;
    total_queued = props.persona.email_queued;
    total_sent = props.persona.email_sent;
    total_prospected = props.persona.email_eligible;
    total_opened = props.persona.email_opened;
    total_replied = props.persona.email_replied;
    total_demo = props.persona.email_demo;
    total_other = props.persona.email_bounced + props.persona.email_removed;
  } else {
    return <></>;
  }

  return (
    <Flex direction="column" miw={"300px"} px="md" py="sm">
      <Box mt={"2px"}>
        <Flex align={"center"} gap={"sm"}>
          {props.channel === "EMAIL" ? (
            <IconMail fill="orange" color="white" size={"1.2rem"} style={{ marginBottom: "1px" }} />
          ) : (
            <IconBrandLinkedin fill="#228be6" color="white" size={"1.2rem"} style={{ marginBottom: "1px" }} />
          )}
          <Text fw={700}>{channel} Summary</Text>
        </Flex>
        <Flex align={"center"} gap={"sm"} mt={"sm"}>
          <Progress w={"100%"} color={props.completionPercentage === 100 ? "green" : "blue"} value={props.completionPercentage} />
          <Text fw={500} sx={{ whiteSpace: "nowrap" }}>
            {props.completionPercentage}%
          </Text>
        </Flex>
        <Text fw={500} size={"sm"} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {props.numerator} / {props.denominator}
          <span style={{ color: "gray" }}>Sent</span>
        </Text>
      </Box>

      <Box mt={"md"}>
        <Text size={"md"} fw={700}>
          SUMMARY
        </Text>
      </Box>

      <List mt={"xs"}>
        <Flex align={"center"} justify={"space-between"}>
          <List.Item sx={{ color: "gray", fontSize: "14px" }}>{channel} Sourced:</List.Item>
          <Text fw={600} size={"sm"}>
            {channel_total_prospect}
          </Text>
        </Flex>
        <Flex align={"center"} justify={"space-between"}>
          <List.Item sx={{ color: "gray", fontSize: "14px" }}>{channel} Usable:</List.Item>
          <Text fw={600} size={"sm"}>
            {total_usabled}
          </Text>
        </Flex>
        <Flex align={"center"} justify={"space-between"}>
          <List.Item sx={{ color: "gray", fontSize: "14px" }}>Total Used:</List.Item>
          <Text fw={600} size={"sm"}>
            {total_used}
          </Text>
        </Flex>
      </List>

      <Divider my={"sm"} />
      <Divider my={"sm"} />

      <List>
        <Flex align={"center"} justify={"space-between"}>
          <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
            Queued:
          </List.Item>
          <Text fw={600} size={"sm"}>
            {total_queued}
          </Text>
        </Flex>
      </List>

      <Divider my={"sm"} />

      <Box>
        <Text size={"md"} fw={700}>
          BY STATUS
        </Text>

        <List mt={"xs"}>
          <Flex align={"center"} justify={"space-between"}>
            <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
              Prospected:
            </List.Item>
            <Text fw={600} size={"sm"}>
              {total_prospected}
            </Text>
          </Flex>
          <Flex align={"center"} justify={"space-between"}>
            <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
              Sent:
            </List.Item>
            <Text fw={600} size={"sm"}>
              {total_sent}
            </Text>
          </Flex>
          <Flex align={"center"} justify={"space-between"}>
            <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
              Opened:
            </List.Item>
            <Text fw={600} size={"sm"}>
              {total_opened}
            </Text>
          </Flex>
          <Flex align={"center"} justify={"space-between"}>
            <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
              Replies:
            </List.Item>
            <Text fw={600} size={"sm"}>
              {total_replied}
            </Text>
          </Flex>
          <Flex align={"center"} justify={"space-between"}>
            <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
              Demo Set:
            </List.Item>
            <Text fw={600} size={"sm"}>
              {total_demo}
            </Text>
          </Flex>
          <Flex align={"center"} justify={"space-between"}>
            <List.Item sx={{ color: "gray", fontSize: "14px" }} fw={500}>
              Others:
            </List.Item>
            <Text fw={600} size={"sm"}>
              {total_other}
            </Text>
          </Flex>
        </List>
      </Box>
    </Flex>
  );
}

function PersonCampaignCardSection(props: { section: ChannelSection; onClick?: () => void }) {
  const theme = useMantineTheme();
  const [checked, setChecked] = useState(props.section.active);

  return (
    <>
      <Group
        position="apart"
        p="xs"
        spacing={0}
        onClick={props.onClick}
        sx={{
          cursor: "pointer",
        }}
      >
        <Box sx={{ flexBasis: "30%" }}>
          <Group spacing={8}>
            <ActionIcon color="blue" radius="xl" variant="light" size="sm">
              {props.section.icon}
            </ActionIcon>
            <Text>{formatToLabel(props.section.type)}</Text>
          </Group>
        </Box>

        <Box sx={{ flexBasis: "30%" }}>
          <Group>
            <Text fz="xs" color="gray" w="93px">
              <IconSend size="0.8rem" /> Sent: <span style={{ color: "black" }}>{props.section.sends}</span>
            </Text>
            <Text fz="xs" color="gray" w="93px">
              <IconChecks size="0.8rem" /> Opens: <span style={{ color: "black" }}>{props.section.opens}</span>
            </Text>
            <Text fz="xs" color="gray" w="93px">
              <IconMessageCheck size="0.8rem" /> Replies: <span style={{ color: "black" }}>{props.section.replies}</span>
            </Text>
          </Group>
        </Box>
        <Box sx={{ flexBasis: "20%", color: "gray" }}>
          <Text fz="xs" span>
            <IconCalendar size="0.8rem" /> {convertDateToShortFormatWithoutTime(new Date(props.section.date))}
          </Text>
        </Box>
        <Box sx={{ flexBasis: "10%" }}>
          <Group>
            <Switch
              checked={checked}
              onChange={(event) => {
                setChecked(event.currentTarget.checked);
              }}
              color="teal"
              size="xs"
              thumbIcon={
                checked ? (
                  <IconCheck size="0.6rem" color={theme.colors.teal[theme.fn.primaryShade()]} stroke={3} />
                ) : (
                  <IconX size="0.6rem" color={theme.colors.red[theme.fn.primaryShade()]} stroke={3} />
                )
              }
            />
            <ActionIcon size="sm" radius="xl">
              <IconEdit size="0.875rem" />
            </ActionIcon>
          </Group>
        </Box>
      </Group>
    </>
  );
}

function StatModalDisplay(props: {
  color: MantineColor;
  icon: ReactNode;
  label: string;
  percentcolor: MantineColor;
  total: number;
  percentage: number;
  border: string;
}) {
  return (
    <Stack
      spacing={0}
      py={10}
      style={{
        border: props.border ? `2.8px solid ${props.color}` : "2px solid #e9ecef",
        borderRadius: props.border ? "5px" : "0px",
      }}
    >
      <Group spacing={5} sx={{ justifyContent: "center" }}>
        <Tooltip label={props.percentage + "% conversion"} withArrow withinPortal>
          <Flex gap={8} align={"center"}>
            {props.icon}
            <Text c="gray.7" fz={"16px"}>
              {props.label}:
            </Text>
            <Text color={props.color} fz={"16px"} fw={500}>
              {props.total.toLocaleString()}
            </Text>
            <Text fz={"12px"} color={props.color} bg={props.percentcolor} style={{ borderRadius: "20px" }} px={"10px"}>
              {/* percentage */}
              {props.percentage}%
            </Text>
          </Flex>
        </Tooltip>
      </Group>
    </Stack>
  );
}

function StatDisplay(props: {
  color: MantineColor;
  width: string;
  icon: ReactNode;
  label: string;
  total: number;
  percentage: number;
  percentColor: MantineColor;
  hoverColor: string;
}) {
  return (
    <div className={`${props.hoverColor} ${props.width} rounded-md px-2 py-1 h-full`}>
      <Stack spacing={0} h={"100%"}>
        <Flex justify="center" gap="xl" align={"center"} h={"100%"}>
          <Tooltip label={props.percentage + "% conversion"} withArrow withinPortal>
            <Flex align={"center"} gap={4}>
              <Text color={props.color} fz="md" fw={500}>
                {props.total.toLocaleString()}
              </Text>
              <Text size="8px" color={props.color} bg={props.percentColor} py={2} px={4} style={{ borderRadius: "8px" }}>
                {/* percentage */}
                {props.percentage}%
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
        {/* <Flex>
          <Box mt='1px'>{props.icon}</Box>
          <Text c='gray.7' fz='xs' ml='4px'>
            {props.label}
          </Text>
        </Flex> */}
      </Stack>
    </div>
  );
}

export const PersonCampaignTable = (props: {
  showAvatar?: boolean;
  filteredProjects: CampaignPersona[];
  projects?: PersonaOverview[];
  campaignViewMode: "node-view" | "list-view";
  showCycles?: boolean;
  onPersonaActiveStatusUpdate?: (id: number, active: boolean) => void;
  hideHeader?: boolean;
}) => {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState(-1);

  const [cycleModeShowCycleIds, setCycleModeShowCycleIds]: any = useState([]);

  const [sort, setSort] = useState<"asc" | "desc">("desc");
  let tempData = useMemo(() => {
    if (sort === "asc") {
      return props.filteredProjects.sort((a, b) => (moment(a.created_at).isAfter(moment(b.created_at)) ? 1 : -1));
    } else {
      return props.filteredProjects.sort((a, b) => (moment(a.created_at).isAfter(moment(b.created_at)) ? -1 : 1));
    }
  }, [sort]);

  if (props.filteredProjects.length === 0) {
    return null;
  }

  let data = tempData;
  if (!data || data.length === 0) {
    data = props.filteredProjects;
  }

  if (props.showCycles) {
    data = data.sort((a: any, b: any) => {
      return a.cycle - b.cycle;
    });
  }

  return (
    <Box miw={1200} sx={{ overflow: "scroll" }}>
      <Modal opened={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)} title="Campaign Analytics" size="1000px">
        <iframe
          src={
            // Retool Editor Link: https://sellscale.retool.com/editor/dad1b002-118a-11ef-a07e-3b006f65cecb/SellScale%20Sight%20Components/Cycle%20Analytics%20Popup#authToken=[token]&cycle=[cycle_id]
            "https://sellscale.retool.com/embedded/public/3e03c40e-b862-4bda-a4d1-ecfade8bcfd2#authToken=" + userToken + "&cycle=" + selectedCycleId
          }
          width="100%"
          height="600px"
          frameBorder="0"
          title="Campaign Analytics"
        ></iframe>
      </Modal>
      <Paper radius="md">
        <Group
          id="dssss"
          sx={(theme) => ({
            backgroundColor: "white", //props.persona.active ? theme.colors.blue[6] : 'white',
            borderRadius: "0.5rem 0.5rem 0 0",
            border: "solid 1px " + theme.colors.gray[2],
            position: "relative",
          })}
          display={props.hideHeader ? "none" : "flex"}
          // py={'md'}
          pl="xs"
          pr="xs"
          spacing={0}
        >
          <Flex w={"130px"} justify={"center"} align={"center"} gap={"xs"}>
            <Flex>
              <IconLoader size={"0.9rem"} color="gray" />
            </Flex>
            <Text fw={600} color="gray.8" fz="sm" style={{ display: "flex", justifyContent: "center" }}>
              Contacts
            </Text>
          </Flex>
          <Divider orientation="vertical" ml="xs" mr="xs" />
          <Flex
            style={{ cursor: "pointer" }}
            w={"350px"}
            align={"center"}
            justify={"center"}
            gap={"xs"}
            onClick={() => setSort((s) => (s === "asc" ? "desc" : "asc"))}
          >
            <Flex>
              <IconTargetArrow size={"0.9rem"} color="gray" />
            </Flex>
            <Text fw={600} color="gray.8" fz="sm">
              Campaigns
            </Text>
          </Flex>

          <Divider orientation="vertical" />

          <Flex>
            <Box w={"100%"} bg={"#f9fbfe"}>
              <Flex align={"center"} h={"100%"} justify={"center"} gap={4} mb={"xl"} w={"93px"}>
                <IconSend color={theme.colors.blue[6]} size="0.9rem" />
                <Text size={"sm"}>Sent</Text>
              </Flex>
            </Box>
            <Divider orientation="vertical" />
            <Box w={"100%"} bg={"#fdf9fe"}>
              <Flex align={"center"} h={"100%"} justify={"center"} gap={4} mb={"xl"} w={"93px"}>
                <IconChecks color={theme.colors.pink[6]} size="0.9rem" />
                <Text size={"sm"}>Open</Text>
              </Flex>
            </Box>
            <Divider orientation="vertical" />
            <Box
              // w={'15%'}
              w={"100%"}
              bg={"#fffbf8"}
            >
              <Flex align={"center"} h={"100%"} justify={"center"} gap={4} mb={"xl"} w={"93px"}>
                <IconMessage color={theme.colors.orange[6]} size="0.9rem" />
                <Text size={"sm"}>Reply</Text>
              </Flex>
            </Box>
            <Divider orientation="vertical" />
            <Box
              // w={'15%'}
              w={"100%"}
              bg={"#f8fbf9"}
            >
              <Flex align={"center"} h={"100%"} justify={"center"} gap={4} mb={"xl"} w={"93px"}>
                <IconMessage color={theme.colors.teal[6]} size="0.9rem" />
                <Text size={"sm"}>(+)Reply</Text>
              </Flex>
            </Box>
            <Divider orientation="vertical" />
            <Box
              // w={'15%'}
              w={"100%"}
              bg={"#f8fbf9"}
            >
              <Flex align={"center"} h={"100%"} justify={"center"} gap={4} mb={"xl"} w={"93px"}>
                <IconCalendar color={theme.colors.green[6]} size="0.9rem" />
                <Text size={"sm"}>Demo</Text>
              </Flex>
            </Box>
            <Divider orientation="vertical" />
          </Flex>

          <Flex w={"112px"} align={"center"} justify={"center"} gap={"sm"}>
            {/* <Text fw={600} color='gray.8' fz='sm'>
              Details
            </Text> */}
            <Group noWrap>
              <IconToggleRight size={"0.8rem"} color="gray" />
              <Text size={"sm"}>Channels</Text>
            </Group>
          </Flex>
          <Divider orientation="vertical" />
          <Flex w={"100px"} align={"center"} justify={"center"}>
            <div className="w-full"></div>
          </Flex>
        </Group>
      </Paper>
      {data
        .sort((a: any, b: any) => {
          if (a.cycle && b.cycle) {
            return -(a.cycle - b.cycle);
          }
          if (a.cycle) {
            return -1;
          }
          if (b.cycle) {
            return 1;
          }
          return 0;
        })
        .map((persona: any, index) => (
          <>
            {props.showCycles && ((persona.cycle && index === 0) || (index > 0 && data[index - 1].cycle && data[index - 1].cycle !== persona.cycle))
              ? [
                  <Card
                    withBorder
                    key={index}
                    onClick={() => {
                      if (persona.cycle) {
                        if (cycleModeShowCycleIds.includes(persona.cycle)) {
                          setCycleModeShowCycleIds(cycleModeShowCycleIds.filter((id: any) => id !== persona.cycle));
                        } else {
                          setCycleModeShowCycleIds([...cycleModeShowCycleIds, persona.cycle]);
                        }
                      }
                    }}
                  >
                    <Flex>
                      <Indicator size={6} color={deterministicMantineColor(persona.cycle + "")}>
                        <Title order={4}>Cycle {persona.cycle}</Title>
                      </Indicator>
                      <Avatar.Group ml="20px">
                        {
                          // loop through first 3 personas in the cycle
                          data
                            .filter((p) => p.cycle === persona.cycle)
                            .slice(0, 4)
                            .map((p, i) => (
                              <Avatar key={i} src={"https://ui-avatars.com/api/?background=efefef&name=" + p.emoji} sx={{ borderRadius: "100%" }} />
                            ))
                        }
                        {
                          // if list > 4 then add a +1 avatar
                          data.filter((p) => p.cycle === persona.cycle).length > 4 ? (
                            <Avatar>+{data.filter((p) => p.cycle === persona.cycle).length - 4}</Avatar>
                          ) : null
                        }
                      </Avatar.Group>

                      <Button
                        color="grape"
                        leftIcon={<IconChartArcs size="0.9rem" />}
                        size="xs"
                        variant="outline"
                        ml="auto"
                        compact
                        mr="xs"
                        onClick={() => {
                          setShowAnalyticsModal(true);
                          setSelectedCycleId(persona.cycle);
                        }}
                      >
                        View Analytics
                      </Button>
                      <Badge
                        color={
                          // if active campaigns > 0 then green else gray
                          data.filter((p) => p.cycle === persona.cycle && p.active).length > 0 ? "green" : "gray"
                        }
                        variant="outline"
                        mr="xs"
                      >
                        {data.filter((p) => p.cycle === persona.cycle && p.active).length} / {data.filter((p) => p.cycle === persona.cycle).length} Active
                        Campaigns
                      </Badge>
                      <IconChevronDown
                        size="1.5rem"
                        style={{
                          transform: cycleModeShowCycleIds.includes(persona.cycle) ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </Flex>
                  </Card>,
                ]
              : null}
            {
              // only show cards if the cycle is not set or the cycle is set and the cycle is in the show list
              props.showCycles &&
                (!persona.cycle ||
                  (cycleModeShowCycleIds.includes(persona.cycle) && (
                    <PersonCampaignCard
                      showAvatar={props.showAvatar}
                      key={index}
                      persona={persona}
                      project={props.projects?.find((project) => project.id == persona.id)}
                      viewMode={props.campaignViewMode}
                      onPersonaActiveStatusUpdate={props.onPersonaActiveStatusUpdate}
                      showCycles={props.showCycles}
                    />
                  )))
            }
          </>
        ))}
      {!props.showCycles &&
        data.map((persona, index) => (
          <PersonCampaignCard
            showAvatar={props.showAvatar}
            key={index}
            persona={persona}
            project={props.projects?.find((project) => project.id == persona.id)}
            viewMode={props.campaignViewMode}
            onPersonaActiveStatusUpdate={props.onPersonaActiveStatusUpdate}
            showCycles={props.showCycles}
          />
        ))}
    </Box>
  );
};
