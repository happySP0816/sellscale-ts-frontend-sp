import { userDataState, userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import { debounce } from "lodash";
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
  Loader,
  Divider,
  Avatar,
} from "@mantine/core";
import { closeAllModals, ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAlignJustified, IconAlignLeft, IconAlignRight, IconCheck } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { JSONContent } from "@tiptap/react";
import { set } from "lodash";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useRecoilValue } from "recoil";
import { ProspectShallow } from "src";
import { isLinkedInURL } from "@utils/general";
// interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
//   value: string;
//   label: string;
// }

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

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
  const [toEmail, setToEmail] = useState<string[]>([]);
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
  const [options, setOptions] = useState<SelectProps["data"]>([]);

  const [prospectOptions, setProspectOptions] = useState<SelectProps["data"]>([]);

  const isValidLinkedInUrl = (url: string) => {
    const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/;
    return linkedInRegex.test(url);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // const searchExistingProspects = debounce(async (query) => {
  //   if (query.trim().length === 0) return;

  //   try {
  //     const response = await fetch(`${API_URL}/prospect/search_existing_prospects`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //       body: JSON.stringify({ query }),
  //     });

  //     const data = await response.json();

  //     setProspectOptions(
  //       data.data.map((prospect: any) => ({
  //         value: prospect.value,
  //         label: prospect.label,
  //       }))
  //     );

  //     console.log('options are ', data.data.map((prospect: any) => ({
  //       value: prospect.value,
  //       label: prospect.label,
  //     })));
  //     console.log('to email is ', toEmail);

  //     // Handle the data as needed
  //     console.log(data);
  //   } catch (error) {
  //     console.error("Error fetching existing prospects:", error);
  //   }
  // }, 300);

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
        to_email: toEmail.map((email) => email.trim()).map(Number),
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
        if (data.found_emails) {
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

  const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Checkbox label={label} checked={others.selected} />
    </div>
  ));

  const [change, setChange] = useState(false);
  const [linkedinRequire, setLinkedinRequire] = useState(false);
  const handleLinkedinRequired = () => {
    setLinkedinRequire(true);
    // linkedin URL Required
    setLinkedinRequire(false);
  };

  console.log("============", availableEmails);

  return (
    <Paper style={{ position: "relative" }}>
      <Divider />
      <Flex align={"center"} gap={"xs"} mt={"sm"}>
        <Text size={"sm"} color="gray" fw={500} w={50}>
          From:
        </Text>
        <MultiSelect
          itemComponent={SelectItem}
          value={emailDomains.length > 0 ? emailDomains : availableEmails?.[0] ? [availableEmails[0]] : []}
          data={
            (availableEmails &&
              availableEmails?.map((email, index) => ({
                value: email,
                label: email,
                key: index,
              }))) ||
            []
          }
          onChange={(values) => setEmailDomains(values.slice(-1))}
          w={"100%"}
          nothingFound="Nobody here"
          maxDropdownHeight={400}
          icon={
            availableEmails.length > 0 ? null : (
              <Flex align={"center"} gap={4}>
                <Avatar src={""} size={"xs"} radius={"xl"} />
                <Text fw={500} size={"sm"}>
                  SellScale CSM
                </Text>
                <Divider orientation="vertical" />
                <Text size={"xs"} fw={400} color="gray">
                  csm@sellscale.com
                </Text>
              </Flex>
            )
          }
          styles={{
            icon: {
              width: "260px",
              color: "black",
            },
          }}
          size="xs"
        />
      </Flex>
      <Flex align={"center"} gap={"xs"} mt={6}>
        <Text size={"sm"} color="gray" fw={500} miw={45}>
          To:
        </Text>
        <MultiSelect
          w={"100%"}
          creatable
          searchable
          data={options}
          value={toEmail}
          placeholder="Enter email address or Linkedin URL"
          size="xs"
          onChange={(values) => setToEmail(values)}
          onCreate={(query) => {
            const newEmail = query.trim();

            if (isLinkedInURL(newEmail)) {
              const getEmailFromLinkedinURL = async (url: string) => {
                if (!url) {
                  return;
                }

                showNotification({
                  title: "Getting Email...",
                  message: `Getting email for ${url}`,
                  color: "teal",
                });

                try {
                  const response = await fetch(`${API_URL}/prospect/email_from_linkedin_url`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      linkedin_url: url,
                    }),
                  });

                  const data = await response.json();

                  if (!data.email) {
                    showNotification({
                      title: "Email Not Found",
                      message: `Email not found for ${url}`,
                      color: "red",
                    });
                    setOptions([]);
                    setToEmail([]);
                    return;
                  }

                  const newEmail = data.email;
                  const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
                  setOptions([newOption]);
                  setToEmail([newOption.value]);
                } catch (error) {
                  showNotification({
                    title: "Error",
                    message: `An error occurred while fetching email for ${url}`,
                    color: "red",
                  });
                }
              };
              getEmailFromLinkedinURL(newEmail);
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else if (isValidEmail(newEmail)) {
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else {
              showNotification({
                title: "Invalid Email",
                message: `Please enter a valid email address`,
                color: "red",
              });
              return null;
            }
          }}
          getCreateLabel={(query) => `+ Add ${query}`}
          shouldCreate={(query, data) => query.trim().length > 0 && !data.some((item) => item.value === query.trim())}
          clearable
          rightSection={isValidLinkedInUrl(toEmail[toEmail.length - 1]) && <Loader size="xs" />}
        />
        {toEmail.length > 0 && (
          <Flex align={"center"} gap={"xs"}>
            <Button variant="default" size="xs" onClick={() => setCcEmail("cc@example.com")}>
              +CC
            </Button>
            <Button variant="default" size="xs" onClick={() => setBccEmail("bcc@example.com")}>
              +BCC
            </Button>
          </Flex>
        )}
      </Flex>
      {ccEmail && (
        <MultiSelect
          label={
            <Text color="gray" fw={500} size={"xs"}>
              CC Email List
            </Text>
          }
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
          mt={"md"}
          size="xs"
        />
      )}
      {bccEmail && (
        <MultiSelect
          label={
            <Text color="gray" fw={500} size={"xs"}>
              BCC Email List
            </Text>
          }
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
          size="xs"
          mb="sm"
        />
      )}
      <TextInput
        value={subject}
        onChange={(e) => setSubject(e.currentTarget.value)}
        mt={"xs"}
        label={
          <Text color="gray" fw={500} size={"xs"}>
            SUBJECT:
          </Text>
        }
      />
      <Box mt={"md"}>
        <Text color="gray" fw={500} size={"sm"}>
          BODY:
        </Text>
        <RichTextArea
          onChange={(value, rawValue) => {
            messageDraftRichRaw.current = rawValue;
            messageDraftEmail.current = value;
          }}
          value={messageDraftRichRaw.current}
          height={200}
        />
      </Box>
      {/* <Stack spacing="md">
        <MultiSelect
          label={<span style={{ color: emailDomains.length > 0 ? theme.colors.dark[9] : theme.colors.red[6] }}>Email to Send From: *</span>}
          value={emailDomains.length > 0 ? emailDomains : availableEmails?.[0] ? [availableEmails[0]] : []}
          onChange={(values) => setEmailDomains(values.slice(-1))}
          data={
            availableEmails?.map((email, index) => ({
              value: email,
              label: email,
              key: index,
            })) || []
          }
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
          creatable
          searchable
          data={options}
          value={toEmail}
          placeholder="Linkedin URL or email address"
          size="md"
          onChange={(values) => setToEmail(values)}
          onCreate={(query) => {
            const newEmail = query.trim();

            if (isLinkedInURL(newEmail)) {
              const getEmailFromLinkedinURL = async (url: string) => {
                if (!url) {
                  return;
                }

                showNotification({
                  title: "Getting Email...",
                  message: `Getting email for ${url}`,
                  color: "teal",
                });

                try {
                  const response = await fetch(`${API_URL}/prospect/email_from_linkedin_url`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      linkedin_url: url,
                    }),
                  });

                  const data = await response.json();

                  if (!data.email) {
                    showNotification({
                      title: "Email Not Found",
                      message: `Email not found for ${url}`,
                      color: "red",
                    });
                    setOptions([]);
                    setToEmail([]);
                    return;
                  }

                  const newEmail = data.email;
                  const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
                  setOptions([newOption]);
                  setToEmail([newOption.value]);
                } catch (error) {
                  showNotification({
                    title: "Error",
                    message: `An error occurred while fetching email for ${url}`,
                    color: "red",
                  });
                }
              };
              getEmailFromLinkedinURL(newEmail);
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else if (isValidEmail(newEmail)) {
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else {
              showNotification({
                title: "Invalid Email",
                message: `Please enter a valid email address`,
                color: "red",
              });
              return null;
            }
          }}
          getCreateLabel={(query) => `+ Add ${query}`}
          shouldCreate={(query, data) => query.trim().length > 0 && !data.some((item) => item.value === query.trim())}
          clearable
          rightSection={isValidLinkedInUrl(toEmail[toEmail.length - 1]) && <Loader size="xs" />}
        />
        {toEmail.length > 0 && (
          <Group position="apart" mt="sm">
            <Checkbox label="CC" checked={ccEmail !== ""} onChange={(e) => setCcEmail(e.currentTarget.checked ? "cc@example.com" : "")} size="md" />
            <Checkbox label="BCC" checked={bccEmail !== ""} onChange={(e) => setBccEmail(e.currentTarget.checked ? "bcc@example.com" : "")} size="md" />
          </Group>
        )}
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
        <TextInput label="Subject" value={subject} onChange={(e) => setSubject(e.currentTarget.value)} mb="sm" radius="md" size="md" />
      </Stack> */}
      <Group position="right" mt="md">
        <Button onClick={() => closeAllModals()} variant="outline" color="gray" radius="md" size="md">
          Cancel
        </Button>
        <Button loading={creatingCampaign} onClick={onSendEmail} radius="md" size="md">
          Send
        </Button>
      </Group>
    </Paper>
  );
}
