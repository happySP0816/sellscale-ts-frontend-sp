import { ActionIcon, Avatar, Badge, Box, Button, Card, Flex, Image, NumberInput, Paper, Select, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { IconArrowRight, IconCalendar, IconChevronLeft, IconChevronRight, IconFileDownload, IconInfoCircle, IconSearch, IconWorld } from '@tabler/icons';
import { IconUserSquareRounded } from '@tabler/icons-react';
import { DataGrid } from 'mantine-data-grid';
import { useState } from 'react';

interface ChampionDataType {
  prospect_name: string;
  change_date: string;
  origin_company_url: string;
  origin_company: string;
  new_company_url: string;
  new_company: string;
  type: string;
  avatar: string;
}

export default function ChampionChange() {
  const theme = useMantineTheme();
  const [championData, setChampionData] = useState<ChampionDataType[]>([
    {
      prospect_name: 'Fernando Gozal',
      change_date: 'Mar 7, 2024 8:43 PM',
      origin_company_url: 'https://google.com',
      origin_company: 'Google',
      new_company_url: 'https://microsoft.com',
      new_company: 'Microsoft',
      type: 'new',
      avatar: '',
    },
    {
      prospect_name: 'Ishan Sharma',
      change_date: 'Mar 7, 2024 8:43 PM',
      origin_company_url: 'https://apple.com',
      origin_company: 'Apple',
      new_company_url: 'https://app.sellscale.com',
      new_company: 'SellScale',
      type: 'new',
      avatar: '',
    },
    {
      prospect_name: 'David Wei',
      change_date: 'Mar 5, 2024 6:43 PM',
      origin_company_url: 'https://google.com',
      origin_company: 'Google',
      new_company_url: 'https://app.sellscale.com',
      new_company: 'SellScale',
      type: 'new',
      avatar: '',
    },
    {
      prospect_name: 'Varun Uttampadi',
      change_date: 'Mar 5, 2024 6:43 PM',
      origin_company_url: 'https://apple.com',
      origin_company: 'Apple',
      new_company_url: 'https://google.com',
      new_company: 'Google',
      type: 'new',
      avatar: '',
    },
  ]);
  const [data, setData] = useState({
    close: 430,
    champion_win: 1301,
    champion_change: 81,
  });
  return (
    <Flex direction={'column'} gap={'xl'}>
      <Flex align={'center'} justify={'space-between'}>
        <Title order={3} fw={600}>
          Champion Change Detector
        </Title>
        <Flex gap={'sm'} align={'center'}>
          <TextInput maw={200} placeholder='Search' rightSection={<IconSearch size={'0.9rem'} />} />
          <Button color='green' leftIcon={<IconFileDownload size={'0.9rem'} />}>
            Download CSV
          </Button>
          <Button leftIcon={<IconWorld size={'0.9rem'} />}>Synced to Salesforce</Button>
        </Flex>
      </Flex>
      <Flex gap={'xl'} justify={'space-between'}>
        <Card withBorder radius={'sm'} px={'xl'} py={'md'} w={'100%'}>
          <Box>
            <Flex gap={'xs'} align={'end'}>
              <Title order={2} fw={600}>
                {data.close}
              </Title>
              <Text color='gray' fw={600} size={'sm'} mb={2}>
                Closed Won Accounts
              </Text>
            </Flex>
            <Flex gap={'xs'} align={'center'} mt={3}>
              <IconInfoCircle size={'0.9rem'} color='gray' />
              <Text fz={10} fw={500} color='gray'>
                Lorem ipsum doior sit amet, consectetur adipiscing elit
              </Text>
            </Flex>
          </Box>
        </Card>
        <Card withBorder radius={'sm'} px={'xl'} py={'md'} w={'100%'}>
          <Box>
            <Flex gap={'xs'} align={'end'}>
              <Title order={2} fw={600}>
                {data.champion_win}
              </Title>
              <Text color='gray' fw={600} size={'sm'} mb={2}>
                Champions in Won Accounts
              </Text>
            </Flex>
            <Flex gap={'xs'} align={'center'} mt={3}>
              <IconInfoCircle size={'0.9rem'} color='gray' />
              <Text fz={10} fw={500} color='gray'>
                Lorem ipsum doior sit amet, consectetur adipiscing elit
              </Text>
            </Flex>
          </Box>
        </Card>
        <Card withBorder radius={'sm'} px={'xl'} py={'md'} w={'100%'}>
          <Box>
            <Flex gap={'xs'} align={'end'}>
              <Title order={2} fw={600}>
                {data.champion_change}
              </Title>
              <Text color='gray' fw={600} size={'sm'} mb={2}>
                Champions Changed Jobs
              </Text>
            </Flex>
            <Flex gap={'xs'} align={'center'} mt={3}>
              <IconInfoCircle size={'0.9rem'} color='gray' />
              <Text fz={10} fw={500} color='gray'>
                Lorem ipsum doior sit amet, consectetur adipiscing elit
              </Text>
            </Flex>
          </Box>
        </Card>
      </Flex>
      <DataGrid
        bg={'white'}
        data={championData}
        highlightOnHover
        withSorting
        withBorder
        withPagination
        withColumnBorders
        sx={{ cursor: 'pointer' }}
        columns={[
          {
            accessorKey: 'prospect_name',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconUserSquareRounded color='gray' size={'0.9rem'} />
                <Text color='gray'>Prospect Name</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { prospect_name, avatar } = cell.row.original;
              return (
                <Flex gap={'xs'} w={'100%'} h={'100%'} align={'center'}>
                  <Avatar src={avatar} size={'sm'} radius={'xl'} />
                  <Text size={'sm'}>{prospect_name}</Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'change_date',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconCalendar color='gray' size={'0.9rem'} />
                <Text color='gray'>Date of Change</Text>
              </Flex>
            ),
            maxSize: 200,
            cell: (cell) => {
              const { change_date } = cell.row.original;
              return (
                <Flex w={'100%'} h={'100%'} align={'center'}>
                  <Text color='gray' fw={400} size={'sm'}>
                    {change_date}
                  </Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'people',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconUserSquareRounded color='gray' size={'0.9rem'} />
                <Text color='gray'>People</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { new_company, new_company_url, origin_company, origin_company_url, type } = cell.row.original;

              return (
                <Flex align={'center'} gap={'md'} w={'100%'} h={'100%'}>
                  <Flex gap={'xs'} align={'center'}>
                    <Image src={`https://logo.clearbit.com/${origin_company_url}`} width={20} height={20} />
                    <Text fw={500} size={'sm'}>
                      {origin_company}
                    </Text>
                  </Flex>
                  <Flex>
                    <IconArrowRight size={'0.9rem'} />
                  </Flex>
                  <Flex gap={'xs'} align={'center'}>
                    <Image src={`https://logo.clearbit.com/${new_company_url}`} width={20} height={20} />
                    <Text fw={500} size={'sm'}>
                      {new_company}
                    </Text>
                    <Badge size='sm' color={type === 'new' ? 'green' : 'red'}>
                      {type === 'new' ? 'new account' : 'old account'}
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
              <Flex align={'center'} gap={'sm'}>
                <Text fw={500} color='gray.6'>
                  Show
                </Text>

                <Flex align={'center'}>
                  <NumberInput
                    maw={100}
                    value={table.getState().pagination.pageSize}
                    onChange={(v) => {
                      if (v) {
                        table.setPageSize(v);
                      }
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
                      of {table.getPrePaginationRowModel().rows.length}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

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
        styles={(theme) => ({
          thead: {
            height: '44px',
            // backgroundColor: theme.colors.gray[0],
            '::after': {
              backgroundColor: 'transparent',
            },
          },
          td: {
            paddingBlock: '20px !important',
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
