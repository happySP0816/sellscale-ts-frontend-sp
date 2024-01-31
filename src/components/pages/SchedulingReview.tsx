import React, { FC, useState } from 'react';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import {
  Text,
  Flex,
  Badge,
  Button,
  Modal,
  Avatar,
  Divider,
  rem,
  Tabs,
  Rating,
  Textarea,
  Radio,
  Group,
  Container,
  Box,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconChecks,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconInfoCircle,
  IconMail,
  IconMessage,
  IconTrash,
  IconUser,
  IconX,
  IconXboxX,
} from '@tabler/icons';
import { DateInput } from '@mantine/dates';
import { IconCalendarCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getProspectShallowByID } from '@utils/requests/getProspectByID';
import { LinkedInMessage, ProspectShallow } from 'src';
import { userTokenState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';
import { getConversation } from '@utils/requests/getConversation';
import { useNavigate } from 'react-router-dom';
import { navigateToPage } from '@utils/documentChange';
import _ from 'lodash';
import { convertDateToCasualTime } from '@utils/general';
import { ICPFitPillOnly } from '@common/pipeline/ICPFitAndReason';
import postSubmitDemoFeedback from '@utils/requests/postSubmitDemoFeedback';
import { updateChannelStatus } from '@common/prospectDetails/ProspectDetailsChangeStatus';
import { showNotification } from '@mantine/notifications';
import { API_URL } from '@constants/data';

export const MarkAs = (props: {
  prospect: ProspectShallow;
  sendFeedback: boolean;
  onTaskComplete?: () => void;
}) => {
  const userToken = useRecoilValue(userTokenState);
  const navigate = useNavigate();

  const [status, setStatus] = useState<string | null>('demo-set');
  const [notQualified, setNotQualified] = useState('');
  const [notInterested, setNotInterested] = useState('');
  const [demoDate, setDemoDate] = useState<Date | null>(null);

  const updateProspectDemoDate = async (
    value: string,
    send_reminder: boolean
  ): Promise<Response> => {
    return await fetch(`${API_URL}/prospect/${props.prospect.id}/demo_date`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        demo_date: value,
        send_reminder: send_reminder,
      }),
    });
  };

  const changeStatus = async (status: string, disqualification_reason?: string | null) => {
    const isEmail = false;
    if (isEmail) {
      // HARD CODE IN THE EMAIL FOR NOW
      const response = await updateChannelStatus(
        props.prospect.id,
        userToken,
        'EMAIL',
        status,
        false,
        false,
        disqualification_reason
      );
      if (response.status !== 'success') {
        showNotification({
          title: 'Error',
          message: 'There was an error changing the status',
          color: 'red',
          autoClose: 5000,
        });
        return;
      } else {
        const formatted_status = status
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, function (c) {
            return c.toUpperCase();
          });
        showNotification({
          title: 'Status changed',
          message: `Prospect's status has been changed to ${formatted_status}`,
          color: 'green',
          autoClose: 5000,
        });
      }
    } else {
      await updateChannelStatus(
        props.prospect.id,
        userToken,
        'LINKEDIN',
        status,
        false,
        false,
        disqualification_reason
      );
    }
  };

  useDidUpdate(() => {
    const handleNext = async () => {
      if (status === 'demo-set') {
        await updateProspectDemoDate(demoDate?.toISOString() ?? '', true);
      } else if (status === 'not-qualified') {
        await changeStatus('NOT_QUALIFIED', notQualified);
      } else if (status === 'not-interested') {
        await changeStatus('NOT_INTERESTED', notInterested);
      }

      props.onTaskComplete?.();
      navigateToPage(navigate, '/overview');
    };
    if (props.sendFeedback) {
      handleNext();
    }
  }, [props.sendFeedback]);

  return (
    <Flex w={'100%'} p={'xl'} direction={'column'} gap={'md'}>
      <Flex align={'center'} gap={3}>
        <IconInfoCircle color='gray' size={'0.8rem'} />
        <Text color='gray' size={'sm'}>
          Move prospect out of scheduling by selecting one of ther three stages below.
        </Text>
      </Flex>
      <Flex direction={'column'}>
        <Text fw={500} color='gray' tt={'uppercase'} size={'sm'}>
          Mark as:
        </Text>
        <Tabs
          value={status}
          onTabChange={setStatus}
          keepMounted={false}
          h='100%'
          w={'100%'}
          variant='unstyled'
          styles={(theme) => ({
            tabsList: {
              height: '44px',
              gap: 15,
            },
            panel: {
              backgroundColor: theme.white,
              marginBlock: 20,
            },
            tab: {
              ...theme.fn.focusStyles(),
              backgroundColor: theme.white,
              marginBottom: 0,
              height: '35px',
              border: '2px solid',
              borderRadius: 8,
              color: theme.colors.blue[theme.fn.primaryShade()],

              '&[data-active]': {},
              '&:disabled': {
                backgroundColor: theme.colors.gray[theme.fn.primaryShade()],
                color: theme.colors.gray[4],
              },
              '&:not([data-active])': {
                borderColor: '#f3f2f4',
              },
            },
            tabLabel: {
              fontWeight: 700,
              fontSize: rem(14),
            },
          })}
        >
          <Tabs.List grow>
            <Tabs.Tab value='demo-set' icon={<IconCalendarCheck size='0.9rem' />}>
              <Text color='black'>Demo Set</Text>
            </Tabs.Tab>
            <Tabs.Tab value='not-qualified' icon={<IconTrash size='0.9rem' color='gray' />}>
              <Text color='black'>Not Qualified</Text>
            </Tabs.Tab>
            <Tabs.Tab value='not-interested' icon={<IconX size='0.9rem' color='red' />}>
              <Text color='black'>Not Interested</Text>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='demo-set'>
            <Flex direction={'column'} gap={5} w={'100%'}>
              <Text tt={'uppercase'} color='gray' fw={500} size={'sm'}>
                demo set date:
              </Text>
              <DateInput
                placeholder='Set Date'
                size='sm'
                rightSection={<IconCalendar size={'1rem'} />}
                value={demoDate}
                onChange={setDemoDate}
              />
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel value='not-qualified'>
            <Text fw={500} color='gray' size={'sm'} tt={'uppercase'}>
              reason:
            </Text>
            <Radio.Group
              style={{ border: '1px solid #e7e7e9', borderRadius: '6px' }}
              px={'xs'}
              py={'md'}
              value={notQualified}
              onChange={setNotQualified}
            >
              <Group>
                <Radio size='xs' value='not_decision' label='Not a decision maker' />
                <Radio size='xs' value='account_fit' label='Poor account fit' />
                <Radio size='xs' value='contact' label="Contact is 'open to work'" />
                <Radio size='xs' value='competitor' label='Competitor' />
                <Radio size='xs' value='other' label='Other' />
              </Group>
            </Radio.Group>
            {notQualified === 'other' && (
              <Flex direction={'column'} mt={'md'}>
                <Text color='gray' fw={500} tt={'uppercase'} size={'sm'}>
                  enter reason here:
                </Text>
                <Textarea minRows={5} placeholder='Write feedback here...' />
              </Flex>
            )}
          </Tabs.Panel>
          <Tabs.Panel value='not-interested'>
            <Text fw={500} color='gray' size={'sm'} tt={'uppercase'}>
              reason:
            </Text>
            <Radio.Group
              style={{ border: '1px solid #e7e7e9', borderRadius: '6px' }}
              px={'xs'}
              py={'md'}
              value={notInterested}
              onChange={setNotInterested}
            >
              <Group>
                <Radio size='xs' value='uniconvinced' label='Uniconvinced' />
                <Radio size='xs' value='timing_not_right' label='Timing not right' />
                <Radio size='xs' value='unrespoonsive' label='Unresponsive' />
                <Radio size='xs' value='using_a_competitor' label='Using a competitor' />
                <Radio size='xs' value='other' label='Other' />
              </Group>
            </Radio.Group>
            {notInterested === 'other' && (
              <Flex direction={'column'} mt={'md'}>
                <Text color='gray' fw={500} tt={'uppercase'} size={'sm'}>
                  enter reason here:
                </Text>
                <Textarea minRows={5} placeholder='Write feedback here...' />
              </Flex>
            )}
          </Tabs.Panel>
        </Tabs>
      </Flex>
    </Flex>
  );
};

