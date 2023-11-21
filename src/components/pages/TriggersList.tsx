import React, { useEffect, useState } from 'react';
import { Button, Card, Text, Badge, Switch, Grid, Box, Title, Flex, Loader} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import PageFrame from '@common/PageFrame';
import { IconEdit, IconPlus } from '@tabler/icons';

const TriggersList = () => {
  const [triggers, setTriggers] = useState([]);
  const [userToken] = useRecoilState(userTokenState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTriggers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/triggers/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setTriggers(data.triggers);
      } catch (error) {
        console.error('Error fetching triggers:', error);
      }

      setLoading(false);
    };

    fetchTriggers();
  }, [userToken]);

  return (
    <PageFrame>
      <Flex w='100%'>
        <Box>
          <Title order={3}>Triggers</Title>
          <Text color='gray'>
            SellScale will automatically find prospects from the active triggers below and add them to your campaigns.
          </Text>
        </Box>
        <Button
          ml='auto'
          mt='lg'
          onClick={() => navigate('/create-trigger')}
        >
          Create New Trigger
        </Button>
      </Flex>

      {
        loading &&
        <Card mt='md' w='100%' shadow='sm' p='lg' h={'80vh'} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Loader variant='dots' />
        </Card>
      }

      {
        triggers.length === 0 && !loading &&
        <Card mt='md' w='100%' shadow='sm' p='lg' h={'80vh'} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Text mt='md' color='gray'>
            You have no triggers yet. Create a new trigger to get started.
          </Text>
          <Button
            mt='lg'
            variant='outline'
            onClick={() => navigate('/create-trigger')}
            rightIcon={<IconPlus size={16} />}
          >
            Create New Trigger
          </Button>
        </Card>
      }

      <Grid mt='md' w='100%'>
        {triggers.map((trigger: any) => (
          <Grid.Col span={12} key={trigger.id} mb='xs'>
            <Card shadow="sm" p="lg">
              <Grid justify="space-between" align="center">
                <Grid.Col span={6}>
                  <Box>
                    <Box>
                      <Text fw='bold' size="lg">{trigger.emoji} {trigger.name}</Text>
                    </Box>
                    <Text fz='xs' color='black'>{trigger.description}</Text>
                    <Text mt='xs' color='gray' size='xs'><b>Last run:</b> {trigger.last_run} | <b>Next run:</b> {trigger.next_run}</Text>
                  </Box>
                </Grid.Col>

                <Grid.Col span={1}>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Button size='xs' leftIcon={<IconEdit size={16} />} onClick={() => navigate(`/setup/linkedin?campaign_id=${trigger.client_archetype_id}`)}>
                    Edit Campaign
                  </Button>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Badge size='lg' color="blue">{trigger.trigger_type.replaceAll("_", " ")}</Badge>
                </Grid.Col>
                <Grid.Col span={1}>
                  <Switch defaultChecked={trigger.active} label="Active" color="green" />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </PageFrame>
  );
};

export default TriggersList;
