import {
  Drawer,
  LoadingOverlay,
  ScrollArea,
  Title,
  Badge,
  Flex,
  useMantineTheme,
  Tabs,
  Divider,
  ActionIcon,
  Paper,
  Group,
  Text,
  Avatar,
  Stack,
  Button,
  Indicator,
  Radio,
  TextInput,
  Rating,
  Textarea,
  Box,
  Checkbox,
} from '@mantine/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import { QueryClient, useQuery } from '@tanstack/react-query';
import {
  channelToIcon,
  updateChannelStatus,
} from '../common/prospectDetails/ProspectDetailsChangeStatus';
import { userTokenState } from '@atoms/userAtoms';
import { useEffect, useRef, useState } from 'react';
import { Channel, Prospect } from 'src';
import { API_URL } from '@constants/data';
import {
  demosDrawerOpenState,
  demosDrawerProspectIdState
} from '@atoms/dashboardAtoms';
import Assistant from '@assets/images/assistant.svg';
import ProspectDemoDateSelector from '@common/prospectDetails/ProspectDemoDateSelector';
import { useForm } from '@mantine/form';
import { DemoRating } from '@common/home/dashboard/demo/DemoRating';
import { showNotification } from '@mantine/notifications';
import { getProspects } from '@utils/requests/getProspects';
import DemoFeedbackCard from '@common/demo_feedback/DemoFeedbackCard';
import { DatePicker, DatePickerInput } from '@mantine/dates';
import postSubmitDemoFeedback from '@utils/requests/postSubmitDemoFeedback';

export default function DemoFeedbackDrawer(props: { refetch: () => void, onSubmit?: () => void }) {
  const theme = useMantineTheme();
  const queryClient = new QueryClient();

  const [drawerProspectId, setDrawerProspectId] = useRecoilState(demosDrawerProspectIdState);

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(demosDrawerOpenState);
  const [actuallyOpened, setActuallyOpened] = useState(false);
  useEffect(() => {
    if (drawerOpened !== actuallyOpened) {
      setTimeout(() => {
        setActuallyOpened(drawerOpened);
      }, 100);
    }
  }, [drawerOpened]);

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-dash-get-prospects`],
    queryFn: async () => {
      const response = await getProspects(
        userToken,
        undefined,
        "SELLSCALE",
        10000, // TODO: Maybe use pagination method instead
        ["DEMO"],
        'ALL',
      );
      return response.status === 'success' ? response.data as Prospect[] : [];
    },
    refetchOnWindowFocus: false,
  });
  const prospects = data ?? [];

  const activeProspect = prospects.find((p) => p.id === drawerProspectId);
  const [reschedule, setReschedule] = useState(false);
  const [showedUp, setShowedUp] = useState(false);
  const [followup, setFollowup] = useState(false);

  const form = useForm({
    initialValues: {
      demoHappen: 'yes',
      demoRating: 3,
      feedback: '',
      followupDate: undefined,
    },
  });

  useEffect(() => {
    if (form.values.demoHappen === 'reschedule') {
      setReschedule(true);
    } else if (form.values.demoHappen === 'yes') {
      setReschedule(false);
      setShowedUp(true);
    } else {
      setReschedule(false);
      setShowedUp(false);
    }
  }, [form.values.demoHappen]);

  if (!activeProspect) return <></>;

  const submitDemoFeedback = async (values: typeof form.values) => {
    
    const res = await postSubmitDemoFeedback(
      userToken,
      activeProspect.id,
      values.demoHappen === 'yes' ? 'OCCURRED' : 'NO-SHOW',
      `${values.demoRating}/5`,
      values.feedback,
      values.followupDate
    )

    if (res.status === 'success') {
      if (values.demoHappen === 'yes') {
        await updateChannelStatus(
          activeProspect.id,
          userToken,
          'LINKEDIN',
          'DEMO_WON'
        );
      } else if (values.demoHappen === 'reschedule') {

      } else {
        await updateChannelStatus(
          activeProspect.id,
          userToken,
          'LINKEDIN',
          'DEMO_LOSS'
        );
      }
      showNotification({
        id: 'demo-feedback-submit',
        title: 'Feedback Submitted',
        message: 'Your feedback has been submitted. Thank you!',
        color: 'green',
        autoClose: 3000,
      });
    } else {
      showNotification({
        id: 'demo-feedback-submit-fail',
        title: 'Feedback Failed to Submit',
        message: `Failed to submit your feedback (${res.status}). Please try again.`,
        color: 'red',
        autoClose: false,
      });
    }

    if (props.onSubmit) props.onSubmit();
    props.refetch();

    setDrawerOpened(false);
    setDrawerProspectId(-1);
  };

  return (
    <Drawer
      opened={actuallyOpened}
      onClose={() => {
        setDrawerProspectId(-1);
        setDrawerOpened(false);
      }}
      title={<Title order={3}>Demo Feedback</Title>}
      padding='xl'
      size='lg'
      position='right'
      sx={{ position: 'relative' }}
    >
      <Avatar src={Assistant} alt='AI Assistant' size={30} />
      <Text fz='sm'>You scheduled a demo - how did it go? Your feedback will be used to improve our AI.</Text>

      {/* <div style={{ marginTop: 20 }}>
        <DemoFeedbackCard prospect={activeProspect} />
      </div> */}

      <form onSubmit={form.onSubmit((values) => submitDemoFeedback(values))}>
        <Stack style={{ marginTop: 20 }}>
          <Radio.Group name='demoHappen' label='Did the demo happen?' {...form.getInputProps('demoHappen')}>
            <Radio color='green' value='yes' label='Yes' />
            <Radio color='green' value='no-show' label='No show' />
            <Radio color='green' value='reschedule' label='Rescheduled' />
          </Radio.Group>

          {reschedule ? (
            <ProspectDemoDateSelector prospectId={activeProspect.id} />
          ) : (
            <>
              <Stack spacing={5}>
                <Text
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  How did it go?
                </Text>
                <DemoRating {...form.getInputProps('demoRating')} />
              </Stack>
              <Textarea
                autosize
                minRows={2}
                maxRows={6}
                required
                label='What did you like / what would you change?'
                {...form.getInputProps('feedback')}
              />
              {
                showedUp && (
                  <Stack spacing={5}>
                    <Text fw='bold' fz='md'>Follow up</Text>
                    <Checkbox
                      label='I have a followup meeting scheduled with this Prospect.'
                      checked={followup}
                      onChange={(e) => setFollowup(e.target.checked)}
                    />
                    <Flex align='center' justify='center' mt='md'>
                      {
                        followup && (
                          <DatePicker
                            size='xs'
                            {...form.getInputProps('followupDate')}
                          />
                        )
                      }
                    </Flex>
                  </Stack>
                )
              }
            </>
          )}
        </Stack>

        <Flex
          justify='center'
          mt='xl'
        // style={{
        //   position: 'absolute',
        //   bottom: 0,
        //   left: '50%',
        //   transform: 'translate(-50%, -50%)',
        // }}
        >
          <Group>
            <Button hidden={reschedule} type='submit' color='green' radius='xl'>
              Submit feedback
            </Button>
          </Group>
        </Flex>
      </form>
    </Drawer>
  );
}
