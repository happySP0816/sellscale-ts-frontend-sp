import {
  Text,
  Paper,
  Flex,
  Image,
  Button,
  Divider,
  Select,
} from "@mantine/core";
import { IconX } from "@tabler/icons";
import { useEffect, useState } from "react";
import SlackAlert from "./SlackAlert";
import SlackNotifications from "./SlackNotifications";

import SlackLogo from "@assets/images/slack-logo.png";
import { useSearchParams } from "react-router-dom";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { getConnectedSlackChannels } from "@utils/requests/slack";

const SLACK_REDIRECT_URI = `${window.location.origin}/settings?tab=slack`;

type ChannelListType = {
  channelName: string;
  link: string;
  invitedUser: string;
};

export default function SlackbotSection() {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [searchParams] = useSearchParams();

  const [connecting, setConnecting] = useState(false);
  const [slackConnectState, setSlackConnectState] = useState(false);
  const [channelConnected, setChannelConnected] = useState(false);
  const [connectedChannel, setConnectedChannel] = useState("");
  const [channelList, setChannelList] = useState<ChannelListType[] | undefined>(
    [
      {
        channelName: "#finance-ramp1",
        link: "https://#finance-ramp1",
        invitedUser: "Ishan Sharma",
      },
      {
        channelName: "#finance-ramp2",
        link: "https://#finance-ramp2",
        invitedUser: "David Wei",
      },
      {
        channelName: "#finance-ramp3",
        link: "https://#finance-ramp3",
        invitedUser: "Aakash Adesara",
      },
      {
        channelName: "#finance-ramp4",
        link: "https://#finance-ramp4",
        invitedUser: "Anton Sokolov",
      },
      {
        channelName: "#finance-ramp5",
        link: "https://#finance-ramp5",
        invitedUser: "Aaron Cessar",
      },
    ]
  );

  const triggerGetConnectedSlackChannels = async () => {
    const result = await getConnectedSlackChannels(userToken);
    const channels = result.data.channels;
    setConnectedChannel(channels[0].slack_channel_name);
  };

  useEffect(() => {
    if (searchParams.get("tab") === "slack" && searchParams.get("code")) {
      setConnecting(true);
    }
    if (userData.client.slack_bot_connected) {
      setSlackConnectState(true);
      setConnecting(false);
      triggerGetConnectedSlackChannels();
    }
  }, []);

  useEffect(() => {
    if (userData.client.slack_bot_connected) {
      setSlackConnectState(true);
      setConnecting(false);
    }
  }, [userData.client.slack_bot_connected]);

  return (
    <>
      <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <Image src={SlackLogo} alt="slack" width={25} height={25} />
            {slackConnectState ? (
              <Flex direction={"column"}>
                <Text fw={600}>✅ Slack Connected</Text>
                <Text color="gray" size={"xs"}>
                  Connected by {userData.client.slack_bot_connecting_user_name}
                </Text>
              </Flex>
            ) : (
              <Text fw={600}>Connect to your Slack workspace</Text>
            )}
          </Flex>
          <Button
            className={`${slackConnectState ? "" : "bg-black"}`}
            variant={slackConnectState ? "outline" : "filled"}
            color={slackConnectState ? "red" : ""}
            disabled={slackConnectState}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://slack.com/oauth/v2/authorize?client_id=3939139709313.4226296432962&scope=app_mentions:read,incoming-webhook,channels:join,chat:write,commands,files:read,files:write,im:write,im:history,im:read,channels:history,links:write,links:read,mpim:history,mpim:read,mpim:write,mpim:write.invites,mpim:write.topic&redirect_uri=${SLACK_REDIRECT_URI}`}
            loading={connecting}
            onClick={() => {
              setConnecting(true);
            }}
          >
            {slackConnectState ? "Connected" : "Connect"}
          </Button>
        </Flex>
        {!slackConnectState && (
          <>
            <Divider my="md" />
            <Text color="gray" size={"xs"} mt={"md"}>
              Install SellScale's Slack bot to get real time alerts and
              visibility into company and people activities. Use the advanced
              section or contact SellScale if installation is not possible.
            </Text>
          </>
        )}
      </Paper>
      {slackConnectState && (
        <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
          <Flex align={"center"} gap={"sm"}>
            <Image src={SlackLogo} alt="slack" width={25} height={25} />
            <Flex direction={"column"}>
              <Text fw={600}>
                {channelConnected
                  ? "✅ Slack Channel Connected"
                  : "Connect a Channel"}
              </Text>
              <Text size={"xs"} color="gray">
                Slack notifications will be sent to this channel
              </Text>
            </Flex>
          </Flex>
          <Divider mt="md" />
          {connectedChannel !== undefined ? (
            <SlackAlert selectedChannel={connectedChannel} />
          ) : (
            <Select
              // data={channelList!.map((channel) => ({
              //   value: channel.channelName,
              //   label: channel.channelName,
              // }))}
              data={[]}
              value={connectedChannel}
              // onChange={(value) => {
              //   if (value) {
              //     const selected = channelList!.find((channel) => channel.channelName === value);
              //     setSelectedChannel(selected);
              //   }
              // }}
              // mt={'md'}
              // placeholder='Select a channel to get notified!'
            />
          )}
        </Paper>
      )}
      {/* {channelConnected && (
        <SlackNotifications/>
      )} */}
    </>
  );
}
