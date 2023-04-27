import { userTokenState } from "@atoms/userAtoms";
import FlexSeparate from "@common/library/FlexSeparate";
import RichTextArea from "@common/library/RichTextArea";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
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
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconSend } from "@tabler/icons";
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
  const theme = useMantineTheme();

  const [subject, setSubject] = useState(innerProps.subject);
  const [body, setBody] = useState(innerProps.body);

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
        minHeight: 400,
      }}
    >
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
          radius="xl"
          leftIcon={<IconSend size='0.9rem' />}
          onClick={async () => {
            const result = await sendEmail(userToken, innerProps.prospectId, subject, body);
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
