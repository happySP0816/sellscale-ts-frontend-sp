import { ActionIcon, Avatar, Box, Button, Card, Collapse, Divider, Flex, NumberInput, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandLinkedin,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconEdit,
  IconMail,
  IconMessages,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons';
import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import CreateSequence from './CreateSequence';

export function SequenceLibrary(props: any) {
  const [library, setLibrary] = useState([
    {
      sequenceName: 'Paign Point Sequence',
      campaign: 'Product Leaders in NY',
      sequenceType: 'Linkedin',
      steps: [
        {
          title: 'Personalized Opener',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
          fullname: 'Shelton Masimila',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
      ],
      assets: 5,
    },
    {
      sequenceName: 'Revival Sequence',
      campaign: 'Product Leaders in NY',
      sequenceType: 'Linkedin',
      steps: [
        {
          title: 'Personalized Opener',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
          fullname: 'Shelton Masimila',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
      ],
      assets: 4,
    },
    {
      sequenceName: 'Hiring Sequence',
      campaign: 'Senior Engineer Hiring',
      sequenceType: 'Mail',
      steps: [
        {
          title: 'Personalized Opener',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
          fullname: 'Shelton Masimila',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
      ],
      assets: 1,
    },
    {
      sequenceName: 'Paign Point Sequence',
      campaign: 'Product Leaders in NY',
      sequenceType: 'Linkedin',
      steps: [
        {
          title: 'Personalized Opener',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
          fullname: 'Shelton Masimila',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
      ],
      assets: 5,
    },
    {
      sequenceName: 'Hiring Sequence',
      campaign: 'Senior Engineer Hiring',
      sequenceType: 'Linkedin',
      steps: [
        {
          title: 'Personalized Opener',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
          fullname: 'Shelton Masimila',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
        {
          title: 'Follow-up',
          message:
            "Hey Brandon! First off, congrats on your recent 20-year anniversary at Lars Remodeling - that's truly impressive! Given your vast experience in the industry and your unique perspective as the President and Owner, I'd love to get your thoughts on what issues you're seeing in home remodeling.",
          avatar: '',
        },
      ],
      assets: 1,
    },
  ]);
  const itemsPerPage = 3;
  const [pages, setPages] = useState(Math.ceil(library.length / itemsPerPage));
  const [currentPage, setCurrentPage] = useState(1);

  const [selectSequence, setSelectSequence] = useState<number | null>(0);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = library.slice(startIndex, endIndex);

  const [step, setStep] = useState('all');

  return (
    <Card withBorder p={'lg'} w={500} h={'fit-content'}>
      <Flex direction={'column'} gap={'md'}>
        <Text fw={600} size={22}>
          Sequence Library
        </Text>
        <Flex align={'center'} justify={'space-between'} w={'100%'} bg={'#f3f4f6'} p={8} style={{ borderRadius: '8px' }}>
          <Flex>
            <Button onClick={() => setStep('all')} color={'gray'} variant={step === 'all' ? 'white' : 'tranparent'}>
              All
            </Button>
            <Button onClick={() => setStep('linkedin')} color={'gray'} variant={step === 'linkedin' ? 'white' : 'tranparent'}>
              Linkedin
            </Button>
            <Button onClick={() => setStep('mail')} color={'gray'} variant={step === 'mail' ? 'white' : 'tranparent'}>
              Email
            </Button>
          </Flex>
        </Flex>
        <TextInput rightSection={<IconSearch color='gray' size={'0.9rem'} />} placeholder='Search sequences' />
        <Flex direction={'column'} gap={'sm'}>
          {currentItems.map((item, index) => {
            return (
              <Box
                style={{ border: selectSequence === index ? '1px solid #228be6' : '1px solid #ced4da', borderRadius: '8px' }}
                p={'sm'}
                key={index}
                onClick={() => {
                  props.setData(item);
                  setSelectSequence(index);
                }}
              >
                <Text fw={700} size={16}>
                  {item.sequenceName}
                </Text>
                <Flex align={'center'} gap={3}>
                  <Text fw={500} color='gray' size={'xs'}>
                    Campaign:
                  </Text>
                  <Text fw={600} size={'xs'}>
                    {item.campaign}
                  </Text>
                </Flex>
                <Flex align={'center'} justify={'space-between'}>
                  <Flex align={'center'} gap={7}>
                    <Flex align={'center'} gap={5}>
                      {item.sequenceType === 'Linkedin' && <IconBrandLinkedin size={'1.1rem'} color='white' fill='#228bE6' />}
                      {item.sequenceType === 'Mail' && <IconMail size={'1.1rem'} color='white' fill='#228bE6' />}
                    </Flex>
                    <Divider orientation='vertical' />
                    <Text color='gray' fw={500} size={'xs'}>
                      {item.steps.length} Steps
                    </Text>
                    <Divider orientation='vertical' />
                    <Text color='gray' fw={500} size={'xs'}>
                      {item.assets} Assets
                    </Text>
                  </Flex>
                  <ActionIcon>
                    <IconTrash size={'0.9rem'} />
                  </ActionIcon>
                </Flex>
              </Box>
            );
          })}
        </Flex>
        <Flex style={{ border: '1px solid #ced4da', borderRadius: '8px' }} justify={'space-between'} align={'center'}>
          <Flex px={'sm'} align={'center'}>
            {Array.from({ length: pages }, (_, index) => (
              <Text
                color={currentPage === index + 1 ? '' : 'gray'}
                key={index}
                size={'xs'}
                fw={500}
                style={{ marginInline: '8px', cursor: 'pointer' }}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Text>
            ))}
          </Flex>
          <Flex>
            <Divider orientation='vertical' />
            <UnstyledButton
              color='gray'
              miw={40}
              mih={40}
              onClick={() => {
                if (currentPage > 1) setCurrentPage((prev) => prev - 1);
              }}
              style={{ backgroundColor: currentPage === 1 ? '#eeecec' : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconChevronLeft color='gray' size={'0.9rem'} style={{ cursor: currentPage === 1 ? 'no-drop' : '' }} />
            </UnstyledButton>
            <Divider orientation='vertical' />
            <UnstyledButton
              color='gray'
              miw={40}
              mih={40}
              onClick={() => {
                if (currentPage < pages) setCurrentPage((prev) => prev + 1);
              }}
              style={{ backgroundColor: currentPage === pages ? '#eeecec' : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconChevronRight color='gray' size={'0.9rem'} style={{ cursor: currentPage === pages ? 'no-drop' : '' }} />
            </UnstyledButton>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}

export function SequencePreview(props: any) {
  const [opened, setOpened] = useState(false);
  const [selectStep, setSelectStep] = useState<number | null>(null);
  console.log('================', props.data);
  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

  return (
    <Card withBorder p={'lg'} w={'100%'} h={'fit-content'}>
      <Flex direction={'column'} gap={'sm'}>
        <Flex gap={3}>
          <Text fw={600} size={22} color='gray'>
            Sequence Preview:
          </Text>
          <Text fw={600} size={22}>
            {props.data?.sequenceName ? props.data.sequenceName : ''}
          </Text>
        </Flex>
        {props.data?.steps.map((item: any, index: number) => {
          return (
            <>
              <Box style={{ border: selectStep === index ? '1px solid #228be6' : '1px solid #ced4da', borderRadius: '8px' }}>
                <Flex align={'center'} justify={'space-between'} px={'sm'} py={'xs'}>
                  <Flex align={'center'} gap={'xs'}>
                    <IconMessages color='#228be6' size={'0.9rem'} />
                    <Text color='gray' fw={500} size={'xs'}>
                      Message #{index + 1}:
                    </Text>
                    <Text fw={600} size={'xs'} ml={'-5px'}>
                      {item.title}
                    </Text>
                  </Flex>
                  <Flex gap={1} align={'center'}>
                    <ActionIcon>
                      <IconEdit size={'0.9rem'} />
                    </ActionIcon>
                    <ActionIcon>
                      <IconRefresh size={'0.9rem'} />
                    </ActionIcon>
                    <ActionIcon>
                      <IconTrash size={'0.9rem'} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => {
                        handleToggle(index);
                      }}
                    >
                      <IconChevronUp size={'0.9rem'} />
                    </ActionIcon>
                  </Flex>
                </Flex>
                <Collapse in={selectStep === index && opened} key={index}>
                  <Flex gap={'sm'} p={'sm'} style={{ borderTop: '1px solid #ced4da' }}>
                    <Avatar size={'md'} radius={'xl'} />
                    <Box>
                      <Text fw={600} size={'sm'}>
                        {item.fullname}
                      </Text>
                      <Text fw={500} size={'xs'}>
                        {item.message}
                      </Text>
                    </Box>
                  </Flex>
                </Collapse>
              </Box>
              {index !== props.data.steps.length - 1 && (
                <Divider
                  variant='dashed'
                  labelPosition='center'
                  label={
                    <Flex gap={'sm'} align={'center'}>
                      <Text color='gray' fw={500} size={'xs'}>
                        Wait for
                      </Text>
                      <NumberInput placeholder='Eg. 2' maw={100} size='sm' />
                      <Text color='gray' fw={500} size={'xs'}>
                        days
                      </Text>
                    </Flex>
                  }
                />
              )}
            </>
          );
        })}
        <Flex gap={'lg'} mt={'sm'}>
          <Button fullWidth variant='outline' leftIcon={<IconPlus size={'0.9rem'} />}>
            Add New Step Manually
          </Button>
          <Button fullWidth variant='outline' color='grape' leftIcon={<IconSparkles size={'0.9rem'} />}>
            Generate New Step
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}

export default function Sequence() {
  const [create, setCreate] = useState(false);
  const [data, setData] = useState();

  return (
    <Box>
      {create ? (
        <CreateSequence />
      ) : (
        <>
          <Flex align={'center'} justify={'space-between'}>
            <Text fw={600} size={24}>
              Sequences
            </Text>
            <Button
              leftIcon={<IconPlus size={'0.9rem'} />}
              onClick={() => {
                setCreate(true);
              }}
            >
              Create Sequence
            </Button>
          </Flex>
          <Text color='gray' size={'sm'} fw={500}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean viverra risus sit amet neque mattis efficitur.
          </Text>
          <Flex gap={'xl'} w={'100%'}>
            <SequenceLibrary setData={setData} data={data} />
            <SequencePreview setData={setData} data={data} />
          </Flex>
        </>
      )}
    </Box>
  );
}
