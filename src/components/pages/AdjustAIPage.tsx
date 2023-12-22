import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
  rem,
  RingProgress,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconExternalLink, IconRefresh, IconSearch, IconSelector } from '@tabler/icons';
import { IconSparkles } from '@tabler/icons-react';

export default function AdjustPage() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [row, setRow] = useState([
    {
      request_name: 'Launch new campaign: Devops managers',
      request_content: 'Launch a new campaign targetting devops managers that will outreach to mid tier managers only',
      percentage: 63,
      create_date: 'Fri, 03, Nov 2023',
      create_time: '01:02:04 GMT',
      status: 'In Progress',
    },
    {
      request_name: 'Pull 4,000 New DevOps Prospects',
      request_content: 'Pull 4,000 new contacts to put into my DevOps campaign so I can reach out to way more people there!',
      percentage: 0,
      create_date: 'Fri, 03, Nov 2023',
      create_time: '01:02:04 GMT',
      status: 'Queued',
    },
    {
      request_name: 'Adjust prospect filtering',
      request_content: 'Can you make sure we dont reach out to `heads of marketing` anymore?',
      percentage: 100,
      create_date: 'Fri, 03, Nov 2023',
      create_time: '01:02:04 GMT',
      status: 'Completed',
    },
    {
      request_name: 'Copy changes',
      request_content: 'this follow up sucks. can you make it way more `concise`?',
      percentage: 100,
      create_date: 'Fri, 03, Nov 2023',
      create_time: '01:02:04 GMT',
      status: 'Completed',
    },
    {
      request_name: 'Launch new campaign: New York Region',
      request_content: 'I want to target the NY region instead of California only',
      percentage: 100,
      create_date: 'Fri, 03, Nov 2023',
      create_time: '01:02:04 GMT',
      status: 'Completed',
    },
    {
      request_name: 'Pull prospect list',
      request_content: 'can you pull more prospects for me?',
      percentage: 100,
      create_date: 'Fri, 03, Nov 2023',
      create_time: '01:02:04 GMT',
      status: 'Completed',
    },
  ]);
  const rows = row.map((element, idx) => (
    <tr key={idx}>
      <td
        style={{
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Flex align={'center'} gap={'sm'}>
          <RingProgress
            size={60}
            thickness={6}
            sections={[{ value: element?.percentage, color: element?.percentage < 80 ? 'blue' : 'green' }]}
            label={
              <Text c='gray' fw={700} ta='center' size='10px'>
                {element?.percentage}%
              </Text>
            }
          />
          <Box>
            <Text color='gray.8' fw={600} size={'md'}>
              {element.request_name}
            </Text>
            <Text color='gray'>{element.request_content}</Text>
          </Box>
        </Flex>
      </td>
      <td
        style={{
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color='gray.8' fw={600}>
          {element.create_date}
        </Text>
        <Text color='gray'>{element.create_time}</Text>
      </td>
      <td
        style={{
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Badge size='md' color={element?.status === 'Queued' ? 'gray' : element?.status === 'Completed' ? 'green' : 'yellow'}>
          {element?.status}
        </Badge>
      </td>
    </tr>
  ));
  return (
    <Box px={80} py={30} bg={'white'} mih={'100vh'}>
      <Group mb={'lg'}>
        <Text size={25} fw={600}>
          Adjust AI
        </Text>
        <Badge leftSection={<IconRefresh size={10} />}>2 Requests Pending</Badge>
      </Group>
      <Divider />
      <Flex gap={50} my={'lg'}>
        <Box w={'80%'}>
          <Text>
            Give the AI feedback and it will address it within a few minutes to hours based on complexity. Need immediate help? Contact SellScale team via{' '}
            <Button variant='transparent' p={0} size='md' color='#228be6'>
              <span style={{ color: '#228be6', marginRight: '4px' }}>Slack</span>
              <IconExternalLink size={18} color='#228be6' />
            </Button>
          </Text>
          <Text color={'gray'} size={10} fw={600}>
            SUGGESTIONS:
          </Text>
          <Box>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }}>
              ADJUST PROJECT FILTERS
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }}>
              ADJUST MESSAGING
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }}>
              PULL PROSPECT LIST
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }}>
              ADD A SEAT
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }}>
              NEW OUTREACH STRATEGY
            </Badge>
          </Box>
        </Box>

        <Box w={'100%'} style={{ border: '2px solid #d6e9fd', borderRadius: '8px' }}>
          <Flex p={'sm'} gap={3} bg='#f4f9ff' style={{ borderRadius: '9px' }} align={'center'}>
            <IconSparkles color='#228be6' size={18} />
            <Text color='blue' fw={600}>
              Add Your Feedback Here:
            </Text>
          </Flex>
          <Divider />
          <Textarea variant='unstyled' minRows={3} placeholder='I want to launch a new campaign ...' px={'md'}></Textarea>
          <Flex w={'100%'} justify={'end'} p={'md'}>
            <Button radius={'xl'} px={30} left={0} onClick={open}>
              Send Request
            </Button>
          </Flex>
        </Box>
      </Flex>
      <Divider />
      <Flex justify={'space-between'} mt={'xl'} align={'center'}>
        <Text size={20} fw={600}>
          Request History
        </Text>
        <TextInput rightSection={<IconSearch size={16} color='gray' />} placeholder='Search' />
      </Flex>
      <Box mt={'md'}>
        <Stack style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: '1px solid #dee2e6' }}>
          <Table>
            <thead>
              <tr
                style={{
                  background: '#f9f9fd',
                }}
              >
                <th
                  style={{
                    textAlign: 'left',
                    paddingTop: rem(15),
                    paddingBottom: rem(15),
                    width: '70%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Text fw={700}>Request Name</Text>
                  <IconSelector size={16} />
                </th>
                <th
                  style={{
                    paddingTop: rem(15),
                    paddingBottom: rem(15),
                  }}
                >
                  <Text fw={700}>Creation Date</Text>
                </th>
                <th
                  style={{
                    paddingTop: rem(15),
                    paddingBottom: rem(15),
                  }}
                >
                  <Text fw={700}>Status</Text>
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Stack>
        <Flex
          w={'100%'}
          justify={'space-between'}
          p={20}
          style={{
            border: '1px solid #dee2e6',
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
          }}
        >
          <Flex align={'center'} gap={'sm'}>
            <Text color='gray'>Show</Text>
            <Select style={{ width: '150px' }} data={['Show 25 rows', 'Show 5 rows', 'Show 10 rows']} defaultValue='Show 25 rows' />
            <Text color='gray'>of 10</Text>
          </Flex>
          <Flex>
            <Select
              style={{
                width: '80px',
              }}
              data={['01', '02', '03', '04', '05', '06', '071']}
              defaultValue='01'
              radius={0}
            />
            <Text
              style={{
                display: 'flex',
                justifyContent: 'center',

                border: '1px solid #ced4da',
                alignItems: 'center',
              }}
              size={'sm'}
              px={10}
            >
              of {page} pages
            </Text>
            <Button variant='default' px={5} radius={0}>
              <IconChevronLeft color='gray' />
            </Button>
            <Button variant='default' px={5} radius={0}>
              <IconChevronRight color='gray' />
            </Button>
          </Flex>
        </Flex>
      </Box>
      <Modal opened={opened} onClose={close} title='Comming Soon'>
        {/* Modal content */}
      </Modal>
    </Box>
  );
}
