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
} from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconFile,
  IconFilter,
  IconLink,
  IconLoader,
  IconPlus,
  IconSend,
  IconTrash,
} from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import moment from "moment";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRecoilValue } from "recoil";
import Tour from "reactour";

import Logo from "../../../assets/images/logo.png";
import { DataGrid } from "mantine-data-grid";
import { API_URL } from "@constants/data";
import { closeAllModals, closeModal, openContextModal } from "@mantine/modals";
import { set } from "lodash";
import DeepGram from "@common/DeepGram";

export default function SellScaleAssistant({
  setHasNotGeneratedPrefilter,
  showChat = true,
  refresh = false,
  onEditClicked = () => {},
  onEditClosed = () => {},
}: {
  setHasNotGeneratedPrefilter?: (value: boolean) => void;
  showChat?: boolean;
  refresh?: boolean;
  onEditClicked?: () => void;
  onEditClosed?: () => void;
}) {
  useEffect(() => {
    const tourSeen = localStorage.getItem("filterTourSeen");
    if (!tourSeen) {
      setIsTourOpen(true);
    }
  }, []);

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [editTourOpen, setEditTourOpen] = useState(false);

  const editTourSteps = [
    {
      selector: '[data-tour="edit-tutorial"]',
      content:
        "Edit the customer details in this table to better define your Total Addressable Market (TAM). Click the edit button to refine your filters.",
    },
  ];

  const handleShowEditTour = () => {
    const editTourSeen = localStorage.getItem("editTourSeen");
    if (!editTourSeen) {
      setEditTourOpen(true);
    }
  };

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("filterTourSeen", "true");
  };

  const closeEditTour = () => {
    setEditTourOpen(false);
    localStorage.setItem("editTourSeen", "true");
  };

  const [segment, setSegment] = useState([]);

  return (
    <Box>
      <Flex mt={"md"} gap={"xl"}>
        {!window.location.href.includes("selix") && (
          <>
            <Tour
              steps={editTourSteps}
              isOpen={editTourOpen}
              onRequestClose={closeEditTour}
            />
            <Tour
              steps={steps}
              isOpen={isTourOpen}
              onRequestClose={closeTour}
            />
          </>
        )}
        {showChat && (
          <SegmentChat
            setHasNotGeneratedPrefilter={setHasNotGeneratedPrefilter}
            setSegment={setSegment}
            segment={segment}
            handleShowEditTour={handleShowEditTour}
          />
        )}
        <SegmentAIGeneration
          setHasNotGeneratedPrefilter={setHasNotGeneratedPrefilter}
          setSegment={setSegment}
          segment={segment}
          showChat={showChat}
          refresh={refresh}
          onEditClicked={onEditClicked}
          onEditClosed={onEditClosed}
        />
      </Flex>
    </Box>
  );
}

const steps = [
  {
    selector: '[data-tour="segment-tutorial"]',
    content: "Let's get some details about your target audience.",
  },
  {
    selector: '[data-tour="chat-tutorial"]',
    content: "Describe your target audience to help us understand them better.",
  },
];

