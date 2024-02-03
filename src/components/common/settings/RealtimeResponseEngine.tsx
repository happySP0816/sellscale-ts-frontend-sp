import { Box, Card, Flex, Switch, Text, Title, UnstyledButton } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons';
import { booleanFilterFn, DataGrid, stringFilterFn } from 'mantine-data-grid';

export default function RealtimeResponseEngine() {
  const data = [
    {
      emoji: '👍🏽',
      label: 'Objection',
      content: "When prospects have hesitations. SellScale's AI uses a top objection-handling model to save deals.",
      responsdAI: true,
    },
    {
      emoji: '🔥',
      label: 'Next steps',
      content: 'When further action is required in the convo. SellScale AI will do its best to engage.',
      responsdAI: false,
    },
    {
      emoji: '🏥',
      label: 'Revival',
      content: 'When prospects have not recently engaged. SellScale uses this status to re-engage.',
      responsdAI: true,
    },
    {
      emoji: '❓',
      label: 'Question',
      content: 'When prospects have a question. SellScale will answer generic questions, but specific ones like pricing will be redirected.',
      responsdAI: true,
    },
  ];
  return (
    <Card withBorder shadow='md'>
      <Title order={4}>Realtime Response Engine (Coming soon ⚠️)</Title>
      <Flex align={'center'} gap={'xs'}>
        <Text color='gray'  fz='sm'>Configure how you want SellScale AI to manage replies. Alternately, edit <a href='/campaigns' color='blue'>SellScale AI's responses <IconExternalLink color='#228be6' size={'1rem'} /></a></Text>
          
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
              const { emoji, label } = cell.row.original;
              return (
                <Flex justify={'center'} align={'center'} direction={'row'} gap={4} w={'100%'} h={'100%'}>
                  <div style={{backgroundColor: '#ECF3FE', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {emoji}
                  </div>
                  <Text fw={700} size={'lg'} ml='4px'>
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
            maxSize: 200,
            cell: (cell) => {
              const { responsdAI } = cell.row.original;

              return (
                <Box>
                  <Flex justify={'left'} align={'left'} gap={'sm'} w={'100%'} h={'100%'}>
                    <Text fw={500} color='gray' lineClamp={3}>
                      SellScale AI:
                    </Text>
                    <Switch defaultChecked={responsdAI} />
                  </Flex>
                  <Text fz='xs' color='gray' fw={500} mt='8px'>
                    Respond{responsdAI ? ' with ' : ' by '}<b style={{color: responsdAI ? '#2F98C1' : '#333'}}>{responsdAI ? 'SellScale AI' : 'myself'}</b>
                  </Text>
                </Box>
              );
            },
            filterFn: booleanFilterFn,
          },
        ]}
      />
    </Card>
  );
}
