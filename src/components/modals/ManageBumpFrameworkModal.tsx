import {
  Button,
  Text,
  Paper,
  useMantineTheme,
  TextInput,
  LoadingOverlay,
  Flex,
  Stack,
  Card,
  Textarea,
  Badge,
  Switch,
  ScrollArea,
  Slider,
  NumberInput,
  HoverCard,
  Tooltip,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconCheck, IconX } from "@tabler/icons";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useEffect } from "react";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { createBumpFramework } from "@utils/requests/createBumpFramework";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import { BumpFramework } from "src";
import TextWithNewline from "@common/library/TextWithNewlines";

const bumpFrameworkLengthMarks = [
  { value: 0, label: "Short", api_label: "SHORT" },
  { value: 50, label: "Medium", api_label: "MEDIUM" },
  { value: 100, label: "Long", api_label: "LONG" },
];

export default function ManageBumpFramework({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  selectedBumpFramework: BumpFramework;
  overallStatus: string;
  linkedinStatus: string;
  archetypeId: number;
  backTriggerGetFrameworks: Function;
}>) {
  const theme = useMantineTheme();

  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);
  const [
    selectedBumpFramework,
    setSelectedBumpFramework,
  ] = useState<BumpFramework | null>(null);

  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);

    let substatus: string[] = [];
    if (innerProps.linkedinStatus?.includes("ACTIVE_CONVO_")) {
      substatus.push(innerProps.linkedinStatus);
    };

    const result = await getBumpFrameworks(userToken, [innerProps.overallStatus], substatus, [innerProps.archetypeId]);

    let bumpFrameworkArray = [] as BumpFramework[];
    for (const bumpFramework of result.data.bump_frameworks as BumpFramework[]) {
      if (bumpFramework.default) {
        bumpFrameworkArray.unshift(bumpFramework);
      } else {
        bumpFrameworkArray.push(bumpFramework);
      }
    }

    setBumpFrameworks(bumpFrameworkArray);
    setLoadingBumpFrameworks(false);
  };

  const triggerEditBumpFramework = async () => {
    setLoadingBumpFrameworks(true);

    if (selectedBumpFramework == null) {
      return;
    }

    const result = await patchBumpFramework(
      userToken,
      selectedBumpFramework?.id,
      selectedBumpFramework?.overall_status,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)
        ?.api_label as string,
      form.values.bumpedCount as number,
      form.values.bumpDelayDays,
      form.values.default,
      form.values.useAccountResearch,
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework updated successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      innerProps.backTriggerGetFrameworks();
      triggerGetBumpFrameworks();
      setSelectedBumpFramework({
        id: selectedBumpFramework.id,
        title: form.values.title,
        description: form.values.description,
        overall_status: selectedBumpFramework.overall_status,
        active: selectedBumpFramework.active,
        default: form.values.default,
        bump_length: bumpFrameworkLengthMarks.find(
          (mark) => mark.value === bumpLengthValue
        )?.api_label as string,
        bumped_count: form.values.bumpedCount as number,
        bump_delay_days: form.values.bumpDelayDays as number,
        substatus: selectedBumpFramework.substatus,
        use_account_research: form.values.useAccountResearch,
        client_archetype_id: selectedBumpFramework.client_archetype_id,
      });
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoadingBumpFrameworks(false);
  };

  const triggerCreateBumpFramework = async () => {
    setLoadingBumpFrameworks(true);

    const result = await createBumpFramework(
      userToken,
      innerProps.archetypeId,
      innerProps.overallStatus,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)
        ?.api_label as string,
      form.values.bumpedCount as number,
      form.values.bumpDelayDays,
      form.values.default,
      innerProps.linkedinStatus.includes("ACTIVE_CONVO_") ? innerProps.linkedinStatus : null,
      form.values.useAccountResearch,
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework created successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      innerProps.backTriggerGetFrameworks();
      triggerGetBumpFrameworks();
      setSelectedBumpFramework({
        id: result.data.bump_framework_id,
        title: form.values.title,
        description: form.values.description,
        overall_status: innerProps.overallStatus,
        active: true,
        default: form.values.default,
        bump_length: bumpFrameworkLengthMarks.find(
          (mark) => mark.value === bumpLengthValue
        )?.api_label as string,
        bumped_count: form.values.bumpedCount as number,
        bump_delay_days: 2,
        substatus: innerProps.linkedinStatus.includes("ACTIVE_CONVO_") ? innerProps.linkedinStatus : "",
        use_account_research: form.values.useAccountResearch,
        client_archetype_id: innerProps.archetypeId,
      });
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoadingBumpFrameworks(false);
  };

  const triggerPostBumpDeactivate = async () => {
    setLoadingBumpFrameworks(true);

    if (selectedBumpFramework == null) {
      return;
    }

    const result = await postBumpDeactivate(
      userToken,
      selectedBumpFramework?.id
    );
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework deactivated successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      triggerGetBumpFrameworks();
      setSelectedBumpFramework(null);
      innerProps.backTriggerGetFrameworks();
      form.values.title = "";
      form.values.description = "";
      form.values.default = false;
      form.values.bumpedCount = undefined;
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoadingBumpFrameworks(false);
  };

  const updateArchetypes = (archetypes: {
    archetype_id: number;
    archetype_name: string;
  }[]) => {
    form.setFieldValue('archetypes', archetypes)
  }

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      default: true,
      bumpedCount: undefined as number | undefined,
      bumpDelayDays: 2,
      useAccountResearch: true,
    },
  });

  useEffect(() => {
    triggerGetBumpFrameworks();
    setSelectedBumpFramework(innerProps.selectedBumpFramework);

    let length = bumpFrameworkLengthMarks.find(
      (marks) =>
        marks.api_label === innerProps.selectedBumpFramework?.bump_length
    )?.value;
    if (length == null) {
      length = 50;
    }
    setBumpLengthValue(length);
    if (innerProps.selectedBumpFramework == null) {
      return;
    }
    form.values.title = innerProps.selectedBumpFramework.title;
    form.values.description = innerProps.selectedBumpFramework.description;
    form.values.default = innerProps.selectedBumpFramework.default;
    form.values.bumpedCount = innerProps.selectedBumpFramework.bumped_count as number;
  }, []);

  return (
    <Paper
      p={0}
      mih="250px"
      sx={{
        position: "relative",
      }}
    >
      <LoadingOverlay visible={loadingBumpFrameworks} />
      <Flex dir="row">
        <Flex w="50%">
          <Stack w="95%" mih="500px" mah='700px'>
            <Button
              h="60px"
              onClick={() => {
                form.values.title = "";
                form.values.description = "";
                form.values.default = false;
                form.values.bumpedCount = undefined;
                form.values.bumpDelayDays = 2;
                setBumpLengthValue(50);
                setSelectedBumpFramework(null);
              }}
            >
              Create New Framework
            </Button>
            <ScrollArea offsetScrollbars>
              {bumpFrameworks?.map((framework) => {
                return (
                  <Card
                    mb="sm"
                    onClick={() => {
                      let length = bumpFrameworkLengthMarks.find(
                        (marks) => marks.api_label === framework.bump_length
                      )?.value;
                      if (length == null) {
                        length = 50;
                      }
                      form.values.title = framework.title;
                      form.values.description = framework.description;
                      form.values.default = framework.default;
                      form.values.bumpedCount = framework.bumped_count as number;
                      form.values.bumpDelayDays = framework.bump_delay_days;
                      form.values.useAccountResearch = framework.use_account_research;
                      setBumpLengthValue(length);
                      setSelectedBumpFramework(framework);
                    }}
                    withBorder
                    sx={{
                      cursor: "pointer",
                      border: "1px solid red",
                      "&:hover": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <Flex justify="space-between">
                      {framework.default ? (
                        <>
                          <Text fw="bold" fz="lg" w="70%">
                            {framework.title}
                          </Text>
                          <Badge color="green" size="xs">
                            Default
                          </Badge>
                        </>
                      ) : (
                        <Text fw="bold" fz="lg">
                          {framework.title}
                        </Text>
                      )}
                    </Flex>
                    <Text mt="xs" fz="sm">
                      {framework.description}
                    </Text>
                  </Card>
                );
              })}
            </ScrollArea>
          </Stack>
        </Flex>
        <Flex w="50%">
          <Card w="100%" h='fit-content' withBorder>
            <form onSubmit={() => console.log("submit")}>
              {selectedBumpFramework == null ? (
                <Text mb="sm" fz="lg" fw="bold">
                  Create New Framework
                </Text>
              ) : (
                <Flex justify={"flex-end"} align='flex-end' direction='column'>
                  <Switch
                    label="Default Framework"
                    labelPosition="left"
                    checked={form.values.default}
                    onChange={(e) => {
                      form.setFieldValue("default", e.currentTarget.checked);
                    }}
                  />
                  <Tooltip
                    withinPortal
                    withArrow
                    label='Using account research leads to more personalized messages, but may not be the best for straightforward messages.'
                  >
                    <span>
                      <Switch
                        mt='xs'
                        label="Use Account Research"
                        labelPosition="left"
                        checked={form.values.useAccountResearch}
                        onChange={(e) => {
                          form.setFieldValue(
                            "useAccountResearch",
                            e.currentTarget.checked
                          );
                        }}
                      />
                    </span>
                  </Tooltip>
                </Flex>
              )}

              <TextInput
                label="Title"
                placeholder={"Mention the Super Bowl"}
                {...form.getInputProps("title")}
              />
              <Textarea
                mt="md"
                label="Description"
                placeholder={"Mention the Super Bowl which is coming up soon."}
                {...form.getInputProps("description")}
                autosize
              />
              <Text fz="sm" mt="md">
                Bump Length
              </Text>
              <HoverCard width={280} shadow="md">
                <HoverCard.Target>
                  <Slider
                    label={null}
                    step={50}
                    marks={bumpFrameworkLengthMarks}
                    mt="xs"
                    mb="xl"
                    p="md"
                    value={bumpLengthValue}
                    onChange={(value) => {
                      setBumpLengthValue(value);
                    }}
                  />
                </HoverCard.Target>
                <HoverCard.Dropdown style={{ "backgroundColor": "rgb(34, 37, 41)", "padding": 0 }}>
                  <Paper style={{ "backgroundColor": "rgb(34, 37, 41)", "color": "white", "padding": 10 }}>
                    <TextWithNewline breakheight="10px">
                      {"Control how long you want the generated bump to be:\n\nShort: 1-2 sentences\nMedium: 3-4 sentences\nLong: 2 paragraphs"}
                    </TextWithNewline>
                  </Paper>
                </HoverCard.Dropdown>
              </HoverCard>
              {
                form.values.bumpedCount ? (
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
              <NumberInput
                mt='md'
                label="Bump Delay"
                description="The number of days to wait before sending the bump."
                placeholder="2"
                value={form.values.bumpDelayDays}
                onChange={(e) => {
                  form.setFieldValue("bumpDelayDays", e as number);
                }}
                min={2}
                withAsterisk
              />

              {selectedBumpFramework == null && (
                <Flex direction="column">
                  <Switch
                    pt="md"
                    label="Make Default"
                    labelPosition="right"
                    checked={form.values.default}
                    onChange={(e) => {
                      form.setFieldValue("default", e.currentTarget.checked);
                    }}
                  />
                  <Tooltip
                    withinPortal
                    withArrow
                    label='Using account research leads to more personalized messages, but may not be the best for straightforward messages.'
                  >
                    <span>
                      <Switch
                        mt='xs'
                        label="Use Account Research"
                        labelPosition="right"
                        checked={form.values.useAccountResearch}
                        onChange={(e) => {
                          form.setFieldValue(
                            "useAccountResearch",
                            e.currentTarget.checked
                          );
                        }}
                      />
                    </span>
                  </Tooltip>
                </Flex>

              )}

              <Flex>
                {selectedBumpFramework == null ? (
                  <Flex w="100%" justify="flex-end">
                    <Button
                      mt="md"
                      disabled={
                        form.values.title.trim() == "" ||
                        form.values.description.trim() == ""
                      }
                      onClick={() => {
                        triggerCreateBumpFramework();
                      }}
                    >
                      Create
                    </Button>
                  </Flex>
                ) : (
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
                      {
                        (selectedBumpFramework?.title ==
                          form.values.title.trim() &&
                          selectedBumpFramework?.description ==
                          form.values.description.trim() &&
                          selectedBumpFramework?.default ==
                          form.values.default &&
                          selectedBumpFramework?.bump_length ==
                          bumpFrameworkLengthMarks.find(
                            (mark) => mark.value === bumpLengthValue
                          )?.api_label &&
                          selectedBumpFramework.bumped_count ==
                          form.values.bumpedCount &&
                          selectedBumpFramework.bump_delay_days ==
                          form.values.bumpDelayDays &&
                          selectedBumpFramework.use_account_research ==
                          form.values.useAccountResearch
                        ) ? <></> : (
                          <Button
                            mt="md"
                            onClick={() => {
                              triggerEditBumpFramework();
                            }}
                          >
                            Save
                          </Button>
                        )
                      }
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </form>
          </Card>
        </Flex>
      </Flex>
    </Paper>
  );
}
