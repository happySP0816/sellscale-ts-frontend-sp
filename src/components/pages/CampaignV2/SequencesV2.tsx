import { currentProjectState } from "@atoms/personaAtoms";
import {
  campaignContactsState,
  emailSequenceState,
  emailSubjectLinesState,
  linkedinInitialMessageState,
  linkedinSequenceState,
  userDataState,
  userTokenState,
} from "@atoms/userAtoms";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  HoverCard,
  List,
  Loader,
  LoadingOverlay,
  SegmentedControl,
  Select,
  Stepper,
  Switch,
  Text,
  TextInput,
  Title,
  Tabs,
  useMantineTheme,
  ScrollArea,
  Stack,
  Paper,
  TabsValue,
  Accordion,
  Collapse,
  Divider,
  Progress,
  Modal,
  Textarea,
  Skeleton,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBooks,
  IconBrandLinkedin,
  IconBulb,
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconCpu,
  IconEdit,
  IconInfoCircle,
  IconMail,
  IconMailOpened,
  IconMicrophone,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  BumpFramework,
  CTA,
  DefaultVoices,
  EmailSequenceStep,
  EmailTemplate,
  PersonaOverview,
  ProspectShallow,
  ResearchPointType,
  SpamScoreResults,
  SubjectLineTemplate,
} from "src";
import {
  modals,
  openConfirmModal,
  openContextModal,
  openModal,
} from "@mantine/modals";
import {
  fetchCampaignContacts,
  fetchCampaignSequences,
  fetchCampaignStats,
} from "@utils/requests/campaignOverview";
import { IconFolderOpen, IconSparkles } from "@tabler/icons-react";
import {
  createLiConvoSim,
  generateInitialMessageForLiConvoSim,
  getLiConvoSim,
} from "@utils/requests/linkedinConvoSimulation";
import getResearchPointTypes, {
  getResearchPoint,
} from "@utils/requests/getResearchPointTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LiExampleInvitation,
  PersonalizationSection,
  ResearchPoint,
} from "@common/sequence/LinkedInSequenceSection";
import {
  getLiTemplates,
  updateLiTemplate,
} from "@utils/requests/linkedinTemplates";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import ModalSelector from "@common/library/ModalSelector";
import { ICPFitPillOnly } from "@common/pipeline/ICPFitAndReason";
import { generateBumpLiMessage } from "@utils/requests/generateBumpLiMessage";
import { linkedinSequence } from "./Sequences";
import VoiceSelect, { Voices } from "@common/library/VoiceSelect";
import { updateInitialBlocklist } from "@utils/requests/updatePersonaBlocklist";
import { CtaSection } from "@common/sequence/CtaSection";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import TextWithNewline from "@common/library/TextWithNewlines";
import DOMPurify from "dompurify";
import { showNotification } from "@mantine/notifications";
import useRefresh from "@common/library/use-refresh";
import InitialMessageTemplateSelector from "@common/sequence/InitialMessageTemplateSelector";
import LinkedinInitialMessageTemplate from "@common/sequence/LinkedinInitialMessageTemplate";
import { API_URL } from "@constants/data";
import {
  postGenerateFollowupEmail,
  postGenerateInitialEmail,
} from "@utils/requests/emailMessageGeneration";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { getEmailSubjectLineTemplates } from "@utils/requests/emailSubjectLines";
import {
  createEmailSequenceStep,
  getEmailSequenceSteps,
  patchSequenceStep,
} from "@utils/requests/emailSequencing";
import { EmailSequenceStepBuckets } from "@pages/EmailSequencingPage";
import React from "react";
import DetailEmailSequencing, {
  EmailBodyItem,
  SubjectLineItem,
} from "@pages/EmailSequencing/DetailEmailSequencing";
import EmailSequenceStepModal from "@modals/EmailSequenceStepModal";
import EmailTemplateLibraryModal from "@modals/EmailTemplateLibraryModal";
import postCopyEmailPoolEntry from "@utils/requests/postCopyEmailLibraryItem";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import Personalizers from "./Personalizers";
import { socket } from "../../App";
import { diffWords } from "diff";
import { getFreshCurrentProject } from "@auth/core";
import TrainVoice from "./TrainVoice";
import {
  createVoiceBuilderOnboarding,
  generateSamples,
} from "@utils/requests/voiceBuilder";
import { STARTING_INSTRUCTIONS } from "@modals/VoiceBuilderModal";

interface Templates {
  active: boolean;
  additional_instructions: string;
  client_archetype_archetype: string;
  client_archetype_id: number;
  client_sdr_id: number;
  id: number;
  message: string;
  research_points: any[]; // Replace 'any' with a more specific type if known
  sellscale_generated: boolean;
  times_accepted: number;
  times_used: number;
  title: string;
}

export const SequencesV2 = React.forwardRef((props: any, ref) => {
  const {
    checkCanToggleEmail,
    togglePersonaChannel,
    statsData,
    checkCanToggleLinkedin,
    updateConnectionType,
  } = props;
  const params = useParams();
  const userToken = useRecoilValue(userTokenState);

  const showComponent = props.showComponent;

  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const theme = useMantineTheme();
  const [campaignContacts, setCampaignContacts] = useRecoilState(
    campaignContactsState
  );

  // View Tab
  const [viewTab, setViewTab] = useState<string>("linkedin");

  // Edit Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Prospects
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectShallow | null>(null);
  const [selectedProspectIndex, setSelectedProspectIndex] = useState(0);

  // Sequences
  const [loadingSequences, setLoadingSequences] = useState(true);
  const [
    emailSequenceGenerationInProgress,
    setEmailSequenceGenerationInProgress,
  ] = useState(false);

  const [linkedinInitialMessageViewing, setLinkedinInitialMessageViewing] =
    useState<any>(0);

  const [
    linkedinSequenceGenerationInProgress,
    setLinkedinSequenceGenerationInProgress,
  ] = useState(false);

  const [sequences, setSequences] = useState<any[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(-1);

  // Step number:
  // -1 is initial message
  // starting from 0 we use the bump count
  const [stepNumber, setStepNumber] = useState<number>(0);
  const [emailTab, setEmailTab] = useState<string | null>(null);

  // Moving message generation into the sequences tab
  const [linkedinSequenceData, setLinkedinSequenceData] = useRecoilState(
    linkedinSequenceState
  );
  const [emailSequenceData, setEmailSequenceData] =
    useRecoilState(emailSequenceState);

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);

  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any>(
    {}
  );

  const [linkedinInitialMessageData, setLinkedinInitialMessageData] =
    useRecoilState(linkedinInitialMessageState);

  const triggerProjectRefresh = async function () {
    const project = await getFreshCurrentProject(
      userToken,
      params?.id ? +params?.id : -1
    );

    setCurrentProject(project);
  };

  const [triggerGenerate, setTriggerGenerate] = useState(0);

  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState<
    SubjectLineTemplate[]
  >(emailSubjectLinesState);

  useEffect(() => {
    if (props.forcedCampaignId) {
      refetchSequenceData(props.forcedCampaignId);

      (async (campaignId: number) => {
        const project = await getFreshCurrentProject(userToken, campaignId);
        setCurrentProject(project);

        const initialContacts = await fetchCampaignContacts(
          userToken,
          campaignId,
          0,
          10,
          "",
          false
        );
        setCampaignContacts(
          Array.from(new Set(initialContacts.sample_contacts))
        );
      })(props.forcedCampaignId);
    }
  }, [props.forcedCampaignId]);

  const { data: templates, isFetching: isFetchingTemplates } = useQuery({
    queryKey: [`query-get-li-templates`],
    queryFn: async () => {
      const response = await getLiTemplates(userToken, currentProject!.id);

      return response.status === "success"
        ? (response.data as Templates[])
        : [];
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject && !!currentProject.template_mode,
  });

  // Default on a sequence tab
  useEffect(() => {
    setViewTab(
      emailSequenceData && emailSequenceData.length > 0
        ? "email"
        : linkedinSequenceData && linkedinSequenceData.length > 0
        ? "linkedin"
        : "email"
    );
  }, [linkedinSequenceData, emailSequenceData]);

  // Load Sequence Data
  useEffect(() => {
    if (currentProject && currentProject.id === (params.id ? +params.id : -1)) {
      refetchSequenceData(currentProject?.id);
    }
  }, [currentProject?.id]);

  // Load selected Prospect
  useEffect(() => {
    if (campaignContacts && campaignContacts.length > 0) {
      setSelectedProspect(
        campaignContacts[selectedProspectIndex] as ProspectShallow
      );
      setProspectsLoading(false);
    }
  }, [campaignContacts, selectedProspectIndex]);

  useEffect(() => {
    if (selectedTemplateId === -1 && templates && templates[0]) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates]);

  useEffect(() => {
    if (emailSequenceData && Array.isArray(emailSequenceData)) {
      if (stepNumber || stepNumber >= 0) {
        if (emailSequenceData[stepNumber] && emailSequenceData[stepNumber][0]) {
          setEmailTab(emailSequenceData[stepNumber][0].overall_status ?? null);
        }
      }
    }
  }, [stepNumber, emailSequenceData]);

  const { data, refetch } = useQuery({
    queryKey: [`query-get-bump-frameworks`, currentProject?.id],
    queryFn: async () => {
      if (!currentProject) return [];
      const result = await getBumpFrameworks(
        userToken,
        ["ACCEPTED", "BUMPED"],
        [],
        [currentProject?.id],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
      if (result.status !== "success") return [];
      return result.data.bump_frameworks as BumpFramework[];
    },
  });

  const emailSteps = useMemo(() => {
    if (emailSequenceData && Array.isArray(emailSequenceData)) {
      return (
        <Stepper
          active={stepNumber}
          onStepClick={(number) => {
            setStepNumber(number);
            setTriggerGenerate(number);
          }}
          orientation="vertical"
          styles={() => ({
            separator: {
              borderColor: theme.colors.gray[4],
            },
            stepCompletedIcon: {
              backgroundColor: "transparent",
            },
            color: "transparent",
            backgroundColor: "transparent",
          })}
          size={"xs"}
          style={{
            minWidth: "fit-content",
            minHeight: "100%",
            marginTop: "8px",
            padding: "auto",
          }}
        >
          {emailSequenceData.map((item, index) => {
            return (
              <Stepper.Step
                key={index}
                style={{ backgroundColor: "transparent" }}
              />
            );
          })}
        </Stepper>
      );
    } else {
      return <></>;
    }
  }, [emailSequenceData, stepNumber]);

  const linkedinSteps = useMemo(() => {
    if (linkedinSequenceData && Array.isArray(linkedinSequenceData)) {
      return (
        <Stepper
          active={stepNumber}
          onStepClick={(number) => {
            setStepNumber(number);
            setTriggerGenerate(number);
          }}
          orientation="vertical"
          styles={() => ({
            separator: {
              borderColor: theme.colors.gray[4],
            },
            stepCompletedIcon: {
              backgroundColor: "transparent",
            },
            color: "transparent",
            backgroundColor: "transparent",
          })}
          size={"xs"}
          style={{
            minWidth: "fit-content",
            minHeight: "100%",
            marginTop: "8px",
            padding: "auto",
          }}
        >
          <Stepper.Step style={{ backgroundColor: "transparent" }} />
          {linkedinSequenceData.map((item, index) => {
            const lSequence = item[0];

            return (
              <Stepper.Step
                key={index}
                style={{ backgroundColor: "transparent" }}
              />
            );
          })}
        </Stepper>
      );
    } else {
      return <></>;
    }
  }, [linkedinSequenceData, stepNumber]);

  const refetchSequenceData = async (clientArchetypeId: number) => {
    setLoadingSequences(true);
    const sequencesPromise = fetchCampaignSequences(
      userToken,
      clientArchetypeId
    );
    sequencesPromise
      .then((sequencesData) => {
        setEmailSequenceGenerationInProgress(
          sequencesData.email_seq_generation_in_progress
        );
        setLinkedinSequenceGenerationInProgress(
          sequencesData.li_seq_generation_in_progress
        );
        setLinkedinInitialMessageData(sequencesData.initial_message_templates);
        setEmailSubjectLines(sequencesData.email_subject_lines);
        setLinkedinInitialMessageViewing(
          sequencesData.initial_message_templates?.[0]?.title
        );
        const groupSequencesByBumpedCount = (sequences: any[]) =>
          sequences.reduce((acc: any, sequence: any) => {
            let bumpedCount = sequence.bumped_count || 0;
            const statusAdjustment =
              sequence.overall_status === "PROSPECTED"
                ? 0
                : sequence.overall_status === "ACCEPTED"
                ? 10
                : sequence.overall_status === "BUMPED"
                ? 20
                : 0;
            bumpedCount += statusAdjustment;
            if (!acc[bumpedCount]) acc[bumpedCount] = [];
            acc[bumpedCount].push(sequence);
            return acc;
          }, {});

        const orderGroupedSequences = (groupedSequences: any) =>
          Object.keys(groupedSequences)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => groupedSequences[key]);

        const handleSequences = (sequences: any[], type: string) => {
          const groupedSequences = groupSequencesByBumpedCount(sequences);
          const orderedGroupedSequences =
            orderGroupedSequences(groupedSequences);
          setSequences(orderedGroupedSequences);
          // setType(type);
          if (type === "linkedin") {
            setLinkedinSequenceData(orderedGroupedSequences);
          } else {
            setEmailSequenceData(orderedGroupedSequences);
          }
        };

        if (
          sequencesData.linkedin_sequence.length > 0 &&
          sequencesData.email_sequence.length === 0
        ) {
          handleSequences(sequencesData.linkedin_sequence, "linkedin");
        } else if (
          sequencesData.email_sequence.length > 0 &&
          sequencesData.linkedin_sequence.length === 0
        ) {
          handleSequences(sequencesData.email_sequence, "email");
        } else if (
          sequencesData.email_sequence.length > 0 &&
          sequencesData.linkedin_sequence.length > 0
        ) {
          handleSequences(sequencesData.email_sequence, "email");
          setLinkedinSequenceData(
            orderGroupedSequences(
              groupSequencesByBumpedCount(sequencesData.linkedin_sequence)
            )
          );
        } else {
          setSequences([]);
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

  // prospect selection onchange handler
  const prospectOnChangeHandler = function (
    prospect: ProspectShallow | undefined
  ) {
    if (prospect) {
      const foundProspect = campaignContacts?.find((p) => p.id === prospect.id);

      if (foundProspect) {
        const index =
          campaignContacts?.findIndex((p) => p.id === foundProspect.id) || 0;
        setSelectedProspectIndex(index);
      }
    }
  };

  const onRegenerate = async () => {
    if (selectedProspect) {
      setTriggerGenerate(stepNumber);
      // await getIntroMessage(selectedProspect.id, true, selectedTemplateId);
    }
  };

  if (showComponent === false) {
    return <></>;
  }

  // We also want to move voice related stuff into this Sequence Widget

  return (
    <Card
      shadow={"sm"}
      padding={"xs"}
      radius={"md"}
      withBorder
      style={{ maxWidth: "100%", minWidth: "100%", minHeight: "300px" }}
    >
      <Card.Section withBorder inheritPadding py={"xs"}>
        <Group position="apart">
          <Text fw={600} size={16} color="#37414E">
            Sequences
          </Text>
          <Flex align={"center"} gap={"8px"}>
            <SegmentedControl
              value={viewTab}
              onChange={(value: any) => {
                setViewTab(value);
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
                    <Center style={{ gap: 4 }}>
                      <IconMailOpened
                        size={"1.2rem"}
                        fill="orange"
                        color="white"
                      />
                      <Text fw={500}>Email</Text>
                    </Center>
                  ),
                  disabled:
                    !emailSequenceData || !Array.isArray(emailSequenceData),
                },
                {
                  value: "linkedin",
                  label: (
                    <Center style={{ gap: 4 }}>
                      <IconBrandLinkedin
                        size={"1.4rem"}
                        fill="#3B85EF"
                        color="white"
                      />
                      <Text fw={500}>Linkedin</Text>
                    </Center>
                  ),
                  disabled:
                    !linkedinSequenceData ||
                    !Array.isArray(linkedinSequenceData),
                },
              ]}
            />
            <Button
              leftIcon={<IconPlus size={"0.9rem"} />}
              onClick={() => {
                openContextModal({
                  modal: "campaignTemplateEditModal",
                  withCloseButton: false,
                  // title: <Title order={3}>Sequence Builder</Title>,
                  innerProps: {
                    sequenceType: viewTab,
                    linkedinInitialMessages,
                    emailSubjectLines,
                    setEmailSubjectLines,
                    // linkedinSequenceData,
                    // emailSequenceData,
                    campaignId: currentProject?.id,
                    createTemplateBuilder,
                    refetchSequenceData,
                    setCreateTemplateBuilder,
                    // setSequences,
                    prospectId: selectedProspect?.id,
                    checkCanToggleEmail: checkCanToggleEmail,
                    togglePersonaChannel: togglePersonaChannel,
                    statsData: statsData,
                    checkCanToggleLinkedin: checkCanToggleLinkedin,
                    updateConnectionType: updateConnectionType,
                    currentStepNum: 0,
                  },
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "1100px",
                    },
                  },
                  zIndex: 20,
                  onClose: () => {
                    const clientArchetypeId = Number(currentProject?.id);
                    refetchSequenceData(clientArchetypeId);
                  },
                });
              }}
            >
              Add
            </Button>
            <Button
              variant="outline"
              radius="md"
              sx={{
                padding: "4px 12px",
                borderColor: theme.colors.blue[4],
                "&:hover": {
                  borderColor: theme.colors.blue[6],
                },
              }}
            >
              <Group spacing="xs" align="center">
                <span
                  style={{
                    color: !isEditing
                      ? theme.colors.blue[6]
                      : theme.colors.gray[7],
                    opacity: !isEditing ? 1 : 0.5,
                  }}
                >
                  Simulate
                </span>
                <Switch
                  size="md"
                  checked={isEditing}
                  onChange={(event) =>
                    setIsEditing(event.currentTarget.checked)
                  }
                  color="blue"
                />
                <span
                  style={{
                    color: isEditing
                      ? theme.colors.blue[6]
                      : theme.colors.gray[7],
                    opacity: isEditing ? 1 : 0.5,
                  }}
                >
                  Edit
                </span>
              </Group>
            </Button>
          </Flex>
        </Group>
      </Card.Section>
      {(!emailSequenceData ||
        !Array.isArray(emailSequenceData) ||
        emailSequenceData.length === 0) &&
      (!linkedinSequenceData ||
        !Array.isArray(linkedinSequenceData) ||
        linkedinSequenceData.length === 0) ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          m="auto"
          mt="sm"
        >
          <Skeleton height={30} radius="xl" width="80%" />
          <Skeleton height={20} radius="xl" width="60%" mt="sm" />
          <Skeleton height={20} radius="xl" width="60%" mt="sm" />
          <Flex align="center" gap="sm" mt="sm">
            <Loader color="gray" variant="dots" size="md" />
            <Text color="gray" size="md" className="loading-animation">
              No Sequences or adding Sequences. Please check back later.
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Card padding={"none"} radius={"md"} mt={"12px"}>
          <Flex gap={"8px"} my={"auto"} pos={"relative"}>
            <LoadingOverlay visible={loadingSequences} zIndex={5} />
            {/* This will have a steps side bar and the main one. The main one will render either LinkedinCTA, LinkedinTemplate, EmailTemplate */}
            <Card
              p="xs"
              py="md"
              radius={"md"}
              withBorder
              style={{
                minHeight: "100%",
                minWidth: "fit-content",
                maxWidth: "fit-content",
              }}
            >
              <Card.Section inheritPadding>
                <Text align={"center"} size={"xs"}>
                  Steps:
                </Text>
              </Card.Section>
              {viewTab === "linkedin" ? linkedinSteps : emailSteps}
            </Card>
            {isEditing ? (
              <>
                {stepNumber === 0 &&
                  viewTab === "linkedin" &&
                  !currentProject?.template_mode && (
                    <LinkedinIntroEditSectionCTA
                      currentProject={currentProject ?? undefined}
                      userToken={userToken}
                      prospectId={selectedProspect?.id}
                      triggerProjectRefresh={triggerProjectRefresh}
                    />
                  )}
                {stepNumber === 0 &&
                  viewTab === "linkedin" &&
                  currentProject?.template_mode && (
                    <TemplateSectionV2
                      onFoundTemplate={setSelectedTemplateId}
                    />
                  )}
                {stepNumber !== 0 && viewTab === "linkedin" && (
                  <LinkedinBumpEditSection
                    bfs={
                      data
                        ? data.filter((b) => b.bumped_count === stepNumber - 1)
                        : []
                    }
                    userToken={userToken}
                  />
                )}
                {viewTab === "email" && (
                  <EmailSequencingV2
                    subjectLines={emailSubjectLines}
                    userToken={userToken}
                    currentProject={currentProject ?? undefined}
                    isEditing={isEditing}
                    prospectId={selectedProspect?.id ?? -1}
                    emailTab={emailTab ?? "PROSPECTED"}
                    stepNumber={stepNumber}
                    triggerGenerate={triggerGenerate}
                    setTriggerGenerate={setTriggerGenerate}
                    selectedProspectIndex={selectedProspectIndex}
                    setSelectedProspectIndex={setSelectedProspectIndex}
                    selectedProspect={selectedProspect ?? undefined}
                    campaignContacts={campaignContacts}
                    onRegenerate={onRegenerate}
                    prospectOnChangeHandler={prospectOnChangeHandler}
                  />
                )}
              </>
            ) : (
              <>
                {stepNumber === 0 && viewTab === "linkedin" && (
                  <LinkedinIntroSectionV2
                    prospectId={selectedProspect ? selectedProspect.id : -1}
                    userToken={userToken}
                    templates={templates ? templates : []}
                    currentProject={currentProject ?? undefined}
                    setSelectedTemplateId={setSelectedTemplateId}
                    selectedTemplateId={selectedTemplateId}
                    triggerGenerate={triggerGenerate}
                    setTriggerGenerate={setTriggerGenerate}
                    setLinkedinInitialMessages={setLinkedinInitialMessages}
                    triggerProjectRefresh={triggerProjectRefresh}
                    selectedProspectIndex={selectedProspectIndex}
                    setSelectedProspectIndex={setSelectedProspectIndex}
                    selectedProspect={selectedProspect ?? undefined}
                    campaignContacts={campaignContacts}
                    onRegenerate={onRegenerate}
                    prospectOnChangeHandler={prospectOnChangeHandler}
                  />
                )}
                {stepNumber !== 0 && viewTab === "linkedin" && (
                  <LinkedinSequenceSectionV2
                    triggerGenerate={triggerGenerate}
                    stepNumber={stepNumber}
                    sequence={
                      linkedinSequenceData.find(
                        (item) => item[0].bumped_count === stepNumber - 1
                      ) ?? []
                    }
                    userToken={userToken}
                    currentProject={currentProject ?? undefined}
                    prospectId={selectedProspect?.id ?? -1}
                    setTriggerGenerate={setTriggerGenerate}
                    bfs={
                      data
                        ? data.filter((b) => b.bumped_count === stepNumber - 1)
                        : []
                    }
                    selectedProspectIndex={selectedProspectIndex}
                    setSelectedProspectIndex={setSelectedProspectIndex}
                    selectedProspect={selectedProspect ?? undefined}
                    campaignContacts={campaignContacts}
                    onRegenerate={onRegenerate}
                    prospectOnChangeHandler={prospectOnChangeHandler}
                  />
                )}
                {viewTab === "email" && (
                  <EmailSequencingV2
                    subjectLines={emailSubjectLines}
                    userToken={userToken}
                    currentProject={currentProject ?? undefined}
                    isEditing={isEditing}
                    prospectId={selectedProspect?.id ?? -1}
                    emailTab={emailTab ?? "PROSPECTED"}
                    stepNumber={stepNumber}
                    triggerGenerate={triggerGenerate}
                    setTriggerGenerate={setTriggerGenerate}
                    selectedProspectIndex={selectedProspectIndex}
                    setSelectedProspectIndex={setSelectedProspectIndex}
                    selectedProspect={selectedProspect ?? undefined}
                    campaignContacts={campaignContacts}
                    onRegenerate={onRegenerate}
                    prospectOnChangeHandler={prospectOnChangeHandler}
                  />
                )}
              </>
            )}
          </Flex>
        </Card>
      )}
    </Card>
  );
});

