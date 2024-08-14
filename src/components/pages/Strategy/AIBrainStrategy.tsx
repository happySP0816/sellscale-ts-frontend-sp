import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Flex,
  HoverCard,
  Loader,
  Paper,
  Popover,
  Select,
  Text,
  Title,
  useMantineTheme
} from "@mantine/core";
import {openContextModal} from "@mantine/modals";
import {
  Icon123,
  IconBulb,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconLoader,
  IconPencil,
  IconPlus,
  IconTargetArrow,
  IconToggleLeft,
  IconTrash,
} from "@tabler/icons";
import {IconLighter} from "@tabler/icons-react";
import {DataGrid} from "mantine-data-grid";
import {useEffect, useMemo, useRef, useState} from "react";
import {useStrategiesApi} from "./StrategyApi";
import {useRecoilValue} from "recoil";
import {userTokenState} from "@atoms/userAtoms";

import {Line} from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import {ShapeUtils} from "three";
import area = ShapeUtils.area;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  // Title,
  Tooltip,
  Legend,
  Filler // 1. Register Filler plugin
);

export default function AIBrainStrategy() {
  const theme = useMantineTheme();
  const [udPageSize, setUdPageSize] = useState("25");
  const userToken = useRecoilValue(userTokenState);
  const [fetchingStrategies, setFetchingStrategies] = useState(false);

  const {
    isLoading,
    getAllSubscriptions,
    postCreateStrategy,
    getStrategy,
    patchUpdateStrategy,
    postAddArchetypeMapping,
    deleteRemoveArchetypeMapping,
    getAllStrategies,
    deleteStrategy,
  } = useStrategiesApi(userToken);

  const [strategies, setStrategies] = useState([]);

  const handleGetAllStrategies = async () => {
    setFetchingStrategies(true);
    const response = await getAllStrategies();
    setStrategies(response);
    setFetchingStrategies(false);
  };

  const generateLabelsAndData = useMemo(() => {
    if (strategies.length === 0) {
      return { labels: [], maxRateData: [], rateByStrategyData: [] };
    }
    const maxRateByMonth = new Map<number, number>();
    const rateByStrategyData: {name: string, rate: number, month: number}[] = [];

    strategies.map((strategy: any) => {
      const posResponse = strategy.num_pos_response;
      const numSent = strategy.num_sent;
      const monthNumber = new Date(strategy.start_date).getMonth();

      const strategyRate =  numSent ? (posResponse / numSent) * 100 : 0;
      rateByStrategyData.push({name: "" + strategy.title, rate: strategyRate, month: monthNumber});

      if (maxRateByMonth.has(monthNumber)) {
        if (strategyRate > maxRateByMonth.get(monthNumber)!) {
          maxRateByMonth.set(monthNumber, strategyRate);
        }
      } else {
        maxRateByMonth.set(monthNumber, strategyRate);
      }
    });

    if (maxRateByMonth.size === 0) {
      return { labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], maxRateData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rateByStrategyData: [] }
    }

    const maxMonth = Math.max(...Array.from(maxRateByMonth.keys()));

    const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].slice(0, maxMonth + 1);
    const maxRateData: number[] = [];

    for (let i = 0; i <= maxMonth; i++) {
      maxRateData.push(maxRateByMonth.get(i) ?? 0);
    }

    return { labels, maxRateData, rateByStrategyData };
  }, [strategies]);

  useEffect(() => {
    handleGetAllStrategies();
  }, [userToken]);

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
          display: true,
        },
      },
    },
  };

  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Dataset 1",
        data: [120, 150, 200, 40, 79, 20, 100],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 0, 0)",
        fill: {
          target: "origin",
          above: "rgba(255, 0, 0, 0.3)",
        },
      },
    ],
  };

  return (
    <Box>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={3}>Strategy Log</Title>
        {fetchingStrategies && <Loader />}
        <Button
          leftIcon={<IconPlus size={"0.9rem"} />}
          onClick={() => {
            openContextModal({
              modal: "createStrategy",
              title: (
                <Flex align={"center"} gap={"sm"}>
                  <IconBulb color="#228be6" size={"1.6rem"} />
                  <Title order={2}>Create Strategy</Title>
                </Flex>
              ),
              innerProps: {
                onSubmit: async (title: string, description: string, archetypes: number[], startDate: Date, endDate: Date) => {
                  const response = await postCreateStrategy(title, description, archetypes, startDate, endDate);
                  handleGetAllStrategies();
                },
              },
              size: '80%',
            });
          }}
        >
          New Strategy
        </Button>
      </Flex>
      <Paper h={350} w={"100%"} p={"lg"} mt={"md"}>
        <AreaChart dataAndLabels={generateLabelsAndData} />
      </Paper>
      <Paper>
        <DataGrid
          data={strategies}
          highlightOnHover
          mt={"sm"}
          withPagination
          withSorting
          withColumnBorders
          withBorder
          sx={{
            cursor: "pointer",
            "& tr": {
              background: "white",
            },
          }}
          columns={[
            {
              accessorKey: "strategy",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <Icon123 color="gray" size={"0.9rem"} />
                  <Text color="gray">Strategy</Text>
                </Flex>
              ),
              minSize: 50,
              maxSize: 140,
              cell: (cell: any) => {
                const { title, description } = cell.row.original;
                return (
                  <Box h={"100%"} ml={0} pl={0}>
                    <Text size={"sm"} fw={700} align="center">
                      {cell.row.index + 1}
                    </Text>
                  </Box>
                );
              },
            },
            {
              accessorKey: "strategy_title",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconBulb color="gray" size={"0.9rem"} />
                  <Text color="gray">Strategy Title</Text>
                </Flex>
              ),
              minSize: 220,
              maxSize: 340,
              cell: (cell: any) => {
                const { title, description, start_date: startDate, end_date: endDate } = cell.row.original;

                const startDateConverted = new Date(startDate);

                const formattedStartDate = startDateConverted.toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                });

                const endDateConverted = new Date(endDate);

                const formattedEndDate = endDateConverted.toLocaleDateString('en-US', {
                  timeZone: 'UTC',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                });

                return (
                  <Box h={"100%"} ml={0} pl={0} w={200}>
                    <Text size={"sm"} fw={700}>
                      {title}
                    </Text>
                    <Text mt={0} color="gray" size={"10px"}>
                      {description?.replace(/<[^>]*>/g, " ")?.slice(0, 60)}
                    </Text>
                    <Text mt={0} color="gray" size={"10px"}>
                      {description?.replace(/<[^>]*>/g, " ")?.slice(60, 120)}
                    </Text>
                    <Text mt={0} color="gray" size={"10px"}>
                      {description?.replace(/<[^>]*>/g, " ")?.slice(120, 160)}
                    </Text>
                    <Flex gap={"xs"} mt={"sm"}>
                      <Text size={"10px"} fw={500} color="gray">
                        First Sent Date: <span className="text-black">{formattedStartDate}</span>
                      </Text>
                      <Text size={"10px"} fw={500} color="gray">
                        Last Sent Date: <span className="text-black">{formattedEndDate}</span>
                      </Text>
                    </Flex>
                    {
                      <HoverCard shadow="md" withinPortal position="right">
                        <HoverCard.Target>
                          <Text size={"xs"} fw={500} color="gray" mt={6} className=" font-semibold">
                            Read More
                          </Text>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <Text size={"sm"} maw={200}>
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                          </Text>
                        </HoverCard.Dropdown>
                      </HoverCard>
                    }
                  </Box>
                );
              },
            },
            {
              accessorKey: "tagged_campaigns",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconTargetArrow color="gray" size={"0.9rem"} />
                  <Text color="gray">Tagged Campaigns</Text>
                </Flex>
              ),
              cell: (cell: any) => {
                const { archetypes } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} align={"center"}>
                    <Box>
                      {archetypes?.slice(0, 4).map((item: any, index: number) => {
                        return (
                          <Text lineClamp={1} fw={600} key={index} className="">
                            {item.emoji} {item.archetype}
                          </Text>
                        );
                      })}
                      {archetypes?.length > 4 && (
                        <HoverCard shadow="md" withinPortal>
                          <HoverCard.Target>
                            <Text size={"sm"} fw={500} color="gray" mt={6} className=" font-semibold">
                              +{archetypes?.length - 4} more
                            </Text>
                          </HoverCard.Target>
                          <HoverCard.Dropdown>
                            {archetypes.slice(4).map((item: any, index: number) => (
                              <Text key={index} size={"sm"} fw={600}>
                                {item.emoji} {item.archetype}
                              </Text>
                            ))}
                          </HoverCard.Dropdown>
                        </HoverCard>
                      )}
                    </Box>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "cumulative_analysis",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLighter color="gray" size={"0.9rem"} />
                  <Text color="gray">Cumulative Analysis</Text>
                </Flex>
              ),
              maxSize: 200,
              enableResizing: true,
              cell: (cell: any) => {
                const { num_pos_response, num_demo, num_sent } = cell.row.original;

                return (
                  <Box py={"sm"} w={"100%"} h={"100%"}>
                    <Flex>
                      <Text color="blue" size={"sm"} fw={500}>
                        <span className=" font-bold">{num_sent} </span>
                        Sent
                      </Text>
                      <Text color="gray" size={"xs"} fw={500} ml="xs">
                        (100%)
                      </Text>
                    </Flex>
                    <Flex>
                      <Text color="green" size={"sm"} fw={500}>
                        <span className=" font-bold">{num_pos_response}</span> (+) Responses
                      </Text>
                      <Text color="gray" size={"xs"} fw={500} ml="xs">
                        ({((num_pos_response / (num_sent + 0.0001)) * 100).toFixed(1)}
                        %)
                      </Text>
                    </Flex>
                    <Flex>
                      <Text color="grape" size={"sm"} fw={500}>
                        <span className=" font-bold">{num_demo}</span> Demos
                      </Text>
                      <Text color="gray" size={"xs"} fw={500} ml="xs">
                        ({((num_demo / (num_sent + 0.0001)) * 100).toFixed(1)}
                        %)
                      </Text>
                    </Flex>
                  </Box>
                );
              },
            },
            {
              accessorKey: "status",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <Flex>
                    <IconLoader color="gray" size={"1.2rem"} />
                  </Flex>
                  <Text color="gray">Status</Text>
                </Flex>
              ),
              maxSize: 110,
              enableResizing: true,
              cell: (cell: any) => {
                const { status } = cell.row.original;

                return (
                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Badge color={status === "FAILED" ? "red" : status === "SUCCESS" ? "green" : status === "NOT_STARTED" ? "gray" : "orange"}>{status?.toLowerCase().replaceAll("_", " ")}</Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "action",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconToggleLeft color="gray" size={"0.9rem"} />
                  <Text color="gray">Action</Text>
                </Flex>
              ),
              maxSize: 100,
              enableResizing: true,
              cell: (cell: any) => {
                const { description } = cell.row.original;
                return (
                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <ActionIcon
                      size={"sm"}
                      radius={"xl"}
                      variant="light"
                      color="blue"
                      onClick={() => {
                        openContextModal({
                          modal: "previewStrategy",
                          title: (
                            <Flex align={"center"} gap={"sm"}>
                              <IconBulb color="#228be6" size={"1.6rem"} />
                              <Title order={2}>Preview Strategy</Title>
                            </Flex>
                          ),
                          innerProps: {
                            description: description,
                          },
                        });
                      }}
                    >
                      <IconEye color="#228be6" size={"0.9rem"} />
                    </ActionIcon>
                    <ActionIcon
                      size={"sm"}
                      radius={"xl"}
                      variant="light"
                      color="orange"
                      onClick={() => {
                        openContextModal({
                          modal: "editStrategy",
                          title: (
                            <Flex align={"center"} gap={"sm"}>
                              <IconBulb color="#228be6" size={"1.6rem"} />
                              <Title order={2}>Edit Strategy</Title>
                            </Flex>
                          ),
                          styles: {
                            content: {
                              minWidth: "70%",
                            },
                          },
                          innerProps: {
                            title: cell.row.original.title,
                            description: cell.row.original.description,
                            archetypes: cell.row.original.archetypes?.map((x: any) => x.id),
                            status: cell.row.original.status,
                            startDate: new Date(cell.row.original.start_date),
                            endDate: new Date(cell.row.original.end_date),
                            onSubmit: async (title: string, description: string, archetypes: number[], status: string, startDate: Date, endDate: Date) => {
                              const response = await patchUpdateStrategy(cell.row.original.id, title, description, archetypes, status, startDate, endDate);
                              handleGetAllStrategies();
                            },
                          },
                        });
                      }}
                    >
                      <IconPencil color="orange" size={"0.9rem"} />
                    </ActionIcon>
                    <ActionIcon
                      size={"sm"}
                      radius={"xl"}
                      variant="light"
                      color="orange"
                      onClick={() => {
                        openContextModal({
                          modal: "deleteStrategy",
                          title: (
                            <Flex align={"center"} gap={"sm"}>
                              <IconBulb color="#228be6" size={"1.6rem"} />
                              <Title order={2}>Delete Strategy</Title>
                            </Flex>
                          ),
                          styles: {
                            content: {
                              minWidth: "70%",
                            },
                          },
                          innerProps: {
                            onSubmit: async () => {
                              const response = await deleteStrategy(cell.row.original.id);
                              handleGetAllStrategies();
                            },
                          },
                        });
                      }}
                    >
                      <IconTrash color="red" size={"0.9rem"} />
                    </ActionIcon>
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
                  value={udPageSize}
                  onChange={(v) => {
                    setUdPageSize(v ?? "25");
                  }}
                />

                <Flex align={"center"} gap={"sm"}>
                  <Flex align={"center"}>
                    <Select
                      maw={100}
                      value={`${table.getState().pagination.pageIndex + 1}`}
                      data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
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
                        table.setPageIndex(table.getState().pagination.pageIndex - 1);
                      }}
                    >
                      <IconChevronLeft stroke={theme.colors.gray[4]} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      color="gray.4"
                      h={36}
                      disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                      onClick={() => {
                        table.setPageIndex(table.getState().pagination.pageIndex + 1);
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
          pageSizes={[udPageSize]}
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
            td: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
          })}
        />
      </Paper>
    </Box>
  );
}

