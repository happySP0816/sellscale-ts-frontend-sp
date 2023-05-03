import React, { ReactElement } from "react";
import {
  Button,
  Popover,
  Textarea,
  Text,
  Title,
  SegmentedControl,
  Divider,
  Card,
  Grid,
  Box,
  TextInput,
} from "@mantine/core";
import { IconPencil, IconRobot, IconX } from "@tabler/icons";
import { API_URL } from "@constants/data";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { useClickOutside } from "@mantine/hooks";
import RichTextArea from "./RichTextArea";

type PropsType = {
  placeholder?: string;
  label?: string;
  description?: string;
  minRows?: number;
  maxRows?: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  value?: string;
  withAsterisk?: boolean;
  inputType?: "text-area" | "text-input" | "rich-text-area",
  loadingAIGenerate?: boolean;
  onAIGenerateClicked?: () => void;
};

export default function TextAreaWithAI(props: PropsType) {
  const options = [];
  if (props.onAIGenerateClicked) {
    options.push({
      label: "Write",
      value: "write",
    });
  }
  options.push({
    label: "Edit",
    value: "edit",
  });

  const ref = useClickOutside(() => setAIPopoverToggled(false));
  const [AIPopoverToggled, setAIPopoverToggled] = React.useState(false);
  const [aiEditorMode, setAIEditorMode] = React.useState(options[0].value);

  const [editingLoading, setEditingLoading] = React.useState(false);
  const [editInstruction, setEditInstruction] = React.useState("");
  const userToken = useRecoilValue(userTokenState);

  const editTextViaAPI = () => {
    setEditingLoading(true);
    fetch(`${API_URL}/ml/edit_text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        initial_text: props.value,
        prompt: editInstruction,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((j) => {
        const updatedValue: any = {
          currentTarget: {
            value: j.data,
          },
          target: {
            value: j.data,
          },
        };
        props.onChange && props.onChange(updatedValue);
        setAIPopoverToggled(false);
      })
      .finally(() => {
        setEditingLoading(false);
      });
  };

  return (
    <Box mt="sm" sx={{ position: 'relative' }} ref={ref}>
      {/* AI Writing Popup */}
      <Popover
        width={300}
        trapFocus
        position="left"
        withArrow
        shadow="md"
        opened={AIPopoverToggled}
      >
        <Popover.Target>
          <Button
            color="teal"
            variant="light"
            radius="xl"
            size="xs"
            compact
            onClick={() => setAIPopoverToggled(!AIPopoverToggled)}
            sx={{ position: "absolute", top: props.label ? 0 : 7, right: 7, zIndex: 100 }}
            leftIcon={<IconPencil size='0.8rem' />}
            styles={{
              leftIcon: {
                marginRight: 3,
              }
            }}
          >
            AI Write
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Grid>
            <Grid.Col span={10}>
              <Title order={4}>✍🏼 Writing Assistant</Title>
              <Text size="sm">Draft text or edit using AI.</Text>
            </Grid.Col>
            <Grid.Col span={2}>
              <Button
                compact
                size="xs"
                variant="subtle"
                color="gray"
                rightIcon={<IconX />}
                onClick={() => setAIPopoverToggled(false)}
              />
            </Grid.Col>
          </Grid>
          {options.length > 1 && (
            <SegmentedControl
              w={"100%"}
              mt={"md"}
              data={options}
              value={aiEditorMode}
              onChange={(value) => {
                setAIEditorMode(value as "write" | "edit");
              }}
            />
          )}
          {aiEditorMode === "write" && (
            <Card withBorder mt="md">
              <Text size="sm">
                Auto generate a first draft using AI. SellScale will use
                existing context to generate.
              </Text>
              <Button
                mt="md"
                size="xs"
                color="teal"
                w="100%"
                loading={props.loadingAIGenerate}
                loaderPosition="right"
                leftIcon={<IconRobot />}
                onClick={() => {
                  const res =
                    props.onAIGenerateClicked && props.onAIGenerateClicked();
                  setAIPopoverToggled(false);
                  return res;
                }}
              >
                Generate with AI
              </Button>
            </Card>
          )}
          {aiEditorMode === "edit" && (
            <Card withBorder mt="md">
              <Text size="sm">
                Edit your text using AI. Tell SellScale what you want to change.
              </Text>
              <Textarea
                mt="md"
                label="Editing Instruction"
                onChange={(event) => {
                  setEditInstruction(event.currentTarget.value);
                }}
                placeholder="Describe how you want to edit this text."
              />
              <Button
                mt="md"
                size="xs"
                color="grape"
                w="100%"
                loading={editingLoading}
                loaderPosition="right"
                leftIcon={<IconRobot />}
                disabled={!editInstruction}
                onClick={() => {
                  editTextViaAPI();
                }}
              >
                Edit with AI
              </Button>
            </Card>
          )}
        </Popover.Dropdown>
      </Popover>

      {/* Main Text */}
      {props.inputType === "rich-text-area" ? (
        <RichTextArea
          onChange={(value) => {
            props.onChange && props.onChange({ currentTarget: { value } } as React.ChangeEvent<HTMLTextAreaElement>);
          }}
          value={props.value}
          personalizationBtn
        />
      ) : (props.inputType === "text-input" ? (
        <TextInput
          placeholder={props.placeholder}
          label={props.label}
          description={props.description}
          onChange={(e) => {
            props.onChange && props.onChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>);
          }}
          disabled={props.disabled}
          value={props.value}
          withAsterisk={props.withAsterisk}
        />
      ) : (
        <Textarea
          placeholder={props.placeholder}
          label={props.label}
          description={props.description}
          minRows={props.minRows}
          maxRows={props.maxRows}
          onChange={props.onChange}
          disabled={props.disabled}
          value={props.value}
          withAsterisk={props.withAsterisk}
        />
      ))}
    </Box>
  );
}
