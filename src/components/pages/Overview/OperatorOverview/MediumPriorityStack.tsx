import { Stack, Text, Flex, Button, Rating } from "@mantine/core";
import Operation from "./Operation/Operation";
import { Priority } from "./Operation/Operation";
import MediumPriority from "./Operation/MediumPriority";

const MediumPriorityStack = () => {
  return (
    <Stack>
      <Flex>
        <Text c={"yellow.6"} fw={700} fz={"lg"}>
          Medium Priority: &nbsp;
        </Text>

        <Text c={"gray.6"} fw={700} fz={"lg"}>
          Schedule Prospects
        </Text>
      </Flex>

      {new Array(2).fill(0).map((i, idx) => (
        <Operation
          priority={Priority.Medium}
          renderLeft={
            <Flex align={"center"}>
              <Text fw={500} fz={"sm"}>
                Demo Feedback Needed&nbsp;
              </Text>
              <Text fw={500} fz={"sm"} c={"gray.6"}>
                Takayoshi Udumaa
              </Text>
            </Flex>
          }
          renderContent={<MediumPriority />}
          renderRight={
            <Flex align={"center"} gap={"sm"}>
              <Rating defaultValue={2} />
              <Button size="xs" variant="outline" radius={"xl"} compact>
                Add feedback
              </Button>
            </Flex>
          }
        />
      ))}
    </Stack>
  );
};

export default MediumPriorityStack;
