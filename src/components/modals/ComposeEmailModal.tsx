import { userDataState, userTokenState } from "@atoms/userAtoms";
import FlexSeparate from "@common/library/FlexSeparate";
import RichTextArea from "@common/library/RichTextArea";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { openComposeEmailModal } from "@common/prospectDetails/ProspectDetailsViewEmails";
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  TextInput,
  Flex,
  Group,
  Center,
  Button,
  Textarea,
  LoadingOverlay,
} from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";
import { IconSend } from "@tabler/icons";
import { generateEmail } from "@utils/requests/generateEmail";
import { sendEmail } from "@utils/requests/sendEmail";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRecoilValue } from "recoil";

interface ComposeEmail extends Record<string, unknown> {
  email: string;
  subject: string;
  body: string;
  from: string;
  prospectId: number;
}

export default function ComposeEmailModal({
  context,
  id,
  innerProps,
}: ContextModalProps<ComposeEmail>) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const theme = useMantineTheme();

  const [subject, setSubject] = useState(innerProps.subject);
  const [body, setBody] = useState(innerProps.body);

  const [sending, setSending] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
        minHeight: 400,
      }}
    >
      <LoadingOverlay visible={generatingEmail} />
      <Group position="apart" px={10} pt={10}>
        <Text>To: {innerProps.email}</Text>
        <Text>From: {innerProps.from}</Text>
      </Group>
      <div style={{ paddingTop: 10 }}>
        <TextAreaWithAI
          placeholder="Subject"
          value={subject}
          onChange={(event) => setSubject(event.currentTarget.value)}
          inputType="text-input"
        />
        <TextAreaWithAI
          value={body}
          onChange={(e) => {
            setBody(e.currentTarget.value);
          }}
          inputType="rich-text-area"
        />
      </div>

      <Center mt={15}>
        <Button
          size="sm"
          radius="xl"
          variant="light"
          mr="lg"
          color="grape"
          onClick={async () => {
            setGeneratingEmail(true);
            const response = await generateEmail(
              userToken,
              innerProps.prospectId
            );
            if (response.status === "success") {
              setSubject(response.extra.subject);
              setBody(response.extra.body.replace(/\n/gm, "<br>"));
            }
            setGeneratingEmail(false);
          }}
        >
          Generate Email with AI
        </Button>
        <Button
          radius="xl"
          leftIcon={<IconSend size="0.9rem" />}
          loading={sending}
          onClick={async () => {
            setSending(true);
            const result = await sendEmail(
              userToken,
              innerProps.prospectId,
              subject,
              body
            );
            console.log(result);
            context.closeModal(id);
          }}
        >
          Send Email
        </Button>
      </Center>
    </Paper>
  );
}
