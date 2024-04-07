import { Badge, Button, Flex, Text, useMantineTheme } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconFileUnknown, IconLetterT } from '@tabler/icons';
import { DataGrid } from 'mantine-data-grid';
import { useState } from 'react';
import { valueToColor } from '@utils/general';

export default function LinkedinCTAs() {
  const [pageSize, setPageSize] = useState('25');
  const theme = useMantineTheme();
  const [more, setMore] = useState(false);

  const [data, setData] = useState([
    {
      acceptance: 100,
      cta_type: 'persona',
      cta: "Since you're a leader in the security space, I'd love...",
      campaign: 'Enterprise Security/DevOps managers',
    },
    {
      acceptance: 100,
      cta_type: 'solution',
      cta: 'Financial industry clients likely already have a secrity....',
      campaign: 'Enterprise Security/DevOps managers',
    },
    {
      acceptance: 61,
      cta_type: 'connection',
      cta: 'Doppler helps streamlining secret management pre...',
      campaign: 'Causeal sequence: MM devops, security, SREs',
    },
    {
      acceptance: 50,
      cta_type: 'pain',
      cta: 'Financial industry clients likely already have a secrity....',
      campaign: 'Enterprise Security/DevOps managers',
    },
    {
      acceptance: 36,
      cta_type: 'persona',
      cta: 'Financial industry clients likely already have a secrity....',
      campaign: 'Priority 1 DevWeek: Best in Class conference o...',
    },
    {
      acceptance: 61,
      cta_type: 'connection',
      cta: 'Doppler helps streamlining secret management pre...',
      campaign: 'Causeal sequence: MM devops, security, SREs',
    },
    {
      acceptance: 50,
      cta_type: 'pain',
      cta: 'Financial industry clients likely already have a secrity....',
      campaign: 'Enterprise Security/DevOps managers',
    },
    {
      acceptance: 36,
      cta_type: 'persona',
      cta: 'Financial industry clients likely already have a secrity....',
      campaign: 'Priority 1 DevWeek: Best in Class conference o...',
    },
  ]);

  return (
    <Flex direction={'column'} my={'lg'}>
      <DataGrid
        data={more ? data : data.slice(0, 5)}
        highlightOnHover
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
            minSize: 240,
            maxSize: 240,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLetterT color='gray' size={'0.9rem'} />
                <Text color='gray'>Acceptance</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { acceptance } = cell.row.original;

              return (
                <Flex w={'100%'} h={'100%'} px={'sm'} align={'center'}>
                  <Flex align={'center'} gap={'sm'}>
                    <Badge color='green' size='lg'>
                      {acceptance}$
                    </Badge>
                    <Text fw={500} color='gray'>
                      (2 / 2 Converted)
                    </Text>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'cta_type',
            minSize: 230,
            maxSize: 230,
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLetterT color='gray' size={'0.9rem'} />
                <Text color='gray'>CTA Type</Text>
              </Flex>
            ),

            cell: (cell) => {
              const { cta_type } = cell.row.original;

              return (
                <Flex w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                  <Badge size='lg' color={valueToColor(theme, cta_type)}>
                    {cta_type} based
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'cta',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconLetterT color='gray' size={'0.9rem'} />
                <Text color='gray'>CTA</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { cta } = cell.row.original;

              return (
                <Flex gap={'sm'} w={'100%'} px={'sm'} h={'100%'} align={'center'}>
                  <Text fw={500} color='gray'>
                    {cta}
                  </Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'campaign',
            header: () => (
              <Flex align={'center'} gap={'3px'}>
                <IconFileUnknown color='gray' size={'0.9rem'} />
                <Text color='gray'>Campaign</Text>
              </Flex>
            ),
            enableResizing: true,
            cell: (cell) => {
              const { campaign } = cell.row.original;

              return (
                <Flex align={'center'} px={'sm'} gap={'xs'} py={'lg'} w={'100%'} h={'100%'}>
                  <Text fw={500} color='gray'>
                    {campaign}
                  </Text>
                </Flex>
              );
            },
          },
        ]}
        options={{
          enableFilters: true,
        }}
        //   loading={loading}
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
      <Flex justify={'center'} mt={'lg'}>
        <Button
          variant='outline'
          color='gray'
          onClick={() => setMore(!more)}
          rightIcon={!more ? <IconChevronDown size={'1rem'} /> : <IconChevronUp size={'1rem'} />}
        >
          {!more ? 'Show' : 'Hide'} {data.length - 5} more
        </Button>
      </Flex>
    </Flex>
  );
}
