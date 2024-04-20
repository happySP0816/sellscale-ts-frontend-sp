import { Button, Flex, Select, Text, TextInput } from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";
import { useEffect, useState } from "react";

export default function SplitSegmentModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  parentSegments: Array<{ segment_id: number; segment_title: string }>;
  onSplit: (segment_id: any, segment_title: any) => void;
}>) {
  const [parentSegmentId, setParentSegmentId] = useState(null);
  const [childSegmentName, setChildSegmentName] = useState(null);

  return (
    <>
      <Flex direction={"column"} gap={"lg"}>
        <Text color="gray" fw={400} size={"sm"}>
          Split the segment from a parent segment to a new segment. After
          creating this sub segment, you will be navigated to filter prospects &
          add into this segment.
        </Text>
        <Select
          withinPortal
          label={
            <Text color="gray" fw={500}>
              SPLIT FROM SEGMENT:
            </Text>
          }
          placeholder="Select Segment"
          data={innerProps.parentSegments.map((segment: any) => ({
            value: segment.segment_id,
            label: segment.segment_title,
          }))}
          onChange={(value: any) => setParentSegmentId(value)}
        />
        <TextInput
          label={
            <Text color="gray" fw={500}>
              CHILD SEGMENT NAME:
            </Text>
          }
          placeholder="Enter child segment name"
          onChange={(event: any) =>
            setChildSegmentName(event.currentTarget.value)
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
              innerProps.onSplit(parentSegmentId, childSegmentName);
            closeAllModals();
          }}
        >
          Split Segment
        </Button>
      </Flex>
    </>
  );
}
