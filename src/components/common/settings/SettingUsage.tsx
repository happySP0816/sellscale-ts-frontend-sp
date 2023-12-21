import {
  Paper,
  Text,
  Group,
  Box,
  Grid,
  Flex,
  Badge,
  useMantineTheme,
  Progress,
  Button,
  RingProgress,
} from "@mantine/core";

import {
  IconArrowUp,
  IconBrandSuperhuman,
  IconBriefcase,
  IconChevronsUp,
  IconDotsVertical,
  IconFingerprint,
  IconPackages,
  IconPoint,
  IconSelect,
  IconSettings,
} from "@tabler/icons";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
  Chart,
} from "chart.js";

import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useSearchParams } from "react-router-dom";
import { getUsageConnectResponse } from "@utils/requests/usageConnect";
import { useEffect } from "react";

Chart.register(ArcElement);

export default function SettingUsage() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const update = async () => {
    console.log("pppppppppppppppppppppppppp");
    const response = await getUsageConnectResponse(userToken, 520);
    console.log("1222222222222222222222222222", response);
  };

  useEffect(() => {
    update();
  }, []);

  const barchartData: any = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        data: [
          770, 1100, 750, 1200, 1300, 700, 1450, 1000, 1100, 650, 1400, 800,
        ],
        fill: false,
        borderColor: theme.colors.blue[6],
        tension: 0.3,
      },
    ],
  };
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        border: { dash: [4, 4] },
        beginAtZero: true,
        ticks: {
          stepSize: 250,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      bar: {
        backgroundColor: "#0287f7",
      },
    },
  };

  const data = {
    labels: ["Label 1", "Label 2"],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["#fa5352", "#eaecf0"],
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };
  const piechartOptions = {
    rotation: 270,
    circumference: 180,
    cutout: "80%",
    plugins: {
      legend: {
        display: false,
      },
      doughnutCutout: false,
    },
  };

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Box>
        <Grid>
          <Grid.Col span={9}>
            <Flex direction={"column"} w={"100%"} gap={"xl"}>
              <Group grow>
                <Box
                  py={20}
                  px={20}
                  style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                  <Flex justify={"space-between"} w={"100%"} align={"center"}>
                    <Text color="gray" size={12} fw={600}>
                      Prospects Created
                    </Text>
                    <IconDotsVertical size={10} color="gray" />
                  </Flex>
                  <Text
                    fw={600}
                    size={20}
                    style={{ display: "flex", alignItems: "center" }}
                    mt={5}
                  >
                    1,400{" "}
                    <Badge
                      color="green"
                      ml={10}
                      leftSection={<IconArrowUp size={10} stroke={3} />}
                    >
                      8.5%
                    </Badge>
                  </Text>
                </Box>
                <Box
                  py={20}
                  px={20}
                  style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                  <Flex justify={"space-between"} w={"100%"} align={"center"}>
                    <Text color="gray" size={12} fw={600}>
                      Prospects Enriched
                    </Text>
                    <IconDotsVertical size={10} color="gray" />
                  </Flex>
                  <Text
                    fw={600}
                    size={20}
                    style={{ display: "flex", alignItems: "center" }}
                    mt={5}
                  >
                    1,100{" "}
                    <Badge
                      color="green"
                      ml={10}
                      leftSection={<IconArrowUp size={10} stroke={3} />}
                    >
                      8.5%
                    </Badge>
                  </Text>
                </Box>
                <Box
                  py={20}
                  px={20}
                  style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                  <Flex justify={"space-between"} w={"100%"} align={"center"}>
                    <Text color="gray" size={12} fw={600}>
                      Total Outreach Sent
                    </Text>
                    <IconDotsVertical size={10} color="gray" />
                  </Flex>
                  <Text
                    fw={600}
                    size={20}
                    style={{ display: "flex", alignItems: "center" }}
                    mt={5}
                  >
                    556{" "}
                    <Badge
                      color="green"
                      ml={10}
                      leftSection={<IconArrowUp size={10} stroke={3} />}
                    >
                      8.5%
                    </Badge>
                  </Text>
                </Box>
              </Group>
              <Group grow>
                <Box
                  py={30}
                  px={20}
                  style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                  <Flex justify={"space-between"} w={"100%"} align={"center"}>
                    <Text color="gray" size={12} fw={600}>
                      AI Replies
                    </Text>
                    <IconDotsVertical size={10} color="gray" />
                  </Flex>
                  <Text
                    fw={600}
                    size={20}
                    style={{ display: "flex", alignItems: "center" }}
                    mt={5}
                  >
                    120{" "}
                    <Badge
                      color="green"
                      ml={10}
                      leftSection={<IconArrowUp size={10} stroke={3} />}
                    >
                      8.5%
                    </Badge>
                  </Text>
                </Box>
                <Box
                  py={30}
                  px={20}
                  style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                  <Flex justify={"space-between"} w={"100%"} align={"center"}>
                    <Text color="gray" size={12} fw={600}>
                      Prospects Snoozed
                    </Text>
                    <IconDotsVertical size={10} color="gray" />
                  </Flex>
                  <Text
                    fw={600}
                    size={20}
                    style={{ display: "flex", alignItems: "center" }}
                    mt={5}
                  >
                    1,100{" "}
                    <Badge
                      color="green"
                      ml={10}
                      leftSection={<IconArrowUp size={10} stroke={3} />}
                    >
                      8.5%
                    </Badge>
                  </Text>
                </Box>
                <Box
                  py={30}
                  px={20}
                  style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
                >
                  <Flex justify={"space-between"} w={"100%"} align={"center"}>
                    <Text color="gray" size={12} fw={600}>
                      Prospects removed
                    </Text>
                    <IconDotsVertical size={10} color="gray" />
                  </Flex>
                  <Text
                    fw={600}
                    size={20}
                    style={{ display: "flex", alignItems: "center" }}
                    mt={5}
                  >
                    556{" "}
                    <Badge
                      color="green"
                      ml={10}
                      leftSection={<IconArrowUp size={10} stroke={3} />}
                    >
                      8.5%
                    </Badge>
                  </Text>
                </Box>
              </Group>
            </Flex>
          </Grid.Col>
          <Grid.Col span={3}>
            <Box
              py={20}
              px={20}
              style={{
                border: "2px solid #f6f4f7",
                borderRadius: "6px",
                height: "100%",
              }}
            >
              <Flex
                direction={"column"}
                justify={"space-between"}
                align={"center"}
                gap={"sm"}
                h={"100%"}
              >
                <div className="w-[140px] m-[-30px] relative">
                  <Doughnut data={data} options={piechartOptions} />
                  <Flex
                    style={{
                      position: "absolute",
                      top: "65px",
                      width: "100%",
                      alignItems: "center",
                    }}
                    direction={"column"}
                  >
                    <Text fw={600}>78%</Text>{" "}
                    <Text size={12} fw={600}>
                      Limit Utilized
                    </Text>
                  </Flex>
                </div>
                <Text size={12} fw={600} color="gray" align="center">
                  You have used <span style={{ color: "#54a4f9" }}>548</span>{" "}
                  out of{" "}
                  <span style={{ fontWeight: "700", color: "black" }}>
                    2000
                  </span>{" "}
                  monthly first touches.
                </Text>
                <Button w={"100%"} leftIcon={<IconChevronsUp size={16} />}>
                  Increase Limit
                </Button>
              </Flex>
            </Box>
          </Grid.Col>
          <Grid.Col>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  # First Touches Sent:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"sm"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  First Touches Sent:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"lg"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  Prospects Enriched:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"sm"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  Outreach Sent:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"sm"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  AI Replies:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"sm"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  Prospects Snoozed:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"sm"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
          <Grid.Col span={6}>
            <Box
              py={30}
              px={20}
              style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
            >
              <Flex align={"center"} gap={"sm"}>
                <Text color="gray" fw={600}>
                  Not Interested / Nurture:{" "}
                </Text>
                <Text
                  fw={600}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  1,400{" "}
                  <Badge
                    color="green"
                    ml={10}
                    leftSection={<IconArrowUp size={10} stroke={3} />}
                  >
                    8.5%
                  </Badge>
                </Text>
              </Flex>
              <Box h={230} mt={"sm"}>
                <Bar data={barchartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    </Paper>
  );
}
