import { ActionIcon, Badge, Button, useMantineTheme, Card, Collapse, Flex, NumberInput, Select, Text, Title, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconEdit,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
  IconUsers,
} from '@tabler/icons';
import { DataGrid, stringFilterFn } from 'mantine-data-grid';
import { useState } from 'react';

export default function ContactRecycling() {
  const [opened, { toggle }] = useDisclosure(false);
  const data = [
    {
      disinterest_reason: '❓ No Need',
      timeline: 180,
    },
    {
      disinterest_reason: '⏰ Timing Not Right',
      timeline: 180,
    },
    {
      disinterest_reason: '🤔 Unconvinced',
      timeline: 180,
    },
    {
      disinterest_reason: '💤 Unresponsive',
      timeline: 180,
    },
    {
      disinterest_reason: '➡ Using a competitor',
      timeline: 180,
    },
    {
      disinterest_reason: '❓ Others',
      timeline: 180,
    },
  ];
  const ContactData = [
    { name: 'Ishan Sharma', campaign: '🍞 CEO Reachouts', status: 'unresponsive', day: 180 },
    { name: 'Aakash Adesara', campaign: '🐥 Engineer Hiring', status: 'unresponsive', day: 179 },
    { name: 'David Wei', campaign: '🥐 GTM Hiring', status: 'no need', day: 180 },
    { name: 'Hristina Bell', campaign: '🚗 Outreach', status: 'unresponsive', day: 180 },
    { name: 'John Doe', campaign: '⚽ CFO Reachouts', status: 'timing not right', day: 179 },
    { name: 'David Wei', campaign: '🥐 GTM Hiring', status: 'no need', day: 180 },
    { name: 'Hristina Bell', campaign: '🚗 Outreach', status: 'unresponsive', day: 180 },
    { name: 'John Doe', campaign: '⚽ CFO Reachouts', status: 'timing not right', day: 179 },
    { name: 'John Doe', campaign: '⚽ CFO Reachouts', status: 'timing not right', day: 179 },
    { name: 'David Wei', campaign: '🥐 GTM Hiring', status: 'no need', day: 180 },
    { name: 'Hristina Bell', campaign: '🚗 Outreach', status: 'unresponsive', day: 180 },
    { name: 'John Doe', campaign: '⚽ CFO Reachouts', status: 'timing not right', day: 179 },
  ];
  const theme = useMantineTheme();
  return (
    <Card>
      <Flex direction={'column'} gap={'sm'}>
        <Title color='gray'>Contact Recycling</Title>
        <Text>
          Adjust the re-engagement metric to configure when prospects will return back from 'Nurture' to your unassigned contacts for Sellscale to reach out to
          again.
        </Text>
        <DataGrid
          data={data}
          highlightOnHover
          withSorting
          withBorder
          withColumnBorders
          verticalSpacing={'md'}
          columns={[
            {
              accessorKey: 'disinterest_reason',
              header: 'Disinterest Reason',
              maxSize: 320,
              cell: (cell) => {
                const { disinterest_reason } = cell.row.original;

                return (
                  <Text fw={700} size={'md'} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {disinterest_reason} <IconInfoCircle size={'1rem'} />
                  </Text>
                );
              },
              filterFn: stringFilterFn,
            },
            {
              accessorKey: 'timeline',
              header: 'Re-engagement Timeline',
              cell: (cell) => {
                const { timeline } = cell.row.original;

                return (
                  <Flex gap={4} align={'center'}>
                    <Text fw={700} size={'md'}>
                      {timeline}
                    </Text>
                    <Text color='gray' fw={700} size={'md'} mr={5}>
                      Days
                    </Text>
                    <IconEdit color='gray' size={'1rem'} />
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
            },
          ]}
          options={{
            enableFilters: true,
          }}
        />
        <Flex py={'lg'} align={'center'} justify={'space-between'} px={'xl'} style={{ border: '1px solid gray', borderRadius: '10px' }}>
          <Text fw={600} size={'lg'}>
            Nurture
          </Text>
          <Button
            variant='default'
            color='gray'
            radius={'xl'}
            leftIcon={<IconUsers size={'0.9rem'} />}
            rightIcon={!opened ? <IconChevronDown size={'1rem'} /> : <IconChevronUp size={'1rem'} />}
            onClick={toggle}
          >
            <Text>{ContactData.length} Contacts</Text>
          </Button>
        </Flex>
        {opened && <Divider mb={'md'} />}

        <Collapse in={opened}>
          <DataGrid
            data={ContactData}
            highlightOnHover
            withSorting
            withBorder
            withColumnBorders
            verticalSpacing={'md'}
            withPagination
            columns={[
              {
                accessorKey: 'name',
                header: 'Name',
                maxSize: 180,
                cell: (cell) => {
                  const { name } = cell.row.original;

                  return (
                    <Text fw={700} size={'md'} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {name}
                    </Text>
                  );
                },
                filterFn: stringFilterFn,
              },
              {
                accessorKey: 'campaign',
                header: 'Campaigns',
                cell: (cell) => {
                  const { campaign } = cell.row.original;

                  return (
                    <Text fw={500} size={'md'}>
                      {campaign}
                    </Text>
                  );
                },
                filterFn: stringFilterFn,
              },
              {
                accessorKey: 'status',
                header: 'Status',
                maxSize: 180,
                cell: (cell) => {
                  const { status } = cell.row.original;

                  return (
                    <Badge color='yellow' size='lg'>
                      {status}
                    </Badge>
                  );
                },
                filterFn: stringFilterFn,
              },
              {
                accessorKey: 'days',
                header: 'Days Till Revival',
                maxSize: 180,
                cell: (cell) => {
                  const { day } = cell.row.original;

                  return <Text>{day} days</Text>;
                },
                filterFn: stringFilterFn,
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
                  mt={-36}
                >
                  <Select
                    data={[
                      { value: '5', label: 'Select 5 rows' },
                      { value: '10', label: 'Select 10 rows' },
                      { value: '20', label: 'Select 20 rows' },
                    ]}
                    onChange={(value) => {
                      if (value) {
                        table.setPageSize(Number(value));
                      }
                    }}
                    //   value={'10'}
                    style={{ width: '160px' }}
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
            // state={{
            //   columnFilters,
            // }}
          />
        </Collapse>
        <Flex align={'center'} justify={'space-between'} mt={'xl'}>
          <Button size='sm' radius={'xl'} variant='outline' leftIcon={<IconRefresh size={'0.9rem'} />}>
            {182} contacts moving back to Unassigned
          </Button>
          <Flex align={'center'} gap={'sm'}>
            <Button size='sm' variant='outline'>
              Cancel
            </Button>
            <Button size='sm'>Save Setting</Button>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
