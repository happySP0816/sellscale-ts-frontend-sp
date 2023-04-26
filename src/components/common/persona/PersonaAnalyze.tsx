import {
  Button,
  Card,
  Flex,
  Text,
  Title,
  Box,
  Badge,
  Grid,
} from "@mantine/core";
import PersonaAnalyzeTable from "./PersonaAnalyzeTable";

type PropsType = {
  archetype_id: number;
};

export default function PersonaAnalyze(props: PropsType) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      gap={{ base: "sm", sm: "lg" }}
      justify={{ sm: "left" }}
    >
      <Box w="33%">
        <Card>
          <Title order={4}>Analyze Prospect Personas</Title>
          <Text mt="md" size="sm">
            Process all the prospects who are in an unassigned persona and
            determine what some ideas persona groupings would be.
          </Text>
          <Text mt="sm" size="sm">
            Use this tool to ideate on what some of the personas might be for
            your prospects. This will help you to better understand your
            prospects and how to best communicate with them.
          </Text>
          <Button mt="md">Analyze Prospect Personas</Button>
        </Card>
      </Box>
      <Card w="66%">
        <Grid>
          <Grid.Col span={8}>
            <Title order={4}>Suggested Personas</Title>
          </Grid.Col>
          <Grid.Col span={4}>
            <Badge>Last run: April 20, 2023</Badge>
          </Grid.Col>
        </Grid>
        <Text mb="sm" mt="md" size="sm">
          Using a sample of 100 prospects that are currently unassigned, here
          are some personas that would make sense to use as buckets to group.
        </Text>
        <PersonaAnalyzeTable />
      </Card>
    </Flex>
  );
}