type VoiceBuildingStage = "IDLE" | "BUILDING" | "COMPLETED";

const VoiceModal = function (props: {
  opened: boolean;
  open: () => void;
  close: () => void;
  currentProject?: PersonaOverview;
  userToken: string;
  numCtas: number;
  numProspects: number;
}) {
  const [defaultVoicesOptions, setDefaultVoicesOptions] = useState<
    DefaultVoices[]
  >([]);
  const [editMode, setEditMode] = useState<boolean>(false);

  const [selectedDefaultVoice, setSelelectedDefaultVoice] = useState<
    string | null
  >(null);

  const [voiceBuilderOnboardingId, setVoiceBuilderOnboardingId] = useState<
    number | null
  >(null);

  const [voiceBuildingStage, setVoiceBuildingStage] =
    useState<VoiceBuildingStage>("IDLE");

  const [selectedVoice, setSelectedVoice] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (voiceBuilderOnboardingId) {
      socket.on(`voice_builder_${voiceBuilderOnboardingId}`, (data) => {
        console.log("registering socket");
        onBoardingRefetch();
      });
    }

    return () => {
      socket.off(`voice_builder_`);
      socket.off(`voice_builder_${voiceBuilderOnboardingId}`);
    };
  }, [voiceBuilderOnboardingId]);

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

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-voices`, props.currentProject?.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/message_generation/stack_ranked_configurations` +
          (props.currentProject?.id
            ? `?archetype_id=${props.currentProject?.id}`
            : ``),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${props.userToken}`,
          },
        }
      );
      if (response.status === 401) {
        return [];
      }
      const res = await response.json();
      const voices = (res?.data.sort(
        (a: any, b: any) => b.priority - a.priority
      ) ?? []) as any[];

      setLoading(false);

      return voices as Voices[];
    },
    refetchOnWindowFocus: false,
  });

  const {
    data: onBoardingData,
    isFetching: onBoardingIsFetching,
    refetch: onBoardingRefetch,
  } = useQuery({
    queryKey: [`query-onboardings`, props.currentProject?.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/voice_builder/onboardings${
          props.currentProject?.id
            ? `?client_archetype_id=${props.currentProject?.id}`
            : ``
        }`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${props.userToken}`,
          },
        }
      );

      if (response.ok) {
        const responseJson = await response.json();

        return responseJson.data;
      }

      return [];
    },
  });

  const voices: Voices[] = data ?? [];

  const onboardings: any[] = onBoardingData ?? [];

  const updateActive = async (voiceId: number, active: boolean) => {
    return await fetch(
      `${API_URL}/message_generation/stack_ranked_configuration_tool/set_active`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configuration_id: voiceId,
          set_active: active,
        }),
      }
    );
  };

  const toggleActive = async function (voiceId: number, active: boolean) {
    setLoading(true);

    await updateActive(voiceId, active);

    refetch();
  };

  const addDefaultVoice = async function (defaultVoiceId: number) {
    setLoading(true);

    const response = await fetch(`${API_URL}/voice_builder/add_default_voice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${props.userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        default_voice_id: defaultVoiceId,
        archetype_id: props.currentProject?.id ?? -1,
      }),
    });

    if (response.ok) {
      refetch();

      showNotification({
        title: "Successfully created voice from default voices",
        message:
          "We have successfully created your voice from the default list of voices.",
        color: "green",
      });
    } else {
      showNotification({
        title: "Failed to create voice from default voices",
        message: "There was a problem creating a voice",
        color: "red",
      });
    }
  };

  const createVoiceOnboarding = async function () {
    if (!props.currentProject) return;

    setLoading(true);

    const response = await createVoiceBuilderOnboarding(
      props.userToken,
      "LINKEDIN",
      `${STARTING_INSTRUCTIONS}`,
      props.currentProject.id
    );

    if (response.status === "success") {
      setVoiceBuilderOnboardingId(response.data.id);
      setSelectedVoice(null);
      setVoiceBuildingStage("BUILDING");

      setEditMode(true);
      setLoading(false);

      generateMessageSamples(response.data.id);
    } else {
      showNotification({
        title: "Failed to create voice onboarding",
        message:
          "We have failed to start the voice onboarding process. Try again later.",
        color: "red",
      });
    }

    onBoardingRefetch();
  };

  const generateMessageSamples = async function (voiceId: number) {
    const messageResponse = await generateSamples(props.userToken, voiceId, 7);

    if (messageResponse.status === "success") {
      showNotification({
        title: "Started Samples creation for voices",
        message:
          "We have begin initiating the samples generation process. Please do not leave the page",
        color: "blue",
      });

      setLoading(false);
    } else {
      showNotification({
        title: "Failed to generate samples for Onboarding",
        message:
          "We have failed to generate samples for Onboarding. Try again later.",
        color: "red",
      });
    }
  };

  return (
    <>
      <Button
        leftIcon={
          voices.length === 0 || !voices.find((item) => item.active) ? (
            <IconMicrophone size={"1rem"} />
          ) : (
            <IconPencil size={"1rem"} />
          )
        }
        size="xs"
        onClick={() => {
          // navigateToPage(navigate, `/train_voice`);
          props.open();
        }}
        disabled={props.numCtas === 0}
      >
        {props.numCtas === 0
          ? "Create CTAs to generate voices"
          : voices.find((item) => item.active)?.name ?? "Train your Voice"}
      </Button>

      <Modal
        opened={props.opened}
        size={editMode ? "2000px" : "lg"}
        centered
        onClose={props.close}
        withCloseButton={false}
        styles={{
          body: {
            height: "1000px",
          },
        }}
      >
        {editMode ? (
          <TrainVoice
            close={() => setEditMode(false)}
            selectedVoice={selectedVoice ?? undefined}
            voiceBuilderOnboardingId={voiceBuilderOnboardingId ?? undefined}
            userToken={props.userToken}
            voices={voices}
            currentProject={props.currentProject}
            numProspects={props.numProspects}
          />
        ) : (
          <>
            <Flex align={"center"} w={"100%"} justify={"space_between"}>
              <Flex align={"center"} gap={"sm"} w={"100%"}>
                <IconMicrophone size={"1rem"} color="#228be6" />
                <Text fw={500}>Select voice</Text>
              </Flex>
              <Flex gap={"md"} align={"center"}>
                <Button
                  leftIcon={<IconPlus size={"1rem"} />}
                  onClick={async () => await createVoiceOnboarding()}
                >
                  {loading ? <Loader size={"xs"} /> : "New Voice"}
                </Button>
                <ActionIcon
                  radius={"xl"}
                  size={"lg"}
                  variant="outline"
                  color="gray"
                  onClick={props.close}
                >
                  <IconX size={"1.2rem"} />
                </ActionIcon>
              </Flex>
            </Flex>

            <Flex
              direction={"column"}
              gap={"8px"}
              style={{ maxHeight: "1000px" }}
            >
              <Text fw={600} mt={"8px"}>
                Use your own generated voices
              </Text>
              <ScrollArea style={{ position: "relative" }} h={"400px"}>
                <LoadingOverlay visible={loading} />
                {voices &&
                  voices.map((voice) => {
                    return (
                      <Paper
                        withBorder
                        radius={"sm"}
                        p={"sm"}
                        mt={"sm"}
                        style={{ position: "relative" }}
                        key={voice.id}
                      >
                        <Flex align={"center"} justify={"space-between"}>
                          <Flex align={"center"}>
                            <Text size={"sm"} fw={500}>
                              {voice.name}{" "}
                              <span className="text-gray-400">
                                {" "}
                                {voice.created_at.slice(
                                  0,
                                  voice.created_at.length - 13
                                )}
                              </span>
                            </Text>
                            <ActionIcon
                              color="blue"
                              onClick={() => {
                                setSelectedVoice(voice.id);
                                setVoiceBuilderOnboardingId(null);
                                setEditMode(true);
                              }}
                            >
                              <IconEdit size={"1rem"} />
                            </ActionIcon>
                          </Flex>
                          <Switch
                            checked={voice.active}
                            label={"active"}
                            onClick={(event) =>
                              toggleActive(
                                voice.id,
                                event.currentTarget.checked
                              )
                            }
                          />
                        </Flex>
                      </Paper>
                    );
                  })}

                {onboardings.filter(
                  (onboarding) => onboarding.ready || onboarding.ready === false
                ).length > 0 && (
                  <Text fw={500} mt={"8px"}>
                    Current Voice Onboarding
                  </Text>
                )}

                {onboardings &&
                  onboardings
                    .filter(
                      (onboarding) =>
                        onboarding.ready || onboarding.ready === false
                    )
                    .map((onboarding) => {
                      return (
                        <Paper
                          withBorder
                          radius={"sm"}
                          p={"sm"}
                          mt={"sm"}
                          style={{ position: "relative" }}
                          key={onboarding.id}
                        >
                          <Flex align={"center"} justify={"space-between"}>
                            <Flex align={"center"}>
                              <Text size={"sm"} fw={500}>
                                {"Onboarding: "}{" "}
                                <span className="text-gray-400">
                                  {" "}
                                  {onboarding.created_at.slice(
                                    0,
                                    onboarding.created_at.length - 13
                                  )}
                                </span>
                              </Text>
                              <ActionIcon
                                color="blue"
                                onClick={() => {
                                  setVoiceBuilderOnboardingId(onboarding.id);
                                  setEditMode(true);
                                }}
                              >
                                <IconEdit size={"1rem"} />
                              </ActionIcon>
                            </Flex>
                            {onboarding.ready ? (
                              <Badge
                                variant="outline"
                                size="md"
                                color={"green"}
                              >
                                Message samples generated
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                size="md"
                                color={"orange"}
                              >
                                Message Samples Generating
                              </Badge>
                            )}
                          </Flex>
                        </Paper>
                      );
                    })}
              </ScrollArea>
              <Divider mt={"24px"} mb={"8px"} />
              <Text fw={600}>Use one of SellScale's Pre-configured voices</Text>
              <Select
                data={defaultVoicesOptions.map((item) => {
                  return {
                    value: "" + item.id,
                    label: item.title,
                  };
                })}
                onChange={(value) => setSelelectedDefaultVoice(value)}
                value={selectedDefaultVoice}
                label={"Select Voices"}
                placeholder={"Select the voice to generate the campaign"}
              />
              {selectedDefaultVoice && (
                <Flex direction={"column"} align={"center"} gap={"8px"}>
                  <Text fw={600}>Description:</Text>
                  <Text fw={300}>{defaultVoicesOptions.find(i => i.id === +selectedDefaultVoice)?.description}</Text>
                  <Button
                    onClick={async () =>
                      await addDefaultVoice(+selectedDefaultVoice)
                    }
                  >
                    {loading ? <Loader /> : "Save Voice"}
                  </Button>
                </Flex>
              )}
            </Flex>
          </>
        )}
      </Modal>
    </>
  );
};

