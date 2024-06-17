import { ActionIcon, Avatar, Badge, Box, Button, Card, Divider, Flex, Paper, Switch, Text, Textarea, List, Collapse, ScrollArea } from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import {
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconInfoCircle,
  IconMail,
  IconMessages,
  IconMicrophone,
  IconPlus,
  IconPoint,
  IconRefresh,
} from "@tabler/icons";
import { useState } from "react";

export default function LinkedinSequenceSectionV2() {
  const [data, setData] = useState([
    {
      step: "First Message",
      status: true,
      title: "Cold Outreach",
      content: "prospect",
      active_templates: 2,
      templates: [
        {
          types: ["Intro", "Gift", "$20"],
          content: "Hi [[first-name]]. would you like a 20$ gift card? Best, [[user-name]]",
          opened: 12,
          replied: 4.6,
        },
        {
          types: ["Intro", "Pain Based"],
          content: "Hi [[first-name]]. would you like a 20$ gift card? Best, [[user-name]]",
          opened: 12,
          replied: 4.6,
        },
        {
          types: ["Intro", "Gift", "$20"],
          content: "Hi [[first-name]]. would you like a 20$ gift card? Best, [[user-name]]",
          opened: 12,
          replied: 4.6,
        },
      ],
    },
    {
      step: "Follow-up #1",
      status: true,
      title: "Cold Outreach",
      content: "Cold outreach sent to the prospect",
      active_templates: 2,
      templates: [
        {
          types: ["Intro", "Gift", "$20"],
          content: "Hi [[first-name]]. would you like a 20$ gift card? Best, [[user-name]]",
          opened: 12,
          replied: 4.6,
        },
        {
          types: ["Intro", "Pain Based"],
          content: "Hi [[first-name]]. would you like a 20$ gift card? Best, [[user-name]]",
          opened: 12,
          replied: 4.6,
        },
      ],
    },
  ]);

  const [selectedData, setSelectedData] = useState(data[0]);
  return (
    <Flex gap={"lg"}>
      <Paper w={"30%"}>
        {data.map((item, index) => {
          return (
            <div onClick={() => setSelectedData(item)}>
              <FrameworkCard key={index} data={item} />
            </div>
          );
        })}
        <Button leftIcon={<IconPlus size={"1rem"} />} fullWidth mt={"md"}>
          Add Step
        </Button>
      </Paper>
      <Paper w={"70%"}>
        <MessageCard data={selectedData} />
        <TemplateCard data={selectedData} />
      </Paper>
    </Flex>
  );
}

const FrameworkCard = (cardData: any) => {
  const { data } = cardData;
  const { hovered, ref } = useHover();
  return (
    <Card
      ref={ref}
      p={0}
      radius="md"
      withBorder
      sx={(theme) => ({
        cursor: "pointer",
        backgroundColor:
          data.active || hovered
            ? theme.fn.lighten(theme.fn.variant({ variant: "filled", color: "blue" }).background!, 0.95)
            : hovered
            ? theme.fn.lighten(theme.fn.variant({ variant: "filled", color: "blue" }).background!, 0.99)
            : undefined,
        borderColor: data.active || hovered ? theme.colors.blue[5] + "!important" : undefined,
      })}
      mt={"md"}
    >
      <Flex align={"center"} justify={"space-between"} py={"sm"} px={"lg"}>
        <Flex align={"center"} gap={4}>
          <IconMessages size={"1.1rem"} color="#228be6" />
          <Text fw={599}>{data.step}</Text>
        </Flex>
        <Switch defaultChecked={data.status} />
      </Flex>
      <Divider />
      <Box py={"sm"} px={"lg"}>
        <Text fw={700}>{data.title}</Text>
        <Text fw={400} color="gray" size={"sm"}>
          {data.content}
        </Text>
        <Flex align={"center"} mt={4}>
          <IconPoint size={"2rem"} fill="green" color="white" className="ml-[-10px] mt-[-3px]" />
          <Text fw={500}>{data.active_templates} templates active</Text>
        </Flex>
      </Box>
    </Card>
  );
};

