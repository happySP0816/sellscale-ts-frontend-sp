import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  Select,
  Stack,
  useMantineTheme,
  Switch,
  Text,
  Textarea,
  Tooltip,
  Spoiler,
} from '@mantine/core';
import {
  IconArrowsDownUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconFileUnknown,
  IconInfoCircle,
  IconLetterT,
  IconLink,
  IconPencil,
  IconTrash,
} from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { IconMessageCheck, IconSparkles } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { DataGrid } from 'mantine-data-grid';

export default function NonGenerativeListView(props: any) {
  const theme = useMantineTheme();

  const [usedPageSize, setUsedPageSize] = useState('25');
  const [unUsedPageSize, setUnUsedPageSize] = useState('25');

  const [openedUsed, { toggle: usedToggle }] = useDisclosure(true);
  const [openedUnUsed, { toggle: unusedToggle }] = useDisclosure(true);

  const [usedDetail, setUsedDetail] = useState(false);

  return (
    <>
      <Flex gap={'sm'} align={'center'} w={'100%'} mt={'md'}>
        <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
          Used Assets
        </Text>
        <Divider w={'100%'} />
        <ActionIcon onClick={usedToggle}>{openedUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
      </Flex>
      <Collapse in={openedUsed}>
        <DataGrid
          data={props.useData}
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
              accessorKey: 'asset_name',
              minSize: 180,
              maxSize: 180,
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconLetterT color='gray' size={'0.9rem'} />
                  <Text color='gray'>Asset Name</Text>
                </Flex>
              ),
              cell: (cell) => {
                // const { status } = cell.row.original;

                return (
                  <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                    <Text>{'Objection-Sol....'}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'details',
              minSize: 400,
              maxSize: 400,
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconLetterT color='gray' size={'0.9rem'} />
                  <Text color='gray'>Details</Text>
                </Flex>
              ),
              cell: (cell) => {
                // const { campaign } = cell.row.original;

                return (
                  <Flex
                    px={'sm'}
                    h={'100%'}
                    align={'center'}
                    w={'100%'}
                    sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block' }}
                  >
                    <Flex align='start' justify='space-between' w={'380px'}>
                      <Text lineClamp={usedDetail ? 1 : 5} style={{ flex: 1 }}>
                        Financial industry clients likely already have a secretes management solution, like Vault, which we want to get ahead of by saying if
                        they're open to a re-evaluation to see what's on the market.
                      </Text>
                      {/* <Flex align={'center'} gap={'4px'}>
                        <Tooltip
                          withArrow
                          w={400}
                          label={`Northrop Gruman is a defense company and so are all the people in this campaign. They would find this case study very relevant.`}
                          styles={{
                            tooltip: {
                              whiteSpace: 'normal',
                            },
                          }}
                        >
                          <div>
                            <IconInfoCircle size={'1rem'} />
                          </div>
                        </Tooltip>
                        <ActionIcon onClick={() => setUsedDetail(!usedDetail)}>
                          <IconArrowsDownUp size={'1rem'} />
                        </ActionIcon>
                      </Flex> */}
                    </Flex>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'type',
              minSize: 200,
              maxSize: 200,
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconLetterT color='gray' size={'0.9rem'} />
                  <Text color='gray'>Type</Text>
                </Flex>
              ),
              cell: (cell) => {
                // const { rep, rep_profile_picture } = cell.row.original;

                return (
                  <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                    <Text fw={500}>{'CTA'}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'value',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconFileUnknown color='gray' size={'0.9rem'} />
                  <Text color='gray'>Value</Text>
                </Flex>
              ),
              maxSize: 120,
              minSize: 120,
              enableResizing: true,
              cell: (cell) => {
                // const {  } = cell.row.original;

                return (
                  <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                    <Flex justify={'center'} w={'100%'} align={'center'} gap={'md'}>
                      <Badge>Link</Badge>
                    </Flex>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'open',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconMessageCheck color='gray' size={'0.9rem'} />
                  <Text color='gray'>Open Rate</Text>
                </Flex>
              ),
              maxSize: 220,
              minSize: 220,
              enableResizing: true,
              cell: (cell) => {
                // const {  } = cell.row.original;

                return (
                  <Flex direction={'column'} align={'center'} justify={'center'} w={'100%'} h={'100%'} py={'sm'}>
                    <Badge color='green'>76% Success</Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'reply',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconMessageCheck color='gray' size={'0.9rem'} />
                  <Text color='gray'>Reply Rate</Text>
                </Flex>
              ),
              enableResizing: true,
              minSize: 230,
              cell: (cell) => {
                return (
                  <Flex direction={'column'} align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                    <Badge color='green'>76% Success</Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'action',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconMessageCheck color='gray' size={'0.9rem'} />
                  <Text color='gray'>Action</Text>
                </Flex>
              ),
              enableResizing: true,
              minSize: 230,
              cell: (cell) => {
                const {} = cell.row.original;

                return (
                  <Flex direction={'column'} align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
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
                  value={usedPageSize}
                  onChange={(v) => {
                    setUsedPageSize(v ?? '25');
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
          pageSizes={[usedPageSize]}
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
      <Flex gap={'sm'} align={'center'} w={'100%'}>
        <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
          UnUsed Assets
        </Text>
        <Divider w={'100%'} />
        <ActionIcon onClick={unusedToggle}>{openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
      </Flex>
      <Collapse in={openedUnUsed} mb={'md'}>
        <DataGrid
          data={props.unUseData}
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
              accessorKey: 'asset_name',
              minSize: 180,
              maxSize: 180,
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconLetterT color='gray' size={'0.9rem'} />
                  <Text color='gray'>Asset Name</Text>
                </Flex>
              ),
              cell: (cell) => {
                // const { status } = cell.row.original;

                return (
                  <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                    <Text>{'Objection-Sol....'}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'details',
              minSize: 400,
              maxSize: 400,
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconLetterT color='gray' size={'0.9rem'} />
                  <Text color='gray'>Details</Text>
                </Flex>
              ),

              cell: (cell) => {
                // const { campaign } = cell.row.original;

                return (
                  <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                    <Text lineClamp={1}>{'Financial industry clients likely already ha...'}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'type',
              minSize: 200,
              maxSize: 200,
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconLetterT color='gray' size={'0.9rem'} />
                  <Text color='gray'>Type</Text>
                </Flex>
              ),
              cell: (cell) => {
                // const { rep, rep_profile_picture } = cell.row.original;

                return (
                  <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                    <Text fw={500}>{'CTA'}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'value',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconFileUnknown color='gray' size={'0.9rem'} />
                  <Text color='gray'>Value</Text>
                </Flex>
              ),
              maxSize: 120,
              minSize: 120,
              enableResizing: true,
              cell: (cell) => {
                // const {  } = cell.row.original;

                return (
                  <Flex align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                    <Flex justify={'center'} w={'100%'} align={'center'} gap={'md'}>
                      <Badge>Link</Badge>
                    </Flex>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'open',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconMessageCheck color='gray' size={'0.9rem'} />
                  <Text color='gray'>Open Rate</Text>
                </Flex>
              ),
              maxSize: 220,
              minSize: 220,
              enableResizing: true,
              cell: (cell) => {
                // const {  } = cell.row.original;

                return (
                  <Flex direction={'column'} align={'center'} justify={'center'} w={'100%'} h={'100%'} py={'sm'}>
                    <Badge color='green'>76% Success</Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'reply',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconMessageCheck color='gray' size={'0.9rem'} />
                  <Text color='gray'>Reply Rate</Text>
                </Flex>
              ),
              enableResizing: true,
              minSize: 230,
              cell: (cell) => {
                return (
                  <Flex direction={'column'} align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                    <Badge color='green'>76% Success</Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: 'action',
              header: () => (
                <Flex align={'center'} gap={'3px'}>
                  <IconMessageCheck color='gray' size={'0.9rem'} />
                  <Text color='gray'>Action</Text>
                </Flex>
              ),
              enableResizing: true,
              minSize: 230,
              cell: (cell) => {
                const {} = cell.row.original;

                return (
                  <Flex direction={'column'} align={'center'} justify={'center'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
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
                  value={unUsedPageSize}
                  onChange={(v) => {
                    setUnUsedPageSize(v ?? '25');
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
          pageSizes={[usedPageSize]}
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
    </>
  );
}
