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
  ScrollArea,
  Table,
  Popover,
} from "@mantine/core";
import {
  Icon123,
  IconBrandLinkedin,
  IconChevronLeft,
  IconChevronRight,
  IconCirclePlus,
  IconClock,
  IconFile,
  IconLetterT,
  IconLoader,
  IconMail,
  IconPlus,
  IconPoint,
  IconSearch,
} from "@tabler/icons";
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

export default function WebsiteOverview(props: any) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [dateRange, setDateRange] = useState("14");
  const [loading, setLoading] = useState(false);
  const [trackHistory, setTrackHistory] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [webVisits, setWebVisits] = useState<any[]>([]);

  const fetchWebVisits = async () => {
    setLoading(true);
    try {
      const webVisits = await getWebVisits(userToken);
      console.log('data', webVisits);
      setWebVisits(webVisits);
    } catch (error) {
      console.error("Error fetching ICP routes:", error);
    }
    setLoading(false
    );
  }

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
    getWebVisits,
    autoClassifyDeanonymizedContacts,
  } = useTrackApi(userToken);

  const [udPageSize, setUdPageSize] = useState("3");

  const [routes, setRoutes] = useState<any>();

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
    const icpRoutes = await getAllIcpRoutes();
    console.log("SWAG");
    console.log(data);
    console.log(icpRoutes);
    setRoutes(icpRoutes);
    setDeanonymData(data ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    handleGetTrackHistory();
    handleGetDeanonymizedContacts();
    fetchWebVisits();
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

  console.log("-------", deanonymData);

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
      <Flex justify={"space-between"} align={"center"}>
        <Text size={"md"} fw={600}>
          Bucketed Contacts
        </Text>
        <Select
          w={200}
          defaultValue={"dummy1"}
          onChange={(v: any) => console.log(v)}
          data={[
            { label: "Dummy Data 1", value: "dummy1" },
            { label: "Dummy Data 2", value: "dummy2" },
            { label: "Dummy Data 3", value: "dummy3" },
          ]}
        />
      </Flex>
    <ScrollArea style={{ height: "40vh" }}>
      <Table mt={"md"} withBorder withColumnBorders style={{ height: "400px", overflowY: "auto" }}>
        <thead>
          <tr>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Name</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Company</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Title</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray"># Visits</Text>
              </Flex>
            </th>
            <th style={{ maxWidth: "300px" }}>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Visited Page</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Last Visit</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Routed Segment</Text>
              </Flex>
            </th>
           
          </tr>
        </thead>
        <tbody>
          {webVisits.map((prospect) => (
            <tr key={prospect.id}>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Avatar radius="xl" src={prospect.img_url} alt={prospect.full_name} size="md" mr="sm" />
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {prospect.full_name}
                    </Text>
                  </Box>
                <ActionIcon
                  component="a"
                  href={prospect.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn Profile"
                >
                  <IconBrandLinkedin size={16} color="#0077B5" />
                </ActionIcon>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {prospect.company}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {prospect.title}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {prospect.window_locations.length}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex style={{ maxWidth: "300px" }} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {prospect.window_locations.map((location: any) => (
                        <Popover position="top" withArrow shadow="md">
                          <Popover.Target>
                            <Badge size="sm" color="blue" variant="light" key={location}>
                              {location.length > 40 ? `${location.slice(0, 37)}...` : location}
                            </Badge>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Text size="sm">{location}</Text>
                          </Popover.Dropdown>
                        </Popover>
                      ))}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {new Date(prospect.most_recent_visit).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Badge size="sm" color={prospect.segment_name ? "green" : "gray"} variant="light">
                      {prospect.segment_name || "No Segment"}
                    </Badge>
                  </Box>
                </Flex>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea>
       </Paper>
    </Box>
  );
}
