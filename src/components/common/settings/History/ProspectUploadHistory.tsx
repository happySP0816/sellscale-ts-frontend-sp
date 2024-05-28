import {
  prospectUploadDrawerIdState,
  prospectUploadDrawerOpenState,
} from "@atoms/uploadAtoms";
import PageFrame from "@common/PageFrame";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Flex,
  Menu,
  NavLink,
  Progress,
  Select,
  Text,
  Title,
  Tooltip,
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
  IconSend,
  IconUserCircle,
} from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { valueToColor } from "@utils/general";
import { getProspectUploadHistory } from "@utils/requests/getProspectUploadHistory";
import { userTokenState } from "@atoms/userAtoms";
import UploadDetailsDrawer from "@drawers/UploadDetailsDrawer";
import {
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { data } from "@common/analytics/OverallPerformanceProgress/OverallPerformanceProgress";
import { useQuery } from "@tanstack/react-query";

interface UploadHistoryDataType {
  id: number;
  upload_date: string;
  upload_name: string;
  upload_size: number;
  uploads_completed: number;
  uploads_not_started: number;
  uploads_in_progress: number;
  uploads_failed: number;
  uploads_other: number;
  upload_source: "CSV" | "CONTACT_DB" | "LINKEDIN_LINK" | "TRIGGERS" | "UNKOWN";
  client_archetype_id: number;
  client_archetype_name: string;
  client_segment_id: number;
  client_segment_name: string;
  status: "UPLOAD_COMPLETE" | "UPLOAD_IN_PROGRESS";
}

export default function ProspectUploadHistory() {
  const userToken = useRecoilValue(userTokenState);
  const [opened, setOpened] = useRecoilState(prospectUploadDrawerOpenState);
  const [uploadID, setUploadID] = useRecoilState(prospectUploadDrawerIdState);

  const theme = useMantineTheme();

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-upload-history-all`],
    queryFn: async () => {
      const result = await getProspectUploadHistory(
        userToken,
        undefined,
        undefined
      );
      const d = result.data.history.map((d: UploadHistoryDataType) => {
        return {
          ...d,
          upload_date: handleDate(d.upload_date),
        };
      });
      return d as UploadHistoryDataType[];
    },
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 1000,
  });

  const handleDate = (date: string) => {
    const currentTime = moment(date).format("ddd, DD MMM YYYY HH:mm");
    return currentTime;
  };

  const columns = useMemo<MRT_ColumnDef<UploadHistoryDataType>[]>(
    () => [
      {
        accessorKey: "upload_name",
        header: "Upload Name",
        minSize: 400,
        maxSize: 400,
        Header: () => (
          <Flex align={"center"} gap={"3px"}>
            <IconLetterT color="gray" size={"0.9rem"} />
            <Text color="gray">Upload Name</Text>
          </Flex>
        ),
        Cell: ({ cell }) => {
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
              <Tooltip label={cell.row.original.upload_name}>
                <Text fw={600} size={"md"}>
                  {cell.row.original.upload_name?.length > 35
                    ? cell.row.original.upload_name.slice(0, 35) + "..."
                    : cell.row.original.upload_name}
                </Text>
              </Tooltip>
              <Tooltip label={cell.row.original.client_archetype_name}>
                {cell.row.original.client_archetype_name &&
                  cell.row.original.client_archetype_id && (
                    <Flex>
                      <Text
                        mr="3px"
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
                        Campaign:
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
                        {cell.row.original.client_archetype_name?.length > 35
                          ? cell.row.original.client_archetype_name.slice(
                              0,
                              35
                            ) + "..."
                          : cell.row.original.client_archetype_name}
                        <IconExternalLink size={"1.1rem"} />
                      </Text>
                    </Flex>
                  )}
              </Tooltip>
              <Tooltip label={cell.row.original.client_segment_name}>
                {cell.row.original.client_segment_name &&
                  cell.row.original.client_segment_id && (
                    <Flex direction={"row"}>
                      <Text
                        mr="3px"
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
                        Segment:
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
                        {cell.row.original.client_segment_name?.length > 35
                          ? cell.row.original.client_segment_name.slice(0, 35) +
                            "..."
                          : cell.row.original.client_segment_name}
                        <IconExternalLink size={"1.1rem"} />
                      </Text>
                    </Flex>
                  )}
              </Tooltip>
            </Flex>
          );
        },
      },
      {
        accessorKey: "upload_source",
        header: "Source",
        minSize: 100,
        maxSize: 100,
        Header: () => (
          <Flex align={"center"} gap={"3px"}>
            <IconLetterT color="gray" size={"0.9rem"} />
            <Text color="gray">Source</Text>
          </Flex>
        ),
        Cell: ({ cell }) => {
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
                size="md"
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
        accessorKey: "upload_size",
        header: "Progress",
        Header: () => (
          <Flex align={"center"} gap={"3px"}>
            <IconBolt color="gray" size={"0.9rem"} />
            <Text color="gray">Progress</Text>
          </Flex>
        ),
        maxSize: 300,
        minSize: 300,
        enableResizing: true,
        Cell: ({ cell }) => {
          const {
            upload_size,
            uploads_completed,
            uploads_in_progress,
            uploads_failed,
            uploads_other,
            uploads_not_started,
          } = cell.row.original;

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
                  value={Math.round((uploads_completed / upload_size) * 100)}
                  w={"100%"}
                  color={
                    Math.round((uploads_completed / upload_size) * 100) >= 100
                      ? "green"
                      : ""
                  }
                  sections={[
                    {
                      value: Math.round(
                        (uploads_completed / upload_size) * 100
                      ),
                      color: "green",
                      // label: "Complete",
                      tooltip: "Complete",
                    },
                    {
                      value: Math.round(
                        (uploads_in_progress / upload_size) * 100
                      ),
                      color: "yellow",
                      // label: "In Progress",
                      tooltip: "In Progress",
                    },
                    {
                      value: Math.round((uploads_failed / upload_size) * 100),
                      color: "red",
                      // label: "Failed",
                      tooltip: "Failed",
                    },
                    {
                      value: Math.round((uploads_other / upload_size) * 100),
                      color: "gray",
                      // label: "Other",
                      tooltip: "Other",
                    },
                    {
                      value: Math.round(
                        (uploads_not_started / upload_size) * 100
                      ),
                      color: "gray",
                      // label: "Not Started",
                      tooltip: "Not Started",
                    },
                  ]}
                />
                <Text
                  color={
                    Math.round(
                      ((uploads_completed +
                        uploads_in_progress +
                        uploads_failed +
                        uploads_other) /
                        upload_size) *
                        100
                    ) >= 100
                      ? "green"
                      : "#228be6"
                  }
                  fw={600}
                >
                  {Math.round(
                    ((uploads_completed +
                      uploads_in_progress +
                      uploads_failed +
                      uploads_other) /
                      upload_size) *
                      100
                  )}
                  %
                </Text>
              </Flex>
              <Flex align={"start"} direction={"column"} w={"100%"} px={"sm"}>
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
        accessorKey: "status",
        header: "Status",
        minSize: 150,
        maxSize: 150,
        Header: () => (
          <Flex align={"center"} gap={"3px"}>
            <IconLoader color="gray" size={"0.9rem"} />
            <Text color="gray">Status</Text>
          </Flex>
        ),
        Cell: ({ cell }) => {
          const { status } = cell.row.original;

          let status_formatted;
          if (status === "UPLOAD_COMPLETE") {
            status_formatted = "Complete";
          } else {
            status_formatted = "In Progress";
          }

          return (
            <Flex
              w={"100%"}
              h={"100%"}
              px={"sm"}
              align={"center"}
              justify={"center"}
            >
              <Badge
                size="lg"
                color={status === "UPLOAD_COMPLETE" ? "green" : ""}
              >
                {status_formatted}
              </Badge>
            </Flex>
          );
        },
      },
      {
        accessorKey: "upload_date",
        header: "Upload Date",
        Header: () => (
          <Flex align={"center"} gap={"3px"}>
            <IconCalendar color="gray" size={"0.9rem"} />
            <Text color="gray">Upload Date</Text>
          </Flex>
        ),
        enableResizing: true,
        minSize: 230,
        Cell: ({ cell }) => {
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
                {upload_date}
              </Text>
            </Flex>
          );
        },
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: data ?? [],
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
  });

  return (
    <Flex bg={"white"}>
      <MantineReactTable table={table} />
      <UploadDetailsDrawer />
    </Flex>
  );
}
