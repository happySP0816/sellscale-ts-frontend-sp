import { useState } from "react";
import {
  Group,
  Box,
  rem,
  Title,
  Input,
  ActionIcon,
  Flex,
  useMantineTheme,
  Tooltip,
  ThemeIcon,
  Button,
  Switch,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconInfoCircle,
  IconInfoSquare,
  IconSearch,
} from "@tabler/icons";
type Props = {
  sideBarVisible: boolean;
  toggleSideBar: () => void;
};
export function SidebarHeader({ toggleSideBar, sideBarVisible }: Props) {
  const [showGeneralSearchBar, setShowGeneralSearchBar] = useState(false);
  const [value, setValue] = useState("");
  const theme = useMantineTheme();
  return (
    <>
      <Box
        sx={(theme) => ({
          padding: theme.spacing.sm,
          borderBottom: `${rem(1)} solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          backgroundColor: theme.fn.variant({
            variant: "filled",
            color: theme.primaryColor,
          }).background,
        })}
      >
        <Group position="apart" style={{ width: "100%" }} display={"flex"}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
              justifyContent: "space-between",
            }}
            w="100%"
          >
            {sideBarVisible && <Title size={"14px"}>Filter Contacts</Title>}
            <ActionIcon
              onClick={() => toggleSideBar()}
              className="ml-auto"
              variant="filled"
              color="blue"
            >
              <IconChevronLeft
                size={24}
                // color="#fff"
                style={{
                  transform: sideBarVisible ? "" : "rotate(180deg)",
                  transition: "all",
                  transitionDuration: "150ms",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </ActionIcon>
          </Box>
        </Group>
      </Box>
      <Flex direction={"column"} gap={"0.5rem"} mt={"0.5rem"}>
        <Flex px={"md"} align={"center"} gap={"0.5rem"}>
          <Input
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search"
          />

          <Tooltip label="OK">
            <ActionIcon size={"sm"}>
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip>
        </Flex>

        <Flex px={"md"} align={"center"} gap={"0.5rem"}>
          <Button disabled={!value} style={{ flex: 1 }}>
            run scoring
          </Button>
          <Switch defaultChecked />
        </Flex>
      </Flex>
    </>
  );
}
