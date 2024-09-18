import {
  Text,
  Paper,
  useMantineTheme,
  Stack,
  Select,
  TextInput,
  Textarea,
  LoadingOverlay,
  Group,
  Switch,
  Flex,
  Divider,
  Button,
  Collapse,
  SegmentedControl,
  Center,
  Box,
  SimpleGrid,
  ActionIcon,
  Title, Badge,
  Accordion,
  NumberInput,
  Checkbox,
  Table,
  HoverCard,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconBrandLinkedin,
  IconBulb,
  IconChartBar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconEye,
  IconInfoCircle,
  IconMailOpened,
  IconPencil,
  IconPlus,
  IconSearch,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { campaignContactsState, emailSequenceState, linkedinSequenceState, userTokenState } from "@atoms/userAtoms";
import { userDataState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import {Archetype, DefaultVoices, MsgResponse} from "src";
import { API_URL } from "@constants/data";
import CreatePersona from "@common/persona/CreatePersona";
import Hook from "@pages/channels/components/Hook";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { currentProjectState } from "@atoms/personaAtoms";
import { useStrategiesApi } from "@pages/Strategy/StrategyApi";
import { showNotification } from "@mantine/notifications";
import { set } from "lodash";

export default function UploadProspectsModal({ context, id, innerProps }: ContextModalProps<{ mode: "CREATE-ONLY"; strategy_id?: number | undefined; selixSessionId?: Number | null }>) {
  const theme = useMantineTheme();
  const userData = useRecoilValue(userDataState);
  const [personas, setPersonas] = useState<{ value: string; label: string; group: string | undefined }[]>([]);
  const [hasSequences, setHasSequences] = useState<boolean>(false); //used for the selix widget
  const defaultPersonas = useRef<{ value: string; label: string; group: string | undefined }[]>([]);
  const [createdPersona, setCreatedPersona] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [handlingStrategy, setHandlingStrategy] = useState(false);

  const [ctas, setCTAs] = useState<{ id: number; cta: string }[]>([]);

  const [fitReason, setFitReason] = useState("");
  const [icpMatchingPrompt, setICPMatchingPrompt] = useState("Describe your persona here ...");

  const [contactObjective, setContactObjective] = useState("Set up a discovery call in order to identify a pain point");

  const [purpose, setPurpose] = useState("");

  const [personaContractSize, setPersonaContractSize] = useState(userData.client.contract_size);
  const [templateMode, setTemplateMode] = useState<string>("template");

  const [tab, setTab] = useState("scratch");

  const [defaultVoicesOptions, setDefaultVoicesOptions] = useState<DefaultVoices[]>([]);

  type Strategy = {
    archetypes: any[];
    client_id: number;
    created_at: string;
    description: string;
    end_date: string;
    id: number;
    num_demo: number;
    num_pos_response: number;
    num_sent: number;
    sdr_img_url: string;
    sdr_name: string;
    start_date: string;
    status: string;
    title: string;
  };

const [connectedStrategy, setConnectedStrategy] = useState<Strategy | undefined>(undefined);

const [strategyOptions, setStrategyOptions] = useState<Strategy[]>([]);

  // New System for one shot campaign generator
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [numStepsEmail, setNumStepsEmail] = useState(1);
  const [numStepsLinkedin, setNumStepsLinkedin] = useState(1);
  const [numVarianceEmail, setNumVarianceEmail] = useState(1);
  const [numVarianceLinkedin, setNumVarianceLinkedin] = useState(1);
  const [liAssetIngestor, setLiAssetIngestor] = useState("");

  const [emailAssetIngestor, setEmailAssetIngestor] = useState("");
  const [ctaTarget, setCTATarget] = useState("");

  // CTA system
  const [company, setCompany] = useState(userData.client.company);
  const [withData, setWithData] = useState("");


  const [findSampleProspects, setFindSampleProspects] = useState(false);
  const [writeEmailSequenceDraft, setWriteEmailSequenceDraft] = useState(false);
  const [writeLISequenceDraft, setWriteLISequenceDraft] = useState(false);
  const [emailSequenceOpened, setEmailSequenceOpened] = useState(false);
  const [emailSequenceKeywords, setEmailSequenceKeywords] = useState<string[]>([]);
  const setEmailSequenceToggle = () => setEmailSequenceOpened(!emailSequenceOpened);
  const [liSequenceOpened, setLiSequenceOpened] = useState(false);
  const [liGeneralAngle, setLiGeneralAngle] = useState("");
  const [emailGeneralAngle, setEmailGeneralAngle] = useState("");
  const [liSequenceKeywords, setLiSequenceKeywords] = useState<string[]>([]);
  const [liCtaGenerator, setLiCtaGenerator] = useState(false);
  const [liPainPoint, setLiPainPoint] = useState("");
  const setLiSequenceToggle = () => setLiSequenceOpened(!liSequenceOpened);
  const [liSequenceState, setLiSequenceState] = useState({
    howItWorks: false,
    varyIntroMessages: false,
    breakupMessage: false,
    uniqueOffer: false,
    conferenceOutreach: false,
    cityChat: false,
    formerWorkAlum: false,
    feedbackBased: false,
  });
  const [emailSequenceStateRaw, setEmailSequenceState] = useState({
    howItWorks: false,
    varyIntroMessages: false,
    breakupMessage: false,
    uniqueOffer: false,
    conferenceOutreach: false,
    cityChat: false,
    formerWorkAlum: false,
    feedbackBased: false,
    });


  useEffect(() => {
    const getVoices = async () => {
      const res = await fetch(`${API_URL}/internal_voices`)

      if (res.status === 200) {
        const data = await res.json()
        setDefaultVoicesOptions(data)
      }
    }
    //show success box if strategy has generated sequences already
    if (innerProps.selixSessionId) {
      checkIfStrategyConnectedHasCampaignWithSequences(innerProps?.selixSessionId);
    }
    handleStrategy();
    getVoices();
  }, [])

  const checkIfStrategyConnectedHasCampaignWithSequences = async (selixSessionId: Number) => {
    if (selixSessionId === -1) return false;

    const response = await fetch(`${API_URL}/selix/${selixSessionId}/has_campaign_with_sequences`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      setHasSequences(true);
    } else {
      setHasSequences(false);
    }
  }

  const [loadingPersonaBuyReasonGeneration, setLoadingPersonaBuyReasonGeneration] = useState(false);
  const generatePersonaBuyReason = async (): Promise<MsgResponse> => {
    setLoadingPersonaBuyReasonGeneration(true);
    const res = await fetch(`${API_URL}/client/archetype/generate_persona_buy_reason`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona_name: createdPersona,
      }),
    })
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: "Success",
            message: "Persona buying reason generated successfully",
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Failed to generate persona buying reason",
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: "error",
          title: "Error",
          message: e.message,
          data: {},
        };
      });
    setLoadingPersonaBuyReasonGeneration(false);
    setFitReason(res.data.description);
    return res as MsgResponse;
  };

  const [loadingICPMatchingPromptGeneration, setLoadingICPMatchingPromptGeneration] = useState(false);
  const generateICPMatchingPrompt = async (): Promise<MsgResponse> => {
    setLoadingICPMatchingPromptGeneration(true);
    const res = await fetch(`${API_URL}/client/archetype/generate_persona_icp_matching_prompt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona_name: selectedPersona,
        persona_buy_reason: fitReason,
      }),
    })
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: "Success",
            message: "ICP matching prompt generated successfully",
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Failed to generate ICP matching prompt",
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: "error",
          title: "Error",
          message: e.message,
          data: {},
        };
      });
    setLoadingICPMatchingPromptGeneration(false);
    setICPMatchingPrompt(res.data.description);
    return res as MsgResponse;
  };

  const fillInFromStrategy = async (strategy: Strategy) => {


    type StrategyResponseData = {
      createdPersona: string;
      fitReason: string;
      icpMatchingPrompt: string;
      emailSequenceKeywords: string[];
      liSequenceKeywords: string[];
      liGeneralAngle: string;
      emailGeneralAngle: string;
      purpose: string;
      liPainPoint: string;
      ctaTarget: string;
      withData: string;
      liAssetIngestor: string;
      emailAssetIngestor: string;
    };

    setLoadingStrategy(true);

    const response = await fetch(`${API_URL}/strategies/generate_campaign_from_strategy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        strategy_id: strategy.id,
      }),
    });

    if (response.status === 200) {
      const data: StrategyResponseData = await response.json();
      setFindSampleProspects(true);
      setNumStepsEmail(3);
      setNumStepsLinkedin(3);
      setNumVarianceEmail(3);
      setNumVarianceLinkedin(3);
      setCreatedPersona(data.createdPersona || '');
      setFitReason(data.fitReason || '');
      setICPMatchingPrompt(data.icpMatchingPrompt || '');
      setEmailSequenceKeywords(data.emailSequenceKeywords || []);
      setLiSequenceKeywords(data.liSequenceKeywords || []);
      setLiGeneralAngle(data.liGeneralAngle || '');
      setEmailGeneralAngle(data.emailGeneralAngle || '');
      setPurpose(data.purpose || '');
      setLiPainPoint(data.liPainPoint || '');
      setCTATarget(data.ctaTarget || '');
      setWithData(data.withData || '');
      setLiAssetIngestor(data.liAssetIngestor || '');
      setEmailAssetIngestor(data.emailAssetIngestor || '');

      // HACK CITY - this is a hack to determine if we should show generated email or LI sequences

      if (strategy.description.toLowerCase().includes("email")) {
        setWriteEmailSequenceDraft(true);
        setEmailSequenceOpened(true);
      }
      if (strategy.description.toLowerCase().includes("linkedin")) {
        setWriteLISequenceDraft(true);
        setLiSequenceOpened(true);
      }
      else if (
        !strategy.description.toLowerCase().includes("email") &&
        !strategy.description.toLowerCase().includes("linkedin")
      ) {
        setWriteEmailSequenceDraft(true);
        setEmailSequenceOpened(true);
        setWriteLISequenceDraft(true);
        setLiSequenceOpened(true);
      }
    } 
    else {
      console.error("Failed to generate from strategy");
    }

    setTab("scratch");

    setLoadingStrategy(false);

  }

  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const { getAllStrategies, patchUpdateStrategy } = useStrategiesApi(userToken);

  const handleStrategy = async () => {
    setHandlingStrategy(true);
    const response = await getAllStrategies();
    setStrategyOptions(response);

    if (innerProps.strategy_id){
      await fillInFromStrategy(response.find((strategy: Strategy) => strategy.id === innerProps.strategy_id));
    }

    setHandlingStrategy(false);

  };

  // const [strategies, setStrategies] = useState([
  //   {
  //     title: "Account Targeting",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Similar Accounts",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Location Targeting",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Giftcard Campaign",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Location Targeting",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Giftcard Campaign",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Account Targeting",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  //   {
  //     title: "Similar Accounts",
  //     goal: "Test out if Bay Area is working better; select different meetings.",
  //   },
  // ]);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    if (personas.length === 0 && defaultPersonas.current.length > 0) {
      setPersonas(defaultPersonas.current);
      setSelectedPersona(defaultPersonas.current[0].value);
    }
  }, [defaultPersonas.current]);


  if (hasSequences) {
    return (
      <Paper
        p="md"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
          position: 'relative',
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${theme.colors.gray[4]}`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
          }}
        >
          <IconCircleCheck size={24} color={theme.colors.green[6]} />
          <Text ml="sm" size="md" weight={500}>
            Sequences generated successfully!
          </Text>
        </Box>
        <Button
          style={{
            position: 'absolute',
            bottom: theme.spacing.md,
            right: theme.spacing.md,
          }}
          onClick={() => setHasSequences(false)}
        >
          Regenerate
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      }}
    >
      <LoadingOverlay visible={handlingStrategy}/>
      {!window.location.href.includes('selix') && <SegmentedControl
        size="sm"
        w={"100%"}
        value={tab}
        onChange={(value) => setTab(value)}
        data={[
          {
            value: "scratch",
            label: (
              <Center>
                <IconPlus size="1rem" />
                <Box ml={10}>Create from Scratch</Box>
              </Center>
            ),
          },
          {
            value: "voice",
            disabled: false,
            label: (
              <Center>
                <IconBulb size="1rem" />
                <Box ml={10}>Create from Voice</Box>
              </Center>
            ),
          },
          {
            value: "strategy",
            disabled: false,
            label: (
              <Center>
                <IconChartBar size="1rem" />
                <Box ml={10}>Create from Strategy</Box>
              </Center>
            ),
          },
        ]}
      />}
      {tab === "scratch" ? (
        <Stack spacing="xs" mt={"md"}>
          {/* <Text color="gray" size={"sm"}>
            Enter the information below to describe and fine-tune your campaign
          </Text> */}
          <>
            {innerProps.mode === "CREATE-ONLY" ? (
              <>
                {connectedStrategy && <Paper
                  withBorder
                  bg={"#E6F7FF"}
                  px={"sm"}
                  py={"xs"}
                  style={{ borderColor: "#1E90FF" }}
                >
                  <Flex align={"center"} gap={"xs"}>
                    <IconInfoCircle color="#1E90FF" size={"1rem"} />
                    <Text size={"sm"} color="#1E90FF" fw={600}>
                      Connected Strategy:{" "}
                      <span className="font-medium text-gray-500">
                        {connectedStrategy.title}
                      </span>
                    </Text>
                    <ActionIcon size="sm" color="red" onClick={() => {setConnectedStrategy(undefined)}}>
                      <IconX size="1rem" />
                    </ActionIcon>
                  </Flex>
                </Paper>}

                {window.location.href.includes('/campaigns') && <TextInput
                  placeholder="eg. C-Suite Sales Leaders in tech companies"
                  label={<Text mb="xs" size="lg">Campaign Name</Text>}
                  value={createdPersona}
                  onChange={(e) =>
                  {
                    setCreatedPersona(e.currentTarget.value)
                  }}
                />}
                <Stack spacing={"xs"} mt={4}>
                  <Text size={"md"} fw={500} mb={-8}>
                    Campaign Automations
                  </Text>
                  {window.location.href.includes('/campaigns') &&  <Paper withBorder p="sm">
                  <Switch
                    onChange={() => setFindSampleProspects(!findSampleProspects)}
                    labelPosition="left"
                    checked={findSampleProspects}
                    styles={{
                      body: {
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    }}
                    label={
                      <Flex gap={"xs"} align={"center"} p="md">
                        <IconUsers size={"1.4rem"} fill="#228be6" color="white" />
                        <Text fw={500} size={"sm"}>
                          Find sample contacts
                        </Text>
                      </Flex>
                    }
                  />
                  {findSampleProspects && (
                    <Accordion mt={4}>
                        <Textarea
                          mt={4}
                          placeholder="Describe your Ideal Customer Profile (ICP). E.g., 'Mid-level marketing managers in tech startups.'"
                          value={purpose}
                          onChange={(e) => setPurpose(e.currentTarget.value)}
                          styles={{
                            label: {
                              width: "100%",
                              marginBottom: "4px",
                            },
                          }}
                        />
                      
                    </Accordion>
                  )}
                  </Paper>}
                   <Paper withBorder p="md">
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Flex direction="column" gap={"xs"} align={"flex-start"} w="100%" justify="flex-start">
                      <Flex gap={"xs"} align={"center"}>
                        <IconMailOpened size={"1.4rem"} fill="#228be6" color="white" />
                        <Text fw={500} size={"sm"} style={{ cursor: 'default' }}>
                          Generate Email Sequences
                        </Text>
                      </Flex>
                    </Flex>
                    <Switch
                      checked={writeEmailSequenceDraft}
                      onChange={() => setWriteEmailSequenceDraft(!writeEmailSequenceDraft)}
                      styles={{
                        root: {
                          padding: "8px",
                        },
                        body: {
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        },
                      }}
                    />
                  </div>
                
                  {writeEmailSequenceDraft && (
                    <Paper mt={4} w="100%">
                      <Stack spacing="sm">
                        <NumberInput
                          defaultValue={1}
                          placeholder="# Steps"
                          label="# Steps"
                          withAsterisk
                          onChange={(e) => setNumStepsEmail(+e)}
                          value={numStepsEmail}
                          width={'30%'}
                        />
                        <NumberInput
                          defaultValue={1}
                          placeholder="# Variants Per Step"
                          label="# Variants Per Step"
                          withAsterisk
                          onChange={(e) => setNumVarianceEmail(+e)}
                          value={numVarianceEmail}
                          width={'30%'}
                        />
                        <TextInput
                          label="General Angle"
                          placeholder="We are targeting marketing professionals to highlight the benefits of our new analytics tool."
                          value={emailGeneralAngle}
                          onChange={(e) => setEmailGeneralAngle(e.currentTarget.value)}
                        />
                        <CustomSelect
                          maxWidth="100%"
                          value={emailSequenceKeywords}
                          label={<Text>Mandatory Phrases: Words or concepts that <b>must</b> be included in email content</Text>}
                          placeholder="Increase your ROI, Exclusive offer, Limited time, Free trial, Join our webinar"
                          setValue={setEmailSequenceKeywords}
                          data={emailSequenceKeywords}
                          setData={setEmailSequenceKeywords}
                        />
                        <Textarea
                          label="Asset Ingestor"
                          placeholder="Give any additional context for the campaign generation"
                          value={emailAssetIngestor}
                          onChange={(e) => setEmailAssetIngestor(e.currentTarget.value)}
                          minRows={4} />
                        <Divider
                          label={
                            <Button
                              onClick={setEmailSequenceToggle}
                              variant="outline"
                              color="gray"
                              radius="xl"
                              rightIcon={emailSequenceOpened ? <IconChevronUp size="1rem" /> : <IconChevronDown size="1rem" />}
                            >
                              Advanced
                            </Button>
                          }
                          variant="dashed"
                          labelPosition="center"
                        />
                        <Collapse in={emailSequenceOpened}>
                          <Box>
                            <Table>
                              <thead>
                                <tr>
                                  <th>Beginning</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <HoverCard width={280} shadow="md">
                                      <HoverCard.Target>
                                        <Checkbox 
                                          size="xs" 
                                          label="Vary intro messages" 
                                          checked={emailSequenceStateRaw.varyIntroMessages}
                                          onChange={(e) => setEmailSequenceState({ ...emailSequenceStateRaw, varyIntroMessages: e.currentTarget.checked })}
                                        />
                                      </HoverCard.Target>
                                      <HoverCard.Dropdown>
                                        <Text size="sm">The first message will contain various creative angles.</Text>
                                      </HoverCard.Dropdown>
                                    </HoverCard>
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                            <Table>
                              <thead>
                                <tr>
                                  <th>Middle</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <HoverCard width={280} shadow="md">
                                      <HoverCard.Target>
                                        <Checkbox 
                                          size="xs" 
                                          label="Unique offer" 
                                          checked={emailSequenceStateRaw.uniqueOffer}
                                          onChange={(e) => setEmailSequenceState({ ...emailSequenceStateRaw, uniqueOffer: e.currentTarget.checked })}
                                        />
                                      </HoverCard.Target>
                                      <HoverCard.Dropdown>
                                        <Text size="sm">One of the message variants will contain a unique offer relevant to your business.</Text>
                                      </HoverCard.Dropdown>
                                    </HoverCard>
                                  </td>
                                
                                  <td>
                                    <HoverCard width={280} shadow="md">
                                      <HoverCard.Target>
                                        <Checkbox 
                                          size="xs" 
                                          label="How it works" 
                                          checked={emailSequenceStateRaw.howItWorks}
                                          onChange={(e) => setEmailSequenceState({ ...emailSequenceStateRaw, howItWorks: e.currentTarget.checked })}
                                        />
                                      </HoverCard.Target>
                                      <HoverCard.Dropdown>
                                        <Text size="sm">One of the messages will be a description on how it works. This is nice because it gives the prospect a better understanding of what you do.</Text>
                                      </HoverCard.Dropdown>
                                    </HoverCard>
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                            <Table>
                              <thead>
                                <tr>
                                  <th>End</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <HoverCard width={280} shadow="md">
                                      <HoverCard.Target>
                                        <Checkbox 
                                          size="xs" 
                                          label="Breakup message" 
                                          checked={emailSequenceStateRaw.breakupMessage}
                                          onChange={(e) => setEmailSequenceState({ ...emailSequenceStateRaw, breakupMessage: e.currentTarget.checked })}
                                        />
                                      </HoverCard.Target>
                                      <HoverCard.Dropdown>
                                        <Text size="sm">One of the variants in the last step will be a "breakup" message.</Text>
                                      </HoverCard.Dropdown>
                                    </HoverCard>
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                          </Box>
                        </Collapse>
                      </Stack>
                    </Paper>
                  )}
                  </Paper>
                  <Paper withBorder p="md">
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Flex direction="column" gap={"xs"} align={"flex-start"} w="100%" justify="flex-start">
                      <Flex gap={"xs"} align={"center"}>
                        <IconBrandLinkedin size={"1.4rem"} fill="#228be6" color="white" />
                        <Text fw={500} size={"sm"} style={{ cursor: 'default' }}>
                          Generate LinkedIn Sequences
                        </Text>
                      </Flex>
                    </Flex>
                    <Switch
                      checked={writeLISequenceDraft}
                      onChange={() => setWriteLISequenceDraft(!writeLISequenceDraft)}
                      styles={{
                        root: {
                          padding: "8px",
                        },
                        body: {
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        },
                      }}
                    />
                  </div>

                  {writeLISequenceDraft && (
                    <Accordion mt={4} w="100%">
                      <Stack spacing="sm">
                        <NumberInput
                          defaultValue={1}
                          placeholder="# Steps"
                          label="# Steps"
                          withAsterisk
                          onChange={(e) => setNumStepsLinkedin(+e)}
                          value={numStepsLinkedin}
                          width={'30%'}
                        />
                        <NumberInput
                          defaultValue={1}
                          placeholder="# Variance Per Step"
                          label="# Variance Per Step"
                          withAsterisk
                          onChange={(e) => setNumVarianceLinkedin(+e)}
                          value={numVarianceLinkedin}
                          width={'30%'}
                        />
                        <TextInput
                          label="General Angle"
                          placeholder="We are targeting marketing professionals to highlight the benefits of our new analytics tool."
                          value={liGeneralAngle}
                          onChange={(e) => setLiGeneralAngle(e.currentTarget.value)}
                        />
                        <CustomSelect
                          maxWidth="100%"
                          value={liSequenceKeywords}
                          label={<Text>Mandatory Phrases: Words or concepts that <b>must</b> be included in the LinkedIn message</Text>}
                          placeholder="Increase your ROI, Exclusive offer, Limited time, Free trial, Join our webinar"
                          setValue={setLiSequenceKeywords}
                          data={liSequenceKeywords}
                          setData={setLiSequenceKeywords}
                        />
                        <Checkbox
                          label={<Text>Generate CTA (Call to Action)</Text>}
                          checked={liCtaGenerator}
                          onChange={(e) => {
                            setLiCtaGenerator(e.currentTarget.checked)
                            if (e.currentTarget.checked) {
                              setTemplateMode("cta");
                            } else {
                              setTemplateMode("template");
                            }
                          }}
                        />
                        {liCtaGenerator && (
                          <>
                            <Flex align={'center'} gap={'4px'}>
                              <TextInput
                                value={company}
                                disabled
                                size="xs"
                                radius="xl"
                              />
                              <Text>
                                {" Help "}
                              </Text>
                              <TextInput
                                value={ctaTarget}
                                onChange={(e) => setCTATarget(e.currentTarget.value)}
                                size="xs"
                                radius="xl"
                                placeholder={createdPersona}
                                withAsterisk
                              />
                              <Text>
                                {" with "}
                              </Text>
                              <Textarea
                                value={withData}
                                size="xs"
                                style={{width: "fit-content"}}
                                radius="sm"
                                onChange={(e) => setWithData(e.currentTarget.value)}
                                placeholder={"Filling their top of funnel leads."}
                                required
                                withAsterisk
                              />
                            </Flex>
                            <Select
                              data={defaultVoicesOptions.map(item =>{
                                return {
                                  value: "" + item.id,
                                  label: item.title,
                                }})}
                              onChange={(value) => setSelectedVoice(value)}
                              value={selectedVoice}
                              label={"Select Voices"}
                              placeholder={'Select the voice to generate the campaign'}
                            />
                          </>
                        )}
                        <Textarea
                          label="Asset Ingestor"
                          placeholder="Give any additional context for the campaign generation"
                          value={liAssetIngestor}
                          onChange={(e) => setLiAssetIngestor(e.currentTarget.value)}
                          minRows={4} />
                        <Divider
                          label={
                            <Button
                              onClick={setLiSequenceToggle}
                              variant="outline"
                              color="gray"
                              radius="xl"
                              rightIcon={liSequenceOpened ? <IconChevronUp size="1rem" /> : <IconChevronDown size="1rem" />}
                            >
                              Advanced
                            </Button>
                          }
                          variant="dashed"
                          labelPosition="center"
                        />
                        <Collapse in={liSequenceOpened}>
                          <Box>
                            <Text size="sm" fw={500}>
                              Include Templates
                            </Text>
                            <Box>
                              <Table>
                                <thead>
                                  <tr>
                                    <th>Beginning</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                    <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                          <Checkbox
                                            size="xs"
                                            label="Vary intro messages"
                                            checked={liSequenceState.varyIntroMessages}
                                            onChange={(e) =>
                                              setLiSequenceState({
                                                ...liSequenceState,
                                                varyIntroMessages: e.currentTarget.checked,
                                              })
                                            }
                                          />
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                          <Text size="sm">The first message will contain various creative angles.</Text>
                                        </HoverCard.Dropdown>
                                      </HoverCard>
                                      
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                              <Table>
                                <thead>
                                  <tr>
                                    <th>Middle</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                    <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                          <Checkbox
                                            size="xs"
                                            label="How it works"
                                            checked={liSequenceState.howItWorks}
                                            onChange={(e) =>
                                              setLiSequenceState({
                                                ...liSequenceState,
                                                howItWorks: e.currentTarget.checked,
                                              })
                                            }
                                          />
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                          <Text size="sm">One of the messages will be a description on how it works. This is nice because it gives the prospect a better understanding of what you do.</Text>
                                        </HoverCard.Dropdown>
                                      </HoverCard>
                                    </td>
                                    <td>
                                      <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                          <Checkbox
                                            size="xs"
                                            label="Unique offer"
                                            checked={liSequenceState.uniqueOffer}
                                            onChange={(e) =>
                                              setLiSequenceState({
                                                ...liSequenceState,
                                                uniqueOffer: e.currentTarget.checked,
                                              })
                                            }
                                          />
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                          <Text size="sm">One of the message variants will contain a unique offer relevant to your business.</Text>
                                        </HoverCard.Dropdown>
                                      </HoverCard>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                              <Table>
                                <thead>
                                  <tr>
                                    <th>End</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                      <HoverCard width={280} shadow="md">
                                        <HoverCard.Target>
                                          <Checkbox
                                            size="xs"
                                            label="Breakup message"
                                            checked={liSequenceState.breakupMessage}
                                            onChange={(e) =>
                                              setLiSequenceState({
                                                ...liSequenceState,
                                                breakupMessage: e.currentTarget.checked,
                                              })
                                            }
                                          />
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                          <Text size="sm">One of the variants in the last step will be a "breakup" message.</Text>
                                        </HoverCard.Dropdown>
                                      </HoverCard>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </Box>
                          </Box>
                        </Collapse>
                      </Stack>
                    </Accordion>
                  )}
                  </Paper>
                </Stack>

                {/* <Collapse in={opened}>
                  <Textarea
                    placeholder="eg. I want to offer them $150 Amazon gift card for a 30-minute call so I can ask them about their sales process"
                    label="Purpose (optional)"
                    description="Once filled, SellScale AI will automatically find 5 sample prospects and generate a draft campaign for you."
                    value={purpose}
                    // required
                    onChange={(e) => setPurpose(e.currentTarget.value)}
                  />
                </Collapse> */}

                {/* <Button onClick={() => setOpened(!opened)} compact size="xs" color="gray" variant="subtle" ml="auto" mt="md">
                  {opened ? "Hide" : "Show"} Advanced Options
                </Button> */}

                {/* <Textarea
                label="Who do you want to target"
                placeholder="Eg. I want to see product mangers in chicago who went to BYU and are currently in a hedge fund role at a large financial institution"
                minRows={3}
                onChange={(e) => setICPMatchingPrompt(e.currentTarget.value)}
              />

              <Textarea
                withAsterisk
                value={contactObjective}
                description="Describe the objective of the outreach."
                placeholder="Eg. I want to grab a coffee with them!"
                label="What do you want to say"
                onChange={(e) => setContactObjective(e.target.value)}
              /> */}
              </>
            ) : (
              <Select
                label={"Set Persona"}
                defaultValue={
                  defaultPersonas.current.length === 1 ||
                  (defaultPersonas.current.length > 1 && defaultPersonas.current[0].group === "Active" && defaultPersonas.current[1].group === "Inactive")
                    ? defaultPersonas.current[0].value
                    : undefined
                }
                data={personas}
                placeholder={innerProps.mode === "ADD-ONLY" ? "Select a persona for the prospects" : "Select or create a persona for the prospects"}
                nothingFound={"Nothing found"}
                icon={<IconUsers size={14} />}
                searchable
                creatable={innerProps.mode === "ADD-CREATE"}
                clearable
                getCreateLabel={(query) => (
                  <>
                    <span style={{ fontWeight: 700 }}>New Persona: </span>
                    {query}
                  </>
                )}
                onCreate={(query) => {
                  // value = ID if selected, name if created
                  const item = { value: query, label: query, group: undefined }; // group: "Active"
                  setPersonas((current) => [...current, item]);
                  setCreatedPersona(query);
                  return item;
                }}
                onChange={(value) => {
                  // If created persona exists and is one of the existing personas, clear it
                  if (createdPersona.length > 0 && personas.filter((personas) => personas.value === value).length > 0) {
                    setPersonas(defaultPersonas.current);
                    setCreatedPersona("");
                  }
                  setSelectedPersona(value);
                }}
              />
            )}
          </>

          <CreatePersona
            createPersona={{
              name: createdPersona,
              ctas: ctas.map((cta) => cta.cta),
              fitReason: fitReason,
              icpMatchingPrompt: icpMatchingPrompt,
              contactObjective: contactObjective,
              contractSize: personaContractSize,
              templateMode: templateMode === "template",
              connectedStrategyId: connectedStrategy ? connectedStrategy.id : undefined,
              override_archetype_id: (window.location.href.includes('/campaign_v2') || window.location.href.includes('selix')) ? currentProject?.id : undefined,
              purpose,
              autoGenerationPayload : {
              findSampleProspects,
              writeEmailSequenceDraft,
              writeLISequenceDraft,
              emailSequenceOpened,
              emailSequenceKeywords,
              liSequenceOpened,
              liGeneralAngle,
              emailGeneralAngle,
              liSequenceKeywords,
              liAssetIngestor,
              liCtaGenerator,
              ctaTarget: ctaTarget ? ctaTarget : createdPersona,
              emailAssetIngestor,
              withData,
              selectedVoice: selectedVoice ? +selectedVoice : undefined,
              numStepsEmail,
              numStepsLinkedin,
              numVarianceEmail,
              numVarianceLinkedin,
              liPainPoint,
              liSequenceState,
              emailSequenceState: emailSequenceStateRaw,
            },
            }}
          />
        </Stack>
      ) : tab === "voice" ? (
        <Stack spacing="xs" mt={"md"}>
          {/*<TextInput placeholder="Search strategies" rightSection={<IconSearch size={"1rem"} color="gray" />} />*/}
          <SimpleGrid cols={2}>
            {defaultVoicesOptions.slice(pages * 4, pages * 4 + 4).map((item, index) => {
              return (
                <Paper withBorder radius={"sm"} p={"sm"} key={index} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                  <>
                    <Flex align={"center"} justify={"space-between"}>
                      <Text fw={600} size={"md"}>
                        {item.title}
                      </Text>
                      <ActionIcon variant="light" color="blue" radius={"xl"} size={"sm"}>
                        <IconEye size={"0.9rem"} />
                      </ActionIcon>
                    </Flex>
                    <Text fw={600} size={"xs"} mt={"sm"}>
                      Description: <span className="text-gray-400">{item.description}</span>
                    </Text>
                    <Flex gap={'4px'} mt={'8px'}>
                      <Badge color={'purple'}># CTAs: {item.count_ctas}</Badge>
                      <Badge color={'green'}># Bumps: {item.count_bumps}</Badge>
                    </Flex>
                  </>
                  <Button
                    fullWidth
                    mt={"sm"}
                    onClick={() => {
                      openContextModal({
                        modal: "createCampaignWithVoiceModal",
                        title: (
                          <Title
                            order={3}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            Voice Options for: {item.title}
                          </Title>
                        ),
                        innerProps: { title: item.title, voice_id: item.id, userToken: userToken },
                        styles: {
                          content: {
                            minWidth: "800px",
                          },
                        },
                      });
                    }}
                  >
                    Select
                  </Button>
                </Paper>
              );
            })}
          </SimpleGrid>
          <Paper withBorder>
            <Flex align={"center"}>
              <Select
                w={100}
                data={Array.from({ length: Math.ceil(strategyOptions.length / 4) }, (_, i) => ({
                  label: `${i + 1}`,
                  value: i.toString(),
                }))}
                variant="unstyled"
                onChange={(e) => setPages(Number(e))}
                styles={{
                  input: {
                    paddingLeft: "14px",
                  },
                }}
              />
              <Divider orientation="vertical" />
              <Text w={"100%"} size={"sm"} color="gray" align="center">
                of {Math.ceil(defaultVoicesOptions.length / 4)} pages
              </Text>
              <Divider orientation="vertical" />
              <ActionIcon
                variant="transparent"
                onClick={() => {
                  if (pages > 0) {
                    setPages((pages) => (pages = pages - 1));
                  }
                }}
              >
                <IconChevronLeft size={"0.9rem"} />
              </ActionIcon>
              <Divider orientation="vertical" />
              <ActionIcon
                variant="transparent"
                onClick={() => {
                  if (pages < Math.ceil(defaultVoicesOptions.length / 4) - 1) {
                    setPages((pages) => (pages = pages + 1));
                  }
                }}
              >
                <IconChevronRight size={"0.9rem"} />
              </ActionIcon>
            </Flex>
          </Paper>
        </Stack>
      ) : (<Stack spacing="xs" mt={"md"}>
        {/*<TextInput placeholder="Search strategies" rightSection={<IconSearch size={"1rem"} color="gray" />} />*/}
        <SimpleGrid cols={2}>
          {strategyOptions.slice().reverse().map((strategy, index) => {
            return (
              <Paper withBorder radius={"sm"} p={"sm"} key={index} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <>
                  <Flex align={"center"} justify={"space-between"}>
                    <Text fw={600} size={"md"}>
                      {strategy.title}
                    </Text>
                    <ActionIcon 
                      onClick={() => {
                        openContextModal({
                          modal: "editStrategy",
                          title: (
                            <Flex align={"center"} gap={"sm"}>
                              <IconBulb color="#228be6" size={"1.6rem"} />
                              <Title order={2}>Edit Strategy</Title>
                            </Flex>
                          ),
                          styles: {
                            content: {
                              minWidth: "70%",
                            },
                          },
                          innerProps: {
                            title: strategy.title,
                            description: strategy.description,
                            archetypes: [],
                            status: strategy.status,
                            startDate: strategy.start_date ? new Date(strategy.start_date) : null,
                            endDate: strategy.end_date ? new Date(strategy.end_date) : null,
                            onSubmit: async (
                              title: string,
                              description: string,
                              archetypes: number[],
                              status: string,
                              startDate: Date,
                              endDate: Date
                            ) => {
                              const response = await patchUpdateStrategy(
                                strategy.id,
                                title,
                                description,
                                archetypes,
                                status,
                                startDate,
                                endDate
                              );
                              handleStrategy();
                              // const updatedStrategy = await getStrategy(strategy.id);
                              // setStrategy(updatedStrategy);
                              showNotification({
                                title: "Success",
                                message: "Strategy updated successfully",
                                color: "green",
                              });
                            },
                          },
                        });
                      }}
                    
                    variant="light" color="blue" radius={"xl"} size={"sm"}>
                      <IconPencil size={"0.9rem"} />
                    </ActionIcon>
                  </Flex>
                
                  <Flex gap={'4px'} mt={'8px'}>
                    <Badge color={'purple'}>
                      <Text size="xs" fw={700}>
                        Start Date: {new Date(strategy.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                    </Badge>
                    <Badge color={'green'}>
                      <Text size="xs" fw={700}>
                        End Date: {new Date(strategy.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                    </Badge>
                  </Flex>
                </>
                <Button
                  color="grape"
                  loading={loadingStrategy}
                  fullWidth
                  mt={"sm"}
                  onClick={() => {
                    setConnectedStrategy(strategy);
                    fillInFromStrategy(strategy).then(() => {
                      // Handle any additional logic here if needed
                    });
                  }}
                >
                  Use
                </Button>
              </Paper>
            );
          })}
        </SimpleGrid>
        <Paper withBorder>
          <Flex align={"center"}>
            <Select
              w={100}
              data={Array.from({ length: Math.ceil(strategyOptions.length / 4) }, (_, i) => ({
                label: `${i + 1}`,
                value: i.toString(),
              }))}
              variant="unstyled"
              onChange={(e) => setPages(Number(e))}
              styles={{
                input: {
                  paddingLeft: "14px",
                },
              }}
            />
            <Divider orientation="vertical" />
            <Text w={"100%"} size={"sm"} color="gray" align="center">
              of {Math.ceil(defaultVoicesOptions.length / 4)} pages
            </Text>
            <Divider orientation="vertical" />
            <ActionIcon
              variant="transparent"
              onClick={() => {
                if (pages > 0) {
                  setPages((pages) => (pages = pages - 1));
                }
              }}
            >
              <IconChevronLeft size={"0.9rem"} />
            </ActionIcon>
            <Divider orientation="vertical" />
            <ActionIcon
              variant="transparent"
              onClick={() => {
                if (pages < Math.ceil(defaultVoicesOptions.length / 4) - 1) {
                  setPages((pages) => (pages = pages + 1));
                }
              }}
            >
              <IconChevronRight size={"0.9rem"} />
            </ActionIcon>
          </Flex>
        </Paper>
      </Stack>)}
    </Paper>
  );
}
