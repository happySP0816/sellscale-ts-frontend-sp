import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Grid,
  Group,
  HoverCard,
  List,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
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
import { AssetType } from './AssetLibraryV2';
import { useRecoilValue } from 'recoil';
import { API_URL } from '@constants/data';
import { userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';

export default function CardView(props: any) {
  const [tabs, setTabs] = useState('all');

  const [openedUsed, { toggle: usedToggle }] = useDisclosure(true);
  const [openedUnUsed, { toggle: unusedToggle }] = useDisclosure(true);

  const [stepModalOpened, { open: stepOpen, close: stepClose }] = useDisclosure(false);
  const [useModalOpened, { open: useOpen, close: useClose }] = useDisclosure(false);
  const [assetModalOpened, { open: assetOpen, close: assetClose }] = useDisclosure(false);
  const [editAsset, setEditAsset] = useState<AssetType>();
  const [reason, setReason] = useState('');
  const userToken = useRecoilValue(userTokenState);

  const [stepData, setStepData] = useState('Use in Any Step');
  const [stepValue, setStepValue] = useState('Use in Any Step');
  const [stepStatus, setStepStatus] = useState(false);
  const [stepKey, setStepKey] = useState();

  const useData = props.useData as AssetType[];
  const unUseData = props.unUseData as AssetType[];

  return (
    <>
    <Modal opened={!!editAsset} onClose={() => setEditAsset(undefined)} title="Edit Asset">
      {editAsset && (
        <Stack spacing="md">
          <TextInput
            label="Asset Key"
            value={editAsset.asset_key}
            onChange={(e) => setEditAsset({ ...editAsset, asset_key: e.target.value })}
          />
          <Textarea
            label="Asset Raw Value"
            value={editAsset.asset_raw_value || ''}
            onChange={(e) => setEditAsset({ ...editAsset, asset_raw_value: e.target.value })}
          />
          <Select
            label="Asset Type"
            value={editAsset.asset_type}
            onChange={(value) => setEditAsset({ ...editAsset, asset_type: value as 'PDF' | 'URL' | 'TEXT' })}
            data={[
              { value: 'PDF', label: 'PDF' },
              { value: 'URL', label: 'URL' },
              { value: 'TEXT', label: 'TEXT' },
            ]}
          />
          <TextInput
            label="Asset Value"
            value={editAsset.asset_value}
            onChange={(e) => setEditAsset({ ...editAsset, asset_value: e.target.value })}
          />
          <MultiSelect
            label="Client Archetypes"
            data={editAsset.client_archetype_ids ? editAsset.client_archetype_ids.map(id => ({ value: id.toString(), label: id.toString() })) : []}
            value={editAsset.client_archetype_ids?.map(id => id.toString())}
            onChange={(values) => setEditAsset({ ...editAsset, client_archetype_ids: values.map(Number) })}
            placeholder="Select archetype IDs"
            creatable
            searchable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const newId = Number(query);
              if (!isNaN(newId)) {
                setEditAsset((prev: any) => ({
                  ...prev,
                  client_archetype_ids: [...prev.client_archetype_ids, newId],
                }));
                return { value: query, label: query };
              }
              return null;
            }}
          />
          {/* <TextInput
            label="Client ID"
            value={editAsset.client_id.toString()}
            onChange={(e) => setEditAsset({ ...editAsset, client_id: Number(e.target.value) })}
          /> */}
          <MultiSelect
            label="Asset Tags"
            data={[
              { value: 'Offer', label: 'Offer' },
              { value: 'Phrase', label: 'Phrase' },
              { value: 'Case Study', label: 'Case Study' },
              { value: 'Research', label: 'Research' },
              { value: 'subject line', label: 'subject line' },
              { value: 'LinkedIn CTA', label: 'LinkedIn CTA' },
              { value: 'CTA', label: 'CTA' },
              { value: 'email template', label: 'email template' },
              { value: 'linkedin template', label: 'linkedin template' },
            ]}
            value={editAsset.asset_tags}
            onChange={(values) => setEditAsset({ ...editAsset, asset_tags: values })}
            placeholder="Select or create tags"
            creatable
            searchable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              setEditAsset((prev: any) => ({
                ...prev,
                asset_tags: [...prev.asset_tags, query],
              }));
              return { value: query, label: query };
            }}
          />
          <TextInput
            disabled
            label="Number of Opens"
            value={editAsset.num_opens ? editAsset.num_opens.toString() : '0'}
            onChange={(e) => setEditAsset({ ...editAsset, num_opens: Number(e.target.value) })}
          />
          <TextInput
            disabled
            label="Number of Replies"
            value={editAsset.num_replies ? editAsset.num_replies.toString() : '0'}
            onChange={(e) => setEditAsset({ ...editAsset, num_replies: Number(e.target.value) })}
          />
          <TextInput
            disabled
            label="Number of Sends"
            value={editAsset.num_sends ? editAsset.num_sends.toString() : '0'}
            onChange={(e) => setEditAsset({ ...editAsset, num_sends: Number(e.target.value) })}
          />
          <Button onClick={() => { 
            fetch(`${API_URL}/client/update_asset`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...editAsset, asset_id: editAsset.id }),
            }).then(() => {
              props.fetchAssets();
              setEditAsset(undefined);
            });
          }}>Save Changes</Button>
        </Stack>
      )}
    </Modal>
      <Stack mt={'lg'}>
        <Flex gap={'sm'} align={'center'} w={'100%'}>
          <Text sx={{ whiteSpace: 'nowrap' }} color='gray' fw={500}>
            Used Assets
          </Text>
          <Divider w={'100%'} />
          <ActionIcon onClick={usedToggle}>
            {openedUsed ? <IconChevronUp /> : <IconChevronDown />}
          </ActionIcon>
        </Flex>
        <Collapse in={openedUsed}>
          <Grid>
            {useData?.map((item: AssetType, index: number) => {
              return (
                <Grid.Col span={window.location.href.includes('selix') ? 6 : 4} key={index}>
                  <Flex
                    style={{ border: '1px solid #ced4da', borderRadius: '8px' }}
                    p={'xl'}
                    direction={'column'}
                    gap={'sm'}
                  >
                    <Flex align={'center'} justify={'space-between'}>
                      <HoverCard width={280} shadow="md">
                        <HoverCard.Target>
                          <Badge
                            leftSection={
                              <IconCircleCheck size={'1rem'} style={{ marginTop: '7px' }} />
                            }
                            variant='filled'
                            size='lg'
                            color={'blue'}
                          >
                            {'used in campaign'}
                          </Badge>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <Text size="sm" weight={500}>
                            Campaigns:
                          </Text>
                          <List size="sm" spacing="xs">
                            {item.client_archetype_ids?.map((campaign, idx) => (
                              <List.Item key={idx}>
                                <a href={`/campaign_v2/${campaign}`} target="_blank" rel="noopener noreferrer">{campaign}</a>
                              </List.Item>
                            ))}
                          </List>
                        </HoverCard.Dropdown>
                      </HoverCard>
                     {item.asset_type === 'PDF' && <Button
                        radius={'xl'}
                        size='xs'
                        variant='light'
                        rightIcon={<IconChevronRight size={'1rem'} />}
                        onClick={assetOpen}
                      >
                        View PDF
                      </Button>}
                    </Flex>
                    <Flex gap={'5px'}>
                      <Badge
                        size='lg'
                        color={
                          item.asset_type === 'PDF'
                            ? 'pink'
                            : item?.asset_type === 'URL'
                            ? 'orange'
                            : 'green'
                        }
                      >
                        {item?.asset_tags.join(', ')}
                      </Badge>
                      <Badge variant='outline' color='gray' size='lg'>
                        ingestion type: {item?.asset_type}
                      </Badge>
                    </Flex>
                    <Flex align={'center'} w={'fit-content'}>
                      <Text fw={700} lineClamp={1} w={'100%'} size={'xl'}>
                        {item?.asset_key}
                      </Text>
                      <Tooltip
                        key={index}
                        label='Generate a link for this asset to use in Outreach.'
                        withArrow
                      >
                        <Stack>
                          <IconLink size={'1.4rem'} color='#499df9' />
                        </Stack>
                      </Tooltip>
                    </Flex>
                    <Flex
                      p={'md'}
                      direction={'column'}
                      gap={'xs'}
                      bg={item?.asset_raw_value ? '#fff5ff' : '#f4f9ff'}
                      style={{ borderRadius: '8px' }}
                    >
                      {/* {!item?.asset_raw_value && (
                        <Flex align={'center'} justify={'space-between'}>
                          <Text
                            color='#ec58fb'
                            size={'lg'}
                            fw={700}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                          </Text>
                          <IconEdit color='gray' size={'1.2rem'} />
                        </Flex>
                      )} */}
                      <Flex align={'end'}>
                        <Text lineClamp={2} size={'sm'} color='gray' fw={600}>
                          {
                            item?.asset_raw_value || item?.asset_value
                          }
                        </Text>
                        {true && (
                          <Flex onClick={() => setEditAsset(item)}>
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
                        <Text
                          color='gray'
                          variant='transparent'
                          size={'sm'}
                          fw={500}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconInfoCircle size={'1rem'} />
                          See why this is relevant
                        </Text>
                      </div>
                    </Tooltip>
                    <Group>
                      <Text
                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        fw={500}
                        color='gray'
                        size={'sm'}
                      >
                        Open Rate:{' '}
                        <Text fw={500} color={item?.num_opens > 50 ? 'green' : 'orange'}>
                          {item?.num_opens}%
                        </Text>
                      </Text>
                      <Divider orientation='vertical' />
                      <Text
                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        fw={500}
                        color='gray'
                        size={'sm'}
                      >
                        Reply Rate:{' '}
                        <Text fw={500} color={item?.num_replies > 50 ? 'green' : 'orange'}>
                          {item?.num_replies}%
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
                      <Button
                        w={'100%'}
                        size='md'
                        color='gray'
                        variant='outline'
                        leftIcon={<IconCircleX size={'1.2rem'} />}
                        onClick={() => {
                          fetch(`${API_URL}/client/update_asset`, {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${userToken}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ ...item, client_archetype_ids: [], asset_id: item.id }),
                          }).then(() => {
                            props.fetchAssets();
                            showNotification({ title: 'Asset removed from campaigns', message: 'Asset removed from campaigns' });
                          });
                        }}
                      >
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
            Un-used Assets
          </Text>
          <Divider w={'100%'} />
          <ActionIcon onClick={unusedToggle}>
            {openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}
          </ActionIcon>
        </Flex>
        <Collapse in={openedUnUsed}>
          <Grid>
            {unUseData?.map((item: AssetType, index: number) => {
              return (
                <Grid.Col span={4} key={index}>
                  <Flex
                    style={{ border: '1px solid #ced4da', borderRadius: '8px' }}
                    p={'xl'}
                    direction={'column'}
                    gap={'sm'}
                  >
                    <Flex align={'center'} justify={'space-between'}>
                      <Badge
                        leftSection={
                          item?.client_archetype_ids && item.client_archetype_ids.length > 0 ? (
                            <IconCircleCheck size={'1rem'} style={{ marginTop: '7px' }} />
                          ) : (
                            ''
                          )
                        }
                        variant='filled'
                        size='lg'
                        color={item?.client_archetype_ids && item.client_archetype_ids.length > 0 ? 'blue' : 'gray'}
                      >
                        {item?.client_archetype_ids && item.client_archetype_ids.length > 0 ? 'used in campaign' : 'not used'}
                      </Badge>
                      {item.asset_type === 'PDF' && <Button
                        radius={'xl'}
                        size='xs'
                        variant='light'
                        rightIcon={<IconChevronRight size={'1rem'} />}
                        onClick={assetOpen}
                      >
                        View PDF
                      </Button>}
                    </Flex>
                    <Flex gap={'5px'}>
                      <Badge
                        size='lg'
                        color={
                          item?.asset_type === 'PDF'
                            ? 'pink'
                            : item?.asset_type === 'URL'
                            ? 'orange'
                            : 'green'
                        }
                      >
                        {item?.asset_type}
                      </Badge>
                      <Badge variant='outline' color='gray' size='lg'>
                        ingestion type: {item?.asset_type}
                      </Badge>
                    </Flex>
                    <Flex align={'center'} w={'fit-content'}>
                      <Text fw={700} lineClamp={1} w={'100%'} size={'xl'}>
                        {item?.asset_key}
                      </Text>
                    </Flex>
                    <Flex
                      p={'md'}
                      direction={'column'}
                      gap={'xs'}
                      // ai response?
                      bg={false ? '#fff5ff' : '#f4f9ff'} 
                      style={{ borderRadius: '8px' }}
                    >
                      {/* {item?.ai_reponse && (
                        <Flex align={'center'} justify={'space-between'}>
                          <Text
                            color='#ec58fb'
                            size={'lg'}
                            fw={700}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <IconSparkles size={'1.4rem'} fill='pink' /> AI Summary
                          </Text>
                          <IconEdit color='gray' size={'1.2rem'} />
                        </Flex>
                      )} */}
                      <Flex align={'end'}>
                        <Text lineClamp={2} size={'sm'} color='gray' fw={600}>
                          {
                            item?.asset_raw_value || item?.asset_value
                            }
                        </Text>
                        {true &&(
                          <Flex ml='sm' onClick={() => {
                            setEditAsset(item);
                          }}>
                            <IconEdit color='gray'/>
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
                        <Text
                          color='gray'
                          variant='transparent'
                          size={'sm'}
                          fw={500}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <IconInfoCircle size={'1rem'} />
                          See why this is relevant
                        </Text>
                      </div>
                    </Tooltip>
                    <Group>
                      <Text
                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        fw={500}
                        color='gray'
                        size={'sm'}
                      >
                        Open Rate:{' '}
                        <Text fw={500} color={item?.num_opens > 50 ? 'green' : 'orange'}>
                          {item?.num_sends ? (item?.num_opens / item?.num_sends) : 0}%
                        </Text>
                      </Text>
                      <Divider orientation='vertical' />
                      <Text
                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        fw={500}
                        color='gray'
                        size={'sm'}
                      >
                        Reply Rate:{' '}
                        <Text fw={500} color={item?.num_replies > 50 ? 'green' : 'orange'}>
                          {item?.num_sends ? (item?.num_replies / item?.num_sends) : 0}%
                        </Text>
                      </Text>
                    </Group>

                    <Flex gap={'xl'}>
                      <Button
                        w={'100%'}
                        size='md'
                        variant='outline'
                        onClick={() => {
                          fetch(`${API_URL}/client/toggle_archetype_id_in_asset_ids`, {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${userToken}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              asset_id: item.id,
                              client_archetype_id: -1,
                              reason: reason || null,
                              step_number: item.asset_tags.includes('Linkedin CTA') ? 1 : null,
                            }),
                          }).then(() => {
                            useOpen();
                            props.fetchAssets();
                          });
                        }}
                        leftIcon={<IconCircleCheck size={'1rem'} />}
                      >
                        Click to Use
                      </Button>
                      <Button
                        w={'100%'}
                        size='md'
                        color='red'
                        variant='outline'
                        leftIcon={<IconTrash color='red' size={'1rem'} />}
                        onClick={() => {
                          fetch(`${API_URL}/client/asset`, {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${userToken}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ asset_id: item.id }),
                          }).then(() => {
                            props.fetchAssets();
                            showNotification({ title: 'Asset Deleted', message: 'The asset has been successfully deleted.' });
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Flex>
                </Grid.Col>
              );
            })}
          </Grid>
        </Collapse>
      </Stack>
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
            How is this asset relevant to the prospects in{' '}
            <span style={{ color: '#228be6' }}>
              `Department of Defense healthcare decision makers`
            </span>
            ?
          </Text>
          <Box
            w={'100%'}
            sx={{ border: '1px solid #e3e6ec', borderRadius: '8px', borderStyle: 'dashed' }}
            p={'md'}
            bg={'#f7f8fa'}
          >
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
        <Textarea 
          placeholder='Enter reason here' 
          mt={'md'} 
          minRows={5} 
          radius={'md'} 
          value={reason} 
          onChange={(event) => setReason(event.currentTarget.value)} 
        />
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
            <Flex
              gap={'sm'}
              p={'xs'}
              mt={'4px'}
              sx={{ border: '1px solid #82b2f5', borderRadius: '8px' }}
            >
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
  );
}
