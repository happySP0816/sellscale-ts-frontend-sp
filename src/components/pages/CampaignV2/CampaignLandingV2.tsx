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
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import Hook from "@pages/channels/components/Hook";
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
  fetchCampaignContacts,
  fetchCampaignPersonalizers,
  patchTestingVolume,
  fetchCampaignSequences,
  fetchCampaignStats,
} from "@utils/requests/campaignOverview";
import { proxyURL } from "@utils/general";
import { activatePersona, deactivatePersona } from "@utils/requests/postPersonaActivation";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { useParams } from "react-router-dom";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import CampaignChannelPage from "@pages/CampaignChannelPage";
import { ContactsInfiniteScroll } from "./ContactsInfiniteScroll";
import LinkedInConvoSimulator from "@common/simulators/linkedin/LinkedInConvoSimulator";

interface StatsData {
  archetype_name: string;
  created_at: string;
  emoji: string;
  testing_volume: number;
  num_demos: number;
  active: boolean;
  email_to_linkedin_connection?: string;
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
}

export default function CampaignLandingV2() {
  const userData = useRecoilValue(userDataState);
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

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);
  const [status, setStatus] = useState("SETUP");

  //testing per cycle value
  const [cycleStatus, setCycleStatus] = useState(false);

  //contact variable
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactPercent, setContactPercent] = useState(40);

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
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [showCampaignTemplateModal, setShowCampaignTemplateModal] = useState(false);
  const [testingVolume, setTestingVolume] = useState(0);
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [showPersonalizerModal, setShowPersonalizerModal] = useState(false);
  const [showLinkedInConvoSimulatorModal, setShowLinkedInConvoSimulatorModal] = useState(false);

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
        //set the setup status
        if (loadedStats.active && loadedStats.num_sent > 0) {
          setStatus("ACTIVE");
        } else if (loadedStats.active && loadedStats.num_sent === 0) {
          setStatus("SETUP");
        } else if (loadedStats.active === false) {
          setStatus("INACTIVE");
        }
        setLoadingStats(false);
      })
      .catch((error) => {
        console.error("Error fetching stats", error);
        setLoadingStats(false);
      });
  };

  const refetchSequenceData = async (clientArchetypeId: number) => {
    setLoadingSequences(true);
    const sequencesPromise = fetchCampaignSequences(userToken, clientArchetypeId);
    sequencesPromise
      .then((sequencesData) => {
        console.log("sequencesData", sequencesData);
        if (sequencesData.linkedin_sequence.length > 0 && sequencesData.email_sequence.length === 0) {
          setSequences(sequencesData.linkedin_sequence);
          setType("linkedin");
        } else if (sequencesData.email_sequence.length > 0 && sequencesData.linkedin_sequence.length === 0) {
          setSequences(sequencesData.email_sequence);
          setType("email");
        } else if (sequencesData.email_sequence.length > 0 && sequencesData.linkedin_sequence.length > 0) {
          // Both sequences are available, prioritize email sequence
          setSequences(sequencesData.email_sequence);
          setType("email");
          setEmailSequenceData(sequencesData.email_sequence);
          setLinkedinSequenceData(sequencesData.linkedin_sequence);
        } else {
          // No sequences available
          setSequences([]);
          setType("none");
          setEmailSequenceData([]);
          setLinkedinSequenceData([]);
        }
        setLoadingSequences(false);
      })
      .catch((error) => {
        console.error("Error fetching sequences", error);
        setLoadingSequences(false);
      });
  };

  useEffect(() => {
    if (!loadingContacts && !loadingSequences && !loadingStats) {
      //data fetching is complete.

      if (!sequences || sequences.length === 0) {
        setActiveStep(0);
      } else if (personalizers.length === 0) {
        setActiveStep(1);
      } else {
        setActiveStep(3);
      }
    }
  }, [loadingSequences, loadingStats]);

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
      getPersonalizers();
      refetchSequenceData(clientArchetypeId);

      statsPromise
        .then((stats) => {
          const loadedStats = stats as StatsData;
          console.log("stats", loadedStats);
          setStatsData(loadedStats);
          //set the setup status
          if (loadedStats.active && loadedStats.num_sent > 0) {
            setStatus("ACTIVE");
          } else if (loadedStats.active && loadedStats.num_sent === 0) {
            setStatus("SETUP");
          } else if (loadedStats.active === false) {
            setStatus("INACTIVE");
          }
          setLoadingStats(false);
        })
        .catch((error) => {
          console.error("Error fetching stats", error);
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
  return (
    <Paper p={"lg"} h="100%" style={{ backgroundColor: "transparent" }}>
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
          style={{ backgroundColor: 'white', border: "1px solid lightblue", borderRadius: "6px" }}
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
        <Flex mx={"xl"} style={{ backgroundColor: "white", border: "1px solid lightblue", borderRadius: "6px" }}>
          <Flex direction={"column"} w={"100%"}>
            {/* <Flex justify={"space-between"} align={"center"} p={"lg"} pb={0}> */}
            <Flex justify={"space-between"} p={"lg"} pb={0} direction={"column"}>
              <Flex gap={"sm"} align={"center"}>
                {statsData?.emoji}
                <Text fw={600} size={20}>
                  {statsData?.archetype_name}
                </Text>
                <Button
                  tt={"uppercase"}
                  variant="light"
                  size="xs"
                  disabled={status === "INACTIVE" && true}
                  color={status === "SETUP" ? "orange" : status === "ACTIVE" ? "green" : ""}
                  onClick={() => {
                    if (status === "SETUP") setStatus("ACTIVE");
                    else if (status === "ACTIVE") {
                      setStatus("ACTIVE");
                    }
                  }}
                >
                  {status}
                </Button>
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
                <Tooltip label="Duplicate Campaign" withArrow>
                  <ActionIcon variant="light" color="blue" ml={"sm"}>
                    <IconCopy size={16} />
                  </ActionIcon>
                </Tooltip>
                <Text
                  underline
                  color={statsData?.active ? "red" : "green"}
                  size={"sm"}
                  className="hover:cursor-pointer select-none"
                  onClick={() => togglePersona(statsData, userToken)}
                >
                  {statsData?.active ? "Deactivate Campaign" : "Activate Campaign"}
                </Text>
              </Flex>
            </Flex>
            <Flex gap={"sm"} w={"100%"} justify={"center"} p={"lg"}>
              <Flex>
                <Paper
                  p="md"
                  sx={{
                    flex: 1,
                    justifyContent: "space-between",
                    textAlign: "center",
                    // make background a grid of dots
                    backgroundImage: "radial-gradient(#00000022 .05em, transparent .05em)",
                    backgroundSize: "20px 20px",
                  }}
                  withBorder
                >
                  <Flex justify="flex-end">
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
                  </Flex>
                  <Group noWrap spacing={"sm"}>
                    <Switch
                      onChange={() => togglePersonaChannel(id, "email", userToken, !statsData.email_active)}
                      checked={statsData.email_active}
                      labelPosition="left"
                      label={
                        <Flex gap={1} align={"center"} className="hover:cursor-pointer">
                          <IconMailOpened size={"1.2rem"} fill="#3B85EF" color="white" />
                          <Text color="#3B85EF" fw={500}>
                            Email
                          </Text>
                        </Flex>
                      }
                      miw={160}
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
                      label="Connect Sequences"
                      size="sm"
                      mb={"md"}
                      value={statsData.email_to_linkedin_connection}
                      w={200}
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
                      onChange={() => togglePersonaChannel(id, "linkedin", userToken, !statsData.linkedin_active)}
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
                      miw={160}
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
              <Flex w={"50%"}>
                <Paper p="md" withBorder w={"100%"}>
                  <Flex justify={"space-between"}>
                    <Text size={"sm"} fw={500}>
                      Testing volume per cycle
                    </Text>
                    <Text size={"sm"} fw={500}>
                      {testingVolume}/week{" "}
                      {cycleStatus && (
                        <Text component="span" color="red" size="xs" fw={700} ml={4}>
                          (Unsaved)
                        </Text>
                      )}
                    </Text>
                  </Flex>
                  <Flex w={"100%"} align={"start"} gap={"sm"} mt={"md"}>
                    <Slider
                      w={"100%"}
                      defaultValue={statsData.testing_volume}
                      value={testingVolume}
                      onChange={(value) => {
                        setCycleStatus(true);
                        setTestingVolume(value);
                        statsData.testing_volume = value;
                      }}
                      max={500}
                      marks={[
                        { value: 0, label: "0" },
                        {
                          value: 500,
                          label: (
                            <div
                              style={{
                                whiteSpace: "nowrap",
                                marginLeft: "-100px",
                              }}
                            >
                              MAX (DISTRIBUTE)
                            </div>
                          ),
                        },
                      ]}
                    />
                    <Button
                      disabled={!cycleStatus}
                      onClick={async () => {
                        const clientArchetypeId = Number(id);
                        const response = await patchTestingVolume(userToken, clientArchetypeId, testingVolume);
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
            <Paper
              style={{
                borderTopLeftRadius: "0px",
                borderTopRightRadius: "0px",
                borderTop: "1px solid #dee2e6",
              }}
            >
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
                <Flex align={"center"} justify={"space-between"} w="100%">
                  <Box p={"lg"} w={"100%"}>
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
                  <Box p={"lg"} w={"100%"}>
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
                  <Box p={"lg"} w={"100%"}>
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
                  <Box p={"lg"} w={"100%"}>
                    <Flex align={"center"} gap={6}>
                      <IconMessageCheck size={"0.9rem"} color="green" className="mb-[2px]" />
                      <Text fw={400} size={"sm"}>
                        Positive Reply
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
                  <Box p={"lg"} w={"100%"}>
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
          </Flex>
        </Flex>
      )}
      <Flex mx={"xl"} gap={"lg"} mt={"md"}>
        <Flex direction={"column"} gap={"md"} w={"80%"}>
          <Paper withBorder>
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
                          <Center style={{ gap: 10 }}>
                            <IconMailOpened size={"1.2rem"} fill="orange" color="white" />
                            <Text fw={500}>Email Sequence</Text>
                          </Center>
                        ),
                      },
                      {
                        value: "linkedin",
                        label: (
                          <Center style={{ gap: 10 }}>
                            <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                            <Text fw={500}>Linkedin Sequence</Text>
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
                    Add
                  </Button>
                  {type === "linkedin" && (
                    <Button
                      variant="outline"
                      rightIcon={<IconArrowRight size={"0.9rem"} />}
                      // onClick={() => {
                      //   setShowLinkedInConvoSimulatorModal(true);
                      // }}
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
                      Simulate
                    </Button>
                  )}
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
            <Flex h={"70%"}>
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
                    {sequences.map((item: any, index: number) => {
                      return (
                        <>
                          {index !== 0 && (
                            <Divider
                              variant="dashed"
                              labelPosition="center"
                              label={
                                <Flex gap={1} align={"center"}>
                                  {editableIndex === index ? (
                                    <>
                                      <Text color="gray" fw={500} size={"xs"}>
                                        Wait for
                                      </Text>
                                      <input
                                        type="number"
                                        defaultValue={item.bumped_count}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            console.log((e.target as HTMLInputElement).value);
                                            editSequenceBumpCount(index, (e.target as HTMLInputElement).value);
                                            setEditableIndex(null);
                                          }
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        style={{
                                          width: "50px",
                                          fontSize: "0.75rem",
                                          borderRadius: "8px",
                                        }}
                                        autoFocus
                                      />
                                      <Text color="gray" fw={500} size={"xs"}>
                                        {item.bumped_count === 1 ? "day" : "days"}
                                      </Text>
                                      <ActionIcon
                                        onClick={(e) => {
                                          editSequenceBumpCount(index, (e.target as HTMLInputElement).value);
                                          setEditableIndex(null);
                                        }}
                                      >
                                        <IconCheck size={"0.9rem"} />
                                      </ActionIcon>
                                    </>
                                  ) : (
                                    <>
                                      <Text color="gray" fw={500} size={"xs"}>
                                        Wait for {item.bumped_count} {item.bumped_count === 1 ? "day" : "days"}
                                      </Text>
                                      <ActionIcon onClick={() => setEditableIndex(index)}>
                                        <IconEdit size={"0.9rem"} />
                                      </ActionIcon>
                                    </>
                                  )}
                                </Flex>
                              }
                            />
                          )}
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
                                  Example Message #{index + 1}:
                                </Text>
                                <Text fw={600} size={"xs"} ml={"-5px"}>
                                  {item?.title}
                                </Text>
                              </Flex>
                              <Flex gap={1} align={"center"}>
                                {/* <ActionIcon
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
                                  <IconEdit size={"0.9rem"} />
                                </ActionIcon> */}
                                {/* <ActionIcon>
                                  <IconRefresh size={"0.9rem"} />
                                </ActionIcon>
                                <ActionIcon>
                                  <IconTrash size={"0.9rem"} />
                                </ActionIcon> */}
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
                                  <Text fw={600} size={"sm"}>
                                    {item?.name}
                                  </Text>
                                  <Text fw={500} size={"xs"}>
                                    {type === "email" ? (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: item?.description,
                                        }}
                                      />
                                    ) : (
                                      item?.description
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
                  direction="column"
                  align="center"
                  justify="center"
                  m="auto"
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
                    setShowCampaignTemplateModal(true);
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
          <Paper withBorder>
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
              <Flex gap={"sm"} align={"center"}>
                <Button
                  leftIcon={<IconPlus size={"0.9rem"} />}
                  onClick={() =>
                    openContextModal({
                      modal: "campaignPersonalizersModal",
                      title: <Title order={3}>Personalizers</Title>,
                      innerProps: {
                        setPersonalizers,
                      },
                      centered: true,
                      styles: {
                        content: {
                          minWidth: "1100px",
                        },
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
            <Flex>
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
                                <Divider orientation="vertical" />
                                <Text fw={500} color="gray" size={"12px"}>
                                  {item.relevancy}
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
        <Flex direction={"column"} w={"24vw"} gap={"lg"}>
          {loadingContacts ? (
            <Paper p={"md"}>
              <Skeleton height={30} radius="xl" width="40%" />
              <Skeleton height={20} radius="xl" width="60%" mt="sm" />
              <Skeleton height={20} radius="xl" width="60%" mt="sm" />
              <Skeleton height={20} radius="xl" width="60%" mt="sm" />
            </Paper>
          ) : (
            activeStep !== 3 && (
              <Paper withBorder p={"sm"}>
                <Text fw={600} size={15} color="#37414E">
                  Campaign Progress
                </Text>
                <Timeline
                  active={activeStep}
                  bulletSize={20}
                  lineWidth={2}
                  mt={"lg"}
                  styles={{
                    itemTitle: {
                      fontWeight: 600,
                      fontSize: "0.875rem", // Slightly lower the font size
                    },
                    itemBody: {
                      paddingTop: "4px",
                      fontSize: "0.875rem", // Slightly lower the font size
                    },
                    itemBullet: {
                      fontSize: "12px", // Slightly lower the font size
                    },
                    item: {
                      marginBottom: "8px", // Reduce space between bullets
                    },
                  }}
                >
                  <Timeline.Item bullet={1} title="Add Contacts" lineVariant="dashed">
                    <Text c="dimmed" size="xs">
                      Add contacts to get them scored & researched.
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={2} title="Setup Templates" lineVariant="dashed">
                    <Text c="dimmed" size="xs">
                      Create email & LinkedIn templates.
                    </Text>
                  </Timeline.Item>

                  <Timeline.Item bullet={3} title="Add Personalizers">
                    <Text c="dimmed" size="xs">
                      Create hyper-relevant outreach strategies to guide your personalizations.
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </Paper>
            )
          )}
          <Paper withBorder w={"100%"}>
            <ContactsInfiniteScroll campaignId={Number(id)} setContactsData={setContactsData} />
          </Paper>
        </Flex>
      </Flex>
    </Paper>
  );
}
