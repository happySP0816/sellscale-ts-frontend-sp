import React, { useState, useMemo, useEffect } from 'react';
import {
  Title,
  TextInput,
  Button,
  Card,
  Badge,
  CloseButton,
  Text,
  Box,
  CopyButton,
  Divider,
  NumberInput,
  JsonInput,
  ScrollArea,
  Textarea,
  Group,
  Flex,
} from '@mantine/core';
import PageFrame from '@common/PageFrame';
import { deterministicMantineColor } from '@utils/requests/utils';
import { IconCirclePlus, IconEdit, IconPlus } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import {
  Trigger,
  TriggerActionBlock,
  TriggerActionData,
  TriggerActionType,
  TriggerBlock,
  TriggerBlockType,
  TriggerDisplayFramework,
  TriggerFilterBlock,
  TriggerFilterCriteria,
  TriggerInput,
  TriggerSourceBlock,
  TriggerSourceData,
  TriggerSourceType,
} from 'src';
import { aC } from '@fullcalendar/core/internal-common';
import { useRecoilValue } from 'recoil';
import { currentProjectState } from '@atoms/personaAtoms';
import { useQuery } from '@tanstack/react-query';
import { getTrigger, updateTrigger } from '@utils/requests/triggerBlocks';
import { userTokenState } from '@atoms/userAtoms';
import { useLocation } from 'react-router-dom';

function createTriggerActionBlock(
  action: TriggerActionType,
  data: TriggerActionData
): TriggerActionBlock {
  return {
    type: 'ACTION',
    action,
    data,
  };
}

function createTriggerFilterBlock(criteria: TriggerFilterCriteria): TriggerFilterBlock {
  return {
    type: 'FILTER',
    criteria,
  };
}

function createTriggerSourceBlock(
  source: TriggerSourceType,
  data: TriggerSourceData
): TriggerSourceBlock {
  return {
    type: 'SOURCE',
    source,
    data,
  };
}

function isSourceBlock(block: TriggerBlock): block is TriggerSourceBlock {
  return block.type === 'SOURCE';
}

function isFilterBlock(block: TriggerBlock): block is TriggerFilterBlock {
  return block.type === 'FILTER';
}

function isActionBlock(block: TriggerBlock): block is TriggerActionBlock {
  return block.type === 'ACTION';
}

const SOURCE_BLOCKS: TriggerDisplayFramework[] = [
  {
    type: 'SOURCE',
    subType: 'GOOGLE_COMPANY_NEWS',
    label: 'News Based Sourcing',
    description: 'Finds companies from news events.',
    emoji: '📰',
    inputs: [
      {
        keyLink: 'company_query',
        type: 'TEXT',
        label: 'Search query',
        defaultValue: '',
      },
    ],
  },
  {
    type: 'SOURCE',
    subType: 'EXTRACT_PROSPECTS_FROM_COMPANIES',
    label: 'Find Prospects from Companies',
    description: 'Searches for people at the companies you found.',
    emoji: '👥',
    inputs: [
      {
        keyLink: 'prospect_titles',
        type: 'JSON',
        label: 'Prospect titles',
        defaultValue: '',
      },
    ],
  },
];

const FILTER_BLOCKS: TriggerDisplayFramework[] = [
  {
    type: 'FILTER',
    subType: 'FILTER_PROSPECTS',
    label: 'Filter prospects',
    description: 'Sorts out prospects that do not meet your criteria.',
    emoji: '🔍',
    inputs: [
      {
        keyLink: 'prospect_titles',
        type: 'JSON',
        label: 'Prospect titles',
        defaultValue: '',
      },
      {
        keyLink: 'prospect_query',
        type: 'TEXT',
        label: 'Custom GPT query on prospects',
        defaultValue: '',
      },
    ],
  },
  {
    type: 'FILTER',
    subType: 'FILTER_COMPANIES',
    label: 'Filter companies',
    description: 'Sorts out companies that do not meet your criteria.',
    emoji: '🏢',
    inputs: [
      {
        keyLink: 'company_names',
        type: 'JSON',
        label: 'Company names',
        defaultValue: '',
      },
      {
        keyLink: 'article_titles',
        type: 'JSON',
        label: 'Article titles',
        defaultValue: '',
      },
      {
        keyLink: 'article_snippets',
        type: 'JSON',
        label: 'Article snippets',
        defaultValue: '',
      },
      {
        keyLink: 'company_query',
        type: 'TEXT',
        label: 'Custom GPT query on companies',
        defaultValue: '',
      },
    ],
  },
];

