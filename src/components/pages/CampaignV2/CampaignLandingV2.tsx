import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Select,
  Switch,
  Text,
  Loader,
  Skeleton,
  Modal,
  Stepper,
  Checkbox,
  Tooltip,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import Hook from "@pages/channels/components/Hook";
import Tour from "reactour";
import { API_URL } from "@constants/data";
import { IconBrandLinkedin, IconCalendar, IconChecks, IconMailOpened, IconSend } from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import {
  fetchCampaignPersonalizers,
  fetchCampaignSequences,
  fetchCampaignStats,
  fetchTotalContacts,
  fetchCampaignAnalytics,
} from "@utils/requests/campaignOverview";
import { proxyURL } from "@utils/general";
import { activatePersona, deactivatePersona } from "@utils/requests/postPersonaActivation";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { useParams } from "react-router-dom";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import CampaignChannelPage from "@pages/CampaignChannelPage";
import { ContactsInfiniteScroll } from "./ContactsInfiniteScroll";
import LinkedInConvoSimulator from "@common/simulators/linkedin/LinkedInConvoSimulator";
import { PersonaOverview, SubjectLineTemplate } from "src";
import OutreachSlider from "../../CampaignShell/OutreachSlider";
import Personalizers from "./Personalizers";
import Sequences from "./Sequences";

interface StatsData {
  id: number;
  is_setting_up: boolean;
  archetype_name: string;
  created_at: string;
  emoji: string;
  testing_volume: number;
  active: boolean;
  email_to_linkedin_connection?: string;
  ai_researcher_id?: number;
  sdr_img_url: string;
  num_prospects: number;
  num_prospects_with_emails: number;
  email_active: boolean;
  linkedin_active: boolean;
  sdr_name: string;
  is_ai_research_personalization_enabled: boolean;
  setup_status: string;
}

const steps = [
  {
    selector: '[data-tour="campaign-tutorial"]',
    content: "Welcome to the campaign page! This tutorial will guide you through the key features and functionalities of the campaign management system.",
  },
  {
    selector: '[data-tour="campaign-status"]',
    content: "This is the campaign status. You can see if the campaign is active or inactive here.",
  },
  {
    selector: '[data-tour="campaign-stats"]',
    content: "Here you can see various statistics about your campaign, such as the number of emails sent, opened, and replied to.",
  },
  {
    selector: '[data-tour="outreach-volume"]',
    content: "This slider allows you to set the outreach volume for your campaign.",
  },
  {
    selector: '[data-tour="campaign-progress"]',
    content: "This section shows the progress of your campaign setup.",
  },
  {
    selector: '[data-tour="contacts"]',
    content: "This section allows you to add and manage your contacts. You can import contacts and view their details",
  },
  {
    selector: '[data-tour="sequences"]',
    content: "Here you can manage and organize the sequences of emails and LinkedIn messages that will be sent out as part of your campaign.",
  },
  {
    selector: '[data-tour="personalizers"]',
    content: "This section allows you to manage your personalizers for the campaign.",
  },
  {
    selector: '[data-tour="personalizer-enabled"]',
    content: "Activate SellScale AI for deep prospect research and dynamic personalized engagement!",
  },
];

