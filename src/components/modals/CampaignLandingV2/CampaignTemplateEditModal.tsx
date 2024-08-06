import { emailSequenceState, emailSubjectLinesState, linkedinSequenceState, userDataState, userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Modal,
  Tooltip,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Switch,
  Text,
  Title,
  TextInput,
  Badge,
  Tabs,
  Card,
  Alert,
  Popover,
  Textarea,
  Checkbox,
  SimpleGrid,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ContextModalProps, openContextModal, closeAllModals } from "@mantine/modals";
import { MantineStyleSystemProps } from "@mantine/styles";
import { showNotification } from "@mantine/notifications";

import {
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconEdit,
  IconMail,
  IconMessages,
  IconPlus,
  IconPoint,
  IconQuestionMark,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { addSequence, getTemplateSuggestion } from "@utils/requests/generateSequence";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useEffect, useState, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { getEmailSubjectLineTemplates } from "@utils/requests/emailSubjectLines";
import { SubjectLineTemplate } from "src";
import { SubjectLineItem } from "@pages/EmailSequencing/DetailEmailSequencing";
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";
import { set } from "lodash";
import InlineAdder from "@pages/Sequence/InlineTemplateAdder";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import SequenceVariant from "./SequenceVariant";
import { IconSparkles } from "@tabler/icons-react";
import { createEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";

interface SwitchStyle extends Partial<MantineStyleSystemProps> {
  label?: React.CSSProperties;
  root?: React.CSSProperties;
}

type AssetType = {
  asset_key: string;
  asset_raw_value: string;
  asset_tags: string[];
  asset_type: string;
  asset_value: string;
  client_archetype_ids: number[];
  client_id: number;
  id: number;
  num_opens: number | null;
  num_replies: number | null;
  num_sends: number | null;
};

export default function CampaignTemplateEditModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  sequenceType?: string;
  linkedinInitialMessages?: any;
  stagingData: any;
  refetchSequenceData: (clientArchetypeId: number) => void;
  // emailSequenceData: any;
  // linkedinSequenceData: any;
  addedTemplate: any;
  currentStepNum: any;
  createTemplateBuilder: boolean;
  setCreateTemplateBuilder: (createTemplateBuilder: boolean) => void;
  // setSequences: Function;
  campaignId: number;
  cType?: string;
}>) {
  const linkedinSequenceData = useRecoilValue(linkedinSequenceState);
  const emailSequenceData = useRecoilValue(emailSequenceState);
  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState(emailSubjectLinesState);
  const [templateType, setTemplateType] = useState("template" || "generate");
  const [sequenceType, setSequenceType]: any = useState<string>(innerProps.sequenceType || "email");
  const [steps, setSteps] = useState(sequenceType === "email" ? emailSequenceData.length || 3 : linkedinSequenceData.length || 3);
  const [generatingSubjectLines, setGeneratingSubjectLines] = useState(false);
  const [currentStepNum, setCurrentStepNum] = useState(innerProps.currentStepNum || 1 || null);
  const [generateSequence, setGenerateSequence] = useState(false);
  const [openid, setOpenId] = useState<number>(0);
  const [opened, setOpened] = useState(false);
  const [selectStep, setSelectStep] = useState<number | null>(null);
  //////handlers for the saved variants
  const [opened2, setOpened2] = useState(false);
  //handler for the suggestions
  const [selectStep3, setSelectStep3] = useState<number | null>(null);
  const [selectStep2, setSelectStep2] = useState<number | null>(null);
  ////////////////////////////////
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [manuallyAddedTemplate, setManuallyAddedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSubjectLineModalOpened, setEmailSubjectLineModalOpened] = useState(false);
  const [addingLinkedinAsset, setAddingLinkedinAsset] = useState(false);
  const [loadingMagicSubjectLine, setLoadingMagicSubjectLine] = useState(false);
  const [addedTemplate, setAddedTemplate] = useState<AssetType | null>(innerProps.addedTemplate || null);

  const addToStagingData = (asset: AssetType, step_num: number, stagingData: any, setStagingData: any) => {
    const type = sequenceType;
    const angle = asset.asset_key;
    const text = asset.asset_raw_value;
    const assets = [asset.id];
    const randomId = Math.floor(Math.random() * 1000000);

    const newStagingData = {
      angle,
      text,
      step_num,
      assets,
      id: randomId,
    };

    const newStagingDataArray = Array.isArray(stagingData[type]) ? [...stagingData[type]] : [];
    newStagingDataArray.push(newStagingData);

    setStagingData({
      ...stagingData,
      [type]: newStagingDataArray,
    });
  };

  const removeFromStagingData = (randomId: number, stagingData: any, setStagingData: any) => {
    const type = sequenceType;

    // Filter out the asset from the staging data based on randomId
    const filteredStagingData = stagingData[type].filter((item: any) => item.id !== randomId);

    // Update the staging data state
    setStagingData({
      ...stagingData,
      [type]: filteredStagingData,
    });
  };

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);
  const campaignId = innerProps.campaignId;
  const addedTheMagic = emailSubjectLines.some((subjectLine: SubjectLineTemplate) => subjectLine.is_magic_subject_line === true);
  const [stagingData, setStagingData] = useState(() => {
    const savedStagingData = sessionStorage.getItem("stagingData");
    const parsedStagingData = savedStagingData ? JSON.parse(savedStagingData) : innerProps.stagingData || { email: [], projectId: currentProject?.id };

    // Check if the current project ID is different from the saved one
    if (currentProject && parsedStagingData.projectId !== currentProject.id) {
      return { email: [], projectId: currentProject.id };
    }
    return parsedStagingData;
  });

  useEffect(() => {
    sessionStorage.setItem("stagingData", JSON.stringify(stagingData));
  }, [stagingData]);
  const [suggestionData, setSuggestionData] = useState<any>([]);

  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

  //handler for the saved variants
  const handleToggle2 = (key: number) => {
    if (selectStep2 === key) {
      setOpened2(!opened2);
    } else {
      setOpened2(true);
      setSelectStep2(key);
    }
    setSelectStep2(key);
  };

  const generateEmailSubjectLines = async () => {
    setGeneratingSubjectLines(true);
    const response = await fetch(`${API_URL}/email_sequence/subject_line/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: currentProject?.id,
      }),
    });
    const result = await response.json();
    if (result.status === "success") {
      setEmailSubjectLines((prev) => [...prev, ...result.data]);
    }
    setGeneratingSubjectLines(false);
  };

  const getAllAssets = async () => {
    fetch(`${API_URL}/client/get_assets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredAssets = data.data.filter(
          (asset: AssetType) => asset.asset_tags.includes("email template") || asset.asset_tags.includes("linkedin template")
        );

        setAssets(filteredAssets);
      });
  };

  useEffect(() => {
    getAllAssets();
  }, []);

  const viewport = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewport.current !== null) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 50);
  }, [stagingData]);

  const [isBuilder, setIsBuilder] = useState(innerProps.createTemplateBuilder);
  useEffect(() => {
    setIsBuilder(innerProps.createTemplateBuilder);
  }, [innerProps.createTemplateBuilder]);

  // Function to toggle the builder view
  const toggleBuilder = () => {
    const newBuilderState = !isBuilder;
    setIsBuilder(newBuilderState); // Update local state to force re-render
    innerProps.setCreateTemplateBuilder(newBuilderState); // Update parent state
  };

  const readyToGenerate = !sequenceType || !steps;
  const filteredAssets = assets.filter((asset) =>
    sequenceType === "linkedin" ? asset.asset_tags.includes("linkedin template") : asset.asset_tags.includes("email template")
  );

  const [oneshotOpened, { open, close }] = useDisclosure(false);

  return (
    <div key={innerProps.createTemplateBuilder ? "builder" : "template"}>
      {isBuilder ? (
        <>
          <Paper withBorder>
            <Flex direction={"column"}>
              <Flex p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
                <Text fw={600}>Mass Import Research</Text>
              </Flex>
              <Flex direction={"column"} p={"lg"} mt={"sm"} gap={"sm"} style={{ borderBottom: "1px solid #dee2e6" }} pb={70}>
                <Box>
                  <Text size={"xs"} fw={500}>
                    Raw Data
                  </Text>
                  <Text size={"xs"} fw={500} color="gray">
                    Past in case studies, phrases, email templates, or others.
                  </Text>
                  <Box mt={4}>
                    <RichTextArea height={200} />
                  </Box>
                </Box>
                <Flex direction={"column"} gap={"sm"}>
                  <Text size={"xs"} fw={500}>
                    Asset Extraction (Optional)
                  </Text>
                  <Flex gap={"xl"} justify={"space-between"}>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Value Props"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Offers"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                  </Flex>
                  <Flex gap={"xl"} justify={"space-between"}>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Pain Points"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Social Proof"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justify={"end"} p={"lg"} gap={"lg"}>
                <Button variant="outline" color="gray" fullWidth onClick={toggleBuilder}>
                  Go Back
                </Button>
                <Button fullWidth>Generate Assets</Button>
              </Flex>
            </Flex>
          </Paper>
        </>
      ) : (
        <Flex gap={"md"} mt={"lg"}>
          <Paper withBorder p={"lg"} w={"35%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
            <Flex align={"center"} justify={"space-between"}>
              <Text size={"xs"} fw={600}>
                {userData.client_name}'s Templates
              </Text>
              {/* <SegmentedControl
                value={templateType}
                onChange={(value: any) => {
                  setTemplateType(value);
                }}
                data={[
                  {
                    value: "template",
                    label: (
                      <Center style={{ gap: 10 }}>
                        <Text fw={500}>Templates</Text>
                      </Center>
                    ),
                  },
                  {
                    value: "generate",
                    // disabled: true,
                    label: (
                      <Center style={{ gap: 10 }} onClick={open}>
                        <Text fw={500}>One Shot Generator</Text>
                      </Center>
                    ),
                  },
                ]}
              /> */}
              <Button color="grape" leftIcon={<IconSparkles size={"1rem"} />} size="xs" onClick={open}>
                AI Generate Sequence
              </Button>
            </Flex>
            <Select
              label="Sequence Type"
              placeholder="Select Sequence type"
              value={sequenceType || ""}
              onChange={(value) => setSequenceType(value)}
              data={[
                { label: "Linkedin", value: "linkedin" },
                { label: "Email", value: "email" },
              ]}
            />
            <Box>
              <Text size={"xs"} fw={500}>
                Steps
              </Text>
              {sequenceType === "linkedin" && (
                <>
                  <Paper
                    withBorder
                    radius={"sm"}
                    p={6}
                    px={10}
                    onClick={() => {
                      setCurrentStepNum(0);
                    }}
                    bg={currentStepNum === 0 ? "#f9fbfe" : ""}
                    style={{
                      border: currentStepNum === 0 ? "1px solid #228be6 " : "",
                    }}
                  >
                    <Flex align={"center"} justify={"space-between"}>
                      <Text color="gray" size={"sm"} className="flex items-center gap-2">
                        {" "}
                        <ThemeIcon size={"sm"}>
                          <IconMail fill="white" color="#228be6" style={{ width: "90%", height: "90%" }} />
                        </ThemeIcon>
                        Initial Messages
                      </Text>
                    </Flex>
                  </Paper>
                  <Divider orientation="vertical" h={30} variant="dashed" ml={20} />
                </>
              )}
              {sequenceType === "email" && (
                <>
                  <Paper
                    withBorder
                    radius={"sm"}
                    p={6}
                    px={10}
                    onClick={() => {
                      setCurrentStepNum("subjectLines");
                    }}
                    bg={currentStepNum === "subjectLines" ? "#f9fbfe" : ""}
                    style={{
                      border: currentStepNum === "subjectLines" ? "1px solid #228be6 " : "",
                      boxShadow: emailSubjectLines.length === 1 ? "0 0 0 2px rgba(255, 0, 0, 0.5)" : "",
                    }}
                  >
                    <Flex align={"center"} justify={"space-between"}>
                      <Text color="gray" size={"sm"} className="flex items-center gap-2">
                        {" "}
                        <ThemeIcon size={"sm"}>
                          <IconMail fill="white" color="#228be6" style={{ width: "90%", height: "90%" }} />
                        </ThemeIcon>
                        Subject Lines
                      </Text>
                    </Flex>
                  </Paper>
                  <Divider orientation="vertical" h={30} variant="dashed" ml={20} />
                </>
              )}
              {steps &&
                Array.from({ length: Number(steps) }, (_, index) => {
                  const tabValue = (index + 1).toString();
                  return (
                    <>
                      <Paper
                        withBorder
                        radius={"sm"}
                        p={6}
                        px={10}
                        onClick={() => {
                          setCurrentStepNum(index + 1);
                        }}
                        bg={currentStepNum === index + 1 ? "#f9fbfe" : ""}
                        style={{
                          border: currentStepNum === index + 1 ? "1px solid #228be6 " : "",
                        }}
                      >
                        <Flex align={"center"} justify={"space-between"}>
                          <Text color="gray" size={"sm"} className="flex items-center gap-2">
                            {" "}
                            <ThemeIcon size={"sm"}>
                              <IconMail fill="white" color="#228be6" style={{ width: "90%", height: "90%" }} />
                            </ThemeIcon>
                            Step {index + 1}
                          </Text>
                          {index === Number(steps) - 1 && (
                            <ActionIcon color="red" onClick={() => setSteps((item) => (item = item - 1))}>
                              <IconTrash size={"1rem"} />
                            </ActionIcon>
                          )}
                        </Flex>
                        <Flex gap={5} ml={30} mt={6} align={"center"}>
                          <ThemeIcon size={14} variant="outline" color="green" radius={"xl"} mb={2}>
                            <IconPoint fill="#40C057" color="#40C057" size={"3rem"} />
                          </ThemeIcon>
                          <Text size={"xs"} fw={600}>
                            {(stagingData[sequenceType]?.filter((asset: any) => asset.step_num === index + 1).length || 0) +
                              (sequenceType === "email" ? emailSequenceData[index]?.length || 0 : linkedinSequenceData[index]?.length || 0)}{" "}
                            Templates Active
                          </Text>
                        </Flex>
                        <Flex gap={5} ml={30} mt={6} align={"center"}>
                          <IconClock color="orange" size={"1rem"} />
                          <Text size={"xs"} fw={600} color="gray">
                            {stagingData[sequenceType]?.filter((asset: any) => asset.step_num === index + 1).length + " "} template pending save
                          </Text>
                        </Flex>
                      </Paper>
                      <Divider orientation="vertical" h={30} variant="dashed" ml={20} />
                    </>
                  );
                })}
                
              <Paper withBorder radius={"sm"} p={6} px={10}>
                <Flex
                  align={"center"}
                  justify={"space-between"}
                  onClick={() => {
                    if (steps < 5) setSteps((item) => (item = item + 1));
                  }}
                >
                  <Text color="blue" fw={500} size={"sm"} className="flex items-center gap-2">
                    {" "}
                    <ThemeIcon variant="light" size={"sm"}>
                      <IconPlus style={{ width: "70%", height: "70%" }} />
                    </ThemeIcon>
                    Add Step
                  </Text>
                </Flex>
              </Paper>
            </Box>
            {/* <TextInput
              variant="filled"
              placeholder="Search"
              icon={<IconSearch size={"0.9rem"} color="gray" />}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            /> */}

            {/* {templateType === "template" ? (
              <>
                <Button
                  variant="light"
                  leftIcon={<IconPlus size={"0.9rem"} />}
                  onClick={() =>
                    openContextModal({
                      modal: "campaignTemplates",
                      title: <Title order={3}>Add Template</Title>,
                      innerProps: {
                        sequenceType,
                        stagingData,
                        emailSubjectLines: emailSubjectLines,
                        linkedinTemplates: linkedinSequenceData,
                        emailSequenceData: emailSequenceData,
                        refetchSequenceData: innerProps.refetchSequenceData,
                        currentStepNum,
                        createTemplateBuilder: innerProps.createTemplateBuilder,
                        setCreateTemplateBuilder: innerProps.setCreateTemplateBuilder,
                        // setSequences: innerProps.setSequences,
                        campaignId: innerProps.campaignId,
                        cType: innerProps.cType,
                        setStagingData: setStagingData,
                        addToStagingData: addToStagingData,
                        setAddedTemplate: setAddedTemplate,
                      },
                      centered: true,
                      styles: {
                        content: {
                          minWidth: "800px",
                        },
                      },
                      onClose: () => {
                        closeAllModals();
                        //nasty hack to preserve the added templates
                        openContextModal({
                          modal: "campaignTemplateEditModal",
                          title: <Title order={3}>Sequence Builder</Title>,
                          innerProps: {
                            sequenceType,
                            stagingData,
                            emailSubjectLines: emailSubjectLines,
                            linkedinSequenceData: linkedinSequenceData,
                            emailSequenceData: emailSequenceData,
                            refetchSequenceData: innerProps.refetchSequenceData,
                            currentStepNum,
                            createTemplateBuilder: innerProps.createTemplateBuilder,
                            setCreateTemplateBuilder: innerProps.setCreateTemplateBuilder,
                            // setSequences: innerProps.setSequences,
                            campaignId: innerProps.campaignId,
                            cType: innerProps.cType,
                            setAddedTemplate: setAddedTemplate,
                          },
                          centered: true,
                          styles: {
                            content: {
                              minWidth: "1100px",
                            },
                          },
                          onClose: () => {
                            if (currentProject && currentProject.id !== null) {
                              innerProps.refetchSequenceData(Number(currentProject.id));
                            }
                          },
                        });
                      },
                    })
                  }
                >
                  Create New
                </Button>
                <Templates
                  steps={steps}
                  readyToGenerate={readyToGenerate}
                  assets={filteredAssets}
                  searchQuery={searchQuery}
                  addToStagingData={addToStagingData}
                  removeFromStagingData={removeFromStagingData}
                  stagingData={stagingData}
                  setStagingData={setStagingData}
                  currentStepNum={currentStepNum}
                  setCurrentStepNum={setCurrentStepNum}
                />
              </>
            ) : (
              <Generates />
            )} */}
          </Paper>
          <Paper withBorder w={"66%"} display={"flex"} style={{ flexDirection: "column" }}>
            {/* <Flex p={"lg"} align={"end"} gap={"sm"} style={{ borderBottom: "1px solid #DEE2E6" }}>
              <NumberInput w={120} label="No. of Steps" onChange={(val: any) => setSteps(val)} value={steps || undefined} max={5} />
              {templateType === "generate" && (
                <Button rightIcon={<IconArrowRight size={"0.9rem"} />} onClick={() => setGenerateSequence(true)}>
                  Generate Sequence
                </Button>
              )}
            </Flex>
            {readyToGenerate && (
              <Alert color="yellow" title="Please select a sequence type and steps" p={"xs"} m="md">
                <Text size="sm" color="gray" mt="0">
                  Please select a sequence type and steps to proceed
                </Text>
              </Alert>
            )} */}
            <Box>
              {currentStepNum === 0 && sequenceType === "linkedin" && (
                <ScrollArea viewportRef={viewport} h={350}>
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    {innerProps.linkedinInitialMessages.map((template: any, index4: number) => (
                      <SequenceVariant
                        asset={template}
                        assetType={"linkedin"}
                        refetch={() => innerProps.refetchSequenceData(innerProps.campaignId)}
                        sequenceType={sequenceType}
                        angle={template.message}
                        text={template.message}
                        assetId={template.id}
                        index={index4}
                        isSaved={true}
                        selectStep={selectStep ?? 0}
                        opened={opened}
                        userImgUrl={userData.img_url}
                        removeFromStagingData={removeFromStagingData}
                        handleToggle={handleToggle}
                        stagingData={stagingData}
                        setStagingData={setStagingData}
                      />
                    ))}
                  </Flex>
                </ScrollArea>
              )}
              {currentStepNum === steps + 1 && sequenceType === "email" && (
                <ScrollArea viewportRef={viewport} h={350}>
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    {emailSubjectLines.map((subjectLine: any, index: number) => {
                      return (
                        <Box
                          mb={"sm"}
                          style={{
                            border: selectStep2 === index ? "1px solid #228be6" : "1px solid #ced4da",
                            borderRadius: "8px",
                          }}
                        >
                          <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                            <Flex align={"center"} gap={"xs"}>
                              <IconMessages color="#228be6" size={"0.9rem"} />
                              <Text color="gray" fw={500} size={"xs"}>
                                Variant #{index + 1}:
                              </Text>
                              <Text fw={600} size={"xs"} ml={"-5px"}>
                                {subjectLine.subject_line}
                              </Text>
                            </Flex>
                            <Flex gap={1} align={"center"}>
                              <Badge color="teal" size="xs" mr="6px">
                                Saved
                              </Badge>
                              <Tooltip label="Editing coming soon" position="top">
                                <ActionIcon disabled>
                                  <IconEdit size={"0.9rem"} />
                                </ActionIcon>
                              </Tooltip>
                              <ActionIcon disabled>
                                <IconTrash size={"0.9rem"} />
                              </ActionIcon>
                              {/* <ActionIcon
                                  onClick={() => {
                                    handleToggle2(index);
                                  }}
                                >
                                  {selectStep2 === index && opened ? (
                                    <IconChevronUp size={"0.9rem"} />
                                  ) : (
                                    <IconChevronDown size={"0.9rem"} />
                                  )}
                                </ActionIcon> */}
                            </Flex>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Flex>
                </ScrollArea>
              )}
              {steps && currentStepNum !== "subjectLines" && currentStepNum !== 0 && (
                <ScrollArea viewportRef={viewport} h={"100%"}>
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    {/* existing assets */}
                    {(sequenceType === "email" ? emailSequenceData[currentStepNum - 1] : linkedinSequenceData[currentStepNum - 1])?.map(
                      (existingAsset: any, index2: number) => {
                        return (
                          <SequenceVariant
                            asset={existingAsset}
                            assetType={sequenceType}
                            refetch={() => innerProps.refetchSequenceData(innerProps.campaignId)}
                            sequenceType={sequenceType}
                            angle={existingAsset.title}
                            text={existingAsset.description}
                            assetId={existingAsset.id}
                            isSaved={true}
                            index={index2}
                            selectStep={selectStep2 ?? 0}
                            opened={opened2}
                            userImgUrl={userData.img_url}
                            removeFromStagingData={removeFromStagingData}
                            handleToggle={handleToggle2}
                            stagingData={stagingData}
                            setStagingData={setStagingData}
                          />
                        );
                      }
                    )}
                  </Flex>
                  {/* STAGING DATA DIVIDER */}
                  {stagingData[sequenceType]?.filter((asset: any) => asset.step_num === currentStepNum).length > 0 && (
                    <Flex justify="center" align="center">
                      <Divider orientation="horizontal" color="yellow" size={"2px"} style={{ margin: "0 25px", flex: 1 }} />
                      <Badge variant="outline" color="yellow" tt={"initial"}>
                        New
                      </Badge>
                      <Divider orientation="horizontal" color="yellow" size={"2px"} style={{ margin: "0 25px", flex: 1 }} />
                    </Flex>
                  )}
                  {/* STAGING DATA */}
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    <>
                      {stagingData[sequenceType]
                        ?.filter((asset: any) => asset.step_num === currentStepNum)
                        .map((asset: any, index: number) => {
                          return (
                            <SequenceVariant
                              asset={asset}
                              assetType="staging"
                              refetch={() => innerProps.refetchSequenceData(innerProps.campaignId)}
                              sequenceType={sequenceType}
                              angle={asset.angle}
                              text={asset.text}
                              assetId={asset.id}
                              index={index}
                              selectStep={selectStep ?? 0}
                              opened={opened}
                              userImgUrl={userData.img_url}
                              removeFromStagingData={removeFromStagingData}
                              handleToggle={handleToggle}
                              stagingData={stagingData}
                              setStagingData={setStagingData}
                            />
                          );
                        })}
                    </>
                    {/* Add new template */}
                    <InlineAdder
                      manuallyAddedTemplate={manuallyAddedTemplate}
                      setManuallyAddedTemplate={setManuallyAddedTemplate}
                      addingLinkedinAsset={addingLinkedinAsset}
                      setAddingLinkedinAsset={setAddingLinkedinAsset}
                      sequenceType={sequenceType}
                      userData={userData}
                      userToken={userToken}
                      addToStagingData={addToStagingData}
                      currentStepNum={currentStepNum}
                      stagingData={stagingData}
                      setStagingData={setStagingData}
                      setSuggestionData={setSuggestionData}
                    />
                    {suggestionData?.length > 0 && (
                      <Flex mb="md" justify="center" align="center">
                        <Divider orientation="horizontal" color="grape" size={"2px"} style={{ margin: "0 25px", flex: 1 }} />
                        <Badge variant="outline" tt={"initial"} color="grape">
                          Suggestions
                        </Badge>
                        <Divider orientation="horizontal" color="grape" size={"2px"} style={{ margin: "0 25px", flex: 1 }} />
                      </Flex>
                    )}
                    <Paper
                      style={{
                        backgroundColor: "#f8f8ff",
                        padding: "8px",
                        borderRadius: "8px",
                      }}
                    >
                      {suggestionData?.map((suggestion: any, index6: number) => {
                        return (
                          <SequenceVariant
                            asset={suggestion}
                            assetType="suggestion"
                            refetch={() => innerProps.refetchSequenceData(innerProps.campaignId)}
                            angle={suggestion.style}
                            text={suggestion.content}
                            assetId={suggestion.id}
                            index={index6}
                            addToStagingData={addToStagingData}
                            selectStep={selectStep3 ?? 0}
                            opened={true}
                            userImgUrl={userData.img_url}
                            removeFromStagingData={removeFromStagingData}
                            handleToggle={() => {}}
                            showAll={true}
                            stagingData={stagingData}
                            setStagingData={setStagingData}
                            sequenceType={sequenceType}
                            currentStepNum={currentStepNum}
                            setSuggestionData={setSuggestionData}
                            setAddingLinkedinAsset={setAddingLinkedinAsset}
                            setManuallyAddedTemplate={setManuallyAddedTemplate}
                          />
                        );
                      })}
                    </Paper>
                  </Flex>
                </ScrollArea>
              )}

              {sequenceType === "email" && currentStepNum === "subjectLines" && (
                <ScrollArea viewportRef={viewport} h={350} px="sm" style={{ position: "relative" }}>
                  {emailSubjectLines.map((subjectLine: SubjectLineTemplate) => {
                    return <SubjectLineItem subjectLine={subjectLine} refetch={async () => await innerProps.refetchSequenceData(innerProps.campaignId)} />;
                  })}
                  <CreateEmailSubjectLineModal
                    modalOpened={emailSubjectLineModalOpened}
                    openModal={() => console.log("Open Modal")}
                    closeModal={() => {
                      setEmailSubjectLineModalOpened(false);
                      innerProps.refetchSequenceData(Number(currentProject?.id || -1));
                    }}
                    backFunction={() => {
                      setEmailSubjectLineModalOpened(false);
                      innerProps.refetchSequenceData(Number(currentProject?.id || -1));
                    }}
                    archetypeID={currentProject?.id || -1}
                  />
                  <div
                    style={{
                      position: "sticky",
                      bottom: 0,
                      background: "white",
                      padding: "8px 0",
                    }}
                  >
                    <Button color="blue" leftIcon={<IconPlus size={"0.9rem"} />} onClick={() => setEmailSubjectLineModalOpened(true)} fullWidth>
                      Add Subject line
                    </Button>
                    {emailSequenceData.length > 0 && (
                      <Button
                        loading={generatingSubjectLines}
                        mt="sm"
                        color="grape"
                        leftIcon={<IconPlus size={"0.9rem"} />}
                        onClick={generateEmailSubjectLines}
                        fullWidth
                      >
                        Generate Subject Lines
                      </Button>
                    )}
                    <Flex align="center" mt="xl">
                      {!addedTheMagic && (
                        <Button
                          disabled={addedTheMagic}
                          style={{
                            background:
                              !currentProject?.ai_researcher_id || !currentProject.is_ai_research_personalization_enabled
                                ? "grey"
                                : "linear-gradient(135deg, rgba(255,255,0,0.8), rgba(0,255,0,0.8), rgba(0,0,255,0.8))",
                            color: "white",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(10px)",
                            padding: "10px 20px",
                            transition: "background 0.3s ease, box-shadow 0.3s ease",
                            border: "1px solid grey",
                          }}
                          leftIcon={<IconSparkles size={"0.9rem"} />}
                          loading={loadingMagicSubjectLine}
                          onClick={async () => {
                            if (!currentProject?.ai_researcher_id || !currentProject.is_ai_research_personalization_enabled) {
                              showNotification({
                                title: "Action Required",
                                message: "Please enable AI Personalization and attach an AI Researcher with research questions.",
                                color: "red",
                              });
                              return;
                            }
                            setLoadingMagicSubjectLine(true);
                            try {
                              await createEmailSubjectLineTemplate(userToken, currentProject?.id || -1, "", true);
                              await innerProps.refetchSequenceData(Number(currentProject?.id || -1));
                            } finally {
                              setLoadingMagicSubjectLine(false);
                              // closeAllModals();
                            }
                          }}
                          fullWidth
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(75,0,130,1), rgba(0,255,255,1))";
                            e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,0,0.8), rgba(0,255,0,0.8), rgba(0,0,255,0.8))"),
                              (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)");
                          }}
                        >
                          Add Magic Subject Line
                          <Tooltip
                            multiline
                            label={
                              <Text size="sm">
                                SellScale will generate a clever subject line <br></br>
                                using its research and contextual knowledge <br></br>
                                about the campaign, prospect, and the chosen sequence.
                              </Text>
                            }
                            withArrow
                            position="top"
                          >
                            <Text color="white" size="xl" style={{ marginLeft: "30px" }}>
                              <IconQuestionMark size={"1rem"} color="white" />
                            </Text>
                          </Tooltip>
                        </Button>
                      )}
                    </Flex>
                  </div>
                </ScrollArea>
              )}
              {/* {sequenceType === "email" && (
                <ScrollArea viewportRef={viewport} h={350} px="sm" style={{ position: "relative" }}>
                  {emailSubjectLines.map((subjectLine: SubjectLineTemplate) => {
                    return <SubjectLineItem subjectLine={subjectLine} refetch={async () => await innerProps.refetchSequenceData(innerProps.campaignId)} />;
                  })}
                  <CreateEmailSubjectLineModal
                    modalOpened={emailSubjectLineModalOpened}
                    openModal={() => console.log("Open Modal")}
                    closeModal={() => {
                      setEmailSubjectLineModalOpened(false);
                      innerProps.refetchSequenceData(Number(currentProject?.id || -1));
                    }}
                    backFunction={() => {
                      setEmailSubjectLineModalOpened(false);
                      innerProps.refetchSequenceData(Number(currentProject?.id || -1));
                    }}
                    archetypeID={currentProject?.id || -1}
                  />
                  <div
                    style={{
                      position: "sticky",
                      bottom: 0,
                      background: "white",
                      padding: "8px 0",
                    }}
                  >
                    <Button color="blue" leftIcon={<IconPlus size={"0.9rem"} />} onClick={() => setEmailSubjectLineModalOpened(true)} fullWidth>
                      Add Subject line
                    </Button>
                    {emailSequenceData.length > 0 && (
                      <Button
                        loading={generatingSubjectLines}
                        mt="sm"
                        color="grape"
                        leftIcon={<IconPlus size={"0.9rem"} />}
                        onClick={generateEmailSubjectLines}
                        fullWidth
                      >
                        Generate Subject Lines
                      </Button>
                    )}
                    <Flex align="center" mt="xl">
                      {!addedTheMagic && (
                        <Button
                          disabled={addedTheMagic}
                          style={{
                            background:
                              !currentProject?.ai_researcher_id || !currentProject.is_ai_research_personalization_enabled
                                ? "grey"
                                : "linear-gradient(135deg, rgba(255,255,0,0.8), rgba(0,255,0,0.8), rgba(0,0,255,0.8))",
                            color: "white",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(10px)",
                            padding: "10px 20px",
                            transition: "background 0.3s ease, box-shadow 0.3s ease",
                            border: "1px solid grey",
                          }}
                          leftIcon={<IconSparkles size={"0.9rem"} />}
                          loading={loadingMagicSubjectLine}
                          onClick={async () => {
                            if (!currentProject?.ai_researcher_id || !currentProject.is_ai_research_personalization_enabled) {
                              showNotification({
                                title: "Action Required",
                                message: "Please enable AI Personalization and attach an AI Researcher with research questions.",
                                color: "red",
                              });
                              return;
                            }
                            setLoadingMagicSubjectLine(true);
                            try {
                              await createEmailSubjectLineTemplate(userToken, currentProject?.id || -1, "", true);
                              await innerProps.refetchSequenceData(Number(currentProject?.id || -1));
                            } finally {
                              setLoadingMagicSubjectLine(false);
                              // closeAllModals();
                            }
                          }}
                          fullWidth
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, rgba(75,0,130,1), rgba(0,255,255,1))";
                            e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,0,0.8), rgba(0,255,0,0.8), rgba(0,0,255,0.8))"),
                              (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)");
                          }}
                        >
                          Add Magic Subject Line
                          <Tooltip
                            multiline
                            label={
                              <Text size="sm">
                                SellScale will generate a clever subject line <br></br>
                                using its research and contextual knowledge <br></br>
                                about the campaign, prospect, and the chosen sequence.
                              </Text>
                            }
                            withArrow
                            position="top"
                          >
                            <Text color="white" size="xl" style={{ marginLeft: "30px" }}>
                              <IconQuestionMark size={"1rem"} color="white" />
                            </Text>
                          </Tooltip>
                        </Button>
                      )}
                    </Flex>
                  </div>
                </ScrollArea>
              )} */}
            </Box>

            {/* isNaN corresponds to subject lines */}
            {!isNaN(currentStepNum) && (
              <Flex gap={"md"} p={"lg"} style={{ borderTop: "1px solid #dee2e6" }}>
                <Button fullWidth variant="outline" onClick={() => setStagingData({ email: [] })}>
                  Reset
                </Button>
                <Button
                  fullWidth
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    let addType = "";
                    if (sequenceType === "linkedin") {
                      addType = "LINKEDIN-TEMPLATE";
                    } else {
                      addType = "EMAIL";
                    }
                    addSequence(
                      userToken,
                      userData?.client?.id,
                      campaignId,
                      addType,
                      [],
                      //since we have initial messages, we need to increment step num by 1 here. todo: inline adding messages for initial messages.
                      sequenceType === "linkedin"
                        ? stagingData[sequenceType]?.map((item: any) => ({
                            ...item,
                            step_num: item.step_num + 1,
                          }))
                        : stagingData[sequenceType]
                    );

                    if (currentProject && currentProject.id !== null) {
                      innerProps.refetchSequenceData(Number(currentProject.id));
                    }
                    setLoading(false);
                    context.closeModal(id);
                  }}
                >
                  Save to Sequence
                </Button>
              </Flex>
            )}
          </Paper>
        </Flex>
      )}
      <OneshotModal oneshotOpened={oneshotOpened} close={close} />
    </div>
  );
}

