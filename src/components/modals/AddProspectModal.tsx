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
  Box,
  TextInput,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, CTA } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { generateInitialLiMessage } from "@utils/requests/generateInitialLiMessage";
import { updateProspect } from "@utils/requests/updateProspect";
import { addProspectReferral } from "@utils/requests/addProspectReferral";

export default function AddProspectModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ archetypeId: number, sourceProspectId?: number }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      li_url: '',
      email: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const prospectId = await (async () => {
      const createResponse = await createProspectFromLinkedinLink(userToken, innerProps.archetypeId, values.li_url);
      if (createResponse.status !== 'success') return -1;

      // Create referral
      if (innerProps.sourceProspectId){
        const referralResponse = await addProspectReferral(userToken, innerProps.sourceProspectId, createResponse.data.prospect_id);
      }

      //const prospectResponse = await getProspectByID(userToken, createResponse.data.prospect_id);

      // Add email to prospect
      const updateResponse = await updateProspect(userToken, createResponse.data.prospect_id, values.email);
      if (updateResponse.status !== 'success') return -1;

      return createResponse.data.prospect_id as number;
    })();

    setLoading(false);

    if (prospectId !== -1) {
      showNotification({
        id: "prospect-added",
        title: "Prospect successfully added",
        message:
          "Please allow some time for it to propagate through our systems.",
        color: "blue",
        autoClose: 3000,
      });
      context.closeModal(id);

      openContextModal({
        modal: 'sendOutreach',
        title: <Title order={3}>Send Outreach</Title>,
        innerProps: {
          prospectId: prospectId,
          archetypeId: innerProps.archetypeId,
          email: values.email,
        },
      });

      if (innerProps.sourceProspectId){
        queryClient.invalidateQueries({
          queryKey: [`query-prospect-details-${innerProps.sourceProspectId}`],
        });
      }

    } else {
      showNotification({
        id: "prospect-added-error",
        title: "Error while adding prospect",
        message: "Please contact an administrator. This prospect may have already been added by you or someone else in your organization.",
        color: "red",
        autoClose: false,
      });
      context.closeModal(id);
    }
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
          <TextInput
            placeholder="https://www.linkedin.com/in/..."
            label="LinkedIn URL"
            required
            {...form.getInputProps("li_url")}
          />
        </Flex>

        <Flex direction="column">
          <TextInput
            placeholder="Optional"
            label="Email"
            {...form.getInputProps("email")}
          />
        </Flex>

        {
          <Group pt='md'>
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
            >
              Add Prospect
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
