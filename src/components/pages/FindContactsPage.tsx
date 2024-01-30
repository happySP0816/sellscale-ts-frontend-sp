import { userTokenState } from '@atoms/userAtoms';
import YourNetworkSection from '@common/your_network/YourNetworkSection';
import {
  Card,
  Flex,
  Tabs,
  Title,
  Text,
  TextInput,
  Anchor,
  NumberInput,
  Tooltip,
  Button,
  ActionIcon,
  Badge,
  useMantineTheme,
  Loader,
  Group,
  Stack,
  Box,
  Select,
  Progress,
  Divider,
  Avatar,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconAffiliate, IconBrandLinkedin, IconDatabase, IconDownload, IconFile, IconUpload } from '@tabler/icons';
import { setPageTitle } from '@utils/documentChange';
import { valueToColor } from '@utils/general';
import getSalesNavigatorLaunches, { getSalesNavigatorLaunch } from '@utils/requests/getSalesNavigatorLaunches';
import postLaunchSalesNavigator from '@utils/requests/postLaunchSalesNavigator';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SalesNavigatorLaunch } from 'src';
import SalesNavigatorComponent from './SalesNavigatorPage';
import IndividualsDashboard from '@common/individuals/IndividualsDashboard';
import { IconCsv, IconSparkles } from '@tabler/icons-react';
import FileDropAndPreview from '@modals/upload-prospects/FileDropAndPreview';
import LinkedInURLUpload from '@modals/upload-prospects/LinkedInURLUpload';
import { currentProjectState } from '@atoms/personaAtoms';
import ChatDashboard from '@common/individuals/ChatDashboard';
import UploadDetailsDrawer from '@drawers/UploadDetailsDrawer';
import { prospectUploadDrawerIdState, prospectUploadDrawerOpenState } from '@atoms/uploadAtoms';
import { getAllUploads } from '@utils/requests/getPersonas';
import { useQuery } from '@tanstack/react-query';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import _ from 'lodash';
import FileDropAndPreviewV2 from '@modals/upload-prospects/FileDropAndPreviewV2';
import { API_URL } from '@constants/data';

type UploadDetailType = {
  process: number;
  success: number;
  failed: number;
  disqualified: number;
  total: number;
  percent: number;
};

type SDRType = {
  avatar: string;
  name: string;
};

type CSVType = {
  fileName: string;
  sdr: SDRType;
  upload_details: UploadDetailType;
};

const test_data = [
  {
    fileName: 'NewUploads1.csv',
    sdr: {
      avatar: '',
      name: 'Adam Meehan',
    } as SDRType,
    upload_details: {
      process: 300,
      success: 199,
      failed: 50,
      disqualified: 50,
      total: 521,
      percent: (300 / 500) * 100,
    } as UploadDetailType,
  },
  {
    fileName: 'NewUploads2.csv',
    sdr: {
      avatar: '',
      name: 'Adam Meehan',
    } as SDRType,
    upload_details: {
      process: 100,
      success: 99,
      failed: 0,
      disqualified: 0,
      total: 521,
      percent: (100 / 521) * 100,
    } as UploadDetailType,
  },
  {
    fileName: 'NewUploads3.csv',
    sdr: {
      avatar: '',
      name: 'Adam Meehan',
    } as SDRType,
    upload_details: {
      process: 521,
      success: 479,
      failed: 20,
      disqualified: 20,
      total: 521,
      percent: (521 / 521) * 100,
    } as UploadDetailType,
  },
  {
    fileName: 'NewUploads4.csv',
    sdr: {
      avatar: '',
      name: 'Adam Meehan',
    } as SDRType,
    upload_details: {
      process: 521,
      success: 499,
      failed: 20,
      disqualified: 0,
      total: 521,
      percent: (521 / 521) * 100,
    } as UploadDetailType,
  },
  {
    fileName: 'NewUploads5.csv',
    sdr: {
      avatar: '',
      name: 'Adam Meehan',
    } as SDRType,
    upload_details: {
      process: 100,
      success: 99,
      failed: 0,
      disqualified: 0,
      total: 521,
      percent: (100 / 521) * 100,
    } as UploadDetailType,
  },
];

type Segment = {
  id: number;
  client_sdr_id: number;
  segment_title: string;
  filters: any;
};