const AreaChart: React.FC<{dataAndLabels: {labels: string[], maxRateData: number[], rateByStrategyData: {name: string, rate: number, month: number}[] }}> = (areaChartProps) => {
  const chartRef = useRef<any>(null);

  const data: any = {
    labels: areaChartProps.dataAndLabels.labels,
    datasets: [
      {
        label: "Positive Response rate By Strategy",
        data: areaChartProps.dataAndLabels.rateByStrategyData.map((strategyRate) => {
          return {x: areaChartProps.dataAndLabels.labels[strategyRate.month], y: strategyRate.rate};
        }),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        pointRadius: 4,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
        showLine: false,
      },
      {
        label: "Max Positive Response rate",
        data: areaChartProps.dataAndLabels.maxRateData,
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        pointRadius: 4,
        pointBackgroundColor: "rgba(75,192,192,1)",
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context: any) {
            if (context.dataset.label === "Max Positive Response rate") {
              return '';
            }
            const index = context.dataIndex;
            const info = areaChartProps.dataAndLabels.rateByStrategyData[index];
            return [`Rate: ${info.rate.toFixed(2)}%`, `Strategy ${index + 1}: ${info.name}`];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
          display: true,
        },
        beginAtZero: true,
        ticks: {
          callback: function(value: string) {
            return value + '%';
          },
        },
      },
    },
  };

  return <Line ref={chartRef} data={data} options={options} />;
};
