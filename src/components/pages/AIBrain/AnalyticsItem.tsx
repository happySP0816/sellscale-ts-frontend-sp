import React, { useEffect, useState } from 'react';
import { ScrollArea, Flex, Text, Button, Paper, Box, Divider, Center, Loader, Badge, SimpleGrid, ActionIcon } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { IconSparkles, IconSend, IconChecks, IconMessageCheck, IconCalendar, IconChevronLeft, IconChevronRight, IconUser, IconMessages, IconLetterT, IconToggleRight, IconExternalLink, IconBallpen } from '@tabler/icons-react';
import { openContextModal } from '@mantine/modals';
import { DataGrid } from "mantine-data-grid";

const AnalyticsItem = ({ dailyData, templateAnalytics, topIcpPeople, summaryData }: any) => {

  const thereExistsICPData = topIcpPeople && topIcpPeople.length > 0;
  const thereExistsPositiveReplies = dailyData && dailyData.reduce((total: any, day: { num_pos_replies: any; }) => total + day.num_pos_replies, 0) > 0;
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
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'LABEL',
        },
        type: 'logarithmic',
        position: 'left',
        ticks: {
          min: 0.1,
          max: 1000,
          callback: function (value: { toString: () => any; }) {
            return Number(value.toString());
          }
        },
        afterBuildTicks: function (chartObj: { ticks: number[]; }) {
          chartObj.ticks = [];
          chartObj.ticks.push(0.1);
          chartObj.ticks.push(1);
          chartObj.ticks.push(10);
          chartObj.ticks.push(100);
          chartObj.ticks.push(1000);
        }
      }],
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

  return (
    <Box>
      {dailyData.reduce((total: any, day: { num_sent: any; }) => total + day.num_sent, 0) ? (
        <Flex
          gap={"sm"}
          p={"sm"}
          style={{
            borderTop: "1px solid #228be6",
          }}
          direction={"column"}
        >
          <Flex align={"center"} justify={"space-between"} w={"100%"}>
            <Text fw={700} size="xl">Analytics for {summaryData?.archetype}</Text>
          </Flex>
          <Flex gap={"sm"}>
            <Paper w={"100%"} h={300} withBorder radius={"md"}>
              {dailyData ? (
                <Line
                  typeof="linear"
                  data={{
                    labels: dailyData
                      .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((day: { date: string | number | Date; }) => new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [
                      {
                        label: "Send",
                        data: getCumulativeData(dailyData
                          .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((day: { num_sent: any; }) => day.num_sent)),
                        fill: false,
                        borderColor: "#55c2c1",
                        backgroundColor: "#55c2c1",
                      },
                      {
                        label: "Open",
                        data: getCumulativeData(dailyData
                          .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((day: { num_opens: any; }) => day.num_opens)),
                        fill: false,
                        borderColor: "#e9be4d",
                        backgroundColor: "#e9be4d",
                      },
                      {
                        label: "Reply",
                        data: getCumulativeData(dailyData
                          .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((day: { num_replies: any; }) => day.num_replies)),
                        fill: false,
                        borderColor: "#228be6",
                        backgroundColor: "#228be6",
                      },
                      {
                        label: "Demo",
                        data: getCumulativeData(dailyData
                          .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((day: { num_demos: any; }) => day.num_demos)),
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
            <Box w={"55%"}>
              <Paper w={"100%"} withBorder>
                <Flex align={"center"} justify={"space-between"} h={"100%"} w="100%">
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"80%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
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
                    <Flex align={"center"} gap={"sm"}>
                      <Text fz={24}>
                        {dailyData.reduce((total: number, day: any) => total + day.num_sent, 0)}
                      </Text>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"80%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
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
                    <Flex align={"center"} gap={"sm"}>
                      <Text fz={24}>{dailyData.reduce((total: number, day: any) => total + day.num_opens, 0)}</Text>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"80%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
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
                    <Flex align={"center"} gap={"sm"}>
                      <Text fz={24}>{dailyData.reduce((total: number, day: any) => total + day.num_replies, 0)}</Text>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"100%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
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
                    <Flex align={"center"} gap={"sm"}>
                      <Text fz={24}>{dailyData.reduce((total: number, day: any) => total + day.num_pos_replies, 0)}</Text>
                    </Flex>
                  </Box>
                  <Divider orientation="vertical" />
                  <Box
                    py={"sm"}
                    px={"xs"}
                    w={"80%"}
                    h={"100%"}
                    sx={{
                      backgroundColor: "",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      "&:hover": {
                        backgroundColor: "#F7FDFF",
                      },
                    }}
                  >
                    <Flex align={"center"} gap={6}>
                      <IconCalendar size={"0.9rem"} color={"#3B85EF"} className="mb-[2px]" />
                      <Text fw={400}>Demo</Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"}>
                      <Text fz={24}>{dailyData.reduce((total: number, day: any) => total + day.num_demos, 0)}</Text>
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
                  {dailyData && <DataGrid
                    data={dailyData
                      .filter((day: any) => day.positive_reply_details)
                      .map((day: any) => {
                        const [id, name, intent, reply] = day.positive_reply_details[0].split("###");
                        return { id, name, intent, reply };
                      })
                      .slice(sentimentPage * 2, sentimentPage * 2 + 2)}
                    highlightOnHover
                    withSorting
                    withColumnBorders
                    withBorder
                    mt={"md"}
                    sx={{
                      cursor: "pointer",
                      "& .mantine-10xyzsm>tbody>tr>td": {
                        padding: "0px",
                      },
                      "& tr": {
                        background: "white",
                      },
                    }}
                    columns={[
                      {
                        accessorKey: "name",
                        header: () => (
                          <Flex align={"center"} gap={"3px"}>
                            <IconUser color="gray" size={"0.9rem"} />
                            <Text color="gray">Name</Text>
                          </Flex>
                        ),
                        minSize: 200,
                        cell: (cell) => {
                          let { name } = cell.row.original;

                          return (
                            <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                              <Text color="gray" size={"sm"}>
                                {name}
                              </Text>
                            </Flex>
                          );
                        },
                      },
                      {
                        accessorKey: "reply",
                        header: () => (
                          <Flex align={"center"} gap={"3px"}>
                            <IconMessages color="gray" size={"0.9rem"} />
                            <Text color="gray">Replies</Text>
                          </Flex>
                        ),
                        minSize: 200,
                        cell: (cell) => {
                          let { reply } = cell.row.original;

                          return (
                            <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                              <Text color="gray" size={"sm"}>
                                {reply}
                              </Text>
                            </Flex>
                          );
                        },
                      },
                      {
                        accessorKey: "intent",
                        minSize: 40,
                        maxSize: 120,
                        header: () => (
                          <Flex align={"center"} gap={"3px"}>
                            <IconLetterT color="gray" size={"0.9rem"} />
                            <Text color="gray">Intent</Text>
                          </Flex>
                        ),
                        cell: (cell) => {
                          let { intent } = cell.row.original;

                          return (
                            <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                              <Badge color={'green'} tt={"initial"}>
                                {intent}
                              </Badge>
                            </Flex>
                          );
                        },
                      },
                      {
                        accessorKey: "action",
                        header: () => (
                          <Flex align={"center"} gap={"3px"}>
                            <IconToggleRight color="gray" size={"0.9rem"} />
                            <Text color="gray">Action</Text>
                          </Flex>
                        ),
                        minSize: 180,
                        maxSize: 200,
                        enableResizing: true,
                        cell: (cell) => {
                          let { id } = cell.row.original as any;
                          return (
                            <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
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
                                href={`/prospects/${id}`}
                                target="_blank"
                              >
                                View Conversation
                              </Badge>
                            </Flex>
                          );
                        },
                      },
                    ]}
                  />}
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
          { thereExistsICPData && <Paper>
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
         
              </Text>
              <Divider w={"100%"} />
              <Flex>
              </Flex>
            </Flex>
            <SimpleGrid cols={5} mt={"sm"}>
              {Array.from(new Set(topIcpPeople?.map((icpItem: { full_name: any; }) => icpItem.full_name)))
                .map((uniqueName) => {
                  if (typeof uniqueName === 'string') {
                    return topIcpPeople?.find((icpItem: { full_name: string; }) => icpItem.full_name === uniqueName);
                  }
                  return undefined;
                })
                .filter(icpItem => icpItem !== undefined) // Ensure no undefined values
                .map((icpItem, icpIndex) => {
                  return (
                    <Paper withBorder radius={"md"} key={icpIndex}>
                      <Flex direction={"column"} mt={4} align={"center"} p={"sm"} justify={"space-between"} gap={4}>
                        <Text size={"sm"} align="center" fw={600}>
                          {icpItem.full_name}
                        </Text>
                        <Text color="gray" size={"xs"} align="center" fw={600}>
                          {icpItem.job}
                        </Text>
                        <Flex align={"center"} gap={"xs"}>
                          <Text size={"sm"} color="gray">
                            ICP Fit Score:
                          </Text>
                          <Badge size="xs" color={
                            icpItem.icp_fit_score == 0 ? "red" :
                              icpItem.icp_fit_score == 1 ? "orange" :
                                icpItem.icp_fit_score == 2 ? "yellow" :
                                  icpItem.icp_fit_score == 3 ? "green" :
                                    icpItem.icp_fit_score == 4 ? "blue" : "gray"
                          }>{
                              icpItem.icp_fit_score == 0 ? "Very Low" :
                                icpItem.icp_fit_score == 1 ? "Low" :
                                  icpItem.icp_fit_score == 2 ? "Medium" :
                                    icpItem.icp_fit_score == 3 ? "High" :
                                      icpItem.icp_fit_score == 4 ? "Very High" : "Not Scored"
                            }</Badge>
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
                      </Flex>
                    </Paper>
                  );
                })}
            </SimpleGrid>
          </Paper> }
        </Flex>
      ) : (
       <></>
      )}
    </Box>
  );
};

export default AnalyticsItem;
