import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import DynamicRichTextArea from "@common/library/DynamicRichTextArea";
import ProspectSelect from "@common/library/ProspectSelect";
import { PersonalizationSection } from "@common/sequence/LinkedInSequenceSection";
import { API_URL, SCREEN_SIZES } from "@constants/data";
import {
  Badge,
  Box,
  Text,
  Flex,
  Grid,
  Button,
  Table,
  Switch,
  Card,
  ActionIcon,
  Tabs,
  Tooltip,
  TextInput,
  LoadingOverlay,
  Title,
  Accordion,
  Loader,
  Popover,
  Divider,
  useMantineTheme,
  HoverCard,
  List,
  Modal,
  Collapse,
  Stack,
  Group,
  Highlight,
  TabsValue,
  Paper,
  Avatar,
  Textarea,
  Select,
  Checkbox,
  ScrollArea,
  Progress,
} from "@mantine/core";
import { useDebouncedState, useDebouncedValue, useDidUpdate, useDisclosure, useHover, useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import EmailSequenceStepModal from "@modals/EmailSequenceStepModal";
import ManageEmailSubjectLineTemplatesModal from "@modals/ManageEmailSubjectLineTemplatesModal";
import {
  IconBooks,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconCpu,
  IconDatabase,
  IconEdit,
  IconInfoCircle,
  IconMail,
  IconMessages,
  IconMicrophone,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconReload,
  IconRobot,
  IconSearch,
  IconTrash,
  IconWritingSign,
  IconX,
} from "@tabler/icons";
import { JSONContent } from "@tiptap/react";
import { postGenerateFollowupEmail, postGenerateInitialEmail } from "@utils/requests/emailMessageGeneration";
import { createEmailSequenceStep, patchSequenceStep, postSequenceStepActivate, postSequenceStepDeactivate } from "@utils/requests/emailSequencing";
import { patchEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import DOMPurify from "dompurify";
import React, { FC, FormEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { EmailSequenceStep, EmailTemplate, ResearchPointType, SpamScoreResults, SubjectLineTemplate } from "src";
import ReactDOMServer from "react-dom/server";
import { deterministicMantineColor } from "@utils/requests/utils";
import EmailTemplateLibraryModal from "@modals/EmailTemplateLibraryModal";
import { openConfirmModal, openModal } from "@mantine/modals";
import postCopyEmailPoolEntry from "@utils/requests/postCopyEmailLibraryItem";
import { isValidUrl } from "@utils/general";
import useRefresh from "@common/library/use-refresh";
import _, { set } from "lodash";
import getResearchPointTypes from "@utils/requests/getResearchPointTypes";
import { useQuery } from "@tanstack/react-query";
import EmailSequenceStepAssets from "./EmailSequenceStepAssets";
import SimulateMagicSubjectLineModal from "@modals/SimulateMagicSubjectLine";
import Personalizers from "@pages/CampaignV2/Personalizers";
import { fetchCampaignStats } from "@utils/requests/campaignOverview";
import {socket} from '../../App'

const SpamScorePopover: FC<{
  subjectSpamScoreDetails?: SpamScoreResults | undefined | null;
  bodySpamScoreDetails: SpamScoreResults | undefined | null;
  hideSubjectLineScore?: boolean;
}> = ({ subjectSpamScoreDetails, bodySpamScoreDetails, hideSubjectLineScore }) => {
  if (!subjectSpamScoreDetails && !bodySpamScoreDetails) {
    return <></>;
  }

  let totalScore = ((subjectSpamScoreDetails?.total_score || 100) + (bodySpamScoreDetails?.total_score || 0)) / 2;
  let color = "red";
  if (totalScore > 75) {
    color = "green";
  } else if (totalScore > 25) {
    color = "orange";
  }

  let subjectColor = "red";
  if (subjectSpamScoreDetails?.total_score || 0 > 75) {
    subjectColor = "green";
  } else if (subjectSpamScoreDetails?.total_score || 0 > 25) {
    subjectColor = "orange";
  }

  let bodyColor = "red";
  if (bodySpamScoreDetails?.total_score || 0 > 75) {
    bodyColor = "green";
  } else if (bodySpamScoreDetails?.total_score || 0 > 25) {
    bodyColor = "orange";
  }

  return (
    <>
      <Popover width={360} position="bottom" withArrow shadow="md" withinPortal>
        <Popover.Target>
          <Button
            size="compact-xs"
            variant="outline"
            color={color}
            sx={{
              fontSize: "10px",
              borderRadius: "22px",
              height: "20px",
            }}
          >
            Spam Score: {totalScore}%
          </Button>
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: "none" }}>
          <Flex align="center" fz="lg">
            <Text mr={"sm"} fw="bold">
              Overall Score:
            </Text>
            <Text color={color} fw="bold">
              {totalScore}
            </Text>
          </Flex>
          {subjectSpamScoreDetails && !hideSubjectLineScore && (
            <>
              <Divider my="xs" />
              <Flex align="center">
                <Text mr={"sm"} fw="bold">
                  Subject Line Score:
                </Text>
                <Text color={subjectColor} fw="bold">
                  {subjectSpamScoreDetails?.total_score}
                </Text>
              </Flex>
              <Flex>
                <Flex pl="md" direction="column" fz="sm" mt="2px">
                  <Flex>
                    <Text>Spam words:</Text>
                    <Text ml="sm" color={subjectSpamScoreDetails?.spam_words.length === 0 ? "green" : "red"} fw={"bold"}>
                      {subjectSpamScoreDetails?.spam_words.join(", ") || "None"}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}
          <Divider my="xs" />
          <Flex align="center">
            <Text mr={"sm"} fw="bold">
              Body Score:
            </Text>
            <Text color={bodyColor} fw="bold">
              {bodySpamScoreDetails?.total_score}
            </Text>
          </Flex>
          <Flex direction="column">
            <Flex pl="md" direction="column" fz="sm" mt="2px">
              <Flex>
                <Text>Read time:</Text>
                <Text
                  ml="sm"
                  color={bodySpamScoreDetails?.read_minutes === 1 ? "green" : bodySpamScoreDetails?.read_minutes === 2 ? "orange" : "red"}
                  fw={"bold"}
                >
                  ~ {bodySpamScoreDetails?.read_minutes} minutes
                </Text>
              </Flex>
              <Flex>
                <Text>Spam words:</Text>
                <Text ml="sm" color={bodySpamScoreDetails?.spam_words.length === 0 ? "green" : "red"} fw={"bold"}>
                  {bodySpamScoreDetails?.spam_words.join(", ") || "None"}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

function NewDetailEmailSequencing(props: {
  toggleDrawer: () => void;
  currentTab: string;
  templates: EmailSequenceStep[];
  subjectLines: SubjectLineTemplate[];
  refetch: () => Promise<void>;
  scrollToTop: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [displayTitle, refreshTitle] = useRefresh();

  // Active Template States
  const [activeTemplate, setTemplate] = useState<EmailSequenceStep>();
  const [activeSubjectLine, setSubjectLine] = useState<SubjectLineTemplate>();
  const [activeTab, setActiveTab] = useState<string>("body");
  const handleTabChange = (value: TabsValue) => {
    const newTab = value as string;
    setActiveTab(newTab);
  };
  // Modal States
  const [bodyLibraryOpened, { open: openBodyLibrary, close: closeBodyLibrary }] = useDisclosure();
  const [createEmailTemplateOpened, { open: openCreateEmailTemplate, close: closeCreateEmailTemplate }] = useDisclosure();
  const [createSubjectLineOpened, { open: openCreateSubject, close: closeCreateSubject }] = useDisclosure();
  const [subjectLibraryOpened, { open: openSubjectLibrary, close: closeSubjectLibrary }] = useDisclosure();

  useEffect(() => {
    if (props.templates.length > 0 && !activeTemplate) {
      setTemplate(props.templates[0]);
    }
    if (props.subjectLines.length > 0 && !activeSubjectLine) {
      setSubjectLine(props.subjectLines[0]);
    }
  }, [props]);

  const triggerPatchEmailBodyTemplateTitle = async (template: EmailSequenceStep, title: string) => {
    setLoading(true);
    const result = await patchSequenceStep(
      userToken,
      template.step.id,
      template.step.overall_status,
      title,
      template.step.template,
      template.step.bumped_count,
      template.step.default
    );
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: "Success",
        message: "Successfully updated email title",
        color: "green",
      });

      props.refetch();
    }

    setLoading(false);
    refreshTitle();
  };
  const debouncedTriggerPatchEmailBodyTemplateTitle = _.debounce(triggerPatchEmailBodyTemplateTitle, 200);

  if (currentProject === null) {
    return <></>;
  }

  function getPersonalizersSection() {

    const [personalizers, setPersonalizers] = useState<any>([]);

    return (
      <Personalizers data={currentProject} sequences={props.templates} setSequences={null} setPersonalizers={setPersonalizers} personalizers={personalizers} />
    );
  }

  function getEmailBodySection() {
    return (
      <Stack>
        <Group position="apart" px="xs">
          <Box>
            <Title order={3}>Templates</Title>
          </Box>
          <Flex>
            <Button onClick={openBodyLibrary} variant="outline" radius="md" color="blue" mr="xs" leftIcon={<IconBooks size="1.0rem" />}>
              Template Library
            </Button>
            <Button variant="light" leftIcon={<IconPlus size="1.0rem" />} radius={"sm"} onClick={openCreateEmailTemplate}>
              Add Custom Template
            </Button>
          </Flex>
          <EmailTemplateLibraryModal
            modalOpened={bodyLibraryOpened}
            closeModal={closeBodyLibrary}
            templateType={"BODY"}
            onSelect={(template: EmailTemplate) => {
              openConfirmModal({
                title: <Title order={3}>Use "{template.name || "N/A"}" Template </Title>,
                children: (
                  <>
                    <Text fs="italic" fz="sm">
                      Review the details of the "{template.name || "N/A"}" template below. You can always edit the template after importing.
                    </Text>
                    <Text mt="sm" fw="light">
                      Name:
                    </Text>
                    <TextInput value={template.name} />
                    <Text mt="md" fw="light">
                      Description:
                    </Text>
                    <TextInput value={template.description || "None..."} />
                    <Text mt="md" fw="light">
                      Template:
                    </Text>
                    <Box
                      sx={() => ({
                        border: "1px solid #E0E0E0",
                        borderRadius: "8px",
                        backgroundColor: "#F5F5F5",
                      })}
                      px="md"
                      mt="sm"
                    >
                      <Text fz="sm">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(template.template),
                          }}
                        />
                      </Text>
                    </Box>
                  </>
                ),
                labels: {
                  confirm: "Import",
                  cancel: "Go Back",
                },
                cancelProps: { color: "grey", variant: "outline" },
                confirmProps: { color: "green" },
                onCancel: () => {},
                onConfirm: async () => {
                  const bumpedCount = props.currentTab.includes("BUMPED-") ? parseInt(props.currentTab.split("-")[1]) : null;
                  const result = await postCopyEmailPoolEntry(
                    userToken,
                    template.template_type,
                    currentProject!.id,
                    template.id,
                    props.currentTab.includes("BUMPED-") ? "BUMPED" : props.currentTab,
                    bumpedCount,
                    template.transformer_blocklist
                  );
                  if (result.status === "success") {
                    showNotification({
                      title: "Success",
                      message: `Successfully imported "${template.name}" template.`,
                      color: "green",
                    });
                    closeBodyLibrary();
                    props.refetch();
                  } else {
                    showNotification({
                      title: "Error",
                      message: result.message,
                      color: "red",
                    });
                  }
                },
              });
            }}
          />
          <EmailSequenceStepModal
            modalOpened={createEmailTemplateOpened}
            openModal={openCreateEmailTemplate}
            closeModal={closeCreateEmailTemplate}
            type={"CREATE"}
            backFunction={() => {
              props.refetch();
            }}
            isDefault={true}
            status={props.currentTab.includes("BUMPED-") ? "BUMPED" : props.currentTab}
            archetypeID={currentProject!.id}
            bumpedCount={props.currentTab.includes("BUMPED-") ? parseInt(props.currentTab.split("-")[1]) : null}
            onFinish={async (title: any, sequence: any, isDefault: any, status: any, substatus: any) => {
              const result = await createEmailSequenceStep(
                userToken,
                currentProject!.id,
                status ?? "",
                title,
                sequence,
                props.currentTab.includes("BUMPED-") ? parseInt(props.currentTab.split("-")[1]) : null,
                isDefault,
                substatus
              );
              return result.status === "success";
            }}
          />
        </Group>
        <Box>
          <Accordion variant="contained" defaultValue={`${activeTemplate?.step.id}`}>
            {props.templates
              .sort((a, b) => {
                if (a.step.active && !b.step.active) {
                  return -1;
                }
                if (!a.step.active && b.step.active) {
                  return 1;
                }
                return 0;
              })
              .map((template: EmailSequenceStep, index: number) => {
                return (
                  <Accordion.Item key={index} value={`${index}`}>
                    <Accordion.Control>
                      <Group position="apart">
                        {displayTitle && (
                          <Flex>
                            <ActionIcon
                              onClick={() => {
                                openModal({
                                  title: "Edit Title",
                                  children: (
                                    <TextInput
                                      defaultValue={template.step.title}
                                      onBlur={(e) => {
                                        debouncedTriggerPatchEmailBodyTemplateTitle(template, e.currentTarget.value);
                                      }}
                                    />
                                  ),
                                  // open on top of other modals
                                  zIndex: 100,
                                });
                              }}
                            >
                              <IconPencil size="1.0rem" />
                            </ActionIcon>
                            <Text size="lg" w={300} variant="unstyled">
                              {template.step.title}
                            </Text>
                          </Flex>
                        )}
                        <Group>
                          {template.step.active && <Badge>Active</Badge>}
                          <Button
                            radius="lg"
                            size="xs"
                            color="violet"
                            variant={activeTemplate?.step.id === template.step.id ? "filled" : "outline"}
                            compact
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTemplate(template);
                            }}
                          >
                            Regen Example
                          </Button>
                        </Group>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <EmailBodyItem template={template} refetch={props.refetch} />
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
          </Accordion>
        </Box>
      </Stack>
    );
  }

  function getEmailSubjectLineSection() {
    return (
      <Stack>
        <Group position="apart" px="xs">
          <Box>
            <Title order={3}>Templates</Title>
          </Box>
          <Flex>
            <Button onClick={openSubjectLibrary} variant="outline" radius="md" color="blue" mr="xs" leftIcon={<IconBooks size="1.0rem" />}>
              Template Library
            </Button>
            <Button variant="light" leftIcon={<IconPlus size="1.0rem" />} radius={"sm"} onClick={openCreateSubject}>
              Add Custom Template
            </Button>
          </Flex>
          <CreateEmailSubjectLineModal
            modalOpened={createSubjectLineOpened}
            openModal={openCreateSubject}
            closeModal={closeCreateSubject}
            backFunction={() => {
              props.refetch();
            }}
            archetypeID={currentProject!.id}
          />
          <EmailTemplateLibraryModal
            modalOpened={subjectLibraryOpened}
            closeModal={closeSubjectLibrary}
            templateType={"SUBJECT_LINE"}
            onSelect={(template: EmailTemplate) => {
              openConfirmModal({
                title: <Title order={3}>Use "{template.name || "N/A"}" Template </Title>,
                children: (
                  <>
                    <Text fs="italic" fz="sm">
                      Review the details of the "{template.name || "N/A"}" template below. You can always edit the template after importing.
                    </Text>
                    <Text mt="sm" fw="light">
                      Name:
                    </Text>
                    <TextInput value={template.name} />
                    <Text mt="md" fw="light">
                      Description:
                    </Text>
                    <TextInput value={template.description || "None..."} />
                    <Text mt="md" fw="light">
                      Template:
                    </Text>
                    <Box
                      sx={() => ({
                        border: "1px solid #E0E0E0",
                        borderRadius: "8px",
                        backgroundColor: "#F5F5F5",
                      })}
                      px="md"
                      mt="sm"
                    >
                      <Text fz="sm">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(template.template),
                          }}
                        />
                      </Text>
                    </Box>
                  </>
                ),
                labels: {
                  confirm: "Import",
                  cancel: "Go Back",
                },
                cancelProps: { color: "grey", variant: "outline" },
                confirmProps: { color: "green" },
                onCancel: () => {},
                onConfirm: async () => {
                  const result = await postCopyEmailPoolEntry(
                    userToken,
                    template.template_type,
                    currentProject!.id,
                    template.id,
                    null,
                    null,
                    template.transformer_blocklist
                  );
                  if (result.status === "success") {
                    showNotification({
                      title: "Success",
                      message: `Successfully imported "${template.name}" template.`,
                      color: "green",
                    });
                    closeSubjectLibrary();
                    props.refetch();
                  } else {
                    showNotification({
                      title: "Error",
                      message: result.message,
                      color: "red",
                    });
                  }
                },
              });
            }}
          />
        </Group>
        <Box>
          <Accordion variant="contained" defaultValue={`${activeSubjectLine?.id}`}>
            {props.subjectLines
              .sort((a, b) => {
                if (a.active && !b.active) {
                  return -1;
                }
                if (!a.active && b.active) {
                  return 1;
                }
                return 0;
              })
              .map((subjectLine: SubjectLineTemplate, index: number) => (
                <Box
                  key={index}
                  style={{
                    position: "relative",
                  }}
                >
                  <Button
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 150,
                      zIndex: 100,
                    }}
                    size="xs"
                    radius="lg"
                    color="violet"
                    variant={activeSubjectLine?.id === subjectLine.id ? "filled" : "outline"}
                    compact
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSubjectLine(subjectLine);
                    }}
                  >
                    Regen Example
                  </Button>

                  <SubjectLineItem subjectLine={subjectLine} refetch={props.refetch} />
                </Box>
              ))}
          </Accordion>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack>
      <EmailPreviewHeader currentTab={props.currentTab} template={activeTemplate} subjectLine={activeSubjectLine} />

      {props.currentTab === "PROSPECTED" ? (
        <Tabs onTabChange={handleTabChange} variant="outline" defaultValue="body">
          <Tabs.List>
            <Tabs.Tab value="subject_line" style={{ fontWeight: activeTab === "subject_line" ? "bold" : "normal" }}>Subject Lines</Tabs.Tab>
            <Tabs.Tab value="body" style={{ fontWeight: activeTab === "body" ? "bold" : "normal" }}>Body</Tabs.Tab>
            <Tabs.Tab value="personalizers" style={{ fontWeight: activeTab === "personalizers" ? "bold" : "normal", display: "flex", alignItems: "center" }}>
              Personalizers
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="subject_line">
            <Box pt="xs">{getEmailSubjectLineSection()}</Box>
          </Tabs.Panel>

          <Tabs.Panel value="body">
            <Box pt="xs">{getEmailBodySection()}</Box>
          </Tabs.Panel>

          <Tabs.Panel value="personalizers">
            <Box pt="xs">{getPersonalizersSection()}</Box>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <>{getEmailBodySection()}</>
      )}
    </Stack>
  );
}

