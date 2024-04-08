import { useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Group,
  Text,
  Anchor,
  Badge,
  Select,
  NumberInput,
  ActionIcon,
  useMantineTheme,
  Avatar,
  Modal,
  Switch,
  Accordion,
  Collapse,
  Stack,
  Divider,
} from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { DataGrid, stringFilterFn, DataGridFiltersState } from 'mantine-data-grid';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircuitGroundDigital,
  IconDiscountCheck,
  IconDots,
  IconPoint,
} from '@tabler/icons';
import { useState } from 'react';
import { faker } from '@faker-js/faker';
import { useDisclosure } from '@mantine/hooks';
import EditSlaModal from './MessagingAnalytics/EditSlaModal';
import { useQuery } from '@tanstack/react-query';
import { getMsgAnalyticsReport } from '@utils/requests/msgAnalyticsReport';
import { Archetype } from 'src';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { currentProjectState } from '@atoms/personaAtoms';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

enum Health {
  LOW = 'LOW',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  DISREGARD = 'DISREGARD',
}

type DateType = {
  active: boolean;
  health: Health;
  title: string;
  campaign: string;
  step: string;
  rate: number;
  totalRate: number;
  etl_num_times_used: number;
  etl_num_times_converted: number;
};

const MessagingAnalytics = () => {
  const userToken = useRecoilValue(userTokenState);
  const navigate = useNavigate();

  const [opened, { close, toggle }] = useDisclosure(false);
  const [groupOpened, { open: openGroup, close: closeGroup, toggle: toggleGroup }] =
    useDisclosure(false);
  const theme = useMantineTheme();
  const [columnFilters, setColumnFilters] = useState<DataGridFiltersState>([]);
  const [selectedHealth, setSelectedHealth] = useState<'low' | 'all'>('low');
  const currentProject = useRecoilValue(currentProjectState);

  const [groupby, setGroupby] = useState(true);
  const [groupid, setGroupId] = useState('');

  const [rangeValue, setRangeValue] = useState<[number, number]>([25, 75]);
  const [significance, setSignificance] = useState<number>(15);

  const {
    data: rawData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`query-msg-analytics-report`],
    queryFn: async () => {
      const response = await getMsgAnalyticsReport(userToken);
      return response.status === 'success' ? (response.data as Record<string, any>[]) : [];
    },
    refetchOnWindowFocus: false,
  });
  const data = (rawData ?? []).map((r) => {
    const conv = r['Conversion%'];
    return {
      active: r.Active,
      campaign: r.Campaign,
      campaign_id: r.CampaignID,
      totalRate: conv,
      rate: conv,
      step: r.Step,
      title: r.Title,
      etl_num_times_converted: r.etl_num_times_converted,
      etl_num_times_used: r.etl_num_times_used,
      health:
        r.etl_num_times_used >= significance
          ? conv >= rangeValue[1]
            ? Health.HIGH
            : r['Conversion%'] >= rangeValue[0] && r['Conversion%'] < rangeValue[1]
            ? Health.MEDIUM
            : Health.LOW
          : Health.DISREGARD,
    };
  });

  const displayData = selectedHealth === 'all' ? data : data.filter((i) => i.health === Health.LOW);

  const handleToggleGroup = (campaign: string, groupid: string) => {
    if (campaign === groupid || !groupOpened) toggleGroup();
    setGroupId(campaign);
  };
  const newData = _.groupBy(displayData, 'campaign');
  const groupedArray = Object.entries(newData);

  console.log('qqqqqqqqqqqq', displayData);

  return (
    <>
      <EditSlaModal
        opened={opened}
        onClose={close}
        startValue={rangeValue[0]}
        endValue={rangeValue[1]}
        significance={significance}
        setSignificance={setSignificance}
        setStartValue={(v) => {
          setRangeValue((prev) => [v, prev[1]]);
        }}
        setEndValue={(v) => {
          setRangeValue((prev) => [prev[0], v]);
        }}
        lowHealth={(displayData ?? []).filter((i) => i.health === Health.LOW).length}
      />
      <Box bg={'white'} p={'lg'}>
        <Flex align={'center'} justify={'space-between'}>
          <Text fw={600} fz={'xl'}>
            Messaging Center
          </Text>

          <Group>
            <Button variant='outline' color='gray'>
              Group by Campaign:{' '}
              <Switch ml={'sm'} defaultChecked size='sm' onChange={() => setGroupby(!groupby)} />
            </Button>
            <Button
              color={'red'}
              onClick={() => setSelectedHealth('low')}
              variant={selectedHealth === 'low' ? 'filled' : 'outline'}
            >
              Head Attention
              <Badge ml={4} color='red'>
                {(data ?? []).filter((i) => i.health === Health.LOW).length - 1}
              </Badge>
            </Button>
            <Button
              variant={selectedHealth === 'all' ? 'filled' : 'outline'}
              color='dark'
              onClick={() => setSelectedHealth('all')}
            >
              All{' '}
              <Badge ml={4} color='dark'>
                {(data ?? []).length - 1}
              </Badge>
            </Button>
            <Button onClick={toggle}>Edit SLAs</Button>
          </Group>
        </Flex>
        {!groupby ? (
          <DataGrid
            data={displayData}
            highlightOnHover
            withPagination
            withSorting
            withBorder
            sx={{ cursor: 'pointer' }}
            mt={'lg'}
            columns={[
              {
                accessorKey: 'health',
                header: 'HEALTH',
                maxSize: 120,
                cell: (cell) => {
                  const score = cell.cell.getValue<Health>();
                  let readable_score = '';
                  let color = '';
                  let leftSection = null;
                  switch (score) {
                    case Health.LOW:
                      readable_score = 'Low';
                      color = 'red';
                      leftSection = <IconAlertTriangle size={'0.8rem'} />;
                      break;
                    case Health.MEDIUM:
                      readable_score = 'Medium';
                      color = 'yellow';
                      break;
                    case Health.HIGH:
                      readable_score = 'High';
                      color = 'green';
                      break;
                    default:
                      readable_score = 'N/A';
                      color = 'gray';
                      break;
                  }

                  return (
                    <Badge
                      color={color}
                      leftSection={leftSection}
                      styles={{
                        leftSection: {
                          display: 'flex',
                          alignItems: 'center',
                          // justifyContent:'center'
                        },
                      }}
                    >
                      {readable_score}
                    </Badge>
                  );
                },
                filterFn: stringFilterFn,
              },
              {
                accessorKey: 'totalRate',
                header: 'Conversion Rate',
                enableSorting: false,
                maxSize: 140,
                cell: (cell) => {
                  const { rate, totalRate, health, etl_num_times_used, etl_num_times_converted } =
                    cell.row.original;

                  let color = '';

                  switch (health) {
                    case Health.LOW:
                      color = 'red';
                      break;
                    case Health.MEDIUM:
                      color = 'yellow';
                      break;
                    case Health.HIGH:
                      color = 'green';
                      break;
                    default:
                      color = 'gray';
                      break;
                  }
                  return (
                    <Flex
                      justify={'center'}
                      align={'center'}
                      direction={'column'}
                      gap={4}
                      w={'100%'}
                      h={'100%'}
                    >
                      <Badge color={color}>
                        {Math.round((etl_num_times_converted / etl_num_times_used + 0.001) * 100)}%
                      </Badge>

                      <Text c={'gray.6'} size={'xs'} fw={500}>
                        {etl_num_times_converted}/{etl_num_times_used}
                      </Text>
                    </Flex>
                  );
                },
                filterFn: stringFilterFn,
              },

              {
                accessorKey: 'campaign',
                header: 'Campaign',
                enableSorting: false,
                maxSize: 600,
                enableResizing: true,
                cell: (cell) => {
                  const { campaign, step } = cell.row.original as DateType;

                  return (
                    <Flex align={'center'} gap={'xs'} w={'100%'}>
                      <Avatar size={'sm'} />

                      <Box>
                        <Flex align={'center'} gap={4}>
                          <Text fw={500} size={'sm'}>
                            {campaign}
                          </Text>

                          <Anchor
                            href='/'
                            size={'sm'}
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <IconExternalLink size={'0.8rem'} />
                          </Anchor>
                        </Flex>

                        <Text display={'flex'} fw={500} c={'gray.6'}>
                          Step:&nbsp;
                          <Text fw={500} c={'black'}>
                            {step}
                          </Text>
                        </Text>
                      </Box>
                    </Flex>
                  );
                },
                filterFn: stringFilterFn,
              },

              {
                accessorKey: 'title',
                header: 'Framework TItle',
                enableSorting: false,
                cell: (cell) => {
                  const { title } = cell.row.original as DateType;

                  return (
                    <Flex align={'center'} h={'100%'}>
                      <Text fw={500}>{title}</Text>
                    </Flex>
                  );
                },
                filterFn: stringFilterFn,
              },

              {
                accessorKey: '',
                header: '',
                enableSorting: false,
                id: 'action',
                cell: (cell) => {
                  return (
                    <Flex align={'center'} h={'100%'}>
                      <Button
                        size='xs'
                        compact
                        rightIcon={<IconExternalLink size={'0.9rem'} />}
                        variant='light'
                        radius='lg'
                        onClick={() => {
                          navigate(`/setup/linkedin/${cell.row.original.campaign_id}`);
                        }}
                      >
                        Change Wording / Framework
                      </Button>
                    </Flex>
                  );
                },
                filterFn: stringFilterFn,
              },
            ]}
            options={{
              enableFilters: true,
            }}
            state={{
              columnFilters,
            }}
            components={{
              pagination: ({ table }) => (
                <Flex
                  justify={'space-between'}
                  align={'center'}
                  px={'sm'}
                  py={'1.25rem'}
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderTopWidth: 0,
                  })}
                >
                  <Flex align={'center'} gap={'sm'}>
                    <Text fw={500} color='gray.6'>
                      Show
                    </Text>

                    <Flex align={'center'}>
                      <NumberInput
                        maw={100}
                        value={table.getState().pagination.pageSize}
                        onChange={(v) => {
                          if (v) {
                            table.setPageSize(v);
                          }
                        }}
                      />
                      <Flex
                        sx={(theme) => ({
                          borderTop: `1px solid ${theme.colors.gray[4]}`,
                          borderRight: `1px solid ${theme.colors.gray[4]}`,
                          borderBottom: `1px solid ${theme.colors.gray[4]}`,
                          marginLeft: '-2px',
                          paddingLeft: '1rem',
                          paddingRight: '1rem',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0.25rem',
                        })}
                        h={36}
                      >
                        <Text color='gray.5' fw={500} fz={14}>
                          of {table.getPrePaginationRowModel().rows.length}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex align={'center'} gap={'sm'}>
                    <Flex align={'center'}>
                      <Select
                        maw={100}
                        value={`${table.getState().pagination.pageIndex + 1}`}
                        data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                          label: String(idx + 1),
                          value: String(idx + 1),
                        }))}
                        onChange={(v) => {
                          table.setPageIndex(Number(v) - 1);
                        }}
                      />
                      <Flex
                        sx={(theme) => ({
                          borderTop: `1px solid ${theme.colors.gray[4]}`,
                          borderRight: `1px solid ${theme.colors.gray[4]}`,
                          borderBottom: `1px solid ${theme.colors.gray[4]}`,
                          marginLeft: '-2px',
                          paddingLeft: '1rem',
                          paddingRight: '1rem',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0.25rem',
                        })}
                        h={36}
                      >
                        <Text color='gray.5' fw={500} fz={14}>
                          of {table.getPageCount()} pages
                        </Text>
                      </Flex>
                      <ActionIcon
                        variant='default'
                        color='gray.4'
                        h={36}
                        disabled={table.getState().pagination.pageIndex === 0}
                        onClick={() => {
                          table.setPageIndex(table.getState().pagination.pageIndex - 1);
                        }}
                      >
                        <IconChevronLeft stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                      <ActionIcon
                        variant='default'
                        color='gray.4'
                        h={36}
                        disabled={
                          table.getState().pagination.pageIndex === table.getPageCount() - 1
                        }
                        onClick={() => {
                          table.setPageIndex(table.getState().pagination.pageIndex + 1);
                        }}
                      >
                        <IconChevronRight stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ),
            }}
            w={'100%'}
            pageSizes={['20']}
            styles={(theme) => ({
              thead: {
                height: '44px',
                backgroundColor: theme.colors.gray[0],
                '::after': {
                  backgroundColor: 'transparent',
                },
              },

              wrapper: {
                gap: 0,
              },
              scrollArea: {
                paddingBottom: 0,
                gap: 0,
              },

              dataCellContent: {
                width: '100%',
              },
            })}
          />
        ) : (
          <Flex
            direction={'column'}
            style={{ border: '1px solid gray', borderRadius: '6px' }}
            mt={'md'}
          >
            <Flex
              p={'lg'}
              bg={'#f9f9fd'}
              style={{
                borderBottom: '1px solid #e8ebed',
                borderTopLeftRadius: '13px',
                borderTopRightRadius: '13px',
              }}
            >
              <Text w={'50%'}>Campaign Name</Text>
              <Text w={'20%'}>Steps</Text>
              <Text w={'17%'}>Status</Text>
              <Text w={'10%'}></Text>
            </Flex>
            {groupedArray.map(([campaign, data], index) => {
              return (
                <>
                  {/* <Flex align={'center'} p={'lg'} bg={groupOpened && campaign === groupid ? (selectedHealth === 'all' ? '#3178ea' : '#fa5252') : ''}> */}
                  <Flex align={'center'} p={'lg'}>
                    <Flex align={'center'} gap={'xs'} w={'50%'}>
                      <Avatar size={'md'} radius={'xl'} />
                      <Box>
                        <Flex align={'center'} gap={4}>
                          <Text
                            fw={500}
                            size={'sm'}
                            color={groupOpened && campaign === groupid ? '#228be6' : ''}
                          >
                            {campaign}
                          </Text>
                          <Anchor
                            href='/'
                            size={'sm'}
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <IconExternalLink size={'0.8rem'} color='#228be6' />
                          </Anchor>
                        </Flex>
                      </Box>
                    </Flex>
                    <Flex w={'20%'}>
                      {groupOpened && campaign === groupid ? (
                        selectedHealth === 'low' && (
                          <Badge color='gray'>{data.length} Frameworks</Badge>
                        )
                      ) : (
                        <Badge color='gray'>{data.length} Frameworks</Badge>
                      )}
                    </Flex>
                    <Flex w={'17%'}>
                      {data.find((item) => item.health.includes('LOW')) ? (
                        <Text
                          color='red'
                          display={
                            groupOpened && campaign === groupid
                              ? selectedHealth === 'all'
                                ? 'none'
                                : 'flex'
                              : 'flex'
                          }
                          style={{ alignItems: 'center', gap: '8px' }}
                          fw={500}
                        >
                          <IconAlertTriangle size='1.2rem' color='red' />
                          Need Attention
                        </Text>
                      ) : (
                        <Text
                          color={
                            groupOpened && campaign === groupid
                              ? selectedHealth === 'all'
                                ? 'green'
                                : 'white'
                              : 'green'
                          }
                          display={
                            groupOpened && campaign === groupid
                              ? selectedHealth === 'all'
                                ? 'none'
                                : 'flex'
                              : 'flex'
                          }
                          style={{ alignItems: 'center', gap: '8px' }}
                          fw={500}
                        >
                          <IconDiscountCheck
                            size='1.2rem'
                            color={
                              groupOpened && campaign === groupid
                                ? selectedHealth === 'all'
                                  ? '#08b45f'
                                  : 'white'
                                : '#08b45f'
                            }
                          />
                          No Problems
                        </Text>
                      )}
                    </Flex>
                    <Flex align={'center'} gap={'sm'} w={'10%'}>
                      <Button
                        variant={'outline'}
                        radius={'lg'}
                        // style={{
                        //   backgroundColor: groupOpened && campaign === groupid ? (selectedHealth === 'all' ? '#3178ea' : '#fd807f') : '',
                        // }}
                        size='xs'
                        rightIcon={
                          groupOpened && campaign === groupid ? (
                            <IconChevronUp size={16} />
                          ) : (
                            <IconChevronDown size={16} />
                          )
                        }
                        onClick={() => {
                          handleToggleGroup(campaign, groupid);
                        }}
                      >
                        {groupOpened && campaign === groupid ? 'Hide' : 'View'} {data.length} steps
                      </Button>
                    </Flex>
                  </Flex>
                  {campaign === groupid && (
                    <Collapse in={groupOpened} transitionTimingFunction='linear'>
                      <Flex px={'lg'}>
                        <DataGrid
                          data={data}
                          highlightOnHover
                          withSorting
                          withBorder
                          withPagination
                          sx={{ cursor: 'pointer' }}
                          columns={[
                            {
                              accessorKey: 'step',
                              header: 'Step',
                              enableSorting: false,
                              maxSize: 1000,
                              enableResizing: true,
                              cell: (cell) => {
                                const { campaign, step } = cell.row.original as DateType;
                                const { title } = cell.row.original as DateType;
                                return (
                                  <Flex align={'center'} gap={'xs'} w={'100%'} h={'100%'}>
                                    <Box>
                                      <Text display={'flex'} fw={500} c={'gray.6'}>
                                        Step #{step.replaceAll('Follow Up #', '')}:&nbsp;
                                        <Text fw={500} c={'black'}>
                                          {title}
                                        </Text>
                                      </Text>
                                    </Box>
                                  </Flex>
                                );
                              },
                              filterFn: stringFilterFn,
                            },
                            {
                              accessorKey: 'health',
                              header: 'HEALTH',
                              maxSize: 130,
                              cell: (cell) => {
                                const score = cell.cell.getValue<Health>();
                                let readable_score = '';
                                let color = '';
                                let leftSection = null;
                                switch (score) {
                                  case Health.LOW:
                                    readable_score = 'Low';
                                    color = 'red';
                                    leftSection = <IconPoint fill={color} size={'1rem'} />;
                                    break;
                                  case Health.MEDIUM:
                                    readable_score = 'Medium';
                                    color = 'yellow';
                                    break;
                                  case Health.HIGH:
                                    readable_score = 'High';
                                    color = 'green';
                                    break;
                                  default:
                                    readable_score = 'N/A';
                                    color = 'gray';
                                    break;
                                }

                                return (
                                  <Flex h={'100%'} align={'center'}>
                                    <Badge
                                      color={color}
                                      leftSection={leftSection}
                                      styles={{
                                        leftSection: {
                                          display: 'flex',
                                          alignItems: 'center',
                                          // justifyContent:'center'
                                        },
                                      }}
                                    >
                                      {readable_score}
                                    </Badge>
                                  </Flex>
                                );
                              },
                              filterFn: stringFilterFn,
                            },
                            {
                              accessorKey: 'totalRate',
                              header: 'Conversion Rate',
                              enableSorting: false,
                              maxSize: 140,
                              cell: (cell) => {
                                const {
                                  rate,
                                  totalRate,
                                  health,
                                  etl_num_times_used,
                                  etl_num_times_converted,
                                } = cell.row.original;

                                let color = '';

                                switch (health) {
                                  case Health.LOW:
                                    color = 'red';
                                    break;
                                  case Health.MEDIUM:
                                    color = 'yellow';
                                    break;
                                  case Health.HIGH:
                                    color = 'green';
                                    break;
                                  default:
                                    color = 'gray';
                                    break;
                                }
                                return (
                                  <Flex
                                    justify={'center'}
                                    align={'center'}
                                    direction={'column'}
                                    gap={4}
                                    w={'100%'}
                                    h={'100%'}
                                  >
                                    <Badge color={color}>
                                      {Math.round(
                                        (etl_num_times_converted / etl_num_times_used + 0.001) * 100
                                      )}
                                      %
                                    </Badge>

                                    <Text c={'gray.6'} size={'xs'} fw={500}>
                                      {etl_num_times_converted}/{etl_num_times_used}
                                    </Text>
                                  </Flex>
                                );
                              },
                              filterFn: stringFilterFn,
                            },
                            {
                              accessorKey: 'action',
                              header: '',
                              enableSorting: false,
                              id: 'action',
                              cell: (cell) => {
                                return (
                                  <Flex align={'center'} h={'100%'}>
                                    <Button
                                      size='sm'
                                      compact
                                      rightIcon={<IconExternalLink size={'0.9rem'} />}
                                      variant='light'
                                      radius='lg'
                                      onClick={() => {
                                        navigate(
                                          `/setup/linkedin/${cell.row.original.campaign_id}`
                                        );
                                      }}
                                    >
                                      Change Wording / Framework
                                    </Button>
                                  </Flex>
                                );
                              },
                              filterFn: stringFilterFn,
                            },
                          ]}
                          options={{
                            enableFilters: true,
                          }}
                          state={{
                            columnFilters,
                          }}
                          components={{
                            pagination: ({ table }) => (
                              <Flex
                                justify={'space-between'}
                                align={'center'}
                                px={'sm'}
                                py={'1.25rem'}
                                sx={(theme) => ({
                                  border: `1px solid ${theme.colors.gray[4]}`,
                                  borderTopWidth: 0,
                                })}
                              >
                                <Flex align={'center'} gap={'sm'}>
                                  <Text fw={500} color='gray.6'>
                                    Show
                                  </Text>

                                  <Flex align={'center'}>
                                    <NumberInput
                                      maw={100}
                                      value={table.getState().pagination.pageSize}
                                      onChange={(v) => {
                                        if (v) {
                                          table.setPageSize(v);
                                        }
                                      }}
                                    />
                                    <Flex
                                      sx={(theme) => ({
                                        borderTop: `1px solid ${theme.colors.gray[4]}`,
                                        borderRight: `1px solid ${theme.colors.gray[4]}`,
                                        borderBottom: `1px solid ${theme.colors.gray[4]}`,
                                        marginLeft: '-2px',
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '0.25rem',
                                      })}
                                      h={36}
                                    >
                                      <Text color='gray.5' fw={500} fz={14}>
                                        of {table.getPrePaginationRowModel().rows.length}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                </Flex>

                                <Flex align={'center'} gap={'sm'}>
                                  <Flex align={'center'}>
                                    <Select
                                      maw={100}
                                      value={`${table.getState().pagination.pageIndex + 1}`}
                                      data={new Array(table.getPageCount())
                                        .fill(0)
                                        .map((i, idx) => ({
                                          label: String(idx + 1),
                                          value: String(idx + 1),
                                        }))}
                                      onChange={(v) => {
                                        table.setPageIndex(Number(v) - 1);
                                      }}
                                    />
                                    <Flex
                                      sx={(theme) => ({
                                        borderTop: `1px solid ${theme.colors.gray[4]}`,
                                        borderRight: `1px solid ${theme.colors.gray[4]}`,
                                        borderBottom: `1px solid ${theme.colors.gray[4]}`,
                                        marginLeft: '-2px',
                                        paddingLeft: '1rem',
                                        paddingRight: '1rem',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '0.25rem',
                                      })}
                                      h={36}
                                    >
                                      <Text color='gray.5' fw={500} fz={14}>
                                        of {table.getPageCount()} pages
                                      </Text>
                                    </Flex>
                                    <ActionIcon
                                      variant='default'
                                      color='gray.4'
                                      h={36}
                                      disabled={table.getState().pagination.pageIndex === 0}
                                      onClick={() => {
                                        table.setPageIndex(
                                          table.getState().pagination.pageIndex - 1
                                        );
                                      }}
                                    >
                                      <IconChevronLeft stroke={theme.colors.gray[4]} />
                                    </ActionIcon>
                                    <ActionIcon
                                      variant='default'
                                      color='gray.4'
                                      h={36}
                                      disabled={
                                        table.getState().pagination.pageIndex ===
                                        table.getPageCount() - 1
                                      }
                                      onClick={() => {
                                        table.setPageIndex(
                                          table.getState().pagination.pageIndex + 1
                                        );
                                      }}
                                    >
                                      <IconChevronRight stroke={theme.colors.gray[4]} />
                                    </ActionIcon>
                                  </Flex>
                                </Flex>
                              </Flex>
                            ),
                          }}
                          w={'100%'}
                          styles={(theme) => ({
                            thead: {
                              height: '44px',
                              backgroundColor: theme.colors.gray[0],
                              '::after': {
                                backgroundColor: 'transparent',
                              },
                            },
                            wrapper: {
                              gap: 0,
                            },
                            scrollArea: {
                              paddingBottom: 0,
                              gap: 0,
                            },
                            dataCellContent: {
                              width: '100%',
                            },
                          })}
                        />
                      </Flex>
                    </Collapse>
                  )}
                  {index !== groupedArray.length - 1 && <Divider />}
                </>
              );
            })}
          </Flex>
        )}
      </Box>
    </>
  );
};

export default MessagingAnalytics;
