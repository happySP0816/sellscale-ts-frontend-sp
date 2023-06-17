import { userTokenState } from "@atoms/userAtoms";
import { Button, Flex, LoadingOverlay, NumberInput, Paper, Slider, Switch, Text, TextInput, Textarea, Title, Tooltip, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

const bumpFrameworkLengthMarks = [
  { value: 0, label: "Short", api_label: "SHORT" },
  { value: 50, label: "Medium", api_label: "MEDIUM" },
  { value: 100, label: "Long", api_label: "LONG" },
];

interface EditBumpFramework extends Record<string, unknown> {
  bumpFrameworkID: number;
  overallStatus: string; // Note that this is used as an identifier
  title: string;
  description: string;
  bumpLength: string;
  default: boolean;
  onSave: () => void;
  bumpedCount?: number;
}

export default function EditBumpFrameworkModal({ context, id, innerProps }: ContextModalProps<EditBumpFramework>) {
  const theme = useMantineTheme();

  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const form = useForm({
    initialValues: {
      title: innerProps.title,
      description: innerProps.description,
      bumpedCount: innerProps.bumpedCount ?? null,
      default: innerProps.default,
    },
  });

  const triggerPostBumpDeactivate = async () => {
    setLoading(true);

    const result = await postBumpDeactivate(
      userToken,
      innerProps.bumpFrameworkID,
    );
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework deactivated successfully",
        color: theme.colors.green[7],
      });
      setLoading(false);
      context.closeModal(id);
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  const triggerEditBumpFramework = async () => {
    setLoading(true);

    const result = await patchBumpFramework(
      userToken,
      innerProps.bumpFrameworkID,
      innerProps.overallStatus,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)
        ?.api_label as string,
      form.values.bumpedCount,
      form.values.default,
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework updated successfully",
        color: theme.colors.green[7],
      });
      setLoading(false);
      innerProps.onSave();
      context.closeModal(id);
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    let length = bumpFrameworkLengthMarks.find(
      (marks) => marks.api_label === innerProps.bumpLength
    )?.value;
    if (length == null) {
      length = 50;
    }

    setBumpLengthValue(length)
  }, []);

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        minHeight: 400,
      }}
    >
      <LoadingOverlay visible={loading} />
      <Flex align={'center'} justify={"space-between"}>
        <TextInput
          w='50%'
          mr='xs'
          label="Title"
          placeholder={"Mention the Super Bowl"}
          {...form.getInputProps("title")}
        />
        <Switch
          label="Default Framework?"
          labelPosition="left"
          checked={form.values.default}
          onChange={(e) => {
            form.setFieldValue(
              "default",
              e.currentTarget.checked
            );
          }}
        />
      </Flex>

      <Textarea
        mt="md"
        label="Description"
        placeholder={
          "Mention the Super Bowl which is coming up soon."
        }
        {...form.getInputProps("description")}
        minRows={3}
        autosize
      />
      <Text fz="sm" mt="md">
        Bump Length
      </Text>
      <Tooltip
        multiline
        width={220}
        withArrow
        label="Control how long you want the generated bump to be."
      >
        <Slider
          label={null}
          step={50}
          marks={bumpFrameworkLengthMarks}
          mb="xl"
          p="md"
          value={bumpLengthValue}
          onChange={(value) => {
            setBumpLengthValue(value);
          }}
        />
      </Tooltip>
      {
        form.values.bumpedCount != null ? (
          <NumberInput
            label="Bump Number"
            description="The position in the bump sequence."
            placeholder="1"
            value={form.values.bumpedCount as number}
            onChange={(e) => {
              form.setFieldValue("bumpedCount", e as number);
            }}
            min={1}
          />
        ) : <></>
      }
      <Flex>
        <Flex justify="space-between" w="100%">
          <Flex>
            <Button
              mt="md"
              color="red"
              onClick={() => {
                triggerPostBumpDeactivate();
              }}
            >
              Deactivate
            </Button>
          </Flex>
          <Flex>
            {innerProps.title ==
              form.values.title.trim() &&
              innerProps.description ==
              form.values.description.trim() &&
              innerProps.default ==
              form.values.default &&
              innerProps.bumpLength ==
              bumpFrameworkLengthMarks.find(
                (mark) => mark.value === bumpLengthValue
              )?.api_label &&
              innerProps.bumpedCount ==
              form.values.bumpedCount ?
              (
                <></>
              ) : (
                <Button
                  mt="md"
                  onClick={() => {
                    triggerEditBumpFramework();
                  }}
                >
                  Save
                </Button>
              )}
          </Flex>
        </Flex>
      </Flex>
    </Paper>
  )
}