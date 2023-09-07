// @ts-nocheck

import { userTokenState } from "@atoms/userAtoms";
import FlexSeparate from "@common/library/FlexSeparate";
import {
  Badge,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Title,
} from "@mantine/core";
import { IconArrowNarrowRight } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import getPersonas from "@utils/requests/getPersonas";
import {
  getSequences,
  saveSequenceToPersona,
} from "@utils/requests/getSequences";
import { useRecoilValue } from "recoil";
import { Archetype } from "src";

export default function EmailOutboundProgram() {
  const userToken = useRecoilValue(userTokenState);

  const { data: sequences } = useQuery({
    queryKey: [`query-get-all-sequences`],
    queryFn: async () => {
      const result = await getSequences(userToken);
      return result.status === "success" ? result.data : [];
    },
  });

  const { data: personas, isFetching } = useQuery({
    queryKey: [`query-sequences-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.data as Archetype[]) : [];

      const personas = result.sort((a, b) => {
        if (a.active === b.active) {
          return (
            b.performance?.total_prospects - a.performance?.total_prospects
          );
        } else {
          return a.active ? -1 : 1;
        }
      });

      return personas;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Stack spacing="xl">
      <Paper withBorder p="md" radius="md" w="100%">
        <Title order={3}>
          Current SLA:{" "}
          <Badge
            variant="filled"
            size="xl"
            mx={5}
            styles={{ inner: { fontSize: "24px" } }}
          >
            75
          </Badge>{" "}
          <i>email messages per week</i>
        </Title>
      </Paper>
      <Stack>
        <LoadingOverlay visible={!personas || isFetching} overlayBlur={2} />
        {personas &&
          personas.map((persona, index) => (
            <Paper key={index} withBorder p="md" radius="md" w="100%">
              <Group position="center" spacing="sm" grow>
                <FlexSeparate>
                  <Title order={5}>{persona.archetype}</Title>
                  <Title order={5}>
                    <IconArrowNarrowRight size="2.125rem" />
                  </Title>
                </FlexSeparate>
                <Select
                  defaultValue={persona.vessel_sequence_id + ""}
                  placeholder="Select a sequence"
                  searchable
                  clearable
                  nothingFound="None found"
                  data={
                    sequences
                      ? sequences.map(
                          (sequence: {
                            name: string;
                            sequence_id: string;
                          }) => ({
                            value: sequence.sequence_id,
                            label: sequence.name,
                          })
                        )
                      : []
                  }
                  onChange={async (value) => {
                    const result = await saveSequenceToPersona(
                      userToken,
                      persona.id + "",
                      value ?? "-1"
                    );
                  }}
                />
                <Badge
                  color={persona.active ? "teal" : "red"}
                  variant="light"
                  styles={{ root: { height: 35 } }}
                >
                  {persona.active ? "Active" : "Inactive"}
                </Badge>
              </Group>
            </Paper>
          ))}
      </Stack>
    </Stack>
  );
}
