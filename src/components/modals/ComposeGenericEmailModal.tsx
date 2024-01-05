import { userDataState, userTokenState } from '@atoms/userAtoms';
import FlexSeparate from '@common/library/FlexSeparate';
import RichTextArea from '@common/library/RichTextArea';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  TextInput,
  Flex,
  Group,
  Center,
  Button,
  Textarea,
  LoadingOverlay,
  Collapse,
  Card,
  Select,
  Tooltip,
  Box,
  Stack,
  MultiSelect,
} from '@mantine/core';
import { ContextModalProps, closeAllModals, openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconSend, IconSettings, IconWriting } from '@tabler/icons';
import { IconSettingsFilled } from '@tabler/icons-react';
import { JSONContent } from '@tiptap/react';
import { postGenerateInitialEmail } from '@utils/requests/emailMessageGeneration';
import { getEmailSequenceSteps } from '@utils/requests/emailSequencing';
import { sendEmail, sendGenericEmail } from '@utils/requests/sendEmail';
import DOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { EmailSequenceStep } from 'src';

interface ComposeEmail extends Record<string, unknown> {
  title: string;
  from: string;
  to: string[];
  bcc: string[];
  subject: string;
  body: string;
  onSend: () => void;
  onDiscard: () => void;
}

export default function ComposeGenericEmailModal({
  context,
  id,
  innerProps,
}: ContextModalProps<ComposeEmail>) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const theme = useMantineTheme();
  const [sending, setSending] = useState(false);

  const [subject, setSubject] = useState(innerProps.subject);
  const [subjectPrompt, setSubjectPrompt] = useState('');

  const [body, _setBody] = useState(innerProps.body);
  // We use this to store the raw value of the rich text editor
  const bodyRich = useRef<JSONContent | string>(innerProps.body);
  const bodyRef = useRef('');
  const [bodyPrompt, setBodyPrompt] = useState('');
  const setBody = (value: string) => {
    bodyRich.current = value;
    _setBody(value);
  };

  const [fromEmail, setFromEmail] = useState(innerProps.from);
  const [toEmails, setToEmails] = useState(innerProps.to);
  const [bccEmails, setBccEmails] = useState(innerProps.bcc);

  const [toEmailsData, setToEmailsData] = useState<string[]>(innerProps.to);
  const [bccEmailsData, setBccEmailsData] = useState<string[]>(innerProps.bcc);

  const triggerSendEmail = async () => {
    setSending(true);

    let body = bodyRich.current as string;
    if (typeof bodyRich.current !== 'string') {
      body = bodyRef.current;
    }

    const response = await sendGenericEmail(
      userToken,
      innerProps.from,
      innerProps.to,
      innerProps.bcc,
      subject,
      body
    );

    if (response.status !== 'success') {
      showNotification({
        title: 'Error',
        message: 'Could not send email.',
        color: 'red',
      });
      setSending(false);
      return;
    }

    showNotification({
      title: 'Success',
      message: 'Email sent.',
      color: 'green',
    });
    setSending(false);

    closeAllModals();
    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        minHeight: 400,
      }}
    >
      <Stack>
        <Group noWrap>
          <Text c='gray.6' fz='sm' fw={500} span>
            FROM:
          </Text>{' '}
          <TextInput variant='unstyled' placeholder='Email' value={innerProps.from} />
        </Group>
        <Group noWrap>
          <Text c='gray.6' fz='sm' fw={500} span>
            TO:
          </Text>{' '}
          <MultiSelect
            value={toEmails}
            onChange={(value) => {
              setToEmails(value);
            }}
            data={toEmailsData}
            placeholder='Emails'
            searchable
            creatable
            getCreateLabel={(query) => `+ Add ${query}`}
            onCreate={(query) => {
              const item = { value: query, label: query };
              // @ts-ignore
              setToEmailsData((current) => [...current, item]);
              return item;
            }}
          />
        </Group>
        <Group noWrap>
          <Text c='gray.6' fz='sm' fw={500} span>
            BCC:
          </Text>{' '}
          <MultiSelect
            value={bccEmails}
            onChange={(value) => {
              setBccEmails(value);
            }}
            data={bccEmailsData}
            placeholder='Emails'
            searchable
            creatable
            getCreateLabel={(query) => `+ Add ${query}`}
            onCreate={(query) => {
              const item = { value: query, label: query };
              // @ts-ignore
              setBccEmailsData((current) => [...current, item]);
              return item;
            }}
          />
        </Group>
      </Stack>

      <Flex mt='xs' direction='column'>
        <TextAreaWithAI
          placeholder='Subject'
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
          inputType='text-input'
        />
        <Box>
          <RichTextArea
            onChange={(value, rawValue) => {
              bodyRich.current = rawValue;
              bodyRef.current = value;
            }}
            value={bodyRich.current}
            height={250}
          />
        </Box>
      </Flex>

      <Flex pt={10}>
        <Button
          radius='xl'
          leftIcon={<IconSend size='0.9rem' />}
          loading={sending}
          onClick={triggerSendEmail}
        >
          Send Email
        </Button>
      </Flex>
    </Paper>
  );
}
