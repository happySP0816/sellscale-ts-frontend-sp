import {
  mainTabState,
  nurturingModeState,
  openedBumpFameworksState,
  openedProspectIdState,
  openedProspectListState,
} from '@atoms/inboxAtoms';
import { currentInboxCountState, currentProjectState } from '@atoms/personaAtoms';
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
import {
  getProspectBucketsForInbox,
  getProspects,
  getProspectsForInboxRestructure,
} from '@utils/requests/getProspects';
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
import useRefresh from '@common/library/use-refresh';

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
  status: string;
  img_url?: string;
};

export type ProspectBucketRecord = {
  client_sdr_name: string;
  company: string;
  deactivate_ai_engagement: boolean;
  email_last_message_from_prospect?: string;
  email_last_message_timestamp?: string;
  full_name: string;
  title: string;
  hidden_until?: string;
  li_last_message_from_prospect?: string;
  li_last_message_timestamp?: string;
  overall_status: string;
  prospect_id: number;
  status_email?: string;
  status_linkedin?: string;
};

export type ProspectBuckets = {
  ai_bucket: ProspectBucketRecord[];
  crm_bucket: ProspectBucketRecord[];
  demo_bucket: ProspectBucketRecord[];
  manual_bucket: ProspectBucketRecord[];
  outreach_bucket: ProspectBucketRecord[];
  snoozed_bucket: ProspectBucketRecord[];
};

export default function InboxRestructurePage(props: { all?: boolean }) {
  setPageTitle('Inbox');

  const userToken = useRecoilValue(userTokenState);

  const [openedList, setOpenedList] = useRecoilState(openedProspectListState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);
  const [openBumpFrameworks, setOpenBumpFrameworks] = useRecoilState(openedBumpFameworksState);
  const [displayConvo, refreshConvo] = useRefresh();
  const [mainTab, setMainTab] = useRecoilState(mainTabState);

  useEffect(() => {
    setOpenedList(true);
  }, []);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospects-list`, {}],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, {}] = queryKey;

      // Old method
      // const response = await getProspectsForInboxRestructure(userToken);
      // const prospects =
      //   response.status === 'success' ? (response.data as ProspectRestructured[]) : [];

      const response = await getProspectBucketsForInbox(userToken);
      const buckets = response.status === 'success' ? (response.data as ProspectBuckets) : null;

      // @ts-ignore
      const bucket = buckets[mainTab] as ProspectBucketRecord[];
      if (openedProspectId === -1) {
        if (bucket.length > 0) {
          setOpenedProspectId(bucket[0].prospect_id);
        }
      } else if (openedProspectId < 0) {
        // Set to the next X proepct in the list where X is the negative openedProspectId
        const nextProspect = bucket[Math.abs(openedProspectId) - 1];
        if (nextProspect) {
          setOpenedProspectId(nextProspect.prospect_id);
        }
      }

      return buckets;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    refreshConvo();
  }, [openedProspectId]);

  if (isFetching)
    return (
      <Card w='250px' h='250px' m='10% auto' withBorder>
        <Loader m='88px 88px' />
      </Card>
    );

  return (
    <Box style={{ position: 'relative' }}>
      {!data || openedProspectId === -1 ? (
        <Center h={500}>
          <Container w='100%' mt='300px' sx={{ justifyContent: 'center', textAlign: 'center' }}>
            <Title
              fw='800'
              sx={{
                fontSize: '120px',
                color: '#e3e3e3',
                margin: '0% auto',
                textAlign: 'center',
              }}
            >
              {/* <span style={{ marginRight: '100px' }}>Inbox</span>
                      <span style={{ marginLeft: '80px' }}>Zero</span> */}
            </Title>
            <img
              src={RobotEmailImage}
              width='300px'
              style={{ marginTop: '-180px', marginLeft: '50px' }}
            />
            <Text size={28} fw={600}>
              Automate Your Replies
            </Text>
            <Text mt='md' color='gray'>
              Your inbox is empty. Meanwhile, you can automate <br /> your replies using reply
              frameworks.
            </Text>
            <Flex justify={'center'} mt='xs'>
              <Button
                size='lg'
                radius={'xl'}
                leftIcon={<IconPencilMinus />}
                mt={'md'}
                className='glow'
                onClick={() => {
                  // window.location.href = `/setup/email?${prospects[0]?.archetype_id}`;
                  setOpenBumpFrameworks(true);
                }}
              >
                Edit Reply Frameworks
              </Button>
            </Flex>
            <InboxProspectConvoBumpFramework
              prospect={Object()}
              messages={[]}
              onClose={() => {}}
              onPopulateBumpFrameworks={() => {}}
            />
          </Container>
        </Center>
      ) : (
        <>
          <Grid gutter={0} h={INBOX_PAGE_HEIGHT} sx={{ overflow: 'hidden' }}>
            <Grid.Col span={8}>
              {displayConvo && (
                <InboxProspectConvo
                  showBackToInbox
                  overrideBackToInbox={() => {
                    setOpenedList(!openedList);
                  }}
                />
              )}
            </Grid.Col>
            <Grid.Col span={4}>
              <InboxProspectDetails noProspectResetting />
            </Grid.Col>
          </Grid>
        </>
      )}
      {data && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <InboxProspectListRestruct buckets={data} />
        </Box>
      )}
    </Box>
  );
}
