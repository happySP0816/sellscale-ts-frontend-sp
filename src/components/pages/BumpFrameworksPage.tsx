import { prospectSelectorTypeState } from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import PipelineSelector from "@common/pipeline/PipelineSelector";
import {
  Flex,
  Title,
  Text,
  ScrollArea,
  Card,
  Badge,
  LoadingOverlay,
  useMantineTheme,
  Switch,
  TextInput,
  Textarea,
  Tooltip,
  Slider,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import CreateBumpFrameworkModal from "@modals/CreateBumpFrameworkModal";
import { IconCheck, IconUserPlus, IconX } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { valueToColor } from "@utils/general";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import getPersonas from "@utils/requests/getPersonas";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BumpFramework } from "src";


const getPipelineData = (counts: any, theme: any) => {
  return new Map()
    .set("", {
      title: "All",
      // description: "Total prospects in the pipeline.",
      icon: IconUserPlus,
      value: counts?.total || "-",
      color: valueToColor(theme, "TOTAL"),
    })
    .set("ACCEPTED", {
      title: "Accepted",
      // description: "Prospects that have accepted the invite.",
      icon: IconUserPlus,
      value: counts?.ACCEPTED || "-",
      color: valueToColor(theme, "ACCEPTED"),
    })
    .set("BUMPED", {
      title: "Bumped",
      // description: "Prospects that have been bumped.",
      icon: IconUserPlus,
      value: counts?.BUMPED || "-",
      color: valueToColor(theme, "BUMPED"),
    })
    .set("ACTIVE_CONVO_NEXT_STEPS", {
      title: "Next Steps",
      // description: "Discussing next steps.",
      icon: IconUserPlus,
      value: counts?.ACTIVE_CONVO_NEXT_STEPS || "-",
      color: valueToColor(theme, "ACTIVE_CONVO"),
    })
    .set("ACTIVE_CONVO_OBJECTION", {
      title: "Objection",
      // description: "The prospect is skeptical.",
      icon: IconUserPlus,
      value: counts?.ACTIVE_CONVO_OBJECTION || "-",
      color: valueToColor(theme, "ACTIVE_CONVO"),
    })
    .set("ACTIVE_CONVO_QUESTION", {
      title: "Question",
      // description: "The prospect has a question.",
      icon: IconUserPlus,
      value: counts?.ACTIVE_CONVO_QUESTION || "-",
      color: valueToColor(theme, "ACTIVE_CONVO"),
    })
    .set("ACTIVE_CONVO_SCHEDULING", {
      title: "Scheduling",
      // description: "The prospect is scheduling a demo!",
      icon: IconUserPlus,
      value: counts?.ACTIVE_CONVO_SCHEDULING || "-",
      color: valueToColor(theme, "ACTIVE_CONVO"),
    })
    .set("ACTIVE_CONVO_QUAL_NEEDED", {
      title: "Qualifying",
      // description: "The prospect needs to be qualified more.",
      icon: IconUserPlus,
      value: counts?.ACTIVE_CONVO_QUAL_NEEDED || "-",
      color: valueToColor(theme, "ACTIVE_CONVO"),
    })
}


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
  const [
    selectedBumpFramework,
    setSelectedBumpFramework,
  ] = useState<BumpFramework | null>(null);
  const [overallStatuses, setOverallStatuses] = useState<string[]>([]);
  const [substatuses, setSubstatuses] = useState<string[]>([]);
  const [archetypeID, setArchetypeID] = useState<number[]>([]);
  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const [pipelineData, setPipelineData] = useState<Map<string, any>>(new Map());
  const [selectorType, setSelectorType] = useRecoilState(prospectSelectorTypeState);

  const [modalOpened, { open, close }] = useDisclosure();


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
      bumped_count: null,
    },
  });

  const triggerGetPersonas = async () => {
    const result = await getPersonas(userToken);

    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Could not get personas",
        color: "red",
      });
      return;
    }

    const personas = result.data;
    let activeArchetypes: any[] = [];
    for (const persona of personas) {
      if (persona.active) {
        activeArchetypes.push(persona.id);
      }
    }
    setArchetypeID(activeArchetypes);

    triggerGetBumpFrameworks([], [], activeArchetypes);
  }

  const triggerGetBumpFrameworks = async (
    manual_overall_statuses?: string[],
    manual_final_substatuses?: string[],
    manual_archetype_ids?: any[]
  ) => {
    setLoadingBumpFrameworks(true);

    // This needs reworking
    let final_substatuses = [];
    if (substatuses != null) {
      for (const substatus of substatuses as string[]) {
        if (substatus.includes("ACTIVE_CONVO_")) {
          final_substatuses.push(substatus);
        }
      }
    }

    const result = await getBumpFrameworks(
      userToken,
      manual_overall_statuses || overallStatuses,
      manual_final_substatuses || final_substatuses,
      manual_archetype_ids || archetypeID
    );

    if (result.status !== "success") {
      setLoadingBumpFrameworks(false);
      showNotification({
        title: "Error",
        message: "Could not get bump frameworks.",
        color: "red",
        autoClose: false,
      });
      return;
    }

    let bumpFrameworkArray = [] as BumpFramework[];
    for (const bumpFramework of result.data.bump_frameworks as BumpFramework[]) {
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
    }

    // Populate Pipeline Data
    const pipelineData = getPipelineData(result.data.counts, theme);
    setPipelineData(pipelineData);

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
      form.values.bumped_count,
      form.values.default,
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
        bumped_count: selectedBumpFramework.bumped_count,
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
    triggerGetPersonas();
    setSelectorType("");
  }, [])

  useEffect(() => {
    if (archetypeID.length == 0) {
      setBumpFrameworks([]);
      setSelectedBumpFramework(null);
      form.values.title = "";
      form.values.description = "";
      form.values.default = false;
      return;
    }
    triggerGetBumpFrameworks();
  }, [archetypeID, overallStatuses, substatuses]);

  useEffect(() => {
    if (selectorType === "") {
      setOverallStatuses([]);
      triggerGetBumpFrameworks([], [], []);
    } else if (selectorType === "ACCEPTED") {
      setOverallStatuses(["ACCEPTED"]);
      triggerGetBumpFrameworks(["ACCEPTED"], [])
    } else if (selectorType === "BUMPED") {
      setOverallStatuses(["BUMPED"]);
      triggerGetBumpFrameworks(["BUMPED"], [])
    } else if (selectorType.includes("ACTIVE_CONVO_")) {
      setOverallStatuses(["ACTIVE_CONVO"]);
      setSubstatuses([selectorType])
      triggerGetBumpFrameworks(["ACTIVE_CONVO"], [selectorType])
    }

  }, [selectorType])

  return (
    <>
      <Flex direction="column">
        <Title>Bump Frameworks</Title>
        <Flex mt="md">
          <PersonaSelect
            disabled={false}
            onChange={(archetype) => {
              if (archetype.length == 0) {
                setSelectorType("");
                setArchetypeID([]);
                triggerGetBumpFrameworks([], [], []);
                return;
              }
              setArchetypeID(archetype.map((a) => a.archetype_id));
            }}
            defaultValues={archetypeID}
            selectMultiple={false}
            label="Select Persona"
            description="Select the persona whose bump frameworks you want to view."
          />
        </Flex>

        <Flex my='md' justify={'center'} align={'center'}>
          <PipelineSelector data={pipelineData} loadingData={loadingBumpFrameworks} cardSize='xs' maxCols={8} minimal />
        </Flex>

        <Flex align="center" justify='right'>
          <Button
            variant="outline"
            disabled={archetypeID.length < 1}
            onClick={open}
          >
            Create New Framework
          </Button>
          <CreateBumpFrameworkModal
            modalOpened={modalOpened}
            openModal={open}
            closeModal={close}
            backFunction={triggerGetBumpFrameworks}
            dataChannels={data_channels}
            status={selectorType}
            archetypeID={archetypeID[0]}
          />
        </Flex>
        <Flex mt="md">
          <LoadingOverlay visible={loadingBumpFrameworks} />
          {
            bumpFrameworks.length === 0 ? (
              <>
                <Card withBorder w="100%" h={'fit-content'} mr='md'>
                  <Flex align="center" justify={"center"} >
                    Please create a new framework.
                  </Flex>
                </Card>
              </>
            ) : (
              <Flex dir="row" w="100%">
                <Flex w="60%">
                  <ScrollArea w="100%" offsetScrollbars>
                    {bumpFrameworks?.map((framework, index) => {
                      return (
                        <Card
                          key={index}
                          w="100%"
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
                            setBumpLengthValue(length);
                            setSelectedBumpFramework(framework);
                          }}
                          withBorder
                          sx={{
                            cursor: "pointer",
                            background: framework === selectedBumpFramework ? "#e8f4f8" : "white",
                            "&:hover": {
                              opacity: framework === selectedBumpFramework ? 1 : 0.5,
                            },
                          }}
                        >
                          <Flex justify="space-between">
                            {framework.default ? (
                              <>
                                <Flex align={"center"}>
                                  <Text fw="bold" fz="lg">
                                    {framework.title}
                                  </Text>
                                  <Badge
                                    color={valueToColor(
                                      theme,
                                      framework.overall_status
                                    )}
                                    size="xs"
                                    ml="xs"
                                    variant="filled"
                                  >
                                    {framework.overall_status}
                                  </Badge>
                                </Flex>
                                <Flex align="center">
                                  <Badge color="green" size="xs">
                                    Default
                                  </Badge>
                                </Flex>
                              </>
                            ) : (
                              <Flex align={"center"}>
                                <Text fw="bold" fz="lg">
                                  {framework.title}
                                </Text>
                                <Badge
                                  color={valueToColor(
                                    theme,
                                    framework.overall_status
                                  )}
                                  size="xs"
                                  ml="xs"
                                  variant="filled"
                                >
                                  {framework.overall_status}
                                </Badge>
                              </Flex>
                            )}
                          </Flex>
                          <Text mt="xs" fz="sm">
                            {framework.description}
                          </Text>
                          {/* <Flex wrap={"wrap"} mt="md">
                            {framework.archetypes.map((archetype) => {
                              return (
                                <Badge
                                  color={valueToColor(
                                    theme,
                                    archetype.archetype_name
                                  )}
                                  size="xs"
                                  mr="xs"
                                  mt="xs"
                                  key={archetype.archetype_id}
                                  variant="dot"
                                >
                                  {archetype.archetype_name}
                                </Badge>
                              );
                            })}
                          </Flex> */}
                        </Card>
                      );
                    })}
                  </ScrollArea>
                </Flex>

                <Flex w="40%">
                  <Card w="100%" h="fit-content" withBorder>
                    <form onSubmit={() => console.log("submit")}>
                      <Flex align={'center'} justify={"space-between"}>
                        <Title order={3}>
                          Edit Framework
                        </Title>
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
                      <TextInput
                        mt='md'
                        label="Title"
                        placeholder={"Mention the Super Bowl"}
                        {...form.getInputProps("title")}
                      />
                      <Textarea
                        mt="md"
                        label="Description"
                        placeholder={
                          "Mention the Super Bowl which is coming up soon."
                        }
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
                      {/* <Flex wrap="wrap" mt="xs" w="100%">
                        <PersonaSelect
                          disabled={false}
                          onChange={(archetypes) =>
                            form.setFieldValue("archetypes", archetypes)
                          }
                          selectMultiple={true}
                          label="Personas"
                          description="Select the personas this framework applies to."
                          defaultValues={form.values.archetypes.map(
                            (archetype) => archetype.archetype_id
                          )}
                        />
                      </Flex> */}
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
                            {selectedBumpFramework?.title ==
                              form.values.title.trim() &&
                              selectedBumpFramework?.description ==
                              form.values.description.trim() &&
                              selectedBumpFramework?.default ==
                              form.values.default &&
                              selectedBumpFramework?.bump_length ==
                              bumpFrameworkLengthMarks.find(
                                (mark) => mark.value === bumpLengthValue
                              )?.api_label ? (
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
                    </form>
                  </Card>
                </Flex>
              </Flex>
            )
          }
        </Flex>
      </Flex>
    </>
  );
}
