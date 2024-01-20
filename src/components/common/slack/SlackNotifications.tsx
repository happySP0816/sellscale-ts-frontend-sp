import { userTokenState } from "@atoms/userAtoms";
import {
  Title,
  Text,
  Paper,
  Container,
  Checkbox,
  Stack,
  Flex,
  Popover,
  Image,
  HoverCard,
  Box,
  LoadingOverlay,
  Loader,
  Button,
} from "@mantine/core";
import {
  activateSubscription,
  deactivateSubscription,
  getSubscriptions,
} from "@utils/requests/subscriptions";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import EmailAIResponseImg from "@assets/images/notification_previews/email-ai-response.png";
import { showNotification } from "@mantine/notifications";
import { postPreviewSlackNotification } from "@utils/requests/postPreviewSlackNotification";

const image_map = new Map<string, string>([
  ["AI_REPLY_TO_EMAIL", EmailAIResponseImg],
]);

type SlackNotificationSubscription = {
  id: number;
  notification_type: string;
  notification_name: string;
  notification_description: string;
  subscription_id: number;
  subscribed: boolean;
};

export default function SlackNotifications() {
  const [loading, setLoading] = useState(false);
  const [loadingSubscriptionType, setLoadingSubscriptionType] = useState("");
  const [notificationTestLoading, setNotificationTestLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [slackSubscriptions, setSlackSubscriptions] = useState<
    SlackNotificationSubscription[]
  >([]);

  const triggerTestNotification = async (slackNotificationID: number) => {
    setNotificationTestLoading(true);

    const result = await postPreviewSlackNotification(
      userToken,
      slackNotificationID
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Notification sent, please check your Slack channel!",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Something went wrong, please try again. Did you hookup your Slack channel?",
        color: "red",
        autoClose: 5000,
      });
    }

    setNotificationTestLoading(false);
  };

  const triggerActivateSubscription = async (
    slackNotificationID: number,
    subscriptionType: string
  ) => {
    setLoadingSubscriptionType(subscriptionType);

    const result = await activateSubscription(userToken, slackNotificationID);
    if (result.status === "success") {
      triggerGetSubscriptions();
      showNotification({
        title: "Success",
        message: "Notification activated",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Something went wrong, please try again.",
        color: "red",
        autoClose: 5000,
      });
    }

    setLoadingSubscriptionType("");
  };

  const triggerDeactivateSubscription = async (
    subscriptionId: number,
    subscriptionType: string
  ) => {
    setLoadingSubscriptionType(subscriptionType);

    const result = await deactivateSubscription(userToken, subscriptionId);
    if (result.status === "success") {
      triggerGetSubscriptions();
      showNotification({
        title: "Success",
        message: "Notification deactivated",
        color: "green",
        autoClose: 5000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Something went wrong, please try again.",
        color: "red",
        autoClose: 5000,
      });
    }

    setLoadingSubscriptionType("");
  };

  const triggerGetSubscriptions = async () => {
    setLoading(true);

    const result = await getSubscriptions(userToken);
    if (result.status === "success") {
      setSlackSubscriptions(result.data.slack_subscriptions);
    }

    setLoading(false);
  };

  useEffect(() => {
    triggerGetSubscriptions();
  }, []);

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Title order={5}>Customize Notifications</Title>
      <Flex mt="sm">
        {slackSubscriptions &&
          slackSubscriptions.map((slackSubscription) => {
            return (
              <HoverCard
                withArrow
                withinPortal
                styles={{
                  dropdown: {
                    display: "flex",
                    border: "1px solid black",
                  },
                  arrow: {
                    border: "1px solid black",
                  },
                }}
              >
                <HoverCard.Target>
                  <Flex align={"center"}>
                    {loadingSubscriptionType ===
                      slackSubscription.notification_type && (
                      <>
                        <Loader color="grape" size="sm" mr="sm" />
                      </>
                    )}

                    <Checkbox
                      color={'grape'}
                      key={slackSubscription.id}
                      label={slackSubscription.notification_name}
                      checked={slackSubscription.subscribed}
                      onChange={() => {
                        if (slackSubscription.subscribed) {
                          triggerDeactivateSubscription(
                            slackSubscription.id,
                            slackSubscription.notification_type
                          );
                        } else {
                          triggerActivateSubscription(
                            slackSubscription.id,
                            slackSubscription.notification_type
                          );
                        }
                      }}
                      disabled={
                        loadingSubscriptionType ===
                        slackSubscription.notification_type
                      }
                    />
                  </Flex>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Flex w="500px" direction="column" align={"center"}>
                    <Text>{slackSubscription.notification_description}</Text>
                    <Flex
                      w={400}
                      style={{
                        border: "1px solid #ccc",
                      }}
                      my="md"
                    >
                      <Image
                        fit="contain"
                        src={image_map.get(slackSubscription.notification_type)}
                        alt="SellScale Sight"
                      />
                    </Flex>
                    <Button
                      loading={notificationTestLoading}
                      onClick={() => {
                        triggerTestNotification(slackSubscription.id);
                      }}
                      color='grape'
                    >
                      {
                        notificationTestLoading ? 'Sending...' : 'Send Test Notification'
                      }
                    </Button>
                  </Flex>
                </HoverCard.Dropdown>
              </HoverCard>
            );
          })}
      </Flex>
      <Flex>
        <Flex w="50%" direction="column" mt="xs">
          <Text>LinkedIn</Text>
          <Stack mt="md">
            <Checkbox
              label="Accepted Notifications - Coming Soon"
              defaultChecked
              disabled
            />
            <Checkbox
              label="Replied Notifications - Coming Soon"
              defaultChecked
              disabled
            />
            <Checkbox
              label="Demo Set Notifications - Coming Soon"
              defaultChecked
              disabled
            />
            <Checkbox
              label="AI Responses Notifications - Coming Soon"
              defaultChecked
              disabled
            />
          </Stack>
        </Flex>
        <Flex w="50%" direction="column" mt="xs">
          <Text>Email</Text>
          <Stack mt="md">
            <Checkbox
              label="Opened Notifications - Coming Soon"
              defaultChecked
              disabled
            />
            <Checkbox
              label="Replied Notifications - Coming Soon"
              defaultChecked
              disabled
            />
            <Checkbox
              label="Demo Set Notifications - Coming Soon"
              defaultChecked
              disabled
            />
            <Checkbox
              label="AI Responses Notifications"
              defaultChecked
              disabled
            />
          </Stack>
        </Flex>
      </Flex>
    </Paper>
  );
}
