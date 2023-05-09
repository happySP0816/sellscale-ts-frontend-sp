import { currentPersonaIdState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { Center, Paper, useMantineTheme, Text, Avatar, Flex } from '@mantine/core';
import { convertDateToLocalTime, valueToColor } from '@utils/general';
import getTransformers from '@utils/requests/getTransformers';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import _ from 'lodash';
import { Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Channel } from 'src';
import { IconChartHistogram } from '@tabler/icons';
import getDemoFeedback from '@utils/requests/getDemoFeedback';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DemoFeedbackChart() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "demo_date",
    direction: "desc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-demo-feedback`, { sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { sortStatus }] = queryKey;

      const response = await getDemoFeedback(userToken);
      let results = response.status === 'success' ? (response.extra as any[]) : [];

      // Sort data
      results = _.sortBy(results, sortStatus.columnAccessor);
      return sortStatus.direction === "desc" ? results.reverse() : results;
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);
  console.log(data?.map((d) => d.rating));


  const chartData = new Map()
    .set('Terrible', 0)
    .set('Poor', 0)
    .set('Fair', 0)
    .set('Good', 0)
    .set('Great', 0)
    .set('Excellent', 0);
  
  // Count & Map rating to table rating labels
  const ratingToLabel = (rating: string) => {
    if(rating === '0/5'){
      return 'Terrible';
    } else if(rating === '1/5'){
      return 'Poor';
    } else if(rating === '2/5'){
      return 'Fair';
    } else if(rating === '3/5'){
      return 'Good';
    } else if(rating === '4/5'){
      return 'Great';
    } else if(rating === '5/5'){
      return 'Excellent';
    } else {
      return '';
    }
  }
  for (const d of data || []) {
    let ratingLabel = ratingToLabel(d.rating);
    chartData.set(ratingLabel, chartData.get(ratingLabel) + 1);
  }

  // Filter table data by selected bar
  let tableData = [];
  if(selectedBar !== null){
    const selectedRating = [...chartData.keys()][selectedBar];
    tableData = data?.filter((d) => ratingToLabel(d.rating) === selectedRating) ?? [];
  } else {
    tableData = data ?? [];
  }

  if (!data || isFetching) {
    return (
      <Paper withBorder p='md' radius='md' w='100%' h='100%'>
        <Center h={200}>
          <Avatar
            size={70}
            styles={{
              placeholder: {
                backgroundColor: 'transparent',
              },
            }}
          >
            <IconChartHistogram color='gray' size='4rem' stroke='1' />
          </Avatar>
        </Center>
      </Paper>
    );
  }

  return (
    <>
      <Bar
        height={100}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Demo Satisfaction - Total Demos: ${data.length}`,
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.parsed.y}${context.dataset.label}`;
                },
              },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const chartElement = elements[0];
              if(selectedBar === chartElement.index){
                setSelectedBar(null);
              } else {
                setSelectedBar(chartElement.index);
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: function (value, index, ticks) {
                  return `${value}`;
                },
              },
            },
            x: {
              ticks: {
                font: {
                  size: 8,
                },
                callback: function (value, index, ticks) {
                  return ``;
                },
              },
            },
          },
        }}
        data={{
          labels: [...chartData.keys()],
          datasets: [
            {
              label: ' Demos',
              data: [...chartData.values()],
              // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
              backgroundColor: [...chartData.keys()].map((d) => theme.colors[valueToColor(theme, d)][5] + '90'),
              borderColor: '#dcdde0',
              borderWidth: [...chartData.keys()].map((d, index) => index === selectedBar ? 4 : 0),
            },
          ],
        }}
      />

      <DataTable
        height={400}
        verticalAlignment='top'
        loaderColor='teal'
        fetching={isFetching}
        noRecordsText={'No demos found'}
        columns={[
          {
            accessor: 'demo_date',
            title: 'Contact',
            sortable: true,
            width: 300,
            render: ({ prospect_img_url, prospect_name, demo_date }) => (
              <Paper withBorder p='xs' radius='md'>
                <Flex justify='space-between'>
                  <div>
                    <Avatar size='md' radius='xl' src={prospect_img_url} />
                  </div>
                  <div style={{ flexGrow: 1, marginLeft: 10 }}>
                    <Text fw={700} fz='sm'>
                      Demo with {prospect_name}
                    </Text>
                    <Text fz='sm' c='dimmed'>
                      {convertDateToLocalTime(new Date(demo_date))}
                    </Text>
                  </div>
                </Flex>
              </Paper>
            ),
          },
          {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: ({ status }) => (
              <Text>
                {status === 'OCCURRED' ? 'Complete' : status}
              </Text>
            ),
          },
          {
            accessor: 'rating',
            title: 'Rating',
            sortable: true,
            render: ({ rating }) => (
              <Text>
                {ratingToLabel(rating)}
              </Text>
            ),
          },
          {
            accessor: 'feedback',
            title: 'Notes',
            width: 300,
          },
        ]}
        records={tableData}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
      />
    </>
  );
}
