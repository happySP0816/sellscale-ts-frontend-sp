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
  Card,
  Loader,
  Skeleton,
  ActionIcon,
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
  IconPencil,
} from '@tabler/icons-react';
import { openedProspectIdState, currentConvoChannelState } from '@atoms/inboxAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue, useRecoilState } from 'recoil';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { getProspectByID } from '@utils/requests/getProspectByID';
import { prospectStatuses } from './utils';
import { Channel, DemoFeedback, Prospect, ProspectDetails, ProspectShallow } from 'src';
import ProspectDetailsResearch, { ProspectDetailsResearchTabs } from '@common/prospectDetails/ProspectDetailsResearch';
import { updateProspectNote } from '@utils/requests/prospectNotes';
import { updateChannelStatus } from '@common/prospectDetails/ProspectDetailsChangeStatus';
import ProspectDetailsCalendarLink from '@common/prospectDetails/ProspectDetailsCalendarLink';
import ICPFitPill, { ICPFitContents, icpFitToIcon } from '@common/pipeline/ICPFitAndReason';
import { useDisclosure, useHover } from '@mantine/hooks';
import postRunICPClassification from '@utils/requests/postRunICPClassification';
import { DateTimePicker } from '@mantine/dates';
import ProspectDemoDateSelector from '@common/prospectDetails/ProspectDemoDateSelector';
import DemoFeedbackDrawer from '@drawers/DemoFeedbackDrawer';
import { demosDrawerOpenState, demosDrawerProspectIdState } from '@atoms/dashboardAtoms';
import _, { set } from 'lodash';
import { NAV_HEADER_HEIGHT } from '@nav/MainHeader';
import { INBOX_PAGE_HEIGHT } from '@pages/InboxPage';
import ProspectDetailsHistory from '@common/prospectDetails/ProspectDetailsHistory';
import EditProspectModal from '@modals/EditProspectModal';
import { proxyURL } from '@utils/general';
import { IconDeviceFloppy } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import getDemoFeedback from '@utils/requests/getDemoFeedback';
import DemoFeedbackCard from '@common/demo_feedback/DemoFeedbackCard';

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

