import {
  Avatar,
  Center,
  Title,
  Flex,
  Stack,
  Text,
  Indicator,
  useMantineTheme,
  Paper,
  Spoiler,
  ScrollArea,
  Select,
  Group,
  createStyles,
  Divider,
  Textarea,
  Tabs,
  Popover,
  Button,
  Box,
  UnstyledButton,
  rem,
} from '@mantine/core';
import {
  IconBriefcase,
  IconBuildingStore,
  IconBrandLinkedin,
  IconMail,
  IconMap2,
  IconMessageCircle,
  IconPhoto,
  IconSettings,
  IconInfoCircle,
  IconUserSearch,
  IconWriting,
  IconX,
  IconCalendarEvent,
  IconTrash,
  IconExternalLink,
} from '@tabler/icons-react';
import { openedProspectIdState, openedOutboundChannelState } from '@atoms/inboxAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue, useRecoilState } from 'recoil';
import { ReactNode, useEffect, useRef } from 'react';
import { getProspectByID } from '@utils/requests/getProspectByID';
import { prospectStatuses } from './utils';
import { Channel, Prospect } from 'src';
import ProspectDetailsResearch, { ProspectDetailsResearchTabs } from '@common/prospectDetails/ProspectDetailsResearch';
import { updateProspectNote } from '@utils/requests/prospectNotes';
import { updateChannelStatus } from '@common/prospectDetails/ProspectDetailsChangeStatus';
import ProspectDetailsCalendarLink from '@common/prospectDetails/ProspectDetailsCalendarLink';
import ICPFitPill, { ICPFitContents, icpFitToIcon } from '@common/pipeline/ICPFitAndReason';
import { useHover } from '@mantine/hooks';
import postRunICPClassification from '@utils/requests/postRunICPClassification';
import { DateTimePicker } from '@mantine/dates';
import ProspectDemoDateSelector from '@common/prospectDetails/ProspectDemoDateSelector';
import DemoFeedbackDrawer from '@drawers/DemoFeedbackDrawer';
import { demosDrawerOpenState, demosDrawerProspectIdState } from '@atoms/dashboardAtoms';
import _ from 'lodash';
import { NAV_HEADER_HEIGHT } from '@nav/MainHeader';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },

  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: theme.radius.md,
    height: 60,
    width: 88,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.white,
    transition: 'box-shadow 150ms ease, transform 100ms ease',

    '&:hover': {
      boxShadow: `${theme.shadows.md} !important`,
      transform: 'scale(1.05)',
    },
  },
}));

