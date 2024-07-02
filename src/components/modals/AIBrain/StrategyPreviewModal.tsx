import { Box, Paper, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";

export default function StrategyPreviewModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ description: string }>) {
  return (
    <Paper>
      <Box>
        <Text dangerouslySetInnerHTML={{ __html: innerProps.description }} />
      </Box>
    </Paper>
  );
}