const ACTION_BLOCKS: TriggerDisplayFramework[] = [
  {
    type: 'ACTION',
    subType: 'UPLOAD_PROSPECTS',
    label: 'Import Prospects to Campaign',
    description: 'Adds the prospects to your campaign.',
    emoji: '📥',
    inputs: [],
  },
  {
    type: 'ACTION',
    subType: 'SEND_SLACK_MESSAGE',
    label: 'Send Notification',
    description: 'Sends out a Slack notification.',
    emoji: '🔔',
    inputs: [
      {
        keyLink: 'slack_message',
        type: 'TEXT',
        label: 'Message (https://app.slack.com/block-kit-builder)',
        defaultValue: '',
      },
      {
        keyLink: 'slack_webhook_urls',
        type: 'JSON',
        label: 'Webhook URLs',
        defaultValue: '',
      },
    ],
  },
];

function getDisplayFromBlock(block: TriggerBlock): TriggerDisplayFramework | null {
  const convertToDefaultValue = (
    data: Record<string, any>,
    key: string
  ): string | number | boolean | undefined => {
    const result = data[key];
    if (Array.isArray(result)) {
      return JSON.stringify(result);
    } else {
      return result;
    }
  };

  if (isSourceBlock(block)) {
    const display = SOURCE_BLOCKS.find((display) => display.subType === block.source);
    if (!display) return null;
    return {
      ...display,
      inputs: [
        ...display.inputs.map((input) => ({
          ...input,
          defaultValue: convertToDefaultValue(block.data, input.keyLink),
        })),
      ],
    };
  } else if (isFilterBlock(block)) {
    const display = FILTER_BLOCKS.find((display) => {
      return block.criteria.prospect_query || block.criteria.prospect_titles
        ? display.subType === 'FILTER_PROSPECTS'
        : display.subType === 'FILTER_COMPANIES';
    });
    if (!display) return null;
    return {
      ...display,
      inputs: [
        ...display.inputs.map((input) => ({
          ...input,
          defaultValue: convertToDefaultValue(block.criteria, input.keyLink),
        })),
      ],
    };
  } else if (isActionBlock(block)) {
    const display = ACTION_BLOCKS.find((display) => display.subType === block.action);
    if (!display) return null;
    return {
      ...display,
      inputs: [
        ...display.inputs.map((input) => ({
          ...input,
          defaultValue: convertToDefaultValue(block.data, input.keyLink),
        })),
      ],
    };
  }
  return null;
}

function getBlockFromDisplay(display: TriggerDisplayFramework): TriggerBlock {
  const convertToData = (
    inputs: Record<string, any>,
    key: string
  ): string | number | boolean | undefined => {
    const result = inputs[key];
    console.log('result', result);
    if (typeof result === 'string') {
      try {
        return JSON.parse(result);
      } catch (error) {
        return result;
      }
    } else {
      return result;
    }
  };

  const convertInputsToData = (inputs: TriggerInput[]): Record<string, any> => {
    return inputs.reduce((acc, input) => {
      return {
        ...acc,
        [input.keyLink]: input.defaultValue,
      };
    }, {});
  };

  if (display.type === 'SOURCE') {
    return createTriggerSourceBlock(
      display.subType as TriggerSourceType,
      convertInputsToData(display.inputs)
    );
  } else if (display.type === 'FILTER') {
    return createTriggerFilterBlock(convertInputsToData(display.inputs));
  } else if (display.type === 'ACTION') {
    return createTriggerActionBlock(
      display.subType as TriggerActionType,
      convertInputsToData(display.inputs)
    );
  }
  throw new Error('Unknown block type');
}

