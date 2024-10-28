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
import {
  patchMicrosoftTeamsWebhook,
  patchSlackWebhook,
} from "@utils/requests/patchSlackWebhook";
import { sendTestSlackWebhook } from "@utils/requests/sendTestSlackWebhook";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import MicrosoftTeamsLogo from "@assets/images/microsoft-teams-logo.png";
import { CustomizeSlackNotifications } from "../slack/SlackNotifications";

export default function MicrosoftTeamsWebhookSection(props: {
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
      setWebhook(
        userData.client.pipeline_microsoft_teams_notifications_webhook_url
      );
      if (userData.client.pipeline_microsoft_teams_notifications_webhook_url) {
        props.setActiveTab("advanced_setup");
      }
      props.setPageLoading(false); // Remove loading overlay
    });
  }, []);

  const triggerPatchMicrosoftTeamsWebhook = async () => {
    setLoading(true);

    const result = await patchMicrosoftTeamsWebhook(userToken, webhook);
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Microsoft Teams Webhook updated",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Microsoft Teams Webhook not updated",
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
        message: "Sent notification to Microsoft Teams",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Failed to send notification to Microsoft Teams",
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
            <Image
              src={MicrosoftTeamsLogo}
              alt="slack"
              width={25}
              height={25}
            />
            <Flex direction={"column"}>
              <Text fw={600}>Use Custom Microsoft Teams Webhook</Text>
            </Flex>
          </Flex>

          <Button
            disabled={
              webhook ===
              userData.client.pipeline_microsoft_teams_notifications_webhook_url
            }
            onClick={() => triggerPatchMicrosoftTeamsWebhook()}
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
              placeholder="https://hooks.microsoftteams.com/services/..."
              onChange={(event) => setWebhook(event.currentTarget.value)}
              // error={
              //   webhook &&
              //   (webhook?.startsWith(
              //     "https://hooks.microsoftteams.com/services/"
              //   )
              //     ? false
              //     : "Please enter a valid Microsoft Teams Webhook URL")
              // }
            />
          )}

          {userData.client
            .pipeline_microsoft_teams_notifications_webhook_url && (
            <Box my="md">
              <Button onClick={triggerSendSlackWebhook} disabled={true}>
                Send Test Notification
              </Button>
            </Box>
          )}
        </Flex>

        <Text color="gray" size="xs" fw={500}>
          Access Microsoft Teams Webhooks by{" "}
          <a href="" target="_blank" className="text-[#468af0]">
            visiting this link.
          </a>
        </Text>

        {userData.client.pipeline_microsoft_teams_notifications_webhook_url && (
          <>
            <Divider my="lg" />
            <CustomizeSlackNotifications microsoftTeams={true} />
          </>
        )}
      </Paper>
    </>
  );
}
