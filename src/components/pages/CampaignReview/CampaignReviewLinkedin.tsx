import { Avatar, Badge, Button, Collapse, Divider, Flex, Group, Modal, Text, useMantineTheme } from '@mantine/core';
import { IconChecks, IconChevronDown, IconChevronUp, IconEdit, IconMessages, IconPencil, IconTargetArrow, IconUsers, IconXboxX } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { valueToColor } from '@utils/general';

export const Sequence = () => {
  return (
    <Flex direction={'column'} p={'lg'} style={{ border: '3px solid #0f6cbf' }} h={280}>
      <Text color='#0f6cbf' size={'lg'} fw={500}>
        # of Contacts: {523}
      </Text>
      <Text color='#0f6cbf' size={'lg'} fw={500}>
        # of steps in sequence: {4} steps
      </Text>
    </Flex>
  );
};

export const Contact = () => {
  const [contactData, setContactData] = useState<any>();
  const [showAll, setShowAll] = useState(true);
  const [filterData, setFilterData] = useState<any>();
  const theme = useMantineTheme();
  const handleShowAll = () => {
    setShowAll(!showAll);
  };
  useEffect(() => {
    const res = [
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 1,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 2,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 3,
        content: `Director Molecular Research, KSL Biomedical`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 3,
        content: `CEO, Penumbra Inc`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 5,
        content: `CEO, Penumbra Inc`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 1,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 2,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 3,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 4,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 1,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 4,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
      {
        avatar: '',
        username: 'Aaron Mackey',
        score: 1,
        content: `VP, Head of AI and ML, Sonata Therapeutics`,
      },
    ];
    const res_filter = [
      {
        type: 'job title',
        jobs: [
          'Software Engineer',
          'Data Scientist',
          'DevOps Engineer',
          'Full Stack Developer',
          'Game Developer',
          'IT Project Manager',
          'Web Developer',
          'Big Data analyst',
          'Data Scientist',
          'Blockchain Developer',
        ],
      },
      {
        type: 'industry',
        jobs: ['Software and Tech', 'Automotive'],
      },
      {
        type: 'experience',
        jobs: ['Less than 1 Year'],
      },
      {
        type: 'bio & job description',
        jobs: ['Engeneering & Technical'],
      },
    ];
    setFilterData(res_filter);
    setContactData(res);
  }, []);

  return (
    <Flex p={'sm'} style={{ border: '1px solid #e3f0fe', borderRadius: '6px' }}>
      {' '}
      <Flex direction={'column'} p={'md'} gap={'sm'} w={'100%'}>
        {filterData?.map((item: any, index: number) => {
          return (
            <Flex direction={'column'}>
              <Text color='gray' tt={'uppercase'} fw={500} size={'sm'}>
                {item?.type}
              </Text>
              <Group>
                {item?.jobs?.map((job: string) => {
                  return (
                    <Text
                      bg={valueToColor(theme, item?.type)}
                      px={8}
                      size={'xs'}
                      style={{ borderRadius: '6px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}
                    >
                      {job}
                    </Text>
                  );
                })}
              </Group>
            </Flex>
          );
        })}
      </Flex>
      <Flex
        direction={'column'}
        p={'md'}
        gap={'xs'}
        bg={'#f4f9ff'}
        w={'100%'}
        style={{ border: '1px solid #89c3fc', borderRadius: '6px', borderStyle: 'dashed' }}
      >
        <Flex align={'center'} gap={'sm'} ml={'sm'}>
          <IconUsers size={'1rem'} color='#228be6' />
          <Text tt={'uppercase'} color='blue'>
            example contacts
          </Text>
        </Flex>
        <Flex direction={'column'} gap={3}>
          {contactData?.map((item: any, index: number) => {
            return !showAll || index < 5 ? (
              <Flex key={index} align={'center'} gap={'xs'}>
                <Avatar src={item?.avatar} size={46} radius={'xl'} />
                <Flex direction={'column'} w={'100%'}>
                  <Flex align={'center'} justify={'space-between'} w={'100%'}>
                    <Text fw={500} size={'sm'}>
                      {item?.username}
                    </Text>
                    <Badge
                      size='md'
                      color={
                        item?.score == 0
                          ? 'red'
                          : item?.score == 1
                          ? 'orange'
                          : item?.score == 2
                          ? 'yellow'
                          : item?.score == 3
                          ? 'green'
                          : item?.score == 4
                          ? 'blue'
                          : 'gray'
                      }
                      variant='light'
                    >
                      {item?.score == 0
                        ? 'Very Low'
                        : item?.score == 1
                        ? 'Low'
                        : item?.score == 2
                        ? 'Medium'
                        : item?.score == 3
                        ? 'High'
                        : item?.score == 4
                        ? 'Very High'
                        : 'Not Scored'}
                    </Badge>
                  </Flex>
                  <Text color='gray' size={'xs'} mt={3}>
                    {item?.content}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <></>
            );
          })}
        </Flex>
        <Flex w={'100%'} justify={'end'}>
          {contactData?.length > 5 && (
            <Button variant='subtle' color='blue' onClick={handleShowAll} p={0}>
              {showAll ? `+${contactData.length - 5} more` : 'show less'}
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export const Messaging = () => {
  const [opened, { toggle }] = useDisclosure(false);
  const [openid, setOpenId] = useState<number>(0);
  const messageData = [
    {
      step: 'introduction',
      avatar: '',
      username: 'Adam Meehan',
      message: `Hey Brandon! First off, congrats on your recent 20-year anniversary at lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.`,
      used: 5,
    },
    {
      step: 'pain points opener',
      avatar: '',
      username: 'Adam Meehan',
      message: `Hey Brandon! First off, congrats on your recent 20-year anniversary at lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.`,
      used: 5,
    },
    {
      step: 'about us',
      avatar: '',
      username: 'Adam Meehan',
      message: `Hey Brandon! First off, congrats on your recent 20-year anniversary at lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.`,
      used: 5,
    },
  ];
  const handleToggle = (id: number) => {
    toggle();
    setOpenId(id);
  };
  useEffect(() => {
    toggle();
  }, []);
  return (
    <Flex p={'md'} direction={'column'} gap={'md'} style={{ border: '1px solid #e3f0fe', borderRadius: '6px' }}>
      {messageData?.map((item, index) => {
        return (
          <>
            <Flex w={'100%'} align={'center'} gap={8}>
              <IconTargetArrow color='gray' />
              <Flex>
                <Text tt={'uppercase'} color='gray' className='w-max' fw={500}>
                  step {index + 1}:
                </Text>
              </Flex>
              <Flex>
                <Text className='w-max' tt={'uppercase'} fw={500}>
                  {item?.step}
                </Text>
              </Flex>
              <Divider w={'100%'} />
              <Button
                tt={'uppercase'}
                rightIcon={openid === index && opened ? <IconChevronUp size={'0.9rem'} /> : <IconChevronDown size={'0.9rem'} />}
                onClick={() => handleToggle(index)}
                variant='light'
                size='xs'
                radius='xl'
              >
                {openid === index && opened ? 'hide' : 'show'}
              </Button>
            </Flex>
            {openid === index && (
              <Collapse in={opened}>
                <Flex
                  direction={'column'}
                  p={'md'}
                  gap={'xs'}
                  bg={'#f4f9ff'}
                  style={{ border: '1px solid #89c3fc', borderRadius: '6px', borderStyle: 'dashed' }}
                >
                  <Flex align={'center'} justify={'space-between'}>
                    <Flex align={'center'} gap={'sm'}>
                      <IconMessages color='#228be6' />
                      <Text tt={'uppercase'} color='blue' fw={600}>
                        example message
                      </Text>
                    </Flex>
                    <Button leftIcon={<IconPencil size={'0.8rem'} />} variant='light' size='xs' radius='xl'>
                      Edit
                    </Button>
                  </Flex>
                  <Flex align={'center'} gap={'sm'}>
                    <Avatar src={item?.avatar} radius={'xl'} />
                    <Text fw={600} size={'sm'}>
                      {item?.username}
                    </Text>
                  </Flex>
                  <Text lineClamp={4} size={'xs'} fs='italic' fw={500}>
                    {item?.message}
                  </Text>
                  <Badge w={'fit-content'} size='lg'>
                    {item?.used} Personalization Used
                  </Badge>
                </Flex>
              </Collapse>
            )}
          </>
        );
      })}
    </Flex>
  );
};

export default function CampaignReviewLinkedin() {
  const [opened, { open, close }] = useDisclosure(false);
  const [steps, setSteps] = useState('sequence');
  const handleGoBack = () => {
    if (steps === 'sequence') return;
    if (steps === 'contact') setSteps('sequence');
    if (steps === 'messaging') setSteps('contact');
  };

  const handleGoNext = () => {
    if (steps === 'sequence') setSteps('contact');
    if (steps === 'contact') setSteps('messaging');
    if (steps === 'messaging') return;
  };
  return (
    <>
      <Button onClick={open}>Open centered Modal</Button>
      <Modal opened={opened} onClose={close} title={<Text color='gray'>Campaign Review:</Text>} size={'xl'} centered>
        <Flex direction={'column'} gap={'md'}>
          <Flex align={'center'} gap={'sm'}>
            <Avatar src={''} size={'sm'} radius={'xl'} />
            <Text fw={600}>HR Leaders Tier 1-Gov, Pharma, Business Support 1500+ employees in EMEA</Text>
          </Flex>
          <Flex align={'center'} gap={'md'}>
            <Badge color='blue' w={'100%'} variant='filled' size='lg'>
              1. Sequence
            </Badge>
            <Divider w={'100%'} size={2} color={steps === 'contact' || steps === 'messaging' ? '#89c3fc' : '#ced4da'} />
            <Badge color='blue' w={'100%'} variant={steps === 'contact' || steps === 'messaging' ? 'filled' : 'outline'} size='lg'>
              2. Contacts
            </Badge>
            <Divider w={'100%'} size={2} color={steps === 'messaging' ? '#89c3fc' : '#ced4da'} />
            <Badge color='blue' w={'100%'} variant={steps === 'messaging' ? 'filled' : 'outline'} size='lg'>
              3. Messaging
            </Badge>
          </Flex>
          {steps === 'sequence' ? <Sequence /> : steps === 'contact' ? <Contact /> : <Messaging />}
          <Flex align={'center'} justify={'space-between'}>
            <Button variant='outline' leftIcon={<IconChecks size={'0.9rem'} />} px={40}>
              Mark as Reviewed
            </Button>
            <Flex align={'center'} gap={'sm'}>
              <Button onClick={handleGoBack} disabled={steps === 'sequence'} w={180}>
                Go back
              </Button>
              <Button onClick={handleGoNext} w={180}>
                Next
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
}
