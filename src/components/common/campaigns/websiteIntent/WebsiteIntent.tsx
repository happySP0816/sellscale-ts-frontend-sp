import {
  Button,
  Box,
  Badge,
  Card,
  Flex,
  Grid,
  Text,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import { Line } from "react-chartjs-2";
import { IconArrowRight, IconPlus } from "@tabler/icons";
import WebIntentPreview from "./WebIntentPreview";
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
import { useState } from "react";
import WebIntentDetails from "./WebIntentDetails";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
);

export default function WebsiteIntent() {
  const [detailView, setDetailView] = useState(true);
  const options: ChartOptions<"line"> = {
    maintainAspectRatio: true,
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
  };
  const data: ChartData<"line"> = {
    labels: [
      "01/05",
      "02/05",
      "03/05",
      "04/05",
      "05/05",
      "06/05",
      "07/05",
      "08/05",
      "09/05",
      "10/05",
      "11/05",
      "12/05",
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
    ],
  };

  const splitsData = [
    {
      line_data: [1, 2, 3, 4, 5],
      logo_one_url:
        "data:image/jpeg;base64,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",
      logo_two_url:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAk1BMVEUAAAD////6+/oMDAz29vbx8vGys7KRk5Cmp6WhoaHq6upTVFPe397Oz80xNDHIyciHiIYoKSfU1dRNT0x8fXtZW1gkJSRnZ2TAv76LhoUxMDEACA+WmZs4OzhSVlFzdnNCREIACAEUFRMWGhQwLSQaGBI5NzIvKiopIyEZFBROSUpzcG8MAABDQESUkZQsLykjKy3486KgAAAEWUlEQVR4nO2c7VbiMBCGaZp+hdRCaW1xwSLquoqr3v/VLQUUaAse2ilvcef55zHnOK+ZmWQmSXs9hmEYhmEYhmEYhmEYhmEYhmEYhmEYCqaR00fbQMOtrZUlJ2gzKIi0NHJctCHNyZSx4eLF9H3D+CFirgdyq8Xw0OY04srekWIIB21PE2bprhbDitAGNWAU7GkxdIy2qD5XBS1GcI02qTZ3dkGLuOBktpfHctQCbVJt+mFBixGiTapNyckMOUDbVJuFVRSj0SbVZliaGHG5i0xcmhgfbVJt5l5RizVD21SbG10Uc7nR3xsVtVzwetkbFLTYQ7RF9TH3d8tGeoW2qAFm+GPmZSlG7UixLrokW4rZrjLSv+AiZsWXGBle0rQMR4tosCRKRjuBYa6WGakD56scu5vG2XKkM4iyfifTwXXmpaGSYolUYepFs80vTDcMUteJ7zc/z2PHDrQlxXKLJq0wdaN3kMmHmHr+bpznoR7a0XoqpqPZtkQeeYEW+yOV745Qdlcwd4sGrvVoO9kbdx+llQOFtjvjbZmqsvBTz2ITP8NFqkrb5+30dGS/lh6Usv63S6VDPw+n48PCDoROrI7aeAJWBpZiDg57zskIz0RqmTvFFlIzNS6wM0isZYk7h4kptfaaA/O0jDBePkGddEzJ8tgOFmi98b837WTSGBM0Dr0U4YGy2QN98OMO0+idTMF2AAl5JgMeDKTfW3ciuNbgbanl2pQApqXnUYe/9QDT8kjuZcDaLKH2Mv2IE0O+W06+/5ut4RJrUVOclt/UIeMAS8yYOGQE0suoCxmNbAIWz8KaYt8AxVDv/j1c5U8vBtrNLB3sNwN6X8OkFoNsZbKYY2J+kptBEwC5GORuhjqbGch+Ofk6EwA3zb03YjEW8mEQ9d7MQObmiLrQtIFBk1D3/yUwaMp3rpsyxol5Iu80WcAigLqhAX3nNCEXY/yBicnoTwD9Z5SYF/IMAHS0V/oTDUPAMpp7/FZPLWCngIufdGz+RH7YlCM8TBZoIWhygieEmPJjJSIQl2deW/GzHDmenl1P6ekVHersvvZCf0Pjk/TcWnq9FjYBa8TL+cUkbYmB3AhoY93M+YsQM25HC+bZ43M7Sw0gYnKo22crUHdohm1EDSRiclqIGhdWcM7I1xoFipgc6tamGL/ixNwQVwIp8kIAcaMW/GEN0yNsBggX+uRk6WiEOSCEOlkOnaOpDjyvpeo6iU58VovI0brxXY13EkdTHfl204LA0WQHAmYNwVF6R96c5jQ+fOpE8G+4bth4Aj4CrOCjkRrodZMKDs+NpVPX81w7PZT0BPSKZjVOVU7TTn8+N9fMP7K0omSQb2jLqyhd3bbs8l2FcXGQ7uoHdb2dDwNI5Va/ic/0tqsjVJfSWIFfE18ry1JKB4NfB0fFdrgapf3J4UGdYJpEg+z24/ggc5REUTI7i0EMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAM8x/wDxgoPuJUW6/wAAAAAElFTkSuQmCC",
      logo_three_url:
        "data:image/jpeg;base64,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",
      title: "Pricing Page Visitors > 200 employees",
      content:
        "Finds all visitors who are working at a company with greater than 200 employees and visits the pricing page.",
    },
    {
      line_data: [1, 2, 3, 4, 5],
      logo_one_url:
        "data:image/jpeg;base64,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",
      logo_two_url:
        "data:image/png;base64,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",
      logo_three_url:
        "data:image/jpeg;base64,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",
      title: "Homepage Visitors for > 120 seconds",
      content: "Finds all visitors who are onthe home page for > 120 seconds",
    },
    {
      line_data: [1, 2, 3, 4, 5],
      logo_one_url:
        "data:image/png;base64,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",
      logo_two_url:
        "https://creativecomp.com/wp-content/uploads/2021/04/Hulu-logo-modern-font.png",
      logo_three_url:
        "https://cdn4.iconfinder.com/data/icons/flat-brand-logo-2/512/amazon-512.png",
      title: "Case Study (Doximity) Competitors",
      content:
        "Finds all healthcare competitors who are reading the doximity case study for > 20 seconds and work at a company > 30 employees.",
    },
  ];

  const [detailsData, setDetailsData] = useState<any>();
  return (
    <Flex direction={"column"} gap={"lg"}>
      {detailView ? (
        <Box>
          <Card>
            <Flex direction="row" mb="xs">
              <Box>
                <Text fw={500} tt={"uppercase"} fz={16}>
                  All Website Visitors
                </Text>
                <Text color="gray" fw={400} fz={12}>
                  Live web traffic (with De-anonymization) built in
                </Text>
              </Box>
            </Flex>
            <Line
              data={data}
              options={options}
              style={{ width: "100%", maxHeight: "300px", height: "250px" }}
            />
          </Card>
          <Flex justify={"space-between"} align={"center"} mt="md">
            <Box>
              <Text fz={21} fw={600}>
                Website Intent Splits
              </Text>
              <Text fz="sm" color="gray">
                Create new splits to target specific website visitors
              </Text>
            </Box>
            <Button leftIcon={<IconPlus size={"0.9rem"} />}>
              New Website Intent Split
            </Button>
          </Flex>

          <Flex direction={"column"} mt="md">
            <Flex gap={"md"}>
              <SimpleGrid cols={4}>
                {splitsData.map((item, index) => {
                  return (
                    <Card w={"100%"} maw={250}>
                      <Flex
                        direction={"column"}
                        gap={"sm"}
                        h={"100%"}
                        justify={"space-between"}
                      >
                        <Flex gap={"sm"} direction={"column"}>
                          <WebIntentPreview
                            line_data={item.line_data}
                            logo_one_url={item.logo_one_url}
                            logo_two_url={item.logo_two_url}
                            logo_three_url={item.logo_three_url}
                          />
                          <Text size={"lg"} fw={700}>
                            {item.title}
                          </Text>
                          <Text fw={500} color="gray" size={"xs"}>
                            {item.content}
                          </Text>
                        </Flex>
                        <Button
                          w={"fit-content"}
                          rightIcon={<IconArrowRight size={"0.9rem"} />}
                          onClick={() => {
                            setDetailsData(item);
                            setDetailView(false);
                          }}
                        >
                          View Details
                        </Button>
                      </Flex>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Flex>
          </Flex>
        </Box>
      ) : (
        <WebIntentDetails
          data={detailsData}
          detailView={detailView}
          setDetailView={setDetailView}
        />
      )}
    </Flex>
  );
}
