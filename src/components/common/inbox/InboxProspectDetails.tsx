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
} from '@mantine/core';
import { icpFitToIcon } from './InboxProspectList';
import { IconBriefcase, IconBuildingStore, IconBrandLinkedin, IconMail, IconMap2 } from '@tabler/icons-react';
import { openedProspectIdState, openedOutboundChannelState } from '@atoms/inboxAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useEffect, useRef } from 'react';
import { getProspectByID } from '@utils/requests/getProspectByID';
import { prospectStatuses } from './utils';
import { Prospect } from 'src';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export default function ProjectDetails(props: { prospects: Prospect[] }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

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
  const status = { label: 'Accepted', value: 'accepted' };

  const icp_fit = 4; // TODO: Temporary

  const linkedin_public_id = data?.li.li_profile?.split('/in/')[1]?.split('/')[0] ?? '';

  // Set the notes in the input box when the data is loaded in
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.value = data?.details.company ?? '';
    }
  }, [data]);

  return (
    <Flex gap={0} wrap='nowrap' direction='column' h='100vh' sx={{ borderLeft: '0.0625rem solid #dee2e6' }}>
      <div style={{ flexBasis: '25%' }}>
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
      <div style={{ flexBasis: '10%' }}>
        <Paper
          withBorder
          radius={theme.radius.lg}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            backgroundColor: theme.colors.gray[1],
          }}
          m={10}
        >
          <Flex gap={0} wrap='nowrap'>
            <div style={{ flexBasis: '10%', margin: 5 }}>{icpFitToIcon(icp_fit, '1.5rem')}</div>
            <div style={{ flexBasis: '90%' }}>
              <ScrollArea h={150} mb={2}>
                <Text size={12} my={5}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas lacus tortor, pharetra non diam
                  eget, aliquam viverra est. Vivamus dolor velit, hendrerit eu velit at, fermentum vestibulum dolor.
                  Cras ut lorem fermentum, lacinia odio in, porta nulla. Praesent commodo lobortis leo, nec dapibus elit
                  scelerisque varius. Duis metus purus, iaculis quis tincidunt non, tincidunt at sem. Nullam mattis
                  vulputate sapien quis consectetur. Sed nec risus congue, molestie leo vel, congue dui. Proin quis
                  laoreet quam. Maecenas tincidunt sem vitae rhoncus volutpat. Nam ac mattis libero. Maecenas bibendum
                  bibendum quam, a rutrum augue egestas vitae. Pellentesque sed ante neque. Sed facilisis leo mauris,
                  vel hendrerit risus eleifend quis.
                </Text>
              </ScrollArea>
            </div>
          </Flex>
        </Paper>
      </div>
      {status && status.value !== 'uninitiated' && (
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
                  Status
                </Text>
              </div>
              <div style={{ flexBasis: '90%', margin: 10 }}>
                <Select
                  size='xs'
                  variant='filled'
                  radius={theme.radius.lg}
                  styles={{
                    input: {
                      backgroundColor: theme.colors['blue' /* getProspectStatusColor(status?.value) */][6],
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
                        backgroundColor: theme.colors['blue' /* getProspectStatusColor(status?.value) */][6],
                      },
                    },
                  }}
                  data={prospectStatuses}
                  value={status?.value}
                  onChange={async (value) => {
                    if (!value) {
                      return;
                    }
                    /*
                    await updateProspectStatus(
                      userToken,
                      navOpenedProject.id,
                      openedProspectId,
                      openedOutboundChannel.toUpperCase(),
                      value
                    );*/
                    refetch();
                  }}
                />
              </div>
            </Flex>
          </Paper>
        </div>
      )}
      <div style={{ flexBasis: '30%' }}>
        <Divider />
        <Stack mx={15} my={5} spacing={2}>
          <Title order={5}>Details</Title>

          {data?.details.title && (
            <Group noWrap spacing={10} mt={3}>
              <IconBriefcase stroke={1.5} size={16} className={classes.icon} />
              <Text size='xs'>{data.details.title}</Text>
            </Group>
          )}

          {data?.details.company && (
            <Group noWrap spacing={10} mt={5}>
              <IconBuildingStore stroke={1.5} size={16} className={classes.icon} />
              <Text size='xs' component='a' target='_blank' rel='noopener noreferrer' href={''}>
                {data.details.company}
              </Text>
            </Group>
          )}

          {linkedin_public_id && (
            <Group noWrap spacing={10} mt={5}>
              <IconBrandLinkedin stroke={1.5} size={16} className={classes.icon} />
              <Text
                size='xs'
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
              <IconMail stroke={1.5} size={16} className={classes.icon} />
              <Text size='xs' component='a' href={`mailto:${data.email.email}`}>
                {data.email.email}
              </Text>
            </Group>
          )}

          {data?.details.company && (
            <Group noWrap spacing={10} mt={5}>
              <IconMap2 stroke={1.5} size={16} className={classes.icon} />
              <Text size='xs'>{data.details.company}</Text>
            </Group>
          )}
        </Stack>
      </div>
      <div style={{ flexBasis: '25%' }}>
        <Divider />
        <Title order={5} mx={15} my={5}>
          Notes
        </Title>
        <Textarea
          ref={notesRef}
          mx={10}
          minRows={3}
          maxRows={3}
          radius={theme.radius.lg}
          placeholder='Write notes here...'
          onBlur={async (event) => {
            /*
            await updateProspectNotes(
              userToken,
              navOpenedProject.id,
              openedProspectId,
              event.currentTarget.value
            );*/
            refetch();
          }}
        />
      </div>
    </Flex>
  );
}
