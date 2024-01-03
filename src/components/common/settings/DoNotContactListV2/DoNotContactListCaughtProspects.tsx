import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Card,
  Container,
  Title,
  Text,
  Button,
  Flex,
  Loader,
  Table,
  Box,
  Collapse,
  Pagination,
  Badge,
  useMantineTheme,
  ActionIcon,
  Anchor,
  Avatar,
  NumberInput,
  Select,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconExternalLink,
  IconRefresh,
} from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Prospect } from "src";
import { openConfirmModal } from "@mantine/modals";
import displayNotification from "@utils/notificationFlow";
import { truncate } from "lodash";
import { deterministicMantineColor } from "@utils/requests/utils";
import { DataGrid, stringFilterFn } from "mantine-data-grid";
import { proxyURL } from "@utils/general";

export default function DoNotContactListCaughtProspects(props: {
  forSDR?: boolean;
  needsSave?: boolean;
  caughtProspects: any[];
  setCaughtProspects: React.Dispatch<React.SetStateAction<never[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { caughtProspects, setCaughtProspects, loading, setLoading } = props;
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();
  const [fetchedCaughtProspects, setFetchedCaughtProspects] = useState(false); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Adjust as needed

  // Calculate the total number of pages

  // Slice data for the current page
  const paginatedProspects = caughtProspects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCaughtProspects = async () => {
    setLoading(true);
    const res = await fetch(
      `${API_URL}/client${
        props.forSDR ? `/sdr` : ``
      }/do_not_contact_filters/caught_prospects`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const resp = await res.json();
    const prospects = resp.prospects;
    setCaughtProspects(prospects);
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchedCaughtProspects) {
      fetchCaughtProspects();
      setFetchedCaughtProspects(true);
    }
  }, [fetchedCaughtProspects]);

  return (
    <Box>
      {loading && <Loader variant="dots" />}

      {!loading && (
        <DataGrid
          data={caughtProspects}
          highlightOnHover
          withPagination
          withBorder
          sx={{ cursor: "pointer" }}
          mt={"lg"}
          columns={[
            {
              accessorKey: "full_name",
              header: "Prospect Name",
              maxSize: 400,
              cell: (cell) => {
                const row = cell.row.original;

                return (
                  <Flex align={"center"} gap="sm">
                    <Avatar src={proxyURL(row.image_url)} />
                    <Text fw={700} size={"sm"}>
                      {row.full_name}
                    </Text>
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
            },
            {
              accessorKey: "company",
              header: "Company",
              enableSorting: false,
              cell: (cell) => {
                const text = cell.cell.getValue<string>();

                return (
                  <Flex align={"center"} h={"100%"}>
                    <Text fw={700} size={"sm"}>
                      {text}
                    </Text>
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
            },

            {
              accessorKey: "title",
              header: "Title",
              enableSorting: false,
              maxSize: 600,
              enableResizing: true,
              cell: (cell) => {
                const text = cell.cell.getValue<string>();

                return (
                  <Flex align={"center"} h={"100%"}>
                    <Text fw={700} size={"sm"}>
                      {text}
                    </Text>
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
            },

            {
              accessorKey: "industry",
              header: "Industry",
              enableSorting: false,
              cell: (cell) => {
                const text = cell.cell.getValue<string>();

                return (
                  <Flex align={"center"} h={"100%"}>
                    <Text fw={700} size={"sm"}>
                      {text}
                    </Text>
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
            },
            {
              accessorKey: "overall_status",
              header: "Status",
              enableSorting: false,
              maxSize: 150,
              cell: (cell) => {
                const text = cell.cell.getValue<string>();

                return (
                  <Flex align={"center"} h={"100%"}>
                    <Badge fw={700} size={"sm"}>
                      {text}
                    </Badge>
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
            },

            {
              accessorKey: "matched_filter_words",
              header: "Matched Filters",
              enableSorting: false,
              cell: (cell) => {
                const texts = cell.cell.getValue<string[]>();

                return (
                  <Flex
                    h={"100%"}
                    gap={"xs"}
                    wrap={"wrap"}
                    my={"auto"}
                    align={"center"}
                  >
                    {texts?.map((x: string) => (
                      <Badge color={"gray"} variant="outline" size="xs">
                        ⚠️ {x}
                      </Badge>
                    ))}
                  </Flex>
                );
              },
              filterFn: stringFilterFn,
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
                bg={"white"}
                py={"1.25rem"}
                sx={(theme) => ({
                  border: `1px solid ${theme.colors.gray[4]}`,
                  borderTopWidth: 0,
                })}
              >
                <Flex align={"center"} gap={"sm"}>
                  <Text fw={700} size={"sm"} color="gray.6">
                    Show
                  </Text>

                  <Flex align={"center"}>
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
                        marginLeft: "-2px",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "0.25rem",
                      })}
                      h={36}
                    >
                      <Text color="gray.5" fw={700} fz={14}>
                        of {table.getPrePaginationRowModel().rows.length}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

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
                      <Text color="gray.5" fw={700} fz={14}>
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
          pageSizes={["20"]}
          styles={(theme) => ({
            thead: {
              backgroundColor: theme.colors.gray[0],
              "::after": {
                backgroundColor: "transparent",
              },
            },
            th: {
              paddingTop: `${rem(20)} !important`,
              paddingBottom: `${rem(20)} !important`,
            },
            tbody: {
              backgroundColor: "white",
            },

            wrapper: {
              gap: 0,
              marginTop: "0 !important",
            },
            scrollArea: {
              paddingBottom: 0,
              gap: 0,
            },

            dataCellContent: {
              width: "100%",
              whiteSpace: "normal",
            },
          })}
        />
      )}
    </Box>
  );
}
