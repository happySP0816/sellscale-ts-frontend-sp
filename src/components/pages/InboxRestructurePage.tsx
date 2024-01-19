import {
  mainTabState,
  nurturingModeState,
  openedBumpFameworksState,
  openedProspectIdState,
  openedProspectListState,
} from '@atoms/inboxAtoms';
import { currentProjectState } from '@atoms/personaAtoms';
import { prospectShowPurgatoryState } from '@atoms/prospectAtoms';
import { userTokenState, userDataState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import InboxProspectConvo from '@common/inbox/InboxProspectConvo';
import InboxProspectDetails from '@common/inbox/InboxProspectDetails';
import InboxProspectList from '@common/inbox/InboxProspectList';
import { populateInboxNotifs } from '@common/inbox/utils';
import { API_URL } from '@constants/data';
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { setPageTitle } from '@utils/documentChange';
import { getProspects, getProspectsForInboxRestructure } from '@utils/requests/getProspects';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Prospect, ProspectShallow } from 'src';
import RobotEmailImage from './robot_emails.png';
import { Icon360, IconBrandSuperhuman, IconList, IconPencilMinus, IconWorld } from '@tabler/icons';
import DemoFeedbackDrawer from '@drawers/DemoFeedbackDrawer';
import LinkedinQueuedMessages from '@common/messages/LinkedinQueuedMessages';
import InboxSmartleadPage from './InboxPageSmartleadPage';
import InboxProspectConvoBumpFramework from '@common/inbox/InboxProspectConvoBumpFramework';
import { InboxProspectListRestruct } from '@common/inbox/InboxProspectListRestruct';

export const INBOX_PAGE_HEIGHT = `calc(100vh)`;

export type ProspectRestructured = {
  company: string;
  full_name: string;
  id: number;
  last_message: string;
  last_message_timestamp: string;
  primary_channel: 'LINKEDIN' | 'EMAIL';
  section: 'Inbox' | 'Snoozed' | 'Demos';
  title: string;
  hidden_until?: string;
  icp_fit_score: number;
  overall_status: string;
  img_url?: string;
};

export default function InboxRestructurePage(props: { all?: boolean }) {
  setPageTitle('Inbox');

  const userToken = useRecoilValue(userTokenState);

  const [openedList, setOpenedList] = useRecoilState(openedProspectListState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);

  useEffect(() => {
    setOpenedList(true);
  }, []);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospects-list`, {}],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, {}] = queryKey;

      const response = await getProspectsForInboxRestructure(userToken);
      const prospects =
        response.status === 'success' ? (response.data as ProspectRestructured[]) : [];

      if (openedProspectId === -1) {
        if (prospects.length > 0) {
          setOpenedProspectId(prospects[0].id);
        }
      } else if (openedProspectId < 0) {
        // Set to the next X proepct in the list where X is the negative openedProspectId
        const nextProspect = prospects[Math.abs(openedProspectId) - 1];
        if (nextProspect) {
          setOpenedProspectId(nextProspect.id);
        }
      }

      return prospects;
    },
    refetchOnWindowFocus: false,
  });
  const prospects = data ?? [];

  console.log(prospects);

  if (isFetching)
    return (
      <Card w='250px' h='250px' m='10% auto' withBorder>
        <Loader m='88px 88px' />
      </Card>
    );

  return (
    <Box style={{ position: 'relative' }}>
      {prospects.length === 0 ? (
        <Center h={500}>
          <Text>No prospects found. Please add some to view inbox.</Text>
        </Center>
      ) : (
        <>
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <InboxProspectListRestruct prospects={prospects} />
          </Box>
          <Grid gutter={0} h={INBOX_PAGE_HEIGHT} sx={{ overflow: 'hidden' }}>
            <Grid.Col span={8}>
              <InboxProspectConvo
                showBackToInbox
                overrideBackToInbox={() => {
                  setOpenedList(!openedList);
                }}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <InboxProspectDetails noProspectResetting />
            </Grid.Col>
          </Grid>
        </>
      )}
    </Box>
  );
}
