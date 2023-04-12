import { userTokenState } from "@atoms/userAtoms";
import { LinkedInConversationEntry } from "@common/persona/LinkedInConversationEntry";
import {
  Button,
  Flex,
  Title,
  Card,
  Text,
  Group,
  ScrollArea,
  Textarea,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconChevronRight,
  IconExternalLink,
  IconMail,
  IconRobot,
} from "@tabler/icons";
import { slice } from "lodash";
import displayNotification from "@utils/notificationFlow";

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { LinkedInMessage, ProspectEmail } from "src";
import { useQuery } from "@tanstack/react-query";
import { getEmailThreads } from "@utils/requests/getEmails";
import _ from "lodash";
import { openContextModal } from "@mantine/modals";
import { convertDateToLocalTime } from "@utils/general";
import EmailThreadEntry from "@common/persona/emails/EmailThreadEntry";
import DOMPurify from 'isomorphic-dompurify';

export default function ProspectDetailsViewEmails(props: {
  prospectId: number;
}) {
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-email-threads-${props.prospectId}`],
    queryFn: async () => {
      const response = await getEmailThreads(userToken, props.prospectId, 5);
      return response.status === "success" ? response.extra : [];
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      <Group position="apart">
        <Text weight={700} size="lg">
          Email Conversation
        </Text>
      </Group>
      <Group position="apart" mb="xs">
        <Text weight={200} size="xs">
          {`Last Updated: ${convertDateToLocalTime(new Date())}`}
        </Text>
      </Group>
      <ScrollArea>
        {data?.map((emailThread: any, index: number) => (
          <EmailThreadEntry
            key={index}
            postedAt={convertDateToLocalTime(
              new Date(emailThread.last_message_timestamp * 1000)
            )}
            body={DOMPurify.sanitize(emailThread.snippet)}
            name={emailThread.subject}
            threadId={emailThread.id}
            prospectId={props.prospectId}
          />
        ))}
      </ScrollArea>
    </Card>
  );
}

function ViewEmailButton(props: { prospectId: number; data: ProspectEmail }) {
  return (
    <Button
      fullWidth
      my="xs"
      variant="light"
      onClick={() => {
        openContextModal({
          modal: "viewEmail",
          title: (
            <Group>
              <Title order={4}>{props.data.subject}</Title>
              <Text fz="sm" fs="italic" c="dimmed">
                {props.data.email}
              </Text>
            </Group>
          ),
          innerProps: props.data,
        });
      }}
      rightIcon={<IconChevronRight size="1rem" />}
      styles={{
        root: { height: 50 },
        inner: { justifyContent: "space-between" },
        label: { flexDirection: "column", alignItems: "flex-start" },
      }}
    >
      <Text>
        {_.truncate(props.data.subject, { length: 40, separator: " " })}
      </Text>
      <Text fz="sm">
        {new Date(props.data.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </Text>
    </Button>
  );
}
