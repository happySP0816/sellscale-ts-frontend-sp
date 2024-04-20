import { Button, Flex, Select, Text, TextInput } from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";

export default function SplitSegmentModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  default_parent_segment_id: any;
  parentSegments: Array<{ segment_id: number; segment_title: string }>;
  onParentSegmentChange: (segment_id: number) => void;
  onChildSegmentNameChange: (segment_title: string) => void;
  onSplit: () => void;
}>) {
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
          defaultValue={innerProps.default_parent_segment_id}
          placeholder="Select Segment"
          data={innerProps.parentSegments.map((segment: any) => ({
            value: segment.segment_id,
            label: segment.segment_title,
          }))}
          onChange={(value: any) => innerProps.onParentSegmentChange(value)}
        />
        <TextInput
          label={
            <Text color="gray" fw={500}>
              CHILD SEGMENT NAME:
            </Text>
          }
          placeholder="Enter child segment name"
          onChange={(event) =>
            innerProps.onChildSegmentNameChange(event.currentTarget.value)
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
            innerProps.onSplit && innerProps.onSplit();
            closeAllModals();
          }}
        >
          Split Segment
        </Button>
      </Flex>
    </>
  );
}
