import { Avatar, Button, Flex, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconBell, IconBriefcase, IconCalendar, IconExchange, IconMoneybag } from "@tabler/icons";
import { IconMessageQuestion } from "@tabler/icons-react";
import { useState } from "react";

export default function SelectSonarModal() {
  const [sonarType, setSonarType] = useState([
    {
      icon: <IconMoneybag size={"1.5rem"} color="#228be6" />,
      type: "Fundraise",
      content: "Capture prospects based on recent fundraising events",
    },
    {
      icon: <IconBell size={"1.5rem"} color="#228be6" />,
      type: "Promotion",
      content: "Capture prospects based on recent promotions",
    },
    {
      icon: <IconCalendar size={"1.5rem"} color="#228be6" />,
      type: "News Event",
      content: "Capture prospects based on recent news events.",
    },
    {
      icon: <IconBriefcase size={"1.5rem"} color="#228be6" />,
      type: "Job Posting",
      content: "Capture prospects based on recent job postings by organ",
    },
    {
      icon: <IconExchange size={"1.5rem"} color="#228be6" />,
      type: "Changed Job",
      content: "Capture prospects based on recent job change.",
    },
    {
      icon: <IconMessageQuestion size={"1.5rem"} color="#228be6" />,
      type: "Request",
      content: "Submit your own capture scheme for SellScale Sonar",
    },
  ]);
  return (
    <Paper>
      <Text size={"xs"} color="gray" fw={500}>
        Capture specific signals to find accounts, prospects and add them to a segment.
      </Text>
      <SimpleGrid cols={3} mt={"md"}>
        {sonarType.map((item, index) => {
          return (
            <Paper withBorder radius={"md"} p={"sm"}>
              <Flex align={"center"} gap={"xs"}>
                <Avatar color="blue" radius={"xl"}>
                  {item.icon}
                </Avatar>
                <Text size={"md"} fw={600}>
                  {item.type}
                </Text>
              </Flex>
              <Text color="gray" fw={500} size={"xs"} my={"sm"}>
                {item.content}
              </Text>
              <Button
                fullWidth
                mt={"lg"}
                onClick={() =>
                  openContextModal({
                    modal: "createfundraiseModal",
                    title: (
                      <Title order={3} className="flex items-center gap-2">
                        {item.icon} Select Sonar type
                      </Title>
                    ),
                    innerProps: {},
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "600px",
                      },
                    },
                  })
                }
              >
                Select
              </Button>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Paper>
  );
}
