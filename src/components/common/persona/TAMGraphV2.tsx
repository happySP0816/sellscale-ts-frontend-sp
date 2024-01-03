import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Box,
  Flex,
  Title as CoreTitle,
  Text,
  Button,
  Group,
  useMantineTheme,
  Grid,
  Stack,
  Divider,
  Card,
  Badge,
  ActionIcon,
  rem,
  ThemeIcon,
  RingProgress,
  Center,
  Select,
  Accordion,
  Tooltip as MantineTooltip,
} from "@mantine/core";
import {
  IconArrowUp,
  IconCalendar,
  IconDotsVertical,
  IconInfoCircle,
} from "@tabler/icons";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { useQuery } from "@tanstack/react-query";
import { getTamGraphData } from "@utils/requests/getTamGraphData";
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type TAMGraphData = {
  companies: {
    company: string;
    count: number;
  }[];
  employees: {
    employee_count_comp: string;
    num_contacted: number;
    num_left: number;
  }[];
  industries: {
    company: string;
    count: number;
  }[];
  industry_breakdown: {
    industry: string;
    num_contacted: number;
    num_left: number;
  }[];
  scraping_report: {
    scraped: string;
    sdr: string;
    status: string;
    upload_date: string;
    upload_name: string;
  }[];
  stats: [
    {
      num_companies: number;
      num_contacts: number;
      num_engaged: number;
    }
  ];
  titles: {
    count: number;
    title: string;
  }[];
};

