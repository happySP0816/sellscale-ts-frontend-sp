import { Flex } from "@mantine/core";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartData,
  ChartOptions,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

const CumulativeGrowthChart = () => {
  const data: ChartData<"line"> = {
    labels: [
      "Nov 01",
      "Nov 02",
      "Nov 03",
      "Nov 04",
      "Nov 05",
      "Nov 06",
      "Nov 07",
      "Nov 08",
      "Nov 09",
      "Nov 10",
      "Nov 11",
      "Nov 12",
    ],
    datasets: [
      {
        label: "Acceptance",
        data: [210, 220, 219, 240, 233, 229, 241, 234, 246, 213, 234, 239],
        borderWidth: 2,
        tension: 0,
        borderColor: "#419a2e",
        backgroundColor: "#419a2e",
        yAxisID: "yAxis",
        xAxisID: "xAxis",
        pointRadius: 0,
        pointHoverRadius: 4,
      },

      {
        label: "Acceptance",
        data: [170, 150, 160, 166, 163, 160, 165, 165, 165, 167, 154, 180],
        borderWidth: 2,
        tension: 0,
        borderColor: "#228be6",
        backgroundColor: "#228be6",
        yAxisID: "yAxis",
        xAxisID: "xAxis",
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "Acceptance",
        data: [150, 110, 130, 136, 143, 130, 135, 125, 115, 127, 124, 110],
        borderWidth: 2,
        tension: 0,
        borderColor: "#dd7643",
        backgroundColor: "#dd7643",
        yAxisID: "yAxis",
        xAxisID: "xAxis",
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "white",
        titleSpacing: 16,
        titleColor: "black",
        bodyColor: "#888888",
        bodySpacing: 12,
        padding: 16,
        boxPadding: 8,
        borderColor: "#88888840",
        borderWidth: 1,
      },
      legend: {
        display: false,
      },
    },
    hover: {
      mode: "index",
      intersect: false,
    },
    scales: {
      xAxis: {
        grid: {
          display: false,
        },
        border: {
          display: false,
          dash: [2],
        },
        display: true,
        ticks: {
          color: "#888888",
          padding: 16,
          font: {
            size: 14,
          },
        },
      },
      yAxis: {
        grid: {
          tickBorderDash: [2],
          color: "#88888840",
        },
        border: {
          display: false,
          dash: [2],
        },
        display: true,
        beginAtZero: true,
        ticks: {
          padding: 16,
          stepSize: 50,
          color: "#88888880",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <Flex h={"100%"} w={"99%"} justify={"center"} align={"center"}>
      <Line options={options} data={data} height={400} />
    </Flex>
  );
};

export default CumulativeGrowthChart;
