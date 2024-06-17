import { ActionIcon, Avatar, Badge, Box, Divider, Flex, Grid, Paper, Text, useMantineTheme } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";
import { getPositiveResponses } from "@utils/requests/getPersonas";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

export default function PositiveResponses() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPositiveResponses(userToken);
        if (response.status === "success") {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch positive responses:", error);
      }
    };

    fetchData();
  }, [userToken]);
  
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
          <span>Positive Responses</span>
          <Badge sx={{ background: "#228be6", color: "white" }}>{data?.length}</Badge>
        </Text>
        <Divider w={"100%"} />
        <Flex>
          <ActionIcon
            onClick={() => {
              if (page > 0) setPage((page) => (page = page - 1));
            }}
          >
            <IconChevronLeft />
          </ActionIcon>
          <ActionIcon
            onClick={() => {
              if (page < Math.ceil(data.length / 3) - 1) setPage((page) => (page = page + 1));
            }}
          >
            <IconChevronRight />
          </ActionIcon>
        </Flex>
      </Flex>
      <Grid>
        {data.slice(page * 4, page * 4 + 4).map((item, index) => {
          return (
            <Grid.Col span={3}>
              <Paper bg={"white"} my={"xs"} withBorder p={"sm"}>
                <Flex align={"center"} gap={"sm"}>
                  <Avatar size={"md"} radius={"xl"} src={item.avatar} color={valueToColor(theme, item?.name)}>
                    {nameToInitials(item?.name)}
                  </Avatar>
                  <Text fw={600} size={"sm"}>
                    {item.name}
                  </Text>
                </Flex>
                <Text color="gray" fw={600} size={"sm"} mt={4} lineClamp={3}>
                  {item.message}
                </Text>
                <Text color="gray" size={"xs"} mt={"xs"}>
                  {item.date}
                </Text>
              </Paper>
            </Grid.Col>
          );
        })}
      </Grid>
    </Box>
  );
}
