import { nurturingModeState, openedProspectIdState } from "@atoms/inboxAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { prospectShowPurgatoryState } from "@atoms/prospectAtoms";
import { userTokenState, userDataState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import InboxProspectConvo from "@common/inbox/InboxProspectConvo";
import InboxProspectDetails from "@common/inbox/InboxProspectDetails";
import InboxProspectList from "@common/inbox/InboxProspectList";
import { populateInboxNotifs } from "@common/inbox/utils";
import { API_URL } from "@constants/data";
import { Button, Card, Container, Flex, Grid, Loader, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { setPageTitle } from "@utils/documentChange";
import { getProspects } from "@utils/requests/getProspects";
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from "recoil";
import { Prospect, ProspectShallow } from "src";
import RobotEmailImage from "./robot_emails.png";
import { Icon360, IconBrandSuperhuman, IconList, IconWorld } from '@tabler/icons';
import DemoFeedbackDrawer from "@drawers/DemoFeedbackDrawer";

export const INBOX_PAGE_HEIGHT = `100vh`; //`calc(100vh - ${NAV_HEADER_HEIGHT}px)`;

export default function InboxPage(props: { all?: boolean }) {
  setPageTitle("Inbox");

  const userToken = useRecoilValue(userTokenState);
  const nurturingMode = useRecoilValue(nurturingModeState);
  const currentProject = useRecoilValue(currentProjectState);
  const [queryComplete, setQueryComplete] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-dash-get-prospects`,
      { nurturingMode },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { nurturingMode }] = queryKey;

      const response = await getProspects(
        userToken,
        undefined,
        "SELLSCALE",
        10000, // TODO: Maybe use pagination method instead
        nurturingMode ? ['ACCEPTED', 'BUMPED'] : ['ACTIVE_CONVO', 'DEMO'],
        'ALL',
        props.all ? undefined : currentProject?.id,
        true,
      );
      setQueryComplete(true);
      return response.status === 'success' ? response.data as ProspectShallow[] : [];
    },
    refetchOnWindowFocus: false,
  });
  const prospects = data ?? [];

  if (!queryComplete) return (
    <Card w='250px' h='250px' m='10% auto' withBorder>
      <Loader m='88px 88px' />
    </Card>
  );

  return (
    <Grid columns={100} gutter={0} h={INBOX_PAGE_HEIGHT} sx={{ overflow: 'hidden' }}>
      <Grid.Col span={27} >
        <InboxProspectList prospects={prospects} isFetching={isFetching} all={props.all} />
      </Grid.Col>
      {!(queryComplete && prospects.length === 0) ?
        <>
          <Grid.Col span={46}>
            <InboxProspectConvo prospects={prospects} />
          </Grid.Col>
          <Grid.Col span={27}>
            <InboxProspectDetails prospects={prospects} />
          </Grid.Col>
        </>
        :
        <Grid.Col span={73}>
          <Container w='100%' mt='200px' sx={{ justifyContent: 'center', textAlign: 'center' }}>
            <Title fw='800' sx={{ fontSize: '120px', color: '#e3e3e3', margin: '0% auto', textAlign: 'center' }}><span style={{ marginRight: '100px' }}>Inbox</span><span style={{ marginLeft: '80px' }}>Zero</span></Title>
            <img src={RobotEmailImage} width='300px' style={{ marginTop: '-180px', marginLeft: '50px' }} />
            <Text>
              <span style={{ fontSize: '24px' }}>You have no prospects in your inbox.</span>
            </Text>
            <Text mt='md'>
              Try one of these other tabs instead:
            </Text>
            <Flex justify={'center'} mt='xs'>
              <Button variant='outline' onClick={() => {
                window.location.href = '/all/inboxes';
              }} leftIcon={<IconWorld/>} color='blue'>
                Global Inbox
              </Button>
              <Button variant='outline' onClick={() => {
                window.location.href = '/all/contacts';
              }} leftIcon={<IconWorld />} color='grape'>
                Contacts
              </Button>
              <Button variant='outline' onClick={() => {
                window.location.href = '/all/recent-activity'
              }} leftIcon={<IconList />} ml='xs' color='orange'>
                Recent Activity
              </Button>
            </Flex>
          </Container>
        </Grid.Col>
      }
    </Grid>
  );

}
