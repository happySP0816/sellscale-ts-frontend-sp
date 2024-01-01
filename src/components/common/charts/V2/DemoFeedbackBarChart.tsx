import { Bar } from "react-chartjs-2";

type PropsType = {
  data: any;
  selectedBar: any;
  setSelectedBar: any;
  chartData: any;
  theme: any;
  valueToColor: any;
};
export default function DemoFeedbackBarChartV2(props: PropsType) {
  const { data, selectedBar, setSelectedBar, chartData, theme, valueToColor } =
    props;

  console.log(
    "🚀 ~ file: DemoFeedbackBarChart.tsx:13 ~ DemoFeedbackBarChartV2 ~ chartData:",
    chartData
  );
  return (
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
            ticks: {
              callback: function (value, index, ticks) {
                return `${value}/5`;
              },
            },
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
  );
}
