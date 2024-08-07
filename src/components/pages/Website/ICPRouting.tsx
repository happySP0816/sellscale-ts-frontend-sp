import { userTokenState } from "@atoms/userAtoms";
import {
  IcpRouteData,
  UpdateIcpRouteData,
  useTrackApi,
} from "@common/settings/Traffic/WebTrafficRoutingApi";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Title,
  Flex,
  Paper,
  Select,
  Switch,
  Text,
  useMantineTheme,
  Checkbox,
  Table,
  ScrollArea,
  Avatar,
  Popover,
  Modal,
  TextInput,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconBell,
  IconBrandLinkedin,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconFilter,
  IconLetterT,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconToggleRight,
  IconTrash,
} from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { on } from "events";
import { DataGrid } from "mantine-data-grid";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function ICPRouting() {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");
  const [showTextBucketModal, setShowTextBucketModal] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [visitedPage, setVisitedPage] = useState("");
  type IcpRoute = {
    active: boolean;
    ai_mode: boolean;
    description: string;
    filter_company: string;
    filter_company_size: string;
    filter_location: string;
    filter_title: string;
    id: number;
    rules: any[];
    segment_id: number | null;
    send_slack: boolean;
    title: string;
  };

  type Prospect = {
    company_location: string;
    company_name: string;
    company_url: string;
    connections_count: number;
    education_1: string;
    education_2: string;
    employee_count: string;
    first_name: string;
    followers_count: number;
    full_name: string;
    industry: string;
    last_name: string;
    linkedin_bio: string | null;
    linkedin_url: string;
    location: string;
    position_groups: any[];
    profile_picture: string;
    prospect_location: string;
    skills: string[];
    title: string;
    twitter_url: string | null;
  };

  type SimulationData = {
    icp_route: IcpRoute;
    met_conditions: string[];
    prospect: Prospect;
  };

  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  

  const {
    updateIcpRoute,
    getAllIcpRoutes,
    getWebVisits,
  } = useTrackApi(userToken);

  const fetchData = async () => {
    setLoading(true);
    try {
      const icpRoutes = await getAllIcpRoutes();
      const formattedData = icpRoutes.map((route: UpdateIcpRouteData) => ({
        icpRouteTitle: route.title,
        description: route.description,
        id: route.id,
        count: route.count,
        ai_mode: route.ai_mode,
        rules: route.rules,
        routeTo: route.segment_id ? `${route.segment_title} ✅` : "no segment connected",
        send_slack: route.send_slack,
        status: route.active,
        icpRouteId: route.id,
      }));
      console.log('data', formattedData);
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching ICP routes:", error);
    }
    setLoading(false);
  };

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

  const simulateLinkedInBucketing = async (linkedInUrl: string, visited_page?: string) => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/track/simulate_linkedin_bucketing`);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ linkedin_url: linkedInUrl, visited_page  }),
      });
      const data = await response.json();
      console.log('data', data);
      if (data.met_conditions.length === 0) {
        showNotification({
          title: "No Rules Met",
          message: "Could not find a bucket for this visitor",
          color: "red",
          icon: <IconCircleX />,
        });
        setLoading(false);
        return;
      }

      setSimulationData(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching ICP routes:", error);
      showNotification({
        title: "No Rules Met",
        message: "Could not find a bucket for this visitor",
        color: "red",
        icon: <IconCircleX />,
      });
    }
    setLoading(false);
  }


  useEffect(() => {
    fetchData();
    fetchWebVisits();
  }, [userToken]);

  const [data, setData]: [IcpRouteData[], any] = useState([]);
  type WebVisit = {
    id: string;
    full_name: string;
    img_url: string;
    linkedin_url: string;
    num_visits: number;
    window_locations: string[];
    title: string;
    company: string;
    most_recent_visit: string;
    segment_name?: string;
  };

  const [webVisits, setWebVisits] = useState<WebVisit[]>([]);
  const [showResults, setShowResults] = useState(false);

  return (
    <div style={{ overflowY: "hidden" }}>
      {showTextBucketModal && (
        <Modal opened={showTextBucketModal} onClose={() => {setShowTextBucketModal(false); setSimulationData(null); setShowResults(false)}} size="lg">
          <Paper style={{ padding: "md" }}>
            <Box mb="md">
              <Title order={4}>Simulate Visitor Bucketing</Title>
              <Text size="sm" color="gray">
                Enter a LinkedIn URL to simulate how a visitor would be bucketed based on their profile.
              </Text>
            </Box>
            <TextInput
              label="LinkedIn URL"
              placeholder="https://www.linkedin.com/in/username"
              onChange={(event) => setLinkedInUrl(event.currentTarget.value)}
              error={linkedInUrl && !linkedInUrl.includes("linkedin.com") ? "Invalid LinkedIn URL" : null}
              autoComplete="off"
            />
            <TextInput
              label="Simulate page visited"
              placeholder="/home"
              onChange={(event) => setVisitedPage(event.currentTarget.value)}
              autoComplete="off"
            />
            <Button
              loading={loading}
              color="grape"
              fullWidth
              mt="md"
              onClick={() => {setSimulationData(null); setShowResults(false); simulateLinkedInBucketing(linkedInUrl, visitedPage)}}
            >
              Simulate
            </Button>
            {showResults && (
              <>
                <Box mb="md" mt="md">
                  <Flex direction="column" align="flex-start" justify="center" gap="sm">
                    <Title order={4}>Rule Set: {simulationData?.icp_route?.title} ✅</Title>
                    <Text size="sm" color="gray">{simulationData?.icp_route?.description}</Text>
                    {/* <Button variant="outline" size="sm">Example Prospect</Button> */}
                  </Flex>
                  <Flex align="center" mt="sm">
                    <Avatar src={simulationData?.prospect.profile_picture} radius="xl" size="md" mr="sm" />
                    <Box>
                      <Text size="sm" fw={500}>{simulationData?.prospect.full_name}</Text>
                      <Text size="xs" color="gray">{simulationData?.prospect?.title}</Text>
                    </Box>
                  </Flex>
                </Box>
               {simulationData?.icp_route?.ai_mode === false && <>
                {simulationData?.met_conditions?.map((condition: any, index) => (
                  <Box mb="md" key={index}>
                    <Text size="sm" color="gray">Condition Met:</Text>
                    {typeof condition === 'string' ? (
                      <>
                        <TextInput value={condition} disabled mt="xs" />
                        <Text size="sm" mt="xs" color="green">condition</Text>
                      </>
                    ) : (
                      <>
                        <TextInput value={condition.condition} disabled mt="xs" />
                        <Box mt="xs">
                          {condition.value ? (
                            <>
                              <Text size="sm" color="gray" mt="xs">Value:</Text>
                              <Flex align="center" gap="xs" mt="xs">
                                <TextInput value={condition.value} disabled />
                                <IconCheck size={16} color="green" />
                              </Flex>
                            </>
                          ) : condition.company_breadcrumbs ? (
                            <>
                              <Text size="sm" color="gray" mt="xs">Company Breadcrumbs:</Text>
                              <Flex align="center" gap="xs" mt="xs">
                                <TextInput value={condition.company_breadcrumbs} disabled />
                                <IconCheck size={16} color="green" />
                              </Flex>
                            </>
                          ) : <></>}
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
                <Box mt="md">
                  {/* <Button color="grape" fullWidth>
                    <Flex align="center" gap="xs">
                      <IconBrandLinkedin size={16} />
                      <Text size="sm">Slack notification sent!</Text>
                    </Flex>
                  </Button> */}
                </Box>
                </>}
              </>
            )}
          </Paper>
        </Modal>
        
      )}
    <Flex justify={"space-between"}>
        <Box mt="sm">
          <Text size={"md"} fw={600}>
            Buckets
          </Text>
          <Text size={"xs"} color="gray" fw={400}>
            Define how your visitors are bucketed
          </Text>
        </Box>
        <Flex gap="sm" mt="sm">
          <Button
            leftIcon={<IconPlus size={"1rem"} />}
            onClick={() =>
              openContextModal({
                modal: "createICProutingModal",
                title: (
                  <Flex>
                    <Title order={3}>Create ICP Routing</Title>
                  </Flex>
                ),
                innerProps: {
                  onClose: () => {
                    fetchData();
                  },
                },
                styles: {
                  content: {
                    minWidth: "700px",
                  },
                },
              })
            }
          >
            Create Visitor Bucket
          </Button>
          <Button
            leftIcon={<IconSparkles size={"1rem"} />}
            color="grape"
            onClick={() => {
              setShowTextBucketModal(true);
            }}
          >
            Simulate Bucketing
          </Button>
        </Flex>
      </Flex>
    <ScrollArea style={{ height: "40vh" }}>
    <Paper withBorder radius={"sm"} p={"md"} mt={"md"} style={{ height: "50%", overflowY: "auto" }}>
      <Table mt={"md"} withBorder withColumnBorders>
        <thead>
          <tr>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Name</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray"># Caught</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Mode</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Filter</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Slack Alerts</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Target Segment</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Action</Text>
              </Flex>
            </th>
            <th>
              <Flex align={"center"} gap={"3px"}>
                <Text color="gray">Active</Text>
              </Flex>
              
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.icpRouteId}>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {row.icpRouteTitle}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"}>{row.count}</Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Badge color={row.ai_mode === true ? "grape" : "green"} variant="filled">
                      {row.ai_mode === true ? "AI Mode" : "Rule Mode"}
                    </Badge>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    {row.ai_mode ? (
                      <Text>{row.description}</Text>
                    ) : (
                      <Box>
                        {row.rules?.map((rule: { condition: string; value: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }, index: Key | null | undefined) => (
                          <Flex key={index} align="center" gap="xs">
                            <Badge mb="sm" mt="sm" color="teal" variant="light">
                              {rule.condition.replace(/_/g, " ")}
                            </Badge>
                            {rule.condition === "filter_matches" ? (
                              <Flex align="center" gap="xs">
                                <Badge mb="sm" mt="sm" color="grape" variant="light" rightSection={
                                  <ActionIcon
                                    onClick={() => {
                                      openContextModal({
                                        modal: "prefilterEditModal",
                                        title: (
                                          <Title order={3} className="flex items-center gap-2">
                                            <IconFilter size={"1.5rem"} color="#228be6" /> Edit Pre-Filter
                                          </Title>
                                        ),
                                        innerProps: { isIcpFilter: true, id: rule.value },
                                        centered: true,
                                        styles: {
                                          content: {
                                            minWidth: "80%",
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    <IconPencil color='purple' size={16} />
                                  </ActionIcon>
                                }>
                                  {'FILTER'}
                                </Badge>
                              </Flex>
                            ) : (
                              <Text mb="sm" mt="sm">{'"'}{rule.value}{'"'}</Text>
                            )}
                          </Flex>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    <Checkbox
                      checked={row.send_slack || false}
                      onChange={() => {
                        updateIcpRoute(row.icpRouteId || -1, {
                          send_slack: !row.send_slack,
                        });
                        row.send_slack = !row.send_slack;
                      }}
                    />
                  </Flex>
                </Flex>
              </td>
              <td>
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    <Badge
                      mr="md"
                      ml="md"
                      sx={{
                        backgroundColor: row.routeTo?.includes("no segment") ? "#d3d3d3" : "#90ee90",
                        color: row.routeTo?.includes("no segment") ? "#ffffff" : "#006400",
                        padding: "10px 12px",
                        whiteSpace: 'pre-wrap',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      {row.routeTo?.replace(/###/g, "\n") || "No Route"}
                    </Badge>
                  </Flex>
                </Flex>
              </td>
              <td>
                <Flex align={"center"} justify={"center"} h={"100%"}>
                  <Button
                    size="xs"
                    radius={"xl"}
                    color="green"
                    variant="light"
                    leftIcon={<IconPencil color="green" size={"1rem"} />}
                    onClick={() => {
                      openContextModal({
                        modal: "createICProutingModal",
                        title: (
                          <Flex>
                            <Title order={3}>Edit ICP Routing</Title>
                          </Flex>
                        ),
                        innerProps: {
                          onClose: () => {
                            fetchData();
                          },
                          icpRouteId: row.icpRouteId,
                        },
                        styles: {
                          content: {
                            minWidth: "700px",
                          },
                        },
                      });
                    }}
                  >
                    Edit
                  </Button>
                </Flex>
              </td>
              <td>
                <Flex align={"center"} justify={"center"} gap={"xs"} py={"lg"} w={"100%"} h={"100%"}>
                  <Flex justify={"center"} w={"100%"} align={"center"} gap={"md"}>
                    <Switch
                      defaultChecked={row.status || false}
                      onClick={() => {
                        updateIcpRoute(row.icpRouteId || -1, {
                          active: !row.status,
                        });
                        row.status = !row.status;
                      }}
                    ></Switch>
                  <Button
                    size="xs"
                    radius={"xl"}
                    color="red"
                    variant="light"
                    leftIcon={<IconTrash color="red" size={"1rem"} />}
                    onClick={ () => {
                        const url = new URL(`${API_URL}/track/delete_icp_route/${row.id}`);
                        fetch(url.toString(), {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${userToken}`,
                          },
                        });
                      setData((prevData: any[]) => prevData.filter((route) => route.icpRouteId !== row.icpRouteId));
                      }
                    }
                  >
                    Delete
                  </Button>
                  </Flex>
                </Flex>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Paper>
    </ScrollArea>
    <Flex justify={"space-between"}>
        <Box >
          <Text size={"md"} fw={600}>
            Web Visits
          </Text>
        </Box>
      </Flex>
    <ScrollArea style={{ height: "40vh" }}>
    <Paper withBorder radius={"sm"} p={"md"} mt={"md"} style={{ height: "40%" }}>
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
                      {prospect.window_locations.map((location) => (
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
    </Paper>
    </ScrollArea>
    </div>
  );
}
