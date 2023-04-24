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

type BumpFramework = {
  id: number;
  title: string;
  description: string;
  overall_status: string;
  active: boolean;
  default: boolean;
};

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

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);
    const result = await getBumpFrameworks(userToken, innerProps.overallStatus);
    setBumpFrameworks(result.extra);
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
        default: form.values.default
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
        default: form.values.default
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

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      default: false,
    },
  });

  useEffect(() => {
    triggerGetBumpFrameworks();
    setSelectedBumpFramework(innerProps.selectedBumpFramework);
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
      <Flex dir="row">
        <Flex w="50%">
          <Stack w="95%">
            <Button
              onClick={() => {
                form.values.title = "";
                form.values.description = "";
                form.values.default = false;
                setSelectedBumpFramework(null);
              }}
            >Create New Framework</Button>
            {
              bumpFrameworks?.map((framework) => {
                return (
                  <Card
                    onClick={() => {
                      form.values.title = framework.title;
                      form.values.description = framework.description;
                      form.values.default = framework.default;
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
                    <Text fw='bold' fz='lg'>
                      {framework.title}
                    </Text>
                    <Text fz='sm'>
                      {framework.description}
                    </Text>
                  </Card>
                )
              })
            }
          </Stack>
        </Flex>
        <Flex w="50%">

          <Card w="100%" withBorder>
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
              {
                selectedBumpFramework == null &&
                <Switch
                  mt='md'
                  label="Make default?"
                  labelPosition="right"
                  checked={form.values.default}
                  onChange={(e) => {
                    form.setFieldValue("default", e.currentTarget.checked);
                  }}
                />
              }

              <Flex justify={'flex-end'}>
                {
                  selectedBumpFramework == null ?


                    <Button
                      mt='md'
                      disabled={form.values.title.trim() == "" || form.values.description.trim() == ""}
                      onClick={() => {
                        triggerCreateBumpFramework();
                      }}
                    >
                      Create
                    </Button>
                    :
                    <Button
                      mt='md'
                      hidden={
                        selectedBumpFramework?.title == form.values.title.trim() &&
                        selectedBumpFramework?.description == form.values.description.trim() &&
                        selectedBumpFramework?.default == form.values.default
                      }
                      onClick={() => {
                        triggerEditBumpFramework();
                      }}
                    >
                      Save
                    </Button>
                }

              </Flex>
            </form>
          </Card>

        </Flex>
      </Flex>
    </Paper >
  );
}
