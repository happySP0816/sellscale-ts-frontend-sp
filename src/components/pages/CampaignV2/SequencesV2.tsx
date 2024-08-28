import { currentProjectState } from "@atoms/personaAtoms";
import {
  campaignContactsState,
  emailSequenceState,
  emailSubjectLinesState,
  linkedinSequenceState,
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
  LoadingOverlay,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Stepper,
  Switch,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconMailOpened,
  IconPlus,
} from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  PersonaOverview,
  ProspectShallow,
  ResearchPointType,
  SubjectLineTemplate,
} from "src";
import { modals, openContextModal } from "@mantine/modals";
import { fetchCampaignSequences } from "@utils/requests/campaignOverview";
import { IconSparkles } from "@tabler/icons-react";
import ProspectSelect from "@common/library/ProspectSelect";
import {
  createLiConvoSim,
  generateInitialMessageForLiConvoSim,
  getLiConvoSim,
} from "@utils/requests/linkedinConvoSimulation";
import getResearchPointTypes, {
  getResearchPoint,
} from "@utils/requests/getResearchPointTypes";
import { useQuery } from "@tanstack/react-query";
import {
  LiExampleInvitation,
  ResearchPoint,
} from "@common/sequence/LinkedInSequenceSection";
import { getLiTemplates } from "@utils/requests/linkedinTemplates";
import _ from "lodash";

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

