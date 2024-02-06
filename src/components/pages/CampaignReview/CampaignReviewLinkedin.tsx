import { ActionIcon, Avatar, Badge, Box, Button, Card, Collapse, Divider, Flex, Group, Loader, Modal, Text, Textarea, Title, useMantineTheme } from '@mantine/core';
import { IconBrandLinkedin, IconChecks, IconChevronDown, IconChevronUp, IconEdit, IconMessages, IconPencil, IconRocket, IconTargetArrow, IconUsers, IconXboxX } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { TextInput } from '@mantine/core';
import { valueToColor } from '@utils/general';
import { API_URL } from '@constants/data';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { deterministicMantineColor } from '@utils/requests/utils';
import { postAIRequest } from '@utils/requests/postAIRequest';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

type SequenceProps = {
  campaignOverview: any;
  campaignType: string;
}

export const Sequence = (props: SequenceProps) => {
  let SEQUENCE = props.campaignOverview?.linkedin?.sequence;
  if (props.campaignType === 'EMAIL') {
    SEQUENCE = props.campaignOverview?.email?.sequence;
  }

  return (
    <Flex direction={'column'} p={'lg'} style={{ border: '3px solid #0f6cbf' }} h={280}>
      <Card withBorder>
        <Title order={5}>💡 Review Campaign</Title>
        <Text color='gray' size='sm'>
          Review the campaign and provide feedback when necessary for both the Contacts and Messaging. The AI will adjust the campaign based on your feedback and then launch.
        </Text>
      </Card>

      <Flex mt='md'>
        <Card mr='md'>
          <Text color='#0f6cbf' size={'lg'} fw={500}>
            # of Contacts: {props.campaignOverview?.overview?.num_prospects}
          </Text>
        </Card>
        <Card>
          <Text color='#0f6cbf' size={'lg'} fw={500}>
            # of steps in sequence: {SEQUENCE?.length} step{SEQUENCE?.length > 1 ? 's' : ''}
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
}

export const Contact = (props: ContactProps) => {
  const [contactData, setContactData] = useState<any>();
  const [showAll, setShowAll] = useState(true);
  const [filterData, setFilterData] = useState<any>();
  const theme = useMantineTheme();
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
        icp_fit_reason: x?.icp_fit_reason
      }
    })
    const res_filter = props.campaignOverview?.contacts && Object.keys(props.campaignOverview?.contacts).filter((key: string) => key !== 'sample_contacts').map((key: string) => {
      if (props.campaignOverview?.contacts[key] && props.campaignOverview?.contacts[key].length === 0) return null;
      return {
        type: key.replaceAll("_", " "),
        jobs: props.campaignOverview?.contacts[key]
      }
    }).filter((x: any) => x !== null)
    setFilterData(res_filter);
    setContactData(res);
  }, []);

  return (
    <>
      <Flex p={'sm'} style={{ border: '1px solid #e3f0fe', borderRadius: '6px' }}>
        {' '}
        <Flex direction={'column'} p={'md'} gap={'sm'} w={'100%'}>
          {filterData?.length == 0 && (
            <Flex align={'center'} justify={'center'} w={'100%'} h={'100%'}>
              <Text color='gray' size={'sm'}>
                No filters are set.
              </Text>
            </Flex>
          )}
          {filterData?.filter((item: any, index: number) => item?.jobs?.length > 0).map((item: any, index: number) => {
            return (
              <Flex direction={'column'}>
                <Text color='gray' tt={'uppercase'} fw={600} size={'sm'}>
                  {item?.type.replaceAll("included ", "").replaceAll("excluded ", "").replaceAll("individual ", "contact ").replaceAll("keywords ", "")}
                </Text>
                <Group mb='md' mt='xs'>
                  {item?.jobs?.map((job: string) => {
                    return (
                      <p
                        style={{fontSize: '10px', padding: '2px', paddingLeft: '8px', paddingRight: '8px', margin: 2, borderRadius: '8px', backgroundColor: theme.colors[deterministicMantineColor(item?.type)][2] }}
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
          p={'md'}
          gap={'xs'}
          bg={'#f4f9ff'}
          w={'100%'}
          style={{ border: '1px solid #89c3fc', borderRadius: '6px', borderStyle: 'dashed' }}
        >
          <Flex align={'center'} gap={'sm'} ml={'sm'}>
            <IconUsers size={'1rem'} color='#228be6' />
            <Text tt={'uppercase'} color='blue'>
              example contacts
            </Text>
          </Flex>
          <Flex direction={'column'} gap={3}>
            {contactData?.map((item: any, index: number) => {
              return !showAll || index < 5 ? (
                <Flex key={index} align={'center'} gap={'xs'} mb='md'>
                  <Avatar src={"https://ui-avatars.com/api/?background=random&name=" + item?.username.replaceAll(" ", "+")} size={30} radius={'xl'} />
                  <Flex direction={'column'} w={'100%'}>
                    <Flex align={'center'} w={'100%'}>
                      <ActionIcon color='blue' onClick={() => window.open('https://' + item?.linkedin_url, '_blank')}>
                        <IconBrandLinkedin size={'0.8rem'} />
                      </ActionIcon>
                      <Text fw={500} size={'sm'}>
                        {item?.username}
                      </Text>
                      <Badge
                        ml='auto'
                        size='md'
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
                    <Text color='gray' size={'xs'} mt={3}>
                      {item?.content}
                    </Text>
                    <Text size='xs' color='gray'>
                      {item?.icp_fit_reason?.split("), (").map((x: string) => x.replaceAll("(", "").replaceAll(")", "")).join(", ")}
                    </Text>
                  </Flex>
                </Flex>
              ) : (
                <></>
              );
            })}
          </Flex>
          <Flex w={'100%'} justify={'end'}>
            {contactData?.length > 5 && (
              <Button variant='subtle' color='blue' onClick={handleShowAll} p={0}>
                {showAll ? `+${contactData.length - 5} more` : 'show less'}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    
      <Textarea
        label="Feedback for AI"
        description="Provide feedback to the AI to adjust your contacts prior to launch."
        defaultValue={props.feedback}
        placeholder="ex. I primarily only want to target New Jersey and Canada. Can we focus on those territories? Additionally, VP of Marketing may not be the exact right target for this campaign."
        minRows={4}
        onChange={(event) => props.onFeedbackChange(event.currentTarget.value)}
      />
    </>
  );
};

type MessagingProps = {
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  campaignOverview?: any;
  campaignType: string;
}

export const Messaging = (props: MessagingProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [openid, setOpenId] = useState<number>(0);
  const userData = useRecoilValue(userDataState)

  let SEQUENCE = props.campaignOverview?.linkedin?.sequence;
  if (props.campaignType === 'EMAIL') {
    SEQUENCE = props.campaignOverview?.email?.sequence;
  }

  const messageData = SEQUENCE?.map((x: any) => {
    return {
      step: x?.title,
      avatar: '',
      username: userData?.sdr_name,
      message: x?.description,
      delay: x?.bump_framework_delay
    }
  })
  const handleToggle = (id: number) => {
    toggle();
    setOpenId(id);
  };
  useEffect(() => {
    toggle();
  }, []);
  return (
    <>
      <Flex p={'md'} direction={'column'} gap={'md'} style={{ border: '1px solid #e3f0fe', borderRadius: '6px' }}>
        {messageData?.map((item: any, index: number) => {
          return (
            <>
              <Box>
                {item?.delay ? <Badge color='blue' variant='outline'>
                  Wait {item?.delay} days
                </Badge> : null}
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
                  rightIcon={openid === index && opened ? <IconChevronUp size={'0.9rem'} /> : <IconChevronDown size={'0.9rem'} />}
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
                    bg={'#f4f9ff'}
                    style={{ border: '1px solid #89c3fc', borderRadius: '6px', borderStyle: 'dashed' }}
                  >
                    <Flex align={'center'} justify={'space-between'}>
                      <Flex align={'center'} gap={'sm'}>
                        <IconMessages color='#228be6' />
                        <Text tt={'uppercase'} color='blue' fw={600}>
                          example message
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex align={'center'} gap={'sm'}>
                      <Avatar src={item?.avatar} radius={'xl'} />
                      <Text fw={600} size={'sm'}>
                        {item?.username}
                      </Text>
                    </Flex>
                    <Text size={'xs'} fs='italic' fw={500}>
                      {/* if campaign type is LINKEDIN, show message as is. if email, show html in dangerously set */}
                      {<div dangerouslySetInnerHTML={{ __html: item?.message.replaceAll("\n", "<br/>") }} />}
                    </Text>
                  </Flex>
                </Collapse>
              )}
            </>
          );
        })}
      </Flex>
      <Textarea
        label="Feedback for AI"
        description="Provide feedback to the AI to adjust your messaging prior to launch."
        defaultValue={props.feedback}
        placeholder="ex. For bump #1, instead of saying 'I saw you were the VP of Marketing at Acme Corp', can we say 'I saw you were the VP of Marketing at Acme Corp, and I noticed you're hiring for a new marketing manager. I'd love to learn more about the role and see if I can help.' Also, in general, let's add a 👋 emoji to the first message!"
        minRows={4}
        onChange={(event) => props.onFeedbackChange(event.currentTarget.value)}
      />
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

  const handleSubmitFeedback = () => {
    console.log('Submitting feedback:', {
      prospectFeedback,
      messagingFeedback,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Card>
        <Card withBorder>
          <Title order={4} mb='xs'>
            Contacts Feedback
          </Title>
          <Text>
            {prospectFeedback.length > 0 ? (
              <i>{'"' + prospectFeedback + '"'}</i>
            ) : (
              <Text color='gray' size='sm'>
                No feedback provided
              </Text>
            )}
          </Text>
        </Card>

        <Card withBorder mt='md'>
          <Title order={4} mb='xs'>
            Messaging Feedback
          </Title>
          <Text>
            {messagingFeedback.length > 0 ? (
              <i>{'"' + messagingFeedback + '"'}</i>
            ) : (
              <Text color='gray' size='sm'>
                No feedback provided
              </Text>
            )}
          </Text>
        </Card>

        <Divider />

        <Text italic mt='lg' fz='sm'>
          💡 If feedback was provided, SellScale AI will adjust the messaging and campaign prior to launch.
        </Text>
      </Card>
    </div>
  );
}

type CampaignReviewLinkedinProps = {
  onTaskComplete?: () => void;
  campaignId: number;
  campaignType: string;
};


export default function CampaignReview(props: CampaignReviewLinkedinProps) {
  const [opened, { open, close }] = useDisclosure(true);
  const [steps, setSteps] = useState('sequence');

  const [contactFeedback, setContactFeedback] = useState('');
  const [messagingFeedback, setMessagingFeedback] = useState('');

  const [finalizingFeedback, setFinalizingFeedback] = useState(false);
  const userToken = useRecoilValue(userTokenState)

  const [campaignOverview, setCampaignOverview] = useState<any>();
  const [fetchingCampaign, setFetchingCampaign] = useState<boolean>(false);

  const navigate = useNavigate();

  const submitFeedbackAndCompleteHandler = () => {
    setFinalizingFeedback(true);
    console.log('Submitting feedback:', {
      contactFeedback,
      messagingFeedback,
    });

    // Submit AI Request
    const campaign_name = campaignOverview?.overview?.archetype_name;
    postAIRequest(userToken, `Please address the feedback for the campaign titled ${campaign_name} then launch it.\n\nContact Feedback: ${contactFeedback}\nMessaging Feedback: ${messagingFeedback}`).then(res => {
      props.onTaskComplete && props.onTaskComplete()
      setFinalizingFeedback(false);

      showNotification({
        title: 'Campaign Queued for Launch',
        message: 'SellScale AI will launch this campaign shortly after addressing any feedback provided.',
        color: 'blue',
        icon: <IconRocket size='1.5rem' />,
      });
    })
  }

  const getCampaignOverview = async () => {
    setFetchingCampaign(true);

    let return_raw_prompts = false;
    if (props.campaignType === 'EMAIL') {
      return_raw_prompts = true;
    }

    const response = await fetch(`${API_URL}/client/campaign_overview?client_archetype_id=${props.campaignId}&return_raw_prompts=${return_raw_prompts}`, {
      'method': 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      }
    })

    setFetchingCampaign(false);

    const data = await response.json();
    setCampaignOverview(data);

    console.log(data);
  }

  useEffect(() => {
    getCampaignOverview();
  }, [props.campaignId])

  const handleGoBack = () => {
    if (steps === 'sequence') return;
    if (steps === 'contact') setSteps('sequence');
    if (steps === 'messaging') setSteps('contact');
    if (steps === 'finalize') setSteps('messaging');
  };

  const handleGoNext = () => {
    if (steps === 'sequence') setSteps('contact');
    if (steps === 'contact') setSteps('messaging');
    if (steps === 'messaging') setSteps('finalize');
    if (steps === 'finalize') return;
  };

  if (fetchingCampaign) {
    return (
      <div style={{ display: 'flex',  paddingTop: '40px', width: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Card w='900px' withBorder pb='100px' pt='60px' sx={{justifyContent: 'center', alignItems: 'center'}}>
          <Box ml='auto' mr='auto'>
            <Text size='xl' align='center' fw='bold' mb='4px'>
              Fetching campaign data...
            </Text>
            <Text mt='xs'>
              Please wait while we fetch the campaign data. This can take anywhere from 20-60 seconds.
            </Text>
            <Loader size='xl' mt='xl' />
          </Box>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex',  paddingTop: '40px', width: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
      <Flex direction={'column'} gap={'md'} w='900px'>
        <Flex align={'center'} gap={'sm'}>
          <Text fw={600}>{campaignOverview?.overview?.emoji} {campaignOverview?.overview?.archetype_name}</Text>
          <Badge color='blue' variant='filled' size='md' leftSection={<IconBrandLinkedin size='0.8rem' style={{marginTop: '4px'}} />}>
            LinkedIn
          </Badge>
        </Flex>
        <Flex align={'center'} gap={'md'}>
          <Badge color='blue' w={'100%'} variant='filled' size='lg'>
            1. Sequence
          </Badge>
          <Divider w={'100%'} size={2} color={steps === 'contact' || steps === 'messaging' || steps === 'finalize' ? '#89c3fc' : '#ced4da'} />
          <Badge color='blue' w={'100%'} variant={steps === 'contact' || steps === 'messaging' || steps === 'finalize' ? 'filled' : 'outline'} size='lg'>
            2. Contacts
          </Badge>
          <Divider w={'100%'} size={2} color={steps === 'messaging' || steps === 'finalize' ? '#89c3fc' : '#ced4da'} />
          <Badge color='blue' w={'100%'} variant={steps === 'messaging' || steps === 'finalize' ? 'filled' : 'outline'} size='lg'>
            3. Messaging
          </Badge>
          <Divider w={'100%'} size={2} color={steps === 'finalize' ? '#89c3fc' : '#ced4da'} />
          <Badge color='blue' w={'100%'} variant={steps === 'finalize' ? 'filled' : 'outline'} size='lg'>
            4. Complete
          </Badge>
        </Flex>
        {steps === 'sequence' ? 
          <Sequence campaignOverview={campaignOverview} campaignType={props.campaignType} /> : 
          steps === 'contact' ? <Contact feedback={contactFeedback} onFeedbackChange={setContactFeedback} campaignOverview={campaignOverview} /> :
          steps === 'messaging' ? <Messaging feedback={messagingFeedback} onFeedbackChange={setMessagingFeedback} campaignOverview={campaignOverview} campaignType={props.campaignType} />:
          <Finalize campaign_id={1} prospect_feedback={contactFeedback} messaging_feedback={messagingFeedback} />
        }
        <Flex align={'center'} justify={'space-between'} w='900px'>
          
          <Flex align={'center'} gap={'sm'} ml='auto'>
            <Button onClick={handleGoBack} disabled={steps === 'sequence'} w={180} ml='xs' mr='xs'>
              Go back
            </Button>
            {
              steps === 'finalize' ?
              (<Button variant='filled' color='green' leftIcon={<IconRocket size={'0.9rem'} />} px={40} onClick={submitFeedbackAndCompleteHandler} loading={finalizingFeedback}>
                Submit Feedback & Launch
              </Button>) 
              :
              (<Button onClick={handleGoNext} w={180}>
                Next
              </Button>)
            }
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}
