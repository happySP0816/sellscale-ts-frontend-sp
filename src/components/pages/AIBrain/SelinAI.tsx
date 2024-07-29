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
  Stepper,
  Switch,
  Text,
  TextInput,
  Textarea,
  Timeline,
  Badge,
  Table,
  Title,
  SegmentedControl,
  Center,
  Collapse,
  ThemeIcon,
  Image,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconClock,
  IconFile,
  IconFilter,
  IconLink,
  IconLoader,
  IconPlus,
  IconPoint,
  IconSend,
  IconTrash,
} from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import moment from "moment";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import Logo from "../../../assets/images/logo.png";
import { DataGrid } from "mantine-data-grid";
import { API_URL, SITE_NAME } from "@constants/data";
import { openContextModal } from "@mantine/modals";
import { set } from "lodash";
import { useDisclosure } from "@mantine/hooks";

export default function SelinAI() {
  const [history, setHistory] = useState([
    { title: "Early Stage SaaS founders in NYC", time: "1 hr ago" },
    { title: "AI companies in bay area", time: "yesterday" },
    { title: "Fintech SaaS Companies", time: "2 days ago" },
  ]);

  const [segment, setSegment] = useState([]);
  const [opened, { toggle }] = useDisclosure(false);

  const [chats, setChats] = useState([
    {
      status: "Live",
      title: "Create New Campaign: Confernence Vegas",
      time_remaining: "27 minutes",
    },
    {
      status: "Live",
      title: "Create New Segment",
      time_remaining: "31 minutes",
    },
    {
      status: "Completed",
      title: "Create New Segment",
      time_remaining: "7 minutes",
    },
    {
      status: "Completed",
      title: "Create New Segment",
      time_remaining: "7 minutes",
    },
  ]);

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
    <Box>
      <Paper withBorder shadow="md" radius={"sm"} p={"sm"}>
        <Flex align={"center"} justify={"space-between"} onClick={toggle} className="hover:cursor-pointer">
          <Text fw={600}>{chats.length} other active tasks</Text>
          {opened ? <IconChevronUp size={"1rem"} /> : <IconChevronDown size={"1rem"} />}
        </Flex>
        <Collapse in={opened}>
          <Flex mt={"md"} gap={"sm"}>
            <Paper
              radius={"sm"}
              p={"sm"}
              bg={"#fcecfe"}
              miw={120}
              className="flex flex-col items-center justify-center hover:cursor-pointer"
              onClick={() => console.log("New Chat----")}
            >
              <IconPlus color="#df77f5" />
              <Text fw={700} size={"md"} mt={"xs"} color="#df77f5">
                New Chat
              </Text>
            </Paper>
            <Flex align={"center"} gap={"sm"} ref={containerRef} style={{ overflow: "hidden" }}>
              {chats.map((item, index) => {
                return (
                  <Paper withBorder radius={"sm"} p={"sm"} miw={400}>
                    <Flex align={"center"} gap={"sm"}>
                      {item.status === "Live" ? (
                        <ThemeIcon color="green" radius={"xl"} size={"xs"} p={0} variant="light">
                          <IconPoint fill="green" color="white" size={"4rem"} />
                        </ThemeIcon>
                      ) : item.status === "Completed" ? (
                        <IconCircleCheck size={"1rem"} fill="green" color="white" />
                      ) : (
                        <></>
                      )}{" "}
                      <Text color="green" fw={600}>
                        {item.status}
                      </Text>
                    </Flex>
                    <Text fw={600}>{item.title}</Text>
                    <Text color="gray">Time Remaining: {item.time_remaining}</Text>
                  </Paper>
                );
              })}
            </Flex>
          </Flex>
        </Collapse>
      </Paper>
      <Flex mt={"md"} gap={"xl"}>
        <SegmentChat setSegment={setSegment} segment={segment} />
        <SegmentAIGeneration setSegment={setSegment} segment={segment} />
      </Flex>
    </Box>
  );
}

