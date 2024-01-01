import { userTokenState } from "@atoms/userAtoms";
import {
  Tabs,
  Box,
  Rating,
  createStyles,
  Card,
  Button,
  Input,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons";

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
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { DemoFeedback } from "src";
import { IconChartHistogram } from "@tabler/icons-react";
import getDemoFeedback from "@utils/requests/getDemoFeedback";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useMemo, useState } from "react";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import DemoFeedbackLineChartV2 from "./V2/DemoFeedbackLineChart";
import DemoFeedbackBarChartV2 from "./V2/DemoFeedbackBarChart";

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
const renderRating = (rating: string) => {
  const totalRating = rating.split("/")[0];

  return (
    <Flex align={"center"} h={"100%"} gap={"sm"}>
      <Flex>
        <Text fw={700}>{totalRating}</Text>
        <Text c={"gray.6"}>/5</Text>
      </Flex>
      <Rating value={Number(totalRating || 0)}></Rating>
    </Flex>
  );
};

const useStyles = createStyles((theme) => ({
  root: {
    height: "fit-content",
  },
  header: {
    "&& th": { backgroundColor: theme.colors.gray[0] },
  },
}));
export default function DemoFeedbackChartV2() {
  const [activeTab, setActiveTab] = useState<string | null>("cumulative-sdr");
  const [searchItem, setSearchItem] = useState("");
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [tableData, setTableData] = useState<DemoFeedback[]>([]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "demo_date",
    direction: "desc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
  };
  const { classes } = useStyles();
  // Prospect Drawer
  const [_opened, setDrawerOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const { data, isFetching } = useQuery({
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
    if (ratingLabel) {
      chartData.set(ratingLabel, chartData.get(ratingLabel) + 1);
    }
  }

  useEffect(() => {
    // Filter table data by selected bar
    let tempTableData: DemoFeedback[] = [];
    if (selectedBar !== null) {
      const selectedRating = [...chartData.keys()][selectedBar];
      tempTableData =
        data?.filter((d) => ratingToLabel(d.rating) === selectedRating) ?? [];
      tempTableData = tempTableData?.sort((a, b) => {
        return a.demo_date < b.demo_date ? -1 : 1;
      });
    } else {
      tempTableData = data ?? [];
    }
    setTableData(tempTableData);
  }, [selectedBar, data]);

  const filteredTableData = useMemo(() => {
    if (!searchItem) {
      return tableData;
    }

    return tableData.filter((i) =>
      i.prospect_name.toLowerCase().includes(searchItem.toLowerCase())
    );
  }, [searchItem, tableData]);

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
    <Box bg={"white"} p={"lg"}>
      <Card withBorder>
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Flex justify={"space-between"}>
            <>
              {activeTab === "cumulative-sdr" ? (
                <Flex>
                  <Text fw={700} color="gray.6" fz={"lg"}>
                    TOTAL DEMOS THIS MONTH: &nbsp;
                  </Text>
                  <Text fw={700} fz={"lg"}>
                    {tableData?.length}
                  </Text>
                </Flex>
              ) : (
                <Flex>
                  <Text fw={700} color="gray.6" fz={"lg"}>
                    DEMO SATISFACTION OUT OF &nbsp;
                  </Text>

                  <Text fw={700} fz={"lg"}>
                    {tableData?.length}
                  </Text>

                  <Text fw={700} color="gray.6" fz={"lg"}>
                    &nbsp;TOTAL DEMOS
                  </Text>
                </Flex>
              )}
            </>
            <Button.Group>
              <Button
                onClick={() => setActiveTab("cumulative-sdr")}
                color={activeTab === "cumulative-sdr" ? "blue" : "gray"}
                variant={activeTab === "cumulative-sdr" ? "filled" : "default"}
              >
                Cumulative
              </Button>
              <Button
                onClick={() => setActiveTab("demo-satisfaction")}
                color={activeTab === "demo-satisfaction" ? "blue" : "gray"}
                variant={
                  activeTab === "demo-satisfaction" ? "filled" : "default"
                }
              >
                Satisfaction
              </Button>
            </Button.Group>
          </Flex>
          <Tabs.Panel value="cumulative-sdr" pt="xs">
            <DemoFeedbackLineChartV2 sdrOnly={false} />
          </Tabs.Panel>

          <Tabs.Panel value="demo-satisfaction" pt="xs">
            <DemoFeedbackBarChartV2
              data={data}
              selectedBar={selectedBar}
              setSelectedBar={setSelectedBar}
              chartData={chartData}
              theme={theme}
              valueToColor={valueToColor}
            />
          </Tabs.Panel>
        </Tabs>
      </Card>

      <Box mt={"md"}>
        <Flex justify={"space-between"}>
          <Text fw={700}>Demos</Text>

          <Input
            rightSection={<IconSearch size={"1rem"} />}
            placeholder="Search"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
          />
        </Flex>

        <DataTable
          withBorder
          mt={"sm"}
          h="fit-content"
          verticalAlignment="top"
          loaderColor="teal"
          fetching={isFetching}
          noRecordsText={"No demos found"}
          classNames={classes}
          columns={[
            {
              accessor: "demo_date",
              title: "Date",
              sortable: true,

              render: ({ prospect_id, demo_date }) => (
                <Flex
                  w={"100%"}
                  h={"100%"}
                  align={"center"}
                  onClick={() => {
                    setProspectId(prospect_id);
                    setDrawerOpened(true);
                  }}
                >
                  <Text fw={600} fz={"sm"}>
                    {convertDateToLocalTime(new Date(demo_date))}
                  </Text>
                </Flex>
              ),
            },

            {
              accessor: "client_id",
              title: "Prospect Name",
              render: ({ prospect_img_url, prospect_name }) => (
                <Flex align={"center"} gap={"sm"}>
                  <Avatar
                    size="lg"
                    radius="xl"
                    src={proxyURL(prospect_img_url)}
                  />

                  <Box>
                    <Text fw={600} fz={"sm"}>
                      {prospect_name}
                    </Text>
                  </Box>
                </Flex>
              ),
            },
            {
              accessor: "status",
              title: "Status",

              render: ({ status }) => (
                <Flex align={"center"} h={"100%"}>
                  <Badge
                    color={valueToColor(
                      theme,
                      formatToLabel(status === "OCCURRED" ? "Complete" : status)
                    )}
                    variant="light"
                  >
                    {formatToLabel(status === "OCCURRED" ? "Complete" : status)}
                  </Badge>
                </Flex>
              ),
            },
            {
              accessor: "rating",
              title: "Rating",

              render: ({ rating }) => <>{renderRating(rating)}</>,
            },
            {
              accessor: "feedback",
              title: "Feedback",
              width: 400,
              render: ({ feedback }) => (
                <Flex align={"center"} h={"100%"}>
                  <Text
                    c={"gray.6"}
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    {feedback}
                  </Text>
                </Flex>
              ),
            },
          ]}
          records={filteredTableData}
          sortStatus={sortStatus}
          onSortStatusChange={handleSortStatusChange}
        />
      </Box>
    </Box>
  );
}
