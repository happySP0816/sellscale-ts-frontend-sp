import { mainTabState, nurturingModeState, openedProspectIdState } from '@atoms/inboxAtoms';
import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';

import { Card, Grid, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { setPageTitle } from '@utils/documentChange';
import { getProspects } from '@utils/requests/getProspects';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ProspectShallow } from 'src';
import { useParams } from 'react-router-dom';
import InboxProspectDetails from '@common/inbox/InboxProspectDetails';
import InboxProspectConvo from '@common/inbox/InboxProspectConvo';
import { API_URL } from '@constants/data';
import getChannels, { getChannelOptions } from '@utils/requests/getChannels';
import { logout } from '@auth/core';
export const INBOX_PAGE_HEIGHT = `100vh`; //`calc(100vh - ${NAV_HEADER_HEIGHT}px)`;

export default function ProspectDetailPage() {
  const prams = useParams() as { prospectId: string };
  const prospectId = Number(prams.prospectId);
  const [queryComplete, setQueryComplete] = useState(false);
  const [, setOpenedProspectId] = useRecoilState(openedProspectIdState);
  const userToken = useRecoilValue(userTokenState);
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);

  const { data } = useQuery({
    queryKey: [`query-prospect-details-${prospectId}`],
    queryFn: async () => {
      if (prospectId === -1) {
        return null;
      }

      const response = await fetch(`${API_URL}/prospect/${prospectId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();

      console.log;
      const res_channels = await getChannels(userToken);
      const res_valid_channels = await getChannelOptions(prospectId, userToken);

      return {
        main: res,
        channels: res_channels.status === 'success' ? res_channels.data : {},
        channelTypes: res_valid_channels,
      };
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    getProspects(
      userToken,
      undefined,
      'SELLSCALE',
      10000, // TODO: Maybe use pagination method instead
      undefined,
      'ALL',
      undefined,
      true,
      prospectId
    )
      .then((res) => {
        const prospects = res.data as ProspectShallow[];
        const prospectTemp: ProspectShallow | undefined = prospects?.find(
          (prospect) => prospect.id === prospectId
        );
        setProspects(prospects);
        setOpenedProspectId(prospectTemp?.id ?? -1);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setQueryComplete(true);
      });
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }
  }, [data]);

  if (!queryComplete)
    return (
      <Card w='250px' h='250px' m='10% auto' withBorder>
        <Loader m='88px 88px' />
      </Card>
    );

  return (
    <Grid gutter={0} h={INBOX_PAGE_HEIGHT} sx={{ overflow: 'hidden' }}>
      <Grid.Col span={8}>
        <InboxProspectConvo showBackToInbox currentEmailStatus={prospects[0].email_status} />
      </Grid.Col>
      <Grid.Col span={4}>
        <InboxProspectDetails noProspectResetting currentEmailStatus={prospects[0].email_status} />
      </Grid.Col>
    </Grid>
  );
}
