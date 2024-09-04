import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Box,
  Flex,
  Popover,
  Text,
  Badge,
  ScrollArea,
  Avatar,
  Divider,
  ActionIcon,
  Collapse,
  Progress,
  Switch,
  Select,
  Button,
  useMantineTheme,
  Paper,
  Card,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  IconBolt,
  IconBrandLinkedin,
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconExternalLink,
  IconInfoCircle,
  IconLetterT,
  IconLoader,
  IconMail,
  IconPoint,
  IconTargetArrow,
  IconToggleRight,
  IconUserCircle,
} from "@tabler/icons";
import { IconInfoTriangle } from "@tabler/icons-react";
import { nameToInitials, valueToColor } from "@utils/general";
import { deactivatePersona } from "@utils/requests/postPersonaDeactivation";
import axios from "axios";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { useRecoilValue } from "recoil";

interface outboundType {
  message_active: number;
  message_total: number;
  seat_active: number;
  seat_total: number;
}

interface activeCampaignType {
  campaign: string;
  email_active: boolean;
  linkedin_active: boolean;
  num_total: number;
  num_total_email: number;
  num_total_linkedin: number;
  num_used_email: number;
  num_used_linkedin: number;
  num_used_total: number;
  rep: string;
  rep_profile_picture: string;
  status: string;
  persona_id: number;
  rep_id: number;
}

interface repCampaignType {
  campaign: string;
  num_open_tasks: number;
  open_task_ids: [];
  open_task_titles: [];
  rep: string;
  rep_profile_picture: string;
  status: string;
}

interface aiCampaignType {
  campaign: string;
  email_setup: string;
  linkedin_setup: string;
  prospects: string;
  rep: string;
  rep_profile_picture: string;
  status: string;
}

interface noCampaignType {
  campaign: string;
  recommended_segments: [];
  rep: string;
  rep_profile_picture: string;
  status: string;
}

interface completedCampaignType {
  campaign: string;
  email_active: boolean;
  linkedin_active: boolean;
  num_total: number;
  num_total_email: number;
  num_total_linkedin: number;
  num_used_email: number;
  num_used_linkedin: number;
  num_used_total: number;
  rep: string;
  rep_profile_picture: string;
  status: string;
}

interface seatDataType {
  num_campaigns: number;
  rep: string;
  rep_image: string;
}

