import { useEffect, useState } from 'react';
import { userTokenState } from "@atoms/userAtoms";
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
import { showNotification } from "@mantine/notifications";
import { useRecoilValue } from "recoil";
import { postAIRequest } from '@utils/requests/postAIRequest'; 
import { getAIRequests } from '@utils/requests/getAIRequests';

interface AIRequestData {
  id: number;
  title: string;
  description: string;
  percent_complete: number;
  creation_date: string;
  due_date: string;
  status: string;
}

interface TableRow {
  request_name: string;
  request_content: string;
  percentage: number;
  create_date: string;
  create_time: string;
  status: string;
}


export default function AdjustPage() {
  
  
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  // State for the textarea content
  const [textareaContent, setTextareaContent] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Function to handle badge clicks
  const handleBadgeClick = (content: string) => {
    setTextareaContent(content);
  };

  // Function to handle AI request submission
  const handleSubmit = async () => {
    setSubmittingRequest(true);
    if (!textareaContent.trim()) {
      // Show notification if the text box is empty
      showNotification({
        title: 'Error',
        message: 'The text box is empty. Please enter some content before submitting.',
        color: 'red',
      });
      close();
      setSubmittingRequest(false);
      return; 
    }

    try {
      await postAIRequest(userToken, textareaContent);
      // Assuming response is true if the submission is successful
      // Show a success notification
      showNotification({
        title: 'Success',
        message: 'Your request has been submitted! Please give us 24 hours or less to get back to you.',
        color: 'green'
      });
      setSubmittingRequest(false);

      // Reset textareaContent to empty and close the modal
      setTextareaContent('');
      close();
      // Refetch AI requests after successful submission
      await fetchAIRequests();
    } catch (error) {
      // Log and handle the error case
      console.error('AI Request Submission failed:', error);
      close();    
      showNotification({
        title: 'Error',
        message: 'Failed to submit AI request',
        color: 'red'
      });
      setSubmittingRequest(false);
    }
  };

  const [row, setRow] = useState<TableRow[]>([]);

  const fetchAIRequests = async () => {
    try {
      const response = await getAIRequests(userToken);
      if (response && Array.isArray(response.data)) {
        const formattedRows: TableRow[] = response.data.map((req: AIRequestData) => ({
          request_name: req.title,
          request_content: req.description,
          percentage: req.percent_complete,
          create_date: new Date(req.creation_date).toLocaleDateString(),
          create_time: new Date(req.creation_date).toLocaleTimeString(),
          status: req.status
        }));
        setRow(formattedRows);
      } else {
        setRow([]);
      }
    } catch (error) {
      console.error('Error fetching AI requests:', error);
      setRow([]);
    }
  };

  useEffect(() => {
    fetchAIRequests();
  }, []); 
    
  const numQueuedTasks = row.filter((element) => element.status === 'QUEUED').length;
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
        <Badge leftSection={<IconRefresh size={10} />}>{numQueuedTasks} Requests Pending</Badge>
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
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }} 
            onClick={() => handleBadgeClick(
              "I noticed that I reached out to a prospect named [prospect name]\n\n" +
              "This prospect is not qualified for [XYZ reasons].\n\n" +
              "I want to adjust my filters for the future so I no longer contact prospects like them."
            )}>
              ADJUST PROJECT FILTERS
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }} 
            onClick={() => handleBadgeClick(
              "I just saw messaging go out that said: '[copy paste messaging here]' sent to a prospect named [prospect name].\n\n" +
              "I want to adjust this messaging for the future. Here are the edits I would make:\n" +
              "- [edit 1]\n" +
              "- [edit 2]"            
              )}>
              ADJUST MESSAGING
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }} 
            onClick={() => handleBadgeClick(
              "I would like to pull a list of [number] prospects who match the following criteria:\n" +
              "- [criteria 1]\n" +
              "- [criteria 2]\n" +
              "- [criteria 3]"
              )}>
              PULL PROSPECT LIST
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }} 
            onClick={() => handleBadgeClick(
              "I want to add a colleague named [name] to my SellScale organization. Please help me add them!"
              )}>
              ADD A SEAT
            </Badge>
            <Badge variant='outline' px={6} py={0} size='sm' radius={'lg'} mr={'sm'} style={{ cursor: 'pointer' }} 
            onClick={() => handleBadgeClick(
              "I want to launch a new outreach strategy called [strategy name].\n" +
              "I would be targeting [customer profile]. Here are some relevant details about this profile type:\n" +
              "- [item 1]\n" +
              "- [item 2]"
              )}>
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
            <Textarea 
              variant='unstyled' 
              minRows={3} 
              placeholder='I want to launch a new campaign ...' 
              px={'md'} 
              value={textareaContent}
              onChange={(event) => setTextareaContent(event.currentTarget.value)} // Add this line
            />          
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
        {
          rows.length > 0 && <TextInput rightSection={<IconSearch size={16} color='gray' />} placeholder='Search' />
        }
      </Flex>
      {rows.length > 0 && (
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
                      paddingTop: rem(16),
                      paddingBottom: rem(16),
                    }}
                  >
                    <Flex align={'center'} gap={'sm'}>
                      <IconSelector size={20} color='gray' />
                      <Text color='gray.8' fw={600} size={'md'}>
                        Request Name
                      </Text>
                    </Flex>
                  </th>
                  <th
                    style={{
                      paddingTop: rem(16),
                      paddingBottom: rem(16),
                    }}
                  >
                    <Text color='gray.8' fw={600}>
                      Date Created
                    </Text>
                  </th>
                  <th
                    style={{
                      paddingTop: rem(16),
                      paddingBottom: rem(16),
                    }}
                  >
                    <Text color='gray.8' fw={600}>
                      Status
                    </Text>
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
      )}

      {
        // If there are no rows, show this message instead
        rows.length === 0 && (
          <Box mt={'md'}>
            <Text color='gray' style={{ textAlign: 'center' }}>
              No AI requests found
            </Text>
          </Box>
        )
      }

      <Modal opened={opened} onClose={close} title='Please review your request before submitting:'>
        <div>
          {/* Display the text content for review */}
          <Box mb="xs" p="sm">
            <Text>{textareaContent}</Text>
          </Box>

          {/* Button to confirm submission */}
          <Button onClick={handleSubmit} loading={submittingRequest} radius="xl" color="green">
            Confirm and Submit
          </Button>
        </div>
      </Modal>
    </Box>
  );
}
