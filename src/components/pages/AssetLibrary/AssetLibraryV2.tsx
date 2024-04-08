import { Badge, Box, Button, Divider, Flex, Group, List, Modal, Radio, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
import { IconCloudUpload, IconEdit, IconLayoutBoard, IconList, IconPlus, IconTrash } from '@tabler/icons';
import { IconArrowRight, IconBulb, IconToggleRight } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { IconSparkles } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import CardView from './CardView';
import ListView from './ListView';

export default function AssetLibraryV2() {
  const [opened, { open, close }] = useDisclosure(false);
  const [openedAsset, { open: openAsset, close: closeAsset }] = useDisclosure(false);

  const [viewType, setViewType] = useState('card');
  const [tabs, setTabs] = useState('non_generative');
  const [semiTabs, setSemiTabs] = useState('');

  const [ingestionType, setIngestionType] = useState('');
  const [assetType, setAssetType] = useState('');
  const [editSummary, setEditSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const data = [
    {
      num: 0,
      usage: true,
      ingestion_type: 'pdf',
      title: 'Behavioral Health ROI',
      type: 'case study',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: true,
    },
    {
      num: 1,
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
    {
      num: 2,
      usage: true,
      ingestion_type: 'pdf',
      title: 'Phrase: NewtonX teststsdasd',
      type: 'value prop',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: true,
    },
    {
      num: 3,
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
    {
      num: 4,
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
    {
      num: 5,
      usage: false,
      ingestion_type: 'text',
      title: 'NewtonX G2 Winnsdndndndd',
      type: 'offer',
      open_rate: 76,
      reply_rate: 68,
      ai_reponse: false,
    },
  ];

  const [usedData, setUsedData] = useState<any>([]);
  const [unusedData, setUnUsedData] = useState<any>([]);

  useEffect(() => {
    let usedData = data.filter((data) => data.usage === true);
    setUsedData(usedData);
    let unusedData = data.filter((data) => data.usage === false);
    setUnUsedData(unusedData);
  }, []);

  return (
    <Flex direction={'column'} px={'5%'} gap={'sm'} bg={'white'}>
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
      <Box>
        <Flex justify={'space-between'} align={'center'}>
          <Flex
            align={'center'}
            w={'fit-content'}
            bg={'#f3f4f6'}
            p={4}
            style={{ borderRadius: '8px', borderBottomRightRadius: '0px', borderBottomLeftRadius: '0px' }}
          >
            <Button
              onClick={() => {
                setTabs('non_generative');
                setSemiTabs('all');
              }}
              color={'gray'}
              variant={tabs === 'non_generative' ? 'tranparent' : 'white'}
            >
              Non Generative
            </Button>
            <Button
              onClick={() => {
                setTabs('generative');
                setSemiTabs('offers');
              }}
              color={'gray'}
              variant={tabs === 'generative' ? 'tranparent' : 'white'}
            >
              Generative
            </Button>
          </Flex>
          <Switch defaultChecked label='Show Used Assets Only' mr={'xs'} />
        </Flex>
        {tabs === 'non_generative' ? (
          <Flex align={'center'} justify={'space-between'} w={'100%'} bg={'#f3f4f6'} p={8} style={{ borderRadius: '8px', borderTopLeftRadius: '0px' }}>
            <Flex>
              <Button onClick={() => setSemiTabs('all')} color={'gray'} variant={semiTabs === 'all' ? 'white' : 'tranparent'}>
                All
              </Button>
              <Button onClick={() => setSemiTabs('cta')} color={'gray'} variant={semiTabs === 'cta' ? 'white' : 'tranparent'}>
                CTAs
              </Button>
              <Button onClick={() => setSemiTabs('email_templates')} color={'gray'} variant={semiTabs === 'email_templates' ? 'white' : 'tranparent'}>
                Email Templates
              </Button>
              <Button onClick={() => setSemiTabs('linkedin_templates')} color={'gray'} variant={semiTabs === 'linkedin_templates' ? 'white' : 'tranparent'}>
                Linkedin Templates
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex align={'center'} justify={'space-between'} w={'100%'} bg={'#f3f4f6'} p={8} style={{ borderRadius: '8px', borderTopLeftRadius: '0px' }}>
            <Flex>
              <Button onClick={() => setSemiTabs('offers')} color={'gray'} variant={semiTabs === 'offers' ? 'white' : 'tranparent'}>
                Offers
              </Button>
              <Button onClick={() => setSemiTabs('phrases')} color={'gray'} variant={semiTabs === 'phrases' ? 'white' : 'tranparent'}>
                Phrases
              </Button>
              <Button onClick={() => setSemiTabs('study')} color={'gray'} variant={semiTabs === 'study' ? 'white' : 'tranparent'}>
                Case Studies
              </Button>
              <Button onClick={() => setSemiTabs('research')} color={'gray'} variant={semiTabs === 'research' ? 'white' : 'tranparent'}>
                Research Points
              </Button>
              <Button onClick={() => setSemiTabs('email_subject_lines')} color={'gray'} variant={semiTabs === 'email_subject_lines' ? 'white' : 'tranparent'}>
                Email Subject Lines
              </Button>
              <Button onClick={() => setSemiTabs('linkedin_cta')} color={'gray'} variant={semiTabs === 'linkedin_cta' ? 'white' : 'tranparent'}>
                Linkedin CTAs
              </Button>
            </Flex>
          </Flex>
        )}
        {/* {tabs === 'non_generative' ? <NonGenerative view={viewType} data={data} /> : <Generative view={viewType} data={data} />} */}
        {viewType === 'card' ? (
          <CardView type={tabs} view={viewType} semiTabs={semiTabs} useData={usedData} unUseData={unusedData} />
        ) : (
          <ListView type={tabs} view={viewType} semiTabs={semiTabs} useData={usedData} unUseData={unusedData} />
        )}
      </Box>
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
          {assetType !== '' && ingestionType === 'Image' ? (
            <Flex
              style={{ border: '1px solid #e2edfc', borderRadius: '8px', borderStyle: 'dashed' }}
              bg={'#f5f9fe'}
              justify={'center'}
              p={40}
              align={'center'}
              gap={'lg'}
            >
              <Flex>
                <IconCloudUpload color='#228be6' size={'4rem'} />
              </Flex>
              <Box>
                <Text size={'lg'} fw={600}>
                  Drag & drop files or <span className='text-[#228be6] underline'>Browse</span>
                </Text>
                <Flex gap={'sm'} align={'center'}>
                  <Text color='gray' fw={400} size={'sm'}>
                    Supported formats: jpeg, png
                  </Text>
                  <Divider orientation='vertical' />
                  <Text color='gray' fw={400} size={'sm'}>
                    Max file size: 2MB
                  </Text>
                </Flex>
              </Box>
            </Flex>
          ) : assetType !== '' && ingestionType === 'Text Dump' ? (
            <Flex direction={'column'}>
              <Textarea
                minRows={3}
                label={ingestionType}
                placeholder='Copy/paste contents of a PDF, webpage, or sequence and the AI will summarize and Ingest it.'
              />
            </Flex>
          ) : (
            <></>
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
      <Flex sx={{ border: '1px solid #cfcfcf', borderStyle: 'dashed', borderRadius: '8px' }} bg={'#f3f4f6'} p={'lg'} mt={'lg'} mb={140}>
        <List spacing='1px' size='sm' center>
          <List.Item icon={<IconBulb size={'1.2rem'} color='#228be6' />}>
            <Text fw={600} size={13}>
              These are the assets that have been imported into the system for SellScale.
            </Text>
          </List.Item>
          <List.Item icon={<IconArrowRight size={'1.2rem'} color='#228be6' />}>
            <Text size={'xs'} color='gray' fw={500} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              Click on <span style={{ color: '#228be6' }}>Add New Asset</span> to add a new asset to the library
            </Text>
          </List.Item>
          <List.Item icon={<IconArrowRight size={'1.2rem'} color='#228be6' />}>
            <Text size={'xs'} color='gray' fw={500} style={{ display: 'flex', gap: '4px', alignContent: 'center' }}>
              To use assets in this campaign, click on the <span style={{ color: '#228be6   ' }}>Toggle</span>{' '}
              <IconToggleRight color='#228be6' size={'1.1rem'} style={{ marginTop: '1px' }} /> button
            </Text>
          </List.Item>
          <List.Item icon={<IconArrowRight size={'1.2rem'} color='#228be6' />}>
            <Text size={'xs'} color='gray' fw={500} style={{ display: 'flex', gap: '4px', alignContent: 'center' }}>
              To remove an asset from the library, click on the <span style={{ color: 'red' }}>Delete</span>
              <IconTrash color='red' size={'0.9rem'} style={{ marginTop: '1px' }} /> button
            </Text>
          </List.Item>
        </List>
      </Flex>
    </Flex>
  );
}