export const ProspectOverview = (props: { prospect: ProspectShallow }) => {
  const userToken = useRecoilValue(userTokenState);
  const navigate = useNavigate();
  const { data: convo } = useQuery({
    queryKey: [`query-get-scheduling-convo-${props.prospect.id}`],
    queryFn: async () => {
      const result = await getConversation(userToken, props.prospect.id, false);
      return result.status === 'success' ? (result.data.data as LinkedInMessage[]) : undefined;
    },
    enabled: !!props.prospect.id,
  });

  // Fit the messages into clusters based on who sent the message
  const chatMsgs = _.reduce<LinkedInMessage, LinkedInMessage[][]>(
    (convo ?? []).sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1)).slice(0, 5),
    (result, message, index) => {
      if (index === 0 || message.connection_degree !== (convo ?? [])[index - 1].connection_degree) {
        // Start of a new cluster
        result.push([message]);
      } else {
        // Continue the current cluster
        result[result.length - 1].push(message);
      }
      return result;
    },
    []
  )
    .filter((c) => c.length > 0)
    .map((cluster) => {
      // Convert the cluster into chat format

      if (cluster[0].connection_degree === 'You') {
        return {
          imgUrl: cluster[0].img_url,
          mychat: cluster.map((m) => m.message),
          response: [],
          myDate: convertDateToCasualTime(new Date(cluster[0].date)),
          responseDate: '',
        };
      } else {
        return {
          imgUrl: cluster[0].img_url,
          mychat: [],
          response: cluster.map((m) => m.message),
          myDate: '',
          responseDate: convertDateToCasualTime(new Date(cluster[0].date)),
        };
      }
    });

  return (
    <>
      <Flex direction={'column'} justify={'space-between'} miw={'fit-content'} p={30} gap={'sm'}>
        <Flex gap={4} direction={'column'}>
          <Flex gap={'sm'}>
            <Avatar src={''} size={40} radius={'xl'} />
            <Flex direction={'column'} justify={'space-between'}>
              <Text fw={600}>{props.prospect.full_name}</Text>
              <ICPFitPillOnly
                icp_fit_score={props.prospect.icp_fit_score}
                size='sm'
                w={'fit-content'}
              />
            </Flex>
          </Flex>
          {/* <Flex gap={4} align={'center'} mt={7}>
            <IconUser size={'0.8rem'} color='gray' />
            <Text size={'xs'} lineClamp={1} color='gray' fw={500}>
              {props.prospect.}
            </Text>
          </Flex> */}
          <Flex gap={4} align={'center'}>
            <IconBriefcase size={'0.8rem'} color='gray' />
            <Text size={'xs'} color='gray' fw={500}>
              {props.prospect.title}
            </Text>
          </Flex>
          <Flex gap={4} align={'center'}>
            <IconBuildingSkyscraper size={'0.8rem'} color='gray' />
            <Text size={'xs'} color='gray' fw={500}>
              {props.prospect.company}
            </Text>
          </Flex>
        </Flex>
        <Flex gap={4} align={'center'}>
          <IconInfoCircle size={'0.8rem'} color='gray' />
          <Text size={'xs'} color='gray' fw={500}>
            {'Intent to Schdule found'}
          </Text>
        </Flex>
      </Flex>
      <Divider orientation='vertical' color='#e7e7e9' />
      <Flex direction={'column'} w={'100%'} p={30} gap={'sm'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex>
            <Text size={'sm'} fw={500}>
              {props.prospect.first_name}
            </Text>
            <Text color='gray' size={'sm'} fw={500}>
              's chat Transcript:
            </Text>
          </Flex>
          <Badge
            variant='outline'
            w={'fit-content'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigateToPage(navigate, `/prospects/${props.prospect.id}`);
            }}
          >
            view full chat
          </Badge>
        </Flex>
        <Flex direction={'column'}>
          {chatMsgs.map((item, index) => {
            return (
              <Box key={index}>
                <Flex gap={'sm'} mt={'sm'}>
                  <Avatar src={item.imgUrl} radius={'xl'} mt={4} />
                  <Flex direction={'column'}>
                    {item?.mychat.map((mychat) => {
                      return (
                        <Flex
                          bg={'#e7e7e9'}
                          w={'fit-content'}
                          px={'sm'}
                          mt={6}
                          py={3}
                          style={{ borderRadius: '10px', borderBottomLeftRadius: '0px' }}
                        >
                          <Text size={'sm'}>{mychat}</Text>
                        </Flex>
                      );
                    })}
                    <Text color='gray' size={'xs'} mt={'xs'} fw={500}>
                      {item?.myDate}
                    </Text>
                    {item?.response.map((res) => {
                      return (
                        <Flex
                          bg={'#3c85ef'}
                          px={'sm'}
                          w={'fit-content'}
                          mt={6}
                          py={3}
                          style={{ borderRadius: '10px', borderBottomLeftRadius: '0px' }}
                        >
                          <Text size={'sm'} color='white' fw={200}>
                            {res}
                          </Text>
                        </Flex>
                      );
                    })}
                    <Flex w={'100%'} justify={'end'}>
                      <Text color='gray' size={'xs'} mt={'xs'} fw={500}>
                        {item?.responseDate}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default function SchedulingReview(props: {
  prospect_id: number;
  prospect_full_name: string;
  prospect_demo_date_formatted: string;
  onTaskComplete?: () => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [opened, { open, close }] = useDisclosure(false);
  const [step, setStep] = useState('prospect_overview');
  const [sendFeedback, setSendFeedback] = useState(false);

  const { data: prospect } = useQuery({
    queryKey: [`query-get-demo-feedback-prospect-shallow-${props.prospect_id}`],
    queryFn: async () => {
      const response = await getProspectShallowByID(userToken, props.prospect_id);
      return response.status === 'success' ? (response.data as ProspectShallow) : undefined;
    },
    enabled: !!props.prospect_id,
  });

  if (!prospect) return null;

  return (
    <>
      <Container pt={10}>
        <Flex align={'center'} gap={'sm'}>
          <IconCalendar />
          <Text size={24} fw={700}>
            Schedule Meeting
          </Text>
        </Flex>
        <Flex direction={'column'} gap={'xl'}>
          <Text color='gray' size={'sm'}>
            {'Demo feedback is needed for the prospect'}
          </Text>
          <Flex gap={'sm'} align={'center'} px={'sm'}>
            <Divider w={'100%'} />
            <Flex>
              <Badge
                variant={step === 'mask_as' ? 'outline' : 'filled'}
                leftSection={
                  step === 'mask_as' && (
                    <IconCircleCheck
                      style={{ width: rem(16), height: rem(16), marginTop: '7px' }}
                    />
                  )
                }
                size='lg'
              >
                <Text color={step === 'mask_as' ? 'gray' : ''}>1. Prospect overview</Text>
              </Badge>
            </Flex>
            <Divider
              label={
                <IconChevronRight
                  style={{ border: '1px solid #e7e7e9', borderRadius: '100%' }}
                  size={14}
                  color='gray'
                />
              }
              w={'100%'}
              labelPosition='center'
            />
            <Flex>
              <Badge
                variant={step === 'mask_as' ? 'filled' : 'outline'}
                color={step === 'mask_as' ? '' : 'gray'}
                size='lg'
              >
                {'2.'}mark as
              </Badge>
            </Flex>
            <Divider w={'100%'} />
          </Flex>
          <Flex style={{ border: '1px solid #9ac0f7', borderRadius: '6px' }}>
            {step === 'prospect_overview' ? (
              <ProspectOverview prospect={prospect} />
            ) : (
              <MarkAs
                prospect={prospect}
                sendFeedback={sendFeedback}
                onTaskComplete={props.onTaskComplete}
              />
            )}
          </Flex>
          <Flex gap={60} p={'xl'} justify={'space-between'}>
            <Button
              leftIcon={<IconArrowLeft />}
              w={'100%'}
              size='md'
              variant={step === 'mask_as' ? 'outline' : ''}
              disabled={step === 'prospect_overview'}
              onClick={() => {
                if (step === 'mask_as') setStep('prospect_overview');
              }}
              radius={'md'}
            >
              Go Back
            </Button>
            <Button
              leftIcon={step === 'mask_as' ? <IconChecks /> : ''}
              rightIcon={step === 'mask_as' ? '' : <IconArrowRight />}
              w={'100%'}
              size='md'
              color={step === 'mask_as' ? 'green' : ''}
              onClick={() => {
                if (step === 'prospect_overview') setStep('mask_as');
                else {
                  setSendFeedback(true);
                }
              }}
              radius={'md'}
            >
              {step === 'mask_as' ? 'Mark as Reviewed' : 'Next'}
            </Button>
          </Flex>
        </Flex>
      </Container>
    </>
  );
}
