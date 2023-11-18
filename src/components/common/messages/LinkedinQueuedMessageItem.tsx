import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  LoadingOverlay,
  Text,
  ThemeIcon,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { nameToInitials, proxyURL, valueToColor } from "@utils/general";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { useRef, useState } from "react";
import {
  IconBriefcase,
  IconBuilding,
  IconEdit,
  IconExternalLink,
  IconPencil,
  IconTargetArrow,
  IconUser,
} from "@tabler/icons";

import { patchLIMessage } from "@utils/requests/patchLIMessage";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import ICPFitPill from "@common/pipeline/ICPFitAndReason";
import { removeProspectFromContactList } from "@common/prospectDetails/ProspectDetailsRemove";

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
  archetype: string;
  refresh: () => void;
  onDelete: (prospect_id: number) => void;
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

  const triggerRemoveProspectFromContactList = async () => {
    setIsLoading(true);

    const response = await removeProspectFromContactList(
      props.prospect_id,
      userToken
    );
    if (response.status === "success") {
      showNotification({
        id: "prospect-removed",
        title: "Prospect removed",
        message: "This prospect has been removed successfully",
        color: "green",
        autoClose: 3000,
      });
    } else {
      showNotification({
        id: "prospect-removed",
        title: "Prospect removal failed",
        message:
          "This prospect could not be removed. Please try again, or contact support.",
        color: "red",
        autoClose: false,
      });
    }
    props.onDelete(props.prospect_id);
    props.refresh();
    setIsLoading(false);
  };

  return (
    <Card
      style={{
        overflow: "visible",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <LoadingOverlay visible={isLoading} />
      <Flex direction="row" gap={"xs"}>
        <Flex
          direction="column"
          justify={"space-between"}
          w={"30%"}
          pr={"xs"}
          pt={"sm"}
          pb={"sm"}
          sx={(theme) => ({ borderRight: `1px solid ${theme.colors.gray[4]}` })}
        >
          <Flex direction="column" rowGap={"xs"}>
            <Anchor
              href={`https://app.sellscale.com/setup/linkedin?campaign_id=${props.prospect_id}`}
              target="_blank"
            >
              <Badge
                variant="light"
                fullWidth
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                  >
                    <IconExternalLink size={rem(12)} />
                  </ActionIcon>
                }
                styles={{
                  inner: {
                    flex: 1,
                    width: "100%",
                  },
                }}
              >
                <Flex justify={"space-between"} w={"100%"} style={{ flex: 1 }}>
                  <Flex align={"center"} gap={"xs"}>
                    <IconTargetArrow size={rem(12)} />

                    <Text>{props.archetype}</Text>
                  </Flex>
                </Flex>
              </Badge>
            </Anchor>

            <Flex gap={"xs"} align={"center"}>
              <Avatar
                src={proxyURL(props.img_url)}
                alt={props.full_name}
                color={valueToColor(theme, props.full_name)}
                radius="lg"
                size={28}
              >
                {nameToInitials(props.full_name)}
              </Avatar>
              <Text fw="bold" fz="xl">
                {props.full_name}
              </Text>
              <Box>
                <ICPFitPill
                  archetype={props.archetype}
                  icp_fit_score={props.icp_fit_score}
                  icp_fit_reason={props.icp_fit_reason}
                />
              </Box>
            </Flex>
            <Flex direction={"column"}>
              <Flex gap={"xs"} align={"center"}>
                <IconUser size={rem(16)} color={theme.colors.gray[6]} />
                <Text color="gray.6" fw={500} fz={"sm"}>
                  {props.archetype}
                </Text>
              </Flex>
              <Flex gap={"xs"} align={"center"}>
                <IconBriefcase size={rem(16)} color={theme.colors.gray[6]} />
                <Text color="gray.6" fw={500} fz={"sm"}>
                  {props.title}
                </Text>
              </Flex>
              <Flex gap={"xs"} align={"center"}>
                <IconBuilding size={rem(16)} color={theme.colors.gray[6]} />
                <Text color="gray.6" fw={500} fz={"sm"}>
                  {props.company}
                </Text>
              </Flex>

              <Text
                color="gray.6"
                fw={500}
                fz={"sm"}
                style={{ display: "flex" }}
              >
                Created: <Text fw={700}>&nbsp;coming soon</Text> &nbsp;|
                Sending: <Text fw={700}>&nbsp;coming soon</Text>
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex direction={"column"} pos="relative" w={"70%"} pt={"sm"} pb={"sm"}>
          <TextAreaWithAI
            onDelete={triggerRemoveProspectFromContactList}
            hasDeleteButton
            placeholder="Write your message here..."
            label="Message:"
            styles={(theme) => ({
              root: {
                height: "100%",
                display: "flex",
                flexDirection: "column",
              },
              wrapper: {
                flex: 1,
                marginTop: "8px",
              },
              input: {
                height: "100%",
              },
              label: {
                display: "block",
                color: theme.colors.gray[8],
              },
            })}
            onChange={(e) => {
              setMessageCompletion(e.currentTarget.value);
              setIsEditing(true);
            }}
            value={messageCompletion}
          />
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              color="dark"
              variant="light"
              radius="xl"
              size="xs"
              compact
              fw={700}
              leftIcon={<IconPencil size="0.8rem" />}
              styles={{
                leftIcon: {
                  marginRight: 3,
                },
                label: {
                  color: "white",
                },
                root: { position: "absolute", bottom: "20px", right: "10px" },
              }}
            >
              Edit
            </Button>
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
        </Flex>
      </Flex>
    </Card>
  );
}
