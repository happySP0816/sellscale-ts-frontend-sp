import {
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Paper,
  Progress,
  Switch,
  Text,
  Title,
  useMantineTheme,
  HoverCard,
  Group,
  Container,
  Select,
  ScrollArea,
  Pagination,
  RingProgress,
  NumberInput,
  ActionIcon,
  Tooltip,
  Stack,
  Modal,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconSearch,
  IconTrash,
  IconFilter,
  IconUserSquare,
} from '@tabler/icons-react';
import {
  DataGrid,
  DataGridFiltersState,
  DataGridRowSelectionState,
  stringFilterFn,
} from 'mantine-data-grid';
import { FC, useEffect, useMemo, useState } from 'react';
import WithdrawInvitesControl from './WithdrawInvitesControl';
import { getChannelType } from '../../../../utils/icp';
import GridTabs from './GridTabs';
import WithdrawInvitesModal from './modals/WithdrawInvitesModal';
import { SCREEN_SIZES } from '@constants/data';
import { getProspectsForICP } from '@utils/requests/getProspects';
import { userTokenState } from '@atoms/userAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentProjectState, uploadDrawerOpenState } from '@atoms/personaAtoms';
import { showNotification } from '@mantine/notifications';
import { ProjectSelect } from './ProjectSelect';
import PersonaUploadDrawer from '@drawers/PersonaUploadDrawer';
import { PersonaOverview, ProspectICP } from 'src';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { openConfirmModal } from '@mantine/modals';
import { moveToUnassigned } from '@utils/requests/moveToUnassigned';
import { filterProspectsState, filterRuleSetState } from '@atoms/icpFilterAtoms';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsRight,
  IconFileDownload,
  IconList,
  IconMagnet,
  IconMail,
  IconUpload,
  IconX,
} from '@tabler/icons';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';
import BulkActions from '../BulkActions_new';
import Filters from './Filters';
import { SidebarHeader } from './SidebarHeader';
import { CSVLink } from 'react-csv';
import { cl } from '@fullcalendar/core/internal-common';
import ProspectDetailsTooltip from './ProspectDetailsTooltip';
import CompanyTooltip from './CompanyTooltip';
import CustomResearchPointCard from '../CustomResearchPointCard';
import { getICPRuleSet } from '@utils/requests/icpScoring';

const tabFilters = [
  {
    label: 'All',
    value: 'all',
    count: 0,
  },
  {
    label: 'Very High',
    value: 'very_high',
    count: 0,
  },
  {
    label: 'High',
    value: 'high',
    count: 0,
  },
  {
    label: 'Medium',
    value: 'medium',
    count: 0,
  },
  {
    label: 'Low',
    value: 'low',
    count: 0,
  },
  {
    label: 'Very Low',
    value: 'very_low',
    count: 0,
  },
  {
    label: 'Do Not Contact',
    value: 'do_not_contact',
    count: 0,
  },
];
type ProspectFilterState =
  | 'Prospected'
  | 'Sent Outreach'
  | 'Accepted'
  | 'Bumped'
  | 'Active Convo'
  | 'Demo'
  | 'Do Not Contact'
  | 'All Contacts';

const csvHeaders = [
  { label: 'Label', key: 'label' },
  { label: 'Title', key: 'title' },
  { label: 'Company', key: 'company' },
  { label: 'Icp fit reason', key: 'icp_fit_reason' },
  { label: 'Linkedin URL', key: 'linkedin_url' },
  { label: 'Full name', key: 'full_name' },
  { label: 'ID', key: 'id' },
];

type ICPFiltersDashboardPropsType = {
  hideTitleBar?: boolean;
};

