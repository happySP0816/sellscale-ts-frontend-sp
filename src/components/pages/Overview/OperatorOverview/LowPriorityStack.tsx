import { Stack, Text, Flex, Button, Rating } from "@mantine/core";
import Operation from "./Operation/Operation";
import { Priority } from "./Operation/Operation";
import MediumPriority from "./Operation/MediumPriority";
import moment from "moment";
import LowPriority from "./Operation/LowPriority";

const LowPriorityStack = () => {
  return (
    <Stack>
      <Flex>
        <Text c={"green.6"} fw={700} fz={"lg"}>
          Low Priority: &nbsp;
        </Text>

        <Text c={"gray.6"} fw={700} fz={"lg"}>
          Add Demo Feedback
        </Text>
      </Flex>

      {new Array(2).fill(0).map((i, idx) => (
        <Operation
          priority={Priority.Low}
          renderLeft={
            <Flex align={"center"}>
              <Text fw={500} fz={"sm"}>
                Schedule Meeting&nbsp;
              </Text>
              <Text fw={500} fz={"sm"} c={"gray.6"}>
                Schedule For {moment(new Date()).format("MMM d,yyyy hh:mm A")}
              </Text>
            </Flex>
          }
          renderContent={<LowPriority />}
          renderRight={
            <Flex align={"center"} gap={"sm"}>
              <Button size="xs" variant="outline" radius={"xl"} compact>
                Schedule
              </Button>
            </Flex>
          }
        />
      ))}
    </Stack>
  );
};

export default LowPriorityStack;
