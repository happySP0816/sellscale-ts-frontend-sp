import PersonaBrain from "@common/persona/PersonaBrain";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { Box, Container, Card } from "@mantine/core";
import React from "react";

export default function SellScaleBrainPersonasTab() {
  const [selectedPersona, setSelectedPersona]: any = React.useState(null);

  return (
    <Box>
      <Container>
        <Container>
          <PersonaSelect
            disabled={false}
            onChange={(archetypes) =>
              setSelectedPersona(archetypes.length > 0 ? archetypes[0].archetype_id : null)
            }
            selectMultiple={false}
            label="Select a persona"
            description="Select a persona to update information about it."
          />
        </Container>
        <Box mt="lg">
          {selectedPersona && <PersonaBrain archetype_id={selectedPersona} />}
        </Box>
      </Container>
    </Box>
  );
}
