import {
  Accordion,
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { Icon123, IconChevronLeft, IconChevronRight, IconCircleCheck, IconLetterT, IconUsers, IconX } from "@tabler/icons";
import { DataGrid, numberFilterFn, stringFilterFn } from "mantine-data-grid";
import { useState } from "react";

export default function AccountContactFiltersModal({ context, id, innerProps }: ContextModalProps) {
  const theme = useMantineTheme();
  const data = [
    {
      icp: 46,
      name: "Jessica V.",
      title: "Staff Software Engineer",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
    {
      icp: 30,
      name: "Olivia R.",
      title: "Libraries",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
    {
      icp: 24,
      name: "John Doe",
      title: "Financial Services",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
    {
      icp: 11,
      name: "David N.",
      title: "Venture Capital &",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
    {
      icp: 5,
      name: "Zoe Kim",
      title: "Libraries",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
    {
      icp: 50,
      name: "Jessica V.",
      title: "Staff Software Engineer",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
    {
      icp: 16,
      name: "Jessica V.",
      title: "Staff Software Engineer",
      company: "Airbnb",
      status: "prospected",
      linkedin: "https://linkedin/xxxx",
    },
  ];

  const [programmicfilterOption, setProgrammicFilterOption] = useState([
    {
      type: "Companies Keywords",
      options: null,
    },
    {
      type: "Location",
      options: [""],
    },
    {
      type: "Employee Count",
      options: [""],
    },
    {
      type: "Industries",
      options: [""],
    },
    {
      type: "Company Description",
      options: null,
      component: (
        <Stack spacing={"xs"}>
          <Select label="Included" placeholder="Select options" data={[""]} />
          <Checkbox label="Dealbreaker" />
          <Divider />
          <Select label="Excluded" placeholder="Select options" data={[""]} />
          <Checkbox label="Dealbreaker" />
        </Stack>
      ),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");

  const [filterData, setFilterData] = useState(data);

  return (
    <Paper>
      <Flex align={"center"} justify={"space-between"}>
        <Flex align={"center"} gap={"sm"}>
          <IconUsers color="#228be6" size={"1.4rem"} />
          <Text fw={600} size={"lg"}>
            Q3 Mavs PTAL
          </Text>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Switch onLabel="Account View" offLabel="Contact View" size="lg" onChange={() => setView(!view)} />
          <Switch onLabel="View 20" offLabel="View 20" size="lg" />
          <Button>Create Segment from Selected Prospects</Button>
          <ActionIcon variant="outline" radius={"xl"} size={"md"} onClick={() => context.closeContextModal(id)}>
            <IconX size={"1rem"} />
          </ActionIcon>
        </Flex>
      </Flex>
      <Paper withBorder radius={"sm"} p={"sm"} mt={"sm"}>
        <Flex gap={"lg"}>
          <Paper withBorder radius={"sm"} miw={"30%"}>
            <Box p={"sm"}>
              <Text fw={600} size={"md"} color="grape">
                Company Filters
              </Text>
              <Button color="red" fullWidth mt={"sm"}>
                Score
              </Button>
            </Box>
            <Divider />
            <ScrollArea h={560}>
              <Paper>
                <Accordion>
                  <Accordion.Item value="programmic_filter">
                    <Accordion.Control>Programmic Filters</Accordion.Control>
                    <Accordion.Panel>
                      <Accordion
                        variant="separated"
                        disableChevronRotation
                        styles={{
                          item: {
                            background: "white",
                            marginTop: "4px !important",
                            border: "1px solid #ced4da",
                          },
                        }}
                      >
                        {programmicfilterOption.map((item, index) => {
                          return (
                            <Accordion.Item value={item.type} key={index}>
                              <Accordion.Control>
                                {item.type}
                                {item.options && (
                                  <Badge ml={4} color="gray">
                                    {item.options.length}
                                  </Badge>
                                )}
                              </Accordion.Control>
                              <Accordion.Panel>{item.component ? item.component : <Text>safasdf</Text>}</Accordion.Panel>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item value="ai_filter">
                    <Accordion.Control>AI Filter</Accordion.Control>
                    <Accordion.Panel>
                      <TextInput label="Title" description="This will be the title that is displayed as a column" withAsterisk placeholder="Enter Title" />
                      <Textarea mt={"sm"} label="AI Filter" withAsterisk minRows={3} placeholder="Enter AI Prompt here: A question to score your..." />
                      <Checkbox mt={"sm"} label="Dealbreaker" />
                      <Checkbox mt={"sm"} label="Save to prospect" />
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Paper>
            </ScrollArea>
          </Paper>
          <Box maw={"68%"} mah={530}>
            <Box></Box>
          </Box>
          <DataGrid
            data={filterData}
            highlightOnHover
            withPagination
            withSorting
            withColumnFilters
            withColumnBorders
            {...(view ? { withRowSelection: true } : {})}
            withBorder
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
                accessorKey: "contact_name",
                minSize: view ? undefined : 200,
                maxSize: view ? undefined : 200,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">{view ? "Account Name" : "Contact Name"}</Text>
                  </Flex>
                ),

                cell: (cell) => {
                  const { name } = cell.row.original;

                  return (
                    <Flex w={"100%"} px={"sm"} py={view ? 8 : 6} gap={"xs"} h={"100%"} align={"center"}>
                      {!view && <Avatar src={""} size={"sm"} radius={"xl"} />}
                      <Text color="gray" size={"sm"} fw={500}>
                        {name}
                      </Text>
                    </Flex>
                  );
                },
              },
              ...(view
                ? []
                : [
                    {
                      accessorKey: "title",
                      minSize: 200,
                      maxSize: 200,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Title</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => {
                        const { title } = cell.row.original;

                        return (
                          <Flex gap={"sm"} w={"100%"} px={"sm"} h={"100%"} align={"center"}>
                            <Text color="gray">{title}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "company",
                      minSize: 150,
                      maxSize: 150,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Company</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => {
                        const { company } = cell.row.original;

                        return (
                          <Flex gap={"sm"} w={"100%"} px={"sm"} h={"100%"} align={"center"}>
                            <Text color="gray">{company}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "status",
                      minSize: 160,
                      maxSize: 160,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <Icon123 color="gray" size={"0.9rem"} />
                          <Text color="gray">Status</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => {
                        const { status } = cell.row.original;

                        return (
                          <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                            <Badge>{status}</Badge>
                          </Flex>
                        );
                      },
                    },
                  ]),
              {
                accessorKey: "icp_score",
                minSize: view ? undefined : 160,
                maxSize: view ? undefined : 160,
                filterFn: numberFilterFn,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <Icon123 color="gray" size={"0.9rem"} />
                    <Text color="gray">ICP Score</Text>
                  </Flex>
                ),
                cell: (cell) => {
                  const { icp } = cell.row.original;

                  return (
                    <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                      <Tooltip
                        withArrow
                        position="right"
                        w={300}
                        label={
                          <Box p={"sm"}>
                            <Text fw={500} color="gray">
                              ICP Score Matches:{" "}
                              <span className="text-red-500 ml-1">
                                {2}/{2}
                              </span>
                            </Text>
                            <Flex align={"center"} justify={"space-between"} mt={"sm"}>
                              <Flex align={"center"} gap={"sm"}>
                                <IconCircleCheck fill="green" />
                                <Text color="white" fw={500}>
                                  Prospect Title:
                                </Text>
                              </Flex>
                              <Text fw={600} tt={"uppercase"} color="#228be6">
                                investor
                              </Text>
                            </Flex>
                            <Flex align={"center"} justify={"space-between"} mt={4}>
                              <Flex align={"center"} gap={"sm"}>
                                <IconCircleCheck fill="green" />
                                <Text color="white" fw={500}>
                                  Prospect Seniority:
                                </Text>
                              </Flex>
                              <Text fw={600} tt={"uppercase"} color="#228be6">
                                director
                              </Text>
                            </Flex>
                          </Box>
                        }
                      >
                        <Badge color={icp > 40 ? "red" : icp > 30 ? "orange" : icp > 20 ? "yellow" : icp > 10 ? "green" : "blue"}>
                          {icp > 40 ? "Very High" : icp > 30 ? "High" : icp > 20 ? "Medium" : icp > 10 ? "Low" : "Very Low"}
                        </Badge>
                      </Tooltip>
                    </Flex>
                  );
                },
              },
              ...(view
                ? []
                : [
                    {
                      accessorKey: "linkedin_url",
                      minSize: view ? undefined : 160,
                      maxSize: view ? undefined : 160,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <Icon123 color="gray" size={"0.9rem"} />
                          <Text color="gray">Linkedin URL</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => {
                        const { linkedin } = cell.row.original;

                        return (
                          <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                            <Anchor href={linkedin} target="_blank">
                              <Text size={"sm"} underline>
                                {linkedin}
                              </Text>
                            </Anchor>
                          </Flex>
                        );
                      },
                    },
                  ]),
            ]}
            options={{
              enableFilters: true,
            }}
            loading={loading}
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
                    data={[
                      { label: "Show 25 rows", value: "25" },
                      { label: "Show 10 rows", value: "10" },
                      { label: "Show 5 rows", value: "5" },
                    ]}
                    value={acPageSize}
                    onChange={(v) => {
                      setAcPageSize(v ?? "25");
                    }}
                  />
                  <Flex align={"center"} gap={"sm"}>
                    <Flex align={"center"}>
                      <Select
                        maw={100}
                        value={`${table.getState().pagination.pageIndex + 1}`}
                        data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                          label: String(idx + 1),
                          value: String(idx + 1),
                        }))}
                        onChange={(v) => {
                          table.setPageIndex(Number(v) - 1);
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
                          of {table.getPageCount()} pages
                        </Text>
                      </Flex>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={table.getState().pagination.pageIndex === 0}
                        onClick={() => {
                          table.setPageIndex(table.getState().pagination.pageIndex - 1);
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
                          table.setPageIndex(table.getState().pagination.pageIndex + 1);
                        }}
                      >
                        <IconChevronRight stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ),
            }}
            w={"100%"}
            pageSizes={[acPageSize]}
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
                height: "585px",
              },

              dataCellContent: {
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            })}
          />
        </Flex>
        <Flex gap={"lg"} mt={"md"}>
          <Button fullWidth variant="outline" color="gray">
            Cancel
          </Button>
          <Button fullWidth>Add Contacts</Button>
        </Flex>
      </Paper>
    </Paper>
  );
}
