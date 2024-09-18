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
} from "@mantine/core";
import {
  IconHistory,
  IconArrowBack,
  IconCheck,
  IconX,
  IconSunElectricity,
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
  IconRobot,
} from "@tabler/icons";
import moment from "moment";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { deterministicMantineColor } from "@utils/requests/utils";

interface MemoryLog {
  created_date: string;
  tag: string;
  title: string;
  description: string;
  client_sdr_id: string;
  client_id: string;
  json_data?: string;
  session_id?: string;
}

interface MemoryLogsProps {
  onRevert: (log: string) => void;
}

const SelixMemoryLogs: React.FC<MemoryLogsProps> = ({ onRevert }) => {
  const [logs, setLogs] = useState<MemoryLog[]>([]);
  const [opened, setOpened] = useState(false);
  const [selectedLog, setSelectedLog]: any = useState<MemoryLog | null>(
    logs.reverse().find((log) => log.tag === "MEMORY_METADATA_SAVED") || null
  );
  const [createLogOpened, setCreateLogOpened] = useState(false);
  const [newLog, setNewLog] = useState({
    tag: "",
    title: "",
    description: "",
    json_data: "",
    session_id: "",
  });
  const userToken = useRecoilValue(userTokenState);

  const fetchSelixLogs = async () => {
    try {
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
      setSelectedLog(
        result.logs
          .reverse()
          .find((log: MemoryLog) => log.tag === "MEMORY_METADATA_SAVED") || null
      );
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      console.log("Logs fetched successfully");
    }
  };

  const createSelixLog = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchSelixLogs();
  }, []);

  const reversedLogsByLogDate = logs.sort(
    (a: MemoryLog, b: MemoryLog) =>
      new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
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
          <Button
            onClick={() => fetchSelixLogs()}
            size="xs"
            color="gray"
            ml="auto"
            variant="outline"
          >
            Refresh
          </Button>
        </Flex>
        <Divider mt="md" mb="lg" />
        <Flex>
          <Box w="40%" pr="md" style={{ borderRight: "1px solid #e0e0e0" }}>
            <Text fw={600} mb="md">
              Event Timeline
            </Text>
            <Card withBorder mah="56vh" mb="md" sx={{ overflowY: "auto" }}>
              <Timeline bulletSize={24}>
                {reversedLogsByLogDate.map((log, index) => {
                  return (
                    <Timeline.Item
                      key={index}
                      onClick={() => setSelectedLog(log)}
                      sx={{
                        cursor:
                          log.tag === "MEMORY_METADATA_SAVED"
                            ? "pointer"
                            : "default",
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
                            {log === selectedLog ? (
                              <IconEye size="0.8rem" />
                            ) : (
                              tagToIconAndColorMap[log.tag]?.icon || (
                                <IconBolt size="0.8rem" />
                              )
                            )}
                          </ThemeIcon>
                        </Tooltip>
                      }
                    >
                      <Text
                        fw={log.tag === "MEMORY_METADATA_SAVED" ? 600 : 400}
                        size={log.tag === "MEMORY_METADATA_SAVED" ? "sm" : "xs"}
                      >
                        {log.title}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {moment(log.created_date).fromNow()} |{" "}
                        {tagToIconAndColorMap[log.tag]?.sub}
                      </Text>
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
                  <TextInput
                    label="Title"
                    value={newLog.title}
                    onChange={(e) =>
                      setNewLog({ ...newLog, title: e.currentTarget.value })
                    }
                    mb="sm"
                  />
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
                    disabled={
                      !newLog.title || !newLog.tag || !newLog.description
                    }
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
                  <Tooltip label={selectedLog.title}>
                    <Text fw={600} size="lg" style={{ maxWidth: "70%" }}>
                      {selectedLog.title.length > 50
                        ? selectedLog.title.substring(0, 26) + "..."
                        : selectedLog.title}
                    </Text>
                  </Tooltip>
                  <Badge
                    color={deterministicMantineColor(selectedLog.tag)}
                    variant="filled"
                    size="sm"
                    ml="auto"
                  >
                    {selectedLog.tag.replace(/_/g, " ")}
                  </Badge>
                </Box>
                <Text size="sm" color="gray" mb="md">
                  {moment(selectedLog.created_date).fromNow()}
                </Text>
                <Text
                  size="10px"
                  mb="4px"
                  color="gray"
                  dangerouslySetInnerHTML={{
                    __html: selectedLog.metadata.replaceAll("\n", "<br />"),
                  }}
                />
                <Textarea
                  value={selectedLog.description}
                  readOnly
                  autosize
                  minRows={10}
                  mb="md"
                />
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
