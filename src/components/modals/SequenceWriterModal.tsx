import { userDataState, userTokenState } from "@atoms/userAtoms";
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
  Select,
  SelectItem,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconReload } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import {
  generateDraft,
  generateValueProps,
  sendToOutreach,
} from "@utils/requests/generateSequence";
import getPersonas from "@utils/requests/getPersonas";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Archetype } from "src";

export default function SequenceWriterModal({
  context,
  id,
  innerProps,
}: ContextModalProps) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [active, setActive] = useState(0);
  const [valueProps, setValueProps] = useState<string[]>([]);
  const [steps, setSteps] = useState<{ email: string; subject_line: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [loadingValueProp, setLoadingValueProp] = useState({ active: false, index: -1 });

  const surveyForm = useForm({
    initialValues: {
      title: "",
      company: userData?.client?.company ?? "",
      sellingTo: "",
      sellingWhat: "",
      numSteps: 3,
      archetypeID: -1,
    },

    validate: {
      archetypeID: (value) => (value === -1 ? "Please select a persona" : null),
    },
  });

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.data as Archetype[]) : [];

      const mapped_result = result.map((res) => {
        return {
          value: res.id + "",
          label: res.archetype,
        };
      });
      return mapped_result satisfies SelectItem[];
    },
    refetchOnWindowFocus: false,
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
      setValueProps(
        result.data.filter((valueProp: string) => valueProp.trim() !== "")
      );
      setActive((current) => current + 1);
    } else {
      showNotification({
        id: "sequence-writer-generate-props-error",
        title: "Generation Failed",
        message: "Failed to generate CTA ideas. Please try again!",
        color: "red",
        autoClose: false,
      });
    }
  };

  const regenerateValueProp = async (index: number) => {
    setLoadingValueProp({ active: true, index });
    const result = await generateValueProps(
      userToken,
      surveyForm.values.company,
      surveyForm.values.sellingTo,
      surveyForm.values.sellingWhat,
      1
    );
    if (result.status === "success") {
      const newValueProps = [...valueProps];
      newValueProps[index] = result.data[0].replace('Value Prop: ', '');
      setValueProps(newValueProps);
    } else {
      showNotification({
        id: "sequence-writer-generate-props-error",
        title: "Error",
        message: "Failed to regenerate value prop",
        color: "red",
        autoClose: 5000,
      });
    }
    setLoadingValueProp({ active: false, index });
  };

  const handleValuePropsSubmit = async () => {
    setLoading(true);
    const result = await generateDraft(
      userToken,
      valueProps,
      +surveyForm.values.archetypeID
    );
    setLoading(false);
    if (result.status === "success") {
      setSteps(result.data);
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
      surveyForm.values.title,
      +surveyForm.values.archetypeID,
      steps.map((step) => {
        return {
          subject: step.subject_line,
          body: step.email,
        };
      })
    );
    setLoading(false);
    if (result.status === "success") {
      showNotification({
        id: "sequence-writer-send-steps-success",
        title: "Sent to Sales Engagement Tool",
        message:
          "Your sequence has been queued to your sales engagement tool. Please allow up to 24 hours for it to propagate.",
        color: "green",
        autoClose: 5000,
      });
      context.closeModal(id);
    } else {
      showNotification({
        id: "sequence-writer-send-steps-error",
        title: "Error",
        message: "Failed to send to sales engagement tools",
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
      <LoadingOverlay visible={loading || isFetching} overlayBlur={2} />
      <Stepper
        active={active}
        onStepClick={setActive}
        breakpoint="sm"
        allowNextStepsSelect={false}
      >
        <Stepper.Step label="Quick Survey">
          <form onSubmit={surveyForm.onSubmit(handleSurveySubmit)}>
            <Text size="sm" mt="sm">
              Please fill out the following survey to generate value proposition
              ideas.
            </Text>
            <Stack mt="sm">
              <Select
                required
                label="Select which persona you are targeting"
                placeholder="ex. VP of Sales, Head of HR"
                {...surveyForm.getInputProps("archetypeID")}
                data={data ?? []}
                onBlur={() => {
                  if (!surveyForm.values.title) {
                    const currentDate = new Date();
                    const formattedDate = `${
                      currentDate.getMonth() + 1
                    }/${currentDate.getDate()}/${currentDate.getFullYear()}`;

                    const defaultTitle = `${userData.sdr_name} - ${
                      data?.find(
                        (d) => d.value === surveyForm.values.archetypeID + ""
                      )?.label
                    } - ${formattedDate}`;
                    surveyForm.setFieldValue("title", defaultTitle);
                  }
                }}
              />

              <TextInput
                required
                label="Sequence Title"
                placeholder="ex. Joe Smith - VP Sales - 03/11/2021"
                {...surveyForm.getInputProps("title")}
                disabled={surveyForm.values.archetypeID === -1}
              />

              <TextInput
                required
                label="Company Name"
                placeholder="ex. Acme Corp"
                {...surveyForm.getInputProps("company")}
                disabled={surveyForm.values.archetypeID === -1}
              />

              <TextInput
                required
                label="Who are you selling to?"
                placeholder="ex. VP of Sales"
                {...surveyForm.getInputProps("sellingTo")}
                disabled={surveyForm.values.archetypeID === -1}
              />

              <TextInput
                required
                label="What are you selling?"
                placeholder="ex. Sales Engagement Tool"
                {...surveyForm.getInputProps("sellingWhat")}
                disabled={surveyForm.values.archetypeID === -1}
              />

              <NumberInput
                required
                label="# Steps (max 3)"
                max={3}
                min={1}
                {...surveyForm.getInputProps("numSteps")}
                disabled={surveyForm.values.archetypeID === -1}
              />

              <Center>
                <Button radius="md" type="submit">
                  Generate {surveyForm.values.numSteps} Steps
                </Button>
              </Center>
            </Stack>
          </form>
        </Stepper.Step>
        <Stepper.Step label="Value Props">
          <Text size="sm" mt="sm">
            These are your generated value propositions! Please review them
            before moving on to the sequence generation step.
          </Text>
          <Stack mt="sm">
            {valueProps.map((valueProp, index) => (
              <div style={{ position: 'relative' }}>
                <Textarea
                  key={index}
                  label={`Value Prop #${index + 1}`}
                  value={valueProp}
                  onChange={(e) => {
                    const newValueProps = [...valueProps];
                    newValueProps[index] = e.currentTarget.value;
                    setValueProps(newValueProps);
                  }}
                  required
                  autosize
                />
                <ActionIcon
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                  loading={loadingValueProp.active && loadingValueProp.index === index}
                  size="sm"
                  onClick={() => {
                    regenerateValueProp(index);
                  }}
                >
                  <IconReload size="0.875rem" />
                </ActionIcon>
              </div>
            ))}

            <Center>
              <Button radius="md" onClick={handleValuePropsSubmit}>
                Approve Values and Generate Sequence
              </Button>
            </Center>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Generate Sequences">
          <Text size="sm" mt="sm">
            These are your generated sequence steps! Please edit them before
            approving for SellScale review. NOTE: Scroll to the bottom to upload
            into your sales engagement tool
          </Text>
          <Stack mt="sm">
            {steps.map((step, index) => (
              <div key={index}>
                <Text size="md" weight="bold">
                  Email Step #{index + 1}{" "}
                </Text>
                <Text size="xs" mt="xs">
                  Subject
                </Text>
                <Textarea
                  value={step.subject_line}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].subject_line = e.currentTarget.value;
                    setSteps(newSteps);
                  }}
                  required
                  autosize
                />
                <Text size="xs" mt="xs">
                  Body
                </Text>
                <Textarea
                  value={step.email}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].email = e.currentTarget.value;
                    setSteps(newSteps);
                  }}
                  required
                  autosize
                />
                <Divider mt="md" />
              </div>
            ))}

            <Center>
              <Button color="teal" radius="md" onClick={handleDraftSubmit}>
                Create & Copy Sequence into Sales Engagement Tool
              </Button>
            </Center>
          </Stack>
        </Stepper.Step>
        <Stepper.Completed>Completed!</Stepper.Completed>
      </Stepper>
    </Paper>
  );
}
