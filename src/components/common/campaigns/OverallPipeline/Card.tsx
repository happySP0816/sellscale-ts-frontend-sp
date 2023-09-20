import { Flex, Text } from "@mantine/core";
import { IconChevronsRight } from "@tabler/icons-react";
import React, { ReactNode } from "react";
const blue = "#228be6";

const Card: React.FC<{
  title: string;
  icon: ReactNode;
  value: number;
  hook: boolean;
}> = ({ title, icon, value, hook }) => {
  return (
    <Flex
      justify={"center"}
      align={"center"}
      direction={"column"}
      pos={"relative"}
      px={"0.5rem"}
      style={{
        flex: 1,
        borderRightWidth: hook ? "2px" : 0,
        borderLeft: 0,
        borderStyle: "solid",
        borderImage: `linear-gradient(#FFFFFF, ${blue}, #FFFFFF) 0 100%`,
      }}
    >
      <Flex justify={"center"} align={"center"} gap={"0.5rem"} mb={"0.5rem"}>
        {icon}
        <Text size={"0.75rem"} color="gray.6" fw={600}>
          {title}
        </Text>

        <Text weight={700} size={"0.75rem"}>
          {value}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Card;
