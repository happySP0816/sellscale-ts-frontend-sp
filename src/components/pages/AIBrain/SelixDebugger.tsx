import React, { useState, useEffect } from "react";
import {
  Accordion,
  Button,
  Card,
  Flex,
  Stack,
  Text,
  Badge,
  Box,
  Title,
} from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause, IconSquare } from "@tabler/icons";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function SelixDebugger() {
  // Mock for highlighted node, assuming a static highlight for now
  const [highlightedNode, setHighlightedNode] = useState("A"); // This corresponds to 'Event Received'

  const init_diagram = `
    graph TD
      A1[Events] -->|event happens| A2[Determine related threads]
      A1 --> B1[Untreaded event]
      A2 -->|Threaded Events| A3{Found similar thread?}
      A3 -->|Yes| A4[Add slack/email to thread]
      A3 -->|No| A5[Create new thread]
      A4 --> C1{Thread already in a session?}
      A5 --> C1
      C1 -->|Yes| D1[Determine whether to update memory]
      C1 -->|No| C2[Determine related Sessions]
      C2 -->|Found related sessions| D1
      C2 -->|Did not find relevant sessions| C3{Enough information to create sessions?}
      C3 -->|Yes| D2[Create new session]
      C3 -->|No| E1[Message will appear in no session on Selix]
      D1 -->|Update the memory| F1[Update/Create the task list]
      F1 --> G1[New memory updated event]
      D1 -->|Not a trigger| G2[Event will be sorted into a session but not part of memory update]
      D2 --> F1
      E2[Manual Trigger] --> F1
  `;

  const other_diagram = `
    graph TD
      A1[Events] -->|event happens| A2[YesDetermine related threads]
      A1 --> B1[Untreaded event]
      A2 -->|Threaded Events| A3{Found similar thread?}
      A3 -->|Yes| A4[Add slack/email to thread]
      A3 -->|No| A5[Create new thread]
      A4 --> C1{Thread already in a session?}
      A5 --> C1
      C1 -->|Yes| D1[Determine whether to update memory]
      C1 -->|No| C2[Determine related Sessions]
      C2 -->|Found related sessions| D1
      C2 -->|Did not find relevant sessions| C3{Enough information to create sessions?}
      C3 -->|Yes| D2[Create new session]
      C3 -->|No| E1[Message will appear in no session on Selix]
      D1 -->|Update the memory| F1[Update/Create the task list]
      F1 --> G1[New memory updated event]
      D1 -->|Not a trigger| G2[Event will be sorted into a session but not part of memory update]
      D2 --> F1
      E2[Manual Trigger] --> F1
  `;

  const initialNodes = [
    { id: "A1", position: { x: 0, y: 0 }, data: { label: "Events" } },
    {
      id: "A2",
      position: { x: 0, y: 150 },
      data: { label: "Determine related threads" },
    },
    {
      id: "B1",
      position: { x: 200, y: 100 },
      data: { label: "Untreaded event" },
    },
    {
      id: "A3",
      position: { x: 0, y: 300 },
      data: { label: "Found similar thread?" },
    },
    {
      id: "A4",
      position: { x: -100, y: 450 },
      data: { label: "Add slack/email to thread" },
    },
    {
      id: "A5",
      position: { x: 100, y: 450 },
      data: { label: "Create new thread" },
    },
    {
      id: "C1",
      position: { x: 0, y: 600 },
      data: { label: "Thread already in a session?" },
    },
    {
      id: "C2",
      position: { x: -300, y: 750 },
      data: { label: "Determine related Sessions" },
    },
    {
      id: "D1",
      position: { x: -200, y: 900 },
      data: { label: "Determine whether to update memory" },
    },
    {
      id: "C3",
      position: { x: 100, y: 750 },
      data: { label: "Enough information to create sessions?" },
    },
    {
      id: "D2",
      position: { x: 100, y: 900 },
      data: { label: "Create new session" },
    },
    {
      id: "E1",
      position: { x: 300, y: 900 },
      data: { label: "Message will appear in no session on Selix" },
    },
    {
      id: "F1",
      position: { x: -200, y: 1050 },
      data: { label: "Update/Create the task list" },
    },
    {
      id: "G1",
      position: { x: -200, y: 1200 },
      data: { label: "New memory updated event" },
    },
    {
      id: "G2",
      position: { x: 0, y: 1200 },
      data: {
        label:
          "Event will be sorted into a session but not part of memory update",
      },
    },
    {
      id: "E2",
      position: { x: 100, y: 1050 },
      data: { label: "Manual Trigger" },
    },
  ];

  const initialEdges = [
    { id: "eA1-A2", source: "A1", target: "A2", label: "event happens" },
    { id: "eA1-B1", source: "A1", target: "B1" },
    { id: "eA2-A3", source: "A2", target: "A3", label: "Threaded Events" },
    { id: "eA3-A4", source: "A3", target: "A4", label: "Yes" },
    { id: "eA3-A5", source: "A3", target: "A5", label: "No" },
    { id: "eA4-C1", source: "A4", target: "C1" },
    { id: "eA5-C1", source: "A5", target: "C1" },
    { id: "eC1-D1", source: "C1", target: "D1", label: "Yes" },
    { id: "eC1-C2", source: "C1", target: "C2", label: "No" },
    {
      id: "eC2-D1",
      source: "C2",
      target: "D1",
      label: "Found related sessions",
    },
    {
      id: "eC2-C3",
      source: "C2",
      target: "C3",
      label: "Did not find relevant sessions",
    },
    { id: "eC3-D2", source: "C3", target: "D2", label: "Yes" },
    { id: "eC3-E1", source: "C3", target: "E1", label: "No" },
    { id: "eD1-F1", source: "D1", target: "F1", label: "Update the memory" },
    { id: "eF1-G1", source: "F1", target: "G1" },
    { id: "eD1-G2", source: "D1", target: "G2", label: "Not a trigger" },
    { id: "eD2-F1", source: "D2", target: "F1" },
    { id: "eE2-F1", source: "E2", target: "F1" },
  ];

  const [diagram, setDiagram] = useState(init_diagram);

  // Use useEffect to trigger re-render of Mermaid component when diagram changes
  useEffect(() => {
    // This effect will run whenever the diagram state changes
  }, [diagram]);

  return (
    <Card withBorder>
      <Flex>
        <Box>
          <Title order={3}>
            Debugging: Session #132 - Salesforce Conference Outreach
          </Title>
          <Text>User: Aakash Adesara (NewtonX)</Text>
        </Box>
        <Button ml="auto" mt="xs">
          Open Session in new tab
        </Button>
      </Flex>
      <Flex style={{ height: "100vh", padding: "20px", gap: "20px" }}>
        {/* Left Side with Mermaid Diagram */}
        <Box style={{ width: "50%", paddingTop: "0px" }}>
          {/* Header Buttons */}
          <Flex
            justify="space-between"
            align="center"
            style={{ padding: "10px", paddingTop: "0px" }}
          >
            <Button
              leftIcon={<IconPlayerPlay />}
              color="green"
              size="sm"
              fullWidth
              onClick={() => {
                setDiagram(other_diagram);
              }}
            >
              Play
            </Button>
            <Button
              leftIcon={<IconPlayerPause />}
              color="yellow"
              size="sm"
              fullWidth
              ml={5}
            >
              Pause
            </Button>
            <Button
              leftIcon={<IconSquare />}
              color="red"
              size="sm"
              fullWidth
              ml={5}
            >
              Interrupt
            </Button>
          </Flex>

          <Card shadow="sm" style={{ marginBottom: "20px" }} withBorder>
            <Card withBorder h="1000px">
              <ReactFlow nodes={initialNodes} edges={initialEdges} />
            </Card>
            {/* <Mermaid
            chart={diagram}
            config={{
              theme: "base",
              themeVariables: { highlightColor: "#FFD700" },
            }}
          ></Mermaid> */}
          </Card>
        </Box>

        {/* Right Side with Memory and Log Stream */}
        <Flex direction="column" style={{ width: "50%" }}>
          {/* Memory Section with Accordions */}
          <Card
            shadow="sm"
            withBorder
            style={{ flex: 1, padding: "10px", marginBottom: "10px" }}
          >
            <Text weight={500}>Memory</Text>
            <Accordion>
              <Accordion.Item value="supervisor-memory">
                <Accordion.Control>Supervisor Memory</Accordion.Control>
                <Accordion.Panel>
                  <Text weight={700}>Supervisor Task Update</Text>
                  <Text color="dimmed" size="sm">
                    Last updated by Supervisor on 2023-10-01.
                  </Text>
                  <Text weight={700}>Supervisor Notes</Text>
                  <Text color="dimmed" size="sm">
                    Review pending tasks for the upcoming week.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion>
              <Accordion.Item value="session-memory">
                <Accordion.Control>Session Memory</Accordion.Control>
                <Accordion.Panel>
                  <Text weight={700}>Session Start Time</Text>
                  <Text color="dimmed" size="sm">
                    Session initiated at 09:00 AM on 2023-10-02.
                  </Text>
                  <Text weight={700}>Session Duration</Text>
                  <Text color="dimmed" size="sm">
                    Lasted for 2 hours and 30 minutes.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion>
              <Accordion.Item value="task-memory">
                <Accordion.Control>Task Memory</Accordion.Control>
                <Accordion.Panel>
                  <Text weight={700}>Task Completion Status</Text>
                  <Text color="dimmed" size="sm">
                    Task completed successfully on 2023-10-03.
                  </Text>
                  <Text weight={700}>Task Priority</Text>
                  <Text color="dimmed" size="sm">
                    Marked as high priority.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            <Accordion>
              <Accordion.Item value="one-off-memory">
                <Accordion.Control>One-off Memory</Accordion.Control>
                <Accordion.Panel>
                  <Text weight={700}>One-off Event Log</Text>
                  <Text color="dimmed" size="sm">
                    Event logged on 2023-10-04 with no recurrence.
                  </Text>
                  <Text weight={700}>Event Description</Text>
                  <Text color="dimmed" size="sm">
                    System maintenance completed without issues.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Card>

          {/* Log Stream */}
          <Card
            shadow="sm"
            withBorder
            style={{
              flex: 2,
              padding: "10px",
              maxHeight: "600px",
            }}
          >
            <Text weight={500}>Log Stream</Text>
            <input
              type="text"
              placeholder="Search logs..."
              style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const logs = document.querySelectorAll(".log-entry");
                logs.forEach((log: any) => {
                  const text = log.textContent.toLowerCase();
                  log.style.display = text.includes(searchTerm)
                    ? "block"
                    : "none";
                });
              }}
            />
            <Stack spacing="sm" mah={500} style={{ overflowY: "auto" }}>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                System initialized...
                <span style={{ float: "right" }}>10/02/2023 - 09:00:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="gray" size="xs">
                  DEBUG
                </Badge>{" "}
                Event received: Session Selected
                <span style={{ float: "right" }}>10/02/2023 - 09:05:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                Task List Agent activated...
                <span style={{ float: "right" }}>10/02/2023 - 09:10:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="yellow" size="xs">
                  WARN
                </Badge>{" "}
                Low memory warning...
                <span style={{ float: "right" }}>10/02/2023 - 09:15:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="red" size="xs">
                  ERROR
                </Badge>{" "}
                Failed to connect to database...
                <span style={{ float: "right" }}>10/02/2023 - 09:20:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                Retrying connection...
                <span style={{ float: "right" }}>10/02/2023 - 09:25:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="gray" size="xs">
                  DEBUG
                </Badge>{" "}
                Connection successful...
                <span style={{ float: "right" }}>10/02/2023 - 09:30:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                User logged in...
                <span style={{ float: "right" }}>10/02/2023 - 09:35:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="gray" size="xs">
                  DEBUG
                </Badge>{" "}
                Fetching user data...
                <span style={{ float: "right" }}>10/02/2023 - 09:40:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                User data loaded successfully...
                <span style={{ float: "right" }}>10/02/2023 - 09:45:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="yellow" size="xs">
                  WARN
                </Badge>{" "}
                High CPU usage detected...
                <span style={{ float: "right" }}>10/02/2023 - 09:50:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                System optimization started...
                <span style={{ float: "right" }}>10/02/2023 - 09:55:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="gray" size="xs">
                  DEBUG
                </Badge>{" "}
                Optimization completed...
                <span style={{ float: "right" }}>10/02/2023 - 10:00:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                System running smoothly...
                <span style={{ float: "right" }}>10/02/2023 - 10:05:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="red" size="xs">
                  ERROR
                </Badge>{" "}
                Unexpected shutdown detected...
                <span style={{ float: "right" }}>10/02/2023 - 10:10:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                System reboot initiated...
                <span style={{ float: "right" }}>10/02/2023 - 10:15:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="gray" size="xs">
                  DEBUG
                </Badge>{" "}
                Reboot successful...
                <span style={{ float: "right" }}>10/02/2023 - 10:20:00 AM</span>
              </Text>
              <Text className="log-entry" color="dimmed">
                <Badge color="blue" size="xs">
                  INFO
                </Badge>{" "}
                System back online...
                <span style={{ float: "right" }}>10/02/2023 - 10:25:00 AM</span>
              </Text>
            </Stack>
          </Card>
        </Flex>
      </Flex>
    </Card>
  );
}
