import {
  Box,
  Flex,
  Text,
  ThemeIcon,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconCheck, IconCircleCheck, IconQuestionMark } from "@tabler/icons";
import React, { FC } from "react";
type Props = {
  title: string;
  value: number;
  hook: boolean;
  description: string;
  success: boolean;
  unit?: string;
};

const Card: FC<Props> = ({
  title,
  value,
  description,
  hook,
  success,
  unit,
}) => {
  const theme = useMantineTheme();

  return (
    <Flex direction="column" h="100%">
      <Text color="gray.6" fw={600} style={{ textTransform: "uppercase" }}>
        {title}
      </Text>

      <Box mb="md">
        {!hook ? (
          <Text fz={rem(24)} fw={700}>
            True
          </Text>
        ) : (
          <>
            <Text
              fz={rem(24)}
              fw={700}
              style={{ display: "flex", alignItems: "center" }}
            >
              {value} <Text fz={rem(18)}>&nbsp;{unit}</Text>
            </Text>
            <Text color="gray.6" fw={600}>
              Message send in the last 7 days
            </Text>
          </>
        )}
      </Box>

      <Flex
        sx={(theme) => ({
          border: `1px solid ${
            success ? theme.colors.green[6] : theme.colors.yellow[6]
          }`,
          backgroundColor: success
            ? theme.colors.green[0]
            : theme.colors.yellow[0],
          borderRadius: 12,
        })}
        p="md"
        mt="auto"
        direction="column"
      >
        <Flex align={"center"} gap={"xs"}>
          {success ? (
            <>
              <ThemeIcon color="green" radius="xl" size="xs">
                <IconCheck />
              </ThemeIcon>
              <Text color="green" fw={800} size="lg">
                Success
              </Text>
            </>
          ) : (
            <>
              <ThemeIcon color="yellow" radius="xl" size="xs">
                <IconQuestionMark />
              </ThemeIcon>
              <Text color="yellow" fw={800} size="lg">
                Warning
              </Text>
            </>
          )}
        </Flex>
        <Text color="gray.6" fw={600} size="sm" mt="sm">
          {description}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Card;
