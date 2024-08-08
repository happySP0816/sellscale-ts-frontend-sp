import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Paper,
  ScrollArea,
  Text,
  TextInput,
  Badge,
  SegmentedControl,
  Center,
  Collapse,
  ThemeIcon,
  Stack,
  List,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconEye,
  IconEyeOff,
  IconLink,
  IconPlus,
  IconPoint,
  IconSend,
  IconTriangleInverted,
} from "@tabler/icons";
import { IconSparkles, IconUserShare } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import Logo from "../../../assets/images/logo.png";
import { API_URL } from "@constants/data";
import { useDisclosure } from "@mantine/hooks";
import SelinAIPlanner from "./SelinAIPlanner";
import ComingSoonCard from "@common/library/ComingSoonCard";
import SegmentV3 from "@pages/SegmentV3/SegmentV3";
import CampaignLandingV2 from "@pages/CampaignV2/CampaignLandingV2";
import WhatHappenedLastWeek from "./WhatHappenedLastWeek";
import AIBrainStrategy from "@pages/Strategy/AIBrainStrategy";
import SelinStrategy from "@pages/Strategy/Selinstrategy";
import { title } from "process";

interface CustomCursorWrapperProps {
  children: React.ReactNode;
}

const CustomCursorWrapper: React.FC<CustomCursorWrapperProps> = ({ children }) => {
  const cursorStyle = {
    cursor: `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 24 24' fill='none' stroke='#ff69b4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-right' transform='rotate(225)'><path d='M9 18L15 12L9 6'></path></svg>")}") 16 0, auto`,
  };

  return <div style={cursorStyle}>{children}</div>;
};

interface TaskType {
  id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  selix_session_id: number;
}

interface MemoryType {
  additional_context: string;
  counter: number;
  session_name: string;
  strategy_id: number;
  tab: string;
}

interface ThreadType {
  id: number;
  session_name: string;
  status: string;
  assistant_id: string;
  client_sdr_id: number;
  created_at: string;
  updated_at: string;
  estimated_completion_time: string | null;
  actual_completion_time: string | null;
  memory: MemoryType;
  tasks: TaskType[];
  thread_id: string;
}


interface MessageType {
  created_time: string;
  message: string;
  role: "user" | "assistant" | "system";
  type: "message" | "strategy" | "planner" | "analytics" | "action";
  action_description?: string;
  action_title?: string;
  action_function?: string;
  action_params?: {
    title: string;
    description: string;
  };
  actual_completion_time?: string | null;
  id?: number;
  selix_session_id?: number;
}

