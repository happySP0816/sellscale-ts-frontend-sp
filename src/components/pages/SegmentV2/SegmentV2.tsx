import {
  Accordion,
  ActionIcon,
  rem,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Modal,
  NumberInput,
  Paper,
  Progress,
  Select,
  Text,
  useMantineTheme,
  Container,
} from '@mantine/core';
import {
  IconArrowRight,
  IconBolt,
  IconButterfly,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleX,
  IconEdit,
  IconFilter,
  IconLetterT,
  IconMicrophone,
  IconPlus,
  IconTargetArrow,
  IconToggleRight,
  IconWand,
} from '@tabler/icons';
import { DataGrid } from 'mantine-data-grid';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import CustomSelect from '@common/persona/ICPFilter/CustomSelect';

export default function SegmentV2() {
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);

  const [arrow, setArrow] = useState(false);
  const [data, setData] = useState([
    {
      id: 1,
      person_name: 'Product Leaders',
      progress: 22,
      campaign: 33,
      contacts: 1766890,
      filters: 3,
      assets: 51,
      sub_segments: [
        {
          person_name: 'Product Leaders - US',
          progress: 69,
          campaign: null,
          contacts: 1766890,
          filters: 3,
          assets: 42,
        },
        {
          person_name: 'Product Leaders - Middle East',
          progress: 22,
          campaign: 33,
          contacts: 1766890,
          filters: 3,
          assets: null,
        },
      ],
    },
    {
      id: 2,
      person_name: 'In-house Researcher',
      progress: 22,
      campaign: 12,
      contacts: 1766890,
      filters: 10,
      assets: null,
      sub_segments: [],
    },
    {
      id: 3,
      person_name: 'UI/UX',
      progress: 22,
      campaign: 5,
      contacts: 1766890,
      filters: 10,
      assets: null,
      sub_segments: [],
    },
    {
      id: 4,
      person_name: 'Private Equity',
      progress: 22,
      campaign: 5,
      contacts: 1766890,
      filters: 10,
      assets: null,
      sub_segments: [
        {
          person_name: 'Product Leaders - US',
          progress: 69,
          campaign: null,
          contacts: 1766890,
          filters: 3,
          assets: 42,
        },
      ],
    },
  ]);

  const [expandedRows, setExpandedRows] = useState<any>([]);
  const toggle = (id: any) => {
    setArrow(!arrow);
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((rowId: any) => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };
  const getNestedRows = (rows: any) => {
    return rows.flatMap((row: any) => {
      const hasChildren = expandedRows.includes(row.id) && row.sub_segments && row.sub_segments.length > 0;
      const nestedRows = hasChildren
        ? row.sub_segments.map((subSegment: any, index: number, array: any[]) => ({
            ...subSegment,
            parentId: row.id,
            isChild: true,
            isLastChild: index === array.length - 1,
          }))
        : [];
      return [{ ...row, isChild: false, hasChildren: hasChildren }, ...nestedRows];
    });
  };
  const columns = [
    {
      accessorKey: 'persona_name',
      minSize: 400,
      header: () => (
        <Flex align={'center'} gap={'3px'}>
          <IconLetterT color='gray' size={'0.9rem'} />
          <Text color='gray'>Persona Name</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild, isLastChild } = cell.row.original;
        const { id, person_name, sub_segments, progress } = cell.row.original;

        return (
          <div className={`${isChild ? 'bg-[#F7F8FA] pl-8 h-full' : ''} relative`}>
            {isChild && (
              <div
                className={`absolute flex flex-col  ${isLastChild ? 'h-[55%] justify-end' : 'h-full justify-center'} mr-10`}
                style={{ borderLeft: '2px solid #D9DEE5' }}
              >
                <IconArrowRight
                  size={'1.2rem'}
                  color='#D9DEE5'
                  className={`${isLastChild ? 'absolute bottom-[-9.2px] left-[-3px]' : 'absolute left-[-3px]'}`}
                />
              </div>
            )}

            <Flex
              w={'100%'}
              h={'100%'}
              px={'sm'}
              align={'center'}
              justify={'start'}
              py={'md'}
              ml={isChild ? 'sm' : '0px'}
              className={`${isChild ? 'absolute before:absolute before:-inset-1 before:bg-[#8D8DC5] before:w-[2px] before:left-1 before:top-[1px]' : ''} `}
            >
              <Flex align={'center'} gap={'sm'} className='segment'>
                <Avatar size={'md'} radius={'xl'} src={''} />
                <Box>
                  <Flex align={'center'} gap={'sm'}>
                    <Text size={'sm'} fw={500}>
                      {person_name}
                    </Text>
                    {sub_segments && sub_segments.length > 0 && (
                      <Badge
                        tt={'initial'}
                        variant='outline'
                        onClick={() => toggle(id)}
                        rightSection={
                          expandedRows.includes(id) ? (
                            <IconChevronUp size={'0.9rem'} style={{ marginTop: '5px' }} />
                          ) : (
                            <IconChevronDown size={'0.9rem'} style={{ marginTop: '5px' }} />
                          )
                        }
                      >
                        {expandedRows.includes(id) ? 'Hide' : 'Show'} Sub-Segments
                      </Badge>
                    )}
                    <Badge variant='outline' color='green' leftSection={<IconButterfly size={'0.9rem'} style={{ marginTop: '4px' }} />} tt={'initial'}>
                      Split
                    </Badge>
                  </Flex>
                  <Flex align={'center'} gap={'sm'} mt={3}>
                    <Progress value={progress} w={140} />
                    <Text color='#3B85EF' fw={600}>
                      {progress}% Contacted
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </div>
        );
      },
    },
    {
      accessorKey: 'campaigns',
      minSize: 180,
      header: () => (
        <Flex align={'center'} gap={'3px'}>
          <IconTargetArrow color='gray' size={'0.9rem'} />
          <Text color='gray'>Campaigns</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild } = cell.row.original;
        const { campaign } = cell.row.original;
        return (
          <Flex w={'100%'} h={'100%'} px={'sm'} py={'md'} align={'center'} justify={'start'} bg={isChild ? '#F7F8FA' : 'white'}>
            <Badge
              variant={campaign ? 'outline' : 'filled'}
              color='blue'
              radius='md'
              size='xl'
              leftSection={<IconTargetArrow size={'0.9rem'} style={{ marginTop: '12px' }} />}
              tt={'initial'}
              fw={600}
              sx={{ fontSize: '12px' }}
            >
              {campaign ? `${campaign} Campaigns` : 'Assign to Campagin'}
            </Badge>
          </Flex>
        );
      },
    },
    {
      accessorKey: 'pre_filters',
      header: () => (
        <Flex align={'center'} gap={'3px'}>
          <IconBolt color='gray' size={'0.9rem'} />
          <Text color='gray'>Pre-Filters</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild } = cell.row.original;
        const { contacts, filters } = cell.row.original;

        return (
          <Flex w={'100%'} h={'100%'} px={'sm'} py={'md'} align={'center'} justify={'start'} bg={isChild ? '#F7F8FA' : 'white'}>
            <Box>
              <Flex gap={4} fw={600}>
                <Text>{contacts}</Text>
                <Text color='gray'>Contacts</Text>
              </Flex>
              <Flex gap={4} align={'center'} fw={600}>
                <Text>{filters}</Text>
                <Text color='gray'>Filters</Text>
                <IconEdit color='#3B85EF' size={'1.2rem'} />
                <Text underline color='#3B85EF' sx={{ textUnderlineOffset: '3px', cursor: 'pointer' }} onClick={open}>
                  Edit
                </Text>
              </Flex>
            </Box>
          </Flex>
        );
      },
    },
    {
      accessorKey: 'ai_brain',
      header: () => (
        <Flex align={'center'} gap={'3px'}>
          <IconBolt color='gray' size={'0.9rem'} />
          <Text color='gray'>AI Brain</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild } = cell.row.original;
        const { assets } = cell.row.original;

        return (
          <Flex w={'100%'} h={'100%'} px={'sm'} py={'md'} align={'center'} justify={'start'} bg={isChild ? '#F7F8FA' : 'white'}>
            {assets ? (
              <Box>
                <Flex gap={4} fw={600}>
                  <Text>{assets}</Text>
                  <Text color='gray'>Assets</Text>
                </Flex>
                <Flex gap={4} align={'center'} fw={600}>
                  <IconPlus size={'1.2rem'} color='#3B85EF' />
                  <Text underline color='#3B85EF' sx={{ textUnderlineOffset: '3px' }}>
                    Add More Assets
                  </Text>
                </Flex>
              </Box>
            ) : (
              <Button leftIcon={<IconWand size={'0.9rem'} />} size='xs' radius='md'>
                Add Assets
              </Button>
            )}
          </Flex>
        );
      },
    },
    {
      accessorKey: 'voice',
      header: () => (
        <Flex align={'center'} gap={'3px'}>
          <IconToggleRight color='gray' size={'0.9rem'} />
          <Text color='gray'>Voice</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild } = cell.row.original;

        return (
          <Flex w={'100%'} h={'100%'} px={'sm'} py={'md'} align={'center'} justify={'start'} bg={isChild ? '#F7F8FA' : 'white'}>
            <Button color='grape' radius='md' leftIcon={<IconMicrophone size={'0.9rem'} />} size='xs'>
              Add Voice
            </Button>
          </Flex>
        );
      },
    },
  ];

  const [revenueData, setRevenueData] = useState(['Option One', 'Option two', 'Option three', 'Option Four', 'Option Five']);
  const [headcountData, setHeadCountData] = useState(['Option One', 'Option two', 'Option three', 'Option Four', 'Option Five']);

  return (
    <Paper>
      <Flex direction={'column'} w={'90%'} mx={'auto'} pt={'lg'}>
        <Flex align={'center'} justify={'space-between'}>
          <Text size={'lg'} fw={600}>
            Segments
          </Text>
          <Button leftIcon={<IconPlus />}>Create Segment</Button>
        </Flex>
        <Text color='gray' fw={500} size={'sm'} mb={'xl'}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean viverra risus sit amet neque mattis efficitur.{' '}
        </Text>
        <DataGrid
          withPagination
          withBorder
          sx={{ cursor: 'pointer' }}
          withColumnBorders
          data={getNestedRows(data)}
          columns={columns}
          components={{
            pagination: ({ table }) => (
              <Flex
                justify={'space-between'}
                align={'center'}
                px={'sm'}
                bg={'white'}
                py={'1.25rem'}
                sx={(theme) => ({
                  border: `1px solid ${theme.colors.gray[4]}`,
                  borderTopWidth: 0,
                })}
              >
                <Flex align={'center'} gap={'sm'}>
                  <Text fw={500} size={'sm'} color='gray.6'>
                    Show
                  </Text>

                  <Flex align={'center'}>
                    <NumberInput
                      maw={100}
                      value={table.getState().pagination.pageSize}
                      onChange={(v) => {
                        if (v) {
                          table.setPageSize(v);
                        }
                      }}
                    />
                    <Flex
                      sx={(theme) => ({
                        borderTop: `1px solid ${theme.colors.gray[4]}`,
                        borderRight: `1px solid ${theme.colors.gray[4]}`,
                        borderBottom: `1px solid ${theme.colors.gray[4]}`,
                        marginLeft: '-2px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.25rem',
                      })}
                      h={36}
                    >
                      <Text color='gray.5' fw={500} fz={14}>
                        of {table.getPrePaginationRowModel().rows.length}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                <Flex align={'center'} gap={'sm'}>
                  <Flex align={'center'}>
                    <Select
                      maw={100}
                      value={`${table.getState().pagination.pageIndex + 1}`}
                      data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                        label: String(idx + 1),
                        value: String(idx + 1),
                      }))}
                      onChange={(v) => {
                        table.setPageIndex(Number(v) - 1);
                      }}
                    />
                    <Flex
                      sx={(theme) => ({
                        borderTop: `1px solid ${theme.colors.gray[4]}`,
                        borderRight: `1px solid ${theme.colors.gray[4]}`,
                        borderBottom: `1px solid ${theme.colors.gray[4]}`,
                        marginLeft: '-2px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.25rem',
                      })}
                      h={36}
                    >
                      <Text color='gray.5' fw={500} fz={14}>
                        of {table.getPageCount()} pages
                      </Text>
                    </Flex>
                    <ActionIcon
                      variant='default'
                      color='gray.4'
                      h={36}
                      disabled={table.getState().pagination.pageIndex === 0}
                      onClick={() => {
                        table.setPageIndex(table.getState().pagination.pageIndex - 1);
                      }}
                    >
                      <IconChevronLeft stroke={theme.colors.gray[4]} />
                    </ActionIcon>
                    <ActionIcon
                      variant='default'
                      color='gray.4'
                      h={36}
                      disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                      onClick={() => {
                        table.setPageIndex(table.getState().pagination.pageIndex + 1);
                      }}
                    >
                      <IconChevronRight stroke={theme.colors.gray[4]} />
                    </ActionIcon>
                  </Flex>
                </Flex>
              </Flex>
            ),
          }}
          w={'100%'}
          pageSizes={['20']}
          styles={(theme) => ({
            thead: {
              '::after': {
                backgroundColor: 'transparent',
              },
            },
            th: {
              paddingTop: `${rem(10)} !important`,
              paddingBottom: `${rem(10)} !important`,
            },
            tbody: {
              backgroundColor: 'white',
            },
            td: {
              padding: '0px !important',
            },

            wrapper: {
              gap: 0,
              marginTop: '0 !important',
            },
            scrollArea: {
              paddingBottom: 0,
              gap: 0,
            },

            dataCellContent: {
              width: '100%',
              whiteSpace: 'normal',
            },
          })}
        />
      </Flex>
      <Modal size={'lg'} opened={opened} onClose={close} withCloseButton={false}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex gap={'sm'} align={'center'}>
            <IconFilter color='#3B85EF' size={'2rem'} />
            <Text size={24} fw={600}>
              Edit Pre-filters
            </Text>
          </Flex>
          <ActionIcon onClick={close}>
            <IconCircleX />
          </ActionIcon>
        </Flex>
        <Text size={'sm'} color='gray' fw={500} mt={'sm'} mb={'md'}>
          Configure the pre-filters below to fine-tune the segment contacts.
        </Text>
        <Accordion
          defaultValue='sorting'
          styles={{
            control: {
              padding: '0px',
            },
            content: {
              paddingInline: '0px',
            },
          }}
        >
          <Accordion.Item key={'job_title'} value={'job_title'}>
            <Accordion.Control>Job Title</Accordion.Control>
            <Accordion.Panel>{'Job Title'}</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key={'headcount'} value={'headcount'}>
            <Accordion.Control>HeadCount</Accordion.Control>
            <Accordion.Panel>{'HeadCount'}</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key={'sorting'} value={'sorting'}>
            <Accordion.Control>Advanced Sorting</Accordion.Control>
            <Accordion.Panel>
              <Flex gap={'sm'} direction={'column'}>
                <CustomSelect
                  maxWidth='100%'
                  value={revenueData}
                  label='REVENUE RATE:'
                  placeholder='Select options'
                  setValue={setRevenueData}
                  data={revenueData}
                  setData={setRevenueData}
                />

                <CustomSelect
                  maxWidth='100%'
                  value={headcountData}
                  label='HEADCOUNTS BY DEPARTMENT:'
                  placeholder='Select options'
                  setValue={setHeadCountData}
                  data={headcountData}
                  setData={setHeadCountData}
                />
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Flex gap={'md'} mt={50}>
          <Button fullWidth size='md' radius={'md'} variant='outline' color='gray' onClick={close}>
            Cancel
          </Button>
          <Button fullWidth size='md' radius={'md'}>
            Update Pre-filters
          </Button>
        </Flex>
      </Modal>
    </Paper>
  );
}
