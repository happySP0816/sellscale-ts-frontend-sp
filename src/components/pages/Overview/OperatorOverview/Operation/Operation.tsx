import {
  ActionIcon,
  Box,
  Collapse,
  Divider,
  Flex,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconMessage,
  IconTargetArrow,
} from "@tabler/icons";
import React, { FC } from "react";

export enum Priority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Complete = "Complete",
  ChangingMessage = "ChangingMessage",
}

type Props = {
  priority: Priority;
  renderLeft?: React.ReactNode;
  renderRight?: React.ReactNode;
  renderContent?: React.ReactNode;
};

const Operation: FC<Props> = ({
  priority,
  renderLeft,
  renderContent,
  renderRight,
}) => {
  const [opened, { toggle }] = useDisclosure(false);

  const renderIcon = () => {
    switch (priority) {
      case Priority.High:
        return (
          <ThemeIcon color="red" radius="xl" variant="light" size="xs">
            <IconTargetArrow />
          </ThemeIcon>
        );

      case Priority.Medium:
        return (
          <ThemeIcon color="yellow" radius="xl" variant="light" size="xs">
            <IconClock />
          </ThemeIcon>
        );
      case Priority.Low:
        return (
          <ThemeIcon color="green" radius="xl" variant="light" size="xs">
            <IconCalendar />
          </ThemeIcon>
        );

      case Priority.Complete:
        return (
          <ThemeIcon color="grape" radius="xl" variant="light" size="xs">
            <IconCheck />
          </ThemeIcon>
        );
      case Priority.ChangingMessage:
        return (
          <ThemeIcon color="blue" radius="xl" variant="light" size="xs">
            <IconMessage />
          </ThemeIcon>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      p={"xs"}
      sx={(theme) => ({
        border: `1px solid ${theme.colors.blue[2]}`,
        borderRadius: rem(12),
      })}
    >
      <Flex
        align={"center"}
        justify={"space-between"}
        role="button"
        sx={{ cursor: "pointer" }}
      >
        <Flex align={"center"} gap={"xs"}>
          {renderIcon()}

          {renderLeft}
        </Flex>

        <Flex align={"center"} gap={"xs"}>
          {opened || <>{renderRight}</>}
          <ActionIcon onClick={toggle}>
            <IconChevronDown
              style={{
                transitionDuration: "150ms",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transform: opened ? `rotate(${opened ? 180 : 0}deg)` : "none",
              }}
            />
          </ActionIcon>
        </Flex>
      </Flex>

      <Collapse in={opened}>
        <Divider color="gray.4" my={"sm"} />
        {renderContent}
      </Collapse>
    </Box>
  );
};

export default Operation;
