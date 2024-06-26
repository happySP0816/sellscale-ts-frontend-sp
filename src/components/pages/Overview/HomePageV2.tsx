import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Loader,
  Paper,
  Switch,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";

import WhiteLogo from "../../../../public/favicon.svg";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { DatePickerInput } from "@mantine/dates";
import {
  IconCalendar,
  IconCircle,
  IconInfoCircle,
  IconPoint,
} from "@tabler/icons";
import { useEffect, useState } from "react";
import TodayActivityV2 from "./TodayActivityV2";
import { CampaignAnalyticsData } from "@common/campaigns/CampaignAnalytics";
import { isLoggedIn } from "@auth/core";
import { getPersonasActivity } from "@utils/requests/getPersonas";
import { useDisclosure } from "@mantine/hooks";
import { Line } from "react-chartjs-2";
import { API_URL } from "@constants/data";
import OperatorDashboard, { Task } from "./OperatorDash/OperatorDash";
import OperatorDashboardV2 from "./OperatorDashV2";
import PipelineOverviewV2 from "./PipelineOverviewV2";
import CampaignUtilization from "./CampaignUtilizationV2";
import UnreadInboxes from "./UnreadInboxes";
import PositiveResponses from "./PositiveResponses";
import moment from "moment";
import { size } from "lodash";

export interface TodayActivityData {
  totalActivity: number;
  newOutreach: number;
  newBumps: number;
  newReplies: number;
}

