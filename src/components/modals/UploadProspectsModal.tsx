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
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconBrandLinkedin,
  IconBulb,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconEye,
  IconMailOpened,
  IconPlus,
  IconSearch,
  IconUser,
  IconUsers,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import {Archetype, DefaultVoices, MsgResponse} from "src";
import { API_URL } from "@constants/data";
import CreatePersona from "@common/persona/CreatePersona";
import Hook from "@pages/channels/components/Hook";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { currentProjectState } from "@atoms/personaAtoms";

export default function UploadProspectsModal({ context, id, innerProps }: ContextModalProps<{ mode: "ADD-ONLY" | "ADD-CREATE" | "CREATE-ONLY" }>) {
  const theme = useMantineTheme();
  const userData = useRecoilValue(userDataState);
  const [personas, setPersonas] = useState<{ value: string; label: string; group: string | undefined }[]>([]);
  const defaultPersonas = useRef<{ value: string; label: string; group: string | undefined }[]>([]);
  const [createdPersona, setCreatedPersona] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const [newCTAText, setNewCTAText] = useState("");
  const addCTAInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [ctas, setCTAs] = useState<{ id: number; cta: string }[]>([]);

  const [fitReason, setFitReason] = useState("");
  const [icpMatchingPrompt, setICPMatchingPrompt] = useState("Describe your persona here ...");

  const [contactObjective, setContactObjective] = useState("Set up a discovery call in order to identify a pain point");

  const [purpose, setPurpose] = useState("");

  const [personaContractSize, setPersonaContractSize] = useState(userData.client.contract_size);
  const [templateMode, setTemplateMode] = useState<string>("cta");

  const [opened, setOpened] = useState(false);

  const [tab, setTab] = useState("scratch");

  const [defaultVoicesOptions, setDefaultVoicesOptions] = useState<DefaultVoices[]>([]);

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
  const [liAssetIngestor, setLiAssetIngestor] = useState("");
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
  const [emailSequenceState, setEmailSequenceState] = useState({
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

    getVoices();
  }, [])

  console.log("Default voices options: ", defaultVoicesOptions);

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

  const userToken = useRecoilValue(userTokenState);

  const [strategies, setStrategies] = useState([
    {
      title: "Account Targeting",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Similar Accounts",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Location Targeting",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Giftcard Campaign",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Location Targeting",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Giftcard Campaign",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Account Targeting",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
    {
      title: "Similar Accounts",
      goal: "Test out if Bay Area is working better; select different meetings.",
    },
  ]);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    if (personas.length === 0 && defaultPersonas.current.length > 0) {
      setPersonas(defaultPersonas.current);
      setSelectedPersona(defaultPersonas.current[0].value);
    }
  }, [defaultPersonas.current]);

  console.log("CTAs: ", ctas);

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      }}
    >
      <SegmentedControl
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
        ]}
      />
      {tab === "scratch" ? (
        <Stack spacing="xs" mt={"md"}>
          {/* <Text color="gray" size={"sm"}>
            Enter the information below to describe and fine-tune your campaign
          </Text> */}
          <>
            {innerProps.mode === "CREATE-ONLY" ? (
              <>
                <TextInput
                  placeholder="eg. C-Suite Sales Leaders in tech companies"
                  label={<Text mb="xs" size="lg">Campaign Name</Text>}
                  value={createdPersona}
                  onChange={(e) => setCreatedPersona(e.currentTarget.value)}
                />
                <Stack spacing={"xs"} mt={4}>
                  <Text size={"md"} fw={500} mb={-8}>
                    Campaign Automations
                  </Text>
                  <Paper withBorder p="sm">
                  <Switch
                    onChange={() => setFindSampleProspects(!findSampleProspects)}
                    labelPosition="left"
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
                  </Paper>
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
                            <Text size="sm" fw={500}>
                              Include Templates
                            </Text>
                            <SimpleGrid mb="sm" cols={2} mt="xs">
                              <Checkbox 
                                size="xs" 
                                label="How it works" 
                                checked={emailSequenceState.howItWorks}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, howItWorks: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Vary intro messages" 
                                checked={emailSequenceState.varyIntroMessages}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, varyIntroMessages: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Breakup message" 
                                checked={emailSequenceState.breakupMessage}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, breakupMessage: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Unique offer" 
                                checked={emailSequenceState.uniqueOffer}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, uniqueOffer: e.currentTarget.checked })}
                              />
                            </SimpleGrid>
                          </Box>
                          <Box>
                            <Text size="sm" fw={500}>
                              Include Strategies
                            </Text>
                            <SimpleGrid cols={2} mt="xs">
                              <Checkbox 
                                size="xs" 
                                label="Conference outreach" 
                                checked={emailSequenceState.conferenceOutreach}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, conferenceOutreach: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="City chat" 
                                checked={emailSequenceState.cityChat}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, cityChat: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Former work alum" 
                                checked={emailSequenceState.formerWorkAlum}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, formerWorkAlum: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Feedback based" 
                                checked={emailSequenceState.feedbackBased}
                                onChange={(e) => setEmailSequenceState({ ...emailSequenceState, feedbackBased: e.currentTarget.checked })}
                              />
                            </SimpleGrid>
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
                          onChange={(e) => setLiCtaGenerator(e.currentTarget.checked)}
                        />
                        {liCtaGenerator && <TextInput 
                          placeholder={"Is this a pain? (e.g., Are you facing challenges with XYZ?)"} 
                          value={liPainPoint}
                          onChange={(e) => setLiPainPoint(e.currentTarget.value)}
                        />}
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
                            <SimpleGrid mb="sm" cols={2} mt="xs">
                              <Checkbox 
                                size="xs" 
                                label="How it works" 
                                checked={liSequenceState.howItWorks}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, howItWorks: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Vary intro messages" 
                                checked={liSequenceState.varyIntroMessages}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, varyIntroMessages: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Breakup message" 
                                checked={liSequenceState.breakupMessage}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, breakupMessage: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Unique offer" 
                                checked={liSequenceState.uniqueOffer}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, uniqueOffer: e.currentTarget.checked })}
                              />
                            </SimpleGrid>
                          </Box>
                          <Box>
                            <Text size="sm" fw={500}>
                              Include Strategies
                            </Text>
                            <SimpleGrid cols={2} mt="xs">
                              <Checkbox 
                                size="xs" 
                                label="Conference outreach" 
                                checked={liSequenceState.conferenceOutreach}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, conferenceOutreach: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="City chat" 
                                checked={liSequenceState.cityChat}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, cityChat: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Former work alum" 
                                checked={liSequenceState.formerWorkAlum}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, formerWorkAlum: e.currentTarget.checked })}
                              />
                              <Checkbox 
                                size="xs" 
                                label="Feedback based" 
                                checked={liSequenceState.feedbackBased}
                                onChange={(e) => setLiSequenceState({ ...liSequenceState, feedbackBased: e.currentTarget.checked })}
                              />
                            </SimpleGrid>
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
              liPainPoint,
              liSequenceState,
              emailSequenceState,
            },
            }}
          />
        </Stack>
      ) : (
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
                data={Array.from({ length: Math.ceil(strategies.length / 4) }, (_, i) => ({
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
      )}
    </Paper>
  );
}
