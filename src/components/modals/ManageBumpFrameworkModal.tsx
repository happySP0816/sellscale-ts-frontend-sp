import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Image,
  TextInput,
  LoadingOverlay,
  List,
  ThemeIcon,
  Flex,
  Stack,
  Card,
  Textarea,
  Badge,
  Switch,
  ScrollArea,
  Slider,
  Tooltip,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import {
  IconCheck,
  IconUser,
  IconX,
} from "@tabler/icons";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useEffect } from "react";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { createBumpFramework } from "@utils/requests/createBumpFramework";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";

type BumpFramework = {
  id: number;
  title: string;
  description: string;
  overall_status: string;
  active: boolean;
  default: boolean;
  bump_length: string;
};

const bumpFrameworkLengthMarks = [
  { value: 0, label: 'Short', api_label: "SHORT" },
  { value: 50, label: 'Medium', api_label: "MEDIUM" },
  { value: 100, label: 'Long', api_label: "LONG" },
];


export default function ManageBumpFramework({
  context,
  id,
  innerProps,
}: ContextModalProps<{ selectedBumpFramework: BumpFramework, overallStatus: string, backTriggerGetFrameworks: Function }>) {
  const theme = useMantineTheme();

  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);
  const [selectedBumpFramework, setSelectedBumpFramework] = useState<BumpFramework | null>(null);

  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);
    const result = await getBumpFrameworks(userToken, innerProps.overallStatus);

    let bumpFrameworkArray = [] as BumpFramework[];
    for (const bumpFramework of result.extra as BumpFramework[]) {
      if (bumpFramework.default) {
        bumpFrameworkArray.unshift(bumpFramework)
      } else {
        bumpFrameworkArray.push(bumpFramework)
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
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
      form.values.default
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework updated successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      innerProps.backTriggerGetFrameworks();
      triggerGetBumpFrameworks()
      setSelectedBumpFramework({
        id: selectedBumpFramework.id,
        title: form.values.title,
        description: form.values.description,
        overall_status: selectedBumpFramework.overall_status,
        active: selectedBumpFramework.active,
        default: form.values.default,
        bump_length: bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
      })
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoadingBumpFrameworks(false);
  }

  const triggerCreateBumpFramework = async () => {
    setLoadingBumpFrameworks(true);

    const result = await createBumpFramework(
      userToken,
      innerProps.overallStatus,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
      form.values.default
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework created successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      innerProps.backTriggerGetFrameworks();
      triggerGetBumpFrameworks()
      setSelectedBumpFramework({
        id: result.extra.bump_framework_id,
        title: form.values.title,
        description: form.values.description,
        overall_status: innerProps.overallStatus,
        active: true,
        default: form.values.default,
        bump_length: bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
      })
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoadingBumpFrameworks(false);
  }

  const triggerPostBumpDeactivate = async () => {
    setLoadingBumpFrameworks(true);

    if (selectedBumpFramework == null) {
      return;
    }

    const result = await postBumpDeactivate(
      userToken,
      selectedBumpFramework?.id,
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
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoadingBumpFrameworks(false);
  }

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      default: false
    },
  });

  useEffect(() => {
    triggerGetBumpFrameworks();
    setSelectedBumpFramework(innerProps.selectedBumpFramework);

    let length = bumpFrameworkLengthMarks.find((marks) => marks.api_label === innerProps.selectedBumpFramework?.bump_length)?.value
    if (length == null) {
      length = 50;
    }
    setBumpLengthValue(length)
    if (innerProps.selectedBumpFramework == null) {
      return;
    }
    form.values.title = innerProps.selectedBumpFramework.title;
    form.values.description = innerProps.selectedBumpFramework.description;
    form.values.default = innerProps.selectedBumpFramework.default;
  }, [])

  return (
    <Paper
      p={0}
      mih="250px"
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <LoadingOverlay visible={loadingBumpFrameworks} />
      <Flex dir="row">
        <Flex w="50%">
          <Stack w="95%" h="500px" >
            <Button
              h='60px'
              onClick={() => {
                form.values.title = "";
                form.values.description = "";
                form.values.default = false;
                setBumpLengthValue(50);
                setSelectedBumpFramework(null);
              }}
            >
              Create New Framework
            </Button>
            <ScrollArea offsetScrollbars>
              {
                bumpFrameworks?.map((framework) => {
                  return (
                    <Card
                      mb='sm'
                      onClick={() => {
                        let length = bumpFrameworkLengthMarks.find((marks) => marks.api_label === framework.bump_length)?.value
                        if (length == null) {
                          length = 50;
                        }
                        form.values.title = framework.title;
                        form.values.description = framework.description;
                        form.values.default = framework.default;
                        setBumpLengthValue(length)
                        setSelectedBumpFramework(framework)
                      }}
                      withBorder
                      styles={{
                        cardSection: {
                          cursor: "pointer",
                          border: "1px solid red"
                        }
                      }}
                    >
                      <Flex
                        justify='space-between'
                      >
                        {
                          framework.default ? (
                            <>
                              <Text fw='bold' fz='lg' w="70%">
                                {framework.title}
                              </Text>
                              <Badge
                                color='green'
                                size='xs'
                              >
                                Default
                              </Badge>
                            </>
                          ) : (
                            <Text fw='bold' fz='lg'>
                              {framework.title}
                            </Text>
                          )
                        }
                      </Flex>
                      <Text mt='xs' fz='sm'>
                        {framework.description}
                      </Text>
                    </Card>
                  )
                })
              }
            </ScrollArea>
          </Stack>
        </Flex>
        <Flex w="50%">

          <Card w="100%" mih="400px" withBorder>
            <form onSubmit={() => console.log('submit')}>
              {
                selectedBumpFramework == null ? (
                  <Text mb='sm' fz='lg' fw='bold'>
                    Create New Framework
                  </Text>
                ) :
                  (
                    <Flex justify={'flex-end'}>
                      <Switch
                        label="Default Framework?"
                        labelPosition="left"
                        checked={form.values.default}
                        onChange={(e) => {
                          form.setFieldValue("default", e.currentTarget.checked);
                        }}
                      />
                    </Flex>
                  )
              }

              <TextInput
                label="Title"
                placeholder={'Mention the Super Bowl'}
                {...form.getInputProps("title")}
              />
              <Textarea
                mt="md"
                label="Description"
                placeholder={'Mention the Super Bowl which is coming up soon.'}
                {...form.getInputProps("description")}
                autosize
              />
              <Text fz='sm' mt='md'>
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
                  mt='xs'
                  mb='xl'
                  p='md'
                  value={bumpLengthValue}
                  onChange={(value) => {
                    setBumpLengthValue(value);
                  }}
                />
              </Tooltip>
              {
                selectedBumpFramework == null &&
                <Switch
                  pt='md'
                  label="Make default?"
                  labelPosition="right"
                  checked={form.values.default}
                  onChange={(e) => {
                    form.setFieldValue("default", e.currentTarget.checked);
                  }}
                />
              }

              <Flex>
                {
                  selectedBumpFramework == null ?

                    <Flex w='100%' justify='flex-end'>
                      <Button
                        mt='md'
                        disabled={form.values.title.trim() == "" || form.values.description.trim() == ""}
                        onClick={() => {
                          triggerCreateBumpFramework();
                        }}
                      >
                        Create
                      </Button>
                    </Flex>
                    :
                    <Flex justify='space-between' w='100%'>
                      <Flex>
                        <Button
                          mt='md'
                          color='red'
                          onClick={() => {
                            triggerPostBumpDeactivate();
                          }}
                        >
                          Deactivate
                        </Button>
                      </Flex>
                      <Flex>
                        <Button
                          mt='md'
                          hidden={
                            selectedBumpFramework?.title == form.values.title.trim() &&
                            selectedBumpFramework?.description == form.values.description.trim() &&
                            selectedBumpFramework?.default == form.values.default &&
                            selectedBumpFramework?.bump_length == bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label
                          }
                          onClick={() => {
                            triggerEditBumpFramework();
                          }}
                        >
                          Save
                        </Button>
                      </Flex>
                    </Flex>
                }

              </Flex>
            </form>
          </Card>

        </Flex>
      </Flex>
    </Paper >
  );
}
