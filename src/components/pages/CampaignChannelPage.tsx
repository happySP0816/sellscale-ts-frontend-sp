import React, { useEffect, useState } from 'react';
import BumpFrameworksPage from './BumpFrameworksPage';
import {
  Box,
  Flex,
  Tabs,
  rem,
  Text,
  Switch,
  Divider,
  LoadingOverlay,
  Tooltip,
  Title,
  ScrollArea,
} from '@mantine/core';
import ChannelsSetupSelector from './channels';
import EmailSequencingPage from './EmailSequencingPage';
import { currentProjectState } from '@atoms/personaAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useLoaderData } from 'react-router-dom';
import { userTokenState } from '@atoms/userAtoms';
import { IconBooks, IconBrandLinkedin, IconMailOpened, IconUser } from '@tabler/icons';
import postTogglePersonaActive from '@utils/requests/postTogglePersonaActive';
import { showNotification } from '@mantine/notifications';
import { openConfirmModal } from '@mantine/modals';
import AssetLibraryRetool from './AssetLibraryRetool';
import { filterProspectsState } from '@atoms/icpFilterAtoms';
import { getSDRAssets } from '@utils/requests/getAssets';
import { useQuery } from '@tanstack/react-query';
import { getPersonasOverview } from '@utils/requests/getPersonas';
import { PersonaOverview } from 'src';
import ICPFiltersDashboard from '@common/persona/ICPFilter/ICPFiltersDashboard';

