import {
  Drawer,
  ScrollArea,
  Badge,
  Text,
  useMantineTheme,
  Title,
  Divider,
  Group,
  Avatar,
  Button,
  Center,
  LoadingOverlay,
  Tabs,
  Select,
  Stack,
  Flex,
  Box,
  ActionIcon,
  CloseButton,
  TextInput,
} from '@mantine/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import { convertDateToShortFormat, formatToLabel, valueToColor } from '@utils/general';
import { campaignDrawerIdState, campaignDrawerOpenState } from '@atoms/campaignAtoms';
import { userTokenState } from '@atoms/userAtoms';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconCalendar,
  IconClockRecord,
  IconMan,
  IconNavigation,
  IconRefresh,
  IconUsers,
} from '@tabler/icons';
import { useEffect, useRef, useState } from 'react';
import { Archetype, Campaign } from 'src';
import { logout } from '@auth/core';
import { useQuery } from '@tanstack/react-query';
import CampaignProspects from '@common/campaigns/CampaignProspects';
import CampaignCTAs from '@common/campaigns/CampaignCTAs';
import { prospectUploadDrawerOpenState } from '@atoms/uploadAtoms';
import { prospectUploadDrawerIdState } from '@atoms/uploadAtoms';
import FlexSeparate from '@common/library/FlexSeparate';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import getPersonas, {
  getAllUploads,
  getOLDUploadDetails,
  getUploadDetails,
} from '@utils/requests/getPersonas';
import _ from 'lodash';

type UploadData = {
  total: number;
  success: number;
  queued: number;
  failed: number;
  disqualified: number;
};

