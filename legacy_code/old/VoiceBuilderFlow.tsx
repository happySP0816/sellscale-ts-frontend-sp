import { useEffect, useState } from "react";
import {
  Checkbox,
  Title,
  Group,
  Avatar,
  Text,
  TransferList,
  TransferListItemComponent,
  TransferListItemComponentProps,
  Textarea,
  ActionIcon,
  Flex,
  Container,
  Button,
  TransferListItem,
  TransferListData,
  Center,
  LoadingOverlay,
  HoverCard,
  Anchor,
  Divider,
  ScrollArea,
  Tooltip,
  Loader,
  Card,
  Box,
  useMantineTheme,
  FocusTrap,
  Stack,
} from "@mantine/core";
import { Archetype, PersonaOverview, Prospect } from "src";
import {
  IconBrandLinkedin,
  IconCheck,
  IconEdit,
  IconHeart,
  IconHeartOff,
  IconPencil,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons";
import { getHotkeyHandler, useDebouncedState } from "@mantine/hooks";
import { useRecoilState, useRecoilValue } from "recoil";
import { voiceBuilderMessagesState } from "@atoms/voiceAtoms";
import {
  MAX_EDITING_PHASES,
  MSG_GEN_AMOUNT,
  STARTING_INSTRUCTIONS,
} from "@modals/VoiceBuilderModal";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  createVoice,
  deleteSample,
  generateSamples,
  updateOnboardingInstructions,
  updateSample,
} from "@utils/requests/voiceBuilder";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import _, { sample } from "lodash";
import { el } from "@fullcalendar/core/internal-common";
import ProspectSelect from "@common/library/ProspectSelect";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";
import TextAlign from "@tiptap/extension-text-align";
import { AiMetaDataBadge } from "@common/persona/LinkedInConversationEntry";
import { logout } from "@auth/core";
import TrainYourAi from "../../src/components/common/voice_builder/TrainYourAi";
import { openConfirmModal } from "@mantine/modals";

