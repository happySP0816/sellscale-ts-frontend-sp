import { Box, Button, Flex, Text } from "@mantine/core";

export default function ResetSegmentModal() {
  return (
    <Box>
      <Text color="gray" fw={600} size={"sm"}>
        {480} contacts <span className="font-normal">will be removed from their campaign, and this segment and will be moved into a new segment called</span>
      </Text>
      <Text mt={"xs"} fw={600} size={"sm"} color="gray">
        'Long Tail EHR Companies - Reset 6/7'
      </Text>
      <Flex mt={"xl"} gap={"xl"}>
        <Button fullWidth variant="outline" color="gray">
          Cancel
        </Button>
        <Button color="red" fullWidth>
          Confirm Reset
        </Button>
      </Flex>
    </Box>
  );
}
