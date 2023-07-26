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
} from '@mantine/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectDrawerNotesState,
  prospectChannelState,
  prospectDrawerStatusesState,
} from '@atoms/prospectAtoms';
import { QueryClient, useQuery } from '@tanstack/react-query';
import ProspectDetailsSummary from '../common/prospectDetails/ProspectDetailsSummary';
import ProspectDetailsChangeStatus, {
  channelToIcon,
  updateChannelStatus,
} from '../common/prospectDetails/ProspectDetailsChangeStatus';
import ProspectDetailsCompany from '../common/prospectDetails/ProspectDetailsCompany';
import ProspectDetailsNotes from '../common/prospectDetails/ProspectDetailsNotes';
import { userTokenState } from '@atoms/userAtoms';
import { convertDateToLocalTime, formatToLabel, proxyURL, valueToColor } from '@utils/general';
import { logout } from '@auth/core';
import getChannels, { getChannelOptions } from '@utils/requests/getChannels';
import { useEffect, useRef, useState } from 'react';
import { Channel, Prospect } from 'src';
import FlexSeparate from '@common/library/FlexSeparate';
import { API_URL } from '@constants/data';
import ProspectDetailsRemove from '@common/prospectDetails/ProspectDetailsRemove';
import ProspectDetailsResearch from '@common/prospectDetails/ProspectDetailsResearch';
import { IconDots } from '@tabler/icons';
import ProspectDetailsOptionsMenu from '@common/prospectDetails/ProspectDetailsOptionsMenu';
import {
  demosDrawerOpenState,
  demosDrawerProspectIdState,
  questionsDrawerOpenState,
  schedulingDrawerOpenState,
} from '@atoms/dashboardAtoms';
import SchedulingCardContents from '@common/home/dashboard/SchedulingCardContents';
import Assistant from '@assets/images/assistant.svg';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import ProspectDemoDateSelector from '@common/prospectDetails/ProspectDemoDateSelector';
import { useForm } from '@mantine/form';
import { DemoRating } from '@common/home/dashboard/demo/DemoRating';
import { showNotification } from '@mantine/notifications';
import ICPFitPill from '@common/pipeline/ICPFitAndReason';
import { getProspects } from '@utils/requests/getProspects';
import DemoFeedbackCard from '@common/demo_feedback/DemoFeedbackCard';

export default function DemoFeedbackDrawer(props: { refetch: () => void, onSubmit?: () => void }) {
  const theme = useMantineTheme();
  const queryClient = new QueryClient();

  const [drawerProspectId, setDrawerProspectId] = useRecoilState(demosDrawerProspectIdState);

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(demosDrawerOpenState);
  const [actuallyOpened, setActuallyOpened] = useState(false);
  useEffect(() => {
    if (drawerOpened !== actuallyOpened){
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

  const form = useForm({
    initialValues: {
      demoHappen: 'yes',
      demoRating: 3,
      feedback: '',
    },
  });

  useEffect(() => {
    if (form.values.demoHappen === 'reschedule') {
      setReschedule(true);
    } else {
      setReschedule(false);
    }
  }, [form.values.demoHappen]);

  if (!activeProspect) return <></>;

  const submitDemoFeedback = async (values: typeof form.values) => {
    const res = await fetch(`${API_URL}/client/demo_feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        prospect_id: activeProspect.id,
        status: values.demoHappen === 'yes' ? 'OCCURRED' : 'NO-SHOW',
        rating: `${values.demoRating}/5`,
        feedback: values.feedback,
      }),
    });

    if (res.status === 200) {
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

      <div style={{ marginTop: 20 }}>
        <DemoFeedbackCard prospect={activeProspect} />
      </div>

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
            </>
          )}
        </Stack>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Group>
            <Button hidden={reschedule} type='submit' color='green' radius='xl'>
              Submit feedback
            </Button>
          </Group>
        </div>
      </form>
    </Drawer>
  );
}
