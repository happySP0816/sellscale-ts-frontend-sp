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
import PersonaSplitSelect from "./PersonaSplitSelect";
import { useState } from "react";
type PropsType = {
  archetype_id: number;
};

export default function PersonaSplit(props: PropsType) {
  const [disablePersonaSplitButton, setDisablePersonaSplitButton] = useState(
    false
  );
  const [splittingPersonas, setSplittingPersonas] = useState(false);
  const triggerPersonaSplit = async () => {
    setDisablePersonaSplitButton(true);
    setSplittingPersonas(true);
  };

  return (
    <Box w="60%">
      <Container>
        <Title order={4}>Split Prospects into Personas</Title>
        <Text size="sm" mb="lg">
          Select the personas you want to split your prospects into and then
          click the button <Code>Split into Personas</Code> to automatically
          split your prospects into the selected personas.
        </Text>
        <PersonaSplitSelect disabled={disablePersonaSplitButton} />
        <Button
          color="grape"
          mt="lg"
          onClick={triggerPersonaSplit}
          disabled={disablePersonaSplitButton}
        >
          Split into Personas
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
    </Box>
  );
}
