import { Avatar, Badge, Box, Button, Divider, Flex, Group, Paper, ScrollArea, Select, Slider, Switch, Text, TextInput, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import Hook from "@pages/channels/components/Hook";
import { IconBrandLinkedin, IconCalendar, IconChecks, IconMailOpened, IconPlus, IconSearch, IconSend } from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import { useState } from "react";

export default function CampaignLandingV2() {
  const [templates, setTemplates] = useState([]);
  const [personalizers, setPersonalizers] = useState([]);

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);
  const [status, setStatus] = useState("setup");

  //testing per cycle value
  const [cycleStatus, setCycleStatus] = useState(false);

  //contact variable
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactPercent, setContactPercent] = useState(40);

  return (
    <Paper p={"lg"}>
      <Flex p={"lg"} style={{ border: "1px solid #3B85EF", borderRadius: "6px" }}>
        <Flex direction={"column"} gap={"sm"} w={"100%"}>
          <Flex gap={"sm"} align={"center"}>
            <Avatar src={""} size={"md"} radius={"xl"} />
            <Text fw={600} size={20}>
              {"HR Leaders Tier1-GOV, Pharma, Business Support 1500+ employees in EMEA"}
            </Text>
            <Button
              tt={"uppercase"}
              variant="light"
              size="xs"
              disabled={status === "deactivated" && true}
              color={status === "setup" ? "orange" : status === "activate" ? "green" : ""}
              onClick={() => {
                if (status === "setup") setStatus("activate");
                else if (status === "activate") {
                  setStatus("deactivated");
                }
              }}
            >
              {status}
            </Button>
          </Flex>
          <Flex align={"center"} gap={"xs"}>
            {/* <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" className="mb-[2px]" />
            <IconMailOpened size={"1.4rem"} fill="orange" color="white" className="mb-[2px]" />
            <Divider orientation="vertical" h={"70%"} my={"auto"} /> */}
            <Text color="gray" size={"xs"} fw={600}>
              Created by:
            </Text>
            <Avatar size={"sm"} src={""} />
            <Text fw={600} size={"xs"}>
              {"David Wei"}
            </Text>
            <Divider orientation="vertical" h={"70%"} my={"auto"} />
            <Text color="gray" size={"xs"} fw={600}>
              Created:
            </Text>
            <Text fw={600} size={"xs"}>
              {"May 13, 2024"}
            </Text>
            {/* <Divider orientation="vertical" h={"70%"} my={"auto"} />
            <Text color="gray" fw={600} size={"xs"}>
              Average Contract Value (ACV):
            </Text>
            <Text fw={600} size={"xs"}>
              ${"1000"}
            </Text>
            <ActionIcon>
              <IconEdit />
            </ActionIcon> */}
            <Text size={"xs"} fw={600} underline color="#3B85EF" ml={"sm"}>
              Duplicate Campaign
            </Text>
          </Flex>
          {/* <Text size={"sm"}>
            <span style={{ fontWeight: 600 }}>Campaign Objective:</span>
            <span style={{ fontWeight: 400, marginLeft: "6px" }}>
              {
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam condimentum urna sed nisl vehicula iaculis. Phasellus feugiat laoreet ipsum, ac gravida velit maximus non. Sed feugiat, elit sit amet suscipit mattis, enim magna ornare arcu, eget ult."
              }
            </span>
          </Text> */}
          <Flex gap={"lg"} w={"100%"}>
            <Flex>
              <Paper
                p="md"
                sx={{
                  flex: 1,
                  justifyContent: "space-between",
                  textAlign: "center",
                  // make background a grid of dots
                  backgroundImage: "radial-gradient(#00000022 .05em, transparent .05em)",
                  backgroundSize: "20px 20px",
                }}
                withBorder
              >
                <Group noWrap sx={{ flex: 1, justifyContent: "center" }}>
                  <Switch
                    labelPosition="left"
                    label={
                      <Flex gap={4} align={"center"}>
                        <IconMailOpened size={"1.2rem"} fill="#3B85EF" color="white" />
                        <Text color="#3B85EF" fw={500}>
                          Email
                        </Text>
                      </Flex>
                    }
                    miw={190}
                    styles={{
                      root: {
                        border: "1px solid #D9DEE5",
                        padding: "7px",
                        borderRadius: "4px",
                        background: "white",
                      },
                      body: {
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      },
                    }}
                  />
                  <Divider variant="dashed" labelPosition="center" label={<Hook linkedLeft={false} linkedRight={false} />} />
                  <Select
                    label="Connect Sequences"
                    size="sm"
                    mb={"md"}
                    // value={selectedConnectionType}
                    w={200}
                    data={[
                      {
                        label: "[❌] No Connection",
                        value: "RANDOM",
                      },
                      {
                        label: "[📧 → 🤝] Sent Only - ",
                        value: "ALL_PROSPECTS",
                      },
                      {
                        label: "[👀 → 🤝] Opened Only - ",
                        value: "OPENED_EMAIL_PROSPECTS_ONLY",
                      },
                      {
                        label: "[⚡️ → 🤝] Clicked Only - ",
                        value: "CLICKED_LINK_PROSPECTS_ONLY",
                      },
                    ]}
                    placeholder="Select an event"
                  />
                  <Divider variant="dashed" labelPosition="center" label={<Hook linkedLeft={false} linkedRight={false} />} />
                  <Switch
                    labelPosition="left"
                    label={
                      <Flex gap={4} align={"center"}>
                        <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                        <Text color="#3B85EF" fw={500}>
                          Linkedin
                        </Text>
                      </Flex>
                    }
                    miw={190}
                    styles={{
                      root: {
                        border: "1px solid #D9DEE5",
                        padding: "7px",
                        borderRadius: "4px",
                        background: "white",
                      },
                      body: {
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      },
                    }}
                  />
                </Group>
              </Paper>
            </Flex>
            <Flex w={"40%"}>
              <Paper p="md" withBorder w={"100%"}>
                <Flex justify={"space-between"}>
                  <Text size={"sm"} fw={500}>
                    Testing volume per cycle:
                  </Text>
                  <Text size={"sm"} fw={500}>
                    200/week (Email)
                  </Text>
                </Flex>
                <Flex w={"100%"} align={"start"} gap={"sm"} mt={"md"}>
                  <Slider
                    w={"100%"}
                    onChange={() => setCycleStatus(true)}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 100, label: <div style={{ whiteSpace: "nowrap", marginLeft: "-100px" }}>MAX (DISTRIBUTE)</div> },
                    ]}
                  />
                  <Button disabled={!cycleStatus}>Save</Button>
                </Flex>
              </Paper>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex gap={"lg"} mt={"md"}>
        <Flex direction={"column"} gap={"md"} miw={"65%"}>
          <Paper withBorder>
            <Flex align={"center"} justify={"space-between"}>
              <Box p={"lg"} w={"100%"}>
                <Flex align={"center"} gap={"xs"}>
                  <IconSend size={"0.9rem"} color="#3B85EF" className="mb-[2px]" />
                  <Text fw={400} size={"sm"}>
                    Sent
                  </Text>
                </Flex>
                <Flex align={"center"} gap={"sm"}>
                  {" "}
                  <Text fz={24}>{"00"}</Text>
                  <Badge color="green" size="xs">
                    {"100"}%
                  </Badge>
                </Flex>
              </Box>
              <Divider orientation="vertical" />
              <Box p={"lg"} w={"100%"}>
                <Flex align={"center"} gap={6}>
                  <IconChecks size={"0.9rem"} color="pink" className="mb-[2px]" />
                  <Text fw={400} size={"sm"}>
                    Open
                  </Text>
                </Flex>
                <Flex align={"center"} gap={"sm"}>
                  {" "}
                  <Text fz={24}>{"00"}</Text>
                  <Badge color="green" size="xs">
                    {"0"}%
                  </Badge>
                </Flex>
              </Box>
              <Divider orientation="vertical" />
              <Box p={"lg"} w={"100%"}>
                <Flex align={"center"} gap={6}>
                  <IconMessageCheck size={"0.9rem"} color="orange" className="mb-[2px]" />
                  <Text fw={400} size={"sm"}>
                    Reply
                  </Text>
                </Flex>
                <Flex align={"center"} gap={"sm"}>
                  <Text fz={24}>{"00"}</Text>
                  <Badge color="green" size="xs">
                    {"100"}%
                  </Badge>
                </Flex>
              </Box>
              <Divider orientation="vertical" />
              <Box p={"lg"} w={"100%"}>
                <Flex align={"center"} gap={6}>
                  <IconMessageCheck size={"0.9rem"} color="green" className="mb-[2px]" />
                  <Text fw={400} size={"sm"}>
                    Positive Reply
                  </Text>
                </Flex>
                <Flex align={"center"} gap={"sm"}>
                  <Text fz={24}>{"00"}</Text>
                  <Badge color="green" size="xs">
                    {"0"}%
                  </Badge>
                </Flex>
              </Box>
              <Divider orientation="vertical" />
              <Box p={"lg"} w={"100%"}>
                <Flex align={"center"} gap={6}>
                  <IconCalendar size={"0.9rem"} color="green" className="mb-[2px]" />
                  <Text fw={400}>Demo</Text>
                </Flex>
                <Flex align={"center"} gap={"sm"}>
                  <Text fz={24}>{"00"}</Text>
                  <Badge color="green" size="xs">
                    {"100"}%
                  </Badge>
                </Flex>
              </Box>
            </Flex>
          </Paper>
          <Paper withBorder>
            <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
              <Text fw={600} size={20} color="#37414E">
                Templates
              </Text>
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => {
                  openContextModal({
                    modal: "campaignTemplateModal",
                    title: <Title order={3}>{createTemplateBuilder ? "Template Builder" : "Template"}</Title>,
                    innerProps: {
                      createTemplateBuilder,
                      setCreateTemplateBuilder,
                    },
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "1040px",
                      },
                    },
                  });
                }}
              >
                Add
              </Button>
            </Flex>
            <Flex mih={templates ? 120 : ""}>
              {templates ? (
                <Text color="gray" fw={400} m={"auto"} size={"sm"}>
                  There are no templates here. Add one to get started.
                </Text>
              ) : (
                <Box>123123</Box>
              )}
            </Flex>
          </Paper>
          <Paper withBorder>
            <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
              <Text fw={600} size={20} color="#37414E">
                Personalizers
              </Text>
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => {
                  openContextModal({
                    modal: "campaignPersonalizersModal",
                    title: <Title order={3}>Personalizers</Title>,
                    innerProps: {},
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "1040px",
                      },
                    },
                  });
                }}
              >
                Add
              </Button>
            </Flex>
            <Flex mih={contacts ? 120 : ""}>
              {contacts ? (
                <Text color="gray" fw={400} m={"auto"} size={"sm"}>
                  There are no personalizers here. Add one to get started.
                </Text>
              ) : (
                <Box>123123</Box>
              )}
            </Flex>
          </Paper>
        </Flex>
        <Paper withBorder w={"100%"}>
          <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
            <Flex align={"center"} gap={"sm"}>
              <Text fw={600} size={20} color="#37414E">
                Contacts
              </Text>
              {contacts && contacts.length > 0 && (
                <Badge variant="light" color={contactPercent < 50 ? "orange" : "green"}>
                  {contactPercent}%
                </Badge>
              )}
            </Flex>
            <Button
              leftIcon={<IconPlus size={"0.9rem"} />}
              onClick={() => {
                openContextModal({
                  modal: "campaignContactsModal",
                  title: <Title order={3}>Contacts</Title>,
                  innerProps: {
                    setContacts,
                  },
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "1040px",
                    },
                  },
                });
              }}
            >
              Add
            </Button>
          </Flex>
          <Flex h={"100%"} p={contacts && contacts.length > 0 ? "" : 80}>
            {contacts && contacts.length > 0 ? (
              <Flex direction={"column"} gap={"sm"} w={"100%"}>
                <TextInput placeholder="Search prospects, companies, titles" rightSection={<IconSearch size={"0.9rem"} color="gray" />} />
                <ScrollArea h={365}>
                  <Flex direction={"column"} gap={"sm"}>
                    {contacts.map((item: any, index: number) => {
                      return (
                        <Flex key={index} gap={"sm"}>
                          <Avatar size={"md"} radius={"xl"} src={item.avatar} />
                          <Box>
                            <Flex align={"center"} gap={"xs"}>
                              <Text fw={500}>{item.name}</Text>
                              <Badge>{item.prospects}</Badge>
                            </Flex>
                            <Text color="gray" fw={500} size={"xs"}>
                              {item.companies}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </Flex>
                </ScrollArea>
              </Flex>
            ) : (
              <Text color="gray" fw={400} m={"auto"} align="center" size={"sm"}>
                There are no contacts here. Add one to get started.
              </Text>
            )}
          </Flex>
        </Paper>
      </Flex>
    </Paper>
  );
}
