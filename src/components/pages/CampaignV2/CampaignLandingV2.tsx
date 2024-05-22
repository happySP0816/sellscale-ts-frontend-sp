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
import Hook from "@pages/channels/components/Hook";
import {
  IconBrandLinkedin,
  IconCalendar,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleLetterI,
  IconCopy,
  IconEdit,
  IconMailOpened,
  IconMessages,
  IconPlus,
  IconQuestionMark,
  IconRefresh,
  IconSearch,
  IconSend,
  IconTrafficCone,
  IconTrash,
} from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import {
  fetchCampaignContacts,
  fetchCampaignPersonalizers,
  fetchCampaignSequences,
  fetchCampaignStats,
} from "@utils/requests/campaignOverview";
import { useParams } from "react-router-dom";
import { userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { Any } from "@react-spring/web";
import CampaignChannelPage from "@pages/CampaignChannelPage";

interface StatsData {
  archetype_name: string;
  created_at: string;
  emoji: string;
  num_demos: number;
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

  const { id } = useParams();
  const [templates, setTemplates] = useState([]);
  const [personalizers, setPersonalizers] = useState([]);

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);
  const [status, setStatus] = useState("setup");

  //testing per cycle value
  const [cycleStatus, setCycleStatus] = useState(false);

  //contact variable
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactPercent, setContactPercent] = useState(40);

  // Loading states
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingSequences, setLoadingSequences] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const userToken = useRecoilValue(userTokenState);

  const [contactsData, setContactsData] = useState<any[]>([]);
  const [sequencesData, setSequencesData] = useState<any[]>([]);
  const [emailSequenceData, setEmailSequenceData] = useState<any[]>([]);
  const [linkedinSequenceData, setLinkedinSequenceData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [showCampaignTemplateModal, setShowCampaignTemplateModal] = useState(
    false
  );

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

  const getPersonalizers = async () => {
    const clientArchetypeId = Number(id);
    const response = await fetchCampaignPersonalizers(
      userToken,
      clientArchetypeId
    );
    if (response) {
      setPersonalizers(response.questions);
    }
  };

  const refetchSequenceData = async (clientArchetypeId: number) => {
    const sequencesPromise = fetchCampaignSequences(
      userToken,
      clientArchetypeId
    );
    sequencesPromise
      .then((sequences) => {
        console.log("sequences", sequences);
        if (sequences.email_sequence.length > 0) {
          setEmailSequenceData(sequences.email_sequence);
        } else {
          setEmailSequenceData([]);
        }
        if (sequences.linkedin_sequence.length > 0) {
          setLinkedinSequenceData(sequences.linkedin_sequence);
        } else {
          setLinkedinSequenceData([]);
        }
        if (sequences.email_sequence.length > 0) {
          setSequences(sequences.email_sequence);
          setType("email");
        } else if (sequences.linkedin_sequence.length > 0) {
          setSequences(sequences.linkedin_sequence);
          setType("linkedin");
        }
        setLoadingSequences(false);
      })
      .catch((error) => {
        console.error("Error fetching sequences", error);
        setLoadingSequences(false);
      });
  };

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
      setLoadingContacts(true);
      setLoadingSequences(true);
      setLoadingStats(true);

      const statsPromise = fetchCampaignStats(userToken, clientArchetypeId);
      getPersonalizers();
      refetchSequenceData(clientArchetypeId);

      const contactsPromise = fetchCampaignContacts(
        userToken,
        clientArchetypeId
      );
      contactsPromise
        .then((contacts) => {
          setContactsData(contacts);
          // console.log("contacts", contacts);
          setContacts(contacts.sample_contacts);
          if (contacts.sample_contacts.length > 0) {
            setActiveStep((prev) => prev + 1);
          }
          setLoadingContacts(false);
        })
        .catch((error) => {
          console.error("Error fetching contacts", error);
          setLoadingContacts(false);
        });

      statsPromise
        .then((stats) => {
          console.log("stats", stats);
          setStatsData(stats as StatsData);
          setLoadingStats(false);
        })
        .catch((error) => {
          console.error("Error fetching stats", error);
          setLoadingStats(false);
        });
    };

    fetchData();
  }, [id, userToken]);

  return (
    <Paper p={"lg"}>
      <Modal
        opened={showCampaignTemplateModal}
        onClose={() => {
          alert("Modal closed");
          refetchSequenceData(Number(id));
          setShowCampaignTemplateModal(false);
        }}
        size="1100px"
      >
        <CampaignChannelPage
          campaignId={Number(id)}
          cType={"linkedin"}
          hideHeader={true}
          hideEmail={false}
          hideLinkedIn={false}
          hideAssets={true}
        />
      </Modal>
      {loadingStats || !statsData ? (
        <Flex
          direction="column"
          gap="sm"
          p="lg"
          style={{ border: "1px solid lightgray", borderRadius: "6px" }}
        >
          <Skeleton height={50} radius="xl" width="100%" />
          <Skeleton height={40} radius="xl" width="80%" />
          <Skeleton height={30} radius="xl" width="60%" />
        </Flex>
      ) : (
        <Flex
          p={"lg"}
          style={{ border: "1px solid lightgray", borderRadius: "6px" }}
        >
          <Flex direction={"column"} gap={"sm"} w={"100%"}>
            <Flex justify={"space-between"} align={"center"}>
              <Flex gap={"sm"} align={"center"}>
                <Avatar src={""} size={"md"} radius={"xl"} />
                <Text fw={600} size={20}>
                  {statsData?.archetype_name}
                </Text>
                <Button
                  tt={"uppercase"}
                  variant="light"
                  size="xs"
                  disabled={status === "deactivated" && true}
                  color={
                    status === "setup"
                      ? "orange"
                      : status === "activate"
                      ? "green"
                      : ""
                  }
                  onClick={() => {
                    if (status === "setup") setStatus("activate");
                    else if (status === "activate") {
                      setStatus("deactivated");
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
                <Avatar size={"sm"} src={""} />
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
              </Flex>
            </Flex>
            <Flex gap={"lg"} w={"100%"} justify={"center"}>
              <Flex>
                <Paper
                  p="md"
                  sx={{
                    flex: 1,
                    justifyContent: "space-between",
                    textAlign: "center",
                    // make background a grid of dots
                    backgroundImage:
                      "radial-gradient(#00000022 .05em, transparent .05em)",
                    backgroundSize: "20px 20px",
                  }}
                  withBorder
                >
                  <Flex justify="flex-end">
                    <Tooltip
                      label={
                        <Text>
                          Omnichannel outbound allows you to control the order
                          of personalized outbound messages. <br></br>
                          If both email and LinkedIn are enabled, an email is
                          sent first, followed by a LinkedIn message after a few
                          days. <br></br>
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
                  <Group noWrap sx={{ flex: 1, justifyContent: "center" }}>
                    <Switch
                      checked={statsData.email_active}
                      labelPosition="left"
                      label={
                        <Flex gap={4} align={"center"}>
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
                    <Divider
                      variant="dashed"
                      labelPosition="center"
                      label={<Hook linkedLeft={false} linkedRight={false} />}
                    />
                    <Select
                      label="Connect Sequences"
                      size="sm"
                      mb={"md"}
                      // value={selectedConnectionType}
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
                    <Divider
                      variant="dashed"
                      labelPosition="center"
                      label={<Hook linkedLeft={false} linkedRight={false} />}
                    />
                    <Switch
                      checked={statsData?.linkedin_active}
                      labelPosition="left"
                      label={
                        <Flex gap={4} align={"center"}>
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
                  </Group>
                </Paper>
              </Flex>
              <Flex w={"50%"}>
                <Paper p="md" withBorder w={"100%"}>
                  <Flex justify={"space-between"}>
                    <Text size={"sm"} fw={500}>
                      Testing volume per cycle:
                    </Text>
                    <Text size={"sm"} fw={500}>
                      200/week (Email)
                    </Text>
                  </Flex>
                  <Flex w={"100%"} align={"start"} gap={"sm"} mt={"md"}>
                    <Slider
                      w={"100%"}
                      onChange={() => setCycleStatus(true)}
                      marks={[
                        { value: 0, label: "0" },
                        {
                          value: 100,
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
                    <Button disabled={!cycleStatus}>Save</Button>
                  </Flex>
                </Paper>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
      <Flex gap={"lg"} mt={"md"}>
        <Flex direction={"column"} gap={"md"} w={"80%"}>
          <Paper withBorder>
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
                    <Text fz={24}>{statsData.num_sent}</Text>
                    <Badge color={"#3B85EF"} size="xs">
                      {`${(100).toFixed(0)}%`}
                    </Badge>
                  </Flex>
                </Box>
                <Divider orientation="vertical" />
                <Box p={"lg"} w={"100%"}>
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
                    <Text fz={24}>{statsData.num_opens}</Text>
                    <Badge color="pink" size="xs">
                      {`${(
                        (statsData.num_opens / (statsData.num_sent + 0.0001)) *
                        100
                      ).toFixed(0)}%`}
                    </Badge>
                  </Flex>
                </Box>
                <Divider orientation="vertical" />
                <Box p={"lg"} w={"100%"}>
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
                    <Text fz={24}>{statsData.num_replies}</Text>
                    <Badge color="orange" size="xs">
                      {`${(
                        (statsData.num_replies /
                          (statsData.num_opens + 0.0001)) *
                        100
                      ).toFixed(0)}%`}
                    </Badge>
                  </Flex>
                </Box>
                <Divider orientation="vertical" />
                <Box p={"lg"} w={"100%"}>
                  <Flex align={"center"} gap={6}>
                    <IconMessageCheck
                      size={"0.9rem"}
                      color="green"
                      className="mb-[2px]"
                    />
                    <Text fw={400} size={"sm"}>
                      Positive Reply
                    </Text>
                  </Flex>
                  <Flex align={"center"} gap={"sm"}>
                    <Text fz={24}>{statsData.num_pos_replies}</Text>
                    <Badge color="green" size="xs">
                      {`${(
                        (statsData.num_pos_replies /
                          (statsData.num_replies + 0.0001)) *
                        100
                      ).toFixed(0)}%`}
                    </Badge>
                  </Flex>
                </Box>
                <Divider orientation="vertical" />
                <Box p={"lg"} w={"100%"}>
                  <Flex align={"center"} gap={6}>
                    <IconCalendar
                      size={"0.9rem"}
                      color={"#3B85EF"}
                      className="mb-[2px]"
                    />
                    <Text fw={400}>Demo</Text>
                  </Flex>
                  <Flex align={"center"} gap={"sm"}>
                    <Text fz={24}>{statsData.num_demos}</Text>
                    <Badge color="blue" size="xs">
                      {`${(
                        (statsData.num_demos /
                          (statsData.num_pos_replies + 0.0001)) *
                        100
                      ).toFixed(0)}%`}
                    </Badge>
                  </Flex>
                </Box>
              </Flex>
            )}
          </Paper>
          <Paper withBorder>
            <Flex
              align={"center"}
              justify={"space-between"}
              p={"md"}
              style={{ borderBottom: "1px solid #ECEEF1" }}
            >
              <Flex gap={"sm"} align={"center"}>
                <Flex align="center" gap="xs">
                  <Text fw={600} size={20} color="#37414E">
                    Personalizers
                  </Text>
                  <Tooltip
                    label={
                      <Text size="sm">
                        Create hyper-relevant outreach strategies <br></br>using
                        AI-powered research for personalized engagement.
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
                <Badge
                  leftSection={
                    <IconTrafficCone size={"0.9rem"} className="mt-1" />
                  }
                  color="orange"
                >
                  under construction
                </Badge>
              </Flex>
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
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
                Add
              </Button>
            </Flex>
            <Flex>
              {personalizers && personalizers.length > 0 ? (
                <Flex direction={"column"} w={"100%"}>
                  <Flex
                    w={"100%"}
                    mah={300}
                    gap={"md"}
                    p={"lg"}
                    direction="column"
                  >
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
                  <Flex
                    align={"center"}
                    w={"100%"}
                    justify={"space-between"}
                    p={"md"}
                    style={{ borderTop: "1px solid #ECEEF1" }}
                  >
                    <Flex
                      w={"100%"}
                      align={"center"}
                      justify={"space-between"}
                      style={{ border: "1px solid #ced4da" }}
                    >
                      <Text
                        w={"100%"}
                        align="center"
                        color="gray"
                        size={"sm"}
                        fw={500}
                      >
                        {personalizers.length} Personalizers
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
          <Paper withBorder h={"100%"}>
            <Flex
              align={"center"}
              justify={"space-between"}
              p={"md"}
              style={{ borderBottom: "1px solid #ECEEF1" }}
            >
              <Flex align="center" gap="xs">
                <Text fw={600} size={20} color="#37414E">
                  Sequences
                </Text>
                <Tooltip
                  label={
                    <Text size="sm">
                      Generate or manually create custom sequences to guide your
                      outreach strategy.
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
              </Flex>
              {sequences ? (
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
                          <IconMailOpened
                            size={"1.2rem"}
                            fill="orange"
                            color="white"
                          />
                          <Text fw={500}>Email Sequence</Text>
                        </Center>
                      ),
                    },
                    {
                      value: "linkedin",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconBrandLinkedin
                            size={"1.4rem"}
                            fill="#3B85EF"
                            color="white"
                          />
                          <Text fw={500}>Linkedin Sequence</Text>
                        </Center>
                      ),
                    },
                  ]}
                />
              ) : (
                <Button
                  leftIcon={<IconPlus size={"0.9rem"} />}
                  onClick={() => {
                    openContextModal({
                      modal: "campaignTemplateModal",
                      title: (
                        <Title order={3}>
                          {createTemplateBuilder
                            ? "Template Builder"
                            : "Template"}
                        </Title>
                      ),
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
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  m="auto"
                >
                  <Skeleton height={30} radius="xl" width="80%" />
                  <Skeleton height={20} radius="xl" width="60%" mt="sm" />
                  <Skeleton height={20} radius="xl" width="60%" mt="sm" />
                  <Text color="gray" fw={400} size={"sm"} mt="sm">
                    Loading sequences...
                  </Text>
                </Flex>
              ) : sequences && sequences.length > 0 ? (
                <Flex direction={"column"} h={"fit-content"} w={"100%"}>
                  <Flex w={"100%"} gap={"md"} direction={"column"} p={"lg"}>
                    {sequences.map((item: any, index: number) => {
                      return (
                        <>
                          <Box
                            style={{
                              border:
                                selectStep === index
                                  ? "1px solid #228be6"
                                  : "1px solid #ced4da",
                              borderRadius: "8px",
                            }}
                          >
                            <Flex
                              align={"center"}
                              justify={"space-between"}
                              px={"sm"}
                              py={"xs"}
                            >
                              <Flex align={"center"} gap={"xs"}>
                                <IconMessages color="#228be6" size={"0.9rem"} />
                                <Text color="gray" fw={500} size={"xs"}>
                                  Example Message #{index + 1}:
                                </Text>
                                <Text fw={600} size={"xs"} ml={"-5px"}>
                                  {item?.title}
                                </Text>
                              </Flex>
                              <Flex gap={1} align={"center"}>
                                <ActionIcon
                                  onClick={() => {
                                    openContextModal({
                                      modal: "campaignTemplateModal",
                                      title: (
                                        <Title order={3}>
                                          {createTemplateBuilder
                                            ? "Template Builder"
                                            : "Template"}
                                        </Title>
                                      ),
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
                                </ActionIcon>
                                {/* <ActionIcon>
                                  <IconRefresh size={"0.9rem"} />
                                </ActionIcon>
                                <ActionIcon>
                                  <IconTrash size={"0.9rem"} />
                                </ActionIcon> */}
                                <ActionIcon
                                  onClick={() => {
                                    handleToggle(index);
                                  }}
                                >
                                  {selectStep === index && opened ? (
                                    <IconChevronUp size={"0.9rem"} />
                                  ) : (
                                    <IconChevronDown size={"0.9rem"} />
                                  )}
                                </ActionIcon>
                              </Flex>
                            </Flex>
                            <Collapse
                              in={selectStep === index && opened}
                              key={index}
                            >
                              <Flex
                                gap={"sm"}
                                p={"sm"}
                                style={{ borderTop: "1px solid #ced4da" }}
                              >
                                <Avatar
                                  size={"md"}
                                  radius={"xl"}
                                  src={item?.avatar}
                                />
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
                                  {item.assets && item.assets.length > 0 && (
                                    <Badge color="grape">
                                      {item.assets.length} Assets Used
                                    </Badge>
                                  )}
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
                          <Divider
                            variant="dashed"
                            labelPosition="center"
                            label={
                              <Flex gap={1} align={"center"}>
                                <Text color="gray" fw={500} size={"xs"}>
                                  Wait for {item.bump} days
                                </Text>
                                <ActionIcon>
                                  <IconEdit size={"0.9rem"} />
                                </ActionIcon>
                              </Flex>
                            }
                          />
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
                    //   openContextModal({
                    //     modal: "campaignTemplateModal",
                    //     title: (
                    //       <Title order={3}>
                    //         {createTemplateBuilder
                    //           ? "Template Builder"
                    //           : "Template"}
                    //       </Title>
                    //     ),
                    //     innerProps: {
                    //       createTemplateBuilder,
                    //       setCreateTemplateBuilder,
                    //       setSequences,
                    //     },
                    //     centered: true,
                    //     styles: {
                    //       content: {
                    //         minWidth: "1040px",
                    //       },
                    //     },
                    //   });
                    //
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
                <Timeline.Item
                  bullet={1}
                  title="Add Contacts"
                  lineVariant="dashed"
                >
                  <Text c="dimmed" size="xs">
                    Add contacts to get them scored & researched.
                  </Text>
                </Timeline.Item>

                <Timeline.Item
                  bullet={2}
                  title="Setup Templates"
                  lineVariant="dashed"
                >
                  <Text c="dimmed" size="xs">
                    Create email & LinkedIn templates.
                  </Text>
                </Timeline.Item>

                <Timeline.Item bullet={3} title="Add Personalizers">
                  <Text c="dimmed" size="xs">
                    Create hyper-relevant outreach strategies to guide your
                    personalizations.
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Paper>
          )}
          <Paper withBorder w={"100%"}>
            {loadingContacts ? (
              <Flex
                justify={"space-between"}
                direction="column"
                gap="sm"
                p="md"
                align="left"
                w="24vw"
              >
                <Text size="md" fw={500} color="gray">
                  Loading contacts...
                </Text>
                <Loader size="sm" />
                <Flex direction="row" align="center" gap="sm">
                  <Skeleton height={50} width={50} radius="150%" />
                  <Flex direction="column" gap="xs" w="100%">
                    <Skeleton height={8} radius="xl" width="80%" />
                    <Skeleton height={8} radius="xl" width="60%" />
                  </Flex>
                </Flex>
                <Flex direction="row" align="center" gap="sm">
                  <Skeleton height={50} width={50} radius="100%" />
                  <Flex direction="column" gap="xs" w="100%">
                    <Skeleton height={8} radius="xl" width="80%" />
                    <Skeleton height={8} radius="xl" width="60%" />
                  </Flex>
                </Flex>
                <Flex direction="row" align="center" gap="sm">
                  <Skeleton height={50} width={50} radius="100%" />
                  <Flex direction="column" gap="xs" w="100%">
                    <Skeleton height={8} radius="xl" width="80%" />
                    <Skeleton height={8} radius="xl" width="60%" />
                  </Flex>
                </Flex>
                <Flex direction="row" align="center" gap="sm">
                  <Skeleton height={50} width={50} radius="100%" />
                  <Flex direction="column" gap="xs" w="100%">
                    <Skeleton height={8} radius="xl" width="80%" />
                    <Skeleton height={8} radius="xl" width="60%" />
                  </Flex>
                </Flex>
                <Flex direction="row" align="center" gap="sm">
                  <Skeleton height={50} width={50} radius="100%" />
                  <Flex direction="column" gap="xs" w="100%">
                    <Skeleton height={8} radius="xl" width="80%" />
                    <Skeleton height={8} radius="xl" width="60%" />
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              <>
                <Flex
                  align={"center"}
                  justify={"space-between"}
                  p={"md"}
                  w={"24vw"}
                  style={{ borderBottom: "1px solid #ECEEF1" }}
                >
                  <Flex align={"center"} gap={"sm"}>
                    <Text fw={600} size={20} color="#37414E">
                      Contacts
                    </Text>
                    {/* {contacts && contacts.length > 0 && (
                    <Badge variant="light" color={contactPercent < 50 ? "orange" : "green"}>
                      {contactPercent}%
                    </Badge>
                  )} */}
                  </Flex>
                  <Button
                    leftIcon={<IconPlus size={"0.9rem"} />}
                    onClick={() => {
                      openContextModal({
                        modal: "campaignContactsModal",
                        title: <Title order={3}>Contacts</Title>,
                        innerProps: {
                          setContacts,
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
                    Add
                  </Button>
                </Flex>
                <Flex h={"100%"} p={contacts && contacts.length > 0 ? "" : 80}>
                  {contacts && contacts.length > 0 ? (
                    <Flex direction={"column"} gap={"sm"} w={"100%"}>
                      <TextInput
                        placeholder="Search prospects, companies, titles"
                        rightSection={
                          <IconSearch size={"0.9rem"} color="gray" />
                        }
                      />
                      <ScrollArea h={365}>
                        <Flex direction={"column"} gap={"sm"}>
                          {contacts.map((item: any, index: number) => {
                            return (
                              <Flex key={index} gap={"sm"}>
                                <Avatar
                                  size={"md"}
                                  radius={"xl"}
                                  src={item.avatar}
                                />
                                <Box>
                                  <Flex align={"center"} gap={"xs"}>
                                    <Text fw={500}>
                                      {item.first_name + " " + item.last_name}
                                    </Text>
                                    {getIcpFitBadge(item.icp_fit_score)}
                                  </Flex>
                                  <Text color="gray" fw={500} size={"xs"}>
                                    {item.title + " at " + item.company}
                                  </Text>
                                </Box>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </ScrollArea>
                    </Flex>
                  ) : (
                    <Text
                      color="gray"
                      fw={400}
                      m={"auto"}
                      align="center"
                      size={"sm"}
                    >
                      There are no contacts here. Add one to get started.
                    </Text>
                  )}
                </Flex>
              </>
            )}
          </Paper>
        </Flex>
      </Flex>
    </Paper>
  );
}
