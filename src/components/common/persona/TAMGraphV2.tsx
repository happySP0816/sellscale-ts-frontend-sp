import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import {
  Box,
  Flex,
  Title as CoreTitle,
  Text,
  Button,
  Group,
  useMantineTheme,
  Grid,
  Stack,
  Divider,
  Card,
} from '@mantine/core';
import { IconCalendar } from '@tabler/icons';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { useQuery } from '@tanstack/react-query';
import { getTamGraphData } from '@utils/requests/getTamGraphData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TAMGraphData = {
  companies: {
    company: string;
    count: number;
  }[];
  employees: {
    employee_count_comp: string;
    num_contacted: number;
    num_left: number;
  }[];
  industries: {
    company: string;
    count: number;
  }[];
  industry_breakdown: {
    industry: string;
    num_contacted: number;
    num_left: number;
  }[];
  scraping_report: {
    scraped: string;
    sdr: string;
    status: string;
    upload_date: string;
    upload_name: string;
  }[];
  stats: [
    {
      num_companies: number;
      num_contacts: number;
      num_engaged: number;
    }
  ];
  titles: {
    count: number;
    title: string;
  }[];
};

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Chart.js Bar Chart - Stacked',
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const mocks = [
  'Devops Engineer',
  'Security Engineer',
  'Senior Devops Engineer',
  'Senior Security Engineer',
];
export default function TAMGraphV2() {
  const userToken = useRecoilValue(userTokenState);
  const [period, setPeriod] = useState('24H');
  const [filteredBy, setFilteredBy] = useState('COMPANY_SIZE');
  const theme = useMantineTheme();

  const { data: graphData } = useQuery({
    queryKey: [`query-get-tam-graph-data`],
    queryFn: async () => {
      const response = await getTamGraphData(userToken);
      return response.status === 'success' ? (response.data as TAMGraphData) : null;
    },
  });

  console.log(graphData);

  const data = {
    labels:
      filteredBy === 'COMPANY_SIZE'
        ? graphData?.employees.map((i) => i.employee_count_comp) || []
        : graphData?.industry_breakdown.map((i) => i.industry) || [],
    datasets: [
      {
        label: 'Currently Engaged',
        data:
          filteredBy === 'COMPANY_SIZE'
            ? graphData?.employees.map((i) => i.num_contacted) || []
            : graphData?.industry_breakdown.map((i) => i.num_contacted) || [],
        // labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: theme.colors.blue[4],
      },
      {
        label: 'Prospected',
        data:
          filteredBy === 'COMPANY_SIZE'
            ? graphData?.employees.map((i) => i.num_left) || []
            : graphData?.industry_breakdown.map((i) => i.num_left) || [],
        //labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: theme.colors.red[4],
      },
    ],
  };
  const plugin = {
    id: 'Chart Spacing',
    beforeInit(chart: any) {
      console.log('[Test] - be');
      // reference of original fit function
      const originalFit = chart.legend.fit;

      // override the fit function
      chart.legend.fit = function fit() {
        // call original function and bind scope in order to use `this` correctly inside it
        originalFit.bind(chart.legend)();
        // increase the width to add more space
        console.log('[Test] -', this.height);
        this.height += 20;
      };
    },
  };

  const getList = (title: string, data: { title: string; count: number }[]) => {
    return (
      <Card w={'100%'} sx={{ flex: 1 }} p={'xs'}>
        <Box bg={'white'}>
          <Box>
            <Box py={'xs'}>
              <Text fw={500} fz={'sm'}>
                {title}
              </Text>
            </Box>
            <Divider />
          </Box>

          {data.map((i, idx) => (
            <Box key={idx}>
              <Flex justify={'space-between'} py={'sm'} pt={idx === 0 ? 0 : 'xs'}>
                <Text fz={'sm'} fw={500}>
                  {i.title}
                </Text>
                <Text color='gray.6' fw={500} fz={'sm'}>
                  {i.count}
                </Text>
              </Flex>

              {idx !== data.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      </Card>
    );
  };

  return (
    <Box p={'md'}>
      <Flex justify={'space-between'}>
        <CoreTitle order={2}>Outreach TAM</CoreTitle>

        <Flex gap={'sm'}>
          <Flex align={'center'}>
            <IconCalendar size={'1rem'} color={theme.colors.blue[theme.fn.primaryShade()]} />
            <Text ml={'xs'} size='md' fw={500}>
              Period:{' '}
            </Text>
          </Flex>
          <Group spacing='0' bg={'white'}>
            <Button
              variant='outline'
              color={period === '24H' ? 'blue' : 'gray'}
              size='md'
              onClick={() => setPeriod('24H')}
              sx={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRightWidth: period === '24H' ? 1 : 0,
              }}
            >
              24H
            </Button>
            <Button
              sx={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeftWidth: period === 'ALL_TIME' ? 1 : 0,
              }}
              variant='outline'
              size='md'
              onClick={() => setPeriod('ALL_TIME')}
              color={period === 'ALL_TIME' ? 'blue' : 'gray'}
            >
              All time
            </Button>
          </Group>
        </Flex>
      </Flex>

      <Flex
        mt={'md'}
        gap={'lg'}
        sx={(theme) => ({
          border: `1px solid ${theme.colors.gray[3]}`,
        })}
      >
        <Box sx={{ flexBasis: '70%' }} bg={'white'} p={'md'}>
          <Box pos={'relative'} w={'100%'} h={'100%'}>
            <Bar
              width={'100%'}
              // plugins={[plugin]}
              options={{
                // maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    align: 'start',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 20,
                    },
                    // onClick: (evt, legendItem, legend) => {
                    //   const index = legend.chart.data.datasets.indexOf(
                    //     (s: any) => s.label === legendItem.text
                    //   ) as number;

                    //   legend.chart.toggleDataVisibility(0);
                    //   legend.chart.update();
                    // },
                    // labels: {
                    //   useBorderRadius: true,
                    //   borderRadius: 999,
                    //   boxWidth: 12,
                    //   boxHeight: 12,
                    //   usePointStyle: true,
                    //   generateLabels: (chart) =>
                    //     chart.data.datasets?.map((dataset, idx) => {
                    //       return {
                    //         text: dataset.label as string,
                    //         strokeStyle: dataset.borderColor,
                    //         fillStyle: dataset.backgroundColor,
                    //         hidden: false,
                    //       };
                    //     }) || [],
                    // },
                  },

                  title: {
                    display: false,
                  },
                },

                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      lineWidth: 0,
                    },
                  },
                  y: {
                    stacked: true,
                  },
                },
              }}
              data={data}
            />
            <Flex pos={'absolute'} bottom={8} right={0}>
              <Text color='gray' fw={700} fz={'sm'}>
                Filter by: &nbsp;
              </Text>
              <Group spacing='sm'>
                <Button
                  px={16}
                  radius={'12rem'}
                  variant='outline'
                  compact
                  color={filteredBy === 'COMPANY_SIZE' ? 'blue' : 'gray'}
                  size='xs'
                  onClick={() => setFilteredBy('COMPANY_SIZE')}
                >
                  Company Size
                </Button>
                <Button
                  px={16}
                  radius={'12rem'}
                  variant='outline'
                  compact
                  color={filteredBy === 'INDUSTRY' ? 'blue' : 'gray'}
                  size='xs'
                  onClick={() => setFilteredBy('INDUSTRY')}
                >
                  Industry
                </Button>
              </Group>
            </Flex>
          </Box>
        </Box>
        <Box sx={{ flexBasis: '30%' }}>
          <Stack sx={(theme) => ({})}>
            <Box py={'lg'}>
              <Text fz={'xl'} fw={500}>
                {graphData?.stats[0].num_companies}+
              </Text>
              <Text fz={'xl'} fw={500}>
                Companies
              </Text>
              <Text color='gray.6'># Distinct companies in database</Text>
            </Box>
            <Divider />
            <Box py={'lg'}>
              <Text fz={'xl'} fw={500}>
                {graphData?.stats[0].num_contacts}
              </Text>
              <Text fz={'xl'} fw={500}>
                Contacts
              </Text>
              <Text color='gray.6'># Unique contact we in database</Text>
            </Box>
            <Divider />
            <Box py={'lg'}>
              <Text fz={'xl'} fw={500}>
                {Math.round(
                  ((graphData?.stats[0].num_engaged ?? 0) /
                    (graphData?.stats[0].num_contacts ?? 1)) *
                    100
                )}
                %
              </Text>
              <Text fz={'xl'} fw={500}>
                Engaged
              </Text>
              <Text color='gray.6'>
                % Contacts Contacted at least once
              </Text>
            </Box>
          </Stack>
        </Box>
      </Flex>

      <Flex mt={'md'} justify={'space-evenly'} gap={'lg'}>
        {getList('Top titles', graphData?.titles || [])}
        {getList(
          'Top Companies',
          (graphData?.companies || []).map((i) => ({ title: i.company, count: i.count }))
        )}
        {/* {getList(
          'Locations',
          (graphData?.employees || []).map((i) => ({
            title: i.employee_count_comp,
            count: i.num_contacted,
          }))
        )} */}
        {getList(
          'Top Industries',
          (graphData?.industries || []).map((i) => ({ title: i.company, count: i.count }))
        )}
      </Flex>
    </Box>
  );
}
