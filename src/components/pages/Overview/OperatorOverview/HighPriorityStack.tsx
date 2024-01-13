import { Stack, Flex, Button, Text } from '@mantine/core';
import moment from 'moment';
import React, { useState } from 'react';
import HighPriority from './Operation/HighPriority';
import Operation, { Priority } from './Operation/Operation';
import { OperatorNotification } from '.';
import { IconAlarm } from '@tabler/icons';
import ChangeMessagePriority from './Operation/ChangeMessagePriority';
import CampaignReviewModal from './Operation/CampaignReviewModal/CampaignReviewModal';
import { useDisclosure } from '@mantine/hooks';
import ScheduleMeeting from './Operation/ScheduleMeeting';

type PropsType = {
  notifications: OperatorNotification[];
};

const HighPriorityStack = (props: PropsType) => {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const [selectItem, setSelectItem] = useState<any>(null);

  if (!props.notifications || props.notifications.length === 0) {
    return null;
  }

  return (
    <>
      <Stack>
        <Flex>
          <Text c={'red.6'} fw={700} fz={'lg'}>
            High Priority: &nbsp;
          </Text>

          <Text c={'gray.6'} fw={700} fz={'lg'}>
            Review New Campaigns
          </Text>
        </Flex>
        <Operation
          priority={Priority.High}
          renderLeft={
            <Flex align={'center'}>
              <Text fw={500} fz={'sm'}>
                {props.notifications[0].title}{' '}
              </Text>
              <Text fw={500} fz={'sm'} c={'gray.6'} ml='xs'>
                {props.notifications[0].subtitle}
              </Text>
            </Flex>
          }
          renderContent={<HighPriority notification={props.notifications[0]} />}
          renderRight={
            <Button
              size='xs'
              variant='outline'
              radius={'xl'}
              compact
              color='green'
              onClick={() => {
                setSelectItem(props.notifications[0]);
                toggle();
              }}
            >
              Review Campaign
            </Button>
          }
        />
        {props.notifications.map((notification: OperatorNotification, idx: number) => (
          <Operation
            priority={Priority.High}
            renderLeft={
              <Flex align={'center'}>
                <Text fw={500} fz={'sm'}>
                  {notification.title}{' '}
                </Text>
                <Text fw={500} fz={'sm'} c={'gray.6'} ml='xs'>
                  {notification.subtitle}
                </Text>
              </Flex>
            }
            renderContent={<HighPriority notification={notification} />}
            renderRight={
              <Button
                size='xs'
                variant='outline'
                radius={'xl'}
                compact
                color='red'
                leftIcon={<IconAlarm size='0.9rem' />}
              >
                Due on {moment().format('MMM D')}
              </Button>
            }
          />
        ))}

        <Operation
          priority={Priority.ChangingMessage}
          renderLeft={
            <Flex align={'center'}>
              <Text fw={500} fz={'sm'}>
                Change Messaging
              </Text>
              <Text fw={500} fz={'sm'} c={'gray.6'} ml='xs'>
                2 Errors Found (⚠️ Beta - Coming Soon ⚠️ )
              </Text>
            </Flex>
          }
          renderContent={<ChangeMessagePriority />}
          renderRight={
            <Button
              size='xs'
              variant='outline'
              radius={'xl'}
              compact
              color='red'
              leftIcon={<IconAlarm size='0.9rem' />}
            >
              Due on {moment().format('MMM D')}
            </Button>
          }
        />
      </Stack>
      
      <Operation
        priority={Priority.ScheduleMeeting}
        renderLeft={
          <Flex align={'center'}>
            <Text fw={500} fz={'sm'}>
              Schedule Meeting - In Development
            </Text>
          </Flex>
        }
        renderContent={<ScheduleMeeting />}
        renderRight={<></>}
      />

      <CampaignReviewModal
        opened={opened}
        onClose={close}
        notifId={selectItem?.id ?? -1}
        archetypeId={selectItem?.data?.archetype_id ?? -1}
        data={selectItem?.data}
      />
    </>
  );
};

export default HighPriorityStack;
