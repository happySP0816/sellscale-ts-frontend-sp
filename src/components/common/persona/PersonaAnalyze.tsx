import * as React from "react";
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
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";

type PropsType = {
  archetype_id: number;
};

export default function PersonaAnalyze(props: PropsType) {
  const [showAnalysis, setShowAnalysis] = React.useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);
  const [personaBuckets, setPersonaBuckets] = React.useState([]);
  const userToken = useRecoilValue(userTokenState);

  const runPersonaAnalysis = () => {
    setLoadingAnalysis(true);
    fetch(
      `${API_URL}/client/archetype/predict_persona_buckets_from_client_archetype`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          client_archetype_id: props.archetype_id,
        }),
      }
    )
      .then((res) => res.json())
      .then((j) => {
        setShowAnalysis(true);
        setPersonaBuckets(j.data);
      })
      .finally(() => {
        setLoadingAnalysis(false);
      });
  };

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
          <Button
            mt="md"
            loading={loadingAnalysis}
            onClick={runPersonaAnalysis}
          >
            Analyze Prospect Personas
          </Button>
        </Card>
      </Box>
      <Card w="66%" hidden={!showAnalysis}>
        <Grid>
          <Grid.Col span={8}>
            <Title order={4}>Suggested Personas</Title>
          </Grid.Col>
          <Grid.Col span={4}></Grid.Col>
        </Grid>
        <Text mb="sm" mt="md" size="sm">
          Using a sample of 100 prospects that are currently unassigned, here
          are some personas that would make sense to use as buckets to group.
        </Text>
        <PersonaAnalyzeTable data={personaBuckets} />
      </Card>
    </Flex>
  );
}
