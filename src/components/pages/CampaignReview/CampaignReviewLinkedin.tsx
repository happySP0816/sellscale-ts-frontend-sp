import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Group,
  HoverCard,
  Loader,
  Modal,
  Paper,
  Popover,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconClick,
  IconClock,
  IconEdit,
  IconMessages,
  IconNotes,
  IconPencil,
  IconRecordMail,
  IconRocket,
  IconTarget,
  IconTargetArrow,
  IconUsers,
  IconXboxX,
} from '@tabler/icons';
import { useEffect, useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { TextInput } from '@mantine/core';
import { getRingsIcon, hashString, valueToColor } from '@utils/general';
import { API_URL } from '@constants/data';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { deterministicMantineColor } from '@utils/requests/utils';
import { postAIRequest } from '@utils/requests/postAIRequest';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import NewUIEmailSequencing from '@pages/EmailSequencing/NewUIEmailSequencing';
import { CampaignEntityData } from '@pages/CampaignDetail';
import { Carousel } from '@mantine/carousel';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { CtaList, CtaSection } from '@common/sequence/CtaSection';
import PersonaDetailsCTAs from '@common/persona/details/PersonaDetailsCTAs';
import { getPersonasOverview } from '@utils/requests/getPersonas';
import { PersonaOverview } from 'src';
import postTogglePersonaActive from '@utils/requests/postTogglePersonaActive';
import { navConfettiState } from '@atoms/navAtoms';
import NewUIEmailSequencingModal from '@modals/NewUIEmailSequencingModal';
import LinkedInSequenceSectionModal from '@modals/LinkedInSequenceSectionModal';
import { IconChevronCompactLeft } from '@tabler/icons-react';

type SequenceProps = {
  campaignOverview: any;
  campaignType: string;
  campaignNotes?: string;
};

export const Sequence = (props: SequenceProps) => {
  let SEQUENCE = props.campaignOverview?.linkedin?.sequence;
  if (props.campaignType === 'EMAIL') {
    SEQUENCE = props.campaignOverview?.email?.sequence;
  }

  return (
    <Flex direction={'column'} p={'lg'} style={{ border: '3px solid #0f6cbf' }}>
      {props.campaignNotes && (
        <Card withBorder mb='xs' pb='xs'>
          <Title order={5}>💡 Review Campaign - Notes from SellScale</Title>
          <Text color='gray' size='sm' mb='xs'>
            {props.campaignNotes}
          </Text>
        </Card>
      )}
      {!props.campaignNotes && (
        <Card withBorder>
          <Title order={5}>💡 Review Campaign</Title>
          <Text color='gray' size='sm' mb='xs'>
            Review the campaign and provide feedback when necessary for both the Contacts and
            Messaging. The AI will adjust the campaign based on your feedback and then launch.
          </Text>
        </Card>
      )}

      <Flex mt='md'>
        <Card mr='md'>
          <Text color='#0f6cbf' size={'lg'} fw={500}>
            # of Contacts:{' '}
            {props.campaignType === 'EMAIL'
              ? props.campaignOverview?.overview?.num_prospects_with_emails
              : props.campaignOverview?.overview?.num_prospects}
          </Text>
        </Card>
        <Card>
          <Text color='#0f6cbf' size={'lg'} fw={500}>
            # of steps in sequence: {SEQUENCE?.length} step
            {SEQUENCE?.length > 1 ? 's' : ''}
          </Text>
        </Card>
      </Flex>
    </Flex>
  );
};

type ContactProps = {
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  campaignOverview?: any;
  campaignId: number;
};

export const Contact = (props: ContactProps) => {
  const [contactData, setContactData] = useState<any>();
  const [showAll, setShowAll] = useState(true);
  const [filterData, setFilterData] = useState<any>();
  const theme = useMantineTheme();
  const [modalOpened, modalHandlers] = useDisclosure(false); // For the edit messaging modal
  const userToken = useRecoilValue(userTokenState);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };
  useEffect(() => {
    const res = props.campaignOverview?.contacts?.sample_contacts?.map((x: any) => {
      return {
        avatar: x?.img_url,
        username: x?.full_name,
        score: x?.icp_fit_score,
        content: x?.title,
        linkedin_url: x?.linkedin_url,
        icp_fit_reason: x?.icp_fit_reason,
      };
    });
    const res_filter =
      props.campaignOverview?.contacts &&
      Object.keys(props.campaignOverview?.contacts)
        .filter((key: string) => key !== 'sample_contacts')
        .map((key: string) => {
          if (
            props.campaignOverview?.contacts[key] &&
            props.campaignOverview?.contacts[key].length === 0
          )
            return null;
          return {
            type: key.replaceAll('_', ' '),
            jobs: props.campaignOverview?.contacts[key],
          };
        })
        .filter((x: any) => x !== null);
    setFilterData(res_filter);
    setContactData(res);
  }, []);

  return (
    <>
      <Flex style={{ border: '2px solid #e3f0fe', borderRadius: '12px' }} bg={'white'}>
        {' '}
        <Flex direction={'column'} p={'xl'} gap={'sm'} w={'100%'}>
          <Box>
            <Text size={'lg'} fw={600}>
              Applied Filters
            </Text>
            <Text color='gray' fw={400} size={'sm'}>
              Change this subtitle to say "These are the filters applied to find these contacts"
            </Text>
          </Box>
          {filterData?.length == 0 && (
            <Flex align={'center'} justify={'center'} w={'100%'} h={'100%'}>
              <Text color='gray' size={'sm'}>
                No filters are set.
              </Text>
            </Flex>
          )}
          {filterData
            ?.filter((item: any, index: number) => item?.jobs?.length > 0)
            .map((item: any, index: number) => {
              return (
                <Flex direction={'column'}>
                  <Text color='gray' tt={'uppercase'} fw={600} size={'sm'}>
                    {item?.type
                      .replaceAll('included ', '')
                      .replaceAll('excluded ', '')
                      .replaceAll('individual ', 'contact ')
                      .replaceAll('keywords ', '')}
                  </Text>
                  <Group mb='md' mt='xs'>
                    {item?.jobs?.map((job: string) => {
                      return (
                        <p
                          style={{
                            fontSize: '10px',
                            padding: '2px',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            margin: 2,
                            borderRadius: '8px',
                            backgroundColor: theme.colors[deterministicMantineColor(item?.type)][2],
                          }}
                        >
                          {job}
                        </p>
                      );
                    })}
                  </Group>
                </Flex>
              );
            })}
        </Flex>
        <Flex
          direction={'column'}
          gap={'xs'}
          w={'100%'}
          style={{
            borderLeft: '1px solid #eaeaea',
            position: 'relative',
          }}
        >
          <Flex align={'center'} gap={'sm'} w={'100%'} bg={'#f4f9ff'} p={'md'}>
            <IconUsers size={'1rem'} color='gray' />
            <Text tt={'uppercase'} color='gray' w='60%'>
              example contacts
            </Text>
            <Button
              size='xs'
              w='fit-content'
              radius={'lg'}
              leftIcon={<IconPencil size={'1rem'} />}
              onClick={() => modalHandlers.open()}
            >
              Edit Contacts
            </Button>
          </Flex>

          <Modal
            opened={modalOpened}
            onClose={() => modalHandlers.close()}
            title='View All Contacts'
            size='1000px'
          >
            <iframe
              src={
                // Editable Retool URL: https://sellscale.retool.com/apps/d472bc28-c6d6-11ee-8cc1-4fd0d3627823/Delete%20Prospects%20from%20Campaign
                'https://sellscale.retool.com/embedded/public/20d97ed1-4602-4513-aa77-97f15a210a9d#authToken=' +
                userToken +
                '&campaignId=' +
                props.campaignId
              }
              frameBorder='0'
              width='100%'
              height='400px' // Adjust the height as needed
              allowFullScreen
            ></iframe>
          </Modal>

          <Flex direction={'column'} gap={3} p={'lg'}>
            {contactData?.map((item: any, index: number) => {
              return !showAll || index < 3 ? (
                <Flex key={index} align={'start'} gap={'xs'} mb='md'>
                  <Avatar
                    src={
                      'https://ui-avatars.com/api/?background=random&name=' +
                      item?.username.replaceAll(' ', '+')
                    }
                    size={30}
                    radius={'xl'}
                  />
                  <Flex direction={'column'} w={'100%'}>
                    <Flex align={'center'} w={'100%'}>
                      <Text fw={500} size={'sm'}>
                        {item?.username}
                      </Text>
                      <ActionIcon
                        color='blue'
                        onClick={() => window.open('https://' + item?.linkedin_url, '_blank')}
                      >
                        <IconBrandLinkedin size={'0.8rem'} />
                      </ActionIcon>
                    </Flex>
                    <Text color='gray' size={'xs'} mt={3}>
                      {item?.content}
                    </Text>
                    <Text size='xs' color='gray'>
                      {item?.icp_fit_reason
                        ?.split('), (')
                        .map((x: string) => x.replaceAll('(', '').replaceAll(')', ''))
                        .join(', ')}
                    </Text>
                  </Flex>
                  <Flex>
                    <Badge
                      size='md'
                      w={'100%'}
                      color={
                        item?.score == 0
                          ? 'red'
                          : item?.score == 1
                          ? 'orange'
                          : item?.score == 2
                          ? 'yellow'
                          : item?.score == 3
                          ? 'green'
                          : item?.score == 4
                          ? 'blue'
                          : 'gray'
                      }
                      variant='light'
                    >
                      {item?.score == 0
                        ? 'Very Low'
                        : item?.score == 1
                        ? 'Low'
                        : item?.score == 2
                        ? 'Medium'
                        : item?.score == 3
                        ? 'High'
                        : item?.score == 4
                        ? 'Very High'
                        : 'Not Scored'}
                    </Badge>
                  </Flex>
                </Flex>
              ) : (
                <></>
              );
            })}
          </Flex>
          <Flex
            w={'100%'}
            justify={'center'}
            sx={{
              position: 'absolute',
              bottom: 20,
              backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.7), white)',
            }}
            h={'50px'}
          >
            {contactData?.length > 3 && (
              <Button
                variant='default'
                onClick={handleShowAll}
                leftIcon={<IconUsers size={'0.8rem'} />}
                rightIcon={
                  showAll ? (
                    <IconChevronRight size={'0.8rem'} />
                  ) : (
                    <IconChevronCompactLeft size={'0.8rem'} />
                  )
                }
                sx={{ fontSize: '12px' }}
                radius={'lg'}
                size='sm'
              >
                View more sample contacts
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>

      {/* <Textarea
        label='Feedback for AI'
        description='Provide feedback to the AI to adjust your contacts prior to launch.'
        defaultValue={props.feedback}
        placeholder='ex. I primarily only want to target New Jersey and Canada. Can we focus on those territories? Additionally, VP of Marketing may not be the exact right target for this campaign.'
        minRows={4}
        onChange={(event) => props.onFeedbackChange(event.currentTarget.value)}
      /> */}
    </>
  );
};

