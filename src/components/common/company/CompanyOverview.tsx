import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Text,
  Image,
  Badge,
  Avatar,
  NumberInput,
  Select,
  ActionIcon,
  useMantineTheme,
  Timeline,
  Group,
  Container,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBuildingSkyscraper,
  IconChevronLeft,
  IconChevronRight,
  IconDiscountCheck,
  IconExternalLink,
  IconGitPullRequest,
  IconMessage,
  IconTags,
  IconUser,
} from '@tabler/icons';
import { IconSparkles, IconUserEdit } from '@tabler/icons-react';
import { DataGrid } from 'mantine-data-grid';
import { useState } from 'react';

type CompanyOverviewType = {
  avatar: string;
  name: string;
  title: string;
  repName: string;
  status: string;
}[];

export default function CompanyOverview() {
  const theme = useMantineTheme();
  const percentage = [
    {
      percentage: 80,
      color: theme.colors.green[4],
    },

    {
      percentage: 60,
      color: theme.colors.red[4],
    },
    {
      percentage: 30,
      color: theme.colors.orange[4],
    },
  ];
  const currentPercentage = 74;
  const [companyContactData, setCompanyContactData] = useState<CompanyOverviewType>([
    {
      avatar: '',
      name: 'Andrew Gurthet',
      title: 'Investment Director',
      repName: 'Investment Manager',
      status: 'engaged',
    },
    {
      avatar: '',
      name: 'Andrew Gurthet',
      title: 'Head of Research Test Data XXXX',
      repName: 'Libraries',
      status: 'engaged',
    },
    {
      avatar: '',
      name: 'Jimmy Castro',
      title: 'Director Of Investment XXXXX',
      repName: 'Financial Services',
      status: 'engaged',
    },
    {
      avatar: '',
      name: 'Joseph Kelly',
      title: 'Investment Director',
      repName: 'Venture Capital & XXXXXXX',
      status: 'sourced',
    },
    {
      avatar: '',
      name: 'Kaiya Green',
      title: 'Growth Equity Intern',
      repName: 'Libraries',
      status: 'engaged',
    },
    {
      avatar: '',
      name: 'Margaux OBrien',
      title: 'Investment Director',
      repName: 'Financial Services',
      status: 'sourced',
    },
  ]);
  const [recentActivityData, setRecentActivityData] = useState([
    {
      title: 'Micheal replied to Jeff on Linkedin',
      date: 'Jan 26, 2023',
      recieveMessage: `"the ceo wants to meet. Let's chat!"`,
    },
    {
      title: '5+ Anon visit on website / demo, / landing',
      date: 'Jan 24, 2023',
      recieveMessage: ``,
    },
    {
      title: 'Micheal replied to Jeff on Linkedin',
      date: 'Jan 23, 2023',
      recieveMessage: `"Definitely miss the SJSU days. But mostly I miss LaVic's and lguana's (hope you've had a chance to try these)"`,
    },
    {
      title: 'Alessa replied to Jeff on Linkedin',
      date: 'Jan 21, 2023',
      recieveMessage: `"Definitely miss the SJSU days. But mostly I miss LaVic's and lguana's (hope you've had a chance to try these). I'd be more than happy to chat but I do want to preface things by stating that I'm only..."`,
    },
    {
      title: 'Anon visit on website',
      date: 'Jan 20, 2023',
      recieveMessage: ``,
    },
    {
      title: 'Micheal replied to Jeff on Linkedin',
      date: 'Jan 26, 2023',
      recieveMessage: `"the ceo wants to meet. Let's chat!"`,
    },
    {
      title: '5+ Anon visit on website / demo, / landing',
      date: 'Jan 24, 2023',
      recieveMessage: ``,
    },
    {
      title: 'Micheal replied to Jeff on Linkedin',
      date: 'Jan 26, 2023',
      recieveMessage: `"Definitely miss the SJSU days. But mostly I miss LaVic's and lguana's (hope you've had a chance to try these)"`,
    },
  ]);

  return (
    <Paper>
      <Container size='xl' py={'lg'}>
        <Flex align={'center'} gap={'sm'}>
          <Button variant='default' radius={'100%'} px={5}>
            <IconArrowLeft color='#439bf8' />
          </Button>
          <Text fw={600} size={'xl'}>
            Company Overview
          </Text>
        </Flex>
        <Divider mt={'md'} />
        <Group grow align='start' py={'xl'}>
          <Flex gap={'md'} direction={'column'} w={'100%'}>
            <Flex direction={'column'} gap={'sm'} p={'sm'} style={{ border: '1.5px solid #ededee', borderRadius: '6px' }}>
              <Flex gap={'md'}>
                <Flex>
                  <Card shadow='lg' radius='md' h={'fit-content'} p={0}>
                    <Image
                      radius={'md'}
                      src='https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png'
                      height={120}
                      width={120}
                      alt='Norway'
                    />
                  </Card>
                </Flex>
                <Flex gap={'sm'} direction={'column'}>
                  <Flex gap={'sm'} align={'center'}>
                    <Text fw={700} size={24}>
                      {'Tesla'}
                    </Text>
                    <Flex>
                      <Divider orientation='vertical' h={18} display={'flex'} className=' items-center' />
                    </Flex>
                    <Text color='gray'>{'www.tesla.com'}</Text>
                    <IconExternalLink size={'0.8rem'} color='#439bf8' />
                  </Flex>
                  <Text fw={500}>{'To accelerate the advent of sustainable transport.'}</Text>
                  <Text color='gray' className=' whitespace-normal' size={'xs'}>
                    {
                      'Tesla, Inc, is an American multinational automotive and clean energy company headquartered in Austin, Texas, which designs, manufactures and sells electric vehicles, stationary battery energy storage devices from home to grid-scale, solar panesl and solar shingles, and related products and services.'
                    }
                  </Text>
                  <Flex align={'center'} gap={4}>
                    <IconExternalLink size={'0.8rem'} color='gray' />
                    <Text color='gray' fw={400} size={'sm'}>
                      Indusctry:{' '}
                    </Text>
                    <Text fw={500} size={'sm'}>
                      {'Automobile, Information Technology & Services'}
                    </Text>
                  </Flex>
                  <Flex align={'center'} gap={4}>
                    <IconBuildingSkyscraper size={'0.8rem'} color='gray' />
                    <Text color='gray' fw={400} size={'sm'}>
                      Location:{' '}
                    </Text>
                    <Text fw={500} size={'sm'}>
                      {'Austin, Texas, USA'}
                    </Text>
                  </Flex>
                  <Flex align={'center'} gap={4}>
                    <IconSparkles size={'0.8rem'} color='gray' />
                    <Text color='gray' fw={400} size={'sm'}>
                      Specialties:{' '}
                    </Text>
                    <Text fw={500} size={'sm'}>
                      {'Austin, Texas, USA'}
                    </Text>
                  </Flex>
                  <Flex align={'center'} gap={4}>
                    <IconUser size={'0.8rem'} color='gray' />
                    <Text color='gray' fw={400} size={'sm'}>
                      No. of employees:{' '}
                    </Text>
                    <Text fw={500} size={'sm'}>
                      {'1000 - 1500'}
                    </Text>
                  </Flex>
                  <Flex align={'center'} gap={4}>
                    <IconTags size={'0.8rem'} color='gray' />
                    <Text color='gray' size={'sm'}>
                      Tags:{' '}
                    </Text>
                    <Flex gap={4} align={'center'}>
                      <Badge color='gray' size='sm'>
                        Electric Cars
                      </Badge>
                      <Badge color='gray' size='sm'>
                        Robotic
                      </Badge>
                      <Badge color='gray' size='sm'>
                        Solar Energy
                      </Badge>
                      <Badge color='gray' size='sm'>
                        Elon Musk
                      </Badge>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Divider variant='dashed' />
              <Button variant='light' fullWidth leftIcon={<IconUserEdit />} radius={'xl'}>
                Edit Company Details
              </Button>
            </Flex>
            <Flex direction={'column'} mt={'md'}>
              <Flex w={'100%'} justify={'space-between'} align={'center'}>
                <Text color='gray' fw={600} size={'xl'}>
                  Contacts:
                </Text>
                <Flex py={0} px={35} style={{ border: '1.5px solid #ededee', borderRadius: '24px' }} gap={'sm'}>
                  <Text color='green' p={3} fw={600}>
                    Engaged <Badge color='green'>22</Badge>
                  </Text>
                  <Divider orientation='vertical' />
                  <Text color='yellow' p={3} fw={600}>
                    Sourced <Badge color='yellow'>42</Badge>
                  </Text>
                </Flex>
              </Flex>
              <DataGrid
                data={companyContactData}
                highlightOnHover
                withPagination
                withSorting
                withBorder
                sx={{ cursor: 'pointer' }}
                mt={'lg'}
                columns={[
                  {
                    accessorKey: 'contacts',
                    header: 'Contacts',
                    maxSize: 400,
                    cell: (cell) => {
                      const { avatar, name } = cell.row.original;
                      return (
                        <Flex align={'center'} gap={'sm'} h={'100%'}>
                          <Avatar src={avatar} size={'sm'} radius={'xl'} />
                          <Text size={'xs'}>{name}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'title',
                    header: 'Title',
                    maxSize: 130,
                    cell: (cell) => {
                      const { title } = cell.row.original;
                      return (
                        <Flex align={'center'} h={'100%'}>
                          <Text color='gray' lineClamp={2} className=' whitespace-normal' size={'xs'}>
                            {title}
                          </Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'repName',
                    header: 'Rep name',
                    maxSize: 130,
                    cell: (cell) => {
                      const { repName } = cell.row.original;
                      return (
                        <Flex align={'center'} h={'100%'}>
                          <Text color='gray' lineClamp={2} className=' whitespace-normal' size={'xs'}>
                            {repName}
                          </Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    maxSize: 100,
                    cell: (cell) => {
                      const { status } = cell.row.original;
                      return (
                        <Flex align={'center'} h={'100%'}>
                          <Badge color={status === 'engaged' ? 'green' : 'yellow'}>{status}</Badge>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
                }}
                components={{
                  pagination: ({ table }) => (
                    <Flex
                      justify={'space-between'}
                      align={'center'}
                      px={'sm'}
                      py={'1.25rem'}
                      sx={(theme) => ({
                        border: `1px solid ${theme.colors.gray[4]}`,
                        borderTopWidth: 0,
                      })}
                    >
                      <Flex align={'center'} gap={'sm'}>
                        <Text fw={500} color='gray.6'>
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
                    height: '44px',
                    backgroundColor: theme.colors.gray[0],
                    '::after': {
                      backgroundColor: 'transparent',
                    },
                  },

                  wrapper: {
                    gap: 0,
                  },
                  scrollArea: {
                    paddingBottom: 0,
                    gap: 0,
                  },

                  dataCellContent: {
                    width: '100%',
                  },
                })}
              />
            </Flex>
          </Flex>
          <Flex gap={'xl'} direction={'column'} w={'100%'}>
            <Flex direction={'column'} gap={'sm'} p={'sm'} style={{ border: '1.5px solid #ededee', borderRadius: '6px' }}>
              <Text color='gray' fw={600} mt={'sm'} size={'xl'}>
                Intent Score:
              </Text>
              <Flex
                gap={'lg'}
                align={'center'}
                p={'lg'}
                justify={'space-between'}
                style={{ border: '1.5px solid #ededee', borderStyle: 'dashed', borderRadius: '12px' }}
              >
                <Flex w={'100%'} justify={'center'}>
                  <Box
                    sx={{
                      width: '180px',
                      height: '90px',
                      position: 'relative',

                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxSizing: 'border-box',

                      '&:before': {
                        content: '""',
                        width: '180px',
                        height: '90px',
                        border: `20px solid ${theme.colors.gray[4]}`,
                        position: 'absolute',
                        transformOrigin: '50%  0% 0',
                        borderRadius: '120px 120px 0 0',
                        borderBottom: 0,
                        left: 0,
                        top: 0,
                      },
                    }}
                  >
                    <Text fz={'sm'}>
                      <Text component='span' fw={700} fz={'md'}>
                        74
                      </Text>
                      /100
                    </Text>
                    {percentage.map((i, idx) => (
                      <Box
                        key={idx}
                        sx={(theme) => ({
                          width: '180px',
                          height: '90px',
                          border: `20px solid ${i.color}`,
                          borderTop: 'none',
                          position: 'absolute',
                          transformOrigin: '50%  0% 0',
                          borderRadius: '0 0 120px 120px',
                          left: '0',
                          top: '100%',
                          zIndex: 5,
                          animation: '1s fillGraphAnimation ease-in',
                          boxSizing: 'border-box',
                          transform: `rotate(calc(1deg*${i.percentage}*1.8))`,

                          '&:before': {
                            content: '""',
                            width: '180px',
                            height: '90px',
                            borderBottom: `3px solid white`,
                            position: 'absolute',
                            transformOrigin: 'left',
                            transform: `rotate(calc(1deg*100*1.8))`,
                            left: 0,
                            top: 0,
                          },
                        })}
                      />
                    ))}

                    <Box
                      sx={(theme) => ({
                        width: '180px',
                        height: '90px',
                        border: `20px solid transparent`,
                        borderTop: 'none',
                        position: 'absolute',
                        transformOrigin: '50%  0% 0',
                        borderRadius: '0 0 120px 120px',
                        left: '0',
                        top: '100%',
                        zIndex: 5,
                        animation: '1s fillGraphAnimation ease-in',
                        boxSizing: 'border-box',
                        transform: `rotate(calc(1deg*${currentPercentage}*1.8))`,

                        '&:before': {
                          content: '""',
                          width: '20px',
                          height: '1px',
                          borderBottom: `3px solid black`,
                          position: 'absolute',
                          transformOrigin: 'left',
                          transform: `rotate(calc(1deg*100*1.8))`,
                          left: 0,
                          top: 0,
                        },
                      })}
                    />
                  </Box>
                </Flex>
                <Flex direction={'column'} w={'100%'}>
                  <Flex align={'center'} gap={4}>
                    <Text color={'green'} fw={600} size={34}>
                      Very High
                    </Text>
                    <IconDiscountCheck color='#40c057' size={30} />
                  </Flex>
                  <Text color='gray' fw={400}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex style={{ border: '1.5px solid #ededee', borderRadius: '6px' }} p={'sm'} direction={'column'}>
              <Text color='gray' fw={600} size={'xl'}>
                Recent Activity
              </Text>
              <Timeline bulletSize={30} lineWidth={2} ml={'lg'} mt={'lg'}>
                {recentActivityData?.map((item, index) => {
                  return (
                    <Timeline.Item
                      bullet={item?.recieveMessage ? <IconMessage size={16} /> : <IconGitPullRequest size={16} />}
                      title={
                        <Flex align={'center'} gap={'xs'}>
                          <Text fw={500} fz='sm'>{item?.title}</Text>
                          <Text color='gray' fw={300}>
                            {item?.date}
                          </Text>
                        </Flex>
                      }
                      active
                      lineVariant='dashed'
                      color={item?.recieveMessage ? '' : 'orange'}
                    >
                      {item?.recieveMessage && (
                        <Text fw={400} size={'xs'}>
                          Received Message:
                          <span className=' text-gray-400 line-clamp-4'>{item?.recieveMessage}</span>
                        </Text>
                      )}
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Flex>
          </Flex>
        </Group>
      </Container>
    </Paper>
  );
}
