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
  Stack,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Archetype, CTA, Channel } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { generateInitialLiMessage } from "@utils/requests/generateInitialLiMessage";
import { sendLiOutreachConnection } from "@utils/requests/sendLiOutreachConnection";
import { IconBrandLinkedin, IconMail } from "@tabler/icons";
import { openComposeEmailModal } from "@common/prospectDetails/ProspectDetailsViewEmails";

export default function SendOutreachModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ prospectId: number, archetypeId: number, email?: string }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  const [outreachType, setOutreachType] = useState<Channel | null>(!innerProps.email ? 'LINKEDIN' : null);

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const form = useForm({
    initialValues: {
      message: "",
    },
  });

  useEffect(() => {
    (async () => {
      // Generate initial message
      const messageResponse = await generateInitialLiMessage(
        userToken,
        innerProps.prospectId
      );
      form.setFieldValue("message", messageResponse.data.message);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await sendLiOutreachConnection(
      userToken,
      innerProps.prospectId,
      values.message
    );

    setLoading(false);

    if (response.status === "success") {
      showNotification({
        id: "sent-message",
        title: "Sent outreach",
        message: "Your outreach request has been sent.",
        color: "blue",
        autoClose: 3000,
      });
      window.location.href = "/all/linkedin-messages";
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
      {outreachType ? (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={loading} />

          <Flex direction="column">
            <Textarea
              placeholder="A friendly message..."
              label="Message"
              withAsterisk
              autosize
              {...form.getInputProps("message")}
              error={
                form.getInputProps("message").value?.length > 300
                  ? `Message must be less than 300 characters (${form.getInputProps("message").value?.length})`
                  : ""
              }
            />
          </Flex>

          {
            <Group pt="md">
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
                disabled={form.getInputProps("message").value?.length > 300}
              >
                Send {outreachType === "EMAIL" ? "Email" : "Connection Request"}
              </Button>
            </Group>
          }
        </form>
      ) : (
        <Stack>
          <Text ta="center">Which channel do you want to send outreach on?</Text>
        <Group position="center">
          <Button leftIcon={<IconBrandLinkedin size={'0.9rem'} />} onClick={() => setOutreachType('LINKEDIN')}>
            LinkedIn
          </Button>
          <Button leftIcon={<IconMail size={'0.9rem'} />} color='yellow' onClick={() => {
            // TEMP: Just use the email sending modal for now
            openComposeEmailModal(
              userToken,
              innerProps.prospectId,
              innerProps.archetypeId,
              'SENT_OUTREACH',
              'SENT_OUTREACH',
              innerProps.email || '',
              userData.sdr_email,
              "",
              "",
              ""
            );
          }}>
            Email
          </Button>
        </Group>
        </Stack>
      )}
    </Paper>
  );
}