const ItemComponent = (props: { id: number; defaultValue: string }) => {
  const [message, setMessage] = useState<string>(props.defaultValue);
  const [editing, setEditing] = useState<boolean>(false);

  const [_opened, setProspectOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(
    voiceBuilderMessagesState
  );

  const existingMessage = voiceBuilderMessages.find(
    (item) => item.id === props.id
  );

  const saveMessages = (newMessage?: string) => {
    const oldMessage = voiceBuilderMessages.find(
      (item) => item.id === props.id
    );
    if (oldMessage) {
      // Update global state list and set new local state message
      setVoiceBuilderMessages(
        voiceBuilderMessages.map((item) => {
          if (item.id === oldMessage.id) {
            return {
              id: item.id,
              value: newMessage !== undefined ? newMessage : message,
              prospect: item.prospect,
              meta_data: item.meta_data,
            };
          }
          return item;
        })
      );
      if (newMessage !== undefined) {
        setMessage(newMessage);
      }
    }
  };

  if (!editing && !message) {
    return <></>;
  }

  const researchPoints = _.cloneDeep(
    existingMessage?.meta_data.research_points.map((p: any) => p.value)
  );
  const researchPointTypes = _.cloneDeep(
    existingMessage?.meta_data.research_points?.map(
      (p: any) => p.research_point_type
    )
  );

  return (
    <Container>
      <Group noWrap spacing={0}>
        <Box style={{ flexGrow: 1 }}>
          <Group spacing={8} noWrap>
            <Anchor
              component="button"
              type="button"
              onClick={() => {
                if (existingMessage?.prospect) {
                  setProspectId(existingMessage.prospect.id);
                  setProspectOpened(true);
                }
              }}
            >
              {existingMessage?.prospect?.full_name || "Example Prospect"}
            </Anchor>
            <ActionIcon
              variant="subtle"
              color="blue"
              radius="xl"
              size="sm"
              aria-label="LinkedIn"
              onClick={() => {
                if (existingMessage?.prospect) {
                  window.open(
                    "https://www." + existingMessage.prospect.linkedin_url,
                    "_blank"
                  );
                }
              }}
            >
              <IconBrandLinkedin size="1.0rem" />
            </ActionIcon>
            {existingMessage && (
              <AiMetaDataBadge
                location={{ position: "relative", top: -5 }}
                bumpFrameworkId={0}
                bumpFrameworkTitle={""}
                bumpFrameworkDescription={""}
                bumpFrameworkLength={""}
                bumpNumberConverted={undefined}
                bumpNumberUsed={undefined}
                accountResearchPoints={researchPoints || []}
                initialMessageId={-1}
                initialMessageCTAId={existingMessage.meta_data.cta.id || 0}
                initialMessageCTAText={
                  existingMessage.meta_data.cta.text_value || ""
                }
                initialMessageResearchPoints={researchPoints || []}
                initialMessageResearchPointTypes={researchPointTypes || []}
                initialMessageStackRankedConfigID={undefined}
                initialMessageStackRankedConfigName={"Baseline Linkedin"}
                cta={existingMessage.meta_data.cta.text_value || ""}
                useInfoIcon
              />
            )}
          </Group>
          <Container
            m={0}
            p={0}
            onClick={(e) => {
              if (editing) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {editing ? (
              <FocusTrap active>
                <Textarea
                  size="xs"
                  autosize
                  variant="unstyled"
                  onChange={(e) => {
                    setMessage(e.currentTarget.value);
                  }}
                  value={message}
                  onKeyDown={getHotkeyHandler([
                    [
                      "Enter", //mod+Enter
                      () => {
                        setEditing(false);
                        saveMessages();
                      },
                    ],
                    [
                      "mod+Enter",
                      () => {
                        setEditing(false);
                        saveMessages();
                      },
                    ],
                  ])}
                  onBlur={(e) => {
                    setEditing(false);
                    saveMessages();
                  }}
                  styles={{
                    input: {
                      padding: "0!important",
                      paddingTop: "0!important",
                      paddingBottom: "0!important",
                    },
                  }}
                />
              </FocusTrap>
            ) : (
              <Text
                size="xs"
                color="dimmed"
                onClick={(e) => {
                  setTimeout(() => {
                    setEditing(true);
                    saveMessages();
                  }, 1);
                }}
              >
                {message}
              </Text>
            )}
          </Container>
          <Text
            align="right"
            size="xs"
            color={message.length > 300 ? "red" : "dimmed"}
          >
            {message.length} / 300
          </Text>
        </Box>
        <div style={{ flexGrow: 0 }}>
          <Tooltip label="Edit" position="left" openDelay={500} withArrow>
            <ActionIcon
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing(!editing);
                saveMessages();
              }}
            >
              <IconPencil size="1.125rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Discard" position="left" openDelay={500} withArrow>
            <ActionIcon
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing(false);
                saveMessages("");
              }}
            >
              <IconTrash size="1.125rem" />
            </ActionIcon>
          </Tooltip>
        </div>
      </Group>
      <Divider my="sm" />
    </Container>
  );
};

