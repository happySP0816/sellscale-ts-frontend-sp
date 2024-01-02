import { MantineColor, Flex, Text } from "@mantine/core";
import { FC, ReactNode } from "react";

type Props = {
  color: MantineColor;
  icon: ReactNode;
  label: string;
  percentage: string;
  total: number;
  percentageColor: MantineColor;
};

const StatDisplay: FC<Props> = ({
  color,
  icon,
  label,
  percentage,
  total,
  percentageColor,
}) => {
  return (
    <Flex align={"center"} gap={"xs"}>
      {icon}

      <Text fw={600} fz={"sm"}>
        {label}: &nbsp;
      </Text>

      <Text fw={600} fz={"sm"} c={color}>
        {total}
      </Text>

      <Text c={color} bg={percentageColor} size="8px" py={2} px={4}>
        {percentage}
      </Text>
    </Flex>
  );
};

export default StatDisplay;