export function LineChart() {
  const [currentMode, setCurrentMode] = useState("month");
  const [modes, setModes]: any = useState({});
  const [fetchedModes, setFetchedModes] = useState(false);
  const [isCumulativeMode, setIsCumulativeMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const userToken = useRecoilState(userTokenState);

  useEffect(() => {
    if (!fetchedModes) {
      fetch(`${API_URL}/analytics/outreach_over_time`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken[0]}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('data is', data)
          setModes(data.outreach_over_time || {});
          setLoading(false);
        });

      setFetchedModes(true);
    }
  }, [fetchedModes]);

  const getCumulativeData = (data: any) => {
    if (!data) return [];
    let cumulative = 0;
    return data.map((value: any) => {
      cumulative += value;
      return cumulative;
    });
  };

  const removeWeekendData = (data: any, labels: any) => {
    const filteredData = [];
    const filteredLabels = [];
    for (let i = 0; i < labels.length; i++) {
      const date = new Date(labels[i]);
      const dayOfWeek = date.getDay();
      const isSpecificWeekend = (date.getFullYear() === 2024 && date.getMonth() === 5 && (date.getDate() === 8 || date.getDate() === 9));
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isSpecificWeekend) { // 0 is Sunday, 6 is Saturday
        filteredData.push(data[i]);
        filteredLabels.push(labels[i]);
      }
    }
    console.log('data is', filteredData, filteredLabels);
    return { filteredData, filteredLabels };
  };

  const processData = (data: any, labels: any) => {
    const { filteredData, filteredLabels } = removeWeekendData(data, labels);
    if (!isCumulativeMode) {
      return { data: filteredData, labels: filteredLabels };
    }
    return { data: getCumulativeData(filteredData), labels: filteredLabels };
  };

  const theme = useMantineTheme();

  let demosData = [];
  let demosLabels = [];
  let positiveRepliesData = [];
  let positiveRepliesLabels = [];
  let repliesData = [];
  let repliesLabels = [];
  let acceptancesData = [];
  let acceptancesLabels = [];
  let outboundData = [];
  let outboundLabels = [];

  if (!loading) {
    ({ data: demosData, labels: demosLabels } = processData(modes[currentMode]?.data.demos, modes[currentMode]?.labels));
    ({ data: positiveRepliesData, labels: positiveRepliesLabels } = processData(modes[currentMode]?.data.positive_replies, modes[currentMode]?.labels));
    ({ data: repliesData, labels: repliesLabels } = processData(modes[currentMode]?.data.replies, modes[currentMode]?.labels));
    ({ data: acceptancesData, labels: acceptancesLabels } = processData(modes[currentMode]?.data.acceptances, modes[currentMode]?.labels));
    ({ data: outboundData, labels: outboundLabels } = processData(modes[currentMode]?.data.outbound, modes[currentMode]?.labels));
  }

  const chartData = {
    labels: demosLabels, // Assuming all labels are the same after filtering weekends
    datasets: [
      {
        label: "Total Demos",
        data: demosData,
        backgroundColor: theme.colors.green[2],
        borderColor: theme.colors.green[6],
        borderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.colors.green[6],
      },
      {
        label: "Total Positive Replies",
        data: positiveRepliesData,
        backgroundColor: theme.colors.grape[2],
        borderColor: theme.colors.grape[6],
        borderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.colors.grape[6],
      },
      {
        label: "Total Replies",
        data: repliesData,
        backgroundColor: theme.colors.blue[2],
        borderColor: theme.colors.blue[6],
        borderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.colors.blue[6],
      },
      {
        label: "Total Acceptances",
        data: acceptancesData,
        backgroundColor: theme.colors.red[2],
        borderColor: theme.colors.red[6],
        borderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.colors.red[6],
      },
      {
        label: "Total Outbound Volume",
        data: outboundData,
        backgroundColor: theme.colors.yellow[2],
        borderColor: theme.colors.yellow[6],
        borderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.colors.yellow[6],
      },
    ],
  };

  const options: any = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
          display: true,
        },
      },
    },
  };

  return (
    <Card
      shadow="md"
      withBorder
      py={15}
      px={20}
      style={{ border: "2px solid #f6f4f7", borderRadius: "6px" }}
      w={"100%"}
    >
      <Flex align={"center"} gap={"sm"} justify={"space-between"}>
        <Text fw={700} size={"lg"}>
          Total Outbound
        </Text>
        <Flex align={"center"} gap={"sm"}>
          <Switch
            size="xs"
            color="blue"
            labelPosition="left"
            label="Show Cumulative:"
            checked={isCumulativeMode}
            onChange={(event) =>
              setIsCumulativeMode(event.currentTarget.checked)
            }
            styles={{
              root: {
                border: "1px solid #e9ecef",
                borderRadius: "5px",
                padding: "9px",
              },
              label: {
                color: "gray",
                fontWeight: 500,
              },
            }}
          />
          <Flex>
            <Box style={{ border: "1px solid #e9ecef" }}>
              {["week", "month", "year"].map((mode) => (
                <Button
                  onClick={() => setCurrentMode(mode)}
                  size="sm"
                  color={currentMode === mode ? "green" : "gray"}
                  variant={currentMode === mode ? "outline" : "subtle"}
                  key={mode}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <Box h={400} mt={"sm"}>
        {loading ? <Loader /> : <Line data={chartData} options={options} />}
      </Box>
    </Card>
  );
}

export default function HomePageV2() {
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);

  const [value, setValue] = useState<moment.Moment>(moment());

  const [numOperatorDashItems, setNumOperatorDashItems] = useState(0);
  const [request, setRequest] = useState("");

  const [
    campaignAnalyticData,
    setCampaignAnalyticData,
  ] = useState<CampaignAnalyticsData>({
    sentOutreach: 0,
    accepted: 0,
    activeConvos: 0,
    demos: 0,
  });

  const [aiActivityData, setAiActivityData] = useState<TodayActivityData>({
    totalActivity: 0,
    newOutreach: 0,
    newBumps: 0,
    newReplies: 0,
  });

  const fetchCampaignPersonas = async () => {
    if (!isLoggedIn()) return;

    // Get AI Activity
    const response3 = await getPersonasActivity(userToken);
    console.log(response3);
    const result3 = response3.status === "success" ? response3.data : [];
    if (result3.activities && result3.activities.length > 0) {
      const newOutreach = result3.activities[0].messages_sent;
      const newBumps = result3.activities[0].bumps_sent;
      const newReplies = result3.activities[0].replies_sent;
      const totalActivity = newOutreach + newBumps + newReplies;
      const activity_data = {
        totalActivity: totalActivity,
        newOutreach: newOutreach,
        newBumps: newBumps,
        newReplies: newReplies,
      };
      setAiActivityData(activity_data);
    }

    if (result3.overall_activity && result3.overall_activity.length > 0) {
      const sentOutreach = result3.overall_activity[0].sent_outreach;
      const emailOpened = result3.overall_activity[0].email_opened;
      const activeConvo = result3.overall_activity[0].active_convo;
      const demoSet = result3.overall_activity[0].demo_set;
      const analytics_data = {
        sentOutreach: sentOutreach,
        accepted: emailOpened,
        activeConvos: activeConvo,
        demos: demoSet,
      };
      setCampaignAnalyticData(analytics_data);
    }
  };

  useEffect(() => {
    fetchCampaignPersonas();
  }, []);

  return (
    <Flex
      p={"lg"}
      maw={"1250px"}
      gap={"md"}
      direction={"column"}
      ml="auto"
      mr="auto"
    >
      <Flex align={"center"} justify={"space-between"}>
        <Flex gap={"sm"} align={"center"}>
          <img src={WhiteLogo} className="w-[20px] h-[20px]" />
          <Text fw={600} size={"xl"}>
            Hey {userData.sdr_name}, here's your overview
          </Text>
        </Flex>
        <DatePickerInput
          icon={
            <IconCalendar
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          }
          w={200}
          value={value.toDate()}
          onChange={(value) => setValue(moment(value))}
          disabled
        />
      </Flex>
      <TodayActivityV2 aiActivityData={aiActivityData} />
      <Flex gap={"lg"}>
        <LineChart />
          <OperatorDashboardV2
            onOperatorDashboardEntriesChange={(task: Task[]) => {
              setNumOperatorDashItems(task.length);
            }}
          />
      </Flex>
      <PipelineOverviewV2 />
      <CampaignUtilization />
      <UnreadInboxes />
      <PositiveResponses />
    </Flex>
  );
}