function EmailSequencingV2(props: {
  subjectLines: SubjectLineTemplate[];
  userToken: string;
  currentProject?: PersonaOverview;
  isEditing: boolean;
  prospectId: number;
  emailTab: string;
  stepNumber: number;
  triggerGenerate: number;
  setTriggerGenerate: React.Dispatch<React.SetStateAction<number>>;
  selectedProspectIndex: number;
  setSelectedProspectIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedProspect?: ProspectShallow;
  campaignContacts?: ProspectShallow[];
  onRegenerate: () => void;
  prospectOnChangeHandler: (prospect: ProspectShallow | undefined) => void;
}) {
  const [subjectLineTemplates, setSubjectLineTemplates] = useState<
    SubjectLineTemplate[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [
    addNewSequenceStepOpened,
    { open: openSequenceStep, close: closeSequenceStep },
  ] = useDisclosure();

  const triggerGetEmailSubjectLineTemplates = async () => {
    const result = await getEmailSubjectLineTemplates(
      props.userToken,
      props.currentProject?.id as number,
      false
    );
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }

    const templates = result.data
      .subject_line_templates as SubjectLineTemplate[];

    setSubjectLineTemplates(templates);
    return;
  };

  const sequenceBuckets = useRef<EmailSequenceStepBuckets>({
    PROSPECTED: {
      total: 0,
      templates: [],
    },
    ACCEPTED: {
      total: 0,
      templates: [],
    },
    BUMPED: {},
    ACTIVE_CONVO: {
      total: 0,
      templates: [],
    },
  } as EmailSequenceStepBuckets);
  const [sequenceBucketsState, setSequenceBucketsState] =
    useState<EmailSequenceStepBuckets>(sequenceBuckets.current);

  const triggerGetEmailSequenceSteps = async () => {
    setLoading(true);

    const result = await getEmailSequenceSteps(
      props.userToken,
      [],
      [],
      [props.currentProject?.id as number]
    );

    if (result.status !== "success") {
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Could not get sequence steps.",
        color: "red",
        autoClose: false,
      });
      return;
    }

    // Populate bump buckets
    let newsequenceBuckets = {
      PROSPECTED: {
        total: 0,
        templates: [],
      },
      ACCEPTED: {
        total: 0,
        templates: [],
      },
      BUMPED: {},
      ACTIVE_CONVO: {
        total: 0,
        templates: [],
      },
    } as EmailSequenceStepBuckets;
    for (const bumpFramework of result.data
      .sequence_steps as EmailSequenceStep[]) {
      const status = bumpFramework.step.overall_status;
      if (status === "PROSPECTED") {
        newsequenceBuckets.PROSPECTED.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.PROSPECTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.PROSPECTED.templates.push(bumpFramework);
        }
      } else if (status === "ACCEPTED") {
        newsequenceBuckets.ACCEPTED.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.ACCEPTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACCEPTED.templates.push(bumpFramework);
        }
      } else if (status === "BUMPED") {
        const bumpCount = bumpFramework.step.bumped_count as number;
        if (!(bumpCount in newsequenceBuckets.BUMPED)) {
          newsequenceBuckets.BUMPED[bumpCount] = {
            total: 0,
            templates: [],
          };
        }
        newsequenceBuckets.BUMPED[bumpCount].total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.BUMPED[bumpCount].templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.BUMPED[bumpCount].templates.push(bumpFramework);
        }
      } else if (status === "ACTIVE_CONVO") {
        newsequenceBuckets.ACTIVE_CONVO.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.ACTIVE_CONVO.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACTIVE_CONVO.templates.push(bumpFramework);
        }
      }
    }
    sequenceBuckets.current = newsequenceBuckets;
    setSequenceBucketsState(newsequenceBuckets);

    // BumpFrameworks have been updated, submit event to parent

    setLoading(false);
  };

  useEffect(() => {
    if (props.currentProject && props.currentProject?.id !== -1) {
      triggerGetEmailSubjectLineTemplates();
      triggerGetEmailSequenceSteps();
    }
  }, [props.currentProject?.id]);

  return (
    <NewUIEmailSequencingV2
      userToken={props.userToken}
      archetypeID={props.currentProject ? props.currentProject.id : -1}
      templateBuckets={sequenceBucketsState}
      subjectLines={subjectLineTemplates}
      refetch={async () => {
        await triggerGetEmailSequenceSteps();
        await triggerGetEmailSubjectLineTemplates();
      }}
      loading={loading}
      addNewSequenceStepOpened={addNewSequenceStepOpened}
      closeSequenceStep={closeSequenceStep}
      openSequenceStep={openSequenceStep}
      isEditing={props.isEditing}
      prospectId={props.prospectId}
      triggerGenerate={props.triggerGenerate}
      stepNumber={props.stepNumber}
      emailTab={props.emailTab}
      setTriggerGenerate={props.setTriggerGenerate}
      selectedProspectIndex={props.selectedProspectIndex}
      setSelectedProspectIndex={props.setSelectedProspectIndex}
      selectedProspect={props.selectedProspect ?? undefined}
      campaignContacts={props.campaignContacts}
      onRegenerate={props.onRegenerate}
      prospectOnChangeHandler={props.prospectOnChangeHandler}
      currentProject={props.currentProject ?? undefined}
    />
  );
}

const NewUIEmailSequencingV2 = function (props: {
  userToken: string;
  archetypeID: number;
  subjectLines: SubjectLineTemplate[];
  refetch: () => Promise<void>;
  loading: boolean;
  addNewSequenceStepOpened: boolean;
  closeSequenceStep: () => void;
  openSequenceStep: () => void;
  templateBuckets: EmailSequenceStepBuckets;
  isEditing: boolean;
  prospectId: number;
  triggerGenerate: number;
  stepNumber: number;
  emailTab: string;
  setTriggerGenerate: React.Dispatch<React.SetStateAction<number>>;
  selectedProspectIndex: number;
  setSelectedProspectIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedProspect?: ProspectShallow;
  campaignContacts?: ProspectShallow[];
  onRegenerate: () => void;
  prospectOnChangeHandler: (prospect: ProspectShallow | undefined) => void;
  currentProject?: PersonaOverview;
}) {
  const [selectedTemplates, setSelectedTemplates] = React.useState<
    EmailSequenceStep[]
  >(props.templateBuckets?.PROSPECTED.templates);

  const viewport = useRef<HTMLDivElement>(null);
  const scrollToTop = () => viewport.current!.scrollTo({ top: 0 });

  React.useEffect(() => {
    if (props.archetypeID === -1) return;
    // Reupdate the selected templates
    if (props.emailTab === "PROSPECTED") {
      setSelectedTemplates(props.templateBuckets?.PROSPECTED.templates);
    } else if (props.emailTab === "ACCEPTED") {
      setSelectedTemplates(props.templateBuckets?.ACCEPTED.templates);
    } else if (props.emailTab.includes("BUMPED-")) {
      const bumpCount = props.emailTab.split("-")[1];
      const bumpCountInt = parseInt(bumpCount);
      const sequenceBucket = props.templateBuckets?.BUMPED[bumpCountInt];
      if (sequenceBucket) {
        setSelectedTemplates(sequenceBucket.templates);
      }
    }
  }, [props.templateBuckets, props.archetypeID, props.emailTab]);

  return (
    <NewDetailEmailSequencingV2
      currentTab={props.emailTab}
      templates={selectedTemplates}
      subjectLines={props.subjectLines}
      refetch={async () => {
        await props.refetch();
      }}
      scrollToTop={scrollToTop}
      isEditing={props.isEditing}
      prospectId={props.prospectId}
      stepNumber={props.stepNumber}
      triggerGenerate={props.triggerGenerate}
      setTriggerGenerate={props.setTriggerGenerate}
      selectedProspectIndex={props.selectedProspectIndex}
      setSelectedProspectIndex={props.setSelectedProspectIndex}
      selectedProspect={props.selectedProspect ?? undefined}
      campaignContacts={props.campaignContacts}
      onRegenerate={props.onRegenerate}
      prospectOnChangeHandler={props.prospectOnChangeHandler}
      currentProject={props.currentProject ?? undefined}
    />
  );
};