type MessagingProps = {
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  campaignOverview?: CampaignEntityData;
  refetchCampaignOverview?: () => void;
  campaignType: string;
  campaignId: number;
};

export const Messaging = (props: MessagingProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [editMessage, setEditMessage] = useState(''); // State to hold the edited message

  const [openid, setOpenId] = useState<number>(0);
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);

  let SEQUENCE = props.campaignOverview?.linkedin?.sequence;
  if (props.campaignType === 'EMAIL') {
    SEQUENCE = props.campaignOverview?.email?.sequence;
  }

  const [emailSequencingOpened, { open: openEmailSequencing, close: closeEmailSequencing }] =
    useDisclosure();
  const [
    linkedinSequenceSectionOpened,
    { open: openLinkedinSequenceSection, close: closeLinkedinSequenceSection },
  ] = useDisclosure();

  // const fetchAttachedAssets = () => {
  //   fetch(`${API_URL}/email_sequence/get_all_asset_mapping?sequence_step_id=${sequence_step_id}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: 'Bearer ' + userToken,
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setAttachedAssets(data.mappings);
  //     })
  //     .catch((error) => console.error('Failed to fetch attached assets', error));
  // };

  const messageData = SEQUENCE?.map((x) => {
    return {
      step: x?.title,
      avatar: '',
      username: userData?.sdr_name,
      message: x?.description,
      // @ts-ignore
      delay: x?.bump_framework_delay,
      assets: x?.assets,
    };
  });
  const handleToggle = (id: number) => {
    toggle();
    setOpenId(id);
  };
  useEffect(() => {
    toggle();
  }, []);

  const { data: assetIcons } = useQuery({
    queryKey: [`query-asset-icons`],
    queryFn: async () => {
      const assetMap = new Map<string, string>();
      for (const asset of props.campaignOverview?.assets_used ?? []) {
        assetMap.set(
          asset.title,
          await getRingsIcon(`${hashString(JSON.stringify(asset), Number.MAX_VALUE)}`)
        );
      }
      return assetMap;
    },
    refetchOnWindowFocus: false,
  });

  const { data: persona } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonasOverview(userToken);
      const personas = response.status === 'success' ? (response.data as PersonaOverview[]) : [];
      return personas.find((persona) => persona.id === props.campaignId);
    },
    refetchOnWindowFocus: false,
  });

  const CAROUSEL_HEIGHT = 200;

  return (
    <>
      {false && (
        <Flex
          p={'2rem'}
          direction={'column'}
          gap={'md'}
          style={{ border: '1px solid #e3f0fe', borderRadius: '6px' }}
        >
          <Box>
            <Title order={4}>Assets Used</Title>
            <Text>Here are the assets used in this campaign</Text>
          </Box>
          <Carousel slideSize='70%' height={CAROUSEL_HEIGHT} slideGap='md' loop>
            {props.campaignOverview?.assets_used?.map((asset, index) => (
              <Carousel.Slide key={index}>
                <Paper h={CAROUSEL_HEIGHT}>
                  <Stack spacing={5} h={CAROUSEL_HEIGHT} justify='space-between'>
                    <Stack spacing={5}>
                      <Group spacing={5} noWrap>
                        <Avatar
                          m='sm'
                          radius={30}
                          size={30}
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(
                            assetIcons?.get(asset.title) ?? ''
                          )}`}
                          alt={asset.title}
                        />
                        <Title order={5}>{asset.title}</Title>
                      </Group>
                      <Container>
                        <Text color='gray.8' fz='xs' fw={400}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(asset.value),
                            }}
                          />
                        </Text>
                      </Container>
                    </Stack>
                    <Stack spacing={5} mih={50}>
                      <Divider />
                      <Container>
                        <Text fz='xs' c='dimmed'>
                          {asset.reason}
                        </Text>
                      </Container>
                    </Stack>
                  </Stack>
                </Paper>
              </Carousel.Slide>
            ))}
          </Carousel>
        </Flex>
      )}
      <Flex
        p={'md'}
        direction={'column'}
        gap={'md'}
        bg={'white'}
        style={{ border: '2px solid #e3f0fe', borderRadius: '12px' }}
      >
        <Box>
          <Title order={4}>Generated Sequences</Title>
          <Text>The generated sequences from the assets.</Text>
        </Box>

        {messageData?.map((item, index) => {
          return (
            <>
              <Box>
                {item?.delay ? (
                  <Badge color='blue' variant='outline'>
                    Wait {item?.delay} days
                  </Badge>
                ) : null}
              </Box>
              <Flex w={'100%'} align={'center'} gap={8}>
                <IconTargetArrow color='gray' size={'1.5rem'} />
                <Flex>
                  <Text tt={'uppercase'} color='gray' className='w-max' fw={500}>
                    step {index + 1}:
                  </Text>
                </Flex>
                <Flex>
                  <Text className='w-max' tt={'uppercase'} fw={500}>
                    {item?.step}
                  </Text>
                </Flex>
                <Divider w={'100%'} />
                <Button
                  tt={'uppercase'}
                  rightIcon={
                    openid === index && opened ? (
                      <IconChevronUp size={'0.9rem'} />
                    ) : (
                      <IconChevronDown size={'0.9rem'} />
                    )
                  }
                  onClick={() => handleToggle(index)}
                  variant='light'
                  size='xs'
                  radius='xl'
                >
                  {openid === index && opened ? 'hide' : 'show'}
                </Button>
              </Flex>
              {openid === index && (
                <Collapse in={opened}>
                  <Flex
                    direction={'column'}
                    p={'md'}
                    gap={'xs'}
                    // bg={'#f4f9ff'}
                    style={{
                      border: '1px solid #89c3fc',
                      borderRadius: '6px',
                      borderStyle: 'dashed',
                    }}
                  >
                    <Flex align={'center'} justify={'space-between'}>
                      <Flex align={'center'} gap={'sm'}>
                        <IconMessages color='#228be6' size={'1.2rem'} />
                        <Text tt={'uppercase'} color='blue' fw={600} size={'sm'}>
                          example message
                        </Text>
                        {/* {item.assets && (
                          <HoverCard width={280} shadow='md' disabled={item.assets.length == 0}>
                            <HoverCard.Target>
                              <Badge color='green'>{item.assets.length} used assets</Badge>
                            </HoverCard.Target>
                            <HoverCard.Dropdown>
                              <Text fz='sm' fw='bold' tt={'uppercase'}>
                                Assets Used:
                              </Text>
                              {item.assets.map((asset, index) => (
                                <Text key={index} fz='sm'>
                                  - {asset.asset_key}
                                </Text>
                              ))}
                            </HoverCard.Dropdown>
                          </HoverCard>
                        )} */}
                      </Flex>
                    </Flex>
                    <Flex align={'start'} gap={'sm'}>
                      <Avatar src={item?.avatar} radius={'xl'} />
                      <Flex direction={'column'} gap={'sm'}>
                        <Text fw={600} size={'sm'}>
                          {item?.username}
                        </Text>
                        <Text size={'xs'} fs='italic' fw={500}>
                          {/* if campaign type is LINKEDIN, show message as is. if email, show html in dangerously set */}
                          {
                            <div
                              dangerouslySetInnerHTML={{
                                __html: item?.message.replaceAll('\n', '<br/>'),
                              }}
                            />
                          }
                        </Text>
                        {item.assets && (
                          <Flex gap={'sm'} align={'center'}>
                            <Text fz='sm' fw='bold' tt={'uppercase'}>
                              Assets Used:
                            </Text>
                            <Flex gap={'xs'} align={'center'}>
                              {item.assets.map((asset, index) => (
                                <Badge variant='outline' color='gray' key={index}>
                                  {asset.asset_key}
                                </Badge>
                              ))}
                            </Flex>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                    {!persona?.template_mode &&
                      persona?.linkedin_active &&
                      props.campaignType === 'LINKEDIN' && <CtaList personaId={props.campaignId} />}
                  </Flex>
                </Collapse>
              )}
            </>
          );
        })}
        <Button
          mx={'auto'}
          onClick={() => {
            if (props.campaignType === 'LINKEDIN') {
              openLinkedinSequenceSection();
            } else {
              openEmailSequencing();
            }
            // const campaignType =
            //   props.campaignType === "LINKEDIN" ? "linkedin" : "email";
            // window.open(
            //   "/setup/" + campaignType + / + props.campaignId,
            //   "_blank"
            // );
          }}
          mt='md'
          ml='auto'
          mr='auto'
          leftIcon={<IconPencil size={'1rem'} />}
          variant='outline'
        >
          Edit Messaging in Campaign Editor
        </Button>

        {/* Modals to review the sequencing */}
        {props.campaignType === 'LINKEDIN' ? (
          <LinkedInSequenceSectionModal
            opened={linkedinSequenceSectionOpened}
            onClose={closeLinkedinSequenceSection}
            archetypeID={props.campaignId}
            backFunction={props.refetchCampaignOverview}
          />
        ) : (
          <NewUIEmailSequencingModal
            opened={emailSequencingOpened}
            onClose={closeEmailSequencing}
            archetypeID={props.campaignId}
            backFunction={props.refetchCampaignOverview}
          />
        )}
      </Flex>
      {/* <Textarea
        label='Feedback for AI'
        description='Provide feedback to the AI to adjust your messaging prior to launch.'
        defaultValue={props.feedback}
        placeholder="ex. For bump #1, instead of saying 'I saw you were the VP of Marketing at Acme Corp', can we say 'I saw you were the VP of Marketing at Acme Corp, and I noticed you're hiring for a new marketing manager. I'd love to learn more about the role and see if I can help.' Also, in general, let's add a 👋 emoji to the first message!"
        minRows={4}
        onChange={(event) => props.onFeedbackChange(event.currentTarget.value)}
      /> */}
    </>
  );
};

interface CampaignFeedback {
  campaign_id: number;
  prospect_feedback: string;
  messaging_feedback: string;
}

function Finalize(props: CampaignFeedback) {
  const [prospectFeedback, setProspectFeedback] = useState(props.prospect_feedback);
  const [messagingFeedback, setMessagingFeedback] = useState(props.messaging_feedback);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Card>
        {/* <Card withBorder>
          <Title order={4} mb="xs">
            Contacts Feedback
          </Title>
          <Text>
            {prospectFeedback.length > 0 ? (
              <i>{'"' + prospectFeedback + '"'}</i>
            ) : (
              <Text color="gray" size="sm">
                No feedback provided
              </Text>
            )}
          </Text>
        </Card> */}

        <Card withBorder mt='md'>
          <Title order={4} mb='xs'>
            Messaging Feedback
          </Title>
          <Text>
            {messagingFeedback.length > 0 ? (
              <i>{'"' + messagingFeedback + '"'}</i>
            ) : (
              <Text color='gray' size='sm'>
                Input any custom messaging you'd like the AI to use if needed. If not, just launch
                the campaign. <br />
                No feedback provided
              </Text>
            )}
          </Text>
        </Card>

        <Divider />
        <Flex mt='sm'>
          {prospectFeedback.length > 0 || messagingFeedback.length > 0 ? (
            <Text color='gray' size='sm'>
              💡 Since feedback was provided, SellScale AI will adjust the messaging and notify you
              once the campaign is ready to launch.
            </Text>
          ) : (
            <Text color='gray' size='sm'>
              🚀 No feedback was provided. Your campaign can be launched immediately!
            </Text>
          )}
        </Flex>
      </Card>
    </div>
  );
}

type CampaignReviewLinkedinProps = {
  onTaskComplete?: () => void;
  campaignId: number;
  campaignType: string;
  campaignNotes?: string;
};

export default function CampaignReview(props: CampaignReviewLinkedinProps) {
  const [opened, { open, close }] = useDisclosure(true);
  const [steps, setSteps] = useState('contact');

  const [contactFeedback, setContactFeedback] = useState('');
  const [messagingFeedback, setMessagingFeedback] = useState('');

  const [finalizingFeedback, setFinalizingFeedback] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [campaignOverview, setCampaignOverview] = useState<CampaignEntityData>();
  const [fetchingCampaign, setFetchingCampaign] = useState<boolean>(false);

  const navigate = useNavigate();

  const submitFeedbackHandler = () => {
    setFinalizingFeedback(true);

    // Submit AI Request
    const campaign_name = campaignOverview?.overview?.archetype_name;
    postAIRequest(
      userToken,
      `Please address the feedback for the campaign titled ${campaign_name} then launch it.\n\nContact Feedback: ${contactFeedback}\nMessaging Feedback: ${messagingFeedback}`
    ).then((res) => {
      props.onTaskComplete && props.onTaskComplete();
      setFinalizingFeedback(false);

      showNotification({
        title: 'Feedback Requested',
        message:
          'SellScale AI will make the necessary adjustments to the campaign based on your feedback. You will be notified once the campaign is ready to launch.',
        color: 'green',
        icon: <IconRocket size='1.5rem' />,
      });
    });
  };

  const launchCampaignHandler = () => {
    setFinalizingFeedback(true);

    // Launch the campaign
    const campaign_name = campaignOverview?.overview?.archetype_name;

    postTogglePersonaActive(
      userToken,
      props.campaignId,
      props.campaignType.toLowerCase(),
      true
    ).then((res) => {
      props.onTaskComplete && props.onTaskComplete();
      setFinalizingFeedback(false);

      const [_confetti, dropConfetti] = useRecoilState(navConfettiState);
      dropConfetti(300);

      showNotification({
        title: 'Campaign Launched!',
        message:
          'The campaign has been successfully launched. Outbound will start soon and you will be notified once the campaign has been completed.',
        color: 'green',
        icon: <IconRocket size='1.5rem' />,
      });
    });
  };

  const getCampaignOverview = async () => {
    setFetchingCampaign(true);

    let return_raw_prompts = false;
    if (props.campaignType === 'EMAIL') {
      return_raw_prompts = true;
    }

    const response = await fetch(
      `${API_URL}/client/campaign_overview?client_archetype_id=${props.campaignId}&return_raw_prompts=${return_raw_prompts}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    setFetchingCampaign(false);

    const data = await response.json();
    setCampaignOverview(data);

    console.log('data===========', data);
  };

  useEffect(() => {
    getCampaignOverview();
  }, [props.campaignId]);

  const handleGoBack = () => {
    // if (steps === 'sequence') return;
    if (steps === 'contact') return;
    if (steps === 'messaging') setSteps('contact');
    if (steps === 'finalize') setSteps('messaging');
  };

  const handleGoNext = () => {
    // if (steps === 'sequence') setSteps('contact');
    if (steps === 'contact') setSteps('messaging');
    if (steps === 'messaging') setSteps('finalize');
    if (steps === 'finalize') return;
  };

  if (fetchingCampaign) {
    return (
      <div
        style={{
          display: 'flex',
          paddingTop: '40px',
          width: '900px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Card
          w='900px'
          withBorder
          pb='100px'
          pt='60px'
          sx={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <Flex align='center' justify={'center'} w='100%' direction='column'>
            <Text size='xl' align='center' fw='bold' mb='4px'>
              Fetching campaign data...
            </Text>
            <Text mt='xs'>
              Please wait while we fetch the campaign data. This can take anywhere from 20-60
              seconds.
            </Text>
            <Loader size='xl' mt='xl' />
          </Flex>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        paddingTop: '40px',
        width: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <Flex direction={'column'} align={'center'} gap={'md'} w={'100%'}>
        <Flex align={'center'} gap={'sm'}>
          <Text fw={600} size={'lg'}>
            {campaignOverview?.overview?.emoji} {campaignOverview?.overview?.archetype_name}
          </Text>
          {props.campaignType === 'LINKEDIN' ? (
            <IconBrandLinkedin size='1.4rem' fill='#228be6' color='white' />
          ) : (
            <IconRecordMail size='1.4rem' fill='#228be6' color='white' />
          )}
          <ActionIcon>
            <IconEdit size='1.2rem' />
          </ActionIcon>
        </Flex>
        <Card shadow='sm' withBorder sx={{ borderRadius: '32px' }} p={'0px'}>
          <Flex align={'center'} py={'xs'} px={'xl'} w={'fit-content'} gap={'sm'}>
            {/* <Text
              sx={{ display: "flex", gap: "3px", alignItems: "center" }}
              size={"sm"}
              fw={500}
            >
              <IconTarget size={"1rem"} />
              Territory: <span className="text-[#228be6]">-</span>
            </Text>
            <Divider orientation="vertical" /> */}
            <Text sx={{ display: 'flex', gap: '3px', alignItems: 'center' }} size={'sm'} fw={500}>
              <IconUsers size={'1rem'} />
              Contacts:{' '}
              <span className='text-[#228be6]'>{campaignOverview?.overview?.num_prospects}</span>
            </Text>
            <Divider orientation='vertical' />
            <Text sx={{ display: 'flex', gap: '3px', alignItems: 'center' }} size={'sm'} fw={500}>
              <IconClock size={'1rem'} /> Time to complete:{' '}
              <span className='text-[#228be6]'>
                {(
                  1 +
                  Math.ceil(campaignOverview?.contacts?.sample_contacts?.length || 0) / 75
                ).toFixed(0)}{' '}
                week
                {Math.ceil(campaignOverview?.contacts?.sample_contacts?.length || 0) > 75
                  ? 's'
                  : ''}
              </span>
            </Text>
          </Flex>
        </Card>
        <Flex align={'center'} gap={'md'} w={'50%'} px={'md'}>
          <Flex
            direction={'column'}
            gap={'2px'}
            align={'center'}
            p={'4px'}
            sx={{
              border: steps === 'contact' ? '1px solid #3386ea' : '',
              borderRadius: '100%',
            }}
          >
            <Text
              sx={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#3386ea',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
              color='white'
            >
              1
            </Text>
          </Flex>
          <Divider
            w={'100%'}
            size={2}
            color={steps === 'messaging' || steps === 'finalize' ? '#89c3fc' : '#ced4da'}
          />
          <Flex
            direction={'column'}
            gap={'2px'}
            p={'4px'}
            align={'center'}
            sx={{
              border: steps === 'messaging' ? '1px solid #3386ea' : '',
              borderRadius: '100%',
            }}
          >
            <Text
              sx={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor:
                  steps === 'messaging' || steps === 'finalize' ? '#3386ea' : '#ced4da',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
              color='white'
            >
              2
            </Text>
          </Flex>
          <Divider w={'100%'} size={2} color={steps === 'finalize' ? '#89c3fc' : '#ced4da'} />
          <Flex
            direction={'column'}
            gap={'2px'}
            p={'4px'}
            align={'center'}
            sx={{
              border: steps === 'finalize' ? '1px solid #3386ea' : '',
              borderRadius: '100%',
            }}
          >
            <Text
              sx={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: steps === 'finalize' ? '#3386ea' : '#ced4da',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
              color='white'
            >
              3
            </Text>
          </Flex>
        </Flex>
        <Flex align={'center'} gap={'md'} justify={'space-between'} w={'52%'}>
          <Text size={'xs'} w={'max-content'}>
            Review Contacts
          </Text>
          <Text size={'xs'} w={'max-content'}>
            Review Contacts
          </Text>
          <Text size={'xs'} w={'max-content'}>
            Review Contacts
          </Text>
        </Flex>
        {campaignOverview !== undefined && (
          <>
            {
              // steps === 'sequence' ? (
              // <Sequence campaignOverview={campaignOverview} campaignType={props.campaignType} campaignNotes={props.campaignNotes} />
              // ) :
              steps === 'contact' ? (
                <Contact
                  feedback={contactFeedback}
                  onFeedbackChange={setContactFeedback}
                  campaignOverview={campaignOverview}
                  campaignId={props.campaignId}
                />
              ) : steps === 'messaging' ? (
                <Messaging
                  feedback={messagingFeedback}
                  onFeedbackChange={setMessagingFeedback}
                  campaignOverview={campaignOverview}
                  refetchCampaignOverview={getCampaignOverview}
                  campaignType={props.campaignType}
                  campaignId={props.campaignId}
                />
              ) : (
                <Finalize
                  campaign_id={1}
                  prospect_feedback={contactFeedback}
                  messaging_feedback={messagingFeedback}
                />
              )
            }
          </>
        )}

        <Flex align={'center'} gap={'lg'} px={'lg'} w='100%'>
          <Button
            onClick={handleGoBack}
            disabled={steps === 'contact'}
            fullWidth
            ml='xs'
            mr='xs'
            leftIcon={<IconArrowLeft size={'0.8rem'} />}
          >
            Go back
          </Button>
          {steps === 'finalize' ? (
            <>
              {contactFeedback.length > 0 || messagingFeedback.length > 0 ? (
                <Button
                  variant='filled'
                  color='orange'
                  leftIcon={<IconNotes size={'0.9rem'} />}
                  px={40}
                  onClick={submitFeedbackHandler}
                  loading={finalizingFeedback}
                  fullWidth
                  rightIcon={<IconArrowRight size={'0.8rem'} />}
                >
                  Give Feedback
                </Button>
              ) : (
                <Button
                  variant='filled'
                  color='green'
                  leftIcon={<IconRocket size={'0.9rem'} />}
                  px={40}
                  onClick={launchCampaignHandler}
                  loading={finalizingFeedback}
                  fullWidth
                  rightIcon={<IconArrowRight size={'0.8rem'} />}
                >
                  Launch Campaign
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleGoNext} fullWidth rightIcon={<IconArrowRight size={'0.8rem'} />}>
              Next
            </Button>
          )}
        </Flex>
      </Flex>
    </div>
  );
}
