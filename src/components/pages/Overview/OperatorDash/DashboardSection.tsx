import React, { FC, useMemo } from "react";
import { Task } from "./OperatorDash";
import { Title, Divider, Box, Flex, Button, Collapse } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons";

const DashboardSection: FC<{
  title: string;
  tasks: Task[];
  content: React.ReactElement;
  defaultOpen?: boolean;
}> = ({ title, tasks, content, defaultOpen = true }) => {
  const [opened, { toggle }] = useDisclosure(defaultOpen);
  const color = useMemo(() => {
    if (title === "Completed tasks") {
      return "🟢";
    }
    if (title == 'Suggested segments') {
      return "✨";
    }
    return tasks[0].status !== "PENDING"
      ? "☑️"
      : tasks[0].urgency === "HIGH"
      ? "🔴"
      : tasks[0].urgency === "MEDIUM"
      ? "🟡"
      : tasks[0].urgency === "LOW"
      ? "🟢"
      : "";
  }, []);

  return (
    <Box>
      <Flex align={"center"} gap={"sm"}>
        <Title order={4}>
          {color} {title} <span style={{ fontWeight: "400" }} />
        </Title>

        <Divider style={{ flex: 1 }} />

        <Button
          variant="subtle"
          color="gray"
          onClick={toggle}
          compact
          rightIcon={
            <IconChevronDown
              size={"0.8rem"}
              style={{
                transitionDuration: "150ms",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transform: opened ? `rotate(${opened ? 180 : 0}deg)` : "none",
              }}
            />
          }
          fw={700}
          fz={"sm"}
        >
          {tasks.length} Tasks
        </Button>
      </Flex>

      <Collapse in={opened} mt={"md"}>
        {content}
      </Collapse>
    </Box>
  );
};

export default DashboardSection;
