import { userTokenState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import ComingSoonCard from '@common/library/ComingSoonCard';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import { API_URL } from '@constants/data';
import { TextInput, Tabs, Box, Button, Flex, Select, Switch, Title } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { ArchetypeCreation } from '@modals/CreatePersonaModal';
import { IconUser, IconPencil, IconTrashX } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { deleteCTA } from '@utils/requests/createCTA';
import toggleCTA from '@utils/requests/toggleCTA';
import { chunk, sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CTA, Archetype, PersonaOverview } from 'src';

const PAGE_SIZE = 10;

export default function PersonaLiSetup(props: { persona: PersonaOverview, personas: PersonaOverview[] }) {
  
  const userToken = useRecoilValue(userTokenState);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "percentage",
    direction: "desc",
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-cta-data-${props.persona.id}`, { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      const response = await fetch(
        `${API_URL}/client/archetype/${props.persona.id}/get_ctas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.ctas) {
        return [];
      }

      totalRecords.current = res.ctas.length;
      let pageData = chunk(res.ctas as CTA[], PAGE_SIZE)[page - 1]?.map(
        (cta) => {
          let totalResponded = 0;
          if (cta.performance) {
            for (const status in cta.performance.status_map) {
              if (status !== "SENT_OUTREACH" && status !== "NOT_INTERESTED") {
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
        }
      );
      if (!pageData) {
        return [];
      }

      pageData = sortBy(pageData, ["active", sortStatus.columnAccessor]);
      return sortStatus.direction === "desc" ? pageData.reverse() : pageData;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <Flex direction="row-reverse" gap="sm" pb="xs">
        <Button
          size="sm"
          variant="light"
          onClick={() => {
            openContextModal({
              modal: "createNewCTA",
              title: <Title order={3}>Create CTA</Title>,
              innerProps: {
                personaId: props.persona.id,
                personas: props.personas,
              },
            });
          }}
        >
          Create New CTA
        </Button>
      </Flex>
      <DataTable
        height={"min(670px, 100vh - 200px)"}
        verticalAlignment="top"
        loaderColor="teal"
        noRecordsText={"No CTAs found"}
        fetching={isFetching}
        columns={[
          {
            accessor: "text_value",
            title: "Call-to-Action",
            sortable: true,
          },
          {
            accessor: "percentage",
            title: "%Accepted",
            ellipsis: true,
            sortable: true,
            width: 100,
            render: ({ percentage }) => `${percentage}%`,
          },
          {
            accessor: "total_count",
            title: "Prospects",
            sortable: true,
            render: ({ total_count, total_responded }) =>
              `${total_responded} / ${total_count}`,
          },
          {
            accessor: "active",
            title: "Active",
            render: ({ active, id }) => (
              <Switch
                color="teal"
                checked={active}
                onClick={async (e) => {
                  if (data) {
                    const result = await toggleCTA(userToken, id);
                    if (result.status === "success") {
                      const entry = data.filter((d) => d.id === id)[0];
                      entry.active = !entry.active;
                      refetch();
                    }
                  }
                }}
                styles={(theme) => ({
                  track: {
                    cursor: "pointer",
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
        paginationColor="teal"
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        rowContextMenu={{
          items: (cta) => [
            {
              key: "edit",
              icon: <IconPencil size={14} />,
              title: `Edit CTA`,
              disabled: !!(cta.total_count && cta.total_count > 0),
              onClick: () => {
                openContextModal({
                  modal: "editCTA",
                  title: <Title order={3}>Edit CTA</Title>,
                  innerProps: {
                    personaId: props.persona.id,
                    cta: cta,
                  },
                });
              }
            },
            {
              key: "delete",
              title: `Delete CTA`,
              icon: <IconTrashX size={14} />,
              color: "red",
              onClick: async () => {
                await deleteCTA(userToken, cta.id);
                showNotification({
                  title: "Success",
                  message: "CTA has been deleted",
                  color: "blue",
                });
                refetch();
              }
            },
          ],
        }}
      />
    </Box>
  );
}

