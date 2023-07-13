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
} from "@mantine/core";
import {
  IconBrandTelegram,
  IconGitBranch,
  IconGitCommit,
  IconGitPullRequest,
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
import { getProspectLiHistory } from "@utils/requests/getProspectHistory";
import { addProspectNote } from "@utils/requests/prospectNotes";
import _ from "lodash";

import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { MsgResponse, ProspectNote } from "src";

type HistoryEvent =
  | "CREATED"
  | "INTRO_MESSAGE"
  | "NOTE"
  | "MESSAGE"
  | "STATUS_CHANGE"
  | "DEMO_FEEDBACK";
interface HistoryItem extends Record<string, string> {
  event: HistoryEvent;
  date: string;
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
    case "MESSAGE":
      return <ThemeIcon color='blue' radius="xl"><IconMessage2 size={size} /></ThemeIcon>;
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
      return `Wrote note: "${item.message.trim()}"`;
    case "MESSAGE":
      if (item.author === "You") {
        return `Sent message: "${item.message.trim()}"`;
      } else {
        return `Received message: "${item.message.trim()}"`;
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

export default function ProspectDetailsHistory(props: { prospectId: number }) {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [history, setHistory] = useState<any>();

  useEffect(() => {
    (async () => {
      const response = await getProspectLiHistory(userToken, props.prospectId);
      setHistory(response.data);
    })();
  }, []);

  // Format the events into a sortable timeline
  let events: HistoryItem[] = [];
  if (history) {
    events.push({
      event: "CREATED",
      date: history.creation_date,
    });
    if (history.demo_feedback) {
      events.push({
        event: "DEMO_FEEDBACK",
        ...history.demo_feedback,
      });
    }
    if (history.intro_message) {
      events.push({
        event: "INTRO_MESSAGE",
        ...history.intro_message,
      });
    }
    for (const msg of history.convo) {
      events.push({
        event: "MESSAGE",
        ...msg,
      });
    }
    for (const note of history.notes) {
      events.push({
        event: "NOTE",
        ...note,
      });
    }
    for (const status of history.statuses) {
      events.push({
        event: "STATUS_CHANGE",
        ...status,
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
