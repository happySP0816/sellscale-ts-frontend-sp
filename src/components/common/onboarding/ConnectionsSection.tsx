import { userDataState, userTokenState } from '@atoms/userAtoms';
import {
  Center,
  Stack,
  Loader,
  Group,
  Avatar,
  Title,
  Text,
  createStyles,
  useMantineTheme,
  Button,
  Divider,
} from '@mantine/core';
import { IconBriefcase, IconCloudDownload, IconMail, IconPlugConnected, IconSocial } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { valueToColor, nameToInitials, formatToLabel, getBrowserExtensionURL, proxyURL } from '@utils/general';
import getLiProfile from '@utils/requests/getLiProfile';
import getNylasAccountDetails from '@utils/requests/getNylasAccountDetails';
import getNylasClientID from '@utils/requests/getNylasClientID';
import { useRecoilValue } from 'recoil';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

const REDIRECT_URI = `${window.location.origin}/settings/email`;

export default function ConnectionsSection() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const usingFirefox = navigator.userAgent.search("Firefox") >= 0;

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const { data: li_data } = useQuery({
    queryKey: [`li-profile-self`],
    queryFn: async () => {
      const result = await getLiProfile(userToken);
      return result.status === 'success' ? result.data : null;
    },
    enabled: userData.li_voyager_connected,
    cacheTime: 0,
  });

  const { data: nylas_data } = useQuery({
    queryKey: [`nylas-account-details`],
    queryFn: async () => {
      const result = await getNylasAccountDetails(userToken);
      return result.status === 'success' ? result.data : null;
    },
    enabled: userData.nylas_connected,
    cacheTime: 0,
  });

  const { data: nylasClientId, isFetching } = useQuery({
    queryKey: [`nylas-profile-self`],
    queryFn: async () => {
      const result = await getNylasClientID(userToken);
      return result.status === 'success' ? result.data : null;
    },
  });

  return (
    <div>
      {userData.li_voyager_connected ? (
        <Center>
          <Stack spacing={0} style={{ width: 300 }}>
            <Title order={5}>Connected LinkedIn:</Title>
            {!li_data && (
              <Center w='100%' h={100}>
                <Stack align='center'>
                  <Loader variant='dots' size='xl' />
                  <Text c='dimmed' fz='sm' fs='italic'>
                    Fetching LinkedIn details...
                  </Text>
                </Stack>
              </Center>
            )}
            {li_data && (
              <Group noWrap spacing={10} align='flex-start' pt='xs'>
                <Avatar
                  src={
                    proxyURL(li_data.miniProfile.picture['com.linkedin.common.VectorImage'].rootUrl +
                    li_data.miniProfile.picture['com.linkedin.common.VectorImage'].artifacts[2]
                      .fileIdentifyingUrlPathSegment)
                  }
                  size={94}
                  radius='md'
                />
                <div>
                  <Title order={3}>
                    {li_data.miniProfile.firstName} {li_data.miniProfile.lastName}
                  </Title>

                  <Group noWrap spacing={10} mt={3}>
                    <IconBriefcase stroke={1.5} size={16} className={classes.icon} />
                    <Text size='xs' color='dimmed'>
                      {li_data.miniProfile.occupation}
                    </Text>
                  </Group>

                  <Group noWrap spacing={10} mt={5}>
                    <IconSocial stroke={1.5} size={16} className={classes.icon} />
                    <Text
                      size='xs'
                      color='dimmed'
                      component='a'
                      target='_blank'
                      rel='noopener noreferrer'
                      href={`https://www.linkedin.com/in/${li_data.miniProfile.publicIdentifier}`}
                    >
                      linkedin.com/in/{li_data.miniProfile.publicIdentifier}
                    </Text>
                  </Group>
                </div>
              </Group>
            )}
          </Stack>
        </Center>
      ) : (
        <Center mt={30}>
          <Stack spacing={0} style={{ width: 500 }}>
            <Text>
              Connect to LinkedIn to allow SellScale to automatically send connections, read, and respond to your contacts.
            </Text>
            <Button
              w={300}
              mx='auto'
              component='a'
              target='_blank'
              rel='noopener noreferrer'
              href={getBrowserExtensionURL(usingFirefox)}
              mt={20}
              variant='outline'
              size='md'
              color='green'
              rightIcon={<IconCloudDownload size='1rem' />}
            >
              Install {usingFirefox ? 'Firefox' : 'Chrome'} Extension
            </Button>
          </Stack>
        </Center>
      )}

      <Divider my={20} w={500} mx='auto' />

      {userData.nylas_connected ? (
        <Center>
          <Stack spacing={0} style={{ width: 300 }}>
            <Title order={5}>Connected Email:</Title>
            {!nylas_data && (
              <Center w='100%' h={100}>
                <Stack align='center'>
                  <Loader variant='dots' size='xl' />
                  <Text c='dimmed' fz='sm' fs='italic'>
                    Fetching Email details...
                  </Text>
                </Stack>
              </Center>
            )}
            {nylas_data && (
              <Group noWrap spacing={10} align='flex-start' pt='xs'>
                <Avatar
                  src=''
                  color={valueToColor(theme, `${nylas_data.name}, ${nylas_data.email_address}`)}
                  size={94}
                  radius='md'
                >
                  {nameToInitials(nylas_data.name)}
                </Avatar>
                <div>
                  <Title order={3}>{nylas_data.name}</Title>

                  <Group noWrap spacing={10} mt={3}>
                    <IconSocial stroke={1.5} size={16} className={classes.icon} />
                    <Text size='xs' color='dimmed'>
                      {formatToLabel(nylas_data.provider)}
                    </Text>
                  </Group>

                  <Group noWrap spacing={10} mt={5}>
                    <IconMail stroke={1.5} size={16} className={classes.icon} />
                    <Text size='xs' color='dimmed' component='a' href={`mailto:${nylas_data.email_address}`}>
                      {nylas_data.email_address}
                    </Text>
                  </Group>
                </div>
              </Group>
            )}
          </Stack>
        </Center>
      ) : (
        <Center mt={30}>
          <Stack spacing={0} style={{ width: 500 }}>
            <Text>
              Connect your email to allow SellScale to automatically send emails, manage, read, and respond to your convos.
            </Text>
            <Button
              w={300}
              mx='auto'
              component='a'
              target='_blank'
              rel='noopener noreferrer'
              href={
                nylasClientId
                  ? `https://api.nylas.com/oauth/authorize?client_id=${nylasClientId}&redirect_uri=${REDIRECT_URI}&response_type=code&scopes=email.read_only,email.send`
                  : ''
              }
              my={20}
              variant='outline'
              size='md'
              color='pink'
              rightIcon={<IconPlugConnected size='1rem' />}
              loading={isFetching}
            >
              Connect Email
            </Button>
          </Stack>
        </Center>
      )}
    </div>
  );
}
