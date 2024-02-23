import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import { API_URL } from '@constants/data';
import {
  Box,
  Title,
  Button,
  useMantineTheme,
  LoadingOverlay,
  Stack,
  Flex,
  Text,
  ScrollArea,
  Divider,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Badge,
  Container,
  Group,
  Switch,
} from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { convertToStandardDate, valueToColor } from '@utils/general';
import toggleCTA from '@utils/requests/toggleCTA';
import _, { chunk, sortBy } from 'lodash';
import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CTA } from 'src';
import { showNotification } from '@mantine/notifications';
import { deleteCTA } from '@utils/requests/createCTA';
import { CTAOption } from './CTAOption';
import {
  IconChevronDown,
  IconChevronUp,
  IconChevronsUp,
  IconPencil,
  IconQuestionCircle,
  IconTrashX,
} from '@tabler/icons';
import CTAGenerator from './CTAGenerator';
import CTAGeneratorExample from '@common/cta_generator/CTAGeneratorExample';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';

export const CtaSection = (props: { onCTAsLoaded: (ctas: CTA[]) => void; outlineCTA?: string }) => {
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);
  const [ctaActiveStatusesToShow, setCtaActiveStatusesToShow] = useState<boolean[]>([true]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-cta-data-${currentProject?.id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`${API_URL}/client/archetype/${currentProject?.id}/get_ctas`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.ctas) {
        return [];
      }

      let pageData = (res.ctas as CTA[]).map((cta) => {
        return {
          ...cta,
          percentage: cta.performance?.total_count
            ? Math.round((cta.performance?.num_converted / cta.performance?.num_sent) * 100)
            : 0,
          total_responded: cta.performance?.num_converted,
          total_count: cta.performance?.num_sent,
        };
      });
      props.onCTAsLoaded(pageData);
      if (!pageData) {
        return [];
      } else {
        return _.sortBy(pageData, ['active', 'percentage', 'id']).reverse();
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject,
  });

  return (
    <Box pt='md' sx={{ position: 'relative' }}>
      <LoadingOverlay visible={isFetching} zIndex={10} />

      <CTAGenerator />

      <Box
        pb={'lg'}
        sx={(theme) => ({
          border: `1px solid ${theme.colors.blue[2]}`,
          borderRadius: 12,
        })}
      >
        <Flex
          bg={'blue'}
          p={'xs'}
          pl='xl'
          justify={'space-between'}
          style={{
            borderStartEndRadius: 12,
            borderStartStartRadius: 12,
          }}
        >
          <Text color='white' fw={500} size={'md'}>
            Edit CTAs
          </Text>
        </Flex>
        <Box px={'lg'}>
          <ScrollArea>
            <Stack spacing='lg' pt={20} pr='lg'>
              {ctaActiveStatusesToShow.map((ctaActive) => {
                return (
                  data &&
                  data
                    .filter((e) => e.active == ctaActive)
                    .map((e, index) => (
                      <CTAOption
                        acceptance={{
                          percentage: e.percentage,
                          total_responded: e.total_responded,
                          total_count: e.total_count,
                        }}
                        data={{
                          id: e.id,
                          label: e.text_value,
                          description: '',
                          checked: e.active,
                          type: e.cta_type,
                          outlined: !!props.outlineCTA && props.outlineCTA === e.text_value,

                          tags: [
                            {
                              label: 'Acceptance:',
                              highlight: e.percentage + '%',
                              color: 'blue',
                              variant: 'subtle',
                              hovered: 'Prospects: ' + e.total_responded + '/' + e.total_count,
                            },
                            {
                              label: e.cta_type,
                              highlight: '',
                              color: valueToColor(theme, e.cta_type),
                              variant: 'light',
                            },
                          ],
                        }}
                        autoMarkScheduling={e.auto_mark_as_scheduling_on_acceptance}
                        key={index}
                        onToggle={async (enabled) => {
                          const result = await toggleCTA(userToken, e.id);
                          if (result.status === 'success') {
                            await refetch();
                          }
                        }}
                        onClickEdit={() => {
                          openContextModal({
                            modal: 'editCTA',
                            title: <Title order={3}>Edit CTA</Title>,
                            innerProps: {
                              personaId: currentProject?.id,
                              cta: e,
                            },
                          });
                        }}
                        onClickDelete={async () => {
                          const response = await deleteCTA(userToken, e.id);
                          if (response.status === 'success') {
                            showNotification({
                              title: 'Success',
                              message: 'CTA has been deleted',
                              color: 'blue',
                            });
                          }
                          refetch();
                        }}
                      />
                    ))
                );
              })}
            </Stack>
          </ScrollArea>
          {/* Active CTAs Only */}

          <Divider
            my='lg'
            role='button'
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (ctaActiveStatusesToShow.length > 1) {
                setCtaActiveStatusesToShow([true]);
              } else {
                setCtaActiveStatusesToShow([true, false]);
              }
            }}
            variant='solid'
            labelPosition='center'
            label={
              <>
                <Box mr={10}>
                  <Text fw={700} color='gray.5' size={'sm'}>
                    {ctaActiveStatusesToShow.length > 1
                      ? 'Hide Inactive CTAs'
                      : 'Show ' + data?.filter((e) => !e.active).length + ' Inactive CTAs'}
                  </Text>
                </Box>
                <ThemeIcon variant='light' color='gray' radius='lg'>
                  {ctaActiveStatusesToShow.length > 1 ? <IconChevronUp /> : <IconChevronDown />}
                </ThemeIcon>
              </>
            }
          />

          <Flex justify={'center'}>
            <Button
              variant={'light'}
              size='sm'
              w={'50%'}
              color={'green'}
              radius='xl'
              fw={'700'}
              leftIcon={<IconPlus size='1rem' />}
              onClick={() => {
                openContextModal({
                  modal: 'createNewCTA',
                  title: <Title order={3}>Create CTA</Title>,
                  innerProps: {
                    personaId: currentProject?.id,
                  },
                });
              }}
            >
              Add More CTAs
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

