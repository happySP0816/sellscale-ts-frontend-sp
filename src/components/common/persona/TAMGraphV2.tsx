import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
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
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const labels = ["January", "February", "March", "April", "May", "June", "July"];
const mocks = [
  "Devops Engineer",
  "Security Engineer",
  "Senior Devops Engineer",
  "Senior Security Engineer",
];
export default function TAMGraphV2() {
  const userToken = useRecoilValue(userTokenState);
  const [period, setPeriod] = useState("24H");
  const [filteredBy, setFilteredBy] = useState("COMPANY_SIZE");
  const theme = useMantineTheme();

  const data = {
    labels,
    datasets: [
      {
        label: "Prospected",
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: theme.colors.red[4],
      },

      {
        label: "Currently Engaged",
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: theme.colors.blue[4],
      },
    ],
  };
  const plugin = {
    id: "Chart Spacing",
    beforeInit(chart: any) {
      console.log("[Test] - be");
      // reference of original fit function
      const originalFit = chart.legend.fit;

      // override the fit function
      chart.legend.fit = function fit() {
        // call original function and bind scope in order to use `this` correctly inside it
        originalFit.bind(chart.legend)();
        // increase the width to add more space
        console.log("[Test] -", this.height);
        this.height += 20;
      };
    },
  };
  return (
    <Box p={"md"}>
      <Flex justify={"space-between"}>
        <CoreTitle order={2}>Doppler Outreach TAM</CoreTitle>

        <Flex gap={"sm"}>
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
        </Flex>
      </Flex>

      <Flex
        mt={"md"}
        gap={"lg"}
        sx={(theme) => ({
          border: `1px solid ${theme.colors.gray[3]}`,
        })}
      >
        <Box sx={{ flexBasis: "70%" }} bg={"white"} p={"md"}>
          <Box pos={"relative"} w={"100%"} h={"100%"}>
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
                maintainAspectRatio: false,
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
              data={data}
            />
            <Flex pos={"absolute"} bottom={8} right={0}>
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
          </Box>
        </Box>
        <Box sx={{ flexBasis: "30%" }}>
          <Stack sx={(theme) => ({})}>
            <Box py={"lg"}>
              <Text fz={"xl"} fw={500}>
                856+
              </Text>
              <Text fz={"xl"} fw={500}>
                Companies
              </Text>
              <Text color="gray.6">How many distinct companies you pull</Text>
            </Box>
            <Divider />
            <Box py={"lg"}>
              <Text fz={"xl"} fw={500}>
                10,000
              </Text>
              <Text fz={"xl"} fw={500}>
                Contacts
              </Text>
              <Text color="gray.6">How many contact we have</Text>
            </Box>
            <Divider />
            <Box py={"lg"}>
              <Text fz={"xl"} fw={500}>
                3%
              </Text>
              <Text fz={"xl"} fw={500}>
                in-network
              </Text>
              <Text color="gray.6">
                How many we're outreaching to from at least 1 Sellscale seat
              </Text>
            </Box>
          </Stack>
        </Box>
      </Flex>

      <Flex mt={"md"} justify={"space-evenly"} gap={"lg"}>
        {["Top titles", "Top Companies", "Locations", "Industry"].map((t) => (
          <Card key={t} w={"100%"} sx={{ flex: 1 }} p={"xs"}>
            <Box bg={"white"}>
              <Box>
                <Box py={"xs"}>
                  <Text fw={500} fz={"sm"}>
                    {t}
                  </Text>
                </Box>
                <Divider />
              </Box>

              {mocks.map((i, idx) => (
                <Box key={i}>
                  <Flex
                    justify={"space-between"}
                    py={"sm"}
                    pt={idx === 0 ? 0 : "xs"}
                  >
                    <Text fz={"sm"} fw={500}>
                      {i}
                    </Text>
                    <Text color="gray.6" fw={500} fz={"sm"}>
                      {faker.datatype.number({ min: 1, max: 1000 })}
                    </Text>
                  </Flex>

                  {idx !== mocks.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </Card>
        ))}
      </Flex>
    </Box>
  );
}
