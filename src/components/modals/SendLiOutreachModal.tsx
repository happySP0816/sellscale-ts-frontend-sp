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
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, CTA } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { generateInitialLiMessage } from "@utils/requests/generateInitialLiMessage";
import { sendLiOutreachConnection } from "@utils/requests/sendLiOutreachConnection";

export default function SendLiOutreachModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ prospectId: number }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  useEffect(() => {
    (async () => {
      // Generate initial message
      const messageResponse = await generateInitialLiMessage(userToken, innerProps.prospectId);
      form.setFieldValue('message', messageResponse.data.message);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await sendLiOutreachConnection(userToken, innerProps.prospectId, values.message);

    setLoading(false);

    if (response.status === "success") {
      showNotification({
        id: "sent-message",
        title: "Sent outreach",
        message:
          "Your outreach request has been sent.",
        color: "blue",
        autoClose: 3000,
      });
    } else {
      showNotification({
        id: "sent-message-error",
        title: "Error while sending the outreach request",
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
            placeholder="A friendly message..."
            label="Message"
            withAsterisk
            autosize
            {...form.getInputProps("message")}
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
              Send Request
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