export default function VoiceBuilderFlow(props: {
  persona: PersonaOverview;
  voiceBuilderOnboardingId: number;
  createCampaign?: boolean;
  loading: boolean;
  onComplete?: () => void;
}) {
  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(
    voiceBuilderMessagesState
  );

  const userData = useRecoilValue(userDataState);

  const theme = useMantineTheme();
  const [simulationProspectId, setSimulationProspectId]: any = useState(-1);
  const userToken = useRecoilValue(userTokenState);

  const [editingPhase, setEditingPhase] = useState(1);
  const [loadingMsgGen, setLoadingMsgGen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingSimulationSample, setLoadingSample] = useState(false);
  const [generatedSimulationCompletion, setGeneratedSimulationCompletion] =
    useState("");
  const [instructions, setInstructions] = useDebouncedState("", 200);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setLoadingMsgGen(props.loading);

    if(!props.loading && !loadingMsgGen && voiceBuilderMessages.length === 0){
      generateMessages();
    }
  }, [props.loading])

  // useEffect(() => {
  //   (async () => {
  //     const response = await updateOnboardingInstructions(
  //       userToken,
  //       props.voiceBuilderOnboardingId,
  //       `${STARTING_INSTRUCTIONS}\n${instructions.trim()}`
  //     );
  //   })();

  //   const interval = setInterval(() => {
  //     setCount(count + 1);
  //   }, 1000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [instructions, count, setCount]);



  const generateSample = () => {
    // console log instructions and messages
    var prompt =
      STARTING_INSTRUCTIONS +
      "\n" +
      instructions +
      "\n" +
      voiceBuilderMessages.map((item) => item.value).join("\n") +
      "\n" +
      "prompt: {prompt}\ncompletion:";
    setLoadingSample(true);
    setGeneratedSimulationCompletion("");
    showNotification({
      title: "Generating sample...",
      message: "Wait a few seconds while we generate a sample message",
      color: "blue",
      autoClose: 5000,
    });
    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration/generate_completion_for_prospect`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospect_id: simulationProspectId,
          computed_prompt: prompt,
        }),
      }
    )
      .then((res) => {
        const data = res.json();
        return data;
      })
      .then((data) => {
        setGeneratedSimulationCompletion(data?.completion);
        showNotification({
          title: "Sample generated",
          message: "The sample message was generated successfully",
          color: "green",
          autoClose: 5000,
        });
      })
      .catch((err) => {
        console.log(err);
        showNotification({
          title: "Error",
          message: err,
          icon: <IconX radius="sm" color={theme.colors.red[7]} />,
        });
      })
      .finally(() => {
        setLoadingSample(false);
      });
  };

  

  // if(voiceBuilderMessages.length === 0) {
  //   return <Text>No messages found.</Text>
  // }

  return (
    <>


      <LoadingOverlay visible={loadingComplete} overlayBlur={2} />

      

      {/* <Textarea
        placeholder={`- Please adjust titles to be less formal (i.e. lowercase, acronyms).\n- Avoid using the word 'impressive'.\n- Maintain a friendly & professional tone`}
        label="Special Instructions"
        description="Please provide any special instructions for the voice builder. This includes tone, formatting instructions, emojis vs no emojis, etc."
        minRows={3}
        onChange={(e) => setInstructions(e.currentTarget.value)}
      /> */}
      {/* {!loadingMsgGen && (
        <Center mt={10}>
          <Button
            radius="xl"
            size="md"
            m="auto"
            compact
            color="grape"
            leftIcon={<IconRefresh />}
            variant="light"
            disabled={loadingMsgGen}
            onClick={async () => {
              setCount(0);
              await generateMessages();
              setEditingPhase(editingPhase + 1);
            }}
          >
            Generate New Samples
          </Button>

          <Button
            radius="xl"
            size="md"
            m="auto"
            color="green"
            compact
            leftIcon={<IconCheck />}
            variant="light"
            disabled={loadingMsgGen || voiceBuilderMessages.length < 4}
            onClick={async () => {
              setCount(0);
              await completeVoice();
            }}
          >
            Looks Good! Create Voice with {voiceBuilderMessages.length} Samples
          </Button>
        </Center>
      )} */}
      {/* 
      <Divider my="sm" />

      <Card mt="md" p="md" withBorder>
        <Title order={4}>Simulate Voice</Title>
        <Text>
          Use the simulation section to test this voice on a prospect. You can
          select a persona then hit 'Generate' to see what the message would
          look like.
        </Text>
        <Flex direction="row">
          <Container sx={{ width: "80%" }}>
            <ProspectSelect
              onChange={(prospect) => {
                setSimulationProspectId(prospect?.id);
              }}
              personaId={props.persona.id}
            />
          </Container>
          <Container pt="md">
            <Button
              color="grape"
              mt="xl"
              ml="lg"
              loading={loadingSimulationSample}
              onClick={() => {
                generateSample();
              }}
            >
              Generate
            </Button>
          </Container>
        </Flex>
        {generatedSimulationCompletion && (
          <Textarea
            value={generatedSimulationCompletion}
            minRows={6}
            label="Generated Sample"
            description="This is what the message would look like if you sent it to the prospect."
            mt="xs"
            error={
              generatedSimulationCompletion.length > 300
                ? "Message is too long. It must be less than 300 characters."
                : undefined
            }
          />
        )}
      </Card> */}
    </>
  );
}
