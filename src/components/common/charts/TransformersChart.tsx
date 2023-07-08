import { userTokenState } from "@atoms/userAtoms";
import { Center, Paper, useMantineTheme, Avatar } from "@mantine/core";
import { valueToColor } from "@utils/general";
import getTransformers from "@utils/requests/getTransformers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import _ from "lodash";
import { Bar } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Channel } from "src";
import { IconChartHistogram } from "@tabler/icons";
import { currentProjectState } from "@atoms/personaAtoms";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TransformersChart(props: { channel: Channel }) {
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-transformers-chart-data-${currentProject?.id}-${props.channel}`,
      { channel: props.channel },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { channel }] = queryKey;

      const response = await getTransformers(
        userToken,
        currentProject?.id || -1,
        channel === "EMAIL"
      );
      const result =
        response.status === "success" ? (response.data as any[]) : [];
      return result.map((data, i) => {
        return {
          ...data,
          id: i,
          name: _.startCase(
            data.research_point_type.replaceAll("_", " ").toLowerCase()
          ),
          percentage: Math.round(data.percent_accepted * 100),
        };
      });
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject,
  });

  if (!data || isFetching) {
    return (
      <Paper withBorder p="md" radius="md" w="100%" h="100%">
        <Center h={200}>
          <Avatar
            size={70}
            styles={{
              placeholder: {
                backgroundColor: "transparent",
              },
            }}
          >
            <IconChartHistogram color="gray" size="4rem" stroke="1" />
          </Avatar>
        </Center>
      </Paper>
    );
  }

  return (
    <Bar
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "% of Outreaches Accepted by Transformer Type",
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
        scales: {
          y: {
            ticks: {
              callback: function (value, index, ticks) {
                return `${value}%`;
              },
            },
          },
          x: {
            ticks: {
              font: {
                size: 8,
              },
              callback: function (value, index, ticks) {
                return ``;
              },
            },
          },
        },
      }}
      data={{
        labels: data.map((d) => d.name),
        datasets: [
          {
            label: "% of Outreaches Accepted",
            data: data.map((d) => d.percentage),
            // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
            backgroundColor: data.map(
              (d) => theme.colors[valueToColor(theme, d.name)][5] + "70"
            ),
          },
        ],
      }}
    />
  );
}
