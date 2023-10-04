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
  Tooltip,
  NumberInput,
  Flex,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconMessages,
  IconCircleMinus,
  IconRecycle,
  IconTrash,
} from "@tabler/icons";
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
  onClick?: () => void;
  includeFooter?: boolean;
  dataChannels?: MsgResponse | undefined;
  bumpedCount?: number;
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
        <Group position="apart" px={15} py={10} noWrap>
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
        {props.includeFooter && (
          <>
            <Divider />
            <Box px={20} py={10}>
              <Flex align='center' justify={'center'}>
                <Text fz={14} fw={500}>
                  Wait for
                </Text>
                <Tooltip label='Coming Soon' withinPortal withArrow>
                  <div>
                    <NumberInput
                      mx='xs'
                      w='32px'
                      placeholder="# Days"
                      variant="filled"
                      hideControls
                      sx={{ border: "solid 1px #777; border-radius: 4px;" }}
                      size="xs"
                      min={2}
                      max={99}
                      value={3}
                      disabled
                    />
                  </div>
                </Tooltip>
                <Text fz={14} fw={500}>
                  days, then:
                </Text>
              </Flex>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
