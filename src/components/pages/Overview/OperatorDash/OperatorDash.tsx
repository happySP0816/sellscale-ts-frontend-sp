import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import {
  Card,
  Text,
  Title,
  Button,
  Group,
  Box,
  Flex,
  useMantineTheme,
  Loader,
  Stack,
  Grid,
  Badge,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCircle,
  IconCircleCheck,
  IconTargetArrow,
} from "@tabler/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import DashboardSection from "./DashboardSection";
import RecommendedSegments from "./RecommendedSegments";
import WhiteLogo from "../../../../../public/favicon.svg";

export interface Task {
  id: number;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "COMPLETED" | "DISMISSED";
  emoji: string;
  title: string;
  subtitle: string;
  cta: string;
  cta_url: string;
  due_date: string; // or Date if you convert the date string to a Date object
  tag: string;
  task_type: string;
  task_data: Record<string, any>;
}

type PropsType = {
  onOperatorDashboardEntriesChange: (entries: Task[]) => void;
};

const OperatorDashboard = (props: PropsType) => {
  const [highPriorityTasks, setHighPriorityTasks] = useState<Task[]>([]);
  const [mediumPriorityTasks, setMediumPriorityTasks] = useState<Task[]>([]);
  const [lowPriorityTasks, setLowPriorityTasks] = useState<Task[]>([]);
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);
  const [oldTasks, setOldTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  const [fetchingComplete, setFetchingComplete] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/operator_dashboard/all`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        setLoading(false);

        const tasks = response.data.entries;
        console.log(tasks);
        categorizeTasks(tasks);
        setPriorityTasks(
          tasks.filter((data: any) => data.status === "PENDING")
        );

        const incompleteTasks = tasks.filter(
          (task: Task) => task.status === "PENDING"
        );
        props.onOperatorDashboardEntriesChange(incompleteTasks);
      } catch (error) {
        console.error("Error fetching tasks", error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userToken]);

  const categorizeTasks = (tasks: Task[]) => {
    const high: Task[] = [],
      medium: Task[] = [],
      low: Task[] = [],
      old: Task[] = [];

    tasks.forEach((task: Task) => {
      if (task.status !== "PENDING") {
        old.push(task);
      } else {
        switch (task.urgency) {
          case "HIGH":
            high.push(task);
            break;
          case "MEDIUM":
            medium.push(task);
            break;
          case "LOW":
            low.push(task);
            break;
          default:
            break;
        }
      }
    });

    // setHighPriorityTasks(high);
    // setMediumPriorityTasks(medium);
    // setLowPriorityTasks(low);
    setOldTasks(old);
  };

  const redirectToTask = async (taskId: number) => {
    setCurrentTaskId(taskId);
    setFetchingComplete(true);
    navigate(`/task/${taskId}`);
  };

  const theme = useMantineTheme();

  const renderTaskCard = (task: Task) => {
    return (
      <Grid.Col span={4} mt={"sm"}>
        <Card withBorder mb="xs" p="md" key={task.id} h={"100%"}>
          <Flex
            direction={"column"}
            gap={"sm"}
            justify={"space-between"}
            h={"100%"}
          >
            <Flex align={"center"} justify={"space-between"}>
              <Flex
                sx={{
                  borderRadius: "100px",
                  textAlign: "center",
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                }}
                justify={"center"}
                align={"center"}
                bg={
                  task.status === "COMPLETED"
                    ? theme.colors.green[2]
                    : task.status === "PENDING" && task.urgency === "HIGH"
                    ? theme.colors.red[2]
                    : task.status === "PENDING" && task.urgency === "MEDIUM"
                    ? theme.colors.orange[2]
                    : task.status === "PENDING" && task.urgency === "LOW"
                    ? theme.colors.gray[2]
                    : theme.colors.green[2]
                }
              >
                {task.emoji}
              </Flex>
              {task.status === "PENDING" && task.urgency === "HIGH" && (
                <Badge size="lg" color={"red"}>
                  High Priority
                </Badge>
              )}
            </Flex>
            <Box>
              <Title order={5} lineClamp={2}>
                {task.title}
              </Title>
              <Text color="#666" size="sm" lineClamp={4}>
                {task.subtitle}
              </Text>
              {/* <Text color='gray' fw='600' fz='xs' mt='xs'>
                Due on {moment(task.due_date).format('MMM Do YYYY')}
              </Text> */}
            </Box>
            {task.status !== "PENDING" ? (
              <Button
                component="a"
                w={"fit-content"}
                variant="outline"
                color={"green"}
                // onClick={() => redirectToTask(task.id)}
                disabled={true}
                loading={fetchingComplete && currentTaskId === task.id}
              >
                {"  "}{" "}
                <IconCircleCheck size={16} color={theme.colors.gray[5]} />
                Reviewed
              </Button>
            ) : (
              <Button
                component="a"
                w={"fit-content"}
                variant="outline"
                color={"red"}
                onClick={() => redirectToTask(task.id)}
                loading={fetchingComplete && currentTaskId === task.id}
              >
                Review
                {"  "} <IconArrowRight size={16} color="red" />
              </Button>
            )}
          </Flex>
        </Card>
      </Grid.Col>
    );
  };

  const renderSection = (title: string, tasks: Task[]) => {
    if (tasks.length === 0) return null;

    return (
      <DashboardSection
        tasks={tasks}
        title={title}
        content={<Grid>{tasks.map(renderTaskCard)}</Grid>}
        defaultOpen={title !== "Completed"}
      />
    );
  };

  if (loading) {
    return (
      <Card shadow="sm" p="lg">
        <Loader ml="auto" mr="auto" />
      </Card>
    );
  }

  return (
    <Box py="lg">
      <Stack>
        {/* {renderSection('High Priority', highPriorityTasks)}
        {renderSection('Medium Priority', mediumPriorityTasks)}
        {renderSection('Low Priority', lowPriorityTasks)} */}
        {renderSection("Recent Updates", priorityTasks)}
        <RecommendedSegments />
        {renderSection("Completed", oldTasks)}
      </Stack>
    </Box>
  );
};

export default OperatorDashboard;
