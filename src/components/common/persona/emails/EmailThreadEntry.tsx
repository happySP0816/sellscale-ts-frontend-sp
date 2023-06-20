import {
  createStyles,
  Text,
  Avatar,
  Group,
  TypographyStylesProvider,
  Paper,
  Badge,
  useMantineTheme,
  Title,
  Flex,
  Button,
  ActionIcon,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import { openComposeEmailModal } from '@common/prospectDetails/ProspectDetailsViewEmails';
import { nameToInitials, valueToColor } from "@utils/general";
import DOMPurify from "dompurify";
import _ from "lodash";
import { userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { getEmailMessages } from "@utils/requests/getEmails";
import { IconTrash } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  comment: {
    marginTop: `5px`,
    marginBottom: `5px`,
    padding: `10px`,
  },

  body: {
    paddingTop: 5,
    fontSize: theme.fontSizes.sm,
  },

  content: {
    "& > p:last-child": {
      marginBottom: 0,
    },
  },
}));

export default function EmailThreadEntry(props: {
  subject: string;
  postedAt: string;
  snippet: string;
  threadId: string;
  prospectId: number;
}) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [messages, setMessages] = useState<any>([])

  const snippet = props.snippet.replace('Unsubscribe', '');

  const triggerGetEmailMessages = async () => {
    const response = await getEmailMessages(userToken, props.prospectId, props.threadId);

    if (response.status === 'success') {
      setMessages(response.data);
    }
  }

  useEffect(() => {
    triggerGetEmailMessages();
  }, [])


  return (
    <Paper
      withBorder
      radius="md"
      className={classes.comment}
      sx={(theme) => ({
        position: "relative",
        "&:hover": {
          filter: theme.colorScheme === "dark" ? "brightness(135%)" : "brightness(95%)",
        },
        cursor: "pointer",
      })}
      onClick={() => {
        openContextModal({
          modal: "viewEmailThread",
          title: (
            <Flex w='100%' pr='6px'>
              <Flex dir="row" justify='space-between' align={'center'} w='100%'>
                <Title order={3}>
                  {props.subject}
                </Title>
                <Group>
                  <ActionIcon variant="subtle" color="blue" onClick={() => {
                    showNotification({
                      title: 'Coming Soon',
                      message: 'This feature is coming soon!',
                      color: 'yellow',
                      autoClose: 2000,
                    })
                  }}><IconTrash size="1rem" /></ActionIcon>
                  <Button
                    hidden={messages.length === 0}
                    onClick={() => {
                      if (messages.length === 0) {
                        return;
                      }
                      openComposeEmailModal(
                        userToken,
                        messages[0]?.prospect_id,
                        messages[0]?.prospect_email,
                        messages[0]?.sdr_email,
                        '',
                        '',
                        props.threadId,
                        {
                          threadSubject: messages[0]?.subject,
                          messageId: messages[0]?.nylas_message_id,
                        },
                      );
                    }}
                  >
                    Reply to Thread
                  </Button>
                </Group>
              </Flex>
            </Flex>
          ),
          innerProps: { prospectId: props.prospectId, threadId: props.threadId },
          styles: { title: { width: "100%" } }
        });
      }}
    >
      <Title order={5}>{props.subject}</Title>
      <Text
        size="xs"
        color="dimmed"
        sx={{ position: "absolute", top: 8, right: 12 }}
      >
        {props.postedAt}
      </Text>

      <TypographyStylesProvider className={classes.body}>
        <div
          className={classes.content}
          dangerouslySetInnerHTML={{
            __html: _.truncate(snippet, {
              'length': 100,
              'separator': ' '
            })
          }}
        />
      </TypographyStylesProvider>
    </Paper>
  );
}
