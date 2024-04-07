import { ActionIcon, Badge, Flex, Select, Switch, Text, useMantineTheme } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconFileUnknown, IconLetterT, IconPencil, IconTrash } from '@tabler/icons';
import { IconMessageCheck } from '@tabler/icons-react';
import { DataGrid } from 'mantine-data-grid';
import { useState } from 'react';

export default function EmailSubject() {
  const [pageSize, setPageSize] = useState('25');
  const theme = useMantineTheme();
  const [data, setData] = useState([
    {
      acceptance: 33,
      subject_line: '(first name), secure secrets for (company)',
      campaign: 'Enterprise Security/DevOps managers',
      used: true,
    },
    {
      acceptance: 33,
      subject_line: '[[creative phrase about securing secrets]] with Doppler',
      campaign: 'Enterprise Security/DevOps managers',
      used: false,
    },
    {
      acceptance: 33,
      subject_line: '$50 for a chat about devops?',
      campaign: 'Casual sequence: MM devops, security, SREs',
      used: true,
    },
    {
      acceptance: 33,
      subject_line: 'Enhance [[company) security with Doppler]]',
      campaign: 'Enterprise Security/DevOps managers',
      used: false,
    },
    {
      acceptance: 33,
      subject_line: 'Insurance secrets',
      campaign: 'Priority 1 DevWeek: Best in Class confernece outreach',
      used: false,
    },
  ]);
  return (
    <Flex my={'lg'}>
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
            accessorKey: 'acceptance',
            minSize: 180,
            maxSize: 180,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLetterT color='gray' size={'0.9rem'} />
                <Text color='gray'>Acceptance</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { acceptance } = cell.row.original;

              return (
                <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'} justify={'center'}>
                  <Badge color='green' size='lg'>
                    {acceptance}$
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'subject_line',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLetterT color='gray' size={'0.9rem'} />
                <Text color='gray'>Subject line</Text>
              </Flex>
            ),

            cell: (cell) => {
              const { subject_line } = cell.row.original;

              return (
                <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                  <Text lineClamp={1}>{subject_line}</Text>
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
                <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                  <Text fw={500}>{campaign}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'action',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconFileUnknown color='gray' size={'0.9rem'} />
                <Text color='gray'>Action</Text>
              </Flex>
            ),
            maxSize: 200,
            minSize: 200,
            enableResizing: true,
            cell: (cell) => {
              // const {  } = cell.row.original;

              return (
                <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                  <Flex gap={'xs'} align={'center'}>
                    <Switch size='xs' />
                    <Badge color='yellow' radius={'xl'} sx={{ paddingTop: '6px', paddingInline: '2px' }}>
                      <IconPencil size={'1rem'} />
                    </Badge>
                    <Badge color='red' radius={'xl'} sx={{ paddingTop: '6px', paddingInline: '2px' }}>
                      <IconTrash size={'1rem'} />
                    </Badge>
                  </Flex>
                </Flex>
              );
            },
          },
        ]}
        options={{
          enableFilters: true,
        }}
        //   loading={loading}
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
                value={pageSize}
                onChange={(v) => {
                  setPageSize(v ?? '25');
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
        pageSizes={[pageSize]}
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
  );
}
