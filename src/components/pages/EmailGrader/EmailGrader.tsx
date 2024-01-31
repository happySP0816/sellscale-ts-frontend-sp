import {
  Card,
  Container,
  Grid,
  TextInput,
  Text,
  Box,
  Flex,
  Title,
  Button,
  useMantineTheme,
  rem,
  ActionIcon,
  Stack,
  Badge,
  Divider,
  Modal,
  LoadingOverlay,
  ScrollArea,
  HoverCard,
  Blockquote,
  Group,
  List,
  Skeleton,
  Progress,
  Loader,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { SCREEN_SIZES } from '../../../constants/data';
import RichTextArea from '@common/library/RichTextArea';
import {
  IconAlertOctagon,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconCircleMinus,
  IconCirclePlus,
  IconCircleX,
  IconClock,
  IconDownload,
  IconEdit,
  IconMinus,
  IconOctagon,
  IconPlus,
  IconQuote,
  IconRobot,
} from '@tabler/icons';
import { IconRobotFace, IconSparkles } from '@tabler/icons-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, ArcElement, Legend } from 'chart.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { JSONContent } from '@tiptap/react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { generateEmailFeedback } from '@utils/requests/generateFeedback';
import { cleanJsonString, collectClientData, formatToLabel, valueToColor } from '@utils/general';
import _, { set } from 'lodash';
import { deterministicMantineColor } from '@utils/requests/utils';
import { socket } from '../../App';
import { completionStream } from '@utils/sockets/completionStream';
import LoadingStream from '@common/library/LoadingStream';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmailGrade {
  detected_company: string;
  evaluated_construction_subject_line: 'GOOD' | 'BAD';
  evaluated_construction_body: 'GOOD' | 'BAD';
  evaluated_construction_spam_words_body: {
    evaluation: 'GOOD' | 'BAD';
    words: string[];
  };
  evaluated_construction_spam_words_subject_line: {
    evaluation: 'GOOD' | 'BAD';
    words: string[];
  };
  evaluated_feedback: {
    feedback: string;
    type: 'pro' | 'delta';
  }[];
  evaluated_personalizations: {
    personalization: string;
    reason: string;
    strength: 'strong' | 'weak';
  }[];
  evaluated_read_time_seconds: number;
  evaluated_score: number;
  evaluated_tones: {
    tones: string[];
  };
  id: number;
  input_body: string;
  input_subject_line: string;
}

const EmailGrader = () => {
  const userToken = useRecoilValue(userTokenState);
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);
  const theme = useMantineTheme();

  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');

  const [body, _setBody] = useState('');
  // We use this to store the raw value of the rich text editor
  const bodyRich = useRef<JSONContent | string>('');
  const bodyRef = useRef('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const [isEditMode, setIsEditMode] = useState(true);
  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };
  const highlightPersonalizations = (text: any) => {
    if (!data || !data.evaluated_personalizations) {
      return text;
    }

    let highlightedText = text;
    data.evaluated_personalizations.forEach((personalization) => {
      highlightedText = highlightedText.replace(
        personalization.personalization,
        `<span style="background-color: ` +
          (personalization.strength === 'strong' ? '#E7F5FF' : '#FFF9DB') +
          `; border: solid 1px ` +
          (personalization.strength === 'strong' ? '#B3D8FF' : '#FFEAA7') +
          `; border-radius: 4px; padding: 0px 4px;">` +
          personalization.personalization +
          `</span>`
      );
    });

    return highlightedText;
  };

  const [wordCount, setWordCount] = useState(0);

  const setBody = (value: string) => {
    bodyRich.current = value;
    _setBody(value);
  };

  const [data, setData] = useState<EmailGrade | undefined>();
  const [eventRoomId, setEventRoomId] = useState<string>();

  const generateFeedback = async () => {
    if (subject.trim() === '' || bodyRef.current.trim() === '') {
      return;
    }

    setLoading(true);

    // Set the room id to the subject (hacky fs, should prob be ip address + subject)
    setEventRoomId(subject);

    const response = await generateEmailFeedback(userToken, subject, bodyRef.current, await collectClientData());
    const data = response.status === 'success' ? (response.data as EmailGrade) : null;
    setLoading(false);
    if (!data) {
      return;
    }
  };

  useEffect(() => {
    let timeoutId: any;

    if (loading) {
      setLoadingMessage('Checking for spam words');
      timeoutId = setTimeout(() => setLoadingMessage('Measuring read time'), 2000);
      setTimeout(() => setLoadingMessage('Checking personalizations'), 4000);
      setTimeout(() => setLoadingMessage('Writing feedback'), 6000);
      setTimeout(() => setLoadingMessage('Checking construction'), 8000);
      setTimeout(() => setLoadingMessage('Checking tones'), 10000);
      setTimeout(() => setLoadingMessage('Generating score'), 12000);
      setTimeout(() => setLoadingMessage('Almost there...'), 14000);
      setTimeout(() => setLoadingMessage('Making final adjustments'), 16000);
    }

    return () => clearTimeout(timeoutId); // Clear timeout on component unmount
  }, [loading]);

  return (
    <>
      <Container
        px={5}
        py={15}
        sx={(theme) => ({
          width: `clamp(50px, ${smScreenOrLess ? '180vw' : 'calc(100vw - 180px)'}, 1200px)`,
          maxWidth: '100%',
        })}
      >
        <Grid>
          <Grid.Col md={6} xs={12}>
            <Card sx={{ display: 'flex', flexDirection: 'column' }}>
              {isEditMode ? (
                <>
                  <Text color='gray.6' fw={600} fz={'sm'}>
                    SUBJECT LINE
                  </Text>
<<<<<<< HEAD
                  <TextInput
                    placeholder='Subject'
                    value={subject}
                    onChange={(e) => setSubject(e.currentTarget.value)}
                  />
=======
                  <TextInput placeholder='Subject' value={subject} onChange={(e) => setSubject(e.currentTarget.value)} />
>>>>>>> 28077d2b76ed14d05f50153cfc8f9c8ecdf8ba06
                </>
              ) : (
                <>
                  {/* Uneditable text blocks for subject and body */}
                  <Text color='gray.6' fw={600} fz={'sm'}>
                    SUBJECT LINE
                  </Text>
                  <div
                    onClick={toggleEditMode}
<<<<<<< HEAD
                    style={{
                      border: 'solid 1px #ddd',
                      padding: 4,
                      paddingLeft: 12,
                      paddingRight: 12,
                      borderRadius: 8,
                      overflowY: 'scroll',
                    }}
=======
                    style={{ border: 'solid 1px #ddd', padding: 4, paddingLeft: 12, paddingRight: 12, borderRadius: 8, overflowY: 'scroll' }}
>>>>>>> 28077d2b76ed14d05f50153cfc8f9c8ecdf8ba06
                    dangerouslySetInnerHTML={{ __html: highlightPersonalizations(subject) }}
                  ></div>

                  <Box mt={'sm'}>
                    <Text color='gray.6' fw={600} fz={'sm'}>
                      BODY
                    </Text>
                    <RichTextArea
                      onChange={(value, rawValue) => {
                        bodyRich.current = rawValue;
                        bodyRef.current = value;
                      }}
                      value={bodyRich.current}
                      height={500}
                    />
                  </Box>
                </>
                // ) : (
                //   <>
                //     {/* Uneditable text blocks for subject and body */}
                //     <Text color='gray.6' fw={600} fz={'sm'}>
                //       SUBJECT LINE
                //     </Text>
                //     <div
                //       onClick={toggleEditMode}
                //       style={{height: 500, border: 'solid 1px #ddd', padding: 4, paddingLeft: 12, paddingRight: 12, borderRadius: 8, overflowY: 'scroll', paddingBottom: '40px'}} dangerouslySetInnerHTML={{ __html: highlightPersonalizations(bodyRef.current) }}></div>
                // </>
              )}
              <Button
                ml='auto'
                onClick={toggleEditMode}
                pos={'absolute'}
                size='xs'
                variant='outline'
                right={30}
                bottom={loading ? 110 : 80}
                display={!loading && !isEditMode ? 'block' : 'none'}
                leftIcon={<IconEdit size={'0.8rem'} />}
              >
                {isEditMode ? '' : 'Edit'}
              </Button>

              <Box mt={'sm'}>
                <Text color='gray.6' fw={600} fz={'sm'}>
                  BODY
                </Text>
                <div
                  style={{
                    height: 500,
                    border: 'solid 1px #ddd',
                    padding: 4,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderRadius: 8,
                    overflowY: 'scroll',
                    paddingBottom: '40px',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlightPersonalizations(bodyRef.current),
                  }}
                ></div>
              </Box>
              <Button
                ml='auto'
                onClick={toggleEditMode}
                pos={'absolute'}
                size='xs'
                variant='outline'
                right={30}
                bottom={loading ? 110 : 80}
                display={!loading && !isEditMode ? 'block' : 'none'}
                leftIcon={<IconEdit size={'0.8rem'} />}
              >
                {isEditMode ? '' : 'Edit'}
              </Button>

              <Flex mt={'sm'}>
                <Text>
                  {bodyRef.current.split(' ').length} word
                  {bodyRef.current.split(' ').length === 1 ? '' : 's'}
                </Text>
                <Button ml='auto' loading={loading} color='violet' radius={'lg'} onClick={generateFeedback} leftIcon={<IconSparkles size={'0.8rem'} />}>
                  Generate Feedback
                </Button>
              </Flex>

              {/* Loading Progress Bar and Message */}
              {loading && (
                <Flex style={{ textAlign: 'right', justifyContent: 'right' }}>
                  <Text fw='400' mr='md' mt='xs' color='grape'>
                    {loadingMessage}...
                  </Text>
                  <Loader mr='xs' mt='8px' variant='dots' color='grape' />
                </Flex>
              )}
            </Card>
          </Grid.Col>

          <Grid.Col md={6} xs={12}>
            {loading && (
              <>
                {/* <LoadingStream
                  event='generate_email_feedback'
                  roomId={eventRoomId}
                  // label='Loading Feedback'
                /> */}
                <Skeleton height={120} mb='8' />
                <Flex>
                  <Skeleton height={100} mt={8} />
                  <Skeleton height={100} mt={8} ml='xs' />
                </Flex>
                <Skeleton height={300} mt={8} width='100%' />
                <Flex>
                  <Skeleton height={100} mt={8} />
                  <Skeleton height={140} mt={8} ml='xs' />
                </Flex>
              </>
            )}
            {!data && !loading && (
              <Box style={{ position: 'relative' }}>
                <Stack spacing={5}>
                  <Title order={2}>Improve Your Email</Title>
                  <Text fs='italic'>Get immediate, focused feedback on:</Text>
                  <List>
                    <List.Item>
                      <Text fw={600} span>
                        Tone:
                      </Text>{' '}
                      Understand the emotional impact of your words.
                    </List.Item>
                    <List.Item>
                      <Text fw={600} span>
                        Structure:
                      </Text>{' '}
                      Receive insights on the organization and clarity of your email.
                    </List.Item>
                    <List.Item>
                      <Text fw={600} span>
                        Personalization:
                      </Text>{' '}
                      Learn how to tailor your message for your audience.
                    </List.Item>
                    <List.Item>
                      <Text fw={600} span>
                        Read Time:
                      </Text>{' '}
                      Estimate how long it takes to read your email.
                    </List.Item>
                  </List>
                  <Text fs='italic'>Elevate your email communication with cutting-edge AI insights.</Text>
                </Stack>
              </Box>
            )}
            {data && !loading && <EmailFeedbackReport data={data} />}
          </Grid.Col>
        </Grid>
      </Container>

      <Modal opened={opened} onClose={close} title='Feedback' />
    </>
  );
};

