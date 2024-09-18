import {
  emailSequenceState,
  emailSubjectLinesState,
  linkedinInitialMessageState,
  linkedinSequenceState,
  userDataState,
  userTokenState,
} from "@atoms/userAtoms";
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
  Loader,
  Group,
  Input,
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
  IconAdjustments,
  IconArrowRight,
  IconArrowsLeftRight,
  IconBrandLinkedin,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconEdit,
  IconMail,
  IconMailOpened,
  IconMenu,
  IconMessages,
  IconPlus,
  IconPoint,
  IconQuestionMark,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons";
import {
  addSequence,
  getTemplateSuggestion,
} from "@utils/requests/generateSequence";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useEffect, useState, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { getEmailSubjectLineTemplates } from "@utils/requests/emailSubjectLines";
import { DefaultVoices, PersonaOverview, SubjectLineTemplate } from "src";
import { SubjectLineItem } from "@pages/EmailSequencing/DetailEmailSequencing";
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";
import { add, set } from "lodash";
import InlineAdder from "@pages/Sequence/InlineTemplateAdder";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import SequenceVariant from "./SequenceVariant";
import { IconSparkles } from "@tabler/icons-react";
import { createEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  PersonalizationSection,
  ResearchPoint,
} from "@common/sequence/LinkedInSequenceSection";
import { getResearchPoint } from "@utils/requests/getResearchPointTypes";
import { useQuery } from "@tanstack/react-query";
import { CtaSection } from "@common/sequence/CtaSection";
import { updateInitialBlocklist } from "@utils/requests/updatePersonaBlocklist";
import Hook from "@pages/channels/components/Hook";
import { postEmailTrackingSettings } from "@utils/requests/emailTrackingSettings";
import { getFreshCurrentProject } from "@auth/core";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { patchSequenceStep } from "@utils/requests/emailSequencing";
import { LinkedinInitialMessageDataType } from "@pages/CampaignV2/Sequences";

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
  prospectId?: number;
  statsData: any;
  checkCanToggleEmail: any;
  togglePersonaChannel: any;
  updateConnectionType: any;
  checkCanToggleLinkedin: any;
}>) {
  const [linkedinSequenceData, setLinkedinSequenceData] = useRecoilState(linkedinSequenceState);
  const [emailSequenceData, setEmailSequenceData] = useRecoilState(emailSequenceState);
  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState(
    emailSubjectLinesState
  );
  const [linkedinInitialMessageData, setLinkedinInitialMessageData] = useRecoilState(linkedinInitialMessageState);
  const [linkedinInitialMessageStagingData, setLinkedinInitialMessageStagingData] = useState<string[]>([]);
  const [linkedinInitialMessageEntry, setLinkedinInitialMessageEntry] = useState<string>('');
  const [isEditingBumpDelayDays, setIsEditingBumpDelayDays] = useState<number | null>(null);
  const [newBumpDelayDays, setNewBumpDelayDays] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [templateType, setTemplateType] = useState("template" || "generate");
  const [sequenceType, setSequenceType]: any = useState<string>(
    innerProps.sequenceType || "email"
  );
  const [steps, setSteps] = useState(
    sequenceType === "email"
      ? emailSequenceData.length || 3
      : linkedinSequenceData.length || 3
  );
  const [generatingSubjectLines, setGeneratingSubjectLines] = useState(false);
  const [currentStepNum, setCurrentStepNum] = useState(
    (innerProps.currentStepNum || innerProps.currentStepNum === 0) ? innerProps.currentStepNum : 1
  );
  const [generateSequence, setGenerateSequence] = useState(false);
  const [openid, setOpenId] = useState<number>(0);
  const [opened, setOpened] = useState(false);
  const [selectStep, setSelectStep] = useState<number | null>(null);
  //////handlers for the saved variants
  const [opened2, setOpened2] = useState(true);
  //handler for the suggestions
  const [selectStep3, setSelectStep3] = useState<number | null>(null);
  const [selectStep2, setSelectStep2] = useState<number | null>(null);
  ////////////////////////////////
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [manuallyAddedTemplate, setManuallyAddedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [
    emailSubjectLineModalOpened,
    setEmailSubjectLineModalOpened,
  ] = useState(false);
  const [addingLinkedinAsset, setAddingLinkedinAsset] = useState(false);
  const [loadingMagicSubjectLine, setLoadingMagicSubjectLine] = useState(false);
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
  };

  const removeFromStagingData = (
    randomId: number,
    stagingData: any,
    setStagingData: any
  ) => {
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
  };

  const [activeTab, setActiveTab] = useState<string | null>("ctas");
  const [
    personalizationItemsCount,
    setPersonalizationItemsCount,
  ] = useState<number>();
  const [ctasItemsCount, setCtasItemsCount] = useState<number>();

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );
  const campaignId = innerProps.campaignId;
  const [openTrackingEnabled, setOpenTrackingEnabled] = useState(
    !currentProject?.email_open_tracking_enabled
  );
  const [clickTrackingEnabled, setClickTrackingEnabled] = useState(
    !currentProject?.email_link_tracking_enabled
  );
  const addedTheMagic = emailSubjectLines.some(
    (subjectLine: SubjectLineTemplate) =>
      subjectLine.is_magic_subject_line === true
  );
  const [stagingData, setStagingData] = useState(() => {
    const savedStagingData = sessionStorage.getItem("stagingData");
    const parsedStagingData = savedStagingData
      ? JSON.parse(savedStagingData)
      : innerProps.stagingData || { email: [], projectId: currentProject?.id };

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
    const response = await fetch(
      `${API_URL}/email_sequence/subject_line/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          archetype_id: currentProject?.id,
        }),
      }
    );
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
          (asset: AssetType) =>
            asset.asset_tags.includes("email template") ||
            asset.asset_tags.includes("linkedin template")
        );

        setAssets(filteredAssets);
      });
  };

  // get research points for selected prospect
  const { data: researchPoints, refetch } = useQuery({
    queryKey: [`query-get-research-points`, innerProps.prospectId],
    queryFn: async () => {
      const response = await getResearchPoint(
        userToken,
        innerProps.prospectId!
      );

      return response.status === "success"
        ? (response.data as ResearchPoint[])
        : [];
    },
    enabled: !!innerProps.prospectId,
  });

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

  const [oneshotOpened, { open, close }] = useDisclosure(false);

  return (
    <div key={innerProps.createTemplateBuilder ? "builder" : "template"}>
      <Flex justify={"space-between"} align={"center"}>
        <Text fw={600} size={"lg"}>
          Sequence Builder
        </Text>
        <Flex align={"center"} gap={"sm"}>
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
            <Group noWrap spacing={"sm"} w={"100%"}>
              <Switch
              disabled  // disabled for now
                // onChange={() => {
                //   if (!innerProps?.checkCanToggleEmail(true)) {
                //     return;
                //   }
                //   innerProps?.togglePersonaChannel(
                //     id,
                //     "email",
                //     userToken,
                //     !innerProps?.statsData?.email_active
                //   );
                // }}
                checked={innerProps?.statsData?.email_active}
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
                  label={<Hook linkedLeft={false} linkedRight={false} />}
                />
                <Select
                  onChange={(value) => {
                    if (typeof value === "string") {
                      innerProps?.updateConnectionType(value, id);
                    }
                  }}
                  size="sm"
                  value={innerProps?.statsData?.email_to_linkedin_connection}
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
                  label={<Hook linkedLeft={false} linkedRight={false} />}
                />
              </>
              <Switch
                disabled
                // onChange={() => {
                //   if (!innerProps?.checkCanToggleLinkedin(true)) {
                //     return;
                //   }
                //   innerProps?.togglePersonaChannel(
                //     id,
                //     "linkedin",
                //     userToken,
                //     !innerProps?.statsData?.linkedin_active
                //   );
                //   console.log(
                //     `LinkedIn channel for persona ${id} has been toggled.`
                //   );
                // }}
                checked={innerProps?.statsData?.linkedin_active}
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
                  <IconArrowsLeftRight color="#228be6" size={"1rem"} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
          <ActionIcon
            radius={"xl"}
            variant="outline"
            color="gray"
            onClick={() => context.closeModal(id)}
          >
            <IconX size={"1rem"} />
          </ActionIcon>
        </Flex>
      </Flex>
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
            {/* <Flex align={"center"} justify={"space-between"}>
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
                    // disabled: true,
                    label: (
                      <Center style={{ gap: 10 }} onClick={open}>
                        <Text fw={500}>One Shot Generator</Text>
                      </Center>
                    ),
                  },
                ]}
              />
              
            </Flex> */}
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
            <Flex align={"center"} justify={"space-between"}>
              <Text fw={600} size={"lg"}>
                Steps
              </Text>
              <Flex align={"center"} gap={"sm"}>
                <Button
                  color="grape"
                  leftIcon={<IconSparkles size={"1rem"} />}
                  size="xs"
                  onClick={() => {
                    openContextModal({
                      modal: "uploadProspects",
                      title: <Title order={3}>Generate Sequences</Title>,
                      innerProps: { mode: "CREATE-ONLY" },
                    });
                  }}
                >
                  AI Generate
                </Button>
                <Popover
                  width={220}
                  position="bottom"
                  withArrow
                  shadow="md"
                  onClose={() => {
                    innerProps.refetchSequenceData(Number(currentProject?.id));
                  }}
                >
                  <Popover.Target>
                    <ActionIcon variant="outline" color="gray">
                      <IconAdjustments size={"1rem"} />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Stack spacing={"md"}>
                      <Text fw={500}>Advanced Settings</Text>
                      {sequenceType === "email" ? (
                        <>
                          <Switch
                            w={"100%"}
                            label="Open Tracking"
                            labelPosition="left"
                            checked={openTrackingEnabled}
                            styles={{
                              label: {
                                justifyContent: "space-between",
                              },
                            }}
                            onClick={() => {
                              setOpenTrackingEnabled(!openTrackingEnabled);
                              postEmailTrackingSettings(
                                userToken,
                                currentProject?.id || -1,
                                !openTrackingEnabled,
                                clickTrackingEnabled
                              ).then(() => {
                                showNotification({
                                  title: "Success",
                                  message: "Email tracking settings updated",
                                  color: "green",
                                });
                              });
                            }}
                          />
                          <Switch
                            w={"100%"}
                            label="Click Tracking"
                            labelPosition="left"
                            checked={clickTrackingEnabled}
                            styles={{
                              label: {
                                justifyContent: "space-between",
                              },
                            }}
                            onClick={() => {
                              setClickTrackingEnabled(!clickTrackingEnabled);
                              postEmailTrackingSettings(
                                userToken,
                                currentProject?.id || -1,
                                openTrackingEnabled,
                                !clickTrackingEnabled
                              ).then(() => {
                                showNotification({
                                  title: "Success",
                                  message: "Email tracking settings updated",
                                  color: "green",
                                });
                              });
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <Switch
                            w={"100%"}
                            label="Enable CTA Mode"
                            labelPosition="left"
                            checked={!currentProject?.template_mode}
                            styles={{
                              label: {
                                justifyContent: "space-between",
                              },
                            }}
                            onClick={() => {
                              fetch(
                                `${API_URL}/client/archetype/${currentProject?.id}/toggle_template_mode`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${userToken}`,
                                  },
                                  body: JSON.stringify({
                                    template_mode: !currentProject?.template_mode,
                                  }),
                                }
                              ).then((res) => {
                                getFreshCurrentProject(
                                  userToken,
                                  currentProject?.id as number
                                ).then((project: any) => {
                                  showNotification({
                                    title: "Success",
                                    message: `Template mode ${
                                      project?.template_mode
                                        ? "enabled"
                                        : "disabled"
                                    }`,
                                    color: "green",
                                    icon: <IconCheck size="1rem" />,
                                  });
                                  setCurrentProject(project);
                                });
                              });
                            }}
                          />
                        </>
                      )}
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Flex>
            </Flex>
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
                      <Text
                        color="gray"
                        size={"sm"}
                        className="flex items-center gap-2"
                      >
                        {" "}
                        <ThemeIcon size={"sm"}>
                          {sequenceType === "linkedin" ? (
                            <IconBrandLinkedin
                              fill="white"
                              color="#228be6"
                              style={{ width: "90%", height: "90%" }}
                            />
                          ) : (
                            <IconMail
                              fill="white"
                              color="#228be6"
                              style={{ width: "90%", height: "90%" }}
                            />
                          )}
                        </ThemeIcon>
                        {currentProject?.template_mode
                          ? "Initial Messages"
                          : "CTAs and Personalizers"}
                      </Text>
                    {currentProject?.template_mode && (
                      <Text color="gray" size={"sm"}>
                        {linkedinInitialMessageData?.length ?? 0}{" "}
                        {linkedinInitialMessageData?.length === 1
                          ? "Message"
                          : "Messages"}
                      </Text>
                    )}
                    </Flex>
                  </Paper>
                  <Divider
                    orientation="vertical"
                    h={30}
                    variant="dashed"
                    ml={20}
                  />
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
                      border:
                        currentStepNum === "subjectLines"
                          ? "1px solid #228be6 "
                          : "",
                      boxShadow:
                        emailSubjectLines.length === 0
                          ? "0 0 0 2px rgba(255, 0, 0, 0.5)"
                          : "",
                    }}
                  >
                    <Flex align={"center"} justify={"space-between"}>
                      <Text
                        color="gray"
                        size={"sm"}
                        className="flex items-center gap-2"
                      >
                        {" "}
                        <ThemeIcon size={"sm"}>
                          <IconMail
                            fill="white"
                            color="#228be6"
                            style={{ width: "90%", height: "90%" }}
                          />
                        </ThemeIcon>
                        {emailSubjectLines.length}{" "}
                        {emailSubjectLines.length === 1
                          ? "Subject Line"
                          : "Subject Lines"}
                      </Text>
                    </Flex>
                  </Paper>
                  <Divider
                    orientation="vertical"
                    h={30}
                    variant="dashed"
                    ml={20}
                  />
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
                          border:
                            currentStepNum === index + 1
                              ? "1px solid #228be6 "
                              : "",
                        }}
                      >
                        <Flex align={"center"} justify={"space-between"}>
                          <Text
                            color="gray"
                            size={"sm"}
                            className="flex items-center gap-2"
                          >
                            {" "}
                            <ThemeIcon size={"sm"}>
                              {sequenceType === "linkedin" ? (
                                <IconBrandLinkedin
                                  fill="white"
                                  color="#228be6"
                                  style={{ width: "90%", height: "90%" }}
                                />
                              ) : (
                                <IconMail
                                  fill="white"
                                  color="#228be6"
                                  style={{ width: "90%", height: "90%" }}
                                />
                              )}
                            </ThemeIcon>
                            Follow-up {index + 1}
                          </Text>
                          {index === Number(steps) - 1 && (
                            <ActionIcon
                              color="red"
                              onClick={() =>
                                setSteps((item) => (item = item - 1))
                              }
                            >
                              <IconTrash size={"1rem"} />
                            </ActionIcon>
                          )}
                        </Flex>
                        <Flex gap={5} ml={30} mt={6} align={"center"}>
                          <ThemeIcon
                            size={14}
                            variant="outline"
                            color="green"
                            radius={"xl"}
                            mb={2}
                          >
                            <IconPoint
                              fill="#40C057"
                              color="#40C057"
                              size={"3rem"}
                            />
                          </ThemeIcon>
                          <Text size={"xs"} fw={600}>
                            {sequenceType === "email"
                              ? emailSequenceData[index]?.length || 0
                              : linkedinSequenceData[index]?.length || 0}{" "}
                            {sequenceType === "email"
                              ? (emailSequenceData[index]?.length || 0) > 1
                                ? "Templates"
                                : "Template"
                              : (linkedinSequenceData[index]?.length || 0) > 1
                                ? "Templates"
                                : "Template"}
                          </Text>
                        </Flex>
                        {stagingData[sequenceType] && (
                          <Flex gap={5} ml={30} mt={6} align={"center"}>
                            <IconClock color="orange" size={"1rem"} />
                            <Text size={"xs"} fw={600} color="gray">
                              {stagingData[sequenceType]?.filter(
                                (asset: any) => asset.step_num === index + 1
                              ).length + " "}{" "}
                              templates pending save
                            </Text>
                          </Flex>
                        )}
                      </Paper>
                      { (sequenceType === "email"
                              ? emailSequenceData[index]?.length > 0
                              : linkedinSequenceData[index]?.length > 0) && <Flex align={"center"} gap={"sm"}>
                        <Divider
                          orientation="vertical"
                          h={40}
                          variant="dashed"
                          ml={20}
                        />
                        <Paper withBorder radius={"sm"} p={1} px={4}>
                          <Flex align={"center"} gap={4}>
                            <IconClock color="orange" size={"1rem"} />
                            {sequenceType === "email" ? (
                              isEditingBumpDelayDays === index ? (
                                <Input
                                  ref={inputRef}
                                  style={{ width: '40px' }}
                                  type="number"
                                  fw={500}
                                  size={"sm"}
                                  value={newBumpDelayDays}
                                  onChange={(e) => setNewBumpDelayDays(parseInt(e.target.value, 10))}
                                  onBlur={async () => {
                                    if (!isNaN(newBumpDelayDays)) {
                                      for (let i = 0; i < emailSequenceData[index].length; i++) {
                                        patchSequenceStep(
                                          userToken,
                                          emailSequenceData[index][i].id || -1, 
                                          emailSequenceData[index][i].overall_status || '',
                                          emailSequenceData[index][i].title || '',
                                          emailSequenceData[index][i].description,
                                          emailSequenceData[index][i].bumped_count,
                                          false,
                                          newBumpDelayDays,
                                          ['']
                                        );
                                      }
                                      setEmailSequenceData((prevData) => {
                                        const newData = [...prevData];
                                        newData[index] = newData[index].map((item) => ({
                                          ...item,
                                          sequence_delay_days: newBumpDelayDays,
                                        }));
                                        return newData;
                                      });
                                      setIsEditingBumpDelayDays(null);
                                    }
                                  }}
                                />
                              ) : (
                                <Text
                                  fw={500}
                                  size={"sm"}
                                  onClick={() => {

                                    if (currentProject?.email_active) {
                                      showNotification({
                                        title: "Error",
                                        message: "Cannot update bump delay days for an already active email campaign",
                                        color: "red",
                                      });
                                      return;
                                    }

                                    setNewBumpDelayDays(emailSequenceData[index]?.[0]?.sequence_delay_days || 0);
                                    setIsEditingBumpDelayDays(index);
                                  }}
                                
                                >
                                  {emailSequenceData[index]?.[0]?.sequence_delay_days || 0}
                                </Text>
                              )
                            ) : (
                              isEditingBumpDelayDays === index ? (
                                <Input
                                  ref={inputRef}
                                  style={{ width: '40px' }}
                                  type="number"
                                  fw={500}
                                  size={"sm"}
                                  value={newBumpDelayDays}
                                  onChange={(e) => setNewBumpDelayDays(parseInt(e.target.value, 10))}
                                  onBlur={async () => {
                                    if (!isNaN(newBumpDelayDays)) {
                                      for (let i = 0; i < linkedinSequenceData[index].length; i++) {
                                        patchBumpFramework(
                                          userToken,
                                          linkedinSequenceData[index][i].bump_framework_id,
                                          linkedinSequenceData[index][i].overall_status || '',
                                          linkedinSequenceData[index][i].title || '',
                                          linkedinSequenceData[index][i].description,
                                          '',
                                          linkedinSequenceData[index][i].bumped_count,
                                          newBumpDelayDays,
                                          linkedinSequenceData[index][i].active,
                                          false,
                                          [''],
                                          '',
                                          '',
                                          '',
                                          '',
                                          index + 1,
                                        );
                                      }
                                      setLinkedinSequenceData((prevData) => {
                                        const newData = [...prevData];
                                        newData[index] = newData[index].map((item) => ({
                                          ...item,
                                          bump_delay_days: newBumpDelayDays,
                                        }));
                                        return newData;
                                      });
                                      setIsEditingBumpDelayDays(null);
                                    }
                                  }}
                                />
                              ) : (
                                <Text
                                  fw={500}
                                  size={"sm"}
                                  onClick={() => {
                                    setNewBumpDelayDays(linkedinSequenceData[index]?.[0]?.bump_delay_days || 0);
                                    setIsEditingBumpDelayDays(index);
                                  }}
                                
                                >
                                  {linkedinSequenceData[index]?.[0]?.bump_delay_days || 0}
                                </Text>
                              )
                            )}
                            <span className="text-gray-500">
                              {sequenceType === "email" 
                                ? emailSequenceData[index]?.[0]?.sequence_delay_days === 1 
                                  ? "day" 
                                  : "days"
                                : linkedinSequenceData[index]?.[0]?.bump_delay_days === 1 
                                  ? "day" 
                                  : "days"}
                            </span>
                          </Flex>
                        </Paper>
                      </Flex>}
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
                  <Text
                    color="blue"
                    fw={500}
                    size={"sm"}
                    className="flex items-center gap-2"
                  >
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
          <Paper
            withBorder
            w={"66%"}
            display={"flex"}
            style={{ flexDirection: "column" }}
          >
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
                <>
                <ScrollArea viewportRef={viewport} h={350}>
                  {linkedinInitialMessageData.length > 0 && currentProject?.template_mode &&  
                    linkedinInitialMessageData.map(
                      (messageData: LinkedinInitialMessageDataType, index: number) => (
                        <Box p={"xs"} h={"100%"}>
                        <SequenceVariant
                          asset={messageData}
                          assetType={"linkedin"}
                          refetch={() =>
                            innerProps.refetchSequenceData(
                              innerProps.campaignId
                            )
                          }
                          sequenceType={sequenceType}
                          angle={messageData.message}
                          text={messageData.message}
                          assetId={messageData.id}
                          index={index}
                          isSaved={true}
                          selectStep={selectStep ?? 0}
                          opened={opened}
                          userImgUrl={userData.img_url}
                          removeFromStagingData={removeFromStagingData}
                          handleToggle={handleToggle}
                          stagingData={stagingData}
                          setStagingData={setStagingData}
                          currentStepNum={currentStepNum}
                        />
                        </Box> 
                      )
                    )}
                    {linkedinInitialMessageStagingData.length > 0 && currentProject?.template_mode &&   (
                      <Flex justify="center" align="center">
                        <Divider
                          orientation="horizontal"
                          color="yellow"
                          size={"2px"}
                          style={{ margin: "0 25px", flex: 1 }}
                        />
                        <Badge variant="outline" color="yellow" tt={"initial"}>
                          New
                        </Badge>
                        <Divider
                          orientation="horizontal"
                          color="yellow"
                          size={"2px"}
                          style={{ margin: "0 25px", flex: 1 }}
                        />
                      </Flex>
                    )}
                  <Flex p={"xs"} h={"100%"} direction={"column"}>
                    {linkedinInitialMessageStagingData.length > 0
                      ? linkedinInitialMessageStagingData.map(
                          (message: string, index4: number) => (
                            <SequenceVariant
                              asset={{ message }}
                              assetType={"linkedin"}
                              refetch={() =>
                                innerProps.refetchSequenceData(
                                  innerProps.campaignId
                                )
                              }
                              sequenceType={sequenceType}
                              angle={message}
                              text={message}
                              assetId={-1}
                              index={index4}
                              isSaved={false}
                              selectStep={selectStep ?? 0}
                              opened={opened}
                              userImgUrl={userData.img_url}
                              removeFromStagingData={removeFromStagingData}
                              handleToggle={handleToggle}
                              stagingData={stagingData}
                              setStagingData={setStagingData}
                              currentStepNum={currentStepNum}
                            />
                          )
                        )
                      : linkedinInitialMessageStagingData.map(
                          (message: string, index4: number) => (
                            <SequenceVariant
                              asset={{ message }}
                              assetType={"linkedin"}
                              refetch={() =>
                                innerProps.refetchSequenceData(
                                  innerProps.campaignId
                                )
                              }
                              sequenceType={sequenceType}
                              angle={message}
                              text={message}
                              assetId={index4}
                              index={index4}
                              isSaved={true}
                              selectStep={selectStep ?? 0}
                              opened={opened}
                              userImgUrl={userData.img_url}
                              removeFromStagingData={removeFromStagingData}
                              handleToggle={handleToggle}
                              stagingData={stagingData}
                              setStagingData={setStagingData}
                              currentStepNum={currentStepNum}
                            />
                          )
                        )}
                    {!currentProject?.template_mode && (
                      <Tabs
                        value={activeTab}
                        onTabChange={setActiveTab}
                        variant="pills"
                        keepMounted={true}
                        radius="md"
                        defaultValue="ctas"
                        allowTabDeactivation
                      >
                        <Tabs.List>
                          <Tabs.Tab
                            // ref={refPersonSettingsBtn}
                            value="personalization"
                            color="teal.5"
                            rightSection={
                              <>
                                {personalizationItemsCount ? (
                                  <Badge
                                    w={16}
                                    h={16}
                                    sx={{ pointerEvents: "none" }}
                                    variant="filled"
                                    size="xs"
                                    p={0}
                                    color="teal.6"
                                  >
                                    {personalizationItemsCount}
                                  </Badge>
                                ) : (
                                  <></>
                                )}
                              </>
                            }
                            sx={(theme) => ({
                              "&[data-active]": {
                                backgroundColor:
                                  theme.colors.teal[0] + "!important",
                                borderRadius: theme.radius.md + "!important",
                                color: theme.colors.teal[8] + "!important",
                              },
                              border:
                                "solid 1px " +
                                theme.colors.teal[5] +
                                "!important",
                            })}
                          >
                            Edit Personalization
                          </Tabs.Tab>
                          <Tabs.Tab
                            // ref={refYourCTAsBtn}
                            value="ctas"
                            color="blue.4"
                            rightSection={
                              <>
                                {ctasItemsCount ? (
                                  <Badge
                                    w={16}
                                    h={16}
                                    sx={{ pointerEvents: "none" }}
                                    variant="filled"
                                    size="xs"
                                    p={0}
                                    color="blue.5"
                                  >
                                    {ctasItemsCount}
                                  </Badge>
                                ) : (
                                  <></>
                                )}
                              </>
                            }
                            sx={(theme) => ({
                              "&[data-active]": {
                                backgroundColor:
                                  theme.colors.blue[0] + "!important",
                                borderRadius: theme.radius.md + "!important",
                                color: theme.colors.blue[8] + "!important",
                              },
                              border:
                                "solid 1px " +
                                theme.colors.blue[4] +
                                "!important",
                            })}
                          >
                            Edit CTAs
                          </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="personalization">
                          <ScrollArea h={300}>
                            <PersonalizationSection
                              researchPoints={researchPoints}
                              blocklist={
                                currentProject?.transformer_blocklist_initial ??
                                []
                              }
                              onItemsChange={async (items) => {
                                setPersonalizationItemsCount(
                                  items.filter((x: any) => x.checked).length
                                );

                                // Update transformer blocklist
                                const result = await updateInitialBlocklist(
                                  userToken,
                                  currentProject?.id || -1,
                                  items
                                    .filter((x) => !x.checked)
                                    .map((x) => x.id)
                                );
                              }}
                            />
                          </ScrollArea>
                        </Tabs.Panel>
                        <Tabs.Panel value="ctas">
                          <ScrollArea h={300}>
                            <CtaSection
                              onCTAsLoaded={(data) => {
                                setCtasItemsCount(
                                  data.filter((x: any) => x.active).length
                                );
                              }}
                            />
                          </ScrollArea>
                        </Tabs.Panel>
                      </Tabs>
                    )}
                  </Flex>
                </ScrollArea>
                {currentProject?.template_mode &&  <Flex direction="column" p="lg" gap="md">
                  <Textarea
                    placeholder="Enter initial LinkedIn message"
                    value={linkedinInitialMessageEntry}
                    onChange={(event) =>
                      setLinkedinInitialMessageEntry(event.currentTarget.value)
                    }
                    autosize
                    minRows={3}
                  />
                  <Button
                    onClick={() => {
                      if (linkedinInitialMessageEntry) {
                        setLinkedinInitialMessageStagingData((prevData: any[]) => [...prevData, linkedinInitialMessageEntry])
                        setLinkedinInitialMessageEntry("");
                      }
                    }}
                  >
                    Queue to add
                  </Button>
                </Flex>}
                </>
              )}
              {currentStepNum === steps + 1 && sequenceType === "email" && (
                <ScrollArea viewportRef={viewport} h={350}>
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    {emailSubjectLines.map(
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
                currentStepNum !== "subjectLines" &&
                currentStepNum !== 0 && (
                  <ScrollArea viewportRef={viewport} h={"100%"}>
                    <Flex p={"lg"} h={"100%"} direction={"column"}>
                      {/* existing assets */}
                      {(sequenceType === "email"
                        ? emailSequenceData[currentStepNum - 1]
                        : linkedinSequenceData[currentStepNum - 1]
                      )?.map((existingAsset: any, index2: number) => {
                        return (
                          <SequenceVariant
                            asset={existingAsset}
                            assetType={sequenceType}
                            refetch={() =>
                              innerProps.refetchSequenceData(
                                innerProps.campaignId
                              )
                            }
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
                      })}
                    </Flex>
                    {/* STAGING DATA DIVIDER */}
                    {stagingData[sequenceType]?.filter(
                      (asset: any) => asset.step_num === currentStepNum
                    ).length > 0 && (
                      <Flex justify="center" align="center">
                        <Divider
                          orientation="horizontal"
                          color="yellow"
                          size={"2px"}
                          style={{ margin: "0 25px", flex: 1 }}
                        />
                        <Badge variant="outline" color="yellow" tt={"initial"}>
                          New
                        </Badge>
                        <Divider
                          orientation="horizontal"
                          color="yellow"
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
                            (asset: any) => asset.step_num === currentStepNum
                          )
                          .map((asset: any, index: number) => {
                            return (
                              <SequenceVariant
                                asset={asset}
                                assetType="staging"
                                refetch={() =>
                                  innerProps.refetchSequenceData(
                                    innerProps.campaignId
                                  )
                                }
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
                          <Divider
                            orientation="horizontal"
                            color="grape"
                            size={"2px"}
                            style={{ margin: "0 25px", flex: 1 }}
                          />
                          <Badge variant="outline" tt={"initial"} color="grape">
                            Suggestions
                          </Badge>
                          <Divider
                            orientation="horizontal"
                            color="grape"
                            size={"2px"}
                            style={{ margin: "0 25px", flex: 1 }}
                          />
                        </Flex>
                      )}
                      <Paper
                        style={{
                          backgroundColor: "#f8f8ff",
                          padding: "8px",
                          borderRadius: "8px",
                        }}
                      >
                        {suggestionData?.map(
                          (suggestion: any, index6: number) => {
                            return (
                              <SequenceVariant
                                asset={suggestion}
                                assetType="suggestion"
                                refetch={() =>
                                  innerProps.refetchSequenceData(
                                    innerProps.campaignId
                                  )
                                }
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
                                setManuallyAddedTemplate={
                                  setManuallyAddedTemplate
                                }
                              />
                            );
                          }
                        )}
                      </Paper>
                    </Flex>
                  </ScrollArea>
                )}

              {sequenceType === "email" && currentStepNum === "subjectLines" && (
                <ScrollArea
                  viewportRef={viewport}
                  h="100%"
                  px="sm"
                  style={{ position: "relative" }}
                >
                  {emailSubjectLines
                    ?.slice()
                    ?.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1))
                    ?.map((subjectLine: SubjectLineTemplate) => {
                      return (
                        <SubjectLineItem
                          subjectLine={subjectLine}
                          refetch={async () =>
                            await innerProps?.refetchSequenceData(
                              innerProps?.campaignId
                            )
                          }
                        />
                      );
                    })}
                  <CreateEmailSubjectLineModal
                    modalOpened={emailSubjectLineModalOpened}
                    openModal={() => console.log("Open Modal")}
                    closeModal={() => {
                      setEmailSubjectLineModalOpened(false);
                      innerProps.refetchSequenceData(
                        Number(currentProject?.id || -1)
                      );
                    }}
                    backFunction={() => {
                      setEmailSubjectLineModalOpened(false);
                      innerProps.refetchSequenceData(
                        Number(currentProject?.id || -1)
                      );
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
                    <Button
                      color="blue"
                      leftIcon={<IconPlus size={"0.9rem"} />}
                      onClick={() => setEmailSubjectLineModalOpened(true)}
                      fullWidth
                    >
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
                              !currentProject?.ai_researcher_id ||
                              !currentProject.is_ai_research_personalization_enabled
                                ? "grey"
                                : "linear-gradient(135deg, rgba(255,255,0,0.8), rgba(0,255,0,0.8), rgba(0,0,255,0.8))",
                            color: "white",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                            backdropFilter: "blur(10px)",
                            padding: "10px 20px",
                            transition:
                              "background 0.3s ease, box-shadow 0.3s ease",
                            border: "1px solid grey",
                          }}
                          leftIcon={<IconSparkles size={"0.9rem"} />}
                          loading={loadingMagicSubjectLine}
                          onClick={async () => {
                            if (
                              !currentProject?.ai_researcher_id ||
                              !currentProject.is_ai_research_personalization_enabled
                            ) {
                              showNotification({
                                title: "Action Required",
                                message:
                                  "Please enable AI Personalization and attach an AI Researcher with research questions.",
                                color: "red",
                              });
                              return;
                            }
                            setLoadingMagicSubjectLine(true);
                            try {
                              await createEmailSubjectLineTemplate(
                                userToken,
                                currentProject?.id || -1,
                                "",
                                true
                              );
                              await innerProps.refetchSequenceData(
                                Number(currentProject?.id || -1)
                              );
                            } finally {
                              setLoadingMagicSubjectLine(false);
                              // closeAllModals();
                            }
                          }}
                          fullWidth
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(135deg, rgba(75,0,130,1), rgba(0,255,255,1))";
                            e.currentTarget.style.boxShadow =
                              "0 6px 8px rgba(0, 0, 0, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget.style.background =
                              "linear-gradient(135deg, rgba(255,255,0,0.8), rgba(0,255,0,0.8), rgba(0,0,255,0.8))"),
                              (e.currentTarget.style.boxShadow =
                                "0 4px 6px rgba(0, 0, 0, 0.1)");
                          }}
                        >
                          Add Magic Subject Line
                          <Tooltip
                            multiline
                            label={
                              <Text size="sm">
                                SellScale will generate a clever subject line{" "}
                                <br></br>
                                using its research and contextual knowledge{" "}
                                <br></br>
                                about the campaign, prospect, and the chosen
                                sequence.
                              </Text>
                            }
                            withArrow
                            position="top"
                          >
                            <Text
                              color="white"
                              size="xl"
                              style={{ marginLeft: "30px" }}
                            >
                              <IconQuestionMark size={"1rem"} color="white" />
                            </Text>
                          </Tooltip>
                        </Button>
                      )}
                    </Flex>
                  </div>
                </ScrollArea>
              )}
            </Box>

            {/* isNaN corresponds to subject lines */}
            {!isNaN(currentStepNum) && (
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
                    setLoading(true);
                    let addType = "";
                    if (sequenceType === "linkedin") {
                      addType = "LINKEDIN-TEMPLATE";
                    } else {
                      addType = "EMAIL";
                    }

                    if (linkedinInitialMessageStagingData.length > 0) {

                      addSequence(
                        userToken,
                        userData?.client?.id,
                        campaignId,
                        addType,
                        [],
                        linkedinInitialMessageStagingData.map((message, index) => ({
                          step_num: 1,
                          text: message,
                          assets: [],
                          angle: message,
                        }))
                      );

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

                    sessionStorage.removeItem("stagingData");

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
      <OneshotModal
        oneshotOpened={oneshotOpened}
        close={close}
        refetch={() =>
          innerProps.refetchSequenceData(
            Number(currentProject ? currentProject.id : -1)
          )
        }
      />
    </div>
  );
}

export const OneshotModal = (props: any) => {
  const { oneshotOpened, close, refetch } = props;
  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  // Email
  const [emailGeneralAngle, setEmailGeneralAngle] = useState("");
  const [writeEmailSequenceDraft, setWriteEmailSequenceDraft] = useState(false);
  const [emailAssetIngestor, setEmailAssetIngestor] = useState("");
  const [emailSequenceKeywords, setEmailSequenceKeywords] = useState<string[]>(
    []
  );
  const [emailSequenceOpened, setEmailSequenceOpened] = useState(false);
  const setEmailSequenceToggle = () =>
    setEmailSequenceOpened(!emailSequenceOpened);
  const [ctaTarget, setCTATarget] = useState("");

  const [defaultVoicesOptions, setDefaultVoicesOptions] = useState<
    DefaultVoices[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [templateMode, setTemplateMode] = useState<string>("template");

  useEffect(() => {
    const getVoices = async () => {
      const res = await fetch(`${API_URL}/internal_voices`);

      if (res.status === 200) {
        const data = await res.json();
        setDefaultVoicesOptions(data);
      }
    };

    getVoices();
  }, []);

  const onClickGenerate = async function () {
    setLoading(true);
    const response = await fetch(
      `${API_URL}/client/archetype/${currentProject?.id}/generate_ai_sequence`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          auto_generation_payload: {
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
            ctaTarget: ctaTarget ? ctaTarget : currentProject?.name,
            emailAssetIngestor,
            withData,
            selectedVoice: selectedVoice ? +selectedVoice : undefined,
            numSteps,
            numVariance,
            liSequenceState,
            emailSequenceState,
          },
        }),
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      refetch();
      close();
    }

    setLoading(false);
  };

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

  // LinkedIn
  const [writeLISequenceDraft, setWriteLISequenceDraft] = useState(false);
  const [liSequenceOpened, setLiSequenceOpened] = useState(false);
  const [liGeneralAngle, setLiGeneralAngle] = useState("");
  const [liSequenceKeywords, setLiSequenceKeywords] = useState<string[]>([]);
  const [liAssetIngestor, setLiAssetIngestor] = useState("");
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

  // New System for one shot campaign generator
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [numSteps, setNumSteps] = useState(1);
  const [numVariance, setNumVariance] = useState(1);
  const [liCtaGenerator, setLiCtaGenerator] = useState(false);

  // CTA system
  const [company, setCompany] = useState(userData.client.company);
  const [withData, setWithData] = useState("");

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
          <Select
            data={[
              {
                label: "Email",
                value: "email",
              },
              {
                label: "LinkedIn",
                value: "linkedin",
              },
            ]}
            label="Sequence Type"
            w={200}
            onChange={(value) => {
              if (value === "linkedin") {
                setLiSequenceOpened(true);
                setWriteLISequenceDraft(true);

                setEmailSequenceOpened(false);
                setWriteEmailSequenceDraft(false);
              } else {
                setEmailSequenceOpened(true);
                setWriteEmailSequenceDraft(true);

                setLiSequenceOpened(false);
                setWriteLISequenceDraft(false);
              }
            }}
          />
          <NumberInput
            label="# Steps"
            placeholder="# Steps"
            withAsterisk
            onChange={(e) => setNumSteps(+e)}
            value={numSteps}
            w={100}
          />
          <NumberInput
            label="# Variants"
            placeholder="# Variants"
            withAsterisk
            onChange={(e) => setNumVariance(+e)}
            value={numVariance}
            w={100}
          />
        </Flex>
      </Flex>
      <Stack spacing={"sm"}>
        {writeEmailSequenceDraft ? (
          <TextInput
            label="General Angle"
            placeholder="I want to write a sequence that targets marketers and does XYZ"
            value={emailGeneralAngle}
            onChange={(e) => setEmailGeneralAngle(e.currentTarget.value)}
          />
        ) : (
          <TextInput
            label="General Angle"
            placeholder="I want to write a sequence that targets marketers and does XYZ"
            onChange={(e) => setLiGeneralAngle(e.currentTarget.value)}
            value={liGeneralAngle}
          />
        )}
        {writeEmailSequenceDraft ? (
          <CustomSelect
            maxWidth="30vw"
            value={emailSequenceKeywords}
            label="Keywords-put mandatory keywords that should for sure be mentioned"
            placeholder="Select options"
            setValue={setEmailSequenceKeywords}
            data={emailSequenceKeywords}
            setData={setEmailSequenceKeywords}
          />
        ) : (
          <CustomSelect
            maxWidth="30vw"
            value={liSequenceKeywords}
            label="Keywords-put mandatory keywords that should for sure be mentioned"
            placeholder="Select options"
            setValue={setLiSequenceKeywords}
            data={liSequenceKeywords}
            setData={setLiSequenceKeywords}
          />
        )}
        {writeLISequenceDraft && (
          <Checkbox
            label={<Text>Generate CTA (Call to Action)</Text>}
            checked={liCtaGenerator}
            onChange={(e) => {
              setLiCtaGenerator(e.currentTarget.checked);
              if (e.currentTarget.checked) {
                setTemplateMode("cta");
              } else {
                setTemplateMode("template");
              }
            }}
          />
        )}
        {writeLISequenceDraft && liCtaGenerator && (
          <>
            <Flex align={"center"} gap={"4px"}>
              <TextInput value={company} disabled size="xs" radius="xl" />
              <Text>{" Help "}</Text>
              <TextInput
                value={ctaTarget}
                onChange={(e) => setCTATarget(e.currentTarget.value)}
                size="xs"
                radius="xl"
                placeholder={"Enter the target for your CTA"}
                withAsterisk
              />
              <Text>{" with "}</Text>
              <Textarea
                value={withData}
                size="xs"
                style={{ width: "fit-content" }}
                radius="sm"
                onChange={(e) => setWithData(e.currentTarget.value)}
                placeholder={"Filling their top of funnel leads."}
                required
                withAsterisk
              />
            </Flex>
            <Select
              data={defaultVoicesOptions.map((item) => {
                return {
                  value: "" + item.id,
                  label: item.title,
                };
              })}
              onChange={(value) => setSelectedVoice(value)}
              value={selectedVoice}
              label={"Select Voices"}
              placeholder={"Select the voice to generate the campaign"}
            />
          </>
        )}
        {writeEmailSequenceDraft ? (
          <Textarea
            value={emailAssetIngestor}
            onChange={(e) => setEmailAssetIngestor(e.currentTarget.value)}
            label="Asset Ingestor"
            placeholder="Give any additional context for the campaign generation"
            minRows={4}
          />
        ) : (
          <Textarea
            label="Asset Ingestor"
            placeholder="Give any additional context for the campaign generation"
            value={liAssetIngestor}
            onChange={(e) => setLiAssetIngestor(e.currentTarget.value)}
            minRows={4}
          />
        )}
        <Divider
          label={
            liSequenceOpened ? (
              <Button
                onClick={setLiSequenceToggle}
                variant="outline"
                color="gray"
                radius="xl"
                rightIcon={
                  liSequenceOpened ? (
                    <IconChevronUp size="1rem" />
                  ) : (
                    <IconChevronDown size="1rem" />
                  )
                }
              >
                Advanced
              </Button>
            ) : (
              <Button
                onClick={setEmailSequenceToggle}
                variant="outline"
                color="gray"
                radius="xl"
                rightIcon={
                  emailSequenceOpened ? (
                    <IconChevronUp size="1rem" />
                  ) : (
                    <IconChevronDown size="1rem" />
                  )
                }
              >
                Advanced
              </Button>
            )
          }
          variant="dashed"
          labelPosition="center"
        />
        {emailSequenceOpened ? (
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
                  onChange={(e) =>
                    setEmailSequenceState({
                      ...emailSequenceState,
                      howItWorks: e.currentTarget.checked,
                    })
                  }
                />
                <Checkbox
                  size="xs"
                  label="Vary intro messages"
                  checked={emailSequenceState.varyIntroMessages}
                  onChange={(e) =>
                    setEmailSequenceState({
                      ...emailSequenceState,
                      varyIntroMessages: e.currentTarget.checked,
                    })
                  }
                />
                <Checkbox
                  size="xs"
                  label="Breakup message"
                  checked={emailSequenceState.breakupMessage}
                  onChange={(e) =>
                    setEmailSequenceState({
                      ...emailSequenceState,
                      breakupMessage: e.currentTarget.checked,
                    })
                  }
                />
                <Checkbox
                  size="xs"
                  label="Unique offer"
                  checked={emailSequenceState.uniqueOffer}
                  onChange={(e) =>
                    setEmailSequenceState({
                      ...emailSequenceState,
                      uniqueOffer: e.currentTarget.checked,
                    })
                  }
                />
              </SimpleGrid>
            </Box>
          </Collapse>
        ) : (
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
                  onChange={(e) =>
                    setLiSequenceState({
                      ...liSequenceState,
                      howItWorks: e.currentTarget.checked,
                    })
                  }
                />
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
              </SimpleGrid>
            </Box>
          </Collapse>
        )}
        <Flex gap={"lg"}>
          <Button variant="outline" color="gray" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={() => onClickGenerate()}
            disabled={!currentProject}
          >
            {loading ? <Loader /> : "Generate"}
          </Button>
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
