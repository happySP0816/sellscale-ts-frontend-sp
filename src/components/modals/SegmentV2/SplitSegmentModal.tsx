import { Button, Flex, Select, Text, TextInput } from '@mantine/core';
import { closeAllModals } from '@mantine/modals';

export default function SplitSegmentModal() {
  const handleSplit = () => {
    console.log('=========handleSplit');
    closeAllModals();
  };

  return (
    <>
      <Flex direction={'column'} gap={'lg'}>
        <Text color='gray' fw={400} size={'sm'}>
          Split the segment from a parent segment to a new segment. After creating this sub segment, you will be navigated to filter prospects & add into this
          segment.
        </Text>
        <Select
          label={
            <Text color='gray' fw={500}>
              SPLIT FROM SEGMENT:
            </Text>
          }
          placeholder='Select Segment'
          data={['Segment#1', 'Segment#2', 'Segment#3', 'Segment#4']}
        />
        <TextInput
          label={
            <Text color='gray' fw={500}>
              CHILD SEGMENT NAME:
            </Text>
          }
          placeholder='Enter child segment name'
        />
      </Flex>
      <Flex gap={'lg'} mt={40}>
        <Button fullWidth variant='outline' color='gray' radius='md' onClick={() => closeAllModals()}>
          Cancel
        </Button>
        <Button fullWidth radius='md' onClick={handleSplit}>
          Split Segment
        </Button>
      </Flex>
    </>
  );
}