function EmailPreviewHeader(props: { currentTab: string; template?: EmailSequenceStep; subjectLine?: SubjectLineTemplate }) {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const userData = useRecoilValue(userDataState);
  const [selectedVoice, setSelectedVoice] = useState<string | null>("");
  const [aiVoices, setAiVoices] = useState<{ client_id: number; client_sdr_created_by: number; id: number; name: string }[]>([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(false);
  const [loadingBankData, setLoadingBankData] = useState<boolean>(false);
  const [voiceBankOpen, setVoiceBankOpen] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<Number>(0);
  const roomIDref = useRef<string>('');
  const [sections, setSections] = useState<{ value: number; color: string; label: string; }[]>([]);
  const [fewShots, setFewShots] = useState<
    {
      id: number;
      nuance: string[];
    }[]
  >([]);

  useEffect(() => {
    const handleData = (data: any) => {
      if (data.step !== undefined && data.room_id === roomIDref.current) {
        setProgressStep(data.step);
        setSections(prevSections => {
          const newSection = (() => {
            switch (data.step) {
              case 1:
                return { value: 33.33, color: 'orange', label: 'Researching Prospect' };
              case 2:
                return { value: 33.33, color: 'grape', label: 'Generating Email' };
              case 3:
                return { value: 33.33, color: 'green', label: 'Generating Subject Line' };
              default:
                return null;
            }
          })();
          return newSection ? [...prevSections, newSection] : prevSections;
        });
      }
    };
  
    socket.on("subject-stream", handleData);
  
    return () => {
      socket.off("subject-stream", handleData);
    };
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const response = await fetch(API_URL + '/ml/voices/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAiVoices(data);
        } else {
          console.error('Failed to fetch voices');
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchAssignedVoice();

    fetchVoices();
  }, [userToken]);

  const fetchAssignedVoice = async () => {
    try {
      setLoadingBankData(true);
      const data = await fetchCampaignStats(userToken, currentProject?.id || -1);
      setSelectedVoice(data.ai_voice_id);
      if (data.ai_voice_id) {
        const response = await fetch(API_URL + '/ml/few-shot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ voice_id: data.ai_voice_id }),
        });
        if (response.ok) {
          const fewShotData = await response.json();
          const decomposedFewShotData = fewShotData.map((item: { nuance: string; }) => ({
            ...item,
            nuance: JSON.parse(item.nuance),
          }));
          setFewShots(decomposedFewShotData);
        } else {
          console.error('Failed to fetch few-shot data');
        }
      }
    } catch (error) {
      console.error('Error fetching assigned voice or few-shot data:', error);
    }
    setLoadingBankData(false);
  }

  const modifyFewShot = (index: number, nuanceIndex: number) => async () => {
    setFewShots((prevFewShots) => {
      const updatedFewShots = prevFewShots.map((fewShot, i) => {
        if (i === index) {
          const updatedNuance = fewShot.nuance.filter((_, nIndex) => nIndex !== nuanceIndex);
          const updatedFewShot = {
            ...fewShot,
            nuance: updatedNuance,
          };
          return updatedFewShot;
        }
        return fewShot;
      });
      return updatedFewShots;
    });

    try {
      const fewShot = fewShots[index];
      const updatedNuance = fewShot.nuance.filter((_, nIndex) => nIndex !== nuanceIndex);
      const response = await fetch(API_URL + '/ml/few-shot', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          id: fewShot.id,
          nuance: JSON.stringify(updatedNuance),
        }),
      });
      if (!response.ok) {
        console.error('Failed to update few-shot data');
      }
    } catch (error) {
      console.error('Error updating few-shot data:', error);
    }
  };

  // Preview Email (Generation)
  const [prospectId, setProspectId] = useState<number>(0);

  const { data, isFetching, refetch } = useQuery<any>({
    queryKey: [
      `query-generate-email`,
      {
        prospectId: prospectId,
        currentTab: props.currentTab,
        template: props.template,
        subjectLine: props.subjectLine,
      },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { prospectId, currentTab, template, subjectLine }]: any = queryKey;

      if (!props.subjectLine?.id || !props.template?.step.id) {
        return null;
      }

      if (currentTab === "PROSPECTED") {
        //magic subject line generation will call the research endpoint.
        if (subjectLine.is_magic_subject_line || currentProject?.is_ai_research_personalization_enabled) {
          if (prospectId === 0) {
            return
          }
          setSections([]);
          const room_id = Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('');
          roomIDref.current = room_id;
          socket.emit("join-room", {
            payload: { room_id: room_id },
          });
          const response = await fetch(API_URL + '/ml/simulate-magic-subject-line', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              sequence_id: props.template.step.id,
              prospect_id: Number(prospectId),
              archetype_id: currentProject?.id,
              subject_line_id: subjectLine.id,
              room_id,
            }),
          });
          if (response.ok) {
            const data = await response.json();

            return {
              subject_line: data.magic_subject_line,
              body: data.personalized_email,
              body_spam: {
                read_minutes: 1,
                read_minutes_score: 100,
                spam_word_score: 100,
                spam_words: [],
                total_score: 100,
              },
            };
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        return await generateInitialEmail(
          prospectId,
          currentTab,
          template,
          subjectLine
        );
      } else {
        return await generateFollowUpEmail(prospectId, currentTab, template);
      }
    },
    refetchOnWindowFocus: false,
  });

  const generateInitialEmail = async (prospectId: number, currentTab: string, template: EmailSequenceStep, subjectLine: SubjectLineTemplate) => {
    if (!prospectId || currentTab !== "PROSPECTED") {
      return {
        subject_line: null,
        subject_spam: null,
        body: null,
        body_spam: null,
      };
    }

    try {
      const response = await postGenerateInitialEmail(userToken, prospectId, template.step.id, null, subjectLine.id, null, null);
      if (response.status === "success") {
        const email_body = response.data.email_body;
        const subject_line = response.data.subject_line;
        if (!email_body || !subject_line) {
          showNotification({
            title: "Error",
            message: "Something went wrong with generation, please try again.",
            icon: <IconX radius="sm" />,
          });
        }

        const subjectLineSpamWords = subject_line.spam_detection_results?.spam_words || [];
        let subjectLineCompletion = subject_line.completion;
        if (subjectLineSpamWords && subjectLineSpamWords.length > 0) {
          subjectLineSpamWords.forEach((badWord: string) => {
            const spannedWord = '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' + badWord + "</span>";
            subjectLineCompletion = subjectLineCompletion.replace(new RegExp(badWord, "g"), spannedWord);
          });
        }

        const emailBodySpamWords = email_body.spam_detection_results?.spam_words || [];
        let emailBodyCompletion = email_body.completion;
        if (emailBodySpamWords && emailBodySpamWords.length > 0) {
          emailBodySpamWords.forEach((badWord: string) => {
            const spannedWord = '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' + badWord + "</span>";
            emailBodyCompletion = emailBodyCompletion.replace(new RegExp(badWord, "g"), spannedWord);
          });
        }

        return {
          subject_line: subjectLineCompletion as string,
          subject_spam: subject_line.spam_detection_results as SpamScoreResults,
          body: emailBodyCompletion as string,
          body_spam: email_body.spam_detection_results as SpamScoreResults,
        };
      }
    } catch (error) {
      // Must have been aborted. No action needed
      console.log("Generation aborted", error);
    }

    return {
      subject_line: null,
      subject_spam: null,
      body: null,
      body_spam: null,
    };
  };

  const generateFollowUpEmail = async (prospectId: number, currentTab: string, template: EmailSequenceStep) => {
    if (currentTab === "PROSPECTED") {
      return {
        subject_line: null,
        subject_spam: null,
        body: null,
        body_spam: null,
      };
    }

    try {
      const response = await postGenerateFollowupEmail(userToken, prospectId, null, template.step.id, null, null);
      if (response.status === "success") {
        const email_body = response.data.email_body;
        if (!email_body) {
          showNotification({
            title: "Error",
            message: "Something went wrong with generation, please try again.",
            icon: <IconX radius="sm" />,
          });
        }
        const emailBodySpamWords = email_body.spam_detection_results?.spam_words || [];
        let emailBodyCompletion = email_body.completion;
        if (emailBodySpamWords && emailBodySpamWords.length > 0) {
          emailBodySpamWords.forEach((badWord: string) => {
            const spannedWord = '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' + badWord + "</span>";
            emailBodyCompletion = emailBodyCompletion.replace(new RegExp(badWord, "g"), spannedWord);
          });
        }

        return {
          subject_line: null,
          subject_spam: null,
          body: emailBodyCompletion as string,
          body_spam: email_body.spam_detection_results as SpamScoreResults,
        };
      }
    } catch (error) {
      // Must have been aborted. No action needed
      console.log("Generation aborted", error);
    }

    return {
      subject_line: null,
      subject_spam: null,
      body: null,
      body_spam: null,
    };
  };

  if (currentProject === null) {
    return <></>;
  }

  const [opened, setOpened] = useState(false);
  const [state, setState] = useState(false);
  const [voiceGenerate, setVoiceGenerate] = useState(false);
  const [changedTemplate, setChangedTemplate] = useState('');

  const handleGenerate = () => {
    setState(true);
  };

  const handleSave = (oldVersion: string, newVesion: string) => {
    setVoiceGenerate(true);

    fetch(API_URL + '/ml/add-few-shot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        client_archetype_id: currentProject.id,
        original_string: oldVersion,
        edited_string: newVesion,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
    })
    .catch(error => {
      console.error('Error:', error);
    }).finally(() => {
      setVoiceGenerate(false);
      fetchAssignedVoice();
      setState(false);
    }
    );

  };
  console.log("--------", userData);
  return (
    <Stack>

      {voiceBankOpen && (
        <Modal
          opened={voiceBankOpen}
          onClose={() => setVoiceBankOpen(false)}
          size="lg"
          padding="none"
          radius="md"
          style={{ zIndex: 9999 }}
        >
          <Paper radius="md" style={{ zIndex: 9999, padding: '20px' }}>
            <Flex justify="center" mb="md">
              <Text size="lg" weight={700}>
                Bank for <i>{aiVoices[Number(selectedVoice) - 1]?.name || 'Select Voice'}</i>
              </Text>
            </Flex>
            <ScrollArea style={{ height: 450, overflow: 'hidden', scrollbarWidth: 'none' }} className="hide-scrollbar" scrollHideDelay={0}>
              <Flex direction="column">
                {fewShots.map((shot, index) => (
                  <React.Fragment key={index}>
                    {shot.nuance.map((nuance, nuanceIndex) => (
                      <Flex key={nuanceIndex} direction="column" style={{ padding: '10px', borderRadius: '8px', backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                        <Flex direction="row" justify="space-between" align="center">
                          <Text ml="sm" style={{ fontWeight: 700, color: '#000', fontSize: '1rem' }}>{nuance}</Text>
                          <ActionIcon color="red" onClick={modifyFewShot(index,nuanceIndex)} variant="light">
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Flex>
                        <Divider />
                      </Flex>
                    ))}
                  </React.Fragment>
                ))}
              </Flex>
            </ScrollArea>
          </Paper>
        </Modal>
      )}

      <Box mt={"md"}>
        <Flex direction="column" gap="md">
          <Text color="gray.8" size={"md"} fw={700}>
            EXAMPLE EMAIL
          </Text>
          <Flex align="center" justify="space-between" gap="md">
            <ProspectSelect
              personaId={currentProject.id}
              onChange={(prospect) => {
                if (prospect) {
                  setProspectId(prospect.id);
                }
              }}
              selectedProspect={prospectId}
              autoSelect
              includeDrawer
            />
            <Flex align="center" justify="flex-end" gap="sm">
              <div
                className={`absolute bg-[#f6f8fa] right-0 rounded-md top-4 transition-all duration-300 z-[9999] `}
                style={{ transform: voiceGenerate ? "translateY(-10px) " : "translateY(45px)", filter: voiceGenerate ? "opacity(1)" : "opacity(0)" }}
              >
                <Flex
                  miw={260}
                  className="flex justify-start items-center"
                  gap={"sm"}
                  style={{ border: "1px solid #be4bdb", borderRadius: "4px" }}
                  px={"sm"}
                  py={8}
                >
                  <IconCheckbox size={"0.9rem"} color="#be4bdb" />
                  <Text size={"xs"}>{1} sample saved</Text>
                </Flex>
              </div>

              {currentProject?.is_ai_research_personalization_enabled && <div className={`${state && "absolute z-[9999] bg-[#f6f8fa] right-0 rounded-md"} flex flex-col`}>
                <Flex align="center" gap="sm">
                  <Select
                    label="Assign Voice"
                    mb="md"
                    onCreate={(query) => {
                      const createVoice = async () => {
                        try {
                          const response = await fetch(API_URL + '/ml/voices', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${userToken}`,
                            },
                            body: JSON.stringify({ name: query, archetype_id: currentProject.id }),
                          });
                          if (response.ok) {
                            const newVoice = await response.json();
                            const newVoiceItem = { value: newVoice.id, label: newVoice.name };
                            setAiVoices((prevVoices) => [
                              ...prevVoices,
                              {
                                client_id: newVoice.client_id,
                                client_sdr_created_by: newVoice.client_sdr_created_by,
                                id: newVoice.id,
                                name: newVoice.name,
                              },
                            ]);
                            setSelectedVoice(newVoice.id.toString());

                            // PUT the new voice ID to the campaign
                            const updateCampaignResponse = await fetch(API_URL + `/campaigns/${currentProject.id}/voice`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${userToken}`,
                              },
                              body: JSON.stringify({ voice_id: newVoice.id }),
                            });

                            if (!updateCampaignResponse.ok) {
                              console.error('Failed to update campaign with new voice');
                            }

                            refetch();
                            return newVoiceItem; // Return the new voice item
                          } else {
                            console.error('Failed to create voice');
                            return null;
                          }
                        } catch (error) {
                          console.error('Error creating voice:', error);
                          return null;
                        }
                      };

                      createVoice();
                      return { value: query, label: query }; // Return a placeholder value immediately
                    }}
                    ml="sm"
                    placeholder="Select voice"
                    searchable
                    creatable
                    getCreateLabel={(query) => `+ Create ${query}`}
                    data={[{ value: 'null', label: 'No Voice' }, ...aiVoices.map(voice => ({ value: voice.id.toString(), label: voice.name }))]}
                    value={selectedVoice?.toString()}
                    onChange={async (value) => {
                      if (value === 'null') {
                        setSelectedVoice(null);
                      } else {
                        setSelectedVoice(value);
                      }
                      try {
                        setLoadingBankData(true);
                        const [updateVoiceResponse, fewShotResponse] = await Promise.all([
                          fetch(API_URL + `/ml/voices`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${userToken}`,
                            },
                            body: JSON.stringify({ voice_id: value === 'null' ? null : value, archetype_id: currentProject.id }),
                          }),
                          fetch(API_URL + `/ml/few-shot`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${userToken}`,
                            },
                            body: JSON.stringify({ voice_id: value === 'null' ? null : value, client_archetype_id: currentProject.id })
                          })
                        ]);

                        setLoadingBankData(false);

                        if (!updateVoiceResponse.ok) {
                          console.error('Failed to update voice');
                        }

                        if (fewShotResponse.ok) {
                          const fewShotData = await fewShotResponse.json();
                          const decomposedFewShotData = fewShotData.map((item: { nuance: string; }) => ({
                            ...item,
                            nuance: JSON.parse(item.nuance)
                          }));
                          setFewShots(decomposedFewShotData);
                        } else {
                          console.error('Failed to fetch few-shot data');
                        }
                      } catch (error) {
                        console.error('Error updating voice or fetching few-shot data:', error);
                      }
                      refetch();
                    }}
                    miw={300}
                    rightSection={!loadingBankData && fewShots && fewShots.length > 0 && selectedVoice !== 'null' && <Button size="xs" onClick={() => setVoiceBankOpen(true)} color="blue" radius={"md"} style={{ transform: 'translateX(-50px)' }}>
                      Open Voice Bank
                    </Button>}
                    dropdownComponent="div"
                    withinPortal
                  />
                </Flex>
              </div>}
            </Flex>
          </Flex>
        </Flex>

        <Box>
          <Paper withBorder style={{ borderColor: "#228be6" }} radius={"sm"}>
            <Flex align={"center"} justify={"space-between"} px={"lg"} py={"sm"}>
              <Flex align={"center"} gap={4}>
                <IconMail size={"0.9rem"} color="#228be6" />
                <Text fw={500} color="gray" size={"xs"}>
                  Example Message #1:
                </Text>
                <Text fw={500} size={"xs"}>
                  {props?.template?.step?.title}
                </Text>
              </Flex>
              <Flex align={"center"} gap={4}>
                <Button onClick={() => {
                  refetch();
                  if (!opened) {
                    setOpened(true);
                  }
                }} size="xs" leftIcon={<IconRefresh size={"0.9rem"} />} color="grape" radius={"md"}>
                  Regenerate
                </Button>
                <ActionIcon onClick={() => setOpened(!opened)}>
                  {opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
                </ActionIcon>
              </Flex>
            </Flex>
            <Collapse in={opened}>
              <Divider color="gray" />
              <Paper className="relative">
                {state && <div className=" fixed w-screen h-screen top-0 left-0 z-[9000] bg-[#7d7d7d]/[60%]"></div>}

                <div className={`${state && !voiceGenerate && "absolute z-[9999] bg-[#f6f8fa] w-full left-0 rounded-md"}`}>
                  <div className="px-5">
                  <Text color="gray.6" fw={500} size="sm" mr="xs">
                </Text>
                  {!isFetching && <Text mt="xs" mb="xs" color="gray.8" fw={700} size="sm">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(data?.subject_line ?? ""),
                      }}
                    />
                  </Text>}
                    {state && (
                      <Flex
                        align={"center"}
                        gap={3}
                        bg={"#98a3b3"}
                        className="rounded-t-lg"
                        px={"sm"}
                        py={3}
                        justify={"end"}
                        w={"fit-content"}
                        ml={"auto"}
                        mt={"-xl"}
                      >
                        <IconInfoCircle size={"0.9rem"} color="white" />
                        <Text size={"sm"} color="white">
                          Edit the AI Generations to tailor to your voice.
                        </Text>
                      </Flex>
                    )}

                    {isFetching ? (
                      <Flex justify="center" align="center" style={{ height: '100px' }}>
                        <Loader color="grape" />
                      </Flex>
                    ) : (
                      <>
                        <div
                          contentEditable={currentProject?.is_ai_research_personalization_enabled && selectedVoice && selectedVoice !== 'null' ? true : undefined}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(data?.body?.replace(/(<br\s*\/?>\s*){2,}/g, '<br />')?.replace(/\n\s*\n/g, '\n') ?? ""),
                          }}
                          onInput={(e) => setChangedTemplate(e.currentTarget.innerHTML)}
                          style={{
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                            padding: "8px",
                            minHeight: "100px",
                            marginBottom: "16px",
                            whiteSpace: "pre-wrap",
                          }}
                          onClick={() => {currentProject?.is_ai_research_personalization_enabled && selectedVoice && selectedVoice !== 'null' && handleGenerate()}}
                        />
                        {state && (
                          <>
                            <Flex justify={"space-between"} mt={"sm"}>
                              <Button variant="outline" color="gray" onClick={() => setState(false)}>
                                Cancel
                              </Button>
                              <Button onClick={() => handleSave(data.body, changedTemplate)}>Save to voice memory</Button>
                            </Flex>
                            <Divider my={"lg"} />
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {isFetching && currentProject.is_ai_research_personalization_enabled && (
                    <Progress
                      mt="md"
                      size="xl"
                      radius="xl"
                      sections={sections}
                      animate
                    />
                  )}

                  {state && (
                    <Flex className="px-5 flex-col" gap={"sm"} mb={"sm"}>
                      <Flex gap={"sm"} align={"center"}>
                        <IconCpu size={"1.4rem"} color="#be4bdb" />
                        <Text fw={600} size={"sm"}>
                          Message DNA
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={50}>
                        <Text w={60} fw={400} color="gray" size={"sm"}>
                          Templates
                        </Text>
                        <Flex align={"center"} gap={"sm"} ml={16}>
                          <Badge radius={"xs"}>{props?.template?.step.title || ''}</Badge>
                          <Badge radius={"xs"}>{props?.subjectLine?.is_magic_subject_line ? 'magic subject line' : props?.subjectLine?.subject_line || ''}</Badge>
                        </Flex>
                      </Flex>
                      <Flex align={"start"} gap={50}>
                        <Text w={60} fw={400} color="gray" size={"sm"}>
                          Research
                        </Text>
                        <Box>
                          <List withPadding size={"sm"}>
                            <List.Item>8+ years of experience in industry</List.Item>
                            <List.Item>Been at Blackstone Valley Community Care for over half a decade.</List.Item>
                          </List>
                        </Box>
                      </Flex>
                    </Flex>
                  )}
                </div>
              </Paper>
            </Collapse>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
}

export const SubjectLineItem: React.FC<{
  subjectLine: SubjectLineTemplate;
  refetch: () => Promise<void>;
}> = ({ subjectLine, refetch }) => {
  console.log("subject line", subjectLine);
  const [manageSubjectLineOpened, { open: openManageSubject, close: closeManageSubject }] = useDisclosure();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [magicSubjectLineSimulatorOpened, setMagicSubjectLineSimulatorOpened] = useState(false);
  const [editedSubjectLine, setEditedSubjectLine] = React.useState(
    subjectLine.subject_line
  );

  useEffect(() => {
    setEditedSubjectLine(subjectLine.subject_line);
  }, [subjectLine]);

  // Edit Subject Line
  const triggerPatchEmailSubjectLineTemplate = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(userToken, subjectLine.id as number, editedSubjectLine, subjectLine.active);
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: "Success",
        message: "Successfully updated email subject line",
        color: "green",
      });

      await refetch();
    }

    setLoading(false);
    return;
  };

  // Toggle Subject Line Active / Inactive
  const triggerPatchEmailSubjectLineTemplateActive = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(userToken, subjectLine.id as number, subjectLine.subject_line, !subjectLine.active);
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
      return;
    } else {
      subjectLine.active = !subjectLine.active;
      showNotification({
        title: "Success",
        message: `Successfully ${subjectLine.active ? "deactivated" : "activated"} email subject line`,
        color: "green",
      });

      await refetch();
    }

    setLoading(false);
    return;
  };

  return (
    <Card
      mt="sm"
      shadow="xs"
      radius={"md"}
      py={10}
      mb={5}
      sx={(theme) => ({
        border: subjectLine.active ? "1px solid " + theme.colors.blue[4] : "1px solid transparent",
      })}
    >
      {magicSubjectLineSimulatorOpened && <SimulateMagicSubjectLineModal
        modalOpened={magicSubjectLineSimulatorOpened}
        openModal={() => console.log("Open Modal")}
        closeModal={() => {setMagicSubjectLineSimulatorOpened(false)}}
        backFunction={() => {setMagicSubjectLineSimulatorOpened(false)} }
        archetypeID={-1}
      />}
      <LoadingOverlay visible={loading} />
      <Flex direction={"column"} w={"100%"}>
        <Flex gap={"0.5rem"} mb={"0.5rem"} justify={"space-between"}>
          <Flex>
            <Tooltip label={`Prospects: ${subjectLine.times_accepted} / ${subjectLine.times_used}`} withArrow withinPortal>
              <Button variant={"white"} size="xs" color={"blue"} h="auto" fz={"0.75rem"} py={"0.125rem"} px={"0.25rem"} fw={"400"}>
                Acceptance: {subjectLine.times_used ? Math.floor(100 * (subjectLine.times_accepted / subjectLine.times_used)) : "-"}%
              </Button>
            </Tooltip>
          </Flex>

          <Flex wrap={"wrap"} gap={".5rem"} align={"center"}>
            <Tooltip label={subjectLine.times_used > 0 ? "Cannot edit subject line after it has been used" : "Edit subject line"} withinPortal withArrow>
              <ActionIcon
                size="sm"
                disabled={subjectLine.is_magic_subject_line || false}
                onClick={(event) => {
                  if (subjectLine.times_used > 0) {
                    event.preventDefault();
                    return;
                  }
                  setEditing(!editing);
                }}
              >
                <IconPencil size="1.0rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Coming Soon" withinPortal withArrow>
              <ActionIcon size="sm" disabled={editing}>
                <IconTrash size="1.0rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={subjectLine.active ? "Deactivate subject line" : "Activate subject line"} withinPortal withArrow>
              <div>
                <Switch
                  disabled={editing}
                  checked={subjectLine.active}
                  color={"blue"}
                  size="xs"
                  onChange={({ currentTarget: { checked } }) => {
                    triggerPatchEmailSubjectLineTemplateActive();
                  }}
                />
              </div>
            </Tooltip>
          </Flex>
          <ManageEmailSubjectLineTemplatesModal
            modalOpened={manageSubjectLineOpened}
            openModal={openManageSubject}
            closeModal={closeManageSubject}
            backFunction={() => {}}
            archetypeID={subjectLine.client_archetype_id}
          />
        </Flex>

        {editing ? (
          <>
            <TextInput
              value={editedSubjectLine}
              error={editedSubjectLine.length > 100 && "Subject line must be less than 100 characters"}
              rightSection={
                <Flex mr="150px">
                  <Button
                    size="sm"
                    h="24px"
                    mr="4px"
                    color="red"
                    onClick={() => {
                      setEditedSubjectLine(subjectLine.subject_line);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    h="24px"
                    color="green"
                    onClick={async () => {
                      await triggerPatchEmailSubjectLineTemplate();
                      setEditing(false);
                    }}
                    disabled={editedSubjectLine === subjectLine.subject_line || editedSubjectLine.length === 0 || editedSubjectLine.length > 120}
                  >
                    Save
                  </Button>
                </Flex>
              }
              onChange={(e) => {
                setEditedSubjectLine(e.currentTarget.value);
              }}
            />
            {(editedSubjectLine.includes("[[") || editedSubjectLine.includes("{{")) && (
              <Text color="yellow.7" size="xs" fw="bold" mt="xs">
                Warning: AI generations may cause the subject line length to exceed 100 characters.
              </Text>
            )}
          </>
        ) : (
          <Text fw={"400"} fz={"0.9rem"} color={"gray.8"}>
            {subjectLine.is_magic_subject_line ? (
              <Flex justify="space-between" align="center">
                <span
                  style={{
                    background: "linear-gradient(135deg, #00f, #32CD32, #00f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Magic Subject Line
                </span>
                {!window.location.href.includes('/setup/') && ( 
                  // hide simulate button in setup. only show it in sequence buildah
                  <Button
                    size="xs"
                    color='grape'
                    onClick={() => {
                      setMagicSubjectLineSimulatorOpened(true);
                    }}
                  >
                    Simulate
                  </Button>
                )}
              </Flex>
            ) : (
              editedSubjectLine
            )}
          </Text>
        )}
      </Flex>
    </Card>
  );
};

type SpamScore = {
  spam_words: string[];
  read_minutes: number;
  spam_word_score: number;
  read_minutes_score: number;
  total_score: number;
};

export const EmailBodyItem: React.FC<{
  template: EmailSequenceStep;
  refetch: () => Promise<void>;
  hideHeader?: boolean;
  spamScore?: SpamScore | null;
}> = ({ template, refetch, hideHeader, spamScore }) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) return <></>;

  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editingPersonalization, setEditingPersonalization] = React.useState(false);

  // Span magic on the template.template
  // Replace all [[ and ]] with span tags
  let templateBody = template.step.template || "";

  const [sequence, _setSequence] = React.useState<string>(templateBody);
  const sequenceRichRaw = React.useRef<JSONContent | string>(template.step.template || "");

  const [opened, { open, close }] = useDisclosure(false);
  const [currentBlocklistItems, setCurrentBlocklistItems] = React.useState<any[]>([]);

  const [displayPersonalization, refreshPersonalization] = useRefresh();

  const { data: researchPointTypes } = useQuery({
    queryKey: [`query-get-research-point-types`],
    queryFn: async () => {
      const response = await getResearchPointTypes(userToken);
      return response.status === "success" ? (response.data as ResearchPointType[]) : [];
    },
    refetchOnWindowFocus: false,
  });

  const triggerPatchEmailBodyTemplate = async () => {
    setLoading(true);

    const result = await patchSequenceStep(
      userToken,
      template.step.id,
      template.step.overall_status,
      template.step.title,
      sequence,
      template.step.bumped_count,
      template.step.default
    );
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: "Success",
        message: "Successfully updated email body",
        color: "green",
      });

      await refetch();
    }

    setLoading(false);
  };

  const triggerToggleEmailBodyTemplateInactive = async () => {
    setLoading(true);

    const result = await postSequenceStepDeactivate(userToken, template.step.id);
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: "Success",
        message: `Successfully ${template.step.default ? "deactivated" : "activated"} email body`,
        color: "green",
      });

      await refetch();
    }

    setLoading(false);
  };

  const triggerToggleEmailBodyTemplateActive = async () => {
    setLoading(true);

    const result = await postSequenceStepActivate(userToken, template.step.id);
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: "Success",
        message: `Successfully ${template.step.default ? "deactivated" : "activated"} email body`,
        color: "green",
      });

      await refetch();
    }

    setLoading(false);
  };

  useEffect(() => {
    setEditing(false);
    _setSequence(templateBody);
    sequenceRichRaw.current = template.step.template || "";
  }, [template]);

  const theme = useMantineTheme();
  const formattedSequence = useMemo(() => {
    let newText = sequence;

    if (newText) {
      newText.match(/\[\[(.*?)]\]/g)?.forEach((v) => {
        const content = v.replace("[[", "").replace("]]", "");

        // Add 'https://' to urls that don't have a 'https://'
        for (const word of content.trim().split(/\s/)) {
          if (isValidUrl(word) && !word.startsWith("https://")) {
            content.replace(word, "https://" + word);
          }
        }

        newText = newText?.replace(
          v,
          ReactDOMServer.renderToString(
            <Highlight
              span
              highlightStyles={(theme) => ({
                backgroundImage: theme.fn.linearGradient(45, theme.colors.cyan[5], theme.colors.indigo[5]),
                fontWeight: 700,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              })}
              highlight={`[[${content}]]`}
            >
              {`[[${content}]]`}
            </Highlight>
          )
        );
      });
    }

    return newText;
  }, [sequence]);

  const [previewSequence, setPreviewSequence] = useState(formattedSequence);
  useEffect(() => {
    // Clean the formatted sequence to remove any HTML elements
    const nonHTMLFormattedSequence = sequence.replace(/<[^>]*>/g, " ");

    setPreviewSequence(nonHTMLFormattedSequence);
  }, [formattedSequence]);

  return (
    <Flex w="100%" mb="sm">
      <LoadingOverlay visible={loading} />
      <Flex direction="column" w="100%">
        <Flex mb="sm" direction="row" w="100%" justify={"space-between"}>
          <Flex align="center">
            <>
              <Flex align="center">
                {displayPersonalization && (
                  <HoverCard width={280} shadow="md">
                    <HoverCard.Target>
                      <Badge
                        color="lime"
                        size="xs"
                        styles={{
                          root: {
                            textTransform: "initial",
                            cursor: "pointer",
                          },
                        }}
                        variant="outline"
                        leftSection={<IconSearch style={{ marginTop: "2px" }} size={"0.7rem"} />}
                        onClick={open}
                      >
                        <Text fw={700} span>
                          {researchPointTypes?.filter((p) => !template.step.transformer_blocklist.includes(p.name)).length}
                        </Text>{" "}
                        Research Points
                      </Badge>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <List>
                        {researchPointTypes
                          ?.filter((p) => !template.step.transformer_blocklist.includes(p.name))
                          .map((note, index) => (
                            <List.Item key={index}>
                              <Text fz="sm">{_.capitalize(note.name.replace(/_/g, " ")?.toLowerCase())}</Text>
                            </List.Item>
                          ))}
                      </List>
                    </HoverCard.Dropdown>
                  </HoverCard>
                )}

                <EmailSequenceStepAssets sequence_step_id={template.step.id} />

                <Flex ml="sm">
                  <SpamScorePopover subjectSpamScoreDetails={spamScore} bodySpamScoreDetails={spamScore} hideSubjectLineScore />
                </Flex>
              </Flex>
            </>
          </Flex>
          <Flex align="center">
            <Tooltip label={`Prospects: ${template.step.times_accepted || 0} / ${template.step.times_used || 0} `} withArrow withinPortal>
              <Text fz="sm" mr="md">
                Open %: <b>{template.step.times_used ? Math.floor(100 * (template.step.times_accepted / template.step.times_used)) : "-"}</b>
              </Text>
            </Tooltip>
            <Tooltip label={`Prospects: ${template.step.times_replied || 0} / ${template.step.times_used || 0}`} withArrow withinPortal>
              <Text fz="sm" mr="md">
                Reply %: <b>{template.step.times_used ? Math.floor(100 * (template.step.times_replied / template.step.times_used)) : "-"}</b>
              </Text>
            </Tooltip>
            <Tooltip label={template.step.active ? `Deactivate` : `Activate`} withinPortal withArrow>
              <div>
                <Switch
                  disabled={editing}
                  checked={template.step.active}
                  color={"blue"}
                  size="xs"
                  onChange={({ currentTarget: { checked } }) => {
                    if (checked) {
                      triggerToggleEmailBodyTemplateActive();
                    } else {
                      triggerToggleEmailBodyTemplateInactive();
                    }
                  }}
                />
              </div>
            </Tooltip>
          </Flex>
        </Flex>

        {editing ? (
          <>
            <Box>
              <DynamicRichTextArea
                height={400}
                onChange={(value, rawValue) => {
                  sequenceRichRaw.current = rawValue;
                  _setSequence(value);
                }}
                value={sequenceRichRaw.current}
                signifyCustomInsert={false}
                inserts={[
                  {
                    key: "first_name",
                    label: "First Name",
                    icon: <IconWritingSign stroke={1.5} size="0.9rem" />,
                    color: "blue",
                  },
                  {
                    key: "last_name",
                    label: "Last Name",
                    icon: <IconRobot stroke={2} size="0.9rem" />,
                    color: "red",
                  },
                  {
                    key: "company_name",
                    label: "Company Name",
                    icon: <IconDatabase stroke={2} size="0.9rem" />,
                    color: "teal",
                  },
                ]}
              />
            </Box>
            <Flex mt="sm" justify={"flex-end"}>
              <Button
                mr="sm"
                color="red"
                onClick={() => {
                  _setSequence(templateBody || "");
                  sequenceRichRaw.current = template.step.template || "";
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={async () => {
                  await triggerPatchEmailBodyTemplate();
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </Flex>
          </>
        ) : (
          <Box
            sx={() => ({
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              backgroundColor: "#F5F5F5",
            })}
            px="md"
            onClick={() => {
              setEditing(true);
            }}
          >
            <Text fz="sm" mih="150px" p="xs">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(formattedSequence),
                }}
              />
            </Text>
            <Flex h="0px" w="100%">
              <Button
                leftIcon={<IconEdit size="1.0rem" />}
                variant="outline"
                pos="relative"
                bottom="50px"
                left="88%"
                h="32px"
                onClick={() => {
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            </Flex>
          </Box>
        )}
      </Flex>
      <Modal
        opened={opened}
        onClose={() => {
          close();
        }}
        title="Authentication"
        size={640}
      >
        <PersonalizationSection
          title="Enabled Research Points"
          blocklist={template.step.transformer_blocklist ?? []}
          onItemsChange={async (items) => {
            // Update transformer blocklist
            setCurrentBlocklistItems(items);
          }}
        />

        <Button
          onClick={async () => {
            const result = await patchSequenceStep(
              userToken,
              template.step.id,
              template.step.overall_status,
              template.step.title,
              template.step.template,
              template.step.bumped_count,
              template.step.default,
              template.step.sequence_delay_days,
              currentBlocklistItems.filter((x) => !x.checked).map((x) => x.id)
            );
            if (result.status != "success") {
              showNotification({
                title: "Error",
                message: result.message,
                color: "red",
              });
              return;
            } else {
              showNotification({
                title: "Success",
                message: "Successfully updated research used",
                color: "green",
              });
            }

            refreshPersonalization();
            refetch();
            close();
          }}
        >
          Save
        </Button>
      </Modal>
    </Flex>
  );
};

export default NewDetailEmailSequencing;
