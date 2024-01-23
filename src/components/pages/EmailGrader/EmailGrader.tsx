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
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { SCREEN_SIZES } from '../../../constants/data';
import RichTextArea from '@common/library/RichTextArea';
import {
  IconAlertOctagon,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconDownload,
  IconOctagon,
  IconQuote,
} from '@tabler/icons';
import { IconSparkles } from '@tabler/icons-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, ArcElement, Legend } from 'chart.js';
import { useMemo, useRef, useState } from 'react';
import { JSONContent } from '@tiptap/react';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { generateEmailFeedback } from '@utils/requests/generateFeedback';
import { formatToLabel, valueToColor } from '@utils/general';
import _ from 'lodash';

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
  const setBody = (value: string) => {
    bodyRich.current = value;
    _setBody(value);
  };

  const [data, setData] = useState<EmailGrade | undefined>();

  const generateFeedback = async () => {
    if (subject.trim() === '' || bodyRef.current.trim() === '') {
      return;
    }

    setLoading(true);
    const response = await generateEmailFeedback(userToken, subject, bodyRef.current, {});
    const data = response.status === 'success' ? (response.data as EmailGrade) : null;
    setLoading(false);
    if (!data) {
      return;
    }
    setData(data);
  };

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
              <Box>
                <Text color='gray.6' fw={600} fz={'sm'}>
                  SUBJECT LINE
                </Text>
                <TextInput
                  placeholder='Subject'
                  value={subject}
                  onChange={(e) => setSubject(e.currentTarget.value)}
                />
              </Box>

              <Box mt={'sm'}>
                <Text color='gray.6' fw={600} fz={'sm'}>
                  BODY
                </Text>

                <Box>
                  <RichTextArea
                    onChange={(value, rawValue) => {
                      bodyRich.current = rawValue;
                      bodyRef.current = value;
                    }}
                    value={bodyRich.current}
                    height={500}
                  />
                </Box>
              </Box>

              <Flex mt={'sm'} justify={'end'}>
                <Button
                  loading={loading}
                  color='violet'
                  radius={'lg'}
                  onClick={generateFeedback}
                  leftIcon={<IconSparkles size={'0.8rem'} />}
                >
                  Generate Feedback
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
          <Grid.Col md={6} xs={12}>
            {!data && (
              <Box style={{ position: 'relative' }}>
                <LoadingOverlay visible={loading} />
                <Text>
                  Input your copy on the left to get it evaluated by AI. The grader will provide
                  qualitative feedback, tones, construction, personalziations, and read time
                  analysis.
                </Text>
              </Box>
            )}
            {data && <EmailFeedbackReport data={data} />}
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

      <Card mt={'sm'}>
        <Text fw={700} color='gray.6' fz={'sm'}>
          Feedback
        </Text>

        <Stack mt={'md'}>
          {props.data.evaluated_feedback.map((d, idx) => (
            <Flex key={idx} gap={'xs'}>
              <Box>
                <IconArrowRight />
              </Box>
              <Text fw={600} fz={'xs'}>
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
                <Badge key={idx} color={valueToColor(theme, tone)} variant='light' maw={200}>
                  #{_.capitalize(tone)}
                </Badge>
              ))}
            </Flex>
          </Card>

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
                        Subject
                      </Text>
                    </Flex>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size='sm'>
                      A subject line is deemed good if it is less than 100 characters in length;
                      otherwise, it is considered bad.
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Box>
              {props.data.evaluated_construction_spam_words_subject_line.evaluation === 'BAD' && (
                <Box>
                  <HoverCard shadow='md' position='left' withinPortal>
                    <HoverCard.Target>
                      <Flex gap={'xs'} align={'center'} styles={{ cursor: 'pointer' }}>
                        <ActionIcon color='red' size={'sm'}>
                          <IconAlertOctagon />
                        </ActionIcon>
                        <Text fw={600} fz={'sm'} color='red'>
                          Subject - Spam Words
                        </Text>
                      </Flex>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      {props.data.evaluated_construction_spam_words_subject_line.words.map(
                        (word, idx) => (
                          <Badge
                            key={idx}
                            color='red'
                            styles={{ root: { textTransform: 'initial' } }}
                          >
                            {word}
                          </Badge>
                        )
                      )}
                    </HoverCard.Dropdown>
                  </HoverCard>
                  <Divider mt={'xs'} />
                </Box>
              )}

              <Box>
                <Divider mt={'xs'} />
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
                        Body
                      </Text>
                    </Flex>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size='sm'>
                      An email body is considered good if it contains fewer than 120 words in total
                      and each sentence within it is less than 15 words long; otherwise, it is
                      considered bad.
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              </Box>

              {props.data.evaluated_construction_spam_words_body.evaluation === 'BAD' && (
                <Box>
                  <HoverCard shadow='md' position='left' withinPortal>
                    <HoverCard.Target>
                      <Flex gap={'xs'} align={'center'} styles={{ cursor: 'pointer' }}>
                        <ActionIcon color='red' size={'sm'}>
                          <IconAlertOctagon />
                        </ActionIcon>
                        <Text fw={600} fz={'sm'} color='red'>
                          Body - Spam Words
                        </Text>
                      </Flex>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      {props.data.evaluated_construction_spam_words_body.words.map((word, idx) => (
                        <Badge
                          key={idx}
                          color='red'
                          styles={{ root: { textTransform: 'initial' } }}
                        >
                          {word}
                        </Badge>
                      ))}
                    </HoverCard.Dropdown>
                  </HoverCard>
                  <Divider mt={'xs'} />
                </Box>
              )}
            </Stack>
          </Card>
        </Grid.Col>
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
                      color='gray'
                      maw={280}
                      styles={{ root: { textTransform: 'initial', cursor: 'pointer' } }}
                    >
                      {d.personalization}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Group noWrap align='flex-start'>
                      <Badge
                        miw={60}
                        color={d.strength === 'strong' ? 'blue' : 'yellow'}
                        variant='light'
                        size='xs'
                      >
                        {d.strength}
                      </Badge>
                      <Text size='xs' fs='italic' color='gray.6'>
                        "{d.personalization}"
                      </Text>
                    </Group>
                    <Text size='xs'>{d.reason}</Text>
                  </HoverCard.Dropdown>
                </HoverCard>
              ))}
            </Stack>
          </Card>

          <Card mt={'sm'}>
            <Text fw={700} color='gray.6' fz={'sm'}>
              READ QUANTITY & TIME
            </Text>
            <Text
              mt={'xs'}
              fw={700}
              fz={'lg'}
              display={'flex'}
              sx={{ gap: rem(4), alignItems: 'center' }}
            >
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
    props.score >= 70
      ? 'You have a good score!'
      : props.score >= 30
      ? 'Could be better!'
      : 'Lots to improve on!';

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
