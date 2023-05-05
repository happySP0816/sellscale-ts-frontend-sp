import { userDataState, userTokenState } from "@atoms/userAtoms";
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
  ActionIcon,
} from "@mantine/core";
import {
  IconChevronRight,
  IconExternalLink,
  IconMail,
  IconPencil,
  IconPlus,
  IconRefresh,
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
import { openContextModal, closeAllModals } from "@mantine/modals";
import { convertDateToLocalTime } from "@utils/general";
import EmailThreadEntry from "@common/persona/emails/EmailThreadEntry";
import DOMPurify from "isomorphic-dompurify";
import ConnectEmailCard from "@common/library/ConnectEmailCard";
import FlexSeparate from "@common/library/FlexSeparate";
import { generateEmail } from "@utils/requests/generateEmail";

export default function ProspectDetailsViewEmails(props: {
  prospectId: number;
  email: string;
}) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-email-threads-${props.prospectId}`],
    queryFn: async () => {
      const response = await getEmailThreads(userToken, props.prospectId, 5, 0);
      return response.status === "success" ? response.extra : [];
    },
    refetchOnWindowFocus: false,
    refetchInterval: 20 * 1000, // every 20 seconds, refetch
  });

  const openComposeEmailModal = (subject: string, body: string) => {
    openContextModal({
      modal: "composeEmail",
      title: (
        <Group position="apart">
          <div>
            <Title order={4}>Email Compose</Title>
          </div>
          <div>
            <Button
              size="xs"
              radius="xl"
              variant="light"
              onClick={async () => {
                const response = await generateEmail(userToken, props.prospectId);
                if (response.status === "success") {
                  closeAllModals();
                  setTimeout(() => {
                    openComposeEmailModal(response.extra.subject, response.extra.body.replace(/\n/gm, '<br>'));
                  }, 1);
                }
              }}
            >
              AI Generate Email
            </Button>
          </div>
        </Group>
      ),
      styles: (theme) => ({
        title: {
          width: "100%",
        },
        header: {
          margin: 0,
        },
      }),
      innerProps: {
        email: props.email,
        subject: subject,
        body: body,
        from: userData.sdr_email,
        prospectId: props.prospectId,
      },
    });
  }

  return (
    <>
      <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
        <LoadingOverlay visible={isFetching && data} overlayBlur={2} />
        <FlexSeparate>
          <div>
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
          </div>
          <Flex
            direction="column"
            align="flex-end"
            gap={0}
            m={0}
            p={0}
          >
            <Button
              size="xs"
              leftIcon={<IconPencil size="1rem" />}
              onClick={() => {
                openComposeEmailModal("", "");
              }}
            >
              Compose
            </Button>
            
              <ActionIcon size="sm" pr={5} onClick={() => refetch()}>
                <IconRefresh size="0.875rem"/>
              </ActionIcon>
           
          </Flex>
        </FlexSeparate>
        <ScrollArea>
          {data?.map((emailThread: any, index: number) => (
            <EmailThreadEntry
              key={index}
              postedAt={convertDateToLocalTime(
                new Date(emailThread.last_message_timestamp)
              )}
              snippet={DOMPurify.sanitize(emailThread.snippet)}
              subject={emailThread.subject}
              threadId={emailThread.nylas_thread_id}
              prospectId={props.prospectId}
            />
          ))}
        </ScrollArea>
      </Card>
      {!userData.nylas_connected && (
        <div style={{ paddingTop: 10 }}>
          <ConnectEmailCard />
        </div>
      )}
    </>
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