export const options = {
  plugins: {
    title: {
      display: true,
      text: "Chart.js Bar Chart - Stacked",
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

export default function TAMGraphV2() {
  const userToken = useRecoilValue(userTokenState);
  const [period, setPeriod] = useState("24H");
  const [filteredBy, setFilteredBy] = useState("COMPANY_SIZE");
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const userData = useRecoilValue(userDataState)

  console.log(userData)

  const { data: graphData } = useQuery({
    queryKey: [`query-get-tam-graph-data`],
    queryFn: async () => {
      const response = await getTamGraphData(userToken);
      return response.status === "success"
        ? (response.data as TAMGraphData)
        : null;
    },
  });
  console.log(
    "🚀 ~ file: TAMGraphV2.tsx:125 ~ TAMGraphV2 ~ graphData:",
    graphData
  );

  const data = {
    labels: (filteredBy === "COMPANY_SIZE"
      ? graphData?.employees.map((i) => [
          `${i.employee_count_comp}`,
          "Employees",
        ]) || []
      : graphData?.industry_breakdown.map((i) => i.industry) ||
        []) as unknown as string[],
    datasets: [
      {
        label: "Prospected",
        data:
          filteredBy === "COMPANY_SIZE"
            ? graphData?.employees.map((i) => i.num_left) || []
            : graphData?.industry_breakdown.map((i) => i.num_left) || [],
        backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
      },
      {
        label: "Currently Engaged",
        data:
          filteredBy === "COMPANY_SIZE"
            ? graphData?.employees.map((i) => i.num_contacted) || []
            : graphData?.industry_breakdown.map((i) => i.num_contacted) || [],
        // labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: theme.colors.grape[4],
      },
    ],
  };

  const percentage = Math.round(
    ((graphData?.stats[0].num_engaged || 0) /
      (graphData?.stats[0].num_contacts || 1)) *
      100
  );

  const getList = (title: string, data: { title: string; count: number }[]) => {
    return (
      <Accordion
        defaultValue={title}
        w={"100%"}
        sx={{ flex: 1 }}
        p={"xs"}
        styles={{
          panel: { backgroundColor: "white" },
          content: { backgroundColor: "white" },
          item: {
            border: 0,
          },
        }}
        bg={"white"}
      >
        <Accordion.Item value={title}>
          <Accordion.Control>
            <Text fw={500} fz={"xs"}>
              {title}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            {data.map((i, idx) => (
              <Box key={idx}>
                <Divider />
                <Flex
                  justify={"space-between"}
                  py={"xs"}
                  pt={idx === 0 ? 0 : "xs"}
                >
                  <Text fz={"xs"} fw={500}>
                    {i.title}
                  </Text>
                  <Text color="gray.6" fw={500} fz={"xs"}>
                    {i.count}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  };

  const renderIncreaseBadge = (percentage: number) => {
    return (
      <Badge
        styles={{
          leftSection: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        // variant="outline"
        color="green"
        leftSection={
          <ThemeIcon size="xs" color="green" variant="transparent">
            <IconArrowUp size={rem(14)} />
          </ThemeIcon>
        }
      >
        {percentage}%
      </Badge>
    );
  };

  return (
    <Box p={'md'}>
      <Flex justify={'space-between'}>
        <CoreTitle order={2}>Outreach TAM</CoreTitle>

        {/* <Flex gap={"xs"}>
          <Flex align={"center"}>
            <IconCalendar
              size={"1rem"}
              color={theme.colors.blue[theme.fn.primaryShade()]}
            />
            <Text ml={"xs"} size="md" fw={500}>
              Period:{" "}
            </Text>
          </Flex>
          <Group spacing="0" bg={"white"}>
            <Button
              variant="outline"
              color={period === "24H" ? "blue" : "gray"}
              size="md"
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
              size="md"
              onClick={() => setPeriod("ALL_TIME")}
              color={period === "ALL_TIME" ? "blue" : "gray"}
            >
              All time
            </Button>
          </Group>
        </Flex> */}
      </Flex>
      <Grid mt={"md"}>
        <Grid.Col span={6}>
          <Card>
            <Flex w={"100%"} align={"center"} justify={"space-evenly"}>
              <Box pos={"relative"} sx={{ float: "left" }}>
                <Box
                  pos={"relative"}
                  sx={{
                    overflow: "hidden",
                    width: 120,
                    height: 60,
                    marginBottom: -14,
                  }}
                >
                  <Box
                    pos={"absolute"}
                    sx={(theme) => ({
                      top: 0,
                      left: 0,
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      border: `10px solid ${theme.colors.gray[3]}`,
                      borderBottomColor:
                        theme.colors.green[theme.fn.primaryShade()],
                      borderRightColor:
                        theme.colors.green[theme.fn.primaryShade()],
                      transform: `rotate(${45 + percentage * 1.8}deg)`,
                    })}
                  />

                  <Flex align={"flex-end"} justify={"center"} h={"100%"}>
                    <Box>
                      <Text align="center" fz={"xs"} fw={700}>
                        {percentage}%
                      </Text>
                      <Text align="center" fz={"xs"}>
                        Penetrated
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Box>
              <Flex direction={"column"}>
                <Flex align={"center"}>
                  <Text fw={600} color="gray.8" fz='xs'>
                    <Box
                      sx={(theme) => ({
                        borderRadius: 9999,
                        display: "inline-block",
                        marginRight: 4,
                        width: 12,
                        height: 12,
                        backgroundColor:
                          theme.colors.blue[theme.fn.primaryShade()],
                      })}
                    />
                    Cold Outreach TAM: 
                  </Text>

                  <MantineTooltip label={"Total companies scraped by SellScale multipled by the average ACV for your company. Currently set to $" + (userData.avg_contract_size ? userData.avg_contract_size : 10000).toLocaleString()} withinPortal>
                    <ActionIcon onClick={() => {
                      navigateToPage(navigate, '/settings');
                    }} ml={"xs"}>
                      <IconInfoCircle size={"0.8rem"} />
                    </ActionIcon>
                  </MantineTooltip>
                </Flex>

                <Flex align={"center"} gap={"xs"}>
                  <Text fw={700} fz={24}>
                    $
                    {new Intl.NumberFormat("en-US").format(
                      (graphData?.stats[0].num_companies ? graphData?.stats[0].num_companies : 0) * (userData.avg_contract_size ? userData.avg_contract_size : 10000)
                    )}
                  </Text>
                  {renderIncreaseBadge(6.5)}
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={2}>
          <Card>
            <Flex justify={"space-between"}>
              <Text fw={600} color="gray.8" fz='xs'>
                Total Contacts
              </Text>
              <ActionIcon>
                <IconDotsVertical size={"0.8rem"} />
              </ActionIcon>
            </Flex>

            <Flex align={"center"} gap={"xs"}>
              <Text fw={700} fz={24}>
                {Number(graphData?.stats[0].num_contacts).toLocaleString()}
              </Text>

              {renderIncreaseBadge(100)}
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={2}>
          <Card>
            <Flex justify={"space-between"}>
              <Text fw={600} color="gray.8" fz='xs'>
                Engaged Contacts
              </Text>
              <ActionIcon>
                <IconDotsVertical size={"0.8rem"} />
              </ActionIcon>
            </Flex>
            <Flex align={"center"} gap={"xs"}>
              <Text fw={700} fz={24}>
                {Number(graphData?.stats[0].num_engaged).toLocaleString()}
              </Text>

              {renderIncreaseBadge(
                Math.round(
                  ((graphData?.stats[0].num_engaged || 0) /
                    (graphData?.stats[0].num_contacts || 1)) *
                    100
                )
              )}
            </Flex>
          </Card>
        </Grid.Col>
        <Grid.Col span={2}>
          <Card>
            <Flex>
              <Text fw={600} color="gray.8" fz='xs'>
                Open Leads
              </Text>
              <MantineTooltip label="Open convos times average ACV. Note: Does not include not interested or not qualified conversations." withinPortal>
                <ActionIcon>
                  <IconInfoCircle size={"0.8rem"} />
                </ActionIcon>
              </MantineTooltip>
            </Flex>
            <Flex align={"center"} gap={"xs"}>
              <Text fw={700} fz={24}>
                {Number(25).toLocaleString()}
              </Text>
              <Text color="gray.6"> | </Text>
              <Text color="gray.6">
                {" "}
                ${new Intl.NumberFormat("en-US").format(1200000)}
              </Text>
            </Flex>
          </Card>
        </Grid.Col>
      </Grid>
      <Flex
        mt={"md"}
        gap={"lg"}
        sx={(theme) => ({
          border: `1px solid ${theme.colors.gray[3]}`,
        })}
      >
        <Box sx={{ flexBasis: "100%" }} bg={"white"} p={"md"}>
          <CoreTitle order={5} color="gray.6">
            TAM SNAPSHOT (ENGAGED TOTAL)
          </CoreTitle>
          <Box pos={"relative"} w={"100%"} h={"100%"} mt={"xs"} mah={"40vh"}>
            <Bar
              width={"100%"}
              // plugins={[plugin]}
              options={{
                // maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                    align: "start",
                    labels: {
                      usePointStyle: true,
                      pointStyle: "circle",
                      padding: 20,
                    },
                  },

                  title: {
                    display: false,
                  },
                },

                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      lineWidth: 0,
                    },
                    ticks: {
                      color: theme.colors.gray[6],
                      font: {
                        weight: 600,
                      },
                    },
                  },
                  y: {
                    stacked: true,
                    ticks: {
                      color: theme.colors.gray[6],
                      font: {
                        weight: 600,
                      },
                    },
                  },
                },
              }}
              data={data}
            />
            <Flex pos={"absolute"} bottom={8} right={0}>
              <Text color="gray" fw={700} fz={"xs"}>
                Filter by: &nbsp;
              </Text>
              <Group spacing="xs">
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
          </Box>
        </Box>
        {/* <Box sx={{ flexBasis: "30%" }}>
          <Stack sx={() => ({})}>
            <Box py={"lg"}>
              <Text fz={"xl"} fw={500}>
                {graphData?.stats[0].num_companies}+
              </Text>
              <Text fz={"xl"} fw={500}>
                Companies
              </Text>
              <Text color="gray.6"># Distinct companies in database</Text>
            </Box>
            <Divider />
            <Box py={"lg"}>
              <Text fz={"xl"} fw={500}>
                {graphData?.stats[0].num_contacts}
              </Text>
              <Text fz={"xl"} fw={500}>
                Contacts
              </Text>
              <Text color="gray.6"># Unique contact we in database</Text>
            </Box>
            <Divider />
            <Box py={"lg"}>
              <Text fz={"xl"} fw={500}>
                {Math.round(
                  ((graphData?.stats[0].num_engaged ?? 0) /
                    (graphData?.stats[0].num_contacts ?? 1)) *
                    100
                )}
                %
              </Text>
              <Text fz={"xl"} fw={500}>
                Engaged
              </Text>
              <Text color="gray.6">% Contacts Contacted at least once</Text>
            </Box>
          </Stack>
        </Box> */}
      </Flex>

      <Flex mt={"md"} justify={"space-evenly"} gap={"lg"}>
        {getList("Top titles", graphData?.titles || [])}
        {getList(
          "Top Companies",
          (graphData?.companies || []).map((i) => ({
            title: i.company,
            count: i.count,
          }))
        )}
        {/* {getList(
          'Locations',
          (graphData?.employees || []).map((i) => ({
            title: i.employee_count_comp,
            count: i.num_contacted,
          }))
        )} */}
        {getList(
          "Top Industries",
          (graphData?.industries || []).map((i) => ({
            title: i.company,
            count: i.count,
          }))
        )}
      </Flex>
    </Box>
  );
}
