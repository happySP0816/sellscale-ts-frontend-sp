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
import { LinkedInMessage, ProspectEmail } from "src/main";
import { useQuery } from "react-query";
import getEmails from "@utils/requests/getEmails";
import _ from "lodash";
import { openContextModal } from "@mantine/modals";

export default function ProspectDetailsViewEmails(props: {
  prospectId: number;
}) {
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-emails-${props.prospectId}`],
    queryFn: async () => {
      const response = await getEmails(userToken, props.prospectId);
      const result =
        response.status === "success" ? (response.extra as ProspectEmail[]) : [];

      return result;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      <Group position="apart">
        <Text weight={700} size="lg">
          Recent Emails
        </Text>
      </Group>
      <Text fz="sm" c="dimmed">
        View recent emails sent by SellScale below.
      </Text>
      <ScrollArea>
        {data?.map((email) => (
          <ViewEmailButton
            prospectId={props.prospectId}
            data={email}
          />
        ))}
      </ScrollArea>
    </Card>
  );
}

function ViewEmailButton(props: {
  prospectId: number;
  data: ProspectEmail,
}) {
  return (
    <Button
      fullWidth
      my='xs'
      variant="light"
      onClick={() => {
        openContextModal({
          modal: 'viewEmail',
          title: (
            <Group>
              <Title order={4}>{props.data.first_name} {props.data.company}</Title>
              <Text fz="sm" fs="italic" c="dimmed">{props.data.email}</Text>
            </Group>
          ),
          innerProps: props.data,
        });
      }}
      rightIcon={<IconChevronRight size="1rem" />}
      styles={{
        root: { height: 50 },
        inner: { justifyContent: "space-between" },
        label: { flexDirection: 'column', alignItems: 'flex-start' }
      }}
    >
      <Text>{_.truncate(props.data.body.split('\n')[0], {length: 40, separator: ' '})}</Text>
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
