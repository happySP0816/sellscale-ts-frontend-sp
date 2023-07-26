import ICPFitPill from "@common/pipeline/ICPFitAndReason";
import { Paper, Flex, Avatar, Box, Text, Button } from "@mantine/core";
import { proxyURL, convertDateToLocalTime } from "@utils/general";
import { DemoFeedback, Prospect } from "src";

export default function DemoFeedbackCard(props: { prospect: Prospect, demoFeedback?: DemoFeedback }) {
  return (
    <Paper withBorder p="xs" radius="md" sx={{ position: "relative" }}>
      <Flex justify="space-between">
        <div>
          <Avatar
            size="md"
            radius="xl"
            src={proxyURL(props.prospect.img_url)}
          />
        </div>
        <div style={{ flexGrow: 1, marginLeft: 10 }}>
          <Text fw={700} fz="sm">
            Demo with {props.prospect.full_name}
          </Text>
          <Text fz="sm" c="dimmed">
            {convertDateToLocalTime(new Date(props.prospect.demo_date))}
          </Text>
        </div>
      </Flex>
      <Box sx={{ position: "absolute", right: 10, top: 10 }}>
        {props.demoFeedback && false ? (// TEMP DISABLED
          <Button color="green" compact>
            Edit
          </Button>
        ) : (
          <ICPFitPill
            icp_fit_score={props.prospect.icp_fit_score}
            icp_fit_reason={props.prospect.icp_fit_reason}
            archetype={props.prospect.archetype_name}
          />
        )}
      </Box>

      {props.demoFeedback && (
        <>
          <Box mt={5}>
            <Text fz="sm">
              <b>Status</b> {props.demoFeedback.status}
            </Text>
            <Text fz="sm">
              <b>Rating</b> {props.demoFeedback.rating}
            </Text>
          </Box>
          <Box>
            <Text fz="sm" fw={700}>
              Feedback
            </Text>
            <Text fz="sm">
              {props.demoFeedback.feedback}
            </Text>
          </Box>
        </>
      )}

    </Paper>
  );
}
