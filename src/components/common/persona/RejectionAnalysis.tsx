import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  RingProgress,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  rem,
  Title,
  useMantineTheme,
  ActionIcon,
  Loader,
  Center,
  Image,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  IconArrowUp,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconSearch,
  IconSelector,
  IconX,
} from '@tabler/icons';
import { Pie, getDatasetAtEvent, getElementAtEvent } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
  Chart,
} from 'chart.js';
import { Bar, getElementsAtEvent } from 'react-chartjs-2';
import { getRejectionAnalysisData } from '@utils/requests/getRejectionAnalysisData';
import { getRejectionReportData } from '@utils/requests/getRejectionReportData';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import NoDataImg from '@assets/images/rejection-404.png';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface Data {
  contactName: string;
  contactContent: string;
  company: string;
  avatar: string;
  campaign: string;
  reason: string;
  campaignImage: string;
  color: string;
  category: string;
  campaignID: string;
  linkedinURL: string;
}

interface ChartDataItem {
  category: string;
  value: number;
}

const RejectionAnalysis = () => {
  const userToken = useRecoilValue(userTokenState);
  const [page, setPage] = useState(1);
  const disqualifiedDataChartRef = useRef(null);
  const notInterestedDataChartRef = useRef(null);
  const theme = useMantineTheme();
  const [filterContact, setFilterContact] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [disqualifiedData, setDisqualifiedData] = useState<ChartDataItem[]>([]);
  const [notInterestedData, setNotInterestedData] = useState<ChartDataItem[]>([]);
  const [rejectionReportData, setRejectionReportData] = useState<Data[]>([]);
  const totalDisqualified = useMemo(() => {
    return disqualifiedData.reduce((total, item) => total + item.value, 0);
  }, [disqualifiedData]);
  const totalNotInterested = useMemo(() => {
    return notInterestedData.reduce((total, item) => total + item.value, 0);
  }, [notInterestedData]);
  const totalRejectionData = useMemo(() => {
    return rejectionReportData.reduce((total, item) => total + 1, 0);
  }, [rejectionReportData]);

  const rows = useMemo(() => {
    return rejectionReportData
      .filter((d) => {
        return (
          (!filterContact || d.category === filterContact) &&
          (!searchQuery ||
            d.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.reason.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .map((element, idx) => (
        <tr key={idx} className='bg-white'>
          <td
            style={{
              paddingTop: rem(16),
              paddingBottom: rem(16),
            }}
          >
            <Flex align={'center'}>
              <Text color='gray.8' fw={600}>
                {element.company}
              </Text>
            </Flex>
          </td>
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
                  <a
                    href={`https://${element.linkedinURL}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <IconExternalLink size={18} color='#478cef' />
                  </a>
                </Flex>
                <Text color='gray'>{element.contactContent}</Text>
              </Box>
            </Flex>
          </td>

          <td
            style={{
              paddingTop: rem(16),
              paddingBottom: rem(16),
            }}
          >
            <Flex align={'center'} gap={'sm'}>
              <Text fw={600}>{element.campaignImage}</Text>
              <Flex align={'center'} gap={3}>
                <Text fw={600}>{element.campaign}</Text>
                <a
                  href={`/setup/linkedin/${element.campaignID}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <IconExternalLink size={18} color='#478cef' />
                </a>
              </Flex>
            </Flex>
          </td>
          <td>
            <Badge color={element.color} size='md'>
              {element.reason}
            </Badge>
          </td>
        </tr>
      ));
  }, [filterContact, rejectionReportData, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const [disqualifiedResponse, notInterestedResponse, rejectionReportResponse] =
          await Promise.all([
            getRejectionAnalysisData(userToken, 'NOT_QUALIFIED'),
            getRejectionAnalysisData(userToken, 'NOT_INTERESTED'),
            getRejectionReportData(userToken),
          ]);
        const transformedData = rejectionReportResponse.data.map((item: any) => ({
          contactName: item['Full Name'],
          contactContent: item['Title'],
          company: item.Company,
          avatar: item['Prospect Img'],
          campaign: item.Campaign,
          reason: item['Disqualification Reason'],
          campaignImage: item.Emoji,
          color: 'orange',
          category: item['Disqualification Reason'].includes('OTHER')
            ? 'Other'
            : item['Disqualification Reason'],
          campaignID: item['Campaign ID'],
          linkedinURL: item['Linkedin URL'],
        }));
        console.log(transformedData);
        setDisqualifiedData(disqualifiedResponse.data);
        setNotInterestedData(notInterestedResponse.data);
        setRejectionReportData(transformedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        showNotification({
          title: 'Error',
          message: 'Error fetching chart data',
          color: 'red',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userToken) {
      fetchChartData();
    }
  }, [userToken]);

  const chartDisqualifiedData = {
    labels: disqualifiedData.map((item) => item.category),
    datasets: [
      {
        data: disqualifiedData.map((item) => item.value),
        backgroundColor: [
          theme.colors.orange[6],
          theme.colors.blue[6],
          theme.colors.violet[6],
          theme.colors.yellow[6],
          theme.colors.gray[6],
        ],
      },
    ],
  };
  const chartNotInterestedData = {
    labels: notInterestedData.map((item) => item.category),
    datasets: [
      {
        data: notInterestedData.map((item) => item.value),
        backgroundColor: [
          theme.colors.orange[6],
          theme.colors.green[6],
          theme.colors.blue[6],
          theme.colors.red[6],
          theme.colors.gray[6],
        ],
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

  if (isLoading) {
    return (
      <Center>
        <Loader size='xl' />
      </Center>
    );
  }

  if (chartDisqualifiedData.labels.length === 0) {
    return (
      <Container size='97%' my={'lg'}>
        <Title order={3} mt={0} mb='xs'>
          Rejection Analysis
        </Title>
        <Flex gap={'md'}>
          <Container>
            <div>
              <Image maw={240} mx='auto' radius='md' src={NoDataImg} alt='No Data Robot' />
            </div>
            <Text ta='center' fs='italic' py={10}>
              No reports found
            </Text>
          </Container>
        </Flex>
      </Container>
    );
  }

  return (
    <Container size='97%' my={'lg'}>
      <Title order={3} mt={0} mb='xs'>
        Rejection Analysis
      </Title>
      <Flex gap={'md'}>
        <Box style={{ border: '2px solid #DBDBDB', borderRadius: '10px' }} w={'100%'} p={'xl'}>
          <Flex align={'center'} gap={'sm'}>
            <Text color='gray' fw={500}>
              # Contacts Disqualified:{' '}
            </Text>
            <Text fw={600}>{totalDisqualified}</Text>
          </Flex>
          <Flex mt={'sm'}>
            <Pie
              data={chartDisqualifiedData}
              options={options}
              ref={disqualifiedDataChartRef}
              onClick={(e) => {
                if (disqualifiedDataChartRef.current) {
                  const elementIndex = getElementAtEvent(disqualifiedDataChartRef.current, e)[0]
                    ?.index;
                  if (elementIndex !== undefined) {
                    setFilterContact(chartDisqualifiedData.labels[elementIndex]);
                  }
                }
              }}
            />
          </Flex>
        </Box>
        <Box style={{ border: '2px solid #DBDBDB', borderRadius: '10px' }} w={'100%'} p={'xl'}>
          <Flex align={'center'} gap={'sm'}>
            <Text color='gray' fw={500}>
              # Contacts Not Interested:{' '}
            </Text>
            <Text fw={600}>{totalNotInterested}</Text>
          </Flex>
          <Flex mt={'sm'}>
            <Pie
              data={chartNotInterestedData}
              options={options}
              ref={notInterestedDataChartRef}
              onClick={(e) => {
                if (notInterestedDataChartRef.current) {
                  const elementIndex = getElementAtEvent(notInterestedDataChartRef.current, e)[0]
                    ?.index;
                  if (elementIndex !== undefined) {
                    setFilterContact(chartNotInterestedData.labels[elementIndex]);
                  }
                }
              }}
            />
          </Flex>
        </Box>
      </Flex>
      <Flex justify={'space-between'} mt={'xl'} align={'center'}>
        <Flex align={'center'} gap={'xs'}>
          <Text size={20} fw={600}>
            Rejection Report
          </Text>

          {filterContact && (
            <Badge
              color='red'
              rightSection={
                <ActionIcon size={'xs'} onClick={() => setFilterContact('')} color='blue'>
                  <IconX />
                </ActionIcon>
              }
            >
              {filterContact}
            </Badge>
          )}
        </Flex>
        <TextInput
          value={searchQuery}
          onChange={handleSearchChange}
          rightSection={<IconSearch size={16} color='gray' />}
          placeholder='Search'
        />
      </Flex>
      <Box mt={'md'}>
        <Stack
          style={{
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <Table>
            <thead>
              <tr
                style={{
                  background: '#f9f9fd',
                }}
              >
                <th>
                  <Text fw={700}>Company</Text>
                </th>
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
            <Select
              style={{ width: '150px' }}
              data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']}
              defaultValue='Show 25 rows'
            />
            <Text color='gray' fw={500}>
              of {totalRejectionData}
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
