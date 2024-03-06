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
} from '@mantine/core';
import { ContextModalProps, closeAllModals, openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconSend, IconSettings, IconWriting } from '@tabler/icons';
import { IconSettingsFilled } from '@tabler/icons-react';
import { JSONContent } from '@tiptap/react';
import { postGenerateInitialEmail } from '@utils/requests/emailMessageGeneration';
import { getEmailSequenceSteps } from '@utils/requests/emailSequencing';
import { sendEmail } from '@utils/requests/sendEmail';
import DOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { EmailSequenceStep } from 'src';

interface ComposeEmail extends Record<string, unknown> {
  email: string;
  subject: string;
  body: string;
  from: string;
  prospectId: number;
  archetypeID: number;
  emailStatus: string;
  overallStatus: string;
  threadId: string;
  reply?: {
    threadSubject: string;
    messageId: string;
  };
}

export default function ComposeEmailModal({
  context,
  id,
  innerProps,
}: ContextModalProps<ComposeEmail>) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const theme = useMantineTheme();

  const [subject, setSubject] = useState(innerProps.subject);
  const [subjectPrompt, setSubjectPrompt] = useState('');

  const [body, _setBody] = useState(innerProps.body);
  // We use this to store the raw value of the rich text editor
  const bodyRich = useRef<JSONContent | string>();
  const bodyRef = useRef('');
  const [bodyPrompt, setBodyPrompt] = useState('');
  const setBody = (value: string) => {
    bodyRich.current = value;
    _setBody(value);
  };

  const [sending, setSending] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);

  const [aiGenerated, setAiGenerated] = useState(false);

  const [isFirstEmail, setIsFirstEmail] = useState(false);
  const [sequenceSteps, setSequenceSteps] = useState<EmailSequenceStep[]>([]);
  const [selectedSequenceStep, setSelectedSequenceStep] = useState<EmailSequenceStep | null>(null);

  const triggerPostGenerateInitialEmail = async () => {
    setGeneratingEmail(true);

    if (!selectedSequenceStep) {
      showNotification({
        title: 'Error',
        message: 'Please select a template, or create a new one.',
        color: 'red',
        autoClose: false,
      });
      setGeneratingEmail(false);
      return;
    }

    const result = await postGenerateInitialEmail(
      userToken,
      innerProps.prospectId,
      selectedSequenceStep?.step.id,
      null,
      null,
      null
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: 'Could not generate email.',
        color: 'red',
      });
      setGeneratingEmail(false);
      return;
    }
    const data = result.data;

    const email_body = data.email_body;
    const processed_email_body = email_body.completion.replaceAll('\n', '<br/>');
    bodyRef.current = processed_email_body;
    setBody(processed_email_body);
    setBodyPrompt(email_body.prompt);

    const subject_line = data.subject_line;
    setSubject(subject_line.completion);
    setSubjectPrompt(subject_line.prompt);

    setAiGenerated(true);
    setGeneratingEmail(false);

    return;
  };

  const triggerGetEmailSequenceSteps = async () => {
    var sequenceStatus = innerProps.emailStatus;
    if (innerProps.overallStatus === 'PROSPECTED' || innerProps.emailStatus === null) {
      setIsFirstEmail(true);
      sequenceStatus = 'PROSPECTED';
    }

    const result = await getEmailSequenceSteps(
      userToken,
      [sequenceStatus],
      [],
      [innerProps.archetypeID as number]
    );

    if (result.status !== 'success') {
      showNotification({
        title: 'Error',
        message: 'Could not get bump frameworks.',
        color: 'red',
        autoClose: false,
      });
      return;
    }

    setSequenceSteps(result.data.sequence_steps);
  };

  const triggerSendEmail = async () => {
    setSending(true);

    let body = bodyRich.current as string;
    if (typeof bodyRich.current !== 'string') {
      body = bodyRef.current;
    }

    const result = await sendEmail(
      userToken,
      innerProps.prospectId,
      subject,
      body as string,
      aiGenerated,
      innerProps.reply?.messageId
    );
    if (result.status !== 'success') {
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

  // If body was cleared, it's no longer ai generated
  useEffect(() => {
    if (body.trim().length == 0) {
      setAiGenerated(false);
    }
  }, [body]);

  useEffect(() => {
    triggerGetEmailSequenceSteps();
  }, []);

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

      <Flex pt={10} direction='column' h='400px'>
        <TextAreaWithAI
          placeholder='Subject'
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
          inputType='text-input'
        />
        <Box mt='xs'>
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

      <Flex direction='row' align='center' justify={'space-between'}>
        <Group>
          <Button.Group>
            <Button
              leftIcon={<IconWriting size='1rem' />}
              variant='outline'
              color='gray.8'
              radius={theme.radius.lg}
              size='xs'
              onClick={triggerPostGenerateInitialEmail}
            >
              Generate
            </Button>
            <Select
              withinPortal
              placeholder={sequenceSteps.length > 0 ? 'Select Template' : 'No Templates'}
              radius={0}
              size='xs'
              data={
                sequenceSteps.length > 0
                  ? sequenceSteps.map((step: EmailSequenceStep) => {
                      return {
                        value: step.step.id + '',
                        label: (step.step.default ? '🟢 ' : '⚪️ ') + step.step.title,
                      };
                    })
                  : []
              }
              styles={{
                input: { borderColor: 'black', borderRight: '0', borderLeft: '0' },
                dropdown: { minWidth: 150 },
              }}
              onChange={(value) => {
                const selected = sequenceSteps.find(
                  (step) => step.step.id === parseInt(value as string)
                );
                if (selected) {
                  setSelectedSequenceStep(selected);
                }
              }}
              value={selectedSequenceStep ? selectedSequenceStep.step.id + '' : undefined}
            />
            <Tooltip label={'Preview coming soon'} withArrow>
              <Button variant='outline' color='gray.8' radius={theme.radius.lg} size='xs'>
                {selectedSequenceStep ? (
                  <IconSettingsFilled size='1.225rem' />
                ) : (
                  <IconSettings size='1.225rem' />
                )}
              </Button>
            </Tooltip>
          </Button.Group>
        </Group>
        <Button
          radius='xl'
          leftIcon={<IconSend size='0.9rem' />}
          loading={sending}
          onClick={() => {
            if (sending || subject.length === 0 || bodyRef.current?.trim().length === 0) {
              showNotification({
                title: 'Error',
                message: 'Please fill out subject and body.',
                color: 'red',
              });
              return;
            }

            openConfirmModal({
              title: 'Send Email?',
              children: (
                <>
                  {isFirstEmail ? (
                    <>
                      <Text>
                        Please review your email carefully. After you send this, this Prospect will
                        not appear in any email campaigns! We will still manage the relationship for
                        you.
                      </Text>
                      <Box
                        sx={() => ({
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          backgroundColor: '#F5F5F5',
                        })}
                        px='md'
                        mt='sm'
                      >
                        <Text fz='sm'>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(bodyRef.current),
                            }}
                          />
                        </Text>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Text>
                        Please review your email message. We manage relationships automatically for
                        you, but you can still send emails, such as this one, manually.
                      </Text>
                      <Box
                        sx={() => ({
                          border: '1px solid #E0E0E0',
                          borderRadius: '8px',
                          backgroundColor: '#F5F5F5',
                        })}
                        px='md'
                        mt='sm'
                      >
                        <Text fz='sm'>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(bodyRef.current),
                            }}
                          />
                        </Text>
                      </Box>
                    </>
                  )}
                </>
              ),
              labels: { confirm: 'Confirm', cancel: 'Cancel' },
              onCancel: () => {
                bodyRich.current = bodyRich.current;
              },
              onConfirm: () => {
                triggerSendEmail();
              },
            });
          }}
        >
          Send {innerProps.reply ? 'Reply' : 'Email'}
        </Button>
      </Flex>
    </Paper>
  );
}
