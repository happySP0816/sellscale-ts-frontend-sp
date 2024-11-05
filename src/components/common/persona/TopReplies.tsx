import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Paper,
  Rating,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCalendar,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTargetArrow,
} from "@tabler/icons";
import { IconArrowRightToArc } from "@tabler/icons-react";
import { useState } from "react";

export default function TopReplies() {
  const [data, setData] = useState([
    {
      userAvatar: "",
      username: "Carl Refsal",
      icp_score: 5,
      company: "Retail Campaign",
      job: "Director of Benefits",
      location: "AutoZone",
      last_reply: "2024-01-01",
      last_reply_message:
        "Hi Rob - Let's see about setting up an informational demo in early December. If you can shoot me some dates and times that work from your end, then we can figure out a time that works.",
      replied_username: "Charlie Toney",
      reply_rating: 4.5,
      reply_status: "Occured",
      reply_feedback:
        "Has never gotten back to use yat. Let's push this closer to early December because people are busy right now because they're in open enrollment. Devin and Charlie have been going back and forth via ........",
      reply_date: "2024-10-10",
      reply_userAvatar: "",
    },
    {
      userAvatar: "",
      username: "Taylor Reynolds",
      icp_score: 4,
      company: "Healthcare Outreach",
      job: "VP of HR",
      location: "Walgreens",
      last_reply: "2024-01-01",
      last_reply_message:
        "Hey Sarah, we're still interested but need more details on how this would work with our existing system. Let's schedule another call next week to go over that.",
      replied_username: "Sarah Phillips",
      reply_rating: 4.5,
      reply_status: "Occured",
      reply_feedback:
        "Expressed concern about integration with their HR systems. The prospect seems interested but needs technical clarity. We should follow up with IT team involved...",
      reply_date: "2024-09-15",
      reply_userAvatar: "",
    },
    {
      userAvatar: "",
      username: "Alex Martinez",
      icp_score: 5,
      company: "Financial Services Initiative",
      job: "Chief Financial Officer",
      location: "Bank of America",
      last_reply: "2024-08-28",
      last_reply_message:
        "Jamie, thank you for the overview. I'm traveling for the next two weeks but would love to catch up after that.",
      replied_username: "Jamie Brown",
      reply_rating: 4.5,
      reply_status: "Occured",
      reply_feedback:
        "Prospect is positive but busy. We'll need to set a reminder to follow up around mid-November when their schedule clears up.",
      reply_date: "2024-10-10",
      reply_userAvatar: "",
    },
  ]);

  return (
    <Box>
      <Flex align={"center"} justify={"space-between"}>
        <Flex align={"center"} gap={"lg"}>
          <Text size={"lg"} fw={600}>
            Top Replies
          </Text>
          <Badge>13</Badge>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <TextInput
            w={300}
            placeholder="Search by prospect, company, ..."
            rightSection={<IconSearch size={"1rem"} color="gray" />}
          />
          <Select data={[""]} w={160} />
        </Flex>
      </Flex>
      <Flex direction={"column"} gap={"sm"} mt={"sm"}>
        {data &&
          data.map((item, index) => {
            return (
              <Flex
                className="rounded-[4px]"
                key={index}
                style={{ border: "1px solid #228be6" }}
              >
                <Paper
                  w={"100%"}
                  p={"sm"}
                  className="flex flex-col justify-between"
                  withBorder
                >
                  <Flex align={"center"} gap={"sm"} w={"100%"}>
                    <Avatar src={item.userAvatar} radius={"xl"} size={50} />
                    <Box w={"100%"}>
                      <Flex align={"center"} justify={"space-between"}>
                        <Text fw={500} size={"sm"}>
                          {item.username}
                        </Text>
                        <Anchor href="https://mantine.dev/" target="_blank">
                          <Text size={"sm"} underline>
                            View Conversion
                          </Text>
                        </Anchor>
                      </Flex>
                      <Flex align={"center"} gap={"sm"}>
                        <Text size={"xs"} fw={500} color="gray">
                          ICP Score:
                        </Text>
                        <Badge size="sm">very high</Badge>
                      </Flex>
                    </Box>
                  </Flex>
                  <Flex align={"center"} gap={4} mt={"sm"}>
                    <IconTargetArrow size={"0.8rem"} color="gray" />{" "}
                    <Text size={"xs"} color="gray">
                      {item.company}
                    </Text>
                  </Flex>
                  <Flex align={"center"} gap={4}>
                    <IconBriefcase size={"0.8rem"} color="gray" />{" "}
                    <Text size={"xs"} color="gray">
                      {item.job}, {item.location}
                    </Text>
                  </Flex>
                  <Divider my={"sm"} />
                  <Box>
                    <Flex align={"center"} justify={"space-between"}>
                      <Text size={"xs"} fw={500}>
                        Last Message From Prospect:
                      </Text>
                      <Text size={"xs"} color="gray" fw={500}>
                        {item.last_reply}
                      </Text>
                    </Flex>
                    <Paper radius={"sm"} p={"sm"} bg={"#ecf3fe"} mt={4}>
                      <Text size={"sm"} fw={400}>
                        {item.last_reply_message}
                      </Text>
                    </Paper>
                  </Box>
                </Paper>
                <Paper w={"100%"} p={"sm"} bg={"transparent"}>
                  <Flex align={"center"} justify={"space-between"}>
                    <Text size={"sm"} fw={400}>
                      Lead Status:
                    </Text>
                    <Badge size="sm">Demoing</Badge>
                  </Flex>
                  <Paper p={"sm"} withBorder mt={4}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Flex align={"center"} gap={"sm"}>
                        <Avatar
                          src={item.reply_userAvatar}
                          radius={"xl"}
                          size={50}
                        />
                        <Box>
                          <Text fw={500} size={"sm"}>
                            Demo #1 with {item.replied_username}
                          </Text>
                          <Text fw={500} color="gray" size={"xs"}>
                            {item.reply_date}
                          </Text>
                        </Box>
                      </Flex>
                      <ActionIcon>
                        <IconEdit size={"1rem"} color="gray" />
                      </ActionIcon>
                    </Flex>
                    <Flex align={"center"} gap={"xs"} mt={"sm"}>
                      <Text size={"xs"} fw={500}>
                        Status:{" "}
                        <span className="text-gray-400 ml-[4px]">
                          {item.reply_status}
                        </span>
                      </Text>
                    </Flex>
                    <Flex align={"center"}>
                      <Text size={"xs"} fw={500}>
                        Rating:
                      </Text>
                      <Rating
                        size="xs"
                        defaultValue={item.reply_rating}
                        ml={4}
                      />
                    </Flex>
                    <Flex align={"center"} gap={"xs"}>
                      <Text size={"xs"} fw={500}>
                        Feedback:{" "}
                        <span className="text-gray-400 ml-[4px]">
                          {item.reply_feedback}
                        </span>
                      </Text>
                    </Flex>
                  </Paper>
                  <Button
                    leftIcon={<IconPlus size={"1rem"} />}
                    fullWidth
                    mt={"xs"}
                  >
                    Add Demo Feedback
                  </Button>
                </Paper>
              </Flex>
            );
          })}
        <Paper withBorder radius={"sm"}></Paper>
      </Flex>
    </Box>
  );
}
