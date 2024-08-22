import ItemCollapse from "@common/persona/ICPFilter/Filters/ItemCollapse";
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
  Group,
  Paper,
  Radio,
  ScrollArea,
  Select,
  Switch,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import {
  Icon123,
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconLetterT,
  IconMagnet,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { DataGrid, numberFilterFn, stringFilterFn } from "mantine-data-grid";
import { useEffect, useRef, useState } from "react";

export default function CampaignFilterModal({ context, id, innerProps }: ContextModalProps) {
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

  const [individualFilterOption, setIndividualFilterOption] = useState([
    {
      type: "Titles",
      options: [""],
    },
    {
      type: "Seniority",
      options: [""],
    },
    {
      type: "Industry",
      options: [""],
    },
    {
      type: "Skills",
      options: [""],
    },
    {
      type: "Location",
      options: [""],
    },
    {
      type: "Descriptions",
      options: [""],
    },
    {
      type: "University/College",
      options: [""],
    },
    {
      type: "Experience",
      options: [""],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");
  const [filterOption, setFilterOption] = useState("all");

  const [filterData, setFilterData] = useState(data);

  const [customFilterOption, setCustomFilterOption] = useState([
    {
      type: "Contact",
      title: "Is Engineer",
      content:
        "Is this prospect an engineer? An engineer can be a software engineer, or a lead role regarding engineers or AI. If so, provide a short reasoning and a citation.",
      custom: "Personalizer",
    },
    {
      type: "Company",
      title: "Is Tech company",
      content: "Is this company a Tech company? If so, give a short reasoning and provide a primary source.",
      custom: null,
    },
    {
      type: "Company",
      title: "B2B SAAS Co?",
      content: "Is company a b2b saas co?",
      custom: "Dealbreaker",
    },
  ]);

  const handleFilter = (e: any) => {
    console.log(e.target.value);
    setFilterData(
      data.filter(
        (item) =>
          item.name.toLowerCase().includes(e.target.value) ||
          item.company.toLowerCase().includes(e.target.value) ||
          item.title.toLowerCase().includes(e.target.value)
      )
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - (containerRef.current?.offsetLeft || 0);
      scrollLeft = containerRef.current?.scrollLeft || 0;
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - (containerRef.current?.offsetLeft || 0);
      const walk = (x - startX) * 3; // scroll-fast
      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    const container = containerRef.current;

    container?.addEventListener("mousedown", handleMouseDown);
    container?.addEventListener("mouseleave", handleMouseLeave);
    container?.addEventListener("mouseup", handleMouseUp);
    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      container?.removeEventListener("mousedown", handleMouseDown);
      container?.removeEventListener("mouseleave", handleMouseLeave);
      container?.removeEventListener("mouseup", handleMouseUp);
      container?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Paper>
      <Flex align={"center"} justify={"space-between"}>
        <Flex align={"center"} gap={"sm"}>
          <IconUsers color="#228be6" size={"1.4rem"} />
          <Text fw={600} size={"lg"}>
            Filter Contacts
          </Text>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <TextInput icon={<IconSearch size={"1rem"} />} placeholder="Search for a specific name/company/title" w={540} onChange={handleFilter} />
          <ActionIcon variant="outline" size={"lg"}>
            <IconMagnet size={"1rem"} style={{ transform: "rotate(45deg)" }} />
          </ActionIcon>
          <Switch onLabel="ON" offLabel="View 10" size="lg" />
          <ActionIcon variant="outline" radius={"xl"} size={"lg"} onClick={() => context.closeContextModal(id)}>
            <IconX size={"1rem"} />
          </ActionIcon>
        </Flex>
      </Flex>
      <Paper withBorder radius={"sm"} p={"sm"} mt={"sm"}>
        <Flex gap={"lg"}>
          <Box miw={"30%"}>
            <Button color="red" fullWidth>
              Score
            </Button>
            <ScrollArea h={690}>
              <Paper withBorder mt={"sm"}>
                <Accordion defaultValue="individual">
                  <Accordion.Item value="ai_filter">
                    <Accordion.Control icon={<IconSparkles fill="black" size={"1.3rem"} />}>AI Filter</Accordion.Control>
                    <Accordion.Panel>
                      <TextInput label="Title:" radius={"md"} />
                      <Radio.Group label="Type:" mt={"sm"}>
                        <Group mt={4}>
                          <Radio value="company" label="Company" />
                          <Radio value="contact" label="Contact" />
                        </Group>
                      </Radio.Group>
                      <Textarea minRows={3} label="Prompt:" mt={"sm"} />
                      <Radio.Group label="Type:" mt={"sm"}>
                        <Group mt={4}>
                          <Radio value="research" label="Research" />
                          <Radio value="linkedin" label="Linkedin" />
                        </Group>
                      </Radio.Group>
                      <Group mt="xs">
                        <Checkbox label="Personalizer" />
                        <Checkbox label="Dealbreaker" />
                      </Group>
                      <Button leftIcon={<IconPlus size={"1rem"} />} fullWidth mt={"sm"}>
                        Add AI Filter
                      </Button>
                      <Accordion
                        styles={{
                          content: {
                            padding: "0px",
                          },
                        }}
                      >
                        <Accordion.Item value="custom_filter">
                          <Accordion.Control className="p-0">Added AI Filters</Accordion.Control>
                          <Accordion.Panel>
                            {customFilterOption.map((item, index) => {
                              return (
                                <Paper withBorder radius={"sm"} p={"sm"} mt={"xs"} key={index}>
                                  <Flex align={"center"} justify={"space-between"}>
                                    <Badge radius={"sm"} tt={"initial"} color={item.type === "Contact" ? "grape" : "blue"}>
                                      {item.type}
                                    </Badge>
                                    <Flex gap={4}>
                                      <ActionIcon variant="outline" size={"sm"} color="gray">
                                        <IconPencil size={"1rem"} />
                                      </ActionIcon>
                                      <ActionIcon variant="outline" size={"sm"} color="gray">
                                        <IconTrash color="red" size={"1rem"} />
                                      </ActionIcon>
                                    </Flex>
                                  </Flex>
                                  <Text fw={600} size={"md"} mt={4}>
                                    {item.title}
                                  </Text>
                                  <Text fw={500} size={"sm"} color="gray">
                                    {item.content}
                                  </Text>
                                  {item.custom && (
                                    <Box mt={"sm"}>
                                      <Divider variant="dashed" />
                                      <Badge mt={"sm"} tt={"initial"} variant="outline" color={item.custom === "Personalizer" ? "blue" : "yellow"}>
                                        {item.custom}
                                      </Badge>
                                    </Box>
                                  )}
                                </Paper>
                              );
                            })}
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="individual">
                    <Accordion.Control icon={<IconUser fill="black" size={"1.3rem"} />}>Individual</Accordion.Control>
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
                        {individualFilterOption.map((item, index) => {
                          return (
                            <Accordion.Item value={item.type} key={index}>
                              <Accordion.Control>
                                {item.type}
                                <Badge ml={4} color="gray">
                                  {item.options.length}
                                </Badge>
                              </Accordion.Control>
                              <Accordion.Panel>
                                Configure components appearance and behavior with vast amount of settings or overwrite any part of component styles
                              </Accordion.Panel>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>
                    </Accordion.Panel>
                  </Accordion.Item>

                  <Accordion.Item value="focus-ring">
                    <Accordion.Control icon={<IconBuilding fill="black" size={"1.3rem"} />}>No annoying focus ring</Accordion.Control>
                    <Accordion.Panel>With new :focus-visible pseudo-class focus ring appears only when user navigates with keyboard</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Paper>
            </ScrollArea>
          </Box>
          <Box maw={"68%"} mah={600}>
            <div
              ref={containerRef}
              className="border flex items-center overflow-hidden border-[#ced4da] rounded-md border-solid"
              style={{ overflowX: "hidden", whiteSpace: "nowrap" }}
            >
              <Button
                variant={filterOption === "all" ? "filled" : "white"}
                fullWidth
                color="dark"
                onClick={() => setFilterOption("all")}
                rightIcon={<Badge color="dark">123</Badge>}
              >
                All
              </Button>
              <Divider orientation="vertical" h={24} my={"auto"} />
              <Button
                fullWidth
                variant={filterOption === "very_high" ? "filled" : "white"}
                onClick={() => setFilterOption("very_high")}
                rightIcon={<Badge>123</Badge>}
              >
                Very High
              </Button>
              <Divider orientation="vertical" h={24} my={"auto"} />
              <Button
                color="green"
                variant={filterOption === "high" ? "filled" : "white"}
                fullWidth
                onClick={() => setFilterOption("high")}
                rightIcon={<Badge color="green">123</Badge>}
              >
                High
              </Button>
              <Divider orientation="vertical" h={24} my={"auto"} />
              <Button
                color="yellow"
                fullWidth
                variant={filterOption === "medium" ? "filled" : "white"}
                onClick={() => setFilterOption("medium")}
                rightIcon={<Badge color="yellow">123</Badge>}
              >
                Medium
              </Button>
              <Divider orientation="vertical" h={24} my={"auto"} />
              <Button
                color="orange"
                fullWidth
                variant={filterOption === "low" ? "filled" : "white"}
                onClick={() => setFilterOption("low")}
                rightIcon={<Badge color="orange">123</Badge>}
              >
                Low
              </Button>
              <Divider orientation="vertical" h={24} my={"auto"} />
              <Button
                color="red"
                fullWidth
                variant={filterOption === "very_low" ? "filled" : "white"}
                onClick={() => setFilterOption("very_low")}
                rightIcon={<Badge color="red">123</Badge>}
              >
                Very Low
              </Button>
              <Divider orientation="vertical" h={24} my={"auto"} />
              <Button
                color="gray"
                fullWidth
                variant={filterOption === "un" ? "filled" : "white"}
                onClick={() => setFilterOption("un")}
                rightIcon={<Badge color="gray">123</Badge>}
              >
                Unsevadf
              </Button>
            </div>
            <Box mt={"sm"}>
              <DataGrid
                data={filterData}
                highlightOnHover
                withPagination
                withSorting
                withColumnFilters
                withColumnBorders
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
                    accessorKey: "icp_score",
                    minSize: 160,
                    maxSize: 160,
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
                  {
                    accessorKey: "contact_name",
                    minSize: 200,
                    maxSize: 200,
                    header: () => (
                      <Flex align={"center"} gap={"3px"}>
                        <IconLetterT color="gray" size={"0.9rem"} />
                        <Text color="gray">Contact Name</Text>
                      </Flex>
                    ),

                    cell: (cell) => {
                      const { name } = cell.row.original;

                      return (
                        <Flex w={"100%"} px={"sm"} py={6} gap={"xs"} h={"100%"} align={"center"}>
                          <Avatar src={""} size={"sm"} radius={"xl"} />
                          <Text color="gray" size={"sm"} fw={500}>
                            {name}
                          </Text>
                        </Flex>
                      );
                    },
                  },
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
                    cell: (cell) => {
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
                    cell: (cell) => {
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
                    cell: (cell) => {
                      const { status } = cell.row.original;

                      return (
                        <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                          <Badge>{status}</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: "linkedin_url",
                    minSize: 160,
                    maxSize: 160,
                    header: () => (
                      <Flex align={"center"} gap={"3px"}>
                        <Icon123 color="gray" size={"0.9rem"} />
                        <Text color="gray">Linkedin URL</Text>
                      </Flex>
                    ),
                    cell: (cell) => {
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
                    height: "605px",
                  },

                  dataCellContent: {
                    width: "100%",
                  },
                })}
              />
            </Box>
          </Box>
        </Flex>
      </Paper>
    </Paper>
  );
}
