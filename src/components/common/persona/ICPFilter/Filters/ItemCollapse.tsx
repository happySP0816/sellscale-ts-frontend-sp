import {
  Button,
  Group,
  Text,
  Collapse,
  Box,
  Flex,
  Transition,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, PropsWithChildren, ReactNode, useEffect } from "react";
import { IconChevronDown } from "@tabler/icons";

const scaleY = {
  in: { opacity: 1, transform: "scaleY(1)" },
  out: { opacity: 0, transform: "scaleY(0)" },
  common: { transformOrigin: "top" },
  transitionProperty: "transform, opacity",
};

const ItemCollapse: FC<
  PropsWithChildren<{ title: string; numberOfItem?: number }>
> = ({ children, title, numberOfItem = 0 }) => {
  const [opened, { toggle, open }] = useDisclosure(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (numberOfItem > 0) {
      // timer = setTimeout(() => {

      // }, 200);

      open();
    }

    return () => clearTimeout(timer);
  }, [numberOfItem]);

  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.colors.gray[2]}`,
        borderRadius: 12,
      })}
      p={"xs"}
    >
      <Flex onClick={toggle}>
        <Button
          variant="transparent"
          styles={{
            inner: {
              justifyContent: "space-between",
            },
            root: {
              paddingLeft: 0,
              paddingRight: 0,
            },
          }}
          rightIcon={
            <IconChevronDown
              size={"0.8rem"}
              style={{
                transitionDuration: "400ms",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transform: opened ? `rotate(${opened ? 180 : 0}deg)` : "none",
              }}
            />
          }
          w={"100%"}
        >
          <Flex align={"center"} gap={"xs"}>
            <Text>{title}</Text>
            <Badge color="gray">{numberOfItem}</Badge>
          </Flex>
        </Button>
      </Flex>

      {opened && (
        <Flex direction={"column"} gap={"sm"}>
          {children}
        </Flex>
      )}
    </Box>
  );
};

export default ItemCollapse;
