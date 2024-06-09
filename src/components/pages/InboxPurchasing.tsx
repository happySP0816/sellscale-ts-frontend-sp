import {
  Accordion,
  Badge,
  ActionIcon,
  Button,
  Divider,
  Title,
  Flex,
  Paper,
  ScrollArea,
  Select,
  Text,
  TextInput,
  useMantineTheme,
  createStyles,
  Modal,
  List,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  Icon123,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconDiamond,
  IconLetterT,
  IconLink,
  IconLoader,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import { valueToColor } from "@utils/general";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";

const useStyles = createStyles(() => ({
  highlightRow: {
    backgroundColor: "#f2f6fc !important",
  },
}));

export default function InboxPurchasing() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);
  const [acPageSize, setAcPageSize] = useState("25");
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const data = [
    {
      company: "AlphaFX",
      inbox: 1,
      domains: "alphafx.com",
      forwarding_url: "https://wwww.alphagroup.com/",
      stage: null,
      type: "Manual",
      infrastructure: {
        dkim: true,
        spf: true,
        dmarc: false,
        forwarding: false,
        warmup: true,
      },
    },
    {
      company: "Ask Wellness",
      inbox: 2,
      domains: "poweredbyashmail.net",
      forwarding_url: "https://wwww.poweredbyash.com/",
      stage: null,
      type: "AWS",
      infrastructure: {
        dkim: true,
        spf: false,
        dmarc: true,
        forwarding: true,
        warmup: true,
      },
    },
    {
      company: "AlphaFX",
      inbox: 1,
      domains: "alphafx.com",
      forwarding_url: "https://wwww.alphagroup.com/",
      stage: null,
      type: "Manual",
      infrastructure: {
        dkim: true,
        spf: true,
        dmarc: false,
        forwarding: false,
        warmup: true,
      },
    },
    {
      company: "Ask Wellness",
      inbox: 2,
      domains: "poweredbyashmail.net",
      forwarding_url: "https://wwww.poweredbyash.com/",
      stage: null,
      type: "AWS",
      infrastructure: {
        dkim: true,
        spf: false,
        dmarc: true,
        forwarding: true,
        warmup: true,
      },
    },
    {
      company: "AlphaFX",
      inbox: 1,
      domains: "alphafx.com",
      forwarding_url: "https://wwww.alphagroup.com/",
      stage: null,
      type: "Manual",
      infrastructure: {
        dkim: true,
        spf: true,
        dmarc: false,
        forwarding: false,
        warmup: true,
      },
    },
    {
      company: "Ask Wellness",
      inbox: 2,
      domains: "poweredbyashmail.net",
      forwarding_url: "https://wwww.poweredbyash.com/",
      stage: null,
      type: "AWS",
      infrastructure: {
        dkim: true,
        spf: false,
        dmarc: true,
        forwarding: true,
        warmup: true,
      },
    },
    {
      company: "AlphaFX",
      inbox: 1,
      domains: "alphafx.com",
      forwarding_url: "https://wwww.alphagroup.com/",
      stage: null,
      type: "Manual",
      infrastructure: {
        dkim: true,
        spf: true,
        dmarc: false,
        forwarding: false,
        warmup: true,
      },
    },
    {
      company: "Ask Wellness",
      inbox: 2,
      domains: "poweredbyashmail.net",
      forwarding_url: "https://wwww.poweredbyash.com/",
      stage: null,
      type: "AWS",
      infrastructure: {
        dkim: true,
        spf: false,
        dmarc: true,
        forwarding: true,
        warmup: true,
      },
    },
    {
      company: "AlphaFX",
      inbox: 1,
      domains: "alphafx.com",
      forwarding_url: "https://wwww.alphagroup.com/",
      stage: null,
      type: "Manual",
      infrastructure: {
        dkim: true,
        spf: true,
        dmarc: false,
        forwarding: false,
        warmup: true,
      },
    },
    {
      company: "Ask Wellness",
      inbox: 2,
      domains: "poweredbyashmail.net",
      forwarding_url: "https://wwww.poweredbyash.com/",
      stage: null,
      type: "AWS",
      infrastructure: {
        dkim: true,
        spf: false,
        dmarc: true,
        forwarding: true,
        warmup: true,
      },
    },
    {
      company: "AlphaFX",
      inbox: 1,
      domains: "alphafx.com",
      forwarding_url: "https://wwww.alphagroup.com/",
      stage: null,
      type: "Manual",
      infrastructure: {
        dkim: true,
        spf: true,
        dmarc: false,
        forwarding: false,
        warmup: true,
      },
    },
    {
      company: "Ask Wellness",
      inbox: 2,
      domains: "poweredbyashmail.net",
      forwarding_url: "https://wwww.poweredbyash.com/",
      stage: null,
      type: "AWS",
      infrastructure: {
        dkim: true,
        spf: false,
        dmarc: true,
        forwarding: true,
        warmup: true,
      },
    },
  ];
  const [filterData, setFilterData] = useState(data);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>();
  const [highlighted, setHighlighted] = useState("");

  const handleCompanyFilter = (filter: string) => {
    let newData = data.filter((item) => item.company.toLowerCase().includes(filter));
    setFilterData(newData);
  };

  const handleClick = (id: string) => {
    setHighlighted(id);
  };

  return (
    <Paper withBorder radius={"sm"} p={"sm"} m={"md"}>
      <Flex gap={"lg"} p={"lg"}>
        <Paper w={selected ? "70%" : "100%"}>
          <Flex align={"center"} justify={"space-between"}>
            <Text fw={700} size={"xl"}>
              Domain Management
            </Text>
            <TextInput
              w={200}
              placeholder="Search for company"
              rightSection={<IconSearch size={"0.9rem"} color="gray" />}
              onChange={(e) => handleCompanyFilter(e.target.value)}
            />
          </Flex>
          <DataGrid
            mt={"sm"}
            loading={loading}
            withPagination
            withBorder
            withColumnBorders
            onRow={(row) => ({
              onClick: () => {
                setSelected(row.original);
                handleClick(row.id);
              },
              className: highlighted.includes(row.id) ? classes.highlightRow : undefined,
            })}
            data={filterData}
            sx={{
              cursor: "pointer",
              "& .mantine-10xyzsm>tbody>tr>td": {
                padding: "0px",
              },
              "& tr": {
                background: "white",
              },
            }}
            columns={[
              {
                accessorKey: "company",
                minSize: 200,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">Company</Text>
                  </Flex>
                ),
                cell: (cell: any) => {
                  const { company } = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} p={"sm"} align={"center"} justify={"space-between"}>
                      <Badge
                        size="lg"
                        color={valueToColor(theme, company)}
                        styles={{
                          inner: {
                            textTransform: "initial",
                          },
                        }}
                      >
                        {company}
                      </Badge>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "inbox",
                minSize: 80,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <Icon123 color="gray" size={"1.4rem"} />
                    <Text color="gray">Inbox</Text>
                  </Flex>
                ),
                cell: (cell: any) => {
                  const { inbox } = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} p={"sm"} align={"center"} justify={"center"}>
                      <Text fw={500}>{inbox}</Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "domain",
                minSize: 250,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLink color="gray" size={"0.9rem"} />
                    <Text color="gray">Domains</Text>
                  </Flex>
                ),
                cell: (cell: any) => {
                  const { domains } = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} p={"sm"} align={"center"} justify={"space-between"}>
                      <Text fw={500} color="#228be6">
                        {domains}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "forward",
                minSize: 350,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLink color="gray" size={"0.9rem"} />
                    <Text color="gray">Forward to</Text>
                  </Flex>
                ),
                cell: (cell: any) => {
                  const { forwarding_url } = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} p={"sm"} align={"center"} justify={"space-between"}>
                      <Text fw={500} color="#228be6">
                        {forwarding_url}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "setup_stage",
                minSize: 100,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLoader color="gray" size={"0.9rem"} />
                    <Text color="gray">Setup Stage</Text>
                  </Flex>
                ),
                cell: (cell: any) => {
                  const { stage } = cell.row.original;

                  return (
                    <Flex gap={"xs"} w={"100%"} h={"100%"} p={"sm"} align={"center"} justify={"space-between"}>
                      {stage && (
                        <Badge variant="outline" size="lg" color={valueToColor(theme, stage)}>
                          {stage}
                        </Badge>
                      )}
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "infrastructure",
                minSize: 580,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">Infrastrcture</Text>
                  </Flex>
                ),
                cell: (cell: any) => {
                  const { infrastructure } = cell.row.original;

                  return (
                    <Flex gap={"sm"} w={"100%"} h={"100%"} p={"sm"} align={"center"} justify={"center"}>
                      <Flex gap={"sm"} align={"center"}>
                        {Object.entries(infrastructure).map(([key, value], index) => {
                          return (
                            <div key={index} className="flex items-center gap-3">
                              <Flex gap={4} align={"center"}>
                                <Text size={"sm"} fw={500} tt={"uppercase"}>
                                  {key}:
                                </Text>
                                {value ? (
                                  <IconCircleCheck color="white" fill="green" size={"1.6rem"} />
                                ) : (
                                  <IconCircleX color="white" fill="red" size={"1.6rem"} />
                                )}
                              </Flex>
                              <Divider orientation="vertical" />
                            </div>
                          );
                        })}
                      </Flex>
                    </Flex>
                  );
                },
              },
            ]}
            components={{
              pagination: ({ table }) => (
                <Flex
                  justify={"space-between"}
                  align={"center"}
                  px={"sm"}
                  py={"1.25rem"}
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderTopWidth: 0,
                  })}
                >
                  <Select
                    style={{ width: "150px" }}
                    data={[{ label: "Show 25 rows", value: "25" }]}
                    value={acPageSize}
                    onChange={(v) => {
                      setAcPageSize(v ?? "25");
                    }}
                  />
                  <Flex align={"center"} gap={"sm"}>
                    <Flex align={"center"}>
                      <Select
                        maw={100}
                        value={`${pageIndex}`}
                        data={new Array(Math.ceil(totalCount / Number(acPageSize))).fill(0).map((i, idx) => ({
                          label: String(idx),
                          value: String(idx),
                        }))}
                        onChange={(v) => {
                          setPageIndex(Number(v));
                        }}
                      />
                      <Flex
                        sx={(theme) => ({
                          borderTop: `1px solid ${theme.colors.gray[4]}`,
                          borderRight: `1px solid ${theme.colors.gray[4]}`,
                          borderBottom: `1px solid ${theme.colors.gray[4]}`,
                          marginLeft: "-2px",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                        })}
                        h={36}
                      >
                        <Text color="gray.5" fw={500} fz={14}>
                          of {Math.ceil(totalCount / Number(acPageSize))} pages
                        </Text>
                      </Flex>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={Math.ceil(totalCount / Number(acPageSize)) === 0}
                        onClick={() => {
                          setPageIndex((prev) => prev - 1);
                        }}
                      >
                        <IconChevronLeft stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                        onClick={() => {
                          setPageIndex((prev) => prev + 1);
                        }}
                      >
                        <IconChevronRight stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ),
            }}
            styles={(theme) => ({
              thead: {
                height: "44px",
                backgroundColor: theme.colors.gray[0],
                "::after": {
                  backgroundColor: "transparent",
                },
              },

              wrapper: {
                gap: 0,
              },
              scrollArea: {
                paddingBottom: 0,
                gap: 0,
              },

              dataCellContent: {
                width: "100%",
              },
            })}
          />
        </Paper>
        {selected && (
          <Paper w={"30%"}>
            <Flex align={"center"} justify={"space-between"} py={7} px={"sm"} style={{ border: "1px solid #228be6", borderRadius: "6px" }}>
              <Flex align={"center"} gap={4}>
                <IconDiamond size={"1.2rem"} color="#228be6" />
                <Text color="#228be6" size={"sm"} fw={500}>
                  Your Credit:
                </Text>
              </Flex>
              <Text color="#228be6" size={"sm"} fw={500}>
                {5}/{5} Inboxes
              </Text>
            </Flex>
            <Button radius={"md"} mt={"sm"} fullWidth onClick={open}>
              Bulk Purchase Domain + Inbox
            </Button>
            <Button radius={"md"} fullWidth mt={"sm"} className="bg-[#7AB5E7]">
              Purchase Domain (Single)
            </Button>
            <Paper withBorder radius={"sm"} mt={"sm"}>
              <Flex align={"center"} justify={"space-between"} className=" border-b-[1px] border-[#eceaee]" px={"md"} py={"sm"}>
                <Text fw={700}>{selected.company}</Text>
                <Button radius={"xl"} rightIcon={<IconRefresh size={"0.9rem"} />} size="xs" className="bg-[#7AB5E7]">
                  Refresh
                </Button>
              </Flex>
              <Divider color="#eceaee" />
              <Flex direction={"column"} gap={1} py={"sm"} px={"md"}>
                {Object.entries(selected.infrastructure).map(([key, value], index) => {
                  return (
                    <Flex gap={4} align={"center"} justify={"space-between"} key={index}>
                      <Text size={"sm"} fw={500} tt={"uppercase"}>
                        {key}:
                      </Text>
                      {value ? <IconCircleCheck color="white" fill="green" size={"1.6rem"} /> : <IconCircleX color="white" fill="red" size={"1.6rem"} />}
                    </Flex>
                  );
                })}
                <Text color="gray" fw={500} size={"sm"}>
                  Last refresh: {"May 29, 2024, 10:13 PM"}
                </Text>
              </Flex>
              <Flex direction={"column"} gap={"sm"} p={"sm"}>
                <Accordion
                  //   value={companyLocationValue}
                  style={{
                    // border: "1px solid #eceaee",
                    borderBottom: "0px",
                    borderRadius: "6px",
                  }}
                  styles={{
                    panel: {
                      padding: "1px",
                      borderTop: "1px solid #eceaee",
                    },
                    content: {
                      padding: "8px",
                    },
                    control: {
                      padding: "8px",
                    },
                    label: {
                      paddingBlock: "8px",
                    },
                    item: {
                      border: "1px solid #eceaee",
                      backgroundColor: "white",
                    },
                  }}
                  variant="separated"
                  //   onChange={(e) => {
                  //     setCompanyLocationValue(e);
                  //   }}
                >
                  <Accordion.Item value="dns">
                    <Accordion.Control>Detailed DNS</Accordion.Control>
                    <Accordion.Panel>Detail infomation</Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="inbox">
                    <Accordion.Control>Inboxes</Accordion.Control>
                    <Accordion.Panel>
                      <Button radius={"md"} fullWidth leftIcon={<IconPlus size={"0.9rem"} />}>
                        Add Inbox
                      </Button>
                      <Paper withBorder radius={"sm"} mt={"sm"}>
                        <Text fw={500} size={"sm"} p={"sm"}>
                          {15} domains purchased:
                        </Text>
                        <Divider color="#eceaee" />
                        <ScrollArea h={160} type="always" scrollbarSize={6}>
                          <Flex py={"6px"} px={"md"} align={"center"} justify={"space-between"} style={{ borderBottom: "1px solid #eceaee" }}>
                            <Flex align={"center"} gap={"lg"}>
                              <Text color="gray" fw={500} size={"sm"}>
                                1.
                              </Text>
                              <Text color="gray" fw={500} size={"sm"}>
                                {"james@alphafx.com"}
                              </Text>
                            </Flex>
                            <IconCircleCheck color="white" fill="#228be6" size={"1.6rem"} />
                          </Flex>
                        </ScrollArea>
                      </Paper>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
                <Button fullWidth color="red" radius={"md"} leftIcon={<IconTrash size={"0.9rem"} />}>
                  Delete Inbox
                </Button>
              </Flex>
            </Paper>
          </Paper>
        )}
      </Flex>
      <Modal
        opened={opened}
        size={500}
        centered
        onClose={close}
        title={<Title order={3}>Purchase Domains + Inboxes</Title>}
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
          Specify the number of inboxes you wish to create we will dynamically create domains for these inboxes.
        </Text>
        <Text size={"xs"} fw={500} color="gray">
          Notes regarding domain / inbox creation:
        </Text>
        <List size="xs" styles={{ item: { color: "gray" } }}>
          <List.Item>Each domain can only hold 2 inboxes.</List.Item>
          <List.Item>Domains will be permutations of the Client's primary domain.</List.Item>
          <List.Item>It may take 1 hour for a new domain to be setup and inboxes created</List.Item>
        </List>
        <Select mt={"sm"} data={[""]} placeholder="Select an SDR to create these inboxes for" label="SDR:" />
        <NumberInput mt={"sm"} placeholder="Specify how many inboxes you wish to create" label="Number of Inboxes" />
        <Flex gap={"md"} mt={"lg"}>
          <Button variant="outline" fullWidth color="gray">
            Go Back
          </Button>
          <Button fullWidth>Create Inboxes</Button>
        </Flex>
      </Modal>
    </Paper>
  );
}
