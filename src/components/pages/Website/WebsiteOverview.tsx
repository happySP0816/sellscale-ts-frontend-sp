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
  Loader,
} from "@mantine/core";
import { Icon123, IconBrandLinkedin, IconChevronLeft, IconChevronRight, IconLetterT, IconLoader, IconMail, IconPlus, IconSearch } from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { openContextModal } from "@mantine/modals";
import { IconProgress, IconUsersPlus } from "@tabler/icons-react";
import { useTrackApi } from "@common/settings/Traffic/WebTrafficRoutingApi";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import moment from "moment";
import { deterministicMantineColor } from "@utils/requests/utils";
import { showNotification } from "@mantine/notifications";

type DeanonymizationType = {
  avatar: string;
  sdr_name: string;
  linkedin: boolean;
  email: boolean;
  job: string;
  company: string;
  visit_date: string;
  total_visit: number;
  intent_score: string;
  tag: string;
};

export default function WebsiteOverview() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [dateRange, setDateRange] = useState("14");
  const [loading, setLoading] = useState(false);
  const [trackHistory, setTrackHistory] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const {
    isLoading,
    getTrackSourceMetadata,
    getScript,
    verifySource,
    getMostRecentTrackEvent,
    getTrackEventHistory,
    getDeanonomizedContacts,
    createIcpRoute,
    updateIcpRoute,
    getAllIcpRoutes,
    autoClassifyDeanonymizedContacts,
  } = useTrackApi(userToken);

  const [udPageSize, setUdPageSize] = useState("25");
  // const [countryData, setCountryData] = useState([
  //   {
  //     country: "USA",
  //     label: "United States",
  //     value: 24586,
  //   },
  // ]);

  const [deanonymData, setDeanonymData]: any = useState<DeanonymizationType[]>([
    // {
    //   avatar: "",
    //   sdr_name: "Benn TK",
    //   linkedin: true,
    //   email: true,
    //   job: "VP of Engineering",
    //   company: "XYZ Technologies",
    //   visit_date: "June 15, 2024",
    //   total_visit: 12,
    //   icp_score: 1,
    //   tag: ["Potential Client"],
    // },
  ]);

  const handleGetTrackHistory = async () => {
    setLoading(true);
    const data = await getTrackEventHistory(parseInt(dateRange));
    setTrackHistory(data.traffic);
    setLocations(data.locations);

    setLoading(false);
  };

  const handleGetDeanonymizedContacts = async () => {
    setLoading(true);
    const data = await getDeanonomizedContacts(parseInt(dateRange));
    console.log("SWAG");
    console.log(data);
    setDeanonymData(data ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    handleGetTrackHistory();
    handleGetDeanonymizedContacts();
  }, [userToken, dateRange]);

  const maxDeanonymizedVisits = Math.max(...trackHistory?.map((x) => x.distinct_deanonymized_visits), 0) + 5;

  const data = {
    labels: trackHistory?.map((x) => moment(x.label).format("MMM D YYYY")).reverse(),
    datasets: [
      {
        label: "Distinct Views",
        data: trackHistory?.map((x) => x.distinct_visits).reverse(),
        fill: false,
        borderColor: "#3B85EF",
        backgroundColor: "#3B85EF",
        width: 4,
        borderDash: [5, 5],
        yAxisID: "y",
      },
      {
        label: "Deanonomized Contact",
        data: trackHistory?.map((x) => x.distinct_deanonymized_visits).reverse(),
        fill: false,
        borderColor: "#D444F1",
        backgroundColor: "#D444F1",
        width: 4,
        borderDash: [5, 5],
        yAxisID: "y",
      },
    ],
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
        stacked: true,
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        stacked: true,
        type: "linear",
        position: "left",
      },
      y1: {
        stacked: true,
        type: "linear",
        position: "right",
        max: maxDeanonymizedVisits,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const [selected, setSelected] = useState<any>({});

  let filteredData = deanonymData.filter((item: any) => {
    return item.sdr_name.toLowerCase().includes(searchQuery.toLowerCase()) || item.company.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box mt={"lg"}>
      <Paper withBorder radius={"sm"} p={"md"}>
        <Flex justify={"space-between"}>
          <Box w={"70%"}>
            <Flex justify={"space-between"} align={"sm"}>
              <Box>
                <Flex>
                  <Text size={"xl"} fw={700}>
                    Traffic Analysis
                  </Text>
                  {loading && <Loader size="sm" ml="md" variant="dots" />}
                </Flex>
                <Text size={"sm"} color="gray" fw={400}>
                  Track visitor numbers to better understand audience engagement.
                </Text>
              </Box>
              <Badge
                styles={{
                  inner: {
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  },
                }}
              >
                <IconProgress size={"0.8rem"} />
                {11}% deanoymized
              </Badge>
            </Flex>
            <Card h={300}>
              <Bar options={options} data={data} />
            </Card>
          </Box>
          <Paper withBorder radius={"sm"} p={"lg"} w={"30%"} bg={"#fcfcfd"}>
            <Flex align={"start"} justify={"space-between"}>
              <Box>
                <Text size={"xl"} fw={700}>
                  {data.datasets[0].data.reduce((acc, value) => acc + value, 0)}
                </Text>
                <Text color="gray" size={"xs"}>
                  Global view count
                </Text>
              </Box>
              <Select
                w={140}
                defaultValue={dateRange}
                onChange={(v: any) => setDateRange(v)}
                data={[
                  { label: "7 days", value: "7" },
                  { label: "14 days", value: "14" },
                  { label: "30 days", value: "30" },
                  { label: "60 days", value: "60" },
                  { label: "90 days", value: "90" },
                  { label: "All Time", value: "10000" },
                ]}
              />
            </Flex>
            <Divider my={"md"} />
            <Flex direction={"column"} gap={"sm"}>
              {locations.map((item, index) => {
                return (
                  <Box>
                    <Flex align={"center"} justify={"space-between"}>
                      <Flex>
                        <Text size={"sm"} fw={500}>
                          {item.location.split(",")[0]}, {item.location.split(",")[1]}
                        </Text>
                        <Text size={"xs"} fw={500} color="gray" ml="4px" mt="2px">
                          {item.location.split(",")[2]}
                        </Text>
                      </Flex>
                      <Text size={"sm"} fw={500}>
                        {item.distinct_deanonymized_visits}
                      </Text>
                    </Flex>
                    <Progress
                      value={(item.distinct_deanonymized_visits / locations.reduce((acc, item) => acc + item.distinct_deanonymized_visits, 1)) * 100}
                      mt={2}
                    />
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
            {Object.keys(selected)?.length !== 0 && (
              <Button variant="outline" onClick={() => alert("Show Modal")}>
                Add Tag
              </Button>
            )}
            {/* <Button
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
            </Button> */}
            {Object.keys(selected)?.length !== 0 && (
              <Button
                onClick={() => {
                  const selectedContacts = Object.keys(selected).map((index: any) => deanonymData[index].id);
                  autoClassifyDeanonymizedContacts(selectedContacts);
                  showNotification({
                    title: "Classifying...",
                    message: "Contacts are being classified. Please refresh to see the changes.",
                    color: "teal",
                  });
                }}
              >
                Classify {Object.keys(selected).length} Visitors
              </Button>
            )}
            <Button color="gray" onClick={handleGetDeanonymizedContacts} loading={loading}>
              Refresh
            </Button>
            <TextInput
              placeholder="Search contacts"
              w={240}
              rightSection={<IconSearch size={"0.9rem"} color="gray" />}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelected({});
              }}
            />
          </Flex>
        </Flex>
        <DataGrid
          data={filteredData}
          highlightOnHover
          mt={"sm"}
          // withPagination
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
              minSize: 210,
              cell: (cell) => {
                const { sdr_name, avatar, job, linkedin, email }: any = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                    <Flex align={"center"} gap={"sm"}>
                      <Avatar src={avatar} size={"md"} radius={"xl"} color={valueToColor(theme, sdr_name)}>
                        {nameToInitials(sdr_name)}
                      </Avatar>
                      <Box>
                        <Flex gap={5} align={"center"}>
                          <Text fw={500} size={"sm"}>
                            {sdr_name}
                          </Text>
                          {linkedin && <IconBrandLinkedin size={"1.2rem"} fill="#228be6" color="white" />}
                          {email && <IconMail size={"1.2rem"} fill="#228be6" color="white" />}
                        </Flex>
                        <Text color="gray" size={"xs"} fw={500}>
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
              maxSize: 300,
              cell: (cell) => {
                const { company } = cell.row.original;

                return (
                  <Flex w={"100%"} h={"100%"} align={"center"}>
                    <Text lineClamp={1} fw={500}>
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
                  <Text color="gray">Last Visit</Text>
                </Flex>
              ),
              maxSize: 160,
              enableResizing: true,
              cell: (cell) => {
                const { visit_date } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Text fw={500}>{moment(visit_date).format("MMMM Do YYYY")}</Text>
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
                  <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Text fw={500}>{total_visit} visits</Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "intent_score",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLoader color="gray" size={"0.9rem"} />
                  <Text color="gray">Intent Score</Text>
                </Flex>
              ),
              maxSize: 160,
              enableResizing: true,
              cell: (cell) => {
                const { intent_score } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Badge color={intent_score == "MEDIUM" ? "yellow" : intent_score == "HIGH" ? "blue" : "green"}>{intent_score}</Badge>
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
              minSize: 120,
              cell: (cell) => {
                const { tag } = cell.row.original as any[""];

                return (
                  <Flex align={"center"} gap={"xs"} py={"sm"} w={"100%"} h={"100%"}>
                    <Flex gap={"sm"}>
                      {tag ? (
                        <Badge key={tag} tt={"initial"} size="md" color={deterministicMantineColor(tag)}>
                          {tag}
                        </Badge>
                      ) : (
                        <Button size="xs" radius={"xl"} variant="outline" leftIcon={<IconPlus size={"0.9rem"} />}>
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
