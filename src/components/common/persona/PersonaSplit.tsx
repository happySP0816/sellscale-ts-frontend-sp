import {
  Box,
  Button,
  Card,
  Code,
  Container,
  Flex,
  Loader,
  Text,
  Title,
} from "@mantine/core";
import PersonaSelect from "./PersonaSplitSelect";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import PersonaRecentSplitRequests from "./PersonaRecentSplitRequests";
type PropsType = {
  archetype_id: number;
};

export default function PersonaSplit(props: PropsType) {
  const [disablePersonaSplitButton, setDisablePersonaSplitButton] = useState(
    false
  );
  const [splittingPersonas, setSplittingPersonas] = useState(false);
  const [destinationPersonaIDs, setDestinationPersonaIDs] = useState<number[]>(
    []
  );
  const [userToken] = useRecoilState(userTokenState);

  const triggerPersonaSplit = async () => {
    postSplitRequest();
  };

  const postSplitRequest = () => {
    fetch(`${API_URL}/personas/split_prospects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_archetype_id: props.archetype_id,
        target_archetype_ids: destinationPersonaIDs,
      }),
    }).then((res) => {
      if (res.status === 200) {
        setSplittingPersonas(true);
        setDisablePersonaSplitButton(true);
        console.log("Splitting prospects into personas...");
      }
    });
  };

  return (
    <Flex>
      <Container w="60%">
        <Title order={4}>Split Prospects into Personas</Title>
        <Text size="sm" mb="lg">
          Select the personas you want to split your prospects into and then
          click the button <Code>Split into Personas</Code> to automatically
          split your prospects into the selected personas.
        </Text>
        <PersonaSelect
          disabled={disablePersonaSplitButton}
          onChange={setDestinationPersonaIDs}
          selectMultiple={true}
          label="Select Personas to Split Prospects Into"
          description="The prospects will be split into the selected personas using the splitting AI"
        />
        <Button
          color="grape"
          mt="lg"
          onClick={triggerPersonaSplit}
          disabled={
            disablePersonaSplitButton || destinationPersonaIDs.length === 0
          }
        >
          Split into {destinationPersonaIDs.length} Personas
        </Button>
        {splittingPersonas && (
          <Card mt="lg">
            <Flex>
              <Loader mr="lg" />
              <Box>
                <Text>Splitting prospects into personas...</Text>
                <Text size="xs">
                  This may take a few minutes. Feel free to check back in in a
                  little bit.
                </Text>
              </Box>
            </Flex>
          </Card>
        )}
      </Container>
      <Container w="40%">
        <PersonaRecentSplitRequests archetype_id={props.archetype_id} />
      </Container>
    </Flex>
  );
}
