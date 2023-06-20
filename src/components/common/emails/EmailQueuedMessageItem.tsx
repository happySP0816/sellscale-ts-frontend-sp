import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Title,
  Card,
  Flex,
  LoadingOverlay,
  Text,
  Tooltip,
  useMantineTheme,
  Textarea,
} from "@mantine/core";
import { nameToInitials, valueToColor } from "@utils/general";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { useRef, useState } from "react";
import { IconEdit } from "@tabler/icons";

import { patchLIMessage } from "@utils/requests/patchLIMessage";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import DOMPurify from "dompurify";
import moment from "moment";

type MessageItemProps = {
  prospect_id: number;
  full_name: string;
  title: string;
  company: string;
  img_url: string;
  subject: string;
  body: string;
  date_scheduled_to_send: string;
};

export default function EmailQueuedMessageItem(props: MessageItemProps) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const daysDiff = Math.ceil(
    (new Date(props.date_scheduled_to_send).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      style={{
        overflow: "visible",
      }}
    >
      <Flex direction="row" mb="sm" w="100%" justify={"space-between"}>
        <Flex>
          <Flex mr="sm">
            <Avatar
              src={props.img_url}
              alt={props.full_name}
              color={valueToColor(theme, props.full_name)}
              radius="lg"
              size={50}
            >
              {nameToInitials(props.full_name)}
            </Avatar>
          </Flex>
          <Flex direction="column">
            <Text fw="bold" fz="xl">
              {props.full_name}
            </Text>
            <Text fz="md">
              {props.title} @ {props.company}
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <Badge>{moment(props.date_scheduled_to_send).format("LL")} UTC</Badge>
        </Flex>
      </Flex>
      <Box pos="relative">
        <Title order={5} px={10} py={5}>
          {props.subject}
        </Title>
        <Textarea value={props.body} autosize readOnly></Textarea>
      </Box>
    </Card>
  );
}
