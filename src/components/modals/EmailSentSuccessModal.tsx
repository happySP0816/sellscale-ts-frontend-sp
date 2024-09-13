import { Flex, Paper, Text } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons";

export default function EmailSentSuccessModal() {
  return (
    <Paper h={80}>
      <Flex justify={"center"} align={"center"} direction={"column"}>
        <IconCircleCheck fill="#37B24D" color="white" size={"3rem"} />
        <Text size={"lg"} fw={500}>
          Email sent!
        </Text>
      </Flex>
    </Paper>
  );
}
