import { Stack, Flex, Button, Text } from "@mantine/core";
import moment from "moment";
import React from "react";
import HighPriority from "./Operation/HighPriority";
import Operation, { Priority } from "./Operation/Operation";
import { OperatorNotification } from '.';
import { IconAlarm } from '@tabler/icons';

type PropsType = {
  notifications: OperatorNotification[]
}

const HighPriorityStack = (props: PropsType) => {

  if (!props.notifications || props.notifications.length === 0) {
    return null;
  }

  return (
    <Stack>
      <Flex>
        <Text c={"red.6"} fw={700} fz={"lg"}>
          High Priority: &nbsp;
        </Text>

        <Text c={"gray.6"} fw={700} fz={"lg"}>
          Review New Campaigns
        </Text>
      </Flex>

      {props.notifications.map((notification: OperatorNotification, idx: number) => (
        <Operation
          priority={Priority.High}
          renderLeft={
            <Flex align={"center"}>
              <Text fw={500} fz={"sm"}>
                {notification.title}{" "}
              </Text>
              <Text fw={500} fz={"sm"} c={"gray.6"} ml='xs'>
                {notification.subtitle}
              </Text>
            </Flex>
          }
          renderContent={<HighPriority notification={notification} />}
          renderRight={
            <Button size="xs" variant="outline" radius={"xl"} compact color='red' leftIcon={<IconAlarm size='0.9rem' />}>
              Due on {moment().format("MMM D")}
            </Button>
          }
        />
      ))}
    </Stack>
  );
};

export default HighPriorityStack;
