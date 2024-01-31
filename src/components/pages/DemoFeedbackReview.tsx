import React, { FC, forwardRef, useImperativeHandle, useRef, useState } from 'react';
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
  IconMail,
  IconMessage,
  IconUser,
  IconXboxX,
} from '@tabler/icons';
import { DateInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { getProspectShallowByID } from '@utils/requests/getProspectByID';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { ProspectShallow } from 'src';
import { ICPFitPillOnly } from '@common/pipeline/ICPFitAndReason';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';
import postSubmitDemoFeedback from '@utils/requests/postSubmitDemoFeedback';

const ProvideFeedback = forwardRef(
  (
    props: { prospect: ProspectShallow; sendFeedback: boolean; onTaskComplete?: () => void },
    ref
  ) => {
    useImperativeHandle(
      ref,
      () => {
        return {
          getState: () => {
            return {
              status,
              rating,
              feedback,
              reschedule,
              rescheduleDate,
            };
          },
        };
      },
      []
    );

    const userToken = useRecoilValue(userTokenState);
    const navigate = useNavigate();

    const [status, setStatus] = useState<string | null>('yes');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [reschedule, setReschedule] = useState('yes');
    const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);

    useDidUpdate(() => {
      const handleNext = async () => {
        await postSubmitDemoFeedback(
          userToken,
          props.prospect.id,
          status === 'yes' ? 'OCCURRED' : status === 'no-show' ? 'NO-SHOW' : 'RESCHEDULED',
          `${rating}/5`,
          feedback,
          rescheduleDate ?? undefined,
          undefined
        );
        props.onTaskComplete?.();
        navigateToPage(navigate, '/overview');
      };
      if (props.sendFeedback) {
        handleNext();
      }
    }, [props.sendFeedback]);

    return (
      <Flex w={'100%'} p={'xl'}>
        <Tabs
          value={status}
          onTabChange={setStatus}
          mt='md'
          keepMounted={false}
          h='100%'
          w={'100%'}
          variant='unstyled'
          styles={(theme) => ({
            tabsList: {
              height: '44px',
            },
            panel: {
              backgroundColor: theme.white,
              marginInline: 7,
              marginBlock: 20,
            },
            tab: {
              ...theme.fn.focusStyles(),
              backgroundColor: theme.white,
              marginBottom: 0,
              height: '35px',
              marginInline: 5,
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
          <Text tt={'uppercase'} color='gray' fw={500} size={'sm'} pl={5}>
            did the demo happen:
          </Text>
          <Tabs.List grow>
            <Tabs.Tab value='yes' icon={<IconCircleCheck size='0.9rem' />}>
              <Text color='black'>Yes</Text>
            </Tabs.Tab>
            <Tabs.Tab value='no-show' icon={<IconXboxX size='0.9rem' color='red' />}>
              <Text color='black'>No-Show</Text>
            </Tabs.Tab>
            <Tabs.Tab value='reschedule' icon={<IconClock size='0.9rem' color='orange' />}>
              <Text color='black'>Rescheduled</Text>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='yes'>
            <Text tt={'uppercase'} color='gray' fw={500} size={'sm'}>
              rate demo:
            </Text>
            <Rating value={rating} onChange={setRating} />
            <Text tt={'uppercase'} color='gray' fw={500} mt={'md'} size={'sm'}>
              provide feedback:
            </Text>
            <Textarea
              placeholder='Write feedback here...'
              minRows={5}
              value={feedback}
              onChange={(event) => setFeedback(event.currentTarget.value)}
            />
          </Tabs.Panel>
          <Tabs.Panel value='no-show'>
            <Flex align={'center'} justify={'space-between'}>
              <Flex direction={'column'} gap={5} w={'100%'}>
                <Text tt={'uppercase'} color='gray' fw={500} size={'sm'}>
                  do you want sellscale to reschedule:
                </Text>
                <Flex>
                  <Radio.Group>
                    <Group>
                      <Radio
                        label='Yes'
                        name='Yes'
                        value='Yes'
                        px={'xl'}
                        py={7}
                        size='xs'
                        style={{
                          outline: `${
                            reschedule === 'yes' ? ' 1px solid #228be6' : ' 1px solid #ced4da'
                          }`,
                          borderRadius: '6px',
                        }}
                        onClick={() => setReschedule('yes')}
                      />
                      <Radio
                        label='No'
                        name='No'
                        value='No'
                        px={'xl'}
                        py={7}
                        size='xs'
                        style={{
                          outline: `${
                            reschedule === 'no' ? ' 1px solid #228be6' : '1px solid #ced4da'
                          }`,
                          borderRadius: '6px',
                        }}
                        onClick={() => setReschedule('no')}
                      />
                    </Group>
                  </Radio.Group>
                </Flex>
              </Flex>
              <Flex direction={'column'} gap={5} w={'100%'}>
                <Text tt={'uppercase'} color='gray' fw={500} size={'sm'}>
                  reschedule to:
                </Text>
                <DateInput
                  value={rescheduleDate}
                  onChange={setRescheduleDate}
                  placeholder='Set Date'
                  size='xs'
                  disabled={reschedule === 'no'}
                  rightSection={<IconCalendar size={'0.8rem'} />}
                />
              </Flex>
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel value='reschedule'>
            <Flex direction={'column'} gap={5} w={'100%'}>
              <Text tt={'uppercase'} color='gray' fw={500} size={'sm'}>
                what date was it rescheduled to:
              </Text>
              <DateInput
                placeholder='Set Date'
                size='sm'
                rightSection={<IconCalendar size={'1rem'} />}
              />
            </Flex>
          </Tabs.Panel>
        </Tabs>
      </Flex>
    );
  }
);

export const ProspectOverview = (props: { prospect: ProspectShallow; demoDate: string }) => {
  const userData = useRecoilValue(userDataState);

  return (
    <>
      <Flex direction={'column'} miw={'fit-content'} p={30} gap={'sm'}>
        <Text color='gray' size={'sm'} fw={500} tt={'uppercase'}>
          about demo:
        </Text>
        <Flex
          direction={'column'}
          gap={8}
          py={'xs'}
          px={'sm'}
          style={{ border: '1px solid #e7e7e9', borderRadius: '6px' }}
        >
          <Flex gap={3}>
            <Text color='gray' fw={'500'} size={'sm'}>
              {'Prospect:'}
            </Text>
            <Text fw={500} size={'sm'}>
              {props.prospect.full_name}
            </Text>
          </Flex>
          <Divider />
          <Flex gap={3}>
            <Text color='gray' fw={500} size={'sm'}>
              {'Rep:'}
            </Text>
            <Text fw={500} size={'sm'}>
              {userData?.sdr_name}
            </Text>
          </Flex>
          <Divider />
          <Flex gap={3}>
            <Text color='gray' fw={500} size={'sm'}>
              {'Scheduled For:'}
            </Text>
            <Text fw={500} size={'sm'}>
              {props.demoDate}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Divider orientation='vertical' color='#e7e7e9' />
      <Flex direction={'column'} w={'100%'} p={30} gap={'sm'}>
        <Text color='gray' size={'sm'} fw={500} tt={'uppercase'}>
          about prospect:
        </Text>
        <Flex
          direction={'column'}
          gap={8}
          py={'xs'}
          px={'sm'}
          style={{ border: '1px solid #e7e7e9', borderRadius: '6px' }}
        >
          <Flex align={'center'} gap={'sm'}>
            <Avatar src={''} size={30} radius={'xl'} />
            <Text size={'sm'} fw={600}>
              {props.prospect.full_name}
            </Text>
            <Divider orientation='vertical' h={'50%'} mt={7} />
            <Text size={'xs'} color='gray' fw={500}>
              ICP Score:
            </Text>
            <ICPFitPillOnly icp_fit_score={props.prospect.icp_fit_score} size='sm' />
          </Flex>
          <Flex gap={6}>
            <Flex direction={'column'}>
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
            <Flex direction={'column'}>
              <Flex gap={4} align={'center'}>
                <IconMail fill='gray' color='white' size={'0.8rem'} />
                <Text size={'xs'} color='gray' fw={500}>
                  {props.prospect.email}
                </Text>
              </Flex>
              <Flex gap={4} align={'center'}>
                <IconBrandLinkedin fill='gray' color='white' size={'0.8rem'} />
                <Text size={'xs'} color='gray' fw={500}>
                  {`linkedin.com/in/${props.prospect.li_public_id}`}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex gap={4} align={'center'} mt={'-7px'}>
            <IconUser size={'0.8rem'} color='gray' />
            <Text size={'xs'} lineClamp={1} color='gray' fw={500}>
              {''}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default function DemoFeedbackReview(props: {
  prospect_id: number;
  prospect_full_name: string;
  prospect_demo_date_formatted: string;
  onTaskComplete?: () => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [opened, { open, close }] = useDisclosure(false);
  const [step, setStep] = useState('prospect_overview');

  const feedbackRef = useRef<any>();
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
      {/* <Modal opened={opened} onClose={close} withCloseButton={false} size={'xl'}> */}
      <Container pt={10}>
        <Flex align={'center'} gap={'sm'}>
          <IconMessage />
          <Text size={24} fw={700}>
            Demo Feedback
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
                variant={step === 'provide_feedback' ? 'outline' : 'filled'}
                leftSection={
                  step === 'provide_feedback' && (
                    <IconCircleCheck
                      style={{ width: rem(16), height: rem(16), marginTop: '7px' }}
                    />
                  )
                }
                size='lg'
              >
                <Text color={step === 'provide_feedback' ? 'gray' : ''}>1. Prospect overview</Text>
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
                variant={step === 'provide_feedback' ? 'filled' : 'outline'}
                color={step === 'provide_feedback' ? '' : 'gray'}
                size='lg'
              >
                {'2.'}provide feedback
              </Badge>
            </Flex>
            <Divider w={'100%'} />
          </Flex>
          <Text>
            {step === 'prospect_overview'
              ? 'This is an overview of the prospect to jog your memory.'
              : 'Provide feedback on the prospect.'}
          </Text>
          <Flex style={{ border: '1px solid #9ac0f7', borderRadius: '6px' }}>
            {step === 'prospect_overview' ? (
              <ProspectOverview prospect={prospect} demoDate={props.prospect_demo_date_formatted} />
            ) : (
              <ProvideFeedback
                ref={feedbackRef}
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
              variant={step === 'provide_feedback' ? 'outline' : ''}
              disabled={step === 'prospect_overview'}
              onClick={() => {
                if (step === 'provide_feedback') setStep('prospect_overview');
              }}
              radius={'md'}
            >
              Go Back
            </Button>
            <Button
              leftIcon={step === 'provide_feedback' ? <IconChecks /> : ''}
              rightIcon={step === 'provide_feedback' ? '' : <IconArrowRight />}
              w={'100%'}
              size='md'
              color={step === 'provide_feedback' ? 'green' : ''}
              onClick={() => {
                if (step === 'prospect_overview') setStep('provide_feedback');
                else {
                  setSendFeedback(true);
                }
              }}
              radius={'md'}
            >
              {step === 'provide_feedback' ? 'Mark as Reviewed' : 'Next'}
            </Button>
          </Flex>
        </Flex>
      </Container>
      {/* </Modal>
      <Button onClick={open}>Open Modal</Button> */}
    </>
  );
}