export default function SequencesV2() {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const theme = useMantineTheme();
  const campaignContacts = useRecoilValue(campaignContactsState);

  // View Tab
  const [viewTab, setViewTab] = useState<string>("linkedin");

  // Edit Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Prospects
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectShallow | null>(null);
  const [selectedProspectIndex, setSelectedProspectIndex] = useState(0);

  // Sequences
  const [loadingSequences, setLoadingSequences] = useState(true);
  const [
    emailSequenceGenerationInProgress,
    setEmailSequenceGenerationInProgress,
  ] = useState(false);
  const [
    linkedinSequenceGenerationInProgress,
    setLinkedinSequenceGenerationInProgress,
  ] = useState(false);

  const [linkedinInitialMessageViewing, setLinkedinInitialMessageViewing] =
    useState<any>(0);

  const [emailSequenceViewingArray, setEmailSequenceViewingArray] = useState<
    any[]
  >([]);

  const [linkedinSequenceViewingArray, setLinkedinSequenceViewingArray] =
    useState<any[]>([]);

  const [sequences, setSequences] = useState<any[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(-1);

  // Step number:
  // -1 is initial message
  // starting from 0 we use the bump count
  const [stepNumber, setStepNumber] = useState<number>(-1);

  // Moving message generation into the sequences tab
  const [linkedinSequenceData, setLinkedinSequenceData] = useRecoilState(
    linkedinSequenceState
  );
  const [emailSequenceData, setEmailSequenceData] =
    useRecoilState(emailSequenceState);

  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any>(
    {}
  );

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);

  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [noProspectsFound, setNoProspectsFound] = useState(false);

  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState<
    SubjectLineTemplate[]
  >(emailSubjectLinesState);

  // Default on a sequence tab
  useEffect(() => {
    setViewTab(
      emailSequenceData && emailSequenceData.length > 0
        ? "email"
        : (linkedinSequenceData && linkedinSequenceData.length > 0) ||
          (linkedinInitialMessages && linkedinInitialMessages.length > 0)
        ? "linkedin"
        : "email"
    );
  }, [linkedinSequenceData, emailSequenceData, linkedinInitialMessages]);

  // Load Sequence Data
  useEffect(() => {
    if (currentProject) {
      refetchSequenceData(currentProject?.id);
      if (selectedProspect) {
        getIntroMessage(
          selectedProspect.id,
          false,
          selectedTemplateId === -1 ? undefined : selectedTemplateId
        );
      }
    }
  }, [currentProject?.id, selectedProspect]);

  // Load selected Prospect
  useEffect(() => {
    if (campaignContacts && campaignContacts.length > 0) {
      setSelectedProspect(
        campaignContacts[selectedProspectIndex] as ProspectShallow
      );
      setProspectsLoading(false);
    }
  }, [campaignContacts, selectedProspectIndex]);

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

  useEffect(() => {
    if (selectedTemplateId === -1 && templates) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates]);

  console.log("templates: ", templates);
  console.log("emailSequenceData: ", emailSequenceData);
  console.log("linkedinSequenceData: ", linkedinSequenceData);
  console.log("sequences: ", sequences);
  console.log("campaignContacts", campaignContacts);
  console.log("selectedProspects: ", selectedProspect);
  console.log("linkedinSequenceViewingArray: ", linkedinSequenceViewingArray);
  console.log("linkedinInitialMessageViewing: ", linkedinInitialMessageViewing);
  console.log("linkedinInitialMessages: ", linkedinInitialMessages);
  console.log("viewTab: ", viewTab);

  const emailSteps = useMemo(() => {
    if (emailSequenceData && Array.isArray(emailSequenceData)) {
      return (
        <Stepper
          active={stepNumber + 1}
          onStepClick={(number) => setStepNumber(number - 1)}
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
          style={{ minHeight: "100%", marginTop: "8px", padding: "auto" }}
        >
          {emailSequenceData.map((item, index) => {
            const eSequence = item[0];

            return (
              <Stepper.Step
                style={{ backgroundColor: "transparent" }}
                label={index === 0 ? "Initial" : "After"}
                description={
                  index === 0 ? "" : `${eSequence?.sequence_delay_days} days`
                }
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
          active={stepNumber + 1}
          onStepClick={(number) => setStepNumber(number - 1)}
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
          style={{ minHeight: "100%", marginTop: "8px", padding: "auto" }}
        >
          <Stepper.Step
            style={{ backgroundColor: "transparent" }}
            label={"Initial"}
          />
          {linkedinSequenceData.map((item) => {
            const lSequence = item[0];

            return (
              <Stepper.Step
                style={{ backgroundColor: "transparent" }}
                label={"After"}
                description={`${lSequence.bump_delay_days} days`}
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
            setLinkedinSequenceViewingArray(
              orderedGroupedSequences.map((group) => group[0].title)
            );
            setLinkedinSequenceData(orderedGroupedSequences);
          } else {
            setEmailSequenceViewingArray(
              orderedGroupedSequences.map((group) => group[0].title)
            );
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
          setLinkedinSequenceViewingArray(
            orderGroupedSequences(
              groupSequencesByBumpedCount(sequencesData.linkedin_sequence)
            ).map((group) => group[0].title)
          );
          setLinkedinSequenceData(
            orderGroupedSequences(
              groupSequencesByBumpedCount(sequencesData.linkedin_sequence)
            )
          );
        } else {
          setSequences([]);
          setEmailSequenceData([]);
          setLinkedinSequenceData([]);
          setEmailSequenceViewingArray([]);
          setLinkedinSequenceViewingArray([]);
        }
        setLoadingSequences(false);
      })
      .catch((error) => {
        console.error("Error fetching sequences", error);
        setLoadingSequences(false);
      });
  };

  const getIntroMessage = async (
    prospectId: number,
    forceRegenerate: boolean = false,
    selectedTemplateId?: number
  ) => {
    if (!currentProject) return null;
    if (prospectId === -1) return null;
    setLinkedinSequenceGenerationInProgress(true);
    setLinkedinInitialMessages((prevState: any) => {
      return {
        ...prevState,
        message: "",
      };
    });

    let convoResponse = await getLiConvoSim(userToken, undefined, prospectId);

    if (convoResponse.status !== "success" || forceRegenerate) {
      // If convo doesn't exist, create it
      const createResponse = await createLiConvoSim(
        userToken,
        currentProject.id,
        prospectId
      );
      if (createResponse.status !== "success") {
        setLinkedinSequenceGenerationInProgress(false);
        return null;
      }
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        userToken,
        createResponse.data,
        selectedTemplateId
      );
      if (initMsgResponse.status !== "success") {
        setLinkedinSequenceGenerationInProgress(false);
        return null;
      }
      convoResponse = await getLiConvoSim(userToken, createResponse.data);
    } else if (convoResponse.data.messages.length === 0) {
      // If convo exists but no messages, generate initial message
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        userToken,
        convoResponse.data.simulation.id
      );
      if (initMsgResponse.status !== "success") {
        setLinkedinSequenceGenerationInProgress(false);
        return null;
      }
      convoResponse = await getLiConvoSim(
        userToken,
        convoResponse.data.simulation.id
      );
    }

    setLinkedinSequenceGenerationInProgress(false);

    console.log("convo response: ", convoResponse);

    try {
      if (convoResponse.data.messages) {
        setLinkedinInitialMessages(convoResponse.data.messages[0]);

        if (convoResponse.data.messages[0].meta_data.template_id) {
          console.log(
            "got here: ",
            convoResponse.data.messages[0].meta_data.template_id
          );
          setSelectedTemplateId(
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

  // prospect selection onchange handler
  const prospectOnChangeHandler = function (
    prospect: ProspectShallow | undefined
  ) {
    if (prospect) {
      const foundProspect = campaignContacts.find((p) => p.id === prospect.id);

      if (foundProspect) {
        const index = campaignContacts.findIndex(
          (p) => p.id === foundProspect.id
        );
        setSelectedProspectIndex(index);
      }
    }
  };

  const onRegenerate = async () => {
    if (selectedProspect) {
      await getIntroMessage(selectedProspect.id, true, selectedTemplateId);
    }
  };

  const onEmailRegenerate = async () => {

  };

  // We also want to move voice related stuff into this Sequence Widget

  return (
    <Card shadow={"sm"} padding={"md"} radius={"md"} withBorder>
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
                  title: <Title order={3}>Sequence Builder</Title>,
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
                  },
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "1100px",
                    },
                  },
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
      <Card
        withBorder
        py={"sx"}
        radius={"md"}
        mt={"12px"}
        style={{
          borderColor: theme.colors.blue[4],
        }}
      >
        {!isEditing && (
          <Card.Section withBorder px={"xs"} py={"xs"} mb={"16px"}>
            <Flex align={"center"} justify={"space-between"} pos={"relative"}>
              <LoadingOverlay visible={prospectsLoading} />
              <Flex align={"center"} justify={"space-between"} gap={"4px"}>
                <ActionIcon
                  disabled={selectedProspectIndex === 0}
                  onClick={() =>
                    setSelectedProspectIndex((prevValue) => prevValue - 1)
                  }
                  radius={"xl"}
                >
                  <IconArrowLeft size={16} />
                </ActionIcon>
                <ProspectSelect
                  personaId={currentProject?.id ?? -1}
                  selectedProspect={selectedProspect?.id}
                  isSequenceV2={true}
                  onChange={prospectOnChangeHandler}
                />
                <ActionIcon
                  disabled={
                    selectedProspectIndex === campaignContacts.length - 1
                  }
                  onClick={() =>
                    setSelectedProspectIndex((prevValue) => prevValue + 1)
                  }
                  radius={"xl"}
                >
                  <IconArrowRight size={16} />
                </ActionIcon>
              </Flex>
              <Button
                size="xs"
                color={"grape"}
                onClick={() => onRegenerate()}
                leftIcon={<IconSparkles />}
              >
                Regenerate
              </Button>
            </Flex>
          </Card.Section>
        )}
        <Flex gap={"8px"} my={"auto"}>
          {/* This will have a steps side bar and the main one. The main one will render either LinkedinCTA, LinkedinTemplate, EmailTemplate */}
          <Card p="md" radius={"md"} withBorder style={{ minHeight: "100%" }}>
            <Card.Section withBorder inheritPadding>
              <Text align={"center"} size={"sm"}>
                Steps:
              </Text>
            </Card.Section>
            {viewTab === "linkedin" ? linkedinSteps : emailSteps}
          </Card>
          <LinkedinIntroSectionV2
            prospectId={selectedProspect ? selectedProspect.id : -1}
            userToken={userToken}
            templates={templates ? templates : []}
            generationLoading={linkedinSequenceGenerationInProgress}
            linkedinInitialMessages={linkedinInitialMessages}
            currentProject={currentProject ?? undefined}
            setSelectedTemplateId={setSelectedTemplateId}
            selectedTemplateId={selectedTemplateId}
          />
        </Flex>
      </Card>
    </Card>
  );
}

const LinkedinIntroSectionV2 = function (props: {
  prospectId: number;
  userToken: string;
  templates?: Templates[];
  generationLoading: boolean;
  selectedTemplateId?: number;
  setSelectedTemplateId: React.Dispatch<React.SetStateAction<number>>;
  currentProject?: PersonaOverview;
  linkedinInitialMessages: any;
}) {
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

  // // get research points for selected prospect
  // const { data: researchPoints, refetch } = useQuery({
  //   queryKey: [`query-get-research-points`, props.prospectId],
  //   queryFn: async () => {
  //     const response = await getResearchPoint(
  //       props.userToken,
  //       props.prospectId
  //     );
  //
  //     return response.status === "success"
  //       ? (response.data as ResearchPoint[])
  //       : [];
  //   },
  //   enabled: !!props.prospectId,
  // });

  console.log("template id: ", props.selectedTemplateId);

  return (
    <Stack spacing={8} sx={{ width: "82%" }}>
      <Box
        sx={{
          border: "1px dashed #339af0",
          borderRadius: "0.5rem",
          width: "100%",
          position: "relative",
        }}
        p="sm"
        h={250}
      >
        <LoadingOverlay visible={props.generationLoading} zIndex={10} />
        {props.linkedinInitialMessages.message && (
          <LiExampleInvitation
            message={props.linkedinInitialMessages.message}
          />
        )}
      </Box>

      {props.linkedinInitialMessages.meta_data &&
        !props.currentProject?.template_mode && (
          <Group py="xs" noWrap>
            <HoverCard width={280} shadow="md" position="bottom">
              <HoverCard.Target>
                <Badge
                  color="green"
                  styles={{ root: { textTransform: "initial" } }}
                >
                  Personalizations:{" "}
                  <Text fw={500} span>
                    {props.linkedinInitialMessages.meta_data?.notes?.length}
                  </Text>
                </Badge>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                {props.linkedinInitialMessages.meta_data?.combined ? (
                  <List>
                    {props.linkedinInitialMessages.meta_data?.combined.map(
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
                    {props.linkedinInitialMessages.meta_data?.notes?.map(
                      (note: any, index: number) => {
                        const researchPointId =
                          props.linkedinInitialMessages.meta_data
                            ?.research_points[index];

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
                                {props.linkedinInitialMessages.meta_data?.notes}
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
            <HoverCard width={280} shadow="md" position={"bottom"}>
              <HoverCard.Target>
                <Badge
                  color="blue"
                  styles={{ root: { textTransform: "initial" } }}
                >
                  CTA Used:{" "}
                  <Text fw={500} span>
                    {_.truncate(props.linkedinInitialMessages.meta_data.cta, {
                      length: 45,
                    })}
                  </Text>
                </Badge>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">
                  {props.linkedinInitialMessages.meta_data.cta}
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
        )}

      {props.linkedinInitialMessages.meta_data &&
        props.currentProject?.template_mode && (
          <Select
            defaultValue={"" + props.selectedTemplateId}
            onChange={(value) =>
              props.setSelectedTemplateId(value ? +value : -1)
            }
            label={"Selected Template:"}
            data={
              props.templates
                ? props.templates.map((option: any) => ({
                    value: "" + option.id,
                    label: option.title,
                  }))
                : []
            }
            value={"" + props.selectedTemplateId ?? ""}
            size="xs"
            style={{
              width: "300px"
            }}
            styles={{
              root: { marginLeft: "-5px" },
              input: { fontWeight: 600 },
            }}
          />
        )}
    </Stack>
  );
};
