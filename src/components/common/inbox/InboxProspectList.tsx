import {
  ActionIcon,
  Avatar,
  Badge,
  Checkbox,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Indicator,
  Input,
  LoadingOverlay,
  Modal,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconSearch,
  IconAdjustmentsFilled,
  IconCircle4Filled,
  IconCircle1Filled,
  IconCircle2Filled,
  IconCircle3Filled,
  IconStarFilled,
} from '@tabler/icons-react';
import _ from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { openedProspectIdState } from '@atoms/inboxAtoms';
import { Prospect, ProspectShallow } from 'src';
import { forwardRef, useEffect, useState } from 'react';
import { HEADER_HEIGHT } from './InboxProspectConvo';
import { getArchetypeProspects } from '@utils/requests/getArchetypeProspects';
import { prospectStatuses } from './utils';
import InboxProspectListFilter, { InboxProspectListFilterState, defaultInboxProspectListFilterState } from './InboxProspectListFilter';
import { convertDateToCasualTime, removeExtraCharacters } from '@utils/general';
import { co } from '@fullcalendar/core/internal-common';
import { count } from 'console';
import loaderWithText from '@common/library/loaderWithText';
import { icpFitToIcon } from '@common/pipeline/ICPFitAndReason';

interface StatusSelectItemProps extends React.ComponentPropsWithoutRef<'div'> {
  count: number;
  label: string;
}
const StatusSelectItem = forwardRef<HTMLDivElement, StatusSelectItemProps>(
  ({ count, label, ...others }: StatusSelectItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group spacing={0} position='apart' noWrap>
      <Text size="xs" sx={{ whiteSpace: 'nowrap' }}>{label}</Text>
        {count >= 0 && (
          <Text size="xs" fw={600}>{count}</Text>
        )}
      </Group>
    </div>
  )
);

export function ProspectConvoCard(props: {
  name: string;
  title: string;
  img_url: string;
  latest_msg: string;
  latest_msg_time: string;
  new_msg_count: number;
  icp_fit: number;
  opened: boolean;
}) {
  return (
    <>
      <Flex
        p={10}
        wrap='nowrap'
        sx={{
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundColor: props.opened ? 'white' : 'initial',
        }}
      >
        <div style={{ flex: 0 }}>
          <Indicator position='top-start' offset={5} inline label={icpFitToIcon(props.icp_fit)} size={0} m={5}>
            <Avatar size='md' radius='xl' src={props.img_url} />
          </Indicator>
        </div>
        <div style={{ flexGrow: 1 }}>
          <Stack spacing={0}>
            <Group position='apart' sx={{ flexWrap: 'nowrap' }}>
              <Title size={13}>{props.name}</Title>
              <Text c='dimmed' size={10}>
                {props.latest_msg_time}
              </Text>
            </Group>
            <Group position='apart' sx={{ flexWrap: 'nowrap' }}>
              <Text size={12} truncate>
                {_.truncate(props.latest_msg, { length: 35 })}
              </Text>
              {!props.opened && props.new_msg_count > 0 && <Badge variant='filled'>{props.new_msg_count}</Badge>}
            </Group>
            <Text size={10} c='dimmed' fs='italic'>
              {props.title}
            </Text>
          </Stack>
        </div>
      </Flex>
      <Divider />
    </>
  );
}

