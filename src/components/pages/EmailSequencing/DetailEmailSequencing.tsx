import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import DynamicRichTextArea from '@common/library/DynamicRichTextArea';
import ProspectSelect from '@common/library/ProspectSelect';
import { PersonalizationSection } from '@common/sequence/SequenceSection';
import { API_URL, SCREEN_SIZES } from '@constants/data';
import {
  Badge,
  Box,
  Text,
  Flex,
  Grid,
  Button,
  Table,
  Switch,
  Card,
  ActionIcon,
  Tabs,
  Tooltip,
  TextInput,
  LoadingOverlay,
  Title,
  Accordion,
  Loader,
  Popover,
  Divider,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useHover, useMediaQuery } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import CreateEmailSubjectLineModal from '@modals/CreateEmailSubjectLineModal';
import EmailSequenceStepModal from '@modals/EmailSequenceStepModal';
import ManageEmailSubjectLineTemplatesModal from '@modals/ManageEmailSubjectLineTemplatesModal';
import {
  IconCheck,
  IconDatabase,
  IconEdit,
  IconPencil,
  IconPlus,
  IconReload,
  IconRobot,
  IconTrash,
  IconWritingSign,
  IconX,
} from '@tabler/icons';
import { JSONContent } from '@tiptap/react';
import {
  postGenerateFollowupEmail,
  postGenerateInitialEmail,
} from '@utils/requests/emailMessageGeneration';
import { createEmailSequenceStep, patchSequenceStep } from '@utils/requests/emailSequencing';
import { patchEmailSubjectLineTemplate } from '@utils/requests/emailSubjectLines';
import DOMPurify from 'dompurify';
import React, { FC, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { EmailSequenceStep, EmailTemplate, SpamScoreResults, SubjectLineTemplate } from 'src';
import ReactDOMServer from 'react-dom/server';
import { deterministicMantineColor } from '@utils/requests/utils';
import EmailTemplateLibraryModal from '@modals/EmailTemplateLibraryModal';
import { openConfirmModal } from '@mantine/modals';
import postCopyEmailPoolEntry from '@utils/requests/postCopyEmailLibraryItem';
import { isValidUrl } from '@utils/general';

let initialEmailGenerationController = new AbortController();
let followupEmailGenerationController = new AbortController();

const SpamScorePopover: FC<{
  subjectSpamScoreDetails?: SpamScoreResults | undefined | null;
  bodySpamScoreDetails: SpamScoreResults | undefined | null;
  hideSubjectLineScore?: boolean;
}> = ({ subjectSpamScoreDetails, bodySpamScoreDetails, hideSubjectLineScore }) => {
  if (!subjectSpamScoreDetails && !bodySpamScoreDetails) {
    return <></>;
  }

  let totalScore =
    ((subjectSpamScoreDetails?.total_score || 100) + (bodySpamScoreDetails?.total_score || 0)) / 2;
  let color = 'red';
  if (totalScore > 75) {
    color = 'green';
  } else if (totalScore > 25) {
    color = 'orange';
  }

  let subjectColor = 'red';
  if (subjectSpamScoreDetails?.total_score || 0 > 75) {
    subjectColor = 'green';
  } else if (subjectSpamScoreDetails?.total_score || 0 > 25) {
    subjectColor = 'orange';
  }

  let bodyColor = 'red';
  if (bodySpamScoreDetails?.total_score || 0 > 75) {
    bodyColor = 'green';
  } else if (bodySpamScoreDetails?.total_score || 0 > 25) {
    bodyColor = 'orange';
  }

  return (
    <>
      <Popover width={360} position='bottom' withArrow shadow='md'>
        <Popover.Target>
          <Button size='compact-sm' variant='outline' color={color}>
            Spam Score: {totalScore}%
          </Button>
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
          <Flex align='center' fz='lg'>
            <Text mr={'sm'} fw='bold'>
              Overall Score:
            </Text>
            <Text color={color} fw='bold'>
              {totalScore}
            </Text>
          </Flex>
          {subjectSpamScoreDetails && !hideSubjectLineScore && (
            <>
              <Divider my='xs' />
              <Flex align='center'>
                <Text mr={'sm'} fw='bold'>
                  Subject Line Score:
                </Text>
                <Text color={subjectColor} fw='bold'>
                  {subjectSpamScoreDetails?.total_score}
                </Text>
              </Flex>
              <Flex>
                <Flex pl='md' direction='column' fz='sm' mt='2px'>
                  <Flex>
                    <Text>Spam words:</Text>
                    <Text
                      ml='sm'
                      color={subjectSpamScoreDetails?.spam_words.length === 0 ? 'green' : 'red'}
                      fw={'bold'}
                    >
                      {subjectSpamScoreDetails?.spam_words.join(', ') || 'None'}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}
          <Divider my='xs' />
          <Flex align='center'>
            <Text mr={'sm'} fw='bold'>
              Body Score:
            </Text>
            <Text color={bodyColor} fw='bold'>
              {bodySpamScoreDetails?.total_score}
            </Text>
          </Flex>
          <Flex direction='column'>
            <Flex pl='md' direction='column' fz='sm' mt='2px'>
              <Flex>
                <Text>Read time:</Text>
                <Text
                  ml='sm'
                  color={
                    bodySpamScoreDetails?.read_minutes === 1
                      ? 'green'
                      : bodySpamScoreDetails?.read_minutes === 2
                      ? 'orange'
                      : 'red'
                  }
                  fw={'bold'}
                >
                  ~ {bodySpamScoreDetails?.read_minutes} minutes
                </Text>
              </Flex>
              <Flex>
                <Text>Spam words:</Text>
                <Text
                  ml='sm'
                  color={bodySpamScoreDetails?.spam_words.length === 0 ? 'green' : 'red'}
                  fw={'bold'}
                >
                  {bodySpamScoreDetails?.spam_words.join(', ') || 'None'}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};

const DetailEmailSequencing: FC<{
  toggleDrawer: () => void;
  currentTab: string;
  templates: EmailSequenceStep[];
  subjectLines: SubjectLineTemplate[];
  refetch: () => Promise<void>;
}> = ({ toggleDrawer, currentTab, templates, subjectLines, refetch }) => {
  const lgScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.LG})`, false, {
    getInitialValueInEffect: true,
  });
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  if (!currentProject) return <></>;

  // Page Title
  const [pageTitle, setPageTitle] = React.useState<string>('Email Sequencing');

  // Create Subject Line / Email Template
  const [createSubjectLineOpened, { open: openCreateSubject, close: closeCreateSubject }] =
    useDisclosure();
  const [
    createEmailTemplateOpened,
    { open: openCreateEmailTemplate, close: closeCreateEmailTemplate },
  ] = useDisclosure();

  // Template library
  const [bodyLibraryOpened, { open: openBodyLibrary, close: closeBodyLibrary }] =
    useDisclosure(false);
  const [subjectLibraryOpened, { open: openSubjectLibrary, close: closeSubjectLibrary }] =
    useDisclosure(false);

  // Active vs Inactive Body Templates
  const [activeTemplate, setActiveTemplate] = React.useState<EmailSequenceStep | null>(null);
  const [inactiveTemplates, setInactiveTemplates] = React.useState<EmailSequenceStep[]>([]);

  // Preview Email (Generation)
  const [prospectID, setProspectID] = React.useState<number>(0);
  const [previewEmailSubject, setPreviewEmailSubject] = React.useState<string | null>(
    'Random Subject Line'
  );
  const [previewEmailBody, setPreviewEmailBody] = React.useState<string | null>(
    'Random Email Body'
  );
  const [initialEmailLoading, setInitialEmailLoading] = React.useState<boolean>(false);
  const [followupEmailLoading, setFollowupEmailLoading] = React.useState<boolean>(false);

  // Spam Score
  const [subjectSpamScoreDetails, setSubjectSpamScoreDetails] = React.useState<SpamScoreResults>();
  const [bodySpamScoreDetails, setBodySpamScoreDetails] = React.useState<SpamScoreResults>();

  const [fetchedTemplateSpamScore, setFetchedTemplateSpamScore] = React.useState<boolean>(false);
  const [spamScore, setSpamScore] = React.useState<SpamScore | null>(null);

  useEffect(() => {
    if (fetchedTemplateSpamScore && !activeTemplate?.template) {
      return
    }
    
    fetch(`${API_URL}/ml/email/body-spam-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        email_body: activeTemplate?.template
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setSpamScore(res.score);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {

      });
      setFetchedTemplateSpamScore(true);
    }, [fetchedTemplateSpamScore, activeTemplate?.template]);

  // Trigger Generate Initial Email
  const triggerPostGenerateInitialEmail = async () => {
    if (!prospectID || !subjectLines || subjectLines.length === 0 || currentTab !== 'PROSPECTED') {
      return;
    }

    setInitialEmailLoading(true);

    try {
      const activeSubjectLines = subjectLines.filter(
        (subjectLine: SubjectLineTemplate) => subjectLine.active
      );
      const randomSubjectLineID =
        activeSubjectLines[Math.floor(Math.random() * activeSubjectLines.length)].id;

      const response = await postGenerateInitialEmail(
        userToken,
        prospectID,
        activeTemplate?.id as number,
        null,
        randomSubjectLineID as number,
        null,
        initialEmailGenerationController
      );
      if (response.status === 'success') {
        const email_body = response.data.email_body;
        const subject_line = response.data.subject_line;
        if (!email_body || !subject_line) {
          showNotification({
            title: 'Error',
            message: 'Something went wrong with generation, please try again.',
            icon: <IconX radius='sm' />,
          });
        }

        const subjectLineSpamWords = subject_line.spam_detection_results?.spam_words || [];
        let subjectLineCompletion = subject_line.completion;
        if (subjectLineSpamWords && subjectLineSpamWords.length > 0) {
          subjectLineSpamWords.forEach((badWord: string) => {
            const spannedWord =
              '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' +
              badWord +
              '</span>';
            subjectLineCompletion = subjectLineCompletion.replace(
              new RegExp(badWord, 'g'),
              spannedWord
            );
          });
        }

        const emailBodySpamWords = email_body.spam_detection_results?.spam_words || [];
        let emailBodyCompletion = email_body.completion;
        if (emailBodySpamWords && emailBodySpamWords.length > 0) {
          emailBodySpamWords.forEach((badWord: string) => {
            const spannedWord =
              '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' +
              badWord +
              '</span>';
            emailBodyCompletion = emailBodyCompletion.replace(
              new RegExp(badWord, 'g'),
              spannedWord
            );
          });
        }

        setPreviewEmailSubject(subjectLineCompletion);
        setSubjectSpamScoreDetails(subject_line.spam_detection_results);
        setPreviewEmailBody(emailBodyCompletion);
        setBodySpamScoreDetails(email_body.spam_detection_results);
      }

      setInitialEmailLoading(false);
    } catch (error) {
      // Must have been aborted. No action needed
      if (currentTab !== 'PROSPECTED') {
        setInitialEmailLoading(false);
      }
      console.log('Generation aborted');
    }
  };

  // Trigger Generate Followup Email
  const triggerPostGenerateFollowupEmail = async () => {
    if (!prospectID || currentTab === 'PROSPECTED') {
      return;
    }

    setFollowupEmailLoading(true);

    try {
      const response = await postGenerateFollowupEmail(
        userToken,
        prospectID,
        null,
        activeTemplate?.id as number,
        null,
        followupEmailGenerationController
      );
      if (response.status === 'success') {
        const email_body = response.data.email_body;
        if (!email_body) {
          showNotification({
            title: 'Error',
            message: 'Something went wrong with generation, please try again.',
            icon: <IconX radius='sm' />,
          });
        }
        const emailBodySpamWords = email_body.spam_detection_results?.spam_words || [];
        let emailBodyCompletion = email_body.completion;
        if (emailBodySpamWords && emailBodySpamWords.length > 0) {
          emailBodySpamWords.forEach((badWord: string) => {
            const spannedWord =
              '<span style="color: red; background: rgba(250, 0, 0, 0.25); padding: 0 4px 0 4px; border-radius: 3px">' +
              badWord +
              '</span>';
            emailBodyCompletion = emailBodyCompletion.replace(
              new RegExp(badWord, 'g'),
              spannedWord
            );
          });
        }

        setPreviewEmailBody(email_body.completion);
        setBodySpamScoreDetails(email_body.spam_detection_results);
      }

      setFollowupEmailLoading(false);
    } catch (error) {
      // Must have been aborted. No action needed
      if (currentTab !== 'PROSPECTED') {
        setFollowupEmailLoading(false);
      }
      setFollowupEmailLoading(true);
      console.log('Generation aborted');
    }
  };

  // Trigger Generation Router
  const triggerGenerateEmail = () => {
    // setPreviewEmailSubject('Random Subject Line');
    // setPreviewEmailBody('Random Email Body');
    followupEmailGenerationController.abort('Creating a new generation request');
    initialEmailGenerationController.abort('Creating a new generation request');

    followupEmailGenerationController = new AbortController();
    initialEmailGenerationController = new AbortController();

    setSubjectSpamScoreDetails(undefined);
    setBodySpamScoreDetails(undefined);

    if (currentTab === 'PROSPECTED') {
      triggerPostGenerateInitialEmail();
    } else {
      triggerPostGenerateFollowupEmail();
    }
  };

  // Trigger Generation
  useEffect(() => {
    triggerGenerateEmail();
  }, [prospectID, activeTemplate, subjectLines]);

  // Set Active / Inactive Templates
  useEffect(() => {
    // Get active template, everything else goes into inactive
    const activeTemplates = templates.filter((template: EmailSequenceStep) => template.default);
    const activeTemplate = activeTemplates.length > 0 ? activeTemplates[0] : null;
    let inactiveTemplates = [];
    if (activeTemplate) {
      inactiveTemplates = templates.filter(
        (template: EmailSequenceStep) => template.id != activeTemplate.id
      );
    } else {
      inactiveTemplates = templates;
    }

    setActiveTemplate(activeTemplate);
    setInactiveTemplates(inactiveTemplates);
  }, [templates]);

  useEffect(() => {
    setPreviewEmailBody(null);
    setPreviewEmailSubject(null);

    if (currentTab === 'PROSPECTED') {
      setPageTitle('Initial Email');
    } else if (currentTab === 'ACCEPTED') {
      setPageTitle('First Follow Up Email');
    } else if (currentTab.includes('BUMPED-')) {
      const bumpCount = currentTab.split('-')[1];
      const bumpToFollowupMap: Record<string, string> = {
        '1': 'Second',
        '2': 'Third',
        '3': 'Fourth',
        '4': 'Fifth',
        '5': 'Sixth',
        '6': 'Seventh',
        '7': 'Eighth',
      };
      setPageTitle(`${bumpToFollowupMap[bumpCount]} Follow Up Email`);
    }
  }, [currentTab]);

  const EmailBodySection = () => (
    <Box mt={'md'}>
      <Flex justify='flex-end' mb='md'>
        <Flex>
          <Button onClick={openBodyLibrary} variant='outline' radius='md' color='blue' mr='xs'>
            📚 Choose from Template Library
          </Button>
          <Button
            variant='light'
            leftIcon={<IconPlus size='.90rem' />}
            radius={'sm'}
            onClick={openCreateEmailTemplate}
          >
            Add Email Template
          </Button>
        </Flex>
        <EmailTemplateLibraryModal
          modalOpened={bodyLibraryOpened}
          closeModal={closeBodyLibrary}
          templateType={'BODY'}
          onSelect={(template: EmailTemplate) => {
            openConfirmModal({
              title: <Title order={3}>Use "{template.name || 'N/A'}" Template </Title>,
              children: (
                <>
                  <Text fs='italic' fz='sm'>
                    Review the details of the "{template.name || 'N/A'}" template below. You can
                    always edit the template after importing.
                  </Text>
                  <Text mt='sm' fw='light'>
                    Name:
                  </Text>
                  <TextInput value={template.name} />
                  <Text mt='md' fw='light'>
                    Description:
                  </Text>
                  <TextInput value={template.description || 'None...'} />
                  <Text mt='md' fw='light'>
                    Template:
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
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.template) }}
                      />
                    </Text>
                  </Box>
                </>
              ),
              labels: {
                confirm: 'Import',
                cancel: 'Go Back',
              },
              cancelProps: { color: 'grey', variant: 'outline' },
              confirmProps: { color: 'green' },
              onCancel: () => {},
              onConfirm: async () => {
                const bumpedCount = currentTab.includes('BUMPED-')
                  ? parseInt(currentTab.split('-')[1])
                  : null;
                const result = await postCopyEmailPoolEntry(
                  userToken,
                  template.template_type,
                  currentProject.id,
                  template.id,
                  currentTab.includes('BUMPED-') ? 'BUMPED' : currentTab,
                  bumpedCount,
                  template.transformer_blocklist
                );
                if (result.status === 'success') {
                  showNotification({
                    title: 'Success',
                    message: `Successfully imported "${template.name}" template.`,
                    color: 'green',
                  });
                  closeBodyLibrary();
                  refetch();
                } else {
                  showNotification({
                    title: 'Error',
                    message: result.message,
                    color: 'red',
                  });
                }
              },
            });
          }}
        />
        <EmailSequenceStepModal
          modalOpened={createEmailTemplateOpened}
          openModal={openCreateEmailTemplate}
          closeModal={closeCreateEmailTemplate}
          type={'CREATE'}
          backFunction={() => {
            refetch();
          }}
          isDefault={true}
          status={currentTab.includes('BUMPED-') ? 'BUMPED' : currentTab}
          archetypeID={currentProject.id}
          bumpedCount={currentTab.includes('BUMPED-') ? parseInt(currentTab.split('-')[1]) : null}
          onFinish={async (
            title: any,
            sequence: any,
            isDefault: any,
            status: any,
            substatus: any
          ) => {
            const result = await createEmailSequenceStep(
              userToken,
              currentProject.id,
              status ?? '',
              title,
              sequence,
              currentTab.includes('BUMPED-') ? parseInt(currentTab.split('-')[1]) : null,
              isDefault,
              substatus
            );
            return result.status === 'success';
          }}
        />
      </Flex>

      {/* ACTIVE TEMPLATE */}
      {activeTemplate && (
        <EmailBodyItem
          key={activeTemplate.id}
          template={activeTemplate}
          refetch={async () => {
            await refetch();
          }}
          spamScore={spamScore}
        />
      )}

      {/* INACTIVE TEMPLATES */}
      {inactiveTemplates && inactiveTemplates.length > 0 && (
        <Flex mt='md' w='100%'>
          <Accordion w='100%'>
            {inactiveTemplates.map((template: EmailSequenceStep, index: any) => {
              return (
                <Accordion.Item value={'test'}>
                  <Accordion.Control>
                    <Flex direction='row' w='100%' justify={'space-between'}>
                      <Flex direction='row' align='center'>
                        <Text fw={500}>{template.title}</Text>
                      </Flex>
                      <Flex>
                        <Tooltip label='Coming Soon' withArrow withinPortal>
                          <Text fz='sm' mr='md'>
                            Open %: <b>TBD</b>
                          </Text>
                        </Tooltip>
                        <Tooltip label='Coming Soon' withArrow withinPortal>
                          <Text fz='sm'>
                            Reply %: <b>TBD</b>
                          </Text>
                        </Tooltip>
                      </Flex>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <EmailBodyItem
                      key={template.id}
                      template={template}
                      refetch={async () => {
                        await refetch();
                      }}
                      hideHeader
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Flex>
      )}
    </Box>
  );

  return (
    <Box mt='md'>
      <Flex align={'center'} justify={'space-between'}>
        <Flex align={'center'}>
          <Text fw={700} size={'xl'}>
            Set {pageTitle}
          </Text>
        </Flex>
        {lgScreenOrLess && <Button onClick={toggleDrawer}>Open toggle</Button>}
      </Flex>

      <Box mt={'sm'}>
        <Text color='gray.6' size={'sm'} fw={600}>
          Select an email and a body.
        </Text>
      </Box>

      <Box mt={'md'}>
        <Flex align='center' justify='space-between'>
          <Flex>
            <Text color='gray.8' size={'md'} fw={700}>
              EXAMPLE EMAIL
            </Text>
          </Flex>
          <Flex align='center'>
            <Button
              mr='sm'
              size='sm'
              variant='subtle'
              compact
              leftIcon={<IconReload size='0.75rem' />}
              onClick={() => {
                setPreviewEmailBody(null);
                setPreviewEmailSubject(null);
                triggerGenerateEmail();
              }}
            >
              Regenerate
            </Button>
            <ProspectSelect
              personaId={currentProject.id}
              onChange={(prospect) => {
                if (prospect) {
                  setProspectID(prospect.id);
                }
              }}
              // onFinishLoading={() => {}}
              autoSelect
              includeDrawer
            />
          </Flex>
        </Flex>

        <Flex justify='flex-end' mt='sm'>
          <SpamScorePopover
            subjectSpamScoreDetails={subjectSpamScoreDetails}
            bodySpamScoreDetails={bodySpamScoreDetails}
          />
        </Flex>

        <Box
          mt='sm'
          px={'sm'}
          py={'md'}
          sx={(theme) => ({
            borderRadius: '12px',
            border: `1px dashed ${theme.colors.blue[5]}`,
          })}
          pos={'relative'}
        >
          {currentTab === 'PROSPECTED' && (
            <Flex mb={'md'}>
              <Flex w={80} mr='sm'>
                <Text color='gray.6' fw={500}>
                  Subject:
                </Text>
              </Flex>
              <Flex>
                {initialEmailLoading && !previewEmailSubject ? (
                  <Flex align='center'>
                    <Loader mr='sm' size={20} color='purple' />
                    <Text color='purple'>AI generating subject line...</Text>
                  </Flex>
                ) : (
                  <Text color='gray.8' fw={500}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(previewEmailSubject as string),
                      }}
                    />
                  </Text>
                )}
              </Flex>
            </Flex>
          )}
          <Flex>
            <Flex w={60} mr='md'>
              <Text color='gray.6' fw={500}>
                Body:
              </Text>
            </Flex>
            <Flex>
              {(initialEmailLoading && !previewEmailSubject) ||
              (followupEmailLoading && !previewEmailBody) ? (
                <Flex align='center'>
                  <Loader mr='sm' size={20} color='purple' />
                  <Text color='purple'>AI generating email body...</Text>
                </Flex>
              ) : (
                <Box
                  sx={() => ({
                    // border: "1px solid #E0E0E0",
                    // borderRadius: "8px",
                    // backgroundColor: "#F5F5F5",
                  })}
                >
                  <Text color='gray.8' fw={500}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(previewEmailBody as string),
                      }}
                    />
                  </Text>
                </Box>
              )}
            </Flex>
          </Flex>
        </Box>
      </Box>

      {currentTab === 'PROSPECTED' ? (
        <Tabs defaultValue='subject'>
          <Tabs.List>
            <Tabs.Tab value='subject'>Subject Lines</Tabs.Tab>

            <Tabs.Tab value='body'>Body</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='subject'>
            <Flex direction='column' w='100%'>
              <Flex justify='flex-end' align='center' mt='md'>
                <Flex align='center'>
                  <Button
                    onClick={openSubjectLibrary}
                    variant='outline'
                    radius='md'
                    color='blue'
                    mr='xs'
                  >
                    📚 Choose from Template Library
                  </Button>
                  <Button
                    variant='light'
                    leftIcon={<IconPlus size='.90rem' />}
                    radius={'sm'}
                    onClick={openCreateSubject}
                  >
                    Add Subject Line
                  </Button>
                </Flex>
                <CreateEmailSubjectLineModal
                  modalOpened={createSubjectLineOpened}
                  openModal={openCreateSubject}
                  closeModal={closeCreateSubject}
                  backFunction={() => {
                    refetch();
                  }}
                  archetypeID={currentProject.id}
                />
                <EmailTemplateLibraryModal
                  modalOpened={subjectLibraryOpened}
                  closeModal={closeSubjectLibrary}
                  templateType={'SUBJECT_LINE'}
                  onSelect={(template: EmailTemplate) => {
                    openConfirmModal({
                      title: <Title order={3}>Use "{template.name || 'N/A'}" Template </Title>,
                      children: (
                        <>
                          <Text fs='italic' fz='sm'>
                            Review the details of the "{template.name || 'N/A'}" template below. You
                            can always edit the template after importing.
                          </Text>
                          <Text mt='sm' fw='light'>
                            Name:
                          </Text>
                          <TextInput value={template.name} />
                          <Text mt='md' fw='light'>
                            Description:
                          </Text>
                          <TextInput value={template.description || 'None...'} />
                          <Text mt='md' fw='light'>
                            Template:
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
                                  __html: DOMPurify.sanitize(template.template),
                                }}
                              />
                            </Text>
                          </Box>
                        </>
                      ),
                      labels: {
                        confirm: 'Import',
                        cancel: 'Go Back',
                      },
                      cancelProps: { color: 'grey', variant: 'outline' },
                      confirmProps: { color: 'green' },
                      onCancel: () => {},
                      onConfirm: async () => {
                        const result = await postCopyEmailPoolEntry(
                          userToken,
                          template.template_type,
                          currentProject.id,
                          template.id,
                          null,
                          null,
                          template.transformer_blocklist
                        );
                        if (result.status === 'success') {
                          showNotification({
                            title: 'Success',
                            message: `Successfully imported "${template.name}" template.`,
                            color: 'green',
                          });
                          closeSubjectLibrary();
                          refetch();
                        } else {
                          showNotification({
                            title: 'Error',
                            message: result.message,
                            color: 'red',
                          });
                        }
                      },
                    });
                  }}
                />
              </Flex>
              {subjectLines.map((subjectLine: SubjectLineTemplate, index: any) => {
                return (
                  <Box w={'100%'}>
                    <SubjectLineItem
                      key={subjectLine.id}
                      subjectLine={subjectLine}
                      refetch={async () => {
                        await refetch();
                      }}
                    />
                  </Box>
                );
              })}
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value='body'>
            <EmailBodySection />
          </Tabs.Panel>
        </Tabs>
      ) : (
        <EmailBodySection />
      )}
    </Box>
  );
};

