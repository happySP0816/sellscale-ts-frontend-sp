import { currentPersonaIdState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { useMantineTheme } from "@mantine/core";
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
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TransformersChart() {

  const theme = useMantineTheme();
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(currentPersonaIdState);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-transformers-chart-data-${currentPersonaId}`,
    ],
    queryFn: async () => {
      const response = await getTransformers(userToken, currentPersonaId);
      const result = response.status === "success" ? (response.extra as any[]) : [];
      return result.map((data, i) => {
        return {
          ...data,
          id: i,
          name: _.startCase(data.research_point_type.replaceAll('_', ' ').toLowerCase()),
          percentage: Math.round(data.percent_accepted * 100),
        };
      });
    },
    refetchOnWindowFocus: false,
    enabled: currentPersonaId !== -1,
  });

  if (!data || isFetching) {
    return <></>;
  }

  return (
    <Bar
      options={{
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: '% of Outreaches Accepted by Transformer Type',
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
                callback: function(value, index, ticks) {
                    return `${value}%`;
                }
            }
          },
          x: {
            ticks: {
              font: {
                size: 8
              },
              callback: function(value, index, ticks) {
                return ``;
              }
            }
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
