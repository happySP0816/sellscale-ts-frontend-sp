import {
  prospectDrawerNotesState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  createStyles,
  Card,
  Text,
  Timeline,
  Button,
  Group,
  Flex,
  Modal,
  Textarea,
  Badge,
  useMantineTheme,
  MantineTheme,
  Box,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import {
  IconBrandLinkedin,
  IconBrandTelegram,
  IconGitBranch,
  IconGitCommit,
  IconGitPullRequest,
  IconMail,
  IconMessage2,
  IconMessageDots,
  IconNotebook,
  IconReportAnalytics,
  IconStatusChange,
  IconUserPlus,
} from "@tabler/icons";
import {
  convertDateToCasualTime,
  formatToLabel,
  splitName,
  valueToColor,
} from "@utils/general";
import displayNotification from "@utils/notificationFlow";
import { getProspectHistory } from "@utils/requests/getProspectHistory";
import { addProspectNote } from "@utils/requests/prospectNotes";
import _ from "lodash";

import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { MsgResponse, ProspectNote } from "src";

type HistoryEvent =
  | "CREATED"
  | "INTRO_MESSAGE"
  | "NOTE"
  | "LINKEDIN_MESSAGE"
  | "EMAIL_MESSAGE"
  | "STATUS_CHANGE"
  | "DEMO_FEEDBACK";

type Channel = "LINKEDIN" | "EMAIL";
interface HistoryItem extends Record<string, string> {
  event: HistoryEvent;
  date: string;
  channel: Channel
}

function historyEventToIcon(event: HistoryEvent, size?: number) {
  size = size || 12;
  switch (event) {
    case "CREATED":
      return <ThemeIcon color='green' radius="xl"><IconUserPlus size={size} /></ThemeIcon>;
    case "INTRO_MESSAGE":
      return <ThemeIcon color='teal' radius="xl"><IconBrandTelegram size={size} /></ThemeIcon>;
    case "NOTE":
      return <ThemeIcon color='indigo' radius="xl"><IconNotebook size={size} /></ThemeIcon>;
    case "LINKEDIN_MESSAGE":
      return <ThemeIcon color='blue' radius="xl"><IconBrandLinkedin size={size} /></ThemeIcon>;
    case "EMAIL_MESSAGE":
      return <ThemeIcon color='blue' radius="xl"><IconMail size={size} /></ThemeIcon>;
    case "STATUS_CHANGE":
      return <ThemeIcon color='yellow' radius="xl"><IconStatusChange size={size} /></ThemeIcon>;
    case "DEMO_FEEDBACK":
      return <ThemeIcon color='grape' radius="xl"><IconReportAnalytics size={size} /></ThemeIcon>;
    default:
      return <></>;
  }
}
function historyEventToDescription(theme: MantineTheme, item: HistoryItem) {
  switch (item.event) {
    case "CREATED":
      return `Prospect created`;
    case "INTRO_MESSAGE":
      return `Sent outreach: "${item.message.trim()}"`;
    case "NOTE":
      return `Updated note: "${item.message.trim()}"`;
    case "LINKEDIN_MESSAGE":
      if (item.author === "You") {
        return `Sent message: "${item.message.trim()}"`;
      } else {
        return `Received message: "${item.message.trim()}"`;
      }
    case "EMAIL_MESSAGE":
      if (item.from_sdr) {
        return `Sent email: "${item.email_body}"`;
      } else {
        return `Received email: "${item.email_body}"`;
      }
    case "STATUS_CHANGE":
      return (
        <>
          Status changed to{" "}
          {/* <Badge color={valueToColor(theme, formatToLabel(item.from))} size='xs'>
            {formatToLabel(item.from)}
          </Badge>{" "}
          to{" "} */}
          <Badge color={valueToColor(theme, formatToLabel(item.to))} size='xs'>
            {formatToLabel(item.to)}
          </Badge>
        </>
      );
    case "DEMO_FEEDBACK":
      return `Wrote demo feedback: ${item.status}, ${item.rating}, "${item.feedback.trim()}"`;
    default:
      return <></>;
  }
}

export default function ProspectDetailsHistory(props: { prospectId: number, forceRefresh: boolean }) {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [linkedinHistory, setLinkedInHistory] = useState<any>();
  const [emailHistory, setEmailHistory] = useState<any>();
  const [historyFetchedForId, setHistoryFetchedForId] = useState<number>(-1);
  const [loadingHistory, setLoadingHistory] = useState(false);

  if (historyFetchedForId !== props.prospectId) {
    setHistoryFetchedForId(props.prospectId);
    setLoadingHistory(true);
    (async () => {
      const response = await getProspectHistory(userToken, props.prospectId);
      setLinkedInHistory(response.data.linkedin);
      setEmailHistory(response.data.email);
      setLoadingHistory(false);
    })();
    
  }

  useEffect(() => {
    setHistoryFetchedForId(props.prospectId);
    setLoadingHistory(true);
    (async () => {
      const response = await getProspectHistory(userToken, props.prospectId);
      setLinkedInHistory(response.data.linkedin);
      setEmailHistory(response.data.email);
      setLoadingHistory(false);
    })();
  }, [props.forceRefresh]);

  // Format the events into a sortable timeline
  let events: HistoryItem[] = [];
  if (linkedinHistory) {
    events.push({
      event: "CREATED",
      date: linkedinHistory.creation_date,
      channel: "LINKEDIN"
    });
    if (linkedinHistory.demo_feedback) {
      events.push({
        event: "DEMO_FEEDBACK",
        ...linkedinHistory.demo_feedback,
        channel: "LINKEDIN"
      });
    }
    if (linkedinHistory.intro_message) {
      events.push({
        event: "INTRO_MESSAGE",
        ...linkedinHistory.intro_message,
        channel: "LINKEDIN"
      });
    }
    for (const msg of linkedinHistory.convo) {
      events.push({
        event: "LINKEDIN_MESSAGE",
        ...msg,
        channel: "LINKEDIN"
      });
    }
    for (const note of linkedinHistory.notes) {
      events.push({
        event: "NOTE",
        ...note,
        channel: "LINKEDIN"
      });
    }
    for (const status of linkedinHistory.statuses) {
      events.push({
        event: "STATUS_CHANGE",
        ...status,
        channel: "LINKEDIN"
      });
    }
  }

  if (emailHistory) {
    for (const status of emailHistory.email_statuses) {
      events.push({
        event: "STATUS_CHANGE",
        ...status,
        channel: "EMAIL"
      });
    }
    for (const msg of emailHistory.emails) {
      events.push({
        event: "EMAIL_MESSAGE",
        ...msg,
        channel: "EMAIL"
      });
    }
  }


  // Remove status change dupes that seem to be a bug in the backend
  events = _.uniqWith(events, (obj1, obj2) => {
    return _.isEqual(_.omit(obj1, 'date'), _.omit(obj2, 'date'));
  });
  events = _.sortBy(events, (item) => new Date(item.date));
  // sort reversed
  events = events.reverse();

  if (loadingHistory) {
    return (
      <Box p='xs'>
        <Loader m='auto auto'/>
      </Box>
    );
  }

  return (
    <Box p='xs'>
      <Timeline bulletSize={24} lineWidth={2}>
        {events?.map((item, i) => (
          <Timeline.Item
            key={i}
            title={_.startCase(item.event.toLowerCase())}
            bullet={historyEventToIcon(item.event)}
            lineVariant="dashed"
          >
            <Text color="dimmed" size="xs">
              {historyEventToDescription(theme, item)}
            </Text>
            <Text size="xs" mt={4}>
              {convertDateToCasualTime(new Date(item.date))}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </Box>
  );
}