const SubjectLineItem: React.FC<{
  subjectLine: SubjectLineTemplate;
  refetch: () => Promise<void>;
}> = ({ subjectLine, refetch }) => {
  const [manageSubjectLineOpened, { open: openManageSubject, close: closeManageSubject }] =
    useDisclosure();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editedSubjectLine, setEditedSubjectLine] = React.useState(subjectLine.subject_line);

  // Edit Subject Line
  const triggerPatchEmailSubjectLineTemplate = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(
      userToken,
      subjectLine.id as number,
      editedSubjectLine,
      subjectLine.active
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: 'Successfully updated email subject line',
        color: 'green',
      });

      await refetch();
    }

    setLoading(false);
    return;
  };

  // Toggle Subject Line Active / Inactive
  const triggerPatchEmailSubjectLineTemplateActive = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(
      userToken,
      subjectLine.id as number,
      subjectLine.subject_line,
      !subjectLine.active
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: `Successfully ${
          subjectLine.active ? 'deactivated' : 'activated'
        } email subject line`,
        color: 'green',
      });

      await refetch();
    }

    setLoading(false);
    return;
  };

  return (
    <Card
      mt='sm'
      shadow='xs'
      radius={'md'}
      py={10}
      mb={5}
      sx={(theme) => ({
        border: subjectLine.active ? '1px solid ' + theme.colors.blue[4] : '1px solid transparent',
      })}
    >
      <LoadingOverlay visible={loading} />
      <Flex direction={'column'} w={'100%'}>
        <Flex gap={'0.5rem'} mb={'0.5rem'} justify={'space-between'}>
          <Flex>
            <Tooltip
              label={`Prospects: ${subjectLine.times_accepted} / ${subjectLine.times_used}`}
              withArrow
              withinPortal
            >
              <Button
                variant={'white'}
                size='xs'
                color={'blue'}
                h='auto'
                fz={'0.75rem'}
                py={'0.125rem'}
                px={'0.25rem'}
                fw={'400'}
              >
                Acceptance:{' '}
                {Math.max(Math.floor(subjectLine.times_accepted / subjectLine.times_used) || 0)}%
              </Button>
            </Tooltip>
          </Flex>

          <Flex wrap={'wrap'} gap={'1rem'} align={'center'}>
            {/* <Menu shadow="md" width={200} withinPortal withArrow>
                <Menu.Target>
                  <ActionIcon radius="xl" size="sm">
                    <IconPencil size="1.0rem" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item icon={<IconEdit size={14} />} onClick={onClickEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconTrash size={14} />}
                    onClick={onClickDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu> */}
            <Tooltip
              label={
                subjectLine.times_used > 0
                  ? 'Cannot edit subject line after it has been used'
                  : 'Edit subject line'
              }
              withinPortal
              withArrow
            >
              <ActionIcon
                size='sm'
                onClick={() => {
                  setEditing(!editing);
                }}
                disabled={subjectLine.times_used > 0}
              >
                <IconPencil size='1.0rem' />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Coming Soon' withinPortal withArrow>
              <ActionIcon size='sm' disabled={editing}>
                <IconTrash size='1.0rem' />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label={subjectLine.active ? 'Deactivate subject line' : 'Activate subject line'}
              withinPortal
              withArrow
            >
              <div>
                <Switch
                  disabled={editing}
                  checked={subjectLine.active}
                  color={'blue'}
                  size='xs'
                  onChange={({ currentTarget: { checked } }) => {
                    triggerPatchEmailSubjectLineTemplateActive();
                  }}
                />
              </div>
            </Tooltip>
          </Flex>
          <ManageEmailSubjectLineTemplatesModal
            modalOpened={manageSubjectLineOpened}
            openModal={openManageSubject}
            closeModal={closeManageSubject}
            backFunction={() => {}}
            archetypeID={subjectLine.client_archetype_id}
          />
        </Flex>

        {editing ? (
          <TextInput
            value={editedSubjectLine}
            error={
              editedSubjectLine.length > 120 && 'Subject line must be less than 120 characters'
            }
            rightSection={
              <Flex mr='150px'>
                <Button
                  size='sm'
                  h='24px'
                  mr='4px'
                  color='red'
                  onClick={() => {
                    setEditedSubjectLine(subjectLine.subject_line);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  h='24px'
                  color='green'
                  onClick={() => {
                    triggerPatchEmailSubjectLineTemplate();
                    setEditing(false);
                  }}
                  disabled={
                    editedSubjectLine === subjectLine.subject_line ||
                    editedSubjectLine.length === 0 ||
                    editedSubjectLine.length > 120
                  }
                >
                  Save
                </Button>
              </Flex>
            }
            onChange={(e) => {
              setEditedSubjectLine(e.currentTarget.value);
            }}
          />
        ) : (
          <Text fw={'400'} fz={'0.9rem'} color={'gray.8'}>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(editedSubjectLine.replace(/\]\]/g, '</span>')),
              }}
            />
          </Text>
        )}
      </Flex>
    </Card>
  );
};

