import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Flex,
  Group,
  Indicator,
  Input,
  Loader,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  rem,
  useMantineTheme,
} from '@mantine/core';
import {
  IconSearch,
  IconAdjustmentsFilled,
  IconInfoCircle,
  IconClock,
  IconStar,
  IconBellOff,
} from '@tabler/icons-react';
import _ from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { forwardRef, useEffect, useState } from 'react';
import { HEADER_HEIGHT } from './InboxProspectConvo';
import {
  labelizeConvoSubstatus,
  prospectStatuses,
  nurturingProspectStatuses,
  getStatusDetails,
  labelizeStatus,
} from './utils';
import InboxProspectListFilter, {
  InboxProspectListFilterState,
  defaultInboxProspectListFilterState,
} from './InboxProspectListFilter';
import { IconChevronUp } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';
import { INBOX_PAGE_HEIGHT, type ProspectRestructured } from '../../pages/InboxRestructurePage';
import { mainTabState, openedProspectIdState, openedProspectListState } from '@atoms/inboxAtoms';
import { useDisclosure } from '@mantine/hooks';
import { NAV_BAR_SIDE_WIDTH } from '@constants/data';
import { ProspectConvoCard } from './InboxProspectList';

export function InboxProspectListRestruct(props: { prospects: ProspectRestructured[] }) {
  const theme = useMantineTheme();
  const [openedList, setOpenedList] = useRecoilState(openedProspectListState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);

  const [searchFilter, setSearchFilter] = useState('');
  const [mainTab, setMainTab] = useRecoilState(mainTabState);

  const prospects = props.prospects
    .filter((p) => p.section.toLowerCase() === mainTab)
    .filter(
      (p) =>
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.full_name.toLowerCase().includes(searchFilter.toLowerCase())
    );

  const prospectGroups = _.groupBy(prospects, (p) => p.overall_status);

  return (
    <>
      <Drawer
        opened={openedList}
        onClose={() => setOpenedList(false)}
        title={<Title order={4}>Your Conversations</Title>}
        style={{
          marginLeft: NAV_BAR_SIDE_WIDTH,
        }}
        styles={{
          body: {
            padding: 0,
          },
          header: {
            backgroundColor: theme.colors.gray[1],
            paddingBottom: 0,
          },
        }}
        size='sm'
      >
        <ScrollArea h={'92vh'}>
          <Stack
            spacing={0}
            sx={(theme) => ({
              backgroundColor: theme.colors.gray[1],
              position: 'relative',
            })}
          >
            {/* Section tabs */}
            <Tabs
              value={mainTab}
              onTabChange={(value) => {
                setMainTab(value as string);
              }}
              styles={(theme) => ({
                tab: {
                  ...theme.fn.focusStyles(),
                  fontWeight: 600,
                  color: theme.colors.gray[5],
                  '&[data-active]': {
                    color: theme.colors.blue[theme.fn.primaryShade()],
                  },
                  paddingTop: rem(16),
                  paddingBottom: rem(16),
                },
              })}
            >
              <Tabs.List grow>
                <Tabs.Tab
                  value='inbox'
                  rightSection={
                    <Badge
                      sx={{ pointerEvents: 'none' }}
                      variant='filled'
                      size='xs'
                      color={mainTab === 'inbox' ? 'blue' : 'gray'}
                    >
                      {props.prospects.filter((p) => p.section === 'Inbox').length}
                    </Badge>
                  }
                >
                  Inbox
                </Tabs.Tab>
                <Tabs.Tab
                  value='snoozed'
                  rightSection={
                    <Badge
                      sx={{ pointerEvents: 'none' }}
                      variant='filled'
                      size='xs'
                      color={mainTab === 'inbox' ? 'blue' : 'gray'}
                    >
                      {props.prospects.filter((p) => p.section === 'Snoozed').length}
                    </Badge>
                  }
                >
                  Snoozed
                </Tabs.Tab>
                <Tabs.Tab
                  value='demos'
                  rightSection={
                    <Badge
                      w={16}
                      h={16}
                      sx={{ pointerEvents: 'none' }}
                      variant='filled'
                      size='xs'
                      p={0}
                    >
                      {props.prospects.filter((p) => p.section === 'Demos').length}
                    </Badge>
                  }
                >
                  Demos
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <>
              <Stack spacing={0}>
                {/* Search bar */}
                <Input
                  p={5}
                  sx={{ flex: 1 }}
                  styles={{
                    input: {
                      backgroundColor: theme.white,
                      border: `1px solid ${theme.colors.gray[2]}`,
                      '&:focus-within': {
                        borderColor: theme.colors.gray[4],
                      },
                      '&::placeholder': {
                        color: theme.colors.gray[6],
                        fontWeight: 500,
                      },
                    },
                  }}
                  icon={<IconSearch size='1.0rem' />}
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.currentTarget.value)}
                  radius={theme.radius.md}
                  placeholder='Search...'
                />
                <Stack spacing={0}>
                  {/* Grouped prospects by overall status */}
                  {Object.entries(prospectGroups).map((group, index) => (
                    <Box key={index}>
                      <Box bg='blue.1' py={'sm'} px={'md'} color='blue'>
                        <Flex w='100%'>
                          <Text color='blue' ta='center' fz={14} fw={700}>
                            {labelizeStatus(group[0])}
                          </Text>
                          <Badge color='blue' size='xs' ml='xs' mt='2px'>
                            {group[1].length}
                          </Badge>
                        </Flex>
                      </Box>
                      {/* List of prospects in that group */}
                      <Stack spacing={0}>
                        {group[1].map((prospect, index) => (
                          <Box
                            key={index}
                            onClick={() => {
                              setOpenedProspectId(prospect.id);
                              setOpenedList(false);
                            }}
                          >
                            <ProspectConvoCard
                              id={prospect.id}
                              name={prospect.full_name}
                              title={prospect.title}
                              img_url={prospect.img_url ?? ''}
                              latest_msg={prospect.last_message}
                              latest_msg_time={prospect.last_message_timestamp}
                              icp_fit={prospect.icp_fit_score}
                              new_msg_count={0}
                              latest_msg_from_sdr={false}
                              default_channel={
                                mainTab !== 'snoozed' ? prospect.primary_channel : undefined
                              }
                              opened={prospect.id === openedProspectId}
                              snoozed_until={prospect.hidden_until}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </>
          </Stack>
        </ScrollArea>
      </Drawer>

      <Button
        onClick={() => {
          setOpenedList(true);
        }}
      >
        Open drawer
      </Button>
    </>
  );
}
