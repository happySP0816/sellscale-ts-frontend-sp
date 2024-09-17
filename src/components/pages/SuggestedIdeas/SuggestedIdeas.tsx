import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

export default function SuggestedIdeas() {
  const [data, setData] = useState([
    {
      status: "Alumni Outreach",
      title: "McKinsey R&I Outreach",
      content:
        "Contact Research & Intelligence alumni working at F500 companies who used to work at McKnsey before.",
      open: 33,
      lead_count: 50,
      conv: 2,
      profile_to_use: [
        {
          avatar: "",
          name: "John Doe",
        },
        {
          avatar: "",
          name: "John Doe",
        },
      ],
      linkedin: true,
    },
    {
      status: "conference outreach",
      title: "TechCon Networking",
      content:
        "Engage with professionals who attended TechCon this year and are currently working in top tech companies.",
      open: 40,
      lead_count: 75,
      conv: 5,
      profile_to_use: [
        {
          avatar: "",
          name: "Alex Turner",
        },
        {
          avatar: "",
          name: "Priya Mehra",
        },
      ],
      linkedin: true,
    },
    {
      status: "webinar attendee follow-up",
      title: "AI & ML Webinar Outreach",
      content:
        "Reach out to attendees of the recent AI & ML webinar who showed high engagement during the event.",
      open: 45,
      lead_count: 60,
      conv: 4,
      profile_to_use: [
        {
          avatar: "",
          name: "Leon Mishkis",
        },
        {
          avatar: "",
          name: "Sarah Lee",
        },
      ],
      linkedin: true,
    },
    {
      status: "Competitor Employee Engagement",
      title: "Competitor Alumni Outreach",
      content:
        "Contact employees who have recently left competitor companies and now work in mid-sized firms, targeting roles relevant to your offerings.",
      open: 37,
      lead_count: 80,
      conv: 2,
      profile_to_use: [
        {
          avatar: "",
          name: "Daniel Green",
        },
        {
          avatar: "",
          name: "Emily Ross",
        },
      ],
      linkedin: true,
    },
  ]);
  return (
    <Paper px={60} py={"xl"}>
      <Stack spacing={"md"}>
        <Box>
          <Title order={3}>Suggested Ideas (Beta)</Title>
          <Text size={"sm"} fw={500} color="gray" mt={"xs"}>
            Selix auto-surface unique campaign ideas. Lorem ipsum dolor sit
            amet, consetetur adipiscing elit.
          </Text>
          <Divider mt={"sm"} />
        </Box>
        <SimpleGrid cols={3} spacing={"md"}>
          {data.map((item, index) => {
            return (
              <Paper
                withBorder
                radius={"sm"}
                p={"sm"}
                key={index}
                bg={"#fcfcfd"}
              >
                <Stack spacing={"sm"}>
                  <Badge radius={"sm"} w={"fit-content"} color="green">
                    {item.status}
                  </Badge>
                  <Text size={"md"} fw={600}>
                    {item.title}
                  </Text>
                  <Text size={"xs"} color="gray" fw={500} lineClamp={3}>
                    {item.content}{" "}
                    <span className="text-[#228be6] font-semibold">
                      View more
                    </span>
                  </Text>
                  <Paper withBorder p={"sm"} radius={"sm"} my={4}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Box>
                        <Text align="center" size={"md"} fw={600}>
                          {item.open}%
                        </Text>
                        <Text size={"xs"} align="center" fw={500} color="gray">
                          Est. Open %
                        </Text>
                      </Box>
                      <Divider orientation="vertical" />
                      <Box>
                        <Text size={"md"} fw={600} align="center">
                          {item.lead_count}+
                        </Text>
                        <Text size={"xs"} fw={500} color="gray" align="center">
                          Est. Lead Count %
                        </Text>
                      </Box>
                      <Divider orientation="vertical" />
                      <Box>
                        <Text size={"md"} fw={600} align="center">
                          {item.conv}+
                        </Text>
                        <Text size={"xs"} fw={500} color="gray" align="center">
                          Est. Conv #
                        </Text>
                      </Box>
                    </Flex>
                  </Paper>
                  <Flex align={"center"} justify={"space-between"}>
                    <Box>
                      <Text size={"sm"} color="gray" fw={500}>
                        Profile to use:
                      </Text>
                      <Flex align={"center"} gap={"xs"}>
                        {item.profile_to_use?.map(
                          (profileItem, profileIndex) => {
                            return (
                              <Flex align={"center"} key={profileIndex}>
                                <Avatar
                                  size={"sm"}
                                  radius={"xl"}
                                  src={profileItem.avatar}
                                />
                                <Text size={"sm"} fw={500}>
                                  {profileItem.name}
                                </Text>
                              </Flex>
                            );
                          }
                        )}
                      </Flex>
                    </Box>
                    <Box>
                      <Text size={"sm"} color="gray" fw={500}>
                        Channels:
                      </Text>
                      <Flex align={"center"} gap={"xs"}>
                        <IconBrandLinkedin color="white" fill="#228be6" />
                        <Text size={"sm"} fw={500} ml={-6}>
                          LinkedIn
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <Button
                    leftIcon={<IconSparkles color="white" />}
                    color="grape"
                  >
                    Request via Selix
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