export default function SelinAI() {
  const [history, setHistory] = useState([
    { title: "Early Stage SaaS founders in NYC", time: "1 hr ago" },
    { title: "AI companies in bay area", time: "yesterday" },
    { title: "Fintech SaaS Companies", time: "2 days ago" },
  ]);

  const [threads, setThreads] = useState<ThreadType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/selix/get_all_threads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      setThreads(data);
      console.log("data is", data);
    }
    catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }
  const getMessages = async (thread_id: string) => {
    try {
      const response = await fetch(`${API_URL}/selix/get_messages_in_thread`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ thread_id: thread_id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);

      console.log("Messages data:", messages);
      // You can add further processing of the messages here if needed
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    fetchChatHistory();
  }, [userToken]);

  const [segment, setSegment] = useState([]);
  const [opened, { toggle }] = useDisclosure(true);

  const [aiType, setAIType] = useState("task");

  const [openedChat, setOpened] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - (containerRef.current?.offsetLeft || 0);
      scrollLeft = containerRef.current?.scrollLeft || 0;
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - (containerRef.current?.offsetLeft || 0);
      const walk = (x - startX) * 3; // scroll-fast
      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    const container = containerRef.current;

    container?.addEventListener("mousedown", handleMouseDown);
    container?.addEventListener("mouseleave", handleMouseLeave);
    container?.addEventListener("mouseup", handleMouseUp);
    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      container?.removeEventListener("mousedown", handleMouseDown);
      container?.removeEventListener("mouseleave", handleMouseLeave);
      container?.removeEventListener("mouseup", handleMouseUp);
      container?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const [step, setStep] = useState(0);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // const generateResponse = async () => {
  //   console.log("-----------");
  //   setStep((prevStep) => prevStep + 1);

  //   console.log("step=======", step);
  //   await delay(2000);
  //   switch (step) {
  //     case 0:
  //       return {
  //         status: "success",
  //         data: {
  //           message: [
  //             `<Stack spacing={"sm"}>
  //               <Text>That's great! Please go ahead and share the details of your campaign idea.</Text>
  //               <List type="ordered">
  //                 <List.Item>Any info on the audience?</List.Item>
  //                 <List.Item>What's the purpose?</List.Item>
  //                 <List.Item>What channel? (Email, Linkedin)</List.Item>
  //                 <List.Item>Just go forward</List.Item>
  //               </List>
  //               <Text>that should be enough information to get us started.</Text>
  //             </Stack>`,
  //           ],
  //           isAction: false,
  //         },
  //       };
  //     case 1:
  //       return {
  //         status: "success",
  //         data: {
  //           message: [
  //             "Perfect! You're attending MachineCon 2024 in NYC on July 26th, a prime event for connecting with top analytics leaders and potential clients.",
  //             "It seems you'd like to invite them to your booth, Which booth number are you at? Anything else to mention?",
  //           ],
  //           isAction: false,
  //           // actionData: { type: "", data: {} },
  //         },
  //       };
  //     case 2:
  //       return {
  //         status: "success",
  //         data: {
  //           isAction: true,
  //           actionData: {
  //             title: "Creating Strategy",
  //             type: "strategy",
  //             content:
  //               "Targeting all attendees of MachineCon. The goal of the campaign is to invite them to visit Booth 142 for a chat over a drink. The primary channel for outreach will be via email.",
  //             data: {},
  //           },
  //         },
  //       };
  //     case 3:
  //       return {
  //         status: "success",
  //         data: {
  //           message: [
  //             "I went ahead and mode a dreaft of your strategy. You can review & edit it on the right side of your screen. Please let me know when we can proceed.",
  //           ],
  //           isAction: false,
  //           // actionData: { type: "", data: {} },
  //         },
  //       };
  //     case 4:
  //       return {
  //         status: "success",
  //         data: {
  //           isAction: true,
  //           actionData: {
  //             title: "Creating Task List",
  //             type: "task",
  //             content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec turpis at eros malesuada euismod at non ante.",
  //             data: {},
  //           },
  //         },
  //       };
  //     case 5:
  //       return {
  //         status: "success",
  //         data: {
  //           message: ["Fantastic! Here is how we will accomplish this.", "I'll get to work on this right away! You can check back in a few hours."],
  //           isAction: false,
  //           // actionData: { type: "", data: {} },
  //         },
  //       };
  //     case 6:
  //       return {
  //         status: "success",
  //         data: {
  //           message: ["Selix is executing. You may now navigate away."],
  //           isAction: false,
  //           // actionData: { type: "", data: {} },
  //         },
  //       };
  //   }
  // };

  // const handleSpecialEvent = async () => {
  //   const response = await generateResponse();
  //   if (response?.status != "success") return;
  //   if (!response.data.isAction) {
  //     let loadingMessage = {
  //       sender: "chatbot",
  //       query: [""],
  //       id: Date.now(),
  //       created_at: moment().format("MMMM D, h:mm a"),
  //     };



  //     if (response.data.message && Array.isArray(response.data.message)) {
  //       for (let i = 0; i < response.data.message.length; i++) {
  //         const message = response.data.message[i];
  //         if (typeof message === "string") {
  //           for (let j = 0; j < message.length; j++) {
  //             await delay(20); // Adjust delay for desired typing speed
  //             // setChatContent((chatContent: any) => {
  //             //   const updatedContent = [...chatContent];
  //             //   const lastMessage = updatedContent[updatedContent.length - 1];
  //             //   if (i === lastMessage.query.length - 1) {
  //             //     lastMessage.query[i] += message[j];
  //             //   } else {
  //             //     lastMessage.query.push(message[j]);
  //             //   }
  //             //   return updatedContent;
  //             // });
  //           }
  //           if (i < response.data.message.length - 1) {
  //             await delay(500); // Delay between messages
  //             // setChatContent((chatContent: any) => {
  //             //   const updatedContent = [...chatContent];
  //             //   updatedContent[updatedContent.length - 1].query.push("");
  //             //   return updatedContent;
  //             // });
  //           }
  //         }
  //       }
  //     }
  //   } else {
  //     let loadingMessage = {
  //       sender: "alert",
  //       query: "",
  //       title: response.data?.actionData?.title,
  //       id: Date.now(),
  //       created_at: moment().format("MMMM D, h:mm a"),
  //       type: response.data?.actionData?.type,
  //     };
  //     // setChatContent((chatContent: any) => [...chatContent, loadingMessage]);
  //     const message = response.data?.actionData?.content;
  //     if (message) {
  //       for (let i = 0; i < message.length; i++) {
  //         await delay(20); // Adjust delay for desired typing speed
  //         // setChatContent((chatContent: any) => {
  //         //   const updatedContent = [...chatContent];
  //         //   const lastMessage = updatedContent[updatedContent.length - 1];
  //         //   lastMessage.query += message[i];
  //         //   return updatedContent;
  //         // });
  //       }
  //       await delay(500);
  //       if (response.data?.actionData?.type === "strategy") {
  //         setAIType("strategy");
  //       } else if (response.data?.actionData?.type === "task") {
  //         setAIType("task");
  //       }
  //     }
  //   }
  // };

  return (

    <CustomCursorWrapper>

      <Card withBorder p="lg" maw={"85%"} ml="auto" mr="auto" mt="lg">
        <div style={{ position: 'relative', width: '100%', zIndex: 1 }} onMouseEnter={() => setOpened(true)} onMouseLeave={() => setOpened(false)}>
          <div style={{ position: 'absolute', width: '100%', height: '100px', top: '-50px', zIndex: 2 }}></div>
          <Paper radius={"sm"}>
            <Flex align={"center"} justify={"center"} className="bg-gray-100 rounded-lg p-2 shadow-lg border border-dotted border-gray-200">
              {/* 4 chats */}
              <Text fw={600} color="black" className="text-center">{threads.length} chats</Text>
              {openedChat ? <IconChevronDown size={"1rem"} color="black" style={{ marginLeft: '1rem' }} /> : <IconChevronUp size={"1rem"} color="black" style={{ marginLeft: '1rem' }} />}
            </Flex>
            <Collapse in={openedChat}>
              <Flex mt={"md"} gap={"sm"}>
                <Paper
                  radius={"sm"}
                  p={"sm"}
                  bg={"#fcecfe"}
                  miw={120}
                  mr="sm"
                  className="flex flex-col items-center justify-center"
                  onClick={() => console.log("New Chat----")}
                >
                  <IconPlus color="#df77f5" />
                  {/* <Text fw={700} size={"md"} mt={"xs"} color="#df77f5">
                  New Chat
                </Text> */}
                </Paper>
                <div ref={containerRef} style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
                  {threads.map((thread: ThreadType, index) => {
                    return (
                      <Paper
                        key={index}
                        withBorder
                        mr="sm"
                        radius={"sm"}
                        p={"sm"}
                        style={{ display: "inline-block", minWidth: "400px" }}
                        className="transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:shadow-lg"
                        onClick={() => { getMessages(thread.thread_id); toggle() }}
                      >
                                            <Flex align={"center"} gap={"sm"}>
                      {thread.status === "ACTIVE" ? (
                        <ThemeIcon color="green" radius={"xl"} size={"xs"} p={0} variant="light">
                          <IconPoint fill="green" color="white" size={"4rem"} />
                        </ThemeIcon>
                      ) : thread.status === "Completed" ? (
                        <IconCircleCheck size={"1rem"} fill="green" color="white" />
                      ) : (
                        <></>
                      )}{" "}
                      <Text color="green" fw={600}>
                        {thread.status}
                      </Text>
                    </Flex>
                        <Text fw={600}>{thread.session_name || "Untitled Session"}</Text>
                        <Text color="gray">
                          Completed on: {thread.estimated_completion_time ? moment(thread.estimated_completion_time).fromNow() : "N/A"}
                        </Text>
                      </Paper>
                    );
                  })}
                </div>
              </Flex>
            </Collapse>
          </Paper>
        </div>
        <Flex mt={"md"} gap={"xl"}>
          <SegmentChat
            setSegment={setSegment}
            messages={messages}
            segment={segment}
            setAIType={setAIType}
            aiType={aiType}
            // generateResponse={generateResponse}
          // chatContent={chatContent}
          // setChatContent={setChatContent}
          />
          <SegmentAIGeneration setSegment={setSegment} segment={segment} setAIType={setAIType} aiType={aiType} />
        </Flex>
      </Card>

    </CustomCursorWrapper>
  );
}

