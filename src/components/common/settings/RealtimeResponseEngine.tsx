import { userDataState, userTokenState } from '@atoms/userAtoms';
import { syncLocalStorage } from '@auth/core';
import { Box, Button, Card, Flex, Popover, Select, Switch, Text, Title, Tooltip, UnstyledButton } from '@mantine/core';
import { IconExternalLink, IconInfoCircle } from '@tabler/icons';
import { updateClientSDR } from '@utils/requests/updateClientSDR';
import { booleanFilterFn, DataGrid, stringFilterFn } from 'mantine-data-grid';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDisclosure } from '@mantine/hooks';

export default function RealtimeResponseEngine() {
  const [userData, setUserData] = useRecoilState(userDataState);
  const userToken = useRecoilValue(userTokenState);

  const sdrMetadata = userData?.meta_data as
    | {
        response_options?: {
          use_objections: boolean;
          use_next_steps: boolean;
          use_revival: boolean;
          use_questions: boolean;
          use_scheduling: boolean;
          use_circle_back: boolean;
        };
        [key: string]: any;
      }
    | undefined;

  const update = async (meta_data: Record<string, any>) => {
    const response = await updateClientSDR(userToken, undefined, undefined, undefined, undefined, meta_data);
    await syncLocalStorage(userToken, setUserData);
  };

  console.log(userData);

  const data = [
    {
      emoji: '👍🏽',
      label: 'Objection',
      key: 'use_objections',
      content: "When prospects have hesitations. SellScale's AI uses a top objection-handling model to save deals.",
      automated: sdrMetadata?.response_options?.use_objections ?? true,
    },
    {
      emoji: '🔥',
      label: 'Next steps',
      key: 'use_next_steps',
      content: 'When further action is required in the convo. SellScale AI will do its best to engage.',
      automated: sdrMetadata?.response_options?.use_next_steps ?? true,
    },
    {
      emoji: '🏥',
      label: 'Revival',
      key: 'use_revival',
      content: 'When prospects have not recently engaged. SellScale uses this status to re-engage.',
      automated: sdrMetadata?.response_options?.use_revival ?? true,
    },
    {
      emoji: '❓',
      label: 'Question',
      key: 'use_questions',
      content: 'When prospects have a question. SellScale will answer generic questions, but specific ones like pricing will be redirected.',
      automated: sdrMetadata?.response_options?.use_questions ?? true,
    },
    {
      emoji: '🔄',
      label: 'Circle Back',
      key: 'use_circle_back',
      content: 'When a prospect has not responded to a previous message. SellScale will use this status to re-engage.',
      automated: sdrMetadata?.response_options?.use_circle_back ?? true,
    },
    {
      emoji: '🗓️',
      label: 'Scheduling',
      key: 'use_scheduling',
      content: 'When a prospect moves to scheduling, SellScale will help schedule the conversation.',
      automated: sdrMetadata?.response_options?.use_scheduling ?? true,
    },
  ];
  return (
    <Card withBorder shadow='md'>
      <Title order={4}>Realtime Response Engine (Coming soon ⚠️)</Title>
      <Flex align={'center'} gap={'xs'}>
        <Text color='gray' fz='sm'>
          Configure how you want SellScale AI to manage replies. Alternately, edit{' '}
          <a href='/campaigns' color='blue'>
            SellScale AI's responses <IconExternalLink color='#228be6' size={'1rem'} />
          </a>
        </Text>
      </Flex>
      <Flex gap={'4px'} direction={'column'} mt={'sm'}>
        <Text fz='sm' fw={700}>
          Sellscale AI Response Time:
        </Text>
        <Flex gap={'xs'} align={'center'} fz='sm' style={{ color: 'gray' }}>
          Wait{' '}
          <Select
            data={[
              { value: '0', label: '0 hours' },
              { value: '3', label: '3 hours' },
              { value: '8', label: '8 hours' },
              { value: '24', label: '24 hours' },
            ]}
            size='xs'
            style={{ width: '100px' }}
            defaultValue='0'
          />{' '}
          before attempting to respond
        </Flex>
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
            // maxSize: 180,
            filterFn: stringFilterFn,
            cell: (cell) => {
              const { emoji, label, content } = cell.row.original;
              const [opened, { close, open }] = useDisclosure(false);
              return (
                <Flex justify={'center'} align={'center'} direction={'row'} gap={4} w={'100%'} h={'100%'}>
                  <div
                    style={{
                      backgroundColor: '#ECF3FE',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {emoji}
                  </div>
                  <Flex direction={'column'}>
                    <Flex align={'center'} gap={'xs'}>
                      <Text fw={700} size={'sm'} ml='4px'>
                        {label}
                      </Text>
                      {/* <Tooltip.Floating label={content} refProp='innerRef'>
                        <IconInfoCircle color='gray' size={'0.8rem'} />
                      </Tooltip.Floating> */}
                      <Tooltip label={content}>
                        <Box>
                          <IconInfoCircle color='gray' size={'0.8rem'} />
                        </Box>
                      </Tooltip>
                    </Flex>
                    {/*  */}
                  </Flex>
                </Flex>
              );
            },
          },
          // {
          //   accessorKey: 'about',
          //   header: 'About',
          //   enableSorting: true,
          //   cell: (cell) => {
          //     const { content } = cell.row.original;

          //     return (
          //       <Flex justify={'center'} align={'center'} direction={'column'} gap={4} w={'100%'} h={'100%'}>
          //         <Text fw={500} size={'sm'} color='gray' lineClamp={3} className=' whitespace-pre-line'>
          //           {content}
          //         </Text>
          //       </Flex>
          //     );
          //   },
          //   filterFn: stringFilterFn,
          // },
          {
            accessorKey: 'respond_ai',
            header: `Respond with AI`,
            enableSorting: true,
            maxSize: 230,
            cell: (cell) => {
              const { automated } = cell.row.original;

              return (
                <Box w={'100%'}>
                  <Flex justify={'space-between'} align={'center'} gap={'sm'} w={'100%'} h={'100%'} pt={'8px'}>
                    {/* <Text fw={500} color='gray' lineClamp={3}>
                      Respond With SellScale AI:
                    </Text> */}
                    <Text fz='xs' color={automated ? '#228be6' : 'gray'} fw={600} w={'100%'}>
                      Respond{automated ? ' with SellScale AI' : ' by myself'}
                    </Text>
                    <Switch
                      defaultChecked={automated}
                      onChange={(e) => {
                        const newMetaData = {
                          response_options: {
                            ...sdrMetadata?.response_options,
                            [cell.row.original.key]: e.target.checked,
                          },
                        };
                        update(newMetaData);
                      }}
                    />
                  </Flex>
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
