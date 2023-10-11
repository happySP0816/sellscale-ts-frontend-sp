import { Button, Flex, Grid, Text } from "@mantine/core";
import { ChartOptions, ScriptableContext } from "chart.js";
import { Bar } from "react-chartjs-2";

export const blue = "#228be6";
export const green = "#40c057";
export const grape = "#dc7ef1";
export const borderGray = "#E9ECEF";

export interface CampaignAnalyticsData {
  sentOutreach: number;
  accepted: number;
  activeConvos: number;
  demos: number;
}

const AnalyticChartBar: React.FC<{
  percent: number;
  goalPercent?: number;
  updatePercent?: string;
  description: string;
  value: string;
  color: string;
  chartColor: string;
  chartValue: number;
  maxValue: number;
}> = ({
  percent,
  goalPercent,
  updatePercent,
  description,
  value,
  color,
  chartColor,
  chartValue,
  maxValue,
}) => {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      xAxis: {
        display: false,
      },
      yAxis: {
        display: false,
        max: maxValue,
        min: 0,
        ticks: {
          display: true,
          stepSize: maxValue / 10,
        },
      },
    },
  };
  const data = {
    labels: [description],
    datasets: [
      {
        label: description,
        data: [chartValue],
        backgroundColor: (context: ScriptableContext<"bar">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, chartColor);
          gradient.addColorStop(1, `${chartColor}30`);
          return gradient;
        },
        fill: true,
        barPercentage: 1.5,
        pointStyle: "circle",
        yAxisID: "yAxis",
        xAxisID: "xAxis",
      },
    ],
  };

  return (
    <Flex direction={"column"} w={"100%"} h={"100%"}>
      <Flex direction={"column"} w={"100%"} p={"1rem"}>
        <Flex
          gap={"0.5rem"}
          align={"center"}
          justify={"center"}
          mb="12px"
          direction="column"
        >
          <Text fz="1.25rem" color={color} fw="bold">
            {value}
          </Text>

          <Text ta={"center"} color="gray.6" size="md" fw={"bold"}>
            {description}
          </Text>

          <Text ta={"center"} fw={"bold"} color={color}>
            {updatePercent} period
          </Text>
        </Flex>
      </Flex>
      <Flex
        h={"100%"}
        w={"99%"}
        direction={"column"}
        align={"center"}
        justify={"flex-end"}
      >
        <Bar options={options} data={data} height={200} />
      </Flex>
    </Flex>
  );
};

export const OverallPerformanceChart: React.FC<{
  data: CampaignAnalyticsData;
}> = ({ data }) => (
  <Grid
    ml={0}
    h={"auto"}
    w="100%"
    sx={{
      borderTopWidth: "1px",
      borderTopStyle: "dashed",
      borderTopColor: borderGray,
    }}
  >
    <Grid.Col
      span={3}
      px={0}
      sx={{
        borderRightWidth: "1px",
        borderRightStyle: "dashed",
        borderRightColor: borderGray,
      }}
    >
      <AnalyticChartBar
        percent={100}
        goalPercent={100}
        updatePercent="+6%"
        color="grape"
        chartColor="#dc7ef1"
        description="Messages Sent"
        value={data.sentOutreach + ""}
        chartValue={data.sentOutreach}
        maxValue={data.sentOutreach * 1.1}
      />
    </Grid.Col>
    <Grid.Col
      span={3}
      px={0}
      sx={{
        borderRightWidth: "1px",
        borderRightStyle: "dashed",
        borderRightColor: borderGray,
      }}
    >
      <AnalyticChartBar
        percent={parseFloat(
          ((data.accepted / data.sentOutreach) * 100).toFixed(0)
        )}
        goalPercent={9}
        updatePercent="+6%"
        color="blue"
        chartColor={blue}
        description="Accepted"
        value={data.accepted + ""}
        chartValue={data.accepted}
        maxValue={data.sentOutreach * 1.1}
      />
    </Grid.Col>
    <Grid.Col
      span={3}
      px={0}
      sx={{
        borderRightWidth: "1px",
        borderRightStyle: "dashed",
        borderRightColor: borderGray,
      }}
    >
      <AnalyticChartBar
        percent={parseFloat(
          ((data.activeConvos / data.sentOutreach) * 100).toFixed(0)
        )}
        goalPercent={0.5}
        updatePercent="+6%"
        color="green"
        chartColor={green}
        description="Replied"
        value={data.activeConvos + ""}
        chartValue={data.activeConvos}
        maxValue={data.sentOutreach * 1.1}
      />
    </Grid.Col>
    <Grid.Col span={3} px={0}>
      <AnalyticChartBar
        percent={parseFloat(
          ((data.demos / data.sentOutreach) * 100).toFixed(0)
        )}
        goalPercent={0.1}
        updatePercent="+4%"
        color="orange"
        chartColor="#dd7643"
        description="Demo"
        value={data.demos + ""}
        chartValue={data.demos}
        maxValue={data.sentOutreach * 1.1}
      />
    </Grid.Col>
  </Grid>
);
