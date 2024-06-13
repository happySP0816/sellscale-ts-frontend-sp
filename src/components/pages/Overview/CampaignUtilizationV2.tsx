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

    handleGetOutboundData();
    fetchUtilizationData();
  }, [loading]);

  return (
    <div>
      <Flex py={"lg"} gap={"lg"}>
        <Flex direction={"column"} gap={"sm"} w={"70%"}>
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
                {activeCampaign?.length}
              </Badge>
            </Text>
            <Divider w={"100%"} />
            <Flex>
              <ActionIcon
                onClick={() => {
                  if (page > 0) setPage((page) => (page = page - 1));
                }}
              >
                <IconChevronLeft />
              </ActionIcon>
              <ActionIcon
                onClick={() => {
                  if (page < Math.ceil(activeCampaign.length / 5) - 1)
                    setPage((page) => (page = page + 1));
                }}
              >
                <IconChevronRight />
              </ActionIcon>
            </Flex>
          </Flex>
          <Paper withBorder p={0} mt={5}>
            <DataGrid
              data={activeCampaign.slice(page * 5, page * 5 + 5)}
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
                  cell: (cell) => {
                    const { status } = cell.row.original;

                    return (
                      <Flex
                        w={"100%"}
                        h={"100%"}
                        px={"sm"}
                        align={"center"}
                        justify={"center"}
                      >
                        <Badge>{status}</Badge>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: "campaigns",
                  minSize: 330,
                  maxSize: 330,
                  header: () => (
                    <Flex align={"center"} gap={"3px"}>
                      <IconTargetArrow color="gray" size={"0.9rem"} />
                      <Text color="gray">Campaigns</Text>
                    </Flex>
                  ),

                  cell: (cell) => {
                    const {
                      campaign,
                      num_total_linkedin,
                      num_total_email,
                    } = cell.row.original;

                    return (
                      <Flex
                        w={"100%"}
                        px={"sm"}
                        h={"100%"}
                        align={"center"}
                        gap={"md"}
                      >
                        <Flex>
                          <Text lineClamp={1}>{campaign}</Text>
                        </Flex>

                        <Flex w={"100%"} align={"center"} gap={3}>
                          {num_total_email > 0 && (
                            <IconMail
                              size={"1.3rem"}
                              fill="#228be6"
                              color="white"
                            />
                          )}
                          {num_total_linkedin > 0 && (
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
                  accessorKey: "sdr",
                  minSize: 140,
                  maxSize: 140,
                  header: () => (
                    <Flex align={"center"} gap={"3px"}>
                      <IconTargetArrow color="gray" size={"0.9rem"} />
                      <Text color="gray">SDR</Text>
                    </Flex>
                  ),
                  cell: (cell) => {
                    const { rep, rep_profile_picture } = cell.row.original;

                    return (
                      <Flex
                        gap={"sm"}
                        w={"100%"}
                        px={"sm"}
                        h={"100%"}
                        align={"center"}
                      >
                        <Avatar
                          src={rep_profile_picture}
                          color={valueToColor(theme, rep)}
                          radius={"xl"}
                        >
                          {nameToInitials(rep)}
                        </Avatar>
                        <Text fw={500}>
                          {rep.split(" ")[0] +
                            " " +
                            rep.split(" ")[1].slice(0, 1) +
                            "."}
                        </Text>
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
                  maxSize: 220,
                  minSize: 220,
                  enableResizing: true,
                  cell: (cell) => {
                    const { num_used_total, num_total } = cell.row.original;

                    return (
                      <Flex
                        direction={"column"}
                        align={"center"}
                        justify={"center"}
                        w={"100%"}
                        h={"100%"}
                        py={"sm"}
                      >
                        <Flex w={"100%"} align={"center"} gap={"8px"} px={"xs"}>
                          <Progress
                            value={(num_used_total / num_total) * 100}
                            w={"100%"}
                          />
                          <Text color="#228be6" fw={500}>
                            {Math.round((num_used_total / num_total) * 100)}%
                          </Text>
                        </Flex>
                        <Flex align={"center"}>
                          <Text fw={500}>
                            {num_used_total} / {num_total}{" "}
                            <span style={{ color: "gray !important" }}>
                              Sent
                            </span>
                          </Text>
                          {Math.round((num_total - num_used_total) / 20) < 3 ? (
                            <IconPoint fill="gray" color="white" />
                          ) : null}
                          <Text
                            color={"red"}
                            sx={{
                              display:
                                Math.round((num_total - num_used_total) / 20) <
                                3
                                  ? "block"
                                  : "none",
                            }}
                          >
                            {Math.round((num_total - num_used_total) / 20)} day
                            {Math.round((num_total - num_used_total) / 20) < 3
                              ? "s"
                              : ""}{" "}
                            left
                          </Text>
                        </Flex>
                      </Flex>
                    );
                  },
                },
                {
                  accessorKey: "active",
                  maxSize: 100,
                  minSize: 100,
                  header: () => (
                    <Flex align={"center"} gap={"3px"}>
                      <IconCalendar color="gray" size={"0.9rem"} />
                      <Text color="gray">Active</Text>
                    </Flex>
                  ),
                  enableResizing: true,
                  cell: (cell) => {
                    const { persona_id, rep_id } = cell.row.original;

                    return (
                      <Flex
                        direction={"column"}
                        align={"center"}
                        justify={"center"}
                        gap={"xs"}
                        py={"lg"}
                        w={"100%"}
                        h={"100%"}
                      >
                        <Switch
                          checked
                          disabled={rep_id == userId ? false : true}
                          onClick={() => handleDeactive(persona_id)}
                        />
                      </Flex>
                    );
                  },
                },
              ]}
              options={{
                enableFilters: true,
              }}
              loading={loading}
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
          </Paper>
        </Flex>
        <Flex gap={"md"} direction={"column"} w={"30%"}>
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
            {/* <ActionIcon onClick={activeToggle}>{activeOpened ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon> */}
          </Flex>
          <Card px={"md"} radius={"md"} w={"100%"} withBorder>
            <Flex align={"center"} justify={"space-between"} w={"100%"}>
              <Text
                size={"sm"}
                fw={500}
                color="gray"
                sx={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                <div className=" rounded-full bg-[#3b84ef] w-[8px] h-[8px]"></div>
                Seat Utilization
              </Text>
              {/* <Popover width={390} position="bottom" withArrow shadow="lg">
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
                </Popover> */}
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
                    {Math.min(
                      100,
                      Math.floor(
                        ((outboundData?.seat_active || 0) /
                          (outboundData?.seat_total || 1)) *
                          100
                      )
                    )}
                    %
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
              <Text
                size={"sm"}
                fw={500}
                color="gray"
                sx={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
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
                    {Math.min(
                      100,
                      Math.floor(
                        ((outboundData?.message_active || 0) /
                          (outboundData?.message_total || 1)) *
                          100
                      )
                    )}
                    %
                  </Text>{" "}
                </Flex>
              </div>
            </Flex>
            <Text color="gray" fw={500}>
              Available Sending Out
            </Text>
          </Card>
        </Flex>
      </Flex>
    </div>
  );
}
