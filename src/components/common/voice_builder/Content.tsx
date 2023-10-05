import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  FocusTrap,
  Loader,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { IconRotate, IconX, IconChecks } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { TrainMessage } from "./TrainYourAi";
import { proxyURL } from "@utils/general";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { getHotkeyHandler } from "@mantine/hooks";
import { voiceBuilderMessagesState } from "@atoms/voiceAtoms";
import { IconTrash } from "@tabler/icons";
import { deleteSample, updateSample } from "@utils/requests/voiceBuilder";

const Content = (props: {
  messageId: number;
  onNext: () => void;
  onDelete: () => void;
  onComplete: () => void;
  refreshMessages: () => void;
  complete: boolean;
}) => {
  const borderGray = "#E9ECEF";
  const blue = "#228be6";
  const MIN_CTA_ASSUMED_LENGTH = 80;

  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);

  const [editing, setEditing] = useState(false);
  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(
    voiceBuilderMessagesState
  );
  const trainMessage =
    voiceBuilderMessages.find((item) => item.id === props.messageId) ??
    voiceBuilderMessages[0];

  useEffect(() => {
    setMessage(trainMessage.value.trim());
  }, [trainMessage]);

  const oldMessage = useRef("");
  const [message, setMessage] = useState(trainMessage.value.trim());
  const [AILoading, setAILoading] = useState(false);

  const saveMessages = async (newMessage?: string, showAIEditing?: boolean) => {
    if (showAIEditing) {
      setAILoading(true);
    }
    
    const oldMessage = voiceBuilderMessages.find(
      (item) => item.id === props.messageId
    );
    if (oldMessage) {
      // Update global state list and set new local state message
      // setVoiceBuilderMessages(
      //   voiceBuilderMessages.map((item) => {
      //     if (item.id === oldMessage.id) {
      //       return {
      //         id: item.id,
      //         value: newMessage !== undefined ? newMessage : message,
      //         prospect: item.prospect,
      //         meta_data: item.meta_data,
      //         problems: [],
      //         highlighted_words: [],
      //       };
      //     }
      //     return item;
      //   })
      // );
      // if (newMessage !== undefined) {
      //   setMessage(newMessage);
      // }

      // Update the db
      const msg = (newMessage !== undefined) ? newMessage : message;
      if (msg) {
        updateSample(userToken, props.messageId, msg);
      } else {
        deleteSample(userToken, props.messageId);
      }

      // Refresh the messages
      await props.refreshMessages();
      setAILoading(false);
      console.log('loaded')
    }
  };

  const imgURL = userData.img_url;
  const name = userData.sdr_name;
  const title = userData.sdr_title;

  const sentences = message.split(/(?<=[.!?])\s+/gm);

  // If the last sentence is too short, the CTA is probably the last two sentences
  let endMessage = sentences[sentences.length - 1];
  if (endMessage.length < MIN_CTA_ASSUMED_LENGTH) {
    endMessage = sentences[sentences.length - 2] + " " + endMessage;
  }

  let startMessage = message.replace(endMessage, "").trim();

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Box px={"1.5rem"} py={"1.5rem"} h={"100%"}>
      <Flex w={"100%"} justify={"space-between"} align={"center"}>
        <Text weight={700} fz={24}>
          Edit message to your style
        </Text>
        {/* <Button
          variant="light"
          sx={{ borderRadius: 999 }}
          px={"1rem"}
          size="sm"
          compact
        >
          <Text weight={700} tt={"uppercase"} fz={"1rem"}>
            Linkedin
          </Text>
        </Button> */}
      </Flex>

      <Text color="gray.6" fz={"0.75rem"}>
        After you verified the message make sure to select the verified button
      </Text>

      <Box
        sx={{
          border: `1px dashed ${blue}`,
          borderRadius: "0.25rem",
        }}
        p={"1rem"}
        mt={"1rem"}
      >
        <Flex>
          <Box>
            <Avatar
              opacity={showTooltip ? "0.2" : "1"}
              radius="xl"
              src={proxyURL(imgURL)}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Flex justify={"space-between"}>
              <Box opacity={showTooltip ? "0.2" : "1"}>
                <Text weight={700}>{name}</Text>
                <Text fz={"0.75rem"} color="gray.8">
                  {title}
                </Text>
              </Box>
              <Box>
                <Button variant="subtle" size="xs">
                  <Text weight={900} color="gray.6">
                    Ignore
                  </Text>
                </Button>
                <Button variant="outline" sx={{ borderRadius: 9999 }} size="xs">
                  <Text weight={900}>Accept</Text>
                </Button>
              </Box>
            </Flex>

            <Box
              sx={{
                border: `1px solid ${message.length > 300 ? 'red' : borderGray}`,
                overflow: "auto",
                borderRadius: 12,
                position: "relative",
              }}
              p={"1rem"}
              mt={"1rem"}
            >
              {editing ? (
                <Box>
                  <FocusTrap active>
                    <Textarea
                      size="md"
                      autosize
                      variant="unstyled"
                      onChange={(e) => {
                        setMessage(e.currentTarget.value);
                      }}
                      value={message}
                      onKeyDown={getHotkeyHandler([
                        [
                          "mod+Enter",
                          () => {
                            setEditing(false);
                            saveMessages(undefined, true);
                          },
                        ],
                      ])}
                      // onBlur={() => {
                      //   setEditing(false);
                      //   saveMessages();
                      // }}
                      styles={{
                        input: {
                          padding: "0!important",
                          paddingTop: "0!important",
                          paddingBottom: "0!important",
                        },
                      }}
                      error={message.length > 300 ? true : null}
                    />
                  </FocusTrap>
                  <Text
                    fz='xs'
                    c={message.length > 300 ? 'red' : 'dimmed'}
                    sx={{
                      position: "absolute",
                      right: 5,
                      bottom: 5,
                    }}
                  >
                    {message.length}/300
                  </Text>
                </Box>
              ) : (
                <Text>
                  <Tooltip
                    label="Personalization"
                    color="green"
                    opened={showTooltip}
                    disabled
                  >
                    <Text
                      sx={(theme) => ({
                        color: theme.colors.teal[8],
                        backgroundColor: theme.colors.teal[0],
                      })}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      span
                    >
                      {startMessage}
                    </Text>
                  </Tooltip>
                  <Tooltip
                    label="CTA"
                    color="blue"
                    opened={showTooltip}
                    disabled
                  >
                    <Text
                      sx={(theme) => ({
                        color: theme.colors.blue[8],
                        backgroundColor: theme.colors.blue[0],
                      })}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      ml={5}
                      span
                    >
                      {endMessage}
                    </Text>
                  </Tooltip>
                </Text>
              )}
              {/* <Box>
                <Button
                  variant="outline"
                  sx={{ border: 0 }}
                  opacity={showTooltip ? "0.2" : "1"}
                >
                  <Text underline color="gray.8">
                    See less
                  </Text>
                </Button>
              </Box> */}

              {/* <Button mt={"1rem"} color="gray" compact>
                Reply to {userData.sdr_name.split(" ")[0]}
              </Button> */}
            </Box>
          </Box>
        </Flex>

        {editing ? (
          <Flex gap={"0.5rem"} mt={"2rem"}>
            <Button
              sx={{ flex: 1 }}
              disabled={message.length > 300}
              onClick={() => {
                setEditing(false);
                saveMessages(undefined, true);
              }}
            >
              <Text weight={700}>Save</Text>
            </Button>
            <Button
              variant="default"
              sx={{ flex: 1 }}
              onClick={() => {
                setMessage(oldMessage.current);
                setEditing(false);
              }}
            >
              <Text weight={700}>Cancel</Text>
            </Button>
          </Flex>
        ) : (
          <Flex gap={"0.5rem"} mt={"2rem"}>
            {/* <Tooltip label="Coming soon!" withArrow>
                <Box>
                  <Button variant="outline" sx={{ flex: 1 }} disabled>
                    <Text weight={700}>Auto Edit Using AI</Text>
                  </Button>
                </Box>
              </Tooltip> */}
            <Button
              variant={"outline"}
              sx={{ flex: 1 }}
              onClick={() => {
                setEditing(true);
                oldMessage.current = message;
              }}
            >
              <Text weight={700}>Edit message</Text>
            </Button>
          </Flex>
        )}
      </Box>
      {/* <Tooltip label="Coming soon!" withArrow>
        <Box>
          <Button w={"100%"} variant="light" size="md" disabled>
            <IconRotate width={16} />
            <Text weight={700} ml={"0.25rem"}>
              Regenerate message
            </Text>
          </Button>
        </Box>
      </Tooltip> */}

      <Flex mt={"1.5rem"} gap={"0.5rem"} justify={"center"}>
        <Tooltip label="Remove Prospect" withArrow>
          <ActionIcon
            m={5}
            mr={20}
            radius={"xl"}
            onClick={() => {
              setEditing(false);
              saveMessages("");
              props.onDelete();
            }}
          >
            <IconTrash size="1.0rem" />
          </ActionIcon>
        </Tooltip>
        {/* <Button
          color="red"
          sx={{ borderRadius: 999 }}
          px={"3rem"}
          onClick={() => {
            setEditing(false);
            saveMessages("");
          }}
        >
          <IconX width={14} />
          <Text span ml={"0.25rem"}>
            Remove prospect
          </Text>
        </Button> */}
        {!props.complete ? (
          <Button
            disabled={message.length > 300 || AILoading || editing}
            color="green"
            sx={{ borderRadius: 999 }}
            px={"3rem"}
            onClick={() => {
              setEditing(false);
              saveMessages();
              props.onNext();
            }}
          >
            <IconChecks width={14} />
            <Text span ml={"0.25rem"}>
              Approve message
            </Text>
          </Button>
        ) : (
          <Button
            color="green"
            sx={{ borderRadius: 999 }}
            px={"3rem"}
            onClick={() => {
              setEditing(false);
              saveMessages();
              props.onComplete();
            }}
          >
            <IconChecks width={14} />
            <Text span ml={"0.25rem"}>
              Create Voice
            </Text>
          </Button>
        )}
      </Flex>


      {AILoading && (
        <>
          <Flex w='100%' justify='center' mt='xl' mb='2px'>
            <Loader size={30} color='purple' />
          </Flex>
          <Flex w='100%' justify='center'>
            <Text size='xs'>AI reviewing message for errors...</Text>
          </Flex>
        </>
      )}
      {
        trainMessage.problems && trainMessage.problems.length > 0 && (
          <Flex mt={"1.5rem"} w='100%'>

            <Card
              w='100%'
              radius='md'
              withBorder
              sx={{ border: 'solid 1px rgb(202, 72, 63) !important' }}
            >
              <Card.Section
                px='xs'
                py='4px'
                sx={{
                  background: 'rgb(202, 72, 63)'
                }}
              >
                <Text weight={500} fz={16} color='white'>
                  AI Suggestions
                </Text>
              </Card.Section>
              <Card.Section
                px='xs'
              >
                <Flex direction='column'>
                  {
                    trainMessage.problems.map((problem: any, index: any) => {
                      return (
                        <>
                          {index > 0 && <Divider />}
                          <Text weight={500} fz={16} my='8px'>
                            {index + 1}. {problem}
                          </Text>
                        </>
                      )
                    })
                  }

                </Flex>
              </Card.Section>
            </Card>
          </Flex>
        )
      }
    </Box>
  );
};

export default Content;