const SegmentChat = (props: any) => {
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [recording, setRecording] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [chatContent, setChatContent] = useState<any>([
    {
      sender: "chatbot",
      query:
        "Hey there! I'm SellScale AI, your friendly chatbot for creating sales segments.",
      created_at: moment().format("MMMM D, h:mm a"),
    },
    {
      sender: "chatbot",
      query:
        "To get started, tell me a bit about your business or who you're targeting.",
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

      props.setHasNotGeneratedPrefilter(false);

      props.handleShowEditTour();
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, [chatContent]);

  return (
    <Paper withBorder shadow="sm" radius={"md"} w={"35%"}>
      <Flex p={"md"} align={"center"} gap={5}>
        <IconSparkles size={"1rem"} color="#be4bdb" />
        <Text fw={600}>Chat with Selix</Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={375} viewportRef={viewport} scrollHideDelay={4000}>
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
                      item.query
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
        data-tour="chat-tutorial"
        p={"sm"}
        withBorder
        radius={"md"}
        className="bg-[#f7f8fa]"
        my={"lg"}
        mx={"md"}
      >
        <Textarea
          value={prompt}
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            handleKeyDown(e);
            if (viewport.current) {
              viewport.current.scrollTo({
                top: viewport.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (viewport.current) {
              viewport.current.scrollTo({
                top: viewport.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
          variant="unstyled"
          autoFocus
        />
        <Flex mt={"sm"} align="right">
          <Flex gap={"sm"}>
            {/* <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconPlus size={"1rem"} />
            </ActionIcon> */}
            {/* <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconLink size={"1rem"} />
            </ActionIcon> */}
          </Flex>
          <Flex ml={"auto"}>
            <DeepGram
              recording={recording}
              setRecording={setRecording}
              onTranscriptionChanged={(transcription: string) => {
                console.log("transcription", transcription);
                setPrompt((prevPrompt) => prevPrompt + transcription);
              }}
              showPopup={false}
            />
            <Button
              size="xs"
              color="grape"
              rightIcon={<IconSend size={"1rem"} />}
              onClick={handleSubmit}
            >
              Ask AI
            </Button>
          </Flex>
        </Flex>
      </Paper>
    </Paper>
  );
};

const SegmentAIGeneration = (props: any) => {
  const [active, setActive] = useState(1);
  const showChat = props.showChat;
  const [assets, setAssets] = useState([
    "Important-sales-asset.pdf",
    "extra-asset-1.pdf",
  ]);
  const [generatingFilters, setGeneratingFilters] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number>(0);
  const userToken = useRecoilValue(userTokenState);

  const refresh = props.refresh;

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
        if (formattedPrefilters.length > 0) {
          props.setHasNotGeneratedPrefilter(false);
        }
      } else {
        console.error("Failed to fetch saved queries:", data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    }
  };

  useEffect(() => {
    fetchSavedQueries();
  }, [userToken, refresh]);

  return (
    <Paper withBorder w={"100%"} radius={"md"}>
      {showChat && (
        <Flex
          p={"md"}
          align={"center"}
          gap={5}
          bg={"grape"}
          className=" rounded-t-md"
        >
          <IconSparkles size={"1rem"} color="white" />
          <Text fw={600} color="white">
            Selix AI Workspace
          </Text>
        </Flex>
      )}
      <Divider bg="gray" />
      <ScrollArea h={500} scrollHideDelay={4000} px={"md"}>
        <Timeline
          mt={"md"}
          color="grape"
          active={1}
          lineWidth={2}
          bulletSize={24}
          styles={{
            itemBody: {
              paddingTop: "3px",
              paddingLeft: "8px",
            },
            itemContent: {
              paddingTop: "6px",
            },
            itemBullet: {
              fontSize: "12px",
              border: "none",
              backgroundColor: "transparent",
              "&[data-with-child]": {
                backgroundColor: "white",
              },
              "&[data-line-active]": {
                borderStyle: "dashed",
                borderLeftColor: "orange",
              },
              "::before": {
                borderStyle: "dashed",
                borderLeftColor: "orange",
              },
            },
          }}
        >
          <Timeline.Item
            lineActive={active === 2 ? true : false}
            bullet={
              active === 2 ? (
                <IconCheck size={"1rem"} />
              ) : (
                <IconLoader size={"1rem"} color="orange" />
              )
            }
            title={!showChat ? "" : "Generated Segments"}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead style={{ backgroundColor: "#f7f8fa", textAlign: "left" }}>
                <tr>
                  <th style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                    Segment Name
                  </th>
                  <th style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                    Segment Description
                  </th>
                  <th style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                    Value Proposition
                  </th>
                  {(props.segment?.length > 0 || prefilters?.length > 0) && (
                    <th style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                      Filter
                    </th>
                  )}
                </tr>
              </thead>
              <tbody style={{ backgroundColor: "white" }}>
                {props.segment?.map(
                  (
                    element: {
                      total_entries: any;
                      id: any;
                      makers:
                        | string
                        | number
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | null
                        | undefined;
                      industry:
                        | string
                        | number
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | null
                        | undefined;
                      pain_point:
                        | string
                        | number
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | null
                        | undefined;
                    },
                    index: number
                  ) => (
                    <tr data-tour="edit-tutorial" key={index}>
                      <td
                        style={{ border: "1px solid #e7ebef", padding: "8px" }}
                      >
                        <div>
                          <Badge color="green" variant="filled" mb={4}>
                            New
                          </Badge>
                          <div
                            contentEditable="true"
                            style={{ whiteSpace: "pre-wrap" }}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              updateSegment(
                                index as number,
                                "segment_name",
                                e.target.innerText
                              )
                            }
                          >
                            {element.makers}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{ border: "1px solid #e7ebef", padding: "8px" }}
                      >
                        <div
                          contentEditable="true"
                          style={{ whiteSpace: "pre-wrap" }}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            updateSegment(
                              index as number,
                              "segment_description",
                              e.target.innerText
                            )
                          }
                        >
                          {element.industry}
                        </div>
                      </td>
                      <td
                        style={{ border: "1px solid #e7ebef", padding: "8px" }}
                      >
                        <div
                          contentEditable="true"
                          style={{ whiteSpace: "pre-wrap" }}
                          suppressContentEditableWarning={true}
                          onBlur={(e) =>
                            updateSegment(
                              index as number,
                              "value_proposition",
                              e.target.innerText
                            )
                          }
                        >
                          {element.pain_point}
                        </div>
                      </td>
                      <td
                        style={{ border: "1px solid #e7ebef", padding: "8px" }}
                      >
                        <Flex align="center" gap="sm">
                          <Button
                            loading={
                              generatingFilters && loadingIndex === index
                            }
                            color="grape"
                            onClick={async () => {
                              setLoadingIndex(index);
                              setGeneratingFilters(true);
                              try {
                                // const response = await fetch(`${API_URL}/contacts/magic_apollo_search`, {
                                //   method: 'POST',
                                //   headers: {
                                //     'Content-Type': 'application/json',
                                //     'Authorization': `Bearer ${userToken}`,
                                //   },
                                //   body: JSON.stringify({
                                //     query: `I have an idea for the segment: ${element.makers}. This segment is about ${element.industry}. The value proposition is ${element.pain_point}.`
                                //   }),
                                // });

                                openContextModal({
                                  modal: "prefilterEditModal",
                                  title: (
                                    <Title
                                      order={3}
                                      className="flex items-center gap-2"
                                    >
                                      <IconFilter
                                        size={"1.5rem"}
                                        color="#228be6"
                                      />{" "}
                                      Edit Pre-Filter
                                    </Title>
                                  ),
                                  onClose: () => {
                                    props.setSegment([]);
                                    fetchSavedQueries();
                                    props.onEditClosed();
                                  },
                                  innerProps: { id: element.id },
                                  centered: true,
                                  styles: {
                                    content: {
                                      minWidth: "80%",
                                    },
                                  },
                                });
                              } catch (error) {
                                console.error("Error:", error);
                              }
                              setGeneratingFilters(false);
                            }}
                          >
                            Edit
                          </Button>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            radius={"xl"}
                            size={"sm"}
                            onClick={() => {
                              props.setSegment((prevPrefilters: any) =>
                                prevPrefilters.filter(
                                  (filter: any) => filter.id !== element.id
                                )
                              );
                              fetch(`${API_URL}/apollo/${element.id}`, {
                                method: "DELETE",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${userToken}`,
                                },
                              });
                            }}
                          >
                            <IconTrash size={"1rem"} />
                          </ActionIcon>
                        </Flex>

                        <Badge mt="sm" color="blue" variant="light">
                          {element.total_entries?.toLocaleString() || 0}
                        </Badge>
                        <Text size="xs" color="blue">
                          prospects
                        </Text>
                      </td>
                    </tr>
                  )
                )}
                {prefilters?.map((element: any, index: number) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                      <div
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          updateExistingSegment(
                            index as number,
                            "custom_name",
                            e.target.innerText
                          )
                        }
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {element.custom_name}
                      </div>
                    </td>
                    <td style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                      <div
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          updateExistingSegment(
                            index as number,
                            "segment_description",
                            e.target.innerText
                          )
                        }
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {element.segment_description}
                      </div>
                    </td>
                    <td style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                      <div
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) =>
                          updateExistingSegment(
                            index as number,
                            "value_proposition",
                            e.target.innerText
                          )
                        }
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {element.value_proposition}
                      </div>
                    </td>
                    <td style={{ border: "1px solid #e7ebef", padding: "8px" }}>
                      <Flex align="center" gap="sm">
                        <Button
                          loading={generatingFilters && loadingIndex === index}
                          color="grape"
                          onClick={async () => {
                            setLoadingIndex(index);
                            setGeneratingFilters(true);
                            try {
                              // const response = await fetch(`${API_URL}/contacts/magic_apollo_search`, {
                              //   method: 'POST',
                              //   headers: {
                              //     'Content-Type': 'application/json',
                              //     'Authorization': `Bearer ${userToken}`,
                              //   },
                              //   body: JSON.stringify({
                              //     query: `I have an idea for the segment: ${element.makers}. This segment is about ${element.industry}. The value proposition is ${element.pain_point}.`
                              //   }),
                              // });
                              props.onEditClicked();

                              openContextModal({
                                modal: "prefilterEditModal",
                                title: (
                                  <Title
                                    order={3}
                                    className="flex items-center gap-2"
                                  >
                                    <IconFilter
                                      size={"1.5rem"}
                                      color="#228be6"
                                    />{" "}
                                    Edit Pre-Filter
                                  </Title>
                                ),
                                onClose: () => {
                                  props.setSegment([]);
                                  props.onEditClosed();
                                  fetchSavedQueries();
                                },
                                innerProps: { id: element.id },
                                centered: true,
                                styles: {
                                  content: {
                                    minWidth: "80%",
                                  },
                                },
                              });
                            } catch (error) {
                              console.error("Error:", error);
                            }
                            setGeneratingFilters(false);
                          }}
                        >
                          Edit
                        </Button>
                        <ActionIcon
                          variant="outline"
                          color="red"
                          radius={"xl"}
                          size={"sm"}
                          onClick={() => {
                            setPrefilters((prevPrefilters: any) =>
                              prevPrefilters.filter(
                                (filter: any) => filter.id !== element.id
                              )
                            );
                            fetch(`${API_URL}/apollo/${element.id}`, {
                              method: "DELETE",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${userToken}`,
                              },
                            });
                          }}
                        >
                          <IconTrash size={"1rem"} />
                        </ActionIcon>
                      </Flex>
                      <Badge mt="sm" color="blue" variant="light">
                        {element.num_results?.toLocaleString() || 0}
                      </Badge>
                      <Text size="xs" color="blue">
                        prospects
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Timeline.Item>

          {/* <Timeline.Item
            bullet={active === 3 ? <IconCheck size={"1rem"} /> : <IconLoader size={"1rem"} color="orange" />}
            title="Importing Selected Segments as Assets"
          >
            <Button color="grape" size="sm">
              Create Sequence
            </Button>
          </Timeline.Item> */}
        </Timeline>
      </ScrollArea>
    </Paper>
  );
};
