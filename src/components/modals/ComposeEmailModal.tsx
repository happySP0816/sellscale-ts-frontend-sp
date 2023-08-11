import { userDataState, userTokenState } from '@atoms/userAtoms';
import FlexSeparate from '@common/library/FlexSeparate';
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
} from '@mantine/core';
import { ContextModalProps, closeAllModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconSend } from '@tabler/icons';
import { generateEmail, getEmailGenerationPrompt } from '@utils/requests/generateEmail';
import { getEmailBumpFrameworks } from '@utils/requests/getBumpFrameworks';
import { getEmailFollowupPrompt } from '@utils/requests/getEmailFollowupPrompt';
import { sendEmail } from '@utils/requests/sendEmail';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import { EmailBumpFramework } from 'src';

interface ComposeEmail extends Record<string, unknown> {
  email: string;
  subject: string;
  body: string;
  from: string;
  prospectId: number;
  archetypeId: number;
  overallStatus: string;
  threadId: string;
  reply?: {
    threadSubject: string;
    messageId: string;
  };
}

export default function ComposeEmailModal({ context, id, innerProps }: ContextModalProps<ComposeEmail>) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const theme = useMantineTheme();

  const [subject, setSubject] = useState(innerProps.subject);

  const [body, setBody] = useState(innerProps.body);
  const bodyRef = useRef('');

  const [sending, setSending] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);

  const [aiGenerated, setAiGenerated] = useState(false);

  const [fetchedEmailGenerationPrompt, setFetchedEmailGenerationPrompt] = useState(false);
  const [fetchingEmailGenerationPrompt, setFetchingEmailGenerationPrompt] = useState(false);
  const [emailGenerationPrompt, setEmailGenerationPrompt] = useState('');
  const [collapseOpened, setCollapseOpened] = useState(false);

  const [bumpFrameworks, setBumpFrameworks] = useState<EmailBumpFramework[]>([]);
  const [selectedBumpFramework, setSelectedBumpFramework] = useState<EmailBumpFramework | null>(null);

  const triggerGetBumpFrameworks = async () => {

    const result = await getEmailBumpFrameworks(userToken, [innerProps.overallStatus], [], [innerProps.archetypeID as number]);

    if (result.status !== 'success') {
      showNotification({
        title: 'Error',
        message: 'Could not get bump frameworks.',
        color: 'red',
        autoClose: false,
      });
      return;
    }
    setBumpFrameworks(result.data.bump_frameworks);

  };

  const fetchEmailGenerationPrompt = async (overrideFrameworkID?: number) => {
    setFetchingEmailGenerationPrompt(true);
    const response = await getEmailGenerationPrompt(userToken, innerProps.prospectId, overrideFrameworkID || selectedBumpFramework?.id);
    setFetchingEmailGenerationPrompt(false);
    if (response.status === 'success') {
      setEmailGenerationPrompt(response.data.prompt);
    }
  };

  const fetchEmailFollowupGenerationPrompt = async () => {
    setFetchedEmailGenerationPrompt(true);
    const response = await getEmailFollowupPrompt(
      userToken,
      innerProps.prospectId,
      innerProps.threadId,
    );

    if (response.status === 'success') {
      setEmailGenerationPrompt(response.data.data);
    }
  };

  // If body was cleared, it's no longer ai generated
  useEffect(() => {
    if (bodyRef.current.trim().length == 0) {
      setAiGenerated(false);
    }
  }, [bodyRef.current]);

  useEffect(() => {
    if (!fetchedEmailGenerationPrompt) {
      if (innerProps.reply) {
        fetchEmailFollowupGenerationPrompt();
      } else {
        fetchEmailGenerationPrompt();
      }
      setFetchedEmailGenerationPrompt(true);
    }
  }, [fetchedEmailGenerationPrompt]);

  useEffect(() => {
    if (innerProps.reply) {
      triggerGetBumpFrameworks();
    }
  }, [])

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        minHeight: 400,
      }}
    >
      <LoadingOverlay visible={generatingEmail} />
      <Group position='apart' px={10} pt={10}>
        <Text>From: {innerProps.from}</Text>
        <Text>To: {innerProps.email}</Text>
      </Group>

      <div style={{ paddingTop: 10 }}>
        <TextAreaWithAI
          placeholder='Subject'
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
          inputType='text-input'
        />
        <TextAreaWithAI
          value={body}
          onChange={(e) => {
            bodyRef.current = e.currentTarget.value;
            if (e.defaultPrevented) {
              setBody(e.currentTarget.value);
            }
          }}
          inputType='rich-text-area'
        />
      </div>

      <Center mt={15}>
        {innerProps.reply &&
          <Select
            data={
              bumpFrameworks.length > 0 ? (bumpFrameworks.map((framework) => ({
                value: framework.id + '',
                label: framework.title,
              })) as any) : []
            }
            placeholder='Select a framework'
            disabled={bumpFrameworks.length === 0}
            radius='xl'
            mr='lg'
            value={selectedBumpFramework?.id + ''}
            onChange={(newVal) => {
              if (bumpFrameworks) {
                const selected = bumpFrameworks.find((framework) => framework.id === parseInt(newVal as string));
                setSelectedBumpFramework(selected as EmailBumpFramework);
              }
              fetchEmailGenerationPrompt(parseInt(newVal as string));
            }}
          />
        }
        <Button
          size='sm'
          radius='xl'
          variant='light'
          mr='lg'
          color='grape'
          disabled={!emailGenerationPrompt}
          onClick={async () => {
            setGeneratingEmail(true);
            generateEmail(userToken, emailGenerationPrompt)
              .then((response) => {
                if (response.status === 'success') {
                  setSubject(response.data.subject);
                  const body = response.data.body.replace(/\n/gm, '<br>');
                  setBody(body);
                  bodyRef.current = body;
                  setAiGenerated(true);
                }
              })
              .catch((e) => {
                console.log(e);
              })
              .finally(() => {
                setGeneratingEmail(false);
              });
          }}
        >
          Generate Email with AI
        </Button>
        <Button
          radius='xl'
          leftIcon={<IconSend size='0.9rem' />}
          loading={sending}
          onClick={async () => {
            setSending(true);
            const result = await sendEmail(
              userToken,
              innerProps.prospectId,
              subject,
              bodyRef.current,
              aiGenerated,
              innerProps.reply?.messageId
            );
            closeAllModals();
            context.closeModal(id);
          }}
        >
          Send {innerProps.reply ? 'Reply' : 'Email'}
        </Button>
      </Center>

      <Card mt='md'>
        <Button
          size='xs'
          radius='xl'
          variant='outline'
          mr='lg'
          color='gray'
          onClick={() => setCollapseOpened(!collapseOpened)}
        >
          {!collapseOpened ? 'View' : 'Hide'} Email {!innerProps.reply ? 'Generation' : 'Followup'} Prompt
        </Button>
        <Button
          size='xs'
          radius='xl'
          variant='outline'
          mr='lg'
          color='gray'
          onClick={() => {
            if (innerProps.reply) {
              fetchEmailFollowupGenerationPrompt();
            } else {
              fetchEmailGenerationPrompt()
            }
          }}
        >
          Regenerate Email {!innerProps.reply ? 'Generation' : 'Followup'} Prompt
        </Button>
        <Collapse in={collapseOpened} mt='sm'>
          <LoadingOverlay visible={fetchingEmailGenerationPrompt} />
          <Textarea
            mt='sm'
            label='Email Generation Prompt'
            description=" This is the prompt that is being used to generate the email. Feel free to edit it to your liking and then click the 'Generate Email with AI' button to generate a new email."
            value={emailGenerationPrompt}
            minRows={10}
            onChange={(e: any) => setEmailGenerationPrompt(e.target.value)}
          />
        </Collapse>
      </Card>
    </Paper>
  );
}