export const OneshotModal = (props: any) => {
  const { oneshotOpened, close } = props;
  const [opened, { toggle }] = useDisclosure(false);
  const [keywords, setKeywords] = useState(["B2B Research", "Bi-directional ETL"]);

  return (
    <Modal
      opened={oneshotOpened}
      onClose={close}
      centered
      size={700}
      // title="Authentication"
      withCloseButton={false}
      styles={{
        inner: {
          zIndex: 9999,
        },
        overlay: {
          zIndex: 999,
        },
      }}
    >
      <Flex align={"start"} justify={"space-between"}>
        <Text size={"lg"} fw={600}>
          One Shot Generator
        </Text>
        <Flex align={"center"} gap={"sm"}>
          <Select data={["Linkedin"]} label="Sequence Type" w={200} />
          <NumberInput label="No. of Steps" w={100} />
        </Flex>
      </Flex>
      <Stack spacing={"sm"}>
        <TextInput label="General Campaign Angle" placeholder="I want to write a sequence that targets marketers and does XYZ" />
        <CustomSelect
          maxWidth="30vw"
          value={keywords}
          label="Keywords-put in keywords that should for sure be mentioned"
          placeholder="Select options"
          setValue={setKeywords}
          data={keywords}
          setData={setKeywords}
        />
        <Textarea label="Asset Investor (for reference only)" placeholder="Paste here" minRows={4} />
        <Checkbox label="CTA Generator" />
        <TextInput defaultValue={"Is this a pain?"} />
        <Divider
          label={
            <Button
              onClick={toggle}
              variant="outline"
              color="gray"
              radius={"xl"}
              rightIcon={opened ? <IconChevronUp size={"1rem"} /> : <IconChevronDown size={"1rem"} />}
            >
              Advanced
            </Button>
          }
          variant="dashed"
          labelPosition="center"
        />
        <Collapse in={opened}>
          <Box>
            <Text size={"sm"} fw={500}>
              Include Templates
            </Text>
            <SimpleGrid cols={2} mt={"xs"}>
              <Checkbox size={"xs"} label="How it works" />
              <Checkbox size={"xs"} label="Vary intro messages" />
              <Checkbox size={"xs"} label="Breakup message" />
              <Checkbox size={"xs"} label="Unique offer" />
            </SimpleGrid>
          </Box>
          <Box>
            <Text size={"sm"} fw={500}>
              Include Strategies
            </Text>
            <SimpleGrid cols={2} mt={"xs"}>
              <Checkbox size={"xs"} label="Confernece outreach" />
              <Checkbox size={"xs"} label="City chat" />
              <Checkbox size={"xs"} label="Former work alum" />
              <Checkbox size={"xs"} label="Feedback based" />
            </SimpleGrid>
          </Box>
        </Collapse>

        <Flex gap={"lg"}>
          <Button variant="outline" color="gray" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button fullWidth>Generate</Button>
        </Flex>
      </Stack>
    </Modal>
  );
};

