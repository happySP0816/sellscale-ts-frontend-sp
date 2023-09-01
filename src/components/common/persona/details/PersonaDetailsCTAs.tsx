import {
  Drawer,
  Title,
  Text,
  Center,
  Button,
  Switch,
  Container,
  Badge,
  Stack,
  Group,
  Box,
  Flex,
  Select,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { faker } from "@faker-js/faker";
import { useQuery } from "@tanstack/react-query";
import { chunk, sortBy } from "lodash";
import { IconPencil, IconTrash, IconTrashX, IconUser } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { closeAllModals, openContextModal, openModal } from "@mantine/modals";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { Archetype, CTA } from "src";
import {
  currentProjectState,
  detailsDrawerOpenState,
} from "@atoms/personaAtoms";
import displayNotification from "@utils/notificationFlow";
import createCTA, { deleteCTA } from "@utils/requests/createCTA";
import toggleCTA from "@utils/requests/toggleCTA";
import { API_URL } from "@constants/data";
import CTAGeneratorExample from "@common/cta_generator/CTAGeneratorExample";
import moment from "moment";

const PAGE_SIZE = 20;

export default function PersonaDetailsCTAs(props: { personas?: Archetype[], onCTAsLoaded?: (data: any) => void }) {
  const currentProject = useRecoilValue(currentProjectState);
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
    queryKey: [`query-cta-data-${currentProject?.id}`, { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      const response = await fetch(
        `${API_URL}/client/archetype/${currentProject?.id}/get_ctas`,
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
    enabled: !!currentProject,
  });

  if (data && props.onCTAsLoaded) {
    props.onCTAsLoaded(data);
  }

  return (
    <Box>
      <Flex direction="row-reverse" gap="sm" pb="xs">
        <Button
          color="teal"
          size="sm"
          onClick={() => {
            openContextModal({
              modal: "createNewCTA",
              title: <Title order={3}>Create CTA</Title>,
              innerProps: {
                personaId: currentProject?.id,
                personas: props.personas,
              },
            });
          }}
        >
          Create New CTA
        </Button>
        {props.personas?.find((persona) => persona.id === currentProject?.id)
          ?.ctas.length === 0 && (
          <Button
            color="teal"
            size="sm"
            variant="light"
            onClick={() => {
              openContextModal({
                modal: "copyCTAs",
                title: <Title order={3}>Copy CTAs</Title>,
                innerProps: {
                  personaId: currentProject?.id,
                  personas: props.personas,
                },
              });
            }}
          >
            Copy CTAs from Existing Persona
          </Button>
        )}
      </Flex>
      <DataTable
        height={"min(670px, 100vh - 200px)"}
        verticalAlignment="center"
        loaderColor="teal"
        noRecordsText={"No CTAs found"}
        fetching={isFetching}
        columns={[
          {
            accessor: "text_value",
            title: "Call-to-Action",
            sortable: true,
            render: (record) => {
              const isDisabled = !!(
                record.total_count && record.total_count > 0
              );

              const mantineColorOptions = [
                "gray",
                "red",
                "pink",
                "grape",
                "violet",
                "indigo",
                "blue",
                "cyan",
                "teal",
                "green",
                "lime",
                "yellow",
              ];
              const deterministicColor = str => mantineColorOptions[Math.abs([...str].reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)) % mantineColorOptions.length];
              const randomColorFromCtaType = deterministicColor(record.cta_type)

              return (
                <Flex direction="row" align="center" justify="space-between">
                  <Flex>
                    <Flex mr="xs">
                      <Group sx={{textAlign: 'center'}}>
                        <CTAGeneratorExample
                          ctaText={record.text_value}
                          size="xs"
                        />
                      </Group>
                    </Flex>
                    <Flex>
                      <Container>
                        <Text>
                          {record.text_value}{" "}
                          {record.expiration_date ? (
                            new Date().getTime() >
                            new Date(record.expiration_date).getTime() ? (
                              <Text c="red">
                                (Expired on{" "}
                                {moment(record.expiration_date).format(
                                  "MM/DD/YYYY"
                                )}
                                )
                              </Text>
                            ) : (
                              <Text c="violet">
                                (⏰ Expiring{" "}
                                {moment(record.expiration_date).format("MM/DD/YYYY")})
                              </Text>
                            )
                          ) : (
                            ""
                          )}
                        </Text>
                        <Badge color={randomColorFromCtaType} variant="light" size='xs' mt='xs' mb='xs'>
                          {record.cta_type}
                        </Badge>
                      </Container>
                      
                    </Flex>
                  </Flex>
                  <Flex miw="30px">
                    <Tooltip
                      withArrow
                      withinPortal
                      label={
                        isDisabled
                          ? "CTAs that have been used cannot be edited"
                          : "Edit CTA"
                      }
                    >
                      <div>
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          disabled={isDisabled}
                          onClick={() => {
                            openContextModal({
                              modal: "editCTA",
                              title: <Title order={3}>Edit CTA</Title>,
                              innerProps: {
                                personaId: currentProject?.id,
                                cta: record,
                              },
                            });
                          }}
                        >
                          <IconPencil color={isDisabled ? "gray" : "black"} stroke={"1"} />
                        </ActionIcon>
                      </div>
                    </Tooltip>
                    <Tooltip
                      withArrow
                      withinPortal
                      label={
                        isDisabled
                          ? "CTAs that have been used cannot be deleted. Try disabling instead."
                          : "Delete CTA"
                      }
                    >
                      <div>
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          disabled={isDisabled}
                          onClick={() => {
                            deleteCTA(userToken, record.id).then(res => {
                              showNotification({
                                title: "Success",
                                message: "CTA has been deleted",
                                color: "blue",
                              });
                              refetch();
                            });
                          }}
                        >
                          <IconTrashX color={isDisabled ? "gray" : "black"} stroke={"1"} />
                        </ActionIcon>
                      </div>
                    </Tooltip>
                  </Flex>
                </Flex>
              );
            },
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
                    personaId: currentProject?.id,
                    cta: cta,
                  },
                });
              },
            },
            {
              key: "delete",
              title: `Delete CTA`,
              icon: <IconTrashX size={14} />,
              disabled: !!(cta.total_count && cta.total_count > 0),
              color: "red",
              onClick: async () => {
                await deleteCTA(userToken, cta.id);
                showNotification({
                  title: "Success",
                  message: "CTA has been deleted",
                  color: "blue",
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
