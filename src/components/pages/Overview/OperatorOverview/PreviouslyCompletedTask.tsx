import { Stack, Flex, Button, Text } from "@mantine/core";
import moment from "moment";
import React from "react";
import HighPriority from "./Operation/HighPriority";
import Operation, { Priority } from "./Operation/Operation";

const PreviouslyCompletedTask = () => {
  return (
    <Stack>
      <Flex>
        <Text c={"gray.6"} fw={700} fz={"lg"}>
          Previously Completed Task: &nbsp;
        </Text>
      </Flex>

      {new Array(2).fill(0).map((i, idx) => (
        <Operation
          priority={Priority.High}
          renderLeft={
            <Flex align={"center"}>
              <Text fw={500} fz={"sm"}>
                Review New Campaign&nbsp;
              </Text>
              <Text fw={500} fz={"sm"} c={"gray.6"}>
                Launched {moment(new Date()).format("MMM d,yyyy")}
              </Text>
            </Flex>
          }
          renderContent={<HighPriority />}
        />
      ))}
    </Stack>
  );
};

export default PreviouslyCompletedTask;