const EmailPreviewHeaderV2 = function (props: {
  currentTab: string;
  template?: EmailSequenceStep;
  subjectLineText: string | null;
  setSubjectLineText: React.Dispatch<React.SetStateAction<string | null>>;
  subjectLine?: SubjectLineTemplate;
  prospectId: number;
  stepNumber: number;
  triggerGenerate: number;
  setTriggerGenerate: React.Dispatch<React.SetStateAction<number>>;
}) {
  const userToken = useRecoilValue(userTokenState);
  const subjectLineText = props.subjectLineText;
  const setSubjectLineText = props.setSubjectLineText;
  const currentProject = useRecoilValue(currentProjectState);
  const userData = useRecoilValue(userDataState);
  const [selectedVoice, setSelectedVoice] = useState<string | null>("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);
  const [aiVoices, setAiVoices] = useState<
    {
      client_id: number;
      client_sdr_created_by: number;
      id: number;
      name: string;
    }[]
  >([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(false);
  const [loadingBankData, setLoadingBankData] = useState<boolean>(false);
  const [newFewShot, setNewFewShot] = useState<string>("");
  const [savingFewShot, setSavingFewShot] = useState<boolean>(false);
  const [voiceBankOpen, setVoiceBankOpen] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<Number>(0);
  const roomIDref = useRef<string>("");
  const [canSave, setCanSave] = useState<boolean>(false);
  const [sections, setSections] = useState<
    { value: number; color: string; label: string }[]
  >([]);
  const [fewShots, setFewShots] = useState<
    {
      id: number;
      nuance: string[];
      edited_string: string;
      original_string: string;
    }[]
  >([]);

  useEffect(() => {
    const handleData = (data: any) => {
      if (data.step !== undefined && data.room_id === roomIDref.current) {
        setProgressStep(data.step);
        setSections((prevSections) => {
          const newSection = (() => {
            switch (data.step) {
              case 1:
                return {
                  value: 33.33,
                  color: "orange",
                  label: "Researching Prospect",
                };
              case 2:
                return {
                  value: 33.33,
                  color: "grape",
                  label: "Generating Email",
                };
              case 3:
                return {
                  value: 33.33,
                  color: "green",
                  label: "Generating Subject Line",
                };
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
    setSubjectLineText(null);
  }, [props.prospectId]);

  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const response = await fetch(API_URL + "/ml/voices/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const selectedVoiceData = data.find(
            (voice: any) => voice.id === selectedVoiceId
          );
          if (selectedVoiceData) {
            setSelectedVoice(selectedVoiceData.name);
          }

          setAiVoices(data);
        } else {
          console.error("Failed to fetch voices");
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchAssignedVoice();

    fetchVoices();
  }, [userToken]);

  useEffect(() => {
    if (props.triggerGenerate === props.stepNumber) {
      refetch();
      props.setTriggerGenerate(-1);
    }
  }, [props.triggerGenerate, props.stepNumber]);

  const fetchAssignedVoice = async () => {
    try {
      setLoadingBankData(true);
      const data = await fetchCampaignStats(
        userToken,
        currentProject?.id || -1
      );
      setSelectedVoiceId(data.ai_voice_id);
      if (data.ai_voice_id) {
        const response = await fetch(API_URL + "/ml/few-shot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ voice_id: data.ai_voice_id }),
        });
        if (response.ok) {
          const fewShotData = await response.json();
          setFewShots(fewShotData);
        } else {
          console.error("Failed to fetch few-shot data");
        }
      }
    } catch (error) {
      console.error("Error fetching assigned voice or few-shot data:", error);
    }
    setLoadingBankData(false);
  };

  const stripMarkdown = (text: string) => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
      .replace(/(\*|_)(.*?)\1/g, "$2") // italic
      .replace(/(~~)(.*?)\1/g, "$2") // strikethrough
      .replace(/`([^`]+)`/g, "$1") // inline code
      .replace(/!\[.*?\]\(.*?\)/g, "") // images
      .replace(/\[.*?\]\(.*?\)/g, "") // links
      .replace(/^\s*#\s+/gm, "") // headers
      .replace(/^\s*>\s+/gm, "") // blockquotes
      .replace(/^\s*[-*+]\s+/gm, "") // unordered lists
      .replace(/^\s*\d+\.\s+/gm, "") // ordered lists
      .replace(/^\s*---+\s*$/gm, "") // horizontal rules
      .replace(/^\s*```\s*[^`]*\s*```/gm, "") // code blocks
      .replace(/<\/?[^>]+(>|$)/g, ""); // HTML tags
  };

  const getHighlightedDiff = (original: string, edited: string) => {
    const strippedOriginal = stripMarkdown(original);
    const strippedEdited = stripMarkdown(edited);
    const diff = diffWords(strippedOriginal, strippedEdited);
    return diff.map((part: any, index: any) => {
      const color = part.added ? "green" : part.removed ? "red" : "black";
      const backgroundColor = part.added
        ? "#e6ffe6"
        : part.removed
        ? "#ffe6e6"
        : "transparent";
      return (
        <span key={index} style={{ color, backgroundColor }}>
          {part.value}
        </span>
      );
    });
  };
  const modifyFewShot = (index: number, nuanceIndex: number) => async () => {
    setFewShots((prevFewShots) => prevFewShots.filter((_, i) => i !== index));

    try {
      // delete it!
      const fewShot = fewShots[index];
      const response = await fetch(API_URL + "/ml/few-shot", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          id: fewShot.id,
        }),
      });
      if (!response.ok) {
        console.error("Failed to update few-shot data");
      }
    } catch (error) {
      console.error("Error updating few-shot data:", error);
    }
  };

  // Preview Email (Generation)

  const { data, isFetching, refetch } = useQuery<any>({
    queryKey: [
      `query-generate-email`,
      {
        prospectId: props.prospectId,
        currentTab: props.currentTab,
        template: props.template,
        subjectLine: props.subjectLine,
      },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { prospectId, currentTab, template, subjectLine }]: any =
        queryKey;

      if (!props.subjectLine?.id || !props.template?.step.id) {
        return null;
      }

      if (currentTab === "PROSPECTED") {
        //magic subject line generation will call the research endpoint.
        if (
          subjectLine.is_magic_subject_line ||
          currentProject?.is_ai_research_personalization_enabled
        ) {
          setCanSave(false);
          if (prospectId === 0) {
            return;
          }
          setSections([]);
          const room_id = Array.from(
            { length: 16 },
            () => Math.random().toString(36)[2]
          ).join("");
          roomIDref.current = room_id;
          socket.emit("join-room", {
            payload: { room_id: room_id },
          });
          const response = await fetch(
            API_URL + "/ml/simulate-magic-subject-line",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                sequence_id: props.template.step.id,
                prospect_id: Number(prospectId),
                archetype_id: currentProject?.id,
                subject_line_id: subjectLine.id,
                room_id,
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();

            return {
              subject_line: data.magic_subject_line,
              body: data.personalized_email,
              ai_research: data.ai_research,
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
        const previousSubjectLine = data?.subject_line;
        console.log("Previous subject line", previousSubjectLine);
        const followUpEmail = await generateFollowUpEmail(
          prospectId,
          currentTab,
          template
        );
        if (
          followUpEmail.subject_line === null &&
          previousSubjectLine !== null
        ) {
          followUpEmail.subject_line = previousSubjectLine;
        }
        return followUpEmail;
      }
    },
    refetchOnWindowFocus: false,
  });

  const generateInitialEmail = async (
    prospectId: number,
    currentTab: string,
    template: EmailSequenceStep,
    subjectLine: SubjectLineTemplate
  ) => {
    if (!prospectId || currentTab !== "PROSPECTED") {
      return {
        subject_line: null,
        subject_spam: null,
        body: null,
        body_spam: null,
      };
    }

    try {
      const response = await postGenerateInitialEmail(
        userToken,
        prospectId,
        template.step.id,
        null,
        subjectLine.id,
        null,
        null
      );
      if (response.status === "success") {
        const email_body = response.data.email_body;
        const subject_line = response.data.subject_line;
        setSubjectLineText(subject_line.completion as string);
        if (!email_body || !subject_line) {
          showNotification({
            title: "Error",
            message: "Something went wrong with generation, please try again.",
            icon: <IconX radius="sm" />,
          });
        }

        const subjectLineSpamWords =
          subject_line.spam_detection_results?.spam_words || [];
        let subjectLineCompletion = subject_line.completion;
        if (subjectLineSpamWords && subjectLineSpamWords.length > 0) {
          subjectLineSpamWords.forEach((badWord: string) => {
            const spannedWord =
              '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' +
              badWord +
              "</span>";
            subjectLineCompletion = subjectLineCompletion.replace(
              new RegExp(badWord, "g"),
              spannedWord
            );
          });
        }

        const emailBodySpamWords =
          email_body.spam_detection_results?.spam_words || [];
        let emailBodyCompletion = email_body.completion;
        if (emailBodySpamWords && emailBodySpamWords.length > 0) {
          emailBodySpamWords.forEach((badWord: string) => {
            const spannedWord =
              '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' +
              badWord +
              "</span>";
            emailBodyCompletion = emailBodyCompletion.replace(
              new RegExp(badWord, "g"),
              spannedWord
            );
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

  const generateFollowUpEmail = async (
    prospectId: number,
    currentTab: string,
    template: EmailSequenceStep
  ) => {
    if (currentTab === "PROSPECTED") {
      return {
        subject_line: null,
        subject_spam: null,
        body: null,
        body_spam: null,
      };
    }

    try {
      const response = await postGenerateFollowupEmail(
        userToken,
        prospectId,
        null,
        template.step.id,
        null,
        null
      );
      if (response.status === "success") {
        const email_body = response.data.email_body;
        if (!email_body) {
          showNotification({
            title: "Error",
            message: "Something went wrong with generation, please try again.",
            icon: <IconX radius="sm" />,
          });
        }
        const emailBodySpamWords =
          email_body.spam_detection_results?.spam_words || [];
        let emailBodyCompletion = email_body.completion;
        if (emailBodySpamWords && emailBodySpamWords.length > 0) {
          emailBodySpamWords.forEach((badWord: string) => {
            const spannedWord =
              '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' +
              badWord +
              "</span>";
            emailBodyCompletion = emailBodyCompletion.replace(
              new RegExp(badWord, "g"),
              spannedWord
            );
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
  const [changedTemplate, setChangedTemplate] = useState("");

  const handleGenerate = () => {
    setState(true);
  };

  const handleSave = (oldVersion: string, newVesion: string) => {
    setVoiceGenerate(true);

    fetch(API_URL + "/ml/add-few-shot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        client_archetype_id: currentProject.id,
        original_string: oldVersion,
        prospect_id: props.prospectId,
        template_id: props.template?.step.id,
        edited_string: newVesion,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {})
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setVoiceGenerate(false);
        fetchAssignedVoice();
        setState(false);
      });
  };
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
          <Paper radius="md" style={{ zIndex: 9999, padding: "20px" }}>
            <Flex justify="center" mb="md">
              <Text size="lg" weight={700}>
                Bank for{" "}
                <i>
                  {aiVoices.find((voice) => voice.id === selectedVoiceId)
                    ?.name || "Unknown Voice"}
                </i>
              </Text>
            </Flex>
            <ScrollArea
              style={{
                height: 450,
                overflow: "hidden",
                scrollbarWidth: "none",
              }}
              className="hide-scrollbar"
              scrollHideDelay={0}
            >
              <Flex direction="column">
                {fewShots.map((shot, index) => (
                  <Flex
                    key={index}
                    direction="column"
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                    }}
                  >
                    <Flex
                      direction="row"
                      justify="space-between"
                      align="center"
                    >
                      <Text
                        ml="sm"
                        style={{
                          fontWeight: 700,
                          color: "#000",
                          fontSize: "1rem",
                        }}
                      >
                        {/* If the edited string contains '##########', split it and use the second half. Otherwise, use the entire edited string. */}
                        <div>
                          {getHighlightedDiff(
                            shot.original_string,
                            shot.edited_string.includes("##########")
                              ? shot.edited_string.split("##########")[1]
                              : shot.edited_string
                          )}
                        </div>
                      </Text>
                      <ActionIcon
                        color="red"
                        onClick={modifyFewShot(index, 0)}
                        variant="light"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Flex>
                    <Divider />
                  </Flex>
                ))}
              </Flex>
            </ScrollArea>
          </Paper>
          <Divider mt="md" />
          <Box
            mt="md"
            p="md"
            style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}
          >
            <Text size="md" weight={700} mb="sm">
              Add New Few-Shot Example
            </Text>
            <Textarea
              placeholder="Type your instructions here..."
              autosize
              minRows={3}
              onChange={(event) => setNewFewShot(event.currentTarget.value)}
              value={newFewShot}
            />
            {newFewShot && (
              <Button
                mt="md"
                onClick={async () => {
                  try {
                    setSavingFewShot(true);
                    const response = await fetch(API_URL + "/ml/add-few-shot", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                      },
                      body: JSON.stringify({
                        client_archetype_id: currentProject.id,
                        original_string: newFewShot,
                        edited_string: newFewShot, // Assuming the edited string is the same as the original for now
                      }),
                    });
                    if (response.ok) {
                      const data = await response.json();
                      setFewShots((prevFewShots) => [...prevFewShots, data]);
                      setNewFewShot("");
                    } else {
                      console.error("Failed to save few-shot example");
                    }
                  } catch (error) {
                    console.error("Error saving few-shot example:", error);
                  } finally {
                    setSavingFewShot(false);
                  }
                }}
                loading={savingFewShot}
              >
                Save
              </Button>
            )}
          </Box>
        </Modal>
      )}
      <Box>
        <Flex direction="column" gap="md">
          <Flex align="center" justify="space-between" gap="md">
            <Flex align="center" justify="flex-end" gap="sm">
              <div
                className={`absolute bg-[#f6f8fa] right-0 rounded-md top-4 transition-all duration-300 z-[9999] `}
                style={{
                  transform: voiceGenerate
                    ? "translateY(-10px) "
                    : "translateY(45px)",
                  filter: voiceGenerate ? "opacity(1)" : "opacity(0)",
                }}
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

              {currentProject?.is_ai_research_personalization_enabled && (
                <div
                  className={`${
                    state && "absolute z-[9999] bg-[#f6f8fa] right-0 rounded-md"
                  } flex flex-col`}
                >
                  <Flex align="center" gap="sm">
                    <Select
                      label="Assign Voice"
                      mb="md"
                      onCreate={(query) => {
                        const createVoice = async () => {
                          try {
                            const response = await fetch(
                              API_URL + "/ml/voices",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${userToken}`,
                                },
                                body: JSON.stringify({
                                  name: query,
                                  client_archetype_id: currentProject.id,
                                }),
                              }
                            );
                            if (response.ok) {
                              const newVoice = await response.json();
                              const newVoiceItem = {
                                value: newVoice.id,
                                label: newVoice.name,
                              };
                              setAiVoices((prevVoices) => [
                                ...prevVoices,
                                {
                                  client_id: newVoice.client_id,
                                  client_sdr_created_by:
                                    newVoice.client_sdr_created_by,
                                  id: newVoice.id,
                                  name: newVoice.name,
                                },
                              ]);

                              // PUT the new voice ID to the campaign
                              const updateCampaignResponse = await fetch(
                                API_URL +
                                  `/campaigns/${currentProject.id}/voice`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${userToken}`,
                                  },
                                  body: JSON.stringify({
                                    voice_id: newVoice.id,
                                  }),
                                }
                              );

                              if (!updateCampaignResponse.ok) {
                                console.error(
                                  "Failed to update campaign with new voice"
                                );
                              }

                              refetch();
                              return newVoiceItem; // Return the new voice item
                            } else {
                              console.error("Failed to create voice");
                              return null;
                            }
                          } catch (error) {
                            console.error("Error creating voice:", error);
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
                      data={[
                        { value: "null", label: "No Voice" },
                        ...aiVoices.map((voice) => ({
                          value: voice.id.toString(),
                          label: voice.name,
                        })),
                      ]}
                      value={
                        selectedVoiceId ? selectedVoiceId.toString() : "null"
                      }
                      onChange={async (value) => {
                        try {
                          setLoadingBankData(true);
                          const [updateVoiceResponse, fewShotResponse] =
                            await Promise.all([
                              fetch(API_URL + `/ml/voices`, {
                                method: "PUT",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${userToken}`,
                                },
                                body: JSON.stringify({
                                  voice_id: value === "null" ? null : value,
                                  archetype_id: currentProject.id,
                                }),
                              }),
                              fetch(API_URL + `/ml/few-shot`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${userToken}`,
                                },
                                body: JSON.stringify({
                                  voice_id: value === "null" ? null : value,
                                  client_archetype_id: currentProject.id,
                                }),
                              }),
                            ]);

                          setLoadingBankData(false);

                          if (!updateVoiceResponse.ok) {
                            console.error("Failed to update voice");
                          }

                          if (fewShotResponse.ok) {
                            const fewShotData = await fewShotResponse.json();
                            const decomposedFewShotData = fewShotData.map(
                              (item: { edited_string: string }) => ({
                                ...item,
                                edited_string: item.edited_string,
                              })
                            );
                            setFewShots(decomposedFewShotData);
                          } else {
                            console.error("Failed to fetch few-shot data");
                          }
                        } catch (error) {
                          console.error(
                            "Error updating voice or fetching few-shot data:",
                            error
                          );
                        }
                        if (value === "null") {
                          setSelectedVoiceId(null);
                          setFewShots([]);
                        } else {
                          setSelectedVoiceId(Number(value));
                        }
                        refetch();
                      }}
                      miw={300}
                      rightSection={
                        !loadingBankData &&
                        fewShots &&
                        fewShots.length > 0 &&
                        selectedVoiceId !== null && (
                          <Button
                            size="xs"
                            onClick={() => setVoiceBankOpen(true)}
                            color="blue"
                            radius={"md"}
                            style={{ transform: "translateX(-50px)" }}
                          >
                            Open Voice Bank
                          </Button>
                        )
                      }
                      dropdownComponent="div"
                      withinPortal
                    />
                  </Flex>
                </div>
              )}
            </Flex>
          </Flex>
        </Flex>

        <Box>
          {props.subjectLine && props.template && (
            <Paper withBorder style={{ borderColor: "#228be6" }} radius={"sm"}>
              <Flex
                align={"center"}
                justify={"space-between"}
                px={"lg"}
                py={"sm"}
              >
                <Flex align={"center"} gap={4}>
                  <IconMail size={"0.9rem"} color="#228be6" />
                  <Text fw={500} color="gray" size={"xs"}>
                    Subject:
                  </Text>
                  <Text fw={500} size={"xs"}>
                    {subjectLineText || ""}
                  </Text>
                </Flex>
              </Flex>
              <Divider color="gray" />
              <Paper className="relative">
                {state && (
                  <div className=" fixed w-screen h-screen top-0 left-0 z-[9000] bg-[#7d7d7d]/[60%]"></div>
                )}

                <div
                  className={`${
                    state &&
                    !voiceGenerate &&
                    "absolute z-[9999] bg-[#f6f8fa] w-full left-0 rounded-md"
                  }`}
                >
                  <div className="px-5">
                    <Text color="gray.6" fw={500} size="sm" mr="xs"></Text>
                    {/* {!isFetching && (
                      <Text mt="xs" mb="xs" color="gray.8" fw={700} size="sm">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              data?.subject_line ?? ""
                            ),
                          }}
                        />
                      </Text>
                    )} */}
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
                      <Flex
                        justify="center"
                        align="center"
                        style={{ height: "300px" }}
                      >
                        <Loader color="grape" />
                      </Flex>
                    ) : (
                      <>
                        <div
                          contentEditable={
                            currentProject?.is_ai_research_personalization_enabled &&
                            selectedVoice !== "null"
                              ? true
                              : undefined
                          }
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              typeof data?.body === "string"
                                ? `<span style="font-size: 0.905rem; display: block; margin-bottom: 0.1rem;">${data.body.replace(
                                    /\n\s*\n/g,
                                    "<br/><br/>"
                                  )}</span>`
                                : ""
                            ),
                          }}
                          onInput={(e) => {
                            setChangedTemplate(e.currentTarget.innerHTML);
                            setCanSave(true);
                          }}
                          style={{
                            borderRadius: "4px",
                            padding: "8px",
                            minHeight: "auto",
                            marginBottom: "16px",
                            whiteSpace: "pre-wrap",
                          }}
                          onClick={() => {
                            if (
                              currentProject?.is_ai_research_personalization_enabled &&
                              selectedVoice !== "null"
                            ) {
                              handleGenerate();
                            }
                          }}
                        />
                        {state && (
                          <>
                            <Flex justify={"space-between"} mt={"sm"}>
                              <Button
                                variant="outline"
                                color="gray"
                                onClick={() => setState(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                disabled={!canSave}
                                onClick={() =>
                                  handleSave(data.body, changedTemplate)
                                }
                              >
                                Save to voice memory
                              </Button>
                            </Flex>
                            <Divider my={"lg"} />
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {isFetching &&
                    currentProject.is_ai_research_personalization_enabled &&
                    props.currentTab === "PROSPECTED" && (
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
                          <Badge radius={"xs"}>
                            {props?.template?.step.title || ""}
                          </Badge>
                          <Badge radius={"xs"}>
                            {props?.subjectLine?.is_magic_subject_line
                              ? "magic subject line"
                              : props?.subjectLine?.subject_line || ""}
                          </Badge>
                        </Flex>
                      </Flex>
                      <Flex align={"start"} gap={50}>
                        <Text w={60} fw={400} color="gray" size={"sm"}>
                          Research
                        </Text>
                        <Box>
                          <List withPadding size={"sm"}>
                            {data?.ai_research?.map(
                              (
                                research: { short_summary: string },
                                index: number
                              ) => (
                                <List.Item key={index}>
                                  {research.short_summary}
                                </List.Item>
                              )
                            )}
                          </List>
                        </Box>
                      </Flex>
                    </Flex>
                  )}
                </div>
              </Paper>
            </Paper>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

const NewDetailEmailSequencingV2 = function (props: {
  currentTab: string;
  templates: EmailSequenceStep[];
  subjectLines: SubjectLineTemplate[];
  refetch: () => Promise<void>;
  scrollToTop: () => void;
  isEditing: boolean;
  prospectId: number;
  triggerGenerate: number;
  stepNumber: number;
  setTriggerGenerate: React.Dispatch<React.SetStateAction<number>>;
  selectedProspectIndex: number;
  setSelectedProspectIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedProspect?: ProspectShallow;
  campaignContacts?: ProspectShallow[];
  onRegenerate: () => void;
  prospectOnChangeHandler: (prospect: ProspectShallow | undefined) => void;
  currentProject?: PersonaOverview;
}) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [displayTitle, refreshTitle] = useRefresh();

  const [personalizers, setPersonalizers] = useState<any>([]);

  // Active Template States
  const [activeTemplate, setTemplate] = useState<EmailSequenceStep>();
  const [activeTemplateIndex, setActiveTemplateIndex] = useState<number>(0);
  const [subjectLineText, setSubjectLineText] = useState<string | null>("");
  const [activeSubjectLine, setActiveSubjectLine] =
    useState<SubjectLineTemplate>();
  const [activeTab, setActiveTab] = useState<string>("body");
  const handleTabChange = (value: TabsValue) => {
    const newTab = value as string;
    setActiveTab(newTab);
  };
  // Modal States
  const [
    bodyLibraryOpened,
    { open: openBodyLibrary, close: closeBodyLibrary },
  ] = useDisclosure();
  const [
    createEmailTemplateOpened,
    { open: openCreateEmailTemplate, close: closeCreateEmailTemplate },
  ] = useDisclosure();
  const [
    createSubjectLineOpened,
    { open: openCreateSubject, close: closeCreateSubject },
  ] = useDisclosure();
  const [
    subjectLibraryOpened,
    { open: openSubjectLibrary, close: closeSubjectLibrary },
  ] = useDisclosure();

  useEffect(() => {
    if (props.templates.length > 0) {
      setTemplate(props.templates[0]);
    }
    if (
      props.subjectLines.length > 0 &&
      !activeSubjectLine &&
      props.subjectLines[0]
    ) {
      setActiveSubjectLine(props.subjectLines[0]);
    }
  }, [props]);

  useEffect(() => {
    if (activeTemplateIndex || activeTemplateIndex === 0) {
      setTemplate(props.templates[activeTemplateIndex]);
    }
  }, [props.templates, activeTemplateIndex]);

  const triggerPatchEmailBodyTemplateTitle = async (
    template: EmailSequenceStep,
    title: string
  ) => {
    try {
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
      if (result.status !== "success") {
        throw new Error(result.message);
      }
      showNotification({
        title: "Success",
        message: "Successfully updated email title",
        color: "green",
      });
      await props.refetch();
    } catch (error) {
      if (error instanceof Error) {
        showNotification({
          title: "Error",
          message: error.message,
          color: "red",
        });
      } else {
        showNotification({
          title: "Error",
          message: "An unknown error occurred",
          color: "red",
        });
      }
    } finally {
      setLoading(false);
      refreshTitle();
    }
  };
  const debouncedTriggerPatchEmailBodyTemplateTitle = _.debounce(
    triggerPatchEmailBodyTemplateTitle,
    200
  );

  if (currentProject === null) {
    return <></>;
  }

  function getPersonalizersSection() {
    return (
      <Personalizers
        ai_researcher_id={currentProject?.ai_researcher_id}
        sequences={props.templates}
        setSequences={null}
        setPersonalizers={setPersonalizers}
        personalizers={personalizers}
      />
    );
  }

  function getEmailBodySection() {
    return (
      <Stack style={{ minWidth: "100%" }}>
        <Group position="apart" px="xs">
          <Box>
            <Title order={3}>Templates</Title>
          </Box>
          <Flex>
            <Button
              variant="light"
              leftIcon={<IconPlus size="1.0rem" />}
              radius={"sm"}
              onClick={openCreateEmailTemplate}
            >
              New
            </Button>
          </Flex>
          <EmailTemplateLibraryModal
            modalOpened={bodyLibraryOpened}
            closeModal={closeBodyLibrary}
            templateType={"BODY"}
            onSelect={(template: EmailTemplate) => {
              openConfirmModal({
                title: (
                  <Title order={3}>
                    Use "{template.name || "N/A"}" Template{" "}
                  </Title>
                ),
                children: (
                  <>
                    <Text fs="italic" fz="sm">
                      Review the details of the "{template.name || "N/A"}"
                      template below. You can always edit the template after
                      importing.
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
                  const bumpedCount = props.currentTab.includes("BUMPED-")
                    ? parseInt(props.currentTab.split("-")[1])
                    : null;
                  const result = await postCopyEmailPoolEntry(
                    userToken,
                    template.template_type,
                    currentProject!.id,
                    template.id,
                    props.currentTab.includes("BUMPED-")
                      ? "BUMPED"
                      : props.currentTab,
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
            status={
              props.currentTab.includes("BUMPED-") ? "BUMPED" : props.currentTab
            }
            archetypeID={currentProject!.id}
            bumpedCount={
              props.currentTab.includes("BUMPED-")
                ? parseInt(props.currentTab.split("-")[1])
                : null
            }
            onFinish={async (
              title: any,
              sequence: any,
              isDefault: any,
              status: any,
              substatus: any
            ) => {
              const result = await createEmailSequenceStep(
                userToken,
                currentProject!.id,
                status ?? "",
                title,
                sequence,
                props.currentTab.includes("BUMPED-")
                  ? parseInt(props.currentTab.split("-")[1])
                  : null,
                isDefault,
                substatus
              );
              return result.status === "success";
            }}
          />
        </Group>
        <Box>
          <Accordion
            variant="contained"
            defaultValue={`${activeTemplate?.step.id}`}
          >
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
                                        debouncedTriggerPatchEmailBodyTemplateTitle(
                                          template,
                                          e.currentTarget.value
                                        );
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
                            variant={
                              activeTemplate?.step.id === template.step.id
                                ? "filled"
                                : "outline"
                            }
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
                      <EmailBodyItem
                        template={template}
                        refetch={props.refetch}
                      />
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
      <Stack style={{ minWidth: "100%" }}>
        <Group position="apart" px="xs">
          <Box>
            <Title order={3}>Templates</Title>
          </Box>
          <Flex>
            <Button
              onClick={openSubjectLibrary}
              variant="outline"
              radius="md"
              color="blue"
              mr="xs"
              leftIcon={<IconBooks size="1.0rem" />}
            >
              Template Library
            </Button>
            <Button
              variant="light"
              leftIcon={<IconPlus size="1.0rem" />}
              radius={"sm"}
              onClick={openCreateSubject}
            >
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
                title: (
                  <Title order={3}>
                    Use "{template.name || "N/A"}" Template{" "}
                  </Title>
                ),
                children: (
                  <>
                    <Text fs="italic" fz="sm">
                      Review the details of the "{template.name || "N/A"}"
                      template below. You can always edit the template after
                      importing.
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
        <Box style={{ minWidth: "100%" }}>
          <Accordion
            variant="contained"
            defaultValue={`${activeSubjectLine?.id}`}
          >
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
                    minWidth: "100%",
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
                    variant={
                      activeSubjectLine?.id === subjectLine.id
                        ? "filled"
                        : "outline"
                    }
                    compact
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveSubjectLine(subjectLine);
                    }}
                  >
                    Regen Example
                  </Button>

                  <SubjectLineItem
                    subjectLine={subjectLine}
                    refetch={props.refetch}
                  />
                </Box>
              ))}
          </Accordion>
        </Box>
      </Stack>
    );
  }

  const [showEditVariants, setShowEditVariants] = useState<boolean>(false);

  return (
    <Stack style={{ width: "100%" }}>
      <Flex align={"center"} justify={"space-between"} pos={"relative"}>
        <Flex align={"center"} justify={"space-between"} gap={"4px"}>
          <ActionIcon
            disabled={props.selectedProspectIndex === 0}
            onClick={() =>
              props.setSelectedProspectIndex((prevValue) => prevValue - 1)
            }
            radius={"xl"}
          >
            <IconArrowLeft size={16} />
          </ActionIcon>
          <ProspectSelect2
            personaId={props.currentProject?.id ?? -1}
            selectedProspect={props.selectedProspect?.id}
            isSequenceV2={true}
            onChange={props.prospectOnChangeHandler}
            prospects={props.campaignContacts}
          />
          <ActionIcon
            disabled={
              props.campaignContacts &&
              props.selectedProspectIndex === props.campaignContacts.length - 1
            }
            onClick={() =>
              props.setSelectedProspectIndex((prevValue) => prevValue + 1)
            }
            radius={"xl"}
          >
            <IconArrowRight size={16} />
          </ActionIcon>
        </Flex>
        <Button
          size="xs"
          color={"grape"}
          onClick={() => props.onRegenerate()}
          leftIcon={<IconSparkles />}
        >
          Regenerate
        </Button>
      </Flex>
      {!props.isEditing && (
        <EmailPreviewHeaderV2
          subjectLineText={subjectLineText}
          setSubjectLineText={setSubjectLineText}
          currentTab={props.currentTab}
          template={activeTemplate}
          subjectLine={activeSubjectLine}
          prospectId={props.prospectId}
          triggerGenerate={props.triggerGenerate}
          stepNumber={props.stepNumber}
          setTriggerGenerate={props.setTriggerGenerate}
        />
      )}
      <Flex align={"center"} justify={"start"} gap={"8px"} mt={"8px"}>
        <ActionIcon
          disabled={activeTemplateIndex === 0}
          onClick={() => setActiveTemplateIndex((prevValue) => prevValue - 1)}
          radius={"xl"}
        >
          <IconArrowLeft size={16} />
        </ActionIcon>
        <Badge
          variant={"outline"}
          radius={"sm"}
          onClick={() => {
            setShowEditVariants((prevState) => !prevState);
          }}
        >
          {`Variant #${activeTemplateIndex + 1}: ${
            props.templates[activeTemplateIndex]?.step.title ?? ""
          }`}
        </Badge>
        <ActionIcon
          disabled={activeTemplateIndex === props.templates.length - 1}
          onClick={() => setActiveTemplateIndex((prevValue) => prevValue + 1)}
          radius={"xl"}
        >
          <IconArrowRight size={16} />
        </ActionIcon>
      </Flex>
      {(props.isEditing || showEditVariants) &&
        (props.currentTab === "PROSPECTED" ? (
          <Tabs
            onTabChange={handleTabChange}
            variant="outline"
            defaultValue="body"
          >
            <Tabs.List>
              <Tabs.Tab
                value="subject_line"
                style={{
                  fontWeight: activeTab === "subject_line" ? "bold" : "normal",
                }}
              >
                Subject Lines
              </Tabs.Tab>
              <Tabs.Tab
                value="body"
                style={{
                  fontWeight: activeTab === "body" ? "bold" : "normal",
                }}
              >
                Body
              </Tabs.Tab>
              <Tabs.Tab
                value="personalizers"
                style={{
                  fontWeight: activeTab === "personalizers" ? "bold" : "normal",
                  display: "flex",
                  alignItems: "center",
                }}
              >
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
        ))}
    </Stack>
  );
};

const TemplateSectionV2 = function (props: {
  onFoundTemplate: (templateId: number) => void;
}) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [humanFeedbackForTemplate, setHumanFeedbackForTemplate] =
    useState<string>();

  const [templateActivesShow, setTemplateActivesShow] = useState([true]);
  useEffect(() => {
    if (!selectedTemplateId) return;
    props.onFoundTemplate(selectedTemplateId);
  }, [selectedTemplateId]);

  const { data: templates, isFetching: isFetchingTemplates } = useQuery({
    queryKey: [`query-get-li-templates`],
    queryFn: async () => {
      const response = await getLiTemplates(userToken, currentProject!.id);

      if (response.data?.length > 0) {
        setSelectedTemplateId(response.data[0].id);
        setHumanFeedbackForTemplate(response.data[0].additional_instructions);
      }
      return response.status === "success"
        ? (response.data as Record<string, any>[])
        : [];
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject && !!currentProject.template_mode,
  });

  return (
    <Flex direction={"column-reverse"} gap={"8px"}>
      {isFetchingTemplates ? (
        <Box>
          <Loader
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>
      ) : (
        <Stack>
          <Stack mt="xs">
            {templates
              ?.filter((t: any) => templateActivesShow.includes(t.active))
              .sort((a: any, b: any) =>
                a.active != b.active
                  ? -(a.active - b.active)
                  : a.title - b.title
              )
              .map((template, index) => (
                <Paper
                  key={index}
                  p="md"
                  mih={80}
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    border:
                      selectedTemplateId === template.id
                        ? "solid 1px #339af0 !important"
                        : "",
                    backgroundColor:
                      selectedTemplateId === template.id
                        ? "#339af008 !important"
                        : "",
                    flexDirection: "row",
                    display: "flex",
                  }}
                  withBorder
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setHumanFeedbackForTemplate(
                      template.additional_instructions
                    );
                  }}
                >
                  <Box
                    miw="100px"
                    mah={80}
                    sx={{
                      border: "solid 1px #339af022",
                      backgroundColor: "#339af022",
                      padding: "8px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                    mt="xl"
                    mr="md"
                  >
                    <Text fw="bold" fz="md" color="blue" mt="xs">
                      {Math.round(
                        (template.times_accepted /
                          (template.times_used + 0.0001)) *
                          100
                      )}
                      % reply
                    </Text>
                    <Text color="blue" size="xs">
                      {template.times_accepted} / {template.times_used} times
                    </Text>
                  </Box>

                  <Box mr={40} w="100%">
                    <Flex>
                      <Text
                        size="sm"
                        fw="600"
                        mb="xs"
                        sx={{ textTransform: "uppercase" }}
                        color="gray"
                        variant="outline"
                      >
                        {template.title}
                      </Text>
                      {/* Hovercard for transformers */}

                      {/* <HoverCard width={280} shadow='md'>
                        <HoverCard.Target>
                          <Badge color='green' styles={{ root: { textTransform: 'initial' } }}>
                            Personalizations:{' '}
                            <Text fw={500} span>
                              {props.messageMetaData?.notes?.length}
                            </Text>
                          </Badge>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <List>
                            {props.messageMetaData?.notes?.map((note: any, index: number) => (
                              <List.Item key={index}>
                                <Text fz='sm'>{note}</Text>
                              </List.Item>
                            ))}
                          </List>
                        </HoverCard.Dropdown>
                      </HoverCard> */}

                      {template.research_points &&
                        template.research_points.length > 0 && (
                          <HoverCard withinPortal width={280} shadow="md">
                            <HoverCard.Target>
                              <Badge
                                leftSection={
                                  <IconSearch
                                    size="0.8rem"
                                    style={{ marginTop: 4 }}
                                  />
                                }
                                color="lime"
                                variant="filled"
                                ml="xs"
                                size="xs"
                              >
                                {template.research_points.length} Research
                                Points
                              </Badge>
                            </HoverCard.Target>
                            <HoverCard.Dropdown
                              style={{
                                backgroundColor: "rgb(34, 37, 41)",
                                padding: 0,
                              }}
                            >
                              <Paper
                                style={{
                                  backgroundColor: "rgb(34, 37, 41)",
                                  color: "white",
                                  padding: 10,
                                }}
                              >
                                <TextWithNewline style={{ fontSize: "12px" }}>
                                  {"<b>Active Research Points:</b>\n- " +
                                    template.research_points
                                      .map((rp: any) =>
                                        rp.replaceAll("_", " ").toLowerCase()
                                      )
                                      .join("\n- ")}
                                </TextWithNewline>
                              </Paper>
                            </HoverCard.Dropdown>
                          </HoverCard>
                        )}
                      {template.additional_instructions && (
                        <HoverCard withinPortal width={280} shadow="md">
                          <HoverCard.Target>
                            <Badge
                              leftSection={<IconBulb size="0.8rem" />}
                              color="grape"
                              variant="filled"
                              ml="xs"
                              size="xs"
                            >
                              Fine Tuned
                            </Badge>
                          </HoverCard.Target>
                          <HoverCard.Dropdown
                            style={{
                              backgroundColor: "rgb(34, 37, 41)",
                              padding: 0,
                            }}
                          >
                            <Paper
                              style={{
                                backgroundColor: "rgb(34, 37, 41)",
                                color: "white",
                                padding: 10,
                              }}
                            >
                              <TextWithNewline style={{ fontSize: "12px" }}>
                                {"<b>Additional Instructions:</b>\n" +
                                  template.additional_instructions}
                              </TextWithNewline>
                            </Paper>
                          </HoverCard.Dropdown>
                        </HoverCard>
                      )}
                    </Flex>
                    <Card
                      withBorder
                      w="100%"
                      sx={{
                        backgroundColor:
                          selectedTemplateId == template.id ? "" : "#fbfbfb",
                      }}
                    >
                      <Text style={{ fontSize: "0.9rem", lineHeight: 2 }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              template.message
                                .replaceAll(
                                  "[[",
                                  "<span style='margin-left: 6px; margin-right: 6px; background-color: " +
                                    theme.colors["blue"][5] +
                                    "; padding: 2px; color: white; padding-left: 8px; padding-right: 8px; border-radius: 4px;'>✨ "
                                )
                                .replaceAll("]]", "</span>") as string
                            ),
                          }}
                        />
                      </Text>
                    </Card>
                  </Box>

                  <Box sx={{ justifyContent: "right" }} ml="auto">
                    <Switch
                      sx={{ cursor: "pointer" }}
                      checked={template.active}
                      onChange={(e) => {
                        if (!currentProject) return;
                        updateLiTemplate(
                          userToken,
                          currentProject.id,
                          template.id,
                          template.title,
                          template.message,
                          e.target.checked
                        ).then((res) => {
                          queryClient.invalidateQueries({
                            queryKey: [`query-get-li-templates`],
                          });
                        });
                      }}
                    />
                    <Button
                      mt="xs"
                      variant="subtle"
                      radius="xl"
                      size="sm"
                      compact
                      onClick={() => {
                        openContextModal({
                          modal: "liTemplate",
                          title: "Edit Template",
                          innerProps: {
                            mode: "EDIT",
                            editProps: {
                              templateId: template.id,
                              title: template.title,
                              message: template.message,
                              active: template.active,
                              humanFeedback: template.additional_instructions,
                              researchPoints: template.research_points,
                            },
                          },
                        });
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </Paper>
              ))}
          </Stack>
          {(templates?.length ?? 0) > 1 && (
            <Button
              onClick={() => {
                if (templateActivesShow.length === 1) {
                  setTemplateActivesShow([true, false]);
                } else {
                  setTemplateActivesShow([true]);
                }
              }}
              color="gray"
              variant="subtle"
              leftIcon={
                <IconChevronDown
                  size="1rem"
                  style={{
                    transform:
                      templateActivesShow.length === 1 ? "" : "rotate(180deg)",
                  }}
                />
              }
            >
              Show{" "}
              {templateActivesShow.includes(true)
                ? "All Templates"
                : "Active Templates Only"}
            </Button>
          )}
        </Stack>
      )}

      <Flex pt={15} sx={{ justifyContent: "right" }}>
        {/* <Button
            onClick={() => setCtaModalOpened(true)}
            size='sm'
            variant='outline'
            color='lime'
            mr='sm'
            compact
          >
            Brainstorm Templates
          </Button> */}
        <InitialMessageTemplateSelector
          onSelect={(template: LinkedinInitialMessageTemplate) => {
            showNotification({
              title: "🤖 Generating...",
              message: 'Generating custom "' + template.name + '" template...',
              color: "blue",
            });

            fetch(`${API_URL}/linkedin_template/adjust_template_for_client`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                template_id: template.id,
              }),
            })
              .then((res) => {
                return res.json();
              })
              .then((res) => {
                const adjustedTemplate = res["adjusted_template"];
                openContextModal({
                  modal: "liTemplate",
                  title: "Create Template",
                  innerProps: {
                    mode: "CREATE",
                    editProps: {
                      title: template.name,
                      message: adjustedTemplate,
                      active: true,
                      humanFeedback: "",
                      researchPoints: [],
                    },
                  },
                });
              });
          }}
        />
        <Stack spacing={5}>
          <Button
            variant="outline"
            radius="md"
            compact
            color="orange"
            onClick={() => {
              openContextModal({
                modal: "liTemplate",
                title: "Create Template",
                innerProps: {
                  mode: "CREATE",
                },
              });
            }}
          >
            Create New
          </Button>
        </Stack>
      </Flex>
    </Flex>
  );
};

const LinkedinSequenceSectionV2 = function (props: {
  triggerGenerate: number;
  setTriggerGenerate: React.Dispatch<React.SetStateAction<number>>;
  stepNumber: number;
  sequence: linkedinSequence[];
  userToken: string;
  currentProject?: PersonaOverview;
  prospectId: number;
  bfs: BumpFramework[];
  selectedProspectIndex: number;
  setSelectedProspectIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedProspect?: ProspectShallow;
  campaignContacts?: ProspectShallow[];
  onRegenerate: () => void;
  prospectOnChangeHandler: (prospect: ProspectShallow | undefined) => void;
}) {
  //set to the first active: true sequence.
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(() => {
    const firstActiveIndex = props.sequence.findIndex((seq) => seq.active);
    return firstActiveIndex !== -1 ? firstActiveIndex : 0;
  });

  // Updates 'currentSequenceIndex' to the first active sequence when 'sequence' changes.
  useEffect(() => {
    const firstActiveIndex = props.sequence.findIndex((seq) => seq.active);
    if (
      firstActiveIndex !== -1 &&
      !props.sequence[currentSequenceIndex].active
    ) {
      setCurrentSequenceIndex(firstActiveIndex);
    }
  }, [props.sequence]);

  const [showEditVariants, setShowEditVariants] = useState<boolean>(false);

  const [
    linkedinSequenceMessageGenerationInProgress,
    setLinkedinSequenceMessageGenerationInProgress,
  ] = useState(false);
  const [linkedinSequenceMessage, setLinkedinSequenceMessage] = useState<any>();

  const getLiFollowUpMessage = async (
    prospectId: number,
    useCache: boolean,
    bump_framework_id: number,
    bumped_count: number
  ) => {
    if (!props.currentProject) return null;
    setLinkedinSequenceMessageGenerationInProgress(true);
    const result = await generateBumpLiMessage(
      props.userToken,
      prospectId,
      bump_framework_id,
      bumped_count,
      useCache
    );

    setLinkedinSequenceMessageGenerationInProgress(false);

    return result.status === "success" ? result.data : null;
  };

  useEffect(() => {
    if (!props.prospectId || props.prospectId === -1) return;

    if (
      props.triggerGenerate !== -1 ||
      linkedinSequenceMessage?.metadata.bump_framework_id !==
        props.sequence[currentSequenceIndex].bump_framework_id
    ) {
      getLiFollowUpMessage(
        props.prospectId,
        false,
        props.sequence[currentSequenceIndex].bump_framework_id,
        props.stepNumber
      ).then((msg: any) => {
        if (msg) {
          setLinkedinSequenceMessage(msg);
        }
        props.setTriggerGenerate(-1);
      });
    }
  }, [
    props.prospectId,
    props.triggerGenerate,
    currentSequenceIndex,
    props.stepNumber,
  ]);

  return (
    <Card withBorder sx={{ maxWidth: "91.5%", minWidth: "91.5%" }}>
      <Card.Section style={{ padding: "4px 16px" }} withBorder>
        <Flex align={"center"} justify={"space-between"} pos={"relative"}>
          <Flex align={"center"} justify={"space-between"} gap={"4px"}>
            <ActionIcon
              disabled={props.selectedProspectIndex === 0}
              onClick={() =>
                props.setSelectedProspectIndex((prevValue) => prevValue - 1)
              }
              radius={"xl"}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
            <ProspectSelect2
              personaId={props.currentProject?.id ?? -1}
              selectedProspect={props.selectedProspect?.id}
              isSequenceV2={true}
              onChange={props.prospectOnChangeHandler}
              prospects={props.campaignContacts}
            />
            <ActionIcon
              disabled={
                props.campaignContacts &&
                props.selectedProspectIndex ===
                  props.campaignContacts.length - 1
              }
              onClick={() =>
                props.setSelectedProspectIndex((prevValue) => prevValue + 1)
              }
              radius={"xl"}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Flex>
          <Button
            size="xs"
            color={"grape"}
            onClick={() => props.onRegenerate()}
            leftIcon={<IconSparkles />}
          >
            Regenerate
          </Button>
        </Flex>
      </Card.Section>
      <Box
        sx={{
          width: "100%",
          position: "relative",
          marginTop: "8px",
        }}
      >
        <LoadingOverlay visible={linkedinSequenceMessageGenerationInProgress} />

        {linkedinSequenceMessage && (
          <LiExampleInvitation
            message={linkedinSequenceMessage.message
              .replace("--------------------", "")
              .replace("--------------------", "")}
          />
        )}
      </Box>
      <Flex align={"center"} justify={"start"} gap={"8px"} mt={"8px"}>
        <ActionIcon
          disabled={
            currentSequenceIndex === 0 ||
            !props.sequence
              .slice(0, currentSequenceIndex)
              .some((seq) => seq.active)
          }
          onClick={() => {
            const prevActiveIndex = props.sequence
              .slice(0, currentSequenceIndex)
              .map((seq, index) => ({ seq, index }))
              .reverse()
              .find(({ seq }) => seq.active)?.index;
            if (prevActiveIndex !== undefined) {
              setCurrentSequenceIndex(prevActiveIndex);
            }
          }}
          radius={"xl"}
        >
          <IconArrowLeft size={16} />
        </ActionIcon>
        <Badge
          variant={"outline"}
          radius={"sm"}
          onClick={() => setShowEditVariants((prevState) => !prevState)}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          {`Variant #${currentSequenceIndex + 1}: ${
            props.sequence[currentSequenceIndex]?.title ?? ""
          }`}
        </Badge>
        <ActionIcon
          disabled={
            currentSequenceIndex === props.sequence.length - 1 ||
            !props.sequence.some(
              (seq, index) => index > currentSequenceIndex && seq.active
            )
          }
          onClick={() => {
            const nextActiveIndex = props.sequence.findIndex(
              (seq, index) => index > currentSequenceIndex && seq.active
            );
            if (nextActiveIndex !== -1) {
              setCurrentSequenceIndex(nextActiveIndex);
            }
          }}
          radius={"xl"}
        >
          <IconArrowRight size={16} />
        </ActionIcon>
      </Flex>
      {showEditVariants && (
        <LinkedinBumpEditSection
          bfs={props.bfs}
          userToken={props.userToken}
          index={currentSequenceIndex}
        />
      )}
    </Card>
  );
};

const LinkedinIntroEditSectionCTA = function (props: {
  userToken: string;
  prospectId?: number;
  currentProject?: PersonaOverview;
  triggerProjectRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string | null>("personalization");
  const [personalizationItemsCount, setPersonalizationItemsCount] =
    useState<number>();
  const [ctasItemsCount, setCtasItemsCount] = useState<number>();

  // get research points for selected prospect
  const { data: researchPoints, refetch } = useQuery({
    queryKey: [`query-get-research-points`, props.prospectId],
    queryFn: async () => {
      const response = await getResearchPoint(
        props.userToken,
        props.prospectId!
      );

      return response.status === "success"
        ? (response.data as ResearchPoint[])
        : [];
    },
    enabled: !!props.prospectId,
  });

  return (
    <Tabs
      value={activeTab}
      onTabChange={setActiveTab}
      variant="pills"
      keepMounted={true}
      radius="md"
      defaultValue="none"
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
              backgroundColor: theme.colors.teal[0] + "!important",
              borderRadius: theme.radius.md + "!important",
              color: theme.colors.teal[8] + "!important",
            },
            border: "solid 1px " + theme.colors.teal[5] + "!important",
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
              backgroundColor: theme.colors.blue[0] + "!important",
              borderRadius: theme.radius.md + "!important",
              color: theme.colors.blue[8] + "!important",
            },
            border: "solid 1px " + theme.colors.blue[4] + "!important",
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
              props.currentProject?.transformer_blocklist_initial ?? []
            }
            onItemsChange={async (items) => {
              setPersonalizationItemsCount(
                items.filter((x: any) => x.checked).length
              );

              // Update transformer blocklist
              const result = await updateInitialBlocklist(
                props.userToken,
                props.currentProject?.id || -1,
                items.filter((x) => !x.checked).map((x) => x.id)
              );

              props.triggerProjectRefresh();
            }}
          />
        </ScrollArea>
      </Tabs.Panel>
      <Tabs.Panel value="ctas">
        <ScrollArea h={300}>
          <CtaSection
            onCTAsLoaded={(data) => {
              setCtasItemsCount(data.filter((x: any) => x.active).length);
            }}
          />
        </ScrollArea>
      </Tabs.Panel>
    </Tabs>
  );
};

const LinkedinBumpEditSection = function (props: {
  bfs: BumpFramework[];
  framework?: BumpFramework;
  index?: number;
  userToken: string;
}) {
  const [opened, { toggle }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const [changed, setChanged] = useState(false);
  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const [activeFramework, setActiveFramework] = useState<BumpFramework>(
    props.index ? props.bfs[props.index] : props.bfs[0]
  );
  const [displayFrameworkSection, refreshFrameworkSection] = useRefresh();

  useEffect(() => {
    if (props.index || props.index === 0) {
      setActiveFramework(props.bfs[props.index]);
    }
  });

  return (
    <Box pos={"relative"}>
      <LoadingOverlay visible={!props.bfs || !activeFramework} />
      <Stack spacing={10}>
        {props.bfs.map((bf, index) => (
          <Paper
            key={index}
            p="md"
            mih={80}
            sx={{
              position: "relative",
              cursor: "pointer",
              border:
                bf.id === activeFramework.id
                  ? "solid 1px #339af0 !important"
                  : undefined,
              backgroundColor:
                bf.id === activeFramework.id
                  ? "#339af008 !important"
                  : undefined,
              flexDirection: "row",
              display: "flex",
            }}
            withBorder
          >
            <Flex mr="md" direction={"column"}>
              <Box
                miw="100px"
                mah={80}
                sx={{
                  border: "solid 1px #339af022",
                  backgroundColor: "#339af022",
                  padding: "8px",
                  borderRadius: "4px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                mt="xl"
                onClick={() => {
                  openContextModal({
                    modal: "frameworkReplies",
                    title: "Past Example Replies",
                    innerProps: {
                      bumpId: bf.id,
                    },
                  });
                }}
              >
                <Text fw="bold" fz="md" color="blue" mt="xs">
                  {bf.etl_num_times_used != null &&
                    bf.etl_num_times_converted != null &&
                    Math.round(
                      (bf.etl_num_times_converted /
                        (bf.etl_num_times_used + 0.0001)) *
                        100
                    )}
                  % reply
                </Text>
                <Text size="8px" color="blue" fz={"xs"} fw="500">
                  ({bf.etl_num_times_converted}/{bf.etl_num_times_used} times)
                </Text>
              </Box>
              <Button
                onClick={() => {
                  openContextModal({
                    modal: "frameworkReplies",
                    title: "Past Example Usages",
                    innerProps: {
                      bumpId: bf.id,
                    },
                  });
                }}
                size="xs"
                mt={3}
              >
                View Replies
              </Button>
            </Flex>
            <Box mr={20} w="100%">
              <Flex>
                <Text
                  size="sm"
                  fw="600"
                  mb="xs"
                  sx={{ textTransform: "uppercase" }}
                  color="gray"
                  variant="outline"
                >
                  {bf.title}
                </Text>
                {/* Hovercard for transformers */}

                <HoverCard withinPortal width={280} shadow="md">
                  <HoverCard.Target>
                    <Badge
                      leftSection={
                        <IconSearch size="0.8rem" style={{ marginTop: 4 }} />
                      }
                      color="lime"
                      variant={
                        bf.active_transformers &&
                        bf.active_transformers.length > 0
                          ? "filled"
                          : "outline"
                      }
                      ml="xs"
                      size="xs"
                      onClick={() => {
                        toggle();
                      }}
                    >
                      {bf.active_transformers &&
                      bf.active_transformers.length > 0
                        ? bf.active_transformers.length + " Research Points"
                        : "0 Research Points"}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown
                    style={{
                      backgroundColor: "rgb(34, 37, 41)",
                      padding: 0,
                    }}
                  >
                    <Paper
                      style={{
                        backgroundColor: "rgb(34, 37, 41)",
                        color: "white",
                        padding: 10,
                      }}
                    >
                      <TextWithNewline style={{ fontSize: "12px" }}>
                        {bf.active_transformers.length > 0
                          ? "<b>Active Research Points:</b>\n- " +
                            bf.active_transformers
                              .map((rp: any) =>
                                rp.replaceAll("_", " ").toLowerCase()
                              )
                              .join("\n- ")
                          : "Click to activate more research points"}
                      </TextWithNewline>
                    </Paper>
                  </HoverCard.Dropdown>
                </HoverCard>

                {/* <BumpFrameworkAssets bump_framework_id={bf.id} /> */}

                {/* {bf.human_feedback && ( */}
                {/*   <HoverCard width={280} shadow="md"> */}
                {/*     <HoverCard.Target> */}
                {/*       <Badge */}
                {/*         leftSection={<IconBulb size="0.8rem" />} */}
                {/*         color="grape" */}
                {/*         variant="filled" */}
                {/*         ml="xs" */}
                {/*         size="xs" */}
                {/*       > */}
                {/*         Fine Tuned */}
                {/*       </Badge> */}
                {/*     </HoverCard.Target> */}
                {/*     <HoverCard.Dropdown */}
                {/*       style={{ */}
                {/*         backgroundColor: "rgb(34, 37, 41)", */}
                {/*         padding: 0, */}
                {/*       }} */}
                {/*     > */}
                {/*       <Paper */}
                {/*         style={{ */}
                {/*           backgroundColor: "rgb(34, 37, 41)", */}
                {/*           color: "white", */}
                {/*           padding: 10, */}
                {/*         }} */}
                {/*       > */}
                {/*         <TextWithNewline style={{ fontSize: "12px" }}> */}
                {/*           {"<b>Additional Instructions:</b>\n" + */}
                {/*             bf.human_feedback} */}
                {/*         </TextWithNewline> */}
                {/*       </Paper> */}
                {/*     </HoverCard.Dropdown> */}
                {/*   </HoverCard> */}
                {/* )} */}
              </Flex>
              <Card withBorder w="100%" sx={{}}>
                {/* {editing ? (
                              <FocusTrap active={true}>
                                <Textarea
                                  placeholder='Instructions'
                                  minRows={3}
                                  autosize
                                  variant='filled'
                                  defaultValue={bf.description}
                                  onChange={(e) => {
                                    form.setFieldValue('promptInstructions', e.target.value);
                                    setChanged(true);
                                  }}
                                  onBlur={() => {
                                    setEditing(false);
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                />
                              </FocusTrap>
                            ) : ( */}
                <Text style={{ fontSize: "0.9rem", lineHeight: 2 }}>
                  <div
                    // onClick={() => {
                    //   setEditing(true);
                    // }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        bf.description
                          .replaceAll(
                            "[[",
                            "<span style='margin-left: 6px; margin-right: 6px; background-color: " +
                              theme.colors["blue"][5] +
                              "; padding: 2px; color: white; padding-left: 8px; padding-right: 8px; border-radius: 4px;'>✨ "
                          )
                          .replaceAll("]]", "</span>")
                          .replaceAll(
                            "\n",
                            `<br style="display: block; content: ' '; margin: 10px 0 "/>`
                          ) as string
                      ),
                    }}
                  />
                </Text>
              </Card>
            </Box>
            <Box sx={{ justifyContent: "right" }} ml="auto">
              <Switch
                sx={{ cursor: "pointer" }}
                checked={bf.active}
                onChange={(checked) => {
                  setLoading(true);
                  const result = patchBumpFramework(
                    props.userToken,
                    bf.id,
                    bf.overall_status,
                    bf.title,
                    bf.description,
                    bf.bump_length,
                    bf.bumped_count,
                    bf.bump_delay_days,
                    !bf.active,
                    bf.use_account_research,
                    bf.transformer_blocklist
                  )
                    .then(() => {
                      showNotification({
                        title: "Success",
                        message: "Bump Framework enabled",
                        color: "green",
                      });
                    })
                    .finally(() => {
                      (async () => {
                        await queryClient.refetchQueries({
                          queryKey: [`query-get-bump-frameworks`],
                        });
                        setLoading(false);
                      })();
                      setChanged(false);
                    });
                }}
              />
              <Button
                mt="xs"
                variant="subtle"
                radius="xl"
                size="sm"
                compact
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // setEditing(true);
                  openContextModal({
                    modal: "liBfTemplate",
                    title: "Edit Template",
                    innerProps: {
                      mode: "EDIT",
                      editProps: {
                        bf: bf,
                        templateId: bf.id,
                        title: bf.title,
                        message: bf.description,
                        active: bf.active,
                        humanFeedback: bf.human_feedback,
                        blockList: bf.transformer_blocklist,
                        onChange: (framework: BumpFramework) => {
                          setActiveFramework(framework);
                          refreshFrameworkSection();
                        },
                      },
                      // message: bf.description,
                      // handleSubmit: async (message: string) => {
                      //   form.setFieldValue('promptInstructions', message);
                      //   // setChanged(true);
                      //   // setEditing(false);
                      //   const result = await patchBumpFramework(
                      //     userToken,
                      //     bf.id,
                      //     bf.overall_status,
                      //     bf.title,
                      //     message,
                      //     bf.bump_length,
                      //     bf.bumped_count,
                      //     bf.bump_delay_days,
                      //     bf.active,
                      //     bf.use_account_research,
                      //     bf.transformer_blocklist
                      //   );
                      //   await queryClient.refetchQueries({
                      //     queryKey: [`query-get-bump-frameworks`],
                      //   });
                      // },
                    },
                  });
                }}
              >
                Edit
              </Button>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

const LinkedinIntroSectionV2 = function (props: {
  prospectId: number;
  userToken: string;
  templates?: Templates[];
  selectedTemplateId?: number;
  setSelectedTemplateId: React.Dispatch<React.SetStateAction<number>>;
  currentProject?: PersonaOverview;
  setLinkedinInitialMessages: React.Dispatch<React.SetStateAction<any>>;
  triggerGenerate: number;
  setTriggerGenerate: React.Dispatch<React.SetStateAction<number>>;
  triggerProjectRefresh: () => void;
  selectedProspectIndex: number;
  setSelectedProspectIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedProspect?: ProspectShallow;
  campaignContacts?: ProspectShallow[];
  onRegenerate: () => void;
  prospectOnChangeHandler: (prospect: ProspectShallow | undefined) => void;
}) {
  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any>(
    {}
  );

  const [showCTA, setShowCTA] = useState<boolean>(false);
  const [showPersonalization, setShowPersonalization] =
    useState<boolean>(false);

  const [templateIndex, setTemplateIndex] = useState(0);

  // get research points for selected prospect
  const { data: researchPoints, refetch } = useQuery({
    queryKey: [`query-get-research-points`, props.prospectId],
    queryFn: async () => {
      const response = await getResearchPoint(
        props.userToken,
        props.prospectId!
      );

      return response.status === "success"
        ? (response.data as ResearchPoint[])
        : [];
    },
    enabled: !!props.prospectId,
  });

  const [personalizationItemsCount, setPersonalizationItemsCount] =
    useState<number>();

  const [ctasItemsCount, setCtasItemsCount] = useState<number>();

  const toggleShowCTA = function () {
    setShowCTA((prevState) => {
      if (!prevState) {
        setShowPersonalization(false);

        return true;
      }

      return false;
    });
  };

  const [showEditVariants, setShowEditVariants] = useState<boolean>(false);

  const toggleShowPersonalization = function () {
    setShowPersonalization((prevState) => {
      if (!prevState) {
        setShowCTA(false);

        return true;
      }

      return false;
    });
  };

  useEffect(() => {
    if (props.templates && props.templates[templateIndex]) {
      props.setSelectedTemplateId(props.templates[templateIndex].id);
      props.setTriggerGenerate(0);
    }
  }, [templateIndex]);

  const { data: researchPointTypes } = useQuery({
    queryKey: [`query-get-research-point-types`],
    queryFn: async () => {
      const response = await getResearchPointTypes(
        props.userToken,
        props.currentProject ? props.currentProject.id : undefined
      );
      return response.status === "success"
        ? (response.data as ResearchPointType[])
        : [];
    },
    refetchOnWindowFocus: false,
  });

  const [
    linkedinInitialMessageGenerationInProgress,
    setLinkedinInitialMessageGenerationInProgress,
  ] = useState(false);

  const getIntroMessage = async (
    prospectId: number,
    forceRegenerate: boolean = false,
    selectedTemplateId?: number
  ) => {
    if (!props.currentProject) return null;
    if (prospectId === -1) return null;
    setLinkedinInitialMessageGenerationInProgress(true);
    setLinkedinInitialMessages((prevState: any) => {
      return {
        ...prevState,
        message: "",
      };
    });

    let convoResponse = await getLiConvoSim(
      props.userToken,
      undefined,
      prospectId
    );

    if (convoResponse.status !== "success" || forceRegenerate) {
      // If convo doesn't exist, create it
      const createResponse = await createLiConvoSim(
        props.userToken,
        props.currentProject.id,
        prospectId
      );
      if (createResponse.status !== "success") {
        setLinkedinInitialMessageGenerationInProgress(false);
        return null;
      }
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        props.userToken,
        createResponse.data,
        selectedTemplateId
      );
      if (initMsgResponse.status !== "success") {
        setLinkedinInitialMessageGenerationInProgress(false);
        return null;
      }
      convoResponse = await getLiConvoSim(props.userToken, createResponse.data);
    } else if (convoResponse.data.messages.length === 0) {
      // If convo exists but no messages, generate initial message
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        props.userToken,
        convoResponse.data.simulation.id
      );
      if (initMsgResponse.status !== "success") {
        setLinkedinInitialMessageGenerationInProgress(false);
        return null;
      }
      convoResponse = await getLiConvoSim(
        props.userToken,
        convoResponse.data.simulation.id
      );
    }

    setLinkedinInitialMessageGenerationInProgress(false);

    try {
      props.setTriggerGenerate(-1);
      if (convoResponse.data.messages) {
        setLinkedinInitialMessages(convoResponse.data.messages[0]);

        if (convoResponse.data.messages[0].meta_data.template_id) {
          props.setSelectedTemplateId(
            convoResponse.data.messages[0].meta_data.template_id
          );
        }
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  };

  const { data } = useQuery({
    queryKey: [`query-cta-data-${props.currentProject?.id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `${API_URL}/client/archetype/${props.currentProject?.id}/get_ctas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${props.userToken}`,
          },
        }
      );

      const res = await response.json();
      if (!res || !res.ctas) {
        return [];
      }

      let pageData = (res.ctas as CTA[]).map((cta) => {
        return {
          ...cta,
          percentage: cta.performance?.total_count
            ? Math.round(
                (cta.performance?.num_converted / cta.performance?.num_sent) *
                  100
              )
            : 0,
          total_responded: cta.performance?.num_converted,
          total_count: cta.performance?.num_sent,
        };
      });

      setCtasItemsCount(pageData ? pageData.length : 0);

      if (!pageData) {
        return [];
      } else {
        return _.sortBy(pageData, ["active", "percentage", "id"]).reverse();
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!props.currentProject,
  });

  useEffect(() => {
    if (props.prospectId && props.triggerGenerate === 0) {
      getIntroMessage(
        props.prospectId,
        true,
        props.selectedTemplateId === -1 ? undefined : props.selectedTemplateId
      );
    }
  }, [props.prospectId, props.triggerGenerate, props.selectedTemplateId]);

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Card withBorder sx={{ maxWidth: "91.5%", minWidth: "91.5%" }}>
      <Card.Section style={{ padding: "4px 16px" }} withBorder>
        <Flex align={"center"} justify={"space-between"} pos={"relative"}>
          <Flex align={"center"} justify={"space-between"} gap={"4px"}>
            <ActionIcon
              disabled={props.selectedProspectIndex === 0}
              onClick={() =>
                props.setSelectedProspectIndex((prevValue) => prevValue - 1)
              }
              radius={"xl"}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
            <ProspectSelect2
              personaId={props.currentProject?.id ?? -1}
              selectedProspect={props.selectedProspect?.id}
              isSequenceV2={true}
              onChange={props.prospectOnChangeHandler}
              prospects={props.campaignContacts}
            />
            <ActionIcon
              disabled={
                props.campaignContacts &&
                props.selectedProspectIndex ===
                  props.campaignContacts.length - 1
              }
              onClick={() =>
                props.setSelectedProspectIndex((prevValue) => prevValue + 1)
              }
              radius={"xl"}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Flex>
          <Button
            size="xs"
            color={"grape"}
            onClick={() => props.onRegenerate()}
            leftIcon={<IconSparkles />}
          >
            Regenerate
          </Button>
        </Flex>
      </Card.Section>
      <Box
        sx={{
          maxWidth: "100%",
          position: "relative",
          marginTop: "8px",
        }}
      >
        <LoadingOverlay
          visible={linkedinInitialMessageGenerationInProgress}
          zIndex={2}
          style={{minHeight: "300px"}}
        />
        {linkedinInitialMessages.message && (
          <LiExampleInvitation message={linkedinInitialMessages.message} />
        )}
      </Box>

      {!props.currentProject?.template_mode && (
        <Group pt="xs" noWrap>
          {linkedinInitialMessages.meta_data && (
            <>
              <HoverCard
                width={280}
                shadow="md"
                position={"bottom"}
                withinPortal
              >
                <HoverCard.Target>
                  <Badge
                    color="blue"
                    styles={{ root: { textTransform: "initial" } }}
                    variant={"outline"}
                    radius={"sm"}
                    w={"250px"}
                    onClick={() => {
                      toggleShowCTA();
                    }}
                  >
                    CTA Used:{" "}
                    <Text fw={500} span>
                      {_.truncate(linkedinInitialMessages.meta_data.cta, {
                        length: 45,
                      })}
                    </Text>
                  </Badge>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="sm">{linkedinInitialMessages.meta_data.cta}</Text>
                </HoverCard.Dropdown>
              </HoverCard>

              <HoverCard withinPortal width={280} shadow="md" position="bottom">
                <HoverCard.Target>
                  <Badge
                    variant={"outline"}
                    radius={"sm"}
                    color="green"
                    onClick={() => {
                      toggleShowPersonalization();
                    }}
                    styles={{ root: { textTransform: "initial" } }}
                  >
                    Personalizations:{" "}
                    <Text fw={500} span>
                      {linkedinInitialMessages.meta_data?.notes?.length}
                    </Text>
                  </Badge>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  {linkedinInitialMessages.meta_data?.combined ? (
                    <List>
                      {linkedinInitialMessages.meta_data?.combined.map(
                        (combined_data: any, index: number) => {
                          return (
                            <List.Item key={index}>
                              <Flex direction={"column"}>
                                <Text fz="sm" fw={"bold"}>
                                  {_.startCase(
                                    combined_data.research_point_type
                                      .toLowerCase()
                                      .replaceAll("_", " ")
                                      .replace("aicomp", "")
                                      .replace("aiind", "")
                                  )}
                                </Text>
                                <Text fz="sm">{combined_data.value}</Text>
                              </Flex>
                            </List.Item>
                          );
                        }
                      )}
                    </List>
                  ) : (
                    <List>
                      {linkedinInitialMessages.meta_data?.notes?.map(
                        (note: any, index: number) => {
                          const researchPointId =
                            linkedinInitialMessages.meta_data?.research_points[
                              index
                            ];

                          const researchPointType = researchPointTypes?.find(
                            (item) => item.id === researchPointId
                          );

                          return (
                            <List.Item key={index}>
                              <Flex direction="column">
                                {researchPointType && (
                                  <Text fz="sm" fw={"bold"}>
                                    {_.startCase(
                                      researchPointType.name
                                        .toLowerCase()
                                        .replaceAll("_", " ")
                                        .replace("aicomp", "")
                                        .replace("aiind", "")
                                    )}
                                  </Text>
                                )}
                                <Text fz="sm">
                                  {linkedinInitialMessages.meta_data?.notes}
                                </Text>
                                <Text fz="sm">{note}</Text>
                              </Flex>
                            </List.Item>
                          );
                        }
                      )}
                    </List>
                  )}
                </HoverCard.Dropdown>
              </HoverCard>
            </>
          )}
          {!props.currentProject?.template_mode && (
            <VoiceModal
              opened={opened}
              close={close}
              currentProject={props.currentProject}
              userToken={props.userToken}
              open={open}
              numCtas={ctasItemsCount ?? 0}
              numProspects={props.campaignContacts?.length ?? 0}
            />
          )}
        </Group>
      )}

      {linkedinInitialMessages.meta_data &&
        props.currentProject?.template_mode &&
        props.templates && (
          <Flex align={"center"} justify={"start"} gap={"8px"} mt={"8px"}>
            <ActionIcon
              disabled={templateIndex === 0}
              onClick={() => setTemplateIndex((prevValue) => prevValue - 1)}
              radius={"xl"}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Badge
              variant={"outline"}
              radius={"sm"}
              onClick={() => setShowEditVariants((prevState) => !prevState)}
            >
              {`Variant #${templateIndex + 1}: ${
                props.templates[templateIndex].title ?? ""
              }`}
            </Badge>
            <ActionIcon
              disabled={templateIndex === props.templates.length - 1}
              onClick={() => setTemplateIndex((prevValue) => prevValue + 1)}
              radius={"xl"}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Flex>
        )}

      {showPersonalization && (
        <ScrollArea h={300}>
          <PersonalizationSection
            researchPoints={researchPoints}
            blocklist={
              props.currentProject?.transformer_blocklist_initial ?? []
            }
            onItemsChange={async (items) => {
              setPersonalizationItemsCount(
                items.filter((x: any) => x.checked).length
              );

              // Update transformer blocklist
              const result = await updateInitialBlocklist(
                props.userToken,
                props.currentProject?.id || -1,
                items.filter((x) => !x.checked).map((x) => x.id)
              );

              props.triggerProjectRefresh();
            }}
          />
        </ScrollArea>
      )}

      {showCTA && (
        <ScrollArea h={300}>
          <CtaSection
            onCTAsLoaded={(data) => {
              setCtasItemsCount(data.filter((x: any) => x.active).length);
            }}
          />
        </ScrollArea>
      )}
      {showEditVariants && (
        <TemplateSectionV2 onFoundTemplate={props.setSelectedTemplateId} />
      )}
    </Card>
  );
};

export function ProspectSelect2(props: {
  personaId: number;
  onChange: (prospect: ProspectShallow | undefined) => void;
  autoSelect?: boolean;
  includeDrawer?: boolean;
  onFinishLoading?: (prospects: ProspectShallow[]) => void;
  selectedProspect?: number;
  isSequenceV2?: boolean;
  prospects?: ProspectShallow[];
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectShallow>();
  const [loadingProspects, setLoadingProspects] = useState<boolean>(false);
  const [lastTimeRun, setLastTimeRun] = useState<number>(0);
  const [searchingProspects, setSearchingProspects] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useDebouncedState<string>("", 400);

  const [prospectDrawerOpened, setProspectDrawerOpened] = useRecoilState(
    prospectDrawerOpenState
  );
  const [prospectDrawerId, setProspectDrawerId] = useRecoilState(
    prospectDrawerIdState
  );
  const [campaignContacts, setCampaignContacts] = useRecoilState(
    campaignContactsState
  );

  useEffect(() => {
    let resultProspects = campaignContacts;

    if (Array.isArray(resultProspects)) {
      const foundProspect = resultProspects.find(
        (prospect) => prospect.id === props.selectedProspect
      );
      if (foundProspect) {
        setSelectedProspect(foundProspect as ProspectShallow);
      }
    }
  }, [props.selectedProspect]);

  return (
    <>
      <ModalSelector
        selector={{
          content: (
            <Text>
              {loadingProspects ? (
                <>
                  <Loader size="xs" /> Loading prospects...
                </>
              ) : (
                <Flex
                  align={"center"}
                  justify={"space-between"}
                  style={{
                    width: "fit-content",
                    maxWidth: "400px",
                    overflow: "hidden",
                  }}
                  gap={"4px"}
                >
                  <Text size={"xs"} color="#37414E">
                    To:
                  </Text>
                  <Avatar
                    src={
                      "https://ui-avatars.com/api/?background=random&name=" +
                      selectedProspect?.full_name
                    }
                    radius={"xl"}
                    size={"xs"}
                  />
                  <Text size={"xs"} color={"#37414E"}>
                    {selectedProspect
                      ? `${selectedProspect.first_name} ${selectedProspect.last_name} | ${selectedProspect.title}, ${selectedProspect.company}`
                      : "loading..."}
                  </Text>
                </Flex>
              )}
            </Text>
          ),
          buttonProps: {
            variant: "outline",
            color: "blue",
          },
          onClick: () => {
            if (selectedProspect) {
              setProspectDrawerOpened(true);
              setProspectDrawerId(selectedProspect.id);
            } else {
              // Open selector
              return true;
            }
          },
          onClickChange: () => {},
          noChange: !selectedProspect,
        }}
        title={{
          name: "Select Prospect",
          rightSection: undefined,
        }}
        size={600}
        loading={loadingProspects}
        activeItemId={selectedProspect?.id}
        items={
          Array.isArray(props.prospects)
            ? props.prospects.map((prospect) => {
                return {
                  id: prospect.id,
                  name: prospect.full_name,
                  leftSection: (
                    <Box px={8}>
                      <ICPFitPillOnly icp_fit_score={prospect.icp_fit_score} />
                    </Box>
                  ),
                  content: (
                    <Box>
                      <Text>{prospect.full_name}</Text>
                      <Text fz="xs" truncate>
                        {prospect.title} @ {prospect.company}
                      </Text>
                    </Box>
                  ),
                  rightSection: undefined,
                  onClick: () => {
                    setSelectedProspect(prospect);
                    props.onChange(prospect);
                  },
                };
              })
            : []
        }
        header={{
          content: (
            <TextInput
              placeholder="Search for prospects"
              w={550}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              icon={<IconSearch size={14} />}
            />
          ),
        }}
      />
    </>
  );
}
