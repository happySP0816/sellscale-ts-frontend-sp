import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Badge,
  Divider,
  Flex,
  Paper,
  SimpleGrid,
  Text,
  Switch,
  ScrollArea,
  Title,
  Center,
  Loader,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconBallpen,
  IconCalendar,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconExternalLink,
  IconLetterT,
  IconMessages,
  IconSend,
  IconToggleRight,
  IconUser,
} from "@tabler/icons";
import { IconMessageCheck, IconSparkles } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useRecoilValue } from "recoil";


export default function AnalyticsModal() {

  const [sentimentPage, setSentimentPage] = useState(0);

  const Spendingoptions: any = {
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
          min: 0.1, //minimum tick
          max: 1000, //maximum tick
          callback: function (value: { toString: () => any; }, index: any, values: any) {
            return Number(value.toString());//pass tick values as a string into Number function
          }
        },
        afterBuildTicks: function (chartObj: { ticks: number[]; }) { //Build ticks labelling as per your need
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
        tension: 0.4, // Smooth the lines for better visualization
      },
    },
  };


  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);
  const [cycleDates, setCycleDates] = useState<{ start: string, end: string }[]>([]);
  const [cycleDataCache, setCycleDataCache] = useState<{ [key: number]: any }>({});

  const getCumulativeData = (data: any) => {
    if (!data) return [];
    let cumulative = 0;
    return data.map((value: any) => {
      cumulative += value;
      return cumulative;
    });
  };

  useEffect(() => {
    const fetchCycleDates = async () => {
      if (currentProject?.id) {
        try {
          const response = await fetch(`${API_URL}/analytics/get_cycle_dates?campaignID=${currentProject.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
          });
          const data = await response.json();
          // Assuming data is an array of objects with start and end properties
          setCycleDates(data);
          console.log('dates are', data);
          console.log(data);

          // Initialize cycleDataCache with the length of cycle dates
          const initialCache = data.reduce((acc: { [key: number]: any }, _: any, index: number) => {
            acc[index] = null;
            return acc;
          }, {});
          setCycleDataCache(initialCache);
        } catch (error) {
          console.error('Error fetching cycle dates:', error);
        }
      }
    };

    fetchCycleDates();
  }, [currentProject?.id, userToken]);

  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  // Function to fetch data for a specific cycle
  const fetchCycleData = async (index: number) => {
    const cycle = cycleDates[index];

    // Initiate fetch requests for three different endpoints
    const analyticsData = fetch(`${API_URL}/client/campaign_analytics?client_archetype_id=${currentProject?.id}&start_date=${cycle.start}&end_date=${cycle.end}&verbose=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    }).catch(error => {
      console.error('Error fetching analytics data:', error);
      return null;
    });
    const template_analytics_data = fetch(`${API_URL}/analytics/template_analytics?archetype_id=${currentProject?.id}&start_date=${cycle.start}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    }).catch(error => {
      console.error('Error fetching template analytics data:', error);
      return null;
    });

    // Wait for all fetch requests to complete
    const [
      template_analytics_data_response,
      analyticsDataResponse,
    ] = await Promise.all([
      template_analytics_data,
      analyticsData,
    ]);

    // Parse the JSON responses
    const parseJsonResponse = async (response: Response | null) => {
      if (!response) return null;
      try {
        return await response.json();
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
      }
    };

    const templateAnalyticsDataJson = await parseJsonResponse(template_analytics_data_response);
    const analyticsDataJson = await parseJsonResponse(analyticsDataResponse);
    console.log('analyticsDataJson', analyticsDataJson)

    // Return the results as an object
    return {
      templateAnalytics: templateAnalyticsDataJson,
      analyticsData: analyticsDataJson,
    };
  };

  // Function to handle the toggle action for cycle data
  const handleToggle = async (index: number) => {
    // If the selected step is already open, toggle its state
    if (selectStep === index) {
      setOpened(!opened);
    } else {
      // Otherwise, open the selected step and set it as the current step
      setOpened(true);
      setSelectStep(index);

      // If the data for the selected cycle is not cached, fetch and cache it
      // if (!cycleDataCache[index]) {
      const data = await fetchCycleData(index);
      console.log('data is', data);
      setCycleDataCache((prevCache) => ({
        ...prevCache,
        [index]: data,
      }));
      // }
    }
  };
  return (
    <Paper>
      {cycleDates.map((item, index) => {
        return (
          <Box
            mb={"sm"}
            style={{
              border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da",
              borderRadius: "8px",
            }}
          >
            <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
              <Flex align={"center"} gap={"xs"}>
                <Text size={"sm"} fw={600} color="gray">
                  Cycle {index + 1}:
                </Text>
                <Text fw={600} size={"sm"}>
                  {new Date(cycleDates[index]?.start ?? '').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })} - {new Date(cycleDates[index]?.end ?? '').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                </Text></Flex>
              <Flex gap={1} align={"center"}>
                <Text></Text>
                <ActionIcon
                  onClick={() => {
                    handleToggle(index);
                  }}
                >
                  {selectStep === index && opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
                </ActionIcon>
              </Flex>
            </Flex>
            <Collapse in={selectStep === index && opened}>
              {cycleDataCache?.[index]?.analyticsData?.daily ?
                <ScrollArea h={cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_sent: any; }) => total + day.num_sent, 0) === 0 ? 50 : 500}>
                  {cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_sent: any; }) => total + day.num_sent, 0) ? <Flex
                    gap={"sm"}
                    p={"sm"}
                    style={{
                      borderTop: "1px solid #228be6",
                    }}
                    direction={"column"}
                  >
                    <Flex align={"center"} justify={"space-between"} w={"100%"}>
                      <Text fw={600}>Summary</Text>
                      <Button
                        leftIcon={<IconSparkles color="white" size={"0.9rem"} />}
                        radius={"xl"}
                        fz={12}
                        px={"sm"}
                        py={0}
                        color="grape"
                        onClick={() =>
                          openContextModal({
                            modal: "cycleanalyticModal",
                            title: <Title order={3}>Cycle Analytics</Title>,
                            innerProps: {},
                            styles: {
                              content: {
                                minWidth: "600px",
                              },
                            },
                          })
                        }
                      >
                        AI Generate Report
                      </Button>
                    </Flex>
                    <Flex gap={"sm"}>
                      <Paper w={"35%"} h={300} withBorder radius={"md"}>
                        {cycleDataCache?.[index]?.analyticsData?.daily ? (
                          <Line
                            typeof="linear"
                            data={{
                              labels: cycleDataCache[index].analyticsData.daily
                                .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((day: { date: string | number | Date; }) => new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                              datasets: [
                                {
                                  label: "Send",
                                  data: getCumulativeData(cycleDataCache[index].analyticsData.daily
                                    .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((day: { num_sent: any; }) => day.num_sent)),
                                  fill: false,
                                  borderColor: "#55c2c1",
                                  backgroundColor: "#55c2c1",
                                },
                                {
                                  label: "Open",
                                  data: getCumulativeData(cycleDataCache[index].analyticsData.daily
                                    .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((day: { num_opens: any; }) => day.num_opens)),
                                  fill: false,
                                  borderColor: "#e9be4d",
                                  backgroundColor: "#e9be4d",
                                },
                                {
                                  label: "Reply",
                                  data: getCumulativeData(cycleDataCache[index].analyticsData.daily
                                    .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((day: { num_replies: any; }) => day.num_replies)),
                                  fill: false,
                                  borderColor: "#228be6",
                                  backgroundColor: "#228be6",
                                },
                                {
                                  label: "Demo",
                                  data: getCumulativeData(cycleDataCache[index].analyticsData.daily
                                    .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map((day: { num_demos: any; }) => day.num_demos)),
                                  fill: false,
                                  borderColor: "#ec8a0a",
                                  backgroundColor: "#ec8a0a",
                                },
                              ],
                            }}
                            options={Spendingoptions}
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
                                  {cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_sent: any; }) => total + day.num_sent, 0)}
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
                                <Text fz={24}>{cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_opens: any; }) => total + day.num_opens, 0)}</Text>
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
                                <Text fz={24}>{cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_replies: any; }) => total + day.num_replies, 0)}</Text>
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
                                <Text fz={24}>{cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_pos_replies: any; }) => total + day.num_pos_replies, 0)}</Text>
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
                                <Text fz={24}>{cycleDataCache[index]?.analyticsData?.daily.reduce((total: any, day: { num_demos: any; }) => total + day.num_demos, 0)}</Text>
                              </Flex>
                            </Box>
                          </Flex>
                        </Paper>
                        {cycleDataCache?.[index]?.analyticsData?.daily
                          .filter((day: { positive_reply_details: any; }) => day.positive_reply_details)
                          .map((day: { positive_reply_details: { split: (arg0: string) => [any, any, any, any]; }[]; }) => {
                            const [id, name, intent, reply] = day.positive_reply_details[0].split("###");
                            return { id, name, intent, reply };
                          })
                          .slice(sentimentPage * 2, sentimentPage * 2 + 2).length !== 0 && <Box mt={"sm"}>
                            <Flex align={"center"} gap={"5px"}>
                              <Text
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  whiteSpace: "nowrap",
                                }}
                                fw={700}
                                size={"lg"}
                              >
                                <span>Positive Replies</span>
                              </Text>
                              <Divider w={"100%"} />
                              <Flex>
                                <ActionIcon
                                  onClick={() => {
                                    if (sentimentPage > 0 || selectStep === index) setSentimentPage((page) => (page = page - 1));
                                  }}
                                >
                                  <IconChevronLeft />
                                </ActionIcon>
                                <ActionIcon
                                // onClick={() => {
                                //   if (item && item.sentimentData && sentimentPage < Math.ceil(item?.sentimentData?.length / 2) - 1)
                                //     setSentimentPage((page) => (page = page + 1));
                                // }}
                                >
                                  <IconChevronRight />
                                </ActionIcon>
                              </Flex>
                            </Flex>
                            {cycleDataCache?.[index]?.analyticsData?.daily && <DataGrid
                              data={cycleDataCache?.[index]?.analyticsData?.daily
                                .filter((day: { positive_reply_details: any; }) => day.positive_reply_details)
                                .map((day: { positive_reply_details: { split: (arg0: string) => [any, any, any, any]; }[]; }) => {
                                  const [id, name, intent, reply] = day.positive_reply_details[0].split("###");
                                  return { id, name, intent, reply };
                                })
                                .slice(sentimentPage * 2, sentimentPage * 2 + 2)}
                              highlightOnHover
                              withSorting
                              withColumnBorders
                              withBorder
                              // loading={loading}
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
                                    let { intent }: any = cell.row.original;

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
                          </Box>}
                      </Box>
                    </Flex>
                    <Paper>
                      <Flex align={"center"} gap={"5px"}>
                        <Text
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            whiteSpace: "nowrap",
                          }}
                          fw={700}
                          size={"lg"}
                        >
                          <span>ICP Splotlight</span>
                        </Text>
                        <Divider w={"100%"} />
                        <Flex>
                        </Flex>
                      </Flex>
                      <SimpleGrid cols={5} mt={"sm"}>
                        {Array.from(new Set(cycleDataCache?.[index]?.analyticsData?.top_icp_people?.map((icpItem: any) => icpItem.full_name)))
                          .map((uniqueName) => {
                            if (typeof uniqueName === 'string') {
                              return cycleDataCache?.[index]?.analyticsData?.top_icp_people?.find((icpItem: any) => icpItem.full_name === uniqueName);
                            }
                            return undefined;
                          })
                          .filter((icpItem: any) => icpItem !== undefined) // Ensure no undefined values
                          .map((icpItem: any, icpIndex: number) => {
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
                                </Flex>
                              </Paper>
                            );
                          })}
                      </SimpleGrid>
                    </Paper>
                    <Box mt={"sm"}>
                      {/* <Flex align={"center"} gap={"5px"}>
                      <Text
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          whiteSpace: "nowrap",
                        }}
                        fw={700}
                        size={"lg"}
                      >
                        <span>Recommended Actions</span>
                      </Text>
                      <Divider w={"100%"} />
                    </Flex> */}
                      {/* <SimpleGrid cols={3} mt={"sm"}>
                      {item?.recommendData.slice(0, 3).map((recommendItem: any, recommendIndex: number) => {
                        return (
                          <Paper withBorder radius={"md"} key={recommendIndex} p={"sm"}>
                            <Flex gap={4} align={"center"}>
                              <IconInfoCircle size={"0.9rem"} color="red" />
                              <Text fw={500} size={"sm"} tt={"uppercase"} color="red">
                                low perfroming template
                              </Text>
                            </Flex>
                            <Text fw={600} size={"md"} mt={3}>
                              {recommendItem.content}
                            </Text>
                            <Button radius={"md"} rightIcon={<IconArrowRight size={"0.9rem"} />} color="red" mt={"md"}>
                              Deactivate
                            </Button>
                          </Paper>
                        );
                      })}
                    </SimpleGrid> */}
                      {cycleDataCache[index]?.templateAnalytics?.data?.cta_analytics && cycleDataCache[index].templateAnalytics.data.cta_analytics.length > 0 && (
                        <DataGrid
                          data={cycleDataCache[index]?.templateAnalytics?.data?.cta_analytics || []}
                          highlightOnHover
                          withSorting
                          withColumnBorders
                          withBorder
                          // loading={loading}
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
                              accessorKey: "text_value",
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconBallpen color="gray" size={"0.9rem"} />
                                  <Text color="gray">CTAs</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { text_value } = cell.row.original;

                                return (
                                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                    <Flex>
                                      <Text color="gray" size={"sm"} w={"100%"}>
                                        {text_value}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_open",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Open Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_open, num_sent }: any = cell.row.original;
                                let open_rate = num_sent ? ((num_open / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{open_rate}%</Badge>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_reply",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Reply Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_reply, num_sent }: any = cell.row.original;
                                let reply_rate = num_sent ? ((num_reply / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{reply_rate}%</Badge>
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
                              minSize: 100,
                              maxSize: 100,
                              enableResizing: true,
                              cell: (cell) => {
                                let { action }: any = cell.row.original;

                                return (
                                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                    <Switch defaultChecked={!action} />
                                  </Flex>
                                );
                              },
                            },
                          ]}
                          styles={{
                            dataCellContent: {
                              width: "100%",
                            },
                          }}
                        />
                      )}
                      {cycleDataCache[index]?.templateAnalytics?.data?.linkedin_template_analytics && cycleDataCache[index].templateAnalytics.data.linkedin_template_analytics.length > 0 ? (
                        <DataGrid
                          data={cycleDataCache[index]?.templateAnalytics?.data?.linkedin_template_analytics}
                          highlightOnHover
                          withSorting
                          withColumnBorders
                          withBorder
                          // loading={loading}
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
                              accessorKey: "message",
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconBallpen color="gray" size={"0.9rem"} />
                                  <Text color="gray">Email Templates</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { message } = cell.row.original;

                                return (
                                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                    <Flex>
                                      <Text color="gray" size={"sm"} w={"100%"}>
                                        {message}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_open",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Open Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_open, num_sent }: any = cell.row.original;
                                let open_rate = num_sent ? ((num_open / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{open_rate}%</Badge>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_reply",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Reply Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_reply, num_sent }: any = cell.row.original;
                                let reply_rate = num_sent ? ((num_reply / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{reply_rate}%</Badge>
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
                              minSize: 100,
                              maxSize: 100,
                              enableResizing: true,
                              cell: (cell) => {
                                let { action }: any = cell.row.original;

                                return (
                                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                    <Switch defaultChecked={!action} />
                                  </Flex>
                                );
                              },
                            },
                          ]}
                          styles={{
                            dataCellContent: {
                              width: "100%",
                            },
                          }}
                        />
                      ) : null}



                      {cycleDataCache[index]?.templateAnalytics?.data?.email_templates_analytics && cycleDataCache[index].templateAnalytics.data.email_templates_analytics.length > 0 ? (
                        <DataGrid
                          data={cycleDataCache[index]?.templateAnalytics?.data?.email_templates_analytics}
                          highlightOnHover
                          withSorting
                          withColumnBorders
                          withBorder
                          // loading={loading}
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
                              accessorKey: "message",
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconBallpen color="gray" size={"0.9rem"} />
                                  <Text color="gray">Email Templates</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { title } = cell.row.original as any;

                                return (
                                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                    <Flex>
                                      <Text color="gray" size={"sm"} w={"100%"}>
                                        {title}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_open",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Open Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_open, num_sent }: any = cell.row.original;
                                let open_rate = num_sent ? ((num_open / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{open_rate}%</Badge>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_reply",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Reply Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_reply, num_sent }: any = cell.row.original;
                                let reply_rate = num_sent ? ((num_reply / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{reply_rate}%</Badge>
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
                              minSize: 100,
                              maxSize: 100,
                              enableResizing: true,
                              cell: (cell) => {
                                let { action }: any = cell.row.original;

                                return (
                                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                    <Switch defaultChecked={!action} />
                                  </Flex>
                                );
                              },
                            },
                          ]}
                          styles={{
                            dataCellContent: {
                              width: "100%",
                            },
                          }}
                        />
                      ) : null}


                      {cycleDataCache[index]?.templateAnalytics?.data?.subject_lines_analytics && cycleDataCache[index].templateAnalytics.data.subject_lines_analytics.length > 0 ? (
                        <DataGrid
                          data={cycleDataCache[index]?.templateAnalytics?.data?.subject_lines_analytics}
                          highlightOnHover
                          withSorting
                          withColumnBorders
                          withBorder
                          // loading={loading}
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
                              accessorKey: "message",
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconBallpen color="gray" size={"0.9rem"} />
                                  <Text color="gray">Subject Lines</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { subject_line } = cell.row.original as any;

                                return (
                                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                    <Flex>
                                      <Text color="gray" size={"sm"} w={"100%"}>
                                        {subject_line}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_open",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Open Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_open, num_sent }: any = cell.row.original;
                                let open_rate = num_sent ? ((num_open / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{open_rate}%</Badge>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "num_reply",
                              minSize: 40,
                              maxSize: 140,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Reply Rate</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { num_reply, num_sent }: any = cell.row.original;
                                let reply_rate = num_sent ? ((num_reply / num_sent) * 100).toFixed(2) : 0;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color="green">{reply_rate}%</Badge>
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
                              minSize: 100,
                              maxSize: 100,
                              enableResizing: true,
                              cell: (cell) => {
                                let { action }: any = cell.row.original;

                                return (
                                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                    <Switch defaultChecked={!action} />
                                  </Flex>
                                );
                              },
                            },
                          ]}
                          styles={{
                            dataCellContent: {
                              width: "100%",
                            },
                          }}
                        />
                      ) : null}



                      {/* <DataGrid
                      data={item?.personalizerData}
                      highlightOnHover
                      withSorting
                      withColumnBorders
                      withBorder
                      // loading={loading}
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
                          accessorKey: "personalizers",
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconBallpen color="gray" size={"0.9rem"} />
                              <Text color="gray">Personalizers</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { personalizers } = cell.row.original;

                            return (
                              <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                <Flex>
                                  <Text color="gray" size={"sm"} w={"100%"}>
                                    {personalizers}
                                  </Text>
                                </Flex>
                                <Flex gap={"sm"}>
                                  <Button variant="light" color="red" size="xs">
                                    🔥 Hot
                                  </Button>
                                </Flex>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "open_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Open RAte</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { open_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{open_rate}%</Badge>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "reply_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Reply Rate</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { reply_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{reply_rate}%</Badge>
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
                          minSize: 100,
                          maxSize: 100,
                          enableResizing: true,
                          cell: (cell) => {
                            let { action }: any = cell.row.original;

                            return (
                              <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                <Switch defaultChecked={action} />
                              </Flex>
                            );
                          },
                        },
                      ]}
                      styles={{
                        dataCellContent: {
                          width: "100%",
                        },
                      }}
                    /> */}
                    </Box>
                  </Flex> : (<><Center>{'No data'}</Center></>)}
                </ScrollArea> : (<Center mt="xl" mb="xl"><Loader /></Center>)}
            </Collapse>
          </Box>
        );
      })}
    </Paper>
  );
}
