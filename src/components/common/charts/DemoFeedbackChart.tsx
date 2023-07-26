import { userTokenState } from "@atoms/userAtoms";
import React from "react";
import { Tabs, Divider } from "@mantine/core";
import { IconChartAreaFilled, IconChartArrows } from "@tabler/icons-react";
import { IconChartArcs } from "@tabler/icons";
import DemoFeedbackLineChart from "./DemoFeedbackLineChart";
import { Title as MantineTitle } from "@mantine/core";

import {
  Center,
  Paper,
  useMantineTheme,
  Text,
  Avatar,
  Flex,
  Badge,
} from "@mantine/core";
import {
  convertDateToLocalTime,
  formatToLabel,
  proxyURL,
  valueToColor,
} from "@utils/general";
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
import { Channel, DemoFeedback } from "src";
import {
  IconChartHistogram,
  IconMoodEmpty,
  IconMoodCry,
  IconMoodSad,
  IconMoodSmile,
  IconMoodHappy,
  IconMoodCrazyHappy,
  IconMoodWrrr,
} from "@tabler/icons-react";
import getDemoFeedback from "@utils/requests/getDemoFeedback";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useState } from "react";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import DemoFeedbackBarChart from "./DemoFeedbackBarChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ratingToLabel = (rating: string) => {
  if (rating === "0/5") {
    return "Terrible";
  } else if (rating === "1/5") {
    return "Poor";
  } else if (rating === "2/5") {
    return "Fair";
  } else if (rating === "3/5") {
    return "Good";
  } else if (rating === "4/5") {
    return "Great";
  } else if (rating === "5/5") {
    return "Excellent";
  } else {
    return "";
  }
};
const ratingToIcon = (rating: string) => {
  const size = "1.3rem";
  if (rating === "1/5") {
    return <IconMoodCry size={size} />;
  } else if (rating === "2/5") {
    return <IconMoodSad size={size} />;
  } else if (rating === "3/5") {
    return <IconMoodSmile size={size} />;
  } else if (rating === "4/5") {
    return <IconMoodHappy size={size} />;
  } else if (rating === "5/5") {
    return <IconMoodCrazyHappy size={size} />;
  } else if (rating === "0/5") {
    return <IconMoodWrrr size={size} />;
  } else {
    return <IconMoodEmpty size={size} />;
  }
};

