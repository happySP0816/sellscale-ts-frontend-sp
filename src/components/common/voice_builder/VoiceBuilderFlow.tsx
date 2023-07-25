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
} from "@mantine/core";
import { Archetype, Prospect } from "src";
import {
  IconBrandLinkedin,
  IconCheck,
  IconEdit,
  IconHeart,
  IconHeartOff,
  IconPencil,
  IconRefresh,
  IconTrash,
} from "@tabler/icons";
import { getHotkeyHandler, useDebouncedState } from "@mantine/hooks";
import { useRecoilState, useRecoilValue } from "recoil";
import { voiceBuilderMessagesState } from "@atoms/voiceAtoms";
import {
  MAX_EDITING_PHASES,
  MSG_GEN_AMOUNT,
  STARTING_INSTRUCTIONS,
} from "@modals/VoiceBuilderModal";
import { userTokenState } from "@atoms/userAtoms";
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
import ProspectSelect from '@common/library/ProspectSelect';
import { showNotification } from '@mantine/notifications';
import { API_URL } from '@constants/data';
import TextAlign from '@tiptap/extension-text-align';

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

  return (
    <Container>
      <Group noWrap spacing={0}>
        <div style={{ flexGrow: 1 }}>
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
          <Button
            variant="subtle"
            leftIcon={<IconBrandLinkedin />}
            size="xs"
            onClick={() => {
              if (existingMessage?.prospect) {
                window.open(
                  "https://www." + existingMessage.prospect.linkedin_url,
                  "_blank"
                );
              }
            }}
          />
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
                ])}
                styles={{
                  input: {
                    padding: "0!important",
                    paddingTop: "0!important",
                    paddingBottom: "0!important",
                  },
                }}
              />
            ) : (
              <Text size="xs" color="dimmed">
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
        </div>
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
  persona: Archetype;
  voiceBuilderOnboardingId: number;
}) {
  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(
    voiceBuilderMessagesState
  );
  const [simulationProspectId, setSimulationProspectId]: any = useState(-1);
  const userToken = useRecoilValue(userTokenState);

  // Set global state to loaded messages
  useEffect(() => {
    setVoiceBuilderMessages([]);
    (async () => {
      await generateMessages();
    })();
  }, []);

  const [editingPhase, setEditingPhase] = useState(1);
  const [loadingMsgGen, setLoadingMsgGen] = useState(false);
  const [loadingSimulationSample, setLoadingSample] = useState(false);
  const [generatedSimulationCompletion, setGeneratedSimulationCompletion] = useState("");
  const [instructions, setInstructions] = useDebouncedState("", 200);
  const [count, setCount] = useState(0);

  const canCreate = editingPhase >= MAX_EDITING_PHASES;

  useEffect(() => {
    (async () => {
      const response = await updateOnboardingInstructions(
        userToken,
        props.voiceBuilderOnboardingId,
        `${STARTING_INSTRUCTIONS}\n${instructions.trim()}`
      );
    })();

    const interval = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [instructions, count, setCount]);

  // Generate sample messages
  const generateMessages = async () => {
    setLoadingMsgGen(true);
    // Clone so we don't have to deal with async global state changes bs
    const currentMessages = _.cloneDeep(voiceBuilderMessages);

    // Delete all samples that are empty
    for (const message of currentMessages) {
      if (message.value === "") {
        await deleteSample(userToken, message.id);
      } else {
        await updateSample(userToken, message.id, message.value);
      }
    }

    // Generate new samples
    const response = await generateSamples(
      userToken,
      props.voiceBuilderOnboardingId,
      MSG_GEN_AMOUNT
    );

    // Delete all old samples
    for (const message of currentMessages) {
      // We don't need to wait for this, just needs to happen before the next generateMessages call
      deleteSample(userToken, message.id);
    }

    if (response.status === "success") {
      // Replace global state with only new samples
      setVoiceBuilderMessages((prev) => {
        return response.data.map((item: any) => {
          return {
            id: item.id,
            value: item.sample_completion,
            prospect: item.prospect,
          };
        });
      });
    }

    setLoadingMsgGen(false);
  };

  // Finalize voice building and create voice
  const completeVoice = async () => {
    // Clone so we don't have to deal with async global state changes bs
    const currentMessages = _.cloneDeep(voiceBuilderMessages);

    // Delete all samples that are empty
    for (const message of currentMessages) {
      if (message.value === "") {
        await deleteSample(userToken, message.id);
      } else {
        await updateSample(userToken, message.id, message.value);
      }
    }

    const response = await createVoice(
      userToken,
      props.voiceBuilderOnboardingId
    );
    if (response.status === "success") {
      window.location.href = `/linkedin/voices`;
    }
  };

  const generateSample = () => {
    // console log instructions and messages
    var prompt = STARTING_INSTRUCTIONS + '\n' + instructions + '\n' + voiceBuilderMessages.map((item) => item.value).join('\n') + '\n' + 'prompt: {prompt}\ncompletion:';
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
      })
      .finally(() => {
        setLoadingSample(false);
      });
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <Text pt={15} px={2} fz="sm" fw={400}>
          Please edit these messages to your liking or click to discard. Once
          you’re satisfied, click to continue.
        </Text>
        <ScrollArea style={{ position: "relative", height: 410 }}>
          <Container>
            <Divider my="sm" />
          </Container>
          {loadingMsgGen && (
            <Container w="100%">
              {<Loader mx="auto" variant="dots" />}
              <Text color="blue">Generating messages ...</Text>
              {count > 2 && <Text color="blue">Researching prospects ...</Text>}
              {count > 3 && <Text color="blue">Writing sample copy ...</Text>}
              {count > 5 && (
                <Text color="blue">Applying previous edits ...</Text>
              )}
              {count > 7 && <Text color="blue">Finalizing messages ...</Text>}
              {count > 9 && <Text color="blue">Almost there ...</Text>}
              {count > 15 && <Text color="blue">Making final touches ...</Text>}
            </Container>
          )}
          {!loadingMsgGen &&
            voiceBuilderMessages.map((item) => (
              <ItemComponent
                key={item.id}
                id={item.id}
                defaultValue={item.value}
              />
            ))}
        </ScrollArea>
      </div>

      <Textarea
        placeholder={`- Please adjust titles to be less formal (i.e. lowercase, acronyms).\n- Avoid using the word 'impressive'.\n- Maintain a friendly & professional tone`}
        label="Special Instructions"
        description="Please provide any special instructions for the voice builder. This includes tone, formatting instructions, emojis vs no emojis, etc."
        minRows={3}
        onChange={(e) => setInstructions(e.currentTarget.value)}
      />
      <Center mt={10}>
        <Button
          radius="xl"
          size="md"
          m="auto"
          compact
          color='grape'
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
          color='green'
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

      <Divider my="sm" />
        
      <Card mt="md" p="md" withBorder>
        <Title order={4}>Simulate Voice</Title>
        <Text>
          Use the simulation section to test this voice on a prospect. You can
          select a persona then hit 'Generate' to see what the message would
          look like.
        </Text>
        <Flex direction="row">
          <Box sx={{ width: "80%" }}>
            <ProspectSelect
              onChange={(prospect) => {
                setSimulationProspectId(prospect?.id);
              }}
              personaId={props.persona.id}
            />
          </Box>
          <Box pt="md">
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
          </Box>
        </Flex>
        {generatedSimulationCompletion && <Textarea 
          value={generatedSimulationCompletion} 
          minRows={6}
          label='Generated Sample'
          description='This is what the message would look like if you sent it to the prospect.'
          mt='xs' 
          error={generatedSimulationCompletion.length > 300 ? 'Message is too long. It must be less than 300 characters.' : undefined} 
        />}
      </Card>
    </>
  );
}
