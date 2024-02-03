import {
  Text,
  Paper,
  Flex,
  Image,
  Button,
  Divider,
  Select,
} from "@mantine/core";
import { useEffect, useState } from "react";
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
  const [connectedChannel, setConnectedChannel] = useState("");

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
      {!slackConnectState && (
        <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
          <Flex align={"center"} justify={"space-between"}>
            <Flex align={"center"} gap={"sm"}>
              <Image src={SlackLogo} alt="slack" width={25} height={25} />
              <Text fw={600}>Connect to your Slack workspace</Text>
            </Flex>
            <Button
              className={"bg-black"}
              variant={"filled"}
              color={""}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://slack.com/oauth/v2/authorize?client_id=3939139709313.4226296432962&scope=app_mentions:read,incoming-webhook,channels:join,chat:write,commands,files:read,files:write,im:write,im:history,im:read,channels:history,links:write,links:read,mpim:history,mpim:read,mpim:write,mpim:write.invites,mpim:write.topic&redirect_uri=${SLACK_REDIRECT_URI}`}
              loading={connecting}
              onClick={() => {
                setConnecting(true);
              }}
            >
              Connect
            </Button>
          </Flex>
          <>
            <Divider my="md" />
            <Text color="gray" size={"xs"} mt={"md"}>
              Install SellScale's Slack bot to get real time alerts and
              visibility into company and people activities. Use the advanced
              section or contact SellScale if installation is not possible.
            </Text>
          </>
        </Paper>
      )}

      {slackConnectState && (
        <>
          <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
            <Flex align={"center"} gap={"sm"}>
              <Image src={SlackLogo} alt="slack" width={25} height={25} />
              <Flex direction={"column"}>
                <Text fw={600}>
                  {connectedChannel
                    ? "✅ Slack Channel Connected"
                    : "Connect a Channel"}
                </Text>
                <Text size={"xs"} color="gray">
                  Slack notifications will be sent to this channel
                </Text>
              </Flex>
            </Flex>
            <Divider mt="md" />
            {connectedChannel ? (
              <SlackNotifications selectedChannel={connectedChannel} />
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
          <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
            <Flex align={"center"} justify={"space-between"}>
              <Flex align={"center"} gap={"sm"}>
                <Image src={SlackLogo} alt="slack" width={25} height={25} />
                <Flex direction={"column"}>
                  <Text fw={600}>✅ Slack Connected</Text>
                  <Text color="gray" size={"xs"}>
                    Connected by{" "}
                    {userData.client.slack_bot_connecting_user_name}
                  </Text>
                </Flex>
              </Flex>
              <Button disabled className={""} variant={"outline"} color={"red"}>
                Connected
              </Button>
            </Flex>
          </Paper>
        </>
      )}
    </>
  );
}
