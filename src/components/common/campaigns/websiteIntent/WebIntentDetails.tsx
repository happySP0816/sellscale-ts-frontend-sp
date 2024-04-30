import { ActionIcon, Badge, Box, Button, Card, Flex, Image, Select, Text, useMantineTheme } from '@mantine/core';
import {
  IconAffiliate,
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconChecks,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconLetterT,
  IconLoader,
  IconSend,
  IconToggleRight,
} from '@tabler/icons';
import { IconMessageCheck } from '@tabler/icons-react';
import { DataGrid } from 'mantine-data-grid';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, ChartData, ChartOptions, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

export default function WebIntentDetails(props: any) {
  const theme = useMantineTheme();
  const [acPageSize, setAcPageSize] = useState('25');
  const data = [
    {
      company_url: 'apple.com',
      companyName: 'Apple',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_web_visit: 'Mar 7, 2024 8:43 PM',
      visit: 59,
      prospect: 48,
    },
    {
      company_url: 'microsoft.com',
      companyName: 'Microsoft',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_web_visit: 'Mar 7, 2024 8:43 PM',
      visit: 3,
      prospect: 2,
    },
    {
      company_url: 'google.com',
      companyName: 'Google',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_web_visit: 'Mar 7, 2024 8:43 PM',
      visit: 91,
      prospect: 32,
    },
    {
      company_url: 'amazon.com',
      companyName: 'Amazon',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_web_visit: 'Mar 7, 2024 8:43 PM',
      visit: 104,
      prospect: 48,
    },
    {
      company_url: 'netflix.com',
      companyName: 'Netflix',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_web_visit: 'Mar 7, 2024 8:43 PM',
      visit: 41,
      prospect: 28,
    },
  ];
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
  const chartData: ChartData<'line'> = {
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

  return (
    // <Flex direction={'column'} gap={'lg'}>
    <>
      <Flex justify={'space-between'} align={'center'}>
        <Flex align={'center'} gap={'sm'}>
          <ActionIcon variant='light' size='lg' radius='xl' color='blue' onClick={() => props.setDetailView(true)}>
            <IconArrowLeft size={'0.9rem'} />
          </ActionIcon>
          <Text color='gray' fw={400}>
            Go Back to Website Intent
          </Text>
        </Flex>
        <Flex gap={'xs'} align={'center'}>
          <Text fw={500} color='gray' size={'sm'}>
            Connected Campaign:
          </Text>
          <Button color='grape'>{'> 200 Size Pricing Page Sell Strat'}</Button>
        </Flex>
      </Flex>
      <Card>
        <Flex direction='row' mb='xs'>
          <Box>
            <Text fw={500} tt={'uppercase'} fz={16}>
              {props.data.title}
            </Text>
            <Text color='gray' fw={400} fz={12}>
              Live web traffic (with De-anonymization) built in
            </Text>
          </Box>
        </Flex>
        <Flex>
          <Line data={chartData} options={options} style={{ width: '100%', height: '300px' }} />
        </Flex>
      </Card>
      <DataGrid
        data={data}
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
            accessorKey: 'company',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLetterT color='gray' size={'0.9rem'} />
                <Text color='gray'>Company</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { company_url, companyName } = cell.row.original;

              return (
                <Flex gap={'xs'} w={'100%'} h={'100%'} px={'sm'} align={'center'} justify={'space-between'}>
                  <Flex gap={'xs'} align={'center'}>
                    <Image src={`https://logo.clearbit.com/${company_url}`} width={30} height={30} />
                    <Box>
                      <Text fw={700} size={'xs'}>
                        {companyName}
                      </Text>
                      <Text fw={500} color='gray' size={'xs'}>
                        {company_url}
                      </Text>
                    </Box>
                  </Flex>
                  <ActionIcon>
                    <IconAffiliate color='orange' />
                  </ActionIcon>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'engagment',
            maxSize: 240,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLoader color='gray' size={'0.9rem'} />
                <Text color='gray'>Engagement</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { engagement } = cell.row.original;

              return (
                <Flex gap={'sm'} w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                  <Sparklines data={engagement} width={100} height={30} margin={3}>
                    <SparklinesCurve color='green' />
                  </Sparklines>
                  <Flex>
                    <Badge color={engagement ? 'green' : 'red'}>High</Badge>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'last_web_visit',
            maxSize: 170,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconCalendar color='gray' size={'0.9rem'} />
                <Text color='gray'>Last Web Visit</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { last_web_visit } = cell.row.original;

              return (
                <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                  <Text fw={500} color='gray'>
                    {last_web_visit}
                  </Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'people',
            maxSize: 330,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconCalendar color='gray' size={'0.9rem'} />
                <Text color='gray'>People</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { visit, prospect } = cell.row.original;

              return (
                <Flex w={'100%'} px={'sm'} gap={5} h={'100%'} align={'center'}>
                  <Text fw={500} color='gray' sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <span className='font-semibold text-black'>{visit}</span>
                    Unique Visits
                  </Text>
                  <Flex>
                    <IconArrowRight size={'0.9rem'} color='gray' />
                  </Flex>
                  <Text fw={500} color='gray' sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <span className='font-semibold text-black'>{prospect}</span>
                    Prospects Imported
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
            maxSize: 130,
            enableResizing: true,
            cell: (cell) => {
              return (
                <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                  <Badge tt={'initial'} variant='filled' rightSection={<IconExternalLink size={'0.9rem'} style={{ marginTop: '5px' }} />}>
                    View People
                  </Badge>
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
    </>
    // </Flex>
  );
}
