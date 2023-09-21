import { ActionIcon, Box, Button, Flex, Text } from "@mantine/core";
import {
  IconBrandTelegram,
  IconExternalLink,
  IconMessageDots,
  IconMessages,
} from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import Card from "./Card";
import { FC, useMemo } from "react";

export interface TodayActivityData {
  totalActivity: number;
  newOutreach: number;
  newBumps: number;
  newReplies: number;
}

const borderGray = "#E9ECEF";
const blue = "#228be6";
const TodayActivity: FC<{ aiActivityData: TodayActivityData }> = ({ aiActivityData }) => {
  const values = useMemo(
    () => [
      {
        name: "New Outreach",
        icon: <IconBrandTelegram size={"0.75rem"} stroke="gray.6" />,
        number: !aiActivityData.newOutreach ? 0 : aiActivityData.newOutreach,
      },
      {
        name: "Bumps",
        icon: <IconMessageDots size={"0.75rem"} stroke="gray.6" />,
        number: !aiActivityData.newBumps ? 0 : aiActivityData.newBumps,
      },
      {
        name: "AI Replies",
        icon: <IconMessageCheck size={"0.75rem"} stroke="gray.6" />,
        number: !aiActivityData.newReplies ? 0 : aiActivityData.newReplies,
      }
    ],
    [aiActivityData]
  )

  return (
    <>
      <Flex
        w="100%"
        py="0.5rem"
        justify={"space-between"}
        style={{
          borderBottom: `1px solid ${borderGray}`,
        }}
        px={"0.5rem"}
      >
        <Flex align={"center"}>
          <Text size={"0.75rem"} color="gray.6" fw={700}>
            AI Activity today &nbsp;
          </Text>
          <Text size={"0.75rem"} color="gray.8" fw={700}>
            {aiActivityData.totalActivity} touches
          </Text>
        </Flex>

        {/* <a
          href=""
          style={{
            textDecoration: "none",
            display: "flex",
            fontSize: "0.75rem",
          }}
        >
          <Text size={"0.75rem"} color="blue" fw={700} underline={false}>
            View more&nbsp;
          </Text>
          <IconExternalLink size="0.75rem" color={blue} />
        </a> */}
      </Flex>

      <Flex
        h="100%"
        p={"0.5rem"}
        bg={"white"}
        align={"center"}
        style={{
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        }}
      >
        {values.map((e, index) => {
          const isNotLastChild = index < values.length - 1;
          return (
            <Card
              title={e.name}
              icon={e.icon}
              value={e.number}
              key={index}
              hook={isNotLastChild}
            />
          );
        })}
      </Flex>
    </>
  );
};

export default TodayActivity;
