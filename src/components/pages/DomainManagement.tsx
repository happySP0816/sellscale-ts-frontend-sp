import { userTokenState } from "@atoms/userAtoms";
import { InboxRequestModal } from "@common/settings/InboxesManagementPage";
import {
  Badge,
  Button,
  Divider,
  Title,
  Flex,
  Paper,
  Text,
  TextInput,
  useMantineTheme,
  Modal,
  List,
  Group,
  Anchor,
  Grid,
  ActionIcon,
  Collapse,
  Switch,
  Image,
  Tooltip,
  Select,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCircleCheck,
  IconCircleX,
  IconDiamond,
  IconFlag,
  IconInbox,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconWorld,
} from "@tabler/icons";
import { IconGrid4x4 } from "@tabler/icons-react";
import getDomainDetails from "@utils/requests/getDomainDetails";
import { sortBy } from "lodash";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import moment from "moment";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { ClientSDR, Domain, EmailBankItem } from "src";

import LogoImg from "@assets/images/icon.svg";
import { API_URL } from "@constants/data";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";

const MAX_INBOXES = 10;
const MAX_DOMAINS = 5;

export default function DomainManagement() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [addMoreOpened, { open: openAddMore, close: closeAddMore }] =
    useDisclosure(false);
  const [
    requestMoreOpened,
    { open: openRequestMore, close: closeRequestMore },
  ] = useDisclosure(false);
  const [selected, setSelected] = useState<Domain>();

  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "domain",
    direction: "asc",
  });
  const sortDomains = () => {
    const data = sortBy(domains, sortStatus.columnAccessor);
    setDomains(sortStatus.direction === "desc" ? data.reverse() : data);
  };
  useEffect(() => {
    sortDomains();
  }, [sortStatus]);

  const triggerGetDomains = async () => {
    const result = await getDomainDetails(userToken, true);
    if (result.status == "success") {
      const data = result.data.domain_details;
      setDomains(data);
      setAllDomains(data);
      setSelected(data[0]);
    }
  };
  useEffect(() => {
    triggerGetDomains();
  }, []);

  const [searchInput, setSearchInput] = useState("");

  return (
    <Paper withBorder radius={"sm"} m={"md"} mih="90%">
      <Flex gap={"lg"} p={"lg"}>
        <Paper w={"100%"}>
          <Flex align={"center"} justify={"space-between"}>
            <Flex align={"center"}>
              <Text fw={500} size={"xl"}>
                Domain Management
              </Text>
              <Flex
                align={"center"}
                justify={"space-between"}
                py={2}
                px={5}
                style={{
                  border:
                    allDomains.length >= MAX_DOMAINS
                      ? `1px dashed ${theme.colors.green[8]}`
                      : `1px dashed ${theme.colors.orange[6]}`,
                  borderRadius: "6px",
                }}
                ml="md"
              >
                <Flex align={"center"} gap={4} mr={5}>
                  <IconDiamond
                    size={"1rem"}
                    color={
                      allDomains.length >= MAX_DOMAINS
                        ? theme.colors.green[8]
                        : theme.colors.orange[6]
                    }
                  />
                </Flex>
                <Text
                  color={
                    allDomains.length >= MAX_DOMAINS
                      ? theme.colors.green[8]
                      : theme.colors.orange[6]
                  }
                  size={"sm"}
                  fw={500}
                >
                  {allDomains.length} /{" "}
                  {Math.max(allDomains.length, MAX_DOMAINS)} Domains
                </Text>
              </Flex>
            </Flex>

            <Flex align="center">
              <Flex>
                <Button
                  fullWidth
                  onClick={() => {
                    allDomains.length < 55 ? openAddMore() : openRequestMore();
                  }}
                  rightIcon={<IconPlus size="1rem" />}
                >
                  {allDomains.length < 55 ? "Get More" : "Request More"}
                </Button>
              </Flex>
              <InboxAddModal
                opened={addMoreOpened}
                close={closeAddMore}
                inboxQuotaRemaining={Math.max(
                  MAX_INBOXES - allDomains.length * 2,
                  0
                )}
              />
              <InboxRequestModal
                opened={requestMoreOpened}
                close={closeRequestMore}
              />
            </Flex>
          </Flex>
          <Flex>
            {/* Return to settings */}
            <Text size={"sm"} color={theme.colors.gray[6]}>
              <Anchor href="/settings">{`< Return to Settings`}</Anchor>
            </Text>
          </Flex>

          <Flex w="100%" mt="md">
            <Grid>
              <Grid.Col span={8}>
                <TextInput
                  w={"100%"}
                  placeholder="Search for Domain"
                  rightSection={<IconSearch size={"0.9rem"} color="gray" />}
                  value={searchInput}
                  onChange={(e) => {
                    if (e.target.value === "" && searchInput === "") return;
                    if (e.target.value == "") {
                      setDomains(allDomains);
                    } else {
                      setDomains(
                        domains.filter((domain) =>
                          domain.domain
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase())
                        )
                      );
                    }

                    setSearchInput(e.target.value);
                  }}
                />
                <DataTable
                  mah="80%"
                  withBorder
                  withColumnBorders
                  sortStatus={sortStatus}
                  onSortStatusChange={setSortStatus}
                  onRowClick={(record, index) => {
                    setSelected(record);
                  }}
                  mt={"md"}
                  records={domains || []}
                  columns={[
                    {
                      accessor: "domain",
                      sortable: true,
                      title: (
                        <Flex
                          color={theme.colors.gray[6]}
                          align={"center"}
                          gap={"xs"}
                        >
                          <IconWorld
                            color={theme.colors.gray[6]}
                            size={"0.8rem"}
                          />
                          <Text color={theme.colors.gray[6]}>Domain</Text>
                        </Flex>
                      ),
                      render: ({ domain }) => {
                        return (
                          <Flex>
                            {selected && selected.domain === domain && (
                              <Flex mr="2px">
                                <IconCircleCheck
                                  fill={theme.colors.green[4]}
                                  stroke={theme.white}
                                  color={theme.white}
                                />
                              </Flex>
                            )}
                            <Text fz={"sm"} fw={500} mr={"md"}>
                              <Anchor
                                target="_blank"
                                href={`https://www.${domain}`}
                              >
                                {domain}
                              </Anchor>
                            </Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessor: "email_banks.length",
                      sortable: true,
                      title: (
                        <Flex
                          color={theme.colors.gray[6]}
                          align={"center"}
                          gap={"xs"}
                        >
                          <IconInbox
                            color={theme.colors.gray[6]}
                            size={"0.8rem"}
                          />
                          <Text color={theme.colors.gray[6]}>Inboxes</Text>
                        </Flex>
                      ),
                      render: ({ email_banks }) => {
                        if (!email_banks) return <>None</>;
                        return (
                          <Flex w="100%" justify="center" direction="column">
                            {email_banks.length > 0 ? (
                              <>
                                {email_banks
                                  .sort((a, b) =>
                                    a.email_address.localeCompare(
                                      b.email_address
                                    )
                                  )
                                  .map((bank: EmailBankItem, index: number) => (
                                    <Badge mb="xs">
                                      {bank.email_address.split("@")[0]}
                                    </Badge>
                                  ))}
                              </>
                            ) : (
                              "None"
                            )}
                            {/* <Text fz={"sm"}>{email_banks.length}</Text> */}
                          </Flex>
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
                          <IconFlag
                            color={theme.colors.gray[6]}
                            size={"0.8rem"}
                          />
                          <Text color={theme.colors.gray[6]}>Reputation</Text>
                        </Flex>
                      ),
                      render: ({ email_banks }) => {
                        if (!email_banks) return <></>;
                        let reputation = email_banks.reduce(
                          (acc, bank) => acc + bank.smartlead_reputation,
                          0
                        );
                        reputation = reputation / email_banks.length;

                        return (
                          <Flex w="100%" justify="center">
                            <Badge
                              color={
                                reputation == 100
                                  ? theme.colors.green[4]
                                  : "red"
                              }
                            >
                              {reputation}%
                            </Badge>
                          </Flex>
                        );
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
                          <IconGrid4x4
                            color={theme.colors.gray[6]}
                            size={"0.8rem"}
                          />
                          <Text color={theme.colors.gray[6]}>
                            Infrastructure
                          </Text>
                        </Flex>
                      ),
                      width: 480,
                      render: ({
                        dkim_record_valid,
                        dmarc_record_valid,
                        spf_record_valid,
                        forwarding_enabled,
                      }) => {
                        return (
                          <Flex gap={"xs"}>
                            <Group>
                              <Text fz={"sm"} fw={500}>
                                DKIM:{" "}
                              </Text>
                              {dkim_record_valid ? (
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
                              <Text fz={"sm"} fw={500}>
                                SPF:{" "}
                              </Text>
                              {spf_record_valid ? (
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
                              <Text fz={"sm"} fw={500}>
                                DMARC:{" "}
                              </Text>
                              {dmarc_record_valid ? (
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
                              <Text fz={"sm"} fw={500}>
                                Forwarding:{" "}
                              </Text>
                              {forwarding_enabled ? (
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
              </Grid.Col>
              <Grid.Col span={4}>
                <Paper withBorder radius={"sm"}>
                  <Flex
                    align={"center"}
                    justify={"space-between"}
                    className=" border-b-[1px] border-[#eceaee]"
                    px={"md"}
                    py={"sm"}
                  >
                    <Text size="sm" fw="bold">
                      {selected ? (
                        <Anchor
                          target="_blank"
                          href={`https://www.${selected.domain}`}
                        >
                          {selected.domain}
                        </Anchor>
                      ) : (
                        "Loading..."
                      )}
                    </Text>

                    <ActionIcon variant={"transparent"}>
                      <IconRefresh size={"0.9rem"} />
                    </ActionIcon>
                  </Flex>
                  <Divider color="#eceaee" />
                  <Flex direction={"column"} gap={1} pt={"sm"} px={"md"}>
                    <Flex justify="space-between">
                      <Text size="sm" fw={500}>
                        DKIM:
                      </Text>
                      {selected?.dkim_record_valid ? (
                        <IconCircleCheck
                          color="white"
                          fill={theme.colors.green[4]}
                          size={"1.6rem"}
                        />
                      ) : (
                        <IconCircleX
                          color="white"
                          fill={theme.colors.red[4]}
                          size={"1.6rem"}
                        />
                      )}
                    </Flex>
                    <Flex justify="space-between">
                      <Text size="sm" fw={500}>
                        SPF:
                      </Text>
                      {selected?.spf_record_valid ? (
                        <IconCircleCheck
                          color="white"
                          fill={theme.colors.green[4]}
                          size={"1.6rem"}
                        />
                      ) : (
                        <IconCircleX
                          color="white"
                          fill={theme.colors.red[4]}
                          size={"1.6rem"}
                        />
                      )}
                    </Flex>
                    <Flex justify="space-between">
                      <Text size="sm" fw={500}>
                        DMARC:
                      </Text>
                      {selected?.dmarc_record_valid ? (
                        <IconCircleCheck
                          color="white"
                          fill={theme.colors.green[4]}
                          size={"1.6rem"}
                        />
                      ) : (
                        <IconCircleX
                          color="white"
                          fill={theme.colors.red[4]}
                          size={"1.6rem"}
                        />
                      )}
                    </Flex>
                    <Flex justify="space-between">
                      <Text size="sm" fw={500}>
                        Forwarding:
                      </Text>
                      {selected?.forwarding_enabled ? (
                        <IconCircleCheck
                          color="white"
                          fill={theme.colors.green[4]}
                          size={"1.6rem"}
                        />
                      ) : (
                        <IconCircleX
                          color="white"
                          fill={theme.colors.red[4]}
                          size={"1.6rem"}
                        />
                      )}
                    </Flex>
                    <Text fw={400} size="xs" mt="sm">
                      Last Refreshed:{" "}
                      {selected
                        ? moment(selected.last_refreshed).format(
                            "MMMM d, YYYY, h:mm a"
                          )
                        : ""}
                    </Text>
                  </Flex>
                  <Divider mt="sm" />
                  <Flex direction={"column"} gap={"sm"}>
                    <Flex p={"sm"} mt="sm" ml="sm" direction="column">
                      <Text fw={500} size={"sm"}>
                        {(selected &&
                          selected.email_banks &&
                          selected.email_banks.length) ||
                          "..."}{" "}
                        / 2 Inboxes Setup
                      </Text>
                      <Text size="xs">
                        We recommend using a maximum of 2 inboxes per domain to
                        preserve reputation.
                      </Text>
                    </Flex>

                    <Flex
                      px={"md"}
                      justify={"space-between"}
                      direction="column"
                      mb="sm"
                    >
                      {selected?.email_banks &&
                        selected?.email_banks
                          .sort((a, b) =>
                            b.email_address.localeCompare(a.email_address)
                          )
                          .map((bank: EmailBankItem, index: number) => (
                            <Flex
                              align={"center"}
                              sx={{
                                border: "1px solid #C0C0C0",
                                borderRadius: "6px",
                              }}
                              py="md"
                              px="xs"
                              mb={"sm"}
                              justify={"space-between"}
                            >
                              <Flex>
                                <Text size={"sm"}>{bank.email_address}</Text>
                              </Flex>
                              <Flex>
                                <Badge>{bank.smartlead_reputation}%</Badge>
                              </Flex>
                            </Flex>
                          ))}
                      <Button
                        fullWidth
                        leftIcon={<IconPlus size={"0.9rem"} />}
                        disabled={
                          // (selected &&
                          //   selected.email_banks &&
                          //   selected.email_banks.length >= 2) ||
                          // allDomains.length == 0 ||
                          // false
                          true
                        }
                      >
                        Add Inbox (Coming soon)
                      </Button>
                    </Flex>
                  </Flex>
                </Paper>
              </Grid.Col>
            </Grid>
          </Flex>
        </Paper>
      </Flex>
    </Paper>
  );
}

const InboxAddModal = (props: {
  opened: boolean;
  close: () => void;
  inboxQuotaRemaining: number;
}) => {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const [allSDRs, setAllSDRs] = useState<ClientSDR[]>([]);
  const [selectedSDR, setSelectedSDR] = useState<ClientSDR | null>(null);
  const [sellscaleManaged, setSellscaleManaged] = useState(true);

  const getAllSDRs = async () => {
    fetch(`${API_URL}/client/sdrs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAllSDRs(data.data);
      });
  };
  useEffect(() => {
    getAllSDRs();
  }, []);

  useEffect(() => {
    // Clear form when modal is closed
    if (!props.opened) {
      setSellscaleManaged(true);
      sellscaleManagedForm.reset();
      manualForm.reset();
    }
  }, [props.opened]);

  const sellscaleManagedForm = useForm({
    initialValues: {
      numberInboxes: 0,
    },
  });
  const manualForm = useForm({
    initialValues: {
      domain: "",
      numberInboxes: 0,
      inboxNames: [],
    },
  });

  const addInboxes = async () => {
    const formValues = sellscaleManagedForm.values;
    const response = await fetch(
      `${API_URL}/domains/workflow/domain_and_inbox`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedSDR?.auth_token}`,
        },
        body: JSON.stringify({
          number_inboxes: formValues.numberInboxes,
        }),
      }
    );

    if (response.ok) {
      showNotification({
        title: "Inboxes Added",
        message:
          "Inboxes are being added, please allow up to 1 hour for the inboxes to be setup.",
        color: "green",
      });
      props.close();
    } else {
      showNotification({
        title: "Inbox Addition Failed",
        message: "Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Modal
      opened={props.opened}
      size={700}
      centered
      onClose={props.close}
      title={<Title order={3}>Add Inboxes</Title>}
      styles={{
        header: {
          margin: "16px",
          marginBottom: "0px",
        },
        body: {
          margin: "16px",
          marginTop: "0px",
        },
      }}
    >
      <Text size={"xs"} fw={600}>
        Specify the number of inboxes you wish to add and we will dynamically
        create domains and inboxes for you.
      </Text>
      <Text size={"xs"} fw={500} color="gray">
        Important notes regarding domain / inbox creation:
      </Text>
      <List size="xs" styles={{ item: { color: "gray" } }}>
        <List.Item>Each domain can only hold 2 inboxes.</List.Item>
        <List.Item>
          It may take 1 hour for a new domain to be setup and inboxes created.
        </List.Item>
        <List.Item>
          Domains will be permutations of your primary domain, unless manually
          selected.
        </List.Item>
        <List.Item>
          <b>
            The cost of setting up a new domain and inboxes will be reflected in
            your usage bill.
          </b>
        </List.Item>
      </List>
      <Select
        mt={"sm"}
        searchable
        data={(allSDRs || []).map((sdr) => ({
          value: sdr.id.toLocaleString(),
          label: `${sdr.sdr_name} (${sdr.sdr_email})`,
        }))}
        onSelect={(event) => {
          const value = event.currentTarget.value;
          const selected = allSDRs.find(
            (sdr) => `${sdr.sdr_name} (${sdr.sdr_email})` == value
          );

          if (selected) {
            setSelectedSDR(selected);
          } else {
            setSelectedSDR(null);
          }
        }}
        allowDeselect
        placeholder="Select an SDR to assign these inboxes to"
        label="SDR:"
      />
      <Divider mt="md" />
      <Flex
        w="100%"
        justify={"space-between"}
        direction={"row"}
        align="center"
        mt="sm"
      >
        {sellscaleManaged ? (
          <Flex direction="column" w="100%">
            <form
              onSubmit={sellscaleManagedForm.onSubmit((values) => {
                console.log("values", values);
              })}
            >
              <NumberInput
                label="Number of Inboxes"
                description={`Limit given your current domain count: ${props.inboxQuotaRemaining} inboxes`}
                placeholder="2"
                min={0}
                // max={props.inboxQuotaRemaining}
                required
                {...sellscaleManagedForm.getInputProps("numberInboxes")}
              />
              {(sellscaleManagedForm.getInputProps("numberInboxes").value > 0 ||
                sellscaleManagedForm.isTouched()) && (
                <>
                  {" "}
                  <Text size="xs" mt={4}>
                    {`Domain(s) to be purchased: ${Math.round(
                      sellscaleManagedForm.getInputProps("numberInboxes")
                        .value / 2
                    )} domain(s)`}
                  </Text>
                  <Text size="sm" mt={8}>
                    <span style={{ fontWeight: "500" }}>Estimated Volume:</span>{" "}
                    {sellscaleManagedForm.getInputProps("numberInboxes").value *
                      5 *
                      30}{" "}
                    emails / week
                  </Text>
                  <Text fz="xs">
                    {`Calculation: ${
                      sellscaleManagedForm.getInputProps("numberInboxes")
                        .value || 0
                    } inboxes\n x 30 emails per inbox per day x 5 days per week = ${
                      sellscaleManagedForm.getInputProps("numberInboxes")
                        .value *
                      5 *
                      30
                    } emails per week`}
                  </Text>
                </>
              )}
            </form>
            <Flex w="100%" justify={"center"}>
              <Text
                sx={{
                  cursor: "pointer",
                  color: `${theme.colors.blue[6]}`,
                  textDecoration: "underline",
                }}
                mt={6}
                size="xs"
                onClick={() => {
                  // setSellscaleManaged(false);
                }}
              >
                I want to manually add Domains (Coming Soon)
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex w="100%">
            {/* <Select
              w="100%"
              label="Search for Domain:"
              placeholder="Search"
              rightSection={<IconSearch size="1rem" color="grey" />}
              {...manualForm.getInputProps("domain")}
            /> */}
          </Flex>
        )}
      </Flex>

      <Flex gap={"md"} mt={"lg"}>
        <Button
          variant="outline"
          fullWidth
          color="gray"
          onClick={() => props.close()}
        >
          Go Back
        </Button>
        <Button
          fullWidth
          disabled={
            sellscaleManaged
              ? !(
                  selectedSDR &&
                  sellscaleManagedForm.getInputProps("numberInboxes").value > 0
                )
              : !(
                  selectedSDR &&
                  manualForm.getInputProps("domain").value &&
                  manualForm.getInputProps("numberInboxes").value > 0
                )
          }
          onClick={() => {
            sellscaleManaged ? addInboxes() : console.log("manual add");
          }}
        >
          Add Inboxes
        </Button>
      </Flex>
    </Modal>
  );
};
