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
  Avatar,
  Group,
  CheckIcon,
  useMantineColorScheme,
  useMantineTheme,
  Divider,
  Input,
  Box,
} from "@mantine/core";
import { FC, useEffect, useMemo, useState } from "react";
import { NylasData } from "./MutlEmails.types";
import {
  IconCircleCheck,
  IconLetterT,
  IconLink,
  IconPlus,
  IconSearch,
  IconSend,
} from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { getSmartleadWarmup } from "@utils/requests/getSmartleadWarmup";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import ICPFitPill from "@common/pipeline/ICPFitAndReason";
import { nameToInitials, proxyURL, valueToColor } from "@utils/general";
import { sortBy } from "lodash";

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
    if (result.status == "success") {
      const data = result.data;
      const inboxes = data.inboxes;
      setSmarleadWarmup(inboxes);
    }
  };
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "email_address",
    direction: "asc",
  });
  useEffect(() => {
    const data = sortBy(emails, sortStatus.columnAccessor);
    setEmails(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [sortStatus]);

  useEffect(() => {
    if (userData.emails) {
      setEmails(userData.emails);
    }
    triggerGetSmartleadWarmup();
  }, []);
  const theme = useMantineTheme();

  const [searchInput, setSearchInput] = useState("");

  const filteredEmails = useMemo(
    () =>
      emails.filter((e) => {
        if (!searchInput) {
          return true;
        }

        return e.email_address.toLowerCase().includes(searchInput);
      }),
    [emails, searchInput]
  );

  return (
    <>
      <Paper withBorder m="xs" p="md" radius="md" bg={"gray.0"}>
        <Title order={3}>{userData?.sdr_name}'s Email</Title>

        <Input
          mt={"xs"}
          icon={<IconSearch />}
          w={200}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Stack mt={"xs"}>
          <Box maw={'calc(100vw - 42rem)'} w={'100%'}>
            <DataTable
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              mt={"md"}
              records={filteredEmails || []}
              columns={[
                {
                  accessor: "email_address",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <IconLink color={theme.colors.gray[6]} size={"0.8rem"} />
                      <Text color={theme.colors.gray[6]}>Domain</Text>
                    </Flex>
                  ),
                  render: ({ email_address }) => {
                    return (
                      <Text fz={"sm"} fw={600}>
                        {email_address}
                      </Text>
                    );
                  },
                },
                {
                  accessor: "email_type",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <IconLetterT
                        color={theme.colors.gray[6]}
                        size={"0.8rem"}
                      />
                      <Text color={theme.colors.gray[6]}>Type</Text>
                    </Flex>
                  ),

                  render: ({ email_type }) => {
                    let toolTipLabel = "";
                    let badgeColor = "green";
                    if (email_type === "ANCHOR") {
                      toolTipLabel =
                        "Your anchor email is the primary email attached to your SellScale account.";
                    } else if (email_type === "SELLSCALE") {
                      toolTipLabel =
                        "SellScale emails are emails managed by SellScale. We use these emails to send emails on your behalf.";
                      badgeColor = "grape";
                    } else if (email_type === "ALIAS") {
                      toolTipLabel =
                        "Your alias emails are other emails you may use.";
                      badgeColor = "blue";
                    }

                    return (
                      <Tooltip withArrow withinPortal label={toolTipLabel}>
                        <Badge color={badgeColor} size="lg">
                          {email_type}
                        </Badge>
                      </Tooltip>
                    );
                  },
                },

                {
                  accessor: "reputation",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <IconLetterT
                        color={theme.colors.gray[6]}
                        size={"0.8rem"}
                      />
                      <Text color={theme.colors.gray[6]}>Reputation</Text>
                    </Flex>
                  ),
                  render: () => {
                    return <Badge color="green">86%</Badge>;
                  },
                },

                {
                  accessor: "infrastructure",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <IconLetterT
                        color={theme.colors.gray[6]}
                        size={"0.8rem"}
                      />
                      <Text color={theme.colors.gray[6]}>Infrastructure</Text>
                    </Flex>
                  ),
                  width: 500,
                  render: () => {
                    return (
                      <Flex gap={"xs"}>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            DKIM:{" "}
                          </Text>
                          <IconCircleCheck
                            fill={theme.colors.green[4]}
                            stroke={theme.white}
                            color={theme.white}
                          />
                          <Divider orientation="vertical" />
                        </Group>

                        <Group>
                          <Text fz={"sm"} fw={700}>
                            SPF:{" "}
                          </Text>
                          <IconCircleCheck
                            fill={theme.colors.green[4]}
                            stroke={theme.white}
                            color={theme.white}
                          />
                          <Divider orientation="vertical" />
                        </Group>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            DMARC:{" "}
                          </Text>
                          <IconCircleCheck
                            fill={theme.colors.green[4]}
                            stroke={theme.white}
                            color={theme.white}
                          />
                          <Divider orientation="vertical" />
                        </Group>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            Forwarding:{" "}
                          </Text>
                          <IconCircleCheck
                            fill={theme.colors.green[4]}
                            stroke={theme.white}
                            color={theme.white}
                          />
                        </Group>
                      </Flex>
                    );
                  },
                },
              ]}
            />
          </Box>

          {smartleadWarmup && smartleadWarmup.length > 0 && (
            <DataTable
              records={smartleadWarmup}
              columns={[
                {
                  accessor: "from_email",
                  title: "Inbox",
                  // @ts-ignore
                  render: ({ from_email }) => {
                    return (
                      <Flex direction="row" align="center">
                        <IconSend size={14} />
                        <Text ml={4}>{from_email}</Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessor: "limit",
                  title: "Daily Limit",
                  // @ts-ignore
                  render: ({ daily_sent_count, message_per_day }) => {
                    return (
                      <Text>
                        {daily_sent_count} / {message_per_day}
                      </Text>
                    );
                  },
                },
                {
                  accessor: "email_warmup_details",
                  title: "Warmup Enabled",
                  // @ts-ignore
                  render: ({ email_warmup_details }) => {
                    const status = email_warmup_details.status;
                    return (
                      <Badge color={status === "ACTIVE" ? "green" : "red"}>
                        {status}
                      </Badge>
                    );
                  },
                },
                {
                  accessor: "email_warmup_details",
                  title: "Reputation",
                  // @ts-ignore
                  render: ({ email_warmup_details }) => {
                    const reputation = email_warmup_details.warmup_reputation;

                    return (
                      <Badge
                        color={
                          reputation > 80
                            ? "green"
                            : reputation > 60
                            ? "yellow"
                            : "red"
                        }
                      >
                        {reputation || "N/A"}%
                      </Badge>
                    );
                  },
                },
              ]}
            />
          )}
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
