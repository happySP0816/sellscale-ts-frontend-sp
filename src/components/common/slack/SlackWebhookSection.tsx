import { userDataState, userTokenState } from "@atoms/userAtoms";
import { syncLocalStorage } from "@auth/core";
import {
  Title,
  Text,
  Paper,
  Container,
  TextInput,
  Button,
  Loader,
  Flex,
  Box,
  Image,
  Divider,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getSDR } from "@utils/requests/getClientSDR";
import { patchSlackWebhook } from "@utils/requests/patchSlackWebhook";
import { sendTestSlackWebhook } from "@utils/requests/sendTestSlackWebhook";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import SlackLogo from "@assets/images/slack-logo.png";
import { CustomizeSlackNotifications } from "./SlackNotifications";

export default function SlackbotSection(props: {
  setActiveTab: (value: string) => void;
  setPageLoading: (value: boolean) => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [loading, setLoading] = useState<boolean>(false);

  const [webhook, setWebhook] = useState<string>("");

  useEffect(() => {
    props.setPageLoading(true); // Trigger loading overlay
    syncLocalStorage(userToken, setUserData).then(() => {
      setWebhook(userData.client.pipeline_notifications_webhook_url);
      if (
        userData.client.pipeline_notifications_webhook_url &&
        !userData.client.slack_bot_connected
      ) {
        props.setActiveTab("advanced_setup");
      }
      props.setPageLoading(false); // Remove loading overlay
    });
  }, []);

  const triggerPatchSlackWebhook = async () => {
    setLoading(true);

    const result = await patchSlackWebhook(userToken, webhook);
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Slack Webhook updated",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Slack Webhook not updated",
        color: "red",
        autoClose: 5000,
      });
    }
    await syncLocalStorage(userToken, setUserData);

    setLoading(false);
  };

  const triggerSendSlackWebhook = async () => {
    setLoading(true);

    const result = await sendTestSlackWebhook(userToken);
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Sent notification to Slack",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Failed to send notification to Slack",
        color: "red",
        autoClose: 5000,
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
        <Flex justify={"space-between"} align="center">
          <Flex align={"center"} gap={"sm"}>
            <Image src={SlackLogo} alt="slack" width={25} height={25} />
            <Flex direction={"column"}>
              <Text fw={600}>Use Custom Webhook</Text>
            </Flex>
          </Flex>
          <Box>
            <Text size="sm">Connected to: </Text>
            {userData.client.channel_name ? (
              <Badge variant="filled" color="teal" size="lg">
                #{userData.client.channel_name}
              </Badge>
            ) : (
              <Badge variant="outline" color="gray" size="lg">
                No Channel
              </Badge>
            )}
          </Box>
          <Button
            disabled={
              webhook === userData.client.pipeline_notifications_webhook_url
            }
            onClick={() => triggerPatchSlackWebhook()}
            loading={loading}
          >
            Save
          </Button>
        </Flex>
        <Divider mt="md" />

        <Flex direction="column">
          {loading ? (
            <Loader variant="dots" mt="md" />
          ) : (
            <TextInput
              mt="sm"
              value={webhook}
              placeholder="https://hooks.slack.com/services/..."
              onChange={(event) => setWebhook(event.currentTarget.value)}
              error={
                webhook &&
                (webhook?.startsWith("https://hooks.slack.com/services/")
                  ? false
                  : "Please enter a valid Slack Webhook URL")
              }
            />
          )}

          {userData.client.pipeline_notifications_webhook_url && (
            <Box my="md">
              <Button onClick={triggerSendSlackWebhook}>
                Send Test Notification
              </Button>
            </Box>
          )}
        </Flex>

        <Text color="gray" size="xs" fw={500}>
          Access Slack Webhooks by{" "}
          <a
            href="https://api.slack.com/apps/A046N8QCQUA/incoming-webhooks?success=1"
            target="_blank"
            className="text-[#468af0]"
          >
            visiting this link.
          </a>
        </Text>

        {userData.client.pipeline_notifications_webhook_url && (
          <>
            <Divider my="lg" />
            <CustomizeSlackNotifications />
          </>
        )}
      </Paper>
    </>
  );
}
