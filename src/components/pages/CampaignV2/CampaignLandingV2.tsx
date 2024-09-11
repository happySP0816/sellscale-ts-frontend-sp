import {
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
  Grid,
  Textarea,
  ActionIcon,
  TextInput,
  Anchor,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import posthog from "posthog-js";
import Hook from "@pages/channels/components/Hook";
import Tour from "reactour";
import { API_URL } from "@constants/data";
import {
  IconArrowLeft,
  IconArrowLeftRight,
  IconArrowsLeftRight,
  IconBrandLinkedin,
  IconCalendar,
  IconCheck,
  IconChecks,
  IconCircleCheck,
  IconEdit,
  IconMailOpened,
  IconSend,
  IconSettings,
  IconTrash,
} from "@tabler/icons";
import { IconMessageCheck, IconSparkles } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import {
  fetchCampaignStats,
  fetchTotalContacts,
  fetchCampaignAnalytics,
} from "@utils/requests/campaignOverview";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { useNavigate, useParams } from "react-router-dom";
import {
  emailSequenceState,
  emailSubjectLinesState,
  linkedinSequenceState,
  userDataState,
  userTokenState,
} from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { ContactsInfiniteScroll } from "./ContactsInfiniteScroll";
import { PersonaOverview, SubjectLineTemplate } from "src";
import OutreachSlider from "../../CampaignShell/OutreachSlider";
import Personalizers from "./Personalizers";
import Sequences from "./Sequences";
import { set } from "lodash";
import SequencesV2 from "./SequencesV2";
import {GenerationCenter} from "./GenerationCenter";
import GenerateAndSend from "@pages/GenerateAndSend";
// import ToneAdjuster from "./ToneAdjuster";

interface StatsData {
  id: number;
  meta_data?: {
    linkedin_has_been_active?: boolean;
    email_has_been_active?: boolean;
  };
  li_seq_generation_in_progress?: boolean;
  email_seq_generation_in_progress?: boolean;
  is_setting_up: boolean;
  archetype_name: string;
  created_at: string;
  emoji: string;
  testing_volume: number;
  template_mode: boolean;
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
    content:
      "Welcome to the campaign page! This tutorial will guide you through the key features and functionalities of the campaign management system.",
  },
  {
    selector: '[data-tour="campaign-status"]',
    content:
      "This is the campaign status. You can see if the campaign is active or inactive here.",
  },
  {
    selector: '[data-tour="campaign-stats"]',
    content:
      "Here you can see various statistics about your campaign, such as the number of emails sent, opened, and replied to.",
  },
  {
    selector: '[data-tour="outreach-volume"]',
    content:
      "This slider allows you to set the outreach volume for your campaign.",
  },
  {
    selector: '[data-tour="campaign-progress"]',
    content: "This section shows the progress of your campaign setup.",
  },
  {
    selector: '[data-tour="contacts"]',
    content:
      "This section allows you to add and manage your contacts. You can import contacts and view their details",
  },
  {
    selector: '[data-tour="sequences"]',
    content:
      "Here you can manage and organize the sequences of emails and LinkedIn messages that will be sent out as part of your campaign.",
  },
  {
    selector: '[data-tour="personalizers"]',
    content:
      "This section allows you to manage your personalizers for the campaign.",
  },
  {
    selector: '[data-tour="personalizer-enabled"]',
    content:
      "Activate SellScale AI for deep prospect research and dynamic personalized engagement!",
  },
];

type PropsType = {
  showOnlyHeader?: boolean;
  forcedCampaignId?: number;
  showLaunchButton?: boolean;
};

