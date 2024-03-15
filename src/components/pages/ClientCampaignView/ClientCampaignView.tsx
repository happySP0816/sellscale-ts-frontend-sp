import { ActionIcon, Badge, Button, Collapse, Flex, RingProgress, Select, Switch, Text, useMantineTheme } from '@mantine/core';
import {
  IconBrandLinkedin,
  IconCalendar,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCloudUpload,
  IconExternalLink,
  IconLetterT,
  IconLoader,
  IconMail,
  IconSend,
  IconTargetArrow,
  IconToggleRight,
} from '@tabler/icons';
import { IconInfoTriangle, IconMessageCheck, IconNumber12Small } from '@tabler/icons-react';
import { DataGrid } from 'mantine-data-grid';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

export default function ClientCampaignView() {
  const theme = useMantineTheme();
  const [activeCampaignOpen, { toggle: activeCampaignToggle }] = useDisclosure(false);
  const [activeCampaigns, setActiveCampaigns] = useState([
    {
      status: true,
      percentage: 63,
      campaign: 'Casual sequence: MM devops, security, and platforms architects',
      sent: 521,
      open: 303,
      reply: 15,
      demo: 3,
      linkedin: true,
      email: true,
    },
    {
      status: true,
      percentage: 87,
      campaign: 'Senior Engineering Hiring',
      sent: 1056,
      open: 844,
      reply: 85,
      demo: 15,
      linkedin: true,
      email: false,
    },
  ]);
  const [repNeedData, setRepNeedData] = useState([
    {
      status: 'rep action needed',
      campaign: 'Enterprise Security/DevOps managers',
      sdr: 'Tim Bruno',
      task: 'Campaign Request',
    },
    {
      status: 'rep action needed',
      campaign: 'Enterprise Security/DevOps managers',
      sdr: 'Tim Bruno',
      task: 'Final Review of Samsung Research America (SRA) for Email',
    },
    {
      status: 'rep action needed',
      campaign: 'casual sequence: MM devops, security. SR XXXXXXX',
      sdr: 'Tim Bruno',
      task: 'Intervention Needed: Nisha Kohil',
    },
    {
      status: 'rep action needed',
      campaign: 'Enterprise Security/ DevOps managers',
      sdr: 'Sascha Edier',
      task: 'Final Review of Snap Inc - Product Marketing for Email',
    },
    {
      status: 'rep action needed',
      campaign: 'Priority 1 DevWeek: Best in Class conference xXXXXX',
      sdr: 'Sascha Edier',
      task: 'Campaign Request',
    },
  ]);
  const [upladingData, setUploadingData] = useState([
    {
      status: 'uploading by sellscale',
      campaign: 'Enterprise Security/ DevOps managers',
      sdr: 'Tim Bruno',
    },
    {
      status: 'uploading by sellscale',
      campaign: 'Enterprise Security/ DevOps managers',
      sdr: 'Shivang Patel',
    },
  ]);
  const [completedData, setCompletedData] = useState([
    {
      status: true,
      campaign: 'Enterprise Security/ DevOps managers',
      sdr: 'Tim Bruno',
      last_send_date: 'Mar 7, 2024 8:43 PM',
      num_sent: 51,
      linkedin: true,
      email: false,
    },
    {
      status: true,
      campaign: 'Enterprise Security/ DevOps managers',
      sdr: 'Shivang Patel',
      last_send_date: 'Mar 5, 2024 6:43 PM',
      num_sent: 26,
      linkedin: true,
      email: true,
    },
  ]);
  return (
    <div className='bg-white'>
      <Flex direction={'column'} mx={'5%'} py={'lg'} gap={'lg'}>
        <Flex direction={'column'} gap={'sm'}>
          <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'}>
            <IconTargetArrow />
            Active Campaigns
          </Text>
          <DataGrid
            data={activeCampaigns}
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
                maxSize: 170,
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
                      <Badge color={status ? 'green' : 'red'}>active</Badge>
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
                        <Switch defaultChecked={linkedin} />
                      </Flex>
                      <Flex direction={'column'} gap={'3px'} align={'center'}>
                        <IconMail size={'1.3rem'} fill='#228be6' color='white' />
                        <Switch defaultChecked={email} />
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
                  <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />
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
            pageSizes={['20']}
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
          <Collapse in={activeCampaignOpen}>
            <DataGrid
              data={activeCampaigns}
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
                  maxSize: 170,
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
                        <Badge color={status ? 'green' : 'red'}>active</Badge>
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
                          <Switch defaultChecked={linkedin} />
                        </Flex>
                        <Flex direction={'column'} gap={'3px'} align={'center'}>
                          <IconMail size={'1.3rem'} fill='#228be6' color='white' />
                          <Switch defaultChecked={email} />
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
                    <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />
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
              pageSizes={['20']}
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
          <Button
            mx={'auto'}
            w={'fit-content'}
            color='gray'
            variant='outline'
            radius={'xl'}
            rightIcon={
              <IconChevronDown
                size={'0.8rem'}
                style={{
                  transitionDuration: '400ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: activeCampaignOpen ? `rotate(${activeCampaignOpen ? 180 : 0}deg)` : 'none',
                }}
              />
            }
            // onClick={() => setShouldShowInactiveCampaign((s) => !s)}
            onClick={activeCampaignToggle}
          >
            {/* {shouldShowInactiveCampaign ? 'Hide' : 'Show'} {triggers?.filter((t: any) => !t.active).length} Inactive Campaigns */}
            {activeCampaignOpen ? 'Hide' : 'Show'} {12} Inactive Campaigns
          </Button>
        </Flex>
        <Flex direction={'column'} gap={'sm'}>
          <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'}>
            <IconInfoTriangle color='orange' />
            Rep Action Needed
          </Text>
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
                  const { status } = cell.row.original;

                  return (
                    <Flex gap={'xs'} w={'100%'} h={'100%'} align={'center'}>
                      <Badge color={status ? 'orange' : 'red'}>{status}</Badge>
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
                maxSize: 120,
                enableResizing: true,
                cell: (cell) => {
                  const { sdr } = cell.row.original;

                  return (
                    <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      <Text>{sdr}</Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: 'task',
                header: () => (
                  <Flex align={'center'} gap={'3px'}>
                    <IconLetterT color='gray' size={'0.9rem'} />
                    <Text color='gray'>Task</Text>
                  </Flex>
                ),
                enableResizing: true,
                cell: (cell) => {
                  const { task } = cell.row.original;

                  return (
                    <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      <Text>{task}</Text>
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
                maxSize: 140,
                enableResizing: true,
                cell: () => {
                  return (
                    <Flex align={'center'} h={'100%'}>
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
                  <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />

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
            pageSizes={['20']}
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
          <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'}>
            <IconCloudUpload color='#228be6' />
            Uploading by SellScale
          </Text>
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
                      <Badge>{status}</Badge>
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
                maxSize: 120,
                enableResizing: true,
                cell: (cell) => {
                  const { sdr } = cell.row.original;

                  return (
                    <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      <Text>{sdr}</Text>
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
                  <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />

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
            pageSizes={['20']}
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
          <Text style={{ display: 'flex', alignItems: 'center', gap: '5px' }} color='gray' fw={700} size={'lg'}>
            <IconCircleCheck color='green' />
            Completed
          </Text>
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
                    <Flex gap={'xs'} w={'100%'} h={'100%'} align={'center'}>
                      <Badge color='green'>complete</Badge>
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
                cell: (cell) => {
                  const { sdr } = cell.row.original;

                  return (
                    <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      <Text>{sdr}</Text>
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
                cell: (cell) => {
                  const { last_send_date } = cell.row.original;

                  return (
                    <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      <Text>{last_send_date}</Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: 'num_sent',
                header: () => (
                  <Flex align={'center'} gap={'3px'}>
                    <IconNumber12Small color='gray' size={'1.2rem'} />
                    <Text color='gray'>Num Sent</Text>
                  </Flex>
                ),
                enableResizing: true,
                cell: (cell) => {
                  const { num_sent } = cell.row.original;

                  return (
                    <Flex align={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      <Text>{num_sent} Outreached to </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: 'linkedin',
                header: () => (
                  <Flex align={'center'} gap={'3px'}>
                    <IconBrandLinkedin color='white' fill='#228be6' size={'1.2rem'} />
                    <Text color='gray'>Linkedin</Text>
                  </Flex>
                ),
                maxSize: 125,
                enableResizing: true,
                cell: (cell) => {
                  const { linkedin } = cell.row.original;

                  return (
                    <Flex align={'center'} justify={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      {linkedin && <IconCircleCheck color='green' />}
                    </Flex>
                  );
                },
              },
              {
                accessorKey: 'email',
                header: () => (
                  <Flex align={'center'} gap={'3px'}>
                    <IconBrandLinkedin color='white' fill='#f79a26' size={'1.2rem'} />
                    <Text color='gray'>Email</Text>
                  </Flex>
                ),
                maxSize: 125,
                enableResizing: true,
                cell: (cell) => {
                  const { email } = cell.row.original;

                  return (
                    <Flex align={'center'} justify={'center'} gap={'xs'} py={'sm'} w={'100%'} h={'100%'}>
                      {email && <IconCircleCheck color='green' />}
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
                  <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />

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
            pageSizes={['20']}
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
      </Flex>
    </div>
  );
}
