import { prospectUploadDrawerIdState, prospectUploadDrawerOpenState } from "@atoms/uploadAtoms";
import PageFrame from "@common/PageFrame";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  NavLink,
  Progress,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBolt,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconLetterT,
  IconLoader,
} from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import moment from "moment";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { valueToColor } from "@utils/general";
import { getProspectUploadHistory } from "@utils/requests/getProspectUploadHistory";
import { userTokenState } from "@atoms/userAtoms";
import UploadDetailsDrawer from "@drawers/UploadDetailsDrawer";

interface UploadHistoryDataType {
  id: number;
  upload_date: string;
  upload_name: string;
  upload_size: number;
  uploads_completed: number;
  upload_source: "CSV" | "CONTACT_DB" | "LINKEDIN_LINK" | "TRIGGERS" | "UNKOWN";
  client_archetype_id: number;
  client_archetype_name: string;
  client_segment_id: number;
  client_segment_name: string;
  status: "UPLOAD_COMPLETE" | "UPLOAD_IN_PROGRESS";
}

export default function ProspectUploadHistory() {
  const userToken = useRecoilValue(userTokenState);
  const [opened, setOpened] = useRecoilState(
    prospectUploadDrawerOpenState
  );
  const [uploadID, setUploadID] = useRecoilState(
    prospectUploadDrawerIdState
  );
  const [pageSize, setPageSize] = useState("25");

  const theme = useMantineTheme();

  const [uploadHistoryData, setUploadHistoryData] = useState<
    UploadHistoryDataType[]
  >([]);
  const triggerGetProspectUploadHistory = async () => {
    const result = await getProspectUploadHistory(
      userToken,
      undefined,
      undefined
    );
    setUploadHistoryData(result.data.history);
  };

  useEffect(() => {
    triggerGetProspectUploadHistory();
  }, []);

  const handleDate = (date: string) => {
    const currentTime = moment(date).format("ddd, DD MMM YYYY HH:mm");
    return currentTime;
  };

  return (
    <Flex bg={"white"} my={"xl"} maw='100%'>
      <DataGrid
        data={uploadHistoryData}
        highlightOnHover
        withPagination
        withSorting
        withColumnBorders
        withBorder
        sx={{
          cursor: "pointer",
          "& .mantine-10xyzsm>tbody>tr>td": {
            padding: "0px",
          },
          "& tr": {
            background: "white",
          },
        }}
        columns={[
          {
            accessorKey: "any",
            minSize: 400,
            maxSize: 400,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Upload Name</Text>
              </Flex>
            ),
            cell: (cell) => {
              return (
                <Flex
                  direction={"column"}
                  gap={"5px"}
                  w={"100%"}
                  h={"100%"}
                  py={"xs"}
                  px={"md"}
                  align={"start"}
                  justify={"center"}
                >
                  <Text fw={600} size={"md"}>
                    {cell.row.original.upload_name}
                  </Text>
                  {cell.row.original.client_archetype_name &&
                    cell.row.original.client_archetype_id && (
                      <Flex>
                        <Text
                          mr='3px'
                          sx={{
                            borderRadius: "16px",
                            height: "1.3rem",
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                          size={"xs"}
                          fw={600}
                        >
                          Associated Campaign: 
                        </Text>
                        <Text
                          sx={{
                            borderRadius: "16px",
                            height: "1.3rem",
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                          underline
                          onClick={() => {
                            window.location.href = "/overview";
                          }}
                          size={"xs"}
                          color="#228be6"
                          fw={600}
                        >
                          {cell.row.original.client_archetype_name}
                          <IconExternalLink size={"1.1rem"} />
                        </Text>
                      </Flex>
                    )}
                  {cell.row.original.client_segment_name &&
                    cell.row.original.client_segment_id && (
                      <Flex direction={'row'}>
                        <Text
                          mr='3px'
                          sx={{
                            borderRadius: "16px",
                            height: "1.3rem",
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                          size={"xs"}
                          fw={600}
                        >
                          Associated Segment: 
                        </Text>
                        <Text
                          sx={{
                            borderRadius: "16px",
                            height: "1.3rem",
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                          underline
                          onClick={() => {
                            window.location.href = "/overview";
                          }}
                          size={"xs"}
                          color="#228be6"
                          fw={600}
                        >
                          {cell.row.original.client_segment_name}
                          <IconExternalLink size={"1.1rem"} />
                        </Text>
                      </Flex>
                    )}
                </Flex>
              );
            },
          },
          {
            accessorKey: "source",
            minSize: 150,
            maxSize: 150,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Source</Text>
              </Flex>
            ),

            cell: (cell) => {
              const { upload_source } = cell.row.original;
              
              // Turn the upload_source into Letter Case
              let upload_source_formatted = upload_source.replace(/_/g, " ");

              return (
                <Flex
                  w={"100%"}
                  px={"sm"}
                  h={"100%"}
                  align={"center"}
                  justify={"center"}
                >
                  {/* <Text lineClamp={1}>{upload_source}</Text> */}
                  {/* <Badge size='lg' color={valueToColor(theme, upload_source)}> */}
                  <Badge
                    size="sm"
                    variant="filled"
                    color={
                      upload_source === "CSV"
                        ? "gray"
                        : upload_source === "LINKEDIN_LINK"
                        ? "blue"
                        : upload_source === "CONTACT_DB"
                        ? "teal"
                        : upload_source === "TRIGGERS"
                        ? "orange"
                        : "teal"
                    }
                  >
                    {upload_source_formatted}
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "Progress",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconBolt color="gray" size={"0.9rem"} />
                <Text color="gray">Progress</Text>
              </Flex>
            ),
            maxSize: 280,
            minSize: 280,
            enableResizing: true,
            cell: (cell) => {
              const { upload_size, uploads_completed, upload_source } =
                cell.row.original;

              return (
                <Flex
                  direction={"column"}
                  align={"center"}
                  justify={"center"}
                  w={"100%"}
                  h={"100%"}
                  py={"sm"}
                >
                  <Flex
                    w={"100%"}
                    align={"center"}
                    justify={"flex-start"}
                    gap={"8px"}
                    px={"xs"}
                  >
                    <Progress
                      value={Math.round(
                        (uploads_completed / upload_size) * 100
                      )}
                      w={"100%"}
                      color={
                        Math.round((uploads_completed / upload_size) * 100) >=
                        100
                          ? "green"
                          : ""
                      }
                    />
                    <Text
                      color={
                        Math.round((uploads_completed / upload_size) * 100) >=
                        100
                          ? "green"
                          : "#228be6"
                      }
                      fw={600}
                    >
                      {Math.round((uploads_completed / upload_size) * 100)}%
                    </Text>
                  </Flex>
                  <Flex
                    align={"start"}
                    direction={"column"}
                    w={"100%"}
                    px={"sm"}
                  >
                    <Flex gap={"xs"}>
                      <Text fw={500}>
                        {uploads_completed} / {upload_size}
                      </Text>
                      <Text
                        color="gray"
                        fw={500}
                        style={{ color: "gray !important" }}
                      >
                        Uploaded
                      </Text>
                    </Flex>
                    <Text
                      underline
                      onClick={() => {
                        setOpened(true);
                        setUploadID(cell.row.original.id);
                      }}
                      color="#228be6"
                      fw={600}
                    >
                      View Details
                    </Text>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "Status",
            minSize: 150,
            maxSize: 150,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLoader color="gray" size={"0.9rem"} />
                <Text color="gray">Status</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { status } = cell.row.original;

              let status_formatted
              if (status === "UPLOAD_COMPLETE") {
                status_formatted = "Complete"
              } else {
                status_formatted = "In Progress"
              }

              return (
                <Flex
                  w={"100%"}
                  h={"100%"}
                  px={"sm"}
                  align={"center"}
                  justify={"center"}
                >
                  <Badge size="sm" color={status === "UPLOAD_COMPLETE" ? "green" : ""}>
                    {status_formatted}
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "upload_date",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconCalendar color="gray" size={"0.9rem"} />
                <Text color="gray">Upload Date</Text>
              </Flex>
            ),
            enableResizing: true,
            minSize: 230,
            cell: (cell) => {
              const { upload_date } = cell.row.original;

              return (
                <Flex
                  align={"center"}
                  gap={"xs"}
                  py={"sm"}
                  w={"100%"}
                  h={"100%"}
                  justify={"center"}
                >
                  <Text color="gray" fw={500}>
                    {handleDate(upload_date)}
                  </Text>
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
              justify={"space-between"}
              align={"center"}
              px={"sm"}
              py={"1.25rem"}
              sx={(theme) => ({
                border: `1px solid ${theme.colors.gray[4]}`,
                borderTopWidth: 0,
              })}
            >
              <Select
                style={{ width: "150px" }}
                data={[
                  { label: "Show 25 rows", value: "25" },
                  { label: "Show 10 rows", value: "10" },
                  { label: "Show 5 rows", value: "5" },
                ]}
                value={pageSize}
                onChange={(v) => {
                  setPageSize(v ?? "25");
                }}
              />
              <Flex align={"center"} gap={"sm"}>
                <Flex align={"center"}>
                  <Select
                    maw={100}
                    value={`${table.getState().pagination.pageIndex + 1}`}
                    data={new Array(table.getPageCount())
                      .fill(0)
                      .map((i, idx) => ({
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
                      marginLeft: "-2px",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0.25rem",
                    })}
                    h={36}
                  >
                    <Text color="gray.5" fw={500} fz={14}>
                      of {table.getPageCount()} pages
                    </Text>
                  </Flex>
                  <ActionIcon
                    variant="default"
                    color="gray.4"
                    h={36}
                    disabled={table.getState().pagination.pageIndex === 0}
                    onClick={() => {
                      table.setPageIndex(
                        table.getState().pagination.pageIndex - 1
                      );
                    }}
                  >
                    <IconChevronLeft stroke={theme.colors.gray[4]} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    color="gray.4"
                    h={36}
                    disabled={
                      table.getState().pagination.pageIndex ===
                      table.getPageCount() - 1
                    }
                    onClick={() => {
                      table.setPageIndex(
                        table.getState().pagination.pageIndex + 1
                      );
                    }}
                  >
                    <IconChevronRight stroke={theme.colors.gray[4]} />
                  </ActionIcon>
                </Flex>
              </Flex>
            </Flex>
          ),
        }}
        w={"100%"}
        pageSizes={[pageSize]}
        styles={(theme) => ({
          thead: {
            height: "44px",
            backgroundColor: theme.colors.gray[0],
            "::after": {
              backgroundColor: "transparent",
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
            width: "100%",
          },
        })}
      />
      <UploadDetailsDrawer />
    </Flex>
  );
}
