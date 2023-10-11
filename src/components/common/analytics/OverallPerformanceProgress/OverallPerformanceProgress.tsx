import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  Plugin,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { AnyObject } from "chart.js/dist/types/basic";
import { Box, Flex } from "@mantine/core";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const barThickness = 15;
export const options = {
  indexAxis: "y" as const,
  borderSkipped: false,
  borderRadius: 3,
  maintainAspectRatio: false,
  barThickness: barThickness,
  plugins: {
    title: {
      display: false,
    },
    legend: {
      display: false,
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,

      grid: {
        display: false,
      },
    },
  },
};

const labels = ["January", "February", "March"];
const MAX = 200;
export const data: ChartData<"bar", number[], string> = {
  labels,
  // datasets: [
  //   {
  //     data: [57.866],
  //     backgroundColor: "#00BC43",
  //   },
  //   {
  //     data: [100 - 57.866],
  //     backgroundColor: "lightgrey",
  //     hoverBackgroundColor: "lightgrey",
  //   },
  // ],

  datasets: [
    {
      label: "Dataset 1",
      data: [100, 50, 20],
      backgroundColor: ["#419a2e", "#228be6", "#dd7643"],

      barPercentage: 0.2,
      categoryPercentage: 0.2,
      borderRadius: 999,
      borderSkipped: false,
    },
    // {
    //   label: "Dataset 2",
    //   data: [MAX, MAX, MAX],
    //   backgroundColor: "lightgrey",
    // },
  ],
};
const horizontalBackgroundPlugin: Plugin<"bar", AnyObject> = {
  id: "horizontalBackgroundPlugin",
  beforeDatasetsDraw: (chart, args, plugins) => {
    const {
      ctx,
      chartArea: { top, bottom, left, right, width, height },
      scales: { x, y },
    } = chart;

    ctx.save();
    ctx.fillStyle = "lightgrey";
    data.labels?.forEach((bar, idx) =>
      ctx.fillRect(
        left,
        y.getPixelForValue(idx) - barThickness / 2,
        width,
        barThickness
      )
    );
  },
};
const OverallPerformanceProgress = () => {
  return (
    <Flex w={"100%"}>
      <Box w={"100%"} h={200}>
        <Bar
          options={options}
          data={data}
          height={200}
          plugins={[horizontalBackgroundPlugin]}
        />
      </Box>
    </Flex>
  );
};

export default OverallPerformanceProgress;
