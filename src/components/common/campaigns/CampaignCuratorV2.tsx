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
import useGenerativeRequest from "@utils/requests/GenerativeRequest";
import { useSpring, animated } from 'react-spring';

const SegmentChat = (props: any) => {
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const loading = props.loading;
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
    if (props.additionalInstructions !== "") {
      const newChatPrompt = {
        sender: "user",
        query: props.additionalInstructions,
        created_at: moment().format("MMMM D, h:mm a"),
      };
      setChatContent((chatContent: any) => [...chatContent, newChatPrompt]);
      setAdditionalInstructions("");
      // handleResponse();
    } else console.log("--------");
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      props.runCampaignCurator();
        handleSubmit();
        // Ensure no early return by using a state update
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
    <Paper withBorder shadow="sm" radius={"md"} w={"35%"} h={'100%'} style={{ display: 'flex', flexDirection: 'column' }}>
      <Flex p={"md"} align={"center"} gap={5}>
        <IconSparkles size={"1rem"} color="#be4bdb" />
        <Text fw={600}>Generation Assistant</Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={500} viewportRef={viewport} scrollHideDelay={4000} style={{ flexGrow: 1 }}>
        <Flex
          direction={"column"}
          gap={"sm"}
          p={"md"}
          h={"100%"}
          className="overflow-auto"
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
        </Flex>
      </ScrollArea>
      <Paper
        p={"sm"}
        withBorder
        radius={"md"}
        className="bg-[#f7f8fa]"
        mt={"auto"}
        mx={"md"}
        mb={'lg'}
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
            loading={loading}
            onClick={() => {
              props.runCampaignCurator();
              handleSubmit();
              // Ensure no early return by using a state update
            }}
          >
            Generate with AI
          </Button>
        </Flex>
      </Paper>
    </Paper>
  );
};

export default function CampaignCurator() {
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [newCampaign, setNewCampaign] = useState<any>(null);

  const { data, setData, loading: isLoading, setLoading: setIsLoading, triggerGenerativeRequest } = useGenerativeRequest({
    endpoint: "/ml/campaigns/campaign_curator",
  });

  useEffect(() => {
    if (data.length > 0) {
      setCampaignData(data);
      setNewCampaign(data[data.length - 1]);
    }
  }, [data]);

  const runCampaignCurator = async () => {
    setData([]);
    setCampaignData([]);
    await triggerGenerativeRequest({ additional_instructions: additionalInstructions });
  };

  const animationProps = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)', scale: 0.9 },
    to: { opacity: 1, transform: 'translateY(0)', scale: 1 },
    config: { tension: 170, friction: 26 }, // Slower animation
    reset: true,
  });

  const fadeInProps = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 700 }, // Slower fade-in
    reset: true,
  });

  const slideInProps = useSpring({
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
    config: { tension: 170, friction: 26 }, // Slower slide-in
    reset: true,
  });

  const scaleProps = useSpring({
    from: { transform: 'scale(0.8)' },
    to: { transform: 'scale(1)' },
    config: { tension: 170, friction: 26 }, // Scale effect
    reset: true,
  });

  return (
    <Flex p="xl">
      <SegmentChat
        loading={isLoading}
        runCampaignCurator={runCampaignCurator}
        additionalInstructions={additionalInstructions}
        setAdditionalInstructions={setAdditionalInstructions}
      />
      <Box w="70%" ml="md">
        <Card withBorder padding="lg" mb="xs">
          <Group position="left" spacing="xs">
            <Title order={4}>Campaign Ideas</Title>
            {isLoading && <Loader ml='xs' size="xs" mb='sm' color="grape" />}
          </Group>
          <ScrollArea style={{ height: 600 }}>
            {campaignData.length === 0 && !isLoading ? (
              <Flex justify="center" align="center" style={{ height: 600 }}>
                <Button color="grape" onClick={()=>{triggerGenerativeRequest({ additional_instructions: additionalInstructions });}} leftIcon={<IconSparkles size={16} />}>
                  Auto-Generate
                </Button>
              </Flex>
            ) : (
              <List spacing="xs">
                {campaignData.slice().reverse().map((campaign: any, index: number) => (
                  <animated.div 
                    style={newCampaign === campaign && isLoading ? animationProps : {}} 
                    key={index} 
                    {...(newCampaign === campaign && isLoading ? fadeInProps : {})} 
                    {...(newCampaign === campaign && isLoading ? slideInProps : {})}
                    {...(newCampaign === campaign && isLoading ? scaleProps : {})}
                  >
                    <Card withBorder padding="lg" mb="sm">
                      <Flex>
                        <Box w="85%">
                          <Group position="apart">
                            <Text size="md" mb="xs">
                              {campaign.emoji} <strong>{campaign.campaign_title}</strong>
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
                                key={x}
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
                  </animated.div>
                ))}
              </List>
            )}
          </ScrollArea>
        </Card>
      </Box>
    </Flex>
  );
}
