import { Button, Box, Badge, Card, Flex, Grid, Text, Paper, SimpleGrid } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { IconArrowRight, IconPlus } from '@tabler/icons';
import WebIntentPreview from './WebIntentPreview';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, ChartData, ChartOptions, Tooltip } from 'chart.js';
import { useState } from 'react';
import WebIntentDetails from './WebIntentDetails';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

export default function WebsiteIntent() {
  const [detailView, setDetailView] = useState(true);
  const options: ChartOptions<'line'> = {
    scales: {
      xAxis: {
        grid: {
          display: false,
        },
        border: {
          display: false,
          dash: [2],
        },
        display: true,
        ticks: {
          color: '#888888',
          padding: 16,
          font: {
            size: 14,
          },
        },
      },
      yAxis: {
        grid: {
          tickBorderDash: [2],
          color: '#88888840',
        },
        border: {
          display: false,
          dash: [2],
        },
        display: true,
        beginAtZero: true,
        ticks: {
          padding: 16,
          stepSize: 50,
          color: '#88888880',
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'white',
        titleSpacing: 16,
        titleColor: 'black',
        bodyColor: '#888888',
        bodySpacing: 12,
        padding: 16,
        boxPadding: 8,
        borderColor: '#88888840',
        borderWidth: 1,
      },
      legend: {
        display: false,
      },
    },
  };
  const data: ChartData<'line'> = {
    labels: ['01/05', '02/05', '03/05', '04/05', '05/05', '06/05', '07/05', '08/05', '09/05', '10/05', '11/05', '12/05'],
    datasets: [
      {
        label: 'Acceptance',
        data: [210, 220, 219, 240, 233, 229, 241, 234, 246, 213, 234, 239],
        borderWidth: 2,
        tension: 0,
        borderColor: '#419a2e',
        backgroundColor: '#419a2e',
        yAxisID: 'yAxis',
        xAxisID: 'xAxis',
        pointRadius: 0,
        pointHoverRadius: 4,
      },

      {
        label: 'Acceptance',
        data: [170, 150, 160, 166, 163, 160, 165, 165, 165, 167, 154, 180],
        borderWidth: 2,
        tension: 0,
        borderColor: '#228be6',
        backgroundColor: '#228be6',
        yAxisID: 'yAxis',
        xAxisID: 'xAxis',
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const splitsData = [
    {
      line_data: [1, 2, 3, 4, 5],
      logo_one_url: 'www.logo.com/1',
      logo_two_url: 'www.logo.com/2',
      logo_three_url: 'www.logo.com/3',
      title: 'Pricing Page Visitors > 200 employees',
      content: 'Finds all visitors who are working at a company with greater than 200 employees and visits the pricing page.',
    },
    {
      line_data: [1, 2, 3, 4, 5],
      logo_one_url: 'www.logo.com/1',
      logo_two_url: 'www.logo.com/2',
      logo_three_url: 'www.logo.com/3',
      title: 'Homepage Visitors for > 120 seconds',
      content: 'Finds all visitors who are onthe home page for > 120 seconds',
    },
    {
      line_data: [1, 2, 3, 4, 5],
      logo_one_url: 'www.logo.com/1',
      logo_two_url: 'www.logo.com/2',
      logo_three_url: 'www.logo.com/3',
      title: 'Case Study (Doximity) Competitors',
      content: 'Finds all healthcare competitors who are reading the doximity case study for > 20 seconds and work at a company > 30 employees.',
    },
  ];

  const [detailsData, setDetailsData] = useState<any>();
  return (
    <Flex direction={'column'} gap={'lg'}>
      {detailView ? (
        <>
          <Card>
            <Flex direction='row' mb='xs'>
              <Box>
                <Text fw={500} tt={'uppercase'} fz={16}>
                  All Website Visitors
                </Text>
                <Text color='gray' fw={400} fz={12}>
                  Live web traffic (with De-anonymization) built in
                </Text>
              </Box>
            </Flex>
            <Flex>
              <Line data={data} options={options} style={{ width: '100%' }} />
            </Flex>
          </Card>
          <Flex justify={'space-between'} align={'center'}>
            <Text fz={21} fw={600}>
              Website Intent Splits
            </Text>
            <Button leftIcon={<IconPlus size={'0.9rem'} />}>New Website Intent Split</Button>
          </Flex>

          <Flex direction={'column'}>
            <Flex gap={'md'}>
              <SimpleGrid cols={4}>
                {splitsData.map((item, index) => {
                  return (
                    <Card w={'100%'} maw={250}>
                      <Flex direction={'column'} gap={'sm'} h={'100%'} justify={'space-between'}>
                        <Flex gap={'sm'} direction={'column'}>
                          <WebIntentPreview
                            line_data={item.line_data}
                            logo_one_url={item.logo_one_url}
                            logo_two_url={item.logo_two_url}
                            logo_three_url={item.logo_three_url}
                          />
                          <Text size={'lg'} fw={700}>
                            {item.title}
                          </Text>
                          <Text fw={500} color='gray' size={'xs'}>
                            {item.content}
                          </Text>
                        </Flex>
                        <Button
                          w={'fit-content'}
                          rightIcon={<IconArrowRight size={'0.9rem'} />}
                          onClick={() => {
                            setDetailsData(item);
                            setDetailView(false);
                          }}
                        >
                          View Details
                        </Button>
                      </Flex>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Flex>
          </Flex>
        </>
      ) : (
        <WebIntentDetails data={detailsData} detailView={detailView} setDetailView={setDetailView} />
      )}
    </Flex>
  );
}