export const Templates = ({
  readyToGenerate,
  assets,
  searchQuery,
  addToStagingData,
  stagingData,
  steps,
  setStagingData,
  removeFromStagingData,
  currentStepNum,
  setCurrentStepNum,
}: {
  readyToGenerate: boolean;
  assets: AssetType[];
  steps: number;
  searchQuery: string;
  addToStagingData: Function;
  removeFromStagingData: Function;
  stagingData: any;
  setStagingData: Function;
  currentStepNum: number;
  setCurrentStepNum: Function;
}) => {
  const switchStyle = {
    root: {
      border: "1px solid #D9DEE5",
      padding: "12px",
      borderRadius: "4px",
    },
    label: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      width: "100%",
    },
  };

  return (
    <>
      <Flex direction={"column"} gap={"xs"} sx={{ maxHeight: 500, overflowY: "scroll" }}>
        {assets
          .filter((asset) => asset.asset_key.includes(searchQuery) || asset.asset_tags.join(" ").includes(searchQuery) || !searchQuery)
          .map((asset) => {
            return (
              <Card withBorder mih={"90px"}>
                <Flex>
                  <Popover withinPortal>
                    <Popover.Dropdown>
                      <div
                        style={{
                          maxWidth: "300px",
                          fontSize: "14px", // Increased font size for bigger text
                          fontWeight: "bold", // Make the text bold
                        }}
                        dangerouslySetInnerHTML={{
                          __html: asset.asset_key, // Display the asset in bigger text
                        }}
                      />
                      <div
                        style={{
                          maxWidth: "300px",
                          fontSize: "10px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: asset.asset_raw_value,
                        }}
                      />
                    </Popover.Dropdown>
                    <Popover.Target>
                      <Box w={"90%"}>
                        <Flex gap={6}>
                          {asset.asset_tags
                            .filter((tag) => tag !== "email template")
                            .filter((tag) => tag !== "linkedin template")
                            .map((tag) => {
                              return (
                                <Badge size="sm" radius={"sm"} color={deterministicMantineColor(tag)}>
                                  {tag}
                                </Badge>
                              );
                            })}
                        </Flex>
                        <Text mt={3} size={"sm"} fw={500} className="truncate">
                          {asset.asset_key.substring(0, 30)}
                          {asset.asset_key.length > 30 ? "..." : ""}
                        </Text>
                        <Text color="gray" mt={3} size={"xs"} fw={400} className="truncate" sx={{ cursor: "pointer" }}>
                          {asset.asset_value.replace(/<[^>]*>/g, "").substring(0, 40)}
                          {asset.asset_value.replace(/<[^>]*>/g, "").length > 40 ? "..." : ""}
                        </Text>
                      </Box>
                    </Popover.Target>
                  </Popover>
                  <Button
                    size="xs"
                    compact
                    variant="outline"
                    color="blue"
                    disabled={readyToGenerate}
                    onClick={() => {
                      if (currentStepNum !== steps + 1) {
                        addToStagingData(asset, currentStepNum, stagingData, setStagingData);
                      } else {
                        showNotification({
                          title: "Error",
                          message: "Cannot add a template variant to a subject step",
                          color: "red",
                        });
                      }
                    }}
                  >
                    Add
                  </Button>
                </Flex>
              </Card>
            );
          })}
      </Flex>
    </>
  );
};

export const Generates = () => {
  return (
    <>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint fill="#EB8231" color="white" size={"2rem"} className="mb-[2px]" />
              <Text tt={"uppercase"}>case study</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint fill="#3B85EF" color="white" size={"2rem"} className="mb-[2px]" />
              <Text tt={"uppercase"}>value props</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint fill="#E74B41" color="white" size={"2rem"} className="mb-[2px]" />
              <Text tt={"uppercase"}>offers</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
    </>
  );
};
