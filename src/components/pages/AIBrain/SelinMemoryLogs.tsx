import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
import {
  Drawer,
  Button,
  Flex,
  Box,
  Textarea,
  Text,
  ThemeIcon,
  Avatar,
  Timeline,
  Title,
  Divider,
  Card,
  TextInput,
  Select,
  Badge,
  Tooltip,
  Loader,
  HoverCard,
  LoadingOverlay,
  ActionIcon,
  Modal,
  Accordion,
  Portal,
  Switch,
} from "@mantine/core";
import {
  IconHistory,
  IconArrowBack,
  IconCheck,
  IconX,
  IconSunElectricity,
  IconTrash,
} from "@tabler/icons-react";
import {
  IconBolt,
  IconBrandSlack,
  IconCircleCheck,
  IconClick,
  IconClipboard,
  IconEye,
  IconMailForward,
  IconMessage,
  IconPencil,
  IconRecordMail,
  IconRefresh,
  IconRobot,
  IconMessages,
} from "@tabler/icons";
import moment from "moment-timezone";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { deterministicMantineColor } from "@utils/requests/utils";
import { showNotification } from "@mantine/notifications";
import { socket } from "../../../components/App";
import { ThreadType } from "./SelinAI";
import { useQuery } from "@tanstack/react-query";
import { ex } from "@fullcalendar/core/internal-common";
import { isHtmlElement } from "react-router-dom/dist/dom";

export interface MemoryLog {
  id: number;
  created_date: string;
  tag: string;
  title: string;
  description: string;
  client_sdr_id: string;
  client_id: string;
  json_data?: any;
  session_id?: string;
  processing_status?: string;
  processing_status_description?: string;
  parent_log_id?: number;
  is_sub_event?: boolean;
  show_in_session_memory: boolean;
}

interface MemoryLogsProps {
  onRevert: (log: string) => void;
  threads: ThreadType[];
  opened: boolean;
  setOpen: (isOpen: boolean) => void;
  sessionId?: number;
}

