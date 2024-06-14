import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Collapse,
  Badge,
  Divider,
  Flex,
  Paper,
  SimpleGrid,
  Text,
  useMantineTheme,
  Switch,
  ScrollArea,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconArrowRight,
  IconBallpen,
  IconCalendar,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconExternalLink,
  IconInfoCircle,
  IconLetterT,
  IconMessages,
  IconSend,
  IconToggleRight,
} from "@tabler/icons";
import { IconMessageCheck, IconSparkles } from "@tabler/icons-react";
import { nameToInitials, valueToColor } from "@utils/general";
import { DataGrid } from "mantine-data-grid";
import { useState } from "react";
import { Line } from "react-chartjs-2";

type SentimentData = {
  reply: string;
  intent: string;
};

type ActionsData = {
  template: string;
  open_rate: number;
  reply_rate: number;
  action: boolean;
};

type IcpData = {
  avatar: string;
  name: string;
  job: string;
  icp: string;
  clicks: number;
};

type CycleData = {
  period: string;
  volume: number;
  total: number;
  opened: number;
  replied: number;
  sentimentData: SentimentData[];
  actionsData: ActionsData[];
  subjectData: any[];
  personalizerData: any[];
  icpData: IcpData[];
  recommendData: any[];
};

export default function AnalyticsModal() {
  const theme = useMantineTheme();

  const [sentimentPage, setSentimentPage] = useState(0);
  const [icpPage, setIcpPage] = useState(0);

  const [actionsPage, setActionsPage] = useState(0);

  const [cycleData, setCycleData] = useState<CycleData[]>([
    {
      period: "5/16 - Present",
      volume: 156,
      total: 200,
      opened: 12,
      replied: 12,
      sentimentData: [
        {
          reply: `"Let's do it"`,
          intent: "Positive",
        },
        {
          reply: `"No thanks"`,
          intent: "Negative",
        },
        {
          reply: `"Let's do it"`,
          intent: "Positive",
        },
      ],
      actionsData: [
        {
          template: "Would you like a 20$ gift card?",
          open_rate: 33,
          reply_rate: 33,
          action: true,
        },
        {
          template: "$50 for a chat about devops",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
      icpData: [
        {
          avatar: "",
          name: "Adam B. Markk",
          job: "CTO, IBM Tech",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          job: "RockStar CEO, BlueSwitch",
          name: "Richard Chalme",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          name: "Erik Cooper",
          job: "CEO, Captical Group Holdings",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          job: "Chief Financial Officer, XTIVIA",
          name: "Neil Friedman",
          icp: "10",
          clicks: 5,
        },
      ],
      recommendData: [
        {
          content: "$50 for a chat about devops?",
        },
        {
          content: "$50 for a chat about devops?",
        },
        {
          content: "$50 for a chat about devops?",
        },
      ],
      subjectData: [
        {
          subject_lines: "[[creative phrase about securing secrets]] with Doppler",
          open_rate: 33,
          reply_rate: 33,
          action: true,
        },
        {
          subject_lines: "$50 for a chat about devops?",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
      personalizerData: [
        {
          personalizers: "Pull some recent news on [[company]] from the last 3 months",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
    },
    {
      period: "5/13 - 5/16",
      volume: 156,
      total: 200,
      opened: 12,
      replied: 12,
      sentimentData: [
        {
          reply: `"Let's do it"`,
          intent: "Positive",
        },
        {
          reply: `"No thanks"`,
          intent: "Negative",
        },
        {
          reply: `"Let's do it"`,
          intent: "Positive",
        },
      ],
      actionsData: [
        {
          template: "Would you like a 20$ gift card?",
          open_rate: 33,
          reply_rate: 33,
          action: true,
        },
        {
          template: "$50 for a chat about devops",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
      icpData: [
        {
          avatar: "",
          name: "Adam B. Markk",
          job: "CTO, IBM Tech",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          job: "RockStar CEO, BlueSwitch",
          name: "Richard Chalme",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          name: "Erik Cooper",
          job: "CEO, Captical Group Holdings",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          job: "Chief Financial Officer, XTIVIA",
          name: "Neil Friedman",
          icp: "10",
          clicks: 5,
        },
      ],
      recommendData: [
        {
          content: "$50 for a chat about devops?",
        },
        {
          content: "$50 for a chat about devops?",
        },
        {
          content: "$50 for a chat about devops?",
        },
      ],
      subjectData: [
        {
          subject_lines: "[[creative phrase about securing secrets]] with Doppler",
          open_rate: 33,
          reply_rate: 33,
          action: true,
        },
        {
          subject_lines: "$50 for a chat about devops?",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
      personalizerData: [
        {
          personalizers: "Pull some recent news on [[company]] from the last 3 months",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
    },
    {
      period: "5/5 - 5/13",
      volume: 156,
      total: 200,
      opened: 12,
      replied: 12,
      sentimentData: [
        {
          reply: `"Let's do it"`,
          intent: "Positive",
        },
        {
          reply: `"No thanks"`,
          intent: "Negative",
        },
        {
          reply: `"Let's do it"`,
          intent: "Positive",
        },
      ],
      actionsData: [
        {
          template: "Would you like a 20$ gift card?",
          open_rate: 33,
          reply_rate: 33,
          action: true,
        },
        {
          template: "$50 for a chat about devops",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
      icpData: [
        {
          avatar: "",
          name: "Adam B. Markk",
          job: "CTO, IBM Tech",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          job: "RockStar CEO, BlueSwitch",
          name: "Richard Chalme",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          name: "Erik Cooper",
          job: "CEO, Captical Group Holdings",
          icp: "10",
          clicks: 5,
        },
        {
          avatar: "",
          job: "Chief Financial Officer, XTIVIA",
          name: "Neil Friedman",
          icp: "10",
          clicks: 5,
        },
      ],
      recommendData: [
        {
          content: "$50 for a chat about devops?",
        },
        {
          content: "$50 for a chat about devops?",
        },
        {
          content: "$50 for a chat about devops?",
        },
      ],
      subjectData: [
        {
          subject_lines: "[[creative phrase about securing secrets]] with Doppler",
          open_rate: 33,
          reply_rate: 33,
          action: true,
        },
        {
          subject_lines: "$50 for a chat about devops?",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
      personalizerData: [
        {
          personalizers: "Pull some recent news on [[company]] from the last 3 months",
          open_rate: 33,
          reply_rate: 33,
          action: false,
        },
      ],
    },
  ]);

  const spendingData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Send",
        data: [65, 59, 80, 81, 56, 55, 40, 20, 230, 402, 201, 115, 20],
        fill: false,
        borderColor: "#55c2c1",
        backgroundColor: "#55c2c1",
      },
      {
        label: "Open",
        data: [230, 402, 201, 45, 39, 60, 71, 46, 35, 50, 55, 40, 20],
        fill: false,
        borderColor: "#e9be4d",
        backgroundColor: "#e9be4d",
      },
      {
        label: "Click",
        data: [65, 59, 80, 81, 56, 55, 40, 20, 230, 402, 201, 115, 20],
        fill: false,
        borderColor: "#d444f1",
        backgroundColor: "#d444f1",
      },
      {
        label: "Reply",
        data: [332, 121, 446, 11, 25, 60, 71, 224, 52, 66, 342, 221, 12],
        fill: false,
        borderColor: "#228be6",
        backgroundColor: "#228be6",
      },
      {
        label: "Demo",
        data: [24, 257, 311, 563, 424, 22, 14, 6, 241, 112, 55, 40, 20],
        fill: false,
        borderColor: "#ec8a0a",
        backgroundColor: "#ec8a0a",
      },
      {
        label: "Goal",
        data: new Array(12).fill(520), // Assuming 75 is your goal value
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        borderDash: [10, 5],
      },
    ],
  };
  const Spendingoptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
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
      y: {
        grid: {
          borderDash: [5, 5],
        },
      },
    },
    elements: {
      point: {
        radius: 1,
      },
    },
  };

  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  const handleToggle = (index: number) => {
    if (selectStep === index) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(index);
    }
    setSelectStep(index);
  };
  return (
    <Paper>
      {cycleData.map((item, index) => {
        return (
          <Box
            mb={"sm"}
            style={{
              border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da",
              borderRadius: "8px",
            }}
          >
            <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
              <Flex align={"center"} gap={"xs"}>
                <Text size={"sm"} fw={600} color="gray">
                  Cycle {index + 1}:
                </Text>
                <Text fw={600} size={"sm"}>
                  {item.period}
                </Text>
              </Flex>
              <Flex gap={1} align={"center"}>
                <Text></Text>
                <ActionIcon
                  onClick={() => {
                    handleToggle(index);
                  }}
                >
                  {selectStep === index && opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
                </ActionIcon>
              </Flex>
            </Flex>
            <Collapse in={selectStep === index && opened}>
              <ScrollArea h={500}>
                <Flex
                  gap={"sm"}
                  p={"sm"}
                  style={{
                    borderTop: "1px solid #228be6",
                  }}
                  direction={"column"}
                >
                  <Flex align={"center"} justify={"space-between"} w={"100%"}>
                    <Text fw={600}>Summary</Text>
                    <Button
                      leftIcon={<IconSparkles color="white" size={"0.9rem"} />}
                      radius={"xl"}
                      fz={12}
                      px={"sm"}
                      py={0}
                      color="grape"
                      onClick={() =>
                        openContextModal({
                          modal: "cycleanalyticModal",
                          title: <Title order={3}>Cycle Analytics (Coming Soon ⚠️)</Title>,
                          innerProps: {},
                          styles: {
                            content: {
                              minWidth: "600px",
                            },
                          },
                        })
                      }
                    >
                      AI Generate Report
                    </Button>
                  </Flex>
                  <Flex gap={"sm"}>
                    <Paper w={"40%"} h={300} withBorder radius={"md"}>
                      <Line typeof="linear" data={spendingData} options={Spendingoptions} />
                    </Paper>
                    <Box w={"60%"}>
                      <Paper w={"100%"} withBorder>
                        <Flex align={"center"} justify={"space-between"} h={"100%"} w="100%">
                          <Box
                            py={"sm"}
                            px={"xs"}
                            w={"100%"}
                            h={"100%"}
                            sx={{
                              backgroundColor: "",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#F7FDFF",
                              },
                            }}
                          >
                            <Flex align={"center"} gap={"xs"}>
                              <IconSend size={"0.9rem"} color="#3B85EF" className="mb-[2px]" />
                              <Text fw={400} size={"sm"}>
                                Sent
                              </Text>
                            </Flex>
                            <Flex align={"center"} gap={"sm"}>
                              <Text fz={24}>{30}</Text>
                              {/* <Text fz={24}>{analyticsData.num_sent}</Text> */}
                            </Flex>
                          </Box>
                          <Divider orientation="vertical" />
                          <Box
                            py={"sm"}
                            px={"xs"}
                            w={"100%"}
                            h={"100%"}
                            sx={{
                              backgroundColor: "",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#FFF7FB",
                              },
                            }}
                          >
                            <Flex align={"center"} gap={6}>
                              <IconChecks size={"0.9rem"} color="pink" className="mb-[2px]" />
                              <Text fw={400} size={"sm"}>
                                Open
                              </Text>
                            </Flex>
                            <Flex align={"center"} gap={"sm"}>
                              <Text fz={24}>{403}</Text>
                            </Flex>
                          </Box>
                          <Divider orientation="vertical" />
                          <Box
                            py={"sm"}
                            px={"xs"}
                            w={"100%"}
                            h={"100%"}
                            sx={{
                              backgroundColor: "",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#FFF9F2",
                              },
                            }}
                          >
                            <Flex align={"center"} gap={6}>
                              <IconMessageCheck size={"0.9rem"} color="orange" className="mb-[2px]" />
                              <Text fw={400} size={"sm"}>
                                Reply
                              </Text>
                            </Flex>
                            <Flex align={"center"} gap={"sm"}>
                              <Text fz={24}>{23}</Text>
                            </Flex>
                          </Box>
                          <Divider orientation="vertical" />
                          <Box
                            py={"sm"}
                            px={"xs"}
                            w={"100%"}
                            h={"100%"}
                            sx={{
                              backgroundColor: "",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#F4FBF5",
                              },
                            }}
                          >
                            <Flex align={"center"} gap={6}>
                              <IconMessageCheck size={"0.9rem"} color="green" className="mb-[2px]" />
                              <Text fw={400} size={"sm"}>
                                (+) Reply
                              </Text>
                            </Flex>
                            <Flex align={"center"} gap={"sm"}>
                              <Text fz={24}>{42}</Text>
                            </Flex>
                          </Box>
                          <Divider orientation="vertical" />
                          <Box
                            py={"sm"}
                            px={"xs"}
                            w={"100%"}
                            h={"100%"}
                            sx={{
                              backgroundColor: "",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "#F7FDFF",
                              },
                            }}
                          >
                            <Flex align={"center"} gap={6}>
                              <IconCalendar size={"0.9rem"} color={"#3B85EF"} className="mb-[2px]" />
                              <Text fw={400}>Demo</Text>
                            </Flex>
                            <Flex align={"center"} gap={"sm"}>
                              <Text fz={24}>{0}</Text>
                            </Flex>
                          </Box>
                        </Flex>
                      </Paper>
                      <Box mt={"sm"}>
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
                            <span>Sentiment Analysis</span>
                          </Text>
                          <Divider w={"100%"} />
                          <Flex>
                            <ActionIcon
                              onClick={() => {
                                if (sentimentPage > 0 || selectStep === index) setSentimentPage((page) => (page = page - 1));
                              }}
                            >
                              <IconChevronLeft />
                            </ActionIcon>
                            <ActionIcon
                              onClick={() => {
                                if (item && item.sentimentData && sentimentPage < Math.ceil(item?.sentimentData?.length / 2) - 1)
                                  setSentimentPage((page) => (page = page + 1));
                              }}
                            >
                              <IconChevronRight />
                            </ActionIcon>
                          </Flex>
                        </Flex>
                        <DataGrid
                          data={item?.sentimentData?.slice(sentimentPage * 2, sentimentPage * 2 + 2)}
                          highlightOnHover
                          withSorting
                          withColumnBorders
                          withBorder
                          // loading={loading}
                          mt={"md"}
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
                              accessorKey: "replies",
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconMessages color="gray" size={"0.9rem"} />
                                  <Text color="gray">Replies</Text>
                                </Flex>
                              ),
                              minSize: 200,
                              cell: (cell) => {
                                let { reply } = cell.row.original;

                                return (
                                  <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                    <Text color="gray" size={"sm"}>
                                      {reply}
                                    </Text>
                                  </Flex>
                                );
                              },
                            },
                            {
                              accessorKey: "intent",
                              minSize: 40,
                              maxSize: 120,
                              header: () => (
                                <Flex align={"center"} gap={"3px"}>
                                  <IconLetterT color="gray" size={"0.9rem"} />
                                  <Text color="gray">Intent</Text>
                                </Flex>
                              ),
                              cell: (cell) => {
                                let { intent }: any = cell.row.original;

                                return (
                                  <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                    <Badge color={intent === "Positive" ? "green" : "red"} tt={"initial"}>
                                      {intent}
                                    </Badge>
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
                              minSize: 180,
                              maxSize: 200,
                              enableResizing: true,
                              cell: (cell) => {
                                return (
                                  <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                    <Badge
                                      tt={"initial"}
                                      variant="filled"
                                      rightSection={<IconExternalLink size={"0.9rem"} style={{ marginTop: "5px" }} />}
                                      styles={{
                                        root: {
                                          fontWeight: 400,
                                        },
                                      }}
                                    >
                                      View Conversation
                                    </Badge>
                                  </Flex>
                                );
                              },
                            },
                          ]}
                        />
                      </Box>
                    </Box>
                  </Flex>
                  <Paper>
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
                        <span>ICP Splotlight</span>
                      </Text>
                      <Divider w={"100%"} />
                      <Flex>
                        <ActionIcon
                          onClick={() => {
                            if (icpPage > 0) setIcpPage((page) => (page = page - 1));
                          }}
                        >
                          <IconChevronLeft />
                        </ActionIcon>
                        <ActionIcon
                          onClick={() => {
                            if (icpPage < Math.ceil(item?.icpData?.length / 5) - 1) setIcpPage((page) => (page = page + 1));
                          }}
                        >
                          <IconChevronRight />
                        </ActionIcon>
                      </Flex>
                    </Flex>
                    <SimpleGrid cols={5} mt={"sm"}>
                      {item?.icpData.slice(icpPage * 5, icpPage * 5 + 5).map((icpItem: any, icpIndex: number) => {
                        return (
                          <Paper withBorder radius={"md"} key={icpIndex}>
                            <div className={`${icpIndex % 2 === 0 ? "bg-[#98a3b4]" : "bg-[#eceef1]"} h-8 flex justify-center rounded-t-lg`}>
                              <Avatar src={icpItem.avatar} size={"sm"} radius={"xl"} mt={18} color={valueToColor(theme, icpItem?.name)}>
                                {nameToInitials(icpItem?.name)}
                              </Avatar>
                            </div>
                            <Flex direction={"column"} mt={4} align={"center"} p={"sm"} justify={"space-between"} gap={4}>
                              <Text size={"sm"} align="center" fw={600}>
                                {icpItem.name}
                              </Text>
                              <Text color="gray" size={"xs"} align="center" fw={600}>
                                {icpItem.job}
                              </Text>
                              <Flex align={"center"} gap={"xs"}>
                                <Text size={"sm"} color="gray">
                                  ICP:
                                </Text>
                                <Badge>{"High"}</Badge>
                                <Text size={"sm"} color="gray">
                                  Clicks:
                                </Text>
                                <Badge color="grape">{icpItem.clicks}</Badge>
                              </Flex>
                            </Flex>
                          </Paper>
                        );
                      })}
                    </SimpleGrid>
                  </Paper>
                  <Box mt={"sm"}>
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
                        <span>Recommended Actions</span>
                      </Text>
                      <Divider w={"100%"} />
                    </Flex>
                    <SimpleGrid cols={3} mt={"sm"}>
                      {item?.recommendData.slice(0, 3).map((recommendItem: any, recommendIndex: number) => {
                        return (
                          <Paper withBorder radius={"md"} key={recommendIndex} p={"sm"}>
                            <Flex gap={4} align={"center"}>
                              <IconInfoCircle size={"0.9rem"} color="red" />
                              <Text fw={500} size={"sm"} tt={"uppercase"} color="red">
                                low perfroming template
                              </Text>
                            </Flex>
                            <Text fw={600} size={"md"} mt={3}>
                              {recommendItem.content}
                            </Text>
                            <Button radius={"md"} rightIcon={<IconArrowRight size={"0.9rem"} />} color="red" mt={"md"}>
                              Deactivate
                            </Button>
                          </Paper>
                        );
                      })}
                    </SimpleGrid>
                    <DataGrid
                      data={item?.actionsData}
                      highlightOnHover
                      withSorting
                      withColumnBorders
                      withBorder
                      // loading={loading}
                      mt={"md"}
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
                          accessorKey: "template",
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconBallpen color="gray" size={"0.9rem"} />
                              <Text color="gray">Templates</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { template } = cell.row.original;

                            return (
                              <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                <Flex>
                                  <Text color="gray" size={"sm"} w={"100%"}>
                                    {template}
                                  </Text>
                                </Flex>
                                <Flex gap={"sm"}>
                                  <Button variant="light" size="xs">
                                    Intro
                                  </Button>
                                  <Button variant="light" color="grape" size="xs">
                                    Gift
                                  </Button>
                                </Flex>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "open_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Open RAte</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { open_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{open_rate}%</Badge>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "reply_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Reply Rate</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { reply_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{reply_rate}%</Badge>
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
                          minSize: 100,
                          maxSize: 100,
                          enableResizing: true,
                          cell: (cell) => {
                            let { action }: any = cell.row.original;

                            return (
                              <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                <Switch defaultChecked={action} />
                              </Flex>
                            );
                          },
                        },
                      ]}
                      styles={{
                        dataCellContent: {
                          width: "100%",
                        },
                      }}
                    />
                    <DataGrid
                      data={item?.subjectData}
                      highlightOnHover
                      withSorting
                      withColumnBorders
                      withBorder
                      // loading={loading}
                      mt={"md"}
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
                          accessorKey: "subject_lines",
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconBallpen color="gray" size={"0.9rem"} />
                              <Text color="gray">Subject Lines</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { subject_lines } = cell.row.original;

                            return (
                              <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                <Flex>
                                  <Text color="gray" size={"sm"} w={"100%"}>
                                    {subject_lines}
                                  </Text>
                                </Flex>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "open_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Open RAte</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { open_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{open_rate}%</Badge>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "reply_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Reply Rate</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { reply_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{reply_rate}%</Badge>
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
                          minSize: 100,
                          maxSize: 100,
                          enableResizing: true,
                          cell: (cell) => {
                            let { action }: any = cell.row.original;

                            return (
                              <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                <Switch defaultChecked={action} />
                              </Flex>
                            );
                          },
                        },
                      ]}
                      styles={{
                        dataCellContent: {
                          width: "100%",
                        },
                      }}
                    />
                    <DataGrid
                      data={item?.personalizerData}
                      highlightOnHover
                      withSorting
                      withColumnBorders
                      withBorder
                      // loading={loading}
                      mt={"md"}
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
                          accessorKey: "personalizers",
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconBallpen color="gray" size={"0.9rem"} />
                              <Text color="gray">Personalizers</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { personalizers } = cell.row.original;

                            return (
                              <Flex gap={"xs"} w={"100%"} h={"100%"} px={"sm"} align={"center"} justify={"space-between"}>
                                <Flex>
                                  <Text color="gray" size={"sm"} w={"100%"}>
                                    {personalizers}
                                  </Text>
                                </Flex>
                                <Flex gap={"sm"}>
                                  <Button variant="light" color="red" size="xs">
                                    🔥 Hot
                                  </Button>
                                </Flex>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "open_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Open RAte</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { open_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{open_rate}%</Badge>
                              </Flex>
                            );
                          },
                        },
                        {
                          accessorKey: "reply_rate",
                          minSize: 40,
                          maxSize: 140,
                          header: () => (
                            <Flex align={"center"} gap={"3px"}>
                              <IconLetterT color="gray" size={"0.9rem"} />
                              <Text color="gray">Reply Rate</Text>
                            </Flex>
                          ),
                          cell: (cell) => {
                            let { reply_rate }: any = cell.row.original;

                            return (
                              <Flex gap={"sm"} w={"100%"} h={"100%"} px={"sm"} align={"center"}>
                                <Badge color="green">{reply_rate}%</Badge>
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
                          minSize: 100,
                          maxSize: 100,
                          enableResizing: true,
                          cell: (cell) => {
                            let { action }: any = cell.row.original;

                            return (
                              <Flex align={"center"} justify={"center"} gap={"xs"} py={"sm"} px={"lg"} w={"100%"} h={"100%"}>
                                <Switch defaultChecked={action} />
                              </Flex>
                            );
                          },
                        },
                      ]}
                      styles={{
                        dataCellContent: {
                          width: "100%",
                        },
                      }}
                    />
                  </Box>
                </Flex>
              </ScrollArea>
            </Collapse>
          </Box>
        );
      })}
    </Paper>
  );
}
