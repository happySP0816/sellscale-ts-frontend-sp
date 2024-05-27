import RichTextArea from "@common/library/RichTextArea";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Switch,
  Text,
  Title,
  TextInput,
  Badge,
  Tabs,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { MantineStyleSystemProps } from "@mantine/styles";

import { IconArrowRight, IconChevronDown, IconChevronUp, IconEdit, IconMessages, IconPlus, IconPoint, IconRefresh, IconSearch, IconTrash } from "@tabler/icons";
import { useEffect, useState } from "react";

interface SwitchStyle extends Partial<MantineStyleSystemProps> {
  label?: React.CSSProperties;
  root?: React.CSSProperties;
}

export default function CampaignTemplateEditModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  createTemplateBuilder: boolean;
  setCreateTemplateBuilder: Function;
  setSequences: Function;
  campaignId: number;
  cType?: string;
}>) {
  const [templateType, setTemplateType] = useState("template" || "generate");
  const [sequenceType, setSequenceType] = useState<string | null>("");
  const [steps, setSteps] = useState();
  const [generateSequence, setGenerateSequence] = useState(false);
  const [openid, setOpenId] = useState<number>(0);
  const [opened, setOpened] = useState(false);
  const [selectStep, setSelectStep] = useState<number | null>(null);

  const data = [
    {
      title: "Personalized Opener",
      avatar: "",
      name: "Ishan Sharma",
      message:
        "Hey Shadi! Impressed by your track record of scaling businesses and building strong teams, not to mention your transformative approach to customer conversations. Given your experience as an executive leader in Saas and laas, I'm curious if you'd be interested in exploring opportunities at SellScale? Let's  connect and chat more about it!",
      point_used: 14,
      asset_used: 14,
      opened: 12,
      replied: 4.6,
    },
    {
      title: "Personalized Opener",
      avatar: "",
      name: "Ishan Sharma",
      message:
        "Hey Shadi! Impressed by your track record of scaling businesses and building strong teams, not to mention your transformative approach to customer conversations. Given your experience as an executive leader in Saas and laas, I'm curious if you'd be interested in exploring opportunities at SellScale? Let's  connect and chat more about it!",
      point_used: 14,
      asset_used: 14,
      opened: 12,
      replied: 4.6,
    },
    {
      title: "Personalized Opener",
      avatar: "",
      name: "Ishan Sharma",
      message:
        "Hey Shadi! Impressed by your track record of scaling businesses and building strong teams, not to mention your transformative approach to customer conversations. Given your experience as an executive leader in Saas and laas, I'm curious if you'd be interested in exploring opportunities at SellScale? Let's  connect and chat more about it!",
      point_used: 14,
      asset_used: 14,
      opened: 12,
      replied: 4.6,
    },
  ];

  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

  const [isBuilder, setIsBuilder] = useState(innerProps.createTemplateBuilder);
  useEffect(() => {
    setIsBuilder(innerProps.createTemplateBuilder);
  }, [innerProps.createTemplateBuilder]);

  // Function to toggle the builder view
  const toggleBuilder = () => {
    const newBuilderState = !isBuilder;
    setIsBuilder(newBuilderState); // Update local state to force re-render
    innerProps.setCreateTemplateBuilder(newBuilderState); // Update parent state
  };

  return (
    <div key={innerProps.createTemplateBuilder ? "builder" : "template"}>
      {isBuilder ? (
        <>
          <Paper withBorder>
            <Flex direction={"column"}>
              <Flex p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
                <Text fw={600}>Mass Import Research</Text>
              </Flex>
              <Flex direction={"column"} p={"lg"} mt={"sm"} gap={"sm"} style={{ borderBottom: "1px solid #dee2e6" }} pb={70}>
                <Box>
                  <Text size={"xs"} fw={500}>
                    Raw Data
                  </Text>
                  <Text size={"xs"} fw={500} color="gray">
                    Past in case studies, phrases, email templates, or others.
                  </Text>
                  <Box mt={4}>
                    <RichTextArea height={200} />
                  </Box>
                </Box>
                <Flex direction={"column"} gap={"sm"}>
                  <Text size={"xs"} fw={500}>
                    Asset Extraction (Optional)
                  </Text>
                  <Flex gap={"xl"} justify={"space-between"}>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Value Props"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Offers"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                  </Flex>
                  <Flex gap={"xl"} justify={"space-between"}>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Pain Points"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                    <Flex gap={"sm"} align={"center"} w={"100%"}>
                      <Switch
                        labelPosition="left"
                        label={"Social Proof"}
                        w={"100%"}
                        styles={{
                          root: {
                            border: "1px solid #D9DEE5",
                            padding: "7px",
                            borderRadius: "4px",
                          },
                          body: {
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          },
                        }}
                      />
                      <NumberInput w={200} placeholder="Amount" />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justify={"end"} p={"lg"} gap={"lg"}>
                <Button variant="outline" color="gray" fullWidth onClick={toggleBuilder}>
                  Go Back
                </Button>
                <Button fullWidth>Generate Assets</Button>
              </Flex>
            </Flex>
          </Paper>
        </>
      ) : (
        <Flex gap={"md"} mt={"lg"}>
          <Paper withBorder p={"lg"} w={"35%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
            <Flex align={"center"} justify={"space-between"}>
              <Text fw={600}>Templates</Text>
              <SegmentedControl
                value={templateType}
                onChange={(value: any) => {
                  setTemplateType(value);
                  //   if (value === "template") {
                  //     setSequences(emailSequenceData);
                  //   } else {
                  //     setSequences(linkedinSequenceData);
                  //   }
                }}
                data={[
                  {
                    value: "template",
                    label: (
                      <Center style={{ gap: 10 }}>
                        <Text fw={500}>Templates</Text>
                      </Center>
                    ),
                  },
                  {
                    value: "generate",
                    label: (
                      <Center style={{ gap: 10 }}>
                        <Text fw={500}>Generator</Text>
                      </Center>
                    ),
                  },
                ]}
              />
            </Flex>
            <TextInput variant="filled" placeholder="Search" icon={<IconSearch size={"0.9rem"} color="gray" />} />
            {templateType === "template" ? <Templates /> : <Generates />}
          </Paper>
          <Paper withBorder w={"66%"} display={"flex"} style={{ flexDirection: "column" }}>
            <Flex p={"lg"} align={"end"} gap={"sm"} style={{ borderBottom: "1px solid #DEE2E6" }}>
              <Select
                label="Sequence Type"
                placeholder="Select Sequence type"
                value={sequenceType || ""}
                onChange={(value) => setSequenceType(value)}
                data={[
                  { label: "Linkedin", value: "linkedin" },
                  { label: "Email", value: "email" },
                ]}
              />
              <NumberInput w={120} label="No. of Steps" onChange={(val: any) => setSteps(val)} value={steps || undefined} />
              {templateType === "generate" && (
                <Button rightIcon={<IconArrowRight size={"0.9rem"} />} onClick={() => setGenerateSequence(true)}>
                  Generate Sequence
                </Button>
              )}
            </Flex>
            <Tabs
              defaultValue="step1"
              styles={{
                tabsList: {
                  background: "#ECEEF1",
                  padding: "8px",
                },
              }}
            >
              <Tabs.List>
                <Tabs.Tab value="step1">Step 1</Tabs.Tab>
                <Tabs.Tab value="step2">Step 2</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="step1">
                {" "}
                <ScrollArea h={460}>
                  <Flex p={"lg"} h={"100%"} direction={"column"}>
                    {generateSequence && steps && Number(steps) > 0 ? (
                      <>
                        {Array.from({ length: Number(steps) }, (_, index) => {
                          return (
                            <>
                              <>
                                <Box style={{ border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da", borderRadius: "8px" }}>
                                  <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                                    <Flex align={"center"} gap={"xs"}>
                                      <IconMessages color="#228be6" size={"0.9rem"} />
                                      <Text color="gray" fw={500} size={"xs"}>
                                        Example Message #{index + 1}:
                                      </Text>
                                      <Text fw={600} size={"xs"} ml={"-5px"}>
                                        {"Pain point based"}
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
                                      <Avatar size={"md"} radius={"xl"} />
                                      <Box>
                                        <Text fw={600} size={"sm"}>
                                          {"Ishan Sharma"}
                                        </Text>
                                        <Text fw={500} size={"xs"}>
                                          {"Hi,"}
                                        </Text>
                                        <Text fw={500} size={"xs"}>
                                          {"You need to increase pipeline. We have a solution that does that. Chat?"}
                                        </Text>
                                      </Box>
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
                            </>
                          );
                        })}
                      </>
                    ) : (
                      <Text m={"auto"}>There is no sequence here. Generate one to get started.</Text>
                    )}
                  </Flex>
                </ScrollArea>
              </Tabs.Panel>
              <Tabs.Panel value="step2">This is Step 2 section</Tabs.Panel>
            </Tabs>

            <Flex gap={"md"} p={"lg"} style={{ borderTop: "1px solid #dee2e6" }}>
              <Button fullWidth variant="outline">
                Reset
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  innerProps.setSequences(data);
                  context.closeModal(id);
                }}
              >
                Add Sequence
              </Button>
            </Flex>
          </Paper>
        </Flex>
      )}
    </div>
  );
}

export const Templates = () => {
  const switchStyle = {
    root: {
      border: "1px solid #D9DEE5",
      padding: "12px",
      borderRadius: "4px",
    },
    label: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      width: "100%",
    },
  };
  return (
    <>
      <Button
        variant="light"
        leftIcon={<IconPlus size={"0.9rem"} />}
        onClick={() =>
          openContextModal({
            modal: "campaignTemplates",
            title: (
              <Title order={3}>
                <span className=" text-gray-500">Go back to</span> Sequence Builder
              </Title>
            ),
            innerProps: {},
            centered: true,
            styles: {
              content: {
                minWidth: "800px",
              },
            },
          })
        }
      >
        Create New
      </Button>
      <Flex direction={"column"} gap={"xs"}>
        <Switch
          labelPosition="left"
          style={switchStyle.root}
          label={
            <Box>
              <Flex gap={6}>
                <Badge size="sm" radius={"sm"}>
                  Intro
                </Badge>
                <Badge size="sm" color="pink" radius={"sm"}>
                  Gift
                </Badge>
                <Badge size="sm" color="green" radius={"sm"}>
                  $20
                </Badge>
              </Flex>
              <Text mt={3} size={"sm"} fw={500}>
                Hi, would you like a 20$ gift card?...
              </Text>
            </Box>
          }
        />
        <Switch
          labelPosition="left"
          style={switchStyle.root}
          label={
            <Box>
              <Flex gap={6}>
                <Badge size="sm" radius={"sm"}>
                  Intro
                </Badge>
                <Badge size="sm" color="pink" radius={"sm"}>
                  Pain Based
                </Badge>
              </Flex>
              <Text mt={3} size={"sm"} fw={500} className="truncate">
                Hi, would you like a 20$ gift card?...
              </Text>
            </Box>
          }
        />
        <Switch
          labelPosition="left"
          style={switchStyle.root}
          label={
            <Box>
              <Flex gap={6}>
                <Badge size="sm" radius={"sm"}>
                  Intro
                </Badge>
                <Badge size="sm" color="pink" radius={"sm"}>
                  Gift
                </Badge>
                <Badge size="sm" color="green" radius={"sm"}>
                  $20
                </Badge>
              </Flex>
              <Text mt={3} size={"sm"} fw={500} className="truncate">
                Hi, would you like a 20$ gift card?...
              </Text>
            </Box>
          }
        />
      </Flex>
    </>
  );
};

export const Generates = () => {
  return (
    <>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint fill="#EB8231" color="white" size={"2rem"} className="mb-[2px]" />
              <Text tt={"uppercase"}>case study</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint fill="#3B85EF" color="white" size={"2rem"} className="mb-[2px]" />
              <Text tt={"uppercase"}>value props</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
      <Flex direction={"column"} gap={"xs"}>
        <Divider
          label={
            <Flex align={"center"}>
              <IconPoint fill="#E74B41" color="white" size={"2rem"} className="mb-[2px]" />
              <Text tt={"uppercase"}>offers</Text>
            </Flex>
          }
          labelPosition="left"
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
        <Switch
          labelPosition="left"
          label={"43% pf SDRs turn out within the first year."}
          styles={{
            root: {
              border: "1px solid #D9DEE5",
              padding: "12px",
              borderRadius: "4px",
            },
            label: {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "240px",
            },
          }}
        />
      </Flex>
    </>
  );
};
