import {
  Drawer,
  LoadingOverlay,
  ScrollArea,
  Title,
  Badge,
  Flex,
  useMantineTheme,
  Text,
  Divider,
  ActionIcon,
  Paper,
  Group,
  Avatar,
  Button,
  Indicator,
} from '@mantine/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectDrawerNotesState,
  prospectChannelState,
  prospectDrawerStatusesState,
} from '@atoms/prospectAtoms';
import { useQuery } from '@tanstack/react-query';
import ProspectDetailsSummary from '../common/prospectDetails/ProspectDetailsSummary';
import ProspectDetailsChangeStatus, { channelToIcon } from '../common/prospectDetails/ProspectDetailsChangeStatus';
import ProspectDetailsCompany from '../common/prospectDetails/ProspectDetailsCompany';
import ProspectDetailsNotes from '../common/prospectDetails/ProspectDetailsNotes';
import ProspectDetailsViewConversation from '../common/prospectDetails/ProspectDetailsViewConversation';
import { userTokenState } from '@atoms/userAtoms';
import { convertDateToLocalTime, formatToLabel, valueToColor } from '@utils/general';
import { logout } from '@auth/core';
import getChannels, { getChannelOptions } from '@utils/requests/getChannels';
import { useEffect, useRef, useState } from 'react';
import { Channel, Prospect } from 'src';
import FlexSeparate from '@common/library/FlexSeparate';
import ProspectDetailsViewEmails from '@common/prospectDetails/ProspectDetailsViewEmails';
import { API_URL } from '@constants/data';
import ProspectDetailsRemove from '@common/prospectDetails/ProspectDetailsRemove';
import ProspectDetailsResearch from '@common/prospectDetails/ProspectDetailsResearch';
import { IconDots } from '@tabler/icons';
import ProspectDetailsOptionsMenu from '@common/prospectDetails/ProspectDetailsOptionsMenu';
import {
  dashCardSeeAllDrawerOpenState,
  demoFeedbackSeeAllDrawerOpenState,
  demosDrawerOpenState,
  demosDrawerProspectIdState,
  schedulingDrawerOpenState,
} from '@atoms/dashboardAtoms';
import SchedulingCardContents from '@common/home/dashboard/SchedulingCardContents';
import DashCardContents from '@common/home/dashboard/DashCardContents';

export default function DemoFeedbackSeeAllDrawer(props: { prospects: Prospect[] }) {
  const theme = useMantineTheme();

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(demoFeedbackSeeAllDrawerOpenState);
  const [actuallyOpened, setActuallyOpened] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setActuallyOpened(drawerOpened);
    }, 100);
  }, []);

  const [demosDrawerOpened, setDemosDrawerOpened] = useRecoilState(demosDrawerOpenState);
  const [drawerProspectId, setDrawerProspectId] = useRecoilState(demosDrawerProspectIdState);
  const userToken = useRecoilValue(userTokenState);

  const prospectsVisible = [];
  const prospectsHidden = [];
  for(let prospect of props.prospects){
    const demo_scheduled = prospect.hidden_reason === 'DEMO_SCHEDULED' && new Date(prospect.hidden_until) > new Date(); 
    if(demo_scheduled){
      prospectsHidden.push(prospect);
    } else {
      prospectsVisible.push(prospect);
    }
  }

  const getDemoFeedbackCard = (prospect: Prospect) => {
    return (
      <Paper withBorder p='xs' radius='md' mt={14}>
        <Flex justify='space-between'>
          <div>
            <Indicator inline size={12} offset={5} position='top-end' color='violet' withBorder>
              <Avatar size='md' radius='xl' src={prospect.img_url} />
            </Indicator>
          </div>
          <div style={{ flexGrow: 1, marginLeft: 10 }}>
            <Text fw={700} fz='sm'>
              Demo with {prospect.full_name}
            </Text>
            <Text fz='sm' c='dimmed'>
              {convertDateToLocalTime(new Date(prospect.demo_date))}
            </Text>
          </div>
          <div>
            <Button
              color='green'
              radius='xl'
              size='xs'
              ml={8}
              onClick={() => {
                setDrawerProspectId(prospect.id);
                setDemosDrawerOpened(true);
              }}
            >
              Give Feedback
            </Button>
          </div>
        </Flex>
      </Paper>
    );
  };

  return (
    <Drawer
      opened={actuallyOpened}
      onClose={() => setDrawerOpened(false)}
      title={
        <Group spacing={10}>
          <Title order={3}>Demo Feedback</Title>
          {props.prospects.length > 1 && (
            <Avatar
              color='violet'
              radius='xl'
              size={24}
              styles={{
                placeholder: {
                  fontSize: 12,
                },
              }}
            >
              {`${props.prospects.length}`}
            </Avatar>
          )}
        </Group>
      }
      padding='xl'
      size="lg"
      position='right'
    >
      {props.prospects.length > 0 ? (
        <ScrollArea style={{ height: window.innerHeight - 100, overflowY: 'hidden' }}>
          {prospectsVisible.map((prospect, i) => (
            <div key={i}>{getDemoFeedbackCard(prospect)}</div>
          ))}
          {prospectsHidden.length > 0 && (
            <Divider my="xs" label="Upcoming Scheduled Demos" labelPosition="center" />
          )}
          {prospectsHidden.map((prospect, i) => (
            <div key={i} style={{ filter: 'opacity(50%)' }}>{getDemoFeedbackCard(prospect)}</div>
          ))}
        </ScrollArea>
      ) : (
        <LoadingOverlay visible={true} />
      )}
    </Drawer>
  );
}
