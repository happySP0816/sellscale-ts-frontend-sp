import { ActionIcon, Avatar, Badge, Box, Button, Divider, Flex, Paper, ScrollArea, SegmentedControl, Stack, Tabs, Text, Textarea } from "@mantine/core";
import { closeAllModals, openContextModal } from "@mantine/modals";
import { IconArrowLeft, IconArrowRight, IconArrowsUp, IconBrandLinkedin, IconBriefcase, IconDoorExit, IconMail, IconSend, IconTrash } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

export default function ClearInboxModal() {
  const [inboxData, setInboxData] = useState([
    {
      avatar: "",
      name: "Ishan Sharma",
      job: "Founder & CEO",
      company: "SellScale",
      action: "Revival",
      icon: <IconArrowsUp size={"1rem"} />,
      status: false,
      overview:
        "The conversation focuses on revival strategies, with meetings scheduled, proposals shared, and feedback addressed, leading to finalizing the plan.",
      chatHistory: [
        {
          me: "Hi, thanks for reaching out! Next week works for me. I'm available on Tuesday or Thursday in the afternoon. Let me know if that works for you",
          you: "Great to hear back, Ishan. How about Tuesday at 2 PM EST? If that timing works for you, I can send over a calendar invite.",
        },
        {
          me: "2 PM EST on Tuesday sounds perfect. Please go ahead and send the invite",
          you: "Invite sent! Looking forward to our discussion. Is there anything specific you'd like us to cover on the call?",
        },
        {
          me: "Thank you so much",
          you: null,
        },
      ],
    },
    {
      avatar: "",
      name: "Jane Smith",
      job: "Manager",
      company: "Alpha Tech",
      action: "Reply",
      icon: <IconSend size={"1rem"} />,
      status: false,
      overview: "The discussion revolves around scheduling a follow-up meeting, reviewing a revised proposal, and clarifying final details before proceeding.",
      chatHistory: [
        {
          me: "Hi! Yes, I'm available next week. How about Tuesday at 3 PM EST?",
          you: "Tuesday at 3 PM EST works for me. I'll send over a calendar invite. Looking forward to our discussion on revival strategies.",
        },
        {
          me: "Perfect, I'll see the invite. Looking forward to the call.",
          you: "Invite sent! Looking forward to our discussion",
        },
        {
          me: "Hi! Yes, I'm available next week. How about Tuesday at 3 PM EST?",
          you: "Tuesday at 3 PM EST works for me. I'll send over a calendar invite. Looking forward to our discussion on revival strategies.",
        },
        {
          me: "Perfect, I'll see the invite. Looking forward to the call.",
          you: "Invite sent! Looking forward to our discussion",
        },
      ],
    },
    {
      avatar: "",
      name: "Andrew Richh",
      job: "Marketing Head",
      company: "Zeta Groups",
      status: false,
      action: "Out of Office",
      icon: <IconDoorExit size={"1rem"} />,
      overview: "AFter learning the client is out of office, a follow-up is arranged post-return leading to a meeting, proposal review, and next steps.",
      chatHistory: [
        {
          me: "Sure. We've decided to pursue other options that align more closely with our current strategy. It wasn't an easy decision.",
          you: "Thank you for the feedback. Ishan I understand your position. If there's anything specific that stood out or any suggestions for us, I'd be grateful for your input.",
        },
        {
          me: "One suggestion would be to focus more on tailored solutions for smaller scale projects. We found the proposal a bit broad for our needs.",
          you: "Really that you for your suggestion.",
        },
      ],
    },
    {
      avatar: "",
      name: "Zoe Stacy",
      job: "Managing Director",
      company: "Sigma X",
      status: false,
      action: "Reply",
      icon: <IconSend size={"1rem"} />,
      overview: "The client acknowledges they are not qualified, and the discussion ends respectfully, leaving room for potential future opportunities.",
      chatHistory: [
        {
          me: "XXXXXXXXXXXXXXX available to schedule a call now.",
          you: "Hi! Yes, I'm back. Thanks for the follow-up. How about we schedule a call for next Wednesday at 2 PM EST?",
        },
      ],
    },
    {
      avatar: "",
      name: "Zoe Stacy",
      job: "Managing Director",
      company: "Sigma X",
      status: false,
      action: "Not Qualified",
      icon: <IconTrash size={"1rem"} />,
      overview: "The client acknowledges they are not qualified, and the discussion ends respectfully, leaving room for potential future opportunities.",
      chatHistory: [
        {
          me: "Thank you! I'll look forward to a catching up when I'm back. Talk to you then.",
          you: "Hi Ishan, I hope you're back in the office and that you had a great time away. Just wanted to follow up and see if you're available to schedule a call now.",
        },
        {
          me: "Hi! Yes, I'm back. Thanks for the follow-up. How about we schedule a call for next Wednesday at 2 PM EST?",
          you: "Wednesday at 2 PM EST works for me. I'll send over a calendar invite Looking for ward to our discussion.",
        },
      ],
    },
  ]);

  const [selected, setSelected] = useState(inboxData[0]);
  const [selectedNum, setSelectedNum] = useState(0);

  const handleSubmit = () => {
    if (!inboxData[selectedNum].status) {
      const updatedInboxData = [...inboxData];
      updatedInboxData[selectedNum].status = true;
      setInboxData(updatedInboxData);
      if (selectedNum < inboxData.length - 1) setSelectedNum((item) => item + 1);
    }
    if (inboxData.length === inboxData.filter((item) => item.status).length)
      openContextModal({
        modal: "clearinboxsuccessmodal",
        title: <></>,
        innerProps: {},
        centered: true,
        withCloseButton: false,
        size: "sm",
        styles: {
          content: {
            maxWidth: "200px",
          },
        },
      });
    setTimeout(() => {
      closeAllModals();
    }, 2000);
  };

  return (
    <Paper>
      <Paper p={"sm"} withBorder radius={"sm"}>
        <Flex align={"center"} justify={"space-between"}>
          <Text fw={500} w={"30%"}>
            Inbox Status
          </Text>
          <Flex align={"center"} gap={4} w={"70%"}>
            {inboxData.map((item, index) => {
              return (
                <div
                  style={{ backgroundColor: item.status ? "#228be6" : "#ebf1fd", width: `${100 / inboxData.length}%`, height: "8px" }}
                  key={index}
                  className="rounded-sm"
                ></div>
              );
            })}
            <div className="ml-2">
              <Badge
                color={inboxData.length === inboxData.filter((item) => item.status).length ? "green" : "gray"}
                variant={inboxData.length === inboxData.filter((item) => item.status).length ? "filled" : "outline"}
              >
                {inboxData.filter((item) => item.status).length > 0
                  ? `${Math.floor((inboxData.filter((item) => item.status).length / inboxData.length) * 100)}% Cleared`
                  : "0% cleared"}
              </Badge>
            </div>
          </Flex>
        </Flex>
      </Paper>
      <Flex gap={"md"} mt={"md"}>
        <Paper withBorder radius={"sm"} p={"sm"} w={"65%"} h={585}>
          <Flex align={"center"} justify={"space-between"}>
            <Box w={"100%"} mt={8}>
              <Text fw={500} size={"sm"}>
                Chat Preview
              </Text>
              <Divider size="sm" mt={4} />
            </Box>
            <Flex align={"center"} gap={"sm"} w={275}>
              <Tabs defaultValue="linkedin" w={"100%"}>
                <Tabs.List>
                  <Tabs.Tab value="linkedin" icon={<IconBrandLinkedin size="0.8rem" />}>
                    Linkedin
                  </Tabs.Tab>
                  <Tabs.Tab value="email" icon={<IconMail size="0.8rem" />}>
                    Email
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="gallery" pt="xs">
                  Gallery tab content
                </Tabs.Panel>

                <Tabs.Panel value="messages" pt="xs">
                  Messages tab content
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="xs">
                  Settings tab content
                </Tabs.Panel>
              </Tabs>
            </Flex>
          </Flex>
          <div className="relative">
            <ScrollArea h={inboxData[selectedNum].action === "Reply" ? 520 : 550}>
              {/* <div
                className="absolute top-0 h-16 w-full z-10"
                style={{ backgroundImage: "linear-gradient(180deg, white, white)", filter: "blur(3.5px)" }}
              ></div> */}
              {inboxData[selectedNum]?.chatHistory?.map((item, index) => {
                return (
                  <div className={`w-full flex flex-col items-end mt-4 relative`}>
                    <Flex direction={"column"} w={"100%"}>
                      <Flex align={"start"} gap={"sm"}>
                        <Avatar src={selected.avatar} size={"md"} radius={"xl"} />
                        <Paper withBorder radius={"sm"} p={"md"} w={"100%"}>
                          <Text size={"sm"}>{item.me}</Text>
                        </Paper>
                      </Flex>
                    </Flex>

                    {item.you && (
                      <Flex direction={"column"} mt={"xs"} w={"91%"} align={"flex-end"}>
                        <Flex align={"start"} gap={"sm"}>
                          <Paper withBorder radius={"lg"} p={"md"} bg={"blue"} className="rounded-br-none">
                            <Text size={"sm"} color="white">
                              {item.you}
                            </Text>
                          </Paper>
                        </Flex>
                        <Text size={"xs"} fw={500} color="gray" mt={"xs"}>
                          {"Today 01:05"}
                        </Text>
                      </Flex>
                    )}
                  </div>
                );
              })}
            </ScrollArea>
            {inboxData[selectedNum].action === "Reply" && (
              <Box className="absolute w-full bottom-0">
                <Paper
                  withBorder
                  radius={"md"}
                  ml={-1}
                  py={3}
                  px={"xs"}
                  w={"fit-content"}
                  bg={"grape"}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                >
                  <Flex align={"center"} gap={"4px"}>
                    <IconSparkles size={"0.8rem"} fill="white" color="white" />
                    <Text size={"xs"} color="white">
                      AI Generated
                    </Text>
                  </Flex>
                </Paper>
                <Textarea
                  defaultValue={
                    "Looking forward to our discussion on revival strategies on Tuesday at 3 PM EST! Let me know if you have any questions beforehand."
                  }
                  minRows={3}
                  mt={-2}
                  styles={{
                    input: {
                      borderColor: "#be4bdb",
                      background: "#f7f8fa",
                    },
                  }}
                />
              </Box>
            )}
          </div>
        </Paper>
        <Stack w={"35%"}>
          <Paper withBorder radius={"sm"} p={"sm"}>
            <Flex align={"center"} justify={"space-between"}>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => {
                  if (selectedNum > 0) setSelectedNum((item) => item - 1);
                }}
                disabled={selectedNum <= 0}
                w={46}
              >
                <IconArrowLeft size={"1rem"} />
              </ActionIcon>
              <Text size={"sm"} fw={500}>
                {selectedNum + 1} / {inboxData.length}
              </Text>
              <ActionIcon
                variant="filled"
                color="blue"
                w={46}
                onClick={() => {
                  if (selectedNum < inboxData.length - 1) setSelectedNum((item) => item + 1);
                }}
                disabled={selectedNum >= inboxData.length - 1}
              >
                <IconArrowRight size={"1rem"} />
              </ActionIcon>
            </Flex>
            <Flex align={"center"} gap={"sm"} mt={"sm"}>
              <Avatar src={inboxData[selectedNum].avatar} size={"md"} radius={"xl"} />
              <Stack spacing={0}>
                <Text>{inboxData[selectedNum].name}</Text>
                <Flex align={"center"} gap={"xs"}>
                  <IconBriefcase size={"1rem"} color="gray" />
                  <Text size={"sm"} color="gray" fw={500}>
                    {inboxData[selectedNum].job}, {inboxData[selectedNum].company}
                  </Text>
                </Flex>
              </Stack>
            </Flex>
          </Paper>
          <Paper withBorder radius={"sm"} p={"sm"} h={"100%"}>
            <Stack>
              <Text size={"md"} fw={600}>
                AI Recommendation
              </Text>
              <Divider />
              <Text fw={600}>Chat Overview:</Text>
              <Text fw={500} color="gray" size={"sm"}>
                {inboxData[selectedNum].overview}
              </Text>
              <Text fw={500}>Recommended Action:</Text>
              <Button color="grape" onClick={handleSubmit} disabled={inboxData[selectedNum].status} leftIcon={inboxData[selectedNum].icon}>
                {inboxData[selectedNum].action}
              </Button>
              <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  if (selectedNum < inboxData.length - 1) setSelectedNum((item) => item + 1);
                }}
              >
                Skip
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Flex>
    </Paper>
  );
}
