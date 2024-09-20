import { Voices } from "@common/library/VoiceSelect";
import { AiMetaDataBadge } from "@common/persona/LinkedInConversationEntry";
import { ResearchPoint } from "@common/sequence/LinkedInSequenceSection";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Container,
  Divider,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  Paper,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { metaDataFromPrompt } from "@modals/VoiceEditorModal";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBuilding,
  IconChartBubble,
  IconChartTreemap,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconEdit,
  IconLocation,
  IconMapPin,
  IconMicrophone,
  IconPin,
  IconTool,
  IconTrash,
  IconUser,
} from "@tabler/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getResearchPointTypes, {
  getResearchPoint,
} from "@utils/requests/getResearchPointTypes";
import {
  generateSamples,
  getVoiceBuilderDetails,
} from "@utils/requests/voiceBuilder";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { CTA, PersonaOverview, Prospect, ResearchPointType } from "src";
import { socket } from "../../App";
import { deleteSample } from "@utils/requests/voiceBuilder";

interface VoiceBuilderMessages {
  id: number;
  value: string;
  prospect: Prospect | null;
  meta_data: any;
  problems: any;
  highlighted_words: any;
  is_approved: boolean;
}

interface VoiceBuilderDetails {
  messages: VoiceBuilderMessages[];
  generated_prompt: string;
  voice_onboarding_info: {
    id: number;
    client_id: number;
    client_archetype_id: number;
    generated_message_type: number;
    stack_ranked_message_generation_configuration_id: number;
    instruction: number;
    created_at: number;
    ready: boolean;
  };
}

interface VoiceBuilderCTAs {
  active: boolean;
  archetype_id: number;
  auto_mark_as_scheduling_on_acceptance: boolean;
  cta_type: string;
  expiration_date: string;
  id: number;
  text_value: string;
}

interface VoiceBuilderResearchPoints {
  flagged: any;
  id: number;
  research_payload_id: number;
  research_point_metadata: any;
  research_point_type: string;
  value: string;
}

interface ResearchPoints {
  id: number;
  research_point_type: string;
  value: string;
}

