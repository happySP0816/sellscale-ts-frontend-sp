import { Box, Card, Flex, Switch, Text, Tooltip } from "@mantine/core";
import { IconLeaf } from "@tabler/icons-react";
import {
  IconChecks,
  IconMessageCheck,
  IconSend,
  IconUsers,
} from "@tabler/icons-react";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { MdEmail } from "@react-icons/all-files/md/MdEmail";
import React, { useMemo } from "react";
import { useHover } from '@mantine/hooks';

const CampaignSequenceDAG: React.FC<{
  type: "linkedin" | "email" | "nurture";
  enabled: boolean;
  active: boolean;
  onToggle: (value: boolean) => void;
  onChannelClick: () => void;
  numbers: number[];
}> = ({
  type = "linkedin",
  enabled = true,
  active = true,
  onToggle,
  onChannelClick,
  numbers = [],
}) => {
    const { hovered, ref } = useHover();

    const renderLabel = useMemo(() => {
      if (type === "linkedin") {
        return (
          <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
            <FaLinkedin color={active ? "#228BE6" : "#868E96"} size={"1.25rem"} />
            <Text fw={"700"} fz={"1rem"} color={active ? "blue.6" : "gray.6"}>
              Linkedin
            </Text>
          </Flex>
        );
      }
      if (type === "email") {
        return (
          <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
            <MdEmail color={active ? "#228BE6" : "#868E96"} size={"1.25rem"} />
            <Text fw={"700"} fz={"1rem"} color={active ? "blue.6" : "gray.6"}>
              Email
            </Text>
          </Flex>
        );
      }
      if (type === "nurture") {
        return (
          <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
            <IconLeaf color={active ? "#228BE6" : "#868E96"} size={"1.25rem"} />
            <Text fw={"700"} fz={"1rem"} color={active ? "blue.6" : "gray.6"}>
              Nurture
            </Text>
          </Flex>
        );
      }
    }, [type, active]);

    return (
      <Tooltip
        withArrow
        position="bottom"
        label={type !== 'nurture' ? "Click to edit the " + type + " sequence" : "Nurture editing coming soon."}
      >
        <Card
          p={"1rem"}
          radius={8}
          sx={{
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: active ? "#228BE6" : "#E9ECEF",
            backgroundColor: hovered && type !== 'nurture' ? "#f7f7f7" : "#FFFFFF",
          }}
          ref={ref}
          miw={300}
          onClick={onChannelClick}
        >
          <Flex
            align={"center"}
            justify={"space-between"}
            gap={"0.5rem"}
            mb={"1rem"}
          >
            {renderLabel}
            <span>
              <Switch
                checked={enabled}
                onChange={({ currentTarget: { checked } }) => {
                  onToggle && onToggle(checked)
                }}
              />
            </span>
          </Flex>
          <Box onClick={onChannelClick}>
            <Flex
              align={"center"}
              justify={"space-between"}
              gap={"0.5rem"}
              mb={"0.5rem"}
            >
              <Flex gap={"0.25rem"} align={"center"}>
                <IconSend size="0.75rem" color="#868E96" />
                <Text fw={"600"} fz={"0.6rem"} color="gray.6">
                  Send:
                </Text>
                <Text fw={"600"} fz={"0.6rem"} color="gray.8">
                  {hovered ? numbers[0] ?? 0 : Math.round(numbers[0] / (numbers[0] + 0.0001) * 100) + '%'}
                </Text>
              </Flex>

              <Flex gap={"0.25rem"} align={"center"}>
                <IconChecks size="0.75rem" color="#868E96" />
                <Text fw={"600"} fz={"0.6rem"} color="gray.6">
                  Opens:
                </Text>
                <Text fw={"600"} fz={"0.6rem"} color="gray.8">
                  {hovered ? numbers[1] ?? 0 : Math.round(numbers[1] / (numbers[0] + 0.0001) * 100) + '%'}
                </Text>
              </Flex>

              <Flex gap={"0.25rem"} align={"center"}>
                <IconMessageCheck size="0.75rem" color="#868E96" />
                <Text fw={"600"} fz={"0.6rem"} color="gray.6">
                  Replies:
                </Text>
                <Text fw={"600"} fz={"0.6rem"} color="gray.8">
                  {hovered ? numbers[2] ?? 0 : Math.round(numbers[2] / (numbers[0] + 0.0001) * 100) + '%'}
                </Text>
              </Flex>
            </Flex>
          </Box>

        </Card>
      </Tooltip>
    );
  };

export default CampaignSequenceDAG;
