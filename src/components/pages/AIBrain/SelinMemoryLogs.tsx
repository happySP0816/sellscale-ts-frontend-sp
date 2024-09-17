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
} from "@mantine/core";
import {
  IconHistory,
  IconArrowBack,
  IconCheck,
  IconX,
  IconSunElectricity,
} from "@tabler/icons-react";
import { IconBolt, IconEye } from "@tabler/icons";
import moment from "moment";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";

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
const mockLogs: MemoryLog[] = [
  {
    created_date: "2023-10-01 10:00:00",
    tag: "MEMORY_METADATA_SAVED",
    title: "Memory Save 1",
    description:
      "Initial memory save. This log marks the first instance of memory being saved in the system. It includes metadata and example data for future reference.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    json_data: '{"data": "example"}',
    session_id: "session_001",
  },
  {
    created_date: "2023-10-02 12:00:00",
    tag: "SELIX_TASK_COMPLETE",
    title: "Task Complete 1",
    description:
      "Completed task 1. This log indicates the successful completion of the first task assigned to the system, showcasing its ability to handle tasks efficiently.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    session_id: "session_001",
  },
  {
    created_date: "2023-10-03 14:00:00",
    tag: "SELIX_TASK_COMPLETE",
    title: "Task Complete 2",
    description:
      "Completed task 2. This log records the completion of the second task, further demonstrating the system's task management capabilities.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    session_id: "session_001",
  },
  {
    created_date: "2023-10-04 16:00:00",
    tag: "MEMORY_METADATA_SAVED",
    title: "Memory Save 2",
    description:
      "Second memory save. This log captures the second instance of memory being saved, providing additional metadata and example data for continuity.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    json_data: '{"data": "example"}',
    session_id: "session_001",
  },
  {
    created_date: "2023-10-05 18:00:00",
    tag: "SELIX_TASK_COMPLETE",
    title: "Task Complete 3",
    description:
      "Completed task 3. This log marks the completion of the third task, highlighting the system's ongoing task execution and completion.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    session_id: "session_001",
  },
  {
    created_date: "2023-10-06 20:00:00",
    tag: "SELIX_TASK_COMPLETE",
    title: "Task Complete 4",
    description:
      "Completed task 4. This log documents the fourth task completion, reinforcing the system's consistent performance in task management.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    session_id: "session_001",
  },
  {
    created_date: "2023-10-07 22:00:00",
    tag: "MEMORY_METADATA_SAVED",
    title: "Memory Save 3",
    description:
      "Third memory save. This log represents the third memory save event, ensuring that the system's memory state is preserved with relevant metadata and example data.",
    client_sdr_id: "sdr_001",
    client_id: "client_001",
    json_data: '{"data": "example"}',
    session_id: "session_001",
  },
];

const SelixMemoryLogs: React.FC<MemoryLogsProps> = ({ onRevert }) => {
  const [logs, setLogs] = useState<MemoryLog[]>([]);
  const [opened, setOpened] = useState(false);
  const [selectedLog, setSelectedLog]: any = useState<MemoryLog | null>(
    logs.reverse().find((log) => log.tag === "MEMORY_METADATA_SAVED") || null
  );
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

  useEffect(() => {
    fetchSelixLogs();
  }, []);

  const reversedLogsByLogDate = logs.sort(
    (a: MemoryLog, b: MemoryLog) =>
      new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
  );

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
        Memory Logs
      </Button>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size="xl"
      >
        <Flex>
          <Box>
            <Title order={3}>Memory Logs</Title>
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
          <Box w="30%" pr="md" style={{ borderRight: "1px solid #e0e0e0" }}>
            <Text fw={600} mb="md">
              Memory Bank
            </Text>
            <Timeline bulletSize={24}>
              {reversedLogsByLogDate.map((log, index) => (
                <Timeline.Item
                  key={index}
                  title={log.title}
                  onClick={() =>
                    log.tag === "MEMORY_METADATA_SAVED" && setSelectedLog(log)
                  }
                  sx={{
                    cursor:
                      log.tag === "MEMORY_METADATA_SAVED"
                        ? "pointer"
                        : "default",
                  }}
                  bullet={
                    log === selectedLog ? (
                      <ThemeIcon
                        size={22}
                        variant="gradient"
                        gradient={{ from: "yellow", to: "yellow" }}
                        radius="xl"
                      >
                        <IconEye size="0.8rem" />
                      </ThemeIcon>
                    ) : log.tag === "MEMORY_METADATA_SAVED" ? (
                      <ThemeIcon
                        size={22}
                        variant="gradient"
                        gradient={{ from: "lime", to: "cyan" }}
                        radius="xl"
                      >
                        <IconCheck size="0.8rem" />
                      </ThemeIcon>
                    ) : (
                      <ThemeIcon
                        size={22}
                        variant="gradient"
                        gradient={{ from: "gray", to: "gray" }}
                        radius="xl"
                      >
                        <IconBolt size="0.8rem" />
                      </ThemeIcon>
                    )
                  }
                >
                  <Text c="dimmed" size="sm">
                    {moment(log.created_date).fromNow()}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Box>
          <Box w="70%" pl="md">
            {selectedLog ? (
              <>
                <Text fw={600} mb="4px" size="lg">
                  {selectedLog.title}
                </Text>
                <Text size="sm" color="gray" mb="md">
                  {moment(selectedLog.created_date).fromNow()}
                </Text>
                <Textarea
                  value={selectedLog.description}
                  readOnly
                  autosize
                  minRows={10}
                  mb="md"
                />
                <Text fw={600} mb="sm">
                  Completed since last log:
                </Text>

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
                    <Card withBorder shadow="sm" radius="md" p="sm" mb="sm">
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
