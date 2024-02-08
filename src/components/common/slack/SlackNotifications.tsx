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
  Switch,
  Divider,
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
  notification_outbound_channel: "email" | "linkedin" | "all";
  subscription_id: number;
  subscribed: boolean;
};

export default function SlackNotifications(props: { selectedChannel: string }) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [linkedinSubscriptions, setLinkedinSubscriptions] = useState<
    SlackNotificationSubscription[]
  >([]);
  const [emailSubscriptions, setEmailSubscriptions] = useState<
    SlackNotificationSubscription[]
  >([]);
  const [generalSubscriptions, setGeneralSubscriptions] = useState<
    SlackNotificationSubscription[]
  >([]);

  const triggerGetSubscriptions = async () => {
    setLoading(true);

    const result = await getSubscriptions(userToken);
    if (result.status === "success") {
      // Filter out the subscriptions for the two channels
      const linkedinSubscriptions = result.data.slack_subscriptions.filter(
        (subscription: SlackNotificationSubscription) =>
          subscription.notification_outbound_channel === "linkedin"
      );
      const emailSubscriptions = result.data.slack_subscriptions.filter(
        (subscription: SlackNotificationSubscription) =>
          subscription.notification_outbound_channel === "email"
      );
      const generalSubscriptions = result.data.slack_subscriptions.filter(
        (subscription: SlackNotificationSubscription) =>
          subscription.notification_outbound_channel === "all"
      );

      setLinkedinSubscriptions(linkedinSubscriptions);
      setEmailSubscriptions(emailSubscriptions);
      setGeneralSubscriptions(generalSubscriptions);
    }

    setLoading(false);
  };

  useEffect(() => {
    triggerGetSubscriptions();
  }, []);

  return (
    <>
      <Flex
        style={{
          border: "1px solid gray",
          borderStyle: "dashed",
          borderRadius: "6px",
        }}
        align={"center"}
        p={"sm"}
        justify={"space-between"}
        mt={"md"}
      >
        <Flex align={"center"} gap={"sm"}>
          <Text size={"sm"} fw={500}>
            Connected to{" "}
            <span
              style={{
                fontFamily: "monospace", // Use a monospaced font for code-like appearance
                backgroundColor: "#f0f0f0", // Set background color for code block
                padding: "0.5em", // Add padding for better readability
                borderRadius: "4px", // Optional: Add rounded corners for a softer look
                display: "inline",
                color: "red",
              }}
            >
              #{props.selectedChannel}
            </span>
          </Text>
          {/* <Text size={'xs'} color='gray'>
            - by {props.selectedChannel}
          </Text> */}
        </Flex>
        <Flex gap={"sm"} align={"center"}>
          <Button variant="outline" color="red" disabled>
            Disconnect
          </Button>
          {/* <IconEdit color='gray' /> */}
        </Flex>
      </Flex>
      <Divider my={"lg"} />

      <Flex align={"center"} gap={"sm"}>
        <Flex direction={"column"}>
          <Text fw={600}>Customize Notifications</Text>
          <Text size={"sm"}>
            Subscribed to Slack alerts for the business activities listed below.
          </Text>
        </Flex>
      </Flex>
      <Divider
        labelPosition="left"
        label={
          <Text fw={500} size={"lg"}>
            {" "}
            Linkedin
          </Text>
        }
        mb={"sm"}
        mt={"lg"}
      />
      <Flex direction={"column"} gap={"sm"}>
        {linkedinSubscriptions.map((item, index) => {
          return (
            <SlackNotificationCard
              key={index}
              userToken={userToken}
              notification={item}
              backFunction={triggerGetSubscriptions}
            />
          );
        })}
      </Flex>
      <Divider
        labelPosition="left"
        label={
          <Text fw={500} size={"lg"}>
            {" "}
            Email
          </Text>
        }
        mb={"sm"}
        mt={"lg"}
      />
      <Flex direction={"column"} gap={"sm"}>
        {emailSubscriptions.map((item, index) => {
          return (
            <SlackNotificationCard
              key={index}
              userToken={userToken}
              notification={item}
              backFunction={triggerGetSubscriptions}
            />
          );
        })}
      </Flex>
      <Divider
        labelPosition="left"
        label={
          <Text fw={500} size={"lg"}>
            {" "}
            General
          </Text>
        }
        mb={"sm"}
        mt={"lg"}
      />
      <Flex direction={"column"} gap={"sm"}>
        {generalSubscriptions.map((item, index) => {
          return (
            <SlackNotificationCard
              key={index}
              userToken={userToken}
              notification={item}
              backFunction={triggerGetSubscriptions}
            />
          );
        })}
      </Flex>
    </>
  );
}

const SlackNotificationCard = (props: {
  userToken: string;
  notification: SlackNotificationSubscription;
  backFunction: () => void;
}) => {
  const notification = props.notification;

  const [notificationTestLoading, setNotificationTestLoading] = useState(false);
  const [loadingSubscriptionType, setLoadingSubscriptionType] = useState("");

  const triggerTestNotification = async (slackNotificationID: number) => {
    setNotificationTestLoading(true);

    const result = await postPreviewSlackNotification(
      props.userToken,
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
        message:
          "Something went wrong, please try again. Did you hookup your Slack channel?",
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

    const result = await activateSubscription(
      props.userToken,
      slackNotificationID
    );
    if (result.status === "success") {
      props.backFunction();
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

    const result = await deactivateSubscription(
      props.userToken,
      subscriptionId
    );
    if (result.status === "success") {
      props.backFunction();
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

  return (
    <Flex direction={"column"}>
      <label
        htmlFor={notification.notification_type}
        style={{
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Flex
          align={"center"}
          justify={"space-between"}
          style={{
            borderRadius: "6px",
            background: "#fff",
            border: "1px solid #dee2e6",
          }}
          p={"xs"}
        >
          <Flex direction={"column"}>
            <Text fw={600} mt={2} size={"sm"}>
              {notification.notification_name}
            </Text>
            <Text size={"xs"}>{notification.notification_description}</Text>
          </Flex>
          <Flex direction={"column"} justify="center" align="center">
            <Switch
              checked={notification.subscribed}
              id={notification.subscription_id?.toString()}
              size="xs"
              onChange={() => {
                if (notification.subscribed) {
                  triggerDeactivateSubscription(
                    notification.subscription_id,
                    notification.notification_type
                  );
                } else {
                  triggerActivateSubscription(
                    notification.id,
                    notification.notification_type
                  );
                }
              }}
              color="green"
            />
            <Button
              variant="transparent"
              color="grape"
              mt="4px"
              size="xs"
              loading={notificationTestLoading}
              onClick={() => {
                triggerTestNotification(notification.id);
              }}
            >
              {notificationTestLoading ? "" : "Preview"}
            </Button>
          </Flex>
        </Flex>
      </label>
    </Flex>
  );
};
