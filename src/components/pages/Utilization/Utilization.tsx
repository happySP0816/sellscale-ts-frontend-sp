import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Popover,
  Progress,
  RingProgress,
  ScrollArea,
  Select,
  Switch,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconBolt,
  IconBrandLinkedin,
  IconCalendar,
  IconCheckbox,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconCloudUpload,
  IconExternalLink,
  IconFileUnknown,
  IconInfoCircle,
  IconLetterT,
  IconLoader,
  IconMail,
  IconPlus,
  IconPoint,
  IconRosette,
  IconSend,
  IconTargetArrow,
  IconToggleRight,
  IconUserCircle,
} from '@tabler/icons';
import { IconCrossFilled, IconInfoHexagon, IconInfoTriangle, IconMessageCheck, IconNumber12Small, IconSparkles } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { DataGrid } from 'mantine-data-grid';
import { Doughnut } from 'react-chartjs-2';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useQuery } from '@tanstack/react-query';
import { getPersonasCampaignView } from '@utils/requests/getPersonas';
import { CampaignPersona } from '@common/campaigns/PersonaCampaigns';
import { API_URL } from '@constants/data';

interface outboundType {
  message_active: number;
  message_total: number;
  seat_active: number;
  seat_total: number;
}

export default function Utilization() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [activeCampaignOpen, { toggle: activeCampaignToggle }] = useDisclosure(false);
  const [activeOpened, { toggle: activeToggle }] = useDisclosure(true);
  const [repOpened, { toggle: repToggle }] = useDisclosure(true);
  const [aiOpened, { toggle: aiToggle }] = useDisclosure(true);
  const [noOpened, { toggle: noToggle }] = useDisclosure(true);
  const [completeOpened, { toggle: completeToggle }] = useDisclosure(true);

  const { data: campaigns } = useQuery({
    queryKey: [`query-get-campaigns`],
    queryFn: async () => {
      const response = await getPersonasCampaignView(userToken);
      const result = response.status === 'success' ? (response.data as CampaignPersona[]) : [];

      return result;
    },
  });

  const { data: ccData } = useQuery({
    queryKey: [`query-get-client-campaign-data`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/campaigns/client_campaign_view_data`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        method: 'POST',
      });
      return (await response.json()).data.records as Record<string, any>[];
    },
  });

  const [acPageSize, setAcPageSize] = useState('25');
  const [raPageSize, setRaPageSize] = useState('25');
  const [udPageSize, setUdPageSize] = useState('25');
  const [cdPageSize, setCdPageSize] = useState('25');
  const [ncPageSize, setNcPageSize] = useState('25');

  const [outboundData, setOutboundData] = useState<outboundType>();

  const seat_data = {
    labels: ['Label 1', 'Label 2'],
    datasets: [
      {
        data: [
          Math.min(100, Math.floor(((outboundData?.seat_active || 0) / (outboundData?.seat_total || 1)) * 100)),
          100 - Math.min(100, Math.floor(((outboundData?.seat_active || 0) / (outboundData?.seat_total || 1)) * 100)),
        ],
        backgroundColor: ['#3b84ef', '#eaecf0'],
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };
  const message_data = {
    labels: ['Label 1', 'Label 2'],
    datasets: [
      {
        data: [
          Math.min(100, Math.floor(((outboundData?.message_active || 0) / (outboundData?.message_total || 1)) * 100)),
          100 - Math.min(100, Math.floor(((outboundData?.message_active || 0) / (outboundData?.message_total || 1)) * 100)),
        ],
        backgroundColor: ['#d444f1', '#eaecf0'],
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };

  const piechartOptions = {
    rotation: 270,
    circumference: 180,
    cutout: `80%`,
    rounded: '10px',
    plugins: {
      legend: {
        display: false,
      },
      doughnutCutout: false,
    },
  };

  const processedCampaigns =
    campaigns
      ?.map((c) => {
        return {
          status: c.active,
          percentage: Math.ceil((c.total_sent / c.total_prospects) * 100 || 0),
          campaign: c.name,
          sent: c.total_sent,
          open: c.total_opened,
          reply: c.total_replied,
          demo: c.total_demo,
          linkedin: c.linkedin_active,
          email: c.email_active,
        };
      })
      .filter((c) => c.linkedin || c.email)
      .sort((a, b) => (a.linkedin || a.email ? -1 : 1)) ?? [];

  const completedData =
    campaigns
      ?.map((c) => {
        return {
          status: c.active,
          percentage: Math.ceil((c.total_sent / c.total_prospects) * 100 || 0),
          campaign: c.name,
          sdr: c.sdr_name,
          last_send_date: c.created_at, // TODO
          num_sent: c.total_sent,
          linkedin: c.linkedin_active,
          email: c.email_active,
        };
      })
      .filter((c) => c.percentage === 100) ?? [];

  const ccRepActions = ccData?.filter((c) => c.status.endsWith('Rep Action Needed')) ?? [];
  const repNeedData =
    ccRepActions.map((a) => {
      const campaign = campaigns?.find((c) => a.campaign.endsWith(c.name));
      if (!campaign)
        return {
          campaign: '',
          campaign_id: -1,
          sdr: '',
          company: '',
        };

      return {
        campaign: campaign.name,
        campaign_id: campaign.id,
        sdr: a.rep as string,
        company: a.company as string,
      };
    }) ?? [];

  const upladingData =
    ccData
      ?.filter((c) => c.status.endsWith('Uploading to SellScale'))
      .map((c) => {
        return {
          status: 'uploading by sellscale',
          campaign: c.campaign,
          sdr: c.rep,
          campaign_id: -1,
        };
      }) ?? [];

  const noCampaignData =
    ccData
      ?.filter((c) => c.status.endsWith('No Campaign Found'))
      .map((c) => {
        return {
          status: 'No Campaign Found',
          sdr: c.rep,
        };
      }) ?? [];

  const [seatData, setSeatData] = useState([
    {
      avatar: '',
      name: 'Tim Bruno',
      type: true,
      count: 5,
    },
    {
      avatar: '',
      name: 'Tim Bruno',
      type: true,
      count: 5,
    },
    {
      avatar: '',
      name: 'Tim Bruno',
      type: false,
      count: 5,
    },
    {
      avatar: '',
      name: 'Tim Bruno',
      type: false,
      count: 5,
    },
    {
      avatar: '',
      name: 'Tim Bruno',
      type: false,
      count: 5,
    },
  ]);

  return (
    <Card withBorder>
      <Flex w={'100%'}>
        <Text>Outbound Utilization</Text>
        <Popover width={200} position='bottom' withArrow shadow='md'>
          <Popover.Target>
            <Badge color='blue' variant='filled' sx={{ textTransform: 'none' }} leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '4px' }} />}>
              View Details
            </Badge>
          </Popover.Target>

          <Popover.Dropdown>Dropdown</Popover.Dropdown>
        </Popover>
      </Flex>
      <Text>View which reps have campaigns that are active, completed, or need action.</Text>

      <div className='bg-white'>
        <Flex direction={'column'} py={'lg'} gap={'lg'}>
          <Flex gap={'md'}>
            <Flex px={'md'} sx={{ border: '1px solid #dee2e6', borderRadius: '8px' }} w={'100%'} h={'fit-content'} align={'center'} gap={'xl'}>
              <div className='w-[140px] relative'>
                <Doughnut data={seat_data} options={piechartOptions} />
                <Flex
                  style={{
                    position: 'absolute',
                    top: '75px',
                    width: '100%',
                    alignItems: 'center',
                  }}
                  direction={'column'}
                >
                  <Text fw={600} size={'xl'}>
                    {Math.min(100, Math.floor(((outboundData?.seat_active || 0) / (outboundData?.seat_total || 1)) * 100))}%
                  </Text>{' '}
                </Flex>
              </div>
              <Box w={'100%'}>
                <Flex align={'center'} justify={'space-between'} w={'100%'}>
                  <Text size={'sm'} color='gray' sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div className=' rounded-full bg-[#3b84ef] w-[8px] h-[8px]'></div>
                    Seat Utilization
                  </Text>
                  <Popover width={370} position='bottom' withArrow shadow='lg'>
                    <Popover.Target>
                      <Badge
                        color='blue'
                        variant='filled'
                        sx={{ textTransform: 'none', cursor: 'pointer' }}
                        leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '4px' }} />}
                      >
                        View Details
                      </Badge>
                    </Popover.Target>

                    <Popover.Dropdown sx={{ borderRadius: '8px' }} p={'xl'}>
                      <Flex gap={'sm'} align={'center'}>
                        <IconUserCircle color='#228be6' />{' '}
                        <Text fw={700} size={'lg'}>
                          Seat Utilization by Rep
                        </Text>
                      </Flex>
                      <ScrollArea h={350} mr={'-15px'} scrollbarSize={10}>
                        {seatData?.map((item, index) => {
                          return (
                            <Box mt={'md'} sx={{ border: '1px solid #dee2e6', borderRadius: '4px' }} p={'sm'} mr={'15px'}>
                              <Flex align={'center'} gap={'5px'}>
                                <Flex w={'100%'} gap={'5px'}>
                                  <Avatar size={'sm'} src={item?.avatar} radius={'xl'} />
                                  <Text tt={'uppercase'} w={'100%'} fw={600}>
                                    {item?.name}
                                  </Text>
                                </Flex>
                                <Divider w={'100%'} />
                                <Flex w={'fit-content'}>
                                  {item?.type ? (
                                    <IconCircleCheck color='white' size={'1.2rem'} fill='green' />
                                  ) : (
                                    <IconInfoCircle color='white' fill='red' size={'1.2rem'} />
                                  )}
                                </Flex>
                              </Flex>
                              <Flex>
                                <Text color='gray' size={'xs'}>
                                  {item?.type ? item.count : 'No'} active campaigns
                                </Text>
                              </Flex>
                            </Box>
                          );
                        })}
                      </ScrollArea>
                    </Popover.Dropdown>
                  </Popover>
                </Flex>

                <Text color='gray'>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'black',
                    }}
                  >
                    {outboundData?.seat_active} / {outboundData?.seat_total}
                  </span>{' '}
                  Seats with Active Campaings
                </Text>
              </Box>
            </Flex>
            <Flex px={'md'} sx={{ border: '1px solid #dee2e6', borderRadius: '8px' }} w={'100%'} align={'center'} gap={'xl'} h={'fit-content'}>
              <div className='w-[140px] relative'>
                <Doughnut data={message_data} options={piechartOptions} />
                <Flex
                  style={{
                    position: 'absolute',
                    top: '75px',
                    width: '100%',
                    alignItems: 'center',
                  }}
                  direction={'column'}
                >
                  <Text fw={600} size={'xl'}>
                    {Math.min(100, Math.floor(((outboundData?.message_active || 0) / (outboundData?.message_total || 1)) * 100))}%
                  </Text>{' '}
                </Flex>
              </div>
              <Box w={'100%'}>
                <Flex align={'center'} justify={'space-between'} w={'100%'}>
                  <Text size={'sm'} color='gray' sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div className=' rounded-full bg-[#d444f1] w-[8px] h-[8px]'></div>
                    Message Utilization
                  </Text>
                  <Popover width={370} position='bottom' withArrow shadow='lg'>
                    <Popover.Target>
                      <Badge
                        color='blue'
                        variant='filled'
                        sx={{ textTransform: 'none', cursor: 'pointer' }}
                        leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '4px' }} />}
                      >
                        View Details
                      </Badge>
                    </Popover.Target>
                    <Popover.Dropdown sx={{ borderRadius: '8px' }} p={'xl'}>
                      <Flex gap={'sm'} align={'center'}>
                        <IconUserCircle color='#d444f1' />
                        <Text fw={700} size={'lg'}>
                          Message Utilization by Rep
                        </Text>
                      </Flex>
                      <ScrollArea h={350} mr={'-15px'} scrollbarSize={10}>
                        {seatData?.map((item, index) => {
                          return (
                            <Box mt={'md'} sx={{ border: '1px solid #dee2e6', borderRadius: '4px' }} p={'sm'} mr={'15px'}>
                              <Flex align={'center'} gap={'5px'}>
                                <Flex w={'100%'} gap={'5px'}>
                                  <Avatar size={'sm'} src={item?.avatar} radius={'xl'} />
                                  <Text tt={'uppercase'} w={'100%'} fw={600}>
                                    {item?.name}
                                  </Text>
                                </Flex>
                                <Divider w={'100%'} />
                                <Flex w={'fit-content'}>
                                  {item?.type ? (
                                    <IconCircleCheck color='white' size={'1.2rem'} fill='green' />
                                  ) : (
                                    <IconInfoCircle color='white' fill='red' size={'1.2rem'} />
                                  )}
                                </Flex>
                              </Flex>
                              <Flex>
                                <Text color='gray' size={'xs'}>
                                  {item?.type ? item.count : 'No'} active campaigns
                                </Text>
                              </Flex>
                            </Box>
                          );
                        })}
                      </ScrollArea>
                    </Popover.Dropdown>
                  </Popover>
                </Flex>
                <Text color='gray'>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: 'black',
                    }}
                  >
                    {outboundData?.message_active} / {outboundData?.message_total}
                  </span>{' '}
                  Available Sending Out
                </Text>
              </Box>
            </Flex>
          </Flex>
          <Flex direction={'column'} gap={'sm'}>
            <Flex align={'center'} gap={'5px'}>
              <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'} w={'320px'}>
                <IconTargetArrow color='#228be6' />
                <span>Active Campaigns</span>
                <Badge sx={{ background: '#228be6', color: 'white' }}>{processedCampaigns.filter((c) => c.status).length}</Badge>
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={activeToggle}>{activeOpened ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <Collapse in={activeOpened}>
              <DataGrid
                data={processedCampaigns.filter((c) => c.status)}
                highlightOnHover
                withPagination
                withSorting
                withColumnBorders
                withBorder
                sx={{
                  cursor: 'pointer',
                  '& .mantine-10xyzsm>tbody>tr>td': {
                    padding: '0px',
                  },
                  '& tr': {
                    background: 'white',
                  },
                }}
                columns={[
                  {
                    accessorKey: 'Status',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLoader color='gray' size={'0.9rem'} />
                        <Text color='gray'>Status</Text>
                      </Flex>
                    ),
                    maxSize: 180,
                    cell: (cell) => {
                      const { status, percentage } = cell.row.original;

                      return (
                        <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'} justify={'center'}>
                          <Badge>active</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'campaigns',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconTargetArrow color='gray' size={'0.9rem'} />
                        <Text color='gray'>Campaigns</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
                      const { campaign } = cell.row.original;

                      return (
                        <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                          <Text lineClamp={1}>{campaign}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'sdr',
                    maxSize: 200,
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconTargetArrow color='gray' size={'0.9rem'} />
                        <Text color='gray'>SDR</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
                      return (
                        <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                          <Avatar src={''} size={'sm'} radius={'xl'} />
                          <Text fw={500}>{'Mary S.'}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'channel',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconToggleRight color='gray' size={'0.9rem'} />
                        <Text color='gray'>Channels</Text>
                      </Flex>
                    ),
                    maxSize: 130,
                    enableResizing: true,
                    cell: (cell) => {
                      const { linkedin, email } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                          <Flex justify={'center'} w={'100%'} align={'center'} gap={'md'}>
                            {linkedin && <IconBrandLinkedin size={'1.3rem'} fill='#228be6' color='white' />}
                            {email && <IconMail size={'1.3rem'} fill='#228be6' color='white' />}
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'Progress',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconBolt color='gray' size={'0.9rem'} />
                        <Text color='gray'>Progress</Text>
                      </Flex>
                    ),
                    maxSize: 200,
                    enableResizing: true,
                    cell: (cell) => {
                      return (
                        <Flex direction={'column'} align={'center'} justify={'center'} w={'100%'} h={'100%'}>
                          <Flex w={'100%'} align={'center'} gap={'8px'} px={'xs'}>
                            <Progress value={50} w={'100%'} />
                            <Text color='#228be6' fw={500}>
                              {'63'}%
                            </Text>
                          </Flex>
                          <Flex align={'center'}>
                            <Text fw={500}>
                              {'521'} / {'750'} <span style={{ color: 'gray !important' }}>Sent</span>
                            </Text>
                            <IconPoint fill='gray' color='white' />
                            <Text color={'red'}>{1} day left</Text>
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'date',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconCalendar color='gray' size={'0.9rem'} />
                        <Text color='gray'>Last Send Date</Text>
                      </Flex>
                    ),
                    maxSize: 200,
                    enableResizing: true,
                    cell: (cell) => {
                      return (
                        <Flex direction={'column'} align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                          <Text color='gray' fw={500}>
                            {'Mar 7, 2024 8:43 PM'}
                          </Text>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
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
                      <Select
                        style={{ width: '150px' }}
                        data={[
                          { label: 'Show 25 rows', value: '25' },
                          { label: 'Show 10 rows', value: '10' },
                          { label: 'Show 5 rows', value: '5' },
                        ]}
                        value={acPageSize}
                        onChange={(v) => {
                          setAcPageSize(v ?? '25');
                        }}
                      />
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
                            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
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
                pageSizes={[acPageSize]}
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
            </Collapse>
            <Collapse in={activeCampaignOpen}>
              <DataGrid
                data={processedCampaigns.filter((c) => !c.status)}
                highlightOnHover
                withPagination
                withSorting
                withColumnBorders
                withBorder
                sx={{
                  cursor: 'pointer',
                  '& .mantine-10xyzsm>tbody>tr>td': {
                    padding: '0px',
                  },
                  '& tr': {
                    background: 'white',
                  },
                }}
                columns={[
                  {
                    accessorKey: 'Status',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLoader color='gray' size={'0.9rem'} />
                        <Text color='gray'>Status</Text>
                      </Flex>
                    ),
                    maxSize: 180,
                    cell: (cell) => {
                      const { status, percentage } = cell.row.original;

                      return (
                        <Flex gap={'xs'} w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                          <RingProgress
                            size={30}
                            thickness={4}
                            variant='animated'
                            sections={[
                              {
                                value: Math.floor(percentage),
                                color: Math.round(percentage) ? 'green' : 'blue',
                              },
                            ]}
                          />
                          <Text size='sm' align='center'>
                            {percentage}%
                          </Text>
                          <Badge color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'campaigns',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconTargetArrow color='gray' size={'0.9rem'} />
                        <Text color='gray'>Campaigns</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
                      const { campaign } = cell.row.original;

                      return (
                        <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                          <Text lineClamp={1}>{campaign}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'sent',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconSend color='#228be6' size={'0.9rem'} />
                        <Text color='gray'>Sent</Text>
                      </Flex>
                    ),
                    maxSize: 120,
                    enableResizing: true,
                    cell: (cell) => {
                      const { sent } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'} bg={'#f9fbfe'}>
                          <Text color='#228be6' fw={700}>
                            {sent}
                          </Text>
                          <Badge variant='light' color={theme.colors.blue[1]}>
                            {sent}%
                          </Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'open',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconChecks color='#db66f3' size={'0.9rem'} />
                        <Text color='gray'>Sent</Text>
                      </Flex>
                    ),
                    maxSize: 120,
                    enableResizing: true,
                    cell: (cell) => {
                      const { open } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} w={'100%'} py={'lg'} h={'100%'} bg={'#fdf9fe'}>
                          <Text color={'#db66f3'} fw={700}>
                            {open}
                          </Text>
                          <Badge variant='light' bg='rgba(219,102,243, 0.1)' style={{ color: '#db66f3' }}>
                            {open}%
                          </Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'reply',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconMessageCheck color='#f0ab78' size={'0.9rem'} />
                        <Text color='gray'>Reply</Text>
                      </Flex>
                    ),
                    maxSize: 120,
                    enableResizing: true,
                    cell: (cell) => {
                      const { reply } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'} bg={'#fffbf8'}>
                          <Text color={'#f0ab78'} fw={700}>
                            {reply}
                          </Text>
                          <Badge variant='light' bg='rgba(240, 171, 120, 0.1)' style={{ color: '#f0ab78' }}>
                            {reply}%
                          </Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'demo',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconCalendar color='#73d0a5' size={'0.9rem'} />
                        <Text color='gray'>Demo</Text>
                      </Flex>
                    ),
                    maxSize: 120,
                    enableResizing: true,
                    cell: (cell) => {
                      const { demo } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'} bg={'#f8fbf9'}>
                          <Text color={'#73d0a5'} fw={700}>
                            {demo}
                          </Text>
                          <Badge variant='light' bg='rbga(115, 208, 165, 0.1)' style={{ color: '#73d0a5' }}>
                            {demo}%
                          </Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'channel',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconToggleRight color='gray' size={'0.9rem'} />
                        <Text color='gray'>Channels</Text>
                      </Flex>
                    ),
                    maxSize: 130,
                    enableResizing: true,
                    cell: (cell) => {
                      const { linkedin, email } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                          <Flex direction={'column'} gap={'3px'} align={'center'}>
                            <IconBrandLinkedin size={'1.3rem'} fill='#228be6' color='white' />
                            <Switch defaultChecked={linkedin} readOnly />
                          </Flex>
                          <Flex direction={'column'} gap={'3px'} align={'center'}>
                            <IconMail size={'1.3rem'} fill='#228be6' color='white' />
                            <Switch defaultChecked={email} readOnly />
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'action',
                    header: '',
                    maxSize: 50,
                    enableSorting: false,
                    enableResizing: true,
                    cell: (cell) => {
                      const { sent } = cell.row.original;

                      return (
                        <Flex align={'center'} gap={'xs'} h={'100%'} w={'100%'} justify={'center'}>
                          <Button style={{ borderRadius: '100%', padding: '0px' }} w={'fit-content'} h={'fit-content'}>
                            <IconChevronDown />
                          </Button>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
                }}
                //   state={{
                //     columnFilters,
                //   }}
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
                      <Select
                        style={{ width: '150px' }}
                        data={[
                          { label: 'Show 25 rows', value: '25' },
                          { label: 'Show 10 rows', value: '10' },
                          { label: 'Show 5 rows', value: '5' },
                        ]}
                        value={acPageSize}
                        onChange={(v) => {
                          setAcPageSize(v ?? '25');
                        }}
                      />
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
                            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
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
                pageSizes={[acPageSize]}
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
            </Collapse>
          </Flex>
          <Flex direction={'column'} gap={'sm'}>
            <Flex align={'center'} gap={'5px'}>
              <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'} w={'320px'}>
                <IconInfoTriangle color='orange' />
                <span>Rep Action Needed</span>
                <Badge color='orange' variant='filled'>
                  {repNeedData.length}
                </Badge>
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={repToggle}>{repOpened ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <Collapse in={repOpened}>
              <DataGrid
                data={repNeedData}
                highlightOnHover
                withPagination
                withColumnBorders
                withSorting
                withBorder
                sx={{
                  cursor: 'pointer',
                  '& tr': {
                    background: 'white',
                  },
                }}
                columns={[
                  {
                    accessorKey: 'Status',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Status</Text>
                      </Flex>
                    ),
                    maxSize: 170,
                    cell: (cell) => {
                      return (
                        <Flex gap={'xs'} w={'100%'} h={'100%'} align={'center'}>
                          <Badge color={'orange'}>rep action needed</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'campaign',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Campaign</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
                      const { campaign } = cell.row.original;

                      return (
                        <Flex w={'100%'} h={'100%'} align={'center'}>
                          <Text lineClamp={1}>{campaign ? campaign : 'No Campaign'}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'sdr',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>SDR</Text>
                      </Flex>
                    ),
                    maxSize: 200,
                    enableResizing: true,
                    cell: (cell) => {
                      const { sdr } = cell.row.original;

                      return (
                        <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                          <Avatar src={''} radius={'xl'} />
                          <Text>{sdr}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'details',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Details</Text>
                      </Flex>
                    ),
                    maxSize: 300,
                    enableResizing: true,
                    cell: (cell) => {
                      const { sdr } = cell.row.original;

                      return (
                        <Flex align={'center'} gap={'4px'} py={'sm'} w={'100%'} h={'100%'}>
                          <Text fw={500}>{3}</Text>
                          <Text fw={500} color='gray'>
                            Open Tasks
                          </Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'action',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconToggleRight color='gray' size={'0.9rem'} />
                        <Text color='gray'>Action</Text>
                      </Flex>
                    ),
                    maxSize: 200,
                    enableResizing: true,
                    cell: () => {
                      return (
                        <Flex align={'center'} h={'100%'} justify={'center'}>
                          <Button rightIcon={<IconExternalLink size={'0.9rem'} />} style={{ borderRadius: '16px', height: '1.3rem' }} size='xs'>
                            View Task
                          </Button>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
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
                      <Select
                        style={{ width: '150px' }}
                        data={[
                          { label: 'Show 25 rows', value: '25' },
                          { label: 'Show 10 rows', value: '10' },
                          { label: 'Show 5 rows', value: '5' },
                        ]}
                        value={raPageSize}
                        onChange={(v) => {
                          setRaPageSize(v ?? '25');
                        }}
                      />

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
                            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
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
                pageSizes={[raPageSize]}
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
            </Collapse>
          </Flex>
          <Flex direction={'column'} gap={'sm'}>
            <Flex align={'center'} gap={'5px'}>
              <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'} w={'260px'}>
                <IconSparkles color='#d549f2' />
                <span>AI is Setting Up</span>
                <Badge sx={{ background: '#d549f2' }} variant='filled'>
                  {upladingData.length}
                </Badge>
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={aiToggle}>{aiOpened ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <DataGrid
              data={upladingData}
              highlightOnHover
              withPagination
              withSorting
              withColumnBorders
              withBorder
              sx={{
                cursor: 'pointer',
                '& tr': {
                  background: 'white',
                },
              }}
              columns={[
                {
                  accessorKey: 'Status',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Status</Text>
                    </Flex>
                  ),
                  maxSize: 210,
                  cell: (cell) => {
                    const { status } = cell.row.original;

                    return (
                      <Flex gap={'xs'} w={'100%'} h={'100%'} align={'center'}>
                        <Badge sx={{ color: '#d549f2', background: '#fbebfe' }}>ai is setting up</Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'campaign',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Campaign</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    const { campaign } = cell.row.original;

                    return (
                      <Flex w={'100%'} h={'100%'} align={'center'}>
                        <Text lineClamp={1}>{campaign}</Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'sdr',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>SDR</Text>
                    </Flex>
                  ),
                  maxSize: 250,
                  enableResizing: true,
                  cell: (cell) => {
                    const { sdr } = cell.row.original;

                    return (
                      <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                        <Avatar src={''} radius={'xl'} />
                        <Text>{sdr}</Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: 'detail',
                  header: () => (
                    <Flex align={'center'} gap={'3px'}>
                      <IconLetterT color='gray' size={'0.9rem'} />
                      <Text color='gray'>Details</Text>
                    </Flex>
                  ),
                  maxSize: 500,
                  enableResizing: true,
                  cell: (cell) => {
                    const { sdr } = cell.row.original;

                    return (
                      <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                        <Text fw={500} color='gray'>
                          Step {2} / {3}:
                        </Text>
                        <Text fw={500}>Writing Sequence</Text>
                      </Flex>
                    );
                  },
                },
              ]}
              options={{
                enableFilters: true,
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
                    <Select
                      style={{ width: '150px' }}
                      data={[
                        { label: 'Show 25 rows', value: '25' },
                        { label: 'Show 10 rows', value: '10' },
                        { label: 'Show 5 rows', value: '5' },
                      ]}
                      value={udPageSize}
                      onChange={(v) => {
                        setUdPageSize(v ?? '25');
                      }}
                    />

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
                          disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
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
              pageSizes={[udPageSize]}
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
          <Flex direction={'column'} gap={'sm'}>
            <Flex align={'center'} gap={'5px'}>
              <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'} w={'365px'}>
                <IconInfoHexagon color='red' />
                <span>No Campaign Found</span>
                <Badge color='red' variant='filled'>
                  {noCampaignData.length}
                </Badge>
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={noToggle}>{noOpened ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <Collapse in={noOpened}>
              <DataGrid
                data={noCampaignData}
                highlightOnHover
                withPagination
                withSorting
                withColumnBorders
                withBorder
                sx={{
                  cursor: 'pointer',
                  '& tr': {
                    background: 'white',
                  },
                }}
                columns={[
                  {
                    accessorKey: 'Status',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Status</Text>
                      </Flex>
                    ),
                    maxSize: 210,
                    cell: (cell) => {
                      const { status } = cell.row.original;

                      return (
                        <Flex gap={'xs'} w={'100%'} h={'100%'} align={'center'}>
                          <Badge color='red'>{status}</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'campaign',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Campaign</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
                      return (
                        <Flex w={'100%'} h={'100%'} align={'center'}>
                          <Text lineClamp={1}>{'No Campaign'}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'sdr',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>SDR</Text>
                      </Flex>
                    ),
                    maxSize: 200,
                    enableResizing: true,
                    cell: (cell) => {
                      return (
                        <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                          <Avatar src={''} radius={'xl'} size={'sm'} />
                          <Text>{'Mary S.'}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'action',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconToggleRight color='gray' size={'0.9rem'} />
                        <Text color='gray'>Action</Text>
                      </Flex>
                    ),
                    maxSize: 500,
                    enableResizing: true,
                    cell: (cell) => {
                      return (
                        <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                          <Flex w={'100%'} justify={'center'}>
                            <ActionIcon w={'fit-content'}>
                              <Badge
                                color='blue'
                                variant='filled'
                                w={'100%'}
                                sx={{ textTransform: 'none', cursor: 'pointer' }}
                                leftSection={<IconPlus size={'0.9rem'} style={{ marginTop: '4px' }} />}
                              >
                                Add Campaign for Adam
                              </Badge>
                            </ActionIcon>
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
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
                      <Select
                        style={{ width: '150px' }}
                        data={[
                          { label: 'Show 25 rows', value: '25' },
                          { label: 'Show 10 rows', value: '10' },
                          { label: 'Show 5 rows', value: '5' },
                        ]}
                        value={ncPageSize}
                        onChange={(v) => {
                          setNcPageSize(v ?? '25');
                        }}
                      />

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
                            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
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
                pageSizes={[ncPageSize]}
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
            </Collapse>
          </Flex>
          <Flex direction={'column'} gap={'sm'}>
            <Flex align={'center'} gap={'5px'}>
              <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'} w={'400px'}>
                <IconCircleCheck color='green' />
                <span>Completed Campaigns</span>
                <Badge color='green' variant='filled'>
                  {completedData.length}
                </Badge>
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={completeToggle}>{completeOpened ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <Collapse in={completeOpened}>
              <DataGrid
                data={completedData}
                highlightOnHover
                withPagination
                withSorting
                withColumnBorders
                withBorder
                sx={{
                  cursor: 'pointer',
                  '& tr': {
                    background: 'white',
                  },
                }}
                columns={[
                  {
                    accessorKey: 'Status',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Status</Text>
                      </Flex>
                    ),
                    maxSize: 170,
                    cell: (cell) => {
                      const { status } = cell.row.original;

                      return (
                        <Flex gap={'xs'} w={'100%'} h={'100%'} justify={'center'} align={'center'}>
                          <Badge color='green'>completed</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'campaign',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>Campaign</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
                      const { campaign } = cell.row.original;

                      return (
                        <Flex w={'100%'} h={'100%'} align={'center'}>
                          <Text lineClamp={1}>{campaign}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'sdr',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconLetterT color='gray' size={'0.9rem'} />
                        <Text color='gray'>SDR</Text>
                      </Flex>
                    ),
                    enableResizing: true,
                    maxSize: 200,
                    cell: (cell) => {
                      return (
                        <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                          <Avatar src={''} radius={'xl'} />
                          <Text fw={500}>{'Mary S.'}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'channel',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconToggleRight color='gray' size={'0.9rem'} />
                        <Text color='gray'>Channels</Text>
                      </Flex>
                    ),
                    maxSize: 130,
                    enableResizing: true,
                    cell: (cell) => {
                      const { linkedin, email } = cell.row.original;

                      return (
                        <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                          <Flex justify={'center'} w={'100%'} align={'center'} gap={'md'}>
                            {linkedin && <IconBrandLinkedin size={'1.3rem'} fill='#228be6' color='white' />}
                            {email && <IconMail size={'1.3rem'} fill='#228be6' color='white' />}
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'Progress',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconBolt color='gray' size={'0.9rem'} />
                        <Text color='gray'>Progress</Text>
                      </Flex>
                    ),
                    maxSize: 200,
                    enableResizing: true,
                    cell: (cell) => {
                      return (
                        <Flex direction={'column'} align={'start'} justify={'center'} w={'100%'} h={'100%'}>
                          <Flex w={'100%'} align={'center'} gap={'8px'} px={'xs'}>
                            <Progress value={100} w={'100%'} color='green' />
                            <Text color='green' fw={500}>
                              100%
                            </Text>
                          </Flex>
                          <Flex align={'start'} px={'xs'}>
                            <Text fw={500}>
                              {'521'} / {'521'} <span style={{ color: 'gray !important' }}>Sent</span>
                            </Text>
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'last_send_date',
                    header: () => (
                      <Flex align={'center'} gap={'3px'}>
                        <IconCalendar color='gray' size={'0.9rem'} />
                        <Text color='gray'>Last Send Date</Text>
                      </Flex>
                    ),
                    enableResizing: true,
                    maxSize: 250,
                    cell: (cell) => {
                      const { last_send_date } = cell.row.original;

                      return (
                        <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                          <Text color='gray' fw={500}>
                            {last_send_date}
                          </Text>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
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
                      <Select
                        style={{ width: '150px' }}
                        data={[
                          { label: 'Show 25 rows', value: '25' },
                          { label: 'Show 10 rows', value: '10' },
                          { label: 'Show 5 rows', value: '5' },
                        ]}
                        value={cdPageSize}
                        onChange={(v) => {
                          setCdPageSize(v ?? '25');
                        }}
                      />

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
                            disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
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
                pageSizes={[cdPageSize]}
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
            </Collapse>
          </Flex>
        </Flex>
      </div>
    </Card>
  );
}
