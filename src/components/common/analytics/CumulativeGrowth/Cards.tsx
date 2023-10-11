import { Checkbox, Flex, Text } from "@mantine/core";
import { IconArrowNarrowDown, IconArrowNarrowUp } from "@tabler/icons-react";
import React, { useState } from "react";

const ConversionCard: React.FC<{
  data: Conversion;
  onToggle: (value: boolean) => void;
}> = ({ data, onToggle }) => {
  return (
    <Flex
      w={"250px"}
      p={"1rem"}
      direction={"column"}
      sx={{
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: data.color,
        borderRadius: "8px",
      }}
    >
      <Flex
        w={"100%"}
        justify={"space-between"}
        align={"center"}
        mb={"0.25rem"}
      >
        <Text fz={"1rem"} color="gray.8">
          {data.title}
        </Text>
        <Checkbox
          size={"sm"}
          checked={data.active}
          onChange={({ currentTarget }) => {
            onToggle(currentTarget.checked);
          }}
          color={data?.cbColor ?? data.color}
        />
      </Flex>
      <Text fz={"1.5rem"} color="black" fw={700} mb={"0.25rem"}>
        {data.number}
      </Text>
      <Flex w={"100%"} justify={"space-between"} align={"center"}>
        <Text fz={"1rem"} color="gray.6">
          {data.description}
        </Text>
        <Flex align={"center"}>
          {Number(data.percent) >= 0 ? (
            <IconArrowNarrowUp color="green" size={"1.25rem"} />
          ) : (
            <IconArrowNarrowDown color="red" size={"1.25rem"} />
          )}
          <Text fz={"1rem"} color="gray.8">
            {data.percent}%
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

interface Conversion {
  title: string;
  description: string;
  number: string;
  percent: string;
  active: boolean;
  color: string;
  cbColor?: string;
}

const Cards = () => {
  const [conversions, setConversions] = useState<Conversion[]>([
    {
      title: "CTA #1 - Conversion",
      description: "vs Yesterday",
      number: "54,032",
      percent: "8.5",
      active: true,
      color: "#228be6",
      cbColor: "blue",
    },

    {
      title: "CTA #3 - Conversion",
      description: "vs Yesterday",
      number: "54,032",
      percent: "-8.5",
      active: false,
      color: "#dd7643",
      cbColor: "orange",
    },

    {
      title: "CTA #5 - Conversion",
      description: "vs Yesterday",
      number: "54,032",
      percent: "-8.5",
      active: false,
      color: "#419a2e",
      cbColor: "green",
    },
  ]);

  return (
    <Flex gap={"1rem"} direction={"column"} mb={"2rem"}>
      {conversions.map((e, index) => (
        <ConversionCard
          data={e}
          key={index}
          onToggle={(value) => {
            setConversions((cur) => {
              const temps = [...cur];
              temps.map((e, i) => {
                if (i === index) {
                  e.active = value;
                }
                return e;
              });
              return temps;
            });
          }}
        />
      ))}
    </Flex>
  );
};

export default Cards;
