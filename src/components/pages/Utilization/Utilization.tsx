import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Flex,
  Popover,
  Progress,
  ScrollArea,
  Select,
  Text,
  Title,
  useMantineTheme,
  Container,
  Switch,
} from "@mantine/core";
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
  IconPlus,
  IconPoint,
  IconTargetArrow,
  IconToggleRight,
  IconUserCircle,
} from "@tabler/icons";
import {
  IconInfoHexagon,
  IconInfoTriangle,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { DataGrid } from "mantine-data-grid";
import { Doughnut } from "react-chartjs-2";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { openContextModal } from "@mantine/modals";
import moment from "moment";
import { valueToColor, nameToInitials } from "@utils/general";
import { deactivatePersona } from "@utils/requests/postPersonaDeactivation";
import { showNotification } from "@mantine/notifications";

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

export default function Utilization() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const userId = userData?.id;
  const repName = userData?.sdr_name;

  const currentTime = moment().format("ddd, DD MMM YYYY HH:mm:ss");

  const [activeOpened, { toggle: activeToggle }] = useDisclosure(true);
  const [repOpened, { toggle: repToggle }] = useDisclosure(true);
  const [aiOpened, { toggle: aiToggle }] = useDisclosure(true);
  const [noOpened, { toggle: noToggle }] = useDisclosure(true);
  const [completeOpened, { toggle: completeToggle }] = useDisclosure(true);

  const [acPageSize, setAcPageSize] = useState("25");
  const [raPageSize, setRaPageSize] = useState("25");
  const [udPageSize, setUdPageSize] = useState("25");
  const [cdPageSize, setCdPageSize] = useState("25");
  const [ncPageSize, setNcPageSize] = useState("25");

  const [activeCampaign, setActiveCampaign] = useState<activeCampaignType[]>(
    []
  );
  const [repCampaign, setRepCampaign] = useState<repCampaignType[]>([]);
  const [aiCampaign, setAICampaign] = useState<aiCampaignType[]>([]);
  const [noCampaign, setNoCampaign] = useState<noCampaignType[]>([]);
  const [completedCampaign, setCompletedCampaign] = useState<
    completedCampaignType[]
  >([]);
  const [seatData, setSeatData] = useState<seatDataType[]>([]);
  const [outboundData, setOutboundData] = useState<outboundType>();

  const [loading, setLoading] = useState(false);

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

      setActiveCampaign(data?.active_campaign);
      setRepCampaign(data?.rep_needed_campaign);
      setAICampaign(data?.ai_setting_up);
      setNoCampaign(data?.no_campaign);
      setCompletedCampaign(data?.completed_campaign);
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
    <Container maw={1500} mt={"xl"}>
      <Card withBorder>
        <Flex w={"100%"} justify={"space-between"}>
          <Text size={"xl"} fw={600}>
            Outbound Utilization
          </Text>
          <Button
            radius="md"
            leftIcon={<IconPlus size="1rem" />}
            onClick={() => {
              openContextModal({
                modal: "uploadProspects",
                title: <Title order={3}>Create Campaign</Title>,
                innerProps: { mode: "CREATE-ONLY" },
              });
            }}
          >
            Create New Campaign
          </Button>
        </Flex>
        <Text>
          View which reps have campaigns that are active, completed, or need
          action.
        </Text>

        <div className="bg-white">
          <Flex direction={"column"} py={"lg"} gap={"lg"}>
            <Flex gap={"md"}>
              <Flex
                px={"md"}
                sx={{ border: "1px solid #dee2e6", borderRadius: "8px" }}
                w={"100%"}
                h={"fit-content"}
                align={"center"}
                gap={"xl"}
              >
                <div className="w-[140px] relative">
                  <Doughnut data={seat_data} options={piechartOptions} />
                  <Flex
                    style={{
                      position: "absolute",
                      top: "60px",
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
                <Box w={"100%"}>
                  <Flex align={"center"} justify={"space-between"} w={"100%"}>
                    <Text
                      size={"sm"}
                      color="gray"
                      sx={{ display: "flex", gap: "6px", alignItems: "center" }}
                    >
                      <div className=" rounded-full bg-[#3b84ef] w-[8px] h-[8px]"></div>
                      Seat Utilization
                    </Text>
                    <Popover
                      width={390}
                      position="bottom"
                      withArrow
                      shadow="lg"
                    >
                      <Popover.Target>
                        <Badge
                          color="blue"
                          variant="filled"
                          sx={{ textTransform: "none", cursor: "pointer" }}
                          leftSection={
                            <IconInfoCircle
                              size={"0.9rem"}
                              style={{ marginTop: "4px" }}
                            />
                          }
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
                                    <Avatar
                                      size={"sm"}
                                      src={
                                        item?.rep_image
                                          ? item?.rep_image
                                          : item.rep
                                      }
                                      color={valueToColor(theme, item?.rep)}
                                      radius={"xl"}
                                    >
                                      {nameToInitials(item?.rep)}
                                    </Avatar>
                                    <Text
                                      tt={"uppercase"}
                                      w={"100%"}
                                      fw={600}
                                      sx={{ whiteSpace: "nowrap" }}
                                    >
                                      {item?.rep.substring(0, 25)}{" "}
                                      {item?.rep.length > 25 ? "..." : ""}
                                    </Text>
                                  </Flex>
                                  <Divider w={"100%"} />
                                  <Flex w={"fit-content"}>
                                    {item?.num_campaigns > 0 ? (
                                      <IconCircleCheck
                                        color="white"
                                        size={"1.2rem"}
                                        fill="green"
                                      />
                                    ) : (
                                      <IconInfoCircle
                                        color="white"
                                        fill="red"
                                        size={"1.2rem"}
                                      />
                                    )}
                                  </Flex>
                                </Flex>
                                <Flex>
                                  <Text color="gray" size={"xs"}>
                                    {item?.num_campaigns > 0
                                      ? item.num_campaigns
                                      : "No"}{" "}
                                    active campaigns
                                  </Text>
                                </Flex>
                              </Box>
                            );
                          })}
                        </ScrollArea>
                      </Popover.Dropdown>
                    </Popover>
                  </Flex>

                  <Text color="gray">
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "black",
                      }}
                    >
                      {outboundData?.seat_active || 0} /{" "}
                      {outboundData?.seat_total || 0}
                    </span>{" "}
                    Seats with Active Campaings
                  </Text>
                </Box>
              </Flex>
              <Flex
                px={"md"}
                sx={{ border: "1px solid #dee2e6", borderRadius: "8px" }}
                w={"100%"}
                align={"center"}
                gap={"xl"}
                h={"fit-content"}
              >
                <div className="w-[140px] relative">
                  <Doughnut data={message_data} options={piechartOptions} />
                  <Flex
                    style={{
                      position: "absolute",
                      top: "60px",
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
                <Box w={"100%"}>
                  <Flex align={"center"} justify={"space-between"} w={"100%"}>
                    <Text
                      size={"sm"}
                      color="gray"
                      sx={{ display: "flex", gap: "6px", alignItems: "center" }}
                    >
                      <div className=" rounded-full bg-[#d444f1] w-[8px] h-[8px]"></div>
                      Message Utilization
                    </Text>
                  </Flex>
                  <Text color="gray">
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "black",
                      }}
                    >
                      {outboundData?.message_active?.toLocaleString() || 0} /{" "}
                      {outboundData?.message_total?.toLocaleString() || 0}
                    </span>{" "}
                    Available Sending Out
                  </Text>
                </Box>
              </Flex>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Flex align={"center"} gap={"5px"}>
                <Text
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                  color="gray"
                  fw={700}
                  size={"lg"}
                >
                  <IconTargetArrow color="#228be6" />
                  <span>Active Campaigns</span>
                  <Badge sx={{ background: "#228be6", color: "white" }}>
                    {activeCampaign?.length}
                  </Badge>
                </Text>
                <Divider w={"100%"} />
                <ActionIcon onClick={activeToggle}>
                  {activeOpened ? <IconChevronUp /> : <IconChevronDown />}
                </ActionIcon>
              </Flex>
              <Collapse in={activeOpened}>
                <DataGrid
                  data={activeCampaign}
                  highlightOnHover
                  withPagination
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
                      minSize: 180,
                      maxSize: 180,
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
                      minSize: 400,
                      maxSize: 400,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconTargetArrow color="gray" size={"0.9rem"} />
                          <Text color="gray">Campaigns</Text>
                        </Flex>
                      ),

                      cell: (cell) => {
                        const { campaign } = cell.row.original;

                        return (
                          <Flex
                            w={"100%"}
                            px={"sm"}
                            h={"100%"}
                            align={"center"}
                          >
                            <Text lineClamp={1}>{campaign}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "sdr",
                      minSize: 200,
                      maxSize: 200,
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
                            <Text fw={500}>{rep}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "channel",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconToggleRight color="gray" size={"0.9rem"} />
                          <Text color="gray">Channels</Text>
                        </Flex>
                      ),
                      maxSize: 120,
                      minSize: 120,
                      enableResizing: true,
                      cell: (cell) => {
                        const {
                          num_total_linkedin,
                          num_total_email,
                        } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            justify={"center"}
                            gap={"xs"}
                            py={"lg"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Flex
                              justify={"center"}
                              w={"100%"}
                              align={"center"}
                              gap={"md"}
                            >
                              {num_total_linkedin > 0 && (
                                <IconBrandLinkedin
                                  size={"1.3rem"}
                                  fill="#228be6"
                                  color="white"
                                />
                              )}
                              {num_total_email > 0 && (
                                <IconMail
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
                            <Flex
                              w={"100%"}
                              align={"center"}
                              gap={"8px"}
                              px={"xs"}
                            >
                              <Progress
                                value={(num_used_total / num_total) * 100}
                                w={"100%"}
                              />
                              <Text color="#228be6" fw={500}>
                                {Math.round((num_used_total / num_total) * 100)}
                                %
                              </Text>
                            </Flex>
                            <Flex align={"center"}>
                              <Text fw={500}>
                                {num_used_total} / {num_total}{" "}
                                <span style={{ color: "gray !important" }}>
                                  Sent
                                </span>
                              </Text>
                              {Math.round((num_total - num_used_total) / 20) <
                              3 ? (
                                <IconPoint fill="gray" color="white" />
                              ) : null}
                              <Text
                                color={"red"}
                                sx={{
                                  display:
                                    Math.round(
                                      (num_total - num_used_total) / 20
                                    ) < 3
                                      ? "block"
                                      : "none",
                                }}
                              >
                                {Math.round((num_total - num_used_total) / 20)}{" "}
                                day
                                {Math.round((num_total - num_used_total) / 20) <
                                3
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
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconCalendar color="gray" size={"0.9rem"} />
                          <Text color="gray">Active</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      minSize: 230,
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
                              value={`${
                                table.getState().pagination.pageIndex + 1
                              }`}
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
                              disabled={
                                table.getState().pagination.pageIndex === 0
                              }
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
                    },

                    dataCellContent: {
                      width: "100%",
                    },
                  })}
                />
              </Collapse>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Flex align={"center"} gap={"5px"}>
                <Text
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                  color="gray"
                  fw={700}
                  size={"lg"}
                >
                  <IconInfoTriangle color="orange" />
                  <span>Rep Action Needed</span>
                  <Badge color="orange" variant="filled">
                    {repCampaign?.length}
                  </Badge>
                </Text>
                <Divider w={"100%"} />
                <ActionIcon onClick={repToggle}>
                  {repOpened ? <IconChevronUp /> : <IconChevronDown />}
                </ActionIcon>
              </Flex>
              <Collapse in={repOpened}>
                <DataGrid
                  data={repCampaign}
                  highlightOnHover
                  withPagination
                  withColumnBorders
                  withSorting
                  withBorder
                  sx={{
                    cursor: "pointer",
                    "& tr": {
                      background: "white",
                    },
                  }}
                  columns={[
                    {
                      accessorKey: "Status",
                      minSize: 180,
                      maxSize: 180,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Status</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { status } = cell.row.original;

                        return (
                          <Flex
                            gap={"xs"}
                            w={"100%"}
                            h={"100%"}
                            align={"center"}
                            justify={"center"}
                          >
                            <Badge color={"orange"}>{status}</Badge>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "campaign",
                      minSize: 400,
                      maxSize: 400,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Campaign</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { campaign } = cell.row.original;

                        return (
                          <Flex w={"100%"} h={"100%"} align={"center"}>
                            <Text lineClamp={1} color={campaign ? "" : "gray"}>
                              {campaign ? campaign : "No Campaign"}
                            </Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "sdr",
                      minSize: 200,
                      maxSize: 200,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">SDR</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        const { rep, rep_profile_picture } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Avatar
                              src={rep_profile_picture}
                              color={valueToColor(theme, rep)}
                              radius={"xl"}
                            >
                              {nameToInitials(rep)}
                            </Avatar>
                            <Text>{rep}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "details",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Details</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        const { num_open_tasks } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            gap={"4px"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Text fw={500}>{num_open_tasks}</Text>
                            <Text fw={500} color="gray">
                              Open Tasks
                            </Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "action",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconToggleRight color="gray" size={"0.9rem"} />
                          <Text color="gray">Action</Text>
                        </Flex>
                      ),
                      maxSize: 200,
                      enableResizing: true,
                      cell: (cell) => {
                        const { rep } = cell.row.original;
                        return (
                          <Flex align={"center"} h={"100%"} justify={"center"}>
                            <Button
                              rightIcon={<IconExternalLink size={"0.9rem"} />}
                              style={{ borderRadius: "16px", height: "1.3rem" }}
                              size="xs"
                              disabled={rep !== repName}
                              onClick={() => {
                                window.location.href = "/overview";
                              }}
                            >
                              View Task
                            </Button>
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
                          value={raPageSize}
                          onChange={(v) => {
                            setRaPageSize(v ?? "25");
                          }}
                        />

                        <Flex align={"center"} gap={"sm"}>
                          <Flex align={"center"}>
                            <Select
                              maw={100}
                              value={`${
                                table.getState().pagination.pageIndex + 1
                              }`}
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
                              disabled={
                                table.getState().pagination.pageIndex === 0
                              }
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
                  pageSizes={[raPageSize]}
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
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Flex align={"center"} gap={"5px"}>
                <Text
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                  color="gray"
                  fw={700}
                  size={"lg"}
                >
                  <IconSparkles color="#d549f2" />
                  <span>AI is Setting Up</span>
                  <Badge sx={{ background: "#d549f2" }} variant="filled">
                    {aiCampaign.length}
                  </Badge>
                </Text>
                <Divider w={"100%"} />
                <ActionIcon onClick={aiToggle}>
                  {aiOpened ? <IconChevronUp /> : <IconChevronDown />}
                </ActionIcon>
              </Flex>
              <Collapse in={aiOpened}>
                <DataGrid
                  data={aiCampaign}
                  highlightOnHover
                  withPagination
                  withSorting
                  withColumnBorders
                  withBorder
                  sx={{
                    cursor: "pointer",
                    "& tr": {
                      background: "white",
                    },
                  }}
                  columns={[
                    {
                      accessorKey: "Status",
                      minSize: 180,
                      maxSize: 180,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Status</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { status } = cell.row.original;

                        return (
                          <Flex
                            gap={"xs"}
                            w={"100%"}
                            h={"100%"}
                            align={"center"}
                            justify={"center"}
                          >
                            <Badge
                              sx={{ color: "#d549f2", background: "#fbebfe" }}
                            >
                              {status}
                            </Badge>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "campaign",
                      minSize: 400,
                      maxSize: 400,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Campaign</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { campaign } = cell.row.original;

                        return (
                          <Flex w={"100%"} h={"100%"} align={"center"}>
                            <Text lineClamp={1}>{campaign}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "sdr",
                      minSize: 200,
                      maxSize: 200,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">SDR</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        const { rep, rep_profile_picture } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Avatar
                              src={rep_profile_picture}
                              color={valueToColor(theme, rep)}
                              radius={"xl"}
                            >
                              {nameToInitials(rep)}
                            </Avatar>
                            <Text>{rep}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "detail",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Details</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        const {
                          linkedin_setup,
                          email_setup,
                          prospects,
                        } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            {prospects} - {email_setup} - {linkedin_setup}
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
                          value={udPageSize}
                          onChange={(v) => {
                            setUdPageSize(v ?? "25");
                          }}
                        />

                        <Flex align={"center"} gap={"sm"}>
                          <Flex align={"center"}>
                            <Select
                              maw={100}
                              value={`${
                                table.getState().pagination.pageIndex + 1
                              }`}
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
                              disabled={
                                table.getState().pagination.pageIndex === 0
                              }
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
                  })}
                />
              </Collapse>
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Flex align={"center"} gap={"5px"}>
                <Text
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                  color="gray"
                  fw={700}
                  size={"lg"}
                >
                  <IconInfoHexagon color="red" />
                  <span>No Campaign Found</span>
                  <Badge color="red" variant="filled">
                    {noCampaign.length}
                  </Badge>
                </Text>
                <Divider w={"100%"} />
                <ActionIcon onClick={noToggle}>
                  {noOpened ? <IconChevronUp /> : <IconChevronDown />}
                </ActionIcon>
              </Flex>
              <Collapse in={noOpened}>
                <DataGrid
                  data={noCampaign}
                  highlightOnHover
                  withPagination
                  withSorting
                  withColumnBorders
                  withBorder
                  sx={{
                    cursor: "pointer",
                    "& tr": {
                      background: "white",
                    },
                  }}
                  columns={[
                    {
                      accessorKey: "Status",
                      minSize: 180,
                      maxSize: 180,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Status</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { status } = cell.row.original;

                        return (
                          <Flex
                            gap={"xs"}
                            w={"100%"}
                            h={"100%"}
                            align={"center"}
                            justify={"center"}
                          >
                            <Badge color="red">{status}</Badge>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "campaign",
                      minSize: 400,
                      maxSize: 400,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Campaign</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { campaign } = cell.row.original;

                        return (
                          <Flex w={"100%"} h={"100%"} align={"center"}>
                            <Text lineClamp={1} color={campaign ? "" : "gray"}>
                              {campaign ? campaign : "No Campaign"}
                            </Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "sdr",
                      minSize: 200,
                      maxSize: 200,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">SDR</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        const { rep, rep_profile_picture } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Avatar
                              src={rep_profile_picture}
                              color={valueToColor(theme, rep)}
                              radius={"xl"}
                            >
                              {nameToInitials(rep)}
                            </Avatar>
                            <Text>{rep}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "action",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconToggleRight color="gray" size={"0.9rem"} />
                          <Text color="gray">Action</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Flex w={"100%"} justify={"center"}>
                              <ActionIcon w={"fit-content"}>
                                <Button
                                  color="blue"
                                  variant="filled"
                                  w={"100%"}
                                  sx={{
                                    textTransform: "none",
                                    cursor: "pointer",
                                  }}
                                  size="xs"
                                  disabled={cell.row.original.rep_id !== userId}
                                  onClick={() => {
                                    openContextModal({
                                      modal: "uploadProspects",
                                      title: (
                                        <Title
                                          order={3}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                          }}
                                        >
                                          <IconTargetArrow color="#228be6" />{" "}
                                          Request Campaign
                                        </Title>
                                      ),
                                      innerProps: { mode: "CREATE-ONLY" },
                                    });
                                  }}
                                >
                                  Add Campaign for Rep
                                </Button>
                              </ActionIcon>
                            </Flex>
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
                          value={ncPageSize}
                          onChange={(v) => {
                            setNcPageSize(v ?? "25");
                          }}
                        />

                        <Flex align={"center"} gap={"sm"}>
                          <Flex align={"center"}>
                            <Select
                              maw={100}
                              value={`${
                                table.getState().pagination.pageIndex + 1
                              }`}
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
                              disabled={
                                table.getState().pagination.pageIndex === 0
                              }
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
                  pageSizes={[ncPageSize]}
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
            </Flex>
            <Flex direction={"column"} gap={"sm"}>
              <Flex align={"center"} gap={"5px"}>
                <Text
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                  color="gray"
                  fw={700}
                  size={"lg"}
                >
                  <IconCircleCheck color="green" />
                  <span>Completed Campaigns</span>
                  <Badge color="green" variant="filled">
                    {completedCampaign.length}
                  </Badge>
                </Text>
                <Divider w={"100%"} />
                <ActionIcon onClick={completeToggle}>
                  {completeOpened ? <IconChevronUp /> : <IconChevronDown />}
                </ActionIcon>
              </Flex>
              <Collapse in={completeOpened}>
                <DataGrid
                  data={completedCampaign}
                  highlightOnHover
                  withPagination
                  withSorting
                  withColumnBorders
                  withBorder
                  sx={{
                    cursor: "pointer",
                    "& tr": {
                      background: "white",
                    },
                  }}
                  columns={[
                    {
                      accessorKey: "Status",
                      minSize: 180,
                      maxSize: 180,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Status</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { status } = cell.row.original;

                        return (
                          <Flex
                            gap={"xs"}
                            w={"100%"}
                            h={"100%"}
                            justify={"center"}
                            align={"center"}
                          >
                            <Badge color="green">{status}</Badge>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "campaign",
                      minSize: 400,
                      maxSize: 400,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Campaign</Text>
                        </Flex>
                      ),
                      cell: (cell) => {
                        const { campaign } = cell.row.original;

                        return (
                          <Flex w={"100%"} h={"100%"} align={"center"}>
                            <Text lineClamp={1}>{campaign}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "sdr",
                      minSize: 200,
                      maxSize: 200,
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">SDR</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      cell: (cell) => {
                        const { rep, rep_profile_picture } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Avatar
                              src={rep_profile_picture}
                              color={valueToColor(theme, rep)}
                              radius={"xl"}
                            >
                              {nameToInitials(rep)}
                            </Avatar>
                            <Text fw={500}>{rep}</Text>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "channel",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconToggleRight color="gray" size={"0.9rem"} />
                          <Text color="gray">Channels</Text>
                        </Flex>
                      ),
                      maxSize: 120,
                      minSize: 120,
                      enableResizing: true,
                      cell: (cell) => {
                        const {
                          num_used_linkedin,
                          num_used_email,
                        } = cell.row.original;

                        return (
                          <Flex
                            align={"center"}
                            justify={"center"}
                            gap={"xs"}
                            py={"lg"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Flex
                              justify={"center"}
                              w={"100%"}
                              align={"center"}
                              gap={"md"}
                            >
                              {num_used_linkedin > 0 && (
                                <IconBrandLinkedin
                                  size={"1.3rem"}
                                  fill="#228be6"
                                  color="white"
                                />
                              )}
                              {num_used_email > 0 && (
                                <IconMail
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
                      maxSize: 220,
                      minSize: 220,
                      enableResizing: true,
                      cell: (cell) => {
                        const { num_total } = cell.row.original;

                        return (
                          <Flex
                            direction={"column"}
                            align={"start"}
                            justify={"center"}
                            w={"100%"}
                            h={"100%"}
                          >
                            <Flex
                              w={"100%"}
                              align={"center"}
                              gap={"8px"}
                              px={"xs"}
                            >
                              <Progress value={100} w={"100%"} color="green" />
                              <Text color="green" fw={500}>
                                100%
                              </Text>
                            </Flex>
                            <Flex align={"start"} px={"xs"}>
                              <Text fw={500}>
                                {num_total} / {num_total}{" "}
                                <span style={{ color: "gray !important" }}>
                                  Sent
                                </span>
                              </Text>
                            </Flex>
                          </Flex>
                        );
                      },
                    },
                    {
                      accessorKey: "last_send_date",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconCalendar color="gray" size={"0.9rem"} />
                          <Text color="gray">Last Send Date</Text>
                        </Flex>
                      ),
                      enableResizing: true,
                      minSize: 230,
                      cell: (cell) => {
                        return (
                          <Flex
                            align={"center"}
                            gap={"xs"}
                            py={"sm"}
                            w={"100%"}
                            h={"100%"}
                            justify={"center"}
                          >
                            <Text color="gray" fw={500}>
                              {currentTime}
                            </Text>
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
                          value={cdPageSize}
                          onChange={(v) => {
                            setCdPageSize(v ?? "25");
                          }}
                        />

                        <Flex align={"center"} gap={"sm"}>
                          <Flex align={"center"}>
                            <Select
                              maw={100}
                              value={`${
                                table.getState().pagination.pageIndex + 1
                              }`}
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
                              disabled={
                                table.getState().pagination.pageIndex === 0
                              }
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
                  pageSizes={[cdPageSize]}
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
            </Flex>
          </Flex>
        </div>
      </Card>
    </Container>
  );
}