const SegmentChat = (props: any) => {
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [chatContent, setChatContent] = useState<any>([
    {
      sender: "chatbot",
      query:
        "Hey there! I'm SellScale AI, your friendly chatbot for creating sales segments. To get started, tell me a bit about your business or who you're targeting.",
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
      setChatContent((chatContent: any) => chatContent.map((message: any) => (message.id === loadingMessage.id ? chatbotMessage : message)));
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

  return (
    <Paper withBorder shadow="sm" radius={"md"} w={"35%"}>
      <Flex p={"md"} align={"center"} gap={5}>
        <IconSparkles size={"1rem"} color="#be4bdb" />
        <Text fw={600}>Generation Assistant</Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={375} viewportRef={viewport} scrollHideDelay={4000}>
        <Flex direction={"column"} gap={"sm"} p={"md"} h={"100%"} className=" overflow-auto">
          {chatContent.map((item: any, index: number) => {
            return (
              <Flex direction={"column"} w={"80%"} gap={4} key={index} ml={item.sender === "user" ? "auto" : "0"}>
                <Flex gap={4} align={"center"}>
                  <Avatar src={item.sender === "user" ? userData.img_url : Logo} size={"xs"} radius={"xl"} />
                  <Text fw={600} size={"xs"}>
                    {item.sender === "user" ? userData.sdr_name : "SellScale AI"}
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
                <Flex className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none" px={"sm"} py={7}>
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
                              Perfect! Here's how I will proceed on executing on this strategy.
                            </Text>
                            {chat2.map((subItem, subIndex) => {
                              return (
                                <Paper key={subIndex} bg={"#f9fbfe"} withBorder radius={"sm"} p={"sm"}>
                                  <Flex align={"start"} gap={"sm"}>
                                    <Box>
                                      <IconCircleCheck fill={subItem.status ? "#228be6" : "gray"} color={"white"} />
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
                              I will let you know once the campaign is ready to lanuch!
                            </Text>
                          </Flex>
                        )}
                      </>
                    )}
                  </Text>
                </Flex>
                <Text color="gray" size={"xs"} ml={item.sender === "user" ? "auto" : "0"}>
                  {item.created_at}
                </Text>
              </Flex>
            );
          })}
          {/* {loading && <Loader color="blue" type="dots" />} */}
        </Flex>
      </ScrollArea>
      <Paper p={"sm"} withBorder radius={"md"} className="bg-[#f7f8fa]" my={"lg"} mx={"md"}>
        <TextInput
          multiple
          value={prompt}
          placeholder="Type '/' for command"
          onKeyDown={handleKeyDown}
          onChange={(e) => setPrompt(e.target.value)}
          variant="unstyled"
        />
        <Flex justify={"space-between"} mt={"sm"} align={"center"}>
          <Flex gap={"sm"}>
            <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconPlus size={"1rem"} />
            </ActionIcon>
            <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconLink size={"1rem"} />
            </ActionIcon>
          </Flex>
          <Button size="xs" color="grape" rightIcon={<IconSend size={"1rem"} />} onClick={handleSubmit}>
            Ask AI
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

  const [aiType, setAIType] = useState("browser");

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

  const fetchSavedQueries = async () => {
    try {
      const response = await fetch(`${API_URL}/apollo/get_all_saved_queries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        const formattedPrefilters = data.data.map((query: any) => ({
          ...query,
        }));
        setPrefilters(formattedPrefilters);
      } else {
        console.error("Failed to fetch saved queries:", data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    }
  };

  useEffect(() => {
    fetchSavedQueries();
  }, [userToken]);

  return (
    <Paper withBorder shadow="sm" w={"65%"} radius={"md"}>
      <Flex p={"md"} align={"center"} gap={5} bg={"grape"} className=" rounded-t-md">
        <IconSparkles size={"1rem"} color="white" />
        <Text fw={600} color="white">
          AI Generation
        </Text>
      </Flex>
      <Divider bg="gray" />
      <Paper withBorder radius={0} p={"sm"}>
        <SegmentedControl
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
              value: "browser",
              label: (
                <Center style={{ gap: 10 }}>
                  {aiType === "browser" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Browser</span>
                </Center>
              ),
            },
            {
              value: "segment",
              label: (
                <Center style={{ gap: 10 }}>
                  {aiType === "segment" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Segments</span>
                </Center>
              ),
            },
            {
              value: "campaign",
              label: (
                <Center style={{ gap: 10 }}>
                  {aiType === "campaign" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Campaigns</span>
                </Center>
              ),
            },
            {
              value: "analytics",
              label: (
                <Center style={{ gap: 10 }}>
                  {aiType === "analytics" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Analytics</span>
                </Center>
              ),
            },
            {
              value: "planner",
              label: (
                <Center style={{ gap: 10 }}>
                  {aiType === "planner" && <Avatar src={Logo} size={"xs"} radius={"xl"} />}
                  <span>Planner/Logs</span>
                </Center>
              ),
            },
          ]}
        />
      </Paper>
      <ScrollArea h={500} scrollHideDelay={4000} px={"md"}>
        {aiType === "browser" ? (
          <Text>This is Broswer AI Generation Component</Text>
        ) : aiType === "segment" ? (
          <Text>This is Segment AI Generation Component</Text>
        ) : aiType === "campaign" ? (
          <Text>This is Campaign AI Generation Component</Text>
        ) : aiType === "analytics" ? (
          <Text>This is Analytics AI Generation Component</Text>
        ) : (
          <Text>This is Planner/logs AI Generation Component</Text>
        )}
      </ScrollArea>
      <Paper withBorder bg={"#fffcf5"} radius={"sm"} p={"sm"} style={{ borderColor: "#fab005" }}>
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
    </Paper>
  );
};