export default function ProjectDetails(props: { prospects: Prospect[] }) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const { classes } = useStyles();
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  const { hovered: icpHovered, ref: icpRef } = useHover();

  const userToken = useRecoilValue(userTokenState);
  const openedProspectId = useRecoilValue(openedProspectIdState);
  const openedOutboundChannel = useRecoilValue(openedOutboundChannelState);

  const [demosDrawerOpened, setDemosDrawerOpened] = useRecoilState(
    demosDrawerOpenState
  );
  const [drawerProspectId, setDrawerProspectId] = useRecoilState(
    demosDrawerProspectIdState
  );

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
    queryFn: async () => {
      const response = await getProspectByID(userToken, openedProspectId);
      return response.status === 'success' ? response.data : [];
    },
    enabled: openedProspectId !== -1,
  });

  console.log(data);
  const statusValue = data?.details?.linkedin_status || 'ACCEPTED';

  const linkedin_public_id = data?.li.li_profile?.split('/in/')[1]?.split('/')[0] ?? '';

  // Set the notes in the input box when the data is loaded in
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.value = data?.details.notes[data?.details.notes.length - 1]?.note ?? '';
    }
  }, [data]);

  // For changing the status of the prospect
  const changeStatus = async (status: string) => {
    await updateChannelStatus(
      openedProspectId,
      userToken,
      openedOutboundChannel.toUpperCase() as Channel,
      status
    );
    queryClient.invalidateQueries({
      queryKey: ['query-dash-get-prospects'],
    });
    refetch();
  };

  return (
    <Flex gap={0} wrap='nowrap' direction='column' h={'calc(100vh - ' + NAV_HEADER_HEIGHT + 'px)'} sx={{ borderLeft: '0.0625rem solid #dee2e6' }}>
      <div style={{ flexBasis: '20%' }}>
        <Stack spacing={0}>
          <Center>
            <Avatar size='xl' radius={100} mt={20} mb={8} src={data?.details.profile_pic} />
          </Center>
          <Title order={4} ta='center'>
            {data?.details.full_name}
          </Title>
          <Text size={10} c='dimmed' fs='italic' ta='center'>
            {data?.details.title}
          </Text>
        </Stack>
      </div>
      <div style={{ flexBasis: '15%' }}>
        <Paper
          withBorder
          radius={theme.radius.lg}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
          }}
          m={10}
        >
          <Flex gap={5} justify="center" align="center" my={10} wrap='nowrap'>
            <Box>
              <Center>
                <ICPFitPill
                  icp_fit_score={data?.details.icp_fit_score}
                  icp_fit_reason={data?.details.icp_fit_reason}
                  archetype={data?.details.persona}
                />
              </Center>
            </Box>
            <Box>
              <Text fz='xs'>- <u>{_.truncate(data?.details.persona, {length: 25})}</u></Text>
            </Box>
          </Flex>

          {statusValue !== 'DEMO_SET' ? (
            <Flex gap={10} justify='center' wrap='nowrap' mb='xs' mx='xs'>
              <StatusBlockButton
                title='Demo Set'
                icon={<IconCalendarEvent color={theme.colors.pink[6]} size={24} />}
                onClick={async () => { await changeStatus('DEMO_SET') }}
              />
              <StatusBlockButton
                title='Not Interested'
                icon={<IconX color={theme.colors.red[6]} size={24} />}
                onClick={async () => { await changeStatus('NOT_INTERESTED') }}
              />
              <StatusBlockButton
                title='Not Qualified'
                icon={<IconTrash color={theme.colors.red[6]} size={24} />}
                onClick={async () => { await changeStatus('NOT_QUALIFIED') }}
              />
            </Flex>
          ) : (
            <Stack spacing={10}>
              <Box mx={10}>
                <ProspectDemoDateSelector prospectId={openedProspectId} />
              </Box>
              <Box mx={10} mb={10}>
                <Button
                  variant="light"
                  radius="md"
                  fullWidth
                  onClick={() => {
                    setDrawerProspectId(openedProspectId);
                    setDemosDrawerOpened(true);
                  }}
                >
                  Give Demo Feedback
                </Button>
                <DemoFeedbackDrawer refetch={refetch} />
              </Box>
            </Stack>
          )}
        </Paper>
      </div>
      {statusValue !== 'DEMO_SET' && statusValue !== 'ACCEPTED' && statusValue !== 'RESPONDED' && (
      <div style={{ flexBasis: '10%' }}>
        <Paper
          withBorder
          radius={theme.radius.lg}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
          }}
          mx={10}
          mb={10}
        >
          <Flex gap={0} wrap='nowrap'>
            <div style={{ flexBasis: '10%', margin: 15 }}>
              <Text fw={500} fz={13}>
                Substatus
              </Text>
            </div>
            <div style={{ flexBasis: '90%', margin: 10 }}>
              <Select
                size='xs'
                variant='filled'
                radius={theme.radius.lg}
                styles={{
                  input: {
                    backgroundColor: theme.colors['blue'][6],
                    color: theme.white,
                    '&:focus': {
                      borderColor: 'transparent',
                    },
                  },
                  rightSection: {
                    svg: {
                      color: `${theme.white}!important`,
                    },
                  },
                  item: {
                    '&[data-selected], &[data-selected]:hover': {
                      backgroundColor: theme.colors['blue'][6],
                    },
                  },
                }}
                data={prospectStatuses}
                value={statusValue}
                onChange={async (value) => {
                  if (!value) {
                    return;
                  }
                  await changeStatus(value);
                }}
              />
            </div>
          </Flex>
        </Paper>
      </div>
      )}

      <div style={{ flexBasis: '55%' }}>
        <Divider />
        <Tabs variant='pills' defaultValue='details' radius={theme.radius.lg} m={10}>
          <Tabs.List>
            <Tabs.Tab value='details' icon={<IconInfoCircle size='0.8rem' />}>
              Details
            </Tabs.Tab>
            <Tabs.Tab value='research' icon={<IconUserSearch size='0.8rem' />}>
              Research
            </Tabs.Tab>
            <Tabs.Tab value='notes' icon={<IconWriting size='0.8rem' />}>
              Notes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='details' pt='xs' h={'calc(100vh - 470px)'}>
            <Stack mx={8} spacing={2}>
              {data?.details.title && (
                <Group noWrap spacing={10} mt={3}>
                  <IconBriefcase stroke={1.5} size={18} className={classes.icon} />
                  <Text size='xs'>{data.details.title}</Text>
                </Group>
              )}

              {data?.details.company && (
                <Group noWrap spacing={10} mt={5}>
                  <IconBuildingStore stroke={1.5} size={18} className={classes.icon} />
                  <Text size='xs' component='a' target='_blank' rel='noopener noreferrer' href={data.company?.url || undefined}>
                    {data.details.company} {data.company?.url && (<IconExternalLink size='0.55rem' />)}
                  </Text>
                </Group>
              )}

              {linkedin_public_id && (
                <Group noWrap spacing={10} mt={5}>
                  <IconBrandLinkedin stroke={1.5} size={18} className={classes.icon} />
                  <Text
                    size='xs'
                    component='a'
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`https://www.linkedin.com/in/${linkedin_public_id}`}
                  >
                    linkedin.com/in/{linkedin_public_id} <IconExternalLink size='0.55rem' />
                  </Text>
                </Group>
              )}

              {data?.email.email && (
                <Group noWrap spacing={10} mt={5}>
                  <IconMail stroke={1.5} size={18} className={classes.icon} />
                  <Text size='xs' component='a' href={`mailto:${data.email.email}`}>
                    {data.email.email} <IconExternalLink size='0.55rem' />
                  </Text>
                </Group>
              )}

              {data?.details.address && (
                <Group noWrap spacing={10} mt={5}>
                  <IconMap2 stroke={1.5} size={18} className={classes.icon} />
                  <Text size='xs'>{data.details.address}</Text>
                </Group>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value='research' pt='xs' h={'calc(100vh - 470px)'}>
            <ScrollArea h={'100%'}>
              {openedProspectId !== -1 && <ProspectDetailsResearchTabs prospectId={openedProspectId} />}
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value='notes' pt='xs' h={'calc(100vh - 470px)'}>
            <Textarea
              ref={notesRef}
              autosize
              minRows={5}
              radius={theme.radius.lg}
              placeholder='Write notes here...'
              onBlur={async (event) => {
                await updateProspectNote(userToken, openedProspectId, event.currentTarget.value);
                refetch();
              }}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </Flex>
  );
}

function StatusBlockButton(props: { title: string; icon: ReactNode; onClick: () => void }) {
  const { classes, theme } = useStyles();

  return (
    <UnstyledButton
      className={classes.item}
      onClick={async () => {
        props.onClick();
      }}
      sx={{
        border: 'solid 1px #999',
      }}
    >
      {props.icon}
      <Text size='xs' mt={3}>
        {props.title}
      </Text>
    </UnstyledButton>
  );
}
