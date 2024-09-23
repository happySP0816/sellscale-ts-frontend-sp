import React, { useEffect, useState } from "react";
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
  IconClick,
  IconClipboard,
  IconEye,
  IconMailForward,
  IconMessage,
  IconPencil,
  IconRecordMail,
  IconRefresh,
  IconRobot,
} from "@tabler/icons";
import moment from "moment";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { deterministicMantineColor } from "@utils/requests/utils";
import { showNotification } from "@mantine/notifications";
import { socket } from "../../../components/App";

interface MemoryLog {
  id: number;
  created_date: string;
  tag: string;
  title: string;
  description: string;
  client_sdr_id: string;
  client_id: string;
  json_data?: string;
  session_id?: string;
  processing_status?: string;
  processing_status_description?: string;
}

interface MemoryLogsProps {
  onRevert: (log: string) => void;
}

const SelixMemoryLogs: React.FC<MemoryLogsProps> = ({ onRevert }) => {
  const [logs, setLogs] = useState<MemoryLog[]>([]);
  const [opened, setOpened] = useState(false);
  const [selectedLog, setSelectedLog]: any = useState<MemoryLog | null>(
    logs.reverse().find((log) => true) || null
  );
  const [createLogOpened, setCreateLogOpened] = useState(false);
  const [newLog, setNewLog] = useState({
    tag: "",
    title: "",
    description: "",
    json_data: "",
    session_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingSelixLogs, setLoadingSelixLogs] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const userToken = useRecoilValue(userTokenState);
  const [roomId, setRoomId] = useState("");

  const fetchSelixLogs = async (selixLogId: number | null = null) => {
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
      setLogs(result.logs);
      if (selixLogId) {
        setSelectedLog(
          result.logs.find((log: MemoryLog) => log.id === selixLogId) || null
        );
      } else {
        setSelectedLog(
          result.logs.reverse().find((log: MemoryLog) => true) || null
        );
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
      setLoadingSelixLogs(false);
      console.log("Logs fetched successfully");
    }
  };

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
      fetchSelixLogs(); // Refresh logs after creation
      setCreateLogOpened(false); // Close the create log form
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
      fetchSelixLogs(); // Refresh logs after deletion
    } catch (error) {
      console.error("Error deleting log:", error);
    } finally {
      setLoading(false);
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
        fetchSelixLogs();
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

  useEffect(() => {
    fetchSelixLogs();
  }, []);

  const reversedLogsByLogDate = logs.sort(
    (a: MemoryLog, b: MemoryLog) => -(a.id - b.id)
  );

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
  };

  return (
    <>
      <Button
        onClick={() => setOpened(true)}
        size="xs"
        color="teal"
        ml="auto"
        variant="outline"
        pt="2px"
        pb="2px"
        mb="4px"
        leftIcon={<IconHistory size={16} />}
      >
        Event Logs
      </Button>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size="xl"
      >
        <Flex>
          <Box>
            <Title order={3}>Event Logs</Title>
            <Text style={{ marginBottom: "1rem" }}>
              View a history of all memory saves and task completions.
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
          <Box w="40%" pr="md" style={{ borderRight: "1px solid #e0e0e0" }}>
            <Text fw={600} mb="md">
              Event Timeline
            </Text>
            <Card withBorder mah="56vh" mb="md" sx={{ overflowY: "auto" }}>
              <LoadingOverlay visible={loading || loadingSelixLogs} />
              <Timeline bulletSize={24}>
                {reversedLogsByLogDate.map((log, index) => {
                  return (
                    <Timeline.Item
                      key={index}
                      onClick={() => {
                        setSelectedLog(log);
                        setEditedDescription(log.description);
                        setIsEditing(false);
                      }}
                      sx={{
                        cursor:
                          log.tag === "MEMORY_METADATA_SAVED"
                            ? "pointer"
                            : "default",
                        backgroundColor:
                          log === selectedLog ? "#fcfcfc" : undefined,
                        border:
                          log === selectedLog ? "1px solid #e0e0e0" : undefined,
                      }}
                      bullet={
                        <Tooltip
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
                      <Flex align="center" justify="space-between">
                        <Box>
                          <Text
                            fw={log.tag === "MEMORY_METADATA_SAVED" ? 600 : 400}
                            size={
                              log.tag === "MEMORY_METADATA_SAVED" ? "sm" : "xs"
                            }
                          >
                            {log.title}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {moment(log.created_date).fromNow()} |{" "}
                            {tagToIconAndColorMap[log.tag]?.sub}
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
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Card>
            <Button
              onClick={() => setCreateLogOpened(true)}
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
                  {/* <TextInput
                    label="Title"
                    value={newLog.title}
                    onChange={(e) =>
                      setNewLog({ ...newLog, title: e.currentTarget.value })
                    }
                    mb="sm"
                  /> */}
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
          <Box w="70%" pl="md">
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
                        {moment(selectedLog.created_date).fromNow()}
                      </Text>
                    </Box>
                    <Flex>
                      {selectedLog.session_name && (
                        <Box>
                          <Text size="10px" color="gray">
                            Connected session:
                          </Text>
                          <Badge
                            color={deterministicMantineColor(
                              selectedLog.session_name
                            )}
                            variant="filled"
                            size="md"
                            mb="md"
                            mr="sm"
                          >
                            {selectedLog.session_name}
                          </Badge>
                        </Box>
                      )}
                      {selectedLog.processing_status ? (
                        <HoverCard width={400} shadow="md">
                          <HoverCard.Target>
                            <Box>
                              <Text size="10px" color="gray">
                                Processing status:
                              </Text>
                              <Badge
                                color={deterministicMantineColor(
                                  selectedLog.processing_status
                                )}
                                variant="filled"
                                size="md"
                                mb="md"
                              >
                                {selectedLog.processing_status.replace(
                                  /_/g,
                                  " "
                                )}
                              </Badge>
                            </Box>
                          </HoverCard.Target>
                          <HoverCard.Dropdown>
                            <Text
                              size="sm"
                              dangerouslySetInnerHTML={{
                                __html: selectedLog.processing_status_description
                                  .replaceAll("**", "")
                                  .replaceAll("\n", "<br />"),
                              }}
                            />
                          </HoverCard.Dropdown>
                        </HoverCard>
                      ) : selectedLog.tag != "MEMORY_METADATA_SAVED" ? (
                        <Button
                          onClick={() => updateProcessingType(selectedLog.id)}
                          size="xs"
                          color="blue"
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
                    <Badge
                      color={deterministicMantineColor(selectedLog.tag)}
                      variant="filled"
                      size="sm"
                      ml="auto"
                    >
                      {tagToIconAndColorMap[selectedLog.tag]?.sub ||
                        selectedLog.tag}
                    </Badge>
                    <Text size="10px" color="gray">
                      {selectedLog.json_data &&
                      JSON.parse(selectedLog.json_data)?.email_source
                        ? "Sent by: " +
                          JSON.parse(selectedLog.json_data)?.email_source
                        : ""}
                    </Text>
                  </Box>
                </Box>
                <Text
                  size="10px"
                  mb="4px"
                  color="gray"
                  dangerouslySetInnerHTML={{
                    __html: selectedLog.metadata.replaceAll("\n", "<br />"),
                  }}
                />
                <Textarea
                  value={editedDescription}
                  autosize
                  minRows={10}
                  maxRows={25}
                  mb="md"
                  onChange={(e) => {
                    setEditedDescription(e.currentTarget.value);
                    setIsEditing(true);
                  }}
                />
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
                {selectedLog.tag === "MEMORY_METADATA_SAVED" && (
                  <>
                    <Text fw={600} mb="2px">
                      Updated via:
                    </Text>
                    <Text mb="md">
                      {selectedLog.json_data
                        ? JSON.parse(selectedLog.json_data).updated_from
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
                              Completed: {moment(log.created_date).fromNow()}
                            </Text>
                          </Card>
                        ))}
                    </Box>
                    <Box w="100%">
                      <Button
                        leftIcon={<IconHistory size={16} />}
                        color="red"
                        variant="outline"
                        size="xs"
                        mt="lg"
                        onClick={() => {
                          onRevert(selectedLog.description);
                          setOpened(false);
                        }}
                      >
                        Revert to this Memory
                      </Button>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Text>Select a log to view details</Text>
            )}
          </Box>
        </Flex>
      </Drawer>
    </>
  );
};

export default SelixMemoryLogs;
