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
  ActionIcon,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  convertDateToShortFormat,
  formatToLabel,
  percentageToColor,
  splitName,
  temp_delay,
  valueToColor,
} from "@utils/general";
import {
  campaignDrawerIdState,
  campaignDrawerOpenState,
} from "@atoms/campaignAtoms";
import {
  userEmailState,
  userNameState,
  userTokenState,
} from "@atoms/userAtoms";
import {
  IconCalendar,
  IconClockRecord,
  IconRefresh,
  IconUsers,
} from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { Archetype, Campaign } from "src/main";
import { logout } from "@auth/core";
import { useQuery } from "react-query";
import CampaignProspects from "@common/campaigns/CampaignProspects";
import CampaignCTAs from "@common/campaigns/CampaignCTAs";
import { prospectUploadDrawerOpenState } from "@atoms/uploadAtoms";
import { prospectUploadDrawerIdState } from "@atoms/uploadAtoms";
import FlexSeparate from "@common/library/FlexSeparate";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import getPersonas, {
  getAllUploads,
  getUploadDetails,
} from "@utils/requests/getPersonas";
import _ from "lodash";

const PAGE_SIZE = 20;

export default function UploadDetailsDrawer() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(prospectUploadDrawerOpenState);
  const [uploadId, setUploadId] = useRecoilState(prospectUploadDrawerIdState);
  const userToken = useRecoilValue(userTokenState);

  // Sorting and pagination
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "csv_row_hash",
    direction: "desc",
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  // Fetch upload details (table data)
  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-upload-details-${uploadId}`, { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      if (uploadId === -1) {
        return null;
      }

      const response = await getUploadDetails(userToken, uploadId);
      const results = response.status === "success" ? response.extra : null;

      // Split results into pages
      totalRecords.current = results.length;
      let pageData = _.chunk(results as any[], PAGE_SIZE)[page - 1];
      if (!pageData) {
        return [];
      }

      // Sort data
      pageData = _.sortBy(
        pageData,
        sortStatus.columnAccessor === "csv_row_hash"
          ? "id"
          : sortStatus.columnAccessor
      );
      return sortStatus.direction === "desc" ? pageData.reverse() : pageData;
    },
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
      const result =
        response.status === "success" ? (response.extra as Archetype[]) : [];

      for (let persona of result) {
        const uploadsResponse = await getAllUploads(userToken, persona.id);
        persona.uploads =
          uploadsResponse.status === "success" ? uploadsResponse.extra : [];
      }

      return result;
    },
  });

  const persona = data_personas?.find((persona) => {
    return persona.uploads?.find((upload) => {
      return upload.id === uploadId;
    });
  });
  const uploadData = persona?.uploads?.find((upload) => upload.id === uploadId);

  // Refresh drawer state
  const refreshDrawer = () => {
    refetch_personas();
    refetch();
  }
  useEffect(() => {
    refreshDrawer();
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <FlexSeparate>
          <Title order={3}>{"Upload Details: "}</Title>
          <Select
            placeholder="Upload Record"
            maxDropdownHeight={280}
            variant="unstyled"
            data={
              persona?.uploads?.map((upload) => {
                return {
                  value: upload.id + "",
                  label: convertDateToShortFormat(new Date(upload.created_at)),
                };
              }) ?? []
            }
            value={uploadId + ""}
            onChange={(value) => value && setUploadId(+value)}
            styles={{
              input: {
                fontWeight: 500,
                fontSize: "20px",
              },
              root: {
                width: 240,
              },
            }}
          />
        </FlexSeparate>
      }
      padding="xl"
      size="xl"
      position="right"
      styles={{
        title: {
          display: "block",
          width: "100%",
        },
        body: {
          position: "relative",
        },
      }}
    >
      <LoadingOverlay
        visible={isFetching || isFetching_personas}
        overlayBlur={2}
      />
      <div style={{ position: "absolute", top: 0, right: 0 }}>
        <ActionIcon
          onClick={refreshDrawer}
        >
          <IconRefresh size="1.125rem" />
        </ActionIcon>
      </div>
      {data && uploadData && !isFetching && !isFetching_personas && (
        <>
          <Group noWrap grow>
            <Group>
              <Avatar size={84} radius="md">
                <IconUsers size="3rem" />
              </Avatar>
              <div>
                <Title order={6}>Total</Title>
                <Title order={1}>{uploadData.stats.total}</Title>
                <Text fs="italic" fz="xs" opacity={0.5}>
                  Potential Prospects
                </Text>
              </div>
            </Group>
            <Group>
              <Avatar size={84} radius="md">
                <IconClockRecord size="3rem" />
              </Avatar>
              <div>
                <Title order={6} color="orange.2">
                  Queued
                </Title>
                <Title order={1} color="orange.2">
                  {uploadData.stats.queued +
                    uploadData.stats.not_started +
                    uploadData.stats.in_progress}
                </Title>
                <Text fs="italic" fz="xs" opacity={0.5} color="orange.2">
                  Scheduled to upload
                </Text>
              </div>
            </Group>
          </Group>
          <Group noWrap grow pt="lg" pl="md">
            <div>
              <Title order={6} color="green.4">
                Success
              </Title>
              <Title order={2} color="green.4">
                {uploadData.stats.success}
              </Title>
              <Text fs="italic" fz="xs" opacity={0.5} color="green.4">
                Prospects created
              </Text>
            </div>
            <div>
              <Title order={6} color="red.4">
                Disqualified
              </Title>
              <Title order={2} color="red.4">
                {uploadData.stats.disqualified}
              </Title>
              <Text fs="italic" fz="xs" opacity={0.5} color="red.4">
                Not Eligible
              </Text>
            </div>
            <div>
              <Title order={6} color="red.4">
                Failed
              </Title>
              <Title order={2} color="red.4">
                {uploadData.stats.failed}
              </Title>
              <Text fs="italic" fz="xs" opacity={0.5} color="red.4">
                Error Occurred
              </Text>
            </div>
          </Group>
          <Text pt="md" fw={650}>
            File Rows
          </Text>
          <DataTable
            withBorder
            height={"min(670px, 100vh - 300px)"}
            verticalAlignment="top"
            loaderColor="teal"
            highlightOnHover
            noRecordsText={"No rows found"}
            rowExpansion={{
              content: ({ record }) => (
                <Stack p="xs" spacing={6}>
                  {Object.keys(record.csv_row_data).map((key, i) => (
                    <Flex key={i} wrap="nowrap">
                      <div style={{ width: 105 }}>
                        <Text fw={700} truncate>
                          {formatToLabel(key)}
                        </Text>
                      </div>
                      <div>
                        <Text sx={{ wordBreak: "break-word" }}>
                          {record.csv_row_data[key]}
                        </Text>
                      </div>
                    </Flex>
                  ))}
                </Stack>
              ),
            }}
            columns={[
              {
                accessor: "csv_row_hash",
                title: "Row ID",
                width: 100,
                sortable: true,
                render: ({ csv_row_hash }) => (
                  <Text truncate>{csv_row_hash}</Text>
                ),
              },
              {
                accessor: "upload_attempts",
                title: "Attempts",
                sortable: true,
              },
              {
                accessor: "status",
                sortable: true,
                render: ({ status }) => (
                  <Badge
                    color={valueToColor(theme, formatToLabel(status))}
                    variant="light"
                  >
                    {formatToLabel(status)}
                  </Badge>
                ),
              },
              {
                accessor: "error_type",
                sortable: true,
                render: ({ error_type }) => (
                  <Text>{_.capitalize(error_type)}</Text>
                ),
              },
            ]}
            records={data}
            totalRecords={totalRecords.current}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={(p) => setPage(p)}
            paginationColor="teal"
            sortStatus={sortStatus}
            onSortStatusChange={handleSortStatusChange}
          />
        </>
      )}
    </Drawer>
  );
}
