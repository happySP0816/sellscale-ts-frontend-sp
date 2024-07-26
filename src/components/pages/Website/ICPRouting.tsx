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
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconBell,
  IconBrandLinkedin,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconLetterT,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconToggleRight,
  IconTrash,
} from "@tabler/icons";
import { on } from "events";
import { DataGrid } from "mantine-data-grid";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function ICPRouting() {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [acPageSize, setAcPageSize] = useState("25");

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
  } = useTrackApi(userToken);

  const fetchData = async () => {
    setLoading(true);
    try {
      const icpRoutes = await getAllIcpRoutes();
      const formattedData = icpRoutes.map((route: UpdateIcpRouteData) => ({
        icpRouteTitle: route.title,
        description: route.description,
        id: route.id,
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
    most_recent_visit: string;
    segment_name?: string;
  };

  const [webVisits, setWebVisits] = useState<WebVisit[]>([]);

  return (
    <div style={{ overflowY: "hidden" }}>
    <Flex justify={"space-between"}>
        <Box mt="sm">
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
                <Text color="gray"># Visits</Text>
              </Flex>
            </th>
            <th>
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
                      {prospect.num_visits}
                    </Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Text size={"sm"} fw={500}>
                      {prospect.window_locations.map((location) => (
                        <Badge size="sm" color="blue" variant="light" key={location}>
                          {location}
                        </Badge>
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
    <Flex justify={"space-between"}>
        <Box mt="sm">
          <Text size={"md"} fw={600}>
            Buckets
          </Text>
          <Text size={"xs"} color="gray" fw={400}>
            Define how your visitors are bucketed
          </Text>
        </Box>
        <Button
          mt="sm"
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
                    <Text size={"sm"}>{row.icpRouteId}</Text>
                  </Box>
                </Flex>
              </td>
              <td>
                <Flex w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"start"}>
                  <Box>
                    <Badge color={row.ai_mode === true ? "blue" : "green"} variant="filled">
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
                            <Text mb="sm" mt="sm">{'"'}{rule.value}{'"'}</Text>
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
                    color="yellow"
                    variant="light"
                    leftIcon={<IconPencil color="orange" size={"1rem"} />}
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
    </div>
  );
}
