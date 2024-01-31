import { Card, Flex, Switch, Text, Title, UnstyledButton } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons';
import { booleanFilterFn, DataGrid, stringFilterFn } from 'mantine-data-grid';

export default function RealtimeResponseEngine() {
  const data = [
    {
      label: '👍🏽 Objection',
      content: "When prospects have hesitations. SellScale's AI uses a top objection-handling model to save deals.",
      responsdAI: true,
    },
    {
      label: '➡ Next steps',
      content: 'When further action is required in the convo. SellScale AI will do its best to engage.',
      responsdAI: false,
    },
    {
      label: '🏥 Revival',
      content: 'When prospects have not recently engaged. SellScale uses this status to re-engage.',
      responsdAI: true,
    },
    {
      label: '❓ Question',
      content: 'When prospects have a question. SellScale will answer generic questions, but specific ones like pricing will be redirected.',
      responsdAI: true,
    },
  ];
  return (
    <Card withBorder shadow='md'>
      <Title order={4}>Realtime Response Engine (Coming soon ⚠️)</Title>
      <Flex align={'center'} gap={'xs'}>
        <Text color='gray'>Configure how you want SellScale AI to manage replies. Alternately, edit <a href='/campaigns' color='blue'>SellScale AI's responses <IconExternalLink color='#228be6' size={'1rem'} /></a></Text>
          
      </Flex>
      <DataGrid
        data={data}
        highlightOnHover
        withSorting
        withBorder
        verticalSpacing={'xs'}
        withColumnBorders
        sx={{ cursor: 'pointer' }}
        mt={'lg'}
        styles={{
          headerCellContent: {},
        }}
        columns={[
          {
            accessorKey: 'reply_rate',
            header: `Reply Label`,
            enableSorting: true,
            maxSize: 180,
            filterFn: stringFilterFn,
            cell: (cell) => {
              const { label } = cell.row.original;
              return (
                <Flex justify={'center'} align={'center'} direction={'column'} gap={4} w={'100%'} h={'100%'}>
                  <Text fw={700} size={'lg'}>
                    {label}
                  </Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: 'about',
            header: 'About',
            enableSorting: true,
            cell: (cell) => {
              const { content } = cell.row.original;

              return (
                <Flex justify={'center'} align={'center'} direction={'column'} gap={4} w={'100%'} h={'100%'}>
                  <Text fw={500} size={'sm'} color='gray' lineClamp={3} className=' whitespace-pre-line'>
                    {content}
                  </Text>
                </Flex>
              );
            },
            filterFn: stringFilterFn,
          },
          {
            accessorKey: 'respond_ai',
            header: `Respond with AI`,
            enableSorting: true,
            maxSize: 170,
            cell: (cell) => {
              const { responsdAI } = cell.row.original;

              return (
                <Flex justify={'center'} align={'center'} gap={'sm'} w={'100%'} h={'100%'}>
                  <Text fw={500} color='gray' lineClamp={3}>
                    SellScale AI:
                  </Text>
                  <Switch defaultChecked={responsdAI} disabled />
                </Flex>
              );
            },
            filterFn: booleanFilterFn,
          },
        ]}
      />
    </Card>
  );
}
