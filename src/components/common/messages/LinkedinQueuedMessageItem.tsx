import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  LoadingOverlay,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { nameToInitials, valueToColor } from "@utils/general";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { useRef, useState } from "react";
import { IconEdit } from "@tabler/icons";

import { patchLIMessage } from "@utils/requests/patchLIMessage";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import ICPFitPill from "@common/pipeline/ICPFitAndReason";

type MessageItemProps = {
  prospect_id: number;
  full_name: string;
  title: string;
  company: string;
  img_url: string;
  message_id: number;
  completion: string;
  index: number;
  icp_fit_score: number;
  icp_fit_reason: string;
};

export default function LinkedinQueuedMessageItem(props: MessageItemProps) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const original_completion = useRef(props.completion);
  const [messageCompletion, setMessageCompletion] = useState<string>(
    props.completion
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const triggerPatchLIMessage = async () => {
    setIsLoading(true);

    if (messageCompletion.length > 300) {
      showNotification({
        id: "message-too-long",
        title: "Message too long",
        message: "Your message cannot be longer than 300 characters",
        color: "red",
        autoClose: false,
      });
      setIsLoading(false);
      return;
    }

    if (messageCompletion.length === 0) {
      showNotification({
        id: "message-too-short",
        title: "Message too short",
        message: "Your message cannot be empty",
        color: "red",
        autoClose: false,
      });
      setIsLoading(false);
      return;
    }

    if (messageCompletion.trim() === original_completion.current.trim()) {
      showNotification({
        id: "message-not-changed",
        title: "Message not changed",
        message: "Your message has not been changed",
        color: "red",
        autoClose: false,
      });
      setIsLoading(false);
      return;
    }

    const response = await patchLIMessage(
      userToken,
      props.message_id,
      messageCompletion
    );
    if (response.status === "success") {
      setIsEditing(false);
      showNotification({
        id: "message-updated",
        title: "Message updated",
        message: "Your message has been updated successfully",
        color: "green",
        autoClose: 3000,
      });
      setIsLoading(false);
      original_completion.current = messageCompletion;
    } else {
      showNotification({
        id: "message-updated",
        title: "Message update failed",
        message:
          "Your message could not be updated. If problem persists, please contact support.",
        color: "red",
        autoClose: false,
      });
    }

    setIsLoading(false);
  };

  return (
    <Card
      style={{
        overflow: "visible",
      }}
    >
      <LoadingOverlay visible={isLoading} />
      <Flex direction="row" mb="sm" w="100%" justify={"space-between"}>
        <Flex>
          <Flex mr="sm">
            <Avatar
              src={props.img_url}
              alt={props.full_name}
              color={valueToColor(theme, props.full_name)}
              radius="lg"
              size={50}
            >
              {nameToInitials(props.full_name)}
            </Avatar>
          </Flex>

          <Flex direction="column">
            <Box>
              <ICPFitPill
                archetype=""
                icp_fit_score={props.icp_fit_score}
                icp_fit_reason={props.icp_fit_reason}
              />
            </Box>
            <Text fw="bold" fz="xl">
              {props.full_name}
            </Text>
            <Text fz="md">
              {props.title} @ {props.company}
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <Tooltip
            width={200}
            multiline
            label={
              "We send LinkedIn messages strategically and randomly throughout the day. We can't reveal the exact time, but rest assured that this message is number " +
              (props.index + 1) +
              " in line!"
            }
          >
            <Badge>Position in Queue to be sent: {props.index + 1}</Badge>
          </Tooltip>
        </Flex>
      </Flex>
      <Box pos="relative">
        <TextAreaWithAI
          placeholder="Write your message here..."
          label="Message"
          minRows={3}
          maxRows={10}
          onChange={(e) => {
            setMessageCompletion(e.currentTarget.value);
            setIsEditing(true);
          }}
          value={messageCompletion}
        />
        {!isEditing && (
          <Box pos="absolute" right="0" bottom="0">
            <ActionIcon
              color="dark"
              variant="transparent"
              onClick={() => setIsEditing(true)}
            >
              <IconEdit size="1.125rem" />
            </ActionIcon>
          </Box>
        )}
        {isEditing && (
          <Flex justify="space-between" mt="sm">
            <Button
              variant="light"
              color="red"
              onClick={() => {
                setIsEditing(false);
                setMessageCompletion(original_completion.current);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="light"
              color="green"
              onClick={() => triggerPatchLIMessage()}
            >
              Save
            </Button>
          </Flex>
        )}
      </Box>
    </Card>
  );
}