export default function CampaignLandingV2(props: PropsType) {
  useEffect(() => {
    const tourSeen = localStorage.getItem("campaignTourSeen");
    if (!tourSeen) {
      setIsTourOpen(true);
    }
    posthog.onFeatureFlags(function () {
      if (posthog.isFeatureEnabled("show_voice_builder")) {
        setShowVoiceBuilder(true);
      }
    });
  }, []);

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("campaignTourSeen", "true");
  };

  const convertStatsDataToPersonaOverview = (
    statsData: StatsData
  ): PersonaOverview => {
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
      li_seq_generation_in_progress: statsData.li_seq_generation_in_progress,
      email_seq_generation_in_progress:
        statsData.email_seq_generation_in_progress,
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
      template_mode: statsData.template_mode,
      smartlead_campaign_id: undefined,
      meta_data: statsData.meta_data,
      first_message_delay_days: undefined,
      linkedin_active: statsData.linkedin_active,
      email_active: statsData.email_active,
      email_open_tracking_enabled: false,
      email_link_tracking_enabled: false,
      is_ai_research_personalization_enabled:
        statsData.is_ai_research_personalization_enabled,
      ai_researcher_id: statsData.ai_researcher_id,
    };
  };
  const userData = useRecoilValue(userDataState);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);

  const id = props.forcedCampaignId
    ? Number(props.forcedCampaignId)
    : Number(useParams().id);
  const [personalizers, setPersonalizers] = useState([]);
  const navigate = useNavigate();
  const [personalizersEnabled, setPersonalizersEnabled] = useState(
    currentProject?.is_ai_research_personalization_enabled
  );
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
  const [activeStep, setActiveStep] = useState(0);
  const [openGenerationCenter, setOpenGenerationCenter] = useState(false);

  const userToken = useRecoilValue(userTokenState);

  const linkedinSequenceData = useRecoilValue(linkedinSequenceState);
  const emailSequenceData = useRecoilValue(emailSequenceState);

  // const [emailSequenceData, setEmailSequenceData] = useState<any[]>([]);
  // const [linkedinSequenceData, setLinkedinSequenceData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>([]);
  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any[]>(
    []
  );

  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState<
    SubjectLineTemplate[]
  >(emailSubjectLinesState);

  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const [editableText, setEditableText] = useState("");
  const [showActivateWarningModal, setShowActivateWarningModal] =
    useState(false);
  const [showToneArea, setShowToneArea] = useState(false);
  const [selectedVoiceSequence, setSelectedVoiceSequence] = useState<any>(null);
  const [voiceBuilderOpened, setVoiceBuilderOpened] = useState(false);
  const [showVoiceBuilder, setShowVoiceBuilder] = useState(false);
  const [voiceParam1, setVoiceParam1] = useState({ x: 140, y: 140 });
  const [voiceParam2, setVoiceParam2] = useState({ x: 140, y: 140 });
  const [voiceParam3, setVoiceParam3] = useState({ x: 140, y: 140 });
  const [voiceParam4, setVoiceParam4] = useState({ x: 140, y: 140 });
  const [loadingVoiceSimulation, setLoadingVoiceSimulation] = useState(false);
  const [testingVolume, setTestingVolume] = useState(0);
  const [successPopup, setSuccessPopup] = useState(false);

  const [value, setValue] = useState("");

  //sequence variable
  const [sequences, setSequences] = useState<any[]>([]);



  const simulateVoice = async (sequenceText: string) => {
    setValue("");
    setLoadingVoiceSimulation(true);

    const voiceParams = {
      warmth_confidence: {
        x: ((voiceParam1.x / 280) * 100).toFixed(2),
        y: (100 - (voiceParam1.y / 280) * 100).toFixed(2),
      },
      humor_seriousness: {
        x: ((voiceParam2.x / 280) * 100).toFixed(2),
        y: (100 - (voiceParam2.y / 280) * 100).toFixed(2),
      },
      assertiveness_empathy: {
        x: ((voiceParam3.x / 280) * 100).toFixed(2),
        y: (100 - (voiceParam3.y / 280) * 100).toFixed(2),
      },
      optimism_professionalism: {
        x: ((voiceParam4.x / 280) * 100).toFixed(2),
        y: (100 - (voiceParam4.y / 280) * 100).toFixed(2),
      },
    };

    await fetch(`${API_URL}/ml/simulate_voice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        text: sequenceText,
        voiceParams: voiceParams,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data is", data);
        setValue(data.simulated_voice);
        setVoiceBuilderOpened(true);
      })
      .catch((error) => {
        console.error("Error simulating voice", error);
      })
      .finally(() => {
        setLoadingVoiceSimulation(false);
      });
  };
  useEffect(() => {
    console.log("CURRENT PROJECT", currentProject);
    if (currentProject) {
      setPersonalizersEnabled(
        currentProject?.is_ai_research_personalization_enabled
      );
    }
  }, [currentProject]);

  const checkCanToggleLinkedin = (checkPage?: boolean) => {
    if (checkPage && window.location.href.includes("selix")) {
      return false;
    }
    if (totalContacts === 0) {
      showNotification({
        color: "red",
        title: "LinkedIn Channel",
        message: "LinkedIn channel cannot be activated without contacts.",
      });
      return false;
    }
    if (linkedinSequenceData.length === 0) {
      showNotification({
        color: "red",
        title: "LinkedIn Channel",
        message:
          "LinkedIn channel cannot be activated without LinkedIn sequences.",
      });
      return false;
    }
    if (linkedinInitialMessages.length === 0 && statsData?.template_mode) {
      showNotification({
        color: "red",
        title: "LinkedIn Channel",
        message:
          "LinkedIn channel cannot be activated without LinkedIn initial messages.",
      });
      return false;
    }
    return true;
  };

  const showSuccessPopup = () => {
    setSuccessPopup(true);
    setTimeout(() => {
      setSuccessPopup(false);
    }, 6000);
  };

  const checkCanToggleEmail = (checkPage?: boolean) => {
    if (checkPage && window.location.href.includes("selix")) {
      return false;
    }
    if (totalContacts === 0) {
      showNotification({
        color: "red",
        title: "Email Channel",
        message: "Email channel cannot be activated without contacts.",
      });
      return false;
    }
    if (emailSequenceData.length === 0) {
      showNotification({
        color: "red",
        title: "Email Channel",
        message: "Email channel cannot be activated without email sequences.",
      });
      return false;
    }
    if (emailSubjectLines.length === 0) {
      showNotification({
        color: "red",
        title: "Email Channel",
        message:
          "Email channel cannot be activated without email subject lines.",
      });
      return false;
    }
    return true;
  };
  const getTotalContacts = async () => {
    setLoadingTotalContacts(true);
    const response = await fetchTotalContacts(userToken, id);
    if (response) {
      setTotalContacts(response);
    }
    setLoadingTotalContacts(false);
  };

  const updateCampaignName = (newName: string, campaignId: number) => {
    fetch(
      `${API_URL}/client/archetype/${campaignId}/update_description_and_fit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updated_persona_name: newName,
        }),
      }
    );
  };

  const updateConnectionType = (
    newConnectionType: string,
    campaignId: number
  ) => {
    setLoadingStats(true);
    fetch(
      `${API_URL}/client/archetype/${campaignId}/update_email_to_linkedin_connection`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          email_to_linkedin_connection: newConnectionType,
        }),
      }
    )
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
  }, [
    totalContacts,
    sequences,
    loadingSequences,
    linkedinSequenceData,
    personalizers,
  ]);

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
      const totalContactsPromise = fetchTotalContacts(
        userToken,
        clientArchetypeId
      );
      refetchCampaignOtherStats();

      Promise.all([statsPromise, totalContactsPromise])
        .then(([stats, totalContacts]) => {
          const loadedStats = stats as StatsData;
          console.log("stats", loadedStats);
          setStatsData(loadedStats);
          !props.forcedCampaignId &&
            setCurrentProject(
              convertStatsDataToPersonaOverview(loadedStats as StatsData)
            );
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

  const togglePersonaChannel = async (
    campaignId: number,
    channel: "email" | "linkedin",
    userToken: string,
    active: boolean,
    dontrefresh: boolean = false
  ) => {
    if (channel === "email") {
      //check if there are email sequences and subject lines.
      //if not, show a notification that the channel cannot be activated.
      // if (emailSequenceData.length === 0 || emailSubjectLines.length === 0) {
      //   showNotification({
      //     color: "red",
      //     title: "Email Channel",
      //     message:
      //       "Email channel cannot be activated without email sequences and subject lines.",
      //   });
      //   return;
      // }
    }

    //show a warning that for email channel, if they activate, the number of sequence steps will always stay the same.
    //check localStorage if they have set the warning to not show again.
    //if not, show the warning.
    // if (!localStorage.getItem("emailChannelWarning") && active === true) {
    //   localStorage.setItem("emailChannelWarning", "true");
    // }
    // if (
    //   channel === "email" &&
    //   localStorage.getItem("emailChannelWarning") === "true" &&
    //   active === true
    // ) {
    //   setShowActivateWarningModal(true);
    //   return;
    // }

    !dontrefresh && setLoadingStats(true);
    const result = postTogglePersonaActive(
      userToken,
      campaignId,
      channel,
      active
    )
      .then((res) => {
        !dontrefresh && refetchCampaignStatsData();
      })
      .catch((error) => {
        console.error("Error toggling persona active", error);
        throw new Error("Error toggling persona active");
      })
      .finally(() => {
        !dontrefresh && setLoadingStats(false);
      });
    return result;
  };

  const handleModal = (
    type: string,
    id: number,
    campaign_name: string,
    statsData: any
  ) => {
    console.log("000000000000", type, id, campaign_name, statsData);
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

  const showOnlyHeader = props.showOnlyHeader;

  return (
    <Paper
      p={"lg"}
      maw={1150}
      h="100%"
      ml="auto"
      mr="auto"
      style={{ backgroundColor: "transparent" }}
    >
      {!showOnlyHeader && (
        <>
          <Flex
            align="center"
            mb="md"
            onClick={() => navigate("/campaigns")}
            style={{ cursor: "pointer" }}
          >
            <ActionIcon size="lg" variant="transparent">
              <IconArrowLeft size={24} />
            </ActionIcon>
            <Text size="md" fw={700} ml="xs">
              All Campaigns
            </Text>
          </Flex>
          <Modal
            size={900}
            opened={voiceBuilderOpened}
            onClose={() => setVoiceBuilderOpened(false)}
            centered
            withCloseButton={false}
            title={
              <Text weight={700} size="lg">
                AI Voice Builder
              </Text>
            }
          >
            <Grid gutter="md">
              <Grid.Col span={6}>
                <Paper
                  shadow="sm"
                  p="md"
                  style={{
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <ToneAdjuster xAxisLabel="Warmth" setVoiceParam={setVoiceParam1} voiceParam={voiceParam1} yAxisLabel="Confidence" /> */}
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  shadow="sm"
                  p="md"
                  style={{
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <ToneAdjuster xAxisLabel="Humor" setVoiceParam={setVoiceParam2} voiceParam={voiceParam2} yAxisLabel="Seriousness" /> */}
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  shadow="sm"
                  p="md"
                  style={{
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <ToneAdjuster xAxisLabel="Assertiveness" setVoiceParam={setVoiceParam3} voiceParam={voiceParam3} yAxisLabel="Empathy" /> */}
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  shadow="sm"
                  p="md"
                  style={{
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <ToneAdjuster xAxisLabel="Optimism" setVoiceParam={setVoiceParam4} voiceParam={voiceParam4} yAxisLabel="Professionalism" /> */}
                </Paper>
              </Grid.Col>
            </Grid>
            <Flex justify="center" align="center" mt="md">
              <Select
                mr="sm"
                data={
                  Array.isArray(sequences)
                    ? sequences.map((sequence, index) => ({
                        value: index.toString(),
                        label: sequence[0].title,
                      }))
                    : []
                }
                placeholder="Select Sequence"
                style={{ marginLeft: "1rem" }}
                onChange={(value) => {
                  setShowToneArea(true);
                  if (value !== null) {
                    const selectedSequence = sequences[parseInt(value)];
                    const parser = new DOMParser();
                    const parsedDescription =
                      parser.parseFromString(
                        selectedSequence[0].description,
                        "text/html"
                      ).body.textContent || "";
                    setSelectedVoiceSequence(parsedDescription);
                    setValue(parsedDescription);
                  }
                }}
              />
              <Button
                onClick={() => {
                  simulateVoice(selectedVoiceSequence);
                }}
                variant="filled"
                color="blue"
              >
                Simulate Voice
              </Button>
              <Button
                onClick={() => setVoiceBuilderOpened(false)}
                variant="filled"
                color="green"
                ml="sm"
              >
                Save Voice
              </Button>
            </Flex>
            {showToneArea && (
              <Flex justify="center" mt="md">
                {value !== "" && (
                  <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter your text here..."
                    minRows={19}
                    style={{ width: "100%" }}
                  />
                )}
                {loadingVoiceSimulation && (
                  <Loader color="grape" variant="dots" size="md" />
                )}
              </Flex>
            )}
          </Modal>

          <Modal
            opened={showActivateWarningModal}
            onClose={() => setShowActivateWarningModal(false)}
            size="md"
            centered
            withCloseButton={false}
          >
            <Paper p="lg">
              <Flex align="center" mb="md">
                <IconMailOpened size={24} color="gray" />
                <Text size="lg" fw={700} ml="xs">
                  Email Activation Notice
                </Text>
              </Flex>
              <Text size="sm" color="dimmed" mb="lg">
                • Activating the email channel will lock the number of email
                sequence steps.
                <br />
                • Once activated, the email sequence steps will be set.
                <br />• You will still have the ability to edit the content of
                the templates.
              </Text>
              <Flex justify="space-between" align="center" mt="lg">
                <Checkbox
                  defaultChecked
                  label="Remind me in the future"
                  onChange={(event) => {
                    const currentValue = localStorage.getItem(
                      "emailChannelWarning"
                    );
                    localStorage.setItem(
                      "emailChannelWarning",
                      currentValue === "false" ? "true" : "false"
                    );
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
        </>
      )}
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
          {!window.location.href.includes("selix") && (
            <Tour
              steps={steps}
              isOpen={isTourOpen}
              onRequestClose={closeTour}
            />
          )}
          {!successPopup ? (
            <Flex direction={"column"} w={"100%"}>
              {/* <Flex justify={"space-between"} align={"center"} p={"lg"} pb={0}> */}
              <Flex
                justify={"space-between"}
                p={"lg"}
                pb={0}
                direction={"column"}
              >
                <Flex
                  gap={"sm"}
                  align={"center"}
                  justify="space-between"
                  w="100%"
                >
                  <Flex justify="space-between" w="100%">
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
                            <Avatar
                              size={"sm"}
                              src={userData.img_url}
                              sx={{ borderRadius: "50%" }}
                            />
                            <Text fw={600} size={"xs"}>
                              {statsData?.sdr_name}
                            </Text>
                            <Divider orientation="vertical" />
                            <Text color="gray" size={"xs"} fw={600}>
                              Created:
                            </Text>
                            <Text fw={600} size={"xs"}>
                              {new Date(statsData.created_at).toLocaleString(
                                "en-US",
                                {
                                  dateStyle: "full",
                                }
                              )}
                            </Text>
                          </Flex>
                        }
                      >
                        {isEditingCampaignName ? (
                          <TextInput
                            value={editableText}
                            onChange={(e) =>
                              setEditableText(e.currentTarget.value)
                            }
                            onBlur={() => {
                              setIsEditingCampaignName(false);
                              setStatsData((prevData: any) => ({
                                ...prevData,
                                archetype_name: editableText,
                              }));
                              updateCampaignName(
                                editableText,
                                currentProject?.id || -1
                              );
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setIsEditingCampaignName(false);
                                setStatsData((prevData: any) => ({
                                  ...prevData,
                                  archetype_name: editableText,
                                }));
                                updateCampaignName(
                                  editableText,
                                  currentProject?.id || -1
                                );
                              }
                            }}
                            autoFocus
                            style={{ width: `${editableText.length + 2}ch` }}
                          />
                        ) : (
                          <Text
                            fw={600}
                            size={20}
                            onClick={() => {
                              setEditableText(`${statsData?.archetype_name}`);
                              setIsEditingCampaignName(true);
                            }}
                            style={{ cursor: "text" }}
                          >
                            {statsData?.emoji}{" "}
                            {statsData?.archetype_name?.substring(0, 70)}
                            {statsData?.archetype_name?.length > 70 && "..."}
                          </Text>
                        )}
                      </Tooltip>
                      <Badge
                        data-tour="campaign-status"
                        tt={"uppercase"}
                        variant="outline"
                        size="lg"
                        color={
                          status === "SETUP"
                            ? "orange"
                            : status === "ACTIVE"
                            ? "green"
                            : status === "INACTIVE"
                            ? "red"
                            : "gray"
                        }
                        ml={"sm"}
                      >
                        {status}
                      </Badge>
                    </Flex>
                    <Modal
                      opened={openGenerationCenter}
                      onClose={() => setOpenGenerationCenter(false)}
                      size="90%"
                      title={
                        <Flex
                          justify="center"
                          align="center"
                          style={{
                            width: "100%",
                            margin: "0 auto",
                            textAlign: "center",
                          }}
                        >
                          <IconSend
                            size={24}
                            color="gray"
                            style={{ marginRight: "0.5rem" }}
                          />
                          <Text fw={600} size={20} color="gray">
                            Generation Center
                          </Text>
                        </Flex>
                      }
                    >
                      <GenerationCenter />
                    </Modal>
                    {!showOnlyHeader && (
                      <Button
                        disabled={!window.location.href.includes("ishan")}
                        size="sm"
                        color="blue"
                        onClick={() => setOpenGenerationCenter(true)}
                      >
                        Generate & Send
                      </Button>
                    )}
                    {props.showLaunchButton &&
                      (statsData?.linkedin_active || statsData?.email_active ? (
                        <Flex
                          align="center"
                          color="green"
                          style={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "green",
                          }}
                        >
                          <IconCheck
                            size="1rem"
                            style={{ marginRight: "0.5rem", color: "green" }}
                          />
                          Campaign Launched
                        </Flex>
                      ) : (
                        <Button
                          size="sm"
                          color="green"
                          onClick={() => {
                            showNotification({
                              title: "Campaign Launching 🚀",
                              message:
                                "This campaign will be enabled momentarily",
                              color: "blue",
                              autoClose: 5000,
                            });
                            fetch(`${API_URL}/echo/send-slack-message`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                message: `⚠️⚠️⚠️\nUser ${statsData?.sdr_name} launched '${statsData?.archetype_name}' campaign.\n⚠️⚠️⚠️`,
                                webhook_key: "selix-sessions",
                              }),
                            });
                            (async () => {
                              setLoadingStats(true);
                              let emailSuccess = false;
                              let linkedinSuccess = false;

                              try {
                                const emailResult = await togglePersonaChannel(
                                  id,
                                  "email",
                                  userToken,
                                  true,
                                  true
                                );
                                emailSuccess = true;
                              } catch (e) {
                                console.error(
                                  "Error enabling email channel",
                                  e
                                );
                              }

                              try {
                                const linkedinResult =
                                  await togglePersonaChannel(
                                    id,
                                    "linkedin",
                                    userToken,
                                    true,
                                    true
                                  );
                                linkedinSuccess = true;
                              } catch (e) {
                                console.error(
                                  "Error enabling linkedin channel",
                                  e
                                );
                              }

                              if (emailSuccess || linkedinSuccess) {
                                showSuccessPopup();
                              }
                              refetchCampaignStatsData();
                              setLoadingStats(false);
                            })();
                          }}
                        >
                          Launch Campaign
                        </Button>
                      ))}
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
                          onChange={() => {
                            if (!checkCanToggleEmail(true)) {
                              return;
                            }
                            togglePersonaChannel(
                              id,
                              "email",
                              userToken,
                              !statsData?.email_active
                            );
                          }}
                          checked={statsData?.email_active}
                          labelPosition="left"
                          label={
                            <Flex
                              gap={1}
                              align={"center"}
                              className="hover:cursor-pointer"
                            >
                              <IconMailOpened
                                size={"1.2rem"}
                                fill="#3B85EF"
                                color="white"
                              />
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
                        <>
                          <Divider
                            variant="dashed"
                            labelPosition="center"
                            label={
                              <Hook linkedLeft={false} linkedRight={false} />
                            }
                          />
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
                          <Divider
                            variant="dashed"
                            labelPosition="center"
                            label={
                              <Hook linkedLeft={false} linkedRight={false} />
                            }
                          />
                        </>
                        <Switch
                          onChange={() => {
                            if (!checkCanToggleLinkedin(true)) {
                              return;
                            }
                            togglePersonaChannel(
                              id,
                              "linkedin",
                              userToken,
                              !statsData?.linkedin_active
                            );
                            console.log(
                              `LinkedIn channel for persona ${id} has been toggled.`
                            );
                          }}
                          checked={statsData?.linkedin_active}
                          labelPosition="left"
                          label={
                            <Flex gap={2} align={"center"}>
                              <IconBrandLinkedin
                                size={"1.4rem"}
                                fill="#3B85EF"
                                color="white"
                              />
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
                        <Tooltip label="Swap Linkedin & Email">
                          <ActionIcon
                            variant="outline"
                            color="gray"
                            onClick={() =>
                              showNotification({
                                title: "",
                                message: "Coming soon!",
                                color: "blue",
                                autoClose: 5000,
                              })
                            }
                            className=" min-w-[37px] min-h-[37px] border-[#D9DEE5]"
                          >
                            <IconArrowsLeftRight
                              color="#228be6"
                              size={"1rem"}
                            />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Paper>
                  </Flex>
                </Flex>
              </Flex>
              {!window.location.href.includes("selix") && (
                <Flex gap={"sm"} w={"100%"} justify={"center"} p={"lg"}>
                  <Paper w={"100%"} withBorder>
                    {loadingStats || !statsData ? (
                      <Flex direction="row" align="center" w="100%" my="md">
                        <Flex
                          direction="column"
                          align="center"
                          w="100%"
                          my="md"
                        >
                          <Skeleton height={50} width="80%" />
                        </Flex>
                        <Flex
                          direction="column"
                          align="center"
                          w="100%"
                          my="md"
                        >
                          <Skeleton height={50} width="80%" />
                        </Flex>
                        <Flex
                          direction="column"
                          align="center"
                          w="100%"
                          my="md"
                        >
                          <Skeleton height={50} width="80%" />
                        </Flex>
                        <Flex
                          direction="column"
                          align="center"
                          w="100%"
                          my="md"
                        >
                          <Skeleton height={50} width="80%" />
                        </Flex>
                        <Flex
                          direction="column"
                          align="center"
                          w="100%"
                          my="md"
                        >
                          <Skeleton height={50} width="80%" />
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex
                        data-tour="campaign-stats"
                        align={"center"}
                        justify={"space-between"}
                        h={"100%"}
                        w="100%"
                      >
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
                            handleModal(
                              "sent",
                              id,
                              currentProject?.name || "",
                              analyticsData
                            );
                          }}
                        >
                          <Flex align={"center"} gap={"xs"}>
                            <IconSend
                              size={"0.9rem"}
                              color="#3B85EF"
                              className="mb-[2px]"
                            />
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
                            handleModal(
                              "open",
                              id,
                              currentProject?.name || "",
                              analyticsData
                            );
                          }}
                        >
                          <Flex align={"center"} gap={6}>
                            <IconChecks
                              size={"0.9rem"}
                              color="pink"
                              className="mb-[2px]"
                            />
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
                                  {`${(
                                    (analyticsData.num_opens /
                                      (analyticsData.num_sent + 0.0001)) *
                                    100
                                  ).toFixed(0)}%`}
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
                            handleModal(
                              "reply",
                              id,
                              currentProject?.name || "",
                              analyticsData
                            );
                          }}
                        >
                          <Flex align={"center"} gap={6}>
                            <IconMessageCheck
                              size={"0.9rem"}
                              color="orange"
                              className="mb-[2px]"
                            />
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
                                  {`${(
                                    (analyticsData.num_replies /
                                      (analyticsData.num_opens + 0.0001)) *
                                    100
                                  ).toFixed(0)}%`}
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
                            handleModal(
                              "pos_reply",
                              id,
                              currentProject?.name || "",
                              analyticsData
                            );
                          }}
                        >
                          <Flex align={"center"} gap={6}>
                            <IconMessageCheck
                              size={"0.9rem"}
                              color="green"
                              className="mb-[2px]"
                            />
                            <Text fw={400} size={"sm"}>
                              (+) Reply
                            </Text>
                          </Flex>
                          <Flex align={"center"} gap={"sm"}>
                            {loadingAnalytics ? (
                              <Loader color="gray" variant="oval" size="sm" />
                            ) : (
                              <>
                                <Text fz={24}>
                                  {analyticsData.num_pos_replies}
                                </Text>
                                <Badge color="green" size="xs">
                                  {`${(
                                    (analyticsData.num_pos_replies /
                                      (analyticsData.num_replies + 0.0001)) *
                                    100
                                  ).toFixed(0)}%`}
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
                            handleModal("demo", id, "aaaa", analyticsData);
                          }}
                        >
                          <Flex align={"center"} gap={6}>
                            <IconCalendar
                              size={"0.9rem"}
                              color={"#3B85EF"}
                              className="mb-[2px]"
                            />
                            <Text fw={400}>Demo</Text>
                          </Flex>
                          <Flex align={"center"} gap={"sm"}>
                            {loadingAnalytics ? (
                              <Loader color="gray" variant="oval" size="sm" />
                            ) : (
                              <>
                                <Text fz={24}>{analyticsData.num_demos}</Text>
                                <Badge color="blue" size="xs">
                                  {`${(
                                    (analyticsData.num_demos /
                                      (analyticsData.num_pos_replies +
                                        0.0001)) *
                                    100
                                  ).toFixed(0)}%`}
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
              )}
              {!loadingContacts && activeStep !== 3 && (
                <Box
                  data-tour="campaign-progress"
                  px={"xl"}
                  py={"md"}
                  bg={"#FAFAFA"}
                >
                  {!window.location.href.includes("selix") && (
                    <Stepper active={activeStep} size="xs" iconSize={28}>
                      <Stepper.Step label="Add Contacts" />
                      <Stepper.Step label="Setup Templates" />
                      <Stepper.Step label="Add Personalizers" />
                    </Stepper>
                  )}
                </Box>
              )}
            </Flex>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="sm"
              style={{
                textAlign: "center",
                width: "100%",
                paddingTop: "16px",
                paddingBottom: "16px",
              }}
              id="success-popup"
            >
              <Box style={{ margin: "0 auto" }}>
                <IconCircleCheck size={48} color="green" />
              </Box>
              <Text size="lg" weight={500}>
                Amazing!
              </Text>
              <Text size="md">Campaign launched Successfully</Text>
              <Text size="sm">
                Campaign:{" "}
                <Anchor href="#" target="_blank">
                  {currentProject?.name}
                </Anchor>
              </Text>
            </Flex>
          )}
        </Flex>
      )}
      {!showOnlyHeader && (
        <>
          <Flex gap={"lg"} mt={"md"}>
            <Flex direction={"column"} style={{ minWidth: "28%" }} gap={"lg"}>
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
              {showVoiceBuilder && (
                <Paper mb="md" p="md" withBorder>
                  <Flex align="center" justify="space-between">
                    <Text weight={500} size="lg">
                      Voice Builder
                    </Text>
                    <Button
                      onClick={() => setVoiceBuilderOpened(true)}
                      variant="filled"
                      color="grape"
                      leftIcon={<IconSparkles size={16} />}
                    >
                      Add Voice
                    </Button>
                  </Flex>
                  <Flex direction="column" mt="md" gap="sm">
                    <Paper p="md" withBorder>
                      <Flex align="center" justify="space-between">
                        <Text>Voice Variant 1</Text>
                        <Flex align="center" gap="sm">
                          <IconEdit size={16} />
                          <IconTrash size={16} />
                          <Switch />
                        </Flex>
                      </Flex>
                    </Paper>
                    <Paper p="md" withBorder>
                      <Flex align="center" justify="space-between">
                        <Text>Voice Variant 2</Text>
                        <Flex align="center" gap="sm">
                          <IconEdit size={16} />
                          <IconTrash size={16} />
                          <Switch />
                        </Flex>
                      </Flex>
                    </Paper>
                    <Paper p="md" withBorder>
                      <Flex align="center" justify="space-between">
                        <Text>Voice Variant 3</Text>
                        <Flex align="center" gap="sm">
                          <IconEdit size={16} />
                          <IconTrash size={16} />
                          <Switch />
                        </Flex>
                      </Flex>
                    </Paper>
                  </Flex>
                </Paper>
              )}
              <Paper data-tour="contacts" withBorder w={"100%"}>
                <ContactsInfiniteScroll
                  campaignId={Number(id)}
                  getTotalContacts={getTotalContacts}
                  totalContacts={totalContacts}
                  loadingTotalContacts={loadingTotalContacts}
                />
              </Paper>
              <Paper></Paper>
            </Flex>
            <Flex
              direction={"column"}
              gap={"md"}
              style={{ maxWidth: "75%", minWidth: "75%" }}
            >
              <SequencesV2
                checkCanToggleEmail={checkCanToggleEmail}
                togglePersonaChannel={togglePersonaChannel}
                statsData={statsData}
                checkCanToggleLinkedin={checkCanToggleLinkedin}
                updateConnectionType={updateConnectionType}
              />
              {/* <Sequences */}
              {/*   setSequences={setSequences} */}
              {/*   // emailSequenceData={emailSequenceData} */}
              {/*   // linkedinSequenceData={linkedinSequenceData} */}
              {/*   // setEmailSequenceData={setEmailSequenceData} */}
              {/*   // setLinkedinSequenceData={setLinkedinSequenceData} */}
              {/*   setEmailSubjectLines={setEmailSubjectLines} */}
              {/*   emailSubjectLines={emailSubjectLines} */}
              {/*   setLinkedinInitialMessages={setLinkedinInitialMessages} */}
              {/*   linkedinInitialMessages={linkedinInitialMessages} */}
              {/* /> */}
              <Personalizers
                ai_researcher_id={statsData?.ai_researcher_id}
                sequences={emailSequenceData || []}
                setPersonalizers={setPersonalizers}
                personalizers={personalizers}
              />
            </Flex>
          </Flex>
        </>
      )}
    </Paper>
  );
}
