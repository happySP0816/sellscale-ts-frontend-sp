import { Box, Divider, Stack, Title, Text, Flex, Button, Rating, Card } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import Operation, { Priority } from './Operation/Operation';
import moment from 'moment';
import HighPriority from './Operation/HighPriority';
import MediumPriorityStack from './MediumPriorityStack';
import HighPriorityStack from './HighPriorityStack';
import LowPriorityStack from './LowPriorityStack';
import PreviouslyCompletedTask from './PreviouslyCompletedTask';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';

// TypeScript enum for OperatorNotificationPriority
enum OperatorNotificationPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  COMPLETED = 10,
}

// TypeScript interface for OperatorNotification
export interface OperatorNotification {
  id: number;
  client_sdr_id: number;
  title: string;
  subtitle: string;
  stars?: number;
  cta: string;
  data: any; // Adjust according to your data structure
  priority: OperatorNotificationPriority;
  notification_type: string;
}

// Interface for categorized notifications
interface CategorizedNotifications {
  high: OperatorNotification[];
  medium: OperatorNotification[];
  low: OperatorNotification[];
  completed: OperatorNotification[];
}

const OperatorOverview = () => {
  const userToken = useRecoilValue(userTokenState);
  const [notifications, setNotifications] = useState<CategorizedNotifications>({
    high: [],
    medium: [],
    low: [],
    completed: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notification/all`, {
          headers: {
            Authorization: 'Bearer ' + userToken,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        categorizeNotifications(data.notifications);
      } catch (error) {
        console.error('Error fetching notifications', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const categorizeNotifications = (notifications: OperatorNotification[]) => {
    const categorized: CategorizedNotifications = {
      high: [],
      medium: [],
      low: [],
      completed: [],
    };

    notifications.forEach((notification) => {
      switch (notification.priority) {
        case OperatorNotificationPriority.HIGH:
          categorized.high.push(notification);
          break;
        case OperatorNotificationPriority.MEDIUM:
          categorized.medium.push(notification);
          break;
        case OperatorNotificationPriority.LOW:
          categorized.low.push(notification);
          break;
        case OperatorNotificationPriority.COMPLETED:
          categorized.completed.push(notification);
          break;
      }
    });

    setNotifications(categorized);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box p='xl' maw='1000px' ml='auto' mr='auto' bg={'white'}>
      <Title order={2} mb='0px'>
        Operator Overview
      </Title>
      <Divider my='md' />

      <Stack spacing={'xl'}>
        {notifications.high.length + notifications.medium.length + notifications.low.length ===
          0 && (
          <Card withBorder>
            <Text c={'gray.6'} fw={400} fz={'lg'} align={'center'}>
              No pending notifications
            </Text>
          </Card>
        )}

        <HighPriorityStack notifications={notifications.high} />

        <MediumPriorityStack />

        {/* <LowPriorityStack  /> */}

        {notifications.completed.length > 0 && (
          <PreviouslyCompletedTask notifications={notifications.completed} />
        )}
      </Stack>
    </Box>
  );
};

export default OperatorOverview;
