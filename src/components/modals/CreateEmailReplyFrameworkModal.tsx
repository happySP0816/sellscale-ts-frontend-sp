import { userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import TextWithNewline from "@common/library/TextWithNewlines";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { PersonalizationSection } from "@common/sequence/SequenceSection";
import {
  Modal,
  TextInput,
  Text,
  Textarea,
  Slider,
  Flex,
  Select,
  Switch,
  Button,
  useMantineTheme,
  LoadingOverlay,
  NumberInput,
  HoverCard,
  Paper,
  Tooltip,
  Group,
  Box,
  Collapse,
  Accordion,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, closeAllModals, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconSettings } from "@tabler/icons";
import { JSONContent } from "@tiptap/react";
import { postCreateEmailReplyFramework } from "@utils/requests/emailReplies";
import React from "react";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

const substatuses = [
  { value: "ACTIVE_CONVO_QUESTION", label: "Question" },
  { value: "ACTIVE_CONVO_QUAL_NEEDED", label: "Qualification Needed" },
  { value: "ACTIVE_CONVO_OBJECTION", label: "Objection" },
  { value: "ACTIVE_CONVO_SCHEDULING", label: "Scheduling" },
  { value: "ACTIVE_CONVO_NEXT_STEPS", label: "Next Steps" },
  { value: "ACTIVE_CONVO_REVIVAL", label: "Revival" },
];

interface CreateEmailReplyFramework extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  archetypeID: number | null;
  initialValues?: {
    title: string;
    description: string;
    template: string;
    additional_instructions: string;
    useAccountResearch: boolean;
    researchBlocklist?: string[];
  };
}

export default function CreateEmailReplyFrameworkModal(
  props: CreateEmailReplyFramework
) {
  useEffect(() => {
    if (props.modalOpened) {
      openContextModal({
        modal: "createEmailReplyFramework",
        title: "Create Email Reply Framework",
        innerProps: {
          ...props,
        },
      });
    }
  }, [props.modalOpened]);

  return <></>;
}

export function CreateEmailReplyFrameworkContextModal({
  context,
  id,
  innerProps,
}: ContextModalProps<CreateEmailReplyFramework>) {
  const [userToken] = useRecoilState(userTokenState);

  const [selectedSubstatus, setSelectedSubstatus] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [template, _setTemplate] = React.useState<string>("");
  const templateRichRaw = React.useRef<JSONContent | string>("");

  const triggerPostCreateEmailReplyFramework = async () => {
    setLoading(true);

    if (form.values.archetypeID == null) {
      showNotification({
        title: 'Error',
        message: 'Please select an archetype',
        color: 'red',
      });
      return;
    }

    const result = await postCreateEmailReplyFramework(
      userToken,
      "ACTIVE_CONVO",
      selectedSubstatus as string,
      template,
      form.values.title,
      form.values.archetypeID as number,
      form.values.description,
      null,
      null,
      null,
    );

    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Email Reply Framework created successfully',
        color: 'green',
      });
      form.reset();
      innerProps.backFunction();
      innerProps.closeModal();

      // Close all modals
      closeAllModals();
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
    }

    setLoading(false);
  };

  const form = useForm({
    initialValues: {
      title: innerProps.initialValues?.title ?? "",
      description: innerProps.initialValues?.description ?? "",
      archetypeID: innerProps.archetypeID,
      useAccountResearch: innerProps.initialValues?.useAccountResearch ?? false,
      researchBlocklist: innerProps.initialValues?.researchBlocklist ?? [],
    },
  });

  return (
    <Paper>
      <LoadingOverlay visible={loading} />
      <Select
        label="Substatus"
        description=""
        placeholder="Next Steps"
        value={selectedSubstatus ? selectedSubstatus : null}
        data={substatuses}
        onChange={setSelectedSubstatus}
        withAsterisk
      />

      <TextInput
        mt="md"
        label="Title"
        placeholder={"Next Steps - Let's call!"}
        {...form.getInputProps("title")}
      />
      <TextInput
        mt="sm"
        label="Description"
        placeholder={
          "This is a framework for when you're trying to get a prospect on the phone."
        }
        {...form.getInputProps("description")}
      />
      <Text fz="1rem" mt="sm">
        Template
      </Text>
      <RichTextArea
        onChange={(value, rawValue) => {
          templateRichRaw.current = rawValue;
          _setTemplate(value);
        }}
        value={templateRichRaw.current}
        height={400}
      />

      <Accordion defaultValue="" mt='md'>
        <Accordion.Item
          key="additional-information"
          value="additional-information"
        >
          <Accordion.Control icon={<IconSettings size="1rem" />}>
            Advanced Controls - Coming Soon
          </Accordion.Control>
          <Accordion.Panel>
            <Text>Coming Soon: Additional Instructions, Account Research, Research Blocklist</Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Flex w="100%" justify="flex-end" direction={"column"}>
        <Button
          mt="md"
          disabled={
            form.values.title.trim() == "" ||
            form.values.description.trim() == "" ||
            template.trim() == "" ||
            selectedSubstatus == null
          }
          onClick={() => {
            triggerPostCreateEmailReplyFramework();
          }}
          size="lg"
        >
          Create Framework
        </Button>
      </Flex>

    </Paper>
  );
}
