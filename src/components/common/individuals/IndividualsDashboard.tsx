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
  Tooltip,
  Title,
  useMantineTheme,
  HoverCard,
  Group,
  Container,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconExternalLink, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { DataGrid, DataGridFiltersState, DataGridRowSelectionState, stringFilterFn } from 'mantine-data-grid';
import { FC, useEffect, useMemo, useState } from 'react';
import { SCREEN_SIZES } from '@constants/data';
import { getProspectsForICP } from '@utils/requests/getProspects';
import { userTokenState } from '@atoms/userAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentProjectState, uploadDrawerOpenState } from '@atoms/personaAtoms';
import { showNotification } from '@mantine/notifications';
import { ProjectSelect } from '@common/library/ProjectSelect';
import PersonaUploadDrawer from '@drawers/PersonaUploadDrawer';
import { Individual, PersonaOverview, ProspectICP } from 'src';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { openConfirmModal } from '@mantine/modals';
import { moveToUnassigned } from '@utils/requests/moveToUnassigned';
import { filterProspectsState, filterRuleSetState } from '@atoms/icpFilterAtoms';
import { IconX } from '@tabler/icons';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';
import Filters from '@common/persona/ICPFilter/Filters';
import { updateICPRuleSet } from '@utils/requests/icpScoring';
import getIndividuals from '@utils/requests/getIndividuals';
import _ from 'lodash';
import { convertIndividualsToProspects } from '@utils/requests/convertIndividualsToProspects';

const PAGE_SIZE = 1000;