export default function TrainVoice(props: {
  close: () => void;
  selectedVoice?: number;
  voiceBuilderOnboardingId?: number;
  userToken: string;
  currentProject?: PersonaOverview;
  voices: Voices[];
  numProspects: number
}) {
  const [voiceBuilderOnboardingId, setVoiceBuilderOnboardingId] = useState<
    number | null
  >(null);

  const [voiceBuilderDetails, setVoiceBuilderDetails] =
    useState<VoiceBuilderDetails | null>(null);

  const [voiceName, setVoiceName] = useState<string>("Baseline Voice");

  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(
    null
  );

  const [ctaOrResearchPointTypeChanged, setCtaOrResearchPointTypeChanged] =
    useState<boolean>(false);

  const [selectedMessage, setSelectedMessage] =
    useState<VoiceBuilderMessages | null>(null);

  const [useNewCTAs, setUseNewCTAs] = useState<Map<number, number | null>>(
    new Map()
  );

  const [useNewResearchPointTypes, setUseNewResearchPointTypes] = useState<
    Map<number, number[]>
  >(new Map());

  const readableScore = useMemo(() => {
    let readable_score = "";
    let color = "gray";
    switch (selectedMessage?.prospect?.icp_fit_score) {
      case -1:
        color = "gray";
        readable_score = "Not Scored";
        break;
      case 0:
        color = "red";
        readable_score = "Very Low";
        break;
      case 1:
        color = "orange";
        readable_score = "Low";
        break;
      case 2:
        color = "yellow";
        readable_score = "Medium";
        break;
      case 3:
        color = "blue";
        readable_score = "High";
        break;
      case 4:
        color = "green";
        readable_score = "Very High";
        break;
      default:
        readable_score = "Unknown";
        break;
    }

    return { color, readable_score };
  }, [selectedMessage]);

  const [savingPrompt, setSavingPrompt] = useState(false);
  const [stackRankedConfigurationData, setStackRankedConfigurationData] =
    useState<any>({});

  const [
    stackRankedConfigurationDataChanged,
    setStackRankedConfigurationDataChanged,
  ] = useState(false);

  // We map the message Id with the CTA id

  const [editViewMode, setEditViewMode] = useState("advanced");

  const [promptChanged, setPromptChanged] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [regenerateLoading, setRegenerateLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const [toggleEditConfig, setToggleEditConfig] = useState<boolean>(false);

  const client = useQueryClient();

  useEffect(() => {
    if (voiceBuilderOnboardingId) {
      socket.on(`voice_builder_${voiceBuilderOnboardingId}`, (data) => {
        showNotification({
          title: "Created 1 Sample Message",
          message: "Successfully created one sample message.",
          color: "green",
        });

        refetch();
      });
    }

    return () => {
      socket.off(`voice_builder_`);
      socket.off(`voice_builder_${voiceBuilderOnboardingId}`);
    };
  }, [voiceBuilderOnboardingId]);

  useEffect(() => {
    if (props.voiceBuilderOnboardingId) {
      setVoiceBuilderOnboardingId(props.voiceBuilderOnboardingId);
    } else if (props.selectedVoice) {
      setVoiceBuilderOnboardingId(
        props.voices.find((item) => item.id === props.selectedVoice)
          ?.voice_builder_onboarding_id ?? null
      );
    }
  }, [props.voiceBuilderOnboardingId, props.selectedVoice]);

  const { isFetching, refetch } = useQuery({
    queryKey: [`query-get-voice-details-${voiceBuilderOnboardingId}`],
    queryFn: async () => {
      const response = await getVoiceBuilderDetails(
        props.userToken,
        voiceBuilderOnboardingId!
      );

      let messageDetails: VoiceBuilderMessages[] = [];
      const ctaMapping = new Map<number, number>();
      const researchPointMapping = new Map<number, number[]>();

      if (response.data.sample_info.length > 0) {
        messageDetails = response.data.sample_info
          .sort((a: any, b: any) => {
            return a.id - b.id;
          })
          .map((item: any) => {
            ctaMapping.set(item.id, item.meta_data.cta.id);
            researchPointMapping.set(
              item.id,
              item.meta_data.research_points.map((r: any) => r.id)
            );

            return {
              id: item.id,
              value: item.sample_completion,
              prospect: item.prospect,
              meta_data: item.meta_data,
              problems: item.sample_problems,
              highlighted_words: item.highlighted_words,
              is_approved: item.is_approved,
            };
          });
      }

      setUseNewCTAs(ctaMapping);
      setUseNewResearchPointTypes(researchPointMapping);

      setVoiceBuilderDetails({
        messages: messageDetails,
        generated_prompt: response.data.computed_prompt,
        voice_onboarding_info: response.data.voice_builder_onboarding_info,
      } as VoiceBuilderDetails);

      if (messageDetails.length > 0) {
        setSelectedMessage(messageDetails[0]);
        setSelectedProspectId(messageDetails[0].prospect?.id ?? null);
      }

      return {
        messages: messageDetails,
        generated_prompt: response.data.computed_prompt,
        voice_onboarding_info: response.data.voice_builder_onboarding_info,
      } as VoiceBuilderDetails;
    },
    enabled: !!voiceBuilderOnboardingId && !!props.currentProject,
    refetchOnWindowFocus: false,
  });

  // get research points for selected prospect
  const {
    data: researchPoints,
    refetch: researchPointsRefetch,
    isFetching: researchPointsIsFetching,
  } = useQuery({
    queryKey: [`query-get-research-points`, selectedMessage?.prospect?.id],
    queryFn: async () => {
      const response = await getResearchPoint(
        props.userToken,
        selectedMessage!.prospect!.id!
      );

      return response.status === "success"
        ? (response.data as ResearchPoint[])
        : [];
    },
    enabled: !!selectedMessage && !!selectedMessage.prospect,
    refetchOnWindowFocus: false,
  });

  const {
    data: ctas,
    isFetching: ctaIsFetching,
    refetch: ctaRefetch,
  } = useQuery({
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

      if (!pageData) {
        return [];
      } else {
        return _.sortBy(pageData, ["active", "percentage", "id"]).reverse();
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!props.currentProject,
  });

  const srmgc_id = props.selectedVoice
    ? props.selectedVoice
    : voiceBuilderDetails?.voice_onboarding_info
        .stack_ranked_message_generation_configuration_id;

  const {
    data: stackRankedGenerationData,
    refetch: refetchStackRankedGeneration,
    isFetching: stackRankedIsFetching,
  } = useQuery({
    queryKey: [`query-get-stack-ranked-${srmgc_id}`],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/message_generation/stack_ranked_configurations/${srmgc_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${props.userToken}`,
          },
        }
      );

      if (response.ok) {
        const responseJson = await response.json();

        setStackRankedConfigurationData(responseJson.data);

        if (responseJson.data?.prompt_1) {
          setEditViewMode("edit_voice");
        }

        return responseJson.data;
      }

      return {};
    },
    enabled:
      !!props.selectedVoice ||
      !voiceBuilderDetails?.voice_onboarding_info
        .stack_ranked_message_generation_configuration_id,
    refetchOnWindowFocus: false,
  });

  // Need to grab CTAs
  // Need to grab Research point types
  // When we make edits, we edit the onboarding info and sample itself
  // If we did not create the stacked_ranked_message_config yet, we will generate the message
  // if we did, we just modify the existing
  //

  const saveStackRankedConfigurationData = () => {
    setSavingPrompt(true);

    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration_tool/update_stack_ranked_configuration_data`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configuration_id: props.selectedVoice,
          instruction: stackRankedConfigurationData?.instruction,
          completion_1: stackRankedConfigurationData?.completion_1,
          completion_2: stackRankedConfigurationData?.completion_2,
          completion_3: stackRankedConfigurationData?.completion_3,
          completion_4: stackRankedConfigurationData?.completion_4,
          completion_5: stackRankedConfigurationData?.completion_5,
          completion_6: stackRankedConfigurationData?.completion_6,
          completion_7: stackRankedConfigurationData?.completion_7,
        }),
      }
    )
      .then((res) => {
        setStackRankedConfigurationDataChanged(false);
        setSavingPrompt(false);
      })
      .finally(() => {
        setSavingPrompt(false);
        setStackRankedConfigurationDataChanged(false);
        showNotification({
          title: "Voice Saved",
          message: "Your updated voice was saved successfully",
          color: "green",
          autoClose: 5000,
        });

        refetch();
      });
  };

  const saveUpdatedPrompt = () => {
    setSavingPrompt(true);
    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration_tool/update_computed_prompt`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_prompt: prompt,
          configuration_id: props.selectedVoice,
        }),
      }
    )
      .then((res) => {
        setPromptChanged(false);
        setSavingPrompt(false);
      })
      .finally(() => {
        setSavingPrompt(false);
        setPromptChanged(false);
        showNotification({
          title: "Prompt updated",
          message: "The prompt was updated successfully",
          color: "green",
          autoClose: 5000,
        });
        refetch();
      });
  };

  const deleteStackRankedSample = (
    promptToDelete: string,
    completionToDelete: string,
    stackRankedConfigurationId: number
  ) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + props.userToken);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      prompt_to_delete: promptToDelete,
      completion_to_delete: completionToDelete,
      stack_ranked_configuration_id: stackRankedConfigurationId,
    });

    var requestOptions: any = {
      method: "DELETE",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${API_URL}/message_generation/stack_ranked_config/delete_sample`,
      requestOptions
    )
      .then((response) => response.text())
      .catch((error) => console.log("error", error))
      .finally(() => {
        refetchStackRankedGeneration();
        showNotification({
          title: "Sample Deleted",
          message: "The sample was deleted successfully",
          color: "green",
          autoClose: 5000,
        });
      });
  };

  const generateOneMessageSample = async function (voiceId: number) {
    const messageResponse = await generateSamples(props.userToken, voiceId, 1);

    if (messageResponse.status === "success") {
      showNotification({
        title: "Started Samples creation for voices",
        message:
          "We have begin initiating the samples generation process. Please do not leave the page",
        color: "blue",
      });

      setLoading(false);

      refetch();
    } else {
      showNotification({
        title: "Failed to generate samples for Onboarding",
        message:
          "We have failed to generate samples for Onboarding. Try again later.",
        color: "red",
      });
    }
  };

  const onGenerateOneSample = async function () {
    setLoading(true);
    if (voiceBuilderDetails?.voice_onboarding_info.id) {
      await generateOneMessageSample(
        voiceBuilderDetails?.voice_onboarding_info.id
      );
    }
  };

  const onRegenerateSample = async function () {
    if (!selectedMessage) return;

    setRegenerateLoading(true);

    const response = await fetch(`${API_URL}/voice_builder/regenerate_sample`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${props.userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_builder_sample_id: selectedMessage.id,
        cta_id: useNewCTAs.get(selectedMessage.id),
        research_points_id: useNewResearchPointTypes.get(selectedMessage.id),
      }),
    });

    if (response.ok) {
      showNotification({
        title: "Successfully Regenerate one sample.",
        message: "Successfully regenerated a message sample.",
        color: "green",
      });

      refetch();
    } else {
      showNotification({
        title: "Failed to regenerate one sample.",
        message: "Failed to regenerate a message sample.",
        color: "red",
      });
    }

    setRegenerateLoading(false);
  };

  const onDeleteSample = async function (sample_id: number) {
    setDeleteLoading(true);
    const response = await deleteSample(props.userToken, sample_id);

    if (response.status === "success") {
      showNotification({
        title: "Successfully Deleted one sample.",
        message: "Successfully deleted a message sample.",
        color: "green",
      });

      refetch();
    } else {
      showNotification({
        title: "Failed to delete one sample.",
        message: "Failed to delete a message sample. Please wait a moment.",
        color: "red",
      });
    }

    setDeleteLoading(false);
  };

  const onSaveConfiguration = async function () {
    setSaveLoading(true);
    const response = await fetch(
      `${API_URL}/voice_builder/save_configuration`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voice_builder_details: voiceBuilderDetails,
          name: voiceName,
        }),
      }
    );

    if (response.ok) {
      showNotification({
        title: "Successfully saved configurations!",
        message:
          "Successfully saved your configuration, as well as your onboarding",
        color: "green",
      });

      refetch();
      refetchStackRankedGeneration();
      client.invalidateQueries({
        queryKey: [`query-voices`, props.currentProject?.id],
      });
      client.invalidateQueries({
        queryKey: [`query-onboardings`, props.currentProject?.id],
      });
    } else {
      showNotification({
        title: "Failed to save configuration.",
        message: "Failed to save or generate your stack ranked configuration.",
        color: "red",
      });
    }

    setSaveLoading(false);
  };

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Box p={"md"} style={{ position: "relative" }}>
      <LoadingOverlay visible={isFetching || stackRankedIsFetching} />
      <Flex align={"center"} gap={"0.5rem"} mb="xs">
        <Anchor
          fz={"1rem"}
          color="gray.6"
          mt={3}
          ml={5}
          onClickCapture={() => {
            props.close();
          }}
        >
          <Flex align="center" gap="0.5rem" justify={"space-between"}>
            <Flex>
              <IconArrowLeft size={"1.5rem"} />
              <Text fz={"1rem"}>
                Go back to{" "}
                <span className="text-black font-semibold">Voice Selector</span>
              </Text>
            </Flex>
          </Flex>
        </Anchor>
      </Flex>

      {voiceBuilderDetails && !toggleEditConfig && (
        <>
          <Paper bg={"blue"} p={"sm"} radius={"sm"} mt={"sm"}>
            <Flex gap={"sm"} justify={"space-between"}>
              <Flex align={"center"} gap={"8px"}>
                <IconMicrophone size={"1rem"} color="white" />
                <TextInput
                  radius="xs"
                  placeholder="Voice Name"
                  value={voiceName}
                  onChange={(event) => setVoiceName(event.currentTarget.value)}
                />
                {voiceBuilderDetails.voice_onboarding_info.ready ? (
                  <Badge variant="filled" size="md" color={"green"}>
                    Message samples generated
                  </Badge>
                ) : voiceBuilderDetails.voice_onboarding_info.ready ===
                  false ? (
                  <Badge variant="filled" size="md" color={"orange"}>
                    Message Samples Generating
                  </Badge>
                ) : (
                  <></>
                )}
                {stackRankedGenerationData && (
                  <Switch
                    onLabel={"Edit Samples"}
                    offLabel={"Edit Configurations"}
                    checked={toggleEditConfig}
                    onChange={(event) =>
                      setToggleEditConfig(event.currentTarget.checked)
                    }
                    size={"lg"}
                    color={"green"}
                  />
                )}
              </Flex>

              {voiceBuilderDetails.voice_onboarding_info.ready &&
                voiceBuilderDetails.messages.every(
                  (item) => item.is_approved
                ) && (
                  <Button
                    color={"green"}
                    onClick={async () => {
                      await onSaveConfiguration();
                    }}
                    disabled={saveLoading}
                  >
                    {saveLoading ? <Loader size={"xs"} /> : "Create Voice!"}
                  </Button>
                )}
              {voiceBuilderDetails.voice_onboarding_info
                .stack_ranked_message_generation_configuration_id &&
                voiceBuilderDetails.messages.every(
                  (item) => item.is_approved
                ) && (
                  <Button
                    color={"green"}
                    onClick={async () => {
                      await onSaveConfiguration();
                    }}
                    disabled={saveLoading}
                  >
                    {saveLoading ? <Loader size={"xs"} /> : "Save Voice!"}
                  </Button>
                )}
            </Flex>
          </Paper>
          <Flex mt={"md"} gap={"sm"}>
            <Flex direction={"column"} gap={"4px"} w={"25%"}>
              <Paper w={"100%"} withBorder radius={"sm"} h={"fit-content"}>
                <Flex p={"sm"}>
                  <Text fw={500}>Example Prospects</Text>
                </Flex>
                <Divider />
                {voiceBuilderDetails.messages.map((item) => {
                  let readable_score = "";
                  let color = "gray";
                  switch (item.prospect?.icp_fit_score) {
                    case -1:
                      color = "gray";
                      readable_score = "Not Scored";
                      break;
                    case 0:
                      color = "red";
                      readable_score = "Very Low";
                      break;
                    case 1:
                      color = "orange";
                      readable_score = "Low";
                      break;
                    case 2:
                      color = "yellow";
                      readable_score = "Medium";
                      break;
                    case 3:
                      color = "blue";
                      readable_score = "High";
                      break;
                    case 4:
                      color = "green";
                      readable_score = "Very High";
                      break;
                    default:
                      readable_score = "Unknown";
                      break;
                  }

                  return (
                    <>
                      <Flex
                        align={"center"}
                        gap={"sm"}
                        key={item.id}
                        p={"xs"}
                        onClick={() => {
                          setSelectedProspectId(item.prospect?.id ?? null);
                          setSelectedMessage(item);
                        }}
                        bg={
                          selectedProspectId === item.prospect?.id
                            ? "#F0F2FF"
                            : ""
                        }
                      >
                        <Avatar src={item.prospect?.img_url} radius={"xl"} />
                        <Stack spacing={2}>
                          <Flex align={"center"} gap={"sm"}>
                            <Text fw={500} size={"sm"}>
                              {item.prospect?.full_name}
                            </Text>
                            <Badge color={color}>{readable_score}</Badge>
                            <Badge
                              color={item.is_approved ? "green" : "red"}
                              variant={"filled"}
                              size={"xs"}
                            ></Badge>
                          </Flex>
                          <Text color="gray" lineClamp={1} size={"xs"} fw={500}>
                            {item.prospect?.title}, {item.prospect?.company}
                          </Text>
                        </Stack>
                      </Flex>
                      <Divider bg={"gray"} />
                    </>
                  );
                })}
              </Paper>
              {voiceBuilderDetails.messages.length < Math.min(7, props.numProspects) && (
                <Button
                  p={"xs"}
                  onClick={async () => {
                    await onGenerateOneSample();
                  }}
                  variant={"outline"}
                  style={{ width: "100%" }}
                  mt={"8px"}
                  disabled={loading}
                >
                  {!loading && (
                    <Text color="gray" lineClamp={1} size={"xs"} fw={500}>
                      Generate 1 Sample{" "}
                    </Text>
                  )}
                  {loading && <Loader size={"xs"} />}
                </Button>
              )}
            </Flex>
            {selectedMessage && (
              <>
                <Box w={"45%"}>
                  <Paper withBorder radius={"sm"} p={"sm"}>
                    <Text fw={600}>Edit message to your style</Text>
                    <Text size={13} fw={500} color="gray">
                      After you verify make sure to select the Verified button.
                    </Text>
                    <Divider my={"sm"} />
                    <Flex align={"center"} gap={"sm"}>
                      <Avatar
                        src={selectedMessage?.prospect?.img_url}
                        radius={"xl"}
                      />
                      <Stack spacing={2}>
                        <Text fw={500} size={"sm"}>
                          {selectedMessage?.prospect?.full_name}
                        </Text>
                        <Text color="gray" size={"xs"} fw={500}>
                          {selectedMessage?.prospect?.title},{" "}
                          {selectedMessage?.prospect?.company}
                        </Text>
                      </Stack>
                    </Flex>
                    <Flex direction={"column"} align={"end"}>
                      <Paper
                        bg={"#E9ECEF"}
                        p={4}
                        style={{
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                        mb={-1}
                        mr={1}
                      >
                        <Text fw={500} size={"xs"} color="#ADB5BD">
                          {selectedMessage?.value.length}/300
                        </Text>
                      </Paper>
                      <Textarea
                        w={"100%"}
                        autosize
                        minRows={7}
                        maxLength={300}
                        value={selectedMessage.value}
                        onChange={(e) =>
                          setSelectedMessage((prevState) => {
                            return { ...prevState!, value: e.target.value };
                          })
                        }
                        styles={{
                          input: {
                            background: "#F1F3F5",
                          },
                        }}
                      />
                    </Flex>
                    <Flex align={"center"} mt={"md"} justify={"space-between"}>
                      <Button
                        variant="outline"
                        color="red"
                        w={200}
                        onClick={async () => {
                          await onDeleteSample(selectedMessage.id);
                        }}
                        disabled={deleteLoading}
                      >
                        {!deleteLoading && "Delete"}
                        {deleteLoading && <Loader size={"xs"} />}
                      </Button>
                      <Button
                        w={200}
                        onClick={() => {
                          setVoiceBuilderDetails((prevState) => {
                            const newMessages = prevState!.messages.map(
                              (item) => {
                                if (item.id === selectedMessage!.id) {
                                  return selectedMessage;
                                } else {
                                  return item;
                                }
                              }
                            );

                            return { ...prevState!, messages: newMessages };
                          });
                        }}
                      >
                        Save
                      </Button>
                    </Flex>
                  </Paper>
                  <Flex align={"center"} gap={"sm"} w={"100%"} mt={"md"}>
                    <Button
                      color="red"
                      fullWidth
                      onClick={() => {
                        setVoiceBuilderDetails((prevState) => {
                          const newMessage = {
                            ...selectedMessage,
                            is_approved: false,
                          };
                          setSelectedMessage(newMessage);
                          const newMessages = prevState!.messages.map(
                            (item) => {
                              if (item.id === newMessage.id) {
                                return newMessage;
                              }

                              return item;
                            }
                          );

                          return { ...prevState!, messages: newMessages };
                        });
                      }}
                    >
                      Unapprove Message
                    </Button>
                    <Button
                      color="green"
                      fullWidth
                      disabled={selectedMessage.value.length > 300}
                      onClick={() => {
                        setVoiceBuilderDetails((prevState) => {
                          const newMessage = {
                            ...selectedMessage,
                            is_approved: true,
                          };
                          setSelectedMessage(newMessage);
                          const newMessages = prevState!.messages.map(
                            (item) => {
                              if (item.id === newMessage.id) {
                                return newMessage;
                              }

                              return item;
                            }
                          );

                          return { ...prevState!, messages: newMessages };
                        });
                      }}
                    >
                      Approve Message
                    </Button>
                  </Flex>
                </Box>

                <Paper withBorder radius={"sm"} w={"30%"}>
                  <Flex align={"center"} gap={"sm"} p={"sm"} px={"md"}>
                    <Flex direction={"column"} align={"center"}>
                      <Card p={2} withBorder shadow="sm">
                        <Avatar
                          src={selectedMessage.prospect?.img_url}
                          size={"lg"}
                          radius={"xs"}
                        />
                      </Card>
                      <Badge mt={"sm"} size="sm" color={readableScore.color}>
                        {readableScore.readable_score}
                      </Badge>
                    </Flex>
                    <Stack spacing={2}>
                      <Text size={"md"} fw={600}>
                        {selectedMessage.prospect?.full_name}
                      </Text>
                      <Flex align={"center"} gap={"sm"}>
                        <IconBuilding size={"0.8rem"} color="gray" />
                        <Text size={"xs"} color="gray" fw={500}>
                          {selectedMessage.prospect?.title}
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <IconMapPin size={"0.8rem"} color="gray" />
                        <Text size={"xs"} color="gray" fw={500}>
                          {selectedMessage.prospect?.location}
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <IconUser size={"0.8rem"} color="gray" />
                        <Text size={"xs"} color="gray" fw={500}>
                          {selectedMessage.prospect?.company}
                        </Text>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <FaLinkedin size={"0.8rem"} color="gray" />
                        <Text size={"xs"} color="gray" fw={500}>
                          {selectedMessage.prospect?.linkedin_url}
                        </Text>
                      </Flex>
                    </Stack>
                  </Flex>
                  <Divider />
                  <Stack spacing={"sm"} p={"sm"}>
                    <Flex direction={"column"}>
                      <Text size={"sm"} color="gray" fw={500}>
                        Write message with these points:
                      </Text>
                      {ctaOrResearchPointTypeChanged && (
                        <Button
                          size={"sm"}
                          color={"green"}
                          disabled={
                            !useNewCTAs.get(selectedMessage.id) ||
                            useNewResearchPointTypes.get(selectedMessage.id)
                              ?.length === 0 ||
                            regenerateLoading
                          }
                          onClick={async () => {
                            await onRegenerateSample();
                          }}
                        >
                          {!useNewCTAs.get(selectedMessage.id) ? (
                            "Please Select 1 CTA"
                          ) : useNewResearchPointTypes.get(selectedMessage.id)
                              ?.length === 0 ? (
                            "Please Select at least 1 Research Point"
                          ) : regenerateLoading ? (
                            <Loader size={"xs"} />
                          ) : (
                            "Save and Regenerate"
                          )}
                        </Button>
                      )}
                    </Flex>
                    <FeebackComponent
                      usedCTA={selectedMessage.meta_data.cta}
                      availableCTAs={ctas as CTA[]}
                      setCtaOrResearchPointTypeChanged={
                        setCtaOrResearchPointTypeChanged
                      }
                      selectedMessage={selectedMessage}
                      useNewCTAs={useNewCTAs}
                      setUseNewCTAs={setUseNewCTAs}
                      loading={isFetching || ctaIsFetching}
                    />
                    <ResearchUsedComponent
                      usedResearchPoints={
                        selectedMessage.meta_data.research_points ?? []
                      }
                      availableResearchPoints={
                        researchPoints as ResearchPoints[]
                      }
                      setCtaOrResearchPointTypeChanged={
                        setCtaOrResearchPointTypeChanged
                      }
                      selectedMessage={selectedMessage}
                      useNewResearchPointTypes={useNewResearchPointTypes}
                      setUseNewResearchPointTypes={setUseNewResearchPointTypes}
                      loading={researchPointsIsFetching || isFetching}
                    />
                  </Stack>
                </Paper>
              </>
            )}
          </Flex>
        </>
      )}
      {(!voiceBuilderDetails || toggleEditConfig) &&
        stackRankedGenerationData && (
          <Paper
            p={0}
            style={{
              position: "relative",
            }}
          >
            <LoadingOverlay visible={isFetching} />
            <Flex align={"center"} gap={"8px"}>
              <Title order={4}>Edit Voice Samples</Title>
              {voiceBuilderDetails && (
                <Switch
                  onLabel={"Edit Samples"}
                  offLabel={"Edit Configurations"}
                  checked={toggleEditConfig}
                  onChange={(event) =>
                    setToggleEditConfig(event.currentTarget.checked)
                  }
                  size={"lg"}
                  color={"green"}
                />
              )}
            </Flex>

            <Text mt="xs">
              Edit the samples and instructions below to change how messages are
              generated in this voice.
            </Text>

            {true && ( // !stackRankedConfigurationData?.name?.includes('Baseline')
              <Box pt="sm" sx={{ flexDirection: "row", display: "flex" }}>
                <Button
                  color="green"
                  ml="auto"
                  disabled={!stackRankedConfigurationDataChanged}
                  onClick={() => {
                    setStackRankedConfigurationDataChanged(false);
                    saveStackRankedConfigurationData();
                  }}
                  loading={savingPrompt}
                >
                  Save Configuration
                </Button>
              </Box>
            )}

            <Divider mt="md" mb="md" />
            <Tabs value={editViewMode}>
              <Tabs.List>
                {editViewMode === "edit_voice" && (
                  <Tabs.Tab
                    value="edit_voice"
                    icon={<IconChartBubble size="0.8rem" />}
                  >
                    Edit Voice Instruction & Samples
                  </Tabs.Tab>
                )}
                {editViewMode === "advanced" && (
                  <Tabs.Tab value="advanced" icon={<IconTool size="0.8rem" />}>
                    Advanced Edit Mode
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="edit_voice" pt="xs">
                <Flex direction="row">
                  <Textarea
                    w="40%"
                    minRows={21}
                    label="Instruction"
                    description="This is the instruction that will be used to generate messages in this voice"
                    defaultValue={stackRankedConfigurationData?.instruction?.replace(
                      "Follow instructions to generate a short intro message:\n",
                      ""
                    )}
                    size="xs"
                    onChange={(e) => {
                      setStackRankedConfigurationDataChanged(true);

                      if (stackRankedConfigurationData?.instruction) {
                        stackRankedConfigurationData.instruction =
                          "Follow instructions to generate a short intro message:\n" +
                          e.currentTarget.value;
                        setStackRankedConfigurationData(
                          stackRankedConfigurationData
                        );
                      }
                    }}
                  />
                  <Card
                    sx={{
                      maxHeight: "450px",
                      overflowY: "scroll",
                      width: "60%",
                    }}
                    m="sm"
                    withBorder
                  >
                    <Text>Completions</Text>
                    <Text size="xs">
                      These are the completions that will be used to generate
                      messages in this voice. Edit the completions below to
                      change how messages are generated.
                    </Text>
                    {[1, 2, 3, 4, 5, 6, 7].map((i, index) => {
                      const promptKey = "prompt_" + i;
                      const completionKey = "completion_" + i;

                      if (!stackRankedConfigurationData[promptKey]) {
                        return null;
                      }

                      const meta_data = metaDataFromPrompt(
                        stackRankedConfigurationData[promptKey]
                      );

                      return (
                        <Box w="100%">
                          <AiMetaDataBadge
                            location={{
                              position: "relative",
                              top: 35,
                              left: 70,
                            }}
                            bumpFrameworkId={0}
                            bumpFrameworkTitle={""}
                            bumpFrameworkDescription={""}
                            bumpFrameworkLength={""}
                            bumpNumberConverted={undefined}
                            bumpNumberUsed={undefined}
                            accountResearchPoints={meta_data.research || []}
                            initialMessageId={-1}
                            initialMessageCTAId={0}
                            initialMessageCTAText={meta_data.cta || ""}
                            initialMessageResearchPoints={
                              meta_data.research || []
                            }
                            initialMessageStackRankedConfigID={undefined}
                            initialMessageStackRankedConfigName={
                              "Baseline Linkedin"
                            }
                            cta={meta_data.cta || ""}
                          />
                          <Tooltip label="Remove this sample from voice.">
                            <Button
                              size="xs"
                              variant="subtle"
                              sx={{
                                position: "relative",
                                top: 38,
                                left: 70,
                              }}
                              onClick={() => {
                                openConfirmModal({
                                  title: "Delete this sample?",
                                  children: (
                                    <Text>
                                      Are you sure you want to delete this
                                      sample? This will remove it from the voice
                                      and it will no longer be used to generate
                                      messages.
                                    </Text>
                                  ),
                                  labels: {
                                    confirm: "Confirm",
                                    cancel: "Cancel",
                                  },
                                  onCancel: () => {},
                                  onConfirm: () => {
                                    deleteStackRankedSample(
                                      promptKey,
                                      completionKey,
                                      stackRankedConfigurationData.id
                                    );
                                  },
                                });
                              }}
                            >
                              <IconTrash size="0.8rem" />
                            </Button>
                          </Tooltip>
                          <Textarea
                            w="100%"
                            icon={<IconChartTreemap size="0.8rem" />}
                            minRows={5}
                            mt="sm"
                            size="xs"
                            label={`Sample ${index + 1}`}
                            placeholder="Raw voice prompt..."
                            defaultValue={
                              stackRankedConfigurationData[completionKey]
                            }
                            disabled={!!voiceBuilderDetails}
                            onChange={(e) => {
                              setStackRankedConfigurationDataChanged(true);

                              stackRankedConfigurationData[completionKey] =
                                e.currentTarget.value;
                              setStackRankedConfigurationData(
                                stackRankedConfigurationData
                              );
                            }}
                            error={
                              stackRankedConfigurationData[completionKey]
                                .length > 300
                                ? "Completion is too long. Please shorten it to 300 characters or less."
                                : null
                            }
                          />
                          <Text
                            size="xs"
                            mt="xs"
                            align="right"
                            color={
                              stackRankedConfigurationData[completionKey]
                                .length > 300
                                ? "red"
                                : "gray"
                            }
                          >
                            {
                              stackRankedConfigurationData[completionKey]
                                ?.length
                            }{" "}
                            / 300
                          </Text>
                        </Box>
                      );
                    })}
                  </Card>
                </Flex>
              </Tabs.Panel>

              <Tabs.Panel value="advanced" pt="xs">
                <Card withBorder>
                  <Card withBorder mb="xs">
                    <IconAlertCircle size="1.2rem" color="red" />
                    <Text color="red" weight={700} size="xs">
                      WARNING: This voice was made using the old voice builder
                      so it will need to be edited using the raw prompt. Please
                      contact a SellScale engineer if you need help fixing this
                      voice.
                    </Text>
                  </Card>
                  <Textarea
                    minRows={15}
                    label="Raw Voice Prompt"
                    description="This is the raw prompt use by SellScale to generate messages in this voice"
                    placeholder="Raw voice prompt..."
                    value={stackRankedGenerationData.computed_prompt}
                    onChange={(e) => {
                      setStackRankedConfigurationData((prevState: any) => {
                        return {
                          ...prevState!,
                          computed_prompt: e.currentTarget.value,
                        };
                      });
                      setPromptChanged(true);
                    }}
                  />
                  <Button
                    color="green"
                    mt="sm"
                    disabled={!promptChanged}
                    onClick={() => {
                      saveUpdatedPrompt();
                    }}
                    loading={savingPrompt}
                  >
                    Save Prompt
                  </Button>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}

      <Modal
        opened={opened}
        size="auto"
        centered
        onClose={close}
        withCloseButton={false}
      >
        <Paper>
          <Flex justify={"center"} align={"center"} direction={"column"}>
            <IconCircleCheck fill="#37B24D" color="white" size={"3rem"} />
            <Text size={"md"} fw={500}>
              Your new voice is created!
            </Text>
            <Divider w={"100%"} my={"md"} />
            <Flex align={"center"} gap={4}>
              <Text size={"sm"} color="gray" fw={400}>
                Name:
              </Text>
              <Text size={"sm"} color="blue">
                {"Hunter's Voice (Sep 6, 2024)"}
              </Text>
              <ActionIcon color="blue">
                <IconEdit size={"1rem"} />
              </ActionIcon>
            </Flex>
            <Button mt={"sm"} fullWidth onClick={() => props.close()}>
              Go Back to Voice Selector
            </Button>
          </Flex>
        </Paper>
      </Modal>
    </Box>
  );
}

const FeebackComponent = (props: {
  usedCTA: VoiceBuilderCTAs;
  availableCTAs: CTA[];
  setCtaOrResearchPointTypeChanged: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  selectedMessage: VoiceBuilderMessages;
  useNewCTAs: Map<number, number | null>;
  setUseNewCTAs: React.Dispatch<
    React.SetStateAction<Map<number, number | null>>
  >;
  loading: boolean;
}) => {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Box style={{ position: "relative" }}>
      <LoadingOverlay visible={props.loading} />
      {!props.loading && (
        <>
          <Text size={"sm"} fw={500}>
            CTA Used
          </Text>
          <Paper
            p={"sm"}
            pt={"md"}
            mt={"md"}
            withBorder
            style={{ border: "2px solid #38D9A9", position: "relative" }}
          >
            <Checkbox
              size={"xs"}
              checked={
                props.useNewCTAs.get(props.selectedMessage.id) ===
                props.usedCTA.id
              }
              onChange={(event) => {
                const newMap = new Map(props.useNewCTAs);
                newMap.set(
                  props.selectedMessage.id,
                  event.currentTarget.checked ? props.usedCTA.id : null
                );
                props.setUseNewCTAs(newMap);
                props.setCtaOrResearchPointTypeChanged(true);
              }}
            />
            <Badge color="teal" tt={"initial"} className="absolute top-[-10px]">
              {`${props.usedCTA.cta_type.replace("based", "")}-based`}
            </Badge>
            <Text size={"sm"} fw={500}>
              {props.usedCTA.text_value}
            </Text>
          </Paper>
          <Divider
            my="xs"
            variant="dashed"
            labelPosition="center"
            label={
              <Flex align={"center"} gap={6}>
                <Text color="gray">View more CTAs</Text>
                <ActionIcon
                  variant="light"
                  size={"xs"}
                  radius={"xl"}
                  onClick={toggle}
                >
                  {!opened ? (
                    <IconChevronDown size={"1rem"} />
                  ) : (
                    <IconChevronUp size={"1rem"} />
                  )}
                </ActionIcon>
              </Flex>
            }
          />
          <Collapse in={opened}>
            <Flex direction={"column"} gap={"xs"} mt={4}>
              {props.availableCTAs
                .filter((cta) => cta.active && cta.id !== props.usedCTA.id)
                .map((item: CTA, index: number) => {
                  return (
                    <Flex
                      gap={"xs"}
                      bg={"#F8F9FA"}
                      key={index}
                      align={"start"}
                      p={"xs"}
                      className="rounded-sm"
                    >
                      <Checkbox
                        size={"xs"}
                        checked={
                          props.useNewCTAs.get(props.selectedMessage.id) ===
                          item.id
                        }
                        onChange={(event) => {
                          const newMap = new Map(props.useNewCTAs);
                          newMap.set(
                            props.selectedMessage.id,
                            event.currentTarget.checked ? item.id : null
                          );
                          props.setUseNewCTAs(newMap);
                          props.setCtaOrResearchPointTypeChanged(true);
                        }}
                      />
                      <Stack spacing={2} mt={-2}>
                        <Text size={"sm"} fw={500}>
                          {`${item.cta_type.replace("based", "")}-based`}
                        </Text>
                        <Text size={"xs"} color="gray" fw={500} lineClamp={2}>
                          {item.text_value}
                        </Text>
                      </Stack>
                    </Flex>
                  );
                })}
            </Flex>
          </Collapse>
        </>
      )}
    </Box>
  );
};

const ResearchUsedComponent = (props: {
  usedResearchPoints: VoiceBuilderResearchPoints[];
  availableResearchPoints: ResearchPoints[];
  setCtaOrResearchPointTypeChanged: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  selectedMessage: VoiceBuilderMessages;
  useNewResearchPointTypes: Map<number, number[]>;
  setUseNewResearchPointTypes: React.Dispatch<
    React.SetStateAction<Map<number, number[]>>
  >;
  loading: boolean;
}) => {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Box style={{ position: "relative" }}>
      <LoadingOverlay visible={props.loading} />
      {!props.loading && (
        <>
          <Text size={"sm"} fw={500}>
            Research Used
          </Text>
          <Paper
            p={"sm"}
            pt={"md"}
            mt={"md"}
            withBorder
            style={{ border: "2px solid #FCC419", position: "relative" }}
          >
            <Badge
              color="yellow"
              tt={"initial"}
              className="absolute top-[-10px]"
            >
              Used Points
            </Badge>
            <Flex direction={"column"} gap={"xs"} mt={4}>
              {props.usedResearchPoints.map(
                (item: VoiceBuilderResearchPoints, index: number) => {
                  return (
                    <Flex
                      gap={"xs"}
                      bg={"#F8F9FA"}
                      key={index}
                      align={"start"}
                      p={"xs"}
                      className="rounded-sm"
                    >
                      <Checkbox
                        size={"xs"}
                        disabled={
                          !props.useNewResearchPointTypes
                            .get(props.selectedMessage.id)
                            ?.includes(item.id) &&
                          props.useNewResearchPointTypes.get(
                            props.selectedMessage.id
                          )?.length === 2
                        }
                        checked={props.useNewResearchPointTypes
                          .get(props.selectedMessage.id)
                          ?.includes(item.id)}
                        onChange={(event) => {
                          const newMap = new Map(
                            props.useNewResearchPointTypes
                          );

                          const previousValue =
                            newMap.get(props.selectedMessage.id) ?? [];

                          newMap.set(
                            props.selectedMessage.id,
                            event.currentTarget.checked
                              ? [...previousValue, item.id]
                              : previousValue.filter((i) => i !== item.id)
                          );
                          props.setUseNewResearchPointTypes(newMap);
                          props.setCtaOrResearchPointTypeChanged(true);
                        }}
                      />
                      <Stack spacing={2} mt={-2}>
                        <Text size={"sm"} fw={500}>
                          {item.research_point_type
                            .toLowerCase() // Convert to lowercase
                            .split("_") // Split by underscore
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ) // Capitalize first letter of each word
                            .join(" ")}
                        </Text>
                        <Text size={"xs"} color="gray" fw={500} lineClamp={4}>
                          {item.value}
                        </Text>
                      </Stack>
                    </Flex>
                  );
                }
              )}
            </Flex>
          </Paper>
          <Divider
            my="xs"
            variant="dashed"
            labelPosition="center"
            label={
              <Flex align={"center"} gap={6}>
                <Text color="gray">View more research points</Text>
                <ActionIcon
                  variant="light"
                  size={"xs"}
                  radius={"xl"}
                  onClick={toggle}
                >
                  {!opened ? (
                    <IconChevronDown size={"1rem"} />
                  ) : (
                    <IconChevronUp size={"1rem"} />
                  )}
                </ActionIcon>
              </Flex>
            }
          />
          <Collapse in={opened}>
            <Flex direction={"column"} gap={"xs"} mt={4}>
              {props.availableResearchPoints
                .filter(
                  (item) =>
                    !props.usedResearchPoints.map((i) => i.id).includes(item.id)
                )
                .map((item, index: number) => {
                  return (
                    <Flex
                      gap={"xs"}
                      bg={"#F8F9FA"}
                      key={index}
                      align={"start"}
                      p={"xs"}
                      className="rounded-sm"
                    >
                      <Checkbox
                        size={"xs"}
                        disabled={
                          !props.useNewResearchPointTypes
                            .get(props.selectedMessage.id)
                            ?.includes(item.id) &&
                          props.useNewResearchPointTypes.get(
                            props.selectedMessage.id
                          )?.length === 2
                        }
                        checked={props.useNewResearchPointTypes
                          .get(props.selectedMessage.id)
                          ?.includes(item.id)}
                        onChange={(event) => {
                          const newMap = new Map(
                            props.useNewResearchPointTypes
                          );

                          const previousValue =
                            newMap.get(props.selectedMessage.id) ?? [];

                          newMap.set(
                            props.selectedMessage.id,
                            event.currentTarget.checked
                              ? [...previousValue, item.id]
                              : previousValue.filter((i) => i !== item.id)
                          );
                          props.setUseNewResearchPointTypes(newMap);
                          props.setCtaOrResearchPointTypeChanged(true);
                        }}
                      />
                      <Stack spacing={2} mt={-2}>
                        <Text size={"sm"} fw={500}>
                          {item.research_point_type
                            .toLowerCase() // Convert to lowercase
                            .split("_") // Split by underscore
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ) // Capitalize first letter of each word
                            .join(" ")}
                        </Text>
                        <Text size={"xs"} color="gray" fw={500} lineClamp={1}>
                          {item.value}
                        </Text>
                      </Stack>
                    </Flex>
                  );
                })}
            </Flex>
          </Collapse>
        </>
      )}
    </Box>
  );
};
