import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons";
import React, { Fragment, useState } from "react";
const mocksData = [
  "Devops Engineer",
  "Security Engineer",
  "Security Engineer 1",
  "Security Engineer 2",
  "Security Engineer 3",
  "Security Engineer 4",
];
const Contacts = () => {
  const [topStatus, setTopStatus] = useState("");
  return (
    <Card withBorder px={0}>
      <Flex justify={"space-between"} px={"sm"}>
        <Text fw={600} fz={"lg"}>
          524 Contacts
        </Text>

        <Button compact rightIcon={<IconArrowRight />} radius={"xl"}>
          Contacts
        </Button>
      </Flex>
      <Divider my={"sm"} />

      <Box px="sm">
        <Text fw={600}>Selected Filters</Text>

        <Stack mt={"sm"}>
          <Box>
            <Text c={"gray.6"} fz={"sm"}>
              JOB TITLE
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {mocksData.map((i) => (
                <Button
                  color="green.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text c={"gray.6"} fz={"sm"}>
              INDUSTRY
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {mocksData.map((i) => (
                <Button
                  color="pink.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text c={"gray.6"} fz={"sm"}>
              EXPERIENCE
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {mocksData.map((i) => (
                <Button
                  color="orange.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text c={"gray.6"} fz={"sm"}>
              INDUSTRY
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {mocksData.map((i) => (
                <Button
                  color="blue.2"
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                  sx={{ color: "black", fontWeight: 500 }}
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>
        </Stack>
      </Box>

      <Divider my={"sm"} />

      <Box px={"sm"}>
        <Flex gap={"md"}>
          <Button
            onClick={() => setTopStatus("title")}
            style={{ flex: 1 }}
            variant={topStatus === "title" ? "filled" : "outline"}
          >
            Top Titles
          </Button>
          <Button
            onClick={() => setTopStatus("category")}
            style={{ flex: 1 }}
            variant={topStatus === "category" ? "filled" : "outline"}
          >
            Top Categories
          </Button>
          <Button
            onClick={() => setTopStatus("industry")}
            style={{ flex: 1 }}
            variant={topStatus === "industry" ? "filled" : "outline"}
          >
            Top Industry
          </Button>
        </Flex>

        {topStatus && (
          <ScrollArea
            mt={"sm"}
            h={300}
            px={"md"}
            styles={(theme) => ({
              scrollbar: {
                "&, &:hover": {
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },

                '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                  backgroundColor: theme.colors.blue[6],
                },
              },

              corner: {
                opacity: 1,
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
            })}
          >
            <Stack mt={"sm"}>
              {mocksData.map((i, idx) => (
                <Fragment key={i}>
                  <Box key={i}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Text fw={600} color="gray.8">
                        {i}
                      </Text>
                      <Text fw={600} color="gray.6">
                        100
                      </Text>
                    </Flex>
                    {mocksData.length - 1 !== idx && <Divider mt={"sm"} />}
                  </Box>
                </Fragment>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Box>
    </Card>
  );
};

export default Contacts;
