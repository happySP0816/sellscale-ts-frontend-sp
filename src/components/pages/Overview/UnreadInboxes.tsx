import { Avatar, Badge, Box, Divider, Flex, Paper, Text, useMantineTheme } from "@mantine/core";
import { nameToInitials, valueToColor } from "@utils/general";
import { useState } from "react";

export default function UnreadInboxes() {
  const theme = useMantineTheme();

  const [data, setData] = useState([
    {
      avatar: "",
      name: "Hristina Bell",
      unread_messages: ["test1", "test5", "test3", "test2"],
      login_link: "www.app.sellscale.com/token=jjkfsjdkf",
    },
    {
      avatar: "",
      name: "Adam Meehan",
      unread_messages: ["test3", "test2"],
      login_link: "www.app.sellscale.com/token=jjkfsjdkf",
    },
  ]);
  return (
    <Box>
      <Flex align={"center"} gap={"5px"}>
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            whiteSpace: "nowrap",
          }}
          fw={700}
          size={"lg"}
        >
          <span>Unread Inboxes</span>
          <Badge sx={{ background: "#228be6", color: "white" }}>{data?.length}</Badge>
        </Text>
        <Divider w={"100%"} />
      </Flex>
      {data.map((item, index) => {
        return (
          <Paper bg={"white"} my={"xs"} withBorder p={"sm"} className="flex justify-between items-center">
            <Flex align={"center"} gap={"sm"}>
              <Avatar size={"sm"} radius={"xl"} src={item.avatar} color={valueToColor(theme, item?.name)}>
                {nameToInitials(item?.name)}
              </Avatar>
              <Text fw={600} size={"sm"}>
                {item.name}
              </Text>
              <Divider orientation="vertical" />
              <Text fw={500} size={"sm"} color="gray" className="flex items-center gap-1">
                <span className=" text-red-600">{item.unread_messages.length}</span>
                Unread Messages
              </Text>
            </Flex>
            <Flex gap={"sm"}>
              <Text color="gray" fw={500} size={"sm"}>
                Login Link:
              </Text>
              <Text color="#228be6" fw={500} size={"sm"} underline>
                {item.login_link}
              </Text>
            </Flex>
          </Paper>
        );
      })}
    </Box>
  );
}
