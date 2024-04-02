import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { TaskHandlerLinkedinDisconnected } from "./TaskHandlers/TaskHandlerLinkedinDisconnected";
import { Box, Button, Text } from "@mantine/core";
import { IconArrowBack, IconCheck, IconX } from "@tabler/icons";
import axios from "axios";
import { TaskHandlerReviewCampaign } from "./TaskHandlers/TaskHandlerReviewLinkedinCampaign";
import { TaskHandlerSegmentCreation } from "./TaskHandlers/TaskHandlerSegmentCreation";
import { TaskHandlerDemoFeedback } from "./TaskHandlers/TaskHandlerDemoFeedback";
import { TaskHandlerSchedulingFeedback } from "./TaskHandlers/TaskHandlerSchedulingFeedback";
import { TaskHandlerCreatePrefilters } from "./TaskHandlers/TaskHandlerCreatePrefilters";
import { TaskHandlerConnectSlack } from "./TaskHandlers/TaskHandlerConnectSlack";
import { TaskHandlerConnectCalendar } from "./TaskHandlers/TaskHandlerConnectCalendar";
import { TaskHandlerAddDNCFilters } from "./TaskHandlers/TaskHandlerAddDNCFilters";
import { TaskHandlerEnrichSegment } from "./TaskHandlers/TaskHandlerEnrichSegment";
import { TaskHandlerReviewSegment } from "./TaskHandlers/TaskHandlerReviewSegment";
import { TaskHandlerRequestCampaign } from "./TaskHandlers/TaskHandlerRequestCampaign";
import { TaskHandlerViewProspect } from "./TaskHandlers/TaskHandlerViewProspect";
import { TaskHandlerVoiceBuilder } from "./TaskHandlers/TaskHandlerVoiceBuilder";
import { TaskHandlerReviewCompanyBrain } from "./TaskHandlers/TaskHandlerReviewCompanyBrain";

export interface OperatorDashboardEntry {
  id: number;
  client_sdr_id: number;
  urgency: string;
  tag: string;
  emoji: string;
  title: string;
  subtitle: string;
  cta: string;
  cta_url: string;
  status: string;
  due_date: string;
  task_type: string;
  task_data: string;
}

const TASK_ROUTER: any = {
  LINKEDIN_DISCONNECTED: {
    component: TaskHandlerLinkedinDisconnected,
    instruction: "Connect to LinkedIn then mark as complete",
    enabledCompleteButton: true,
  },
  EMAIL_CAMPAIGN_REVIEW: {
    component: TaskHandlerReviewCampaign,
    instruction: "Review the campaign then mark as complete",
    enabledCompleteButton: false,
  },
  LINKEDIN_CAMPAIGN_REVIEW: {
    component: TaskHandlerReviewCampaign,
    instruction: "Review the campaign then mark as complete",
    enabledCompleteButton: false,
  },
  SEGMENT_CREATION: {
    component: TaskHandlerSegmentCreation,
    instruction:
      "Filter from SellScale's 300m+ contacts to create a new segment to target",
    enabledCompleteButton: true,
  },
  SCHEDULING_FEEDBACK_NEEDED: {
    component: TaskHandlerSchedulingFeedback,
    instruction: "Give feedback on how the scheduling process is going",
    enabledCompleteButton: true,
  },
  DEMO_FEEDBACK_NEEDED: {
    component: TaskHandlerDemoFeedback,
    instruction: "Give feedback on how the demo went",
    enabledCompleteButton: true,
  },
  CREATE_PREFILTERS: {
    component: TaskHandlerCreatePrefilters,
    instruction: "Create pre-filters to guide AI prospecting",
    enabledCompleteButton: true,
  },
  CONNECT_SLACK: {
    component: TaskHandlerConnectSlack,
    instruction: "Connect to Slack then mark as complete",
    enabledCompleteButton: true,
  },
  ADD_DNC_FILTERS: {
    component: TaskHandlerAddDNCFilters,
    instruction: "Add DNC filters to the system then mark as complete",
    enabledCompleteButton: true,
  },
  ADD_CALENDAR_LINK: {
    component: TaskHandlerConnectCalendar,
    instruction: "Add calendar link to the system then mark as complete",
    enabledCompleteButton: true,
  },
  CONNECT_LINKEDIN: {
    component: TaskHandlerLinkedinDisconnected,
    instruction: "Connect to LinkedIn then mark as complete",
    enabledCompleteButton: true,
  },
  ENRICH_SEGMENT: {
    component: TaskHandlerEnrichSegment,
    instruction: "Enrich the segment with more data",
    enabledCompleteButton: true,
  },
  REVIEW_SEGMENT: {
    component: TaskHandlerReviewSegment,
    instruction: "Review the segment then mark as complete",
    enabledCompleteButton: true,
  },
  CAMPAIGN_REQUEST: {
    component: TaskHandlerRequestCampaign,
    instruction: "Request a new campaign then mark as complete",
    enabledCompleteButton: true,
  },
  REP_INTERVENTION_NEEDED: {
    component: TaskHandlerViewProspect,
    instruction:
      "View the prospect and take necessary action. Mark ticket as complete when done",
    enabledCompleteButton: true,
  },
  VOICE_BUILDER: {
    component: TaskHandlerVoiceBuilder,
    instruction: "Create your AI voice then mark as complete",
    enabledCompleteButton: true,
  },
  REVIEW_AI_BRAIN: {
    component: TaskHandlerReviewCompanyBrain,
    instruction: "Review your company's AI brain then mark as complete",
    enabledCompleteButton: true,
  },
};