const SegmentChat = (props: any) => {
  const messages: MessageType[] = props.messages;
  const setMessages = props.setMessages;
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const { chatContent, setChatContent } = props;

  const viewport = useRef<any>(null);

  const handleSubmit = async () => {}

  // const handleSubmit = async () => {
  //   if (prompt !== "") {
  //     const newChatPrompt = {
  //       sender: "user",
  //       query: [prompt],
  //       created_at: moment().format("MMMM D, h:mm a"),
  //     };
  //     setMessages((chatContent: any) => [...chatContent, newChatPrompt]);
  //     setPrompt("");
  //     setLoading(true);
  //     const response = await props.generateResponse();
  //     setLoading(false);
  //     if (response?.status != "success") return;
  //     if (!response.data.isAction) {
  //       let loadingMessage = {
  //         sender: "chatbot",
  //         query: [""],
  //         id: Date.now(),
  //         created_at: moment().format("MMMM D, h:mm a"),
  //       };
  //       // setMessages((chatContent: any) => [...chatContent, loadingMessage]);

  //       // if (response.data.message && Array.isArray(response.data.message)) {
  //       //   for (let i = 0; i < response.data.message.length; i++) {
  //       //     const message = response.data.message[i];
  //       //     if (typeof message === "string") {
  //       //       for (let j = 0; j < message.length; j++) {
  //       //         await delay(20); // Adjust delay for desired typing speed
  //       //         setChatContent((chatContent: any) => {
  //       //           const updatedContent = [...chatContent];
  //       //           const lastMessage = updatedContent[updatedContent.length - 1];
  //       //           if (i === lastMessage.query.length - 1) {
  //       //             lastMessage.query[i] += message[j];
  //       //           } else {
  //       //             lastMessage.query.push(message[j]);
  //       //           }
  //       //           return updatedContent;
  //       //         });
  //       //       }
  //       //       if (i < response.data.message.length - 1) {
  //       //         await delay(500); // Delay between messages
  //       //         setChatContent((chatContent: any) => {
  //       //           const updatedContent = [...chatContent];
  //       //           updatedContent[updatedContent.length - 1].query.push("");
  //       //           return updatedContent;
  //       //         });
  //       //       }
  //       //     }
  //       //   }
  //       // }
  //     } else {
  //       // let loadingMessage = {
  //       //   sender: "alert",
  //       //   query: "",
  //       //   title: response.data?.actionData?.title,
  //       //   id: Date.now(),
  //       //   created_at: moment().format("MMMM D, h:mm a"),
  //       //   type: response.data?.actionData?.type,
  //       // };
  //       // setChatContent((chatContent: any) => [...chatContent, loadingMessage]);
  //       // const message = response.data?.actionData?.content;
  //       // if (message) {
  //       //   for (let i = 0; i < message.length; i++) {
  //       //     await delay(20); // Adjust delay for desired typing speed
  //       //     setChatContent((chatContent: any) => {
  //       //       const updatedContent = [...chatContent];
  //       //       const lastMessage = updatedContent[updatedContent.length - 1];
  //       //       lastMessage.query += message[i];
  //       //       return updatedContent;
  //       //     });
  //       //   }
  //       //   await delay(500);
  //       //   if (response.data?.actionData?.type === "strategy") {
  //       //     props.setAIType("strategy");
  //       //   } else if (response.data?.actionData?.type === "task") {
  //       //     props.setAIType("task");
  //       //   }
  //       // }
  //     }
  //   } else {
  //     console.log("--------");
  //   }
  // };

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

  const [chat2, setChat2] = useState([
    {
      status: true,
      title: "Gather information about your medical Scribe AI Product by researching on",
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

  const [chatList, setChatList] = useState([]);

  const [shouldSubmit, setShouldSubmit] = useState(false);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleListClick = async (prompt: string) => {
    setPrompt(prompt);
    setShouldSubmit(true);
  };

  useEffect(() => {
    handleSubmit();
  }, [shouldSubmit]);

  return (
    <Paper withBorder shadow="sm" radius={"md"} w={"30%"}>
      {/* <Flex p={"md"} align={"center"} gap={5}>
        <IconSparkles size={"1rem"} color="#be4bdb" />
        <Text fw={600}>Prompt</Text>
      </Flex> */}
      <Divider bg="gray" />
      <ScrollArea h={600} viewportRef={viewport} scrollHideDelay={4000}>
        {messages.length > 0 ? (
          <Flex direction={"column"} gap={"sm"} p={"md"} h={"100%"} className=" overflow-auto">
            {messages.map((message: MessageType, index: number) => {
              return (
                <>
                  {message.type === 'message' ? (
                    <Flex direction={"column"} w={"80%"} gap={4} key={index} ml={message.role === "user" ? "auto" : "0"}>
                      <Flex gap={4} align={"center"}>
                        <Avatar src={message.role === "user" ? userData.img_url : Logo} size={"xs"} radius={"xl"} />
                        <Text fw={600} size={"xs"}>
                          {message.role !== "assistant" ? userData.sdr_name : "SellScale AI"}
                        </Text>
                      </Flex>
                      <Flex className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none" px={"sm"} py={7}>
                        <Text size={"sm"} fw={500}>
                          {message.role === "user" ? (
                            message.message
                          ) : message.message === "loading" ? (
                            <Flex align="center" gap="xs">
                              <Loader color="black" variant="dots" />
                              <Text size={"sm"} fw={500} color="gray">
                                Generating segment...
                              </Text>
                            </Flex>
                          ) : (
                            message.message
                          )}
                        </Text>
                      </Flex>
                      {/* {messages.map((subMessage: MessageType, subIndex: number) => {
                        return (
                          <Flex
                            className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none"
                            px={"sm"}
                            py={7}
                            key={subIndex}
                            bg={subMessage.role === "user" ? "#F5F9FE" : ""}
                          >
                            <Text size={"sm"} fw={500}>
                              {subMessage.role === "user" ? (
                                subMessage.message
                              ) : subMessage.message === "loading" ? (
                                <Flex align="center" gap="xs">
                                  <Loader color="black" variant="dots" />
                                  <Text size={"sm"} fw={500} color="gray">
                                    Generating segment...
                                  </Text>
                                </Flex>
                              ) : (
                                <>
                                  <div dangerouslySetInnerHTML={{ __html: message.message }} />
                                </>
                              )}
                            </Text>
                          </Flex>
                        );
                      })} */}
                      <Text color="gray" size={"xs"} ml={message.role === "user" ? "auto" : "0"}>
                        {message.created_time}
                      </Text>
                    </Flex>
                  ) 
                  
                  : (
                    <div className=" border border-[#be4bdb] border-solid m-auto rounded-md">
                      <div className="w-full bg-[#be4bdb] py-2 text-center text-white text-semibold">{message.type}</div>
                      <div className="p-3">{message.action_description}</div>
                    </div>
                  )}
                </>
              );
            })}
            {/* {loading && <Loader color="blue" type="dots" />} */}
          </Flex>
        ) : (
          <div className="absolute bottom-0 right-0 flex flex-col w-4/5 gap-1 pr-4">
            <Paper withBorder p={"xs"} radius={"md"} className="hover:border-[#49494]">
              <Flex align={"center"} gap={"xs"} onClick={() => handleListClick("I have a prospect list - Find the best way to reach them")}>
                <ThemeIcon color="grape" size={"xl"} variant="light">
                  <IconUserShare size={"1.4rem"} />
                </ThemeIcon>
                <Text color="grape" fw={500} size={"sm"}>
                  Help me reach out to my prospect list effectively
                </Text>
              </Flex>
            </Paper>
            <Paper withBorder p={"xs"} radius={"md"}>
              <Flex align={"center"} gap={"xs"} onClick={() => handleListClick("I want to set up pre-meetings for a conference in Vegas")}>
                <ThemeIcon color="grape" size={"xl"} variant="light">
                  <IconUserShare size={"1.4rem"} />
                </ThemeIcon>
                <Text color="grape" fw={500} size={"sm"}>
                  I need assistance organizing pre-meetings for an upcoming conference
                </Text>
              </Flex>
            </Paper>
            <Paper withBorder p={"xs"} radius={"md"}>
              <Flex align={"center"} gap={"xs"} onClick={() => handleListClick("I have a campaign idea I've wanted to implement")}>
                <ThemeIcon color="grape" size={"xl"} variant="light">
                  <IconUserShare size={"1.4rem"} />
                </ThemeIcon>
                <Text color="grape" fw={500} size={"sm"}>
                  I have a campaign idea to implement
                </Text>
              </Flex>
            </Paper>
          </div>
        )}
      </ScrollArea>
      <Paper p={"sm"} withBorder radius={"md"} className="bg-[#f7f8fa]" my={"lg"} mx={"md"}>









        
        
        
        <TextInput
          value={prompt}
          placeholder="Chat with AI..."
          onKeyDown={handleKeyDown}
          onChange={(e) => setPrompt(e.target.value)}
          variant="unstyled"
          inputContainer={(children) => <div style={{ minHeight: '0px', cursor: 'default' }}>{children}</div>}
          style={{ minHeight: '40px', resize: 'none', overflow: 'hidden', cursor: 'default' }}
        />
        <Flex justify={"space-between"} mt={"sm"} align={"center"}>
          <Flex gap={"sm"}>
            {/* <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconPlus size={"1rem"} />
            </ActionIcon>
            <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconLink size={"1rem"} />
            </ActionIcon> */}
          </Flex>
          <Button
            size="xs"
            color="grape"
            rightIcon={<IconSend size={"1rem"} />}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </Flex>
      </Paper>
    </Paper>
  );
};

const SegmentAIGeneration = (props: any) => {
  const [active, setActive] = useState(1);
  const [assets, setAssets] = useState(["Important-sales-asset.pdf", "extra-asset-1.pdf"]);
  const [generatingFilters, setGeneratingFilters] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number>(0);
  const userToken = useRecoilValue(userTokenState);

  const updateSegment = (index: number, field: any, value: any) => {
    fetch(`${API_URL}/apollo/update_segment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        id: props.segment[index].id,
        field: field,
        value: value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== "success") {
          console.error("Failed to update segment:", data);
        }
      })
      .catch((error) => {
        console.error("Error updating segment:", error);
      });

    props.setSegment((prevSegments: any) => {
      const updatedSegments = [...prevSegments];
      updatedSegments[index] = {
        ...updatedSegments[index],
        [field]: value,
      };
      return updatedSegments;
    });
  };

  const [prefilters, setPrefilters] = useState<any>([]);

  const updateExistingSegment = (index: number, field: any, value: any) => {
    fetch(`${API_URL}/apollo/update_segment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        id: prefilters[index].id,
        field: field,
        value: value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status !== "success") {
          console.error("Failed to update segment:", data);
        }
      })
      .catch((error) => {
        console.error("Error updating segment:", error);
      });

    setPrefilters((prevPrefilters: any) => {
      const updatedPrefilters = [...prevPrefilters];
      updatedPrefilters[index] = {
        ...updatedPrefilters[index],
        [field]: value,
      };
      return updatedPrefilters;
    });
  };

  // const fetchSavedQueries = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/apollo/get_all_saved_queries`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //     });
  //     const data = await response.json();
  //     if (data.status === "success") {
  //       const formattedPrefilters = data.data.map((query: any) => ({
  //         ...query,
  //       }));
  //       setPrefilters(formattedPrefilters);
  //     } else {
  //       console.error("Failed to fetch saved queries:", data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching saved queries:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchSavedQueries();
  // }, [userToken]);

  return (
    <Paper withBorder shadow="sm" w={"65%"} radius={"md"}>
      <Flex p={"md"} align={"center"} gap={5} bg={"grape"} className=" rounded-t-md">
        {/* <IconSparkles size={"1rem"} color="white" /> */}
        <Text fw={600} color="white">
          Selix Computer
        </Text>
      </Flex>
      <Divider bg="gray" />
      <Paper withBorder radius={0} p={"sm"}>
        <SegmentedControl
          onChange={(value) => props.setAIType(value)}
          w={"100%"}
          styles={{
            root: {
              backgroundColor: "transparent",
            },
            control: {
              borderWidth: "0px",
              "&:not(:last-of-type)": {
                borderWidth: "0px",
              },
              "&:hover": {
                cursor: "default",
              },
            },
          }}
          data={[
            {
              value: "task",
              label: (
                <Center style={{ gap: 10 }}>
                  {props.aiType === "task" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Tasks</span>
                </Center>
              ),
            },
            {
              value: "strategy",
              label: (
                <Center style={{ gap: 10 }}>
                  {props.aiType === "strategy" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Strategies</span>
                </Center>
              ),
            },
            // {
            //   value: "segment",
            //   label: (
            //     <Center style={{ gap: 10 }}>
            //       {props.aiType === "segment" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
            //       <span>Segments</span>
            //     </Center>
            //   ),
            // },
            {
              value: "campaign",
              label: (
                <Center style={{ gap: 10 }}>
                  {props.aiType === "campaign" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Campaigns</span>
                </Center>
              ),
            },
            {
              value: "analytics",
              label: (
                <Center style={{ gap: 10 }}>
                  {props.aiType === "analytics" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Analytics</span>
                </Center>
              ),
            },
            // {
            //   value: "planner",
            //   label: (
            //     <Center style={{ gap: 10 }}>
            //       {aiType === "planner" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
            //       <span>Planner/Logs</span>
            //     </Center>
            //   ),
            // },
          ]}
        />
      </Paper>
      <ScrollArea bg={"#f7f8fa"} h={600} scrollHideDelay={4000} p={"md"}>
        {props.aiType === "strategy" ? (
          <SelinStrategy handleSpecialEvent={props.handleSpecialEvent} />
        ) : props.aiType === "segment" ? (
          <Box maw="900px">
            <SegmentV3 />
          </Box>
        ) : props.aiType === "campaign" ? (
          <Box maw="100%">
            <CampaignLandingV2 />
          </Box>
        ) : props.aiType === "analytics" ? (
          <Box maw="900px">
            <WhatHappenedLastWeek />
          </Box>
        ) : props.aiType === "planner" ? (
          <SelinAIPlanner />
        ) : (
          <Center style={{ height: '100%' }}>
            <Text style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>No Tasks Created. Please create one via the chat.</Text>
          </Center>
        )}
      </ScrollArea>
      {/* <Paper withBorder bg={"#fffcf5"} radius={"sm"} p={"sm"} style={{ borderColor: "#fab005" }} m="xs">
        <Flex align={"center"} justify={"space-between"}>
          <Text color="yellow" size={"sm"} fw={600} tt={"uppercase"} className="flex gap-2 items-center">
            <IconClock size={"1rem"} />
            estimated completion time:
          </Text>
          <Text size={"sm"} color="yellow" fw={600}>
            10 hrs, 28 min
          </Text>
        </Flex>
      </Paper>
      <TimelineComponent /> */}
    </Paper>
  );
};

const TimelineComponent = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(event.currentTarget.scrollLeft);
  };

  const generateTimelineData = () => {
    const data = [];
    for (let hour = 0; hour <= 24; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        data.push({
          time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          isMainGraduation: minute === 0,
          label: minute === 0 ? `${hour.toString().padStart(2, "0")}:00` : "",
        });
      }
    }
    return data;
  };

  const timelineData = generateTimelineData();

  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - (containerRef.current?.offsetLeft || 0);
      scrollLeft = containerRef.current?.scrollLeft || 0;
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - (containerRef.current?.offsetLeft || 0);
      const walk = (x - startX) * 3;
      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    const container = containerRef.current;

    container?.addEventListener("mousedown", handleMouseDown);
    container?.addEventListener("mouseleave", handleMouseLeave);
    container?.addEventListener("mouseup", handleMouseUp);
    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      container?.removeEventListener("mousedown", handleMouseDown);
      container?.removeEventListener("mouseleave", handleMouseLeave);
      container?.removeEventListener("mouseup", handleMouseUp);
      container?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Paper withBorder p="md" mt="md">
      <Flex align={"center"} justify={"space-between"}>
        <Flex gap={"sm"}>
          <ActionIcon size={"sm"} variant="outline" color="gray" radius={"sm"}>
            <IconChevronLeft />
          </ActionIcon>
          <ActionIcon size={"sm"} variant="outline" color="gray" radius={"sm"}>
            <IconChevronRight />
          </ActionIcon>
        </Flex>
        <Badge variant="outline">Go Live</Badge>
      </Flex>
      <div className="relative flex justify-center mt-4">
        <div className="absolute top-[-15px]">
          <IconTriangleInverted size={"1rem"} fill="gray" color="white" />
        </div>
        <div
          className="absolute left-0 top-[-10px] h-[50px] w-[120px]"
          style={{
            backgroundImage: "linear-gradient(90deg, white, transparent)",
          }}
        ></div>
        <div
          className="absolute right-0 top-[-10px] h-[50px] w-[120px]"
          style={{
            backgroundImage: "linear-gradient(90deg, transparent, white)",
          }}
        ></div>
      </div>
      <div
        ref={containerRef}
        style={{
          overflowX: "hidden",
          whiteSpace: "nowrap",
          paddingBottom: "10px",
          borderTop: "1px solid #ced4da",
        }}
        onScroll={handleScroll}
        className="mx-4"
      >
        <Flex w={"100%"} gap={"sm"}>
          {timelineData.map((item, index) => {
            return (
              <>
                {index < timelineData.length - 5 && (
                  <Flex key={index} direction={"column"} align={"center"} w={item.isMainGraduation ? "2px" : "10px"}>
                    <div
                      style={{
                        height: item.isMainGraduation ? "15px" : "8px",
                        width: item.isMainGraduation ? "2px" : "1px",
                        backgroundColor: "#ced4da",
                      }}
                      onClick={() => {
                        const newPosition = index * 25;
                        containerRef.current?.scrollTo({
                          left: newPosition,
                          behavior: "smooth",
                        });
                      }}
                    />
                    {item.label && (
                      <Text size="xs" color="dimmed" ml={index === 0 ? "45px" : ""} mr={index === timelineData.length - 6 ? "46px" : ""}>
                        {item.label}
                      </Text>
                    )}
                  </Flex>
                )}
              </>
            );
          })}
        </Flex>
      </div>
    </Paper>
  );
};
