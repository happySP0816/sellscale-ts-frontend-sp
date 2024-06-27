import { Box, Paper, Text } from "@mantine/core";

export default function StrategyPreviewModal() {
  return (
    <Paper>
      <Box>
        <Text fw={700}>Goal</Text>
        <Text fw={500}>{"Test out if Bay Area is working better; select eifferent meetings"}</Text>
      </Box>
      <Box mt={30}>
        <Text fw={700}>Expected result</Text>
        <Text fw={500}>{"We should expect that local connections can work well and that we can get results."}</Text>
      </Box>
      <Box mt={30}>
        <Text fw={700}>Project lift</Text>
        <Text fw={500}>{"$2n pipeline"}</Text>
      </Box>
    </Paper>
  );
}