const OperatorDashTaskRouter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userToken = useRecoilValue(userTokenState);
  const [task, setTask] = useState<OperatorDashboardEntry | null>(null);

  const [fetchingDismiss, setFetchingDismiss] = useState(false);
  const [fetchingComplete, setFetchingComplete] = useState(false);

  const navigate = useNavigate();

  const getTask = async (id: string | undefined | null) => {
    if (!id) {
      return;
    }

    const response = await fetch(
      `${API_URL}/operator_dashboard/details/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const json = await response.json();
    const data = json.data as OperatorDashboardEntry;

    setTask(data);
  };

  const getTaskHandler = (task_type: string | undefined) => {
    if (!task_type) {
      return null;
    }

    const handler = TASK_ROUTER[task_type]?.component;
    if (!handler) {
      return null;
    }
    return handler;
  };

  useEffect(() => {
    getTask(id);
  }, [id]);

  const TaskComponent = getTaskHandler(task?.task_type);

  const dismissTask = async (taskId: string) => {
    setFetchingDismiss(true);
    try {
      const response = await axios.post(
        `${API_URL}/operator_dashboard/dismiss/${taskId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.data.success) {
        console.log("Task dismissed successfully");
      }
      setFetchingDismiss(false);
      navigate("/overview");
    } catch (error) {
      setFetchingDismiss(false);
      console.error("Error dismissing task", error);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    setFetchingComplete(true);
    try {
      const response = await axios.post(
        `${API_URL}/operator_dashboard/mark_complete/${taskId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.data.success) {
        console.log("Task marked complete successfully");
      }
      setFetchingComplete(false);
      navigate("/overview");
    } catch (error) {
      setFetchingComplete(false);
      console.error("Error marking task complete", error);
    }
  };

  return (
    <Box>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Button
          variant="subtle"
          color="gray"
          mr="xs"
          leftIcon={<IconArrowBack size="0.8rem" />}
          onClick={() => navigate("/overview")}
        >
          Go back to tasks
        </Button>

        <Box pr="md" sx={{ width: "60%" }}>
          <Text weight="bold" size="lg">
            {task?.title}
          </Text>
          {task?.subtitle && (
            <Text size="xs" style={{ display: "block" }}>
              {task?.subtitle}. Then mark as complete.
            </Text>
          )}
        </Box>

        <Button
          variant="outline"
          loading={fetchingDismiss}
          onClick={() => (id ? dismissTask(id) : null)}
          color="red"
          mr="xs"
          leftIcon={<IconX size="0.8rem" />}
        >
          Dismiss task
        </Button>
        <Button
          variant="filled"
          color="green"
          leftIcon={<IconCheck size="0.8rem" />}
          loading={fetchingComplete}
          onClick={() => {
            id ? markTaskComplete(id) : null;
          }}
          disabled={
            task?.task_type
              ? !TASK_ROUTER[task?.task_type]?.enabledCompleteButton
              : false
          }
        >
          Mark task complete
        </Button>
      </Box>
      {TaskComponent && (
        <TaskComponent
          data={task?.task_data}
          onTaskComplete={() => id && markTaskComplete(id)}
          taskType={task?.task_type}
          taskId={task?.id}
        />
      )}
    </Box>
  );
};

export default OperatorDashTaskRouter;
