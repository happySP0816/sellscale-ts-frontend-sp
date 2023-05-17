import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import ReactMarkdown from "react-markdown";
import { ProspectEmail } from "src";

export default function ViewEmailModal({
  context,
  id,
  innerProps,
}: ContextModalProps<ProspectEmail>) {

  const theme = useMantineTheme();

  return (
    <Paper
      p={0}
      sx={(theme) => ({
        position: "relative",
        backgroundColor: theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.white,
      })}
    >
      <ReactMarkdown>{innerProps.body}</ReactMarkdown>
      <Divider />
      <Text fz="sm" c="dimmed">
        Sent on {new Date(innerProps.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </Text>
    </Paper>
  );
}