export default function CampaignChannelPage(props: {
  cType?: string;
  campaignId?: number;
  hideAssets?: boolean;
  hideLinkedIn?: boolean;
  hideEmail?: boolean;
  hideIcpFilters?: boolean;
  hideHeader?: boolean;
}) {
  const loaderData = useLoaderData() as
    | {
        channelType: string;
        tabId: string;
      }
    | undefined;

  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(
    loaderData?.channelType || props.cType || ''
  );
  const userToken = useRecoilValue(userTokenState);
  const [_currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  // Used for contact count in tab
  const icpProspects = useRecoilValue(filterProspectsState);
  // Used for asset count in tab
  const [assets, setAssets] = useState<any[]>([]);

  const { data: campaign, refetch } = useQuery({
    queryKey: [
      `query-get-campaign`,
      { campaignId: loaderData?.tabId || props.campaignId || _currentProject?.id },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { campaignId }] = queryKey;

      const response = await getPersonasOverview(userToken);
      const result = response.status === 'success' ? (response.data as PersonaOverview[]) : [];
      const currentCampaign = result.find((c) => c.id === Number(campaignId));

      if (currentCampaign) {
        setCurrentProject(currentCampaign);
        triggerGetAssets(currentCampaign);
      }
      return currentCampaign;
    },
  });
  const isEnabledLinkedin = !!campaign?.linkedin_active;
  const isEnabledEmail = !!campaign?.email_active;

  //

  const onToggleEmail = async () => {
    openConfirmModal({
      title: (
        <Title order={3}>
          {isEnabledEmail ? 'Disable Email Outbound' : 'Enable Email Outbound'}
        </Title>
      ),
      children: (
        <>
          {isEnabledEmail ? (
            <>
              <Text fw='bold' fz='lg'>
                Once deactivated:
              </Text>
              <Text mt='xs' fz='md'>
                🔴 No new emails will be fetched for your contacts.
              </Text>
              <Text mt='2px' fz='md'>
                🔴 No new messages will be sent.
              </Text>
            </>
          ) : (
            <>
              <Text fw='bold' fz='lg'>
                Once activated:
              </Text>
              <Text mt='xs' fz='md'>
                ✅ SellScale finds and verifies emails for your contacts.
              </Text>
              <Text mt='2px' fz='md'>
                ✅ Emails will generate and send daily.
              </Text>
              <Text mt='2px' fz='md'>
                🔴 You be unable to add or remove steps to the sequencing for this campaign.
              </Text>
            </>
          )}
        </>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      confirmProps: { color: isEnabledEmail ? 'red' : 'green' },
      onCancel: () => {},
      onConfirm: () => {
        toggleEmail();
      },
    });
  };

  const toggleEmail = async () => {
    setLoading(true);
    const result = await postTogglePersonaActive(
      userToken,
      Number(campaign?.id),
      'email',
      !isEnabledEmail
    );

    setLoading(false);

    if (result.status == 'success') {
      refetch();
      if (!isEnabledEmail) {
        showNotification({
          title: '✅ Enabled',
          message: 'Email outbound has been toggled on, new messages will be sent.',
        });

        showNotification({
          title: '📧 Fetching emails...',
          message: 'We are fetching emails for your contacts. This may take a few minutes.',
          color: 'blue',
          autoClose: 15000,
        });
      } else {
        showNotification({
          title: '🔴 Disabled',
          message: 'Email outbound has been toggled, no new messages will be sent.',
        });
      }
    }
  };

  const onToggleLinkedin = async () => {
    openConfirmModal({
      title: 'Are you sure?',
      children:
        'Are you sure you want to ' +
        (isEnabledLinkedin ? '🔴 disable' : '✅ enable') +
        ' LinkedIn outbound for this campaign?',
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => {
        toggleLinkedin();
      },
    });
  };

  const toggleLinkedin = async () => {
    setLoading(true);
    const result = await postTogglePersonaActive(
      userToken,
      Number(campaign?.id),
      'linkedin',
      !isEnabledLinkedin
    );

    setLoading(false);

    if (result.status == 'success') {
      refetch();
      if (!isEnabledLinkedin) {
        showNotification({
          title: 'Success',
          message: 'LinkedIn outbound has been toggled on, new messages will be sent.',
        });
      } else {
        showNotification({
          title: 'Success',
          message: 'LinkedIn outbound has been toggled, no new messages will be sent.',
        });
      }
    }
  };

  const triggerGetAssets = async (campaign: PersonaOverview) => {
    const result = await getSDRAssets(userToken, campaign.id);
    if (result.status === 'success') {
      setAssets(result.data);
    }
  };

  const HEADER_HEIGHT = props.hideHeader ? 0 : 75;
  const PANEL_HEIGHT = `calc(100vh - ${HEADER_HEIGHT + 80}px)`;
  return (
    <Box h='100vh'>
      {!props.hideHeader && (
        <Box h={HEADER_HEIGHT}>
          <ChannelsSetupSelector
            setSelectedChannel={setSelectedChannel}
            selectedChannel={selectedChannel}
            hideChannels={true}
            campaign={campaign}
          />
        </Box>
      )}

      <Box>
        <LoadingOverlay visible={loading} />
        {
          <Tabs
            value={selectedChannel}
            onTabChange={(v) => setSelectedChannel(`${v}`)}
            styles={(theme) => ({
              tabsList: {
                height: '44px',
              },
              panel: {
                backgroundColor: theme.white,
              },
              tab: {
                ...theme.fn.focusStyles(),
                backgroundColor: theme.white,
                marginBottom: 0,
                paddingLeft: 20,
                paddingRight: 20,
                color: theme.colors.blue[theme.fn.primaryShade()],
                '&:hover': {
                  // color: theme.white,
                },
                '&[data-active]': {
                  backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  borderBottomColor: theme.white,
                  color: theme.white,
                },
                '&:disabled': {
                  backgroundColor: theme.colors.gray[theme.fn.primaryShade()],
                  color: theme.colors.gray[4],
                },
              },
              tabLabel: {
                fontWeight: 700,
                fontSize: rem(14),
              },
            })}
          >
            <Tabs.List>
              <Tabs.Tab
                value='filter_contact'
                icon={<IconUser size={'0.8rem'} />}
                disabled={props.hideIcpFilters}
                style={{
                  visibility: props.hideIcpFilters ? 'hidden' : undefined,
                }}
              >
                {`Filter ${icpProspects.length} Contacts`}
              </Tabs.Tab>
              <Tabs.Tab
                value='linkedin'
                icon={<IconBrandLinkedin size={'0.8rem'} />}
                ml='xs'
                disabled={props.hideLinkedIn}
                style={{
                  visibility: props.hideLinkedIn ? 'hidden' : undefined,
                }}
              >
                <Flex align={'center'} gap={'md'}>
                  <Text>Linkedin</Text>

                  <Tooltip
                    label={isEnabledLinkedin ? 'Disable Linkedin' : 'Enable Linkedin'}
                    position='bottom'
                    withArrow
                    withinPortal
                  >
                    <Box>
                      <Switch
                        size='xs'
                        sx={{ zIndex: 200, cursor: 'pointer' }}
                        checked={isEnabledLinkedin}
                        onChange={() => {
                          onToggleLinkedin();
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Flex>
              </Tabs.Tab>
              <Tabs.Tab
                value='email'
                icon={<IconMailOpened size={'0.8rem'} />}
                ml='xs'
                disabled={props.hideEmail}
                style={{
                  visibility: props.hideEmail ? 'hidden' : undefined,
                }}
              >
                <Flex align={'center'} gap={'md'}>
                  <Text>Email</Text>

                  <Tooltip
                    label={isEnabledEmail ? 'Disable Email' : 'Enable Email'}
                    position='bottom'
                    withArrow
                    withinPortal
                  >
                    <Box>
                      <Switch
                        size='xs'
                        sx={{ zIndex: 200 }}
                        checked={isEnabledEmail}
                        onChange={() => {
                          onToggleEmail();
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Flex>
              </Tabs.Tab>

              <Tabs.Tab
                value='assets'
                icon={<IconBooks size={'0.8rem'} />}
                ml='auto'
                disabled={props.hideAssets}
                style={{
                  visibility: props.hideAssets ? 'hidden' : undefined,
                }}
              >
                <Flex align={'center'} gap={'md'}>
                  <Text>{`${assets.length} Used Assets`}</Text>
                </Flex>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value='filter_contact'>
              <ScrollArea h={PANEL_HEIGHT}>
                {campaign && <ICPFiltersDashboard hideTitleBar />}
              </ScrollArea>
            </Tabs.Panel>
            <Tabs.Panel value='assets'>
              <ScrollArea h={PANEL_HEIGHT}>
                {selectedChannel === 'assets' && campaign && <AssetLibraryRetool />}
              </ScrollArea>
            </Tabs.Panel>
            <Tabs.Panel value='linkedin'>
              <Box
                sx={(theme) => ({
                  padding: theme.spacing.md,
                  width: '100%',
                })}
              >
                <ScrollArea h={PANEL_HEIGHT}>
                  {selectedChannel === 'linkedin' && campaign && <BumpFrameworksPage hideTitle />}
                </ScrollArea>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value='email'>
              <Box
                sx={(theme) => ({
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.md,
                  width: '100%',
                })}
              >
                <ScrollArea h={PANEL_HEIGHT}>
                  {selectedChannel === 'email' && campaign && <EmailSequencingPage hideTitle />}
                </ScrollArea>
              </Box>
            </Tabs.Panel>
          </Tabs>
        }
      </Box>
    </Box>
  );
}
