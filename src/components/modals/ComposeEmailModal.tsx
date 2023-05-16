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
  Collapse,
  Card,
} from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";
import { IconSend } from "@tabler/icons";
import {
  generateEmail,
  getEmailGenerationPrompt,
} from "@utils/requests/generateEmail";
import { sendEmail } from "@utils/requests/sendEmail";
import { useEffect, useState } from "react";
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

  const [aiGenerated, setAiGenerated] = useState(false);

  const [
    fetchedEmailGenerationPrompt,
    setFetchedEmailGenerationPrompt,
  ] = useState(false);
  const [
    fetchingEmailGenerationPrompt,
    setFetchingEmailGenerationPrompt,
  ] = useState(false);
  const [emailGenerationPrompt, setEmailGenerationPrompt] = useState("");
  const [collapseOpened, setCollapseOpened] = useState(false);

  const fetchEmailGenerationPrompt = async () => {
    setFetchingEmailGenerationPrompt(true);
    const response = await getEmailGenerationPrompt(
      userToken,
      innerProps.prospectId
    );
    setFetchingEmailGenerationPrompt(false);
    console.log(response);
    if (response.status === "success") {
      setEmailGenerationPrompt(response.data.prompt);
    }
  };

  // If body was cleared, it's no longer ai generated
  useEffect(() => {
    if(body.trim().length == 0) {
      setAiGenerated(false);
    }
  }, [body]);

  useEffect(() => {
    if (!fetchedEmailGenerationPrompt) {
      fetchEmailGenerationPrompt();
      setFetchedEmailGenerationPrompt(true);
    }
  }, [fetchedEmailGenerationPrompt]);

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
          disabled={!emailGenerationPrompt}
          onClick={async () => {
            setGeneratingEmail(true);
            generateEmail(userToken, emailGenerationPrompt)
              .then((response) => {
                if (response.status === "success") {
                  setSubject(response.data.subject);
                  setBody(response.data.body.replace(/\n/gm, "<br>"));
                  setAiGenerated(true);
                }
              })
              .catch((e) => {
                console.log(e);
              })
              .finally(() => {
                setGeneratingEmail(false);
              });
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
              body,
              aiGenerated
            );
            context.closeModal(id);
          }}
        >
          Send Email
        </Button>
      </Center>

      <Card mt="md">
        <Button
          size="xs"
          radius="xl"
          variant="outline"
          mr="lg"
          color="gray"
          onClick={() => setCollapseOpened(!collapseOpened)}
        >
          {!collapseOpened ? "View" : "Hide"} Email Generation Prompt
        </Button>
        <Button
          size="xs"
          radius="xl"
          variant="outline"
          mr="lg"
          color="gray"
          onClick={() => fetchEmailGenerationPrompt()}
        >
          Regenerate Email Generation Prompt
        </Button>
        <Collapse in={collapseOpened} mt="sm">
          <LoadingOverlay visible={fetchingEmailGenerationPrompt} />
          <Textarea
            mt="sm"
            label="Email Generation Prompt"
            description=" This is the prompt that is being used to generate the email. Feel free to edit it to your liking and then click the 'Generate Email with AI' button to generate a new email."
            value={emailGenerationPrompt}
            minRows={10}
            onChange={(e: any) => setEmailGenerationPrompt(e.target.value)}
          />
        </Collapse>
      </Card>
    </Paper>
  );
}
