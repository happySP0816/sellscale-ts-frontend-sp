import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  FocusTrap,
  ScrollArea,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { IconRotate, IconX, IconChecks } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { TrainMessage } from "./TrainYourAi";
import { proxyURL } from "@utils/general";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState } from "@atoms/userAtoms";
import { getHotkeyHandler } from "@mantine/hooks";
import { voiceBuilderMessagesState } from "@atoms/voiceAtoms";

const Content = (props: {
  messageId: number;
  onNext: () => void;
  onComplete: () => void;
  complete: boolean;
}) => {
  const borderGray = "#E9ECEF";
  const blue = "#228be6";
  const MIN_CTA_ASSUMED_LENGTH = 80;

  const userData = useRecoilValue(userDataState);

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

  const [message, setMessage] = useState(trainMessage.value.trim());

  const saveMessages = (newMessage?: string) => {
    const oldMessage = voiceBuilderMessages.find(
      (item) => item.id === props.messageId
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
          <Avatar
            opacity={showTooltip ? "0.2" : "1"}
            radius="xl"
            src={proxyURL(imgURL)}
          />

          <Box ml={"1rem"}>
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
                border: `1px solid ${borderGray}`,
                overflow: "auto",
                borderRadius: 12,
              }}
              p={"1rem"}
              mt={"1rem"}
            >
              <Tooltip
                label="Personalization"
                color="green"
                opened={showTooltip}
              >
                <Text
                  sx={(theme) => ({
                    color: theme.colors.teal[8],
                    backgroundColor: theme.colors.teal[0],
                  })}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {startMessage}
                </Text>
              </Tooltip>
              <ScrollArea h={"19vh"}>
                {editing ? (
                  <FocusTrap active>
                    <Textarea
                      mt={"1rem"}
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
                            saveMessages();
                          },
                        ],
                      ])}
                      onBlur={() => {
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
                  <Text mt={"1rem"} opacity={showTooltip ? "0.2" : "1"}>
                    {message}
                  </Text>
                )}
              </ScrollArea>
              <Box>
                <Tooltip label="CTA" color="blue" opened={showTooltip}>
                  <Text
                    sx={(theme) => ({
                      color: theme.colors.blue[8],
                      backgroundColor: theme.colors.blue[0],
                    })}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    mt="md"
                  >
                    {endMessage}
                  </Text>
                </Tooltip>

                <Button
                  variant="outline"
                  sx={{ border: 0 }}
                  opacity={showTooltip ? "0.2" : "1"}
                >
                  <Text underline color="gray.8">
                    See less
                  </Text>
                </Button>
              </Box>

              <Button mt={"1rem"} color="gray" compact>
                Reply to {userData.sdr_name.split(" ")[0]}
              </Button>
            </Box>
          </Box>
        </Flex>

        <Flex gap={"0.5rem"} mt={"2rem"}>
          <Tooltip label="Coming soon!">
            <Button variant="outline" sx={{ flex: 1 }} disabled>
              <Text weight={700}>Auto Edit Using AI</Text>
            </Button>
            <Button
              variant={editing ? "filled" : "outline"}
              sx={{ flex: 1 }}
              onClick={() => {
                setEditing(true);
              }}
            >
              <Text weight={700}>Edit message</Text>
            </Button>
          </Tooltip>
        </Flex>
      </Box>
      <Tooltip label="Coming soon!">
        <Button w={"100%"} variant="light" size="md" disabled>
          <IconRotate width={16} />
          <Text weight={700} ml={"0.25rem"}>
            Regenerate message
          </Text>
        </Button>
      </Tooltip>

      <Flex mt={"1.5rem"} gap={"0.5rem"} justify={"center"}>
        <Button
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
        </Button>
        {!props.complete ? (
          <Button
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
    </Box>
  );
};

export default Content;
