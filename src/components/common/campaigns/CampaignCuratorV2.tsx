import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  Box,
  Card,
  Grid,
  Group,
  Text,
  Title,
  List,
  Loader,
  Button,
  Flex,
  TextInput,
  Textarea,
  Badge,
  Divider,
  Paper,
  ScrollArea,
  Avatar,
  ActionIcon,
} from "@mantine/core";
import { IconCircleCheck, IconLink, IconMicrophone, IconNews, IconPlus, IconSend, IconWriting } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { deterministicMantineColor } from "@utils/requests/utils";
import Logo from "../../../assets/images/logo.png";
import moment from "moment";

export async function campaignCurator(
  userToken: string,
  additional_instructions: string
): Promise<any> {
  const response = await fetch(`${API_URL}/ml/campaigns/campaign_curator`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      additional_instructions: additional_instructions,
    }),
  });
  return await response.json();
}


const SegmentChat = (props: any) => {
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);
  const setAdditionalInstructions = props.setAdditionalInstructions;

  const [prompt, setPrompt] = useState("");
  const [chatContent, setChatContent] = useState<any>([
    {
      sender: "chatbot",
      query:
        "Hey there! I'm SellScale AI, your friendly chatbot for curating sales strategies. To get started, tell me a bit about your business or who you're targeting.",
      created_at: moment().format("MMMM D, h:mm a"),
    },
  ]);

  const viewport = useRef<any>(null);

  const handleSubmit = () => {
    if (prompt !== "") {
      const newChatPrompt = {
        sender: "user",
        query: prompt,
        created_at: moment().format("MMMM D, h:mm a"),
      };
      setChatContent((chatContent: any) => [...chatContent, newChatPrompt]);
      setPrompt("");
      handleResponse();
    } else console.log("--------");
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleResponse = async () => {
    setLoading(true);

    // Add a placeholder loading message
    const loadingMessage = {
      sender: "chatbot",
      query: "loading",
      id: Date.now(),
      created_at: moment().format("MMMM D, h:mm a"),
    };
    setChatContent((chatContent: any) => [...chatContent, loadingMessage]);

    try {
      const response = await fetch(`${API_URL}/contacts/chat-icp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ prompt, chatContent }),
      });

      const data = await response.json();
      const res = data?.response;
      const chatbotMessage = {
        sender: "chatbot",
        query: res,
        id: loadingMessage.id, // Use the same id to replace the loading message
        created_at: moment().format("MMMM D, h:mm a"),
      };
      // Replace the loading message with the actual response
      setChatContent((chatContent: any) =>
        chatContent.map((message: any) =>
          message.id === loadingMessage.id ? chatbotMessage : message
        )
      );
      viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
      setLoading(false);

      console.log("data is", data.data);

      props.setSegment((prevSegments: any) => [
        ...prevSegments,
        {
          makers: data["makers"],
          industry: data["industry"],
          pain_point: data["pain_point"],
          id: data?.data?.saved_query_id,
          total_entries: data?.data?.pagination?.total_entries,
        },
      ]);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, [chatContent]);

  const [chat2, setChat2] = useState([
    {
      status: true,
      title:
        "Gather information about your medical Scribe AI Product by researching on",
      content: `"www.junipero.com/scribe"`,
    },
    {
      status: true,
      title: `Add prospects to a new segment called "COO/CFO - Top 50 EHRs". Find prospects via this query: "COOs and CFOs who work at top 50 EHR companies"`,
      content: null,
    },
    {
      status: true,
      title: `Create a new campaign called "COO/CFO - Top 50 EHRs - Partnership"`,
      content: null,
    },
    {
      status: true,
      title: `Add am Email sequence to "COO/CFO - Top 50 EHRs - Partnership" campaign with the angle of "We want to parner with you to integrate our Medical Scribe AI into your EHR platform. This will drive more revenue & customers to your business."`,
      content: null,
    },
    {
      status: false,
      title: `Add am Linkedin sequence to "COO/CFO - Top 50 EHRs - Partnership" campaign with the angle of "We want to parner with you to integrate our Medical Scribe AI into your EHR platform. This will drive more revenue & customers to your business."`,
      content: null,
    },
    {
      status: false,
      title: `Notify you that the campaign is ready to review & lanuch. I will let you know once the campaign is ready to lanuch!`,
      content: null,
    },
  ]);

  return (
    <Paper withBorder shadow="sm" radius={"md"} w={"35%"}>
      <Flex p={"md"} align={"center"} gap={5}>
        <IconSparkles size={"1rem"} color="#be4bdb" />
        <Text fw={600}>Generation Assistant</Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={500} viewportRef={viewport} scrollHideDelay={4000}>
        <Flex
          direction={"column"}
          gap={"sm"}
          p={"md"}
          h={"100%"}
          className=" overflow-auto"
        >
          {chatContent.map((item: any, index: number) => {
            return (
              <Flex
                direction={"column"}
                w={"80%"}
                gap={4}
                key={index}
                ml={item.sender === "user" ? "auto" : "0"}
              >
                <Flex gap={4} align={"center"}>
                  <Avatar
                    src={item.sender === "user" ? userData.img_url : Logo}
                    size={"xs"}
                    radius={"xl"}
                  />
                  <Text fw={600} size={"xs"}>
                    {item.sender === "user"
                      ? userData.sdr_name
                      : "SellScale AI"}
                  </Text>
                </Flex>
                {/* <Flex className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none" px={"sm"} py={7}>
                  <Text size={"sm"} fw={500}>
                    {item.sender === "user" ? (
                      item.query
                    ) : item.query === "loading" ? (
                      <Flex align="center" gap="xs">
                        <Loader color="black" variant="dots" />
                        <Text size={"sm"} fw={500} color="gray">
                          Generating segment...
                        </Text>
                      </Flex>
                    ) : (
                      item.query
                    )}
                  </Text>
                </Flex> */}
                <Flex
                  className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none"
                  px={"sm"}
                  py={7}
                >
                  <Text size={"sm"} fw={500}>
                    {item.sender === "user" ? (
                      item.query
                    ) : item.query === "loading" ? (
                      <Flex align="center" gap="xs">
                        <Loader color="black" variant="dots" />
                        <Text size={"sm"} fw={500} color="gray">
                          Generating segment...
                        </Text>
                      </Flex>
                    ) : (
                      <>
                        {index % 4 === 0 ? (
                          <Text size={"sm"} fw={500}>
                            {item.query}
                          </Text>
                        ) : (
                          <Flex className="flex-col gap-1" px={"sm"} py={7}>
                            <Text size={"sm"} fw={600}>
                              Perfect! Here's how I will proceed on executing on
                              this strategy.
                            </Text>
                            {chat2.map((subItem, subIndex) => {
                              return (
                                <Paper
                                  key={subIndex}
                                  bg={"#f9fbfe"}
                                  withBorder
                                  radius={"sm"}
                                  p={"sm"}
                                >
                                  <Flex align={"start"} gap={"sm"}>
                                    <Box>
                                      <IconCircleCheck
                                        fill={
                                          subItem.status ? "#228be6" : "gray"
                                        }
                                        color={"white"}
                                      />
                                    </Box>
                                    <Box>
                                      <Text size={"xs"} fw={500} color="gray">
                                        {subItem.title}
                                      </Text>
                                    </Box>
                                  </Flex>
                                </Paper>
                              );
                            })}
                            <Text size={"sm"} fw={600}>
                              I will let you know once the campaign is ready to
                              lanuch!
                            </Text>
                          </Flex>
                        )}
                      </>
                    )}
                  </Text>
                </Flex>
                <Text
                  color="gray"
                  size={"xs"}
                  ml={item.sender === "user" ? "auto" : "0"}
                >
                  {item.created_at}
                </Text>
              </Flex>
            );
          })}
          {/* {loading && <Loader color="blue" type="dots" />} */}
        </Flex>
      </ScrollArea>
      <Paper
        p={"sm"}
        withBorder
        radius={"md"}
        className="bg-[#f7f8fa]"
        my={"lg"}
        mx={"md"}
      >
        <TextInput
          multiple
          value={props.additionalInstructions}
          placeholder="Chat with AI..."
          onKeyDown={handleKeyDown}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          variant="unstyled"
        />
        <Flex justify={"space-between"} mt={"sm"} align={"center"}>
          <Flex gap={"sm"}>
            <ActionIcon
              variant="outline"
              color="gray"
              radius={"xl"}
              size={"sm"}
            >
              <IconPlus size={"1rem"} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              color="gray"
              radius={"xl"}
              size={"sm"}
            >
              <IconLink size={"1rem"} />
            </ActionIcon>
          </Flex>
          <Button
            size="xs"
            color="grape"
            rightIcon={<IconSend size={"1rem"} />}
            onClick={handleSubmit}
          >
            Ask AI
          </Button>
        </Flex>
      </Paper>
    </Paper>
  );
};

export default function CampaignCurator() {
  const userToken = useRecoilValue(userTokenState);
  const [campaignData, setCampaignData] = useState<any>({
    data: {
      company_name: "Placeholder Company",
      description: "This is a placeholder description for the company.",
      tagline: "Innovating the Future",
      user_name: "John Doe",
      user_role: "Marketing Manager",
      recent_news: "- Placeholder news item 1\n- Placeholder news item 2",
      top_colleague_campaigns: "Colleague Campaign 1\nColleague Campaign 2",
    },
    response: [
      {
        emoji: "🚀",
        campaign_title: "Launch Campaign",
        icp_target: "Tech Enthusiasts",
        strategy: "Social Media Blitz",
        assets: ["Video", "Blog Post"],
        reason: "High engagement on social platforms",
      },
      {
        emoji: "📈",
        campaign_title: "Growth Campaign",
        icp_target: "Small Businesses",
        strategy: "Email Marketing",
        assets: ["Newsletter", "Case Study"],
        reason: "Proven ROI from email campaigns",
      },
    ],
  });
  const [secondsSinceLaunch, setSecondsSinceLaunch] = useState(200);
  const [loading, setLoading] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const runCampaignCurator = async () => {
    setLoading(true);
    const data = await campaignCurator(userToken, additionalInstructions);
    setCampaignData(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceLaunch((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <Card
        withBorder
        p="xl"
        ml="auto"
        mr="auto"
        mt="xl"
        mb="xl"
        w="500px"
        sx={{ textAlign: "center" }}
      >
        <Text size="xl">Loading...</Text>
        <Loader variant="dots" />
      </Card>
    );
  }

  if (campaignData === null) {
    return (
      <Card
        withBorder
        p="xl"
        ml="auto"
        mr="auto"
        mt="xl"
        mb="xl"
        w="500px"
        sx={{ textAlign: "center" }}
      >
        <Title order={4}>Campaign Curator</Title>
        <Text size="xs">Run the campaign curator to get campaign ideas</Text>

        <Textarea
          mt="md"
          placeholder="Additional Instructions"
          minRows={3}
          onChange={(e) => setAdditionalInstructions(e.currentTarget.value)}
        />
        <Button
          mt="md"
          onClick={() => runCampaignCurator()}
          loading={loading}
          leftIcon={<IconSparkles size="0.9rem" />}
        >
          Run Campaign Curator
        </Button>

        <Divider label="OR" mt="sm" mb="sm" labelPosition="center" />

        <Button leftIcon={<IconMicrophone size="0.9rem" />} color="grape">
          Intake Strategy with Selina AI
        </Button>
      </Card>
    );
  }

  const { data, response } = campaignData;
  const [segment, setSegment] = useState([]);

  return (
    <Box p="xl">
      <Grid>
        <SegmentChat setSegment={setSegment} additionalInstructions = {additionalInstructions} setAdditionalInstructions={setAdditionalInstructions} segment={segment} />
        <Grid.Col span={7}>
          {secondsSinceLaunch >= 50 && (
            <Card withBorder padding="lg" mb="xs">
              <Title order={4}>Campaign Ideas</Title>
              <List spacing="xs">
                {response.map((campaign: any, index: number) => (
                  <Card withBorder padding="lg" mb="sm" key={index}>
                    <Flex>
                      <Box w="85%">
                        <Group position="apart">
                          <Text size="md" mb="xs">
                            {campaign.emoji}{" "}
                            <strong>{campaign.campaign_title}</strong>
                          </Text>
                        </Group>
                        <Text size="xs" mb="xs">
                          <strong>ICP Target:</strong> {campaign.icp_target}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Strategy:</strong> {campaign.strategy}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Assets:</strong>{" "}
                          {campaign.assets.map((x: any) => (
                            <Badge
                              color={deterministicMantineColor(x)}
                              size="sm"
                              ml="xs"
                            >
                              {x}
                            </Badge>
                          ))}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Reason:</strong> {campaign.reason}
                        </Text>
                      </Box>
                      <Button size="xs" variant="light" ml="auto">
                        Use Strategy
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </List>
            </Card>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}
