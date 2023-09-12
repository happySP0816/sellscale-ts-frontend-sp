import { Card, Flex, Switch, Text } from "@mantine/core";
import { IconLeaf } from "@tabler/icons-react";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { MdEmail } from "@react-icons/all-files/md/MdEmail";
import React, { useMemo } from "react";
import { useHover } from '@mantine/hooks';

const blue = "#228be6";

const ChannelTab: React.FC<{
  type: "linkedin" | "email" | "nurture";
  enabled: boolean;
  active: boolean;
  onToggle: (value: boolean) => void;
}> = ({ type = "linkedin", enabled = true, active = true, onToggle }) => {
  const {hovered, ref} = useHover();

  const renderLabel = useMemo(() => {
    if (type === "linkedin") {
      return (
        <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
          <FaLinkedin color={active ? blue : "#868E96"} size={"1.25rem"} />
          <Text fw={"700"} fz={"1rem"} color={active ? "blue.6" : "gray.6"}>
            Linkedin
          </Text>
        </Flex>
      );
    }
    if (type === "email") {
      return (
        <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
          <MdEmail color={active ? blue : "#868E96"} size={"1.25rem"} />
          <Text fw={"700"} fz={"1rem"} color={active ? "blue.6" : "gray.6"}>
            Email
          </Text>
        </Flex>
      );
    }
    if (type === "nurture") {
      return (
        <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
          <IconLeaf color={active ? blue : "#868E96"} size={"1.25rem"} />
          <Text fw={"700"} fz={"1rem"} color={active ? "blue.6" : "gray.6"}>
            Nurture
          </Text>
        </Flex>
      );
    }
  }, [type, active]);

  return (
    <Card
      p={"1rem"}
      radius={8}
      ref={ref}
      sx={{
        borderWidth: "1px",
        borderBottomWidth: 0,
        borderRadius: "8px",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        borderStyle: "solid",
        borderColor: active ? blue : "#E9ECEF",
        cursor: 'pointer',
        backgroundColor: hovered ? '#ccffff22' : 'white'
      }}
    >
      <Flex align={"center"} justify={"space-between"} gap={"0.5rem"}>
        {renderLabel}
        <Switch
          disabled={!active}
          checked={enabled}
          size="xs"
          onChange={({ currentTarget: { checked } }) => onToggle(checked)}
        />
      </Flex>
    </Card>
  );
};

export default ChannelTab;