export default function DemoFeedbackChart() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "demo_date",
    direction: "desc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
  };

  // Prospect Drawer
  const [_opened, setDrawerOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-demo-feedback`, { sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { sortStatus }] = queryKey;

      const response = await getDemoFeedback(userToken);
      let results =
        response.status === "success" ? (response.data as DemoFeedback[]) : [];

      // Sort data
      results = _.sortBy(results, sortStatus.columnAccessor);
      return sortStatus.direction === "desc" ? results.reverse() : results;
    },
    refetchOnWindowFocus: false,
  });

  const chartData = new Map()
    .set("Terrible", 0)
    .set("Poor", 0)
    .set("Fair", 0)
    .set("Good", 0)
    .set("Great", 0)
    .set("Excellent", 0);

  // Count & Map rating to table rating labels
  for (const d of data || []) {
    let ratingLabel = ratingToLabel(d.rating);
    chartData.set(ratingLabel, chartData.get(ratingLabel) + 1);
  }

  // Filter table data by selected bar
  let tableData = [];
  if (selectedBar !== null) {
    const selectedRating = [...chartData.keys()][selectedBar];
    tableData =
      data?.filter((d) => ratingToLabel(d.rating) === selectedRating) ?? [];
    tableData = tableData?.sort((a, b) => {
      return a.demo_date < b.demo_date ? -1 : 1;
    });
  } else {
    tableData = data ?? [];
  }

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
    <>
      <div>
        <Tabs
          color="green"
          variant="pills"
          radius="xs"
          defaultValue="cumulative-sdr"
        >
          <Tabs.List>
            <Tabs.Tab
              value="cumulative-sdr"
              icon={<IconChartArcs size="0.8rem" />}
            >
              Cumulative SDR Demos
            </Tabs.Tab>
            <Tabs.Tab
              value="demo-satisfaction"
              icon={<IconChartAreaFilled size="0.8rem" />}
            >
              Demo Satisfaction
            </Tabs.Tab>
            <Tabs.Tab
              value="cumulative-company"
              icon={<IconChartArrows size="0.8rem" />}
            >
              Cumulative Company Demos
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="cumulative-sdr" pt="xs">
            <Divider mt="xs" mb="xs" />
            <MantineTitle mb="0" order={3}>
              Your Cumulative Demos
            </MantineTitle>
            <Text mb="md">
              This chart shows the cumulative number of demos you've given
              feedback for.
            </Text>
            <DemoFeedbackLineChart sdrOnly={false} />
          </Tabs.Panel>

          <Tabs.Panel value="demo-satisfaction" pt="xs">
            <Divider mt="xs" mb="xs" />
            <MantineTitle mb="0" order={3}>
              Demo Satisfaction
            </MantineTitle>
            <Text mb="md">
              This chart shows the average satisfaction rating for each demo.
            </Text>
            <DemoFeedbackBarChart
              data={data}
              selectedBar={selectedBar}
              setSelectedBar={setSelectedBar}
              chartData={chartData}
              theme={theme}
              valueToColor={valueToColor}
            />
          </Tabs.Panel>

          <Tabs.Panel value="cumulative-company" pt="xs">
            <Divider mt="xs" mb="xs" />
            <MantineTitle mb="0" order={3}>
              Cumulative Company Demos
            </MantineTitle>
            <Text mb="md">
              This chart shows the cumulative number of demos all your
              colleagues have given feedback for.
            </Text>
            <DemoFeedbackLineChart sdrOnly={true} />
          </Tabs.Panel>
        </Tabs>
      </div>

      <DataTable
        height={600}
        verticalAlignment="top"
        loaderColor="teal"
        fetching={isFetching}
        noRecordsText={"No demos found"}
        columns={[
          {
            accessor: "demo_date",
            title: "Contact",
            sortable: true,
            width: 300,
            render: ({
              prospect_id,
              prospect_img_url,
              prospect_name,
              demo_date,
            }) => (
              <Paper
                p="xs"
                withBorder
                radius="md"
                sx={(theme) => ({
                  position: "relative",
                  cursor: "pointer",
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.colors.gray[0],
                  "&:hover": {
                    filter:
                      theme.colorScheme === "dark"
                        ? "brightness(135%)"
                        : "brightness(95%)",
                  },
                })}
                onClick={() => {
                  setProspectId(prospect_id);
                  setDrawerOpened(true);
                }}
              >
                <Flex justify="space-between">
                  <div>
                    <Avatar size="md" radius="xl" src={proxyURL(prospect_img_url)} />
                  </div>
                  <div style={{ flexGrow: 1, marginLeft: 10 }}>
                    <Text fw={700} fz="sm">
                      Demo with {prospect_name}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {convertDateToLocalTime(new Date(demo_date))}
                    </Text>
                  </div>
                </Flex>
              </Paper>
            ),
          },
          {
            accessor: "status",
            title: "Status",
            sortable: true,
            width: 100,
            render: ({ status }) => (
              <Text>
                <Badge
                  color={valueToColor(
                    theme,
                    formatToLabel(status === "OCCURRED" ? "Complete" : status)
                  )}
                  variant="light"
                >
                  {formatToLabel(status === "OCCURRED" ? "Complete" : status)}
                </Badge>
              </Text>
            ),
          },
          {
            accessor: "rating",
            title: "Rating",
            sortable: true,
            width: 100,
            render: ({ rating, status }) => (
              <Text>
                {
                  <Flex gap={5}>
                    <Text
                      color={
                        theme.colors[
                          valueToColor(theme, ratingToLabel(rating))
                        ][7]
                      }
                    >
                      {ratingToIcon(rating)}
                    </Text>
                    <Text>{ratingToLabel(rating)}</Text>
                  </Flex>
                }
              </Text>
            ),
          },
          {
            accessor: "feedback",
            title: "Notes",
          },
        ]}
        records={tableData}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
      />
    </>
  );
}
