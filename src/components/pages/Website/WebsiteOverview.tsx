import {
  ActionIcon,
  Avatar,
  Box,
  Divider,
  Flex,
  Paper,
  Progress,
  Select,
  Text,
  TextInput,
  Badge,
  useMantineTheme,
  Button,
  Card,
  Group,
  Title,
} from "@mantine/core";
import {
  Icon123,
  IconBrandLinkedin,
  IconChevronLeft,
  IconChevronRight,
  IconLetterT,
  IconLoader,
  IconMail,
  IconPlus,
  IconSearch,
} from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { openContextModal } from "@mantine/modals";
import { IconUsersPlus } from "@tabler/icons-react";

type DeanonymizationType = {
  avatar: string;
  sdr_name: string;
  linkedin: boolean;
  email: boolean;
  job: string;
  company: string;
  visit_date: string;
  total_visit: number;
  icp_score: number;
  tag: string[];
};

export default function WebsiteOverview() {
  const theme = useMantineTheme();

  const [udPageSize, setUdPageSize] = useState("25");
  const [countryData, setCountryData] = useState([
    {
      country: "USA",
      label: "United States",
      value: 24586,
    },
    {
      country: "ERP",
      label: "Europe",
      value: 18421,
    },
    {
      country: "asia",
      label: "Asia",
      value: 16220,
    },
    {
      country: "brazil",
      label: "Brazil",
      value: 9842,
    },
    {
      country: "other",
      label: "Others >",
      value: 2144,
    },
  ]);

  const [deanonymData, setDeanonymData] = useState<DeanonymizationType[]>([
    {
      avatar: "",
      sdr_name: "Benn TK",
      linkedin: true,
      email: true,
      job: "VP of Engineering",
      company: "XYZ Technologies",
      visit_date: "June 15, 2024",
      total_visit: 12,
      icp_score: 1,
      tag: ["Potential Client"],
    },
    {
      avatar: "",
      sdr_name: "Benjamin K.",
      linkedin: true,
      email: false,
      job: "Product Manager",
      company: "ABC Communication",
      visit_date: "June 15, 2024",
      total_visit: 9,
      icp_score: 2,
      tag: ["Potential Invistor"],
    },
    {
      avatar: "",
      sdr_name: "Bryan Hank",
      linkedin: false,
      email: true,
      job: "CTO",
      company: "XYZ Pvt. Ltd.",
      visit_date: "June 15, 2024",
      total_visit: 4,
      icp_score: 3,
      tag: [],
    },
    {
      avatar: "",
      sdr_name: "Clark Mann",
      linkedin: true,
      email: true,
      job: "CTO",
      company: "ABC Infotech",
      visit_date: "June 15, 2024",
      total_visit: 9,
      icp_score: 5,
      tag: ["Potential Competitor"],
    },
    {
      avatar: "",
      sdr_name: "Anton Paul",
      linkedin: true,
      email: false,
      job: "CTO",
      company: "XYZ",
      visit_date: "June 15, 2024",
      total_visit: 12,
      icp_score: 4,
      tag: [],
    },
    {
      avatar: "",
      sdr_name: "Benjamin K.",
      linkedin: true,
      email: false,
      job: "Product Manager",
      company: "ABC Communication",
      visit_date: "June 15, 2024",
      total_visit: 9,
      icp_score: 5,
      tag: ["Potential Invistor"],
    },
  ]);

  const [filterData, setFilterData] = useState<DeanonymizationType[]>(
    deanonymData
  );

  const handleFilter = (key: string) => {
    let newData = deanonymData;
    newData = deanonymData.filter(
      (item) =>
        item.company.toLowerCase().includes(key) ||
        item.sdr_name.toLowerCase().includes(key) ||
        item.job.toLowerCase().includes(key)
    );
    setFilterData(newData);
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
    },
  };

  const data = {
    labels: [
      "09 Jun",
      "10 Jun",
      "11 Jun",
      "12 Jun",
      "13 Jun",
      "14 Jun",
      "15 Jun",
      "16 Jun",
      "17 Jun",
      "18 Jun",
    ],
    datasets: [
      {
        label: "Distinct Views",
        data: [250, 40, 401, 180, 60, 96, 73, 93, 40, 103, 150],
        fill: false,
        borderColor: "#3B85EF",
        backgroundColor: "#3B85EF",
        width: 4,
        borderDash: [5, 5],
      },
      {
        label: "Deanonomized Contact",
        data: [130, 20, 201, 90, 30, 48, 39, 50, 10, 42, 59],
        fill: false,
        borderColor: "#D444F1",
        backgroundColor: "#D444F1",
        width: 4,
        borderDash: [5, 5],
      },
    ],
  };

  const [selected, setSelected] = useState<any>({});

  return (
    <Box mt={"lg"}>
      <Paper withBorder radius={"sm"} p={"md"}>
        <Flex justify={"space-between"}>
          <Box w={"70%"}>
            <Text size={"xl"} fw={700}>
              Traffic Analysis
            </Text>
            <Text size={"sm"} color="gray" fw={400}>
              Track visitor numbers to better understand audience engagement.
            </Text>
            <Card h={300}>
              <Bar options={options} data={data} />
            </Card>
          </Box>
          <Paper withBorder radius={"sm"} p={"lg"} w={"30%"} bg={"#fcfcfd"}>
            <Flex align={"start"} justify={"space-between"}>
              <Box>
                <Text size={"xl"} fw={700}>
                  {71213}
                </Text>
                <Text color="gray" size={"xs"}>
                  Global view count
                </Text>
              </Box>
              <Select w={140} data={["This month", "This year", "This day"]} />
            </Flex>
            <Divider my={"md"} />
            <Flex direction={"column"} gap={"sm"}>
              {countryData
                .sort((a, b) => (a.value > b.value ? -1 : 1))
                .map((item, index) => {
                  return (
                    <Box>
                      <Flex align={"center"} justify={"space-between"}>
                        <Text size={"sm"} fw={500}>
                          {item.label}
                        </Text>
                        <Text size={"sm"} fw={500}>
                          {item.value}
                        </Text>
                      </Flex>
                      <Progress value={(item.value / 30000) * 100} mt={2} />
                    </Box>
                  );
                })}
            </Flex>
          </Paper>
        </Flex>
      </Paper>
      <Paper mt={"md"} p={"lg"} withBorder>
        <Flex align={"end"} justify={"space-between"}>
          <Box>
            <Text size={"lg"} fw={700}>
              Deanonymization Data
            </Text>
            <Text size={"sm"} color="gray" fw={400}>
              Re-identifying individuals from anonymized data.
            </Text>
          </Box>
          <Flex align={"center"} gap={"sm"}>
            {Object.keys(selected).length !== 0 && (
              <Button variant="outline" onClick={() => alert("Show Modal")}>
                Add Tag
              </Button>
            )}
            <Button
              leftIcon={<IconPlus size={"0.9rem"} />}
              onClick={() =>
                openContextModal({
                  modal: "createSegmentModal",
                  title: (
                    <Group position="apart">
                      <div>
                        <Title
                          order={3}
                          sx={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <IconUsersPlus
                            color="#228be6"
                            style={{ marginTop: "-5px" }}
                          />
                          Create Segment
                        </Title>
                      </div>
                    </Group>
                  ),
                  styles: {
                    content: {
                      minWidth: "750px",
                    },
                  },
                  innerProps: {},
                  centered: true,
                })
              }
            >
              Add 5 visitors to Segment
            </Button>
            <TextInput
              placeholder="Search contacts"
              w={240}
              rightSection={<IconSearch size={"0.9rem"} color="gray" />}
              onChange={(e) => handleFilter(e.target.value)}
            />
          </Flex>
        </Flex>
        <DataGrid
          data={filterData}
          highlightOnHover
          mt={"sm"}
          withPagination
          withSorting
          withColumnBorders
          withBorder
          withRowSelection
          onRowSelectionChange={setSelected}
          sx={{
            cursor: "pointer",
            "& tr": {
              background: "white",
            },
          }}
          columns={[
            {
              accessorKey: "visitor_name",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Visitor Name</Text>
                </Flex>
              ),
              maxSize: 210,
              cell: (cell) => {
                const {
                  sdr_name,
                  avatar,
                  job,
                  linkedin,
                  email,
                } = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                    <Flex align={"center"} gap={"sm"}>
                      <Avatar
                        src={avatar}
                        size={"md"}
                        radius={"xl"}
                        color={valueToColor(theme, sdr_name)}
                      >
                        {nameToInitials(sdr_name)}
                      </Avatar>
                      <Box>
                        <Flex gap={5} align={"center"}>
                          <Text fw={600} size={"sm"}>
                            {sdr_name}
                          </Text>
                          {linkedin && (
                            <IconBrandLinkedin
                              size={"1.2rem"}
                              fill="#228be6"
                              color="white"
                            />
                          )}
                          {email && (
                            <IconMail
                              size={"1.2rem"}
                              fill="#228be6"
                              color="white"
                            />
                          )}
                        </Flex>
                        <Text color="gray" size={"xs"} fw={600}>
                          {job}
                        </Text>
                      </Box>
                    </Flex>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "company",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Company</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { company } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} align={"center"}>
                    <Text lineClamp={1} fw={600}>
                      {company}
                    </Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "visit_date",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Date Visited</Text>
                </Flex>
              ),
              maxSize: 160,
              enableResizing: true,
              cell: (cell) => {
                const { visit_date } = cell.row.original;

                return (
                  <Flex
                    align={"center"}
                    gap={"xs"}
                    py={"sm"}
                    w={"100%"}
                    h={"100%"}
                  >
                    <Text fw={600}>{visit_date}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "total_visit",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <Flex>
                    <Icon123 color="gray" size={"1.2rem"} />
                  </Flex>
                  <Text color="gray">Total Visit</Text>
                </Flex>
              ),
              maxSize: 140,
              enableResizing: true,
              cell: (cell) => {
                const { total_visit } = cell.row.original;

                return (
                  <Flex
                    align={"center"}
                    gap={"xs"}
                    py={"sm"}
                    w={"100%"}
                    h={"100%"}
                  >
                    <Text fw={600}>{total_visit}</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "icp_score",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLoader color="gray" size={"0.9rem"} />
                  <Text color="gray">ICP Score</Text>
                </Flex>
              ),
              maxSize: 160,
              enableResizing: true,
              cell: (cell) => {
                const { icp_score } = cell.row.original;

                return (
                  <Flex
                    align={"center"}
                    gap={"xs"}
                    py={"sm"}
                    w={"100%"}
                    h={"100%"}
                  >
                    <Badge
                      color={
                        icp_score == 0
                          ? "red"
                          : icp_score == 1
                          ? "orange"
                          : icp_score == 2
                          ? "yellow"
                          : icp_score == 3
                          ? "green"
                          : icp_score == 4
                          ? "blue"
                          : "gray"
                      }
                      variant="light"
                    >
                      {icp_score == 0
                        ? "Very Low"
                        : icp_score == 1
                        ? "Low"
                        : icp_score == 2
                        ? "Medium"
                        : icp_score == 3
                        ? "High"
                        : icp_score == 4
                        ? "Very High"
                        : "Not Scored"}
                    </Badge>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "tag",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLoader color="gray" size={"0.9rem"} />
                  <Text color="gray">Tag</Text>
                </Flex>
              ),
              enableResizing: true,
              maxSize: 120,
              cell: (cell) => {
                const { tag } = cell.row.original as any[""];

                return (
                  <Flex
                    align={"center"}
                    gap={"xs"}
                    py={"sm"}
                    w={"100%"}
                    h={"100%"}
                  >
                    <Flex gap={"sm"}>
                      {tag.length > 0 ? (
                        tag.map((item: any, index: number) => {
                          return (
                            <Badge key={index} tt={"initial"}>
                              {item}
                            </Badge>
                          );
                        })
                      ) : (
                        <Button
                          size="xs"
                          radius={"xl"}
                          variant="outline"
                          leftIcon={<IconPlus size={"0.9rem"} />}
                        >
                          Add
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                );
              },
            },
          ]}
          options={{
            enableFilters: true,
          }}
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
                  value={udPageSize}
                  onChange={(v) => {
                    setUdPageSize(v ?? "25");
                  }}
                />

                <Flex align={"center"} gap={"sm"}>
                  <Flex align={"center"}>
                    <Select
                      maw={100}
                      value={`${table.getState().pagination.pageIndex + 1}`}
                      data={new Array(table.getPageCount())
                        .fill(0)
                        .map((i, idx) => ({
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
                        table.setPageIndex(
                          table.getState().pagination.pageIndex - 1
                        );
                      }}
                    >
                      <IconChevronLeft stroke={theme.colors.gray[4]} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      color="gray.4"
                      h={36}
                      disabled={
                        table.getState().pagination.pageIndex ===
                        table.getPageCount() - 1
                      }
                      onClick={() => {
                        table.setPageIndex(
                          table.getState().pagination.pageIndex + 1
                        );
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
          pageSizes={[udPageSize]}
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
            td: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
          })}
        />
      </Paper>
    </Box>
  );
}
