import { openedProspectIdState } from "@atoms/inboxAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
import PageFrame from "@common/PageFrame";
import EmailQueuedMessages from "@common/emails/EmailQueuedMessages";
import LinkedinQueuedMessages from "@common/messages/LinkedinQueuedMessages";
import EmojiPicker from "emoji-picker-react";
import {
  IconChevronsUp,
  IconChevronsDown,
  IconChartDots3,
  IconList,
  IconAlarm,
  IconAlertCircle,
  IconRobot,
  IconMessage,
} from "@tabler/icons-react";

import {
  Stack,
  Group,
  Title,
  Button,
  Divider,
  Box,
  Popover,
  TextInput,
  Select,
  Text,
  Paper,
  ActionIcon,
  Center,
  Tooltip,
  Switch,
  useMantineTheme,
  ScrollArea,
  Tabs,
  Loader,
  Collapse,
  SegmentedControl,
  Alert,
  Flex,
  Card,
  Avatar,
} from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconAdjustments,
  IconAdjustmentsHorizontal,
  IconArrowRightBar,
  IconBrandLinkedin,
  IconCalendar,
  IconCheck,
  IconChecks,
  IconEdit,
  IconMail,
  IconPlus,
  IconSearch,
  IconSeeding,
  IconSend,
  IconX,
} from "@tabler/icons";
import {
  IconArrowDown,
  IconArrowUp,
  IconChecklist,
  IconClipboard,
  IconFilter,
  IconLayoutNavbarCollapse,
  IconMessageCheck,
  IconRecordMail,
} from "@tabler/icons-react";
import { navigateToPage } from "@utils/documentChange";
import {
  convertDateToLocalTime,
  convertDateToShortFormat,
  convertDateToShortFormatWithoutTime,
  formatToLabel,
} from "@utils/general";
import { getSDRGeneralInfo } from "@utils/requests/getClientSDR";
import getPersonas, {
  getPersonasActivity,
  getPersonasCampaignView,
  getPersonasOverview,
} from "@utils/requests/getPersonas";
import _, { set } from "lodash";
import moment from "moment";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { PersonaOverview } from "src";
import { API_URL } from "@constants/data";
import ComingSoonCard from "@common/library/ComingSoonCard";
import CampaignGraph from "./campaigngraph";
import { showNotification } from "@mantine/notifications";
import { CampaignAnalyticsData } from "./CampaignAnalytics";
// import { CampaignAnalyticChart } from "./CampaignAnalyticsV2";
import OverallPipeline from "./OverallPipeline";
import { TodayActivityData } from "./OverallPipeline/TodayActivity";
import UserStatusToggle from "./UserStatusToggle";

export type CampaignPersona = {
  id: number;
  name: string;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  li_sent: number;
  li_opened: number;
  li_replied: number;
  active: boolean;
  created_at: string;
  emoji: string;
};

