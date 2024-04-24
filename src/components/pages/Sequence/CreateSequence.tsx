import { ActionIcon, Avatar, Box, Button, Card, Collapse, Divider, Flex, NumberInput, Select, Text, TextInput, Textarea } from '@mantine/core';
import { IconChevronUp, IconEdit, IconMessages, IconPlus, IconRefresh, IconTrash } from '@tabler/icons';
import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import EmptyData from '@assets/images/emptydata.png';

export function SequencePreview(props: any) {
  const [opened, setOpened] = useState(false);
  const [selectStep, setSelectStep] = useState<number | null>(null);

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
    <Card withBorder p={'lg'} w={'100%'} h={props.data && 'fit-content'}>
      <Flex direction={'column'} gap={'sm'} h={'100%'}>
        <Flex gap={3}>
          <Text fw={600} size={22} color='gray'>
            Sequence Preview:
          </Text>
          <Text fw={600} size={22}>
            {props.data?.sequenceName ? props.data?.sequenceName : ''}
          </Text>
        </Flex>
        {props.data ? (
          <>
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
          </>
        ) : (
          <Flex m={'auto'} direction={'column'}>
            <img src={EmptyData} style={{ width: '200px', margin: 'auto' }} />
            <Text color='gray' fw={500} size={'sm'} mt={'xs'}>
              Generated sequence will appear here.
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

export function SequenceBuilder(props: any) {
  const [steps, setSteps] = useState<number | null>(null);
  const [assets, setAssets] = useState<number>(0);
  const [sequenceData, setSequenceData] = useState<any>({
    sequenceName: '',
    campaign: '',
    assets: [''],
    type: '',
    steps: [],
    prompts: '',
  });
  const handleGenerateSequence = () => {
    props.setData(sequenceData);
  };

  const handleStep = (value: number | string) => {
    const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(numericValue)) {
      return;
    }

    const data = Array.from({ length: numericValue }, () => ({
      title: '',
      message: '',
      avatar: '',
      fullname: '',
    }));
    setSequenceData({ ...sequenceData, steps: data });
  };

  return (
    <Card withBorder p={'lg'} w={500} h={'fit-content'}>
      <Flex direction={'column'} gap={'md'}>
        <Text fw={600} size={22}>
          Sequence Library
        </Text>
        <TextInput placeholder='Enter name' label='Sequence Name' onChange={(e) => setSequenceData({ ...sequenceData, sequenceName: e.target.value })} />
        <Select
          label='Campaign'
          placeholder='Select Campaign'
          data={['React', 'Angular', 'Vue', 'Svelte']}
          onChange={(value) => setSequenceData({ ...sequenceData, campaign: value })}
        />
        <TextInput
          placeholder='No assets attached'
          label='Select Assets'
          value={assets === 0 ? '' : `${assets} assets`}
          rightSection={
            <Button onClick={() => setAssets((prev) => prev + 1)} size='xs' sx={{ paddingInline: 6 }}>
              <IconPlus size={'0.9rem'} />
            </Button>
          }
        />
        <Flex gap={'sm'}>
          <Select label='Sequence Type' placeholder='Select Type' w={'100%'} data={['Linkedin', 'Mail']} />
          <NumberInput label='No.of Steps' placeholder='Steps' maw={120} onChange={(value) => handleStep(value)} />
        </Flex>
        <Textarea
          label='Additional Prompts'
          minRows={3}
          placeholder='Eg. Make it punchy and concise'
          onChange={(e) => setSequenceData({ ...sequenceData, prompts: e.target.value })}
        />
        <Button leftIcon={<IconPlus size={'0.9rem'} />} onClick={handleGenerateSequence}>
          Generate Sequence
        </Button>
      </Flex>
    </Card>
  );
}

export default function CreateSequence() {
  const [data, setData] = useState();
  console.log('data=========', data);
  return (
    <Box>
      <Flex></Flex>
      <Flex gap={'xl'} w={'100%'}>
        <SequenceBuilder setData={setData} data={data} />
        <SequencePreview data={data} />
      </Flex>
    </Box>
  );
}
