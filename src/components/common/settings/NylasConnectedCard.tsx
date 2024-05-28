import { userDataState, userTokenState } from '@atoms/userAtoms';
import FlexSeparate from '@common/library/FlexSeparate';
import {
  ActionIcon,
  Badge,
  Text,
  CloseButton,
  Group,
  Paper,
  Title,
  Stack,
  Button,
  Center,
  createStyles,
  Avatar,
  Container,
  LoadingOverlay,
  Loader,
  useMantineTheme,
  TextInput,
  Box,
  Flex,
  Divider,
  Image,
  Anchor,
  MultiSelect,
} from '@mantine/core';
import { openConfirmModal, openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import GoogleLogo from '@assets/images/google-g.svg';
import {
  IconBrandGoogle,
  IconBrandLinkedin,
  IconBriefcase,
  IconCloudDownload,
  IconCookie,
  IconKey,
  IconMail,
  IconPassword,
  IconPlugConnected,
  IconRefreshDot,
  IconSocial,
  IconX,
} from '@tabler/icons';
import { clearAuthTokens } from '@utils/requests/clearAuthTokens';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LinkedInAuthOption from './LinkedInAuthOption';
import {
  formatToLabel,
  getBrowserExtensionURL,
  nameToInitials,
  valueToColor,
} from '@utils/general';
import { useEffect, useState } from 'react';
import getLiProfile from '@utils/requests/getLiProfile';
import getNylasClientID from '@utils/requests/getNylasClientID';
import { clearNylasTokens } from '@utils/requests/clearNylasTokens';
import getNylasAccountDetails from '@utils/requests/getNylasAccountDetails';
import MultiEmails from './MultiEmails/MultiEmails';
import { modals } from '@mantine/modals';
import ScheduleSetting from './ScheduleSetting/ScheduleSetting';
import { currentProjectState } from '@atoms/personaAtoms';
import { setSmartleadCampaign } from '@utils/requests/setSmartleadCampaign';
import { syncSmartleadContacts } from '@utils/requests/syncSmartleadContacts';
import postCreateSmartleadCampaign from '@utils/requests/postCreateSmartleadCampaign';
import displayNotification from '@utils/notificationFlow';
import { updateClientSDR } from '@utils/requests/updateClientSDR';
import { syncLocalStorage } from '@auth/core';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

const REDIRECT_URI = `${window.location.origin}/settings`;

export default function NylasConnectedCard(props: { connected: boolean; showSmartlead?: boolean }) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const queryClient = useQueryClient();
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  const [campaignUrl, setCampaignUrl] = useState<string>(
    currentProject?.smartlead_campaign_id
      ? `https://app.smartlead.ai/app/email-campaign/${currentProject?.smartlead_campaign_id}/analytics`
      : ''
  );

  const { classes } = useStyles();

  const { data: nylasClientId, isFetching } = useQuery({
    queryKey: [`nylas-profile-self`],
    queryFn: async () => {
      const result = await getNylasClientID(userToken);
      return result.status === 'success' ? result.data : null;
    },
  });

  const { data } = useQuery({
    queryKey: [`nylas-account-details`],
    queryFn: async () => {
      const result = await getNylasAccountDetails(userToken);
      return result.status === 'success' ? result.data : null;
    },
  });

  const disconnectNylas = async () => {
    const result = await clearNylasTokens(userToken);
    if (result.status === 'success') {
      showNotification({
        id: 'nylas-disconnect-success',
        title: 'Success',
        message: 'You have successfully disconnected your email.',
        color: 'blue',
        autoClose: 5000,
      });
    } else {
      showNotification({
        id: 'nylas-disconnect-failure',
        title: 'Failure',
        message: 'There was an error disconnecting your email. Please contact an admin.',
        color: 'red',
        autoClose: false,
      });
    }
    queryClient.invalidateQueries({
      queryKey: ['query-get-accounts-connected'],
    });
  };

  const openConfirmDisconnectModal = () =>
    modals.openConfirmModal({
      title: 'Are you sure you want to disconnect your email?',
      children: (
        <Text size='sm'>You will no longer be able to send emails or view your email history.</Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => disconnectNylas(),
    });

  const triggerPostCreateSmartleadCampaign = async () => {
    if (!currentProject) return;

    await displayNotification(
      'snooze-prospect',
      async () => {
        let result = await postCreateSmartleadCampaign(userToken, currentProject?.id, true);
        if (result.status === 'success') {
          // Refresh the smartlead data
          setCurrentProject({
            ...currentProject,
            smartlead_campaign_id: result.data.campaign_id,
          });
          setCampaignUrl(
            `https://app.smartlead.ai/app/email-campaign/${result.data.campaign_id}/analytics`
          );
        }
        return result;
      },
      {
        title: `Creating Campaign...`,
        message: `Working with servers...`,
        color: 'blue',
      },
      {
        title: `Created!`,
        message: `Please verify in Smartlead.`,
        color: 'green',
      },
      {
        title: `Error while creating Smartlead Campaign`,
        message: `Please contact engineering.`,
        color: 'red',
      }
    );
  };

  const persona_prospect_count = currentProject?.num_prospects;
  const smartlead_lead_count =
    currentProject?.meta_data?.smartlead_campaign_analytics?.campaign_lead_stats?.total;

  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>(userData?.meta_data?.handoff_emails ?? []);

  const updateHandoffEmails = async (emails: string[]) => {
    const response = await updateClientSDR(userToken, undefined, undefined, undefined, undefined, {
      ...(userData?.meta_data ?? {}),
      handoff_emails: emails,
    });
    await syncLocalStorage(userToken, setUserData);
  };

  return (
    <Box bg={'white'} py={'md'}>
      <Box px={'md'}>
        <Group>
          <Text fw={600} size={28}>
            Email Integration
          </Text>
          {props.connected ? (
            <Badge
              size='xl'
              variant='filled'
              color='blue'
              pr={8}
              rightSection={
                <ActionIcon
                  size='xs'
                  color='blue'
                  radius='xl'
                  variant='transparent'
                  onClick={async () => openConfirmDisconnectModal()}
                >
                  <IconX size={15} color='white' />
                </ActionIcon>
              }
              styles={{ root: { textTransform: 'initial' } }}
            >
              Connected
            </Badge>
          ) : (
            <Badge
              size='xl'
              variant='filled'
              color='red'
              styles={{ root: { textTransform: 'initial' } }}
            >
              Not Connected
            </Badge>
          )}
        </Group>

        <Text fz='sm' pt='xs' fw={600} color='gray.6'>
          By connecting your email, SellScale is able to manage, read, and respond to your contact's
          conversations.
        </Text>
      </Box>

      {true && (
        <Paper withBorder m='xs' p='md' radius='md'>
          <Stack>
            <div>
              <Group>
                <Title order={3}>Lead Handoff Email</Title>

                <Text>
                  When SellScale nurtures a contact to a point where they are ready to be 'handed
                  off' to you, which email(s) do you want to be CC-ed in?
                </Text>

                <MultiSelect
                  withinPortal
                  data={emails}
                  creatable
                  searchable
                  getCreateLabel={(query) => `${query}`}
                  onCreate={(query) => {
                    setEmails([...emails, query]);
                    return query;
                  }}
                  value={emails}
                  onChange={(value) => {
                    setEmails(value);
                  }}
                  placeholder='Add Email'
                />
                <Button
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);
                    await updateHandoffEmails(emails);
                    setLoading(false);
                  }}
                >
                  Save
                </Button>
              </Group>
            </div>
          </Stack>
        </Paper>
      )}

      {props.showSmartlead && (
        <Paper withBorder m='xs' p='md' radius='md'>
          <Stack>
            <div>
              <Group>
                <Title order={3}>Smartlead Campaign Sync</Title>
                {currentProject?.smartlead_campaign_id ? (
                  <Badge
                    size='xl'
                    variant='filled'
                    color='blue'
                    styles={{ root: { textTransform: 'initial' } }}
                  >
                    Synced
                  </Badge>
                ) : (
                  <Button
                    variant='outline'
                    color='green'
                    radius='lg'
                    leftIcon={<IconPlugConnected size={18} />}
                    onClick={() => {
                      openConfirmModal({
                        title: <Title order={3}>Sync into Smartlead</Title>,
                        children: (
                          <>
                            <Text>
                              After syncing, verify the campaign is created in{' '}
                              <a
                                href='https://app.smartlead.ai/app/email-campaign/all'
                                target='_blank'
                              >
                                Smartlead
                              </a>
                              .
                            </Text>
                            <Text fw='bold' mt='xl'>
                              Only sync once the sequence is fully ready.
                            </Text>
                          </>
                        ),
                        labels: {
                          confirm: 'Sync',
                          cancel: 'Go Back',
                        },
                        cancelProps: { color: 'red', variant: 'outline' },
                        confirmProps: { color: 'green' },
                        onConfirm: () => {
                          triggerPostCreateSmartleadCampaign();
                        },
                      });
                    }}
                  >
                    Sync Campaign
                  </Button>
                )}
                <Text>
                  After this campaign is ready to send, press `Sync` to create a campaign in
                  Smartlead with multiple mailboxes and optimal configurations.
                </Text>
              </Group>
            </div>
            <Group noWrap>
              <TextInput
                label='Smartlead Campaign Page URL'
                disabled
                placeholder='https://app.smartlead.ai/app/email-campaign/...'
                value={campaignUrl}
                onChange={(event) => setCampaignUrl(event.currentTarget.value)}
                miw={500}
              />
              {/* <Button
              disabled={!campaignUrl.trim()}
              onClick={async () => {
                if (!currentProject) return;

                const parts = campaignUrl.split("email-campaign/");
                if (parts.length !== 2) return;
                const campaignId = parseInt(parts[1].split("/")[0]);

                await setSmartleadCampaign(
                  userToken,
                  currentProject?.id,
                  campaignId
                );

                setCampaignUrl("");
                window.location.reload();
              }}
            >
              Submit
            </Button> */}
            </Group>
          </Stack>
        </Paper>
      )}

      <ScheduleSetting />
      <MultiEmails />
    </Box>
  );
}
