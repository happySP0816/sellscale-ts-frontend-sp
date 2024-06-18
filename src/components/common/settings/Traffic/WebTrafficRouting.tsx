import { Button, Card, Divider, Flex, Paper, Switch, Text, Title, Badge, Timeline, Code, Image, CopyButton, rem, Select, Collapse } from "@mantine/core";
import { IconCheck, IconCircleCheck, IconCopy } from "@tabler/icons";
import SlackLogo from "@assets/images/slack-logo.png";
import { useDisclosure } from "@mantine/hooks";
import { IconBracketsAngle } from "@tabler/icons-react";

export default function WebTrafficRouting() {
  const script = `<script>
    ! function () {var reb2b = window.reb2b = window.reb2b | | [];
    if (reb2b.invoked) return; reb2b.invoked = true; reb2b.methods = ["identify", "collect"];
    reb2b. factory = function (method) {return function () {var args = Array.prototype.slice.call(arguments);
    args.unshift(method);reb2b.push(args);return reb2b;};};
    for (var i = 0; i < reb2b.methods. length; i++) {var key = reb2b.methods[i]; reb2b[key] = reb2b. factory(key)
    reb2b. load = function (key) {var script = document.createElement("script");script.type = "text/javascript'
    script.src = "https://s3-us-west-2.amazonaws.com/b2bjsstore/b/"+ key +"/reb2b.js.gz";
    var first = document.getElementsByTagName("script") [0];
    first.parentNode. insertBefore(script, first);};
    reb2b.SNIPPET_VERSION ="1.0.1";reb2b.load("ZQ6J2RH1W86D");}();
    </script>`;

  const [opened, { toggle }] = useDisclosure(true);
  const [openedSlack, { toggle: toggleSlack }] = useDisclosure(true);
  return (
    <Card withBorder p={"lg"}>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={4} mb={"0.25rem"} color="gray.6">
          Web Traffic Routing
        </Title>
        <Switch defaultChecked onChange={toggle} />
      </Flex>
      <Text size={"xs"} color="gray">
        Connect your website to SellScale via a quick code snippet to see how website traffic & opportunites correlate
      </Text>
      <Divider mt={4} />
      <Paper withBorder p={"md"} bg={"#fcfcfd"} mt={"lg"}>
        <Flex align={"center"} justify={"space-between"}>
          <Text fw={600}>Steps to Connect Website to SellScale</Text>
          <Flex gap={"xs"} align={"center"}>
            <Text size={"sm"} color="gray" fw={500}>
              Script installation status:
            </Text>
            <Badge variant="outline" leftSection={<IconCircleCheck size={"0.9rem"} className="mt-[5px]" />} color="green">
              Verified
            </Badge>
          </Flex>
        </Flex>
        <Collapse in={opened}>
          <Divider my={"sm"} />
          <Timeline
            mt={"md"}
            active={2}
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
              <Code bg={"#37414e"} block px={"md"} className="relative rounded-md">
                <div className="absolute right-3">
                  <CopyButton value={script} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        leftIcon={copied ? <IconCheck style={{ width: rem(16) }} /> : <IconCopy style={{ width: rem(16) }} />}
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
                Paste the code into the header of your website
              </Text>
            </Timeline.Item>

            <Timeline.Item bullet="3" title="Test script">
              <Text c="dimmed" size="xs" fw={500}>
                This is to verify taht the script is live and firing properly by opening a window to your website. If the tracker is correctly installed, the
                popup will auto close and a success message will be displayed.
              </Text>
              <Button mt={"sm"} leftIcon={<IconBracketsAngle size={"0.9rem"} className="mt-[2px]" />}>
                Test Script on Website
              </Button>
            </Timeline.Item>
          </Timeline>
        </Collapse>
      </Paper>
      <Paper withBorder p={"md"} bg={"#fcfcfd"} mt={"lg"}>
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
      </Paper>
    </Card>
  );
}
