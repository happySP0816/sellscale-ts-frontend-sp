import { Flex, Paper, Text } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons";

export default function ClearInboxSuccessModal() {
  return (
    <Paper h={120}>
      <Flex justify={"center"} align={"center"} direction={"column"}>
        <IconCircleCheck fill="#37B24D" color="white" size={"3rem"} />
        <Text size={"lg"} fw={600}>
          Amazing!
        </Text>
        <Text size={"md"} fw={400} mt={"xs"}>
          Inbox has been cleared
        </Text>
      </Flex>
    </Paper>
  );
}
