import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { Box, useMantineTheme } from "@mantine/core";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const labels = ["High", "Medium", "Low", " Very Low", "Not score"];

export const options: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
      onClick: (evt, legendItem, legend) => {
        const index = legend.chart.data.labels?.indexOf(
          legendItem.text
        ) as number;

        legend.chart.toggleDataVisibility(index);
        legend.chart.update();
      },
      labels: {
        useBorderRadius: true,
        borderRadius: 999,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        generateLabels: (chart) =>
          chart.data.labels?.map((label, idx) => ({
            text: label as string,
            strokeStyle: chart?.data?.datasets[0]?.borderColor
              ? (chart?.data?.datasets[0]?.borderColor as string[])[idx]
              : "#fff",
            fillStyle: chart?.data?.datasets[0]?.backgroundColor
              ? (chart?.data?.datasets[0]?.backgroundColor as string[])[idx]
              : "#fff",
            hidden: false,
          })) || [],
      },
    },
    title: {
      display: false,
    },
  },
};

const BarChart = () => {
  const theme = useMantineTheme();
  const data = {
    labels,
    datasets: [
      {
        data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        backgroundColor: [
          theme.colors.green[6],
          theme.colors.yellow[6],
          theme.colors.orange[6],
          theme.colors.red[6],
          theme.colors.gray[6],
        ],

        borderRadius: 5,
        borderSkipped: false,
        borderColor: [
          theme.colors.green[8],
          theme.colors.yellow[8],
          theme.colors.orange[8],
          theme.colors.red[8],
          theme.colors.gray[8],
        ],
      },
    ],
  };
  return <Bar options={options} data={data} height={"100%"} />;
};

export default BarChart;