export default function ProjectDetails(props: { prospects: ProspectShallow[] }) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const { classes } = useStyles();
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [forcedHistoryRefresh, setForcedHistoryRefresh] = useState(false);

  const { hovered: icpHovered, ref: icpRef } = useHover();

  const userToken = useRecoilValue(userTokenState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);
  const openedOutboundChannel = useRecoilValue(currentConvoChannelState);

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
      return response.status === 'success' ? response.data as ProspectDetails : undefined;
    },
    enabled: openedProspectId !== -1,
  });

  const { data: demoFeedback } = useQuery({
    queryKey: [`query-get-prospect-demo-feedback-${openedProspectId}`],
    queryFn: async () => {
      const response = await getDemoFeedback(userToken, openedProspectId);
      return response.status === "success" ? response.data[0] as DemoFeedback : undefined;
    },
    enabled: openedProspectId !== -1,
  });

  const statusValue = data?.details?.linkedin_status || 'ACCEPTED';

  const [editProspectModalOpened, { open: openProspectModal, close: closeProspectModal }] = useDisclosure()

  const linkedin_public_id = data?.li.li_profile?.split('/in/')[1]?.split('/')[0] ?? '';

  // Set the notes in the input box when the data is loaded in
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.value = data?.details.notes[data?.details.notes.length - 1]?.note ?? '';
    }
  }, [data]);

  const triggerUpdateProspectNote = async () => {
    setNoteLoading(true);

    if (notesRef.current?.value === "") {
      showNotification({
        title: 'Error',
        message: 'Please enter a note',
        color: 'red',
        autoClose: 5000,
      })
      setNoteLoading(false);
      return;
    }

    if (notesRef.current) {
      const result = await updateProspectNote(userToken, openedProspectId, notesRef.current.value);
      if (result.status === 'success') {
        showNotification({
          title: 'Note saved',
          message: 'The note has been added successfully',
          color: 'green',
          autoClose: 5000,
        })
      } else {
        showNotification({
          title: 'Error',
          message: 'There was an error saving the note',
          color: 'red',
          autoClose: 5000,
        })
      }
    }

    setForcedHistoryRefresh(!forcedHistoryRefresh) // Hacky way to force refresh
    setNoteLoading(false);
  }

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
    setOpenedProspectId(-1);
    refetch();
  };

  if (!openedProspectId || openedProspectId == -1) {
    return (
      <Flex
        direction='column'
        align='left'
        p='sm'
        mt='lg'
        h={`calc(${INBOX_PAGE_HEIGHT} - 100px)`}
      >
        <Skeleton height={50} circle mb="xl" />
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
        <Skeleton height={50} mt={6} width="70%" radius="xl" />
      </Flex>
    );
  }

  return (
    <Flex gap={0} wrap='nowrap' direction='column' h={'100%'} sx={{ borderLeft: '0.0625rem solid #dee2e6' }}>
      <div style={{ flexBasis: '20%' }}>
        <Stack spacing={0}>
          <Center>
            <Avatar size='xl' radius={100} mt={20} mb={8} src={proxyURL(data?.details.profile_pic)} />
          </Center>
          <Title order={4} ta='center'>
            {data?.details.full_name}
          </Title>

          <Card m='xs' withBorder>
            <ActionIcon onClick={openProspectModal} pos={'absolute'} right='5px' top='4px'>
              <IconPencil size='1rem' />
            </ActionIcon>
            <EditProspectModal
              modalOpened={editProspectModalOpened}
              openModal={openProspectModal}
              closeModal={closeProspectModal}
              backFunction={refetch}
              prospectID={openedProspectId}
            />
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
          </Card>
        </Stack>
      </div>
      <Divider />
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
                  icp_fit_score={data?.details.icp_fit_score || 0}
                  icp_fit_reason={data?.details.icp_fit_reason || ''}
                  archetype={data?.details.persona || ''}
                />
              </Center>
            </Box>
            <Box>
              <Text fz='xs'>- <u>{_.truncate(data?.details.persona, { length: 25 })}</u></Text>
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
                {data && demoFeedback ? (
                  <DemoFeedbackCard prospect={data.data} demoFeedback={demoFeedback} />
                ) : (
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
                )}
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
        <Tabs variant='pills' defaultValue='history' radius={theme.radius.lg} m={10}>
          <Tabs.List>
            <Tabs.Tab value='history' icon={<IconWriting size='0.8rem' />}>
              History
            </Tabs.Tab>
            <Tabs.Tab value='notes' icon={<IconWriting size='0.8rem' />}>
              Notes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='research' pt='xs' h={`calc(${INBOX_PAGE_HEIGHT} - 400px)`}>
            <ScrollArea h={'100%'}>
              {openedProspectId !== -1 && <ProspectDetailsResearchTabs prospectId={openedProspectId} />}
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value='history' pt='xs' h={`calc(${INBOX_PAGE_HEIGHT} - 400px)`}>
            <ScrollArea h={'100%'}>
              <Card withBorder pb='100px'>
                {openedProspectId !== -1 && <ProspectDetailsHistory prospectId={openedProspectId} forceRefresh={forcedHistoryRefresh} />}
              </Card>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value='notes' pt='xs' h={`calc(${INBOX_PAGE_HEIGHT} - 400px)`}>
            <Textarea
              ref={notesRef}
              autosize
              minRows={5}
              radius={theme.radius.sm}
              placeholder='Write notes here...'
              onChange={(e) => {
                notesRef.current!.value = e.target.value;
              }}
            />
            <Flex mt='md'>
              <Button
                size='xs'
                onClick={triggerUpdateProspectNote}
                loading={noteLoading}
              >
                Save Note
              </Button>
            </Flex>

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
