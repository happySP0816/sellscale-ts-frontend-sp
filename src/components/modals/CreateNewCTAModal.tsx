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
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";

export default function CreateNewCTAModel({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personaId: string; personas?: PersonaOverview[] }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      cta: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const result = await createCTA(userToken, innerProps.personaId, values.cta);

    setLoading(false);

    if (result.status === "success") {
      showNotification({
        id: "new-cta-created",
        title: "CTA successfully created",
        message:
          "Please allow some time for it to propagate through our systems.",
        color: "blue",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: [`query-cta-data-${innerProps.personaId}`],
      });
    } else {
      showNotification({
        id: "new-cta-created-error",
        title: "Error while creating a new CTA",
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
          Call-to-Actions for LinkedIn are included at the end of a SellScale
          personalization and are the best way to start a conversation. You can
          manually add a CTA, or use our AI-powered CTA generator to brainstorm.
        </Text>

        <Card mt="md">
          <Text weight={"bold"}>AI-Powered CTA Generator</Text>
          <Text size="sm">
            Press the button below to generate 6 CTAs based on your persona in
            seconds.
          </Text>
          <Button
            variant="outline"
            radius="md"
            size="xs"
            mt="md"
            onClick={() => {
              openContextModal({
                modal: "ctaGenerator",
                title: <Title order={3}>CTA Generator</Title>,
                innerProps: {
                  personaId: innerProps.personaId,
                  personaName: "",
                  personas: innerProps.personas,
                },
              });
            }}
          >
            Brainstorm CTAs with AI
          </Button>
        </Card>
        <Flex direction="column">
          <Textarea
            mt="md"
            required
            placeholder={`I'd love to connect and learn more about you...`}
            label="Call-to-Action"
            withAsterisk
            autosize
            {...form.getInputProps("cta")}
          />
          <Text
            size="xs"
            color={
              form.getInputProps("cta").value.length <= 120 ? "grey" : "red"
            }
          >
            {form.getInputProps("cta").value.length}/{120}
          </Text>
        </Flex>

        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        {
          <Group>
            <Anchor component="button" type="button" color="dimmed" size="sm">
              {/* Need help? */}
            </Anchor>
            <Button
              variant="light"
              radius="md"
              type="submit"
              ml="auto"
              mr="auto"
              size="md"
              disabled={form.getInputProps("cta").value.length > 120}
            >
              Create new CTA
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
