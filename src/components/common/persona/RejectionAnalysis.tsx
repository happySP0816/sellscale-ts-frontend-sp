import { useState } from 'react';
import { Avatar, Badge, Box, Button, Container, Flex, RingProgress, Select, Stack, Table, Text, TextInput, rem } from '@mantine/core';
import { IconArrowUp, IconChevronLeft, IconChevronRight, IconExternalLink, IconSearch, IconSelector } from '@tabler/icons';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, DoughnutController, ArcElement, Chart } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const RejectionAnalysis = () => {
  const [page, setPage] = useState(1);
  const [row, setRow] = useState([
    {
      contactName: 'Hristina Bell',
      contact_content: `"We already have a solution"`,
      company: 'Apple',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Using a Competitor`,
      campaignImage: '',
      color: 'orange',
    },
    {
      contactName: 'Adam Maheen',
      contact_content: `"I am not capable of making this decision i..."`,
      company: 'Microsoft',
      avatar: '',
      campaign: 'DevOps Engineers',
      reason: `Not a decision maker`,
      campaignImage: '',
      color: 'red',
    },
    {
      contactName: 'Hamza Sharif',
      contact_content: `"We provide the same services"`,
      company: 'Google',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Competitor`,
      campaignImage: '',
      color: 'red',
    },
    {
      contactName: 'Hristina Bell',
      contact_content: `"I'm looking for opportunities so I might not..."`,
      company: 'Amazon',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Contact is "open to work"`,
      campaignImage: '',
      color: 'red',
    },
    {
      contactName: 'Adam Maheen',
      contact_content: `"Not interested right now, maybe later!"`,
      company: 'Netflix',
      avatar: '',
      campaign: 'Co-founders & CEOs',
      reason: `Timing not right`,
      campaignImage: '',
      color: 'orange',
    },
    {
      contactName: 'Hamza Sharif',
      contact_content: `"I'll get back to you when we have enough f..."`,
      company: 'Meta',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Others`,
      campaignImage: '',
      color: 'orange',
    },
    {
      contactName: 'Hristina Bell',
      contact_content: `"We already have a solution"`,
      company: 'IBM',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Using a Competitor`,
      campaignImage: '',
      color: 'orange',
    },
    {
      contactName: 'Adam Maheen',
      contact_content: `"I am not capable of making this decision i..."`,
      company: 'Intel',
      avatar: '',
      campaign: 'DevOps Engineers',
      reason: `Not a decision maker`,
      campaignImage: '',
      color: 'red',
    },
    {
      contactName: 'Hamza Sharif',
      contact_content: `"We provide the same services"`,
      company: 'Dell',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Competitor`,
      campaignImage: '',
      color: 'red',
    },
    {
      contactName: 'Hristina Bell',
      contact_content: `"I'm looking for opportunities so I might not..."`,
      company: 'Sony',
      avatar: '',
      campaign: 'Heads of IT for Startups',
      reason: `Contact is "open to work"`,
      campaignImage: '',
      color: 'red',
    },
  ]);
  const rows = row.map((element, idx) => (
    <tr key={idx} className='bg-white'>
      <td
        style={{
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Flex align={'center'} gap={'sm'}>
          <Avatar src={element.avatar} size={40} radius={'xl'} />
          <Box>
            <Flex align={'center'} gap={3}>
              <Text color='gray.8' fw={600} size={'md'}>
                {element.contactName}
              </Text>
              <IconExternalLink size={18} color='#478cef' />
            </Flex>
            <Text color='gray'>{element.contact_content}</Text>
          </Box>
        </Flex>
      </td>
      <td
        style={{
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color='gray.8' fw={600}>
          {element.company}
        </Text>
      </td>
      <td
        style={{
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Flex align={'center'} gap={'sm'}>
          <Avatar src={element.campaignImage} radius={'xl'} />
          <Text fw={600}>{element.campaign}</Text>
          <IconExternalLink size={18} color='#478cef' />
        </Flex>
      </td>
      <td>
        <Badge color={element.color} size='md'>
          {element.reason}
        </Badge>
      </td>
    </tr>
  ));
  const DisqualifiedData = [
    { category: 'Not a decision maker', value: 30 },
    { category: 'Poor account fit', value: 70 },
    { category: 'Contact is "open to work"', value: 50 },
    { category: 'Competitor', value: 50 },
    { category: 'Others', value: 50 },
  ];
  const NotInterstedData = [
    { category: 'Unconvinced', value: 30 },
    { category: 'Timing not right', value: 70 },
    { category: 'Unreponsive', value: 50 },
    { category: 'Using a competitor', value: 50 },
    { category: 'Others', value: 50 },
  ];
  const chartDisqualifiedData = {
    labels: DisqualifiedData.map((item) => item.category),
    datasets: [
      {
        data: DisqualifiedData.map((item) => item.value),
        backgroundColor: ['#F24337', '#F97166', '#FDA29B', '#FECDCA', '#FFE3E2'],
      },
    ],
  };
  const chartNotInterstedData = {
    labels: NotInterstedData.map((item) => item.category),
    datasets: [
      {
        data: NotInterstedData.map((item) => item.value),
        backgroundColor: ['#F79105', '#FDB022', '#FFC84A', '#FEDE87', '#FFEFC7'],
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right' as 'right',
        labels: {
          usePointStyle: true,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };
  return (
    <Container size='97%' my={'lg'}>
      <Flex gap={'md'}>
        <Box style={{ border: '2px solid #DBDBDB', borderRadius: '10px' }} w={'100%'} p={'xl'}>
          <Flex align={'center'} gap={'sm'}>
            <Text color='gray' fw={500}>
              # Contacts Disqualified:{' '}
            </Text>
            <Text fw={600}>{256}</Text>
            <Badge color='green' leftSection={<IconArrowUp size={10} stroke={3} />}>
              8.5%
            </Badge>
          </Flex>
          <Flex mt={'sm'}>
            <Pie data={chartDisqualifiedData} options={options} />
          </Flex>
        </Box>
        <Box style={{ border: '2px solid #DBDBDB', borderRadius: '10px' }} w={'100%'} p={'xl'}>
          <Flex align={'center'} gap={'sm'}>
            <Text color='gray' fw={500}>
              # Contacts Not Interested:{' '}
            </Text>
            <Text fw={600}>{127}</Text>
            <Badge color='green' leftSection={<IconArrowUp size={10} stroke={3} />}>
              8.5%
            </Badge>
          </Flex>
          <Flex mt={'sm'}>
            <Pie data={chartNotInterstedData} options={options} />
          </Flex>
        </Box>
      </Flex>
      <Flex justify={'space-between'} mt={'xl'} align={'center'}>
        <Text size={20} fw={600}>
          Rejection Report
        </Text>
        <TextInput rightSection={<IconSearch size={16} color='gray' />} placeholder='Search' />
      </Flex>
      <Box mt={'md'}>
        <Stack style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: '1px solid #dee2e6' }}>
          <Table>
            <thead>
              <tr
                style={{
                  background: '#f9f9fd',
                }}
              >
                <th
                  style={{
                    textAlign: 'left',
                    paddingTop: rem(15),
                    paddingBottom: rem(15),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Text fw={700}>Contact Name</Text>
                  <IconSelector size={16} />
                </th>
                <th>
                  <Text fw={700}>Company</Text>
                </th>
                <th>
                  <Text fw={700}>Campaign</Text>
                </th>
                <th>
                  <Text fw={700}>Reason</Text>
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Stack>
        <Flex
          w={'100%'}
          bg={'white'}
          justify={'space-between'}
          p={20}
          style={{
            border: '1px solid #dee2e6',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
          }}
        >
          <Flex align={'center'} gap={'sm'}>
            <Text color='gray' fw={500}>
              Show
            </Text>
            <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />
            <Text color='gray' fw={500}>
              of 126
            </Text>
          </Flex>
          <Flex>
            <Select
              style={{
                width: '80px',
              }}
              data={['01', '02', '03', '04', '05', '06', '071']}
              defaultValue='01'
              radius={0}
            />
            <Text
              style={{
                display: 'flex',
                justifyContent: 'center',

                border: '1px solid #ced4da',
                alignItems: 'center',
              }}
              color='gray'
              size={'sm'}
              px={10}
              fw={500}
            >
              of {page} pages
            </Text>
            <Button variant='default' px={5} radius={0}>
              <IconChevronLeft color='gray' />
            </Button>
            <Button variant='default' px={5} radius={0}>
              <IconChevronRight color='gray' />
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

export default RejectionAnalysis;
