import { userDataState, userTokenState } from '@atoms/userAtoms';
import { openComposeEmailModal } from '@common/prospectDetails/ProspectDetailsViewEmails';
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  ScrollArea,
  LoadingOverlay,
  Badge,
  Group,
  Avatar,
  Flex,
  Button,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { convertDateToLocalTime, nameToInitials, valueToColor } from '@utils/general';
import { getEmailMessages } from '@utils/requests/getEmails';
import DOMPurify from 'isomorphic-dompurify';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import { ProspectEmail } from 'src';

export default function ViewEmailThreadModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ prospectId: number; threadId: string }>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-email-messages-${innerProps.prospectId}`],
    queryFn: async () => {
      const response = await getEmailMessages(userToken, innerProps.prospectId, innerProps.threadId);
      return response.status === 'success' ? response.data : [];
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      }}
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      <ScrollArea mih={200}>
        {data?.map((email: any, index: number) => (
          <Paper
            withBorder
            key={index}
            my={10}
            p={10}
            style={{
              position: 'relative',
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            }}
          >
            <Flex>
              <Avatar
                src={null}
                alt={email.message_from[0]?.name}
                color={valueToColor(theme, email.message_from[0]?.name || 'default-color')}
                radius={45}
                size={45}
                mt={5}
                mr={10}
              >
                {nameToInitials(email.message_from[0]?.name)}
              </Avatar>
              <div>
                <Text>
                  <b>{email.message_from[0]?.name}</b> replied
                </Text>
                <Badge color='gray' variant='outline' size='sm' styles={{ root: { textTransform: 'initial' } }}>
                  To: {email.message_to[0]?.email}
                </Badge>
                {/* TODO: Include Cc-ed */}
                <div
                  style={{ marginTop: 10 }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(email.body),
                  }}
                />
                <Text sx={{ position: 'absolute', top: 10, right: 10 }} fz='sm' c='dimmed'>
                  {convertDateToLocalTime(new Date(email.date_received))}
                </Text>
              </div>
            </Flex>

            {index === data.length - 1 && (
              <Button
                sx={{ position: 'absolute', bottom: 10, right: 10 }}
                onClick={() => {
                  context.closeModal(id);
                  openComposeEmailModal(
                    userToken,
                    email.prospect_id,
                    email.prospect_email,
                    email.sdr_email,
                    '',
                    '',
                    {
                      threadSubject: email.subject,
                      messageId: email.nylas_message_id,
                    }
                  );
                }}
              >
                Reply to Email
              </Button>
            )}
          </Paper>
        ))}
      </ScrollArea>
    </Paper>
  );
}