const MessageCard = (props: any) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [state, setState] = useState(false);
  const [voiceGenerate, setVoiceGenerate] = useState(false);

  const handleGenerate = () => {
    setState(true);
  };

  const handleSave = () => {
    // setState(false);
    setVoiceGenerate(true);
    setTimeout(() => {
      setVoiceGenerate(false);
      setState(false);
    }, 3000);

    // setVoiceGenerate(false);
  };

  return (
    <Box>
      <Flex align={"center"} justify={"space-between"}>
        <Text size={"xl"} fw={700}>
          Invite Message
        </Text>
        <div
          className={`absolute bg-[#f6f8fa] right-0 rounded-md top-0 mb-2 transition-all duration-300 z-[9999] `}
          style={{ transform: voiceGenerate ? "translateY(0) " : "translateY(45px)", filter: voiceGenerate ? "opacity(1)" : "opacity(0)" }}
        >
          <Flex miw={260} className="flex justify-start items-center" gap={"sm"} style={{ border: "1px solid #be4bdb", borderRadius: "4px" }} px={"sm"} py={8}>
            <IconCheckbox size={"0.9rem"} />
            <Text size={"xs"}>{1} sample saved</Text>
          </Flex>
        </div>

        <div className={`${state && "absolute z-[9999] bg-[#f6f8fa] right-0 rounded-md"} flex flex-col`}>
          <Button
            miw={260}
            rightIcon={
              <>
                <Divider orientation="vertical" my={"auto"} h={"1.3rem"} mx={"sm"} /> <IconMicrophone size={"1rem"} />{" "}
              </>
            }
          >
            {state ? "Editing Ishan's" : "SellScale Baseline"} Voice
          </Button>
        </div>
      </Flex>
      <Text size={"xs"} color="gray" fw={500}>
        You initial outreach message on Linkedin, this message has a 300 characters limit.
      </Text>
      <Paper withBorder style={{ borderColor: "#228be6" }} radius={"sm"}>
        <Flex align={"center"} justify={"space-between"} px={"lg"} py={"sm"}>
          <Flex align={"center"} gap={4}>
            <IconMail size={"0.9rem"} color="#228be6" />
            <Text fw={500} color="gray" size={"xs"}>
              Example Message #1:
            </Text>
            <Text fw={500} size={"xs"}>
              {"Pain point based"}
            </Text>
          </Flex>
          <Flex align={"center"} gap={4}>
            <Button size="xs" leftIcon={<IconRefresh size={"0.9rem"} />} color="grape" radius={"md"}>
              Regernate
            </Button>
            <ActionIcon onClick={toggle}>{opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}</ActionIcon>
          </Flex>
        </Flex>
        <Collapse in={opened}>
          <Divider color="gray" />
          <Paper className="relative">
            {state && <div className=" fixed w-screen h-screen top-0 left-0 z-[9000] bg-[#7d7d7d]/[60%]"></div>}

            <div className={`${state && !voiceGenerate && "absolute z-[9999] bg-[#f6f8fa] w-full left-0 rounded-md"}`}>
              <div className="px-5">
                <Flex align={"center"} my={"md"} gap={"sm"}>
                  <Avatar size={"md"} radius={"xl"} />
                  <Box>
                    <Text size={"xs"} fw={500}>
                      {"Ishan Sharma"}
                    </Text>
                    <Text size={"xs"} fw={500} color="gray">
                      {"Co-founder & CEO @ SellScale"}
                    </Text>
                  </Box>
                </Flex>
                {state && (
                  <Flex
                    align={"center"}
                    gap={3}
                    bg={"#98a3b3"}
                    className="rounded-t-lg"
                    px={"sm"}
                    py={3}
                    justify={"end"}
                    w={"fit-content"}
                    ml={"auto"}
                    mt={"-xl"}
                  >
                    <IconInfoCircle size={"0.9rem"} color="white" />
                    <Text size={"sm"} color="white">
                      Edit the AI Generations to tailer to your voice.
                    </Text>
                  </Flex>
                )}

                <Textarea
                  defaultValue={"Hi, BDRs are expensive and hiring can be a lot of work. Can we talk? Best, Ishan"}
                  onChange={(val) => console.log("log====")}
                  mb={"sm"}
                  onClick={() => handleGenerate()}
                />
                {state && (
                  <>
                    <Flex justify={"space-between"} mt={"sm"}>
                      <Button variant="outline" color="gray" onClick={() => setState(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save fewshot sample</Button>
                    </Flex>
                    <Divider my={"lg"} />
                  </>
                )}
              </div>

              {state && (
                <Flex className="px-5 flex-col" gap={"sm"} mb={"sm"}>
                  <Flex gap={"sm"} align={"center"}>
                    <IconMessages />
                    <Text fw={600} size={"sm"}>
                      Message DNA
                    </Text>
                  </Flex>
                  <Flex align={"center"} gap={50}>
                    <Text w={60} fw={400} color="gray" size={"sm"}>
                      Templates
                    </Text>
                    <Flex align={"center"} gap={"sm"} ml={16}>
                      <Badge radius={"xs"}>Pain-based</Badge>
                      <Badge radius={"xs"}>Intro</Badge>
                    </Flex>
                  </Flex>
                  <Flex align={"start"} gap={50}>
                    <Text w={60} fw={400} color="gray" size={"sm"}>
                      Research
                    </Text>
                    <Box>
                      <List withPadding size={"sm"}>
                        <List.Item>8+ years of experience in industry</List.Item>
                        <List.Item>Been at Blackstone Valley Community Care for over half a decade.</List.Item>
                      </List>
                    </Box>
                  </Flex>
                </Flex>
              )}
            </div>
          </Paper>
        </Collapse>
      </Paper>
    </Box>
  );
};

const TemplateCard = (props: any) => {
  const color = ["blue", "grape", "green"];
  const { data } = props;

  return (
    <Paper withBorder p={"sm"} mt={"md"}>
      <ScrollArea h={400}>
        <Flex align={"center"} justify={"space-between"}>
          <Text fw={700}>Templates</Text>
          <Button size="xs" leftIcon={<IconPlus size={"0.9rem"} />}>
            Create New
          </Button>
        </Flex>
        <Flex direction={"column"} gap={"sm"} mt={"md"}>
          {data?.templates?.map((item: any, index: number) => {
            return (
              <Paper withBorder radius={"sm"} p={"sm"} key={index}>
                <Flex align={"center"} justify={"space-between"}>
                  <Flex gap={"xs"}>
                    {item.types.map((typeItem: any, typeIndex: number) => {
                      return (
                        <Badge radius={"xs"} key={typeIndex} color={color[typeIndex % 3]} tt={"initial"}>
                          {typeItem}
                        </Badge>
                      );
                    })}
                  </Flex>
                  <Flex align={"center"} gap={2}>
                    <ActionIcon>
                      <IconEdit size={"0.9rem"} />
                    </ActionIcon>
                    <ActionIcon>
                      <IconRefresh size={"0.9rem"} />
                    </ActionIcon>
                    <Switch />
                  </Flex>
                </Flex>
                <Text mt={"sm"} fw={600} size={"sm"}>
                  {item.content}
                </Text>
                <Divider variant="dashed" my={"sm"} />
                <Flex align={"center"} gap={"lg"}>
                  <Text color="gray" fw={600} size={"sm"}>
                    Opened: <span className="text-black">{item.opened}$</span>
                  </Text>
                  <Text color="gray" fw={600} size={"sm"}>
                    Replied: <span className="text-black">{item.opened}$</span>
                  </Text>
                </Flex>
              </Paper>
            );
          })}
        </Flex>
      </ScrollArea>
    </Paper>
  );
};
