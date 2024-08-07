import { ActionIcon, Badge, Box, Collapse, Divider, Flex, Paper, SegmentedControl, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp, IconX } from "@tabler/icons";
import { useState } from "react";

export default function SelinAIPlanner() {
  const [type, setType] = useState("planner");
  return (
    <>
      {/* <SegmentedControl
        onChange={(value) => setType(value)}
        w={"50%"}
        data={[
          {
            value: "planner",
            label: (
              <Flex align={"center"} justify={"space-between"}>
                <span>Planner</span>
                <IconX size={"1rem"} />
              </Flex>
            ),
          },
          {
            value: "logs",
            label: (
              <Flex align={"center"} justify={"space-between"}>
                <span>Logs</span>
                <IconX size={"1rem"} />
              </Flex>
            ),
          },
        ]}
      /> */}
      {type === "planner" ? <PlannerComponent /> : type === "logs" ? <LogsComponent /> : <></>}
    </>
  );
}

export const PlannerComponent = () => {
  const [opened, { toggle }] = useDisclosure(true);
  const [planner, setPlanner] = useState([
    {
      title: "Create a new campaign called <XYZ>",
      date: "_ _",
    },
    {
      title: "Add a segment in campaign <XYZ>",
      date: "_ _",
    },
    {
      title: `Add a CTA - "Learn More" `,
      date: "_ _",
    },
    {
      title: "Ask for the client's Email",
      date: "_ _",
    },
  ]);
  return (
    <Paper p={"sm"} withBorder radius={"sm"}>
      <Flex w={"100%"} align={"center"} gap={"xs"}>
        <Divider label="Next in line" labelPosition="left" w={"100%"} color="gray" fw={500} />
        <ActionIcon onClick={toggle}>{opened ? <IconChevronUp size={"1rem"} /> : <IconChevronDown size={"1rem"} />}</ActionIcon>
      </Flex>
      <Collapse in={opened} p={"sm"}>
        {planner.map((item, index) => {
          return (
            <Paper withBorder p={"sm"} key={index} mb={"xs"} radius={"md"}>
              <Flex justify={"space-between"}>
                <Text className="flex gap-1 items-center" fw={600} size={"sm"}>
                  <ThemeIcon color="gray" radius={"xl"} variant="light" size={18}>
                    {index + 1}
                  </ThemeIcon>
                  {item.title}
                </Text>
                <Flex align={"center"} gap={"xs"}>
                  <Divider orientation="vertical" />
                  <Text color="gray" size={"sm"} fw={500}>
                    {item.date} ago
                  </Text>
                </Flex>
              </Flex>
            </Paper>
          );
        })}
      </Collapse>
    </Paper>
  );
};

export const LogsComponent = () => {
  const [opened, { toggle }] = useDisclosure(true);
  const [logs, setLogs] = useState([
    {
      title: "Create a new campaign called <XYZ>",
      date: "_ _",
    },
    {
      title: "Add a segment in campaign <XYZ>",
      date: "_ _",
    },
    {
      title: `Add a CTA - "Learn More" `,
      date: "_ _",
    },
    {
      title: "Ask for the client's Email",
      date: "_ _",
    },
  ]);
  return (
    <Paper p={"sm"} withBorder radius={"sm"}>
      <Flex w={"100%"} align={"center"} gap={"xs"}>
        <Divider label="Next in-line" labelPosition="left" w={"100%"} color="gray" fw={500} />
        <ActionIcon onClick={toggle}>{opened ? <IconChevronUp size={"1rem"} /> : <IconChevronDown size={"1rem"} />}</ActionIcon>
      </Flex>
      <Collapse in={opened} p={"sm"}>
        {logs.map((item, index) => {
          return (
            <Paper withBorder p={"sm"} key={index} mb={"xs"} radius={"md"}>
              <Flex justify={"space-between"}>
                <Text className="flex gap-1 items-center" fw={600} size={"sm"}>
                  <ThemeIcon color="gray" radius={"xl"} variant="light" size={18}>
                    {index + 1}
                  </ThemeIcon>
                  {item.title}
                </Text>
                <Flex align={"center"} gap={"xs"}>
                  <Divider orientation="vertical" />
                  <Text color="gray" size={"sm"} fw={500}>
                    {item.date} ago
                  </Text>
                </Flex>
              </Flex>
            </Paper>
          );
        })}
      </Collapse>
    </Paper>
  );
};