const SelixMemoryLogs: React.FC<MemoryLogsProps> = ({
  onRevert,
  threads,
  opened,
  setOpen,
  sessionId,
}) => {
  const [createLogOpened, setCreateLogOpened] = useState(false);
  const [newLog, setNewLog] = useState({
    tag: "",
    title: "",
    description: "",
    json_data: "",
    session_id: "",
  });
  const [loading, setLoading] = useState(false);
  const selectRef = useRef<HTMLInputElement>(null);

  const [loadingSelixLogs, setLoadingSelixLogs] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [editingConnectedSession, setEditingConnectedSession] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [roomId, setRoomId] = useState("");

  const [isShortTerm, setIsShortTerm] = useState<boolean>(false);

  const updateMemoryLogSessionId = async (
    selixLogId: number,
    sessionId: number | undefined
  ) => {
    if (!sessionId) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/selix/log/update_session_id`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selix_log_id: selixLogId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update session id");
      }

      const result = await response.json();
      console.log("Session id updated successfully:", result);
      fetchSelixLogs(selixLogId); // Refresh logs after update
    } catch (error) {
      console.error("Error updating session id:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelixLogs = async (
    selixLogId: number | null = null
  ): Promise<MemoryLog[]> => {
    try {
      setLoading(true);
      setLoadingSelixLogs(true);
      const response = await fetch(`${API_URL}/selix/get_selix_logs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          ContentType: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const result = await response.json();

      if (selixLogId) {
        setSelectedLog(
          result.logs.find((log: MemoryLog) => log.id === selixLogId) || null
        );
      } else {
        setSelectedLog(result.logs.reverse()[0]);
      }

      setLoading(false);
      setLoadingSelixLogs(false);
      console.log("Logs fetched successfully");

      return result.logs;
    } catch (error) {
      console.error("Error fetching logs:", error);
      return [] as MemoryLog[];
    }
  };

  const { data: logs, refetch } = useQuery({
    queryKey: ["selix_event_logs"],
    queryFn: async () => {
      return await fetchSelixLogs();
    },
    refetchOnWindowFocus: true,
  });

  const [selectedLog, setSelectedLog]: any = useState<MemoryLog | null>(
    logs?.reverse().find((log) => true) || null
  );

  useEffect(() => {
    setEditedDescription(selectedLog?.description || "");
  }, [selectedLog]);

  const createSelixLog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/selix/create_selix_log`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLog),
      });

      if (!response.ok) {
        throw new Error("Failed to create log");
      }

      const result = await response.json();
      console.log("Log created successfully:", result);
      refetch(); // Refresh logs after creation
      setCreateLogOpened(false); // Close the create log form
    } catch (error) {
      console.error("Error creating log:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSelixSupervisorLog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/selix/add_supervisor_log`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create log");
      }

      const result = await response.json();
      console.log("Log created successfully:", result);
      refetch(); // Refresh logs after creation
    } catch (error) {
      console.error("Error creating log:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProcessingType = async (selixLogId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/selix/log/update_processing_type`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selix_log_id: selixLogId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update processing type");
      }

      const result = await response.json();
      console.log("Processing type updated successfully:", result);
      fetchSelixLogs(selixLogId); // Refresh logs after update
    } catch (error) {
      console.error("Error updating processing type:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSelixLog = async (logId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/selix/delete_log`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ log_id: logId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete log");
      }

      const result = await response.json();
      console.log("Log deleted successfully:", result);
      refetch(); // Refresh logs after deletion
    } catch (error) {
      console.error("Error deleting log:", error);
    } finally {
      setLoading(false);
    }
  };

  const setParentEvent = async (childLogId: number, parentLogId?: number) => {
    const response = await fetch(`${API_URL}/selix/set_child_event`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent_event_id: parentLogId ? parentLogId : null,
        child_event_id: childLogId,
      }),
    });

    if (response.ok) {
      showNotification({
        title: "Success",
        message: "Successfully set parent event.",
        color: "green",
      });
      refetch();
    } else {
      showNotification({
        title: "Failed",
        message: "Failed to set parent event",
        color: "red",
      });
    }
  };

  const editSelixLog = async (logId: number, newDescription: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/selix/edit_log`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          log_id: logId,
          new_description: newDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit log");
      }

      const result = await response.json();
      console.log("Log edited successfully:", result);
      fetchSelixLogs(logId); // Refresh logs after edit
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error("Error editing log:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleData = (incomingData: any) => {
      console.log("Incoming data:", incomingData);
      if (incomingData.room_id === roomId) {
        refetch();
      }
    };

    socket.on("reload-memory-events", handleData);

    return () => {
      socket.off("reload-memory-events", handleData);
    };
  }, [roomId]);

  useEffect(() => {
    const connectSessionsToRooms = async () => {
      try {
        const roomId = Array.from(
          { length: 16 },
          () => Math.random().toString(36)[2]
        ).join("");
        setRoomId(roomId);

        socket.emit("join-room", {
          payload: { room_id: roomId },
        });

        const response = await fetch(
          `${API_URL}/selix/connect_sessions_to_rooms`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ room_id: roomId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to connect sessions to rooms");
        }

        const result = await response.json();
        console.log("Sessions connected to rooms successfully:", result);
        showNotification({
          title: "Success",
          message: "Sessions connected to rooms successfully",
          color: "green",
        });
      } catch (error) {
        console.error("Error connecting sessions to rooms:", error);
      }
    };

    if (userToken) {
      connectSessionsToRooms();
    }
  }, [userToken]);

  const reversedLogsByLogDate = useMemo(() => {
    const logsByLogDate =
      logs?.sort(
        (a: MemoryLog, b: MemoryLog) =>
          new Date(b.created_date).getTime() -
          new Date(a.created_date).getTime()
      ) ?? [];

    if (logsByLogDate.length === 0) {
      return [];
    }

    // have an array, and push to that array from the beginning until we hit a memory metadata updated event
    // Get index of first tag == MEMORY_METADATA_SAVED

    const index = logsByLogDate?.findIndex(
      (log) => log.tag === "MEMORY_METADATA_SAVED"
    );

    const arrayLog: MemoryLog[] =
      index === -1 ? [] : logsByLogDate.slice(0, index);
    const remaining: MemoryLog[] =
      index === -1 ? logsByLogDate.slice() : logsByLogDate.slice(index);

    const tempQueueMemoryLog = {
      id: -1,
      created_date: moment
        .utc(logsByLogDate[0].created_date, "YYYY-MM-DD HH:mm:ss")
        .tz("America/Los_Angeles")
        .format("YYYY-MM-DD HH:mm:ss"),
      tag: "PROCESS_QUEUE",
      title: "Processing Queue",
      description: "Events to be processed and updated.",
      client_sdr_id: logsByLogDate[0].client_sdr_id,
      client_id: logsByLogDate[0].client_id,
    } as MemoryLog;

    arrayLog.forEach((log) => {
      if (!log.parent_log_id) {
        log.parent_log_id = -1;
      }
    });

    return [tempQueueMemoryLog, ...arrayLog, ...remaining];
  }, [logs]);

  const tagToIconAndColorMap: Record<
    string,
    { icon: any; color: string; sub: string; explanation?: string }
  > = {
    MEMORY_METADATA_SAVED: {
      icon: <IconCheck size={16} />,
      color: "green",
      sub: "saved data",
      explanation: "This log represents a memory save event.",
    },
    SELIX_TASK_COMPLETE: {
      icon: <IconRobot size={16} />,
      color: "blue",
      sub: "ai task",
      explanation: "This log represents an AI task completion event.",
    },
    SELLSCALE_ACTION_COMPLETE: {
      icon: <IconSunElectricity size={16} />,
      color: "blue",
      sub: "ai action",
      explanation: "This log represents an AI action completion event.",
    },
    SUPPORT_THREAD_SLACK: {
      icon: <IconBrandSlack size={16} />,
      color: "grape",
      sub: "slack thread",
      explanation: "When a user sends a message on Slack, a log is created.",
    },
    SUPPORT_THREAD_EMAIL: {
      icon: <IconRecordMail size={16} />,
      color: "grape",
      sub: "email thread",
      explanation:
        "When a user sends an email to selix@sellscale.com, a log is created.",
    },
    SUPPORT_THREAD_EMAIL_FORWARDED_BY_OPERATOR: {
      icon: <IconMailForward size={16} />,
      color: "grape",
      sub: "email frwd. by ops",
      explanation:
        "When a SellScale operator forwards an email to selix@sellscale.com",
    },
    USER_INTERACTION: {
      icon: <IconMessage size={16} />,
      color: "grape",
      sub: "misc. interaction",
      explanation:
        "This log represents a miscellaneous user interaction event.",
    },
    MEETING_TRANSCRIPT: {
      icon: <IconClipboard size={16} />,
      color: "grape",
      sub: "meeting transcript",
      explanation: "This log represents a meeting transcript event.",
    },
    MANUAL: {
      icon: <IconPencil size={16} />,
      color: "grape",
      sub: "manual entry",
      explanation: "This log represents a manual entry event",
    },
    SLACK_MESSAGE: {
      icon: <IconMessage size={16} />,
      color: "green",
      sub: "Slack Message",
      explanation: "This log represents a slack message event",
    },
    EMAIL_MESSAGE: {
      icon: <IconMessage size={16} />,
      color: "green",
      sub: "Email Message",
      explanation: "This log represents a email message event",
    },
  };

  // Custom implementation of drag and drop
  const [draggedItem, setDraggedItem] = useState<MemoryLog | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );
  const draggedElementRef = useRef<HTMLDivElement | null>(null);

  const [expandedEvent, setExpandedEvent] = useState<Map<number, boolean>>(
    new Map()
  );

  const [holdStart, setHoldStart] = useState(0);
  const holdThreshold = 500; // Threshold in milliseconds to differentiate between click and hold

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    item: MemoryLog
  ) => {
    setHoldStart(new Date().getTime());

    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const itemRect = target.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - itemRect.left,
      y: e.clientY - itemRect.top,
    });
    setDraggedItem(item);
  };

  // Track mouse movement while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (draggedItem && draggedElementRef && draggedElementRef.current) {
      draggedElementRef.current.style.left = `${
        e.clientX - (dragOffset ? dragOffset.x : 0)
      }px`;

      draggedElementRef.current.style.top = `${
        e.clientY - (dragOffset ? dragOffset.y : 0)
      }px`;
    }
  };

  const handleMouseUpInTimeline = async (
    e: React.MouseEvent<HTMLDivElement>,
    upItem?: MemoryLog
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDraggedItem(null);
    setDragOffset(null);

    const holdDuration = new Date().getTime() - holdStart;

    if (holdDuration < holdThreshold) {
      return;
    }

    setHoldStart(0);

    e.currentTarget.style.backgroundColor = "";

    if (
      !draggedItem ||
      upItem?.id === draggedItem?.id ||
      upItem?.parent_log_id === draggedItem.id
    ) {
      return;
    }

    await setParentEvent(draggedItem.id, upItem?.id);
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setDragOffset(null);
  };

  // Example drop target to detect entering and leaving
  const handleMouseEnterDropZone = (
    e: React.MouseEvent<HTMLDivElement>,
    logItem?: MemoryLog,
    isSelectedTimeline: boolean = false
  ) => {
    if (draggedItem) {
      e.currentTarget.style.backgroundColor = "#d1f4d1"; // Highlight drop zone

      if (logItem && logItem.parent_log_id) {
        const closestElement = document.getElementById(
          `timeline-${logItem.parent_log_id}` +
            (isSelectedTimeline ? "-selected" : "")
        );

        if (closestElement) {
          closestElement.style.backgroundColor = "#fff";
        }
      }
      if (logItem) {
        let cardElement;
        if (e.currentTarget.id !== "timeline-event-card") {
          cardElement = document.getElementById("timeline-event-card");

          if (cardElement) {
            cardElement.style.backgroundColor = "#fff";
          }
        }

        if (e.currentTarget.id !== `timeline-${logItem.parent_log_id}-card`) {
          cardElement = document.getElementById(
            `timeline-${logItem.parent_log_id}-card`
          );

          if (cardElement) {
            cardElement.style.backgroundColor = "#fff";
          }
        }
      }
    }
  };

  const handleMouseLeaveDropZone = (
    e: React.MouseEvent<HTMLDivElement>,
    parentId?: number,
    isSelectedTimeline: boolean = false,

    topLevel?: number
  ) => {
    if (draggedItem) {
      e.currentTarget.style.backgroundColor = ""; // Remove highlight

      if (parentId) {
        const closestElement = document.getElementById(
          `timeline-${parentId}` + (isSelectedTimeline ? "-selected" : "")
        );

        if (closestElement) {
          closestElement.style.backgroundColor = "#d1f4d1";
        } else if (topLevel) {
          const element = document.getElementById(`timeline-${topLevel}-card`);
          if (element) {
            const rect = element.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Check if mouse is inside the element's bounding box
            if (
              mouseX >= rect.left &&
              mouseX <= rect.right &&
              mouseY >= rect.top &&
              mouseY <= rect.bottom
            ) {
              element.style.backgroundColor = "#d1f4d1";
            }
          }
        }
      } else {
        if (topLevel) {
          const element = document.getElementById(`timeline-${topLevel}-card`);
          if (element) {
            const rect = element.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Check if mouse is inside the element's bounding box
            if (
              mouseX >= rect.left &&
              mouseX <= rect.right &&
              mouseY >= rect.top &&
              mouseY <= rect.bottom
            ) {
              element.style.backgroundColor = "#d1f4d1";
            }
          }
        }

        const element = document.getElementById("timeline-event-card");
        if (element) {
          const rect = element.getBoundingClientRect();
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // Check if mouse is inside the element's bounding box
          if (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
          ) {
            element.style.backgroundColor = "#d1f4d1";
          }
        }
      }
    }
  };

  useEffect(() => {
    // Attach the mousemove and mouseup event listeners to the window
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Cleanup event listeners when component unmounts
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedItem, dragOffset]);

  const RenderTimeline = function (
    logArray: MemoryLog[],
    level: number = 1,
    isSelected: boolean = false,
    topLevel?: number
  ) {
    return (
      <Timeline bulletSize={24}>
        {logArray.map((log, index) => {
          return (
            <Timeline.Item
              key={index}
              id={`timeline-${log.id}` + (isSelected ? "-selected" : "")}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLog(log);
                setEditedDescription(log.description);
                setIsEditing(false);
              }}
              onMouseDown={(e) => {
                handleMouseDown(e, log);
              }}
              onMouseEnter={(e) => handleMouseEnterDropZone(e, log, isSelected)}
              onMouseLeave={(e) =>
                handleMouseLeaveDropZone(
                  e,
                  log.parent_log_id,
                  isSelected,
                  topLevel
                )
              }
              onMouseUp={async (e) => await handleMouseUpInTimeline(e, log)}
              sx={{
                cursor:
                  log.tag === "MEMORY_METADATA_SAVED" ? "pointer" : "default",
                backgroundColor: log === selectedLog ? "#fcfcfc" : "#fff",
                border: log === selectedLog ? "1px solid #e0e0e0" : undefined,
              }}
              bullet={
                <Tooltip
                  withinPortal={true}
                  label={tagToIconAndColorMap[log.tag]?.explanation}
                >
                  <ThemeIcon
                    size={22}
                    variant="filled"
                    color={
                      log === selectedLog
                        ? "yellow"
                        : tagToIconAndColorMap[log.tag]?.color || "gray"
                    }
                    radius="xl"
                  >
                    {tagToIconAndColorMap[log.tag]?.icon || (
                      <IconBolt size="0.8rem" />
                    )}
                  </ThemeIcon>
                </Tooltip>
              }
            >
              <Flex direction={"column"}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text
                      fw={log.tag === "MEMORY_METADATA_SAVED" ? 600 : 400}
                      size={log.tag === "MEMORY_METADATA_SAVED" ? "sm" : "xs"}
                    >
                      {log.tag === "SLACK_MESSAGE"
                        ? `From ${log.title.split(" ")[0]}` +
                          (isSelected
                            ? ` to ${log.title
                                .split(" ")
                                .find((item) => item.includes("pipeline"))}`
                            : "")
                        : log.tag === "SUPPORT_THREAD_SLACK"
                        ? `Slack Thread`
                        : log.title}
                    </Text>
                    {isSelected && log.tag !== "SUPPORT_THREAD_SLACK" && (
                      <Text
                        fw={400}
                        size={"sm"}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {log.description}
                      </Text>
                    )}
                    <Text c="dimmed" size="xs">
                      {moment
                        .utc(log.created_date, "YYYY-MM-DD HH:mm:ss")
                        .tz("America/Los_Angeles")
                        .format("YYYY-MM-DD HH:mm:ss")}
                      {log.tag !== "SUPPORT_THREAD_SLACK" &&
                        ` | ${
                          log.tag === "PROCESS_QUEUE"
                            ? ""
                            : tagToIconAndColorMap[log.tag]?.sub
                        }`}
                    </Text>
                  </Box>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSelixLog(log.id);
                    }}
                  >
                    <IconTrash size={16} />
                  </Button>
                </Flex>
                {(() => {
                  const childEvents = reversedLogsByLogDate.filter((item) => {
                    if (log.id === -1) {
                      return item.parent_log_id === -1;
                    } else {
                      return item.parent_log_id === log.id;
                    }
                  });

                  return childEvents.length > 0 &&
                    (isSelected || !log.parent_log_id) &&
                    !isSelected &&
                    (log.tag === "MEMORY_METADATA_SAVED" ||
                      log.tag === "PROCESS_QUEUE") ? (
                    <>
                      <Divider
                        size={"xl"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (expandedEvent.has(log.id)) {
                            const newMap = new Map(expandedEvent);

                            newMap.delete(log.id);
                            setExpandedEvent(newMap);
                            return;
                          } else {
                            const newMap = new Map(expandedEvent);
                            newMap.set(log.id, true);
                            setExpandedEvent(newMap);
                            return;
                          }
                        }}
                        label={
                          expandedEvent.has(log.id)
                            ? "Hide Sub Events"
                            : "View Sub Events"
                        }
                        labelPosition={"center"}
                      />
                      {expandedEvent.has(log.id) &&
                        RenderTimeline(
                          childEvents,
                          level + 1,
                          isSelected,
                          topLevel
                        )}
                    </>
                  ) : (
                    <></>
                  );
                })()}
              </Flex>
            </Timeline.Item>
          );
        })}
        {draggedItem && (
          <Portal>
            <Timeline.Item
              id={
                `hover-timeline-${draggedItem.id}` +
                (isSelected ? "-selected" : "")
              }
              ref={draggedElementRef}
              sx={{
                position: "absolute",
                zIndex: 9999, // Ensure dragged item is on top of everything
                pointerEvents: "none", // Disable interactions while dragging
                width: "200px",
                backgroundColor: "#fff",
                textAlign: "center",
                lineHeight: "100px",
                border: "1px solid #ccc",
              }}
              bullet={
                <Tooltip
                  label={tagToIconAndColorMap[draggedItem.tag]?.explanation}
                >
                  <ThemeIcon
                    size={22}
                    variant="filled"
                    color={
                      draggedItem === selectedLog
                        ? "yellow"
                        : tagToIconAndColorMap[draggedItem.tag]?.color || "gray"
                    }
                    radius="xl"
                  >
                    {tagToIconAndColorMap[draggedItem.tag]?.icon || (
                      <IconBolt size="0.8rem" />
                    )}
                  </ThemeIcon>
                </Tooltip>
              }
            >
              <Flex
                align="center"
                justify="space-between"
                style={{ marginLeft: "24px" }}
              >
                <Box>
                  <Text
                    fw={draggedItem.tag === "MEMORY_METADATA_SAVED" ? 600 : 400}
                    size={
                      draggedItem.tag === "MEMORY_METADATA_SAVED" ? "sm" : "xs"
                    }
                  >
                    {draggedItem.title}
                  </Text>
                  <Text c="dimmed" size="xs">
                    {moment
                      .utc(draggedItem.created_date, "YYYY-MM-DD HH:mm:ss")
                      .tz("America/Los_Angeles")
                      .format("YYYY-MM-DD HH:mm:ss")}{" "}
                    |{" "}
                    {draggedItem.tag === "PROCESS_QUEUE"
                      ? ""
                      : tagToIconAndColorMap[draggedItem.tag]?.sub}
                  </Text>
                </Box>
              </Flex>
            </Timeline.Item>
          </Portal>
        )}
      </Timeline>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpen(false)}
      size="1100px"
      zIndex={5}
    >
      <Flex>
        <Box>
          <Flex gap={"16px"} align={"center"}>
            <Title order={3}>Supervisor Memory</Title>
          </Flex>

          <Text style={{ marginBottom: "1rem" }}>
            View the history of long term memory updates for each session below,
            as well as the events that triggered it.
          </Text>
        </Box>
        <ActionIcon
          onClick={() => fetchSelixLogs()}
          size="lg"
          color="gray"
          ml="auto"
          variant="subtle"
        >
          <IconRefresh size={16} />
        </ActionIcon>
      </Flex>
      <Divider mt="md" mb="lg" />
      <Flex>
        <Box
          pr="md"
          style={{
            minWidth: "40%",
            maxWidth: "40%",
            borderRight: "1px solid #e0e0e0",
          }}
        >
          <Text fw={600} mb="md">
            Event Timeline
          </Text>
          <Card
            withBorder
            mb="md"
            sx={{ minHeight: "400px", maxHeight: "500px", overflowY: "auto" }}
            id={"timeline-event-card"}
            onMouseEnter={(e) => handleMouseEnterDropZone(e)}
            onMouseLeave={(e) =>
              handleMouseLeaveDropZone(e, undefined, false, 1)
            }
            onMouseUp={async (e) => await handleMouseUpInTimeline(e)}
            style={{ position: "relative" }}
          >
            <LoadingOverlay visible={loading || loadingSelixLogs} zIndex={2} />
            {RenderTimeline(
              reversedLogsByLogDate.filter(
                (log) => !log.is_sub_event && !log.parent_log_id
              )
            )}
          </Card>
          <Button
            onClick={async () => {
              if (isShortTerm) {
                setCreateLogOpened(true);
              } else {
                await createSelixSupervisorLog();
              }
            }}
            size="xs"
            color="blue"
            mt="md"
            variant="outline"
          >
            Create New Log
          </Button>
          {createLogOpened && (
            <Card withBorder mt="md">
              <Box mt="md">
                <Select
                  label="Tag"
                  value={newLog.tag}
                  onChange={(value: any) =>
                    setNewLog({ ...newLog, tag: value })
                  }
                  withinPortal
                  data={[
                    {
                      value: "SELIX_TASK_COMPLETE",
                      label: "✅ Selix Task Complete",
                    },
                    {
                      value: "SELLSCALE_ACTION_COMPLETE",
                      label: "📈 Selix Action Complete",
                    },
                    {
                      value: "SUPPORT_THREAD_SLACK",
                      label: "💬 Support Thread Slack",
                    },
                    {
                      value: "SUPPORT_THREAD_EMAIL",
                      label: "📧 Direct Email from User",
                    },
                    {
                      value: "SUPPORT_THREAD_EMAIL_FORWARDED_BY_OPERATOR",
                      label: "📧 Email Frwd. by Ops",
                    },
                    {
                      value: "USER_INTERACTION",
                      label: "👤 User Interaction",
                    },
                    {
                      value: "MEETING_TRANSCRIPT",
                      label: "📜 Meeting Transcript",
                    },
                    {
                      value: "MANUAL",
                      label: "✍️ Manual",
                    },
                  ]}
                  mb="sm"
                />
                <Textarea
                  label="Description"
                  value={newLog.description}
                  onChange={(e) =>
                    setNewLog({
                      ...newLog,
                      description: e.currentTarget.value,
                    })
                  }
                  autosize
                  minRows={3}
                  mb="sm"
                />
                <Button
                  onClick={createSelixLog}
                  size="xs"
                  color="green"
                  variant="outline"
                  disabled={!newLog.tag || !newLog.description}
                >
                  Submit
                </Button>
              </Box>
            </Card>
          )}
        </Box>
        <Box w="60%" pl="md">
          {selectedLog ? (
            <>
              <Box display="flex" mb="4px">
                <Box w="70%">
                  <Box>
                    <Tooltip label={selectedLog.title}>
                      <Text fw={600} size="lg" style={{ maxWidth: "70%" }}>
                        {selectedLog.title.length > 50
                          ? selectedLog.title.substring(0, 26) + "..."
                          : selectedLog.title}
                      </Text>
                    </Tooltip>

                    <Text size="sm" color="gray" mb="md">
                      {moment
                        .utc(selectedLog.created_date, "YYYY-MM-DD HH:mm:ss")
                        .tz("America/Los_Angeles")
                        .format("YYYY-MM-DD HH:mm:ss")}
                    </Text>
                  </Box>
                  <Flex>
                    {selectedLog.session_name && (
                      <Box>
                        <Flex align="center">
                          <Text size="10px" color="gray">
                            Connected session:
                          </Text>
                          {/* <ActionIcon onClick={() => setEditingConnectedSession(true)}>
                              <IconPencil size={12} color="gray" style={{ marginLeft: '4px' }} />
                            </ActionIcon> */}
                        </Flex>
                        {editingConnectedSession ? (
                          <Flex align="center" style={{ width: "200px" }}>
                            <Select
                              ref={selectRef}
                              data={threads.map((thread) => ({
                                value: thread.session_name,
                                label: thread.session_name,
                              }))}
                              value={null}
                              onChange={(value) => {
                                setSelectedLog({
                                  ...selectedLog,
                                  session_name: value,
                                });
                                updateMemoryLogSessionId(
                                  selectedLog.id,
                                  threads.find(
                                    (thread) => thread.session_name === value
                                  )?.id
                                );
                                setEditingConnectedSession(false);
                              }}
                              size="md"
                              mb="md"
                              mr="sm"
                              style={{ width: "100%" }}
                              rightSectionWidth={"100%"}
                              rightSection={
                                selectedLog.session_name && (
                                  <Badge
                                    color={deterministicMantineColor(
                                      selectedLog.session_name
                                    )}
                                    variant="filled"
                                    style={{ width: "100%" }}
                                    onClick={() => selectRef.current?.focus()}
                                  >
                                    {selectedLog.session_name}
                                  </Badge>
                                )
                              }
                              itemComponent={({ value, label, ...others }) => {
                                const {
                                  onMouseDown,
                                  onMouseEnter,
                                  role,
                                  tabIndex,
                                } = others;
                                return (
                                  <Badge
                                    color={deterministicMantineColor(value)}
                                    variant="filled"
                                    size="sm"
                                    mr="sm"
                                    mb="sm"
                                    style={{ width: "170px" }}
                                    onMouseDown={onMouseDown}
                                    onMouseEnter={(event) => {
                                      onMouseEnter(event);
                                      event.currentTarget.style.cursor =
                                        "pointer";
                                    }}
                                    role={role}
                                    tabIndex={tabIndex}
                                  >
                                    {label}
                                  </Badge>
                                );
                              }}
                              searchable
                              clearable
                              onDropdownOpen={() => selectRef.current?.focus()}
                            />
                            {/* <ActionIcon
                                onClick={() => {
                                  setEditingConnectedSession(false);
                                  updateMemoryLogSessionId(selectedLog.id, threads.find(thread => thread.session_name === selectedLog.session_name)?.id);
                                }}
                              >
                                <IconCircleCheck size={16} color="green" />
                              </ActionIcon> */}
                          </Flex>
                        ) : (
                          <Badge
                            color={deterministicMantineColor(
                              selectedLog.session_name
                            )}
                            variant="filled"
                            size="md"
                            mb="md"
                            mr="sm"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setEditingConnectedSession(true);
                              setTimeout(() => {
                                selectRef.current?.focus();
                                selectRef.current?.click();
                              }, 0);
                            }}
                          >
                            {selectedLog.session_name}
                          </Badge>
                        )}
                      </Box>
                    )}
                    {selectedLog.tag != "MEMORY_METADATA_SAVED" &&
                    selectedLog.tag != "PROCESS_QUEUE" ? (
                      <Button
                        onClick={() => updateProcessingType(selectedLog.id)}
                        size="xs"
                        color="blue"
                        ml="lg"
                        variant="outline"
                        mb="md"
                      >
                        {loading ? (
                          <Loader size="xs" />
                        ) : (
                          "Update Processing Type"
                        )}
                      </Button>
                    ) : (
                      <Box></Box>
                    )}
                  </Flex>
                </Box>
                <Box w="30%">
                  {selectedLog.tag !== "PROCESS_QUEUE" && (
                    <Text size="10px" color="gray">
                      {selectedLog.json_data &&
                      selectedLog.json_data.email_source
                        ? "Sent by: " +
                          selectedLog.json_data.email_source
                        : ""}
                    </Text>
                  )}
                </Box>
              </Box>
              {selectedLog.tag !== "PROCESS_QUEUE" && (
                <Text
                  size="10px"
                  mb="4px"
                  color="gray"
                  dangerouslySetInnerHTML={{
                    __html: selectedLog.metadata.replaceAll("\n", "<br />"),
                  }}
                />
              )}

              {/* {selectedLog.tag === "MEMORY_METADATA_SAVED" && */}
              {/*   logs && */}
              {/*   !selectedLog.is_supervisor && ( */}
              {/*   )} */}
              {selectedLog.tag !== "SUPPORT_THREAD_SLACK" &&
                selectedLog.tag !== "SUPPORT_THREAD_EMAIL" &&
                selectedLog.tag !==
                  "SUPPORT_THREAD_EMAIL_FORWARDED_BY_OPERATOR" &&
                selectedLog.tag !== "PROCESS_QUEUE" && (
                  <Textarea
                    value={editedDescription}
                    autosize
                    minRows={10}
                    maxRows={15}
                    mb="md"
                    onChange={(e) => {
                      setEditedDescription(e.currentTarget.value);
                      setIsEditing(true);
                    }}
                  />
                )}
              {reversedLogsByLogDate.filter(
                (log) => log.parent_log_id === selectedLog.id
              ).length > 0 && (
                <Card
                  withBorder
                  mb="md"
                  sx={{
                    minHeight: "400px",
                    maxHeight: "500px",
                    overflowY: "auto",
                  }}
                  id={`timeline-${selectedLog.id}-card`}
                  onMouseEnter={(e) =>
                    handleMouseEnterDropZone(e, selectedLog, true)
                  }
                  onMouseLeave={(e) =>
                    handleMouseLeaveDropZone(
                      e,
                      selectedLog.id,
                      true,
                      selectedLog.id
                    )
                  }
                  onMouseUp={async (e) =>
                    await handleMouseUpInTimeline(e, selectedLog)
                  }
                >
                  <LoadingOverlay visible={loading || loadingSelixLogs} />
                  {RenderTimeline(
                    reversedLogsByLogDate.filter(
                      (log) => log.parent_log_id === selectedLog.id
                    ),
                    2,
                    true,
                    selectedLog.id
                  )}
                </Card>
              )}

              <Flex>
                {isEditing && (
                  <Button
                    onClick={() =>
                      editSelixLog(selectedLog.id, editedDescription)
                    }
                    size="xs"
                    color="green"
                    variant="outline"
                    mb="md"
                    ml="auto"
                  >
                    {loading ? <Loader size="xs" /> : "Save"}
                  </Button>
                )}
              </Flex>
              {selectedLog.tag === "MEMORY_METADATA_SAVED" && logs && (
                <>
                  <Text fw={600} mb="2px">
                    Updated via:
                  </Text>
                  <Text mb="md">
                    {selectedLog.json_data
                      ? selectedLog.json_data.updated_from
                      : "No update information available"}
                  </Text>
                  <Text fw={600} mb="2px">
                    Completed since last log:
                  </Text>
                  <Box mb="md">
                    {logs
                      .filter(
                        (log) =>
                          new Date(log.created_date) <
                            new Date(selectedLog.created_date) &&
                          log.tag !== "MEMORY_METADATA_SAVED" &&
                          new Date(log.created_date) >
                            new Date(
                              logs
                                .filter(
                                  (l) =>
                                    l.tag === "MEMORY_METADATA_SAVED" &&
                                    new Date(l.created_date) <
                                      new Date(selectedLog.created_date)
                                )
                                .sort(
                                  (a, b) =>
                                    new Date(b.created_date).getTime() -
                                    new Date(a.created_date).getTime()
                                )[0]?.created_date || 0
                            )
                      )
                      .map((log, index) => (
                        <Card
                          withBorder
                          shadow="sm"
                          radius="md"
                          p="sm"
                          mb="sm"
                          key={index}
                        >
                          <Text size="sm" color="black" fw={600}>
                            ⚡️ {log.title}
                          </Text>
                          <Text size="xs" color="gray">
                            {log.description}
                          </Text>
                          <Text
                            size="xs"
                            color="gray"
                            align="left"
                            mt="xs"
                            style={{ fontSize: "10px" }}
                          >
                            Completed:{" "}
                            {moment
                              .utc(log.created_date, "YYYY-MM-DD HH:mm:ss")
                              .tz("America/Los_Angeles")
                              .format("YYYY-MM-DD HH:mm:ss")}
                          </Text>
                        </Card>
                      ))}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Text>Select a log to view details</Text>
          )}
        </Box>
      </Flex>
    </Modal>
  );
};

export default SelixMemoryLogs;
