import {
  createStyles,
  Card,
  Badge,
  Text,
  Box,
  SimpleGrid,
  UnstyledButton,
  Collapse,
  Button,
  Group,
  Flex,
  SegmentedControl,
  Center,
  LoadingOverlay,
  Select,
  ScrollArea,
  Modal,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  IconHeartHandshake,
  IconMailboxOff,
  IconSend,
  IconClick,
  IconMail,
  IconMailForward,
  IconMailOpened,
  IconNotification,
  IconChartBubble,
  IconCalendar,
  IconX,
  IconQuestionMark,
  IconCalendarEvent,
  IconConfetti,
  IconFaceIdError,
  IconTrash,
  IconBrandLinkedin,
  IconMessageDots,
  IconSeeding,
  IconAlarm,
} from "@tabler/icons";
import { startCase } from "lodash";
import displayNotification from "@utils/notificationFlow";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { formatToLabel, splitName, valueToColor } from "@utils/general";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Channel, DemoFeedback, ProspectDetails } from "src";
import { getChannelStatusOptions } from "@utils/requests/getChannels";
import { API_URL } from "@constants/data";
import ProspectDemoDateSelector from "./ProspectDemoDateSelector";
import {
  demosDrawerOpenState,
  demosDrawerProspectIdState,
} from "@atoms/dashboardAtoms";
import DemoFeedbackDrawer from "@drawers/DemoFeedbackDrawer";
import DemoFeedbackCard from "@common/demo_feedback/DemoFeedbackCard";
import { getProspectByID } from "@utils/requests/getProspectByID";
import getDemoFeedback from "@utils/requests/getDemoFeedback";
import { DatePicker } from "@mantine/dates";
import { snoozeProspect } from "@utils/requests/snoozeProspect";

const linkedinStatusOptions = [
  {
    title: "Accepted Invite",
    icon: IconHeartHandshake,
    color: "yellow",
    status: "ACCEPTED",
  },
  {
    title: "Sent Outreach",
    icon: IconMail,
    color: "orange",
    status: "SENT_OUTREACH",
  },
  {
    title: "Bumped",
    icon: IconNotification,
    color: "orange",
    status: "RESPONDED",
  },
  {
    title: "Active Convo",
    icon: IconChartBubble,
    color: "orange",
    status: "ACTIVE_CONVO",
  },
  {
    title: "Scheduling",
    icon: IconCalendar,
    color: "pink",
    status: "SCHEDULING",
  },
  {
    title: "Demo Set",
    icon: IconCalendarEvent,
    color: "pink",
    status: "DEMO_SET",
  },
  {
    title: "Demo Complete",
    icon: IconConfetti,
    color: "green",
    status: "DEMO_WON",
  },
  {
    title: "Not Interested",
    icon: IconSeeding,
    color: "green",
    status: "NOT_INTERESTED",
  },
  {
    title: "Demo Lost",
    icon: IconFaceIdError,
    color: "red",
    status: "DEMO_LOSS",
  },
  {
    title: "Not Qualified",
    icon: IconTrash,
    color: "red",
    status: "NOT_QUALIFIED",
  },
  {
    title: "Queued for Outreach",
    icon: IconMessageDots,
    color: "cyan",
    status: "QUEUED_FOR_OUTREACH",
  },
];

const emailStatusOptions = [
  {
    title: "Bounced",
    icon: IconMailboxOff,
    color: "gray",
    status: "BOUNCED",
  },
  {
    title: "Not Sent",
    icon: IconMailboxOff,
    color: "gray",
    status: "NOT_SENT",
  },
  {
    title: "Sent Email",
    icon: IconSend,
    color: "orange",
    status: "SENT_OUTREACH",
  },
  {
    title: "Email Opened",
    icon: IconMailOpened,
    color: "yellow",
    status: "EMAIL_OPENED",
  },
  {
    title: "Email Clicked",
    icon: IconClick,
    color: "blue",
    status: "ACCEPTED",
  },
  {
    title: "Email Replied",
    icon: IconMailForward,
    color: "orange",
    status: "ACTIVE_CONVO",
  },
  {
    title: "Sent Email",
    icon: IconSend,
    color: "orange",
    status: "SENT_OUTREACH",
  },
  {
    title: "Scheduling",
    icon: IconCalendar,
    color: "pink",
    status: "SCHEDULING",
  },
  {
    title: "Demo Set",
    icon: IconCalendarEvent,
    color: "pink",
    status: "DEMO_SET",
  },
  {
    title: "Demo Complete",
    icon: IconConfetti,
    color: "green",
    status: "DEMO_WON",
  },
  {
    title: "Demo Lost",
    icon: IconFaceIdError,
    color: "red",
    status: "DEMO_LOST",
  },
  {
    title: "Not Interested",
    icon: IconSeeding,
    color: "green",
    status: "NOT_INTERESTED",
  },
];

