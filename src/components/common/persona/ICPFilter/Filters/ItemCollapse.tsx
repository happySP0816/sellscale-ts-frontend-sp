import {
  Button,
  Group,
  Text,
  Collapse,
  Box,
  Flex,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, PropsWithChildren, useEffect } from "react";
import { IconChevronDown } from "@tabler/icons";

const scaleY = {
  in: { opacity: 1, transform: "scaleY(1)" },
  out: { opacity: 0, transform: "scaleY(0)" },
  common: { transformOrigin: "top" },
  transitionProperty: "transform, opacity",
};

const ItemCollapse: FC<
  PropsWithChildren<{ title: string; defaultOpened?: boolean }>
> = ({ children, title, defaultOpened = false }) => {
  const [opened, { toggle, open }] = useDisclosure(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (defaultOpened) {
      // timer = setTimeout(() => {

      // }, 200);

      open();
    }

    return () => clearTimeout(timer);
  }, [defaultOpened]);

  return (
    <Box
      key={title}
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
          <Text>{title}</Text>
        </Button>
      </Flex>

      <Transition
        mounted={opened}
        transition={scaleY}
        duration={200}
        timingFunction="ease"
      >
        {(styles) => (
          <div style={styles}>
            <Flex direction={"column"} gap={"sm"}>
              {children}
            </Flex>
          </div>
        )}
      </Transition>
    </Box>
  );
};

export default ItemCollapse;
