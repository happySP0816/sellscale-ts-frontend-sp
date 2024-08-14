import { Box, Text, Button } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";

export default function StrategyDeleteModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  onSubmit: () => void;
}>) {
  return (
    <Box>
      <Text>Are you sure you want to delete this strategy?</Text>
      <Button onClick={() => {
        innerProps.onSubmit();
        context.closeAll();
      }} color="red">
        Delete
      </Button>
    </Box>
  );
}