const dontShowStatuses = [
  "UNKNOWN",
  "PROSPECTED",
  "ACTIVE_CONVO_OBJECTION",
  "ACTIVE_CONVO_NEXT_STEPS",
  "ACTIVE_CONVO_QUAL_NEEDED",
  "ACTIVE_CONVO_QUESTION",
  "ACTIVE_CONVO_SCHEDULING",
  "ACTIVE_CONVO_REVIVAL",
  "ACTIVE_CONVO_CONTINUE_SEQUENCE",
  "ACTIVE_CONVO_QUEUED_FOR_SNOOZE",
];

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: 90,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "scale(1.05)",
    },
  },
}));

export function channelToIcon(channel: Channel, size: number) {
  switch (channel) {
    case "LINKEDIN":
      return <IconBrandLinkedin size={16} />;
    case "EMAIL":
      return <IconMail size={16} />;
    default:
      return <IconQuestionMark size={size} />;
  }
}

/**
 * Send attempting reschedule notification to a prospect.
 * @param {string} userToken - The token for user authentication.
 * @param {number} prospectId - The ID of the prospect.
 * @returns {Promise<{status: string, message: string}>} - The result of the operation.
 */
export async function sendAttemptingRescheduleNotification(
  userToken: string,
  prospectId: number
) {
  try {
    const response = await fetch(`${API_URL}/prospect/${prospectId}/send_attempting_reschedule_notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ })
    });

    if (response.ok) {
      return { status: 'success', message: 'Notification sent successfully.' };
    } else {
      const errorData = await response.json();
      return { status: 'error', message: errorData.message || 'Failed to send notification.' };
    }
  } catch (error) {
    console.error('Error sending attempting reschedule notification:', error);
    return { status: 'error', message: 'An error occurred while sending the notification.' };
  }
}


export async function updateChannelStatus(
  prospectId: number,
  userToken: string,
  channelType: Channel,
  newStatus: string,
  override: boolean = false,
  quietly: boolean = false,
  disqualification_reason: null | string = null
) {
  return await fetch(
    `${API_URL}/prospect/${prospectId}`,
    {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_status: newStatus,
      channel_type: channelType,
      override_status: override,
      quietly: quietly,
      disqualification_reason: disqualification_reason,
    }),
  })
    .then(async (r) => {
      if ((r.status + "").startsWith("2")) {
        return {
          status: "success",
          title: `Success`,
          message: `Status updated.`,
        };
      } else {
        return {
          status: "error",
          title: `Error (${r.status})`,
          message: await r.text(),
        };
      }
    })
    .catch((e) => {
      console.error(e);
      return {
        status: "error",
        title: `Error while updating`,
        message: e.message,
      };
    });
}

type ProspectDetailsChangeStatusProps = {
  prospectId: number;
  prospectName: string;
  prospectDemoDate: any;
  channelData: {
    data: any;
    value: Channel;
    currentStatus: string;
  };
};

export default function ProspectDetailsChangeStatus(
  props: ProspectDetailsChangeStatusProps
) {
  const { classes, theme } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  const [openedSnoozeModal, setOpenedSnoozeModal] = useState(false);

  const items = [];

  const [demosDrawerOpened, setDemosDrawerOpened] =
    useRecoilState(demosDrawerOpenState);
  const [drawerProspectId, setDrawerProspectId] = useRecoilState(
    demosDrawerProspectIdState
  );

  const { data: prospectData } = useQuery({
    queryKey: [`query-get-dashboard-prospect-${props.prospectId}`],
    queryFn: async () => {
      const response = await getProspectByID(userToken, props.prospectId);
      return response.status === "success"
        ? (response.data as ProspectDetails)
        : undefined;
    },
    enabled: props.prospectId !== -1,
  });

  const { data: demoFeedbacks, refetch: refreshDemoFeedback } = useQuery({
    queryKey: [`query-get-prospect-demo-feedback-${props.prospectId}`],
    queryFn: async () => {
      const response = await getDemoFeedback(userToken, props.prospectId);
      return response.status === "success"
        ? (response.data as DemoFeedback[])
        : undefined;
    },
    enabled: props.prospectId !== -1,
  });

  useEffect(() => {
    refreshDemoFeedback();
  }, [prospectData]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `prospect-next-status-options-${props.prospectId}-${props.channelData.value}`,
    ],
    queryFn: async () => {
      const res = await getChannelStatusOptions(
        props.prospectId,
        userToken,
        props.channelData.value
      );
      if (res.status === "success") {
        return Object.keys(res.data.valid_next_statuses).map(
          (k) => res.data.valid_next_statuses[k].enum_val
        );
      } else {
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  for (const statusValue of (data ? data : []).filter(
    (s: string) =>
      !dontShowStatuses.includes(s) &&
      !(
        props.channelData.currentStatus?.startsWith("ACTIVE_CONVO") &&
        s === "ACTIVE_CONVO"
      )
  )) {
    let status: any = null;
    if (props.channelData.value === "EMAIL") {
      status = emailStatusOptions.find((o) => o.status === statusValue);
    } else if (props.channelData.value === "LINKEDIN") {
      status = linkedinStatusOptions.find((o) => o.status === statusValue);
    }
    if (!status) {
      status = {
        title: startCase(statusValue),
        icon: IconQuestionMark,
        color: "blue",
        status: statusValue,
      };
    }

    items.push(
      <UnstyledButton
        key={status.status}
        className={classes.item}
        onClick={async () => {
          await changeStatus(status);
        }}
        sx={{
          border: "solid 1px #333",
        }}
      >
        <status.icon color={theme.colors[status.color][6]} size={32} />
        <Text size="xs" mt={7}>
          {status.title}
        </Text>
      </UnstyledButton>
    );
  }
  items.push(
    <UnstyledButton
      key={"snooze"}
      className={classes.item}
      onClick={async () => {
        setOpenedSnoozeModal(true);
      }}
      sx={{
        border: "solid 1px #333",
      }}
    >
      <IconAlarm color={theme.colors.yellow[6]} size={32} />
      <Text size="xs" mt={7}>
        Snooze
      </Text>
    </UnstyledButton>
  );

  const changeStatus = async (status: { title: string; status: string }) => {
    await displayNotification(
      "change-prospect-status",
      async () => {
        let result = await updateChannelStatus(
          props.prospectId,
          userToken,
          props.channelData.value,
          status?.status as string
        );
        if (result.status === "success") {
          // This will make the queries rerun and update the UI
          queryClient.invalidateQueries({
            queryKey: [`query-prospect-details-${props.prospectId}`],
          });
          queryClient.invalidateQueries({
            queryKey: ["query-pipeline-prospects-all"],
          });
          queryClient.invalidateQueries({
            queryKey: ["query-pipeline-details"],
          });
          queryClient.invalidateQueries({
            queryKey: ["query-get-channels-prospects"],
          });
          refetch();
        }
        return result;
      },
      {
        title: `Updating Status`,
        message: `Working with servers...`,
        color: "teal",
      },
      {
        title: `Updated!`,
        message: `Status is now "${status?.title}"!`,
        color: "teal",
      },
      {
        title: `Error while updating!`,
        message: `Please try again later.`,
        color: "red",
      }
    );
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group position="apart">
        <Text weight={700} size="lg">
          {`${formatToLabel(props.channelData.value)} Status`}
        </Text>
        <Badge
          color={valueToColor(
            theme,
            formatToLabel(props.channelData.currentStatus)
          )}
          variant="light"
        >
          {formatToLabel(props.channelData.currentStatus)}
        </Badge>
      </Group>
      <Text mb="xs" fz="sm" c="dimmed">{`Adjust ${
        splitName(props.prospectName).first
      }'s ${formatToLabel(props.channelData.value)} status.`}</Text>
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {!props.channelData.currentStatus?.includes("DEMO") ? (
        <SimpleGrid cols={3} mt="md">
          {items}
        </SimpleGrid>
      ) : (
        <>
          {demoFeedbacks && demoFeedbacks.length > 0 && prospectData && (
            <ScrollArea h="250px">
              {demoFeedbacks?.map((feedback, index) => {
                return (
                  <div style={{ marginBottom: 10 }}>
                    <DemoFeedbackCard
                      prospect={prospectData.data}
                      index={index + 1}
                      demoFeedback={feedback}
                      refreshDemoFeedback={refreshDemoFeedback}
                    />
                  </div>
                );
              })}
            </ScrollArea>
          )}

          <Button
            variant="light"
            radius="md"
            fullWidth
            onClick={() => {
              setDrawerProspectId(props.prospectId);
              setDemosDrawerOpened(true);
            }}
          >
            {demoFeedbacks && demoFeedbacks.length > 0 ? "Add" : "Give"} Demo
            Feedback
          </Button>
        </>
      )}

      <DemoFeedbackDrawer
        refetch={refetch}
        onSubmit={() => {
          queryClient.refetchQueries({
            queryKey: [`query-prospect-details-${props.prospectId}`],
          });
        }}
      />

      {props.channelData.currentStatus &&
        props.channelData.currentStatus.includes("DEMO") &&
        !demoFeedbacks && (
          <ProspectDemoDateSelector prospectId={props.prospectId} />
        )}
      {props.channelData.currentStatus?.startsWith("ACTIVE_CONVO") && (
        <Select
          mt={15}
          label="Conversation Substatus"
          placeholder="The state of the active conversation"
          clearable
          data={[
            { value: "ACTIVE_CONVO_QUESTION", label: "Question" },
            {
              value: "ACTIVE_CONVO_QUAL_NEEDED",
              label: "Qualifications Needed",
            },
            { value: "ACTIVE_CONVO_OBJECTION", label: "Objection" },
            { value: "ACTIVE_CONVO_SCHEDULING", label: "Scheduling" },
            { value: "ACTIVE_CONVO_NEXT_STEPS", label: "Next Steps" },
            { value: "ACTIVE_CONVO_REVIVAL", label: "Queued for AI Revival" },
            { value: "ACTIVE_CONVO_CONTINUE_SEQUENCE", label: "Continue Convo" },
            { value: "ACTIVE_CONVO_QUEUED_FOR_SNOOZE", label: "Queue for Snooze" },
          ]}
          defaultValue={props.channelData.currentStatus}
          onChange={async (value) => {
            if (!value) {
              await changeStatus({
                title: "Active Conversation",
                status: "ACTIVE_CONVO",
              });
            } else {
              await changeStatus({
                title: formatToLabel(value),
                status: value,
              });
            }
          }}
        />
      )}

      <Modal
        opened={openedSnoozeModal}
        onClose={() => setOpenedSnoozeModal(false)}
        title="Snooze Prospect"
      >
        <Center>
          <DatePicker
            minDate={new Date()}
            onChange={async (date) => {
              if (!date) {
                return;
              }
              let timeDiff = date.getTime() - new Date().getTime();
              let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              await displayNotification(
                "snooze-prospect",
                async () => {
                  let result = await snoozeProspect(
                    userToken,
                    props.prospectId,
                    daysDiff
                  );
                  return result;
                },
                {
                  title: `Snoozing prospect for ${daysDiff} days...`,
                  message: `Working with servers...`,
                  color: "teal",
                },
                {
                  title: `Snoozed!`,
                  message: `Your prospect has been snoozed from outreach for ${daysDiff} days.`,
                  color: "teal",
                },
                {
                  title: `Error while snoozing your prospect.`,
                  message: `Please try again later.`,
                  color: "red",
                }
              );
              setOpenedSnoozeModal(false);
              
              // This will make the queries rerun and update the UI
              queryClient.invalidateQueries({
                queryKey: [`query-prospect-details-${props.prospectId}`],
              });
              queryClient.invalidateQueries({
                queryKey: ["query-pipeline-prospects-all"],
              });
              queryClient.invalidateQueries({
                queryKey: ["query-pipeline-details"],
              });
              queryClient.invalidateQueries({
                queryKey: ["query-get-channels-prospects"],
              });
              refetch();
            }}
          />
        </Center>
      </Modal>
    </Card>
  );
}