const IndividualsDashboard: FC<{
  openFilter: () => void;
}> = ({ openFilter }) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [icpProspects, setIcpProspects] = useRecoilState(filterProspectsState);
  const navigate = useNavigate();
  const [convertLoading, setConvertLoading] = useState(false);
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.LG})`, false, {
    getInitialValueInEffect: true,
  });
  const theme = useMantineTheme();
  const [globalSearch, setGlobalSearch] = useState('');
  const [totalFound, setTotalFound] = useState(0);

  const [invitedOnLinkedIn, setInvitedOnLinkedIn] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(uploadDrawerOpenState);
  const openUploadProspects = () => {
    setUploadDrawerOpened(true);
  };

  // Cant find a type for this unfortunately
  const [pagination, setPagination] = useState<{ pageSize: number; pageIndex: number }>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  });

  const [icpDashboard, setIcpDashboard] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [columnFilters, setColumnFilters] = useState<DataGridFiltersState>([]);

  const globalRuleSetData = useRecoilValue(filterRuleSetState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-get-individuals`, { pagination }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { pagination }] = queryKey;

      const response = await getIndividuals(
        userToken,
        currentProject!.id,
        pagination.pageSize,
        pagination.pageIndex * pagination.pageSize
      );
      if (response.status === 'success') {
        setTotalFound(response.data.total);
        return response.data.results.map((i: Individual) => {
          return {
            ...i,
            company_name: i?.company?.name ?? '',
          };
        }) as Individual[];
      }
      return [];
    },
    enabled: !!currentProject,
    refetchOnWindowFocus: false,
  });

  // const displayIndividuals = useMemo(() => {
  //   if (!data) return [];
  //   let filtered = _.cloneDeep(data);

  //   filtered = filtered.filter((individual) => {
  //     return (
  //       individual.full_name?.includes(globalSearch) ||
  //       individual.title?.includes(globalSearch) ||
  //       individual.company_name?.includes(globalSearch)
  //     );
  //   });

  //   return filtered;
  // }, [data]);

  const getRowSelection = (selectedRows: number[]) => {
    if (!data) return {};
    const result: Record<number, boolean> = {};
    for(let i = 0; i < data.length; i++) {
      result[i] = selectedRows.includes(data[i].id);
    }
    return result;
  };


  useEffect(() => {
    (async () => {
      if(!currentProject) return;
      // Auto save ICP rule set
      const response = await updateICPRuleSet(
        userToken,
        currentProject.id,
        globalRuleSetData.included_individual_title_keywords,
        globalRuleSetData.excluded_individual_title_keywords,
        globalRuleSetData.included_individual_industry_keywords,
        globalRuleSetData.individual_years_of_experience_start,
        globalRuleSetData.individual_years_of_experience_end,
        globalRuleSetData.included_individual_skills_keywords,
        globalRuleSetData.excluded_individual_skills_keywords,
        globalRuleSetData.included_individual_locations_keywords,
        globalRuleSetData.excluded_individual_locations_keywords,
        globalRuleSetData.included_individual_generalized_keywords,
        globalRuleSetData.excluded_individual_generalized_keywords,
        globalRuleSetData.included_company_name_keywords,
        globalRuleSetData.excluded_company_name_keywords,
        globalRuleSetData.included_company_locations_keywords,
        globalRuleSetData.excluded_company_locations_keywords,
        globalRuleSetData.company_size_start,
        globalRuleSetData.company_size_end,
        globalRuleSetData.included_company_industries_keywords,
        globalRuleSetData.excluded_company_industries_keywords,
        globalRuleSetData.included_company_generalized_keywords,
        globalRuleSetData.excluded_company_generalized_keywords
      );
      refetch();
    })();
  }, [globalRuleSetData]);

  return (
    <Group
      sx={(theme) => ({
        padding: theme.spacing.lg,
      })}
      align='flex-start'
      noWrap
    >
      <Box w={250}>
        <ScrollArea px={'md'} h={'75vh'}>
          <Filters isTesting={false} selectOptions={[]} autofill={false} />
        </ScrollArea>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Box ml={'0.5rem'}>
              <ProjectSelect
                extraBig
                onClick={(persona?: PersonaOverview) => {
                  refetch();
                  navigateToPage(navigate, `/contacts/find`);
                }}
              />
            </Box>
          </Box>
          <Flex gap={'1rem'} align={'center'}>
            {selectedRows.length > 0 && (
              <Button
                loading={convertLoading}
                onClick={async () => {
                  setConvertLoading(true);
                  const response = await convertIndividualsToProspects(userToken, currentProject!.id, selectedRows);
                  if (response.status === 'success') {
                    showNotification({
                      title: 'Success',
                      message: `Currently importing prospects. This may take a few minutes...`,
                      color: 'green',
                    });
                    setSelectedRows([]);
                    refetch();
                  }
                  setConvertLoading(false);
                }}
              >
                Import {selectedRows.length} Contacts to Campaign
              </Button>
            )}
          </Flex>
        </Box>
        <Divider my='sm' />

        <DataGrid
          data={data ?? []}
          highlightOnHover
          loading={isFetching}
          height={480}
          withPagination
          paginationMode='default'
          pageSizes={[PAGE_SIZE.toString()]}
          withRowSelection
          withColumnResizing
          sx={{ cursor: 'pointer' }}
          columns={[
            {
              accessorKey: 'title',
              header: 'TITLE',
              size: Math.min(300, window.innerWidth / 3),
              filterFn: stringFilterFn,
              cell: (cell) => {
                return <Text size='xs'>{cell.cell?.getValue<string>()}</Text>;
              },
            },
            {
              accessorKey: 'company_name',
              filterFn: stringFilterFn,
              size: Math.min(100, window.innerWidth / 6),
              header: 'COMPANY',
              cell: (cell) => {
                return <Text size='xs'>{cell.cell?.getValue<string>()}</Text>;
              },
            },
            {
              accessorKey: 'full_name',
              filterFn: stringFilterFn,
              size: Math.min(100, window.innerWidth / 6),
              header: 'NAME',
              cell: (cell) => {
                return <Text size='xs'>{cell.cell?.getValue<string>()}</Text>;
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
                  {cell.row.original.full_name.length > 20 ? '...' : ''}'s
                </Anchor>
              ),
            },
          ]}
          total={totalFound}
          onPageChange={(page) => {
            setPagination(page);
          }}
          state={{
            rowSelection: getRowSelection(selectedRows),
          }}
          w={'100%'}
          onRowSelectionChange={(rows) => {
            let resultRows = new Set(selectedRows);
            if (!data) return;

            for (let i = 0; i < PAGE_SIZE; i++) {
              const id = data[i]?.id;
              if (!id) continue;
              if (rows[i] === true) {
                resultRows.add(id);
              } else {
                resultRows.delete(id);
              }
            }

            setSelectedRows([...resultRows]);
          }}
          styles={(theme) => ({
            thead: {
              backgroundColor: theme.colors.gray[0],
              '::after': {
                backgroundColor: 'transparent',
              },
            },
          })}
        />
      </Box>

      <PersonaUploadDrawer personaOverviews={currentProject ? [currentProject] : []} afterUpload={() => {}} />
    </Group>
  );
};

export default IndividualsDashboard;