export default function UploadDetailsDrawer() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(prospectUploadDrawerOpenState);
  const [uploadId, setUploadId] = useRecoilState(prospectUploadDrawerIdState);
  const userToken = useRecoilValue(userTokenState);

  const [categoryFilter, setCategoryFilter] = useState<string>('success');

  // Sorting and pagination
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'csv_row_hash',
    direction: 'desc',
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const [uploadData, setUploadData] = useState<UploadData>({
    total: 0,
    success: 0,
    queued: 0,
    failed: 0,
    disqualified: 0,
  });
  // Fetch upload details (table data)
  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-upload-details-${uploadId}`, {}],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, {}] = queryKey;

      if (uploadId === -1) {
        return null;
      }

      const response = await getUploadDetails(userToken, uploadId);
      const results = response.status === 'success' ? response.data.details.uploads : null;

      // Split results into pages
      // totalRecords.current = results.length;
      // let pageData = _.chunk(results as any[], PAGE_SIZE)[page - 1];
      // if (!pageData) {
      //   return [];
      // }

      // Sort data
      // pageData = _.sortBy(
      //   pageData,
      //   sortStatus.columnAccessor === 'csv_row_hash' ? 'id' : sortStatus.columnAccessor
      // );

      // Need to get the uploadData
      let uploads = response.data.details.uploads;
      let uploadDataNew = {
        total: 0,
        success: 0,
        queued: 0,
        failed: 0,
        disqualified: 0,
      };
      for (const upload of uploads) {
        uploadDataNew.total += 1;
        if (upload.status === 'UPLOAD_COMPLETE') {
          uploadDataNew.success += 1;
        } else if (upload.status === 'UPLOAD_QUEUED') {
          uploadDataNew.queued += 1;
        } else if (upload.status === 'UPLOAD_IN_PROGRESS') {
          uploadDataNew.queued += 1;
        } else if (upload.status === 'UPLOAD_FAILED') {
          uploadDataNew.failed += 1;
        } else if (upload.status === 'UPLOAD_NOT_STARTED') {
          uploadDataNew.queued += 1;
        } else if (upload.status === 'DISQUALIFIED') {
          uploadDataNew.disqualified += 1;
        } else {
          uploadDataNew.failed += 1;
        }
      }
      setUploadData(uploadDataNew);

      return (sortStatus.direction === 'desc' ? results.reverse() : results) as any[];
    },
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });
  const dRows = (data ?? []).filter((row) => {
    if (categoryFilter === 'success') {
      return row.status === 'UPLOAD_COMPLETE';
    } else if (categoryFilter === 'queued') {
      return (
        row.status === 'UPLOAD_QUEUED' ||
        row.status === 'UPLOAD_IN_PROGRESS' ||
        row.status === 'UPLOAD_NOT_STARTED'
      );
    } else if (categoryFilter === 'failed') {
      return row.status === 'UPLOAD_FAILED';
    } else if (categoryFilter === 'disqualified') {
      return row.status === 'DISQUALIFIED';
    } else {
      return true;
    }
  });

  // Fetch personas (for stats)
  const {
    data: data_personas,
    isFetching: isFetching_personas,
    refetch: refetch_personas,
  } = useQuery({
    queryKey: [`query-personas-drawer-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result = response.status === 'success' ? (response.data as Archetype[]) : [];

      for (let persona of result) {
        const uploadsResponse = await getAllUploads(userToken, persona.id);
        persona.uploads = uploadsResponse.status === 'success' ? uploadsResponse.data : [];
      }

      return result;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });

  const persona = data_personas?.find((persona) => {
    return persona.uploads?.find((upload) => {
      return upload.id === uploadId;
    });
  });

  // Refresh drawer state
  const refreshDrawer = () => {
    refetch_personas();
    refetch();
  };
  useEffect(() => {
    refreshDrawer();
  }, [opened]);

  return (
    <Drawer.Root size='44rem' position='right' opened={opened} onClose={close}>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header bg={'blue'}>
          <Flex bg={'#0287f7'} align={'center'} justify={'space-between'} w={'100%'} px={30}>
            <Title color='white' order={3}>
              {'Upload Details: '}
            </Title>
            <CloseButton
              style={{
                border: '1px solid white',
                color: 'white',
                borderRadius: '20px',
              }}
              onClick={() => setOpened(false)}
            />
          </Flex>
        </Drawer.Header>
        <Drawer.Body mt={22} px={40}>
          {/* <LoadingOverlay
            visible={isFetching || isFetching_personas}
            overlayBlur={2}
          /> */}
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <ActionIcon onClick={refreshDrawer}>
              <IconRefresh size='1.125rem' />
            </ActionIcon>
          </div>
          <Flex direction={'column'} gap={10}>
            <Flex gap={20}>
              <Flex
                align={'center'}
                gap={5}
                w={'100%'}
                style={{ borderRight: '3px solid #f4f2f5' }}
              >
                <IconUsers color='#0287f7' />
                <Text size={'lg'}>Total Prospect:</Text>
                <Text
                  size={20}
                  px={14}
                  style={{ border: '3px solid #f4f2f5', borderRadius: '10px' }}
                >
                  {uploadData?.total}
                </Text>
              </Flex>
              {/* <Flex align={"center"} gap={5} w={"100%"}>
                <IconCalendar color="#0287f7" />
                <Text size={"lg"}>Date:</Text>
                <Select
                  placeholder="Upload Record"
                  maxDropdownHeight={280}
                  data={
                    persona?.uploads?.map((upload) => {
                      return {
                        value: upload.id + "",
                        label: convertDateToShortFormat(
                          new Date(upload.created_at)
                        ),
                      };
                    }) ?? []
                  }
                  value={uploadId + ""}
                  onChange={(value) => value && setUploadId(+value)}
                  styles={{
                    input: {
                      fontWeight: 500,
                      fontSize: "16px",
                    },
                    root: {
                      width: 220,
                    },
                  }}
                />
              </Flex> */}
            </Flex>

            <Flex
              style={{
                gap: '0px',
                border: '2px solid #f4f2f5',
                borderStyle: 'dashed',
                borderRadius: '10px',
              }}
              w={'100%'}
            >
              <Box
                w={'100%'}
                p={16}
                style={
                  categoryFilter === 'success'
                    ? { border: '4px solid #57ca7a', borderRadius: '10px' }
                    : undefined
                }
                onClick={() => setCategoryFilter('success')}
              >
                <Text size={'md'}>Success</Text>
                <Text size={28} color='#009600'>
                  {' '}
                  {uploadData?.success}
                </Text>
                <Text size={12} w={'100%'}>
                  New Prospects
                </Text>
              </Box>
              <Box
                w={'100%'}
                p={16}
                sx={{
                  borderRight: '2px solid #f4f2f5',
                  borderRightStyle: 'dashed',
                }}
                style={
                  categoryFilter === 'queued'
                    ? { border: '4px solid #57ca7a', borderRadius: '10px' }
                    : undefined
                }
                onClick={() => setCategoryFilter('queued')}
              >
                <Flex w={'100%'} align={'center'} justify={'space-between'}>
                  <Text>Queued</Text>
                  <ActionIcon
                    radius='xl'
                    onClick={(e) => {
                      e.stopPropagation();
                      refetch();
                    }}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Flex>
                <Text size={28} color='#f9b31c'>
                  {' '}
                  {uploadData?.queued}
                </Text>
                <Text size={12} w={'100%'}>
                  Waiting or In Progress
                </Text>
              </Box>
              <Box
                w={'100%'}
                p={16}
                sx={{
                  borderRight: '2px solid #f4f2f5',
                  borderRightStyle: 'dashed',
                }}
                style={
                  categoryFilter === 'failed'
                    ? { border: '4px solid #57ca7a', borderRadius: '10px' }
                    : undefined
                }
                onClick={() => setCategoryFilter('failed')}
              >
                <Text>Failed</Text>
                <Text size={28} color='#fa5757'>
                  {' '}
                  {uploadData?.failed}
                </Text>
                <Text size={12} w={'100%'}>
                  Error Occurred
                </Text>
              </Box>
              <Box
                w={'100%'}
                p={16}
                style={
                  categoryFilter === 'disqualified'
                    ? { border: '4px solid #57ca7a', borderRadius: '10px' }
                    : undefined
                }
                onClick={() => setCategoryFilter('disqualified')}
              >
                <Text>Disqualified</Text>
                <Text size={28} color='#717171'>
                  {' '}
                  {uploadData?.disqualified}
                </Text>
                <Text size={12} w={'100%'}>
                  Not Qualified
                </Text>
              </Box>
            </Flex>

            <Flex w={'100%'} align={'center'}>
              <Text fw={500} w={'100%'} size={20} style={{ width: '140px' }}>
                File Rows:{' '}
              </Text>
              <hr style={{ width: '100%', backgroundColor: '#f4f2f5' }} />
            </Flex>

            <DataTable
              withBorder
              height={'min(520px, 100vh - 240px)'}
              verticalAlignment='top'
              loaderColor='teal'
              highlightOnHover
              noRecordsText={'No rows found'}
              rowExpansion={{
                content: ({ record }) => (
                  <Stack p='xs' spacing={6}>
                    {Object.keys(record.csv_row_data).map((key, i) => (
                      <Flex key={i} wrap='nowrap'>
                        <div style={{ width: 105 }}>
                          <Text fw={700} truncate>
                            {formatToLabel(key)}
                          </Text>
                        </div>
                        <div>
                          <Text sx={{ wordBreak: 'break-word' }}>{record.csv_row_data[key]}</Text>
                        </div>
                      </Flex>
                    ))}
                  </Stack>
                ),
              }}
              style={{
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
              }}
              columns={[
                {
                  accessor: 'any',
                  title: 'Prospect',
                  width: 200,
                  sortable: true,
                  render: (row) => {
                    let name;
                    if (row.data) {
                      name = row.data.first_name + ' ' + row.data.last_name;
                      if (name === ' ') {
                        name = row.data.linkedin_url;
                      }
                    }
                    return <Text truncate>{name}</Text>;
                  },
                },
                {
                  accessor: 'status',
                  sortable: true,
                  render: ({ status }) => (
                    <Badge color={valueToColor(theme, formatToLabel(status))} variant='light'>
                      {formatToLabel(status)}
                    </Badge>
                  ),
                },
                {
                  accessor: 'upload_attempts',
                  title: 'Attempts',
                  sortable: true,
                },
                {
                  accessor: 'error_type',
                  sortable: true,
                  render: ({ error_type }) => <Text>{_.capitalize(error_type)}</Text>,
                },
              ]}
              records={dRows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)}
              sortStatus={sortStatus}
              onSortStatusChange={handleSortStatusChange}
            />
            <Flex
              w={'100%'}
              justify={'space-between'}
              mt={-10}
              px={20}
              pt={45}
              pb={20}
              style={{
                border: '1px solid #dee2e6',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
              }}
            >
              <Select
                style={{ width: '150px' }}
                data={[
                  { value: `25`, label: 'Show 25 rows' },
                  { value: `10`, label: 'Show 10 rows' },
                  { value: `5`, label: 'Show 5 rows' },
                ]}
                value={`${pageSize}`}
                onChange={(value) => {
                  if (!value) return;
                  setPage(1);
                  setPageSize(+value);
                }}
              />
              <Flex>
                <Select
                  style={{
                    width: '80px',
                  }}
                  data={Array.from({ length: Math.ceil(dRows.length / pageSize) }).map(
                    (_, i) => `${i + 1}`
                  )}
                  value={page + ''}
                  onChange={(value) => {
                    if (!value) return;
                    setPage(+value);
                  }}
                />
                <Text
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    border: '1px solid #ced4da',
                    alignItems: 'center',
                  }}
                  size={'sm'}
                  px={10}
                >
                  of {Math.ceil(dRows.length / pageSize)} pages
                </Text>
                <Button
                  variant='default'
                  px={5}
                  onClick={() => {
                    if (page > 1) {
                      setPage(page - 1);
                    }
                  }}
                >
                  <IconArrowNarrowLeft />
                </Button>
                <Button
                  variant='default'
                  px={5}
                  onClick={() => {
                    if (page < Math.ceil(dRows.length / pageSize)) {
                      setPage(page + 1);
                    }
                  }}
                >
                  <IconArrowNarrowRight />
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
