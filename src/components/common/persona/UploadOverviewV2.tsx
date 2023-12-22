import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Text,
  Card,
  Table,
  Pagination,
  TextInput,
  Box,
  Badge,
  Progress,
  useMantineTheme,
  Loader,
  Title,
  Flex,
  Group,
  Button,
  Accordion,
  Divider,
  NumberInput,
  Select,
  ActionIcon,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import {
  IconCalendar,
  IconChartArea,
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
  IconGlobe,
  IconSearch,
  IconSend,
  IconTarget,
  IconUpload,
} from "@tabler/icons";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import DOMPurify from "isomorphic-dompurify";
import moment from "moment";
import { Input } from "postcss";
import { DataGrid } from "mantine-data-grid";
import {
  IconCircle0Filled,
  IconCircleFilled,
  IconInfoSmall,
} from "@tabler/icons-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const getOrCreateLegendList = (chart: any, id: any) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer?.querySelector("ul");

  if (!listContainer) {
    listContainer = document.createElement("ul");
    listContainer.style.display = "flex";
    listContainer.style.flexDirection = "row";
    listContainer.style.margin = "0";
    listContainer.style.padding = "0";

    legendContainer?.appendChild(listContainer);
  }

  return listContainer;
};

const mocksData = ["Devops Engineer", "Security Engineer"];
const UploadOverviewV2 = () => {
  const [analytics, setAnalytics]: any = useState(null);
  const [currentPage, setCurrentPage]: any = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const userToken = useRecoilValue(userTokenState);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState("upload date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [period, setPeriod] = useState("24H");

  const [filteredBy, setFilteredBy] = useState("COMPANY_SIZE");

  const [graphType, setGraphType] = useState("CUMULATIVE");
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${API_URL}/analytics/client_upload_analytics`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + userToken,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.message === "Success") {
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch analytics data:", data.message);
        // Handle error case here
      }
    };

    fetchData();
  }, []);

  if (!analytics) {
    return (
      <Box w="100%" h="100%" sx={{ textAlign: "center" }}>
        <Loader ml="auto" mt="100px" mb="100px" />
      </Box>
    );
  }

  // Sorting logic
  const sortedAnalytics = analytics.uploads.sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Function to handle sorting

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const theme = useMantineTheme();

  // Search filter function
  const totalFilteredItems = sortedAnalytics.filter((item: any) => {
    return (
      item["upload name"].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item["upload date"].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item["account"].toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const lineChartData: ChartData<
    "bar",
    (number | [number, number] | null)[],
    unknown
  > = {
    labels: analytics.contacts_over_time.map((entry: any) => entry.x),
    datasets: [
      {
        label: "Cumulative Total of Prospects",
        data: analytics.contacts_over_time.map((entry: any) => entry.y),
        backgroundColor: theme.colors.blue[6],
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        type: "bar", // Specify 'bar' type for this dataset
        label: "Number of Uploads",
        data: analytics.contacts_over_time.map((entry: any) => entry.y), // Your uploads per day data
        backgroundColor: theme.colors.red[6],
      },
    ],
  };

  function getUploadName(uploadName: any) {
    return String(uploadName).replace(
      new RegExp(searchQuery, "gi"),
      (match: any) =>
        `<span style="background-color: ${theme.colors.yellow[1]}">${match}</span>`
    );
  }

  return (
    <Container pt="lg" pb="xl">
      {/* Section 1: Top Line Metrics with Icons */}
      <Grid>
        <Grid.Col span={4}>
          <Card withBorder padding="md">
            <Flex align={"center"} justify={"center"} gap={"xs"}>
              <Text align="center">
                <Text component="span" fw={700}>
                  {analytics.top_line_scraped.toLocaleString()}
                </Text>{" "}
                <Text color="gray" component="span" fw={600}>
                  Companies
                </Text>
              </Text>
              <ThemeIcon radius="xl" size="xs" color="yellow">
                <IconInfoSmall />
              </ThemeIcon>
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder padding="md">
            <Flex align={"center"} justify={"center"} gap={"xs"}>
              <Text align="center">
                <Text component="span" fw={700}>
                  {analytics.top_line_uploaded.toLocaleString()}
                </Text>{" "}
                <Text color="gray" component="span" fw={600}>
                  Contacts
                </Text>
              </Text>
              <ThemeIcon radius="xl" size="xs" color="yellow">
                <IconInfoSmall />
              </ThemeIcon>
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card withBorder padding="md">
            <Flex align={"center"} justify={"center"} gap={"xs"}>
              <Text align="center">
                <Text component="span" fw={700}>
                  {analytics.top_line_scored.toLocaleString()}
                </Text>{" "}
                <Text color="gray" component="span" fw={600}>
                  In-networks
                </Text>
              </Text>
              <ThemeIcon radius="xl" size="xs" color="yellow">
                <IconInfoSmall />
              </ThemeIcon>
            </Flex>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Section 2: Line Graph */}
      <Flex justify={"space-between"} mt={"sm"}>
        <Title order={3}>Outreach TAM</Title>
        <Flex align={"center"} gap={"sm"}>
          <Flex gap={"sm"}>
            <Flex align={"center"}>
              <IconCalendar
                size={"0.9rem"}
                color={theme.colors.blue[theme.fn.primaryShade()]}
              />
              <Text ml={"xs"} size="xs" color="gray">
                Period:{" "}
              </Text>
            </Flex>
            <Group spacing="0" bg={"white"}>
              <Button
                variant="outline"
                color={period === "24H" ? "blue" : "gray"}
                size="xs"
                onClick={() => setPeriod("24H")}
                sx={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRightWidth: period === "24H" ? 1 : 0,
                }}
              >
                24H
              </Button>
              <Button
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeftWidth: period === "ALL_TIME" ? 1 : 0,
                }}
                variant="outline"
                size="xs"
                onClick={() => setPeriod("ALL_TIME")}
                color={period === "ALL_TIME" ? "blue" : "gray"}
              >
                All time
              </Button>
            </Group>
          </Flex>
          |
          <Flex gap={"sm"}>
            <Flex align={"center"}>
              <IconChartBar
                size={"0.9rem"}
                color={theme.colors.blue[theme.fn.primaryShade()]}
              />
              <Text ml={"xs"} size="xs" color="gray">
                Graph Type:{" "}
              </Text>
            </Flex>
            <Group spacing="0">
              <Button
                sx={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRightWidth: graphType === "CUMULATIVE" ? 1 : 0,
                }}
                variant="outline"
                color={graphType === "CUMULATIVE" ? "blue" : "gray"}
                size="xs"
                onClick={() => setGraphType("CUMULATIVE")}
              >
                Cumulative
              </Button>
              <Button
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderLeftWidth: graphType === "AGGREGATE" ? 1 : 0,
                }}
                variant="outline"
                size="xs"
                onClick={() => setGraphType("AGGREGATE")}
                color={graphType === "AGGREGATE" ? "blue" : "gray"}
              >
                Aggregate
              </Button>
            </Group>
          </Flex>
        </Flex>
      </Flex>

      <Grid mt={"sm"}>
        <Grid.Col span={8}>
          <Card>
            <Bar
              height={200}
              data={lineChartData}
              options={{
                // maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    // onClick: (evt, legendItem, legend) => {
                    //   const index = legend.chart.data.datasets.indexOf(
                    //     (s: any) => s.label === legendItem.text
                    //   ) as number;

                    //   legend.chart.toggleDataVisibility(0);
                    //   legend.chart.update();
                    // },
                    // labels: {
                    //   useBorderRadius: true,
                    //   borderRadius: 999,
                    //   boxWidth: 12,
                    //   boxHeight: 12,
                    //   usePointStyle: true,
                    //   generateLabels: (chart) =>
                    //     chart.data.datasets?.map((dataset, idx) => {
                    //       return {
                    //         text: dataset.label as string,
                    //         strokeStyle: dataset.borderColor,
                    //         fillStyle: dataset.backgroundColor,
                    //         hidden: false,
                    //       };
                    //     }) || [],
                    // },
                  },
                  title: {
                    display: false,
                  },
                },

                responsive: true,
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      lineWidth: 0,
                    },
                  },
                  y: {
                    stacked: true,
                  },
                },
              }}
            />

            <Flex justify={"center"} align={"center"} mt={"sm"}>
              <Text color="gray" fw={700} fz={"sm"}>
                Filter by: &nbsp;
              </Text>
              <Group spacing="sm">
                <Button
                  px={16}
                  radius={"12rem"}
                  variant="outline"
                  compact
                  color={filteredBy === "COMPANY_SIZE" ? "blue" : "gray"}
                  size="xs"
                  onClick={() => setFilteredBy("COMPANY_SIZE")}
                >
                  Company Size
                </Button>
                <Button
                  px={16}
                  radius={"12rem"}
                  variant="outline"
                  compact
                  color={filteredBy === "INDUSTRY" ? "blue" : "gray"}
                  size="xs"
                  onClick={() => setFilteredBy("INDUSTRY")}
                >
                  Industry
                </Button>
              </Group>
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card
            p={0}
            sx={(theme) => ({
              border: `1px solid ${theme.colors.gray[4]}`,
            })}
          >
            <Accordion
              defaultValue="customization"
              p={0}
              styles={(theme) => ({
                content: {
                  padding: 0,
                  "&[data-active]": {
                    backgroundColor: theme.white,
                  },
                },
                chevron: {
                  margin: 0,
                },
                label: {
                  fontSize: theme.fontSizes.sm,

                  padding: 0,
                },
                panel: {
                  padding: "8px",
                },
                control: {
                  padding: 8,
                  backgroundColor: theme.colors.gray[0],
                  "&[data-active]": {
                    backgroundColor: theme.white,
                    borderBottom: `1px dashed ${theme.colors.gray[2]}`,
                  },
                },
                root: {
                  border: `1px solid red`,
                },
              })}
            >
              <Accordion.Item value="Top_Tiers" p={0}>
                <Accordion.Control>Top Tiers</Accordion.Control>
                <Accordion.Panel p={0}>
                  {mocksData.map((i, idx) => (
                    <>
                      <Box>
                        <Flex p={8}>
                          <Text size="sm" align="left">
                            {i}
                          </Text>
                          <Text size="sm">&nbsp;200</Text>
                        </Flex>
                        {idx !== mocksData.length - 1 && <Divider></Divider>}
                      </Box>
                    </>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="Top_Companies" p={0}>
                <Accordion.Control>Top Companies</Accordion.Control>
                <Accordion.Panel p={0}>
                  {mocksData.map((i, idx) => (
                    <>
                      <Box>
                        <Flex p={8}>
                          <Text size="sm" align="left">
                            {i}
                          </Text>
                          <Text size="sm">&nbsp;200</Text>
                        </Flex>
                        {idx !== mocksData.length - 1 && <Divider></Divider>}
                      </Box>
                    </>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="Top_Industries" p={0}>
                <Accordion.Control>Top Industries</Accordion.Control>
                <Accordion.Panel p={0}>
                  {mocksData.map((i, idx) => (
                    <>
                      <Box>
                        <Flex p={8}>
                          <Text size="sm" align="left">
                            {i}
                          </Text>
                          <Text size="sm">&nbsp;200</Text>
                        </Flex>
                        {idx !== mocksData.length - 1 && <Divider></Divider>}
                      </Box>
                    </>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Card>
        </Grid.Col>
      </Grid>

      <Box mt={"sm"}>
        <Flex justify={"space-between"}>
          <Title order={3}>Scaping Reported</Title>

          <TextInput />
        </Flex>

        <Paper radius={"8px"} shadow="lg" mt={"sm"}>
          <DataGrid
            data={totalFilteredItems}
            highlightOnHover
            withPagination
            withSorting
            withBorder
            sx={{ cursor: "pointer" }}
            columns={[
              {
                accessorKey: "upload name",
                header: "Upload Name",
                cell: (cell) => {
                  const cellValue = String(cell.cell?.getValue<string>());
                  return (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          getUploadName(
                            cellValue.substring(0, 45) +
                              (cellValue.length > 45 ? "..." : "") || ""
                          )
                        ),
                      }}
                    />
                  );
                },
              },
              {
                accessorKey: "scraped",
                header: "scraped",
                cell: (cell) => {
                  return (
                    <Flex w={"100%"} direction={"column"} gap={"xs"}>
                      <Progress value={100} color="blue" w={"100%"} h={4} />

                      <Text fz={"sm"}>
                        <Text component="span" fw={700}>
                          {cell.cell?.getValue<string>()}
                        </Text>{" "}
                        out of {cell.cell?.getValue<string>()}
                      </Text>
                    </Flex>
                  );
                  return <Text size="xs">{cell.cell?.getValue<string>()}</Text>;
                },
              },
              {
                accessorKey: "status",
                header: "Status",
                cell: (cell) => {
                  return (
                    <Badge size="xs">{cell.cell?.getValue<string>()}</Badge>
                  );
                },
              },
              {
                accessorKey: "upload date",
                header: "Upload date",
                cell: (cell) => {
                  return (
                    <Flex direction={"column"} gap={"xs"}>
                      <Text size="xs" fw={700}>
                        {moment(cell.cell?.getValue<string>()).format(
                          "ddd MMM D, YYYY"
                        )}
                      </Text>
                      <Text size="xs" fw={700} color="gray">
                        {moment(cell.cell?.getValue<string>()).format(
                          "H:mm:ss"
                        )}{" "}
                        GMT
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
                  pb={"1.25rem"}
                >
                  <Flex align={"center"} gap={"sm"}>
                    <Text fw={700} color="gray">
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
                height: "44px",
                backgroundColor: theme.colors.gray[0],
                "::after": {
                  backgroundColor: "transparent",
                },
              },
              dataCellContent: {
                width: "100%",
                display: "flex",
                alignItems: "center",

                whiteSpace: "normal",
              },
            })}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadOverviewV2;
