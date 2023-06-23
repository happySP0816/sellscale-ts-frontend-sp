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
} from '@tabler/icons-react';
import { openedProspectIdState, openedOutboundChannelState } from '@atoms/inboxAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { getProspectByID } from '@utils/requests/getProspectByID';
import { prospectStatuses } from './utils';
import { Channel, Prospect } from 'src';
import ProspectDetailsResearch, { ProspectDetailsResearchTabs } from '@common/prospectDetails/ProspectDetailsResearch';
import { updateProspectNote } from '@utils/requests/prospectNotes';
import { updateChannelStatus } from '@common/prospectDetails/ProspectDetailsChangeStatus';
import ProspectDetailsCalendarLink from '@common/prospectDetails/ProspectDetailsCalendarLink';
import { ICPFitContents, icpFitToIcon } from '@common/pipeline/ICPFitAndReason';
import { useHover } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
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

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
    queryFn: async () => {
      const response = await getProspectByID(userToken, openedProspectId);
      return response.status === 'success' ? response.data : [];
    },
    enabled: openedProspectId !== -1,
  });

  console.log(data);
  const statusValue = data?.details?.linkedin_status || 'ACTIVE_CONVO';

  const linkedin_public_id = data?.li.li_profile?.split('/in/')[1]?.split('/')[0] ?? '';

  // Set the notes in the input box when the data is loaded in
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.value = data?.details.notes[data?.details.notes.length - 1]?.note ?? '';
    }
  }, [data]);

  return (
    <Flex gap={0} wrap='nowrap' direction='column' h='100vh' sx={{ borderLeft: '0.0625rem solid #dee2e6' }}>
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
            backgroundColor: theme.colors.gray[1],
          }}
          mt={10}
          mx={10}
        >
          <Flex gap={0} wrap='nowrap'>
            <div style={{ flexBasis: '10%', margin: 5 }}>
              <Popover position='right' withArrow shadow='md' opened={icpHovered}>
                <Popover.Target>
                  <div ref={icpRef}>{icpFitToIcon(data?.details.icp_fit_score, '1.5rem')}</div>
                </Popover.Target>
                <Popover.Dropdown>
                  <ICPFitContents
                    icp_fit_score={data?.details.icp_fit_score}
                    icp_fit_reason={data?.details.icp_fit_reason}
                    archetype={data?.details.persona}
                  />
                </Popover.Dropdown>
              </Popover>
            </div>
            <div style={{ flexBasis: '90%' }}>
              <ScrollArea h={170} mb={2}>
                <Text size={12} my={5} mr={8}>
                  {data?.details.icp_fit_reason}
                </Text>
              </ScrollArea>
            </div>
          </Flex>
        </Paper>
      </div>
      <div style={{ flexBasis: '10%' }}>
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
                  await updateChannelStatus(
                    openedProspectId,
                    userToken,
                    openedOutboundChannel.toUpperCase() as Channel,
                    value
                  );
                  queryClient.invalidateQueries({
                    queryKey: ['query-dash-get-prospects'],
                  });
                  refetch();
                }}
              />
            </div>
          </Flex>
        </Paper>
      </div>

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
                  <Text size='sm'>{data.details.title}</Text>
                </Group>
              )}

              {data?.details.company && (
                <Group noWrap spacing={10} mt={5}>
                  <IconBuildingStore stroke={1.5} size={18} className={classes.icon} />
                  <Text size='sm' component='a' target='_blank' rel='noopener noreferrer' href={''}>
                    {data.details.company}
                  </Text>
                </Group>
              )}

              {linkedin_public_id && (
                <Group noWrap spacing={10} mt={5}>
                  <IconBrandLinkedin stroke={1.5} size={18} className={classes.icon} />
                  <Text
                    size='sm'
                    component='a'
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`https://www.linkedin.com/in/${linkedin_public_id}`}
                  >
                    linkedin.com/in/{linkedin_public_id}
                  </Text>
                </Group>
              )}

              {data?.email.email && (
                <Group noWrap spacing={10} mt={5}>
                  <IconMail stroke={1.5} size={18} className={classes.icon} />
                  <Text size='sm' component='a' href={`mailto:${data.email.email}`}>
                    {data.email.email}
                  </Text>
                </Group>
              )}

              {data?.details.address && (
                <Group noWrap spacing={10} mt={5}>
                  <IconMap2 stroke={1.5} size={18} className={classes.icon} />
                  <Text size='sm'>{data.details.address}</Text>
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
