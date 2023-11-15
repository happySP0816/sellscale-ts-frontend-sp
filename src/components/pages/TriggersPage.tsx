import React, { useState, useMemo } from 'react';
import { Title, TextInput, Button, Card, Badge, CloseButton, Text, Box, CopyButton, Divider } from '@mantine/core';
import PageFrame from '@common/PageFrame';
import { deterministicMantineColor } from '@utils/requests/utils';
import { IconCirclePlus, IconEdit, IconPlus } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';

const initialBlockTypes: any = {
  newsBased: { 
    label: 'News Based Sourcing', 
    description: 'Finds LinkedIn URLs from news events.', 
    type: 'Source', 
    emoji: '📰',
    input: ['Search query'],
    output: ['Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Filter', 'Action']
  },
  fundraiseBased: { 
    label: 'Fundraise Based Sourcing', 
    description: 'Scrapes articles for fundraising events.', 
    type: 'Source', 
    emoji: '💰',
    input: ['Search query'],
    output: ['Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Filter', 'Action']
  },
  socialMediaPost: { 
    label: 'Social Media Post', 
    description: 'Captures LinkedIn posts.', 
    type: 'Source', 
    emoji: '👥',
    input: ['Search query'],
    output: ['Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Filter', 'Action']
  },
  inboundLead: { 
    label: 'Inbound Lead', 
    description: 'Tracks website webhook events for leads.', 
    type: 'Source', 
    emoji: '🌐',
    input: [],
    hook: ['api.sellscale.com/inbound/X8103AKOQ'],
    output: ['Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Filter', 'Action']
  },
  championDetection: { 
    label: 'Champion Detection', 
    description: 'Detects job changes in existing customer base.', 
    type: 'Source', 
    emoji: '🏆',
    input: [],
    hook: ['CRM API KEY: 901283AOWIM2231'],
    output: ['Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Filter', 'Action']
  },
  crmLeadDetection: { 
    label: 'CRM Lead Detection', 
    description: 'Identifies leads from CRM with no recent contact.', 
    type: 'Source', 
    emoji: '📊',
    input: [],
    hook: ['CRM API KEY: 8129381290IQWOE'],
    output: ['Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Filter', 'Action']
  },
  filterProspects: { 
    label: 'Filter Prospects', 
    description: 'Runs checks on prospects before importing.', 
    type: 'Filter', 
    emoji: '🔍',
    input: ['Prospect LinkedIn URLs', 'Describe your filter condition'],
    output: ['Filtered Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Action', 'Filter']
  },
  filterCompany: { 
    label: 'Filter Company', 
    description: 'Validates companies from extracted data.', 
    type: 'Filter', 
    emoji: '🏢',
    input: ['Prospect LinkedIn URLs', 'Describe your filter condition'],
    output: ['Filtered Prospect LinkedIn URLs'],
    allowedNextBlockTypes: ['Action', 'Filter']

  },
  importContact: { 
    label: 'Import Contact to Campaign', 
    description: 'Imports LinkedIn URLs into a campaign.', 
    type: 'Action', 
    emoji: '➕',
    input: ['Prospect LinkedIn URLs', 'Campaign ID'],
    output: ["Prospect LinkedIn URLs"],
    allowedNextBlockTypes: ['Action']
  },
  sendNotification: { 
    label: 'Send Notification', 
    description: 'Sends Slack notifications with LinkedIn URLs.', 
    type: 'Action', 
    emoji: '🔔',
    input: ['Prospect LinkedIn URLs', 'Slack Channel Webhook'],
    output: ["Prospect Linkedin URLs"],
    allowedNextBlockTypes: ['Action']
  }
  // You can add more block types as needed
};

function TriggersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stackedBlocks, setStackedBlocks]: any = useState([]);

  const filteredBlocks = useMemo(() => {
    return Object.keys(initialBlockTypes).filter(key =>
      initialBlockTypes[key].label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  const [blockType, setBlockType] = useState(['Source', 'Filter', 'Action']);

  const handleInputChange = (id: any, inputIndex: any, value: any) => {
    setStackedBlocks(stackedBlocks.map((block: any) => 
      block.id === id ? { 
        ...block, 
        inputValues: { 
          ...block.inputValues, 
          [inputIndex]: value 
        } 
      } : block
    ));
  };

  const handleAddBlock = (blockKey: any) => {
    const newBlockType = initialBlockTypes[blockKey].type;
    const lastBlockType = stackedBlocks.length > 0 ? stackedBlocks[stackedBlocks.length - 1].type : null;

    // Rule 1: Only one source block per trigger
    if (newBlockType === 'Source' && stackedBlocks.some((block: any) => block.type === 'Source')) {
      showNotification({
        title: 'Only one source block is allowed per trigger.',
        color: 'red',
        message: 'Please remove the existing source block before adding a new one.'
      });
      return;
    }

    // Rule 2: Filters must appear between sources and actions
    if (newBlockType === 'Filter' && (!stackedBlocks.some((block: any) => block.type === 'Source') || lastBlockType === 'Action')) {
      showNotification({
        title: 'Filters must be placed after a source and before any action.',
        color: 'red',
        message: 'Please move the filter block to the correct position.'
      });
      return;
    }

    const newBlock = { 
      ...initialBlockTypes[blockKey], 
      id: Date.now(),
      inputValues: initialBlockTypes[blockKey].input.reduce((acc: any, input: any, index: any) => {
        acc[index] = '';
        return acc;
      }, {})
    };
    setStackedBlocks([...stackedBlocks, newBlock]);
  };

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteBlock = (id: any) => {
    setStackedBlocks(stackedBlocks.filter((block: any) => block.id !== id));
  };



  return (
    <PageFrame>
      <Title order={2} mb='0px'>Trigger: B2B USA EdTech Company Sourcer <IconEdit color='gray' style={{marginLeft: '4px'}} size={16} /></Title>
      <Text mb='md' color='gray'>
        Triggers are the building blocks for an automated prospect sourcing workflow.
      </Text>
      <div style={{ display: 'flex' }}>
        <Card withBorder style={{ background: 'white', width: '400px', padding: '10px', maxHeight: '85vh', overflowY: 'scroll' }}>
          <Text sx={{textTransform: 'uppercase'}} color='gray' fz='lg' mb='xs'>Library</Text>

          <TextInput
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            mb='xs'
          />

          <Button size='xs' variant='outline' style={{ marginRight: '8px' }} onClick={() => setBlockType(['Source', 'Filter', 'Action'])} color='orange'>All</Button>
          <Button size='xs' variant='outline' style={{ marginRight: '8px' }} onClick={() => setBlockType(['Source'])} color={deterministicMantineColor('Source')}>Source</Button>
          <Button size='xs' variant='outline' style={{ marginRight: '8px' }} onClick={() => setBlockType(['Filter'])} color={deterministicMantineColor('Filter')}>Filter</Button>
          <Button size='xs' variant='outline' style={{ marginRight: '8px' }} onClick={() => setBlockType(['Action'])} color={deterministicMantineColor('Action')}>Action</Button>
          
          {filteredBlocks.filter(blockKey => blockType.includes(initialBlockTypes[blockKey].type)).map(blockKey => (
            <Card key={blockKey} shadow="sm" padding="lg" style={{ marginBottom: '10px' }}>
              <Badge size='sm' color={deterministicMantineColor(initialBlockTypes[blockKey].type)} mb='xs'>{initialBlockTypes[blockKey].type}</Badge>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text size='sm' style={{ fontWeight: 'bold' }}>{initialBlockTypes[blockKey].emoji} {initialBlockTypes[blockKey].label}</Text>
                  <Text size='xs' color='gray'>{initialBlockTypes[blockKey].description}</Text>
                </div>
                
              </div>
              <Button size='xs' onClick={() => handleAddBlock(blockKey)} style={{ marginTop: '10px' }}>+ Add {initialBlockTypes[blockKey].label}</Button>
            </Card>
          ))}
        </Card>
        <Card withBorder w='100%' ml='xs' mr='xs'>
          <Text sx={{textTransform: 'uppercase'}} color='gray' fz='lg'>Playground</Text>
          <div style={{ 
            flex: 1, 
            padding: '10px', 
            justifyContent: 'center', 
            width: '100%',
            height: '90%', 
            backgroundSize: '20px 20px', 
            backgroundImage: `linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px)`,
            backgroundPosition: '0 0',
          }}>
          <Box ml='auto' mr='auto' w='50%'>
            {stackedBlocks.map((block: any, index: number) => (
              <Box key={block.id} w='100%'>
                <Card withBorder padding="lg" style={{ position: 'relative', marginBottom: '10px' }}>
                  <CloseButton style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => handleDeleteBlock(block.id)} />
                  <Text fw='bold'>{block.emoji} {block.label}</Text>
                  <Text color='gray' fz='sm'>{block.description}</Text>
                  {block.input.map((input: any, inputIndex: number) => (
                    <TextInput 
                      key={inputIndex}
                      placeholder={input}
                      label={input}
                      value={block.inputValues[inputIndex]}
                      onChange={(event) => handleInputChange(block.id, inputIndex, event.target.value)}
                      mb='xs'
                      mt='xs'
                    />
                  ))}
                  {block.hook && (
                    <CopyButton value={block.hook[0]} timeout={2000}>
                      {({ copied, copy }) => (
                        <TextInput 
                          readOnly 
                          value={block.hook[0]} 
                          label='Webhook URL'
                          mt='xs'
                          mr='xs'
                          rightSection={<Button onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>}
                        />
                      )}
                    </CopyButton>
                  )}
                  <Card.Section>
                    <Divider mb='xs' mt='xs' />
                    {block.output.length > 0 && (
                      <Text ml='xs' mr='xs' mb='xs' color='gray' fz='sm'><b>Output:</b> {block.output.join(', ')}</Text>
                    )}
                  </Card.Section>
                </Card>
                {stackedBlocks.length > 0 && index === stackedBlocks.length - 1 &&
                  <Box>
                    {block.allowedNextBlockTypes.map((allowedNextBlockType: any) => (
                      <Button
                        key={allowedNextBlockType}
                        size='xs'
                        variant='outline'
                        color={deterministicMantineColor(allowedNextBlockType)}
                        style={{ marginRight: '10px' }}
                        onClick={() => setBlockType([allowedNextBlockType])}
                      >
                        <IconPlus size={16} style={{ marginRight: '4px' }} /> Add {allowedNextBlockType} Block
                      </Button>
                    ))}
                  </Box>
                }
                {index < stackedBlocks.length - 1 && <Text fz='xl' mb='xs' mt='xs' style={{ textAlign: 'center' }}>↓</Text>}
              </Box>
            ))}
            {
              stackedBlocks.length === 0 && (
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Text style={{ textAlign: 'center' }} color='gray' mt='30%' fz='xl'>
                    Add blocks from the library to get started.
                  </Text>
                  <IconCirclePlus size={36} style={{ marginLeft: '10px' }} color='gray'/>
                </Box>
              )
            }
          </Box>
        </div>
        </Card>
      </div>
    </PageFrame>
  );
}

export default TriggersPage;