const ICPFiltersDashboard = (props: ICPFiltersDashboardPropsType) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [icpProspects, setIcpProspects] = useRecoilState(filterProspectsState);
  const navigate = useNavigate();
  const [isTesting, setIsTesting] = useState(false);
  const [removeProspectsLoading, setRemoveProspectsLoading] = useState(false);
  const theme = useMantineTheme();
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<{
    label: string;
    value: string;
    count: number;
  }>(tabFilters[0]);
  const [selectedProspectStatusFilter, setSelectedProspectStatusFilter] =
    useState<ProspectFilterState>('All Contacts');

  const [invitedOnLinkedIn, setInvitedOnLinkedIn] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataGridRowSelectionState>({});
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(uploadDrawerOpenState);
  const openUploadProspects = () => {
    window.location.href = `/contacts/find`;

    // todo(Aakash) remove this as it opens drawer
    // setUploadDrawerOpened(true);
  };
  const [sideBarVisible, { toggle: toggleSideBar }] = useDisclosure(false);
  const [icpDashboard, setIcpDashboard] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [columnFilters, setColumnFilters] = useState<DataGridFiltersState>([]);
  const [openedCustomPoint, customPointHandlers] = useDisclosure(false);

  const withdrawInvites = () => {
    open();
  };

  const cancel = () => {
    setSelectedRows({});
  };

  const getSelectedRowCount = useMemo(() => {
    return Object.keys(selectedRows).length;
  }, [selectedRows]);

  useEffect(() => {
    let newFilters: DataGridFiltersState = [];
    // if (globalSearch) {
    //   newFilters = [
    //     {
    //       id: "title",
    //       value: {
    //         op: "in",
    //         value: globalSearch,
    //       },
    //     },
    //   ];
    // }

    if (selectedTab && selectedTab.value !== 'all' && selectedTab.label !== 'Do Not Contact') {
      newFilters = [
        ...newFilters,
        {
          id: 'icp_fit_score',
          value: {
            op: 'eq',
            value: selectedTab.value,
          },
        },
      ];
    }

    if (selectedTab.label === 'Do Not Contact') {
      newFilters = [
        ...newFilters,
        {
          id: 'status',
          value: {
            op: 'eq',
            value: 'REMOVED',
          },
        },
      ];
    }

    setColumnFilters(newFilters);
  }, [selectedTab, globalSearch]);

  const triggerMoveToUnassigned = async () => {
    setRemoveProspectsLoading(true);
    if (currentProject === null) {
      return;
    }

    const prospects = displayProspects.filter((_, index) => {
      return selectedRows[index] === true;
    });
    const prospectIDs = prospects.map((prospect) => {
      return prospect.id;
    });

    try {
      showNotification({
        id: 'prospect-removed',
        title: 'Removing Prospected and Sent Outreach prospects only...',
        message: `SellScale can only remove prospects that are in the Prospected or Sent Outreach status. SellScale will remove the rest.`,
        color: 'blue',
        autoClose: 3000,
      });

      const response = await moveToUnassigned(userToken, currentProject.id, prospectIDs);

      if (response.status === 'success') {
        showNotification({
          id: 'prospect-removed',
          title: 'Prospects removed',
          message: `${prospectIDs.length} prospects has been removed from your list`,
          color: 'green',
          autoClose: 3000,
        });
      } else {
        showNotification({
          id: 'prospect-removed',
          title: 'Prospects removal failed',
          message: 'These prospects could not be removed. Please try again, or contact support.',
          color: 'red',
          autoClose: false,
        });
      }

      refetch();
      setSelectedRows({});
    } catch (error) {
      showNotification({
        id: 'prospect-removed',
        title: 'Prospects removal failed',
        message: 'These prospects could not be removed. Please try again, or contact support.',
        color: 'red',
        autoClose: false,
      });
    } finally {
      setRemoveProspectsLoading(false);
    }
  };

  const { refetch } = useQuery({
    queryKey: [`query-get-icp-prospects`, { isTesting, invitedOnLinkedIn }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { isTesting, invitedOnLinkedIn }] = queryKey;

      const result = await getProspectsForICP(
        userToken,
        currentProject!.id,
        isTesting,
        invitedOnLinkedIn
      );

      // Get prospects
      const prospects = result.data.prospects as ProspectICP[];

      // Calculate numbers and percentages
      let icp_analytics = {
        '-1': 0,
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        Total: 0,
      };
      for (const prospect of prospects) {
        let icp_fit_score =
          prospect.icp_fit_score >= -1 && prospect.icp_fit_score <= 4 ? prospect.icp_fit_score : -1;
        // @ts-ignore
        icp_analytics[icp_fit_score + ''] += 1;
        icp_analytics['Total'] += 1;
      }

      // Set ICP Dashboard
      setIcpDashboard([
        {
          label: 'Very High',
          color: '#009512',
          badgeColor: 'green',
          bgColor: 'rgba(0, 149, 18, 0.05)',
          percent: (icp_analytics['4'] / icp_analytics['Total']) * 100,
          value: icp_analytics['4'] + '',
          gridWidthOf20:
            icp_analytics['4'] / icp_analytics['Total'] < 0.1
              ? 2
              : (icp_analytics['4'] / icp_analytics['Total']) * 20,
        },
        {
          label: 'High',
          color: '#3B85EF',
          badgeColor: 'blue',
          bgColor: 'rgba(59, 133, 239, 0.05)',
          percent: (icp_analytics['3'] / icp_analytics['Total']) * 100,
          value: icp_analytics['3'] + '',
          gridWidthOf20:
            icp_analytics['3'] / icp_analytics['Total'] < 0.1
              ? 2
              : (icp_analytics['3'] / icp_analytics['Total']) * 20,
        },
        {
          label: 'Medium',
          color: '#EFBA50',
          badgeColor: 'yellow',
          percent: (icp_analytics['2'] / icp_analytics['Total']) * 100,
          bgColor: 'rgba(239, 186, 80, 0.05)',
          value: icp_analytics['2'] + '',
          gridWidthOf20:
            icp_analytics['2'] / icp_analytics['Total'] < 0.1
              ? 2
              : (icp_analytics['2'] / icp_analytics['Total']) * 20,
        },
        {
          label: 'Low',
          color: '#EB8231',
          badgeColor: 'orange',
          percent: (icp_analytics['1'] / icp_analytics['Total']) * 100,
          bgColor: 'rgba(235, 130, 49, 0.05)',
          value: icp_analytics['1'] + '',
          gridWidthOf20:
            icp_analytics['1'] / icp_analytics['Total'] < 0.1
              ? 2
              : (icp_analytics['1'] / icp_analytics['Total']) * 20,
        },
        {
          label: 'Very Low',
          color: '#E5564E',
          badgeColor: 'red',
          percent: (icp_analytics['0'] / icp_analytics['Total']) * 100,
          bgColor: 'rgba(229, 86, 78, 0.05)',
          value: icp_analytics['0'] + '',
          gridWidthOf20:
            icp_analytics['0'] / icp_analytics['Total'] < 0.1
              ? 2
              : (icp_analytics['0'] / icp_analytics['Total']) * 20,
        },
        {
          label: 'Do Not Contact',
          color: '#84818A',
          badgeColor: 'gray',
          bgColor: 'rgba(132, 129, 138, 0.05)',
          percent: (icp_analytics['-1'] / icp_analytics['Total']) * 100,
          value: icp_analytics['-1'] + '',
          gridWidthOf20:
            icp_analytics['-1'] / icp_analytics['Total'] < 0.1
              ? 2
              : (icp_analytics['-1'] / icp_analytics['Total']) * 20,
        },
      ]);

      // Set prospect data
      setIcpProspects(prospects);

      return prospects;
    },
    enabled: !!currentProject,
  });
  const displayProspects = useMemo(() => {
    let filteredProspects = icpProspects;

    filteredProspects = filteredProspects.filter((prospect) => {
      return (
        prospect.full_name.includes(globalSearch) ||
        prospect.title.includes(globalSearch) ||
        prospect.company.includes(globalSearch)
      );
    });

    filteredProspects = filteredProspects
      // .filter((p) => p.status !== 'REMOVED')
      .filter((prospect) => {
        switch (selectedProspectStatusFilter) {
          case 'Prospected':
            return prospect.status === 'PROSPECTED';

          case 'Sent Outreach':
            return prospect.status === 'SENT_OUTREACH';

          case 'Accepted':
            return prospect.status === 'ACCEPTED';

          case 'Bumped':
            return prospect.status === 'BUMPED';

          case 'Active Convo':
            return prospect.status === 'ACTIVE_CONVO';

          case 'Demo':
            return prospect.status === 'DEMO';
          case 'Do Not Contact':
            return prospect.status === 'REMOVED';
          case 'All Contacts':
            return true;

          default:
            return true;
        }
      });

    return filteredProspects;
  }, [globalSearch, icpProspects, selectedProspectStatusFilter]);

  let averageICPFitScore = 0;
  let averageICPFitLabel = '';
  let averageICPFitColor = '';
  if (icpProspects.length > 0) {
    averageICPFitScore =
      icpProspects.map((x) => x.icp_fit_score).reduce((a, b) => a + b) / icpProspects.length;
    averageICPFitLabel = '';
    averageICPFitColor = '';
  }
  if (averageICPFitScore < 0.5) {
    averageICPFitLabel = 'Very Low';
    averageICPFitColor = 'red';
  } else if (averageICPFitScore < 1.5) {
    averageICPFitLabel = 'Low';
    averageICPFitColor = 'orange';
  } else if (averageICPFitScore < 2.5) {
    averageICPFitLabel = 'Medium';
    averageICPFitColor = 'yellow';
  } else if (averageICPFitScore < 3.5) {
    averageICPFitLabel = 'High';
    averageICPFitColor = 'blue';
  } else {
    averageICPFitLabel = 'Very High';
    averageICPFitColor = 'green';
  }

  const csvData = displayProspects
    .filter((i, idx) => Object.keys(selectedRows).includes(String(idx)))
    .map((i) => {
      let readable_score = '';
      let color = '';
      let number = '';
      switch (i.icp_fit_score) {
        case -1:
          readable_score = 'Not Scored';
          color = '🟪';
          number = '0';
          break;
        case 0:
          readable_score = 'Very Low';
          color = '🟥';
          number = '1';
          break;
        case 1:
          readable_score = 'Low';
          color = '🟧';
          number = '2';
          break;
        case 2:
          readable_score = 'Medium';
          color = '🟨';
          number = '3';
          break;
        case 3:
          readable_score = 'High';
          color = '🟦';
          number = '4';
          break;
        case 4:
          readable_score = 'Very High';
          color = 'green';
          color = '🟩';
          number = '5';
          break;
        default:
          readable_score = 'Unknown';
          color = '';
          break;
      }
      return {
        label: `${number} ${color} ${readable_score}`.toUpperCase(),
        title: i.title,
        company: i.company,
        icp_fit_reason: i.icp_fit_reason,
        linkedin_url: i.linkedin_url,
        full_name: i.full_name,
        id: i.id,
      };
    });

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing.lg,
        width: '100%',
      })}
    >
      <Flex
        style={{
          justifyContent: 'space-between',
          borderBottom: '1px solid gray',
          borderBottomStyle: 'dashed',
          display: props.hideTitleBar ? 'none' : 'block',
        }}
        pb={'md'}
      >
        <Flex align={'center'} gap={10}>
          <ProjectSelect
            hideCloseButton
            maw={'300px'}
            // w='100%'
            onClick={(persona?: PersonaOverview) => {
              navigateToPage(navigate, `/prioritize/${persona?.id}`);
            }}
          />
          <Divider orientation='vertical' h={'60%'} m={'auto'} />
          <Flex align={'center'} gap={10}>
            <Badge
              color={
                currentProject?.active
                  ? currentProject?.num_prospects > 0
                    ? 'blue'
                    : 'yellow'
                  : 'green'
              }
              variant='filled'
              size='lg'
            >
              {currentProject?.active
                ? currentProject?.num_prospects > 0
                  ? 'Active'
                  : 'Setup'
                : 'Complete'}
            </Badge>
            {currentProject?.linkedin_active ? (
              <ActionIcon
                onClick={() => {
                  window.location.href = `/setup/linkedin?campaign_id=${currentProject?.id}`;
                }}
              >
                <IconBrandLinkedin color='white' fill='#228be8' size={24} />
              </ActionIcon>
            ) : (
              <></>
            )}
            {currentProject?.email_active ? (
              <ActionIcon
                onClick={() => {
                  window.location.href = `/setup/email?campaign_id=${currentProject?.id}`;
                }}
              >
                <IconMail color='white' fill='#228be8' size={24} />
              </ActionIcon>
            ) : (
              <></>
            )}
          </Flex>
          <Divider orientation='vertical' h={'60%'} m={'auto'} />
          <Tooltip
            label={`${currentProject?.num_unused_li_prospects}/${currentProject?.num_prospects} remaining`}
            withArrow
            withinPortal
            color='blue'
            fw={700}
          >
            <Flex align={'center'} gap={4}>
              <RingProgress
                thickness={5}
                size={30}
                sections={[
                  {
                    value:
                      Math.round(
                        ((currentProject?.num_unused_li_prospects || 0) /
                          (currentProject?.num_prospects || 1)) *
                          1000
                      ) / 10,
                    color: 'blue',
                  },
                ]}
              />
              <span
                style={{
                  marginLeft: '6px',
                  color: theme.colors.blue[5],
                  marginRight: '4px',
                }}
              >
                {Math.round(
                  ((currentProject?.num_unused_li_prospects || 0) /
                    (currentProject?.num_prospects || 1)) *
                    1000
                ) / 10}
                %
              </span>
            </Flex>
          </Tooltip>

          <Tooltip label='Upload custom data points to your prospects.'>
            <Button size='xs' onClick={customPointHandlers.open} color='gray' variant='outline'>
              <IconMagnet size={16} />
            </Button>
          </Tooltip>

          <Modal
            opened={openedCustomPoint}
            onClose={customPointHandlers.close}
            size='xl'
            title='Custom Data Point Importer'
          >
            <Text size='xs' color='gray'>
              Upload custom data points to your prospects.
            </Text>
            <CustomResearchPointCard />
          </Modal>

          <Button onClick={openUploadProspects} leftIcon={<IconPlus />}>
            Add Prospects
          </Button>
        </Flex>
      </Flex>

      <Flex justify={'space-between'} mt={'sm'}>
        <Stack w={'100%'}>
          <Flex wrap={'wrap'} align={'center'} justify={'space-between'}>
            {invitedOnLinkedIn && getSelectedRowCount > 0 && (
              <WithdrawInvitesControl
                count={getSelectedRowCount}
                onCancel={cancel}
                onConfirm={withdrawInvites}
              />
            )}
            <Flex w='100%' align={'center'} justify={'space-between'} mt={'sm'}>
              <Button
                size='sm'
                onClick={toggleSideBar}
                variant='outline'
                color='gray'
                leftIcon={<IconFilter size={14} />}
              >
                {!sideBarVisible ? 'Show Filter' : 'Hide Filter'}
              </Button>

              <Flex align={'center'} gap={'xs'}>
                <Box
                  style={{
                    backgroundColor: invitedOnLinkedIn ? 'rgba(231, 245, 255, 1)' : '',
                  }}
                >
                  <Switch
                    color='blue'
                    label='Invited on LinkedIn'
                    labelPosition='left'
                    styles={{
                      label: {
                        color: invitedOnLinkedIn ? theme.colors.blue[6] : theme.colors.gray[6],
                        fontWeight: 600,
                      },
                    }}
                    checked={invitedOnLinkedIn}
                    onChange={(event) => {
                      setInvitedOnLinkedIn(event.currentTarget.checked);
                      setSelectedRows({});
                    }}
                  />
                </Box>
                <Flex align={'center'} gap={'xs'}>
                  <Text
                    styles={{
                      color: theme.colors.gray[6],
                      fontWeight: 600,
                    }}
                  >
                    Filter by Status
                  </Text>
                  <Select
                    size='sm'
                    ml='auto'
                    placeholder='Select a filter'
                    data={[
                      'Prospected',
                      'Sent Outreach',
                      'Accepted',
                      'Bumped',
                      'Active Convo',
                      'Demo',
                      'Do Not Contact',
                      'All Contacts',
                    ]}
                    defaultValue={selectedProspectStatusFilter}
                    onChange={(value: ProspectFilterState) => {
                      setSelectedProspectStatusFilter(value);
                    }}
                  />
                </Flex>
                <Box
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <Input
                    placeholder='Search Contacts'
                    onChange={(event) => setGlobalSearch(event.currentTarget.value)}
                    rightSection={<IconSearch size={18} color={theme.colors.gray[6]} />}
                  />
                </Box>
              </Flex>
            </Flex>
          </Flex>
          {Object.keys(selectedRows).length > 0 && (
            <Flex justify={'flex-end'} align={'center'} gap={'xs'} mt={'sm'}>
              <Text>Bulk Actions - {Object.keys(selectedRows).length} Selected</Text>
              <Tooltip
                withinPortal
                label="Remove 'Prospected' or 'Sent Outreach' prospects from this campaign."
              >
                <Button
                  color='red'
                  leftIcon={<IconTrash size={14} />}
                  size='sm'
                  loading={removeProspectsLoading}
                  onClick={() => {
                    openConfirmModal({
                      title: 'Remove these prospects?',
                      children: (
                        <>
                          <Text>
                            Are you sure you want to remove these {Object.keys(selectedRows).length}{' '}
                            prospects? This will move them into your Unassigned Contacts list.
                          </Text>
                          <Text mt='xs'>
                            <b>Note: </b>Only "Prospected" and "Sent Outreach" prospects will be
                            removed.
                          </Text>
                        </>
                      ),
                      labels: {
                        confirm: 'Remove',
                        cancel: 'Cancel',
                      },
                      confirmProps: { color: 'red' },
                      onCancel: () => {},
                      onConfirm: () => {
                        triggerMoveToUnassigned();
                      },
                    });
                  }}
                >
                  Remove
                </Button>
              </Tooltip>
              <BulkActions
                selectedProspects={Object.keys(selectedRows).map((key) => {
                  return displayProspects[parseInt(key)];
                })}
                backFunc={() => {
                  setSelectedRows({});
                  queryClient.refetchQueries({
                    queryKey: [`query-get-icp-prospects`],
                  });
                  showNotification({
                    title: 'Success',
                    message: `${
                      Object.keys(selectedRows).length
                    } prospects has been moved from Unassigned Contacts to the new persona.`,
                    color: 'green',
                    autoClose: 5000,
                  });
                }}
              />
              <CSVLink data={csvData} filename='export' headers={csvHeaders}>
                <Button color='green' leftIcon={<IconFileDownload size={14} />} size='sm'>
                  Download CSV
                </Button>
              </CSVLink>
            </Flex>
          )}
          <Paper radius={'8px'}>
            <Flex gap={'sm'}>
              {sideBarVisible && (
                <Flex gap={'sm'}>
                  <Box
                    sx={(theme) => ({
                      borderRight: `1px solid ${theme.colors.gray[0]}`,
                      overflowX: 'hidden',
                    })}
                  >
                    <SidebarHeader
                      sideBarVisible={sideBarVisible}
                      toggleSideBar={toggleSideBar}
                      isTesting={isTesting}
                      setIsTesting={setIsTesting}
                    />
                    <Stack w={'360px'}>
                      <Filters isTesting={isTesting} selectOptions={[]} autofill />
                    </Stack>
                  </Box>
                </Flex>
              )}
              <Box
                w={'100%'}
                maw={sideBarVisible ? 'calc(100vw - 13vw - 360px)' : 'calc(100vw - 12vw)'}
              >
                <GridTabs
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  icpDashboard={icpDashboard}
                  numProspects={icpProspects.length}
                />
                <DataGrid
                  data={displayProspects}
                  highlightOnHover
                  withPagination
                  withSorting
                  withRowSelection
                  sx={{ cursor: 'pointer' }}
                  mt={'lg'}
                  columns={[
                    {
                      accessorKey: 'icp_fit_score',
                      header: 'ICP SCORE',
                      maxSize: 140,
                      cell: (cell) => {
                        const score = cell.cell.getValue<number>();
                        let readable_score = '';
                        let color = '';

                        switch (score) {
                          case -1:
                            readable_score = 'Do Not Contact';
                            color = 'gray';
                            break;
                          case 0:
                            readable_score = 'Very Low';
                            color = 'red';
                            break;
                          case 1:
                            readable_score = 'Low';
                            color = 'orange';
                            break;
                          case 2:
                            readable_score = 'Medium';
                            color = 'yellow';
                            break;
                          case 3:
                            readable_score = 'High';
                            color = 'blue';
                            break;
                          case 4:
                            readable_score = 'Very High';
                            color = 'green';
                            break;
                          default:
                            readable_score = 'Unknown';
                            color = 'gray';
                            break;
                        }

                        return <Badge color={color}>{readable_score}</Badge>;
                      },
                      filterFn: stringFilterFn,
                    },
                    {
                      accessorKey: 'full_name',
                      header: 'Full name',
                      size: Math.min(200, window.innerWidth / 3),
                      filterFn: stringFilterFn,
                      cell: (cell) => {
                        const prospectId = cell.row.original.id;
                        return (
                          <Text
                            size='xs'
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {cell.cell?.getValue<string>()}

                            <ProspectDetailsTooltip prospectId={prospectId} />
                          </Text>
                        );
                      },
                    },
                    {
                      accessorKey: 'title',
                      header: 'TITLE',
                      size: Math.min(280, window.innerWidth / 3),
                      filterFn: stringFilterFn,
                      cell: (cell) => {
                        return <Text size='xs'>{cell.cell?.getValue<string>()}</Text>;
                      },
                    },
                    {
                      accessorKey: 'email',
                      header: 'EMAIL',
                      size: Math.min(200, window.innerWidth / 3),
                      filterFn: stringFilterFn,
                      cell: (cell) => {
                        const email = cell.cell?.getValue<string>();
                        const valid = cell.row.original.valid_primary_email as boolean;
                        return (
                          <Text size='xs'>{email ? `${email} ${valid ? '✅' : ''}` : '-'}</Text>
                        );
                      },
                    },
                    {
                      accessorKey: 'company',
                      filterFn: stringFilterFn,
                      size: Math.min(160, window.innerWidth / 6),
                      header: 'COMPANY',
                      cell: (cell) => {
                        const prospectId = cell.row.original.id;
                        return (
                          <Text
                            size='xs'
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CompanyTooltip prospectId={prospectId} />
                            {cell.cell?.getValue<string>()}
                          </Text>
                        );
                      },
                    },
                    {
                      accessorKey: 'status',
                      filterFn: stringFilterFn,
                      size: Math.min(100, window.innerWidth / 6),
                      header: 'STATUS',
                      cell: (cell) => {
                        let color = 'gray';
                        if (cell.cell?.getValue<string>() === 'PROSPECTED') {
                          color = 'yellow';
                        } else if (cell.cell?.getValue<string>() === 'SENT_OUTREACH') {
                          color = 'blue';
                        } else if (cell.cell?.getValue<string>() === 'BUMPED') {
                          color = 'orange';
                        } else if (cell.cell?.getValue<string>() === 'ACTIVE_CONVO') {
                          color = 'purple';
                        } else if (cell.cell?.getValue<string>() === 'DEMO') {
                          color = 'green';
                        } else if (cell.cell?.getValue<string>() === 'REMOVED') {
                          color = 'red';
                        }
                        return (
                          <Badge size='sm' color={color}>
                            {cell.cell?.getValue<string>().replaceAll('_', ' ')}
                          </Badge>
                        );
                      },
                    },
                    {
                      accessorKey: 'icp_fit_reason',
                      filterFn: stringFilterFn,
                      header: 'ICP FIT REASON',
                      cell: (cell) => {
                        const values = cell.cell
                          ?.getValue<string>()
                          ?.split(') (')
                          .map((x) => x.replaceAll(')', '').replaceAll('(', ''));

                        return (
                          <Flex gap={'0.25rem'} align={'center'}>
                            {values?.map((v) => (
                              <Flex key={v} gap={'0.25rem'} align={'center'}>
                                <Tooltip label={v}>
                                  <Flex
                                    justify={'center'}
                                    align={'center'}
                                    style={{ borderRadius: '4px' }}
                                    bg={
                                      v.includes('✅')
                                        ? 'green'
                                        : v.includes('❌')
                                        ? 'red'
                                        : 'yellow'
                                    }
                                    p={'0.25rem'}
                                    w={'1rem'}
                                    h={'1rem'}
                                    sx={{ cursor: 'pointer' }}
                                  >
                                    {v.includes('✅') ? (
                                      <IconCheck color='white' size='0.5rem' />
                                    ) : v.includes('❌') ? (
                                      <IconX color='white' size='0.5rem' />
                                    ) : (
                                      <IconPlus color='white' size='0.5rem' />
                                    )}
                                  </Flex>
                                </Tooltip>
                              </Flex>
                            ))}
                            <HoverCard width={280} shadow='md'>
                              <HoverCard.Target>
                                <Badge
                                  color='green'
                                  ml='xs'
                                  variant='outline'
                                  size='xs'
                                  sx={{ cursor: 'pointer' }}
                                >
                                  Show Details
                                </Badge>
                              </HoverCard.Target>
                              <HoverCard.Dropdown w='280' p='0'>
                                {values?.map((v, i) => (
                                  <>
                                    <Flex
                                      key={v}
                                      gap={'0.25rem'}
                                      align={'center'}
                                      mb='8px'
                                      mt='8px'
                                    >
                                      <Tooltip label={v}>
                                        <Flex
                                          ml='md'
                                          mr='md'
                                          justify={'center'}
                                          align={'center'}
                                          style={{ borderRadius: '4px' }}
                                          bg={
                                            v.includes('✅')
                                              ? 'green'
                                              : v.includes('❌')
                                              ? 'red'
                                              : 'yellow'
                                          }
                                          p={'0.25rem'}
                                          w={'1rem'}
                                          h={'1rem'}
                                          sx={{ cursor: 'pointer' }}
                                        >
                                          <IconCheck color='white' />
                                        </Flex>
                                      </Tooltip>
                                      <Text size='xs'>{v.substring(2)}</Text>
                                    </Flex>
                                    {i !== values.length - 1 && <Divider />}
                                  </>
                                ))}
                              </HoverCard.Dropdown>
                            </HoverCard>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: 'linkedin_url',
                      header: 'LINKEDIN URL',
                      filterFn: stringFilterFn,
                      cell: (cell) => (
                        <Anchor
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                          target='_blank'
                          href={'https://' + cell.row.original.linkedin_url}
                          color={theme.colors.blue[6]}
                          fw={600}
                          size='xs'
                        >
                          <IconExternalLink size={16} />
                          {cell.row.original.full_name.substring(0, 20)}
                          {cell.row.original.full_name.length > 20 ? '...' : ''}
                          's {getChannelType(cell.getValue<string>())}
                        </Anchor>
                      ),
                    },
                  ]}
                  options={{
                    enableFilters: true,
                  }}
                  state={{
                    columnFilters,
                    rowSelection: selectedRows,
                  }}
                  components={{
                    pagination: ({ table }) => (
                      <Flex justify={'space-between'} align={'center'} px={'sm'} pb={'1.25rem'}>
                        <Flex align={'center'} gap={'sm'}>
                          <Text fw={700} color='gray.6'>
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
                              <Text color='gray.5' fw={700} fz={14}>
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
                              <Text color='gray.5' fw={700} fz={14}>
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
                              disabled={
                                table.getState().pagination.pageIndex === table.getPageCount() - 1
                              }
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
                  onRowSelectionChange={(rows) => {
                    if (Object.keys(rows).length > 10) {
                      setSelectedRows(
                        Object.keys(rows)
                          .slice(0, 10)
                          .reduce((obj: any, key: any) => {
                            obj[key] = rows[key];
                            return obj;
                          }, {})
                      );
                    }
                    setSelectedRows(rows);
                  }}
                  pageSizes={['20']}
                  styles={(theme) => ({
                    thead: {
                      height: '44px',
                      backgroundColor: theme.colors.gray[0],
                      '::after': {
                        backgroundColor: 'transparent',
                      },
                    },
                  })}
                />
              </Box>
            </Flex>
          </Paper>
        </Stack>
      </Flex>

      <WithdrawInvitesModal
        opened={opened}
        close={close}
        count={getSelectedRowCount}
        selectedRows={selectedRows}
        data={icpProspects}
        refresh={refetch}
        onWithdrawInvites={() => {
          setSelectedRows({});
        }}
      />

      <PersonaUploadDrawer
        personaOverviews={currentProject ? [currentProject] : []}
        afterUpload={() => {}}
      />
    </Box>
  );
};

export default ICPFiltersDashboard;