export default function PersonaCampaigns() {
  const navigate = useNavigate();

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [projects, setProjects] = useState<PersonaOverview[]>([]);
  const [personas, setPersonas] = useState<CampaignPersona[]>([]);


  const [search, setSearch] = useState<string>("");

  let filteredProjects = personas.filter((personas) =>
    personas.name.toLowerCase().includes(search.toLowerCase())
  );

  const [campaignAnalyticData, setCampaignAnalyticData] =
    useState<CampaignAnalyticsData>({
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
  const [currentLinkedInSLA, setCurrentLinkedInSLA] = useState<number>(0);

  let [loadingPersonas, setLoadingPersonas] = useState<boolean>(true);

  const [campaignViewMode, setCampaignViewMode] = useState<
    "node-view" | "list-view"
  >("node-view");

  const fetchCampaignPersonas = async () => {
    if (!isLoggedIn()) return;
    setLoadingPersonas(true);

    // Get Personas Campaign View
    const response = await getPersonasCampaignView(userToken);
    const result =
      response.status === "success" ? (response.data as CampaignPersona[]) : [];

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
        if (
          moment(schedule.start_date) < moment() &&
          moment() <= moment(schedule.start_date).add(7, "days")
        ) {
          setCurrentLinkedInSLA(schedule.linkedin_volume);
        }
      }
    }

    // Set the Personas
    setPersonas(result);
    setLoadingPersonas(false);

    // Get Personas Overview
    const response2 = await getPersonasOverview(userToken);
    const result2 =
      response2.status === "success"
        ? (response2.data as PersonaOverview[])
        : [];
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
    fetchCampaignPersonas()
  }, []);

  // sort personas by persona.active then persona.created_at in desc order
  filteredProjects.sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    if (moment(a.created_at).isAfter(moment(b.created_at))) return -1;
    if (moment(a.created_at).isBefore(moment(b.created_at))) return 1;
    return 0;
  });

  return (
    <PageFrame>
      <Stack>
        <Group position="apart">
          <Title order={2}>Campaigns</Title>
        </Group>
        <Tabs defaultValue="overview">
          <Tabs.List mb='md'>
            <Tabs.Tab value="overview" icon={<IconClipboard size="0.8rem" />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab
              value="linkedin"
              icon={<IconBrandLinkedin size="0.8rem" />}
              ml='auto'
            >
              Queued LinkedIns
            </Tabs.Tab>
            <Tabs.Tab value="email" icon={<IconMail size="0.8rem" />}>
              Queued Emails
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xs">
            <Stack>
              <Group position="apart">
                <Group>
                  <Button
                    radius="md"
                    leftIcon={<IconPlus size="1rem" />}
                    onClick={() => {
                      openContextModal({
                        modal: "uploadProspects",
                        title: <Title order={3}>Create Campaign</Title>,
                        innerProps: { mode: "CREATE-ONLY" },
                      });
                    }}
                  >
                    Create New Campaign
                  </Button>
                  {/* <TextInput
                    radius="md"
                    placeholder="Search"
                    rightSection={<IconSearch color="#767e85" size="1.0rem" />}
                    w={250}
                    styles={{
                      input: {
                        backgroundColor: "transparent",
                      },
                    }}
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                  /> */}
                  {/* <Select
                    radius="md"
                    placeholder="Sort by"
                    data={[]}
                    w={100}
                    styles={{
                      input: {
                        backgroundColor: "transparent",
                      },
                    }}
                  />
                  <Button
                    variant="outline"
                    color="gray"
                    radius="md"
                    sx={{
                      border: "0.0625rem solid #ced4da;",
                    }}
                    rightIcon={
                      <IconAdjustmentsHorizontal
                        color="#767e85"
                        size="1.0rem"
                      />
                    }
                  >
                    <Text fw={400}>Filters</Text>
                  </Button> */}
                </Group>

                {userData?.warmup_linkedin_complete ? (
                  <Button
                    variant="filled"
                    radius="md"
                    onClick={() => {
                      navigateToPage(navigate, `/settings/linkedinConnection`);
                    }}
                  >
                    {`LinkedIn Send Rate (per week): ${currentLinkedInSLA}`}
                  </Button>
                ) : (
                  <Tooltip
                    label="Your LinkedIn account is in a warmup phase. Explore more."
                    withArrow
                    withinPortal
                  >
                    <Button
                      variant="outline"
                      radius="md"
                      onClick={() => {
                        navigateToPage(
                          navigate,
                          `/settings/linkedinConnection`
                        );
                      }}
                    >
                      {`LinkedIn Warming Up (per week): ${currentLinkedInSLA}`}
                    </Button>
                  </Tooltip>
                )}

                {/* <Box>
                  <Button.Group>
                    <Button
                      variant="outline"
                      color="gray"
                      radius="md"
                      sx={{
                        border: "0.0625rem solid #ced4da;",
                      }}
                    >
                      <Text fw={500}>
                        LinkedIn:{" "}
                        <Text c="blue" fw={600} span>
                          {userData.weekly_li_outbound_target}/100
                        </Text>
                      </Text>
                    </Button>
                    <Button
                      variant="outline"
                      color="gray"
                      radius="md"
                      sx={{
                        border: "0.0625rem solid #ced4da;",
                      }}
                    >
                      <Text fw={500}>
                        Email:{" "}
                        <Text c="blue" fw={600} span>
                          {userData.weekly_email_outbound_target}/100
                        </Text>
                      </Text>
                    </Button>

                    <SegmentedControl
                    value={campaignViewMode}
                    onChange={(mode: any) => setCampaignViewMode(mode)}
                    ml='sm'
                    color='blue'
                    data={[
                      { label: (
                        <Center>
                          <IconChartDots3 size="1rem" />
                          <Box ml={10}>Node View</Box>
                        </Center>
                      ), value: 'node-view' },
                      { label:(
                        <Center>
                          <IconList size="1rem" />
                          <Box ml={10}>List View</Box>
                        </Center>
                      ), value: 'list-view' },
                    ]}
                  />
                  </Button.Group>


                </Box> */}
              </Group>
              <ScrollArea h={"78vh"}>
                <Stack>
                  {loadingPersonas && (
                    <Center h={200}>
                      <Loader />
                    </Center>
                  )}
                  {filteredProjects.filter((persona) => persona.active).length >
                    1 && (
                    <Alert
                      sx={{
                        borderRadius: "md",
                        border: "solid 1px red",
                      }}
                      color="red"
                      title="Multiple Active Personas"
                      children="You have multiple active personas. This is not recommended as it will cause your campaigns to compete with each other. We recommend you deactivate all but one persona."
                      icon={<IconAlertCircle size="1rem" />}
                    />
                  )}
                  {!loadingPersonas &&
                    filteredProjects
                      .filter((persona) => persona.active)
                      .map((persona, index) => (
                        <PersonCampaignCard
                          key={index}
                          persona={persona}
                          project={projects.find(
                            (project) => project.id == persona.id
                          )}
                          viewMode={campaignViewMode}
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
                      ))}

                  {filteredProjects.filter((persona) => !persona.active)
                    .length > 0 && (
                    <Divider
                      label="Inactive Personas"
                      labelPosition="center"
                      color="gray"
                    />
                  )}

                  {!loadingPersonas &&
                    filteredProjects
                      .filter((persona) => !persona.active)
                      .map((persona, index) => (
                        <PersonCampaignCard
                          key={index}
                          persona={persona}
                          project={projects.find(
                            (project) => project.id == persona.id
                          )}
                          viewMode={campaignViewMode}
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
                      ))}

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

function PersonCampaignCard(props: {
  persona: CampaignPersona;
  project?: PersonaOverview;
  viewMode: "node-view" | "list-view";
  onPersonaActiveStatusUpdate?: (id: number, active: boolean) => void;
}) {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );
  const [opened, { toggle }] = useDisclosure(props.persona.active);
  const [inactiveChannelsOpened, setInactiveChannelsOpened] = useState(false);
  const [emoji, setEmojiState] = useState<string>(props.persona.emoji || "⬜️");
  const { hovered, ref } = useHover();

  const userToken = useRecoilValue(userTokenState);

  const [personaActive, setPersonaActive] = useState<boolean>(
    props.persona.active
  );

  const userData = useRecoilValue(userDataState);

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
      active: !!userData?.weekly_li_outbound_target && props.persona.active,
      icon: <IconBrandLinkedin size="0.925rem" />,
      sends: props.persona.li_sent,
      opens: props.persona.li_opened,
      replies: props.persona.li_replied,
      date: props.persona.created_at,
    },
    {
      id: 2,
      type: "Email",
      active: !!userData?.weekly_email_outbound_target && props.persona.active,
      icon: <IconMail size="0.925rem" />,
      sends: props.persona.emails_sent,
      opens: props.persona.emails_opened,
      replies: props.persona.emails_replied,
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

  return (
    <Paper radius='md' ref={ref}>
      <Stack
        spacing={0}
        sx={{
          opacity: props.persona.active || hovered ? 1 : 0.6,
          cursor: 'pointer',
        }}
      >
        <Group
          // position="apart"
          sx={(theme) => ({
            backgroundColor: props.persona.active ? theme.colors.blue[6] : 'white',
            borderRadius: '0.5rem 0.5rem 0 0',
            border: 'solid 1px ' + theme.colors.gray[2],
          })}
          p={props.persona.active ? 'xs' : '4px'}
          pl='xs'
          pr='xs'
        >
          <Box sx={{ flexDirection: 'row', display: 'flex' }} w='46%'>
            <Group w='500'>
              <Popover position='bottom' withArrow shadow='md'>
                <Popover.Target>
                  <Avatar
                    variant='transparent'
                    color={props.persona.active ? 'blue' : 'gray'}
                    radius='xl'
                    size='sm'
                    sx={{ backgroundColor: '#ffffff22' }}
                  >
                    <Text fz='lg'>{emoji}</Text>
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

              <Title order={5} c={props.persona.active ? 'white' : 'gray'}>
                {_.truncate(props.persona.name, { length: 48 })}
              </Title>
            </Group>
          </Box>

          <Box w='20%'>
            <Button
              variant='subtle'
              onClick={toggle}
              sx={{ borderRadius: 100, backgroundColor: '#ffffff44' }}
            >
              {opened ? (
                <IconChevronsUp size='1.5rem' color={props.persona.active ? 'white' : 'blue'} />
              ) : (
                <IconChevronsDown size='1.5rem' color={props.persona.active ? 'white' : 'gray'} />
              )}
            </Button>
          </Box>

          <Group
            sx={{ justifyContent: 'flex-end', display: 'flex', flexDirection: 'row' }}
            ml='auto'
          >
            <Button
              w={60}
              radius='xl'
              size='xs'
              compact
              sx={(theme) => ({
                backgroundColor: props.persona.active ? theme.colors.blue[5] : 'gray',
                //color: theme.colors.blue[2],
              })}
              onClick={() => {
                if (props.project == undefined) return;
                setOpenedProspectId(-1);
                setCurrentProject(props.project);
                window.location.href = `/persona/settings?campaign_id=${props.persona.id}`;
              }}
            >
              Edit
            </Button>

            <Tooltip
              withArrow
              position='bottom'
              label={
                personaActive
                  ? 'Click to disable this campaign on settings page'
                  : 'Click to enable this campaign on settings page'
              }
            >
              <span>
                <UserStatusToggle
                  projectId={props.project?.id}
                  isActive={personaActive}
                  onChangeUserStatusSuccess={(status: boolean) => {
                    setPersonaActive(status);
                    props.onPersonaActiveStatusUpdate?.(props.project?.id ?? 0, status);
                  }}
                />
              </span>
            </Tooltip>
          </Group>
        </Group>
        <Collapse in={opened}>
          {props.viewMode === 'node-view' && (
            <Box>
              <CampaignGraph
                personaId={props.persona.id}
                unusedProspects={Math.min(props.project?.num_unused_li_prospects ?? 0)}
                sections={types}
                onChannelClick={(sectionType: string) => {
                  if (props.project == undefined) return;
                  setOpenedProspectId(-1);
                  setCurrentProject(props.project);
                  navigateToPage(
                    navigate,
                    `/setup/${sectionType.toLowerCase()}`,
                    new URLSearchParams(`?campaign_id=${props.persona.id}`)
                  );
                }}
              />
            </Box>
          )}
          {props.viewMode === 'list-view' && (
            <Box>
              {types.map((section, index) => {
                if (!section.active && props.persona.active) return null;

                return (
                  <Box key={index}>
                    {index > 0 && <Divider />}
                    <PersonCampaignCardSection
                      section={section}
                      onClick={() => {
                        if (props.project == undefined) return;
                        setOpenedProspectId(-1);
                        setCurrentProject(props.project);
                        navigateToPage(
                          navigate,
                          `/setup/${section.type.toLowerCase()}`,
                          new URLSearchParams(`?campaign_id=${props.persona.id}`)
                        );
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
                          {index > 0 && <Divider />}
                          <PersonCampaignCardSection
                            section={section}
                            onClick={() => {
                              if (props.project == undefined) return;
                              setOpenedProspectId(-1);
                              setCurrentProject(props.project);
                              navigateToPage(
                                navigate,
                                `/setup/${section.type.toLowerCase()}`,
                                new URLSearchParams(`?campaign_id=${props.persona.id}`)
                              );
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Collapse>
                  <Divider />
                  <Button
                    w='100%'
                    variant='subtle'
                    size='xs'
                    color='gray'
                    onClick={() => setInactiveChannelsOpened(!inactiveChannelsOpened)}
                    leftIcon={
                      inactiveChannelsOpened ? (
                        <IconArrowUp size='0.7rem' />
                      ) : (
                        <IconArrowDown size='0.7rem' />
                      )
                    }
                  >
                    {inactiveChannelsOpened ? 'Hide' : 'Show'}{' '}
                    {types.filter((x) => !x.active).length} Inactive Channel
                    {types.filter((x) => !x.active).length > 1 ? 's' : ''}
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

function PersonCampaignCardSection(props: {
  section: ChannelSection;
  onClick?: () => void;
}) {
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
            <Text fz="xs" color="gray" w="90px">
              <IconSend size="0.8rem" /> Sent:{" "}
              <span style={{ color: "black" }}>{props.section.sends}</span>
            </Text>
            <Text fz="xs" color="gray" w="90px">
              <IconChecks size="0.8rem" /> Opens:{" "}
              <span style={{ color: "black" }}>{props.section.opens}</span>
            </Text>
            <Text fz="xs" color="gray" w="90px">
              <IconMessageCheck size="0.8rem" /> Replies:{" "}
              <span style={{ color: "black" }}>{props.section.replies}</span>
            </Text>
          </Group>
        </Box>
        <Box sx={{ flexBasis: "20%", color: "gray" }}>
          <Text fz="xs" span>
            <IconCalendar size="0.8rem" />{" "}
            {convertDateToShortFormatWithoutTime(new Date(props.section.date))}
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
                  <IconCheck
                    size="0.6rem"
                    color={theme.colors.teal[theme.fn.primaryShade()]}
                    stroke={3}
                  />
                ) : (
                  <IconX
                    size="0.6rem"
                    color={theme.colors.red[theme.fn.primaryShade()]}
                    stroke={3}
                  />
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
