import { Button, Divider, Flex, Stack, Text, TextInput } from "@mantine/core";
import { IconEdit } from "@tabler/icons";

export default function CreateVisitorBucketModal() {
  return (
    <Stack spacing={"sm"}>
      <TextInput label="Title" rightSection={<IconEdit size={"1rem"} color="gray" />} />
      <TextInput label="AI Instruction" rightSection={<IconEdit size={"1rem"} color="gray" />} />
      <TextInput label="Test" rightSection={<IconEdit size={"1rem"} color="gray" />} />
      <Divider variant="dashed" my={"sm"} />
      <Text size={"sm"} fw={500}>
        <span className="text-gray-400 mr-1">Result:</span>
        COMPETITOR
      </Text>
      <Flex gap={"xl"} mt={"sm"}>
        <Button fullWidth variant="outline" color="gray">
          Go Back
        </Button>
        <Button fullWidth>Save</Button>
      </Flex>
    </Stack>
  );
}
