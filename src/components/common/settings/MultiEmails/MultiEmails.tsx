import {
  Paper,
  Title,
  Text,
  Stack,
  Badge,
  Card,
  Button,
  Modal,
  TextInput,
  Select,
  Tooltip,
  Flex,
} from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { NylasData } from "./MutlEmails.types";
import { IconPlus, IconSend } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { getSmartleadWarmup } from "@utils/requests/getSmartleadWarmup";
import { DataTable } from "mantine-datatable";


interface EmailBankItem {
  active: boolean;
  email_address: string;
  email_type: "ANCHOR" | "SELLSCALE" | "ALIAS";
  id: number;
  nylas_account_id: string;
  nylas_active: boolean;
  nylas_auth_code: string;
}


const MultiEmails = () => {
  const userToken = useRecoilValue(userTokenState);
  const [opened, { open, toggle, close }] = useDisclosure(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<EmailBankItem[]>([]);

  const [userData, setUserData] = useRecoilState(userDataState);
  const [smartleadWarmup, setSmarleadWarmup] = useState<any>(null);

  const [selectItem, setSelectItem] = useState<null | string>(null);
  // const onOpenModal = () => {
  //   setEmailInput("");
  //   open();
  // };
  // const onAddEmail = () => {
  //   setEmailInput("");
  //   setSelectItem(null);
  //   setEmails((oldEmails) => [
  //     ...oldEmails,
  //     {
  //       email: emailInput,
  //       type: selectItem || "Anchor Email",
  //     },
  //   ]);

  //   close();
  // };

  const triggerGetSmartleadWarmup = async () => {
    const result = await getSmartleadWarmup(userToken);
    if (result.status == 'success') {
      const data = result.data;
      const inboxes = data.inboxes;
      setSmarleadWarmup(inboxes);
    }
  }

  useEffect(() => {
    if (userData.emails) {
      setEmails(userData.emails)
    }
    triggerGetSmartleadWarmup()
  }, [])

  return (
    <>
      <Paper withBorder m="xs" p="md" radius="md">
        <Title order={3}>{userData?.sdr_name}'s Email</Title>

        <Text fz="sm" pt="xs">
          If a thread receives a reply from an email that is not listed below, that prospect will be marked as 'replied'.
        </Text>

        <Stack mt={"xs"}>
          {emails && emails.map((email, idx) => {
            let toolTipLabel = ""
            let badgeColor = "green"
            if (email.email_type === "ANCHOR") {
              toolTipLabel = "Your anchor email is the primary email attached to your SellScale account."
            } else if (email.email_type === "SELLSCALE") {
              toolTipLabel = "SellScale emails are emails managed by SellScale. We use these emails to send emails on your behalf."
              badgeColor = "grape"
            } else if (email.email_type === "ALIAS") {
              toolTipLabel = "Your alias emails are other emails you may use."
              badgeColor = "blue"
            }

            return (
              <Card
                withBorder
                key={idx}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Title order={4}>{email.email_address}</Title>
                <Tooltip
                  withArrow
                  withinPortal
                  label={toolTipLabel}
                >
                  <Badge
                    color={badgeColor}
                    size="lg"
                  >
                    {email.email_type}
                  </Badge>
                </Tooltip>
              </Card>
            )
          }
          )}

          <Button leftIcon={<IconPlus />} onClick={() => { }} disabled>
            Add more - Coming Soon
          </Button>

          {
            smartleadWarmup && smartleadWarmup.length > 0 && (
              <DataTable
                records={smartleadWarmup}
                columns={[
                  {
                    accessor: "from_email",
                    title: "Inbox",
                    // @ts-ignore
                    render: ({ from_email }) => {
                      return (
                        <Flex direction='row' align='center'>
                          <IconSend size={14} />
                          <Text ml={4}>{from_email}</Text>
                        </Flex>
                      )
                    }
                  },
                  {
                    accessor: "limit",
                    title: "Daily Limit",
                    // @ts-ignore
                    render: ({ daily_sent_count, message_per_day }) => {
                      return (
                        <Text>{daily_sent_count} / {message_per_day}</Text>
                      )
                    }
                  },
                  {
                    accessor: "email_warmup_details",
                    title: "Warmup Enabled",
                    // @ts-ignore
                    render: ({ email_warmup_details }) => {
                      const status = email_warmup_details.status;
                      return (
                        <Badge
                          color={status === "ACTIVE" ? "green" : "red"}
                        >
                          {status}
                        </Badge>
                      )
                    }
                  },
                  {
                    accessor: "email_warmup_details",
                    title: "Reputation",
                    // @ts-ignore
                    render: ({ email_warmup_details }) => {
                      const reputation = email_warmup_details.warmup_reputation;

                      return (
                        <Badge
                          color={reputation > 80 ? "green" : reputation > 60 ? "yellow" : "red"}
                        >
                          {reputation || 'N/A'}%
                        </Badge>
                      )
                    }
                  }
                ]}
              />
            )
          }
        </Stack>

      </Paper>

      {/* <Modal opened={opened} onClose={close} title="Add Email">
        <Stack>
          <TextInput
            type="email"
            label="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />

          <Select
            label="Type"
            value={selectItem}
            onChange={(value) => setSelectItem(value)}
            data={[
              { value: "Anchor Email", label: "Anchor Email" },
              { value: "SellScale Email", label: "SellScale Email" },
            ]}
          />
          <Button onClick={() => onAddEmail()}>Save</Button>
        </Stack>
      </Modal> */}
    </>
  );
};

export default MultiEmails;
