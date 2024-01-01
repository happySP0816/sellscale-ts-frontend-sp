import { Box, Flex, Rating, Text, useMantineTheme } from "@mantine/core";
import { IconStar } from "@tabler/icons";
import { Bar } from "react-chartjs-2";

type PropsType = {
  data: any;
  selectedBar: any;
  setSelectedBar: any;
  chartData: any;

  valueToColor: any;
};
export default function DemoFeedbackBarChartV2(props: PropsType) {
  const { data, selectedBar, setSelectedBar, chartData, valueToColor } = props;
  console.log(
    "🚀 ~ file: DemoFeedbackBarChart.tsx:14 ~ DemoFeedbackBarChartV2 ~ data:",
    chartData
  );

  const theme = useMantineTheme();
  const fullColor = theme.fn.variant({
    variant: "filled",
    color: theme.colors.yellow[4],
    primaryFallback: false,
  }).background;
  return (
    <Box w={"100%"} h={"100%"} pos={"relative"}>
      <Bar
        height={120}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: false,
            },
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.parsed.y}${context.dataset.label}`;
                },
              },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const chartElement = elements[0];
              if (selectedBar === chartElement.index) {
                setSelectedBar(null);
              } else {
                setSelectedBar(chartElement.index);
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: function (value, index, ticks) {
                  return `${value}`;
                },
              },
            },
            x: {
              display: false,
            },
          },
        }}
        data={{
          labels: [...chartData.keys()],
          datasets: [
            {
              label: "Demos",
              data: [...chartData.values()],
              // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
              backgroundColor: [...chartData.keys()].map(
                (d) => theme.colors[valueToColor(theme, d)][5] + "90"
              ),
              borderColor: "#dcdde0",
              borderWidth: [...chartData.keys()].map((d, index) =>
                index === selectedBar ? 4 : 0
              ),
            },
          ],
        }}
      />

      <Flex w={"100%"} pl={30}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Flex
            key={i}
            sx={{ flex: 1 }}
            justify={"center"}
            align={"center"}
            gap={4}
          >
            <Text size={"xs"} sx={{ display: "flex" }} fz={12}>
              <Text fw={700}>{i}</Text>
              <Text c={"gray.4"}>/5</Text>
            </Text>
            <Flex>
              {new Array(i).fill(0).map((s) => (
                <svg
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={fullColor}
                  stroke={fullColor}
                  xmlns="http://www.w3.org/2000/svg"
                  width={12}
                  height={12}
                  key={s}
                >
                  <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                </svg>
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