const PAGE_SIZE = 20;
export function CtaList(props: { personaId: number }) {
  const userToken = useRecoilValue(userTokenState);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'percentage',
    direction: 'desc',
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-cta-data-${props.personaId}`, { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      const response = await fetch(`${API_URL}/client/archetype/${props.personaId}/get_ctas`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.ctas) {
        return [];
      }

      totalRecords.current = res.ctas.length;
      let pageData = chunk(res.ctas as CTA[], PAGE_SIZE)[page - 1]?.map((cta) => {
        let totalResponded = 0;
        if (cta.performance) {
          for (const status in cta.performance.status_map) {
            if (status !== 'SENT_OUTREACH' && status !== 'NOT_INTERESTED') {
              totalResponded += cta.performance.status_map[status];
            }
          }
        }
        return {
          ...cta,
          percentage: cta.performance?.total_count
            ? Math.round((totalResponded / cta.performance.total_count) * 100)
            : 0,
          total_responded: totalResponded,
          total_count: cta.performance?.total_count,
        };
      });
      if (!pageData) {
        return [];
      }

      pageData = sortBy(pageData, ['active', sortStatus.columnAccessor]);
      return sortStatus.direction === 'desc' ? pageData.reverse() : pageData;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <Flex direction='row-reverse' gap='sm' pb='xs'>
        {/* <Button
          color='teal'
          size='sm'
          onClick={() => {
            openContextModal({
              modal: 'createNewCTA',
              title: <Title order={3}>Create CTA</Title>,
              innerProps: {
                personaId: currentProject?.id,
                personas: props.personas,
              },
            });
          }}
        >
          Create New CTA
        </Button> */}
      </Flex>
      <DataTable
        height={'300px'}
        verticalAlignment='center'
        loaderColor='teal'
        noRecordsText={'No CTAs found'}
        fetching={isFetching}
        columns={[
          {
            accessor: 'text_value',
            title: 'Call-to-Action',
            sortable: true,
            render: (record) => {
              const isDisabled = !!(record.total_count && record.total_count > 0);

              const mantineColorOptions = [
                'gray',
                'red',
                'pink',
                'grape',
                'violet',
                'indigo',
                'blue',
                'cyan',
                'teal',
                'green',
                'lime',
                'yellow',
              ];
              const deterministicColor = (str: string) =>
                mantineColorOptions[
                  Math.abs(
                    [...str].reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
                  ) % mantineColorOptions.length
                ];
              const randomColorFromCtaType = deterministicColor(record.cta_type || '');

              return (
                <Flex direction='row' align='center' justify='space-between'>
                  <Flex>
                    <Flex mr='xs'>
                      <Group sx={{ textAlign: 'center' }}>
                        <CTAGeneratorExample ctaText={record.text_value} size='xs' />
                      </Group>
                    </Flex>
                    <Flex>
                      <Container>
                        <Text>
                          {record.text_value}{' '}
                          {record.expiration_date ? (
                            new Date().getTime() > new Date(record.expiration_date).getTime() ? (
                              <Text c='red'>
                                (Expired on {convertToStandardDate(record.expiration_date)})
                              </Text>
                            ) : (
                              <Text c='violet'>
                                (⏰ Expiring {convertToStandardDate(record.expiration_date)})
                              </Text>
                            )
                          ) : (
                            ''
                          )}
                        </Text>
                        <Badge
                          color={randomColorFromCtaType}
                          variant='light'
                          size='xs'
                          mt='xs'
                          mb='xs'
                        >
                          {record.cta_type}
                        </Badge>
                      </Container>
                    </Flex>
                  </Flex>
                  <Flex miw='30px'>
                    <Tooltip
                      withArrow
                      withinPortal
                      label={isDisabled ? 'CTAs that have been used cannot be edited' : 'Edit CTA'}
                    >
                      <div>
                        <ActionIcon
                          size='xs'
                          variant='transparent'
                          disabled={isDisabled}
                          onClick={() => {
                            openContextModal({
                              modal: 'editCTA',
                              title: <Title order={3}>Edit CTA</Title>,
                              innerProps: {
                                personaId: props.personaId,
                                cta: record,
                              },
                            });
                          }}
                        >
                          <IconPencil color={isDisabled ? 'gray' : 'black'} stroke={'1'} />
                        </ActionIcon>
                      </div>
                    </Tooltip>
                    <Tooltip
                      withArrow
                      withinPortal
                      label={
                        isDisabled
                          ? 'CTAs that have been used cannot be deleted. Try disabling instead.'
                          : 'Delete CTA'
                      }
                    >
                      <div>
                        <ActionIcon
                          size='xs'
                          variant='transparent'
                          disabled={isDisabled}
                          onClick={() => {
                            deleteCTA(userToken, record.id).then((res) => {
                              showNotification({
                                title: 'Success',
                                message: 'CTA has been deleted',
                                color: 'blue',
                              });
                              refetch();
                            });
                          }}
                        >
                          <IconTrashX color={isDisabled ? 'gray' : 'black'} stroke={'1'} />
                        </ActionIcon>
                      </div>
                    </Tooltip>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessor: 'percentage',
            title: '%Accepted',
            ellipsis: true,
            sortable: true,
            width: 100,
            render: ({ percentage }) => `${percentage}%`,
          },
          {
            accessor: 'total_count',
            title: 'Prospects',
            sortable: true,
            render: ({ total_count, total_responded }) => `${total_responded} / ${total_count}`,
          },
          {
            accessor: 'active',
            title: 'Active',
            render: ({ active, id }) => (
              <Switch
                color='teal'
                checked={active}
                onClick={async (e) => {
                  if (data) {
                    const result = await toggleCTA(userToken, id);
                    if (result.status === 'success') {
                      const entry = data.filter((d) => d.id === id)[0];
                      entry.active = !entry.active;
                      refetch();
                    }
                  }
                }}
                styles={(theme) => ({
                  track: {
                    cursor: 'pointer',
                  },
                })}
              />
            ),
          },
        ]}
        records={data}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        paginationColor='teal'
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        rowContextMenu={{
          items: (cta) => [
            {
              key: 'edit',
              icon: <IconPencil size={14} />,
              title: `Edit CTA`,
              disabled: !!(cta.total_count && cta.total_count > 0),
              onClick: () => {
                openContextModal({
                  modal: 'editCTA',
                  title: <Title order={3}>Edit CTA</Title>,
                  innerProps: {
                    personaId: props.personaId,
                    cta: cta,
                  },
                });
              },
            },
            {
              key: 'delete',
              title: `Delete CTA`,
              icon: <IconTrashX size={14} />,
              disabled: !!(cta.total_count && cta.total_count > 0),
              color: 'red',
              onClick: async () => {
                await deleteCTA(userToken, cta.id);
                showNotification({
                  title: 'Success',
                  message: 'CTA has been deleted',
                  color: 'blue',
                });
                refetch();
              },
            },
          ],
        }}
      />
    </Box>
  );
}