function TriggersPage() {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const location = useLocation();
  const triggerId = new URLSearchParams(location.search).get('trigger_id');

  const { data: trigger } = useQuery({
    queryKey: [`query-get-existing-contacts`, { triggerId }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { triggerId }]: any = queryKey;

      const response = await getTrigger(userToken, triggerId);
      return response.status === 'success' ? (response.data as Trigger) : null;
    },
    enabled: !!triggerId,
  });

  useEffect(() => {
    if (trigger) {
      console.log('data', trigger);
      const triggerBlocks = trigger.blocks.map((block) => getDisplayFromBlock(block) ?? undefined);
      setStackedBlocks(triggerBlocks.filter((block) => block) as TriggerDisplayFramework[]);
    }
  }, [trigger]);

  const saveTrigger = async () => {
    if (trigger) {
      // Update

      const updatedStackedBlocks = stackedBlocks.map((display, index) => {
        return {
          ...display,
          inputs: display.inputs.map((input) => ({
            ...input,
            defaultValue: updatedValues[`${index}-${input.keyLink}`],
          })),
        };
      });

      console.log(
        'trigger',
        updatedStackedBlocks.map((display) => getBlockFromDisplay(display))
      );

      // const response = await updateTrigger(
      //   userToken,
      //   trigger.id,
      //   undefined,
      //   undefined,
      //   undefined,
      //   undefined,
      //   undefined,
      //   stackedBlocks.map((display) => getBlockFromDisplay(display))
      // );
    } else {
      // Create
    }
  };

  ///

  const [searchTerm, setSearchTerm] = useState('');
  const [stackedBlocks, setStackedBlocks] = useState<TriggerDisplayFramework[]>([]);
  const [updatedValues, setUpdatedValues] = useState<Record<string, any>>({}); // index + keyLink -> value

  const filteredBlocks = useMemo(() => {
    return [...SOURCE_BLOCKS, ...FILTER_BLOCKS, ...ACTION_BLOCKS].filter((display) =>
      display.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const [blockType, setBlockType] = useState<TriggerBlockType[]>(['SOURCE', 'FILTER', 'ACTION']);

  const handleInputChange = (index: number, keyLink: string, value: string) => {
    setUpdatedValues((prev) => {
      return {
        ...prev,
        [`${index}-${keyLink}`]: value,
      };
    });
  };

  const handleAddBlock = (label: string) => {
    const display = [...SOURCE_BLOCKS, ...FILTER_BLOCKS, ...ACTION_BLOCKS].find(
      (display) => display.label === label
    );
    if (display) {
      setStackedBlocks((prev) => {
        return [...prev, display];
      });
    }
  };

  const handleDeleteBlock = (index: number) => {
    setStackedBlocks(stackedBlocks.filter((block, i) => i !== index));
  };

  return (
    <PageFrame>
      <Flex justify='space-between' wrap='nowrap'>
        <Title order={2} mb='0px'>
          {triggerId ? 'Edit' : 'Create'} Trigger{' '}
          <IconEdit color='gray' style={{ marginLeft: '4px' }} size={16} />
        </Title>
        <Button radius='md' onClick={saveTrigger}>
          {triggerId ? 'Save' : 'Create'}
        </Button>
      </Flex>
      <Text mb='md' color='gray'>
        Triggers are the building blocks for an automated prospect sourcing workflow.
      </Text>
      <div style={{ display: 'flex' }}>
        <Card
          withBorder
          style={{
            background: 'white',
            width: '400px',
            padding: '10px',
            maxHeight: '85vh',
            overflowY: 'scroll',
          }}
        >
          <Text sx={{ textTransform: 'uppercase' }} color='gray' fz='lg' mb='xs'>
            Library
          </Text>

          <TextInput
            placeholder='Search blocks...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mb='xs'
          />

          <Button
            size='xs'
            variant='outline'
            style={{ marginRight: '8px' }}
            onClick={() => setBlockType(['SOURCE', 'FILTER', 'ACTION'])}
            color='orange'
          >
            All
          </Button>
          <Button
            size='xs'
            variant='outline'
            style={{ marginRight: '8px' }}
            onClick={() => setBlockType(['SOURCE'])}
            color={deterministicMantineColor('SOURCE')}
          >
            Source
          </Button>
          <Button
            size='xs'
            variant='outline'
            style={{ marginRight: '8px' }}
            onClick={() => setBlockType(['FILTER'])}
            color={deterministicMantineColor('FILTER')}
          >
            Filter
          </Button>
          <Button
            size='xs'
            variant='outline'
            style={{ marginRight: '8px' }}
            onClick={() => setBlockType(['ACTION'])}
            color={deterministicMantineColor('ACTION')}
          >
            Action
          </Button>

          {filteredBlocks
            .filter((display) => blockType.includes(display.type))
            .map((display, index) => (
              <Card key={index} shadow='sm' padding='lg' style={{ marginBottom: '10px' }}>
                <Badge size='sm' color={deterministicMantineColor(display.type)} mb='xs'>
                  {display.type}
                </Badge>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <Text size='sm' style={{ fontWeight: 'bold' }}>
                      {display.emoji} {display.label}
                    </Text>
                    <Text size='xs' color='gray'>
                      {display.description}
                    </Text>
                  </div>
                </div>
                <Button
                  size='xs'
                  variant='light'
                  radius='md'
                  fullWidth
                  onClick={() => handleAddBlock(display.label)}
                  style={{ marginTop: '10px' }}
                >
                  + Add Block
                </Button>
              </Card>
            ))}
        </Card>
        <Card withBorder w='100%' ml='xs' mr='xs'>
          <Text sx={{ textTransform: 'uppercase' }} color='gray' fz='lg'>
            Playground
          </Text>
          <ScrollArea h='75vh'>
            <div
              style={{
                flex: 1,
                padding: '10px',
                justifyContent: 'center',
                width: '100%',
                backgroundSize: '20px 20px',
                backgroundImage: `linear-gradient(to right, #f5f5f5 1px, transparent 1px), linear-gradient(to bottom, #f5f5f5 1px, transparent 1px)`,
                backgroundPosition: '0 0',
                minHeight: '75vh',
              }}
            >
              <Box ml='auto' mr='auto' w='50%'>
                {stackedBlocks.map((block, index) => (
                  <Box key={index} w='100%'>
                    <Card
                      withBorder
                      padding='lg'
                      style={{ position: 'relative', marginBottom: '10px' }}
                    >
                      <CloseButton
                        style={{ position: 'absolute', top: 10, right: 10 }}
                        onClick={() => handleDeleteBlock(index)}
                      />
                      <Text fw='bold'>
                        {block.emoji} {block.label}
                      </Text>
                      <Text color='gray' fz='sm'>
                        {block.description}
                      </Text>
                      {block.inputs.map((input, inputIndex) => (
                        <Box key={inputIndex}>
                          {input.type === 'TEXT' && (
                            <Textarea
                              placeholder={input.placeholder}
                              label={input.label}
                              defaultValue={input.defaultValue as string}
                              onChange={(event) =>
                                handleInputChange(inputIndex, input.keyLink, event.target.value)
                              }
                              autosize
                              my='xs'
                            />
                          )}
                          {input.type === 'NUMBER' && (
                            <NumberInput
                              placeholder={input.placeholder}
                              label={input.label}
                              defaultValue={input.defaultValue as number}
                              onChange={(value) =>
                                handleInputChange(inputIndex, input.keyLink, `${value}`)
                              }
                              my='xs'
                            />
                          )}
                          {input.type === 'JSON' && (
                            <JsonInput
                              placeholder={input.placeholder}
                              label={input.label}
                              defaultValue={input.defaultValue as string}
                              onChange={(value) =>
                                handleInputChange(inputIndex, input.keyLink, value)
                              }
                              formatOnBlur
                              validationError='Invalid JSON'
                              autosize
                              minRows={3}
                              my='xs'
                            />
                          )}
                        </Box>
                      ))}
                    </Card>
                    {index < stackedBlocks.length - 1 && (
                      <Text fz='xl' mb='xs' mt='xs' style={{ textAlign: 'center' }}>
                        ↓
                      </Text>
                    )}
                  </Box>
                ))}
                {stackedBlocks.length === 0 && (
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center' }} color='gray' mt='30%' fz='xl'>
                      Add blocks from the library to get started.
                    </Text>
                    <IconCirclePlus size={36} style={{ marginLeft: '10px' }} color='gray' />
                  </Box>
                )}
              </Box>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </PageFrame>
  );
}

export default TriggersPage;

// const blockTypeOutlines: {
//   label: string;
//   description: string;
//   type: TriggerBlockType;
//   block: TriggerSourceBlock | TriggerFilterBlock | TriggerActionBlock;
//   emoji: string;
//   input: string[];
//   output: string[];
// }[] = [
//   {
//     label: 'News Based Sourcing',
//     description: 'Finds LinkedIn URLs from news events.',
//     type: 'SOURCE',
//     emoji: '📰',
//     input: ['Search query'],
//     output: ['Prospect LinkedIn URLs'],
//     block: createTriggerSourceBlock(
//       'News Based Sourcing',
//       'Finds LinkedIn URLs from news events.',
//       'GOOGLE_COMPANY_NEWS',
//       {
//         company_query: '',
//       }
//     ),
//     inputs: [{}],
//   },
//   {
//     label: 'Fundraise Based Sourcing',
//     description: 'Scrapes articles for fundraising events.',
//     type: 'Source',
//     emoji: '💰',
//     input: ['Search query'],
//     output: ['Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Filter', 'Action'],
//   },
//   {
//     label: 'Social Media Post',
//     description: 'Captures LinkedIn posts.',
//     type: 'Source',
//     emoji: '👥',
//     input: ['Search query'],
//     output: ['Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Filter', 'Action'],
//   },
//   {
//     label: 'Inbound Lead',
//     description: 'Tracks website webhook events for leads.',
//     type: 'Source',
//     emoji: '🌐',
//     input: [],
//     hook: ['api.sellscale.com/inbound/X8103AKOQ'],
//     output: ['Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Filter', 'Action'],
//   },
//   {
//     label: 'Champion Detection',
//     description: 'Detects job changes in existing customer base.',
//     type: 'Source',
//     emoji: '🏆',
//     input: [],
//     hook: ['CRM API KEY: 901283AOWIM2231'],
//     output: ['Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Filter', 'Action'],
//   },
//   {
//     label: 'CRM Lead Detection',
//     description: 'Identifies leads from CRM with no recent contact.',
//     type: 'Source',
//     emoji: '📊',
//     input: [],
//     hook: ['CRM API KEY: 8129381290IQWOE'],
//     output: ['Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Filter', 'Action'],
//   },
//   {
//     label: 'Filter Prospects',
//     description: 'Runs checks on prospects before importing.',
//     type: 'Filter',
//     emoji: '🔍',
//     input: ['Prospect LinkedIn URLs', 'Describe your filter condition'],
//     output: ['Filtered Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Action', 'Filter'],
//   },
//   {
//     label: 'Filter Company',
//     description: 'Validates companies from extracted data.',
//     type: 'Filter',
//     emoji: '🏢',
//     input: ['Prospect LinkedIn URLs', 'Describe your filter condition'],
//     output: ['Filtered Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Action', 'Filter'],
//   },
//   {
//     label: 'Import Contact to Campaign',
//     description: 'Imports LinkedIn URLs into a campaign.',
//     type: 'Action',
//     emoji: '➕',
//     input: ['Prospect LinkedIn URLs', 'Campaign ID'],
//     output: ['Prospect LinkedIn URLs'],
//     allowedNextBlockTypes: ['Action'],
//   },
//   {
//     label: 'Send Notification',
//     description: 'Sends Slack notifications with LinkedIn URLs.',
//     type: 'Action',
//     emoji: '🔔',
//     input: ['Prospect LinkedIn URLs', 'Slack Channel Webhook'],
//     output: ['Prospect Linkedin URLs'],
//     allowedNextBlockTypes: ['Action'],
//   },
//   // You can add more block types as needed
// ];
