import { Badge, Button, Divider, Flex, Grid, Group, Input, Modal, Radio, Switch, Tabs, Text, TextInput, Textarea } from '@mantine/core';
import {
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconInfoCircle,
  IconLayoutBoard,
  IconLink,
  IconList,
  IconPlus,
  IconTrash,
} from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';

export default function AssetLibraryV2() {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedAsset, { open: openAsset, close: closeAsset }] = useDisclosure(false);
  const [viewType, setViewType] = useState('card');
  const [ingestionType, setIngestionType] = useState('');
  const [assetType, setAssetType] = useState('');
  const [editSummary, setEditSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [tabs, setTabs] = useState('all');
  const data = [
    {
      usage: true,
      ingestion_type: 'pdf',
      title: 'Behavioral Health ROI',
      type: 'case study',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: true,
    },
    {
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
    {
      usage: true,
      ingestion_type: 'pdf',
      title: 'Phrase: NewtonX teststsdasd',
      type: 'value prop',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: true,
    },
    {
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
    {
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
    {
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
  ];

  return (
    <Flex direction={'column'} px={'150px'} gap={'sm'} bg={'white'}>
      <Flex align={'center'} justify={'space-between'}>
        <Text size={'25px'} fw={700}>
          SellScale's Asset Library
        </Text>
        <Flex gap={'sm'}>
          <Flex>
            <Button
              color={viewType === 'list' ? 'blue' : 'gray'}
              variant={viewType === 'list' ? 'light' : 'outline'}
              leftIcon={<IconList size={'1rem'} />}
              onClick={() => setViewType('list')}
              style={{ borderTopRightRadius: '0px', borderBottomRightRadius: '0px', border: '1px solid' }}
            >
              List View
            </Button>
            <Button
              color={viewType === 'card' ? 'blue' : 'gray'}
              variant={viewType === 'card' ? 'light' : 'outline'}
              leftIcon={<IconLayoutBoard size={'1rem'} />}
              onClick={() => setViewType('card')}
              style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px', border: '1px solid' }}
            >
              Card View
            </Button>
          </Flex>
          <Button leftIcon={<IconPlus size={'1rem'} />} onClick={open}>
            Add New Asset
          </Button>
        </Flex>
      </Flex>
      <Flex align={'center'} justify={'space-between'} w={'100%'} bg={'#f3f4f6'} p={'xs'} style={{ borderRadius: '8px' }}>
        <Flex>
          <Button onClick={() => setTabs('all')} color={'gray'} variant={tabs === 'all' ? 'white' : 'tranparent'}>
            All
          </Button>
          <Button onClick={() => setTabs('cta')} color={'gray'} variant={tabs === 'cta' ? 'white' : 'tranparent'}>
            CTAs
          </Button>
          <Button onClick={() => setTabs('offer')} color={'gray'} variant={tabs === 'offer' ? 'white' : 'tranparent'}>
            Offers
          </Button>
          <Button onClick={() => setTabs('phrase')} color={'gray'} variant={tabs === 'phrase' ? 'white' : 'tranparent'}>
            Phrases
          </Button>
          <Button onClick={() => setTabs('case_study')} color={'gray'} variant={tabs === 'case_study' ? 'white' : 'tranparent'}>
            Case Studies
          </Button>
          <Button onClick={() => setTabs('research_point')} color={'gray'} variant={tabs === 'research_point' ? 'white' : 'tranparent'}>
            Research Points
          </Button>
          <Button onClick={() => setTabs('email_subject_line')} color={'gray'} variant={tabs === 'email_subject_line' ? 'white' : 'tranparent'}>
            Email Subject Lines
          </Button>
          <Button onClick={() => setTabs('linkedin')} color={'gray'} variant={tabs === 'linkedin' ? 'white' : 'tranparent'}>
            Linkedin CTAs
          </Button>
        </Flex>
        <Switch defaultChecked label='Show Used Assets Only' />
      </Flex>
      <Grid>
        {data?.map((item, index) => {
          return (
            <Grid.Col span={4} key={index}>
              <Flex style={{ border: '1px solid #ced4da', borderRadius: '8px' }} p={'xl'} direction={'column'} gap={'sm'}>
                <Flex align={'center'} justify={'space-between'}>
                  <Badge
                    leftSection={item?.usage ? <IconCircleCheck size={'1rem'} style={{ marginTop: '7px' }} /> : ''}
                    variant='filled'
                    size='lg'
                    color={item?.usage ? 'blue' : 'gray'}
                  >
                    {item?.usage ? 'used in campaign' : 'not used'}
                  </Badge>
                  <Button radius={'xl'} size='xs' variant='light' rightIcon={<IconChevronRight size={'1rem'} />} onClick={openAsset}>
                    View
                  </Button>
                </Flex>
                <Flex gap={'5px'}>
                  <Badge size='lg' color={item?.type === 'case study' ? 'pink' : item?.type === 'offer' ? 'orange' : 'green'}>
                    {item?.type}
                  </Badge>
                  <Badge variant='outline' color='gray' size='lg'>
                    ingestion type: {item?.ingestion_type}
                  </Badge>
                </Flex>
                <Flex align={'center'} w={'fit-content'}>
                  <Text fw={700} lineClamp={1} w={'210px'} size={'xl'}>
                    {item?.title}
                  </Text>
                  {item?.usage && <IconLink size={'1.4rem'} color='#499df9' />}
                </Flex>
                <Text color='gray' mt={'-xs'} variant='transparent' size={'sm'} fw={500} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconInfoCircle size={'1rem'} />
                  See why this is relevant
                </Text>
                <Group>
                  <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={600} color='gray'>
                    Open Rate:{' '}
                    <Text fw={800} color={item?.open_rate > 50 ? 'green' : 'orange'}>
                      {item?.open_rate}%
                    </Text>
                  </Text>
                  <Divider orientation='vertical' />
                  <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={600} color='gray'>
                    Reply Rate:{' '}
                    <Text fw={800} color={item?.reply_rate > 50 ? 'green' : 'orange'}>
                      {item?.reply_rate}%
                    </Text>
                  </Text>
                </Group>
                <Flex
                  p={'md'}
                  direction={'column'}
                  gap={'xs'}
                  bg={item?.ai_reponse ? '#fff5ff' : '#f4f9ff'}
                  mt={item?.ai_reponse ? '' : '55px'}
                  style={{ borderRadius: '8px' }}
                >
                  {item?.ai_reponse && (
                    <Flex align={'center'} justify={'space-between'}>
                      <Text color='#ec58fb' size={'lg'} fw={700} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                      </Text>
                      <IconEdit color='gray' size={'1.2rem'} />
                    </Flex>
                  )}
                  <Flex align={'end'}>
                    <Text lineClamp={2} size={'sm'} color='gray' fw={600}>
                      {'This cas study explores how lorem Ipsum dolor sit amet, consectetur adipiscing elit testsdsdasdfasdasdfasdfasdfasdf'}
                    </Text>
                    {!item?.ai_reponse && (
                      <Flex>
                        <IconEdit color='gray' size={'1.2rem'} />
                      </Flex>
                    )}
                  </Flex>
                </Flex>
                <Flex gap={'xl'}>
                  <Button
                    w={'100%'}
                    size='md'
                    color={item?.usage ? 'gray' : ''}
                    variant='outline'
                    leftIcon={item?.usage ? <IconCircleX size={'1.2rem'} /> : <IconCircleCheck size={'1.2rem'} />}
                  >
                    {item?.usage ? 'Stop Using' : 'Click to Use'}
                  </Button>
                  <Button size='md' w={'100%'} color='red' variant='outline' leftIcon={<IconTrash size={'1rem'} />}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Grid.Col>
          );
        })}
      </Grid>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setAssetType('');
          setIngestionType('');
        }}
        size='640px'
        title={
          <Text fw={600} size={'lg'}>
            SellScale Asset Ingestor
          </Text>
        }
      >
        <Flex direction={'column'} gap={'md'}>
          <TextInput label='Name of Asset' placeholder='Enter name' />
          <Flex direction={'column'}>
            <Text size={'14px'} fw={400} mb={'3px'}>
              Asset Type
            </Text>
            <Radio.Group onChange={(e) => setAssetType(e)} style={{ border: '1px solid #ced4da', borderRadius: '8px' }} p={'sm'} pt={'-sm'}>
              <Group mt='xs'>
                <Radio value='cta' label='CTAs' size='sm' />
                <Radio value='offer' label='Offers' size='sm' />
                <Radio value='value_prop' label='Value Prop' size='sm' />
                <Radio value='case_study' label='Case Studies' size='sm' />
                <Radio value='research_point' label='Research Points' size='sm' />
              </Group>
            </Radio.Group>
          </Flex>
          <Flex direction={'column'}>
            <Text size={'14px'} fw={400} mb={'3px'}>
              Ingestion Method
            </Text>
            <Radio.Group onChange={(e) => setIngestionType(e)} style={{ border: '1px solid #ced4da', borderRadius: '8px' }} p={'sm'} pt={'-sm'}>
              <Group mt='xs'>
                <Radio value='Text Dump' label='Text Dump' size='sm' />
                <Radio value='Link' label='Link' size='sm' />
                <Radio value='PDF' label='PDF' size='sm' />
                <Radio value='Image' label='Image' size='sm' />
                <Radio value='URL' label='URL' size='sm' />
                <Radio value='Write Manually' label='Write Manually' size='sm' />
              </Group>
            </Radio.Group>
          </Flex>
          {ingestionType && assetType && (
            <Flex direction={'column'}>
              <Textarea
                minRows={3}
                label={ingestionType}
                placeholder='Copy/paste contents of a PDF, webpage, or sequence and the AI will summarize and Ingest it.'
              />
            </Flex>
          )}
          <Flex justify={'space-between'} gap={'xl'} mt={'sm'}>
            <Button
              variant='outline'
              color='gray'
              w={'100%'}
              onClick={() => {
                close();
                setAssetType('');
                setIngestionType('');
              }}
            >
              Go Back
            </Button>
            <Button w={'100%'} disabled={assetType && ingestionType ? false : true}>
              Summarize Asset
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        opened={openedAsset}
        onClose={() => {
          closeAsset();
          setEditSummary(false);
        }}
        size='640px'
        title={
          <Text fw={600} size={'lg'}>
            SellScale Asset Ingestor
          </Text>
        }
      >
        <Flex direction={'column'} style={{ border: '1px solid #ced4da', borderRadius: '8px' }} p={'lg'} gap={'sm'}>
          <Badge color='pink' w={'fit-content'}>
            case study
          </Badge>
          <Text fw={600} lineClamp={1} size={'xl'}>
            Behavioral Health ROI
          </Text>
          <Group mt={'-sm'}>
            <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={600} color='gray'>
              Open Rate:{' '}
              <Text fw={800} color={'green'}>
                76%
              </Text>
            </Text>
            <Divider orientation='vertical' />
            <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={600} color='gray'>
              Reply Rate:{' '}
              <Text fw={800} color={'green'}>
                68%
              </Text>
            </Text>
          </Group>
          <Flex p={'md'} direction={'column'} gap={'xs'} bg={'#fff5ff'} style={{ borderRadius: '8px' }}>
            <Flex align={'center'} justify={'space-between'}>
              <Text color='#ec58fb' size={'lg'} fw={700} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
              </Text>
              {editSummary ? (
                <Button
                  size='xs'
                  radius={'xl'}
                  onClick={() => {
                    setEditSummary(false);
                  }}
                >
                  save Summary
                </Button>
              ) : (
                <Button leftIcon={<IconEdit size={'0.8rem'} />} color='pink' size='xs' radius={'xl'} variant='outline' onClick={() => setEditSummary(true)}>
                  Edit Summary
                </Button>
              )}
            </Flex>
            <Flex align={'end'}>
              {editSummary ? (
                <Textarea
                  w={'100%'}
                  defaultValue={'This case study explores how lorem Ipsum dolor sit amet, consectetur adipiscing elit testsdsdasdfasdasdfasdfasdfasdf'}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              ) : (
                <Text lineClamp={2} size={'sm'} color='gray' fw={600}>
                  {summary}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex justify={'space-between'} gap={'xl'} mt={'sm'}>
            <Button
              variant='outline'
              color='gray'
              w={'100%'}
              onClick={() => {
                closeAsset();
              }}
            >
              Go Back
            </Button>
            <Button w={'100%'}>Add Asset</Button>
          </Flex>
        </Flex>
      </Modal>
    </Flex>
  );
}
