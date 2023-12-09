import { userDataState, userTokenState } from '@atoms/userAtoms'
import { Button, Flex, Text, Grid, Badge, Popover, Center, Container, Divider, HoverCard, Box } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import { IconChecks, IconMessageCheck, IconMoodSmile, IconSend } from '@tabler/icons-react'
import getSDRSLASchedules from '@utils/requests/getSDRSLASchedules'
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
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useRecoilValue } from 'recoil'
import annotationPlugin from 'chartjs-plugin-annotation'

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Filler, Tooltip, annotationPlugin)

const data = {
  labels: ['Nov 01', 'Nov 02', 'Nov 03', 'Nov 04', 'Nov 05', 'Nov 06', 'Nov 07', 'Nov 08'],
  datasets: [
    {
      data: [50, 70, 120, 180, 200, 240, 220, 230],
      backgroundColor: 'rgb(99,215,104)',
      fill: true,
      yAxisID: 'yAxis',
      xAxisID: 'xAxis',
      borderRadius: 4,
    },
  ],
}

export const WarmUp: React.FC = () => {
  const userData = useRecoilValue(userDataState)

  const options: ChartOptions<'bar'> = {
    scales: {
      xAxis: {
        border: {
          display: true,
        },
        grid: {
          color: 'transparent',
        },
      },
      yAxis: {
        grid: {
          tickBorderDash: [2],
          color: '#88888830',
        },
        border: {
          display: false,
          dash: [2],
        },
        display: true,
        ticks: {
          padding: 10,
          color: '#888888',
          // font: {
          //   weight: "300",
          // },
        },
        beginAtZero: true,
        grace: '5%',
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
              content: 'Warmup Complete',
              backgroundColor: 'rgb(255, 99, 132)',
              display: true,
            },
            type: 'line',
            yMin: userData.weekly_li_outbound_target,
            yMax: userData.weekly_li_outbound_target,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
          },
        },
      },
    },
  }

  const userToken = useRecoilValue(userTokenState)

  const [loading, setLoading] = useState(false)
  const [slaScheduleData, setSLAScheduleData] = useState<any>()

  // We get start date to be 3 weeks before this monday
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 21)
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1)

  const triggerGetSLASchedules = async () => {
    setLoading(true)

    const result = await getSDRSLASchedules(userToken, startDate.toISOString())
    if (result.status !== 'success') {
      showNotification({
        title: 'Error',
        message: 'Failed to get outbound volume data',
        color: 'red',
        autoClose: 3000,
      })
      setLoading(false)
      return
    }
    let resultData = result.data?.schedules?.reverse()

    // Sort the resultData by week number (ascending)
    resultData.sort((a: any, b: any) => {
      return a.week - b.week
    })

    const data = {
      labels: resultData.map((schedule: any) => {
        const startDate = new Date(schedule.start_date)
        const endDate = new Date(schedule.end_date)

        // See if the Start Date is this current week
        if (startDate <= new Date() && endDate >= new Date()) {
          return `Week ${schedule.week} (Current Week)`
        }

        const week = schedule.week
        return `Week ${week}`
      }),
      datasets: [
        {
          data: resultData.map((schedule: any) => schedule.linkedin_volume),
          backgroundColor: resultData.map((schedule: any) => {
            const startDate = new Date(schedule.start_date)
            const endDate = new Date(schedule.end_date)

            // See if the Start Date is this current week
            if (startDate <= new Date() && endDate >= new Date()) {
              // See if warmup is complete
              if (schedule.linkedin_volume >= userData.weekly_li_outbound_target) {
                return 'rgb(99,215,104)'
              }
              return 'rgb(242, 169, 59)'
            }

            // See if the Start Date is a future week
            if (startDate > new Date()) {
              // See if warmup is complete
              if (schedule.linkedin_volume >= userData.weekly_li_outbound_target) {
                return 'rgb(99,215,104, 0.5)'
              }

              return 'rgb(242, 169, 59, 0.5)'
            }

            // See if the Start Date is a past week
            if (endDate < new Date()) {
              // See if warmup is complete
              if (schedule.linkedin_volume >= userData.weekly_li_outbound_target) {
                return 'rgb(99,215,104, 0.5)'
              }

              return 'rgb(99,215,104, 0.1)'
            }
          }),
          fill: true,
          yAxisID: 'yAxis',
          xAxisID: 'xAxis',
          borderRadius: 4,
        },
      ],
    }
    setSLAScheduleData(data)

    setLoading(false)
  }

  useEffect(() => {
    triggerGetSLASchedules()
  }, [])

  return (
    <Flex direction={'column'} mb={'2rem'} w='100%'>
      <Flex align={'center'} mb={'0.5rem'} gap={'0.5rem'}>
        <Text fw={'500'} fz={'1rem'}>
          Outbound Volume
        </Text>
        {userData?.warmup_linkedin_complete ? (
          <></>
        ) : (
          <HoverCard
            withArrow
            withinPortal
            styles={{
              dropdown: {
                border: '1px solid orange',
                borderRadius: '0.5rem',
              },
              arrow: {
                borderColor: 'orange',
              },
            }}
          >
            <HoverCard.Target>
              <Badge variant='light' size='md' color='orange'>
                Warming Up
              </Badge>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Box w={400}>
                <Text size='lg' weight='700'>
                  Warming Up
                </Text>
                <Text mt='xs'>
                  In order to protect your LinkedIn, our AI follows a set of outbound heuristics specific to your
                  account. This enables us to slowly "warm up" your LinkedIn account before sending full volume
                  outbound.
                </Text>
                <Text mt='xs'>
                  The following is a sample "warmup schedule". Reference the graph for the exact, AI-determined
                  schedule, and if you would like to make adjustments, please contact a SellScale team member:
                </Text>
                <Text mt='md'>
                  <ul>
                    <Flex>
                      <Text fw='bold' w='150px'>
                        Week 0:
                      </Text>
                      <Text>5 connections</Text>
                    </Flex>
                  </ul>
                  <ul>
                    <Flex>
                      <Text fw='bold' w='150px'>
                        Week 1:
                      </Text>
                      <Text>25 connections</Text>
                    </Flex>
                  </ul>
                  <ul>
                    <Flex>
                      <Text fw='bold' w='150px'>
                        Week 2:
                      </Text>
                      <Text>50 connections</Text>
                    </Flex>
                  </ul>
                  <ul>
                    <Flex>
                      <Text fw='bold' w='150px'>
                        Week 3:
                      </Text>
                      <Text>75 connections</Text>
                    </Flex>
                  </ul>
                  <ul>
                    <Flex>
                      <Text fw='bold' w='150px'>
                        Week 4:
                      </Text>
                      <Text>90 connections</Text>
                    </Flex>
                  </ul>
                </Text>
              </Box>
            </HoverCard.Dropdown>
          </HoverCard>
        )}
      </Flex>
      <Text c={'gray.6'} fz={'0.75rem'} mb={'1rem'}>
        The following graph shows your historical and future outbound volumes.
      </Text>

      {slaScheduleData ? (
        <Flex h={'100%'} direction={'column'} align={'flex-start'} justify={'flex-end'}>
          <Bar options={options} data={slaScheduleData} height={160} />
        </Flex>
      ) : (
        <Flex></Flex>
      )}

      {/* <Grid.Col xs={12} sm={4}>
        <Text fw={"500"} fz={"1rem"} color="gray.6" mb={"0.5rem"}>
          Deliverability:
        </Text>
        <Button
          variant="outline"
          size="xs"
          color="green"
          radius="xl"
          leftIcon={<IconMoodSmile size="1rem" />}
          mb={"0.5rem"}
        >
          Superb!
        </Button>
        <Text fw={"500"} fz={"1rem"} color="gray.6" mb={"0.5rem"}>
          Over{" "}
          <Text span color="gray.8">
            90%
          </Text>{" "}
          received
        </Text>

        <Text fw={"500"} fz={"1rem"} color="gray.7" mt={"2rem"} mb={"1rem"}>
          Summary:
        </Text>
        <Flex direction={"column"} gap={"0.5rem"}>
          <Flex align={"center"} gap={"0.25rem"}>
            <IconSend size="1rem" color="#868E96" />
            <Text fw={"500"} fz={"1rem"} color="gray.6">
              Warmup Sent:{" "}
              <Text span color="gray.8">
                25
              </Text>
            </Text>
          </Flex>

          <Flex align={"center"} gap={"0.25rem"}>
            <IconChecks size="1rem" color="#868E96" />
            <Text fw={"500"} fz={"1rem"} color="gray.6">
              Landed in Inbox:{" "}
              <Text span color="gray.8">
                15
              </Text>
            </Text>
          </Flex>

          <Flex align={"center"} gap={"0.25rem"}>
            <IconMessageCheck size="1rem" color="#868E96" />
            <Text fw={"500"} fz={"1rem"} color="gray.6">
              Warmup received:{" "}
              <Text span color="gray.8">
                5
              </Text>
            </Text>
          </Flex>
        </Flex>
      </Grid.Col> */}
    </Flex>
  )
}