export default function CampaignUtilization() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const userId = userData?.id;
  const repName = userData?.sdr_name;

  const [seatData, setSeatData] = useState<seatDataType[]>([]);
  const [outboundData, setOutboundData] = useState<outboundType>();

  const [activeCampaign, setActiveCampaign] = useState<activeCampaignType[]>(
    []
  );

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);

  const [campaignUsedData, setCampaignUsedData] = useState([]);
  const [campaignUnusedData, setCampaignUnusedData] = useState([]);

  const seat_data = {
    labels: ["Label 1", "Label 2"],
    datasets: [
      {
        data: [
          Math.min(
            100,
            Math.floor(
              ((outboundData?.seat_active || 0) /
                (outboundData?.seat_total || 1)) *
                100
            )
          ),
          100 -
            Math.min(
              100,
              Math.floor(
                ((outboundData?.seat_active || 0) /
                  (outboundData?.seat_total || 1)) *
                  100
              )
            ),
        ],
        backgroundColor: ["#3b84ef", "#eaecf0"],
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };
  const message_data = {
    labels: ["Label 1", "Label 2"],
    datasets: [
      {
        data: [
          Math.min(
            100,
            Math.floor(
              ((outboundData?.message_active || 0) /
                (outboundData?.message_total || 1)) *
                100
            )
          ),
          100 -
            Math.min(
              100,
              Math.floor(
                ((outboundData?.message_active || 0) /
                  (outboundData?.message_total || 1)) *
                  100
              )
            ),
        ],
        backgroundColor: ["#d444f1", "#eaecf0"],
        borderWidth: 0,
        borderRadius: 1,
      },
    ],
  };

  const piechartOptions = {
    rotation: 270,
    circumference: 180,
    cutout: `80%`,
    rounded: "10px",
    plugins: {
      legend: {
        display: false,
      },
      doughnutCutout: false,
    },
  };

  const handleDeactive = async (projectId: number) => {
    if (!projectId) {
      showNotification({
        title: "Error",
        message: "No current project",
        color: "red",
      });
      return;
    }
    setLoading(true);
    const result = await deactivatePersona(userToken, projectId, false);
    if (result.status === "success") {
      showNotification({
        title: "Persona Deactivated",
        message: "Your persona has been deactivated.",
        color: "blue",
      });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error deactivating your persona.",
        color: "red",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchUtilizationData = async () => {
      const response = await fetch(`${API_URL}/utilizationv2/`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        method: "GET",
      });
      const data = await response.json();
      console.log("========", data);
      setActiveCampaign(data?.active_campaign);
      setSeatData(data?.seat_utilization);
    };
    const handleGetOutboundData = async () => {
      const response = await fetch(`${API_URL}/campaigns/utilization`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        method: "GET",
      });
      if (response.status === 200) {
        const data = await response.json();
        setOutboundData(data);
      }
    };

    const fetchCampaignData = async () => {
      const response = await axios.post(
        `${API_URL}/campaigns/used`,
        {
          client_id: userData.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setCampaignUnusedData(
        response.data?.data.results.filter(
          (item: any) => item.used_vs_unsed === "UNUSED"
        )
      );
      setCampaignUsedData(
        response.data?.data.results.filter(
          (item: any) => item.used_vs_unsed === "USED"
        )
      );
    };

    handleGetOutboundData();
    fetchUtilizationData();
    fetchCampaignData();
  }, [loading]);

  const [opened, { toggle }] = useDisclosure(false);

  return (
    <div>
      <Flex py={"lg"} gap={"lg"} direction={{ base: "column", md: "row" }}>
        <Flex direction={"column"} gap={"sm"} w={{ base: "100%" }}>
          <Flex align={"center"} gap={"5px"}>
            <Text
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}
              fw={700}
              size={"lg"}
            >
              <span>Campaigns</span>
              <Badge sx={{ background: "#228be6", color: "white" }}>
                {campaignUsedData?.length + campaignUnusedData.length}
              </Badge>
            </Text>
            <Divider w={"100%"} />
            {/* <Flex>
              <ActionIcon
                onClick={() => {
                  if (page > 0) setPage((page) => (page = page - 1));
                }}
              >
                <IconChevronLeft />
              </ActionIcon>
              <ActionIcon
                onClick={() => {
                  if (page < Math.ceil(activeCampaign.length / 5) - 1) setPage((page) => (page = page + 1));
                }}
              >
                <IconChevronRight />
              </ActionIcon>
            </Flex> */}
          </Flex>
          <UsedCampaign activeCampaign={campaignUsedData} />
          <UnusedCampaign data={campaignUnusedData} />
        </Flex>
      </Flex>
      {/* <Flex gap={"md"} direction={"column"} w={{ base: "100%", md: "30%" }}>
        <Flex align={"center"} gap={"5px"}>
          <Text
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
            }}
            fw={700}
            size={"lg"}
          >
            <span>Utilization</span>
          </Text>
          <Divider w={"100%"} />
        </Flex>
        <Card px={"md"} radius={"md"} w={"100%"} withBorder>
          <Flex align={"center"} justify={"space-between"} w={"100%"}>
            <Text size={"sm"} fw={500} color="gray" sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <div className=" rounded-full bg-[#3b84ef] w-[8px] h-[8px]"></div>
              Seat Utilization
            </Text>
            <Popover width={390} position="bottom" withArrow shadow="lg">
                  <Popover.Target>
                    <Badge
                      color="blue"
                      variant="filled"
                      sx={{ textTransform: "none", cursor: "pointer" }}
                      leftSection={<IconInfoCircle size={"0.9rem"} style={{ marginTop: "4px" }} />}
                    >
                      View Details
                    </Badge>
                  </Popover.Target>

                  <Popover.Dropdown sx={{ borderRadius: "8px" }} p={"xl"}>
                    <Flex gap={"sm"} align={"center"}>
                      <IconUserCircle color="#228be6" />{" "}
                      <Text fw={700} size={"lg"}>
                        Seat Utilization by Rep
                      </Text>
                    </Flex>
                    <ScrollArea h={350} mr={"-15px"} scrollbarSize={10}>
                      {seatData?.map((item, index) => {
                        return (
                          <Box
                            key={index}
                            mt={"md"}
                            sx={{
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                            }}
                            p={"sm"}
                            mr={"15px"}
                          >
                            <Flex align={"center"} gap={"5px"}>
                              <Flex w={"100%"} gap={"5px"}>
                                <Avatar size={"sm"} src={item?.rep_image ? item?.rep_image : item.rep} color={valueToColor(theme, item?.rep)} radius={"xl"}>
                                  {nameToInitials(item?.rep)}
                                </Avatar>
                                <Text tt={"uppercase"} w={"100%"} fw={600} sx={{ whiteSpace: "nowrap" }}>
                                  {item?.rep.substring(0, 25)} {item?.rep.length > 25 ? "..." : ""}
                                </Text>
                              </Flex>
                              <Divider w={"100%"} />
                              <Flex w={"fit-content"}>
                                {item?.num_campaigns > 0 ? (
                                  <IconCircleCheck color="white" size={"1.2rem"} fill="green" />
                                ) : (
                                  <IconInfoCircle color="white" fill="red" size={"1.2rem"} />
                                )}
                              </Flex>
                            </Flex>
                            <Flex>
                              <Text color="gray" size={"xs"}>
                                {item?.num_campaigns > 0 ? item.num_campaigns : "No"} active campaigns
                              </Text>
                            </Flex>
                          </Box>
                        );
                      })}
                    </ScrollArea>
                  </Popover.Dropdown>
                </Popover>
          </Flex>
          <Flex align={"center"} gap={"lg"}>
            <Text color="gray">
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "500",
                  color: "black",
                }}
              >
                {outboundData?.seat_active || 0}{" "}
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: "500",
                    color: "gray",
                  }}
                >
                  {" "}
                  / {outboundData?.seat_total || 0}
                </span>
              </span>{" "}
            </Text>
            <div className="w-[80px] relative">
              <Doughnut data={seat_data} options={piechartOptions} />
              <Flex
                style={{
                  position: "absolute",
                  top: "35px",
                  width: "100%",
                  alignItems: "center",
                }}
                direction={"column"}
              >
                <Text fw={600} size={"xl"}>
                  {Math.min(100, Math.floor(((outboundData?.seat_active || 0) / (outboundData?.seat_total || 1)) * 100))}%
                </Text>{" "}
              </Flex>
            </div>
          </Flex>
          <Text color="gray" fw={500}>
            Seats with Active Campaings
          </Text>
        </Card>

        <Card px={"md"} radius={"md"} w={"100%"} withBorder>
          <Flex align={"center"} justify={"space-between"} w={"100%"}>
            <Text size={"sm"} fw={500} color="gray" sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <div className=" rounded-full bg-[#d444f1] w-[8px] h-[8px]"></div>
              Message Utilization
            </Text>
          </Flex>
          <Flex align={"center"} gap={"lg"}>
            <Text color="gray">
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "500",
                  color: "black",
                }}
              >
                {outboundData?.message_active?.toLocaleString() || 0}
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: "500",
                    color: "gray",
                  }}
                >
                  {" "}
                  / {outboundData?.message_total?.toLocaleString() || 0}
                </span>
              </span>{" "}
            </Text>
            <div className="w-[80px] relative">
              <Doughnut data={message_data} options={piechartOptions} />
              <Flex
                style={{
                  position: "absolute",
                  top: "35px",
                  width: "100%",
                  alignItems: "center",
                }}
                direction={"column"}
              >
                <Text fw={600} size={"xl"}>
                  {Math.min(100, Math.floor(((outboundData?.message_active || 0) / (outboundData?.message_total || 1)) * 100))}%
                </Text>{" "}
              </Flex>
            </div>
          </Flex>
          <Text color="gray" fw={500}>
            Available Sending Out
          </Text>
        </Card>
      </Flex> */}
    </div>
  );
}