export default function CampaignLandingV2() {
  useEffect(() => {
    const tourSeen = localStorage.getItem("campaignTourSeen");
    if (!tourSeen) {
      setIsTourOpen(true);
    }
  }, []);

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("campaignTourSeen", "true");
  };

  const convertStatsDataToPersonaOverview = (statsData: StatsData): PersonaOverview => {
    return {
      active: statsData.active,
      id: statsData.id,
      name: statsData.archetype_name,
      num_prospects: statsData.num_prospects,
      num_unused_email_prospects: 0,
      num_unused_li_prospects: 0,
      icp_matching_prompt: "",
      icp_matching_option_filters: {},
      is_unassigned_contact_archetype: false,
      persona_fit_reason: "",
      persona_contact_objective: "",
      uploads: [],
      contract_size: 0,
      transformer_blocklist: [],
      transformer_blocklist_initial: [],
      emoji: statsData.emoji,
      avg_icp_fit_score: 0,
      li_bump_amount: 0,
      cta_framework_company: "",
      cta_framework_persona: "",
      cta_framework_action: "",
      use_cases: "",
      filters: "",
      lookalike_profile_1: "",
      lookalike_profile_2: "",
      lookalike_profile_3: "",
      lookalike_profile_4: "",
      lookalike_profile_5: "",
      template_mode: false,
      smartlead_campaign_id: undefined,
      meta_data: {},
      first_message_delay_days: undefined,
      linkedin_active: statsData.linkedin_active,
      email_active: statsData.email_active,
      email_open_tracking_enabled: false,
      email_link_tracking_enabled: false,
      is_ai_research_personalization_enabled: statsData.is_ai_research_personalization_enabled,
    };
  };
  const userData = useRecoilValue(userDataState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  const id = Number(useParams().id);
  const [personalizers, setPersonalizers] = useState([]);
  const [personalizersEnabled, setPersonalizersEnabled] = useState(currentProject?.is_ai_research_personalization_enabled);
  const [status, setStatus] = useState("SETUP");
  const [isTourOpen, setIsTourOpen] = useState(false);

  //testing per cycle value
  const [totalContacts, setTotalContacts] = useState(0);
  const [loadingTotalContacts, setLoadingTotalContacts] = useState(true);

  // Loading states
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingSequences, setLoadingSequences] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingPersonalizers, setLoadingPersonalizers] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const userToken = useRecoilValue(userTokenState);

  const [contactsData, setContactsData] = useState<any[]>([]);
  const [emailSequenceData, setEmailSequenceData] = useState<any[]>([]);
  const [linkedinSequenceData, setLinkedinSequenceData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>([]);
  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any[]>([]);
  const [emailSubjectLines, setEmailSubjectLines] = useState<SubjectLineTemplate[]>([]);
  const [linkedinInitialMessageViewing, setLinkedinInitialMessageViewing] = useState<any>(0);
  const [emailSequenceViewingArray, setEmailSequenceViewingArray] = useState<any[]>([]);
  const [linkedinSequenceViewingArray, setLinkedinSequenceViewingArray] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [showActivateWarningModal, setShowActivateWarningModal] = useState(false);
  const [showCampaignTemplateModal, setShowCampaignTemplateModal] = useState(false);
  const [testingVolume, setTestingVolume] = useState(0);
  const [showLinkedInConvoSimulatorModal, setShowLinkedInConvoSimulatorModal] = useState(false);

  const [value, setValue] = useState("");

  //sequence variable
  const [sequences, setSequences] = useState<any[]>([]);

  useEffect(() => {
    console.log("CURRENT PROJECT", currentProject);
    if (currentProject) {
      setPersonalizersEnabled(currentProject?.is_ai_research_personalization_enabled);
    }
  }, [currentProject]);

  const getTotalContacts = async () => {
    setLoadingTotalContacts(true);
    const response = await fetchTotalContacts(userToken, id);
    if (response) {
      setTotalContacts(response);
    }
    setLoadingTotalContacts(false);
  };

  const updateConnectionType = (newConnectionType: string, campaignId: number) => {
    setLoadingStats(true);
    fetch(`${API_URL}/client/archetype/${campaignId}/update_email_to_linkedin_connection`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        email_to_linkedin_connection: newConnectionType,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Connection type updated");
        }
        showNotification({
          title: "Connection Type Updated",
          message: "Connection type has been updated.",
        });
      })
      .catch((error) => {
        console.error("Error updating connection type", error);
      })
      .finally(() => {
        setStatsData({
          ...(statsData as StatsData),
          email_to_linkedin_connection: newConnectionType,
        });
        if (statsData && statsData.testing_volume) {
          setTestingVolume(statsData.testing_volume);
        }
        setLoadingStats(false);
      });
  };

  const refetchCampaignStatsData = async () => {
    setLoadingStats(true);
    const statsPromise = fetchCampaignStats(userToken, id);
    statsPromise
      .then((stats) => {
        const loadedStats = stats as StatsData;
        setStatsData(loadedStats);
        if (loadedStats && loadedStats.testing_volume) {
          setTestingVolume(loadedStats.testing_volume);
        }
        setStatus(loadedStats.setup_status);
        setLoadingStats(false);
      })
      .catch((error) => {
        console.error("Error fetching stats or contacts", error);
        setLoadingStats(false);
      });
  };

  const refetchCampaignOtherStats = async () => {
    setLoadingAnalytics(true);
    const otherStatsPromise = fetchCampaignAnalytics(userToken, id);
    otherStatsPromise
      .then((analyticsData) => {
        const loadedAnalytics = analyticsData as any;
        setAnalyticsData(loadedAnalytics);
        setLoadingAnalytics(false);
      })
      .catch((error) => {
        console.error("Error fetching other stats", error);
        setLoadingAnalytics(false);
      });
  };

  useEffect(() => {
    //data fetching is complete.
    if (totalContacts === 0) {
      setActiveStep(0);
    } else if (sequences.length === 0) {
      setActiveStep(1);
    } else if (personalizers.length === 0) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  }, [totalContacts, sequences, loadingSequences, linkedinSequenceData, personalizers]);

  // This useEffect hook runs on page load and whenever the 'id' or 'userToken' changes.
  // It fetches campaign-related data (contacts, sequences, and stats) for a specific client archetype.
  // Initially, it sets the loading states for contacts, sequences, and stats to true.
  // Then, it makes asynchronous requests to fetch contacts, sequences, and stats data.
  // Once the data is fetched, it updates the respective state variables and sets the loading states to false.
  // If any of the fetch requests fail, it logs the error and sets the corresponding loading state to false.
  useEffect(() => {
    const fetchData = async () => {
      const clientArchetypeId = Number(id); // Assuming id is the client_archetype_id

      // Set loading states to true at the beginning
      setLoadingContacts(false);
      setLoadingSequences(true);
      setLoadingStats(true);

      const statsPromise = fetchCampaignStats(userToken, clientArchetypeId);
      const totalContactsPromise = fetchTotalContacts(userToken, clientArchetypeId);
      refetchCampaignOtherStats();

      Promise.all([statsPromise, totalContactsPromise])
        .then(([stats, totalContacts]) => {
          const loadedStats = stats as StatsData;
          console.log("stats", loadedStats);
          setStatsData(loadedStats);
          setCurrentProject(convertStatsDataToPersonaOverview(loadedStats as StatsData));
          if (loadedStats && loadedStats.testing_volume) {
            setTestingVolume(loadedStats.testing_volume);
          }
          if (totalContacts) {
            setTotalContacts(totalContacts);
          }
          setStatus(loadedStats.setup_status);
          setLoadingStats(false);
          setLoadingTotalContacts(false);
        })
        .catch((error) => {
          console.error("Error fetching data", error);
          setLoadingStats(false);
        });
    };

    fetchData();
  }, [id, userToken]);

  const togglePersonaChannel = async (campaignId: number, channel: "email" | "linkedin", userToken: string, active: boolean) => {
    if (channel === "email") {
      //check if there are email sequences and subject lines.
      //if not, show a notification that the channel cannot be activated.
      if (emailSequenceData.length === 0 || emailSubjectLines.length === 0) {
        showNotification({
          color: "red",
          title: "Email Channel",
          message: "Email channel cannot be activated without email sequences and subject lines.",
        });
        return;
      }
    }

    //show a warning that for email channel, if they activate, the number of sequence steps will always stay the same.
    //check localStorage if they have set the warning to not show again.
    //if not, show the warning.
    if (!localStorage.getItem("emailChannelWarning") && active === true) {
      localStorage.setItem("emailChannelWarning", "true");
    }
    if (channel === "email" && localStorage.getItem("emailChannelWarning") === "true" && active === true) {
      setShowActivateWarningModal(true);
      return;
    }

    setLoadingStats(true);
    const result = postTogglePersonaActive(userToken, campaignId, channel, active).then((res) => {
      refetchCampaignStatsData();
    });
  };

  const handleModal = (type: string, id: number, campaign_name: string, statsData: any) => {
    openContextModal({
      modal: "campaignDrilldownModal",
      withCloseButton: false,
      innerProps: {
        type: type,
        persona_id: id,
        campaign_name: campaign_name,
        statsData: statsData,
        setType: setValue,
      },
      centered: true,
      styles: {
        content: {
          minWidth: "1100px",
        },
        body: {
          padding: 0,
        },
      },
    });
  };

  return (
    <Paper p={"lg"} maw={1150} h="100%" ml="auto" mr="auto" style={{ backgroundColor: "transparent" }}>
      <Modal opened={showActivateWarningModal} onClose={() => setShowActivateWarningModal(false)} size="md" centered withCloseButton={false}>
        <Paper p="lg">
          <Flex align="center" mb="md">
            <IconMailOpened size={24} color="gray" />
            <Text size="lg" fw={700} ml="xs">
              Email Activation Notice
            </Text>
          </Flex>
          <Text size="sm" color="dimmed" mb="lg">
            • Activating the email channel will lock the number of email sequence steps.
            <br />
            • Once activated, the email sequence steps will be set.
            <br />• You will still have the ability to edit the content of the templates.
          </Text>
          <Flex justify="space-between" align="center" mt="lg">
            <Checkbox
              defaultChecked
              label="Remind me in the future"
              onChange={(event) => {
                const currentValue = localStorage.getItem("emailChannelWarning");
                localStorage.setItem("emailChannelWarning", currentValue === "false" ? "true" : "false");
              }}
            />
            <Button
              onClick={() => {
                setShowActivateWarningModal(false);
                setLoadingStats(true);
                postTogglePersonaActive(userToken, id, "email", true)
                  .then((res) => {
                    refetchCampaignStatsData();
                  })
                  .catch((error) => {
                    console.error("Error toggling persona active", error);
                  })
                  .finally(() => {
                    setLoadingStats(false);
                  });
              }}
              variant="filled"
              color="grape"
            >
              Activate!
            </Button>
          </Flex>
        </Paper>
      </Modal>
      {/* <Modal
        opened={showCampaignTemplateModal}
        onClose={() => {
          refetchCampaignStatsData();
          refetchSequenceData(Number(id));
          setShowCampaignTemplateModal(false);
        }}
        size="1100px"
      >
        <CampaignChannelPage campaignId={Number(id)} cType={"linkedin"} hideHeader={true} hideEmail={false} hideLinkedIn={false} hideAssets={true} />
      </Modal>
      <Modal
        opened={showLinkedInConvoSimulatorModal}
        onClose={() => {
          refetchCampaignStatsData();
          refetchSequenceData(Number(id));
          setShowLinkedInConvoSimulatorModal(false);
        }}
        size="1100px"
      >
        <LinkedInConvoSimulator personaId={id as number} sequenceSetUpMode={true} />
      </Modal> */}
      {loadingStats || !statsData ? (
        <Flex
          mx={"xl"}
          direction="column"
          justify="center"
          mb="lg"
          align="center"
          gap="sm"
          p="lg"
          style={{
            backgroundColor: "white",
            border: "1px solid lightblue",
            borderRadius: "6px",
          }}
        >
          <Skeleton height={50} radius="xl" width="100%" />
          <Skeleton height={40} radius="xl" width="80%" />
          <Skeleton height={30} radius="xl" width="60%" />
          <Flex align="center" gap="sm" mt="sm">
            <Loader color="gray" variant="dots" size="md" />
            <Text color="gray" size="md" className="loading-animation">
              Loading campaign stats
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Flex
          style={{
            backgroundColor: "white",
            border: "1px solid lightblue",
            borderRadius: "6px",
          }}
        >
          <Tour steps={steps} isOpen={isTourOpen} onRequestClose={closeTour} />
          <Flex direction={"column"} w={"100%"}>
            {/* <Flex justify={"space-between"} align={"center"} p={"lg"} pb={0}> */}
            <Flex justify={"space-between"} p={"lg"} pb={0} direction={"column"}>
              <Flex gap={"sm"} align={"center"} justify="space-between" w="100%">
                <Flex>
                  <Tooltip
                    arrowPosition="center"
                    position="top-start"
                    withArrow
                    label={
                      <Flex align={"center"} gap={"sm"} px={"sm"} py={5}>
                        <Text color="gray" size={"xs"} fw={600}>
                          Created by:
                        </Text>
                        <Avatar size={"sm"} src={userData.img_url} sx={{ borderRadius: "50%" }} />
                        <Text fw={600} size={"xs"}>
                          {statsData?.sdr_name}
                        </Text>
                        <Divider orientation="vertical" />
                        <Text color="gray" size={"xs"} fw={600}>
                          Created:
                        </Text>
                        <Text fw={600} size={"xs"}>
                          {new Date(statsData.created_at).toLocaleString("en-US", {
                            dateStyle: "full",
                          })}
                        </Text>
                      </Flex>
                    }
                  >
                    <Text fw={600} size={20}>
                      {statsData?.emoji} {statsData?.archetype_name?.substring(0, 70)}
                      {statsData?.archetype_name?.length > 70 && "..."}
                    </Text>
                  </Tooltip>
                  <Badge
                    data-tour="campaign-status"
                    tt={"uppercase"}
                    variant="outline"
                    size="lg"
                    color={status === "SETUP" ? "orange" : status === "ACTIVE" ? "green" : status === "INACTIVE" ? "red" : "gray"}
                    ml={"sm"}
                  >
                    {status}
                  </Badge>
                </Flex>
              </Flex>
              <Flex align={"center"} w={"100%"} gap={"xs"}>
                <Flex w={"100%"} align={"center"} gap={"sm"}>
                  <Text size={"sm"} color="gray" fw={500}>
                    Sequence Structure:{" "}
                  </Text>
                  <Paper
                    p="md"
                    sx={{
                      flex: 1,
                      justifyContent: "space-between",
                      textAlign: "center",
                      // make background a grid of dots
                      backgroundSize: "20px 20px",
                    }}
                    // withBorder
                  >
                    {/* <Flex justify="flex-end">
                      <Tooltip
                        label={
                          <Text>
                            Omnichannel outbound allows you to control the order of personalized outbound messages. <br></br>
                            If both email and LinkedIn are enabled, an email is sent first, followed by a LinkedIn message after a few days. <br></br>
                            Otherwise, only one channel is used.
                          </Text>
                        }
                        withArrow
                        position="bottom"
                      >
                        <ActionIcon>
                          <IconCircleLetterI size={"1rem"} color="#3B85EF" />
                        </ActionIcon>
                      </Tooltip>
                    </Flex> */}
                    <Group noWrap spacing={"sm"} w={"100%"}>
                      <Switch
                        onChange={() => togglePersonaChannel(id, "email", userToken, !statsData?.email_active)}
                        checked={statsData?.email_active}
                        labelPosition="left"
                        label={
                          <Flex gap={1} align={"center"} className="hover:cursor-pointer">
                            <IconMailOpened size={"1.2rem"} fill="#3B85EF" color="white" />
                            <Text color="#3B85EF" fw={500}>
                              Email
                            </Text>
                          </Flex>
                        }
                        w={"100%"}
                        // miw={160}
                        styles={{
                          root: {
                            minWidth: "9rem !important",
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                            background: "white",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <Divider variant="dashed" labelPosition="center" label={<Hook linkedLeft={false} linkedRight={false} />} />
                      <Select
                        onChange={(value) => {
                          if (typeof value === "string") {
                            updateConnectionType(value, id);
                          }
                        }}
                        size="sm"
                        value={statsData?.email_to_linkedin_connection}
                        w={"100%"}
                        data={[
                          {
                            label: "Parallel",
                            value: "RANDOM",
                          },
                          {
                            label: "📧 Sent-Only",
                            value: "ALL_PROSPECTS",
                          },
                          {
                            label: "👀 Open-Only",
                            value: "OPENED_EMAIL_PROSPECTS_ONLY",
                          },
                          {
                            label: "⚡️ Click-Only",
                            value: "CLICKED_LINK_PROSPECTS_ONLY",
                          },
                        ]}
                        placeholder="Select an event"
                      />
                      <Divider variant="dashed" labelPosition="center" label={<Hook linkedLeft={false} linkedRight={false} />} />
                      <Switch
                        onChange={() => togglePersonaChannel(id, "linkedin", userToken, !statsData?.linkedin_active)}
                        checked={statsData?.linkedin_active}
                        labelPosition="left"
                        label={
                          <Flex gap={2} align={"center"}>
                            <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                            <Text color="#3B85EF" fw={500}>
                              Linkedin
                            </Text>
                          </Flex>
                        }
                        w={"100%"}
                        // miw={160}
                        styles={{
                          root: {
                            minWidth: "9rem !important",
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                            background: "white",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                    </Group>
                  </Paper>
                </Flex>
              </Flex>
            </Flex>
            <Flex gap={"sm"} w={"100%"} justify={"center"} p={"lg"}>
              <Paper w={"100%"} withBorder>
                {loadingStats || !statsData ? (
                  <Flex direction="row" align="center" w="100%" my="md">
                    <Flex direction="column" align="center" w="100%" my="md">
                      <Skeleton height={50} width="80%" />
                    </Flex>
                    <Flex direction="column" align="center" w="100%" my="md">
                      <Skeleton height={50} width="80%" />
                    </Flex>
                    <Flex direction="column" align="center" w="100%" my="md">
                      <Skeleton height={50} width="80%" />
                    </Flex>
                    <Flex direction="column" align="center" w="100%" my="md">
                      <Skeleton height={50} width="80%" />
                    </Flex>
                    <Flex direction="column" align="center" w="100%" my="md">
                      <Skeleton height={50} width="80%" />
                    </Flex>
                  </Flex>
                ) : (
                  <Flex data-tour="campaign-stats" align={"center"} justify={"space-between"} h={"100%"} w="100%">
                    <Box
                      p={"lg"}
                      w={"100%"}
                      h={"100%"}
                      sx={{
                        backgroundColor: "",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#F7FDFF",
                        },
                      }}
                      onClick={() => {
                        setValue("sent");
                        handleModal("sent", id, currentProject?.name || "", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={"xs"}>
                        <IconSend size={"0.9rem"} color="#3B85EF" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          Sent
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        {loadingAnalytics ? (
                          <Loader color="gray" variant="oval" size="sm" />
                        ) : (
                          <>
                            <Text fz={24}>{analyticsData.num_sent}</Text>
                            <Badge color={"#3B85EF"} size="xs">
                              {`${(100).toFixed(0)}%`}
                            </Badge>
                          </>
                        )}
                      </Flex>
                    </Box>
                    <Divider orientation="vertical" />
                    <Box
                      p={"lg"}
                      w={"100%"}
                      h={"100%"}
                      sx={{
                        backgroundColor: "",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#FFF7FB",
                        },
                      }}
                      onClick={() => {
                        setValue("open");
                        handleModal("open", id, currentProject?.name || "", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconChecks size={"0.9rem"} color="pink" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          Open
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        {loadingAnalytics ? (
                          <Loader color="gray" variant="oval" size="sm" />
                        ) : (
                          <>
                            <Text fz={24}>{analyticsData.num_opens}</Text>
                            <Badge color="pink" size="xs">
                              {`${((analyticsData.num_opens / (analyticsData.num_sent + 0.0001)) * 100).toFixed(0)}%`}
                            </Badge>
                          </>
                        )}
                      </Flex>
                    </Box>
                    <Divider orientation="vertical" />
                    <Box
                      p={"lg"}
                      w={"100%"}
                      h={"100%"}
                      sx={{
                        backgroundColor: "",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#FFF9F2",
                        },
                      }}
                      onClick={() => {
                        setValue("reply");
                        handleModal("reply", id, currentProject?.name || "", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconMessageCheck size={"0.9rem"} color="orange" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          Reply
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        {loadingAnalytics ? (
                          <Loader color="gray" variant="oval" size="sm" />
                        ) : (
                          <>
                            <Text fz={24}>{analyticsData.num_replies}</Text>
                            <Badge color="orange" size="xs">
                              {`${((analyticsData.num_replies / (analyticsData.num_opens + 0.0001)) * 100).toFixed(0)}%`}
                            </Badge>
                          </>
                        )}
                      </Flex>
                    </Box>
                    <Divider orientation="vertical" />
                    <Box
                      p={"lg"}
                      w={"100%"}
                      h={"100%"}
                      sx={{
                        backgroundColor: "",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#F4FBF5",
                        },
                      }}
                      onClick={() => {
                        setValue("pos_reply");
                        handleModal("pos_reply", id, currentProject?.name || "", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconMessageCheck size={"0.9rem"} color="green" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          (+) Reply
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        {loadingAnalytics ? (
                          <Loader color="gray" variant="oval" size="sm" />
                        ) : (
                          <>
                            <Text fz={24}>{analyticsData.num_pos_replies}</Text>
                            <Badge color="green" size="xs">
                              {`${((analyticsData.num_pos_replies / (analyticsData.num_replies + 0.0001)) * 100).toFixed(0)}%`}
                            </Badge>
                          </>
                        )}
                      </Flex>
                    </Box>
                    <Divider orientation="vertical" />
                    <Box
                      p={"lg"}
                      w={"100%"}
                      h={"100%"}
                      sx={{
                        backgroundColor: "",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#F7FDFF",
                        },
                      }}
                      onClick={() => {
                        setValue("demo");
                        handleModal("demo", id, "aaaa", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconCalendar size={"0.9rem"} color={"#3B85EF"} className="mb-[2px]" />
                        <Text fw={400}>Demo</Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        {loadingAnalytics ? (
                          <Loader color="gray" variant="oval" size="sm" />
                        ) : (
                          <>
                            <Text fz={24}>{analyticsData.num_demos}</Text>
                            <Badge color="blue" size="xs">
                              {`${((analyticsData.num_demos / (analyticsData.num_pos_replies + 0.0001)) * 100).toFixed(0)}%`}
                            </Badge>
                          </>
                        )}
                      </Flex>
                    </Box>
                  </Flex>
                )}
              </Paper>
              <Flex data-tour="outreach-volume" w={"60%"}>
                <OutreachSlider
                  testingVolume={testingVolume}
                  setTestingVolume={setTestingVolume}
                  totalContacts={totalContacts}
                  userToken={userToken}
                  id={id}
                  fetchCampaignStats={fetchCampaignStats}
                  setLoadingStats={setLoadingStats}
                />
              </Flex>
            </Flex>
            {!loadingContacts && activeStep !== 3 && (
              <Box data-tour="campaign-progress" px={"xl"} py={"md"} bg={"#FAFAFA"}>
                <Stepper active={activeStep} size="xs" iconSize={28}>
                  <Stepper.Step label="Add Contacts" />
                  <Stepper.Step label="Setup Templates" />
                  <Stepper.Step label="Add Personalizers" />
                </Stepper>
              </Box>
            )}
          </Flex>
        </Flex>
      )}
      <Flex gap={"lg"} mt={"md"}>
        <Flex direction={"column"} w={"24vw"} gap={"lg"}>
          {loadingContacts ? (
            <Paper p={"md"}>
              <Skeleton height={30} radius="xl" width="40%" />
              <Skeleton height={20} radius="xl" width="60%" mt="sm" />
              <Skeleton height={20} radius="xl" width="60%" mt="sm" />
              <Skeleton height={20} radius="xl" width="60%" mt="sm" />
            </Paper>
          ) : (
            <></>
          )}
          <Paper data-tour="contacts" withBorder w={"100%"}>
            <ContactsInfiniteScroll
              campaignId={Number(id)}
              getTotalContacts={getTotalContacts}
              totalContacts={totalContacts}
              loadingTotalContacts={loadingTotalContacts}
            />
          </Paper>
        </Flex>
        <Flex direction={"column"} gap={"md"} w={"80%"}>
          <Sequences setSequences={setSequences} />
          <Personalizers data={statsData} sequences={sequences} setPersonalizers={setPersonalizers} personalizers={personalizers} />
        </Flex>
      </Flex>
    </Paper>
  );
}
