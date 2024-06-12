import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Title,
  Flex,
  Paper,
  ScrollArea,
  Select,
  Text,
  Textarea,
  Tooltip,
  Loader,
  Modal,
  Center,
  SegmentedControl,
  TextInput,
  Popover,
  LoadingOverlay,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import {
  IconBrandLinkedin,
  IconBuilding,
  IconBulb,
  IconEdit,
  IconEye,
  IconPlus,
  IconPoint,
  IconQuestionMark,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import {
  IconLayoutSidebarRightCollapseFilled,
  IconSparkles,
} from "@tabler/icons-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { fetchCampaignContacts } from "@utils/requests/campaignOverview";
import { modals } from "@mantine/modals";
import * as researchers from "@utils/requests/researchers";
import { useState, useEffect, useRef, Key } from "react";
import { deterministicMantineColor } from "@utils/requests/utils";
import { socket } from "../../App";
import { currentProjectState } from "@atoms/personaAtoms";
import { getFreshCurrentProject } from "@auth/core";
import { showNotification } from "@mantine/notifications";

export default function CampaignPersonalizersModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  id(id: any): number;
  sequences: any;
  ai_researcher_id: number;
  setPersonalizers: Function;
}>) {
  const generateTextWithBadges = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/).filter(Boolean);
    return parts.map((part, index) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        let badgeText = part.slice(2, -2);
        return (
          <Badge key={index} color="gray">
            {badgeText}
          </Badge>
        );
      }
      if (/^[A-Z_]+$/.test(part)) {
        let formattedText = part.toLowerCase().replace(/_/g, " ");
        formattedText =
          formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
        return <span key={index}>{formattedText}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const [loadingProspects, setLoadingProspects] = useState(false);
  const [loadingResearchData, setLoadingResearchData] = useState(false);
  const [generatingResearchPoints, setGeneratingResearchPoints] = useState(
    false
  );
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );
  const [aiResearcherLoading, setAiResearcherLoading] = useState(false);
  const [generatedResearchData, setGeneratedResearchData] = useState<any[]>([]);
  const [prospectData, setProspectData] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [researching, setResearching] = useState(false);
  const [aiResearchers, setAiResearchers] = useState<any>([]);
  //deep copy
  const sequences = innerProps?.sequences ? [...innerProps.sequences] : [];

  const userToken = useRecoilValue(userTokenState);

  socket.on("stream-answers", (data) => {
    if (data.message === "done") {
      setResearching(false);
      return;
    }
    const newSimulateData = {
      title: data.question,
      type: data.type,
      content: data.cleaned_research,
      raw_response: data.raw_response,
      ai_response: data.relevancy_explanation,
      status: data.is_yes_response,
    };
    setSimulateData((prevData: any) => {
      const dataSet = new Set(
        prevData.map((item: any) => JSON.stringify(item))
      );
      const newDataString = JSON.stringify(newSimulateData);
      if (dataSet.has(newDataString)) {
        return prevData;
      }
      const updatedData = [newSimulateData, ...prevData];
      return updatedData.sort((a, b) => b.status - a.status);
    });
  });

  const fetchCurrentProject = async () => {
    const project = await getFreshCurrentProject(userToken, +innerProps.id);
    setCurrentProject(project);
  };

  const fetchProspects = async () => {
    try {
      setLoadingProspects(true);
      const data = await fetchCampaignContacts(
        userToken,
        Number(innerProps.id),
        0,
        10,
        "",
        false
      );
      const newProspectData = data.sample_contacts.map(
        (contact: { id: any; full_name: any }) => ({
          value: contact.id,
          label: contact.full_name,
        })
      );
      setProspectData(newProspectData);
      if (newProspectData[0]?.value) {
        setSelectedProspect(newProspectData[0].value);
        fetchResearcherAnswers(newProspectData[0].value);
      }
    } finally {
      setLoadingProspects(false);
    }
  };

  const fetchResearchData = async () => {
    setLoadingResearchData(true);
    try {
      const data = (await researchers.getArchetypeQuestions(
        userToken,
        Number(innerProps.id)
      )) as any;
      const newResearchData = data.questions.map(
        (item: { id: any; key: any; type: any; relevancy: any }) => ({
          id: item.id,
          title: item.key,
          type: item.type,
          content: item.relevancy,
          ai_response: "",
          status: "",
        })
      );
      setResearchData(newResearchData);
    } finally {
      setLoadingResearchData(false);
    }
  };

  const addGeneratedResearchPoint = async (item: any) => {
    try {
      setLoadingResearchData(true);
      console.log("data is", item);
      const response = await researchers.createResearcherQuestion(
        userToken,
        "QUESTION",
        item.Question,
        item.RelevanceReason,
        innerProps.ai_researcher_id
      );
      if (!response) {
        throw new Error(`Error creating researcher question}`);
      }
      await fetchResearchData();
    } catch (error) {
      console.error("Error creating researcher question:", error);
    } finally {
      setLoadingResearchData(false);
      // Call useEffect logic again
      fetchProspects();
      fetchResearchData();
    }
  };

  const connectAiResearcher = async (researcherId: number) => {
    setAiResearcherLoading(true);
    researchers
      .connectResearcher(userToken, Number(innerProps.id), researcherId)
      .finally(() => {
        showNotification({
          title: "AI Researcher Connected",
          message:
            "AI Researcher has been successfully connected to this campaign",
          color: "blue",
          icon: "🎉",
        });
        fetchResearchData();
        fetchCurrentProject().finally(() => {
          setAiResearcherLoading(false);
        });
      });
  };

  useEffect(() => {
    fetchProspects();
    fetchResearchData();
    getAiResearchers();
  }, []);

  const getAiResearchers = async () => {
    const data: any = await researchers.getAiResearchers(userToken);
    if (data) setAiResearchers(data["researchers"]);
  };

  const generateResearchPoints = async () => {
    setGeneratingResearchPoints(true);
    const data = await researchers.aiGenerateResearchPoints(
      userToken,
      Number(innerProps.id),
      Number(innerProps.id)
    );
    //filter only relevant questions into this.
    const relevantQuestions = data
      .filter((item: any) => item.Relevant === "Yes")
      .map((item: any) => ({
        Question: item.Question,
        RelevanceReason: item.RelevanceReason,
      }));
    setGeneratedResearchData(relevantQuestions);
    setGeneratingResearchPoints(false);
  };

  const fetchResearcherAnswers = async (prospectId: Number) => {
    setResearching(true);
    const data = await researchers.getResearcherAnswers(
      userToken,
      Number(prospectId)
    );
    const newSimulateData = data.answers
      .map((item: any) => ({
        title: item.question.key,
        type: item.question.type,
        content: item.short_summary,
        raw_response: item.raw_response,
        ai_response: item.relevancy_explanation,
        status: item.is_yes_response,
      }))
      .sort(
        (a: { status: number }, b: { status: number }) => b.status - a.status
      ); //sort by status true first.
    setSimulateData(newSimulateData);
    setResearching(false);
  };

  const simulateResearch = async (prospectId: Number) => {
    setResearching(true);
    const room_id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    if (socket) {
      setSimulateData([]);
      socket.emit("join-room", {
        payload: { room_id: room_id },
      });
      await researchers.createResearcherAnswer(userToken, prospectId, room_id);
    }
    // fetchResearcherAnswers(prospectId);
  };

  console.log("AAKASH ADESara");
  console.log(currentProject);

  const [researchData, setResearchData] = useState<any>([]);
  const [simulateData, setSimulateData] = useState([]);
  return (
    <>
      <Flex mt={"lg"} style={{ border: "1px solid gray", borderRadius: "6px" }}>
        <Paper
          p={"md"}
          pr={"xs"}
          w={"40%"}
          display={"flex"}
          style={{ gap: "16px", flexDirection: "column" }}
        >
          <Flex align={"center"} justify={"space-between"}>
            <Text fw={600}>Researcher Questions</Text>
            <Tooltip
              multiline
              position="right"
              label="SellScale AI Researcher will answer these questions by scouring the web, LinkedIn, and other sources to develop a better understanding for each prospect you reach out to for the most relevant and personalized messaging."
            >
              <ActionIcon>
                <IconQuestionMark size={"1rem"} />
              </ActionIcon>
            </Tooltip>
          </Flex>
          <Flex>
            {aiResearcherLoading && <Loader size="xs" color="grape" mr="sm" />}
            <Select
              w="100%"
              label="AI Researcher:"
              defaultValue={"" + currentProject?.ai_researcher_id}
              data={aiResearchers.map((x: any) => {
                return { value: "" + x.id, label: x.name };
              })}
              onChange={(value) => {
                connectAiResearcher(Number(value));
              }}
              creatable
              searchable
              getCreateLabel={(query) => `+ Create ${query}`}
              onCreate={(query) => {
                alert("Creating new AI Researcher: " + query);
                return "";
              }}
            />
          </Flex>
          <Flex>
            <Button
              fullWidth
              leftIcon={<IconPlus size={"0.9rem"} />}
              mr={"md"}
              onClick={() => {
                modals.openContextModal({
                  modal: "addQuestionModal",
                  title: (
                    <Title order={3}>
                      <span className=" text-gray-500">Add</span> Research Point
                    </Title>
                  ),
                  innerProps: {
                    edit: false,
                    sequences: sequences,
                    ai_researcher_id: innerProps.ai_researcher_id,
                    campaign_id: innerProps.id,
                    setPersonalizers: innerProps.setPersonalizers,
                  },
                });
              }}
            >
              Research point
            </Button>
            <Button
              color="grape"
              fullWidth
              leftIcon={<IconSparkles size={"0.9rem"} />}
              mr={"md"}
              onClick={() => {
                generateResearchPoints();
              }}
            >
              AI Suggest
            </Button>
          </Flex>
          {generatingResearchPoints && (
            <Text size={"sm"} color="grape" mt={"sm"} align="center">
              <Loader size="xs" color="grape" mr="sm" /> Generating research
              points
            </Text>
          )}
          <ScrollArea h={500} scrollbarSize={8} pr={"md"}>
            {loadingResearchData ? (
              <Center h={"100%"}>
                <Loader size="lg" />
              </Center>
            ) : (
              <>
                <Flex h={"100%"} gap={"xs"} direction={"column"}>
                  {researchData.map(
                    (item: any, index: Key | null | undefined) => {
                      return (
                        <Paper withBorder p={"md"} key={index}>
                          <Flex align={"start"} justify={"space-between"}>
                            <Text size={"sm"} fw={600} pt={4}>
                              {generateTextWithBadges(item.title)}
                            </Text>
                            <Flex gap={3} align={"center"}>
                              <ActionIcon
                                onClick={() =>
                                  openContextModal({
                                    modal: "addQuestionModal",
                                    title: (
                                      <Title order={3}>
                                        <span className=" text-gray-500">
                                          Edit
                                        </span>{" "}
                                        Research Point
                                      </Title>
                                    ),
                                    innerProps: {
                                      edit: true,
                                      sequences: sequences,
                                      question_id: item.id,
                                      currentTab: item.type,
                                      relevancy: item.content,
                                      question: item.title,
                                      ai_researcher_id:
                                        innerProps.ai_researcher_id,
                                      campaign_id: innerProps.id,
                                      setPersonalizers:
                                        innerProps.setPersonalizers,
                                    },
                                    centered: true,
                                    styles: {
                                      content: {
                                        minWidth: "500px",
                                      },
                                    },
                                  })
                                }
                              >
                                <IconEdit color="gray" size={"0.9rem"} />
                              </ActionIcon>
                              <ActionIcon
                                onClick={async () => {
                                  researchers.deleteResearcherQuestion(
                                    userToken,
                                    Number(item.id)
                                  );
                                  setResearchData((prevData: any[]) =>
                                    prevData.filter(
                                      (researchItem) =>
                                        researchItem.id !== item.id
                                    )
                                  );
                                }}
                              >
                                <IconTrash color="gray" size={"0.9rem"} />
                              </ActionIcon>
                              <Badge
                                size="sm"
                                radius={"sm"}
                                color={deterministicMantineColor(item.type)}
                              >
                                {item.type}
                              </Badge>
                            </Flex>
                          </Flex>
                          <Text size={"sm"} mt={2}>
                            {item.content}
                          </Text>
                        </Paper>
                      );
                    }
                  )}
                </Flex>
                {generatedResearchData.length > 0 && (
                  <Divider
                    my="sm"
                    label="AI Generated Research Points"
                    labelPosition="center"
                    color="salmon"
                  />
                )}
                <Flex
                  h="100%"
                  gap="xs"
                  direction="column"
                  style={{ color: "salmon" }}
                >
                  {generatedResearchData.map(
                    (item: any, index: Key | null | undefined) => {
                      return (
                        <Paper withBorder p={"md"} key={index}>
                          <Flex align={"start"} justify={"space-between"}>
                            <Text size={"sm"} fw={600} pt={4}>
                              {generateTextWithBadges(item.Question)}
                            </Text>
                            <Flex gap={3} align={"center"}>
                              <Badge size="sm" radius={"sm"} color="blue">
                                AI Generated
                              </Badge>
                              <Button
                                size="xs"
                                color="grape"
                                onClick={() => {
                                  setGeneratedResearchData((prevData) =>
                                    prevData.filter(
                                      (researchItem) => researchItem !== item
                                    )
                                  );
                                  addGeneratedResearchPoint(item);
                                }}
                              >
                                Add
                              </Button>
                            </Flex>
                          </Flex>
                          <Text size={"sm"} mt={2}>
                            {item.RelevanceReason}
                          </Text>
                        </Paper>
                      );
                    }
                  )}
                </Flex>
              </>
            )}
          </ScrollArea>
        </Paper>
        <Divider orientation="vertical" />
        <Paper
          w={"66%"}
          display={"flex"}
          style={{ gap: "16px", flexDirection: "column" }}
        >
          <Flex
            p={"lg"}
            justify={"space-between"}
            align={"center"}
            gap={"sm"}
            style={{ borderBottom: "1px solid gray" }}
          >
            <Text fw={600}>Simulate Research</Text>
            {loadingProspects ? (
              <Loader size="sm" />
            ) : (
              <Flex gap={"sm"} align={"center"}>
                <Text color="gray" size={"sm"}>
                  Select prospect:
                </Text>
                <Select
                  placeholder="-"
                  onChange={(value) => {
                    setSelectedProspect(value);
                    value && fetchResearcherAnswers(Number(value));
                  }}
                  data={prospectData}
                  defaultValue={
                    prospectData.length > 0
                      ? (prospectData[0] as { value: string }).value
                      : null
                  }
                ></Select>
                {selectedProspect &&
                  (researching ? (
                    <Loader size="sm" />
                  ) : (
                    <Button
                      color="grape"
                      onClick={() => simulateResearch(selectedProspect)}
                    >
                      Simulate
                    </Button>
                  ))}
              </Flex>
            )}
          </Flex>
          <ScrollArea h={500} scrollbarSize={8} px={"md"}>
            {false ? (
              <Loader size="sm" />
            ) : (
              <Flex gap={"xs"} direction={"column"}>
                {simulateData.length === 0 ? (
                  <Text size={"sm"} color="gray">
                    No simulation run yet.
                  </Text>
                ) : (
                  simulateData.map((item: any, index) => {
                    return (
                      <Paper withBorder p={"lg"} key={index}>
                        <Flex justify={"space-between"}>
                          <Flex>
                            <IconPoint
                              size={"2rem"}
                              fill={item.status ? "#17B26A" : "red"}
                              color="white"
                              className="mt-[-6px] ml-[-12px]"
                            />
                            <Text fw={600} size={"sm"}>
                              {generateTextWithBadges(item.title)}
                            </Text>
                          </Flex>
                          <Badge
                            radius={"sm"}
                            size="sm"
                            color={
                              item.type === "GENERAL"
                                ? "orange"
                                : item.type === "LINKEDIN"
                                ? ""
                                : "green"
                            }
                          >
                            {item.type}
                          </Badge>
                        </Flex>
                        <Text size={"sm"} fw={500}>
                          {item.content}
                        </Text>
                        <Flex
                          p={"sm"}
                          className="bg-[#D444F1]/5"
                          gap={4}
                          align={"start"}
                        >
                          <Flex>
                            <IconBulb size={"0.9rem"} color="#D444F1" />
                          </Flex>
                          <Text color="#D444F1" size={"xs"}>
                            {item.ai_response}
                          </Text>
                        </Flex>
                        <Popover
                          arrowPosition="center"
                          zIndex={40000000}
                          width={300}
                          position="bottom"
                          withArrow
                          shadow="md"
                        >
                          <Popover.Target>
                            <Flex align="center" style={{ cursor: "pointer" }}>
                              <IconEye
                                size={"1rem"}
                                style={{ marginRight: "4px" }}
                              />
                              <Text size={"xs"} fw={400}>
                                See raw content
                              </Text>
                            </Flex>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Text size="xs">{item.raw_response}</Text>
                          </Popover.Dropdown>
                        </Popover>
                      </Paper>
                    );
                  })
                )}
              </Flex>
            )}
          </ScrollArea>
          <Flex align={"center"} gap={"md"} mt={"lg"}>
            <Button
              fullWidth
              disabled={!selectedProspect}
              color="grape"
              leftIcon={<IconSparkles size={"0.9rem"} />}
              onClick={() =>
                openContextModal({
                  modal: "simulatepersonalizerModal",
                  title: (
                    <Title order={3}>
                      <span className=" text-gray-500"></span> Personalizers
                    </Title>
                  ),
                  innerProps: {
                    prospectId: selectedProspect,
                    sequences: sequences,
                  },
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "700px",
                    },
                  },
                })
              }
              style={{ margin: "0 8px 8px 8px" }} // Added margins to make the button smaller
            >
              Personalize
            </Button>
          </Flex>
        </Paper>
      </Flex>
      <Flex align={"center"} gap={"md"} mt={"lg"}>
        <Button
          variant="outline"
          color="gray"
          fullWidth
          onClick={() => modals.closeAll()}
        >
          Go Back
        </Button>
        <Button onClick={() => modals.closeAll()} fullWidth>
          Save
        </Button>
      </Flex>
    </>
  );
}
