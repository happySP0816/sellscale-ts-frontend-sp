import { userDataState, userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import {
  Button,
  Text,
  Paper,
  useMantineTheme,
  Box,
  Stack,
  Center,
  Group,
  TextInput,
  Select,
  SelectProps,
  LoadingOverlay,
  Textarea,
  Flex,
  Title,
  MultiSelect,
  Checkbox,
} from "@mantine/core";
import { closeAllModals, ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAlignJustified, IconAlignLeft, IconAlignRight } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { JSONContent } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { ProspectShallow } from "src";

export default function SingleEmailCampaignModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  fetchAllCampaigns: () => void;
}>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [fromEmail, setFromEmail] = useState("SellScale CSM <csm@sellscale.com>");
  const [toEmail, setToEmail] = useState("Rajnikant Mohan from X Telecom <rmohan@xtel.com>");
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [ccEmailList, setCcEmailList] = useState<string[]>([]);
  const messageDraftRichRaw = useRef<JSONContent | string>("");
  const messageDraftEmail = useRef("");
  const [bccEmailList, setBccEmailList] = useState<string[]>([]);

  const [emailDomains, setEmailDomains] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [body, setBody] = useState(``);

  const [emailRecipients, setEmailRecipients] = useState<ProspectShallow[] | null>(null);
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);

  const onSendEmail = async () => {

    setCreatingCampaign(true);

    showNotification({
      title: "Starting email Campaign...",
      message: "Email Campaign has started",
      color: "teal",
    });

    fetch(`${API_URL}/prospect/email-campaign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        from_email: emailDomains[0],
        to_email: toEmail.split(',').map(email => email.trim()).map(Number),
        cc_email: ccEmail,
        bcc_email: bccEmail,
        cc_email_list: ccEmailList,
        bcc_email_list: bccEmailList,
        subject: subject,
        body: messageDraftEmail.current,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.found_emails){
          showNotification({
            title: "Creating Email Campaign...",
            message: "Email Campaign has started and the email was found for the prospect.",
            color: "teal",
          });


        }

        setCreatingCampaign(false); 


        innerProps.fetchAllCampaigns();
      });


  };
  const getAvailableEmailRecipients = () => {
    fetch(`${API_URL}/prospect/email-recipients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmailRecipients(data.data);
        setAvailableEmails(data.available_emails);
      });
  };

  useEffect(() => {
    getAvailableEmailRecipients();
  }, []);
  return (
    <Paper p="lg" shadow="sm" radius="md" style={{ position: "relative", backgroundColor: theme.colors.gray[0] }}>
      <Stack spacing="md">
      <MultiSelect
          label={
            <span style={{ color: emailDomains.length > 0 ? theme.colors.dark[9] : theme.colors.red[6] }}>
              Email to Send From: *
            </span>
          }
          value={emailDomains}
          onChange={(values) => setEmailDomains(values.slice(-1))}
          data={availableEmails?.map((email, index) => ({
            value: email,
            label: email,
            key: index,
          })) || []}
          creatable
          searchable
          getCreateLabel={(query) => `+ Add ${query}`}
          clearable
          radius="md"
          size="md"
          mb="sm"
        />
        <MultiSelect
          label="To:"
          value={toEmail ? toEmail.split(", ") : []}
          onChange={(values) => {
            setToEmail(values.join(", "));
          }}
          data={emailRecipients?.map((recipient, index) => ({
            value: recipient.id.toString(),
            label: `${recipient.full_name} - ${recipient.title} at ${recipient.company}`,
            key: index, // Ensure unique key for each recipient
          })) || []}
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          style={{ flexGrow: 1 }}
          clearable
          radius="md"
          size="md"
        />
        <Group position="apart" mt="sm">
          <Checkbox
            label="CC"
            checked={ccEmail !== ""}
            onChange={(e) => setCcEmail(e.currentTarget.checked ? "cc@example.com" : "")}
            size="md"
          />
          <Checkbox
            label="BCC"
            checked={bccEmail !== ""}
            onChange={(e) => setBccEmail(e.currentTarget.checked ? "bcc@example.com" : "")}
            size="md"
          />
        </Group>
        {ccEmail && (
          <MultiSelect
            label="CC Email List"
            value={ccEmailList}
            onChange={(values) => setCcEmailList(values)}
            data={ccEmailList.map((email, index) => ({
              value: email,
              label: email,
              key: index,
            }))}
            creatable
            searchable
            getCreateLabel={(query) => `+ Add ${query}`}
            clearable
            radius="md"
            size="md"
            mb="sm"
          />
        )}
        {bccEmail && (
          <MultiSelect
            label="BCC Email List"
            value={bccEmailList}
            onChange={(values) => setBccEmailList(values)}
            data={bccEmailList.map((email, index) => ({
              value: email,
              label: email,
              key: index,
            }))}
            creatable
            searchable
            getCreateLabel={(query) => `+ Add ${query}`}
            clearable
            radius="md"
            size="md"
            mb="sm"
          />
        )}
        <TextInput
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.currentTarget.value)}
          mb="sm"
          radius="md"
          size="md"
        />
        <RichTextArea
          onChange={(value, rawValue) => {
            messageDraftRichRaw.current = rawValue;
            messageDraftEmail.current = value;
          }}
          value={messageDraftRichRaw.current}
          height={200}
        />
        <Group position="right" mt="md">
          <Button 
            onClick={() => closeAllModals()}
            variant="outline"
            color="gray"
            radius="md"
            size="md"
          >
            Cancel
          </Button>
          <Button 
            loading={creatingCampaign}
            onClick={onSendEmail}
            radius="md"
            size="md"
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
