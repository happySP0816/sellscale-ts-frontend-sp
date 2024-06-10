import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Text,
  Loader,
  Skeleton,
  TextInput,
  Timeline,
  Title,
  Tooltip,
  Modal,
  List,
  Stepper,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import Hook from "@pages/channels/components/Hook";
import Tour from 'reactour'
import { API_URL } from "@constants/data";
import {
  IconArrowRight,
  IconBrandLinkedin,
  IconCalendar,
  IconCheck,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleLetterI,
  IconCopy,
  IconEdit,
  IconFilter,
  IconMailOpened,
  IconMessages,
  IconPlus,
  IconPoint,
  IconQuestionMark,
  IconRefresh,
  IconSearch,
  IconSend,
  IconSettings,
  IconTrafficCone,
  IconTrash,
} from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import {
  fetchCampaignPersonalizers,
  patchTestingVolume,
  fetchCampaignSequences,
  fetchCampaignStats,
  fetchTotalContacts,
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
import SubjectDropdown from "@common/campaigns/SubjectDropdown";

interface StatsData {
  id: number;
  is_setting_up: boolean;
  archetype_name: string;
  created_at: string;
  emoji: string;
  testing_volume: number;
  num_demos: number;
  active: boolean;
  email_to_linkedin_connection?: string;
  ai_researcher_id?: number;
  sdr_img_url: string;
  num_opens: number;
  num_prospects: number;
  num_prospects_with_emails: number;
  email_active: boolean;
  linkedin_active: boolean;
  num_replies: number;
  num_pos_replies: number;
  num_sent: number;
  sdr_name: string;
  is_ai_research_personalization_enabled: boolean;
}

const steps = [
  {
    selector: '[data-tour="campaign-tutorial"]',
    content: 'Welcome to the campaign page! This tutorial will guide you through the key features and functionalities of the campaign management system.',
  },
  {
    selector: '[data-tour="campaign-status"]',
    content: 'This is the campaign status. You can see if the campaign is active or inactive here.',
  },
  {
    selector: '[data-tour="campaign-stats"]',
    content: 'Here you can see various statistics about your campaign, such as the number of emails sent, opened, and replied to.',
  },
  {
    selector: '[data-tour="outreach-volume"]',
    content: 'This slider allows you to set the outreach volume for your campaign.',
  },
  {
    selector: '[data-tour="campaign-progress"]',
    content: 'This section shows the progress of your campaign setup.',
  },
  {
    selector: '[data-tour="contacts"]',
    content: 'This section allows you to add and manage your contacts. You can import contacts and view their details',
  },
  {
    selector: '[data-tour="sequences"]',
    content: 'Here you can manage and organize the sequences of emails and LinkedIn messages that will be sent out as part of your campaign.',
  },
  {
    selector: '[data-tour="personalizers"]',
    content: 'This section allows you to manage your personalizers for the campaign.',
  },
  {
    selector: '[data-tour="personalizer-enabled"]',
    content: 'Activate SellScale AI for deep prospect research and dynamic personalized engagement!',
  }
];

export default function CampaignLandingV2() {

  useEffect(() => {
    const tourSeen = localStorage.getItem('campaignTourSeen');
    if (!tourSeen) {
      setIsTourOpen(true);
    }
  }, []);

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('campaignTourSeen', 'true');
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

  console.log("======", userData);

  const getIcpFitBadge = (icp_fit_score: number) => {
    let label = "";
    let color = "";

    switch (icp_fit_score) {
      case 4:
        label = "Very High";
        color = "green";
        break;
      case 3:
        label = "High";
        color = "blue";
        break;
      case 2:
        label = "Medium";
        color = "yellow";
        break;
      case 1:
        label = "Low";
        color = "orange";
        break;
      case 0:
        label = "Very Low";
        color = "red";
        break;
      case -1:
        label = "Do Not Contact";
        color = "gray";
        break;
      default:
        label = "Unknown";
        color = "gray";
        break;
    }

    return <Badge color={color}>{label}</Badge>;
  };

  const id = Number(useParams().id);
  const [templates, setTemplates] = useState([]);
  const [personalizers, setPersonalizers] = useState([]);
  const [personalizersEnabled, setPersonalizersEnabled] = useState(currentProject?.is_ai_research_personalization_enabled);
  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);
  const [status, setStatus] = useState("SETUP");
  const [isTourOpen, setIsTourOpen] = useState(false);

  //testing per cycle value
  const [cycleStatus, setCycleStatus] = useState(false);

  //contact variable
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactPercent, setContactPercent] = useState(40);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loadingTotalContacts, setLoadingTotalContacts] = useState(true);

  const MAX_CONTACTS = 2147483647;

  // Loading states
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingSequences, setLoadingSequences] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPersonalizers, setLoadingPersonalizers] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const userToken = useRecoilValue(userTokenState);

  const [contactsData, setContactsData] = useState<any[]>([]);
  const [emailSequenceData, setEmailSequenceData] = useState<any[]>([]);
  const [linkedinSequenceData, setLinkedinSequenceData] = useState<any[]>([]);
  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any[]>([]);
  const [emailSubjectLines, setEmailSubjectLines] = useState<SubjectLineTemplate[]>([]);
  const [linkedinInitialMessageViewing, setLinkedinInitialMessageViewing] = useState<any>(0);
  const [emailSequenceViewingArray, setEmailSequenceViewingArray] = useState<any[]>([]);
  const [linkedinSequenceViewingArray, setLinkedinSequenceViewingArray] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [showActivateWarningModal, setShowActivateWarningModal] = useState(false);
  const [showCampaignTemplateModal, setShowCampaignTemplateModal] = useState(false);
  const [testingVolume, setTestingVolume] = useState(0);
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [showPersonalizerModal, setShowPersonalizerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLinkedInConvoSimulatorModal, setShowLinkedInConvoSimulatorModal] = useState(false);

  const [value, setValue] = useState("");

  const [active, setActive] = useState(1);

  //sequence variable
  const [sequences, setSequences] = useState<any[]>([]);
  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);
  const [type, setType] = useState("email");
  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

  useEffect(() => {
    console.log("CURRENT PROJECT", currentProject);
    if (currentProject) {
      setPersonalizersEnabled(currentProject?.is_ai_research_personalization_enabled);
    }
  }, [currentProject]);

  const updatePersonalizersEnabled = (enabled: boolean) => {
    fetch(`${API_URL}/client/archetype/${id}/update_personalizers_enabled`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        personalizers_enabled: enabled,
      }),
    })
      .then((response) => {
        showNotification({
          title: "Personalizers Enabled",
          message: `Personalizers have been ${enabled ? "enabled" : "disabled"}`,
        });
        setPersonalizersEnabled(enabled);
      })
      .catch((error) => {
        console.error("Error updating personalizers enabled", error);
      });
  };

  const editSequenceBumpCount = (index: number, value: string) => {
    //todo: make this change the value in the backend.

    // fetch(`${API_URL}/bump_framework/bump`, {
    //   method: "PATCH",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${userToken}`,
    //     },
    //     body: JSON.stringify({
    //       bump_framework_id: sequences[index].bump_framework_id,
    //       bumped_count: Number(value)
    //     }),
    //   })
    const newSequences = [...sequences];
    newSequences[index].bumped_count = Number(value);
    setSequences(newSequences);
  };

  const getTotalContacts = async () => {
    setLoadingTotalContacts(true);
    const response = await fetchTotalContacts(userToken, id);
    if (response) {
      setTotalContacts(response);
    }
    setLoadingTotalContacts(false);
  };

  const getPersonalizers = async () => {
    setLoadingPersonalizers(true);
    const clientArchetypeId = Number(id);
    const response = await fetchCampaignPersonalizers(userToken, clientArchetypeId);
    if (response) {
      setPersonalizers(response.questions);
    }
    setLoadingPersonalizers(false);
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
        //set the setup status
        if (loadedStats.is_setting_up) {
          setStatus("SETUP");
        }
        else if (loadedStats.active && loadedStats.num_sent > 0) {
          setStatus("ACTIVE");
        }
        else if (loadedStats.active === false) {
        setStatus("INACTIVE");
        }
        setLoadingStats(false);
      })
      .catch((error) => {
        console.error("Error fetching stats or contacts", error);
        setLoadingStats(false);
      });
  };

  const refetchSequenceData = async (clientArchetypeId: number) => {
    setLoadingSequences(true);
    const sequencesPromise = fetchCampaignSequences(userToken, clientArchetypeId);
    sequencesPromise
      .then((sequencesData) => {
        setEmailSubjectLines(sequencesData.email_subject_lines);
        setLinkedinInitialMessages(sequencesData.initial_message_templates);
        setLinkedinInitialMessageViewing(sequencesData.initial_message_templates?.[0]?.title);
        const groupSequencesByBumpedCount = (sequences: any[]) =>
          sequences.reduce((acc: any, sequence: any) => {
            let bumpedCount = sequence.bumped_count || 0;
            const statusAdjustment =
              sequence.overall_status === "PROSPECTED" ? 0 : sequence.overall_status === "ACCEPTED" ? 10 : sequence.overall_status === "BUMPED" ? 20 : 0;
            bumpedCount += statusAdjustment;
            if (!acc[bumpedCount]) acc[bumpedCount] = [];
            acc[bumpedCount].push(sequence);
            return acc;
          }, {});

        const orderGroupedSequences = (groupedSequences: any) =>
          Object.keys(groupedSequences)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => groupedSequences[key]);

        console.log('sequences are', sequencesData.email_sequence, sequencesData.linkedin_sequence)

        const handleSequences = (sequences: any[], type: string) => {
          const groupedSequences = groupSequencesByBumpedCount(sequences);
          const orderedGroupedSequences = orderGroupedSequences(groupedSequences);
          setSequences(orderedGroupedSequences);
          console.log("orderedGroupedSequences", orderedGroupedSequences);
          setType(type);
          if (type === "linkedin") {
            setLinkedinSequenceViewingArray(orderedGroupedSequences.map((group) => group[0].title));
            setLinkedinSequenceData(orderedGroupedSequences);
          } else {
            setEmailSequenceViewingArray(orderedGroupedSequences.map((group) => group[0].title));
            setEmailSequenceData(orderedGroupedSequences);
          }
        };

        if (sequencesData.linkedin_sequence.length > 0 && sequencesData.email_sequence.length === 0) {
          handleSequences(sequencesData.linkedin_sequence, "linkedin");
        } else if (sequencesData.email_sequence.length > 0 && sequencesData.linkedin_sequence.length === 0) {
          handleSequences(sequencesData.email_sequence, "email");
        } else if (sequencesData.email_sequence.length > 0 && sequencesData.linkedin_sequence.length > 0) {
          handleSequences(sequencesData.email_sequence, "email");
          setLinkedinSequenceViewingArray(orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.linkedin_sequence)).map((group) => group[0].title));
          setLinkedinSequenceData(orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.linkedin_sequence)));
          console.log("linkedin is", orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.linkedin_sequence)));
          console.log("emailSequenceData", orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.email_sequence)));
        } else {
          setSequences([]);
          setType("email");
          setEmailSequenceData([]);
          setLinkedinSequenceData([]);
          setEmailSequenceViewingArray([]);
          setLinkedinSequenceViewingArray([]);
        }
        setLoadingSequences(false);
      })
      .catch((error) => {
        console.error("Error fetching sequences", error);
        setLoadingSequences(false);
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
      getPersonalizers();
      refetchSequenceData(clientArchetypeId);

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
          //set the setup status
          if (loadedStats.is_setting_up) {
            setStatus("SETUP");
          } else if (loadedStats.active) {
            setStatus("ACTIVE");
          } else if (loadedStats.active === false) {
            setStatus("INACTIVE");
          }
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

  const togglePersona = async (persona: StatsData, userToken: string) => {
    setLoadingStats(true);
    let response;
    if (persona.active) {
      response = await deactivatePersona(userToken, id);
    } else {
      response = await activatePersona(userToken, id);
    }

    if (response) {
      setStatsData((prev) => {
        if (prev) {
          return {
            ...prev,
            active: !prev.active,
          };
        }
        return prev;
      });
      if (persona.active) {
        setStatus("INACTIVE");
      } else if (!persona.active && persona.num_sent > 0) {
        setStatus("ACTIVE");
      } else if (!persona.active && persona.num_sent === 0) {
        setStatus("SETUP");
      }
    }
    setLoadingStats(false);
  };

  const togglePersonaChannel = async (campaignId: number, channel: "email" | "linkedin", userToken: string, active: boolean) => {
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
      <Modal opened={showSettingsModal} onClose={() => setShowSettingsModal(false)} size="350px">
        <Title mb="xl" size={"sm"} align="center">
          Campaign Settings
        </Title>
        <Flex direction="column" align="center" gap="md">
          <Flex justify="center" align="center" gap="xs" w="100%">
            <Flex align="center" gap="xs">
              <Text>Campaign Status:</Text>
              <Text>{statsData?.active ? "Active" : "Inactive"}</Text>
              <Switch
                checked={statsData?.active}
                onChange={() => {
                  togglePersona(statsData as StatsData, userToken);
                  setShowSettingsModal(false);
                }}
                color={statsData?.active ? "green" : "red"}
              />
            </Flex>
          </Flex>
          <Button
            variant="light"
            color="blue"
            onClick={() => {
              // Duplicate Campaign logic here
              setShowSettingsModal(false);
            }}
          >
            Duplicate Campaign
          </Button>
        </Flex>
      </Modal>
      {/* <Modal
        opened={showActivateWarningModal}
        size="600px"
        onClose={() => setShowActivateWarningModal(false)}
        >
      <Flex direction="column" align="center" gap="md">
        <Title size="lg" align="center" color="blue">
          Just a sec!
        </Title>
        <Text size="md" align="center">
          Before you can activate this campaign, please ensure the following:
        </Text>
        <List spacing="sm" size="md" center>
          {(!statsData?.email_active && !statsData?.linkedin_active) && (
            <List.Item>
              <Text color="black">Enable either Email or LinkedIn Sequences.</Text>
            </List.Item>
          )}
          {statsData?.email_active && emailSequenceData.length === 0 && (
            <List.Item>
              <Text color="black">Add an email sequence.</Text>
            </List.Item>
          )}
          {statsData?.linkedin_active && linkedinSequenceData.length === 0 && (
            <List.Item>
              <Text color="black">Add a LinkedIn sequence.</Text>
            </List.Item>
          )}
        </List>
      </Flex>
      </Modal> */}
      <Modal
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
      </Modal>
      <Modal
        opened={showPersonalizerModal}
        onClose={() => {
          getPersonalizers();
          setShowPersonalizerModal(false);
        }}
        size="1100px"
      >
        <iframe
          src={`https://sellscale.retool.com/embedded/public/46e04a30-838d-4dcb-872c-1d3bca6e6757#authToken=${userToken}&campaignId=${id}&embedMode=true`}
          width="100%"
          height="800px"
          style={{ border: "none" }}
        ></iframe>
      </Modal>
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
        <Tour
        steps={steps}
        isOpen={isTourOpen}
        onRequestClose={closeTour} />
          <Flex direction={"column"} w={"100%"}>
            {/* <Flex justify={"space-between"} align={"center"} p={"lg"} pb={0}> */}
            <Flex justify={"space-between"} p={"lg"} pb={0} direction={"column"}>
              <Flex gap={"sm"} align={"center"} justify="space-between" w="100%">
                <Flex gap={"sm"} align={"center"}>
                  {statsData?.emoji}
                  <Text fw={600} size={20}>
                    {statsData?.archetype_name}
                  </Text>
                  <Button
                    data-tour="campaign-status"
                    tt={"uppercase"}
                    variant="light"
                    size="xs"
                    disabled={status === "INACTIVE" && true}
                    color={status === "SETUP" ? "orange" : status === "ACTIVE" ? "green" : ""}
                    // onClick={() => {
                    //   if (status === "SETUP")
                    //   else if (status === "ACTIVE") {
                    //     setStatus("ACTIVE");
                    //   }
                    // }}
                  >
                    {status}
                  </Button>
                </Flex>
                <ActionIcon variant="light" color="gray" onClick={() => setShowSettingsModal(true)}>
                  <IconSettings size={"1.2rem"} />
                </ActionIcon>
              </Flex>
              <Flex align={"center"} gap={"xs"}>
                <Text color="gray" size={"xs"} fw={600}>
                  Created by:
                </Text>
                <Avatar size={"sm"} src={proxyURL(statsData.sdr_img_url)} sx={{ borderRadius: "50%" }} />
                <Text fw={600} size={"xs"}>
                  {statsData?.sdr_name}
                </Text>
                <Divider orientation="vertical" h={"70%"} my={"auto"} />
                <Text color="gray" size={"xs"} fw={600}>
                  Created:
                </Text>
                <Text fw={600} size={"xs"}>
                  {new Date(statsData.created_at).toLocaleString("en-US", {
                    dateStyle: "full",
                  })}
                </Text>
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
                        handleModal("sent", id, "aaaa", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={"xs"}>
                        <IconSend size={"0.9rem"} color="#3B85EF" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          Sent
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <Text fz={24}>{statsData.num_sent}</Text>
                        <Badge color={"#3B85EF"} size="xs">
                          {`${(100).toFixed(0)}%`}
                        </Badge>
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
                        handleModal("open", id, "aaaa", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconChecks size={"0.9rem"} color="pink" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          Open
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <Text fz={24}>{statsData.num_opens}</Text>
                        <Badge color="pink" size="xs">
                          {`${((statsData.num_opens / (statsData.num_sent + 0.0001)) * 100).toFixed(0)}%`}
                        </Badge>
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
                        handleModal("reply", id, "aaaa", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconMessageCheck size={"0.9rem"} color="orange" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          Reply
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <Text fz={24}>{statsData.num_replies}</Text>
                        <Badge color="orange" size="xs">
                          {`${((statsData.num_replies / (statsData.num_opens + 0.0001)) * 100).toFixed(0)}%`}
                        </Badge>
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
                        handleModal("pos_reply", id, "aaaa", statsData);
                      }}
                    >
                      <Flex align={"center"} gap={6}>
                        <IconMessageCheck size={"0.9rem"} color="green" className="mb-[2px]" />
                        <Text fw={400} size={"sm"}>
                          (+) Reply
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <Text fz={24}>{statsData.num_pos_replies}</Text>
                        <Badge color="green" size="xs">
                          {`${((statsData.num_pos_replies / (statsData.num_replies + 0.0001)) * 100).toFixed(0)}%`}
                        </Badge>
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
                        <Text fz={24}>{statsData.num_demos}</Text>
                        <Badge color="blue" size="xs">
                          {`${((statsData.num_demos / (statsData.num_pos_replies + 0.0001)) * 100).toFixed(0)}%`}
                        </Badge>
                      </Flex>
                    </Box>
                  </Flex>
                )}
              </Paper>
              <Flex data-tour="outreach-volume" w={"60%"}>
                <Paper p="md" withBorder w={"100%"}>
                  <Flex justify={"space-between"}>
                    <Flex justify={"space-between"}>
                      <Text size={"xs"} fw={500}>
                        Outreach Volume
                      </Text>
                      <Tooltip
                        multiline
                        label={
                          <Text size="sm">
                            SellScale will initiate weekly interactions
                            <br />
                            with this specified number of contacts,
                            <br />
                            determined by the imported contacts
                            <br /> and the capacity of your account.
                            <br></br>
                          </Text>
                        }
                        withArrow
                        position="right"
                      >
                        <Text color="#37414E" size="xs">
                          <IconQuestionMark size={"0.75rem"} color="#37414E" />
                        </Text>
                      </Tooltip>
                    </Flex>
                    <Text size={"xs"} fw={500}>
                      {testingVolume === MAX_CONTACTS || (testingVolume === 1000 && totalContacts < 1000) ? "Max/week" : `${testingVolume}/week`}{" "}
                      {cycleStatus && (
                        <Text component="span" color="red" size="xs" fw={700} ml={4}>
                          (Unsaved)
                        </Text>
                      )}
                      <Text component="span" underline color="#228be6" size="xs" fw={700} ml={4}>
                        Analytics
                      </Text>
                    </Text>
                  </Flex>
                  <Flex w={"100%"} align={"start"} gap={"sm"} mt={"md"}>
                    <Slider
                      w={"100%"}
                      value={testingVolume}
                      onChange={(value) => {
                        setCycleStatus(true);
                        setTestingVolume(value);
                      }}
                      max={totalContacts > 1000 ? totalContacts : 1000}
                      marks={[
                        { value: 0, label: "0" },
                        {
                          value: totalContacts > 1000 ? totalContacts : 1000,
                          label: (
                            <div
                              style={{
                                whiteSpace: "nowrap",
                              }}
                            >
                              Max
                            </div>
                          ),
                        },
                      ]}
                      label={(value) => (totalContacts < 1000 && value === 1000 ? "Max" : value)}
                    ></Slider>
                    <Button
                      disabled={!cycleStatus}
                      onClick={async () => {
                        const clientArchetypeId = Number(id);
                        const response = await patchTestingVolume(
                          userToken,
                          clientArchetypeId,
                          testingVolume
                        );
                        if (response) {
                          console.log("Testing volume updated successfully", response);
                        }
                        setLoadingStats(true);
                        await fetchCampaignStats(userToken, clientArchetypeId);
                        setLoadingStats(false);
                        setCycleStatus(false);
                      }}
                    >
                      Save
                    </Button>
                  </Flex>
                </Paper>
              </Flex>
            </Flex>
            {(!loadingContacts && activeStep !== 3) && <Box data-tour="campaign-progress" px={"xl"} py={"md"} bg={"#ECECEC"}>
              <Stepper active={activeStep} size="xs" iconSize={28}>
                <Stepper.Step label="Add Contacts" />
                <Stepper.Step label="Setup Templates" />
                <Stepper.Step label="Add Personalizers" />
              </Stepper>
            </Box>}
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
          <Paper data-tour="sequences"  withBorder>
            <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
              <Flex align="center" gap="xs">
                <Text fw={600} size={20} color="#37414E">
                  Sequences
                </Text>
                <Tooltip
                  label={
                    <Text size="sm">
                      Generate or manually create custom sequences to guide your outreach strategy.
                      <br></br>
                    </Text>
                  }
                  withArrow
                  position="right"
                >
                  <Text color="#37414E" size="xs">
                    <IconQuestionMark size={"1rem"} color="#37414E" />
                  </Text>
                </Tooltip>
                {/* {sequences && sequences.length > 0 && ( */}
                {sequences && (
                  <SegmentedControl
                    value={type}
                    onChange={(value: any) => {
                      setType(value);
                      if (value === "email") {
                        setSequences(emailSequenceData);
                      } else {
                        setSequences(linkedinSequenceData);
                      }
                    }}
                    data={[
                      {
                        value: "email",
                        label: (
                          <Center style={{ gap: 4 }}>
                            <IconMailOpened size={"1.2rem"} fill="orange" color="white" />
                            <Text fw={500}>Email</Text>
                          </Center>
                        ),
                      },
                      {
                        value: "linkedin",
                        label: (
                          <Center style={{ gap: 4 }}>
                            <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                            <Text fw={500}>Linkedin</Text>
                          </Center>
                        ),
                      },
                    ]}
                  />
                )}
              </Flex>
              {/* {sequences && sequences.length > 0 ? ( */}
              {sequences ? (
                <Flex gap={"sm"}>
                  <Button
                    leftIcon={<IconPlus size={"0.9rem"} />}
                    onClick={() => {
                      openContextModal({
                        modal: "campaignTemplateEditModal",
                        title: <Title order={3}>Sequence Builder</Title>,
                        innerProps: {
                          emailSubjectLines,
                          linkedinSequenceData,
                          emailSequenceData,
                          campaignId: id,
                          createTemplateBuilder,
                          refetchSequenceData,
                          setCreateTemplateBuilder,
                          // setSequences,
                        },
                        centered: true,
                        styles: {
                          content: {
                            minWidth: "1100px",
                          },
                        },
                        onClose: () => {
                          const clientArchetypeId = Number(id);
                          refetchSequenceData(clientArchetypeId);
                        },
                      });
                    }}
                  >
                    Add
                  </Button>
                  {/* {type === "linkedin" && ( */}
                  <Button
                    variant="outline"
                    rightIcon={<IconArrowRight size={"0.9rem"} />}
                    // onClick={() => {
                    //   setShowLinkedInConvoSimulatorModal(true);
                    // }}
                    onClick={() => {
                      window.open(`/setup/${type}/${id}`, "_blank");
                    }}
                  >
                    Edit & Simulate
                  </Button>
                  {/* )} */}
                  {/* <Button
                    onClick={() => {
                      openContextModal({
                        modal: "campaignTemplateModal",
                        title: <Title order={3}>{createTemplateBuilder ? "Template Builder" : "Template"}</Title>,
                        innerProps: {
                          campaignId: id,
                          createTemplateBuilder,
                          setCreateTemplateBuilder,
                          setSequences,
                        },
                        centered: true,
                        styles: {
                          content: {
                            minWidth: "1100px",
                          },
                        },
                        onClose: () => {
                          const clientArchetypeId = Number(id);
                          refetchSequenceData(clientArchetypeId);
                        },
                      });
                    }}
                  >
                    Edit
                  </Button> */}
                </Flex>
              ) : (
                <Button
                  leftIcon={<IconPlus size={"0.9rem"} />}
                  onClick={() => {
                    openContextModal({
                      modal: "campaignTemplateModal",
                      title: <Title order={3}>{createTemplateBuilder ? "Template Builder" : "Template"}</Title>,
                      innerProps: {
                        campaignId: id,
                        createTemplateBuilder,
                        setCreateTemplateBuilder,
                        setSequences,
                      },
                      centered: true,
                      styles: {
                        content: {
                          minWidth: "1100px",
                        },
                      },
                    });
                  }}
                >
                  Add
                </Button>
              )}
            </Flex>
            <Flex>
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
                        label: "[❌] No Connection",
                        value: "RANDOM",
                      },
                      {
                        label: "[📧 → 🤝] Sent Only - ",
                        value: "ALL_PROSPECTS",
                      },
                      {
                        label: "[👀 → 🤝] Opened Only - ",
                        value: "OPENED_EMAIL_PROSPECTS_ONLY",
                      },
                      {
                        label: "[⚡️ → 🤝] Clicked Only - ",
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
            <Flex h={"20%"} mt={"md"}>
              {loadingSequences ? (
                <Flex direction="column" align="center" justify="center" m="auto" mt="sm">
                  <Skeleton height={30} radius="xl" width="80%" />
                  <Skeleton height={20} radius="xl" width="60%" mt="sm" />
                  <Skeleton height={20} radius="xl" width="60%" mt="sm" />
                  <Flex align="center" gap="sm" mt="sm">
                    <Loader color="gray" variant="dots" size="md" />
                    <Text color="gray" size="md" className="loading-animation">
                      Loading sequences...
                    </Text>
                  </Flex>
                </Flex>
              ) : sequences && sequences.length > 0 ? (
                <Flex direction={"column"} h={"fit-content"} w={"100%"}>
                  <Flex w={"100%"} gap={"md"} direction={"column"} p={"lg"}>
                    {type === "linkedin" && linkedinInitialMessages && linkedinInitialMessages.length > 0 && (
                      <Box
                        style={{
                          border: "1px solid #ced4da",
                          borderRadius: "8px",
                          marginBottom: "1rem",
                        }}
                      >
                        <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                          <Flex mx="lg" align={"center"} gap={"xs"}>
                            <IconMessages color="#228be6" size={"0.9rem"} />
                            <Text color="gray" fw={500} size={"xs"}>
                              Initial Message:
                            </Text>
                            <Select
                              defaultValue={linkedinInitialMessages[0].title}
                              onChange={(value) => setLinkedinInitialMessageViewing(value)}
                              data={linkedinInitialMessages.map((option: any) => ({
                                value: option.title,
                                label: option.title,
                              }))}
                              size="xs"
                              styles={{ root: { marginLeft: "-5px" }, input: { fontWeight: 600 } }}
                            />
                          </Flex>
                        </Flex>
                        <Collapse in={true}>
                          <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
                            <Avatar size={"md"} radius={"xl"} src={linkedinInitialMessages[0]?.avatar} />
                            <Box>
                              <Text fw={600} size={"sm"}>
                                {linkedinInitialMessages[0]?.name}
                              </Text>
                              <Text fw={500} size={"xs"}>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: linkedinInitialMessages
                                      .find((msg: any) => msg.title === linkedinInitialMessageViewing)
                                      ?.message.replace(/\n/g, "<br/>"),
                                  }}
                                />
                              </Text>
                            </Box>
                          </Flex>
                        </Collapse>
                      </Box>
                    )}
                    {sequences.map((item: any, index: number) => {
                      return (
                        <>
                          <Box
                            style={{
                              border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da",
                              borderRadius: "8px",
                            }}
                          >
                            <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                              <Flex mx="lg" align={"center"} gap={"xs"}>
                                <IconMessages color="#228be6" size={"0.9rem"} />
                                <Text color="gray" fw={500} size={"xs"}>
                                  {`Step #${index + 1}:`}
                                </Text>
                                <Select
                                  value={type === "email" ? emailSequenceViewingArray[index] : linkedinSequenceViewingArray[index]}
                                  onChange={(value) => {
                                    if (type === "email") {
                                      setEmailSequenceViewingArray((prevArray) => {
                                        const newArray = [...prevArray];
                                        newArray[index] = value;
                                        console.log(newArray);
                                        return newArray;
                                      });
                                    } else if (type === "linkedin") {
                                      setLinkedinSequenceViewingArray((prevArray) => {
                                        const newArray = [...prevArray];
                                        newArray[index] = value;
                                        console.log(newArray);
                                        return newArray;
                                      });
                                    }
                                  }}
                                  data={
                                    Array.isArray(item)
                                      ? item.map((option: any) => ({
                                          value: option.title,
                                          label: option.title,
                                        }))
                                      : []
                                  }
                                  size="xs"
                                  styles={{ root: { marginLeft: "-5px" }, input: { fontWeight: 600 } }}
                                />
                              </Flex>
                              <Flex gap={1} align={"center"}>
                                <Badge variant="outline" leftSection={<IconPoint fill="green" color="white" className="mt-1" />}>
                                  active
                                </Badge>
                                <ActionIcon
                                  onClick={() => {
                                    handleToggle(index);
                                  }}
                                >
                                  {selectStep === index && opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
                                </ActionIcon>
                              </Flex>
                            </Flex>
                            <Collapse in={selectStep === index && opened} key={index}>
                              <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
                                <Avatar size={"md"} radius={"xl"} src={item?.avatar} />
                                <Box>
                                {type === "email" && index === 0 && <SubjectDropdown subjects={emailSubjectLines.map((line: any) => line.subject_line)}/>}
                                  <Text fw={600} size={"sm"}>
                                    {item?.name}
                                  </Text>
                                  <Text fw={500} size={"xs"}>
                                    {type === "email" ? (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: Array.isArray(item) && item.find((i: any) => i.title === emailSequenceViewingArray[index])?.description,
                                        }}
                                      />
                                    ) : (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            Array.isArray(item) &&
                                            item.find((i: any) => i.title === linkedinSequenceViewingArray[index])?.description.replace(/\n/g, "<br/>"),
                                        }}
                                      />
                                    )}
                                  </Text>
                                </Box>
                              </Flex>
                              <Divider variant="dashed" w={"100%"} />
                              <Flex p={"lg"} justify={"space-between"}>
                                <Flex gap={"sm"}>
                                  {/* <Badge color="grape">{item.point_used} Research Points Used</Badge> */}
                                  {item.assets && item.assets.length > 0 && <Badge color="grape">{item.assets.length} Assets Used</Badge>}
                                </Flex>
                                {/* <Flex gap={"sm"}>
                                  <Badge
                                    variant="outline"
                                    color="gray"
                                    leftSection={<IconCircleCheck size={"0.9rem"} fill="green" color="white" className="mt-1" />}
                                  >
                                    Opened: {item.opened}%
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    color="gray"
                                    leftSection={<IconCircleCheck size={"0.9rem"} fill="green" color="white" className="mt-1" />}
                                  >
                                    Replied: {item.replied}%
                                  </Badge>
                                </Flex> */}
                              </Flex>
                            </Collapse>
                          </Box>
                        </>
                      );
                    })}
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  mb="xl"
                  direction="column"
                  align="center"
                  justify="center"
                  m="auto"
                  sx={(theme) => ({
                    border: "2px dotted gray",
                    borderRadius: "15px",
                    padding: "10px", // Reduced padding to make the area less height
                    cursor: "pointer",
                    transition: "transform 0.2s, background-color 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      backgroundColor: theme.colors.gray[0],
                    },
                  })}
                  onClick={() => {
                    openContextModal({
                      modal: "campaignTemplateEditModal",
                      title: <Title order={3}>Sequence Builder</Title>,
                      innerProps: {
                        emailSubjectLines,
                        linkedinSequenceData,
                        emailSequenceData,
                        campaignId: id,
                        createTemplateBuilder,
                        setCreateTemplateBuilder,
                        setSequences,
                      },
                      centered: true,
                      styles: {
                        content: {
                          minWidth: "1100px",
                        },
                      },
                      onClose: () => {
                        const clientArchetypeId = Number(id);
                        refetchSequenceData(clientArchetypeId);
                      },
                    });
                  }}
                >
                  <Flex align="center" gap="xs">
                    <Text color="gray" fw={400} size={"sm"}>
                      There are no sequences here. Add one to get started.
                    </Text>
                    <ActionIcon>
                      <IconPlus size={"1.2rem"} />
                    </ActionIcon>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Paper>
          <Paper data-tour="personalizers" withBorder>
            <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
              <Flex gap={"sm"} align={"center"}>
                <Flex align="center" gap="xs">
                  <Text fw={600} size={20} color="#37414E">
                    Personalizers
                  </Text>
                  <Tooltip
                    label={
                      <Text size="sm">
                        Create hyper-relevant outreach strategies <br></br>using AI-powered research for personalized engagement.
                      </Text>
                    }
                    withArrow
                    position="right"
                  >
                    <Text color="#37414E" size="xs">
                      <IconQuestionMark size={"1rem"} color="#37414E" />
                    </Text>
                  </Tooltip>
                </Flex>
              </Flex>
              <Flex data-tour="personalizer-enabled" gap={"sm"} align={"center"}>
                <Switch
                  labelPosition="left"
                  label={
                    <Flex gap={"md"} align={"center"}>
                      <Text fw={600} size="12px" miw="100px">
                        ✨ Enable Personalizers
                      </Text>
                    </Flex>
                  }
                  checked={personalizersEnabled}
                  miw={100}
                  styles={{
                    root: {
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
                  onChange={(e) => {
                    setPersonalizersEnabled(!personalizersEnabled);
                    updatePersonalizersEnabled(e.target.checked);
                  }}
                />
                <Button
                  leftIcon={<IconPlus size={"0.9rem"} />}
                  onClick={() =>
                    openContextModal({
                      modal: "campaignPersonalizersModal",
                      title: <Title order={3}>Personalizers</Title>,
                      innerProps: {
                        sequences: sequences,
                        ai_researcher_id: statsData?.ai_researcher_id,
                        id,
                        setPersonalizers,
                      },
                      centered: true,
                      styles: {
                        content: {
                          minWidth: "1100px",
                        },
                      },
                      onClose: () => {
                        getPersonalizers();
                      },
                    })
                  }
                >
                  Add
                </Button>
                <ActionIcon color="gray" onClick={() => setShowPersonalizerModal(true)}>
                  <IconSettings size={"1.2rem"} />
                </ActionIcon>
              </Flex>
            </Flex>
            <Flex sx={{ display: personalizersEnabled ? "block" : "none" }}>
              {loadingPersonalizers ? (
                <Flex direction="column" align="center" justify="center" m="auto" mt="sm">
                  <Skeleton height={30} radius="xl" width="80%" />
                  <Skeleton height={20} radius="xl" width="60%" mt="sm" />
                  <Skeleton height={20} radius="xl" width="60%" mt="sm" />
                  <Flex align="center" gap="sm" mt="sm">
                    <Loader color="gray" variant="dots" size="md" />
                    <Text color="gray" size="md" className="loading-animation">
                      Loading Personalizers
                    </Text>
                  </Flex>
                </Flex>
              ) : personalizers && personalizers.length > 0 ? (
                <Flex direction={"column"} w={"100%"}>
                  <Flex w={"100%"} mah={300} gap={"md"} p={"lg"} direction="column">
                    {personalizers &&
                      personalizers.length > 0 &&
                      personalizers.map((item: any, index: number) => {
                        return (
                          <Switch
                            labelPosition="left"
                            label={
                              <Flex key={index} gap={"md"} align={"center"}>
                                <Text fw={600} size="12px" miw="200px">
                                  {item.key}
                                </Text>
                              </Flex>
                            }
                            checked={true}
                            miw={190}
                            styles={{
                              root: {
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
                        );
                      })}
                  </Flex>
                  <Flex align={"center"} w={"100%"} justify={"space-between"} p={"md"} style={{ borderTop: "1px solid #ECEEF1" }}>
                    <Flex w={"100%"} align={"center"} justify={"space-between"} style={{ border: "1px solid #ced4da" }}>
                      <Text w={"100%"} align="center" color="gray" size={"sm"} fw={500}>
                        {personalizers.length} {personalizers.length === 1 ? "Personalizer" : "Personalizers"}
                      </Text>
                      <Divider orientation="vertical" />
                      <ActionIcon h={"100%"} mx={3}>
                        <IconChevronLeft size={"1.2rem"} />
                      </ActionIcon>
                      <Divider orientation="vertical" />
                      <ActionIcon h={"100%"} mx={3}>
                        <IconChevronRight size={"1.2rem"} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  m="lg"
                  ml="auto"
                  mr="auto"
                  sx={(theme) => ({
                    border: "2px dotted gray",
                    borderRadius: "15px",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "transform 0.2s, background-color 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      backgroundColor: theme.colors.gray[0],
                    },
                  })}
                  onClick={() => {
                    openContextModal({
                      modal: "campaignPersonalizersModal",
                      title: <Title order={3}>Personalizers</Title>,
                      innerProps: {
                        ai_researcher_id: statsData?.ai_researcher_id,
                        id,
                        setPersonalizers,
                      },
                      centered: true,
                      styles: {
                        content: {
                          minWidth: "1040px",
                        },
                      },
                    });
                  }}
                >
                  <Flex align="center" gap="xs">
                    <Text color="gray" fw={400} size={"sm"}>
                      There are no personalizers here. Add one to get started.
                    </Text>
                    <ActionIcon>
                      <IconPlus size={"1.2rem"} />
                    </ActionIcon>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Paper>
        </Flex>
      </Flex>
    </Paper>
  );
}
