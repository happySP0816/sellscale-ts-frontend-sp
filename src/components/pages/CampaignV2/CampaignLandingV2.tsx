import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Text,
  TextInput,
  Timeline,
  Title,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import Hook from "@pages/channels/components/Hook";
import {
  IconBrandLinkedin,
  IconCalendar,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconEdit,
  IconMailOpened,
  IconMessages,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
  IconTrafficCone,
  IconTrash,
} from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import { useState } from "react";

export default function CampaignLandingV2() {
  const [personalizers, setPersonalizers] = useState([]);

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);
  const [status, setStatus] = useState("setup");

  //testing per cycle value
  const [cycleStatus, setCycleStatus] = useState(false);

  //contact variable
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactPercent, setContactPercent] = useState(40);

  //sequence variable
  const [sequences, setSequences] = useState([]);
  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);
  const [type, setType] = useState("email");
  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

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
        <Flex direction={"column"} gap={"md"} w={"80%"}>
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
          <Paper withBorder h={"100%"}>
            <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
              <Flex gap={"sm"} align={"center"}>
                <Text fw={600} size={20} color="#37414E">
                  Personalizers
                </Text>
                <Badge leftSection={<IconTrafficCone size={"0.9rem"} className="mt-1" />} color="orange">
                  under contruction
                </Badge>
              </Flex>
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => {
                  openContextModal({
                    modal: "campaignPersonalizersModal",
                    title: <Title order={3}>Personalizers</Title>,
                    innerProps: {
                      setPersonalizers,
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
            <Flex h={"70%"}>
              {personalizers && personalizers.length > 0 ? (
                <Flex direction={"column"} h={"fit-content"} w={"100%"}>
                  <Flex w={"100%"} mah={300} gap={"md"} direction={"column"} p={"lg"}>
                    {personalizers &&
                      personalizers.length > 0 &&
                      personalizers.map((item: any, index: number) => {
                        return (
                          <Switch
                            labelPosition="left"
                            label={
                              <Flex key={index} gap={"md"} align={"center"}>
                                <Text fw={600} size={13}>
                                  {item?.title}
                                </Text>
                                <Divider orientation="vertical" />
                                <Text fw={500} color="gray" size={"xs"}>
                                  {item?.content}
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
                        );
                      })}
                  </Flex>
                  <Flex align={"center"} w={"100%"} justify={"space-between"} p={"md"} style={{ borderTop: "1px solid #ECEEF1" }}>
                    <Flex w={"100%"} align={"center"} justify={"space-between"} style={{ border: "1px solid #ced4da" }}>
                      <Select
                        data={["01", "100", "200"]}
                        maw={80}
                        styles={{
                          input: {
                            border: "0px",
                          },
                        }}
                      />
                      <Divider orientation="vertical" />
                      <Text w={"100%"} align="center" color="gray" size={"sm"} fw={500}>
                        of {50} pages
                      </Text>
                      <Divider orientation="vertical" />
                      <ActionIcon h={"100%"} mx={3}>
                        <IconChevronLeft size={"1.2rem"} />
                      </ActionIcon>
                      <Divider orientation="vertical" />
                      <ActionIcon h={"100%"} mx={3}>
                        <IconChevronRight size={"1.2rem"} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ) : (
                <Text color="gray" fw={400} m={"auto"} size={"sm"}>
                  There are no personalizers here. Add one to get started.
                </Text>
              )}
            </Flex>
          </Paper>
          <Paper withBorder h={"100%"}>
            <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
              <Text fw={600} size={20} color="#37414E">
                Sequences
              </Text>
              {sequences && sequences.length > 0 ? (
                <SegmentedControl
                  onChange={(value: any) => {
                    setType(value);
                  }}
                  data={[
                    {
                      value: "email",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconMailOpened size={"1.2rem"} fill="orange" color="white" />
                          <Text fw={500}>Email Sequence</Text>
                        </Center>
                      ),
                    },
                    {
                      value: "linkedin",
                      label: (
                        <Center style={{ gap: 10 }}>
                          <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                          <Text fw={500}>Linkedin Sequence</Text>
                        </Center>
                      ),
                    },
                  ]}
                />
              ) : (
                <Button
                  leftIcon={<IconPlus size={"0.9rem"} />}
                  onClick={() => {
                    openContextModal({
                      modal: "campaignTemplateModal",
                      title: <Title order={3}>{createTemplateBuilder ? "Template Builder" : "Template"}</Title>,
                      innerProps: {
                        createTemplateBuilder,
                        setCreateTemplateBuilder,
                        setSequences,
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
              )}
            </Flex>
            <Flex h={"70%"}>
              {sequences && sequences.length > 0 ? (
                <Flex direction={"column"} h={"fit-content"} w={"100%"}>
                  <Flex w={"100%"} gap={"md"} direction={"column"} p={"lg"}>
                    {sequences.map((item: any, index: number) => {
                      return (
                        <>
                          <Box style={{ border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da", borderRadius: "8px" }}>
                            <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                              <Flex align={"center"} gap={"xs"}>
                                <IconMessages color="#228be6" size={"0.9rem"} />
                                <Text color="gray" fw={500} size={"xs"}>
                                  Example Message #{index + 1}:
                                </Text>
                                <Text fw={600} size={"xs"} ml={"-5px"}>
                                  {item?.title}
                                </Text>
                              </Flex>
                              <Flex gap={1} align={"center"}>
                                <ActionIcon>
                                  <IconEdit size={"0.9rem"} />
                                </ActionIcon>
                                <ActionIcon>
                                  <IconRefresh size={"0.9rem"} />
                                </ActionIcon>
                                <ActionIcon>
                                  <IconTrash size={"0.9rem"} />
                                </ActionIcon>
                                <ActionIcon
                                  onClick={() => {
                                    handleToggle(index);
                                  }}
                                >
                                  {selectStep === index && opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
                                </ActionIcon>
                              </Flex>
                            </Flex>
                            <Collapse in={selectStep === index && opened} key={index}>
                              <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
                                <Avatar size={"md"} radius={"xl"} src={item?.avatar} />
                                <Box>
                                  <Text fw={600} size={"sm"}>
                                    {item?.name}
                                  </Text>
                                  <Text fw={500} size={"xs"}>
                                    {item?.message}
                                  </Text>
                                </Box>
                              </Flex>
                              <Divider variant="dashed" w={"100%"} />
                              <Flex p={"lg"} justify={"space-between"}>
                                <Flex gap={"sm"}>
                                  <Badge color="grape">{item.point_used} Research Points Used</Badge>
                                  <Badge color="grape">{item.asset_used} Assets Used</Badge>
                                </Flex>
                                <Flex gap={"sm"}>
                                  <Badge
                                    variant="outline"
                                    color="gray"
                                    leftSection={<IconCircleCheck size={"0.9rem"} fill="green" color="white" className="mt-1" />}
                                  >
                                    Opened: {item.opened}%
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    color="gray"
                                    leftSection={<IconCircleCheck size={"0.9rem"} fill="green" color="white" className="mt-1" />}
                                  >
                                    Replied: {item.replied}%
                                  </Badge>
                                </Flex>
                              </Flex>
                            </Collapse>
                          </Box>
                          <Divider
                            variant="dashed"
                            labelPosition="center"
                            label={
                              <Flex gap={1} align={"center"}>
                                <Text color="gray" fw={500} size={"xs"}>
                                  Wait for {2} days
                                </Text>
                                <ActionIcon>
                                  <IconEdit size={"0.9rem"} />
                                </ActionIcon>
                              </Flex>
                            }
                          />
                        </>
                      );
                    })}
                  </Flex>
                </Flex>
              ) : (
                <Text color="gray" fw={400} m={"auto"} size={"sm"}>
                  There are no templates here. Add one to get started.
                </Text>
              )}
            </Flex>
          </Paper>
        </Flex>
        <Flex direction={"column"} gap={"lg"}>
          <Paper withBorder p={"md"}>
            <Text fw={600} size={20} color="#37414E">
              Campaign Progress
            </Text>
            <Timeline
              active={0}
              bulletSize={28}
              lineWidth={2}
              mt={"lg"}
              styles={{
                itemTitle: {
                  fontWeight: 600,
                },
                itemBody: {
                  paddingTop: "4px",
                },
                itemBullet: {
                  fontSize: "14px",
                },
              }}
            >
              <Timeline.Item bullet={1} title="Add Contacts" lineVariant="dashed">
                <Text c="dimmed" size="sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={2} title="Setup Templates" lineVariant="dashed">
                <Text c="dimmed" size="sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elt.
                </Text>
              </Timeline.Item>

              <Timeline.Item bullet={3} title="Add Personalizers">
                <Text c="dimmed" size="sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elt.
                </Text>
              </Timeline.Item>
            </Timeline>
          </Paper>
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
      </Flex>
    </Paper>
  );
}
