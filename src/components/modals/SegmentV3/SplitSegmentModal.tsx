import {Button, Flex, NumberInput, Select, Text, TextInput} from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";
import { useEffect, useState } from "react";

export default function SplitSegmentModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  currentSegment: { id: number; segment_title: string };
  onSplit: (segment_id: any, segment_title: any) => void;
}>) {
  const [numberOfBatches, setNumberOfBatches] = useState(1);

  return (
    <>
      <Flex direction={"column"} gap={"lg"}>
        <Text color="gray" fw={400} size={"sm"}>
          Split the segment from a parent segment to a new segment. After
          creating this sub segment, you will be navigated to filter prospects &
          add into this segment.
        </Text>
        <TextInput
          label={
            <Text color="gray" fw={500}>
              SPLIT FROM SEGMENT:
            </Text>
          }
          disabled
          placeholder="Select Segment"
          value={innerProps.currentSegment.segment_title}
        />
        <NumberInput
          label={
            <Text color="gray" fw={500}>
              Number Of New Batches:
            </Text>
          }
          placeholder="Enter Number Of Batches"
          value={numberOfBatches}
          onChange={(event: any) =>
            {
              setNumberOfBatches(+event)
            }
          }
        />
      </Flex>
      <Flex gap={"lg"} mt={40}>
        <Button
          fullWidth
          variant="outline"
          color="gray"
          radius="md"
          onClick={() => closeAllModals()}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          radius="md"
          onClick={() => {
            innerProps.onSplit &&
              innerProps.onSplit(innerProps.currentSegment.id, numberOfBatches);
            closeAllModals();
          }}
        >
          Split Segment
        </Button>
      </Flex>
    </>
  );
}