type SpamScore = {
  spam_words: string[];
  read_minutes: number;
  spam_word_score: number;
  read_minutes_score: number;
  total_score: number;
}

export const EmailBodyItem: React.FC<{
  template: EmailSequenceStep;
  refetch: () => Promise<void>;
  hideHeader?: boolean;
  spamScore?: SpamScore | null;
}> = ({ template, refetch, hideHeader, spamScore }) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) return <></>;

  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editingPersonalization, setEditingPersonalization] = React.useState(false);

  // Transformer items
  const [prospectItems, setProspectItems] = React.useState([
    {
      title: 'Personal Bio',
      id: 'LINKEDIN_BIO_SUMMARY',
      checked: !template.transformer_blocklist.includes('LINKEDIN_BIO_SUMMARY'),
      disabled: !!currentProject?.transformer_blocklist?.includes('LINKEDIN_BIO_SUMMARY'),
    },
    {
      title: 'List Of Past Jobs',
      id: 'LIST_OF_PAST_JOBS',
      checked: !template.transformer_blocklist.includes('LIST_OF_PAST_JOBS'),
      disabled: !!currentProject?.transformer_blocklist?.includes('LIST_OF_PAST_JOBS'),
    },
    {
      title: 'Years of Experience',
      id: 'YEARS_OF_EXPERIENCE',
      checked: !template.transformer_blocklist.includes('YEARS_OF_EXPERIENCE'),
      disabled: !!currentProject?.transformer_blocklist?.includes('YEARS_OF_EXPERIENCE'),
    },
    {
      title: 'Current Experience',
      id: 'CURRENT_EXPERIENCE_DESCRIPTION',
      checked: !template.transformer_blocklist.includes('CURRENT_EXPERIENCE_DESCRIPTION'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_EXPERIENCE_DESCRIPTION'),
    },
    {
      title: 'Education History',
      id: 'COMMON_EDUCATION',
      checked: !template.transformer_blocklist.includes('COMMON_EDUCATION'),
      disabled: !!currentProject?.transformer_blocklist?.includes('COMMON_EDUCATION'),
    },
    {
      title: 'Recommendations',
      id: 'RECENT_RECOMMENDATIONS',
      checked: !template.transformer_blocklist.includes('RECENT_RECOMMENDATIONS'),
      disabled: !!currentProject?.transformer_blocklist?.includes('RECENT_RECOMMENDATIONS'),
    },
    {
      title: 'Patents',
      id: 'RECENT_PATENTS',
      checked: !template.transformer_blocklist.includes('RECENT_PATENTS'),
      disabled: !!currentProject?.transformer_blocklist?.includes('RECENT_PATENTS'),
    },
    {
      title: 'Years at Current Job',
      id: 'YEARS_OF_EXPERIENCE_AT_CURRENT_JOB',
      checked: !template.transformer_blocklist.includes('YEARS_OF_EXPERIENCE_AT_CURRENT_JOB'),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        'YEARS_OF_EXPERIENCE_AT_CURRENT_JOB'
      ),
    },
    {
      title: 'Custom Data Points',
      id: 'CUSTOM',
      checked: !template.transformer_blocklist.includes('CUSTOM'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CUSTOM'),
    },
  ]);

  const [companyItems, setCompanyItems] = React.useState([
    {
      title: 'Company Description',
      id: 'CURRENT_JOB_DESCRIPTION',
      checked: !template.transformer_blocklist.includes('CURRENT_JOB_DESCRIPTION'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_JOB_DESCRIPTION'),
    },
    {
      title: 'Company Specialites',
      id: 'CURRENT_JOB_SPECIALTIES',
      checked: !template.transformer_blocklist.includes('CURRENT_JOB_SPECIALTIES'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_JOB_SPECIALTIES'),
    },
    {
      title: 'Company Industry',
      id: 'CURRENT_JOB_INDUSTRY',
      checked: !template.transformer_blocklist.includes('CURRENT_JOB_INDUSTRY'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_JOB_INDUSTRY'),
    },
    {
      title: 'General Company News',
      id: 'SERP_NEWS_SUMMARY',
      checked: !template.transformer_blocklist.includes('SERP_NEWS_SUMMARY'),
      disabled: !!currentProject?.transformer_blocklist?.includes('SERP_NEWS_SUMMARY'),
    },
    {
      title: 'Negative Company News',
      id: 'SERP_NEWS_SUMMARY_NEGATIVE',
      checked: !template.transformer_blocklist.includes('SERP_NEWS_SUMMARY_NEGATIVE'),
      disabled: !!currentProject?.transformer_blocklist?.includes('SERP_NEWS_SUMMARY_NEGATIVE'),
    },
    {
      title: 'Website Info',
      id: 'GENERAL_WEBSITE_TRANSFORMER',
      checked: !template.transformer_blocklist.includes('GENERAL_WEBSITE_TRANSFORMER'),
      disabled: !!currentProject?.transformer_blocklist?.includes('GENERAL_WEBSITE_TRANSFORMER'),
    },
  ]);

  // Span magic on the template.template
  // Replace all [[ and ]] with span tags
  let templateBody = template.template || '';

  const [sequence, _setSequence] = React.useState<string>(templateBody);
  const sequenceRichRaw = React.useRef<JSONContent | string>(template.template || '');

  const [title, setTitle] = React.useState<string>(template.title || '');
  const [editingTitle, setEditingTitle] = React.useState<boolean>(false);

  const [personalizationItemsCount, setPersonalizationItemsCount] = React.useState<number>(
    prospectItems.length + companyItems.length - template.transformer_blocklist?.length
  );

  const triggerPatchEmailBodyTemplateTitle = async () => {
    setLoading(true);

    const result = await patchSequenceStep(
      userToken,
      template.id,
      template.overall_status,
      title,
      template.template,
      template.bumped_count,
      template.default
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: 'Successfully updated email title',
        color: 'green',
      });

      await refetch();
    }

    setLoading(false);
  };

  const triggerPatchEmailBodyTemplate = async () => {
    setLoading(true);

    const result = await patchSequenceStep(
      userToken,
      template.id,
      template.overall_status,
      template.title,
      sequence,
      template.bumped_count,
      template.default
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: 'Successfully updated email body',
        color: 'green',
      });

      await refetch();
    }

    setLoading(false);
  };

  const triggerToggleEmailBodyTemplateActive = async () => {
    setLoading(true);

    const result = await patchSequenceStep(
      userToken,
      template.id,
      template.overall_status,
      template.title,
      template.template,
      template.bumped_count,
      !template.default
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: `Successfully ${template.default ? 'deactivated' : 'activated'} email body`,
        color: 'green',
      });

      await refetch();
    }

    setLoading(false);
  };

  useEffect(() => {
    setEditing(false);
    _setSequence(templateBody);
    sequenceRichRaw.current = template.template || '';
  }, [template]);

  const theme = useMantineTheme();
  const formatedSequence = useMemo(() => {
    let newText = sequence;

    if (newText) {
      newText.match(/\[\[(.*?)]\]/g)?.forEach((v) => {
        const content = v.replace('[[', '').replace(']]', '');

        // Add 'https://' to urls that don't have a 'https://'
        for (const word of content.trim().split(/\s/)) {
          if (isValidUrl(word) && !word.startsWith('https://')) {
            content.replace(word, 'https://' + word);
          }
        }

        newText = newText?.replace(
          v,
          ReactDOMServer.renderToString(
            <Text
              style={{
                backgroundColor: theme.colors[deterministicMantineColor(content)][6],
                width: 'fit-content',
                color: theme.white,
                borderRadius: 12,
                padding: '0.25rem',
                fontWeight: 700,
                marginLeft: '0.25rem',
                paddingLeft: '12px',
                paddingRight: '12px',
                cursor: 'pointer',
              }}
              component='span'
            >
              <IconRobot size='1.1rem' color='white' style={{ paddingTop: '4px' }}></IconRobot>
              {content}
            </Text>
          )
        );
      });
    }

    return newText;
  }, []);
  return (
    <Flex w='100%'>
      <LoadingOverlay visible={loading} />
      <Flex direction='column' w='100%'>
        {hideHeader ? (
          <Flex justify={'flex-end'} mb='md'>
            <div>
              <Button
                variant='light'
                disabled={editing}
                color={'green'}
                size='xs'
                onClick={() => {
                  triggerToggleEmailBodyTemplateActive();
                }}
              >
                {template.default ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </Flex>
        ) : (
          <Flex mb='sm' direction='row' w='100%' justify={'space-between'}>
            <Flex align='center'>
              {editingTitle ? ( // Editing title
                <>
                  <TextInput
                    w={200}
                    placeholder='Untitled Email Template'
                    value={title}
                    onChange={(event) => {
                      setTitle(event.currentTarget.value);
                    }}
                  />
                  <Flex justify={'flex-end'}>
                    <Button
                      mx='sm'
                      color='red'
                      onClick={() => {
                        setTitle(template.title || '');
                        setEditingTitle(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      color='green'
                      onClick={() => {
                        triggerPatchEmailBodyTemplateTitle();
                        setEditingTitle(false);
                      }}
                    >
                      Save
                    </Button>
                  </Flex>
                </>
              ) : (
                // Not editing title
                <>
                  {template.title ? (
                    <Title
                      order={4}
                      onClick={() => {
                        setEditingTitle(true);
                      }}
                    >
                      {template.title}
                    </Title>
                  ) : (
                    <Title
                      order={4}
                      color='gray.5'
                      onClick={() => {
                        setEditingTitle(true);
                      }}
                    >
                      Untitled Email Template
                    </Title>
                  )}
                  <ActionIcon
                    variant='transparent'
                    onClick={() => {
                      setEditingTitle(!editingTitle);
                    }}
                  >
                    <IconPencil size={'0.9rem'} />
                  </ActionIcon>
                </>
              )}
            </Flex>
            <Flex align='center'>
              <Box mr='xs'>
                <SpamScorePopover
                  subjectSpamScoreDetails={spamScore}
                  bodySpamScoreDetails={spamScore}
                  hideSubjectLineScore
                />
              </Box>
              <Tooltip label='Coming Soon' withArrow withinPortal>
                <Text fz='sm' mr='md'>
                  Open %: <b>TBD</b>
                </Text>
              </Tooltip>
              <Tooltip label='Coming Soon' withArrow withinPortal>
                <Text fz='sm' mr='md'>
                  Reply %: <b>TBD</b>
                </Text>
              </Tooltip>
              {/*
                    <Tooltip
                      label={'Activate template'}
                      withinPortal
                      withArrow
                    >
                      <div>
                        <Switch
                          disabled={editing}
                          checked={template.default}
                          color={"blue"}
                          size="xs"
                          onChange={({ currentTarget: { checked } }) => {
                            triggerToggleEmailBodyTemplateActive();
                          }}
                        />
                      </div>
                    </Tooltip>
                */}
            </Flex>
          </Flex>
        )}

        {editing ? (
          <>
            <Box>
              <DynamicRichTextArea
                height={400}
                onChange={(value, rawValue) => {
                  sequenceRichRaw.current = rawValue;
                  _setSequence(value);
                }}
                value={sequenceRichRaw.current}
                signifyCustomInsert={false}
                inserts={[
                  {
                    key: 'first_name',
                    label: 'First Name',
                    icon: <IconWritingSign stroke={1.5} size='0.9rem' />,
                    color: 'blue',
                  },
                  {
                    key: 'last_name',
                    label: 'Last Name',
                    icon: <IconRobot stroke={2} size='0.9rem' />,
                    color: 'red',
                  },
                  {
                    key: 'company_name',
                    label: 'Company Name',
                    icon: <IconDatabase stroke={2} size='0.9rem' />,
                    color: 'teal',
                  },
                ]}
              />
            </Box>
            <Flex mt='sm' justify={'flex-end'}>
              <Button
                mr='sm'
                color='red'
                onClick={() => {
                  _setSequence(templateBody || '');
                  sequenceRichRaw.current = template.template || '';
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                color='green'
                onClick={() => {
                  triggerPatchEmailBodyTemplate();
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </Flex>
          </>
        ) : (
          <Box
            sx={() => ({
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              backgroundColor: '#F5F5F5',
            })}
            px='md'
            onClick={() => {
              setEditing(true);
            }}
          >
            <Text fz='sm'>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(formatedSequence as string),
                }}
              />
            </Text>
            <Flex h='0px' w='100%'>
              <Button
                leftIcon={<IconEdit size='1.0rem' />}
                variant='outline'
                pos='relative'
                bottom='50px'
                left='88%'
                h='32px'
                onClick={() => {
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            </Flex>
          </Box>
        )}
        <Tabs
          value={editingPersonalization ? 'personalization' : ''}
          pt='sm'
          variant='pills'
          keepMounted={true}
          radius='md'
          defaultValue='none'
          allowTabDeactivation
        >
          <Tabs.Tab
            value='personalization'
            color='teal.5'
            onClick={() => {
              setEditingPersonalization(!editingPersonalization);
            }}
            rightSection={
              <>
                {personalizationItemsCount ? (
                  <Badge
                    w={16}
                    h={16}
                    sx={{ pointerEvents: 'none' }}
                    variant='filled'
                    size='xs'
                    p={0}
                    color='teal.6'
                  >
                    {personalizationItemsCount}
                  </Badge>
                ) : (
                  <></>
                )}
              </>
            }
            sx={(theme) => ({
              '&[data-active]': {
                backgroundColor: theme.colors.teal[0] + '!important',
                borderRadius: theme.radius.md + '!important',
                color: theme.colors.teal[8] + '!important',
              },
              border: 'solid 1px ' + theme.colors.teal[5] + '!important',
            })}
          >
            Edit Personalization
          </Tabs.Tab>
          <Tabs.Panel value='personalization'>
            <PersonalizationSection
              blocklist={
                currentProject.transformer_blocklist_initial?.concat(
                  template.transformer_blocklist
                ) ||
                template.transformer_blocklist ||
                []
              }
              onItemsChange={async (items) => {
                const checked = items.filter((x: any) => x.checked).map((x: any) => x.id);
                setPersonalizationItemsCount(checked.length);

                const unchecked = items.filter((x: any) => !x.checked).map((x: any) => x.id);

                // Update transformer blocklist
                const result = await patchSequenceStep(
                  userToken,
                  template.id,
                  template.overall_status,
                  template.title,
                  template.template,
                  template.bumped_count,
                  template.default,
                  template.sequence_delay_days,
                  unchecked
                );
                if (result.status != 'success') {
                  showNotification({
                    title: 'Error',
                    message: result.message,
                    color: 'red',
                  });
                  return;
                } else {
                  showNotification({
                    title: 'Success',
                    message: 'Successfully updated research used',
                    color: 'green',
                  });
                  refetch();
                }
                // setCurrentProject(await getFreshCurrentProject(userToken, currentProject.id));
              }}
              hideAnalytics
            />
          </Tabs.Panel>
        </Tabs>
      </Flex>
    </Flex>
  );
};

export default DetailEmailSequencing;
