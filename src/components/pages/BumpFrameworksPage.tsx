import { userTokenState } from "@atoms/userAtoms";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { Flex, Title, Text, ScrollArea, Card, Badge, LoadingOverlay, useMantineTheme, Switch, TextInput, Textarea, Tooltip, Slider, Button, MultiSelect, Select } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { valueToColor } from "@utils/general";
import { createBumpFramework } from "@utils/requests/createBumpFramework";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { BumpFramework } from "src";


const bumpFrameworkLengthMarks = [
  { value: 0, label: "Short", api_label: "SHORT" },
  { value: 50, label: "Medium", api_label: "MEDIUM" },
  { value: 100, label: "Long", api_label: "LONG" },
];


export default function BumpFrameworksPage() {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);
  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);
  const [selectedBumpFramework, setSelectedBumpFramework] = useState<BumpFramework | null>(null);
  const [overallStatuses, setOverallStatuses] = useState<string[]>([]);
  const [archetypeIDs, setArchetypeIDs] = useState<number[]>([]);
  const [bumpLengthValue, setBumpLengthValue] = useState(50);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: data_channels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      default: false,
      archetypes: [
        {
          archetype_id: -1,
          archetype_name: "",
        }
      ],
    },
  });

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);
    const result = await getBumpFrameworks(userToken, overallStatuses, archetypeIDs);

    if (result.status !== 'success') {
      setLoadingBumpFrameworks(false);
      showNotification({
        title: 'Error',
        message: "Could not get bump frameworks.",
        color: 'red',
        autoClose: false,
      });
      return;
    }

    let bumpFrameworkArray = [] as BumpFramework[];
    for (const bumpFramework of result.data as BumpFramework[]) {
      if (bumpFramework.default) {
        bumpFrameworkArray.unshift(bumpFramework);
      } else {
        bumpFrameworkArray.push(bumpFramework);
      }
    }

    setBumpFrameworks(bumpFrameworkArray);
    if (bumpFrameworkArray.length > 0) {
      const firstBumpFramework = bumpFrameworkArray[0];
      setSelectedBumpFramework(firstBumpFramework);
      form.values.title = firstBumpFramework.title;
      form.values.description = firstBumpFramework.description;
      form.values.default = firstBumpFramework.default;
      form.values.archetypes = firstBumpFramework.archetypes;
      let length = bumpFrameworkLengthMarks.find(
        (marks) => marks.api_label === firstBumpFramework.bump_length
      )?.value;
      if (length == null) {
        length = 50;
      }
      setBumpLengthValue(length);
    } else {
      setSelectedBumpFramework(null);
      form.values.title = "";
      form.values.description = "";
      form.values.default = false;
      form.values.archetypes = [];
    }
    

    setLoadingBumpFrameworks(false);
  };

  const triggerCreateBumpFramework = async () => {
    setLoadingBumpFrameworks(true);

    const result = await createBumpFramework(
      userToken,
      selectedStatus as string,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)
        ?.api_label as string,
      form.values.default,
      form.values.archetypes?.map(archetype => archetype.archetype_id)
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework created successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      triggerGetBumpFrameworks();
      setSelectedBumpFramework({
        id: result.data.bump_framework_id,
        title: form.values.title,
        description: form.values.description,
        overall_status: selectedStatus as string,
        active: true,
        default: form.values.default,
        bump_length: bumpFrameworkLengthMarks.find(
          (mark) => mark.value === bumpLengthValue
        )?.api_label as string,
        archetypes: form.values.archetypes
      });
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }
  }

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
      form.values.default,
      form.values.archetypes?.map(archetype => archetype.archetype_id)
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework updated successfully",
        color: theme.colors.green[7],
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
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
        archetypes: form.values.archetypes
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
      form.values.title = "";
      form.values.description = "";
      form.values.default = false;
      form.values.archetypes = [];
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

  useEffect(() => {
    if (archetypeIDs.length == 0) {
      setBumpFrameworks([]);
      setSelectedBumpFramework(null);
      form.values.title = "";
      form.values.description = "";
      form.values.default = false;
      form.values.archetypes = [];
      return;
    };
    triggerGetBumpFrameworks();
  }, [archetypeIDs, overallStatuses])

  return (
    <>
      <Flex direction="column">
        <Title>Bump Frameworks</Title>
        <Flex mt='md'>
          <PersonaSelect
            disabled={false}
            onChange={(archetype) => setArchetypeIDs(archetype.map((a) => a.archetype_id))}
            selectMultiple={true}
            label="Select Personas"
            description="Select the personas whose bump frameworks you want to view."
          />
        </Flex>
        <Flex align='center' justify='space-between'>
        <MultiSelect
          mt='xs'
          miw='300px'
          w='fit-content'
          data={
            // If channels are not loaded or failed to fetch, don't show anything
            !data_channels || data_channels.status !== "success"
              ? []
              : // Otherwise, show overall statuses
              data_channels?.data["SELLSCALE"]?.statuses_available?.map(
                (status: string) => {
                  return {
                    label: data_channels.data["SELLSCALE"][status].name,
                    value: status,
                  };
                }
              )
          }
          mb="md"
          label="Filter by status"
          placeholder="Select statuses"
          searchable
          nothingFound="Nothing found"
          value={overallStatuses}
          onChange={setOverallStatuses}
        />
        <Button
          variant='outline'
          disabled={archetypeIDs.length < 1}
          onClick={() => {
            setSelectedBumpFramework(null);
            form.values.title = "";
            form.values.description = "";
            form.values.default = false;
            form.values.archetypes = [];
          }}
        >
          Create New Framework
        </Button>
        </Flex>
        <Flex mt='md'>
          <LoadingOverlay visible={loadingBumpFrameworks} />
          {
            bumpFrameworks.length == 0 ? (
              <Card
                withBorder
                w='100%'
              >
                {
                  archetypeIDs.length == 0 ? (
                    <Flex align='center' justify={'center'}>
                      Please select a persona above.
                    </Flex>
                  ) : <Flex align='center' justify={'center'}>
                    No results found. Please modify your search.
                  </Flex>
                }
              </Card>
            ) : (
              <Flex dir='row'>

                <Flex w='60%'>
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
                            form.values.archetypes = framework.archetypes;
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
                          style={{
                            backgroundColor: selectedBumpFramework?.id === framework.id ? theme.colors.blue[0] : 'white',
                          }}
                        >
                          <Flex justify="space-between">
                            {framework.default ? (
                              <>
                                <Flex align={'center'}>
                                  <Text fw="bold" fz="lg">
                                    {framework.title}
                                  </Text>
                                  <Badge
                                    color={valueToColor(theme, framework.overall_status)}
                                    size='xs'
                                    ml='xs'
                                    variant='filled'
                                  >
                                    {framework.overall_status}
                                  </Badge>
                                </Flex>
                                <Flex align='center'>
                                  <Badge color="green" size="xs">
                                    Default
                                  </Badge>
                                </Flex>
                              </>
                            ) : (
                              <Flex align={'center'}>
                                <Text fw="bold" fz="lg">
                                  {framework.title}
                                </Text>
                                <Badge
                                  color={valueToColor(theme, framework.overall_status)}
                                  size='xs'
                                  ml='xs'
                                  variant='filled'
                                >
                                  {framework.overall_status}
                                </Badge>
                              </Flex>
                            )}
                          </Flex>
                          <Text mt="xs" fz="sm">
                            {framework.description}
                          </Text>
                          <Flex wrap={'wrap'} mt='md'>
                            {
                              framework.archetypes.map((archetype) => {
                                return (
                                  <Badge
                                    color={valueToColor(theme, archetype.archetype_name)}
                                    size="xs"
                                    mr="xs"
                                    mt="xs"
                                    key={archetype.archetype_id}
                                    variant='dot'
                                  >
                                    {archetype.archetype_name}
                                  </Badge>
                                );
                              })
                            }
                          </Flex>
                        </Card>
                      );
                    })}
                  </ScrollArea>
                </Flex>

                <Flex w="40%" >
                  <Card w="100%" h='fit-content' withBorder>
                    <form onSubmit={() => console.log("submit")}>
                      {selectedBumpFramework == null ? (
                        <Text mb="sm" fz="lg" fw="bold">
                          Create New Framework
                        </Text>
                      ) : (
                        <Flex justify={"flex-end"}>
                          <Switch
                            label="Default Framework?"
                            labelPosition="left"
                            checked={form.values.default}
                            onChange={(e) => {
                              form.setFieldValue("default", e.currentTarget.checked);
                            }}
                          />
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
                          mt="xs"
                          mb="xl"
                          p="md"
                          value={bumpLengthValue}
                          onChange={(value) => {
                            setBumpLengthValue(value);
                          }}
                        />
                      </Tooltip>
                      <Flex wrap='wrap' mt='xs' w='100%'>
                        <PersonaSelect
                          disabled={false}
                          onChange={(archetypes) => form.setFieldValue('archetypes', archetypes)}
                          selectMultiple={true}
                          label="Personas"
                          description="Select the personas this framework applies to."
                          defaultValues={form.values.archetypes.map(archetype => archetype.archetype_id)}
                        />
                      </Flex>
                      {selectedBumpFramework == null && (
                        <>
                        <Select
                          label="Status"
                          description="Which status should use this bump?"
                          placeholder="select status..."
                          // data={overallStatuses.map((status) => {
                          //   console.log(status)
                          //   return {
                          //     label: data_channels?.data["SELLSCALE"][status].name,
                          //     value: status,
                          //   };
                          // })}
                          data={data_channels?.data["SELLSCALE"]?.statuses_available?.map(
                            (status: string) => {
                              return {
                                label: data_channels?.data["SELLSCALE"][status].name,
                                value: status,
                              };
                            }
                          )}
                          onChange={setSelectedStatus}
                          mt='md'
                          withAsterisk
                        />
                        <Switch
                          pt="md"
                          label="Make default?"
                          labelPosition="right"
                          checked={form.values.default}
                          onChange={(e) => {
                            form.setFieldValue("default", e.currentTarget.checked);
                          }}
                        />
                        </>
                      )}

                      <Flex>
                        {selectedBumpFramework == null ? (
                          <Flex w="100%" justify="flex-end">
                            <Button
                              mt="md"
                              disabled={
                                form.values.title.trim() == "" ||
                                form.values.description.trim() == "" ||
                                form.values.archetypes.length == 0 ||
                                selectedStatus == null
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
                                  selectedBumpFramework?.archetypes == form.values.archetypes
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
            )
          }
        </Flex>
      </Flex>
    </>
  )
}