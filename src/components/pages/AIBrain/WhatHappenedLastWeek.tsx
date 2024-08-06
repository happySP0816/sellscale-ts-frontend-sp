import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import logotrial from "../../../components/PersonaCampaigns/Logo-Trial-3.gif";
import RichTextArea from "@common/library/RichTextArea";
import {socket} from '../../App';
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
  Stack,
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
import { Key, useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { useRecoilValue } from "recoil";
import AnalyticsItem from "./AnalyticsItem";
import { set } from "lodash";
import DOMPurify from "dompurify";
import { showNotification } from "@mantine/notifications";

export default function WhatHappenedLastWeek() {
  const [cycleDataCache, setCycleDataCache] = useState<{ [key: number]: any }>({});
  console.log('cycle data cache:', cycleDataCache);

  const [sentimentPage, setSentimentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [receivedObjects, setReceivedObjects] = useState(0);
  const [showCumulative, setShowCumulative] = useState(true);

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
  const [generatingReport, setGeneratingReport] = useState(false);
  const dataFetchedRef = useRef(false);
  const roomIDref = useRef<string>('');

  const getCumulativeData = (data: any) => {
    if (!data) return [];
    let cumulative = 0;
    return data.map((value: any) => {
      cumulative += value;
      return cumulative;
    });
  };

  useEffect(() => {
    const handleData = (incomingData: any) => {
      // console.log('handling data', incomingData);
      // console.log('room id', roomIDref.current);
      if (incomingData.room_id === roomIDref.current) {
        setReceivedObjects(prev => prev + 1);
      }
    };

    socket.on("+1", handleData);

    return () => {
      socket.off("+1", handleData);
    };
  }, [roomIDref.current]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const fetchCycleDates = async () => {
      try {
        const response = await fetch(`${API_URL}/analytics/get_cycle_dates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        // Assuming data is an array of objects with start and end properties
        setCycleDates(data);
        // console.log('dates are', data);
        console.log(data);

        // Initialize cycleDataCache with the length of cycle dates
        const initialCache = data.reduce((acc: { [key: number]: any }, _: any, index: number) => {
          acc[index] = null;
          return acc;
        }, {});
        setCycleDataCache(prevCache => ({
          ...initialCache,
          ...prevCache,
        }));
      } catch (error) {
        console.error('Error fetching cycle dates:', error);
      }
    };

    fetchCycleDates();
  }, [currentProject?.id, userToken]);

  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  const handleGenerateReport = (index: number) => {
    setCycleDataCache(prevCache => ({
      ...prevCache,
      [index]: {
        ...prevCache[index],
        generatedReport: undefined,
      },
    }));
    setGeneratingReport(true);
    const cycleData = cycleDataCache[index]?.originalData;

    if (!cycleData) {
      console.error('No data found for cycle:', index);
      return;
    }

    //make the report generation api call here

    const reportGeneration = async (cycleData: any) => {
      try{
      const response = await fetch(`${API_URL}/analytics/generate_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          cycleData: {analyticsData: cycleData},
        }),
      });
      const data = await response.json();
      
      //set the generatedReport attribute of the cycleDataCache
      setCycleDataCache(prevCache => ({
        ...prevCache,
        [index]: {
          ...prevCache[index],
          generatedReport: data,
        },
      }));
      console.log('Report generation response:', data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally
    {
      setGeneratingReport(false);
    }
  }
  reportGeneration(cycleData);
  }

  const fetchCycleReport = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/analytics/fetch_report?cycle_number=${cycleDates.length - index}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching report: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.message !== "Success") {
        throw new Error(`Error fetching report: ${data.message}`);
      }

      setCycleDataCache(prevCache => ({
        ...prevCache,
        [index]: {
          ...prevCache[index],
          generatedReport: {report: data.report.report}
        },
      }));

      console.log('Report fetch response:', data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  }

  // Function to fetch data for a specific cycle
  const fetchCycleData = async (index: number) => {
    const cycle = cycleDates[index];

    // Initiate fetch requests for three different endpoints
    const analyticsData = fetch(`${API_URL}/client/campaign_analytics?start_date=${cycle.start}&end_date=${cycle.end}&verbose=true&room_id=${roomIDref.current}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    }).catch(error => {
      console.error('Error fetching analytics data:', error);
      return null;
    })

    // Wait for all fetch requests to complete
    const [
      analyticsDataResponse,
    ] = await Promise.all([
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

    const analyticsDataJson = await parseJsonResponse(analyticsDataResponse);

    // Return the results as an object
    return {
      analyticsData: analyticsDataJson,
    };
  };

  // Function to handle the toggle action for cycle data
  const handleToggle = async (index: number) => {
    setReceivedObjects(0);
    // If the selected step is already open, toggle its state
    if (selectStep === index) {
      setOpened(!opened);
    } else {
      // Otherwise, open the selected step and set it as the current step
      setOpened(true);
      setSelectStep(index);

      // If the data for the selected cycle is not cached, fetch and cache it
      if (!cycleDataCache[index]) {
      const room_id = Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('');
      roomIDref.current = room_id;
      socket.emit("join-room", {
        payload: { room_id: room_id },
      });
        setLoading(true);
      const [_, data] = await Promise.all([
        fetchCycleReport(index),
        fetchCycleData(index)
      ]);
      // Combine the relevant data into a single object
      const combinedCycleAnalyticsData = (data.analyticsData || []).reduce((acc: any, current: any) => {
        Object.keys(current).forEach(key => {
          if (typeof current[key] === 'number') {
            acc[key] = (acc[key] || 0) + current[key];
          } else if (Array.isArray(current[key])) {
            acc[key] = (acc[key] || []).concat(current[key]);
          } else if (typeof current[key] === 'object' && current[key] !== null) {
            acc[key] = { ...acc[key], ...current[key] };
          } else {
            acc[key] = current[key];
          }
        });
        return acc;
      }, {});
      setCycleDataCache(prevCache => ({
        ...prevCache,
        [index]: {
          ...prevCache[index],
          analyticsData: [combinedCycleAnalyticsData],
          originalData: data.analyticsData,
        },
      }));

      console.log('cycle data cache:', cycleDataCache);
      setLoading(false); 
       }
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
            {}
            { opened && (selectStep === index) && cycleDataCache[index]?.generatedReport?.report && (
                <div 
                  style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    paddingLeft: '20px', 
                    paddingRight: '20px',
                    position: 'relative' 
                  }} 
                >
                  {/* <RichTextArea
                    onChange={(value, rawValue) => {
                      // descriptionRaw.current = rawValue;
                      // description.current = value;
                      // // setDescription(value);
                      // console.log(value);
                    }}
                    value={cycleDataCache[index]?.generatedReport?.report}
                  /> */}
                  <div 
                    contentEditable 
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cycleDataCache[index]?.generatedReport?.report, { ALLOWED_ATTR: ['style', 'th', 'table', 'tr', 'td', 'thead', 'tbody', 'tfoot', 'class', 'id', 'data-*', 'role', 'aria-*', 'head', 'body', 'h1', 'h2', 'p', 'border', 'cellpadding', 'cellspacing', 'width', 'align', 'meta', 'title'] }) }} 
                    onInput={(e) => {setCycleDataCache(prevCache => ({
                      ...prevCache,
                      [index]: {
                        ...prevCache[index],
                          editedReport: e.currentTarget?.innerHTML,
                      },
                    })
                  
                  )
                } 
                    
                  }
                  />
                  <Button 
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px' 
                    }} 
                    size="xs" 
                    color="blue" 
                    onClick={() => {

                      //call endpoint to save the report

                      const saveReport = async () => {
                        try {
                          const response = await fetch(`${API_URL}/analytics/save_report`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${userToken}`,
                            },
                            body: JSON.stringify({
                              cycle_number: cycleDates.length - index, //this is pretty derpy
                              report: cycleDataCache[index]?.editedReport || cycleDataCache[index]?.generatedReport?.report,
                            }),
                          });
                          const data = await response.json();
                          console.log('Report save response:', data);
                          showNotification({
                            title: 'Report saved',
                            message: 'The report has been saved successfully',
                            color: 'teal',
                          }
                          )
                        } catch (error) {
                          console.error('Error saving report:', error);
                        }
                      };

                      saveReport();
                    
                      // try {
                      //   const element = document.createElement('a');
                      //   const file = new Blob([cycleDataCache[index]?.generatedReport?.report || ''], { type: 'text/html' });
                      //   element.href = URL.createObjectURL(file);
                      //   const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
                      //   element.download = `report_cycle_${index}_${currentDate}.html`;
                      //   document.body.appendChild(element);
                      //   element.click();
                      //   document.body.removeChild(element);
                      // } catch (error) {
                      //   console.error('Failed to create HTML document:', error);
                      // }
                    }}
                  >
                    Save
                  </Button>
                </div>
              )}
            <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
              <Flex align={"center"} gap={"xs"} justify={"space-between"}>
                <Flex align={"center"} gap={"xs"} direction="column">
                  {cycleDataCache[index]?.analyticsData && opened && (selectStep === index) && (
                    <Button mt="sm" loading={generatingReport} color="grape" size="xs" ml="md" onClick={() => { handleGenerateReport(index) }}>
                      Generate Report
                    </Button>
                  )}
                  <Flex align={"center"} gap={"xs"}>
                    <Text size={"sm"} fw={600} color="gray">
                      Cycle {cycleDates.length - index}:
                    </Text>
                      <Text size="sm" color="blue">
                        Sun {new Date(new Date(cycleDates[index]?.start).setDate(new Date(cycleDates[index]?.start).getDate() + 1)).toLocaleDateString()}
                      </Text>
                      <Text size="sm" color="blue">
                        Mon {new Date(new Date(cycleDates[index]?.end).setDate(new Date(cycleDates[index]?.end).getDate() + 1)).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Flex gap={1} align={"center"}>
                <ActionIcon
                  onClick={() => {
                    handleToggle(index);
                  }}
                >
                  {selectStep === index && opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
                </ActionIcon>
              </Flex>
            </Flex>
            {selectStep === index && opened && cycleDataCache[index]?.analyticsData &&  <Flex mr="sm" mb="sm" align="center" gap="xs" justify="flex-end">
              <Stack spacing="sm">
                <Flex align="center">
                  <Text size="sm" mr="sm" fw={600} color="gray">Show Cumulative:</Text>
                  <Switch size="sm" checked={showCumulative} onChange={() => setShowCumulative(!showCumulative)} />
                </Flex>
              </Stack>
            </Flex>}
            <Collapse 
              in={selectStep === index && opened} 
              transitionDuration={500} 
              transitionTimingFunction="ease-in-out"
              style={{

                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                padding: '10px',
                backgroundColor: '#f8fbff',
              }}
            >
              {!loading && cycleDataCache[index]?.analyticsData ?
                (showCumulative ? cycleDataCache[index].analyticsData : cycleDataCache[index].originalData).map((dataItem: { daily: any; templateAnalytics: any; top_icp_people: any; summary:any }, dataIndex: Key | null | undefined) => (
                  <AnalyticsItem
                    showCumulative={showCumulative}
                    key={dataIndex}
                    dailyData={dataItem?.daily}
                    templateAnalytics={dataItem?.templateAnalytics}
                    topIcpPeople={dataItem?.top_icp_people}
                    summaryData={dataItem?.summary?.[0] || []}
                  />
                )) : (
                  <Center mt="xl" mb="xl">
                    <Flex direction="column" align="center">
                      <Text
                        mr="xl"
                        color="grape"
                        mt="sm"
                        sx={{
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.5)' },
                            '100%': { transform: 'scale(1)' },
                          },
                        }}
                      >
                        Loading analytics...
                      </Text>
                      <img src={logotrial} alt="Loading..." width="75px" />
                      <Text mt="sm" color="grape">
                        Calculated analytics for {receivedObjects} campaigns...
                      </Text>
                    </Flex>
                  </Center>
                )}


            </Collapse>
          </Box>
        );
      })}
    </Paper>
  );
}
