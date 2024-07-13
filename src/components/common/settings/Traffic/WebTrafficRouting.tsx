import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Switch,
  Text,
  Title,
  Badge,
  Timeline,
  Code,
  Image,
  CopyButton,
  rem,
  Select,
  Collapse,
  Box,
} from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconRefresh,
  IconRocket,
} from "@tabler/icons";
import SlackLogo from "@assets/images/slack-logo.png";
import { useDisclosure } from "@mantine/hooks";
import { IconBracketsAngle } from "@tabler/icons-react";
import { useTrackApi } from "./WebTrafficRoutingApi";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";

export default function WebTrafficRouting() {
  const userToken = useRecoilValue(userTokenState);

  const {
    isLoading,
    getTrackSourceMetadata,
    getScript,
    verifySource,
    getMostRecentTrackEvent,
    getTrackEventHistory,
    getDeanonomizedContacts,
    createIcpRoute,
    updateIcpRoute,
    getAllIcpRoutes,
  } = useTrackApi(userToken);

  const [script, setScript] = useState("");
  const [mostRecentEvent, setMostRecentEvent]: any = useState(null);

  const [loadingRecentEvent, setLoadingRecentEvent] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const [opened, { toggle }] = useDisclosure(true);
  const [openedSlack, { toggle: toggleSlack }] = useDisclosure(true);

  const [sourceMetadata, setSourceMetadata]: any = useState({});

  const scriptStatus = sourceMetadata?.verified ? "Verified" : "Not Verified";

  const fetchMetadata = async (displayNotification: boolean) => {
    setLoadingMetadata(true);
    const data = await getTrackSourceMetadata();
    setSourceMetadata(data);

    if (data?.verified && displayNotification) {
      showNotification({
        title: "Script Verified",
        message: "The script has been verified and is now active",
        color: "green",
      });
    }
    setLoadingMetadata(false);
  };

  const fetchScript = async () => {
    setLoadingScript(true);
    const data = await getScript();
    setScript(data.script);
    setLoadingScript(false);
  };

  useEffect(() => {
    fetchScript();
    fetchMetadata(false);
    handleGetMostRecentEvent();
  }, [userToken]);

  const handleVerifySource = async () => {
    const response = await verifySource();
    handleGetMostRecentEvent();
    fetchMetadata(true);
  };

  const handleGetMostRecentEvent = async () => {
    setLoadingRecentEvent(true);
    const data = await getMostRecentTrackEvent();
    setMostRecentEvent(data);
    setLoadingRecentEvent(false);
  };

  return (
    <Card withBorder p={"lg"}>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={4} mb={"0.25rem"} color="gray.6">
          Web Traffic Routing
        </Title>
        <Switch defaultChecked onChange={toggle} disabled />
      </Flex>
      <Text size={"xs"} color="gray">
        Connect your website to SellScale via a quick code snippet to see how
        website traffic & opportunities correlate
      </Text>
      <Divider mt={4} />
      <Paper withBorder p={"md"} bg={"#fcfcfd"} mt={"lg"}>
        <Flex align={"center"} justify={"space-between"}>
          <Text fw={600}>Steps to Connect Website to SellScale</Text>
          <Flex gap={"xs"} align={"center"}>
            <Text size={"sm"} color="gray" fw={500}>
              Script installation status:
            </Text>
            <Badge
              variant="outline"
              size="lg"
              leftSection={
                <IconCircleCheck size={"0.9rem"} className="mt-[5px]" />
              }
              color={scriptStatus === "Verified" ? "green" : "red"}
            >
              {scriptStatus}
            </Badge>
          </Flex>
        </Flex>
        <Collapse in={opened}>
          <Divider my={"sm"} />
          <Timeline
            mt={"md"}
            active={3}
            bulletSize={22}
            lineWidth={2}
            styles={{
              itemBody: {
                paddingTop: "3px",
                paddingLeft: "8px",
              },
              itemContent: {
                paddingTop: "6px",
              },
              itemBullet: {
                fontSize: "12px",
              },
            }}
          >
            <Timeline.Item bullet="1" title="Copy the tracking script">
              <Code
                bg={"#37414e"}
                block
                px={"md"}
                style={{ whiteSpace: "pre-wrap" }}
                className="relative rounded-md"
              >
                <div className="absolute right-3">
                  <CopyButton value={script} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        leftIcon={
                          copied ? (
                            <IconCheck style={{ width: rem(16) }} />
                          ) : (
                            <IconCopy style={{ width: rem(16) }} />
                          )
                        }
                        onClick={copy}
                        className="bg-white hover:bg-white text-black"
                      >
                        {copied ? "Copied Code" : "Copy Code"}
                      </Button>
                    )}
                  </CopyButton>
                </div>
                <Text color="gray">{script}</Text>
              </Code>
            </Timeline.Item>

            <Timeline.Item bullet="2" title="Log in to website and paste code">
              <Text c="dimmed" size="sm">
                Paste the code into the header of your website somewhere in the{" "}
                <code>{`<head>`}</code> tag.
              </Text>
            </Timeline.Item>

            <Timeline.Item bullet="3" title="Test script">
              <Text c="dimmed" size="xs" fw={500}>
                This is to verify that the script is live and firing properly by
                opening a window to your website. If the tracker is correctly
                installed, the popup will auto close and a success message will
                be displayed.
              </Text>

              {!mostRecentEvent && (
                <Button
                  mt={"sm"}
                  leftIcon={
                    <IconBracketsAngle size={"0.9rem"} className="mt-[2px]" />
                  }
                  onClick={handleGetMostRecentEvent}
                  loading={loadingRecentEvent}
                >
                  Verify Script
                </Button>
              )}

              {mostRecentEvent && (
                <Card withBorder mt="xs">
                  <Text size="sm" color="blue">
                    Captured recent event from the website traffic:
                  </Text>
                  <Flex mt="md">
                    <Image
                      src={
                        "https://logo.clearbit.com/" +
                        mostRecentEvent?.window_location
                          .split("/")[2]
                          .split("/")[0]
                      }
                      alt="logo"
                      width={36}
                      height={36}
                    />
                    <Box ml="xs">
                      <Title order={5}>
                        Visitor at{" "}
                        {mostRecentEvent?.window_location
                          ?.replaceAll("https://", "")
                          .replaceAll("http://", "")}
                      </Title>
                      <Text size="xs" color="gray">
                        Time:{" "}
                        {new Date(mostRecentEvent?.created_at).toLocaleString()}
                      </Text>
                      <Text size="xs" color="gray">
                        IP Address: {mostRecentEvent?.ip_address}
                      </Text>
                    </Box>
                  </Flex>
                  <Divider mt="md" mb="md" />
                  {scriptStatus !== "Verified" && (
                    <Flex>
                      <Button
                        ml="xs"
                        mt={"sm"}
                        color="green"
                        leftIcon={
                          <IconRocket size={"0.9rem"} className="mt-[2px]" />
                        }
                        onClick={handleVerifySource}
                        loading={loadingRecentEvent || loadingMetadata}
                      >
                        Confirm & Activate Script
                      </Button>
                      <Button
                        mt={"sm"}
                        ml="auto"
                        variant="subtle"
                        leftIcon={
                          <IconRefresh size={"0.9rem"} className="mt-[2px]" />
                        }
                        onClick={handleGetMostRecentEvent}
                        loading={loadingRecentEvent}
                      >
                        Refetch
                      </Button>
                    </Flex>
                  )}
                </Card>
              )}
            </Timeline.Item>

            <Timeline.Item
              bullet="4"
              title="View Traffic & Deanonimization Data"
            >
              <Text c="dimmed" size="sm">
                You can now view the traffic data and deanonimization data in
                the SellScale dashboard.
              </Text>
              {scriptStatus == "Verified" && (
                <Button
                  mt={"sm"}
                  leftIcon={<IconRocket size={"0.9rem"} />}
                  color="grape"
                  onClick={() =>
                    window.open("https://app.sellscale.com/website")
                  }
                  loading={loadingMetadata}
                >
                  View Data
                </Button>
              )}
            </Timeline.Item>
          </Timeline>
        </Collapse>
      </Paper>
      {/* <Paper withBorder p={"md"} bg={"#fcfcfd"} mt={"lg"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <Image src={SlackLogo} alt="slack" width={25} height={25} />
            <Flex direction={"column"}>
              <Text fw={600}>Use Custom Webhook</Text>
              <Text color="gray" fw={500} size={"sm"}>
                Subscribe to Slack alerts for the website traffic updates
              </Text>
            </Flex>
          </Flex>
          <Switch defaultChecked onChange={toggleSlack} />
        </Flex>
        <Collapse in={openedSlack}>
          <Divider my={"sm"} />
          <Select data={["Select a channel to get notified"]} />
        </Collapse>
      </Paper> */}
    </Card>
  );
}
