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
  Title,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconBrandLinkedin,
  IconBulb,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconMailOpened,
  IconPlus,
  IconSearch,
  IconUsers,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { Archetype, MsgResponse } from "src";
import { API_URL } from "@constants/data";
import CreatePersona from "@common/persona/CreatePersona";
import Hook from "@pages/channels/components/Hook";

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
            value: "EMAIL",
            label: (
              <Center>
                <IconBulb size="1rem" />
                <Box ml={10}>Create from Strategy</Box>
              </Center>
            ),
          },
        ]}
      />
      {tab === "scratch" ? (
        <Stack spacing="xs" mt={"md"}>
          <Text color="gray" size={"sm"}>
            Enter the information below to describe and fine-tune your campaign
          </Text>
          <>
            {innerProps.mode === "CREATE-ONLY" ? (
              <>
                <TextInput
                  placeholder="eg. C-Suite Sales Leaders in tech companies"
                  label="Campaign Name"
                  value={createdPersona}
                  // required
                  onChange={(e) => setCreatedPersona(e.currentTarget.value)}
                />

                <Collapse in={opened}>
                  <Textarea
                    placeholder="eg. I want to offer them $150 Amazon gift card for a 30-minute call so I can ask them about their sales process"
                    label="Purpose (optional)"
                    description="Once filled, SellScale AI will automatically find 5 sample prospects and generate a draft campaign for you."
                    value={purpose}
                    // required
                    onChange={(e) => setPurpose(e.currentTarget.value)}
                  />
                </Collapse>

                <Button onClick={() => setOpened(!opened)} compact size="xs" color="gray" variant="subtle" ml="auto" mt="md">
                  {opened ? "Hide" : "Show"} Advanced Options
                </Button>

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
            }}
          />
        </Stack>
      ) : (
        <Stack spacing="xs" mt={"md"}>
          <TextInput placeholder="Search strategies" rightSection={<IconSearch size={"1rem"} color="gray" />} />
          <SimpleGrid cols={2}>
            {strategies.slice(pages * 4, pages * 4 + 4).map((item, index) => {
              return (
                <Paper withBorder radius={"sm"} p={"sm"} key={index}>
                  <Flex align={"center"} justify={"space-between"}>
                    <Text fw={600} size={"md"}>
                      {item.title}
                    </Text>
                    <ActionIcon variant="light" color="blue" radius={"xl"} size={"sm"}>
                      <IconEye size={"0.9rem"} />
                    </ActionIcon>
                  </Flex>
                  <Text fw={600} size={"xs"} mt={"sm"}>
                    Goal: <span className="text-gray-400">{item.goal}</span>
                  </Text>
                  <Button
                    fullWidth
                    mt={"sm"}
                    onClick={() => {
                      openContextModal({
                        modal: "strategySelectModal",
                        title: (
                          <Title order={3} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <ActionIcon variant="light" color="blue" radius={"xl"}>
                              <IconArrowLeft size={"1rem"} />
                            </ActionIcon>
                            <span className="text-gray-600">Go back to</span> Create Campaign
                          </Title>
                        ),
                        innerProps: { title: item.title },
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
                of {Math.ceil(strategies.length / 4)} pages
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
                  if (pages < Math.ceil(strategies.length / 4) - 1) {
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
