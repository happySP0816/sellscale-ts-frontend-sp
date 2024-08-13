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
  Select,
  Title,
  Textarea,
  Popover,
  LoadingOverlay,
  Kbd,
} from "@mantine/core";
import {
  IconBrowser,
  IconBulb,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconEye,
  IconEyeOff,
  IconFlask,
  IconHammer,
  IconInfoCircle,
  IconLink,
  IconList,
  IconParachute,
  IconPlus,
  IconPoint,
  IconPuzzle,
  IconSend,
  IconTrash,
  IconTriangleInverted,
} from "@tabler/icons";
import { IconSparkles, IconUserShare } from "@tabler/icons-react";
import moment from "moment";
import { Fragment, Key, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { proxyURL } from "@utils/general";

import Logo from "../../../assets/images/logo.png";
import { API_URL } from "@constants/data";
import { useDisclosure } from "@mantine/hooks";
// import SelinAIPlanner from "./SelinAIPlanner";
import ComingSoonCard from "@common/library/ComingSoonCard";
import SegmentV3 from "@pages/SegmentV3/SegmentV3";
import CampaignLandingV2 from "@pages/CampaignV2/CampaignLandingV2";
import WhatHappenedLastWeek from "./WhatHappenedLastWeek";
import AIBrainStrategy from "@pages/Strategy/AIBrainStrategy";
// import SelinStrategy from "@pages/Strategy/Selinstrategy";
import { title } from "process";
import { socket } from "../../App";
import { set } from "lodash";
import { cu } from "@fullcalendar/core/internal-common";
import { showNotification } from "@mantine/notifications";
import { useStrategiesApi } from "@pages/Strategy/StrategyApi";
import { openContextModal } from "@mantine/modals";
import DeepGram from "@common/DeepGram";

interface CustomCursorWrapperProps {
  children: React.ReactNode;
}

const CustomCursorWrapper: React.FC<CustomCursorWrapperProps> = ({
  children,
}) => {
  const cursorStyle = {
    cursor: `url("data:image/svg+xml,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 24 24' fill='none' stroke='#ff69b4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-right' transform='rotate(225)'><path d='M9 18L15 12L9 6'></path></svg>"
    )}") 16 0, auto`,
  };

  return <div style={cursorStyle}>{children}</div>;
};

interface TaskType {
  order_number: number;
  proof_of_work_img: string | null;
  id: number;
  title: string;
  description?: string;
  status: "QUEUED" | "IN_PROGRESS" | "IN_PROGRESS_REVIEW_NEEDED" | "COMPLETE" | "CANCELLED" | "BLOCKED";
  created_at: string;
  updated_at: string;
  selix_session_id: number;
}

export interface MemoryType {
  additional_context: string;
  counter: number;
  session_name: string;
  strategy_id: number;
  tab: "STRATEGY_CREATOR" | "PLANNER" | "BROWSER";
  search?: {
    query: string;
    response: string;
    citations: string[];
    images: {
      image_url: string;
      origin_url: string;
      height: number;
      width: number;
    }[];
  }[];
}

export interface ThreadType {
  id: number;
  session_name: string;
  status: "ACTIVE" | "COMPLETE" | "CANCELLED" | "PENDING_OPERATOR" | "BLOCKED";
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
  const [threads, setThreads] = useState<ThreadType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [counter, setCounter] = useState<number>(0);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const roomIDref = useRef<string>("");
  const deviceIDRef = useRef<string>(Math.random().toString(36).substring(2, 15));
  const [currentSessionId, setCurrentSessionId] = useState<Number | null>(null);
  const sessionIDRef = useRef<Number>(-1);
  const [loadingNewChat, setLoadingNewChat] = useState(false);
  const [prompt, setPrompt] = useState("");

  console.log("current session is", currentSessionId);

  const handleSubmit = async () => {
    if (prompt.trim() !== "") {
      const newChatPrompt: MessageType = {
        created_time: moment().format("MMMM D, YYYY h:mm A"),
        message: prompt,
        role: "user",
        type: "message",
      };
      setMessages((chatContent: MessageType[]) => [
        ...chatContent,
        newChatPrompt,
      ]);

      setPrompt("");
      // setLoading(true);

      const loadingMessage: MessageType = {
        created_time: moment().format("MMMM D, h:mm a"),
        message: "loading",
        role: "assistant",
        type: "message",
      };

      setMessages((chatContent: MessageType[]) => [
        ...chatContent,
        loadingMessage,
      ]);

      try {
        const response = await fetch(`${API_URL}/selix/create_message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            device_id: deviceIDRef.current,
            session_id: currentSessionId,
            message: prompt,
          }),
        });

        const data = await response.json();
        // if (data.status === "OK") {
        //   // Fetch the updated messages
        //   await getMessages(currentThreadID.current);
        // }
      } catch (error) {
        console.error("Error creating message:", error);
      } finally {
        // setLoading(false);
        setPrompt("");
      }
    }
  };

  // console.log('current session thread is', threads.find((thread) => thread.id === currentSessionId));

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
      console.log('data is', data);
      setThreads(data);
      // console.log("data is", data);
      if (data.length > 0) {
          getMessages(data[0].thread_id, data[0].id, data);
      }
      if (data.length === 0) {
        handleCreateNewSession();
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };
  const getMessages = async (thread_id: string, session_id: Number, threads_passed?: ThreadType[]) => {

    setLoadingNewChat(true);
    try {
      // create new room_id

      setCurrentSessionId(session_id);
      sessionIDRef.current = session_id;
      roomIDref.current = thread_id;

      socket.emit("join-room", {
        payload: { room_id: thread_id },
      });

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
      const filteredMessages = data.filter(
        (message: MessageType) => message.message !== "Acknowledged."
      );
      setMessages(filteredMessages);
      const currentThread = threads_passed?.find(
        (thread) => thread.id === session_id
      ) || threads.find((thread) => thread.id === session_id);

      const memory: MemoryType | undefined = currentThread?.memory;
      if (currentThread?.tasks) {
        const orderedTasks = currentThread.tasks.sort(
          (a, b) => a.order_number - b.order_number
        );
        setTasks(orderedTasks || []);
      }
      if (memory) {
        setAIType(memory.tab || "PLANNER");
      } else {
        setAIType("");
      }

      console.log("Messages data:", messages);
      // You can add further processing of the messages here if needed
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingNewChat(false);
    }
  };

  const handleCreateNewSession = async () => {
    setLoadingNewChat(true);
    try {
      const room_id = Array.from(
        { length: 16 },
        () => Math.random().toString(36)[2]
      ).join("");
      roomIDref.current = room_id;
      socket.emit("join-room", {
        payload: { room_id: room_id },
      });

      const response = await fetch(`${API_URL}/selix/create_session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ additional_context: "", room_id: room_id }), // Placeholder for the body
      });
      const data = await response.json();
      console.log("data is", data);
    } catch (error) {
      console.error("Error creating new session:", error);
    } finally {
      setLoadingNewChat(false);
    }
  };

  const userToken = useRecoilValue(userTokenState);

  const handleNewMessage = (data: {
    message?: string;
    action?: any;
    device_id?: string;
    role: "user" | "assistant" | "system";
    thread_id: string;
  }) => {

    // if the message is not for the current device, ignore it
    console.log('comparing device id', data.device_id, deviceIDRef.current);
    if (data?.device_id === deviceIDRef.current) {
      
      return;
    }
    if (data.thread_id === roomIDref.current) {
      if (data.message) {
        setMessages((chatContent: MessageType[]) => [
          ...chatContent,
          {
            created_time: moment().format("MMMM D, h:mm a"),
            message: data?.message || "",
            role: data?.role || "assistant",
            type: "message",
          },
        ]);
        if (data.role === "assistant"){
          setMessages((chatContent: MessageType[]) =>
            chatContent.filter((message) => message.message !== "loading")
          );
        }
      
      } else if (data.action) {
        setMessages((chatContent: MessageType[]) => [
          ...chatContent,
          {
            created_time: moment().format("MMMM D, h:mm a"),
            message: data.action.action_description,
            role: "assistant",
            type: "action",
            action_title: data.action.action_title,
            action_description: data.action.action_description,
            action_function: data.action.action_function,
            action_params: data.action.action_params,
          },
        ]);
      }
    }

      //remove all messages that are message.message === 'loading'

      
  };

  const handleChangeTab = (data: { tab: string, thread_id: string }) => {
    if (data.thread_id === roomIDref.current) {
        showNotification({
          title: "Tab changed",
          message: `Tab changed to: ${data.tab}`,
          color: "blue",
          icon: <IconEye />,
        });

        setAIType(data.tab);
      }
    };

    const handleAddTaskToSession = async (data: { task: TaskType, thread_id: string }) => {
      if (data.thread_id === roomIDref.current) {
      console.log("adding task to session", data);

      const task = data.task;

      showNotification({
        title: "Task added",
        message: `Task: ${task.title} has been added`,
        color: "green",
        icon: <IconCircleCheck />,
      });

      console.log("task is", task);
      // Ensure the task is added correctly to the current session
      setThreads((prevThreads) => {
        const updatedThreads = prevThreads.map((thread) => {
          if (task.selix_session_id === sessionIDRef.current) {
            const updatedTasks = Array.isArray(thread.tasks)
              ? [...thread.tasks, task]
              : [task];
            console.log("updated tasks are", updatedTasks);
            return { ...thread, tasks: updatedTasks };
          } else {
            console.log(
              "found no match for the current session. we compared",
              task.selix_session_id,
              "and",
              sessionIDRef.current
            );
          }
          return thread;
        });

        // Ensure the updated threads object is correctly reflected for children components
        const currentThread = updatedThreads.find(
          (thread) => thread.id === sessionIDRef.current
        );
        const orderedTasks = currentThread?.tasks?.sort(
          (a, b) => a.order_number - b.order_number
        );
        setTasks(orderedTasks || []);

        return updatedThreads;
      });
    }
  };

  const handleNewSession = async (data: { session: ThreadType, thread_id: string }) => {
    // if (data.thread_id === roomIDref.current) {
      // just update the local state
      setThreads((prevThreads) => [...prevThreads, data.session]);
      getMessages(data.session.thread_id, data.session.id);
      setCurrentSessionId(data.session.id);
      console.log("meowww", data.session.id);
      sessionIDRef.current = data.session.id;
      roomIDref.current = data.session.thread_id;

      showNotification({
        title: "New Session",
        message: `New session created: ${data.session.session_name}`,
        color: "blue",
        icon: <IconEye />,
      });
    // }
  };

  const handleUpdateTaskAndAction = async (data: {
    task: TaskType;
    action: MessageType;
    thread_id: string;
  }) => {
    if (data.thread_id === roomIDref.current) {
      showNotification({
        title: "Task updated",
        message: `Task: ${data.task.title} has been updated`,
        color: "green",
        icon: <IconCircleCheck />,
      });

      // just update the local state
      console.log("updating task and action", data);
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          data.task.selix_session_id === sessionIDRef.current
            ? {
                ...thread,
                tasks: Array.isArray(thread.tasks)
                  ? [...thread.tasks, data.task]
                  : [data.task],
              }
            : thread
        )
      );
      setMessages((chatContent: MessageType[]) =>
        chatContent.map((message: MessageType) =>
          message.id === data.action.id
            ? {
                ...data.action,
              }
            : message
        )
      );
    }
  };

  const handleUpdateSession = async (data: {
    session: ThreadType;
    thread_id: string;
  }) => {
    if (roomIDref.current === data.thread_id) {
      showNotification({
        title: "Session updated",
        message: `Session: ${data.session.session_name} has been updated`,
        color: "green",
        icon: <IconCircleCheck />,
      });

      // just update the local state
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === sessionIDRef.current
            ? { ...thread, ...data.session }
            : thread
        )
      );
    }
  };

  const handleIncrementCounter = async (data: {thread_id: string}) => {
    if (data.thread_id === roomIDref.current) {
      console.log("heyyy counter");
      setCounter((prev) => counter + 1);
  }
  };

  useEffect(() => {
    socket.on("incoming-message", handleNewMessage);
    socket.on("change-tab", handleChangeTab);
    socket.on("add-task-to-session", handleAddTaskToSession);
    socket.on("new-session", handleNewSession);
    socket.on("update-action", handleUpdateTaskAndAction);
    socket.on("update-session", handleUpdateSession);
    socket.on("increment-counter", handleIncrementCounter);

    return () => {
      socket.off("incoming-message", handleNewMessage);
      socket.off("change-tab", handleChangeTab);
      socket.off("add-task-to-session", handleAddTaskToSession);
      socket.off("new-session", handleNewSession);
      socket.off("update-action", handleUpdateTaskAndAction);
      socket.off("update-session", handleUpdateSession);
      socket.off("increment-counter", handleIncrementCounter);
    };
  }, []);

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

  return (
    <CustomCursorWrapper>
      <Card p="lg" maw={"100%"} ml="auto" mr="auto" mt="sm">
        <div
          style={{ position: "relative", width: "100%", zIndex: 1 }}
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100px",
              top: "-50px",
              zIndex: 2,
            }}
          ></div>
          <Card withBorder radius={"sm"}>
            <Flex align={"center"} justify={"flex-start"}>
              <ThemeIcon
                radius="xl"
                size="xs"
                color={
                  threads.filter((thread) => thread.status === "ACTIVE")
                    .length > 0
                    ? "green"
                    : "gray"
                }
                variant={
                  threads.filter((thread) => thread.status === "ACTIVE")
                    .length > 0
                    ? "filled"
                    : "light"
                }
                className={
                  threads.filter((thread) => thread.status === "ACTIVE")
                    .length > 0
                    ? "pulsing-bubble"
                    : ""
                }
              >
                <span />
              </ThemeIcon>
              <Text fw={600} color="black" className="text-left" ml="xs">
                {threads.filter((thread) => (thread.status !== "COMPLETE" && thread.status !== "CANCELLED" )).length}{" "}
               Conversations
              </Text>
              <div style={{ marginLeft: "auto" }}>
                {openedChat ? (
                  <IconChevronDown size={"1rem"} color="black" />
                ) : (
                  <IconChevronUp size={"1rem"} color="black" />
                )}
              </div>
            </Flex>
            <Collapse in={openedChat}>
              <Flex mt={"md"} gap={"sm"}>
                <Paper
                  onClick={
                    !loadingNewChat ? () => handleCreateNewSession() : undefined
                  }
                  radius={"sm"}
                  p={"sm"}
                  bg={"#fcecfe"}
                  miw={120}
                  mr="sm"
                  className="flex flex-col items-center justify-center"
                >
                  {loadingNewChat ? (
                    <Loader color="#df77f5" size="sm" />
                  ) : (
                    <>
                      {" "}
                      <IconPlus color="#df77f5" />
                      <Text size="sm" fw={600} color="#E25DEE" mt={"sm"}>
                        New Chat
                      </Text>
                    </>
                  )}
                </Paper>
                <div
                  ref={containerRef}
                  style={{ overflowX: "hidden", whiteSpace: "nowrap" }}
                >
                  {threads
                    .sort((a, b) => b.id - a.id)
                    .map((thread: ThreadType, index) => {
                      return (
                        <Paper
                          key={index}
                          withBorder
                          mr="sm"
                          radius={"sm"}
                          p={"sm"}
                          style={{
                            display: "inline-block",
                            minWidth: "400px",
                            backgroundColor:
                              sessionIDRef.current === thread.id
                                ? "#d0f0c0"
                                : "white", // Highlight if current thread
                            borderColor:
                              sessionIDRef.current === thread.id
                                ? "#00796b"
                                : "#ced4da", // Change border color if current thread
                          }}
                          className={`transition duration-300 ease-in-out transform ${
                            sessionIDRef.current === thread.id
                              ? "scale-105 shadow-2xl"
                              : "hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
                          }`}
                          onClick={() => {
                            getMessages(thread.thread_id, thread.id);
                            toggle();
                          }}
                        >
                          <Flex align={"center"} gap={"sm"}>
                            {thread.status === "ACTIVE" ? (
                              <div className="flex items-center justify-center bg-green-100 rounded-full p-1 border-green-300 border-[1px] border-solid">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            ) : // </ThemeIcon>
                            thread.status === "COMPLETE" ? (
                              <IconCircleCheck
                                size={"1rem"}
                                fill="green"
                                color="white"
                              />
                            ) : thread.status === "PENDING_OPERATOR" ? (
                              // <ThemeIcon color="orange" radius={"xl"} size={"xs"} p={0} variant="light">
                              //   <IconPoint fill="orange" color="white" size={"4rem"} />
                              // </ThemeIcon>
                              <div className="flex items-center justify-center bg-orange-100 rounded-full p-1 border-orange-300 border-[1px] border-solid">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              </div>
                            ) : (
                              <></>
                            )}{" "}
                            <Text
                              color={
                                thread.status === "PENDING_OPERATOR"
                                  ? "orange"
                                  : "green"
                              }
                              fw={600}
                            >
                              {thread.status === "PENDING_OPERATOR"
                                ? "IN PROGRESS"
                                : thread.status}
                            </Text>
                            <ActionIcon
                              onClick={(e) => {
                                e.stopPropagation();
                              setThreads((prevThreads) =>
                                prevThreads.filter(
                                  (prevThread) => prevThread.id !== thread.id
                                )
                              );
                              //if the chat we're in is the one we're deleting, we need to get the next chat
                              if (sessionIDRef.current === thread.id) {
                                const nextThread = threads.find(
                                  (thread) => thread.id !== sessionIDRef.current
                                );
                                if (nextThread) {
                                  getMessages(nextThread.thread_id, nextThread.id);
                                }
                              }
                              

                              //query to delete thread
                               fetch(`${API_URL}/selix/delete_session`, {
                                method: "DELETE",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${userToken}`,
                                },
                                body: JSON.stringify({ session_id: thread.id }),
                              });


                              }}
                              style={{ marginLeft: "auto" }}
                            >
                              <IconTrash size={"1rem"} color="red" />
                            </ActionIcon>
                          </Flex>
                          <Text fw={600}>
                            {thread.session_name || "Untitled Session"}
                          </Text>
                          <Text color="gray">
                            Completed on:{" "}
                            {thread.estimated_completion_time
                              ? moment(
                                  thread.estimated_completion_time
                                ).fromNow()
                              : "N/A"}
                          </Text>
                        </Paper>
                      );
                    })}
                </div>
              </Flex>
            </Collapse>
          </Card>
        </div>
        {currentSessionId && (
          <Flex mt={"md"} gap={"xl"}>
            <LoadingOverlay visible={loadingNewChat} />
            <SegmentChat
              handleSubmit={handleSubmit}
              prompt={prompt}
              setPrompt={setPrompt}
              setSegment={setSegment}
              messages={messages}
              setMessages={setMessages}
              segment={segment}
              setAIType={setAIType}
              aiType={aiType}
              currentSessionId={sessionIDRef.current}
              // generateResponse={generateResponse}
              // chatContent={chatContent}
              // setChatContent={setChatContent}
            />
            <SelixControlCenter
              counter={counter}
              tasks={tasks}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              setAIType={setAIType}
              aiType={aiType}
              threads={threads}
              messages={messages}
              setMessages={setMessages}
              currentSessionId={sessionIDRef.current}
            />
          </Flex>
        )}
      </Card>
    </CustomCursorWrapper>
  );
}

const SegmentChat = (props: any) => {
  const handleSubmit = props.handleSubmit;
  const prompt = props.prompt;
  const setPrompt = props.setPrompt;
  const currentSessionId: Number | null = props.currentSessionId;
  const messages: MessageType[] = props.messages;
  const setMessages: React.Dispatch<React.SetStateAction<MessageType[]>> =
    props.setMessages;
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const { chatContent, setChatContent } = props;

  const viewport = useRef<any>(null);

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [{ ...messages }]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      handleSubmit();
    }
  };

  // const handleResponse = async () => {
  //   setLoading(true);

  //   // Add a placeholder loading message
  //   const loadingMessage = {
  //     sender: "chatbot",
  //     query: "loading",
  //     id: Date.now(),
  //     created_at: moment().format("MMMM D, h:mm a"),
  //   };

  //   try {
  //     const response = await fetch(`${API_URL}/contacts/chat-icp`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //       body: JSON.stringify({ prompt, chatContent }),
  //     });

  //     const data = await response.json();
  //     const res = data?.response;
  //     const chatbotMessage = {
  //       sender: "chatbot",
  //       query: res,
  //       id: loadingMessage.id, // Use the same id to replace the loading message
  //       created_at: moment().format("MMMM D, h:mm a"),
  //     };
  //     // Replace the loading message with the actual response
  //     viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  //     setLoading(false);

  //     console.log("data is", data.data);

  //     props.setSegment((prevSegments: any) => [
  //       ...prevSegments,
  //       {
  //         makers: data["makers"],
  //         industry: data["industry"],
  //         pain_point: data["pain_point"],
  //         id: data?.data?.saved_query_id,
  //         total_entries: data?.data?.pagination?.total_entries,
  //       },
  //     ]);
  //   } catch (error) {
  //     console.error("Error fetching prediction:", error);
  //     setLoading(false);
  //   }
  // };

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

  const [chatList, setChatList] = useState([]);

  const [shouldSubmit, setShouldSubmit] = useState(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleListClick = async (prompt: string) => {
    setPrompt(prompt);
    setShouldSubmit(true);
  };

  useEffect(() => {
    handleSubmit();
  }, [shouldSubmit]);

  return (
    <Paper withBorder shadow="sm" radius={"md"} w={"35%"} h={"100%"}>
      <Flex
        px={"md"}
        py={"xs"}
        align={"center"}
        gap={5}
        bg={"white"}
        className=" rounded-t-md"
      >
        <IconSparkles size={"1rem"} color="#E25DEE" fill="#E25DEE" />
        <Text fw={600}>Chat with Selix</Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={"53vh"} viewportRef={viewport} scrollHideDelay={4000} style={{ overflow: 'hidden' }}>
        {messages.length > 1 ? (
          <Flex
            direction={"column"}
            gap={"sm"}
            p={"md"}
            h={"100%"}
            className=" overflow-auto"
          >
            {messages.map((message: MessageType, index: number) => {
              return (
                <>
                  {message.type === "message" ? (
                    <Flex
                      direction={"column"}
                      w={"70%"}
                      gap={4}
                      key={index}
                      ml={message.role === "user" ? "auto" : "0"}
                      style={{
                        backgroundColor: message.role === "user" ? "#F5F5F5" : "#FAFAFA",
                        boxShadow: message.role === "user" ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "0 2px 4px rgba(0, 0, 0, 0.05)",
                        borderRadius: "10px",
                        padding: "10px",
                      }}
                    >
                      <Flex gap={4} align={"center"}>
                        <Avatar
                          src={
                            message.role === "user" ? userData.img_url : Logo
                          }
                          size={"xs"}
                          radius={"xl"}
                        />
                        <Text fw={600} size={"xs"}>
                          {message.role !== "assistant"
                            ? userData.sdr_name
                            : "Selix AI"}
                        </Text>
                        {message.role !== "user" &&
                          message.message !== "loading" &&
                          index === messages.length - 1 && (
                            <Flex align="center" gap="xs">
                              <Loader
                                variant="bars"
                                color="grape"
                                size="xs"
                                ml={10}
                              />
                            </Flex>
                          )}
                      </Flex>
                      <Flex
                        className=" rounded-lg rounded-br-none"
                        px={"sm"}
                        py={7}
                      >
                        <Text size={"sm"} fw={500}>
                          {message.role === "user" ? (
                            message.message
                          ) : message.message === "loading" ? (
                            <Flex align="center" gap="xs">
                              <Loader color="black" variant="dots" />
                            </Flex>
                          ) : (
                            <Text>
                              {message.message
                                .split("\n")
                                .map((line, index) => (
                                  <Fragment key={index}>
                                    {line}
                                    <br />
                                  </Fragment>
                                ))}
                            </Text>
                          )}
                        </Text>
                      </Flex>
                      <Text
                        color="gray"
                        size={"xs"}
                        ml={message.role === "user" ? "auto" : "0"}
                      >
                        <Text color="gray" size="xs" ml={message.role === "user" ? "auto" : "0"}>
                          {moment(message.created_time).format("MMMM D, YYYY h:mm A")}
                        </Text>
                      </Text>
                    </Flex>
                  ) : (
                    <div key={index} className=" border border-[#E25DEE] border-solid m-auto rounded-md">
                      <div className="w-full bg-[#E25DEE] py-2 text-center text-white text-semibold">
                        ✨ Executing: {message.action_title}
                      </div>
                      <div
                        className="p-3 text-black shadow-md italic"
                      >
                        <Text p={'xs'} size="sm" fw={600} className="text-center">
                          {message.action_description}
                        </Text>
                      </div>
                    </div>
                  )}
                </>
              );
            })}
            {/* {loading && <Loader color="blue" type="dots" />} */}
          </Flex>
        ) : (
          <>
            <Flex
              direction={"column"}
              gap={"sm"}
              p={"md"}
              h={"100%"}
              className=" overflow-auto"
            >
              {messages.map((message: MessageType, index: number) => {
                return (
                  <>
                    {message.type === "message" ? (
                      <Flex
                        direction={"column"}
                        w={"50%"}
                        gap={4}
                        key={index}
                        ml={message.role === "user" ? "auto" : "0"}
                      >
                        <Flex gap={4} align={"center"}>
                          <Avatar
                            src={
                              message.role === "user" ? userData.img_url : Logo
                            }
                            size={"xs"}
                            radius={"xl"}
                          />
                          <Text fw={600} size={"xs"}>
                            {message.role !== "assistant"
                              ? userData.sdr_name
                              : "Selix AI"}
                          </Text>
                          {message.role !== "user" &&
                            message.message === "loading" && (
                              <Flex align="center" gap="xs">
                                <Loader
                                  variant="bars"
                                  color="grape"
                                  size="xs"
                                  ml={10}
                                />
                              </Flex>
                            )}
                        </Flex>
                        <Flex
                          className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none"
                          px={"sm"}
                          py={7}
                        >
                          <Text size={"sm"} fw={500}>
                            {message.role === "user" ? (
                              message.message
                            ) : message.message === "loading" ? (
                              <Flex align="center" gap="xs">
                                <Loader color="black" variant="dots" />
                              </Flex>
                            ) : (
                              <Text>
                                {message.message
                                  .split("\n")
                                  .map((line, index) => (
                                    <Fragment key={index}>
                                      {line}
                                      <br />
                                    </Fragment>
                                  ))}
                              </Text>
                            )}
                          </Text>
                        </Flex>
                        <Text
                          color="gray"
                          size={"xs"}
                          ml={message.role === "user" ? "auto" : "0"}
                        >
                          {message.created_time}
                        </Text>
                      </Flex>
                    ) : (
                      <div className=" border border-[#E25DEE] border-solid m-auto rounded-md">
                        <div className="w-full bg-[#E25DEE] py-2 text-center text-white text-semibold">
                          ✨ Executing: {message.action_title}
                        </div>
                        <div
                          className="p-3 bg-[#E25DEE] text-black shadow-md italic"
                          style={{ background: "white" }}
                        >
                          <Text size="md" fw={600} className="text-center">
                            {message.action_description}
                          </Text>
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
            </Flex>
            <div className="absolute bottom-0 right-0 flex flex-col w-4/5 gap-1 pr-4">
              <Paper
                withBorder
                p={"xs"}
                radius={"md"}
                className="hover:border-[#49494]"
              >
                <Flex
                  align={"center"}
                  gap={"xs"}
                  onClick={() =>
                    handleListClick(
                      "I have a prospect list - Find the best way to reach them"
                    )
                  }
                >
                  <ThemeIcon color="grape" size={"xl"} variant="light">
                    <IconUserShare size={"1.4rem"} />
                  </ThemeIcon>
                  <Text color="#E25DEE" fw={500} size={"sm"}>
                    Help me reach out to my prospect list effectively
                  </Text>
                </Flex>
              </Paper>
              <Paper withBorder p={"xs"} radius={"md"}>
                <Flex
                  align={"center"}
                  gap={"xs"}
                  onClick={() =>
                    handleListClick(
                      "I want to set up pre-meetings for a conference in Vegas"
                    )
                  }
                >
                  <ThemeIcon color="grape" size={"xl"} variant="light">
                    <IconUserShare size={"1.4rem"} />
                  </ThemeIcon>
                  <Text color="#E25DEE" fw={500} size={"sm"}>
                    I need assistance organizing pre-meetings for an upcoming
                    conference
                  </Text>
                </Flex>
              </Paper>
              <Paper withBorder p={"xs"} radius={"md"}>
                <Flex
                  align={"center"}
                  gap={"xs"}
                  onClick={() =>
                    handleListClick(
                      "I have a campaign idea I've wanted to implement"
                    )
                  }
                >
                  <ThemeIcon color="grape" size={"xl"} variant="light">
                    <IconUserShare size={"1.4rem"} />
                  </ThemeIcon>
                  <Text color="#E25DEE" fw={500} size={"sm"}>
                    I have a campaign idea to implement
                  </Text>
                </Flex>
              </Paper>
            </div>
          </>
        )}
      </ScrollArea>
      <Paper
        p={"sm"}
        withBorder
        radius={"md"}
        className="bg-[#f7f8fa]"
        my={"lg"}
        mx={"md"}
      >
        <Textarea
          value={prompt}
          placeholder="Chat with AI..."
          onKeyDown={handleKeyDown}
          onChange={(e) => setPrompt(e.target.value)}
          variant="unstyled"
          inputContainer={(children) => (
            <div style={{ minHeight: "0px", cursor: "default" }}>
              {children}
            </div>
          )}
          maxRows={10}
          style={{
            minHeight: "80px",
            resize: "none",
            overflow: "hidden",
            cursor: "default",
            fontSize: "1rem",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
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
          <Flex>
            <DeepGram onTranscriptionChanged={(text) => setPrompt(text)} />
            <Button
              size={'xs'}
              disabled={prompt.trim().length === 0}
              variant="filled"
              className="bg-[#E25DEE] hover:bg-[#E25DEE]/80"
              onClick={handleSubmit}
              // leftIcon={<IconSend size={"1rem"} />}
            > {'Send'}
              <Flex ml={'xs'} align="center" gap="1px">
                <Kbd size={'xs'} style={{ color: 'purple' }}>⌘</Kbd>{'+'}<Kbd size={"xs"} style={{ color: 'purple' }}>↩</Kbd>
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Paper>
    </Paper>
  );
};

const SelixControlCenter = ({
  setAIType,
  aiType,
  tasks,
  counter,
  messages,
  setMessages,
  setPrompt,
  handleSubmit,
  threads,
  currentSessionId,
}: {
  setAIType: React.Dispatch<React.SetStateAction<string>>;
  aiType: string;
  tasks: any;
  threads: ThreadType[];
  counter: Number;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentSessionId: Number | null;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => void;
}) => {
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const currentThreadMemory = threads.find(
    (thread) => thread.id === currentSessionId
  )?.memory;
  const [availableCitations, setAvailableCitations] = useState<string[]>([]);

  useEffect(() => {
    if (currentThreadMemory?.search) {
      const citations = currentThreadMemory.search.flatMap(
        (searchItem) => searchItem.citations
      );
      if (JSON.stringify(citations) !== JSON.stringify(availableCitations)) {
        setAvailableCitations(citations);
        setSelectedCitation(citations[0]);
      }
    }
  }, [messages.length]);

  return (
    <Paper withBorder shadow="sm" w={"65%"} radius={"md"}>
      <Flex
        px={"md"}
        py={"xs"}
        align={"center"}
        gap={5}
        bg={"#E25DEE"}
        className=" rounded-t-md"
      >
        <IconSparkles size={"1rem"} color="white" />
        <Text fw={600} color="white">
          Selix AI Workspace
        </Text>
      </Flex>
      <Divider bg="gray" />
      <Paper withBorder radius={0} p={"sm"}>
        <SegmentedControl
          value={aiType}
          onChange={(value) => setAIType(value)}
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
            },
          }}
          data={[
            {
              value: "PLANNER",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconList size={"1rem"} />
                  <span>Tasks</span>
                </Center>
              ),
            },
            {
              value: "STRATEGY_CREATOR",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconHammer size={"1rem"} />
                  <span>Blueprint</span>
                </Center>
              ),
            },
            {
              value: "NOT_AVAILABLE2",
              label: (
                <Center
                  style={{ gap: 10, pointerEvents: "none", opacity: 0.5 }}
                >
                  <IconPuzzle size={"1rem"} />
                  <span>Segments</span>
                </Center>
              ),
            },
            {
              value: "NOT_AVAILABLE3",
              label: (
                <Center
                  style={{ gap: 10, pointerEvents: "none", opacity: 0.5 }}
                >
                  <IconParachute size={"1rem"} />
                  <span>Campaigns</span>
                </Center>
              ),
            },
            {
              value: "BROWSER",
              label: (
                <Center style={{ gap: 10 }}>
                  <IconBrowser size={"1rem"} />
                  <span>Browser</span>
                </Center>
              ),
            },
            {
              value: "NOT_AVAILABLE",
              label: (
                <Center
                  style={{ gap: 10, pointerEvents: "none", opacity: 0.5 }}
                >
                  <IconFlask size={"1rem"} />
                  <span>Analytics</span>
                </Center>
              ),
            },
          ]}
        />
      </Paper>
      <ScrollArea bg={"#f7f8fa"} h={"90%"} scrollHideDelay={4000} p={"md"}>
        {aiType === "STRATEGY_CREATOR" ? (
          <SelinStrategy
            counter={counter}
            messages={messages}
            threads={threads}
            currentSessionId={currentSessionId}
            setPrompt={setPrompt}
            handleSubmit={handleSubmit}
          />
        ) : aiType === "PLANNER" ? (
          // passing in messages length to trigger renders
          <PlannerComponent
            counter={counter}
            messagesLength={messages.length}
            threads={threads}
            tasks={tasks}
            currentSessionId={currentSessionId}
          />
        ) : aiType === "segment" ? (
          <Box maw="900px">
            <SegmentV3 />
          </Box>
        ) : aiType === "campaign" ? (
          <Box maw="100%">
            <CampaignLandingV2 />
          </Box>
        ) : aiType === "analytics" ? (
          <Box maw="900px">
            <WhatHappenedLastWeek />
          </Box>
        ) : aiType === "BROWSER" ? (
          <Box maw="100%">
            <Select
              value={selectedCitation}
              data={availableCitations}
              placeholder="Select a citation"
              onChange={(value) => setSelectedCitation(value)}
            />

            <iframe
              src={selectedCitation || undefined}
              style={{
                width: "100%",
                height: "calc(100% - 50px)",
                border: "none",
                position: "absolute",
                top: "50px",
                left: 0,
              }}
            />
          </Box>
        ) : aiType === "NOT_AVAILABLE" ? (
          <Center style={{ height: "100%" }}>
            <Text style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
              Not Currently Available.
            </Text>
          </Center>
        ) : aiType === "NOT_AVAILABLE2" || aiType === "NOT_AVAILABLE3" ? (
          <Center style={{ height: "100%" }}>
            <Text style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
              Not Currently Available.
            </Text>
          </Center>
        ) : (
          <Center style={{ height: "100%" }}>
            <Text style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
              No Tasks Created. Please create one via the chat.
            </Text>
          </Center>
        )}

        {aiType === "STRATEGY_CREATOR" ? (
          <Paper
            withBorder
            bg={"#fffaea"}
            mt={"sm"}
            px={"sm"}
            py={"xs"}
            style={{ borderColor: "#fdb93a" }}
          >
            <Flex align={"center"} gap={"xs"}>
              <IconInfoCircle color="orange" size={"1rem"} />
              <Text size={"xs"} color="orange" fw={600}>
                Disclaimer:{" "}
                <span className="font-medium">
                  Once executed, I will draft the campaign. You can review your
                  campaign prior to any outreach.
                </span>
              </Text>
            </Flex>
          </Paper>
        ) : aiType === "PLANNER" ? (
          <></>
        ) : (
          // <Paper withBorder bg={"#fffaea"} mt={"sm"} px={"sm"} py={"md"} style={{ borderColor: "#fdb93a" }}>
          //   <Flex align={"center"} gap={"xs"} justify={"space-between"}>
          //     <Text size={"sm"} color="orange" fw={600}>
          //       Would you like to confirm the task lis tbefore getting started with Blueprint?
          //     </Text>
          //     <Flex gap={4}>
          //       <Button variant="outline" color="orange" w={100} size="xs">
          //         No
          //       </Button>
          //       <Button variant="filled" color="orange" w={100} size="xs">
          //         Yes
          //       </Button>
          //     </Flex>
          //   </Flex>
          // </Paper>
          <></>
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

// const TimelineComponent = () => {
//   const [scrollPosition, setScrollPosition] = useState(0);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
//     setScrollPosition(event.currentTarget.scrollLeft);
//   };

//   const generateTimelineData = () => {
//     const data = [];
//     for (let hour = 0; hour <= 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 10) {
//         data.push({
//           time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
//           isMainGraduation: minute === 0,
//           label: minute === 0 ? `${hour.toString().padStart(2, "0")}:00` : "",
//         });
//       }
//     }
//     return data;
//   };

//   const timelineData = generateTimelineData();

//   let isDown = false;
//   let startX: number;
//   let scrollLeft: number;

//   useEffect(() => {
//     const handleMouseDown = (e: MouseEvent) => {
//       isDown = true;
//       startX = e.pageX - (containerRef.current?.offsetLeft || 0);
//       scrollLeft = containerRef.current?.scrollLeft || 0;
//     };

//     const handleMouseLeave = () => {
//       isDown = false;
//     };

//     const handleMouseUp = () => {
//       isDown = false;
//     };

//     const handleMouseMove = (e: MouseEvent) => {
//       if (!isDown) return;
//       e.preventDefault();
//       const x = e.pageX - (containerRef.current?.offsetLeft || 0);
//       const walk = (x - startX) * 3;
//       if (containerRef.current) {
//         containerRef.current.scrollLeft = scrollLeft - walk;
//       }
//     };

//     const container = containerRef.current;

//     container?.addEventListener("mousedown", handleMouseDown);
//     container?.addEventListener("mouseleave", handleMouseLeave);
//     container?.addEventListener("mouseup", handleMouseUp);
//     container?.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       container?.removeEventListener("mousedown", handleMouseDown);
//       container?.removeEventListener("mouseleave", handleMouseLeave);
//       container?.removeEventListener("mouseup", handleMouseUp);
//       container?.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   return (
//     <Paper withBorder p="md" mt="md">
//       <Flex align={"center"} justify={"space-between"}>
//         <Flex gap={"sm"}>
//           <ActionIcon size={"sm"} variant="outline" color="gray" radius={"sm"}>
//             <IconChevronLeft />
//           </ActionIcon>
//           <ActionIcon size={"sm"} variant="outline" color="gray" radius={"sm"}>
//             <IconChevronRight />
//           </ActionIcon>
//         </Flex>
//         <Badge variant="outline">Go Live</Badge>
//       </Flex>
//       <div className="relative flex justify-center mt-4">
//         <div className="absolute top-[-15px]">
//           <IconTriangleInverted size={"1rem"} fill="gray" color="white" />
//         </div>
//         <div
//           className="absolute left-0 top-[-10px] h-[50px] w-[120px]"
//           style={{
//             backgroundImage: "linear-gradient(90deg, white, transparent)",
//           }}
//         ></div>
//         <div
//           className="absolute right-0 top-[-10px] h-[50px] w-[120px]"
//           style={{
//             backgroundImage: "linear-gradient(90deg, transparent, white)",
//           }}
//         ></div>
//       </div>
//       <div
//         ref={containerRef}
//         style={{
//           overflowX: "hidden",
//           whiteSpace: "nowrap",
//           paddingBottom: "10px",
//           borderTop: "1px solid #ced4da",
//         }}
//         onScroll={handleScroll}
//         className="mx-4"
//       >
//         <Flex w={"100%"} gap={"sm"}>
//           {timelineData.map((item, index) => {
//             return (
//               <>
//                 {index < timelineData.length - 5 && (
//                   <Flex key={index} direction={"column"} align={"center"} w={item.isMainGraduation ? "2px" : "10px"}>
//                     <div
//                       style={{
//                         height: item.isMainGraduation ? "15px" : "8px",
//                         width: item.isMainGraduation ? "2px" : "1px",
//                         backgroundColor: "#ced4da",
//                       }}
//                       onClick={() => {
//                         const newPosition = index * 25;
//                         containerRef.current?.scrollTo({
//                           left: newPosition,
//                           behavior: "smooth",
//                         });
//                       }}
//                     />
//                     {item.label && (
//                       <Text size="xs" color="dimmed" ml={index === 0 ? "45px" : ""} mr={index === timelineData.length - 6 ? "46px" : ""}>
//                         {item.label}
//                       </Text>
//                     )}
//                   </Flex>
//                 )}
//               </>
//             );
//           })}
//         </Flex>
//       </div>
//     </Paper>
//   );
// };

const PlannerComponent = ({
  threads,
  counter,
  currentSessionId,
  messagesLength,
  tasks,
}: {
  threads: ThreadType[];
  currentSessionId: Number | null;
  messagesLength: number;
  tasks: any;
  counter: Number;
}) => {
  const [opened, { toggle }] = useDisclosure(true);
  const [openedTaskIndex, setOpenedTaskIndex] = useState<number | null>(null);

  return (
    <Paper p={"sm"} withBorder radius={"sm"}>
      <Flex w={"100%"} align={"center"} gap={"xs"}>
        {/* <Divider label="Next in line" labelPosition="left" w={"100%"} color="gray" fw={500} />
        <ActionIcon onClick={toggle}>{opened ? <IconChevronUp size={"1rem"} /> : <IconChevronDown size={"1rem"} />}</ActionIcon> */}
      </Flex>
      <Paper
        withBorder
        bg={"#fefafe"}
        my={"sm"}
        px={"sm"}
        py={8}
        style={{ borderColor: "#fadafc" }}
      >
        <Flex align={"center"} gap={"xs"} justify={"space-between"}>
          <Text size={"xs"} color="#E25DEE" fw={600}>
            Selix Work Planner:{" "}
            <span className="font-medium text-gray-500">
              This is work that I will be executing on. I'll ask you if anything
              comes up.
            </span>
          </Text>
          <Flex gap={5} align={"center"}>
            <Divider orientation="vertical" color={"#fceafe"} />
            <Text size={"xs"} className="text-gray-500">
              Estimated time left:
            </Text>
            <ThemeIcon bg="#fceafe" variant="light" className="text-[#E25DEE]">
              --
            </ThemeIcon>
            <Text color="#E25DEE">:</Text>
            <ThemeIcon bg="#fceafe" variant="light" className="text-[#E25DEE]">
              --
            </ThemeIcon>
            <Text size={"xs"} className="text-gray-500">
              min
            </Text>
          </Flex>
        </Flex>
      </Paper>
      <Collapse in={opened}>
      <ScrollArea h={"55vh"} scrollHideDelay={4000} style={{ overflow: 'hidden' }}>
        {tasks
        // filter out duplicate tasks by title. This is a temporary fix
          ?.filter((task: { title: any }, index: number, self: any) => 
            task.title && self.findIndex((t: { title: any }) => t.title === task.title) === index
          )
          .map((task: TaskType, index: number) => {
            const SelixSessionTaskStatus = {
              QUEUED: "QUEUED",
              IN_PROGRESS: "IN_PROGRESS",
              IN_PROGRESS_REVIEW_NEEDED: "IN_PROGRESS_REVIEW_NEEDED",
              COMPLETE: "COMPLETE",
              CANCELLED: "CANCELLED",
              BLOCKED: "BLOCKED",
            };

            const statusColors = {
              [SelixSessionTaskStatus.QUEUED]: "blue",
              [SelixSessionTaskStatus.IN_PROGRESS]: "orange",
              [SelixSessionTaskStatus.IN_PROGRESS_REVIEW_NEEDED]: "orange",
              [SelixSessionTaskStatus.COMPLETE]: "green",
              [SelixSessionTaskStatus.CANCELLED]: "red",
              [SelixSessionTaskStatus.BLOCKED]: "gray",
            };

            const humanReadableStatus = {
              [SelixSessionTaskStatus.QUEUED]: "Queued",
              [SelixSessionTaskStatus.IN_PROGRESS]: "In Progress",
              [SelixSessionTaskStatus.IN_PROGRESS_REVIEW_NEEDED]:
                "In Progress",
              [SelixSessionTaskStatus.COMPLETE]: "Complete",
              [SelixSessionTaskStatus.CANCELLED]: "Cancelled",
              [SelixSessionTaskStatus.BLOCKED]: "Blocked",
            };

            return (
              <Paper withBorder p={"sm"} key={index} mb={"xs"} radius={"md"}>
                <Flex justify={"space-between"} align={"center"} p={"sm"}>
                  <Text
                    className="flex gap-1 items-center"
                    fw={600}
                    size={"md"}
                    style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)" }}
                  >
                    <ThemeIcon
                      color="gray"
                      radius={"xl"}
                      variant="light"
                      size={18}
                    >
                      {index + 1}
                    </ThemeIcon>
                    {task.title}
                  </Text>
                  <Flex align={"center"} gap={"xs"}>
                    <Text color="gray" size={"sm"} fw={500}>
                      {moment(task.created_at).fromNow()}
                    </Text>
                    <Flex align={"center"} gap={"xs"}>
                      <ThemeIcon
                        color={statusColors[task.status]}
                        radius={"xl"}
                        size={10}
                      >
                        <span />
                      </ThemeIcon>
                      <Text
                        color={statusColors[task.status]}
                        size={"sm"}
                        fw={500}
                      >
                        {humanReadableStatus[task.status]}
                      </Text>
                    </Flex>

                    <ActionIcon
                      onClick={() =>
                        setOpenedTaskIndex(
                          openedTaskIndex === index ? null : index
                        )
                      }
                    >
                      {openedTaskIndex === index ? (
                        <IconChevronUp size={"1rem"} />
                      ) : (
                        <IconChevronDown size={"1rem"} />
                      )}
                    </ActionIcon>
                  </Flex>
                </Flex>
                <Collapse in={openedTaskIndex === index}>
                  <Text p={'sm'} mt={"sm"}>{task.description}</Text>
                  {task.proof_of_work_img && (
                  <img
                    src={task.proof_of_work_img}
                    alt="Proof of Work"
                    width={'100%'}
                    height={'100%'}
                    style={{ marginTop: "10px" }}
                  />
                )}
                </Collapse>
              </Paper>
            );
          })}
        </ScrollArea>
      </Collapse>
    </Paper>
  );
};

const SelinStrategy = ({
  messages,
  counter,
  setPrompt,
  handleSubmit,
  threads,
  currentSessionId,
}: {
  messages: any[];
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: () => void;
  threads: ThreadType[];
  currentSessionId: Number | null;
  counter: Number;
}) => {
  const memory = threads.find((thread) => thread.id === currentSessionId)
    ?.memory;

  const hackedSubmit = () => {
    console.log("hacked submit");
    setPrompt("Let's do it.");
    setTimeout(() => {
      handleSubmit();
    }, 500);
  };

  // console.log('memory is', memory);
  const userToken = useRecoilValue(userTokenState);

  const { getStrategy, patchUpdateStrategy } = useStrategiesApi(userToken);

  const [strategy, setStrategy] = useState<
    | {
        client_archetype_mappings: any[];
        client_id: number;
        created_by: number;
        description: string;
        end_date: string;
        id: number;
        start_date: string;
        status: string;
        tagged_campaigns: any | null;
        title: string;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    if (memory?.strategy_id) {
      getStrategy(memory.strategy_id)
        .then((res) => {
          console.log(res);
          setStrategy(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [messages.length]);

  return (
    <Paper withBorder radius={"sm"}>
      <Flex bg={"#1E90FF"} p={"sm"}>
        <Text tt={"uppercase"} fw={600} color="white">
          Blueprint:{" "}
          <span className="text-gray-200">
            {strategy?.title.replace(/['"]/g, "")}
          </span>
        </Text>
      </Flex>
      <Stack p={"sm"}>
        <Paper
          withBorder
          bg={"#F0FFF0"}
          px={"sm"}
          py={"xs"}
          style={{ borderColor: "#32CD32" }}
        >
          <Flex align={"center"} gap={"xs"}>
            <IconInfoCircle color="green" size={"1rem"} />
            <Text size={"sm"} color="#228B22" fw={600}>
              This blueprint summarizes the angle for your campaign.
            </Text>
          </Flex>
        </Paper>
        <ScrollArea h={"34vh"} p={"sm"} my={"sm"}>
        <Flex>
          <Text color="gray" fw={500} w={160} size={"xs"}>
            Strategy Name:
          </Text>
          <Text fw={500} size={"xs"}>
            {strategy?.title.replace(/['"]/g, "")}
          </Text>
        </Flex>
        <Flex>
          <div className="w-[160px]">
            <Text color="gray" fw={500} w={160} size={"xs"}>
              Description:
            </Text>
          </div>
          <Stack spacing={"sm"}>
            <Box>
              <Text fw={600} size={"xs"}>
  
              </Text>
              <Text fw={500} size={"xs"}>
                <Text
                  fw={500}
                  size={"xs"}
                  dangerouslySetInnerHTML={{
                    __html: strategy?.description || "",
                  }}
                />
              </Text>
            </Box>
            <Box>
              {/* <Text fw={600} size={"xs"}>
                Angle:
              </Text>
              <Text fw={500} size={"xs"}>
                {
                  "The main approach for this campaign is to leverage the MachineCon conference to establish initial contact with prospects and discuss potential collaboration opportunites. The focus will be on inviting them to our booth for a personal chat."
                }
              </Text> */}
              {/* <Box>
                <Text fw={600} size={"xs"}>
                  Prospects:
                </Text>
                <Text fw={500} size={"xs"}>
                  {"We will target professionals attending MachineCon, particularly those with titles such as,"}
                </Text>
              </Box> */}
            </Box>
          </Stack>
        </Flex>
        <Flex>
          <div className="w-[160px]">
            <Text size={"xs"} color="gray" fw={500} w={160}>
              Attached Campaigns:
            </Text>
          </div>
          {strategy?.tagged_campaigns &&
          strategy.tagged_campaigns.length > 0 ? (
            strategy.tagged_campaigns.map((campaign: number, index: number) => (
              <Badge key={index} color="green">
                {campaign.toString()}
              </Badge>
            ))
          ) : (
            <Badge color="gray">None</Badge>
          )}
        </Flex>
        <Flex>
          <div className="w-[160px]">
            <Text color="gray" fw={500} w={160} size={"xs"}>
              Time Frame:
            </Text>
          </div>
          <Text size={"xs"} color="blue" fw={600}>
            {strategy?.start_date
              ? moment(strategy.start_date).format("MMMM Do, YYYY")
              : "N/A"}{" "}
            -{" "}
            {strategy?.end_date
              ? moment(strategy.end_date).format("MMMM Do, YYYY")
              : "N/A"}
          </Text>
        </Flex>
        </ScrollArea>
        <Flex align={"center"} gap={"md"}>
          <Button
            variant="outline"
            color="gray"
            fullWidth
            onClick={() => {
              if (!memory?.strategy_id) {
                return;
              }
              openContextModal({
                modal: "editStrategy",
                title: (
                  <Flex align={"center"} gap={"sm"}>
                    <IconBulb color="#228be6" size={"1.6rem"} />
                    <Title order={2}>Edit Strategy</Title>
                  </Flex>
                ),
                styles: {
                  content: {
                    minWidth: "70%",
                  },
                },
                innerProps: {
                  title: strategy?.title,
                  description: strategy?.description,
                  archetypes: [],
                  status: strategy?.status,
                  startDate: strategy?.start_date
                    ? new Date(strategy.start_date)
                    : null,
                  endDate: strategy?.end_date
                    ? new Date(strategy.end_date)
                    : null,
                  onSubmit: async (
                    title: string,
                    description: string,
                    archetypes: number[],
                    status: string,
                    startDate: Date,
                    endDate: Date
                  ) => {
                    const response = await patchUpdateStrategy(
                      memory?.strategy_id || -1,
                      title,
                      description,
                      archetypes,
                      status,
                      startDate,
                      endDate
                    );
                    //yolo
                    const updatedStrategy = await getStrategy(
                      memory?.strategy_id || -1
                    );
                    setStrategy(updatedStrategy);
                    showNotification({
                      title: "Success",
                      message: "Strategy updated successfully",
                      color: "green",
                    });
                  },
                },
              });
            }}
          >
            Edit
          </Button>
          <Button
            fullWidth
            onClick={() => {
              if (!memory?.strategy_id) {
                return;
              }
              hackedSubmit();
            }}
          >
            Create Campaign
          </Button>
        </Flex>
      </Stack>
    </Paper>
  );
};