export default function ProspectList(props: { prospects: Prospect[], isFetching: boolean }) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);

  const filterSelectOptions = prospectStatuses.map((status) => ({ ...status, count: -1 }));
  filterSelectOptions.unshift({ label: 'All Substatus', value: 'ALL', count: -1 });

  const [filterSelectValue, setFilterSelectValue] = useState(filterSelectOptions[0].value);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filtersState, setFiltersState] = useState<InboxProspectListFilterState>();

  console.log('ProspectList', props.prospects);

  // Sort out uninitiated prospects and temp fill in unknown data
  let prospects =
    props.prospects?.map((p) => {
      return {
        id: p.id,
        name: p.full_name,
        img_url: p.img_url,
        icp_fit: p.icp_fit_score,
        latest_msg: p.li_last_message_from_prospect || 'No message found',
        latest_msg_time: convertDateToCasualTime(new Date(p.li_last_message_timestamp)),
        title: _.truncate(p.title, {
          'length': 50,
          'separator': ' '
        }),
        new_msg_count: p.li_unread_messages,
        persona_id: p.archetype_id,
        linkedin_status: p.linkedin_status,
        email_status: p.email_status,
        in_purgatory: p.hidden_until ? new Date(p.hidden_until) > new Date() : false,
      };
    }).sort((a, b) => b.icp_fit - a.icp_fit || removeExtraCharacters(a.name).localeCompare(removeExtraCharacters(b.name))) 
  ?? [];

  // Filter by search
  if(searchFilter.trim()) {
    prospects = prospects.filter((p) => {
      return p.name.toLowerCase().includes(searchFilter.toLowerCase())
        || p.title.toLowerCase().includes(searchFilter.toLowerCase());
    });
  }
  // Filter by status
  if(filterSelectValue !== 'ALL') {
    prospects = prospects.filter((p) => {
      return p.linkedin_status === filterSelectValue;
    });
  }
  // Advanced filters
  if(filtersState) {
    if(filtersState.recentlyContacted === 'HIDE'){
      prospects = prospects.filter((p) => p.in_purgatory);
    } else if(filtersState.recentlyContacted === 'SHOW') {
      prospects = prospects.filter((p) => !p.in_purgatory);
    }

    if(filtersState.channel === 'LINKEDIN') {
      prospects = prospects.filter((p) => p.linkedin_status);
    }
    if(filtersState.channel === 'EMAIL') {
      prospects = prospects.filter((p) => p.email_status);
    }

    if(filtersState.personaId) {
      prospects = prospects.filter((p) => p.persona_id+'' === filtersState.personaId);
    }

    // nurturingMode todo
  }



  useEffect(() => {
    if (prospects.length > 0 && openedProspectId === -1) {
      setOpenedProspectId(prospects[0].id);
    }
  }, [props.prospects]);

  return (
    <>
      <Stack spacing={0} h={'100vh'} sx={(theme) => ({ backgroundColor: theme.colors.gray[1], position: 'relative' })}>
        <LoadingOverlay loader={loaderWithText('')} visible={props.isFetching && props.prospects.length === 0} />
        <Container pt={20} pb={10} px={20} m={0}>
          <Input styles={{
            input: { borderColor: searchFilter.trim() ? theme.colors.blue[theme.fn.primaryShade()] : undefined },
          }} icon={<IconSearch size='1.0rem' />} value={searchFilter} onChange={(event) => setSearchFilter(event.currentTarget.value)} radius={theme.radius.lg} placeholder='Search...' />
        </Container>
        <Group pt={0} pb={5} px={20} m={0} position='apart' sx={{ flexWrap: 'nowrap' }}>
          <Select
            data={filterSelectOptions.map((o) => {
              let count = o.count;
              if(o.value !== 'ALL') {
                count = props.prospects.filter((p) => p.linkedin_status === o.value).length;
              }
              return {
                ...o,
                count,
              };
            })}
            variant='unstyled'
            size='xs'
            itemComponent={StatusSelectItem}
            value={filterSelectValue}
            onChange={(value) => {
              if(value){
                setFilterSelectValue(value);
              }
            }}
            styles={(theme) => ({
              input: {
                color: filterSelectValue !== filterSelectOptions[0].value ? theme.colors.blue[7] : theme.colors.gray[7],
                fontSize: 11,
                fontWeight: 600,
                maxWidth: 130,
                paddingLeft: 10,
              },
            })}
          />
          <ActionIcon
            variant='transparent'
            color={_.isEqual(filtersState, defaultInboxProspectListFilterState) || !filtersState ? 'gray.6' : 'blue.6'} 
            onClick={() => setFilterModalOpen(true)}
          >
            <IconAdjustmentsFilled size='1.125rem' />
          </ActionIcon>
        </Group>
        <Divider />
        <ScrollArea h={`calc(100vh - ${HEADER_HEIGHT}px)`} sx={{ overflowX: 'hidden' }}>
          {prospects.map((prospect: any, i: number) => (
            <Container key={i} p={0} m={0} onClick={() => setOpenedProspectId(prospect.id)}>
              <ProspectConvoCard
                name={prospect.name}
                title={prospect.title}
                img_url={prospect.img_url}
                latest_msg={prospect.latest_msg}
                latest_msg_time={prospect.latest_msg_time}
                icp_fit={prospect.icp_fit}
                new_msg_count={prospect.new_msg_count}
                opened={prospect.id === openedProspectId}
              />
            </Container>
          ))}
        </ScrollArea>
        <Text sx={{ position: 'absolute', bottom: 5, right: 5, zIndex: 100 }} fs="italic" fz={10} c="dimmed">{prospects.length} prospects</Text>
      </Stack>

      <InboxProspectListFilter
        open={filterModalOpen}
        setOpen={setFilterModalOpen}
        filters={filtersState}
        setFilters={setFiltersState}
      />
    </>
  );
}
