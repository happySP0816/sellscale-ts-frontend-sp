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
import { Archetype, CTA } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA, { updateCTA } from "@utils/requests/createCTA";

export default function EditCTAModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personaId: string; cta: CTA }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      cta: innerProps.cta.text_value,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const result = await updateCTA(userToken, innerProps.cta.id, values.cta);

    setLoading(false);

    if (result.status === "success") {
      showNotification({
        id: "cta-updated",
        title: "CTA successfully updated",
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
        id: "cta-updated-error",
        title: "Error while updating CTA",
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
              Update CTA
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
