import { Paper, Text, Group, Box, Grid, Flex, Badge, useMantineTheme, Tooltip, Progress, Button, RingProgress, ActionIcon } from '@mantine/core';

import {
  IconArrowUp,
  IconBrandSuperhuman,
  IconBriefcase,
  IconChevronsUp,
  IconFingerprint,
  IconInfoCircle,
  IconPackages,
  IconPoint,
  IconSelect,
  IconSettings,
} from '@tabler/icons';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Legend, DoughnutController, ArcElement, Chart } from 'chart.js';

import { userDataState, userTokenState } from '@atoms/userAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useSearchParams } from 'react-router-dom';
import { getUsageConnectResponse } from '@utils/requests/usageConnect';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { showNotification } from '@mantine/notifications';

Chart.register(ArcElement);

interface ProspectinType {
  prospect_created: number;
  ai_replies: number;
  monthly_touchpoints_used: number;
  prospect_enriched: number;
  prospects_removed: number;
  prospects_snoozed: number;
  total_outreach_sent: number;
}

interface Data {
  date: string;
  value: number;
}

export default function SettingUsage() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [prospectingData, setProspectingData] = useState<ProspectinType>({
    prospect_created: 0,
    ai_replies: 0,
    monthly_touchpoints_used: 0,
    prospect_enriched: 0,
    prospects_removed: 0,
    prospects_snoozed: 0,
    total_outreach_sent: 0,
  });
  const [createProspect, setCreatedProspect] = useState<any>({});
  const [enrichedProspect, setEnrichedProspect] = useState<any>({});
  const [followSentProspect, setFollowSentProspect] = useState<any>({});
  const [nurtureProspect, setNurtureProspect] = useState<any>({});
  const [removedProspect, setRemovedProspect] = useState<any>({});
  const [repliesProspect, setRepliesProspect] = useState<any>({});
  const [touchsentProspect, setTouchsentProspect] = useState<any>({});
  const [chartData, setChartData] = useState<any>([]);

  // const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const update = async () => {
    await getUsageConnectResponse(userToken)
      .then((res) => {
        setProspectingData(res.data?.prospecting);
        setCreatedProspect(res.data?.create_prospect);
        setEnrichedProspect(res.data?.enriched_prospect);
        setFollowSentProspect(res.data?.follow_up_sent_prospect);
        setNurtureProspect(res.data?.nurture_prospect);
        setRemovedProspect(res.data?.removed_prospect);
        setRepliesProspect(res.data?.replies_prospect);
        setTouchsentProspect(res.data?.touch_sent_prospect);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const labelsFromDataDates = (data: Data[]) => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.map(({ date }) => moment(date, 'YYYY-MM').format('MMM'))
  }

  const transformData = (data: Data[]) => {
    if (!data || data.length === 0) {
      return []
    }

    return data.map(({ value }) => value)
  };


  useEffect(() => {
    update();
  }, []);
  const createdData: any = {
    labels: labelsFromDataDates(createProspect?.data),
    datasets: [
      {
        data: transformData(createProspect?.data),
        fill: false,
        borderColor: createProspect?.color,
        tension: 0.3,
      },
    ],
  };
  const touchData: any = {
    labels: labelsFromDataDates(touchsentProspect?.data),
    datasets: [
      {
        data: transformData(touchsentProspect?.data),
        fill: false,
        borderColor: touchsentProspect?.color,
        tension: 0.3,
      },
    ],
  };
  const enrichData: any = {
    labels: labelsFromDataDates(enrichedProspect?.data),
    datasets: [
      {
        data: transformData(enrichedProspect?.data),
        fill: false,
        borderColor: enrichedProspect?.color,
        tension: 0.3,
        backgroundColor: ['#0287f7'],
      },
    ],
  };
  const followUpsSent: any = {
    labels: labelsFromDataDates(followSentProspect?.data),
    datasets: [
      {
        data: transformData(followSentProspect?.data),
        fill: false,
        borderColor: followSentProspect?.color,
        tension: 0.3,
        backgroundColor: ['#0287f7'],
      },
    ],
  };
  const replyData: any = {
    labels: labelsFromDataDates(repliesProspect?.data),
    datasets: [
      {
        data: transformData(repliesProspect?.data),
        fill: false,
        borderColor: repliesProspect?.color,
        tension: 0.3,
        backgroundColor: ['#0287f7'],
      },
    ],
  };
  const removedData: any = {
    labels: labelsFromDataDates(removedProspect?.data),
    datasets: [
      {
        data: transformData(removedProspect?.data),
        fill: false,
        borderColor: removedProspect?.color,
        tension: 0.3,
        backgroundColor: ['#0287f7'],
      },
    ],
  };
  const nurtureData: any = {
    labels: labelsFromDataDates(nurtureProspect?.data),
    datasets: [
      {
        data: transformData(nurtureProspect?.data),
        fill: false,
        borderColor: nurtureProspect?.color,
        tension: 0.3,
      },
    ],
  };
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        border: { dash: [4, 4] },
        beginAtZero: true,
        ticks: {
          stepSize: 250,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      bar: {
        backgroundColor: '#0287f7',
      },
    },
  };
  const data = {
    labels: ['Label 1', 'Label 2'],
    datasets: [
      {
        data: [
          Math.min(100, Math.floor(((prospectingData?.monthly_touchpoints_used || 1) / 2000) * 100)),
          100 - Math.min(100, Math.floor(((prospectingData?.monthly_touchpoints_used || 1) / 2000) * 100)),
        ],
        backgroundColor: ['#fa5352', '#eaecf0'],
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };
  const piechartOptions = {
    rotation: 270,
    circumference: 180,
    cutout: `80%`,
    plugins: {
      legend: {
        display: false,
      },
      doughnutCutout: false,
    },
  };

  return (
    <Paper withBorder m='xs' p='md' radius='md'>
      <Box>
        <Grid>
          <Grid.Col span={9}>
            <Flex direction={'column'} w={'100%'} gap={'xl'}>
              <Group grow>
                <Box py={20} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
                  <Flex justify={'space-between'} w={'100%'} align={'center'}>
                    <Text color='gray' size={12} fw={600}>
                      Prospects Created
                    </Text>
                    <Tooltip label='Total prospects added on SellScale.' withinPortal>
                      <ActionIcon>
                        <IconInfoCircle size={14} color='gray' />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Text fw={600} size={20} style={{ display: 'flex', alignItems: 'center' }} mt={5}>
                    {prospectingData?.prospect_created?.toLocaleString()}{' '}
                    <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                      100%
                    </Badge>
                  </Text>
                </Box>
                <Box py={20} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
                  <Flex justify={'space-between'} w={'100%'} align={'center'}>
                    <Text color='gray' size={12} fw={600}>
                      # Prospects Enriched
                    </Text>
                    <Tooltip label='Enrichment includes account research, finding contact details (e.g., emails), and keeping this info up to date.' withinPortal>
                      <ActionIcon>
                        <IconInfoCircle size={14} color='gray' />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Text fw={600} size={20} style={{ display: 'flex', alignItems: 'center' }} mt={5}>
                    {prospectingData?.prospect_enriched.toLocaleString()}{' '}
                    <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                      {Math.min(100, Math.floor((prospectingData?.prospect_enriched / prospectingData?.prospect_created + 0.0001) * 100))}%
                    </Badge>
                  </Text>
                </Box>
                <Box py={20} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
                  <Flex justify={'space-between'} w={'100%'} align={'center'}>
                    <Text color='gray' size={12} fw={600}>
                      Total Outreach Sent
                    </Text>
                    <Tooltip label='SellScale sends through LinkedIn or email.' withinPortal>
                      <ActionIcon>
                        <IconInfoCircle size={14} color='gray' />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Text fw={600} size={20} style={{ display: 'flex', alignItems: 'center' }} mt={5}>
                    {prospectingData?.total_outreach_sent.toLocaleString()}{' '}
                    <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                      {Math.min(100, Math.floor((prospectingData?.total_outreach_sent / prospectingData?.prospect_created + 0.0001) * 100))}%
                    </Badge>
                  </Text>
                </Box>
              </Group>
              <Group grow>
                <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
                  <Flex justify={'space-between'} w={'100%'} align={'center'}>
                    <Text color='gray' size={12} fw={600}>
                      AI Replies
                    </Text>
                    <Tooltip label='Replies conducted through the SellScale platform by our AI.' withinPortal>
                      <ActionIcon>
                        <IconInfoCircle size={14} color='gray' />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Text fw={600} size={20} style={{ display: 'flex', alignItems: 'center' }} mt={5}>
                    {prospectingData?.ai_replies.toLocaleString()}{' '}
                    <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                      {Math.min(100, Math.floor((prospectingData?.ai_replies / prospectingData?.total_outreach_sent + 0.0001) * 100))}%
                    </Badge>
                  </Text>
                </Box>
                <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
                  <Flex justify={'space-between'} w={'100%'} align={'center'}>
                    <Text color='gray' size={12} fw={600}>
                      Prospects Snoozed
                    </Text>
                    <Tooltip label='Prospects the AI will engage, but we’re waiting until the next sequence step for.' withinPortal>
                      <ActionIcon>
                        <IconInfoCircle size={14} color='gray' />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Text fw={600} size={20} style={{ display: 'flex', alignItems: 'center' }} mt={5}>
                    {prospectingData?.prospects_snoozed.toLocaleString()}{' '}
                    <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                      {Math.min(100, Math.floor((prospectingData?.prospects_snoozed / prospectingData?.total_outreach_sent + 0.0001) * 100))}%
                    </Badge>
                  </Text>
                </Box>
                <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
                  <Flex justify={'space-between'} w={'100%'} align={'center'}>
                    <Text color='gray' size={12} fw={600}>
                      Prospects removed
                    </Text>
                    <Tooltip label='Prospects who were marked as not interested or not qualified. ' withinPortal>
                      <ActionIcon>
                        <IconInfoCircle size={14} color='gray' />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                  <Text fw={600} size={20} style={{ display: 'flex', alignItems: 'center' }} mt={5}>
                    {prospectingData?.prospects_removed.toLocaleString()}{' '}
                    <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                      {Math.min(100, Math.floor((prospectingData?.prospects_removed / prospectingData?.total_outreach_sent + 0.0001) * 100))}%
                    </Badge>
                  </Text>
                </Box>
              </Group>
            </Flex>
          </Grid.Col>
          <Grid.Col span={3}>
            <Box
              py={20}
              px={20}
              style={{
                border: '2px solid #f6f4f7',
                borderRadius: '6px',
                height: '100%',
              }}
            >
              <Flex direction={'column'} justify={'space-between'} align={'center'} gap={'sm'} h={'100%'}>
                <div className='w-[140px] m-[-30px] relative'>
                  <Doughnut data={data} options={piechartOptions} />
                  <Flex
                    style={{
                      position: 'absolute',
                      top: '65px',
                      width: '100%',
                      alignItems: 'center',
                    }}
                    direction={'column'}
                  >
                    <Text fw={600}>{Math.min(100, Math.floor(((prospectingData?.monthly_touchpoints_used || 1) / 2000) * 100))}%</Text>{' '}
                    <Text size={12} fw={600}>
                      Limit Utilized
                    </Text>
                  </Flex>
                </div>
                <Text size={12} fw={600} color='gray' align='center'>
                  You have used <span style={{ color: '#54a4f9' }}>{prospectingData?.monthly_touchpoints_used.toLocaleString()}</span> out of{' '}
                  <span style={{ fontWeight: '700', color: 'black' }}>2000</span> monthly first touches.
                </Text>
                <Button
                  w={'100%'}
                  leftIcon={<IconChevronsUp size={16} />}
                  onClick={() => {
                    showNotification({
                      title: 'Increase Limit',
                      message: 'This feature is coming soon!',
                      color: 'red',
                      icon: <IconChevronsUp size={24} />,
                    });
                  }}
                >
                  Increase Limit
                </Button>
              </Flex>
            </Box>
          </Grid.Col>
          <Grid.Col>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  # Prospects Created:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.prospect_created}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.prospect_created / prospectingData?.prospect_created + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'sm'}>
                <Bar data={createdData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  Prospects Enriched:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.prospect_enriched}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.prospect_enriched / prospectingData?.prospect_created + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'sm'}>
                <Bar data={enrichData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  # First Touches Sent:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.total_outreach_sent}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.total_outreach_sent / prospectingData?.prospect_created + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'lg'}>
                <Bar data={touchData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  # Outreach Sent:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.total_outreach_sent}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.total_outreach_sent / prospectingData?.prospect_created + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'sm'}>
                <Bar data={followUpsSent} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  AI Replies:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.ai_replies}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.ai_replies / prospectingData?.total_outreach_sent + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'sm'}>
                <Bar data={followUpsSent} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  # Prospects Snoozed:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.prospects_snoozed}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.prospects_snoozed / prospectingData?.ai_replies + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'sm'}>
                <Bar data={nurtureData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box py={30} px={20} style={{ border: '2px solid #f6f4f7', borderRadius: '6px' }}>
              <Flex align={'center'} gap={'sm'}>
                <Text color='gray' fw={600}>
                  # Prospects Removed:{' '}
                </Text>
                <Text fw={600} style={{ display: 'flex', alignItems: 'center' }}>
                  {prospectingData?.prospects_removed}{' '}
                  <Badge color='green' ml={10} leftSection={<IconArrowUp size={10} stroke={3} />}>
                    {Math.min(100, Math.floor((prospectingData?.prospects_removed / prospectingData?.ai_replies + 0.0001) * 100))}%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={'sm'}>
                <Bar data={removedData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    </Paper>
  );
}
