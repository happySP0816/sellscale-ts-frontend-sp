import { ActionIcon, Avatar, Badge, Box, Button, Collapse, Divider, Flex, Grid, Group, Modal, Select, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconExternalLink,
  IconInfoCircle,
  IconLink,
  IconTrash,
} from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
import { IconFileTypePdf, IconPdf, IconSparkles } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import NonGenerativeListView from './NonGenerativeListView';

export default function NonGenerative(props: any) {
  const [tabs, setTabs] = useState('all');

  const [usedData, setUsedData] = useState<any>([]);
  const [unusedData, setUnUsedData] = useState<any>([]);

  const [openedUsed, { toggle: usedToggle }] = useDisclosure(true);
  const [openedUnUsed, { toggle: unusedToggle }] = useDisclosure(true);

  const [stepModalOpened, { open: stepOpen, close: stepClose }] = useDisclosure(false);
  const [useModalOpened, { open: useOpen, close: useClose }] = useDisclosure(false);
  const [assetModalOpened, { open: assetOpen, close: assetClose }] = useDisclosure(false);

  const [stepData, setStepData] = useState('Use in Any Step');
  const [stepValue, setStepValue] = useState('Use in Any Step');
  const [stepStatus, setStepStatus] = useState(false);
  const [stepKey, setStepKey] = useState();

  useEffect(() => {
    let usedData = props.data.filter((data: any) => data.usage === true);
    setUsedData(usedData);
    let unusedData = props.data.filter((data: any) => data.usage === false);
    setUnUsedData(unusedData);
  }, []);

  return (
    <>
      <Flex align={'center'} justify={'space-between'} w={'100%'} bg={'#f3f4f6'} p={8} style={{ borderRadius: '8px', borderTopLeftRadius: '0px' }}>
        <Flex>
          <Button onClick={() => setTabs('all')} color={'gray'} variant={tabs === 'all' ? 'white' : 'tranparent'}>
            All
          </Button>
          <Button onClick={() => setTabs('cta')} color={'gray'} variant={tabs === 'cta' ? 'white' : 'tranparent'}>
            CTAs
          </Button>
          <Button onClick={() => setTabs('email_templates')} color={'gray'} variant={tabs === 'email_templates' ? 'white' : 'tranparent'}>
            Email Templates
          </Button>
          <Button onClick={() => setTabs('linkedin_templates')} color={'gray'} variant={tabs === 'linkedin_templates' ? 'white' : 'tranparent'}>
            Linkedin Templates
          </Button>
        </Flex>
      </Flex>
      <Stack mt={'lg'}>
        {props.view === 'card' ? (
          <>
            <Flex gap={'sm'} align={'center'} w={'100%'}>
              <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
                Used Assets
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={usedToggle}>{openedUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <Collapse in={openedUsed}>
              <Grid>
                {usedData?.map((item: any, index: number) => {
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
                          <Button radius={'xl'} size='xs' variant='light' rightIcon={<IconChevronRight size={'1rem'} />} onClick={assetOpen}>
                            View PDF
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
                          <Tooltip key={index} label='Generate a link for this asset to use in Outreach.' withArrow>
                            <Stack>
                              <IconLink size={'1.4rem'} color='#499df9' />
                            </Stack>
                          </Tooltip>
                        </Flex>
                        <Flex p={'md'} direction={'column'} gap={'xs'} bg={item?.ai_reponse ? '#fff5ff' : '#f4f9ff'} style={{ borderRadius: '8px' }}>
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
                        <Tooltip
                          w={400}
                          withArrow
                          label={`${'Northrop Gruman is a defense company and so are all the people in this campaign. They would find this case study very relevant.'}`}
                          styles={{
                            tooltip: {
                              whiteSpace: 'normal',
                            },
                          }}
                        >
                          <div className='w-fit'>
                            <Text color='gray' variant='transparent' size={'sm'} fw={500} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <IconInfoCircle size={'1rem'} />
                              See why this is relevant
                            </Text>
                          </div>
                        </Tooltip>
                        <Group>
                          <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={500} color='gray' size={'sm'}>
                            Open Rate:{' '}
                            <Text fw={500} color={item?.open_rate > 50 ? 'green' : 'orange'}>
                              {item?.open_rate}%
                            </Text>
                          </Text>
                          <Divider orientation='vertical' />
                          <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={500} color='gray' size={'sm'}>
                            Reply Rate:{' '}
                            <Text fw={500} color={item?.reply_rate > 50 ? 'green' : 'orange'}>
                              {item?.reply_rate}%
                            </Text>
                          </Text>
                        </Group>

                        <Flex gap={'xl'}>
                          <Button
                            w={'100%'}
                            size='md'
                            variant='outline'
                            onClick={() => {
                              setStepStatus(false);
                              stepOpen();
                              //   setStepKey(index);
                            }}
                          >
                            {index === stepKey ? stepValue : 'Use in Any Step'}
                          </Button>
                          <Button w={'100%'} size='md' color='gray' variant='outline' leftIcon={<IconCircleX size={'1.2rem'} />}>
                            Stop Using
                          </Button>
                        </Flex>
                      </Flex>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Collapse>
            <Flex gap={'sm'} align={'center'} w={'100%'}>
              <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
                UnUsed Assets
              </Text>
              <Divider w={'100%'} />
              <ActionIcon onClick={unusedToggle}>{openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon>
            </Flex>
            <Collapse in={openedUnUsed}>
              <Grid>
                {unusedData?.map((item: any, index: number) => {
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
                          <Button radius={'xl'} size='xs' variant='light' rightIcon={<IconChevronRight size={'1rem'} />} onClick={assetOpen}>
                            View PDF
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
                        </Flex>
                        <Flex p={'md'} direction={'column'} gap={'xs'} bg={item?.ai_reponse ? '#fff5ff' : '#f4f9ff'} style={{ borderRadius: '8px' }}>
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
                        <Tooltip
                          w={400}
                          withArrow
                          label={`${'Northrop Gruman is a defense company and so are all the people in this campaign. They would find this case study very relevant.'}`}
                          styles={{
                            tooltip: {
                              whiteSpace: 'normal',
                            },
                          }}
                        >
                          <div className='w-fit'>
                            <Text color='gray' variant='transparent' size={'sm'} fw={500} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <IconInfoCircle size={'1rem'} />
                              See why this is relevant
                            </Text>
                          </div>
                        </Tooltip>
                        <Group>
                          <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={500} color='gray' size={'sm'}>
                            Open Rate:{' '}
                            <Text fw={500} color={item?.open_rate > 50 ? 'green' : 'orange'}>
                              {item?.open_rate}%
                            </Text>
                          </Text>
                          <Divider orientation='vertical' />
                          <Text style={{ display: 'flex', gap: '8px', alignItems: 'center' }} fw={500} color='gray' size={'sm'}>
                            Reply Rate:{' '}
                            <Text fw={500} color={item?.reply_rate > 50 ? 'green' : 'orange'}>
                              {item?.reply_rate}%
                            </Text>
                          </Text>
                        </Group>

                        <Flex gap={'xl'}>
                          <Button
                            w={'100%'}
                            size='md'
                            variant='outline'
                            onClick={() => {
                              useOpen();
                              //   setStepKey(index);
                            }}
                            leftIcon={<IconCircleCheck size={'1rem'} />}
                          >
                            Click to Use
                          </Button>
                          <Button w={'100%'} size='md' color='red' variant='outline' leftIcon={<IconTrash color='red' size={'1rem'} />}>
                            Delete
                          </Button>
                        </Flex>
                      </Flex>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Collapse>
            <Modal
              size={700}
              opened={useModalOpened}
              onClose={useClose}
              withCloseButton={false}
              styles={{
                body: {
                  padding: '30px',
                  height: 'auto',
                },
              }}
            >
              <Flex justify={'space-between'} align={'center'}>
                <Text fw={600} size={23}>
                  Asset Relevancy
                </Text>
                <ActionIcon onClick={useClose}>
                  <IconCircleX />
                </ActionIcon>
              </Flex>
              <Flex mt={'lg'} align={'center'}>
                <Text w={'100%'} fw={500}>
                  How is this asset relevant to the prospects in <span style={{ color: '#228be6' }}>`Department of Defense healthcare decision makers`</span>?
                </Text>
                <Box w={'100%'} sx={{ border: '1px solid #e3e6ec', borderRadius: '8px', borderStyle: 'dashed' }} p={'md'} bg={'#f7f8fa'}>
                  <Text tt={'uppercase'} color='gray' size={'sm'}>
                    example contact:
                  </Text>
                  <Flex align={'center'} gap={'xs'} mt={'4px'}>
                    <Avatar src='/' size={'md'} radius={'xl'} color='green' />
                    <Box>
                      <Text size={'md'} fw={600}>
                        {'Donald Bryant'}
                      </Text>
                      <Text fw={400} size={'xs'}>
                        Chief Revenue Officer, Videra
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
              <Textarea placeholder='Enter reason here' mt={'md'} minRows={5} radius={'md'} />
              <Flex gap={'xl'} mt={'xl'}>
                <Button variant='outline' color='gray' size='md' fullWidth onClick={useClose}>
                  Go Back
                </Button>
                <Button
                  size='md'
                  fullWidth
                  onClick={() => {
                    useClose();
                  }}
                >
                  Use Asset
                </Button>
              </Flex>
            </Modal>
            <Modal
              size={700}
              opened={stepModalOpened}
              onClose={stepClose}
              withCloseButton={false}
              styles={{
                body: {
                  padding: '30px',
                  height: 'auto',
                },
              }}
            >
              <Flex justify={'space-between'} align={'center'}>
                <Text fw={600} size={23}>
                  Use in Step
                </Text>
                <ActionIcon onClick={stepClose}>
                  <IconCircleX />
                </ActionIcon>
              </Flex>
              <Select
                data={['Use in Any Step', 'Use in Step #1', 'Use in Step #2', 'Use in Step #3']}
                styles={{
                  item: {
                    borderBottom: '1px solid #ced4da',
                    borderBottomRightRadius: '0px',
                    borderBottomLeftRadius: '0px',
                    paddingInline: '10px',
                    paddingBlockEnd: '4px',
                  },
                }}
                defaultValue='Use in Any Step'
                mt={'md'}
                value={stepData}
                onChange={(value: string) => {
                  setStepData(value);
                }}
              />
              <Flex gap={'xl'} mt={'xl'}>
                <Button variant='outline' color='gray' size='md' fullWidth onClick={stepClose}>
                  Go Back
                </Button>
                <Button
                  size='md'
                  fullWidth
                  onClick={() => {
                    setStepStatus(true);
                    useClose();
                    setStepValue(stepData);
                  }}
                >
                  Use
                </Button>
              </Flex>
            </Modal>
            <Modal
              size={700}
              opened={assetModalOpened}
              onClose={assetClose}
              withCloseButton={false}
              styles={{
                body: {
                  padding: '30px',
                  height: 'auto',
                },
              }}
            >
              <Flex justify={'space-between'} align={'center'}>
                <Text fw={600} size={23}>
                  Asset Preview
                </Text>
                <ActionIcon onClick={assetClose}>
                  <IconCircleX />
                </ActionIcon>
              </Flex>
              <Flex
                direction={'column'}
                bg={'#f5f9fe'}
                gap={'md'}
                p={'lg'}
                mt={'md'}
                sx={{ border: '1px solid #a4c7f8', borderRadius: '8px', borderStyle: 'dashed' }}
              >
                <Box>
                  <Text color='gray' fw={500} size={'sm'}>
                    Asset Title:
                  </Text>
                  <Text fw={500}>{'Behaviroal Health ROL'}</Text>
                </Box>
                <Box>
                  <Text color='gray' fw={500} size={'sm'}>
                    Asset Assigned to:
                  </Text>
                  <Text fw={500}>{'West Coast Campaign'}</Text>
                </Box>
                <Flex gap={'md'}>
                  <Box w={'100%'}>
                    <Text color='gray' fw={500} size={'sm'}>
                      Asset Type:
                    </Text>
                    <Text fw={500}>{'Case Study'}</Text>
                  </Box>
                  <Box w={'100%'}>
                    <Text color='gray' fw={500} size={'sm'}>
                      Ingestion Method:
                    </Text>
                    <Text fw={500}>{'PDF'}</Text>
                  </Box>
                </Flex>
                <Box w={'50%'}>
                  <Text color='gray' fw={500} size={'sm'}>
                    Asset File:
                  </Text>
                  <Flex gap={'sm'} p={'xs'} mt={'4px'} sx={{ border: '1px solid #82b2f5', borderRadius: '8px' }}>
                    <Flex h={'100%'}>
                      <IconFileTypePdf size={'2.6rem'} color='red' />
                    </Flex>
                    <Box>
                      <Flex gap={'5px'} align={'center'}>
                        <Text size={'sm'}>{'Behavirour.pdf'}</Text>
                        <IconExternalLink size={'1rem'} color='#228be6' />{' '}
                      </Flex>
                      <Text color='gray' size={'xs'}>
                        200 KB
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
              <Flex gap={'xl'} mt={'xl'}>
                <Button variant='outline' color='gray' size='md' fullWidth onClick={assetClose}>
                  Go Back
                </Button>
                <Button
                  size='md'
                  fullWidth
                  onClick={() => {
                    assetClose();
                  }}
                >
                  Edit Asset
                </Button>
              </Flex>
            </Modal>
          </>
        ) : (
          <NonGenerativeListView useData={usedData} unUseData={unusedData} />
        )}
      </Stack>
    </>
  );
}