const UsedCampaign = (props: any) => {
  const [opened, setOpened] = useState<string | null>(null);

  const groupedData = props?.activeCampaign.reduce((acc: any, item: any) => {
    const { name } = item;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(item);
    return acc;
  }, {});
  console.log("---------", groupedData);

  return (
    <Paper withBorder radius={"sm"} p={"sm"}>
      <Flex align={"center"} justify={"space-between"}>
        <Text fw={700} size={"md"}>
          Used
        </Text>
        <Badge variant="filled">{2}/5 seats</Badge>
      </Flex>
      {groupedData &&
        Object.entries(groupedData).map(([key, value]: [string, any]) => (
          <Paper withBorder radius={"sm"} p={"xs"} mt={"sm"}>
            <Flex align={"center"} justify={"space-between"}>
              <Flex align={"center"} gap={4}>
                <Avatar src={value[0].img_url} size={"sm"} radius={"xl"} />
                <Text fw={500} size={"sm"}>
                  {value[0].name}
                </Text>
              </Flex>
              <Flex align={"center"} gap={"xs"}>
                <Flex gap={4}>
                  <Badge radius={"sm"}>
                    {value.reduce(
                      (acc: any, item: any) => acc + item.num_active_campaigns,
                      0
                    )}
                  </Badge>
                  <Text size={"sm"} fw={400} color="gray">
                    active campaign
                  </Text>
                </Flex>
                <Divider orientation="vertical" />
                <Flex gap={4}>
                  <Badge radius={"sm"} color="orange">
                    {value.reduce(
                      (acc: any, item: any) => acc + item.sent_yesterday,
                      0
                    )}
                  </Badge>
                  <Text size={"sm"} fw={400} color="gray">
                    sent yesterday
                  </Text>
                </Flex>
                <Divider orientation="vertical" />
                <Flex gap={4}>
                  <Badge radius={"sm"} color="green">
                    {value.reduce(
                      (acc: any, item: any) => acc + item.sent_today,
                      0
                    )}
                  </Badge>
                  <Text size={"sm"} fw={400} color="gray">
                    sent today
                  </Text>
                </Flex>
                <ActionIcon
                  variant="light"
                  onClick={() => setOpened(opened === key ? null : key)}
                >
                  <IconChevronDown size={"1rem"} />
                </ActionIcon>
              </Flex>
            </Flex>
            <Collapse in={opened === key}>
              <DataGrid
                data={value}
                mt={"sm"}
                highlightOnHover
                withSorting
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
                    accessorKey: "Status",
                    minSize: 120,
                    maxSize: 120,
                    header: () => (
                      <Flex align={"center"} gap={"3px"}>
                        <IconLoader color="gray" size={"0.9rem"} />
                        <Text color="gray">Status</Text>
                      </Flex>
                    ),
                    cell: (cell: any) => {
                      const { campaign_status } = cell.row.original;

                      return (
                        <Flex
                          w={"100%"}
                          h={"100%"}
                          px={"sm"}
                          align={"center"}
                          justify={"center"}
                        >
                          <Badge>{campaign_status}</Badge>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: "campaigns",
                    minSize: 430,
                    maxSize: 400,
                    header: () => (
                      <Flex align={"center"} gap={"3px"}>
                        <IconTargetArrow color="gray" size={"0.9rem"} />
                        <Text color="gray">Campaigns</Text>
                      </Flex>
                    ),

                    cell: (cell: any) => {
                      const { archetype, linkedin_volume, email_volume } =
                        cell.row.original;

                      return (
                        <Flex
                          w={"100%"}
                          px={"sm"}
                          h={"100%"}
                          align={"center"}
                          gap={"md"}
                        >
                          <Flex>
                            <Text lineClamp={1}>{archetype}</Text>
                          </Flex>

                          <Flex w={"100%"} align={"center"} gap={3}>
                            {email_volume > 0 && (
                              <IconMail
                                size={"1.3rem"}
                                fill="#228be6"
                                color="white"
                              />
                            )}
                            {linkedin_volume > 0 && (
                              <IconBrandLinkedin
                                size={"1.3rem"}
                                fill="#228be6"
                                color="white"
                              />
                            )}
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: "Progress",
                    header: () => (
                      <Flex align={"center"} gap={"3px"}>
                        <IconBolt color="gray" size={"0.9rem"} />
                        <Text color="gray">Progress</Text>
                      </Flex>
                    ),
                    enableResizing: true,
                    cell: (cell: any) => {
                      const {
                        num_sent,
                        num_prospects,
                        sent_today,
                        sent_yesterday,
                      } = cell.row.original;

                      return (
                        <Flex
                          direction={"column"}
                          justify={"center"}
                          w={"100%"}
                          h={"100%"}
                          py={"sm"}
                        >
                          <Flex
                            w={"100%"}
                            align={"center"}
                            gap={"8px"}
                            px={"xs"}
                          >
                            <Progress
                              value={(num_sent / num_prospects) * 100}
                              w={"100%"}
                            />
                            <Text color="#228be6" fw={500}>
                              {Math.round((num_sent / num_prospects) * 100)}%
                            </Text>
                          </Flex>
                          <Flex
                            align={"center"}
                            justify={"space-between"}
                            px={"sm"}
                          >
                            <Flex align={"center"}>
                              <Text fw={500}>
                                {num_sent} / {num_prospects}{" "}
                                <span className="text-gray-500">Sent</span>
                              </Text>
                            </Flex>
                            <Flex align={"center"} gap={"xs"}>
                              <Flex gap={4}>
                                <Badge radius={"sm"} color="orange">
                                  {sent_yesterday}
                                </Badge>
                                <Text size={"sm"} fw={400} color="gray">
                                  sent yesterday
                                </Text>
                              </Flex>
                              <Divider orientation="vertical" />
                              <Flex gap={4}>
                                <Badge radius={"sm"} color="green">
                                  {sent_today}
                                </Badge>
                                <Text size={"sm"} fw={400} color="gray">
                                  sent today
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      );
                    },
                  },
                ]}
                options={{
                  enableFilters: true,
                }}
                // loading={loading}
                w={"100%"}
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
            </Collapse>
          </Paper>
        ))}
    </Paper>
  );
};

const UnusedCampaign = (props: any) => {
  return (
    <Paper withBorder radius={"sm"} p={"sm"}>
      <Flex align={"center"} justify={"space-between"}>
        <Text fw={700} size={"md"}>
          Unused
        </Text>
        <Badge variant="filled">2/5 seats</Badge>
      </Flex>
      {props.data &&
        props.data.map((item: any, index: number) => {
          return (
            <Paper withBorder radius={"sm"} p={"sm"} mt={"sm"} key={index}>
              <Flex align={"center"} justify={"space-between"}>
                <Flex align={"center"} gap={4}>
                  <Avatar src={item.img_url} size={"sm"} radius={"xl"} />
                  <Text fw={500} size={"sm"}>
                    {item.name}
                  </Text>
                </Flex>
                <Flex align={"center"} gap={"xs"}>
                  <Flex gap={4}>
                    <Text size={"sm"} fw={400} color="gray">
                      Unused Capacity:
                    </Text>
                    <Badge radius={"sm"} color="grape">
                      {item.email_volume}
                    </Badge>
                    <Text size={"sm"} fw={400} color="gray">
                      Mails per week
                    </Text>
                  </Flex>
                  <Divider orientation="vertical" />
                  <Flex gap={4}>
                    <Badge radius={"sm"}>{item.linkedin_volume}</Badge>
                    <Text size={"sm"} fw={400} color="gray">
                      Linkedin per week
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Paper>
          );
        })}
    </Paper>
  );
};
