import { userTokenState } from "@atoms/userAtoms";
import EmailTemplatePreview from "@common/emails/EmailTemplatePreview";
import { EmailBlocksDND } from "@common/emails/EmailBlocksDND";
import DynamicRichTextArea from "@common/library/DynamicRichTextArea";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import {
  Modal,
  TextInput,
  Flex,
  Select,
  Switch,
  Button,
  useMantineTheme,
  LoadingOverlay,
  NumberInput,
  Divider,
  ScrollArea,
  Stack,
  Group,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconDatabase, IconRobot, IconWritingSign, IconX } from "@tabler/icons";
import { JSONContent } from "@tiptap/react";
import { createEmailSequenceStep } from "@utils/requests/emailSequencing";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { MsgResponse } from "src";

interface EmailSequenceStep extends Record<string, unknown> {
  modalOpened: boolean;
  type: "CREATE" | "EDIT";
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  onFinish: (title: string, sequence: string, isDefault: boolean, status?: string, substatus?: string) => Promise<boolean>;
  archetypeID: number;
  status?: string;
  showStatus?: boolean;
  bumpedCount?: number | null;
  sequence?: string;
  title?: string;
  isDefault?: boolean;
}

export default function EmailSequenceStepModal(props: EmailSequenceStep) {
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<string | null>("");
  const [selectedSubstatus, setSelectedSubstatus] = useState<string | null>("");

  const [sequence, _setSequence] = useState<string>(props.sequence || '');
  const sequenceRichRaw = useRef<JSONContent | string>(props.sequence || '');
  // We use this to set the value of the text area
  const setSequence = (value: string) => {
    sequenceRichRaw.current = value;
    _setSequence(value);
  }

  const triggerCreateOrSave = async () => {
    setLoading(true);

    const success = await props.onFinish(
      form.values.title,
      sequence,
      form.values.isDefault,
      selectedStatus || '',
      selectedSubstatus || '',
    );

    if (success) {
      showNotification({
        title: "Success",
        message: `Successfully ${props.type === "CREATE" ? "created" : "saved"} the step`,
        icon: <IconCheck radius="sm" />,
      });
      form.reset();
      props.backFunction();
      props.closeModal();
    } else {
      showNotification({
        title: "Error",
        message: `There was an error ${props.type === "CREATE" ? "creating" : "saving"} the step`,
        icon: <IconX radius="sm" />,
      });
    }

    setLoading(false);
  };

  const form = useForm({
    initialValues: {
      title: props.title || "",
      objective: "",
      archetypeID: props.archetypeID,
      isDefault: !!props.isDefault,
      bumpedCount: props.bumpedCount,
    },
  });

  useEffect(() => {
    // Set the statuses to the correct values
    if (props.status != null) {
      setSelectedStatus(props.status);
      if (props.status.includes("ACTIVE_CONVO_")) {
        setSelectedStatus("ACTIVE_CONVO");
        setSelectedSubstatus(props.status);
      }
    }
  }, [props.status]);

  return (
    <Modal
      opened={props.modalOpened}
      onClose={props.closeModal}
      title={`${props.type === "CREATE" ? "Create New" : "Edit"} Sequence Step`}
      size="75rem"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <LoadingOverlay visible={loading} />
      <Stack h={450}>
        <Group position="apart">
          <TextInput
            label="Title"
            placeholder={"Mention the Super Bowl"}
            withAsterisk
            w='400px'
            {...form.getInputProps("title")}
          />
          <Group>
            <Switch
              pt="md"
              label="Make default?"
              labelPosition="right"
              checked={form.values.isDefault}
              onChange={(e) => {
                form.setFieldValue("isDefault", e.currentTarget.checked);
              }}
            />
            <Button
              mt="md"
              // disabled={
              //   form.values.title.trim() == "" ||
              //   form.values.archetypeID == null ||
              //   selectedStatus == null ||
              //   (selectedStatus === "ACTIVE_CONVO" &&
              //     selectedSubstatus == null) ||
              //   (selectedStatus === "BUMPED" &&
              //     (form.values.bumpedCount == null ||
              //       form.values.bumpedCount < 1)) ||
              //   template.length === 0
              // }
              onClick={triggerCreateOrSave}
            >
              {props.type === "CREATE" ? "Create" : "Save"}
            </Button>
          </Group>
        </Group>
        <Flex gap={10} wrap="nowrap" w={"100%"}>
          <Box sx={{ flexBasis: "60%" }}>
            <DynamicRichTextArea
              height={300}
              onChange={(value, rawValue) => {
                sequenceRichRaw.current = rawValue;
                _setSequence(value);
              }}
              value={sequenceRichRaw.current}
              signifyCustomInsert={false}
              inserts={[
                {
                  key: "first_name",
                  label: "First Name",
                  icon: <IconWritingSign stroke={1.5} size="0.9rem" />,
                  color: "blue",
                },
                {
                  key: "last_name",
                  label: "Last Name",
                  icon: <IconRobot stroke={2} size="0.9rem" />,
                  color: "red",
                },
                {
                  key: "company_name",
                  label: "Company Name",
                  icon: <IconDatabase stroke={2} size="0.9rem" />,
                  color: "teal",
                }
              ]}
            />
          </Box>
          <Box sx={{ flexBasis: "40%" }}>
            <ScrollArea type="hover">
              <EmailTemplatePreview
                archetypeId={props.archetypeID as number}
                template={sequence}
                selectTemplate={false}
                emailStatus={props.status || ""}
              />
            </ScrollArea>
          </Box>
        </Flex>
      </Stack>
    </Modal>
  );
}
