import { Badge, Box, Button, Card, Divider, Flex, Paper, SimpleGrid, Text } from '@mantine/core';
import { IconCircle, IconInfoCircle } from '@tabler/icons';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';

export default function PipelineDash() {
  const [currentMode, setCurrentMode] = useState('Campaign Name');
  const data = [
    {
      date: '01/05',
      open: 250,
      sent: 450,
    },
    {
      date: '02/05',
      open: 350,
      sent: 550,
    },
    {
      date: '03/05',
      open: 200,
      sent: 220,
    },
    {
      date: '04/05',
      open: 240,
      sent: 500,
    },
    {
      date: '05/05',
      open: 250,
      sent: 450,
    },
    {
      date: '06/05',
      open: 350,
      sent: 550,
    },
    {
      date: '07/05',
      open: 577,
      sent: 574,
    },
    {
      date: '08/05',
      open: 495,
      sent: 103,
    },
    {
      date: '09/05',
      open: 457,
      sent: 220,
    },
    {
      date: '10/05',
      open: 350,
      sent: 321,
    },
    {
      date: '11/05',
      open: 436,
      sent: 772,
    },
    {
      date: '12/05',
      open: 452,
      sent: 855,
    },
  ];
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: 'Open',
        data: data.map((item) => item.open),
        backgroundColor: '#228BE6',
        stack: 'Stack 0',
      },
      {
        label: 'Sent',
        data: data.map((item) => item.sent),
        backgroundColor: '#EAECF0',
        stack: 'Stack 0',
      },
    ],
  };
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
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
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 10,
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      bar: {
        backgroundColor: '#0287f7',
      },
    },
  };
  return (
    <Paper p={'lg'}>
      <Flex direction={'column'} gap={'lg'}>
        <Box>
          <Text fw={600} size={24}>
            Pipeline
          </Text>
          <Text fw={400} color='gray'>
            A snapshot of your pipeline and activity for the quarter.
          </Text>
        </Box>
        <Divider />
        <SimpleGrid cols={2}>
          <Card padding='lg' radius='md' withBorder w={'100%'}>
            <Flex align={'center'} justify={'space-between'}>
              <Flex align={'center'} gap={'sm'}>
                <IconCircle size={'0.8rem'} fill='#228be6' color='white' style={{ marginBottom: '2px' }} />
                <Text size={'sm'} color='gray' fw={500}>
                  Opportunities Created
                </Text>
              </Flex>
              <Badge
                tt={'initial'}
                variant='filled'
                leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '5px' }} />}
                style={{ cursor: 'pointer' }}
              >
                View Details
              </Badge>
            </Flex>
            <Flex align={'end'} gap={'xs'}>
              <Text size={26} fw={600}>
                {5}
              </Text>
              <Text fw={500} color='gray' mb={5}>
                opportunities
              </Text>
            </Flex>
            <Flex align={'center'} gap={'xs'}>
              <IconInfoCircle color='gray' size={'0.9rem'} style={{ marginBottom: '3px' }} />
              <Text color='gray' size={'xs'} fw={500}>
                {'#'} of prospects with connect opportunites in your CRM
              </Text>
            </Flex>
          </Card>
          <Card padding='lg' radius='md' withBorder w={'100%'}>
            <Flex align={'center'} justify={'space-between'}>
              <Flex align={'center'} gap={'sm'}>
                <IconCircle size={'0.8rem'} fill='#F79009' color='white' style={{ marginBottom: '2px' }} />
                <Text size={'sm'} color='gray' fw={500}>
                  Pipeline Generated
                </Text>
              </Flex>
              <Badge
                tt={'initial'}
                variant='filled'
                leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '5px' }} />}
                style={{ cursor: 'pointer' }}
              >
                View Details
              </Badge>
            </Flex>
            <Flex align={'end'} gap={'xs'}>
              <Text size={26} fw={600}>
                $ {1048}
              </Text>
              <Text fw={500} color='gray' mb={5}>
                generated
              </Text>
            </Flex>
            <Flex align={'center'} gap={'xs'}>
              <IconInfoCircle color='gray' size={'0.9rem'} style={{ marginBottom: '3px' }} />
              <Text color='gray' size={'xs'} fw={500}>
                Sum of the ${} of pipeline generated by SellScale
              </Text>
            </Flex>
          </Card>
          <Card padding='lg' radius='md' withBorder w={'100%'}>
            <Flex align={'center'} justify={'space-between'}>
              <Flex align={'center'} gap={'sm'}>
                <IconCircle size={'0.8rem'} fill='#D444F1' color='white' style={{ marginBottom: '2px' }} />
                <Text size={'sm'} color='gray' fw={500}>
                  New Contacts Created
                </Text>
              </Flex>
              <Badge
                tt={'initial'}
                variant='filled'
                leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '5px' }} />}
                style={{ cursor: 'pointer' }}
              >
                View Details
              </Badge>
            </Flex>
            <Flex align={'end'} gap={'xs'}>
              <Text size={26} fw={600}>
                {4429}
              </Text>
              <Text fw={500} color='gray' mb={2}>
                new leads
              </Text>
            </Flex>
            <Flex align={'center'} gap={'xs'}>
              <IconInfoCircle color='gray' size={'0.9rem'} style={{ marginBottom: '3px' }} />
              <Text color='gray' size={'xs'} fw={500}>
                {'#'} of new leads prospected by SellScale
              </Text>
            </Flex>
          </Card>
          <Card padding='lg' radius='md' withBorder w={'100%'}>
            <Flex align={'center'} justify={'space-between'}>
              <Flex align={'center'} gap={'sm'}>
                <IconCircle size={'0.8rem'} fill='#17B26A' color='white' style={{ marginBottom: '2px' }} />
                <Text size={'sm'} color='gray' fw={500}>
                  Activities this Quarter
                </Text>
              </Flex>
              <Badge
                tt={'initial'}
                variant='filled'
                leftSection={<IconInfoCircle size={'0.9rem'} style={{ marginTop: '5px' }} />}
                style={{ cursor: 'pointer' }}
              >
                View Details
              </Badge>
            </Flex>
            <Flex align={'end'} gap={'xs'}>
              <Text size={26} fw={600}>
                {1747}
              </Text>
              <Text fw={500} color='gray' mb={2}>
                activities
              </Text>
            </Flex>
            <Flex align={'center'} gap={'xs'}>
              <IconInfoCircle color='gray' size={'0.9rem'} style={{ marginBottom: '3px' }} />
              <Text color='gray' size={'xs'} fw={500}>
                {'#'} of activities logged in SellScale
              </Text>
            </Flex>
          </Card>
        </SimpleGrid>
        <Card padding='lg' radius='md' withBorder w={'100%'}>
          <Flex align={'center'} justify={'space-between'} w={'100%'}>
            <Text tt={'uppercase'} fw={500} color='gray' size={'xl'}>
              activities
            </Text>
            <Flex align={'center'} gap={'sm'}>
              <Text color='gray' fw={500} size={'sm'}>
                Filter by:
              </Text>
              {['Campaign Name', 'Account', 'Date', 'Time Period'].map((mode) => (
                <Button onClick={() => setCurrentMode(mode)} variant='outline' size='xs' radius='xl' color={currentMode === mode ? '' : 'gray'}>
                  {mode}
                </Button>
              ))}
            </Flex>
          </Flex>
          <Box py={'xl'} h={340} w={'100%'}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </Card>
      </Flex>
    </Paper>
  );
}
