import { Paper, rem, createStyles, Text, Badge } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { ratingToLabel } from "@common/charts/DemoFeedbackChart";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export default function DemoFeedbackDetailsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  company: string;
  demoDate: string;
  demoRating: string;
  fullName: string;
  prospectId: string;
  demoFeedback: string;
  refetch: () => void;
}>) {
  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <Text mb="xs">
        <b>Company:</b> {innerProps.company}
      </Text>
      <Text mb="xs">
        <b>Demo Date:</b> {innerProps.demoDate}
      </Text>
      <Text mb="xs">
        <b>Demo Rating:</b>
        <br />
        <Badge>{ratingToLabel(innerProps.demoRating)}</Badge>
        <br />
        {new Array(parseInt(innerProps.demoRating.split("/")[0])).join("★") +
          "★"}
      </Text>
      <Text mb="xs">
        <b>Demo Feedback:</b>
        <br /> {innerProps.demoFeedback}
      </Text>
    </Paper>
  );
}
