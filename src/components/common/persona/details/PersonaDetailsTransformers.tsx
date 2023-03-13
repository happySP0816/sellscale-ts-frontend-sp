import TransformersChart from "@common/charts/TransformersChart";
import { Box, Center, Container } from "@mantine/core";
import TransformersTable from "./TransformersTable";

export default function PersonaDetailsTransformers() {
  
  return (
    <Box>
      <Center p={0} h={310}>
        <TransformersChart />
      </Center>
      <TransformersTable />
    </Box>
  );
}
