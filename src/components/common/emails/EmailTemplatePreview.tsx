import { userTokenState } from '@atoms/userAtoms';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Select,
  Text,
  TextInput,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import StarterKit from '@tiptap/starter-kit';
import { IconBrandLinkedin, IconX } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { valueToColor } from '@utils/general';
import { getArchetypeProspects } from '@utils/requests/getArchetypeProspects';
import { forwardRef, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { EmailSequenceStep, ProspectShallow } from 'src';
import { Markdown } from 'tiptap-markdown';
import { getEmailSequenceSteps } from '@utils/requests/emailSequencing';
import {
  postGenerateFollowupEmail,
  postGenerateInitialEmail,
} from '@utils/requests/emailMessageGeneration';
import { showNotification } from '@mantine/notifications';

interface ProspectItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  icpFit: number;
  title: string;
  company: string;
}

let icpFitScoreMap = new Map<string, string>([
  ['-3', 'QUEUED'],
  ['-2', 'CALCULATING'],
  ['-1', 'ERROR'],
  ['0', 'VERY LOW'],
  ['1', 'LOW'],
  ['2', 'MEDIUM'],
  ['3', 'HIGH'],
  ['4', 'VERY HIGH'],
]);

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export default function EmailTemplate(props: {
  archetypeId: number;
  template?: string;
  selectTemplate?: boolean;
  emailStatus: string;
}) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectShallow>();

  const [loading, setLoading] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<{ subject: string | null; body: string } | null>(
    null
  );

  const [emailSequenceSteps, setemailSequenceSteps] = useState<EmailSequenceStep[]>([]);
  const [selectedSequenceStep, setSelectedSequenceStep] = useState<EmailSequenceStep | undefined>(
    undefined
  );
  const triggerGetEmailSequenceSteps = async () => {
    setLoading(true);
    const result = await getEmailSequenceSteps(
      userToken,
      ['ACCEPTED', 'BUMPED'],
      [],
      [props.archetypeId]
    );

    if (result.status === 'success') {
      setemailSequenceSteps(result.data.sequence_steps);
    }
    setLoading(false);
  };

  const previewBodyEditor = useEditor({
    extensions: [StarterKit, Markdown],
    content: '',
    editable: false,
  });

  useEffect(() => {
    previewBodyEditor &&
      previewEmail?.body &&
      previewBodyEditor.commands.setContent(previewEmail.body);
  }, [previewEmail]);

  useEffect(() => {
    (async () => {
      const result = await getArchetypeProspects(userToken, props.archetypeId);

      if (result.status === 'success') {
        setProspects((prev) => {
          const prospects = result.data as ProspectShallow[];
          return prospects.sort((a, b) => {
            if (a.icp_fit_score === b.icp_fit_score) {
              return a.full_name.localeCompare(b.full_name);
            }
            return b.icp_fit_score - a.icp_fit_score;
          });
        });
      }
    })();

    if (props.selectTemplate) {
      triggerGetEmailSequenceSteps();
    }
  }, []);

  const ProspectSelectItem = forwardRef<HTMLDivElement, ProspectItemProps>(
    ({ label, icpFit, title, company, ...others }: ProspectItemProps, ref) => (
      <div ref={ref} {...others}>
        <Flex justify={'space-between'}>
          <Text>{label}</Text>
          {icpFit ? (
            <Badge color={valueToColor(theme, icpFitScoreMap.get(icpFit.toString()) || 'NONE')}>
              {icpFitScoreMap.get(icpFit.toString())}
            </Badge>
          ) : (
            <Badge color={valueToColor(theme, 'NONE')}>NONE</Badge>
          )}
        </Flex>
        <Text fz='xs'>
          {title} @ {company}
        </Text>
      </div>
    )
  );

  return (
    <>
      <Card withBorder h='fit'>
        <Text fz='lg' fw='bold'>
          Email Preview
        </Text>
        <Text fz='sm'>Test your email template on a prospect of your choosing.</Text>

        {props.selectTemplate && (
          <>
            <Select
              mt='xs'
              label='Select a framework'
              placeholder='Pick one'
              searchable
              clearable
              nothingFound='No bump frameworks found'
              value={selectedSequenceStep ? selectedSequenceStep.step.id + '' : '-1'}
              data={emailSequenceSteps.map((sequenceStep: EmailSequenceStep) => {
                return {
                  value: sequenceStep.step.id + '',
                  label: sequenceStep.step.title,
                };
              })}
              onChange={(value) => {
                if (!value) {
                  setSelectedSequenceStep(undefined);
                  return;
                }
                const foundSequenceStep = emailSequenceSteps.find(
                  (sequenceStep) => sequenceStep.step.id === (parseInt(value) || -1)
                );
                setSelectedSequenceStep(foundSequenceStep);
              }}
              withinPortal
            />
          </>
        )}

        {(!props.selectTemplate || (props.selectTemplate && selectedSequenceStep)) && (
          <Select
            mt='xs'
            label='Select a prospect'
            placeholder='Pick one'
            itemComponent={ProspectSelectItem}
            searchable
            clearable
            nothingFound='No prospects found'
            value={selectedProspect ? selectedProspect.id + '' : '-1'}
            data={prospects.map((prospect) => {
              return {
                value: prospect.id + '',
                label: prospect.full_name,
                icpFit: prospect.icp_fit_score,
                title: prospect.title,
                company: prospect.company,
              };
            })}
            onChange={(value) => {
              if (!value) {
                setSelectedProspect(undefined);
                return;
              }
              const foundProspect = prospects.find(
                (prospect) => prospect.id === (parseInt(value) || -1)
              );
              setSelectedProspect(foundProspect);
            }}
            withinPortal
          />
        )}

        {selectedProspect && (
          <>
            <Card withBorder mt='xl' mb='lg' shadow='sm'>
              <Text fz='lg' fw='bold'>
                {selectedProspect.full_name}
              </Text>
              <Text fz='sm'>
                {selectedProspect.title} @ {selectedProspect.company}
              </Text>

              {selectedProspect.li_public_id && (
                <Group noWrap spacing={10} mt={5}>
                  <IconBrandLinkedin stroke={1.5} size={16} className={classes.icon} />
                  <Text
                    size='xs'
                    color='dimmed'
                    component='a'
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`https://www.linkedin.com/in/${selectedProspect.li_public_id}`}
                  >
                    linkedin.com/in/{selectedProspect.li_public_id}
                  </Text>
                </Group>
              )}
            </Card>
            <Center>
              <Flex align='center'>
                <Button
                  variant='filled'
                  color='teal'
                  radius='md'
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);

                    let response = null;
                    console.log('template', props.template);
                    // Route depending on the status. Either initial (cold) message or a followup
                    if (props.emailStatus === 'PROSPECTED') {
                      response = await postGenerateInitialEmail(
                        userToken,
                        selectedProspect.id,
                        selectedSequenceStep?.step.id as number,
                        props.template || selectedSequenceStep?.step.template || null,
                        null,
                        null
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

                        setPreviewEmail({
                          subject: subject_line.completion,
                          body: email_body.completion,
                        });
                      }
                    } else {
                      console.log(
                        'selectedSequenceStep?.template',
                        selectedSequenceStep?.step.template
                      );
                      response = await postGenerateFollowupEmail(
                        userToken,
                        selectedProspect.id,
                        null,
                        selectedSequenceStep?.step.id || null,
                        props.template || selectedSequenceStep?.step.template || null
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

                        setPreviewEmail({
                          subject: null,
                          body: email_body.completion,
                        });
                      }
                    }

                    setLoading(false);
                  }}
                >
                  Generate Preview
                </Button>
                {previewEmail && (
                  <ActionIcon
                    ml='xs'
                    size='sm'
                    onClick={() => {
                      setPreviewEmail(null);
                    }}
                  >
                    <IconX />
                  </ActionIcon>
                )}
              </Flex>
            </Center>
          </>
        )}

        {loading && (
          <Flex justify={'center'} mt='lg'>
            <Loader size='xs' />
          </Flex>
        )}

        {!loading && previewEmail && (
          <Card>
            <Text fz='sm' fw={500}>
              Subject
            </Text>
            <Text
              variant={previewEmail.subject ? 'gradient' : 'text'}
              gradient={{ from: 'pink', to: 'purple', deg: 45 }}
            >
              {previewEmail.subject || 'Not available on followup emails'}
            </Text>

            <Text mt='md' fz='sm' fw={500}>
              Body
            </Text>
            <RichTextEditor
              editor={previewBodyEditor}
              styles={{
                content: {
                  p: {
                    fontSize: 14,
                  },
                  minHeight: 200,
                },
              }}
            >
              <RichTextEditor.Content />
            </RichTextEditor>
          </Card>
        )}
      </Card>
    </>
  );
}
