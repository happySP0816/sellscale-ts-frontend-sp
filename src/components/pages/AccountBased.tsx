import PageFrame from '@common/PageFrame';
import { ActionIcon, Badge, Box, Flex, Image, Select, Text, useMantineTheme } from '@mantine/core';
import {
  IconAffiliate,
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
import { Sparklines, SparklinesCurve } from 'react-sparklines';

export default function AccountBased() {
  const theme = useMantineTheme();
  const [acPageSize, setAcPageSize] = useState('25');
  const data = [
    {
      company_url: 'apple.com',
      companyName: 'Apple',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_activity_date: 'Mar 7, 2024 8:43 PM',
      sent: 450,
      open: 58,
      reply: 13,
      demo: 3,
    },
    {
      company_url: 'microsoft.com',
      companyName: 'Microsoft',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_activity_date: 'Mar 7, 2024 8:43 PM',
      sent: 500,
      open: 303,
      reply: 13,
      demo: 3,
    },
    {
      company_url: 'google.com',
      companyName: 'Google',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_activity_date: 'Mar 7, 2024 8:43 PM',
      sent: 450,
      open: 58,
      reply: 13,
      demo: 3,
    },
    {
      company_url: 'amazon.com',
      companyName: 'Amazon',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_activity_date: 'Mar 7, 2024 8:43 PM',
      sent: 500,
      open: 303,
      reply: 13,
      demo: 3,
    },
    {
      company_url: 'netflix.com',
      companyName: 'Netflix',
      engagement: [5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12, 5, 10, 5, 20, 8, 15, 20, 30, 4, 10, 25, 12],
      last_activity_date: 'Mar 7, 2024 8:43 PM',
      sent: 450,
      open: 58,
      reply: 13,
      demo: 3,
    },
  ];
  // const data = [
  //   {
  //     avatar: '',
  //     name: 'Tesla',
  //     makers: 5,
  //     penetrate: 11,
  //   },
  //   {
  //     avatar: '',
  //     name: 'Tesla',
  //     makers: 56,
  //     penetrate: 41,
  //   },
  // ];

  // const piechartOptions = {
  //   responsive: true, // Ensure responsiveness is enabled
  //   maintainAspectRatio: false, // Allow the chart to resize in non-proportional ways to fit the container
  //   rotation: 270,
  //   circumference: 180,
  //   cutout: '78%',
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //   },
  // };
  return (
    <PageFrame>
      {/* <Flex direction={'column'} gap={'md'}>
        {data.map((item, index) => {
          const penetrateData = {
            labels: ['Label 1', 'Label 2'],
            datasets: [
              {
                data: [item.penetrate, 100 - item.penetrate], // Use item.percent for the first value
                backgroundColor: ['#2ea640', '#eaecf0'],
                borderWidth: 0,
                borderRadius: 1,
              },
            ],
          };

          return (
            <Card w='100%' withBorder radius={'md'} bg={'white'} key={index} p={0}>
              <Flex align={'center'} justify={'space-between'}>
                <Flex align={'center'} px={'sm'} gap={'sm'}>
                  <Avatar src={item.avatar} radius={'xl'} size={'md'} />
                  <Box>
                    <Text size={'md'} fw={700}>
                      {item.name}
                    </Text>
                    <Text size={'sm'} fw={600} sx={{ display: 'flex', gap: '3px' }}>
                      {item.makers}
                      <span style={{ color: '#868e96' }}>Decision Makers</span>
                    </Text>
                  </Box>
                </Flex>
                <div className='w-[140px] h-[100px] pr-4 relative'>
                  <Doughnut data={penetrateData} options={piechartOptions} />
                  <Flex
                    style={{
                      position: 'absolute',
                      top: '40px',
                      right: '8px',
                      width: '100%',
                      alignItems: 'center',
                    }}
                    direction={'column'}
                  >
                    <Text fw={600} size={'lg'}>
                      {item.penetrate}%
                    </Text>
                    <Text size={'xs'} color='gray' fw={500} mt={'-5px'}>
                      Penetrated
                    </Text>
                  </Flex>
                </div>
              </Flex>
            </Card>
          );
        })}
      </Flex> */}
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
            maxSize: 190,
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
            accessorKey: 'last_activity',
            maxSize: 170,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconCalendar color='gray' size={'0.9rem'} />
                <Text color='gray'>Last Activity</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { last_activity_date } = cell.row.original;

              return (
                <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                  <Text fw={500} color='gray'>
                    {last_activity_date}
                  </Text>
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
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { sent } = cell.row.original;

              return (
                <Flex align={'center'} justify={'center'} gap={4} py={'lg'} w={'100%'} h={'100%'} bg={'#f9fbfe'}>
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
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { open } = cell.row.original;

              return (
                <Flex align={'center'} justify={'center'} gap={4} w={'100%'} py={'lg'} h={'100%'} bg={'#fdf9fe'}>
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
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { reply } = cell.row.original;

              return (
                <Flex align={'center'} justify={'center'} gap={4} py={'lg'} w={'100%'} h={'100%'} bg={'#fffbf8'}>
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
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { demo } = cell.row.original;

              return (
                <Flex align={'center'} justify={'center'} gap={4} py={'lg'} w={'100%'} h={'100%'} bg={'#f8fbf9'}>
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
            accessorKey: 'demo',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconCalendar color='#73d0a5' size={'0.9rem'} />
                <Text color='gray'>Demo</Text>
              </Flex>
            ),
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { demo } = cell.row.original;

              return (
                <Flex align={'center'} justify={'center'} gap={4} py={'lg'} w={'100%'} h={'100%'} bg={'#f8fbf9'}>
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
                    View Details
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
    </PageFrame>
  );
}
