import React, { useEffect, useState } from "react";
import {
  ScrollArea,
  Flex,
  Text,
  Button,
  Paper,
  Box,
  Divider,
  Center,
  Loader,
  Badge,
  SimpleGrid,
  ActionIcon,
  Popover,
  Pagination,
  NumberInput,
  Avatar,
} from "@mantine/core";
import { Line } from "react-chartjs-2";
import {
  IconSparkles,
  IconSend,
  IconChecks,
  IconMessageCheck,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconMessages,
  IconLetterT,
  IconToggleRight,
  IconExternalLink,
  IconBallpen,
} from "@tabler/icons-react";
import { openContextModal } from "@mantine/modals";
import { DataGrid } from "mantine-data-grid";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowRight } from "@tabler/icons";

const AnalyticsItem = ({ dailyData, templateAnalytics, topIcpPeople, summaryData, showCumulative }: any) => {
  const thereExistsICPData = topIcpPeople && topIcpPeople.length > 0;
  const thereExistsPositiveReplies = dailyData && dailyData.reduce((total: any, day: { num_pos_replies: any }) => total + day.num_pos_replies, 0) > 0;
  const getCumulativeData = (data: any[]) => {
    if (!data) return [];
    let cumulative = 0;
    return data.map((value) => {
      cumulative += value;
      return cumulative;
    });
  };

  const Spendingoptions = {
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
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "LABEL",
          },
          type: "logarithmic",
          position: "left",
          ticks: {
            min: 0.1,
            max: 1000,
            callback: function (value: { toString: () => any }) {
              return Number(value.toString());
            },
          },
          afterBuildTicks: function (chartObj: { ticks: number[] }) {
            chartObj.ticks = [];
            chartObj.ticks.push(0.1);
            chartObj.ticks.push(1);
            chartObj.ticks.push(10);
            chartObj.ticks.push(100);
            chartObj.ticks.push(1000);
          },
        },
      ],
    },
    elements: {
      point: {
        radius: 1,
      },
      line: {
        tension: 0.4,
      },
    },
  };

  const [sentimentPage, setSentimentPage] = useState(0);
  const [openedPopover, setOpenedPopover] = useState<string | null>(null);

  return (
    <Box>
      {dailyData?.reduce((total: any, day: { num_sent: any }) => total + day.num_sent, 0) ? (
        <Flex
          gap={"sm"}
          p={"sm"}
          style={{
            borderTop: "1px solid #228be6",
          }}
          direction={"column"}
        >
          <Flex align={"center"} justify={"space-between"} w={"100%"}>
            {showCumulative ? (
              <Text fw={700} size="xl">
                Overall Cycle Analytics
              </Text>
            ) : (
              <Text fw={700} size="xl">
                {summaryData?.archetype}
              </Text>
            )}
          </Flex>
          <Flex gap={"sm"}>
            <Paper h={450} w={"100%"} withBorder radius={"md"}>
              {dailyData ? (
                <Line
                  typeof="linear"
                  data={{
                    labels: dailyData
                      .sort(
                        (a: { date: string | number | Date }, b: { date: string | number | Date }) => new Date(a.date).getTime() - new Date(b.date).getTime()
                      )
                      .map((day: { date: string | number | Date }) => new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
                    datasets: [
                      {
                        label: "Send",
                        data: getCumulativeData(
                          dailyData
                            .sort(
                              (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
                                new Date(a.date).getTime() - new Date(b.date).getTime()
                            )
                            .map((day: { num_sent: any }) => day.num_sent)
                        ),
                        fill: false,
                        borderColor: "#55c2c1",
                        backgroundColor: "#55c2c1",
                      },
                      {
                        label: "Open",
                        data: getCumulativeData(
                          dailyData
                            .sort(
                              (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
                                new Date(a.date).getTime() - new Date(b.date).getTime()
                            )
                            .map((day: { num_opens: any }) => day.num_opens)
                        ),
                        fill: false,
                        borderColor: "#e9be4d",
                        backgroundColor: "#e9be4d",
                      },
                      {
                        label: "Reply",
                        data: getCumulativeData(
                          dailyData
                            .sort(
                              (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
                                new Date(a.date).getTime() - new Date(b.date).getTime()
                            )
                            .map((day: { num_replies: any }) => day.num_replies)
                        ),
                        fill: false,
                        borderColor: "#228be6",
                        backgroundColor: "#228be6",
                      },
                      {
                        label: "Demo",
                        data: getCumulativeData(
                          dailyData
                            .sort(
                              (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
                                new Date(a.date).getTime() - new Date(b.date).getTime()
                            )
                            .map((day: { num_demos: any }) => day.num_demos)
                        ),
                        fill: false,
                        borderColor: "#ec8a0a",
                        backgroundColor: "#ec8a0a",
                      },
                    ],
                  }}
                  options={Spendingoptions as any}
                />
              ) : (
                <Center>
                  <Loader />
                </Center>
              )}
            </Paper>
            <Box w={"100%"}>
              <Paper w={"100%"} withBorder>
                <Flex align={"center"} justify={"space-between"} h={"100%"} w="100%">
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"100%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "#F7FDFF",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "start",
                      "&:hover": {
                        backgroundColor: "#F7FDFF",
                      },
                    }}
                  >
                    <Flex align={"center"} gap={"xs"}>
                      <IconSend size={"0.9rem"} color="#3B85EF" className="mb-[2px]" />
                      <Text fw={400} size={"sm"}>
                        Sent
                      </Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text fz={20} fw={600}>
                        {dailyData.reduce((total: number, day: any) => total + day.num_sent, 0)}
                      </Text>
                      <Badge>
                        {(
                          (dailyData.reduce((total: number, day: any) => total + day.num_sent, 0) /
                            dailyData.reduce(
                              (total: number, day: any) => total + day.num_sent + day.num_demos + day.num_opens + day.num_pos_replies + day.num_replies,
                              0
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </Badge>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"100%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "#FFF7FB",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "start",
                      "&:hover": {
                        backgroundColor: "#FFF7FB",
                      },
                    }}
                  >
                    <Flex align={"center"} gap={6}>
                      <IconChecks size={"0.9rem"} color="pink" className="mb-[2px]" />
                      <Text fw={400} size={"sm"}>
                        Open
                      </Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text fz={20} fw={600}>
                        {dailyData.reduce((total: number, day: any) => total + day.num_opens, 0)}
                      </Text>
                      <Badge color="pink">
                        {(
                          (dailyData.reduce((total: number, day: any) => total + day.num_opens, 0) /
                            dailyData.reduce(
                              (total: number, day: any) => total + day.num_sent + day.num_demos + day.num_opens + day.num_pos_replies + day.num_replies,
                              0
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </Badge>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"100%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "#FFF9F2",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "start",
                      "&:hover": {
                        backgroundColor: "#FFF9F2",
                      },
                    }}
                  >
                    <Flex align={"center"} gap={6}>
                      <IconMessageCheck size={"0.9rem"} color="orange" className="mb-[2px]" />
                      <Text fw={400} size={"sm"}>
                        Reply
                      </Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text fz={20} fw={600}>
                        {dailyData.reduce((total: number, day: any) => total + day.num_replies, 0)}
                      </Text>
                      <Badge color="orange">
                        {(
                          (dailyData.reduce((total: number, day: any) => total + day.num_replies, 0) /
                            dailyData.reduce(
                              (total: number, day: any) => total + day.num_sent + day.num_demos + day.num_opens + day.num_pos_replies + day.num_replies,
                              0
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </Badge>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"100%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "#F4FBF5",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "start",
                      "&:hover": {
                        backgroundColor: "#F4FBF5",
                      },
                    }}
                  >
                    <Flex align={"center"} gap={6}>
                      <IconMessageCheck size={"0.9rem"} color="green" className="mb-[2px]" />
                      <Text fw={400} size={"sm"}>
                        (+) Reply
                      </Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text fz={20} fw={600}>
                        {dailyData.reduce((total: number, day: any) => total + day.num_pos_replies, 0)}
                      </Text>
                      <Badge color="green">
                        {(
                          (dailyData.reduce((total: number, day: any) => total + day.num_pos_replies, 0) /
                            dailyData.reduce(
                              (total: number, day: any) => total + day.num_sent + day.num_demos + day.num_opens + day.num_pos_replies + day.num_replies,
                              0
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </Badge>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"100%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "#F7FDFF",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "start",
                      "&:hover": {
                        backgroundColor: "#F7FDFF",
                      },
                    }}
                  >
                    <Flex align={"center"} gap={6}>
                      <IconCalendar size={"0.9rem"} color={"#3B85EF"} className="mb-[2px]" />
                      <Text fw={400}>Demo</Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text fz={20} fw={600}>
                        {dailyData.reduce((total: number, day: any) => total + day.num_demos, 0)}
                      </Text>
                      <Badge color="blue">
                        {(
                          (dailyData.reduce((total: number, day: any) => total + day.num_demos, 0) /
                            dailyData.reduce(
                              (total: number, day: any) => total + day.num_sent + day.num_demos + day.num_opens + day.num_pos_replies + day.num_replies,
                              0
                            )) *
                          100
                        ).toFixed(0)}
                        %
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>
              </Paper>
              {dailyData
                .filter((day: any) => day.positive_reply_details)
                .map((day: any) => {
                  const [id, name, intent, reply] = day.positive_reply_details[0].split("###");
                  return { id, name, intent, reply };
                })
                .slice(sentimentPage * 2, sentimentPage * 2 + 2).length !== 0 ? (
                <Box mt={"sm"}>
                  <Flex align={"center"} gap={"5px"}>
                    <Text
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        whiteSpace: "nowrap",
                      }}
                      fw={600}
                      size={"md"}
                    >
                      <span>Positive Replies</span>
                    </Text>
                    <Divider w={"100%"} />
                    {/* <Flex>
                      <ActionIcon
                        onClick={() => {
                          if (sentimentPage > 0) setSentimentPage((page) => (page = page - 1));
                        }}
                      >
                        <IconChevronLeft />
                      </ActionIcon>
                      <ActionIcon>
                        <IconChevronRight />
                      </ActionIcon>
                    </Flex> */}
                  </Flex>
                  <Paper withBorder radius={"sm"}>
                    <ScrollArea h={300} p={"sm"} scrollbarSize={8} offsetScrollbars>
                      {dailyData &&
                        dailyData
                          .filter((day: any) => day.positive_reply_details)
                          .map((day: any) => {
                            const [id, name, intent, reply] = day.positive_reply_details[0].split("###");
                            return (
                              <Box px={"sm"} mt={"xs"}>
                                <Flex align={"center"} justify={"space-between"}>
                                  <Flex align={"center"} gap={"xs"}>
                                    <Avatar size={"sm"} src={""} radius={"xl"} />
                                    <Text fw={500} size={"sm"}>
                                      {name}
                                    </Text>
                                    <Divider orientation="vertical" />
                                    <Text fw={500} size={"sm"} color="gray">
                                      Manager @XYZ
                                    </Text>
                                  </Flex>
                                  <Text fw={500} color="gray" size={"sm"}>
                                    {5}m
                                  </Text>
                                </Flex>
                                <Text fw={400} size={"xs"} lineClamp={2}>
                                  {reply}
                                </Text>
                                <Divider mt={"xs"} />
                              </Box>
                            );
                          })}
                    </ScrollArea>
                  </Paper>
                </Box>
              ) : (
                <Box mt={"sm"}>
                  <Text fw={400} size={"sm"} color="gray">
                    No positive replies available.
                  </Text>
                </Box>
              )}
            </Box>
          </Flex>
          {thereExistsICPData && (
            <Paper>
              <Flex align={"center"} gap={"5px"}>
                <Text
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                  fw={600}
                  size={"md"}
                ></Text>
                <Divider w={"100%"} />
                <Flex></Flex>
              </Flex>
              <SimpleGrid cols={4} mt={"sm"}>
                {Array.from(new Set(topIcpPeople?.map((icpItem: { full_name: string }) => icpItem.full_name)))
                  .map((uniqueName) => {
                    if (typeof uniqueName === "string") {
                      return topIcpPeople?.find((icpItem: { full_name: string }) => icpItem.full_name === uniqueName);
                    }
                    return undefined;
                  })
                  .filter((icpItem) => icpItem !== undefined) // Ensure no undefined values
                  .sort((a, b) => b.icp_fit_score - a.icp_fit_score)
                  .slice(0, 4)
                  .map((icpItem, icpIndex) => {
                    console.log("==========", icpItem);
                    return (
                      <Paper withBorder radius={"md"} key={icpIndex} className="flex flex-col">
                        <Flex gap={"sm"} p={"sm"} h={"100%"}>
                          <Avatar size={"lg"} radius={"xl"} src={""} />
                          <Box>
                            <Text size={"xs"} fw={600}>
                              {icpItem.full_name}
                            </Text>
                            <Text size={"xs"} fw={300}>
                              {icpItem.title} @{icpItem.company}
                            </Text>
                            <Flex align={"center"} gap={"sm"} mt={"sm"}>
                              <Flex align={"center"} gap={4}>
                                <Text size={"xs"} color="gray">
                                  ICP:
                                </Text>
                                <Badge
                                  size="xs"
                                  variant="filled"
                                  color={
                                    icpItem.icp_fit_score == 0
                                      ? "red"
                                      : icpItem.icp_fit_score == 1
                                      ? "orange"
                                      : icpItem.icp_fit_score == 2
                                      ? "yellow"
                                      : icpItem.icp_fit_score == 3
                                      ? "green"
                                      : icpItem.icp_fit_score == 4
                                      ? "blue"
                                      : "gray"
                                  }
                                >
                                  {icpItem.icp_fit_score == 0
                                    ? "Very Low"
                                    : icpItem.icp_fit_score == 1
                                    ? "Low"
                                    : icpItem.icp_fit_score == 2
                                    ? "Medium"
                                    : icpItem.icp_fit_score == 3
                                    ? "High"
                                    : icpItem.icp_fit_score == 4
                                    ? "Very High"
                                    : "Not Scored"}
                                </Badge>
                              </Flex>
                              <Flex align={"center"} gap={4}>
                                <Text size={"xs"} color="gray">
                                  Click:
                                </Text>
                                <Badge variant="filled" color="grape">
                                  {5}
                                </Badge>
                              </Flex>
                            </Flex>
                          </Box>
                        </Flex>
                        <Button
                          fullWidth
                          size="xs"
                          radius={"sm"}
                          component="a"
                          href={`/prospects/${icpItem.id}`}
                          target="_blank"
                          rightIcon={<IconArrowRight size={"1rem"} color="white" />}
                          styles={{
                            root: {
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                            },
                          }}
                        >
                          View Conversation
                        </Button>
                        {/* <Flex direction={"column"} mt={4} align={"center"} p={"sm"} justify={"space-between"} gap={4}>
                          <Text size={"sm"} align="center" fw={600}>
                            {icpItem.full_name}
                          </Text>
                          <Text size={"xs"} align="center" fw={300}>
                            {icpItem.title} at {icpItem.company}
                          </Text>
                          <Text color="gray" size={"xs"} align="center" fw={600}>
                            {icpItem.job}
                          </Text>
                          <Flex align={"center"} gap={"xs"}>
                            <Text size={"sm"} color="gray">
                              ICP Score:
                            </Text>
                            <Badge
                              size="xs"
                              color={
                                icpItem.icp_fit_score == 0
                                  ? "red"
                                  : icpItem.icp_fit_score == 1
                                  ? "orange"
                                  : icpItem.icp_fit_score == 2
                                  ? "yellow"
                                  : icpItem.icp_fit_score == 3
                                  ? "green"
                                  : icpItem.icp_fit_score == 4
                                  ? "blue"
                                  : "gray"
                              }
                            >
                              {icpItem.icp_fit_score == 0
                                ? "Very Low"
                                : icpItem.icp_fit_score == 1
                                ? "Low"
                                : icpItem.icp_fit_score == 2
                                ? "Medium"
                                : icpItem.icp_fit_score == 3
                                ? "High"
                                : icpItem.icp_fit_score == 4
                                ? "Very High"
                                : "Not Scored"}
                            </Badge>
                          </Flex>
                          <Badge
                            tt={"initial"}
                            variant="filled"
                            rightSection={<IconExternalLink size={"0.9rem"} style={{ marginTop: "5px" }} />}
                            styles={{
                              root: {
                                fontWeight: 400,
                              },
                            }}
                            component="a"
                            href={`/prospects/${icpItem.id}`}
                            target="_blank"
                          >
                            View Conversation
                          </Badge>
                        </Flex> */}
                      </Paper>
                    );
                  })}
              </SimpleGrid>
            </Paper>
          )}
        </Flex>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default AnalyticsItem;
