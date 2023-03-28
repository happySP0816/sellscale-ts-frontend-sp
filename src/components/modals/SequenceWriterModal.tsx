import { userTokenState } from "@atoms/userAtoms";
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  Stepper,
  TextInput,
  NumberInput,
  Button,
  Center,
  Stack,
  Textarea,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { generateDraft, generateValueProps, sendToOutreach } from "@utils/requests/generateSequence";
import { useState } from "react";
import { useRecoilValue } from "recoil";

export default function SequenceWriterModal({
  context,
  id,
  innerProps,
}: ContextModalProps) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [active, setActive] = useState(0);
  const [valueProps, setValueProps] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const surveyForm = useForm({
    initialValues: {
      company: "",
      sellingTo: "",
      sellingWhat: "",
      numSteps: 4,
    },
  });

  const handleSurveySubmit = async (values: typeof surveyForm.values) => {
    setLoading(true);
    const result = await generateValueProps(
      userToken,
      values.company,
      values.sellingTo,
      values.sellingWhat,
      values.numSteps
    );
    setLoading(false);
    if (result.status === "success") {
      setValueProps(result.extra.filter((valueProp: string) => valueProp.trim() !== ""));
      setActive((current) => current + 1);
    } else {
      showNotification({
        id: "sequence-writer-generate-props-error",
        title: "Error",
        message: "Failed to generate value props",
        color: "red",
        autoClose: false,
      });
    }
  };

  const handleValuePropsSubmit = async () => {
    setLoading(true);
    const result = await generateDraft(
      userToken,
      valueProps
    );
    setLoading(false);
    if (result.status === "success") {
      setSteps(result.extra);
      setActive((current) => current + 1);
    } else {
      showNotification({
        id: "sequence-writer-generate-draft-error",
        title: "Error",
        message: "Failed to generate draft",
        color: "red",
        autoClose: false,
      });
    }
  };

  const handleDraftSubmit = async () => {
    setLoading(true);
    const result = await sendToOutreach(
      userToken,
      steps
    );
    setLoading(false);
    if (result.status === "success") {
      showNotification({
        id: "sequence-writer-send-steps-success",
        title: "Sent to Outreach",
        message: "Your sequence has been scheduled to Outreach. Please allow up to 24 hours for it to propagate.",
        color: "green",
        autoClose: 5000,
      });
      context.closeModal(id);
    } else {
      showNotification({
        id: "sequence-writer-send-steps-error",
        title: "Error",
        message: "Failed to send to outreach",
        color: "red",
        autoClose: false,
      });
    }
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      <Stepper
        active={active}
        onStepClick={setActive}
        breakpoint="sm"
        allowNextStepsSelect={false}
      >
        <Stepper.Step label="Quick Survey">
          <form onSubmit={surveyForm.onSubmit(handleSurveySubmit)}>
            <Stack>
              <TextInput
                required
                label="Company Name"
                {...surveyForm.getInputProps("company")}
              />

              <TextInput
                required
                label="Who are you selling to?"
                {...surveyForm.getInputProps("sellingTo")}
              />

              <TextInput
                required
                label="What are you selling?"
                {...surveyForm.getInputProps("sellingWhat")}
              />

              <NumberInput
                required
                label="# Steps in Sequence"
                max={7}
                min={1}
                {...surveyForm.getInputProps("numSteps")}
              />

              <Center>
                <Button radius="md" type="submit">
                  Generate {surveyForm.values.numSteps} Value Props
                </Button>
              </Center>
            </Stack>
          </form>
        </Stepper.Step>
        <Stepper.Step label="Value Props">
          <Stack>
            {valueProps.map((valueProp, index) => (
              <Textarea
                key={index}
                label={`Value #${index + 1}`}
                value={valueProp}
                onChange={(e) => {
                  const newValueProps = [...valueProps];
                  newValueProps[index] = e.currentTarget.value;
                  setValueProps(newValueProps);
                }}
                required
              />
            ))}

            <Center>
              <Button radius="md" onClick={handleValuePropsSubmit}>
                Approve Values and Generate Sequence
              </Button>
            </Center>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Generate Sequences">
        <Stack>
            {steps.map((step, index) => (
              <Textarea
                key={index}
                label={`Step ${index + 1}`}
                value={step}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index] = e.currentTarget.value;
                  setSteps(newSteps);
                }}
                required
                autosize
              />
            ))}

            <Center>
              <Button color="teal" radius="md" onClick={handleDraftSubmit}>
                Copy Sequence into Outreach Tool
              </Button>
            </Center>
          </Stack>
        </Stepper.Step>
        <Stepper.Completed>Completed!</Stepper.Completed>
      </Stepper>
    </Paper>
  );
}
