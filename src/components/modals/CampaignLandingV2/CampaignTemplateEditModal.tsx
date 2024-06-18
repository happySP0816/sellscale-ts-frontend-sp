import { userDataState, userTokenState } from "@atoms/userAtoms";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ContextModalProps,
  openContextModal,
  closeAllModals,
} from "@mantine/modals";
import { MantineStyleSystemProps } from "@mantine/styles";
import { showNotification } from "@mantine/notifications";

import {
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconMessages,
  IconPlus,
  IconPoint,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { addSequence, getTemplateSuggestion } from "@utils/requests/generateSequence";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useEffect, useState, useRef } from "react";
import { useRecoilValue } from "recoil";
import { getEmailSubjectLineTemplates } from "@utils/requests/emailSubjectLines";
import { SubjectLineTemplate } from "src";
import { SubjectLineItem } from "@pages/EmailSequencing/DetailEmailSequencing";
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";
import { set } from "lodash";
import InlineAdder from "@pages/Sequence/InlineTemplateAdder";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import SequenceVariant from "./SequenceVariant";

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
  emailSequenceData: any;
  linkedinSequenceData: any;
  emailSubjectLines: any;
  addedTemplate: any;
  currentStepNum: any;
  createTemplateBuilder: boolean;
  setCreateTemplateBuilder: (createTemplateBuilder: boolean) => void;
  // setSequences: Function;
  campaignId: number;
  cType?: string;
}>) {
  const [templateType, setTemplateType] = useState("template" || "generate");
  const [sequenceType, setSequenceType]: any = useState<string>(innerProps.sequenceType || "email");
  const [steps, setSteps] = useState(
    sequenceType === "email"
      ? innerProps.emailSequenceData.length || 3
      : innerProps.linkedinSequenceData.length || 3
  );
  const [currentStepNum, setCurrentStepNum] = useState(
    innerProps.currentStepNum || 1 || null
  );
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
  const [addedTemplate, setAddedTemplate] = useState<AssetType | null>(
    innerProps.addedTemplate || null
  );
  
  const addToStagingData = (
    asset: AssetType,
    step_num: number,
    stagingData: any,
    setStagingData: any
  ) => {
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

    const newStagingDataArray = Array.isArray(stagingData[type])
      ? [...stagingData[type]]
      : [];
    newStagingDataArray.push(newStagingData);

    setStagingData({
      ...stagingData,
      [type]: newStagingDataArray,
    });

    console.log(stagingData);
  };

  const removeFromStagingData = (
    randomId: number,
    stagingData: any,
    setStagingData: any
  ) => {
    console.log("Removing from " + sequenceType + " staging data");
    const type = sequenceType;

    // Filter out the asset from the staging data based on randomId
    const filteredStagingData = stagingData[type].filter(
      (item: any) => item.id !== randomId
    );

    // Update the staging data state
    setStagingData({
      ...stagingData,
      [type]: filteredStagingData,
    });

    console.log(stagingData);
  };

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);
  const campaignId = innerProps.campaignId;
  const [stagingData, setStagingData] = useState(
    innerProps.stagingData || { email: [] }
  );
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
          (asset: AssetType) =>
            asset.asset_tags.includes("email template") ||
            asset.asset_tags.includes("linkedin template")
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
    sequenceType === "linkedin"
      ? asset.asset_tags.includes("linkedin template")
      : asset.asset_tags.includes("email template")
  );

  return (
    <div key={innerProps.createTemplateBuilder ? "builder" : "template"}>
      {isBuilder ? (
        <>
          <Paper withBorder>
            <Flex direction={"column"}>
              <Flex p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
                <Text fw={600}>Mass Import Research</Text>
              </Flex>
              <Flex
                direction={"column"}
                p={"lg"}
                mt={"sm"}
                gap={"sm"}
                style={{ borderBottom: "1px solid #dee2e6" }}
                pb={70}
              >
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
                <Button
                  variant="outline"
                  color="gray"
                  fullWidth
                  onClick={toggleBuilder}
                >
                  Go Back
                </Button>
                <Button fullWidth>Generate Assets</Button>
              </Flex>
            </Flex>
          </Paper>
        </>
      ) : (
        <Flex gap={"md"} mt={"lg"}>
          <Paper
            withBorder
            p={"lg"}
            w={"35%"}
            display={"flex"}
            style={{ gap: "16px", flexDirection: "column" }}
          >
            <Flex align={"center"} justify={"space-between"}>
              <Text size={"xs"} fw={600}>
                {userData.client_name}'s Templates
              </Text>
              <SegmentedControl
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
                    disabled: true,
                    label: (
                      <Center style={{ gap: 10 }}>
                        <Text fw={500}>Generator</Text>
                      </Center>
                    ),
                  },
                ]}
              />
            </Flex>
            <TextInput
              variant="filled"
              placeholder="Search"
              icon={<IconSearch size={"0.9rem"} color="gray" />}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
            {templateType === "template" ? (
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
                        emailSubjectLines: innerProps.emailSubjectLines,
                        linkedinTemplates: innerProps.linkedinSequenceData,
                        emailSequenceData: innerProps.emailSequenceData,
                        refetchSequenceData: innerProps.refetchSequenceData,
                        currentStepNum,
                        createTemplateBuilder: innerProps.createTemplateBuilder,
                        setCreateTemplateBuilder:
                          innerProps.setCreateTemplateBuilder,
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
                        console.log("previous assets are", assets);
                        console.log("added template is", addedTemplate);
                        openContextModal({
                          modal: "campaignTemplateEditModal",
                          title: <Title order={3}>Sequence Builder</Title>,
                          innerProps: {
                            sequenceType,
                            stagingData,
                            emailSubjectLines: innerProps.emailSubjectLines,
                            linkedinSequenceData:
                              innerProps.linkedinSequenceData,
                            emailSequenceData: innerProps.emailSequenceData,
                            refetchSequenceData: innerProps.refetchSequenceData,
                            currentStepNum,
                            createTemplateBuilder:
                              innerProps.createTemplateBuilder,
                            setCreateTemplateBuilder:
                              innerProps.setCreateTemplateBuilder,
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
            )}
          </Paper>
          <Paper
            withBorder
            w={"66%"}
            display={"flex"}
            style={{ flexDirection: "column" }}
          >
            <Flex
              p={"lg"}
              align={"end"}
              gap={"sm"}
              style={{ borderBottom: "1px solid #DEE2E6" }}
            >
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
              <NumberInput
                w={120}
                label="No. of Steps"
                onChange={(val: any) => setSteps(val)}
                value={steps || undefined}
                max={5}
              />
              {templateType === "generate" && (
                <Button
                  rightIcon={<IconArrowRight size={"0.9rem"} />}
                  onClick={() => setGenerateSequence(true)}
                >
                  Generate Sequence
                </Button>
              )}
            </Flex>
            {readyToGenerate && (
              <Alert
                color="yellow"
                title="Please select a sequence type and steps"
                p={"xs"}
                m="md"
              >
                <Text size="sm" color="gray" mt="0">
                  Please select a sequence type and steps to proceed
                </Text>
              </Alert>
            )}
            <Tabs
              defaultValue={currentStepNum.toString() || 1}
              onTabChange={(value) => setCurrentStepNum(Number(value))}
              styles={{
                tabsList: {
                  background: "#ECEEF1",
                  padding: "8px",
                },
              }}
            >
              <Tabs.List>
                {sequenceType === "linkedin" && (
                  <Tabs.Tab value={'0'}>Initial Messages</Tabs.Tab>
                )}
                {steps &&
                  Array.from({ length: Number(steps) }, (_, index) => {
                    const tabValue = (index + 1).toString();
                    return (
                      <Tabs.Tab value={tabValue}>
                        Step {index + 1} (
                        {(stagingData[sequenceType]?.filter(
                          (asset: any) => asset.step_num === index + 1
                        ).length || 0) +
                          (sequenceType === "email"
                            ? innerProps.emailSequenceData[index]?.length || 0
                            : innerProps.linkedinSequenceData[index]?.length ||
                              0) ===
                        0
                          ? "🔴 "
                          : "🟢 "}
                        {(stagingData[sequenceType]?.filter(
                          (asset: any) => asset.step_num === index + 1
                        ).length || 0) +
                          (sequenceType === "email"
                            ? innerProps.emailSequenceData[index]?.length || 0
                            : innerProps.linkedinSequenceData[index]?.length ||
                              0)}
                        )
                      </Tabs.Tab>
                    );
                  })}
                {sequenceType === "email" && (
                  <Tabs.Tab value={"subjectLines"}>Subject Lines</Tabs.Tab>
                )}
              </Tabs.List>
              {currentStepNum === 0 && sequenceType === "linkedin" && (
                <ScrollArea viewportRef={viewport} h={350}>
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    {innerProps.linkedinInitialMessages?.map((template: any, index4: number) => (
                      <SequenceVariant
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
                    {innerProps.emailSubjectLines.map(
                      (subjectLine: any, index: number) => {
                        return (
                          <Box
                            mb={"sm"}
                            style={{
                              border:
                                selectStep2 === index
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
                                <Tooltip
                                  label="Editing coming soon"
                                  position="top"
                                >
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
                      }
                    )}
                  </Flex>
                </ScrollArea>
              )}
              {steps &&
                Array.from({ length: Number(steps) }, (_, index) => {
                  return (
                    <Tabs.Panel value={(index + 1).toString()}>
                      {" "}
                      <ScrollArea viewportRef={viewport} h={"100%"}>
                        <Flex p={"lg"} h={"100%"} direction={"column"}>
                          {/* existing assets */}
                          {(sequenceType === "email"
                            ? innerProps.emailSequenceData[index]
                            : innerProps.linkedinSequenceData[index]
                          )?.map((existingAsset: any, index2: number) => {
                            return (
                              <SequenceVariant
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
                          })}
                        </Flex>
                        {/* STAGING DATA DIVIDER */}
                        {stagingData[sequenceType]?.filter(
                          (asset: any) => asset.step_num === currentStepNum
                        ).length > 0 && (
                          <Flex justify="center" align="center">
                            <Divider
                              orientation="horizontal"
                              color="salmon"
                              size={"2px"}
                              style={{ margin: "0 25px", flex: 1 }}
                            />
                            <Text color="salmon" size="xs" fw={500}>
                              New
                            </Text>
                            <Divider
                              orientation="horizontal"
                              color="salmon"
                              size={"2px"}
                              style={{ margin: "0 25px", flex: 1 }}
                            />
                          </Flex>
                        )}
                        {/* STAGING DATA */}
                        <Flex p={"lg"} h={"100%"} direction={"column"}>
                          <>
                            {stagingData[sequenceType]
                              ?.filter(
                                (asset: any) => asset.step_num === index + 1
                              )
                              .map((asset: any, index: number) => {
                                return (
                                  <SequenceVariant
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
                            <Divider
                              orientation="horizontal"
                              color="grape"
                              size={"2px"}
                              style={{ margin: "0 25px", flex: 1 }}
                            />
                            <Text color="grape" size="xs" fw={500}>
                              Suggestions
                            </Text>
                            <Divider
                              orientation="horizontal"
                              color="grape"
                              size={"2px"}
                              style={{ margin: "0 25px", flex: 1 }}
                            />
                          </Flex>
                        
                        )}
                        <Paper style={{ backgroundColor: '#f8f8ff', padding: '8px', borderRadius: '8px' }}>
                          {suggestionData?.map((suggestion: any, index6: number) => {
                            return (
                              <SequenceVariant
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
                          
                          }
                          )}

                        </Paper>
                        </Flex>
                      </ScrollArea>
                    </Tabs.Panel>
                  );
                })}
              {sequenceType === "email" && (
                <Tabs.Panel value={"subjectLines"}>
                  <ScrollArea viewportRef={viewport} h={350} px="sm" style={{ position: 'relative' }}>
                    {innerProps.emailSubjectLines.map(
                      (subjectLine: SubjectLineTemplate) => {
                        return (
                          <SubjectLineItem
                            subjectLine={subjectLine}
                            refetch={async () =>
                              await innerProps.refetchSequenceData(
                                innerProps.campaignId
                              )
                            }
                          />
                        );
                      }
                    )}
                    <CreateEmailSubjectLineModal
                      modalOpened={emailSubjectLineModalOpened}
                      openModal={() => console.log("Open Modal")}
                      closeModal={() => {setEmailSubjectLineModalOpened(false); innerProps.refetchSequenceData(Number(currentProject?.id || -1))}}
                      backFunction={() => {setEmailSubjectLineModalOpened(false); innerProps.refetchSequenceData(Number(currentProject?.id || -1))} }
                      archetypeID={currentProject?.id || -1}
                    />
                    <div style={{ position: 'sticky', bottom: 0, background: 'white', padding: '8px 0' }}>
                      <Button color='grape' leftIcon={<IconPlus size={"0.9rem"} />} onClick={() => setEmailSubjectLineModalOpened(true)} fullWidth>
                        Add Subject line
                      </Button>
                    </div>
                  </ScrollArea>
                </Tabs.Panel>
              )}
            </Tabs>

            <Flex
              gap={"md"}
              p={"lg"}
              style={{ borderTop: "1px solid #dee2e6" }}
            >
              <Button
                fullWidth
                variant="outline"
                onClick={() => setStagingData({ email: [] })}
              >
                Reset
              </Button>
              <Button
                fullWidth
                loading={loading}
                onClick={() => {
                  // innerProps.setSequences(data);
                  console.log(stagingData[sequenceType]);
                  // context.closeModal(id);
                  setLoading(true);
                  console.log("Adding to sequence");

                  let addType = "";
                  if (sequenceType === "linkedin") {
                    addType = "LINKEDIN-TEMPLATE";
                  } else {
                    addType = "EMAIL";
                  }
                  console.log(stagingData[sequenceType]);
                  console.log(addType);
                  addSequence(
                    userToken,
                    userData?.client?.id,
                    campaignId,
                    addType,
                    [],
                    //since we have initial messages, we need to increment step num by 1 here. todo: inline adding messages for initial messages.
                    sequenceType === "linkedin" ? stagingData[sequenceType].map((item: any) => ({ ...item, step_num: item.step_num + 1 })) : stagingData[sequenceType]
                  ).finally(() => {
                    if (currentProject && currentProject.id !== null) {
                      innerProps.refetchSequenceData(Number(currentProject.id));
                    }
                    setLoading(false);
                    context.closeModal(id);
                  });
                }}
              >
                Save to Sequence
              </Button>
            </Flex>
          </Paper>
        </Flex>
      )}
    </div>
  );
}

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
      <Flex
        direction={"column"}
        gap={"xs"}
        sx={{ maxHeight: 500, overflowY: "scroll" }}
      >
        {assets
          .filter(
            (asset) =>
              asset.asset_key.includes(searchQuery) ||
              asset.asset_tags.join(" ").includes(searchQuery) ||
              !searchQuery
          )
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
                                <Badge
                                  size="sm"
                                  radius={"sm"}
                                  color={deterministicMantineColor(tag)}
                                >
                                  {tag}
                                </Badge>
                              );
                            })}
                        </Flex>
                        <Text mt={3} size={"sm"} fw={500} className="truncate">
                          {asset.asset_key.substring(0, 30)}
                          {asset.asset_key.length > 30 ? "..." : ""}
                        </Text>
                        <Text
                          color="gray"
                          mt={3}
                          size={"xs"}
                          fw={400}
                          className="truncate"
                          sx={{ cursor: "pointer" }}
                        >
                          {asset.asset_value
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 40)}
                          {asset.asset_value.replace(/<[^>]*>/g, "").length > 40
                            ? "..."
                            : ""}
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
                        addToStagingData(
                          asset,
                          currentStepNum,
                          stagingData,
                          setStagingData
                        );
                      } else {
                        showNotification({
                          title: "Error",
                          message:
                            "Cannot add a template variant to a subject step",
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
              <IconPoint
                fill="#EB8231"
                color="white"
                size={"2rem"}
                className="mb-[2px]"
              />
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
              <IconPoint
                fill="#3B85EF"
                color="white"
                size={"2rem"}
                className="mb-[2px]"
              />
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
              <IconPoint
                fill="#E74B41"
                color="white"
                size={"2rem"}
                className="mb-[2px]"
              />
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
