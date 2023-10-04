import { currentProjectState } from "@atoms/personaAtoms";
import {
  Card,
  Stack,
  Group,
  ActionIcon,
  Badge,
  Divider,
  Box,
  Text,
  Center,
  NumberInput,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconMessages,
  IconCircleMinus,
  IconRecycle,
  IconTrash,
} from "@tabler/icons";
import { Tooltip, Title } from "chart.js";
import _ from "lodash";
import { ReactNode } from "react";
import { useRecoilValue } from "recoil";
import { BumpFramework, EmailSequenceStep, MsgResponse } from "src";

export default function EmailSequenceStepCard(props: {
  active: boolean;
  sequenceBucket?: {
    total: number;
    templates: EmailSequenceStep[];
  };
  title: string;
  templateTitle: string;
  content?: string;
  dataChannels?: MsgResponse | undefined;
  afterCreate: () => void;
  afterEdit: () => void;
  bumpedCount?: number;
  onClick?: () => void;
  footer?: ReactNode;
}) {
  const { hovered, ref } = useHover();

  return (
    <Card
      ref={ref}
      p={0}
      radius="md"
      w={"100%"}
      withBorder
      onClick={() => {
        if (props.onClick) {
          props?.onClick();
        }
      }}
      sx={(theme) => ({
        cursor: "pointer",
        backgroundColor: props.active
          ? theme.fn.lighten(
            theme.fn.variant({ variant: "filled", color: "blue" })
              .background!,
            0.95
          )
          : hovered
            ? theme.fn.lighten(
              theme.fn.variant({ variant: "filled", color: "blue" })
                .background!,
              0.99
            )
            : undefined,
        borderColor:
          props.active || hovered
            ? theme.colors.blue[5] + "!important"
            : undefined,
        borderWidth: "4px",
      })}
    >
      <Stack spacing={0}>
        <Group position="apart" px={15} py={20} noWrap>
          <Group spacing={0} noWrap w={"100%"} display="flex">
            <ActionIcon
              variant="transparent"
              color="blue"
              sx={{
                cursor: "default",
              }}
            >
              <IconMessages size="1.1rem" />
            </ActionIcon>
            <Text ml='xs' fw={800} sx={{ whiteSpace: "nowrap" }} color="gray.6">
              {props.title}
            </Text>
            {props.bumpedCount && (
              <Badge color="gray" size="sm" ml={"0.5rem"}>
                If no reply from prospect
              </Badge>
            )}


            <ActionIcon ml="auto" color="gray.9" size='sm'>
              <IconTrash />
            </ActionIcon>
          </Group>
        </Group>
        <Divider />
        <Box px={20} py={10}>
          <Text fw={700} size="xl">
            {props.templateTitle}
          </Text>
          <Text size={"sm"} fw={500} color="gray.5">
            {props.content}
          </Text>
        </Box>
        {props.footer && (
          <>
            <Divider />
            <Box px={20} py={10}>
              {props.footer}
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
