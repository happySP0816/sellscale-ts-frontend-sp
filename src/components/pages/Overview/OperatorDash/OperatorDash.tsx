import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@constants/data';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import {
  Badge,
  Card,
  Text,
  Title,
  Button,
  Group,
  Box,
  Divider,
  Tooltip,
  Flex,
  useMantineTheme,
  Loader,
} from '@mantine/core';
import { IconX, IconArrowRight } from '@tabler/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export interface Task {
  id: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'DISMISSED';
  emoji: string;
  title: string;
  subtitle: string;
  cta: string;
  cta_url: string;
  due_date: string; // or Date if you convert the date string to a Date object
}

type PropsType = {
  onOperatorDashboardEntriesChange: (entries: Task[]) => void;
};

const OperatorDashboard = (props: PropsType) => {
  const [highPriorityTasks, setHighPriorityTasks] = useState<Task[]>([]);
  const [mediumPriorityTasks, setMediumPriorityTasks] = useState<Task[]>([]);
  const [lowPriorityTasks, setLowPriorityTasks] = useState<Task[]>([]);
  const [oldTasks, setOldTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  const [fetchingComplete, setFetchingComplete] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/operator_dashboard/all`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });

        setLoading(false);

        const tasks = response.data.entries;
        categorizeTasks(tasks);

        const incompleteTasks = tasks.filter((task: Task) => task.status === 'PENDING');
        props.onOperatorDashboardEntriesChange(incompleteTasks);
      } catch (error) {
        console.error('Error fetching tasks', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userToken]);

  const categorizeTasks = (tasks: Task[]) => {
    const high: Task[] = [],
      medium: Task[] = [],
      low: Task[] = [],
      old: Task[] = [];

    tasks.forEach((task: Task) => {
      if (task.status !== 'PENDING') {
        old.push(task);
      } else {
        switch (task.urgency) {
          case 'HIGH':
            high.push(task);
            break;
          case 'MEDIUM':
            medium.push(task);
            break;
          case 'LOW':
            low.push(task);
            break;
          default:
            break;
        }
      }
    });

    setHighPriorityTasks(high);
    setMediumPriorityTasks(medium);
    setLowPriorityTasks(low);
    setOldTasks(old);
  };

  const redirectToTask = async (taskId: number) => {
    setCurrentTaskId(taskId);
    setFetchingComplete(true);
    navigate(`/task/${taskId}`);
  };

  const theme = useMantineTheme();

  const renderTaskCard = (task: Task) => (
    <Card withBorder mb='xs' p='md' key={task.id}>
      <Flex>
        <Box
          sx={{ borderRadius: '100px', textAlign: 'center', width: 36, height: 36 }}
          bg={
            task.status !== 'PENDING'
              ? theme.colors.gray[3]
              : task.urgency === 'HIGH'
              ? theme.colors.red[3]
              : task.urgency === 'MEDIUM'
              ? theme.colors.yellow[3]
              : task.urgency === 'LOW'
              ? theme.colors.green[3]
              : ''
          }
          mr='16px'
          mt='4px'
        >
          <Text fz={'18px'} size='xl' mt='5px'>
            {task.emoji}
          </Text>
        </Box>
        <Box w='80%'>
          <Title order={5}>{task.title}</Title>
          <Text color='#666' size='sm'>
            {task.subtitle}
          </Text>
          <Text color='gray' fw='600' fz='xs' mt='xs'>
            Due on {moment(task.due_date).format('MMM Do YYYY')}
          </Text>
        </Box>
        <Group w='40%' sx={{ justifyContent: 'flex-end' }}>
          <Button
            component='a'
            variant='filled'
            disabled={task.status !== 'PENDING'}
            color={
              'teal'
            }
            onClick={() => redirectToTask(task.id)}
            loading={fetchingComplete && currentTaskId === task.id}
          >
            {/* {task.cta} */}
            Let's do it
            {'  '} <IconArrowRight size={16} />
          </Button>
        </Group>
      </Flex>
    </Card>
  );

  const renderSection = (title: string, tasks: Task[]) => {
    if (tasks.length === 0) return null;
    return (
      <>
        <Title order={4} mb='xs'>
          {tasks[0].status !== 'PENDING'
            ? '☑️'
            : tasks[0].urgency === 'HIGH'
            ? '🔴'
            : tasks[0].urgency === 'MEDIUM'
            ? '🟡'
            : tasks[0].urgency === 'LOW'
            ? '🟢'
            : ''}{' '}
          {title} <span style={{ fontWeight: '400' }}>({tasks.length} tasks)</span>
        </Title>
        {tasks.map(renderTaskCard)}
        <Divider mt='lg' mb='lg' />
      </>
    );
  };

  if (loading) {
    return (
      <Card shadow='sm' p='lg'>
        <Loader ml='auto' mr='auto' />
      </Card>
    );
  }

  return (
    <Card shadow='sm' p='lg'>
      {renderSection('High Priority', highPriorityTasks)}
      {renderSection('Medium Priority', mediumPriorityTasks)}
      {renderSection('Low Priority', lowPriorityTasks)}
      {renderSection('Completed', oldTasks)}
    </Card>
  );
};

export default OperatorDashboard;
