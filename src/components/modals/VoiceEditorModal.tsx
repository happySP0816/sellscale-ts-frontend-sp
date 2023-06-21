import {
  Text,
  Paper,
  Textarea,
  Divider,
  Button,
  Card,
  Title,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";

export default function VoiceEditorModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ predefinedPersonaId?: number; personas: Archetype[] }>) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <Text>
        This is the raw prompt that will be used to generate LinkedIn messages
        for this voice. You can edit the prompt below then use the 'Simulation'
        section to test this voice on a prospect.
      </Text>

      <Divider mt="md" mb="md" />

      <Textarea
        minRows={10}
        label="Raw Voice Prompt"
        description="This is the raw prompt use by SellScale to generate messages in this voice"
        placeholder="Raw voice prompt..."
      />
      <Button color="green" mt="sm">
        Save
      </Button>

      <Card mt="md" p="md" withBorder>
        <Title order={4}>Simulate Voice</Title>
        <Text>
          Use the simulation section to test this voice on a prospect. You can
          select a persona then hit 'Generate' to see what the message would
          look like.
        </Text>
      </Card>
    </Paper>
  );
}
