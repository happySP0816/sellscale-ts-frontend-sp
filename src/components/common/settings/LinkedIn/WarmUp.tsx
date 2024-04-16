import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Button,
  Flex,
  Text,
  Grid,
  Badge,
  Popover,
  Center,
  Container,
  Divider,
  HoverCard,
  Box,
} from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  IconChecks,
  IconMessageCheck,
  IconMoodSmile,
  IconPencil,
  IconSend,
} from "@tabler/icons-react";
import getSDRSLASchedules from "@utils/requests/getSDRSLASchedules";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useRecoilValue } from "recoil";
import annotationPlugin from "chartjs-plugin-annotation";
import WarmupScheduleModal from "./WarmupScheduleModal/WarmupScheduleModal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Filler,
  Tooltip,
  annotationPlugin
);

export const WarmUp: React.FC = () => {
  const userData = useRecoilValue(userDataState);

  const options: any = {
    scales: {
      xAxis: {
        border: {
          display: true,
        },
        grid: {
          color: "transparent",
        },
      },
      yAxis: {
        grid: {
          tickBorderDash: [2],
          color: "#88888830",
        },
        border: {
          display: false,
          dash: [2],
        },
        display: true,
        ticks: {
          padding: 10,
          color: "#888888",
          font: {
            weight: 300,
          },
        },
        beginAtZero: true,
        grace: "5%",
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        displayColors: false,
      },
      annotation: {
        annotations: {
          line1: {
            borderDash: [10],
            label: {
              content: "Warmup Complete",
              backgroundColor: "rgb(255, 99, 132)",
              display: true,
            },
            type: "line",
            yMin: userData.weekly_li_outbound_target,
            yMax: userData.weekly_li_outbound_target,
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
          },
        },
      },
    },
    barPercentage: 1,
    responsive: true,
    maintainAspectRatio: false,
  };

  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [slaScheduleData, setSLAScheduleData] = useState<any>();

  // We get start date to be 3 weeks before this monday
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 21);
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

  const [opened, { close, open }] = useDisclosure(false);

  const triggerGetSLASchedules = async () => {
    setLoading(true);

    const result = await getSDRSLASchedules(userToken, startDate.toISOString());
    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Failed to get outbound volume data",
        color: "red",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    let resultData = result.data?.schedules?.reverse();

    // Sort the resultData by week number (ascending)
    resultData.sort((a: any, b: any) => {
      return a.week - b.week;
    });

    const data = {
      labels: resultData.map((schedule: any) => {
        const startDate = new Date(schedule.start_date);
        const endDate = new Date(schedule.end_date);

        // See if the Start Date is this current week
        if (startDate <= new Date() && endDate >= new Date()) {
          return `Week ${schedule.week} (Current Week)`;
        }

        const week = schedule.week;
        return `Week ${week}`;
      }),
      dates: resultData.map((schedule: any) => ({
        start_date: schedule.start_date,
        end_date: schedule.end_date,
      })),
      datasets: [
        {
          label: "Outbound Goal",
          data: resultData.map((schedule: any) => schedule.linkedin_volume),
          backgroundColor: resultData.map((schedule: any) => {
            const startDate = new Date(schedule.start_date);
            const endDate = new Date(schedule.end_date);

            // See if the Start Date is this current week
            if (startDate <= new Date() && endDate >= new Date()) {
              // See if warmup is complete
              if (
                schedule.linkedin_volume >= userData.weekly_li_outbound_target
              ) {
                return "rgb(99,215,104)";
              }
              return "rgb(242, 169, 59)";
            }

            // See if the Start Date is a future week
            if (startDate > new Date()) {
              // See if warmup is complete
              if (
                schedule.linkedin_volume >= userData.weekly_li_outbound_target
              ) {
                return "rgb(99,215,104, 0.5)";
              }

              return "rgb(242, 169, 59, 0.5)";
            }

            // See if the Start Date is a past week
            if (endDate < new Date()) {
              // See if warmup is complete
              if (
                schedule.linkedin_volume >= userData.weekly_li_outbound_target
              ) {
                return "rgb(99,215,104, 0.5)";
              }

              return "rgb(99,215,104, 0.1)";
            }
          }),
          fill: true,
          yAxisID: "yAxis",
          xAxisID: "xAxis",
          borderRadius: 4,
        },
      ],
      scheduleIDs: resultData.map((schedule: any) => schedule.id),
      linkedinSpecialNotes: resultData.map((schedule: any) => schedule.linkedin_special_notes),
    };

    setSLAScheduleData(data);
    setLoading(false);
  };

  useEffect(() => {
    triggerGetSLASchedules();
  }, []);

  return (
    <>
      <Flex direction={"column"} mb={"2rem"} w="100%">
        <Flex align={"center"} mb={"0.5rem"} gap={"0.5rem"}>
          <Flex justify="space-between" align={"center"} w={"100%"}>
            <Text fw={"500"} fz={"1rem"}>
              Outbound Volume
            </Text>

            <Button
              onClick={open}
              radius={"md"}
              leftIcon={<IconPencil size="0.9rem" />}
            >
              Edit Warmup Schedule
            </Button>
          </Flex>
          {userData?.warmup_linkedin_complete ? (
            <></>
          ) : (
            <HoverCard
              withArrow
              withinPortal
              styles={{
                dropdown: {
                  border: "1px solid orange",
                  borderRadius: "0.5rem",
                },
                arrow: {
                  borderColor: "orange",
                },
              }}
            >
              <HoverCard.Target>
                <Badge variant="light" size="md" color="orange">
                  Warming Up
                </Badge>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Box w={400}>
                  <Text size="lg" weight="700">
                    Warming Up
                  </Text>
                  <Text mt="xs">
                    In order to protect your LinkedIn, our AI follows a set of
                    outbound heuristics specific to your account. This enables
                    us to slowly "warm up" your LinkedIn account before sending
                    full volume outbound.
                  </Text>
                  <Text mt="xs">
                    The following is a sample "warmup schedule". Reference the
                    graph for the exact, AI-determined schedule, and if you
                    would like to make adjustments, please contact a SellScale
                    team member:
                  </Text>
                  <Text mt="md">
                    <Box>
                      <Flex>
                        <Text fw="bold" w="150px">
                          Week 0:
                        </Text>
                        <Text>5 connections</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex>
                        <Text fw="bold" w="150px">
                          Week 1:
                        </Text>
                        <Text>25 connections</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex>
                        <Text fw="bold" w="150px">
                          Week 2:
                        </Text>
                        <Text>50 connections</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex>
                        <Text fw="bold" w="150px">
                          Week 3:
                        </Text>
                        <Text>75 connections</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Flex>
                        <Text fw="bold" w="150px">
                          Week 4:
                        </Text>
                        <Text>90 connections</Text>
                      </Flex>
                    </Box>
                  </Text>
                </Box>
              </HoverCard.Dropdown>
            </HoverCard>
          )}
        </Flex>
        <Text c={"gray.6"} fz={"0.75rem"} mb={"1rem"}>
          The following graph shows your historical and future outbound volumes.
        </Text>

        {slaScheduleData ? (
          <Flex
            h={"100%"}
            direction={"column"}
            align={"flex-start"}
            justify={"flex-end"}
          >
            <Bar options={options} data={slaScheduleData} height={360} />
          </Flex>
        ) : (
          <Flex></Flex>
        )}
      </Flex>

      <WarmupScheduleModal
        opened={opened}
        onClose={close}
        data={{
          labels: slaScheduleData?.labels.slice().reverse(),
          volume: slaScheduleData?.datasets[0]?.data.slice().reverse(),
          dates: slaScheduleData?.dates.slice().reverse(),
          ids: slaScheduleData?.scheduleIDs.slice().reverse(),
          linkedinSpecialNotes: slaScheduleData?.linkedinSpecialNotes.slice().reverse(),
        }}
        backFunction={triggerGetSLASchedules}
      />
    </>
  );
};