export default function FindContactsPage() {
  setPageTitle('Find Contacts');

  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const activePersona = currentProject?.id;
  const activePersonaEmoji = currentProject?.emoji;
  const activePersonaName = currentProject?.name;

  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(prospectUploadDrawerOpenState);
  const [uploadId, setUploadId] = useRecoilState(prospectUploadDrawerIdState);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'fileName',
    direction: 'desc',
  });

  const [records, setRecords] = useState(test_data);

  const [segments, setSegments]: any = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId]: any = useState<number | null>(null);

  const fetchSegments = async () => {
    const response = await fetch(`${API_URL}/segment/all`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    const segments = data.segments as Segment[];
    setSegments(segments);
  };

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    // setPage(1)
    console.log(status);
    const data = _.sortBy(test_data, sortStatus.columnAccessor);
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    // const data = sortBy(companies, sortStatus.columnAccessor) as Company[]
    // setRecords(sortStatus.direction === 'desc' ? data.reverse() : data)
    setSortStatus(status);
  };

  const { data: uploads } = useQuery({
    queryKey: [`query-get-persona-uploads`],
    queryFn: async () => {
      const response = await getAllUploads(userToken, activePersona!);
      return response.status === 'success' ? response.data : [];
    },
    enabled: !!activePersona,
  });
  const [tab, setTab] = useState('');

  useEffect(() => {
    fetchSegments();
  }, []);

  return (
    <Flex p='lg' direction='column' h='100%'>
      <Title order={2}>
        <Text color='gray'>
          Find Contacts: {activePersonaEmoji} {activePersonaName}
        </Text>
      </Title>
      <Tabs
        defaultValue='sellscale-db'
        mt='md'
        keepMounted={false}
        h='100%'
        variant='unstyled'
        styles={(theme) => ({
          tabsList: {
            // backgroundColor: theme.colors.blue[theme.fn.primaryShade()],

            height: '44px',
            marginInline: '20px',
          },
          panel: {
            backgroundColor: theme.white,
            border: '1.5px solid #e6f0fc',
            borderRadius: '8px',
            padding: `0 0 ${rem('20px')} 0`,
          },
          tab: {
            ...theme.fn.focusStyles(),
            backgroundColor: theme.white,
            marginBottom: 0,
            marginInline: 5,
            paddingLeft: 20,
            paddingRight: 20,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            color: theme.colors.blue[theme.fn.primaryShade()],

            '&[data-active]': {
              backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
              borderBottomColor: theme.white,
              color: theme.white,
            },
            '&:disabled': {
              backgroundColor: theme.colors.gray[theme.fn.primaryShade()],
              color: theme.colors.gray[4],
            },
          },
          tabLabel: {
            fontWeight: 700,
            fontSize: rem(14),
          },
        })}
      >
        <Tabs.List grow>
          <Tooltip label='Advanced - SellScale Database' position='bottom'>
            <Tabs.Tab value='sellscale-db' icon={<IconDatabase size='0.9rem' />} onClick={() => setTab('sellscale-db')}>
              Contact Database
            </Tabs.Tab>
          </Tooltip>
          <Tabs.Tab value='by-csv' icon={<IconUpload size='0.9rem' />} onClick={() => setTab('by-csv')}>
            Upload CSV
          </Tabs.Tab>

          <Tabs.Tab value='linkedin-url' icon={<IconBrandLinkedin size='0.9rem' />} onClick={() => setTab('linkedin-url')}>
            LinkedIn URL
          </Tabs.Tab>
          <Tabs.Tab value='linkedin-sales-navigator' icon={<IconBrandLinkedin size='0.9rem' />} onClick={() => setTab('linkedin-sales-navigator')}>
            SalesNav Search
          </Tabs.Tab>
          <Tabs.Tab value='individuals' icon={<IconDatabase size='0.9rem' />} onClick={() => setTab('individuals')}>
            Chat
          </Tabs.Tab>
          {/* <Tabs.Tab value='csv-beta' icon={<IconSparkles size='0.9rem' />} onClick={() => setTab('csv-beta')}></Tabs.Tab>

          <Tooltip label='Advanced - Linkedin Network' position='bottom'>
            <Tabs.Tab value='your-network' icon={<IconAffiliate size='0.9rem' />} onClick={() => setTab('your-network')}></Tabs.Tab>
          </Tooltip> */}
        </Tabs.List>

        <Tabs.Panel value='individuals' pt='xs' h='95%'>
          {/* <IndividualsDashboard openFilter={() => {}} /> */}
          <ChatDashboard />
        </Tabs.Panel>

        <Tabs.Panel value='linkedin-sales-navigator' pt='xs'>
          <SalesNavigatorComponent />
        </Tabs.Panel>

        {/* <Tabs.Panel value='your-network' pt='xs'>
          <YourNetworkSection />
        </Tabs.Panel> */}

        <Tabs.Panel value='linkedin-url' pt='xs'>
          <Card maw='600px' ml='auto' mr='auto'>
            <Title order={3}>Upload Prospect from One LinkedIn URL</Title>
            <Text mb='md' color='gray'>
              Upload a LinkedIn URL to add a prospect to your database. This can be a Sales Navigator link (i.e. /sales) or a regular LinkedIn profile link
              (i.e. /in).
            </Text>
            <LinkedInURLUpload
              afterUpload={() => {
                showNotification({
                  title: 'Success',
                  message: 'Uploaded contact successfully',
                  color: 'teal',
                });
              }}
            />
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value='by-csv' pt='xs' style={{ position: 'relative' }}>
          <Card maw='600px' ml='auto' mr='auto'>
            <Title order={3}>Upload CSV</Title>
            <Text mb='md' color='gray'>
              Upload a CSV file with the following columns
              <ul>
                <li>linkedin_url (required; if no email)</li>
                <li>first_name (optional; required if no linkedin_url)</li>
                <li>last_name (optional; required if no linkedin_url)</li>
                <li>email (optional; required if no linkedin_url)</li>
                <li>company (optional; required if no linkedin_url)</li>
                <li>custom_data (optional)</li>
              </ul>
            </Text>

            {/* Segment Selector */}
            <Select
              mb='md'
              mt='md'
              placeholder='Select Segment'
              label='(optional) Select Segment'
              description='Select a segment to add these prospects to'
              value={selectedSegmentId}
              onChange={(value: any) => {
                setSelectedSegmentId(value);
              }}
              data={
                segments?.map((segment: Segment) => ({
                  value: segment.id,
                  label: segment.segment_title,
                })) ?? []
              }
            />

            <FileDropAndPreview
              segmentId={selectedSegmentId}
              personaId={activePersona + ''}
              onUploadSuccess={() => {
                showNotification({
                  title: 'Success',
                  message: 'File uploaded successfully',
                  color: 'teal',
                });
              }}
            />
          </Card>

          {uploads && uploads.length > 0 && (
            <Select
              style={{
                position: 'absolute',
                top: 10,
                right: 0,
              }}
              placeholder='View Upload Details'
              data={uploads.map((upload: any) => ({
                value: upload.id + '',
                label: upload.created_at,
              }))}
              searchValue=''
              value=''
              onChange={(value) => {
                if (value) {
                  setUploadId(+value);
                  setUploadDrawerOpened(true);
                }
              }}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value='sellscale-db' pt='xs' style={{ position: 'relative' }}>
          {userToken && 
            <iframe
              src={'https://sellscale.retool.com/embedded/public/7559b6ce-6f20-4649-9240-a2dd6429323e#authToken=' + userToken}
              style={{ width: '100%', height: window.innerHeight + 120 }}
              frameBorder={0}
            />
          }
        </Tabs.Panel>
        
        
        {/* <Tabs.Panel value='csv-beta' pt='xs' style={{ position: 'relative' }}>
          <Card ml='auto' mr='auto'>
            <FileDropAndPreviewV2
              personaId={activePersona + ''}
              onUploadSuccess={() => {
                showNotification({
                  title: 'Success',
                  message: 'File uploaded successfully',
                  color: 'teal',
                });
              }}
            />
            <Text my={'lg'} color='#878a8c' fw={500} size={'xl'}>
              Upload Prospects
            </Text>
            <DataTable
              withBorder
              verticalAlignment='center'
              verticalSpacing='sm'
              loaderColor='teal'
              highlightOnHover
              borderRadius='sm'
              noRecordsText={'No rows found'}
              columns={[
                {
                  accessor: 'fileName',
                  title: 'File Name',
                  width: '12%',
                  sortable: true,
                },
                {
                  accessor: 'sdr',
                  title: 'SDR',
                  width: '15%',
                  render: ({ sdr }) => (
                    <Flex align={'center'} gap={10}>
                      <Avatar src={sdr?.avatar} radius={'xl'} />
                      <Text>{sdr?.name}</Text>
                    </Flex>
                  ),
                },
                {
                  accessor: 'upload_details',
                  title: 'Upload Details',
                  render: ({ upload_details }) => (
                    <Flex align={'center'} justify={'space-between'} gap={40} w={'100%'}>
                      <Flex align={'center'} w={'100%'} gap={20}>
                        <Text color='gray' w={150}>
                          Processed: {''} <span style={{ fontWeight: '600', color: 'black' }}>{upload_details?.process}</span>/{upload_details?.total}
                        </Text>
                        <Progress
                          w={130}
                          value={upload_details?.percent}
                          color={upload_details?.percent > 80 ? 'green' : upload_details?.percent > 50 ? 'yellow' : ''}
                        />
                        <Divider orientation='vertical' />
                        <Text w={100} align='center' color='gray'>
                          Success: <span style={{ color: 'green', fontWeight: '600' }}>{upload_details?.success}</span>
                        </Text>
                        <Divider orientation='vertical' />
                        <Text w={100} align='center' color='gray'>
                          Failed: <span style={{ color: 'red', fontWeight: '600' }}>{upload_details?.failed}</span>
                        </Text>
                        <Divider orientation='vertical' />
                        <Text w={120} align='center' color='gray'>
                          Disqualified: <span style={{ fontWeight: '600', color: 'black' }}>{upload_details?.disqualified}</span>
                        </Text>
                      </Flex>
                      <Flex gap={14} justify={'center'} w={'100%'}>
                        <Button variant='outline' radius='xl' size='xs'>
                          Refresh
                        </Button>
                        <Button variant='filled' radius='xl' size='xs'>
                          Show More
                        </Button>
                      </Flex>
                    </Flex>
                  ),
                },
              ]}
              records={records ?? []}
              sortStatus={sortStatus}
              onSortStatusChange={handleSortStatusChange}
            />
          </Card>
          
        </Tabs.Panel> */}
      </Tabs>
      <UploadDetailsDrawer />
    </Flex>
  );
}
