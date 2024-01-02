import {
  Box,
  Divider,
  Stack,
  Title,
  Text,
  Flex,
  Button,
  Rating,
} from "@mantine/core";
import React from "react";
import Operation, { Priority } from "./Operation/Operation";
import moment from "moment";
import HighPriority from "./Operation/HighPriority";
import MediumPriorityStack from "./MediumPriorityStack";
import HighPriorityStack from "./HighPriorityStack";
import LowPriorityStack from "./LowPriorityStack";
import PreviouslyCompletedTask from "./PreviouslyCompletedTask";

const OperatorOverview = () => {
  return (
    <Box p="xl" maw="1000px" ml="auto" mr="auto" bg={'white'}>
      <Title order={2} mb="0px">
        Operator Overview
      </Title>
      <Divider my="md" />

      <Stack spacing={"xl"}>
        <HighPriorityStack />

        <MediumPriorityStack />

        <LowPriorityStack />

        <PreviouslyCompletedTask />
      </Stack>
    </Box>
  );
};

export default OperatorOverview;
