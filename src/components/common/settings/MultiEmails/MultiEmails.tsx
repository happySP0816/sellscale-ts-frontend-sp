import {
  Paper,
  Title,
  Text,
  Stack,
  Badge,
  Tooltip,
  Flex,
  Group,
  useMantineTheme,
  Divider,
  Input,
  Box,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  Icon123,
  IconCircleCheck,
  IconCircleX,
  IconLetterT,
  IconPercentage,
  IconSearch,
  IconWorld,
} from "@tabler/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { sortBy } from "lodash";
import getEmailBanks from "@utils/requests/getEmailBanks";
import { IconGrid4x4 } from "@tabler/icons-react";
import moment from "moment";
import { EmailBankItem } from "src";

const MultiEmails = (props: { hideAnchor?: boolean }) => {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [allEmails, setAllEmails] = useState<EmailBankItem[]>([]);
  const [emails, setEmails] = useState<EmailBankItem[]>([]);
  const [currentEmailSla, setCurrentEmailSla] = useState<number>(0);

  const [userData, setUserData] = useRecoilState(userDataState);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "email_address",
    direction: "asc",
  });
  const sortEmails = (manualEmails?: EmailBankItem[]) => {
    if (!manualEmails) manualEmails = emails;
    const data = sortBy(manualEmails, sortStatus.columnAccessor);
    setEmails(sortStatus.direction === "desc" ? data.reverse() : data);
  };
  useEffect(() => {
    sortEmails();
  }, [sortStatus]);

  const triggerGetEmailBanks = async () => {
    const result = await getEmailBanks(userToken);
    if (result.status == "success") {
      const data = result.data.emails;

      if (props.hideAnchor) {
        const nonAnchorMail = data.filter(
          (email: any) => email.email_type !== "ANCHOR"
        );
        setEmails(nonAnchorMail);
        setAllEmails(nonAnchorMail);
        sortEmails(nonAnchorMail);
      } else {
        setEmails(data);
        setAllEmails(data);
        sortEmails(data);
      }
    }
  };
  useEffect(() => {
    triggerGetEmailBanks();

    // Get SLA
    if (userData.sla_schedules) {
      for (const schedule of userData.sla_schedules) {
        if (
          moment(schedule.start_date) < moment() &&
          moment() <= moment(schedule.start_date).add(7, "days")
        ) {
          setCurrentEmailSla(schedule.email_volume);
        }
      }
    }
  }, []);

  const [searchInput, setSearchInput] = useState("");

  return (
    <>
      <Paper withBorder p="md" radius="md" bg={"gray.0"}>
        <Title order={3}>{userData?.sdr_name}'s Email</Title>

        <Flex direction="row" mt={"xs"} w="100%">
          <Input
            icon={<IconSearch size={"0.9rem"} />}
            w={"80%"}
            maw={400}
            value={searchInput}
            onChange={(e) => {
              if (e.target.value === "" && searchInput === "") return;

              if (e.target.value == "") {
                setEmails(allEmails);
              } else {
                setEmails(
                  allEmails.filter((email) =>
                    email.email_address
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase())
                  )
                );
              }

              setSearchInput(e.target.value);
            }}
          />
          <Box
            ml="md"
            style={{
              border: "1px solid",
              borderColor: theme.colors.gray[5],
              borderRadius: "5px",
              display: "flex",
              justifyContent: "center",
            }}
            px={"sm"}
          >
            <Flex w="100%" justify={"center"} align={"center"}>
              <Text size="12px">
                Weekly Send Limit: <b>{currentEmailSla}</b>
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Stack mt={"xs"}>
          <Box maw={"calc(100vw - 32rem)"} w={"100%"}>
            <DataTable
              withColumnBorders
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
              mt={"md"}
              records={emails || []}
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
                      <IconWorld color={theme.colors.gray[6]} size={"0.8rem"} />
                      <Text color={theme.colors.gray[6]}>Email</Text>
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
                  accessor: "smartlead_reputation",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <IconPercentage
                        color={theme.colors.gray[6]}
                        size={"0.8rem"}
                      />
                      <Text color={theme.colors.gray[6]}>Reputation</Text>
                    </Flex>
                  ),
                  render: ({ email_type, smartlead_reputation }) => {
                    if (email_type === "ANCHOR") {
                      return <></>;
                    }
                    return (
                      <Flex w="100%" justify="center">
                        <Badge
                          color={smartlead_reputation == 100 ? "green" : "red"}
                        >
                          {smartlead_reputation}%
                        </Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessor: "daily_limit",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <Icon123 color={theme.colors.gray[6]} size={"0.8rem"} />
                      <Text color={theme.colors.gray[6]}>Daily Limit</Text>
                    </Flex>
                  ),
                  render: ({ daily_limit }) => {
                    return (
                      <Flex w="100%" justify="center">
                        <Text fz={"sm"} fw={600}>
                          {daily_limit}
                        </Text>
                      </Flex>
                    );
                  },
                },
                {
                  accessor: "domain_details",
                  sortable: true,
                  title: (
                    <Flex
                      color={theme.colors.gray[6]}
                      align={"center"}
                      gap={"xs"}
                    >
                      <IconGrid4x4
                        color={theme.colors.gray[6]}
                        size={"0.8rem"}
                      />
                      <Text color={theme.colors.gray[6]}>Infrastructure</Text>
                    </Flex>
                  ),
                  width: 620,
                  render: ({ domain_details, smartlead_warmup_enabled }) => {
                    if (!domain_details || !domain_details.id) {
                      return <></>;
                    }

                    return (
                      <Flex gap={"xs"}>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            DKIM:{" "}
                          </Text>
                          {domain_details &&
                          domain_details.dkim_record_valid ? (
                            <IconCircleCheck
                              fill={theme.colors.green[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          ) : (
                            <IconCircleX
                              fill={theme.colors.red[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          )}
                          <Divider orientation="vertical" />
                        </Group>

                        <Group>
                          <Text fz={"sm"} fw={700}>
                            SPF:{" "}
                          </Text>
                          {domain_details && domain_details.spf_record_valid ? (
                            <IconCircleCheck
                              fill={theme.colors.green[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          ) : (
                            <IconCircleX
                              fill={theme.colors.red[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          )}
                          <Divider orientation="vertical" />
                        </Group>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            DMARC:{" "}
                          </Text>
                          {domain_details &&
                          domain_details.dmarc_record_valid ? (
                            <IconCircleCheck
                              fill={theme.colors.green[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          ) : (
                            <IconCircleX
                              fill={theme.colors.red[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          )}
                          <Divider orientation="vertical" />
                        </Group>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            Forwarding:{" "}
                          </Text>
                          {domain_details &&
                          domain_details.forwarding_enabled ? (
                            <IconCircleCheck
                              fill={theme.colors.green[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          ) : (
                            <IconCircleX
                              fill={theme.colors.red[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          )}
                          <Divider orientation="vertical" />
                        </Group>
                        <Group>
                          <Text fz={"sm"} fw={700}>
                            Warmup:{" "}
                          </Text>
                          {smartlead_warmup_enabled ? (
                            <IconCircleCheck
                              fill={theme.colors.green[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          ) : (
                            <IconCircleX
                              fill={theme.colors.red[4]}
                              stroke={theme.white}
                              color={theme.white}
                            />
                          )}
                        </Group>
                      </Flex>
                    );
                  },
                },
              ]}
            />
          </Box>
        </Stack>
      </Paper>
    </>
  );
};

export default MultiEmails;
