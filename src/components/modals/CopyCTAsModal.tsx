import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Title,
  Flex,
  Textarea,
  LoadingOverlay,
  Card,
  Select,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import { IconUser } from "@tabler/icons";

export default function CopyCTAsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personaId: string; personas: Archetype[] }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      persona: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const ctas = innerProps.personas.find(
      (persona: Archetype) => persona.id === +values.persona
    )?.ctas ?? [];

    let failed = false;
    for(const cta of ctas) {
      const result = await createCTA(userToken, innerProps.personaId, cta.text_value);
      if (result.status === 'error'){
        failed = true;
      }
    }

    setLoading(false);

    if (!failed) {
      showNotification({
        id: "new-ctas-created",
        title: "CTAs successfully created",
        message:
          "Please allow some time for it to propagate through our systems.",
        color: "blue",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: [`query-cta-data-${innerProps.personaId}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`query-linkedin-personas-data`],
      });
    } else {
      showNotification({
        id: "new-ctas-created-error",
        title: "Error while creating a new CTAs",
        message: "Please contact an administrator.",
        color: "red",
        autoClose: false,
      });
    }

    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />
        <Text size="sm" mt="md">
          Copies all the CTAs from the selected persona to the current persona.
        </Text>

        <Select
            py="xs"
            withinPortal
            placeholder="Select a persona"
            color="teal"
            // @ts-ignore
            data={
              innerProps.personas
                ? innerProps.personas
                    .filter(
                      (persona: Archetype) =>
                        !persona?.archetype?.includes("Unassigned")
                    )
                    .filter(
                      (persona: Archetype) =>
                        persona.ctas.length > 0
                    )
                    .map((persona: Archetype) => ({
                      value: persona.id + "",
                      label:
                        `(${persona.ctas.length} CTAs) ` + (persona.active ? "🟢 " : "🔴 ") + persona.archetype,
                    }))
                : []
            }
            icon={<IconUser size="1rem" />}
            {...form.getInputProps("persona")}
          />

        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        {
          <Group>
            <Button
              variant="light"
              radius="md"
              type="submit"
              ml="auto"
              mr="auto"
              size="md"
              disabled={!form.getInputProps("persona").value}
            >
              Copy CTAs
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
