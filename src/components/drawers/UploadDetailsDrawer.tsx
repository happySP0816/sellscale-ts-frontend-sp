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
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  convertDateToShortFormat,
  formatToLabel,
  valueToColor,
} from "@utils/general";
import {
  campaignDrawerIdState,
  campaignDrawerOpenState,
} from "@atoms/campaignAtoms";
import { userTokenState } from "@atoms/userAtoms";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconCalendar,
  IconClockRecord,
  IconMan,
  IconNavigation,
  IconRefresh,
  IconUsers,
} from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import { Archetype, Campaign } from "src";
import { logout } from "@auth/core";
import { useQuery } from "@tanstack/react-query";
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
      const results = response.status === "success" ? response.data : null;

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
    refetchOnWindowFocus: false,
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
        response.status === "success" ? (response.data as Archetype[]) : [];

      for (let persona of result) {
        const uploadsResponse = await getAllUploads(userToken, persona.id);
        persona.uploads =
          uploadsResponse.status === "success" ? uploadsResponse.data : [];
      }

      return result;
    },
    refetchOnWindowFocus: false,
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
  };
  useEffect(() => {
    refreshDrawer();
  }, [opened]);

  return (
    <Drawer.Root size="44rem" position="right" opened={opened} onClose={close}>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header bg={"blue"}>
          <Flex
            bg={"#0287f7"}
            align={"center"}
            justify={"space-between"}
            w={"100%"}
            px={30}
          >
            <Title color="white" order={3}>
              {"Upload Details: "}
            </Title>
            <CloseButton
              style={{
                border: "1px solid white",
                color: "white",
                borderRadius: "20px",
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
          <div style={{ position: "absolute", top: 0, right: 0 }}>
            <ActionIcon onClick={refreshDrawer}>
              <IconRefresh size="1.125rem" />
            </ActionIcon>
          </div>
          <Flex direction={"column"} gap={10}>
            <Flex gap={20}>
              <Flex
                align={"center"}
                gap={5}
                w={"100%"}
                style={{ borderRight: "3px solid #f4f2f5" }}
              >
                <IconUsers color="#0287f7" />
                <Text size={"lg"}>Total Prospect:</Text>
                <Text
                  size={20}
                  px={14}
                  style={{ border: "3px solid #f4f2f5", borderRadius: "10px" }}
                >
                  {uploadData?.stats.total}
                </Text>
              </Flex>
              <Flex align={"center"} gap={5} w={"100%"}>
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
              </Flex>
            </Flex>

            <Flex
              style={{
                gap: "0px",
                border: "2px solid #f4f2f5",
                borderStyle: "dashed",
                borderRadius: "10px",
              }}
              w={"100%"}
            >
              <Box
                w={"100%"}
                p={16}
                style={{ border: "4px solid #57ca7a", borderRadius: "10px" }}
              >
                <Text size={"md"}>Success</Text>
                <Text size={28} color="#009600">
                  {" "}
                  {uploadData?.stats.success}
                </Text>
                <Text size={12} w={"100%"}>
                  Potential prospects
                </Text>
              </Box>
              <Box
                w={"100%"}
                p={16}
                style={{
                  borderRight: "2px solid #f4f2f5",
                  borderRightStyle: "dashed",
                }}
              >
                <Flex w={"100%"} align={"center"} justify={"space-between"}>
                  <Text>Queued</Text>
                  <IconRefresh size={18} />
                </Flex>
                <Text size={28} color="#f9b31c">
                  {" "}
                  {uploadData?.stats.queued}
                </Text>
                <Text size={12} w={"100%"}>
                  Potential identified
                </Text>
              </Box>
              <Box
                w={"100%"}
                p={16}
                style={{
                  borderRight: "2px solid #f4f2f5",
                  borderRightStyle: "dashed",
                }}
              >
                <Text>Failed</Text>
                <Text size={28} color="#fa5757">
                  {" "}
                  {uploadData?.stats.failed}
                </Text>
                <Text size={12} w={"100%"}>
                  Lorem Ipsurm
                </Text>
              </Box>
              <Box w={"100%"} p={16}>
                <Text>Disqualified</Text>
                <Text size={28} color="#717171">
                  {" "}
                  {uploadData?.stats.disqualified}
                </Text>
                <Text size={12} w={"100%"}>
                  Error Occurred
                </Text>
              </Box>
            </Flex>

            <Flex w={"100%"} align={"center"}>
              <Text fw={500} w={"100%"} size={20} style={{ width: "140px" }}>
                File Rows:{" "}
              </Text>
              <hr style={{ width: "100%", backgroundColor: "#f4f2f5" }} />
            </Flex>

            <DataTable
              withBorder
              height={"min(520px, 100vh - 240px)"}
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
              style={{
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
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
              records={data ?? []}
              // totalRecords={totalRecords.current}
              // recordsPerPage={PAGE_SIZE}
              // page={page}
              // onPageChange={(p) => setPage(p)}
              // paginationColor="teal"
              sortStatus={sortStatus}
              onSortStatusChange={handleSortStatusChange}
            />
            <Flex
              w={"100%"}
              justify={"space-between"}
              mt={-10}
              px={20}
              pt={45}
              pb={20}
              style={{
                border: "1px solid #dee2e6",
                borderBottomLeftRadius: "10px",
                borderBottomRightRadius: "10px",
              }}
            >
              <Select
                style={{ width: "150px" }}
                data={["Show 25 rows", "Show 5 rows", "Show 10 rows"]}
              />
              <Flex>
                <Select
                  style={{
                    width: "80px",
                  }}
                  data={["01", "02", "03", "04", "05", "06", "071"]}
                />
                <Text
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    borderRadius: "5px",
                    border: "1px solid #ced4da",
                    alignItems: "center",
                  }}
                  size={"sm"}
                  px={10}
                >
                  of {page} pages
                </Text>
                <Button variant="default" px={5}>
                  <IconArrowNarrowLeft />
                </Button>
                <Button variant="default" px={5}>
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
