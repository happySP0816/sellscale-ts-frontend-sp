import ICPFitPill from "@common/pipeline/ICPFitAndReason";
import { Paper, Flex, Avatar, Box, Text, Button, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import EditDemoFeedbackModal from "@modals/EditDemoFeedbackModal";
import { IconPencil } from "@tabler/icons";
import { proxyURL, convertDateToLocalTime } from "@utils/general";
import { DemoFeedback, Prospect } from "src";

export default function DemoFeedbackCard(props: { prospect: Prospect, index?: number, demoFeedback?: DemoFeedback, refreshDemoFeedback?: () => void }) {
  
  if (props.demoFeedback === undefined) return <></>;
  
  const [editDemoFeedbackModal, { open: openEditDemoFeedbackModal, close: closeeditDemoFeedbackModal }] = useDisclosure()
  
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      sx={{ position: "relative" }}
    >
      <Flex justify="space-between">
        <Flex direction='row'>
          <Avatar
            size="md"
            radius="xl"
            mr='4px'
            src={proxyURL(props.prospect.img_url)}
          />
          <Flex direction='column'>
            <Text fw={700} fz="sm">
              Demo {props.index && `#${props.index}`} with {props.prospect.full_name}
            </Text>
            <Text fz="sm" c="dimmed">
              {new Date(props.demoFeedback.demo_date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </Flex>
        </Flex>
        <Flex>
          <ActionIcon size='xs' variant='transparent' onClick={openEditDemoFeedbackModal}>
            <IconPencil size={"1rem"} />
          </ActionIcon>
          <EditDemoFeedbackModal
            modalOpened={editDemoFeedbackModal}
            openModal={openEditDemoFeedbackModal}
            closeModal={closeeditDemoFeedbackModal}
            backFunction={() => {props.refreshDemoFeedback?.()}}
            demoFeedback={props.demoFeedback}
          />
        </Flex>
      </Flex>

      {props.demoFeedback && (
        <>
          <Box mt={5}>
            <Text fz="sm">
              <b>Status:</b> {props.demoFeedback.status}
            </Text>
            <Text fz="sm">
              <b>Rating:</b> {props.demoFeedback.rating}
            </Text>
          </Box>
          <Box>
            <Text fz="sm" fw={700}>
              Feedback:
            </Text>
            <Text fz="sm">
              {props.demoFeedback.feedback}
            </Text>
          </Box>
          {props.demoFeedback.next_demo_date && (
            <Box mt='sm'>
              <Text fz="sm" fw='700'>
                Followup demo date:
              </Text>
              <Text fz='sm'>
                {new Date(props.demoFeedback.next_demo_date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </Box>
          )}
        </>
      )}

    </Paper>
  );
}