function EmailFeedbackReport(props: { data: EmailGrade }) {
  const theme = useMantineTheme();

  const percentage = [
    {
      percentage: 100,
      color: theme.colors.green[4],
    },
    {
      percentage: 70,
      color: theme.colors.orange[4],
    },
    {
      percentage: 30,
      color: theme.colors.red[4],
    },
  ];
  const currentPercentage = props.data.evaluated_score;

  const avgReadTime = 30;
  let readTimeExplanation = '';
  if (props.data.evaluated_read_time_seconds > avgReadTime * 2) {
    readTimeExplanation = `The average reader will only read for ${avgReadTime} seconds. This email is way too long.`;
  } else if (props.data.evaluated_read_time_seconds > avgReadTime) {
    readTimeExplanation = `The average reader will only read for ${avgReadTime} seconds. This email is a bit too long.`;
  } else {
    readTimeExplanation = `This email isn't too long. Good!`;
  }

  return (
    <ScrollArea h={'95vh'} offsetScrollbars>
      <Card>
        <Flex align={'center'} justify={'space-between'}>
          <Title order={2}>AI Feedback Report</Title>
        </Flex>
      </Card>

      <Card mt={'sm'}>
        <Flex align={'center'} gap={'sm'}>
          {/* <Box w={"30%"} pos={"relative"}>
                  <Doughnut
                    data={data}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      rotation: -90,
                      circumference: 180,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                    }}
                  />

                  <Text
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                    fz={"sm"}
                  >
                    <Text component="span" fw={700} fz={"md"}>
                      74
                    </Text>
                    /100
                  </Text>
                </Box> */}

          <Box
            sx={{
              width: '180px',
              height: '90px',
              position: 'relative',

              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box',

              '&:before': {
                content: '""',
                width: '180px',
                height: '90px',
                border: `20px solid ${theme.colors.gray[4]}`,
                position: 'absolute',
                transformOrigin: '50%  0% 0',
                borderRadius: '120px 120px 0 0',
                borderBottom: 0,
                left: 0,
                top: 0,
              },
            }}
          >
            <Text fz={'sm'}>
              <Text component='span' fw={700} fz={'md'}>
                {currentPercentage}
              </Text>
              /100
            </Text>
            {percentage.map((i, idx) => (
              <Box
                key={idx}
                sx={(theme) => ({
                  width: '180px',
                  height: '90px',
                  border: `20px solid ${i.color}`,
                  borderTop: 'none',
                  position: 'absolute',
                  transformOrigin: '50%  0% 0',
                  borderRadius: '0 0 120px 120px',
                  left: '0',
                  top: '100%',
                  zIndex: 5,
                  animation: '1s fillGraphAnimation ease-in',
                  boxSizing: 'border-box',
                  transform: `rotate(calc(1deg*${i.percentage}*1.8))`,

                  '&:before': {
                    content: '""',
                    width: '180px',
                    height: '90px',
                    borderBottom: `3px solid white`,
                    position: 'absolute',
                    transformOrigin: 'left',
                    transform: `rotate(calc(1deg*100*1.8))`,
                    left: 0,
                    top: 0,
                  },
                })}
              />
            ))}

            <Box
              sx={(theme) => ({
                width: '180px',
                height: '90px',
                border: `20px solid transparent`,
                borderTop: 'none',
                position: 'absolute',
                transformOrigin: '50%  0% 0',
                borderRadius: '0 0 120px 120px',
                left: '0',
                top: '100%',
                zIndex: 5,
                animation: '1s fillGraphAnimation ease-in',
                boxSizing: 'border-box',
                transform: `rotate(calc(1deg*${currentPercentage}*1.8))`,

                '&:before': {
                  content: '""',
                  width: '20px',
                  height: '1px',
                  borderBottom: `3px solid black`,
                  position: 'absolute',
                  transformOrigin: 'left',
                  transform: `rotate(calc(1deg*100*1.8))`,
                  left: 0,
                  top: 0,
                },
              })}
            />
          </Box>

          <EmailScore score={props.data.evaluated_score} />
        </Flex>
      </Card>

      <Grid mt={'sm'}>
        <Grid.Col md={6} xs={12}>
          <Card>
            <Text fw={700} color='gray.6' fz={'sm'}>
              PERSONALIZATIONS:
            </Text>
            <Text fw={500} color='gray.6' fz={'sm'}>
              {props.data.evaluated_personalizations.length} personalizations identified
            </Text>
            <Stack mt={'sm'}>
              {props.data.evaluated_personalizations.map((d, idx) => (
                <HoverCard key={idx} width={280} shadow='md' withinPortal position='left'>
                  <HoverCard.Target>
                    <Badge
                      key={idx}
                      color={d.strength === 'strong' ? 'blue' : 'yellow'}
                      variant='light'
                      maw={280}
                      styles={{ root: { textTransform: 'initial', cursor: 'pointer' } }}
                    >
                      <i>"{d.personalization}"</i>
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Box>
                      <Text fz='xs' fw='bold'>
                        Personalization:
                      </Text>
                      <Text size='xs' fs='italic' color='gray.6'>
                        "{d.personalization}"
                      </Text>
                    </Box>

                    <Box mt='md'>
                      <Text fz='xs' fw='bold'>
                        Strength:
                      </Text>
                      <Badge miw={60} color={d.strength === 'strong' ? 'blue' : 'yellow'} variant='light' size='xs'>
                        {d.strength}
                      </Badge>
                    </Box>

                    <Box mt='md'>
                      <Text fz='xs' fw='bold'>
                        Reason:
                      </Text>
                      <Text size='xs'>{d.reason}</Text>
                    </Box>
                  </HoverCard.Dropdown>
                </HoverCard>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col md={6} xs={12}>
          <Card mt={'sm'}>
            <Text fw={700} color='gray.6' fz={'sm'}>
              READ QUANTITY & TIME
            </Text>
            <Text mt={'xs'} fw={700} fz={'lg'} display={'flex'} sx={{ gap: rem(4), alignItems: 'center' }}>
              <ActionIcon size={'sm'}>
                <IconClock />
              </ActionIcon>
              {props.data.evaluated_read_time_seconds} seconds
            </Text>

            <Text fw={700} color='gray.6' fz={'sm'} mt={'xs'}>
              {readTimeExplanation}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Card mt={'sm'}>
        <Text fw={700} color='gray.6' fz={'sm'}>
          Feedback
        </Text>

        <Stack mt={'md'}>
          {props.data.evaluated_feedback.map((d, idx) => (
            <Flex key={idx} gap={'xs'}>
              <Box>{d.type === 'pro' ? <IconCirclePlus size='1rem' color='green' /> : <IconCircleMinus size='1rem' color='red' />}</Box>
              <Text fw={400} fz={'xs'}>
                {d.feedback}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Card>

      <Grid mt={'sm'}>
        <Grid.Col md={6} xs={12}>
          <Card>
            <Text fw={700} color='gray.6' fz={'sm'}>
              TONES:
            </Text>

            <Flex wrap={'wrap'} gap={'sm'} mt={'sm'}>
              {props.data.evaluated_tones.tones.map((tone, idx) => (
                <Badge key={idx} color={valueToColor(theme, tone, 'green')} variant='light' maw={200}>
                  #{_.capitalize(tone)}
                </Badge>
              ))}
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col md={6} xs={12}>
          <Card mt={'sm'}>
            <Text fw={700} color='gray.6' fz={'sm'}>
              CONSTRUCTION
            </Text>

            <Stack mt={'sm'}>
              <Box>
                <HoverCard width={280} shadow='md' position='left' withinPortal>
                  <HoverCard.Target>
                    <Flex gap={'xs'} align={'center'} styles={{ cursor: 'pointer' }}>
                      {props.data.evaluated_construction_subject_line === 'GOOD' ? (
                        <ActionIcon color='green' size={'sm'}>
                          <IconCircleCheck />
                        </ActionIcon>
                      ) : (
                        <ActionIcon color='red' size={'sm'}>
                          <IconCircleX />
                        </ActionIcon>
                      )}
                      <Text fw={600} fz={'sm'}>
                        Subject Length
                      </Text>
                    </Flex>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size='sm'>A subject line is deemed good if it is less than 100 characters in length; otherwise, it is considered bad.</Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Box>
              {true && (
                <Box>
                  <HoverCard shadow='md' position='left' withinPortal>
                    <HoverCard.Target>
                      <Flex gap={'xs'} align={'center'} styles={{ cursor: 'pointer' }}>
                        <ActionIcon size={'sm'} color={props.data.evaluated_construction_spam_words_subject_line.evaluation === 'GOOD' ? 'green' : 'red'}>
                          {props.data.evaluated_construction_spam_words_subject_line.words?.length === 0 ? <IconCircleCheck /> : <IconAlertOctagon />}
                        </ActionIcon>
                        <Text fw={600} fz={'sm'}>
                          Subject - Spam Words
                        </Text>
                      </Flex>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      {props.data.evaluated_construction_spam_words_subject_line.words.length > 0 ? (
                        <Text fz='xs' fw='bold'>
                          Found spam words:{' '}
                        </Text>
                      ) : (
                        <Text>No spam words found in subject line!</Text>
                      )}
                      {props.data.evaluated_construction_spam_words_subject_line.words.map((word, idx) => (
                        <Badge key={idx} color='red' styles={{ root: { textTransform: 'initial' } }}>
                          {word}
                        </Badge>
                      ))}
                    </HoverCard.Dropdown>
                  </HoverCard>
                </Box>
              )}

              <Box>
                <Divider mb={'xs'} />
                <HoverCard width={280} shadow='md' position='left' withinPortal>
                  <HoverCard.Target>
                    <Flex gap={'xs'} align={'center'} styles={{ cursor: 'pointer' }}>
                      {props.data.evaluated_construction_body === 'GOOD' ? (
                        <ActionIcon color='green' size={'sm'}>
                          <IconCircleCheck />
                        </ActionIcon>
                      ) : (
                        <ActionIcon color='red' size={'sm'}>
                          <IconCircleX />
                        </ActionIcon>
                      )}
                      <Text fw={600} fz={'sm'}>
                        Body Length
                      </Text>
                    </Flex>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size='sm'>
                      Optimal emails can be read in roughly 30 seconds since the average reader will skim through emails in their inbox. That translates to
                      roughly 50 - 120 words.
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Box>

              {true && (
                <Box>
                  <HoverCard shadow='md' position='left' withinPortal>
                    <HoverCard.Target>
                      <Flex gap={'xs'} align={'center'} styles={{ cursor: 'pointer' }}>
                        <ActionIcon size={'sm'} color={props.data.evaluated_construction_spam_words_body.evaluation === 'GOOD' ? 'green' : 'red'}>
                          {props.data.evaluated_construction_spam_words_body.words?.length === 0 ? <IconCircleCheck /> : <IconAlertOctagon />}
                        </ActionIcon>
                        <Text fw={600} fz={'sm'}>
                          Body - Spam Words
                        </Text>
                      </Flex>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      {props.data.evaluated_construction_spam_words_body.words.length > 0 ? (
                        <Text fz='xs' fw='bold'>
                          Found spam words:{' '}
                        </Text>
                      ) : (
                        <Text>No spam words found in the body!</Text>
                      )}
                      {props.data.evaluated_construction_spam_words_body.words.map((word, idx) => (
                        <Badge key={idx} color='red' styles={{ root: { textTransform: 'initial' } }}>
                          {word}
                        </Badge>
                      ))}
                    </HoverCard.Dropdown>
                  </HoverCard>
                </Box>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </ScrollArea>
  );
}

function EmailScore(props: { score: number }) {
  const data: Record<string, string[]> = {
    '0': [
      "Your email sequence is not hitting the mark yet. Let's revise and enhance to boost its effectiveness!",
      "This is a starting point, but there's room for significant improvement. Focus on refining your message for better engagement.",
      'Currently, your content is underperforming expectations. A strategic overhaul could really turn things around.',
    ],
    '50': [
      "You're making progress, but there's still a way to go. Consider reworking your approach for greater impact.",
      'Your email sequence is halfway there! With some more adjustments and fine-tuning, you can really elevate its performance.',
      "You've laid a foundation, but it needs more work to truly resonate with your audience. Keep optimizing!",
    ],
    '75': [
      "You're getting closer to an effective sequence, but it's not quite there. Pay attention to details and user engagement.",
      'Your email sequence is showing promise, but it can be more compelling. Try to add more persuasive elements.',
      'Good effort so far! A few more tweaks and refinements could bring your sequence up to a higher standard.',
    ],
    '80': [
      "You're nearly there! Just a bit more refinement and creativity could push your sequence to the next level.",
      'Your sequence is solid, but to really stand out, consider enhancing its appeal and clarity.',
      'Almost at the mark! Focus on fine-tuning your message for that extra push towards greater success.',
    ],
    '90': [
      'Great job so far! With a little more polishing and strategic tweaking, your sequence will truly shine.',
      "You're on the right track! Just a few more adjustments for a more compelling and engaging sequence.",
      'Impressive work! A final round of edits could be the key to achieving top-notch results.',
    ],
    '100': [
      'Congratulations! Your email sequence is impeccable and perfectly tailored to your audience. Excellent work!',
      "Outstanding! You've achieved a perfect score with a highly effective and engaging email sequence.",
      'Bravo! Your email sequence hits all the right notes and sets a high standard for excellence.',
    ],
  };

  const scoreColor = props.score >= 70 ? 'green' : props.score >= 30 ? 'orange' : 'red';
  const scoreTitle =
    props.score >= 90
      ? 'Excellent Work!'
      : props.score >= 75
      ? 'Great Job!'
      : props.score >= 60
      ? 'Good Effort!'
      : props.score >= 45
      ? 'Needs Improvement'
      : props.score >= 30
      ? 'Below Average'
      : props.score >= 15
      ? 'Far Below Average'
      : 'Needs Major Revision';

  const scoreExplanation = useMemo(() => {
    let scoreExplanation = '';
    for (const category of Object.keys(data)) {
      if (props.score >= Number(category)) {
        scoreExplanation = data[category][Math.floor(Math.random() * data[category].length)];
      }
    }
    return scoreExplanation;
  }, [props.score]);

  return (
    <Card withBorder sx={{ flex: 1, height: 'fit-content' }}>
      <Text fw={700} fz={'sm'} sx={{ display: 'flex', alignItems: 'center', gap: rem(4) }}>
        <ActionIcon color={scoreColor}>
          <IconCircleCheck stroke={1.5} />
        </ActionIcon>
        {scoreTitle}
      </Text>

      <Text fz={'sm'} color='gray.6'>
        {scoreExplanation}
      </Text>
    </Card>
  );
}

export default EmailGrader;
