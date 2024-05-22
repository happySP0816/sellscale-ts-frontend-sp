import RichTextArea from "@common/library/RichTextArea";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Flex,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import CampaignChannelPage from '@pages/CampaignChannelPage';

import {
  IconArrowRight,
  IconBuilding,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconMessages,
  IconPlus,
  IconPoint,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { useEffect, useState } from "react";

export default function CampaignTemplateModal({
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

  return (<CampaignChannelPage
    campaignId={innerProps.campaignId}
    cType={innerProps.cType || "linkedin"}
    hideHeader={true}
    hideEmail={false}
    hideLinkedIn={false}
    hideAssets={true}
  />)

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
              <Button leftIcon={<IconPlus size={"0.9rem"} />} onClick={toggleBuilder}>
                Create
              </Button>
            </Flex>
            <TextInput variant="filled" placeholder="Search" icon={<IconSearch size={"0.9rem"} color="gray" />} />
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
          </Paper>
          <Paper withBorder w={"66%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
            <Flex p={"lg"} align={"end"} gap={"sm"} style={{ borderBottom: "1px solid gray" }}>
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
              <Button rightIcon={<IconArrowRight size={"0.9rem"} />} onClick={() => setGenerateSequence(true)}>
                Generate Sequence
              </Button>
            </Flex>
            <ScrollArea h={500}>
              <Flex p={"lg"} h={"100%"} direction={"column"}>
                {generateSequence && steps && steps > 0 ? (
                  <>
                    {Array.from({ length: steps }, (_, index) => {
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
