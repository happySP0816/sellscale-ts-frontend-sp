import React, { useEffect, useState } from 'react';
import { Container, Title, Image, Button, Tooltip, Text, Card, Flex, Box, Avatar, Group, Badge, Grid } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { IconChecks, IconEye, IconLetterA, IconPlane, IconSend } from '@tabler/icons';
import { IconMessageCheck } from '@tabler/icons-react';
import { API_URL } from '@constants/data';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

function BarChart() {
  const [currentMode, setCurrentMode] = useState('week');
  const [modes, setModes]: any = useState({});
  const [fetchedModes, setFetchedModes] = useState(false);

  const userToken = useRecoilState(userTokenState)

  useEffect(() => {
    if (!fetchedModes) {
      fetch(`${API_URL}/analytics/outreach_over_time`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken[0]}`
        },
      })
      .then(response => response.json())
      .then(data => {
        setModes(data.outreach_over_time || {});
      })

      setFetchedModes(true);
    }
  }, [fetchedModes]);

  const sumOutbounds = modes[currentMode]?.data.outbound.reduce((a: any, b: any) => a + b, 0);
  const sumAcceptances = modes[currentMode]?.data.acceptances.reduce((a: any, b: any) => a + b, 0);
  const sumReplies = modes[currentMode]?.data.replies.reduce((a: any, b: any) => a + b, 0);

  const totalTouchpoints = sumOutbounds + sumAcceptances + sumReplies;

  const chartData = {
    labels: modes[currentMode]?.labels,
    datasets: [
      {
        label: 'Total Outbound Volume',
        data: modes[currentMode]?.data.outbound,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        stack: 'Stack 0',
      },
      {
        label: 'Total Acceptances',
        data: modes[currentMode]?.data.acceptances,
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        stack: 'Stack 0',
      },
      {
        label: 'Total Replies',
        data: modes[currentMode]?.data.replies,
        backgroundColor: 'rgba(255,206,86,0.2)',
        borderColor: 'rgba(255,206,86,1)',
        borderWidth: 1,
        stack: 'Stack 0',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
      },
      x: {
        stacked: true,
      },
    },
  };

  return (
    <Card withBorder>
      <Flex direction='row' mb='xs'>
        <Box>
          <Text color='gray'>TOTAL OUTBOUND TOUCHPOINTS</Text>
          <Title>{totalTouchpoints.toLocaleString()}</Title>
        </Box>
        <Box sx={{justifyContent: 'right', textAlign: 'right', width: '300px'}} ml='auto' mt='md'>
          {['week', 'month', 'year'].map(mode => (
            <Button 
              onClick={() => setCurrentMode(mode)} 
                mr='xs' 
                size='xs'
                color={currentMode === mode ? 'green' : 'gray'}
                variant={currentMode === mode ? 'outline' : 'subtle'}
                key={mode}
            >
              {mode}
            </Button>
          ))}
        </Box>
      </Flex>
      <Bar data={chartData} options={options} />
    </Card>
  );
}

export function ActiveCampaigns() {
  const [activeCampaigns, setActiveCampaigns] = React.useState([]);
  const [fetchedActiveCampaigns, setFetchActiveCampaigns] = React.useState(false);
  const userData = useRecoilValue(userDataState)

  const userToken = useRecoilState(userTokenState)

  useEffect(() => {
    if (!fetchedActiveCampaigns) {
      fetch(`${API_URL}/analytics/all_campaign_analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken[0]}`
        },
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.pipeline_data)
          setActiveCampaigns(data.pipeline_data || []);
        }).finally(() => {
          setFetchActiveCampaigns(true);
        });
    }
  }, [fetchedActiveCampaigns]);

  return <Card withBorder mt='md'>
    <Title order={3} mt='md'>{activeCampaigns.length} Active Campaigns</Title>
      <Text color='gray'>These are the active campaigns running from across all of {userData.client?.company}'s users</Text>
      <Grid mt='md'>
        {activeCampaigns.sort((a: any,b: any) => b.open_percent - a.open_percent).map((x: any) => {
          return (
            <Grid.Col span={6}>
              <Card withBorder padding="lg" radius="md">
                
                  <Group mb="xs" sx={{cursor: 'pointer'}}>
                    <Tooltip label={x.name} withinPortal>
                      <Image src={x.img_url} width={40} height={40} radius="sm" />
                    </Tooltip>
                    <Tooltip label={x.archetype} withinPortal>
                      <Flex direction='row'>
                        <Text fw={500}>{x.emoji} {x.archetype.substring(0, 26)}{x.archetype.length > 26 ? '...' : ''}</Text>
                        <Badge color="pink" variant="light" ml='4px'>
                          Active
                        </Badge>
                      </Flex>
                    </Tooltip>
                  </Group>
                

                <Text c="dimmed" size='xs' h='90px'>
                  {x.persona_fit_reason?.substring(0, 200)}{x.persona_fit_reason?.length > 200 ? '...' : ''}
                </Text> 

                <Flex
                  align={"center"}
                  justify={"space-between"}
                  gap={"0.1rem"}
                  mt='md'
                  mb='md'
                  ml='md'
                  mr='md'
                >
                  <Tooltip label={x.num_sent.toLocaleString() + " Sent / " + x.num_sent.toLocaleString() + " Sent"}>
                    <Flex gap={"0.25rem"} align={"center"} sx={{cursor: 'pointer'}}>
                      <IconSend size="0.75rem" color="#868E96" />
                      <Text fw={"600"} fz={"0.8rem"} color="gray.6">
                        Send:
                      </Text>
                      <Text fw={"600"} fz={"0.8rem"} color="gray.8">
                        {x.sent_percent}%
                      </Text>
                    </Flex>
                  </Tooltip>

                  <Tooltip label={x.num_opens.toLocaleString() + " Opens / " + x.num_sent.toLocaleString() + " Sent"}>
                    <Flex gap={"0.25rem"} align={"center"} sx={{cursor: 'pointer'}}>
                      <IconChecks size="0.75rem" color="#868E96" />
                      <Text fw={"600"} fz={"0.8rem"} color="gray.6">
                        Opens:
                      </Text>
                      <Text fw={"600"} fz={"0.8rem"} color="gray.8">
                        {Math.round(x.open_percent * 100)}%
                      </Text>
                    </Flex>
                  </Tooltip>

                  <Tooltip label={x.num_replies.toLocaleString() + " Replies / " + x.num_sent.toLocaleString() + " Sent"}>
                    <Flex gap={"0.25rem"} align={"center"} sx={{cursor: 'pointer'}}>
                      <IconMessageCheck size="0.75rem" color="#868E96" />
                      <Text fw={"600"} fz={"0.8rem"} color="gray.6">
                        Replies:
                      </Text>
                      <Text fw={"600"} fz={"0.8rem"} color="gray.8">
                        {Math.round(x.reply_percent * 100)}%
                      </Text>
                    </Flex>
                  </Tooltip>
                </Flex>

                <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => {
                  showNotification({
                    title: 'Coming Soon',
                    message: 'This feature is coming soon!',
                    color: 'blue',
                    icon: <IconEye />,
                  });
                }}>
                  View in {x.name?.trim()}'s Sight
                </Button>
              </Card>
          </Grid.Col>
        )
        })}
      </Grid>
  </Card>
}


export default function OverviewPage() {


  return (
    <Container p="xl">
      <Title order={2} mb='md'>Overview</Title>
      <BarChart />
      <ActiveCampaigns />
    </Container>
  );
}
