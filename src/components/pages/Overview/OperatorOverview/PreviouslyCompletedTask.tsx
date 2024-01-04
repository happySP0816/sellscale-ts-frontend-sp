import { Stack, Flex, Button, Text, Box, Badge } from "@mantine/core";
import moment from "moment";
import React from "react";
import HighPriority from "./Operation/HighPriority";
import Operation, { Priority } from "./Operation/Operation";
import { OperatorNotification } from '.';
import { deterministicMantineColor } from '@utils/requests/utils';

type PropsType = {
  notifications: OperatorNotification[]
}

const PreviouslyCompletedTask = (props: PropsType) => {
  return (
    <Stack>
      <Flex>
        <Text c={"gray.6"} fw={700} fz={"lg"}>
          Previously Completed Task: &nbsp;
        </Text>
      </Flex>

      {props.notifications.map((entry: OperatorNotification, idx: number) => (
        <Operation
          priority={Priority.Complete}
          renderLeft={
            <Box>
              <Flex align={"center"}>
                <Text fw={500} fz={"sm"}>
                  {entry?.title}
                </Text>
                <Text fw={500} fz={"sm"} c={"gray.6"} ml='xs'>
                  {entry?.subtitle}
                </Text>
                <Badge size='xs' color={'grape'} ml='xs' variant='outline'>
                  type: {entry?.notification_type.replaceAll("_", " ")}
                </Badge>
              </Flex> 
            </Box>
          }
        />
      ))}
    </Stack>
  );
};

export default PreviouslyCompletedTask;
