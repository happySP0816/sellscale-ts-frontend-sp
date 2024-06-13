import { Flex, Paper, Text, Badge } from "@mantine/core";
import { IconBrandTelegram, IconMessageDots } from "@tabler/icons";
import { IconMessageCheck, IconSparkles } from "@tabler/icons-react";
import { FC, useMemo } from "react";

export interface TodayActivityData {
  totalActivity: number;
  newOutreach: number;
  newBumps: number;
  newReplies: number;
}

const borderGray = "#E9ECEF";
const blue = "#228be6";
const TodayActivityV2: FC<{ aiActivityData: TodayActivityData }> = ({ aiActivityData }) => {
  const values = useMemo(
    () => [
      {
        name: "Outreach",
        icon: <IconBrandTelegram size={"1.2rem"} color="#E25DEE" />,
        number: !aiActivityData.newOutreach ? 0 : aiActivityData.newOutreach,
      },
      {
        name: "Bumps",
        icon: <IconMessageDots size={"1.2rem"} color="#E25DEE" />,
        number: !aiActivityData.newBumps ? 0 : aiActivityData.newBumps,
      },
      {
        name: "AI Replies",
        icon: <IconMessageCheck size={"1.2rem"} color="#E25DEE" />,
        number: !aiActivityData.newReplies ? 0 : aiActivityData.newReplies,
      },
    ],
    [aiActivityData]
  );

  return (
    <Paper className="flex justify-between" p={"md"} radius={"sm"} bg="#F6E9F9" style={{ border: "1px solid #F0C0F6" }}>
      <Flex align={"center"} gap={6}>
        <IconSparkles color="#ECA3F3" />
        <Text size={"sm"} fw={700}>
          AI Activity today
        </Text>
        <Text size={"sm"} color="#E25DEE" fw={700}>
          {aiActivityData.totalActivity.toLocaleString()} touches
        </Text>
      </Flex>
      <Flex gap={"sm"} align={"center"}>
        {values.map((item: any, index: number) => {
          return (
            <Flex key={index} gap={"xs"} align={"center"}>
              {item.icon}
              <Text fw={500} size={14}>
                {item.name}:
              </Text>
              <Badge className="bg-[#E25DEE] text-white">{item.number}</Badge>
            </Flex>
          );
        })}
      </Flex>
    </Paper>
  );
};

export default TodayActivityV2;
