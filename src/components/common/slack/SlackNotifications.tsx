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
import { IconSend } from "@tabler/icons";

type SlackNotificationSubscription = {
  id: number;
  notification_type: string;
  notification_name: string;
  notification_description: string;
  notification_outbound_channel: "email" | "linkedin" | "all";
  subscription_id: number;
  subscribed: boolean;
};

export const CustomizeSlackNotifications = () => {
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
};

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
          <Flex direction={"column"} align={"flex-start"}>
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
              mt="8px"
              size="xs"
              loading={notificationTestLoading}
              onClick={() => {
                triggerTestNotification(notification.id);
              }}
              styles={{
                root: {
                  padding: 0,
                  height: "10px",
                },
                label: {
                  fontSize: "0.7rem",
                  color: "purple",
                },
                rightIcon: {
                  marginLeft: "4px",
                },
              }}
              rightIcon={
                <IconSend size={".70rem"} stroke={2} color={"purple"} />
              }
            >
              {notificationTestLoading ? "" : "Test"}
            </Button>
          </Flex>
        </Flex>
      </label>
    </Flex>
  );
};
