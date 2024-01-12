import { Box, Flex, Divider, Button, Text, Collapse } from "@mantine/core";
import React, { FC } from "react";
import { IconChevronDown } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";

type Props = {
  icon?: JSX.Element;
  title?: JSX.Element | string;
  defaultOpen: boolean;
  content: React.ReactElement;
};

const CollapseItem: FC<Props> = ({
  icon,
  title,
  defaultOpen = false,
  content,
}) => {
  const [opened, { toggle }] = useDisclosure(defaultOpen);

  return (
    <Box>
      <Flex align={"center"} gap={"xs"}>
        <Flex align={"center"}>
          <>{icon}</>
        </Flex>
        {typeof title === "string" ? (
          <Text size={"sm"} fw={700}>
            {title}
          </Text>
        ) : (
          title
        )}
        <Divider style={{ flex: 1 }} />

        <Button
          variant="light"
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
          fz={"xs"}
        >
          {opened ? "HIDE EXAMPLE" : "SHOW EXAMPLE"}
        </Button>
      </Flex>

      <Collapse in={opened} mt={"md"}>
        {content}
      </Collapse>
    </Box>
  );
};

export default CollapseItem;
