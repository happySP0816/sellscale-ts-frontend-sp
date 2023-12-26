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
  Switch,
  Select,
  TextInput,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { CTA, Prospect } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { DateInput } from "@mantine/dates";
import { API_URL } from "@constants/data";
import RichTextArea from "@common/library/RichTextArea";
import { JSONContent } from "@tiptap/react";
import { IconSend, IconWand } from "@tabler/icons";
import { sendEmail } from "@utils/requests/sendEmail";

export default function MultiChannelModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ prospect: Prospect }>) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [subjectLine, setSubjectLine] = useState("");
  // We use this to store the value of the text area
  const [messageDraft, _setMessageDraft] = useState("");
  // We use this to store the raw value of the rich text editor
  const messageDraftRichRaw = useRef<JSONContent | string>();
  // We use this to set the value of the text area (for both rich text and normal text)
  const setMessageDraft = (value: string) => {
    messageDraftRichRaw.current = value;
    _setMessageDraft(value);
  };
  // For email we have to use this ref instead, otherwise the textbox does a weird refocusing.
  const [messageDraftEmail, setMessageDraftEmail] = useState("");

  const [aiGenerated, setAiGenerated] = useState(false);

  const triggerSendEmail = async () => {
    if (loading) return;
    if (subjectLine.length === 0 || messageDraftEmail.length === 0 || messageDraftEmail === "<p></p>") return;
    if (userData.nylas_connected === false) {
      showNotification({
        title: "Error Sending Email",
        message: "You must connect your email account before sending emails. Please do so in Settings.",
        color: "red",
      });
      return;
    }

    setLoading(true);

    const response = await sendEmail(
      userToken,
      innerProps.prospect.id,
      subjectLine,
      messageDraftEmail,
      aiGenerated,
      undefined,
      true
    );
    if (response.status === 'success') {
      showNotification({
        title: "Email Sent",
        message: "Your email has been sent to the prospect.",
        color: "teal",
      });
      setLoading(false);
      context.closeModal(id);
    } else {
      showNotification({
        title: "Error Sending Email",
        message: response.message,
        color: "red",
      });
    }

    setLoading(false)
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <LoadingOverlay visible={loading} />

      <Flex direction="column">
        <Text fz="sm">
          Prospect asked you to reach out to them on email? Verify the email
          address and send them an email of your crafting!
        </Text>
        <TextInput
          mt="md"
          label="Email Address"
          value={innerProps.prospect.email}
          w="50%"
          miw="300px"
        />
        <Text fz="xs" color="grey" mt="2px">
          Email does not look correct? 'Edit Contact Details' first.
        </Text>
        <TextInput
          mt="lg"
          label="Subject"
          placeholder="Following up on our LinkedIn conversation"
          value={subjectLine}
          onChange={(event) => setSubjectLine(event.currentTarget.value)}
        />
        <Text mt="lg">Message</Text>
        <RichTextArea
          onChange={(value, rawValue) => {
            messageDraftRichRaw.current = rawValue;
            setMessageDraftEmail(value);
          }}
          value={messageDraftRichRaw.current}
          height={200}
        />{" "}
        <Flex direction="row" mt="md" justify={"space-between"}>
          <Button
            leftIcon={<IconWand size="0.8rem" />}
            color="grape"
            size="xs"
            sx={{ borderRadius: "4px" }}
            disabled
          >
            Smart Generate - Coming Soon!
          </Button>
          <Button
            leftIcon={<IconSend size="0.8rem" />}
            size="xs"
            disabled={
              subjectLine.length === 0 ||
              messageDraftEmail.length === 0 ||
              messageDraftEmail === "<p></p>"
            }
            onClick={() => {
              // console.log('triggering send email', subjectLine, messageDraftEmail)
              triggerSendEmail();
            }}
          >
            Send Email
          </Button>
        </Flex>
      </Flex>
    </Paper>
  );
}
