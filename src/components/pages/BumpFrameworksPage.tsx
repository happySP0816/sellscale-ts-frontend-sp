import { userDataState, userTokenState } from "@atoms/userAtoms";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import {
  Flex,
  Title,
  Text,
  Card,
  LoadingOverlay,
  useMantineTheme,
  Button,
  Grid,
  Tabs,
  Divider,
  ActionIcon,
  Tooltip,
  Switch,
  Loader,
  Badge,
  ScrollArea,
  Stack,
  HoverCard,
  Container,
  Accordion,
  Box,
  Checkbox,
  UnstyledButton,
  Radio,
  Group,
  Input,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import CreateBumpFrameworkModal from "@modals/CreateBumpFrameworkModal";
import CloneBumpFrameworkModal from "@modals/CloneBumpFrameworkModal";
import {
  IconAlertTriangle,
  IconAnalyze,
  IconArrowLeft,
  IconArrowLeftBar,
  IconArrowRight,
  IconBook,
  IconBrandPushbullet,
  IconChartBubble,
  IconCheck,
  IconChecklist,
  IconEdit,
  IconFolders,
  IconList,
  IconMessage,
  IconMessage2,
  IconPencil,
  IconPlus,
  IconPoint,
  IconRobot,
  IconSearch,
  IconTool,
  IconTransferIn,
  IconUser,
  IconWashMachine,
  IconX,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { formatToLabel, valueToColor } from "@utils/general";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BumpFramework, MsgResponse } from "src";
import { currentProjectState } from "@atoms/personaAtoms";
import LinkedInConvoSimulator from "@common/simulators/linkedin/LinkedInConvoSimulator";
import { DataTable } from "mantine-datatable";
import TextWithNewline from "@common/library/TextWithNewlines";
import postToggleAutoBump from "@utils/requests/postToggleAutoBump";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import VoicesSection from "@common/voice_builder/VoicesSection";
import LinkedInSequenceSection, {
  PersonalizationSection,
} from "@common/sequence/LinkedInSequenceSection";
import LinkedInConnectedCard from "@common/settings/LinkedInIntegrationCard";
import { getFreshCurrentProject } from "@auth/core";
import { API_URL } from "@constants/data";
import { postBumpDeactivate } from "@utils/requests/postBumpDeactivate";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import _ from "lodash";

type BumpFrameworkBuckets = {
  ACCEPTED: {
    total: number;
    frameworks: BumpFramework[];
  };
  BUMPED: Record<
    string,
    {
      total: number;
      frameworks: BumpFramework[];
    }
  >;
  ACTIVE_CONVO: {
    total: number;
    frameworks: BumpFramework[];
  };
};

function BumpBucketView(props: {
  bumpBucket: {
    total: number;
    frameworks: BumpFramework[];
  };
  bucketViewTitle: string;
  bucketViewDescription: string;
  status: string;
  dataChannels: MsgResponse | undefined;
  archetypeID: number | null;
  afterCreate: () => void;
  afterClone: () => void;
  afterEdit: () => void;
  bumpedCount?: number;
}) {
  const theme = useMantineTheme();

  const [createBFModalOpened, { open, close }] = useDisclosure();
  const [cloneBFModalOpened, { open: openClone, close: closeClone }] =
    useDisclosure();
  const [showAll, setShowAll] = useState(false);

  return (
    <Box w="100%">
      <Card shadow="sm" padding="sm" withBorder w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Title order={5}>{props.bucketViewTitle}</Title>
            <Text ml="sm" size="xs">
              {props.bucketViewDescription}
            </Text>
          </Flex>
          <Flex>
            <Tooltip label="Clone an existing Bump Framework" withinPortal>
              <ActionIcon onClick={openClone}>
                <IconFolders size="1.25rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Create a new Bump Framework" withinPortal>
              <ActionIcon onClick={open}>
                <IconPlus size="1.25rem" />
              </ActionIcon>
            </Tooltip>
          </Flex>
          <CreateBumpFrameworkModal
            modalOpened={createBFModalOpened}
            openModal={open}
            closeModal={close}
            backFunction={props.afterCreate}
            dataChannels={props.dataChannels}
            status={props.status}
            archetypeID={props.archetypeID}
            bumpedCount={props.bumpedCount}
          />
          <CloneBumpFrameworkModal
            modalOpened={cloneBFModalOpened}
            openModal={openClone}
            closeModal={closeClone}
            backFunction={props.afterClone}
            archetypeID={props.archetypeID as number}
            status={props.status}
            bumpedCount={props.bumpedCount}
          />
        </Flex>
        <Card.Section>
          <Divider mt="sm" />
        </Card.Section>

        {/* Bump Frameworks */}
        <Card.Section px="xs">
          {props.bumpBucket && props.bumpBucket.total === 0 ? (
            // No Bump Frameworks
            <Flex justify="center" align="center">
              <Text my="md">
                Please create a Bump Framework using the + button above.
              </Text>
            </Flex>
          ) : (
            <>
              {props.bumpBucket.frameworks.map((framework, index) => {
                // Show only the first Bump Framework of not showing all
                if (index > 0 && !showAll) {
                  return <></>;
                }

                let bumpConversionRate;
                if (
                  framework.etl_num_times_converted &&
                  framework.etl_num_times_used
                ) {
                  bumpConversionRate =
                    (framework.etl_num_times_converted /
                      framework.etl_num_times_used) *
                    100;
                }

                return (
                  <>
                    <Flex justify="space-between" align="center" pt="xs">
                      <Flex direction="row" align="center">
                        <Flex
                          direction="column"
                          align="center"
                          justify="center"
                          ml="md"
                        >
                          <Switch
                            onLabel="Default"
                            offLabel="Default"
                            checked={framework.default === true}
                            thumbIcon={
                              framework.default === true ? (
                                <IconCheck
                                  size="0.8rem"
                                  color={
                                    theme.colors.teal[theme.fn.primaryShade()]
                                  }
                                  stroke={3}
                                />
                              ) : (
                                <IconX
                                  size="0.8rem"
                                  color={
                                    theme.colors.red[theme.fn.primaryShade()]
                                  }
                                  stroke={3}
                                />
                              )
                            }
                            disabled={true}
                            styles={{
                              label: {
                                backgroundColor:
                                  framework.default === true
                                    ? theme.colors.teal[theme.fn.primaryShade()]
                                    : theme.colors.red[theme.fn.primaryShade()],
                              },
                            }}
                          />

                          <Tooltip
                            label={`Prospects reply to this bump directly, ${
                              bumpConversionRate?.toFixed(2) || "an unknown "
                            }% of the time`}
                            withinPortal
                            withArrow
                          >
                            <Badge
                              mt="xs"
                              variant="outline"
                              size="xs"
                              color={"green"}
                            >
                              {bumpConversionRate?.toFixed(2) || "N/A"}%
                            </Badge>
                          </Tooltip>
                        </Flex>
                        <Flex direction="column" ml="xl">
                          <Flex direction="row">
                            <Text fw="bold" fz="lg" mr="8px">
                              {framework.title}
                            </Text>
                            {framework.use_account_research && (
                              <Tooltip
                                withArrow
                                withinPortal
                                label="This BumpFramework will use Account Research"
                              >
                                <div>
                                  <IconSearch size=".75rem" stroke="2px" />
                                </div>
                              </Tooltip>
                            )}
                          </Flex>
                          <TextWithNewline
                            breakheight="6px"
                            style={{ fontSize: "80%" }}
                          >
                            {framework.description}
                          </TextWithNewline>
                        </Flex>
                      </Flex>
                      <Tooltip label="Edit Bump Framework" withinPortal>
                        <ActionIcon
                          onClick={() => {
                            openContextModal({
                              modal: "editBumpFramework",
                              title: (
                                <Title order={3}>Edit: {framework.title}</Title>
                              ),
                              innerProps: {
                                bumpFrameworkID: framework.id,
                                overallStatus: framework.overall_status,
                                title: framework.title,
                                description: framework.description,
                                bumpLength: framework.bump_length,
                                default: framework.default,
                                onSave: props.afterEdit,
                                bumpedCount: framework.bumped_count,
                                bumpDelayDays: framework.bump_delay_days,
                                useAccountResearch:
                                  framework.use_account_research,
                                transformerBlocklist:
                                  framework.transformer_blocklist,
                              },
                            });
                          }}
                        >
                          <IconEdit size="1.25rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                    <Card.Section>
                      <Divider mt="sm" />
                    </Card.Section>
                  </>
                );
              })}
              {props.bumpBucket.frameworks.length > 1 && (
                <Card.Section>
                  <Flex justify="center">
                    <Button
                      variant="subtle"
                      styles={{
                        root: {
                          "&:hover": {
                            backgroundColor: "transparent",
                          },
                        },
                      }}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll
                        ? "Hide"
                        : `Show all ${props.bumpBucket.total} frameworks...`}
                    </Button>
                  </Flex>
                </Card.Section>
              )}
            </>
          )}
        </Card.Section>
      </Card>
      {props.bumpBucket.frameworks.map((framework, index) => {
        // Show only the first Bump Framework of not showing all
        if (index > 0 && !showAll) {
          return <></>;
        }
        return (
          <Card padding="sm" w="100%" mb="12px" mt="12px">
            <Card.Section px="xs">
              <Flex align={"center"} justify={"center"} w="100%">
                <Tooltip
                  label={`Prospect will be snoozed for ${framework.bump_delay_days} days after bump is sent`}
                  withinPortal
                >
                  <Badge
                    mt="12px"
                    size="md"
                    color={valueToColor(
                      theme,
                      formatToLabel(framework.bump_delay_days + "")
                    )}
                    variant="filled"
                  >
                    Snooze for {framework.bump_delay_days} day
                    {framework.bump_delay_days > 1 ? "s" : ""}
                  </Badge>
                </Tooltip>
              </Flex>
            </Card.Section>
          </Card>
        );
      })}
    </Box>
  );
}

function QuestionObjectionLibraryCard(props: {
  archetypeID: number | null;
  bumpFramework: BumpFramework;
  afterEdit: () => void;
}) {
  const theme = useMantineTheme();

  const splitted_substatus = props.bumpFramework?.substatus?.replace(
    "ACTIVE_CONVO_",
    ""
  );

  return (
    <>
      <Card withBorder p="sm" radius="md">
        <Card.Section px="md" pt="md">
          <Flex justify="space-between" align="center">
            <Title order={5}>{props.bumpFramework.title}</Title>
            <ActionIcon
              onClick={() => {
                openContextModal({
                  modal: "editBumpFramework",
                  title: (
                    <Title order={3}>Edit: {props.bumpFramework.title}</Title>
                  ),
                  innerProps: {
                    bumpFrameworkID: props.bumpFramework.id,
                    overallStatus: props.bumpFramework.overall_status,
                    title: props.bumpFramework.title,
                    description: props.bumpFramework.description,
                    bumpLength: props.bumpFramework.bump_length,
                    default: props.bumpFramework.default,
                    onSave: props.afterEdit,
                    bumpedCount: props.bumpFramework.bumped_count,
                    bumpDelayDays: props.bumpFramework.bump_delay_days,
                    useAccountResearch:
                      props.bumpFramework.use_account_research,
                    transformerBlocklist:
                      props.bumpFramework.transformer_blocklist,
                  },
                });
              }}
            >
              <IconEdit size="1.25rem" />
            </ActionIcon>
          </Flex>
        </Card.Section>

        <Card.Section>
          <Divider my="xs" />
        </Card.Section>
        <Flex mih="100px" align="center">
          <TextWithNewline>{props.bumpFramework.description}</TextWithNewline>
        </Flex>

        <Card.Section>
          <Divider my="xs" />
        </Card.Section>

        <Text fz="xs">For convos with status labeled:</Text>
        <Badge
          color={valueToColor(theme, splitted_substatus || "ACTIVE_CONVO")}
        >
          {splitted_substatus || "ACTIVE_CONVO"}
        </Badge>
      </Card>
    </>
  );
}

function BumpFrameworkAnalysisTable(props: {
  bumpBucket: {
    total: number;
    frameworks: BumpFramework[];
  };
  bucketViewDescription: string;
  bucketViewTitle: string;
  showSubstatus?: boolean;
  persona?: string;
}) {
  return (
    <Flex direction="column" w="100%">
      <Flex>
        <Title order={5}>{props.bucketViewTitle}</Title>
        <Text ml="sm" fz="sm" color="gray">
          - {props.bucketViewDescription}
        </Text>
      </Flex>

      {props.bumpBucket?.frameworks?.length > 0 ? (
        <DataTable
          mt="sm"
          withBorder
          shadow="sm"
          borderRadius="sm"
          highlightOnHover
          records={props.bumpBucket.frameworks}
          columns={[
            {
              accessor: "title",
              title: "Title",
              sortable: true,
              width: "50%",
              render: ({ title, description }) => {
                return (
                  <HoverCard
                    withinPortal
                    withArrow
                    width="460px"
                    styles={{
                      dropdown: {
                        padding: "12px",
                        border: "1px solid green",
                      },
                    }}
                  >
                    <HoverCard.Target>
                      <Text>{title}</Text>
                    </HoverCard.Target>
                    <HoverCard.Dropdown p="md">
                      <Title order={3}>{title}</Title>
                      <Badge mt="xs" size="sm">
                        {props.persona}
                      </Badge>
                      <Flex mt="md">
                        <TextWithNewline breakheight="10px">
                          {description}
                        </TextWithNewline>
                      </Flex>
                    </HoverCard.Dropdown>
                  </HoverCard>
                );
              },
            },
            {
              accessor: "etl_num_times_used",
              title: "Times Used",
              sortable: true,
              render: ({ etl_num_times_used }) =>
                etl_num_times_used ? etl_num_times_used : 0,
            },
            {
              accessor: "etl_num_times_converted",
              title: "Times Converted",
              sortable: true,
              render: ({ etl_num_times_converted }) =>
                etl_num_times_converted ? etl_num_times_converted : 0,
            },
            {
              accessor: "etl_conversion_rate",
              title: "Conversion Rate",
              sortable: true,
              render: ({ etl_num_times_used, etl_num_times_converted }) => {
                if (etl_num_times_used && etl_num_times_converted) {
                  const percentage =
                    (etl_num_times_converted / etl_num_times_used) * 100;
                  return `${percentage.toFixed(2)}%`;
                }
                return `0%`;
              },
            },
          ]}
        />
      ) : (
        <Flex justify="center" mt="xl">
          <Loader />
        </Flex>
      )}
    </Flex>
  );
}

export default function BumpFrameworksPage(props: {
  predefinedPersonaId?: number;
  onPopulateBumpFrameworks?: (buckets: BumpFrameworkBuckets) => void;
  hideTitle?: boolean;
  defaultTab?: string;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [loading, setLoading] = useState(false);
  const theme = useMantineTheme();

  const [
    addNewSequenceStepOpened,
    { open: openSequenceStep, close: closeSequenceStep },
  ] = useDisclosure();
  const [
    addNewQuestionObjectionOpened,
    { open: openQuestionObjection, close: closeQuestionObjection },
  ] = useDisclosure();
  const [maximumBumpSoftLock, setMaximumBumpSoftLock] = useState(false);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const archetypeID = currentProject?.id || -1;
  const [collapseSimulation, setCollapseSimulator] = useState(true);
  const [numActiveCTAs, setNumActiveCTAs] = useState(0);

  const [data, setData] = useState<any>({} || undefined);
  const [edit, setEdit] = useState(false);
  const [blocklist, setBlockList] = useState<any>([]);
  const [list, setList] = useState<any>([]);
  const [deactivateState, setDeactivateState] = useState(false);

  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const bumpBuckets = useRef<BumpFrameworkBuckets>({
    ACCEPTED: {
      total: 0,
      frameworks: [],
    },
    BUMPED: {},
    ACTIVE_CONVO: {
      total: 0,
      frameworks: [],
    },
  } as BumpFrameworkBuckets);

  const bumpFrameworkLengthMarks = [
    { value: 0, label: "Short", api_label: "SHORT" },
    { value: 50, label: "Medium", api_label: "MEDIUM" },
    { value: 100, label: "Long", api_label: "LONG" },
  ];

  const { data: dataChannels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  const triggerToggleAutoBump = async () => {
    let status = "";
    let old_status;
    if (userData.auto_bump) {
      status = "Disabled";
      old_status = "Enabled";
    } else {
      status = "Enabled";
      old_status = "Disabled";
    }

    const result = await postToggleAutoBump(userToken);

    if (result.status === "success") {
      setUserData({ ...userData, auto_bump: !userData.auto_bump });
      showNotification({
        title: `AutoBump ${status}`,
        message: `AutoBump has been ${status.toLowerCase()}. You can ${old_status.toLowerCase()} it at any time.`,
        color: "green",
        icon: <IconCheck size="1rem" />,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
        icon: <IconAlertTriangle size="1rem" />,
      });
    }
  };

  const triggerGetBumpFrameworks = async () => {
    setLoading(true);

    const result = await getBumpFrameworks(
      userToken,
      [],
      [],
      [archetypeID],
      undefined,
      undefined,
      undefined,
      undefined,
      archetypeID
    );
    setLoading(false);

    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message:
          "Could not get bump frameworks for archetype ID " + archetypeID,
        color: "red",
        autoClose: false,
      });
      return;
    }

    // Populate bump buckets
    let newBumpBuckets = {
      ACCEPTED: {
        total: 0,
        frameworks: [],
      },
      BUMPED: {
        1: {
          total: 0,
          frameworks: [],
        },
        2: {
          total: 0,
          frameworks: [],
        },
        3: {
          total: 0,
          frameworks: [],
        },
      },
      ACTIVE_CONVO: {
        total: 0,
        frameworks: [],
      },
    } as BumpFrameworkBuckets;
    for (const bumpFramework of result.data
      .bump_frameworks as BumpFramework[]) {
      const status = bumpFramework.overall_status;
      if (status === "ACCEPTED") {
        newBumpBuckets.ACCEPTED.total += 1;
        if (bumpFramework.default) {
          newBumpBuckets.ACCEPTED.frameworks.unshift(bumpFramework);
        } else {
          newBumpBuckets.ACCEPTED.frameworks.push(bumpFramework);
        }
      } else if (status === "BUMPED") {
        const bumpCount = bumpFramework.bumped_count as number;
        if (!(bumpCount in newBumpBuckets.BUMPED)) {
          continue;
        }
        newBumpBuckets.BUMPED[bumpCount].total += 1;
        if (bumpCount >= 3) {
          setMaximumBumpSoftLock(true);
        }
        if (bumpFramework.default) {
          newBumpBuckets.BUMPED[bumpCount].frameworks.unshift(bumpFramework);
        } else {
          newBumpBuckets.BUMPED[bumpCount].frameworks.push(bumpFramework);
        }
      } else if (status === "ACTIVE_CONVO") {
        newBumpBuckets.ACTIVE_CONVO.total += 1;
        if (bumpFramework.default) {
          newBumpBuckets.ACTIVE_CONVO.frameworks.unshift(bumpFramework);
        } else {
          newBumpBuckets.ACTIVE_CONVO.frameworks.push(bumpFramework);
        }
      }
    }
    const sortedActiveConvo = _.sortBy(
      newBumpBuckets.ACTIVE_CONVO.frameworks,
      (obj) => obj.substatus
    );
    newBumpBuckets.ACTIVE_CONVO.frameworks = sortedActiveConvo;

    bumpBuckets.current = newBumpBuckets;
    setLoading(false);

    setData(bumpBuckets.current?.ACTIVE_CONVO.frameworks[0]);
    setBlockList(
      bumpBuckets.current?.ACTIVE_CONVO.frameworks[0].transformer_blocklist
    );

    // BumpFrameworks have been updated, submit event to parent
    if (props.onPopulateBumpFrameworks) {
      props.onPopulateBumpFrameworks(newBumpBuckets);
    }
  };

  const triggerPostBumpDeactivate = async () => {
    setLoading(true);
    setDeactivateState(true);

    const result = await postBumpDeactivate(userToken, data?.id);
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework deactivated successfully",
        color: theme.colors.green[7],
      });
      setLoading(false);
      alert("Bump Framework deactivated successfully");
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
    setDeactivateState(false);
  };

  const triggerEditBumpFramework = async () => {
    const result = await patchBumpFramework(
      userToken,
      data.id,
      data.overall_status,
      data.title,
      data.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)
        ?.api_label as string,
      data.bumped_count,
      data.bump_delay_days,
      data.default,
      data.use_account_research,
      list
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework updated successfully",
        color: theme.colors.green[7],
      });
      setLoading(false);
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: theme.colors.red[7],
      });
    }
    triggerGetBumpFrameworks();
  };

  useEffect(() => {
    triggerGetBumpFrameworks();
  }, [archetypeID, deactivateState]);

  useEffect(() => {
    let length = bumpFrameworkLengthMarks.find(
      (marks) => marks.api_label === data.bumpLength
    )?.value;
    if (length == null) {
      length = 50;
    }

    setBumpLengthValue(length);
  }, []);

  return (
    <>
      <Flex direction="column">
        {!props.hideTitle && (
          <Flex justify="space-between">
            <Title mb="xs">LinkedIn Setup</Title>
          </Flex>
        )}

        <Flex direction={"row"}>
          <Box w={"100%"}>
            <Tabs
              keepMounted={false}
              color="blue"
              variant="outline"
              defaultValue={props.defaultTab || "sequence"}
              orientation="horizontal"
            >
              <Tabs.List>
                <Tabs.Tab value="sequence" icon={<IconList size="0.8rem" />}>
                  Sequence
                </Tabs.Tab>
                <Tooltip label="Run advanced simulation">
                  <Tabs.Tab
                    value="simulate"
                    icon={<IconTool size="0.8rem" />}
                    ml="auto"
                  />
                </Tooltip>
                <Tabs.Tab
                  value="settings"
                  icon={<IconWashMachine size="0.8rem" />}
                >
                  Settings
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="sequence" pt="xs">
                {!loading ? (
                  <LinkedInSequenceSection />
                ) : (
                  <Flex justify="center" mt="xl">
                    <Loader />
                  </Flex>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="settings" pt="xs">
                <Container maw="800px" ml="auto" mr="auto">
                  <LinkedInConnectedCard
                    connected={userData ? userData.li_voyager_connected : false}
                  />
                  {/* Auto bump component */}
                  <Card withBorder mt="xs" radius={"md"}>
                    <Title order={4}>Autobump</Title>
                    <Text size="xs" color="gray">
                      By enabling AutoBump, SellScale will automatically send
                      follow-up messages to prospects who do not respond to your
                      initial message.
                    </Text>
                    <Switch
                      label="AutoBump"
                      onLabel="ON"
                      offLabel="OFF"
                      size="xs"
                      mt="xs"
                      styles={{
                        labelWrapper: {
                          cursor: "pointer",
                        },
                        label: {
                          cursor: "pointer",
                        },
                        track: {
                          cursor: "pointer",
                        },
                      }}
                      checked={userData.auto_bump}
                      onChange={(e) => {
                        let status = "";
                        let old_status;
                        if (userData.auto_bump) {
                          status = "Disable";
                          old_status = "enable";
                        } else {
                          status = "Enable";
                          old_status = "disable";
                        }
                        openConfirmModal({
                          title: (
                            <Flex
                              direction="row"
                              align="center"
                              justify="space-between"
                            >
                              <Title order={3}>AutoBump</Title>
                              <Badge
                                color={userData.auto_bump ? "green" : "red"}
                                variant="filled"
                                ml="sm"
                              >
                                {userData.auto_bump ? "Enabled" : "Disabled"}
                              </Badge>
                            </Flex>
                          ),
                          children: (
                            <>
                              <Text fz="sm">
                                AutoBump is SellScale AI's system for
                                automatically sending follow-up messages to
                                prospects. AutoBumps are sent when a prospect
                                does not respond to a message, and are sent at
                                random times between 9am and 5pm in your
                                timezone on workdays.
                              </Text>
                              <Card mt="sm" mb="md" withBorder shadow="sm">
                                <Text fw="bold">
                                  Please test your bump frameworks before
                                  enabling AutoBump. AutoBump will always use
                                  your default bump framework, so make sure it
                                  is working as expected.
                                </Text>
                              </Card>

                              <Text mt="md" fz="sm">
                                AutoBumps using personalized bump frameworks see
                                a significant increase in response rates.
                              </Text>
                            </>
                          ),
                          labels: { confirm: status, cancel: "Cancel" },
                          cancelProps: { color: "gray" },
                          confirmProps: {
                            color: userData.auto_bump ? "red" : "pink",
                          },
                          onCancel: () => {},
                          onConfirm: () => {
                            triggerToggleAutoBump();
                          },
                        });
                      }}
                    />
                  </Card>
                  <Card withBorder mt="xs" radius={"md"}>
                    <Title order={4}>Template Mode vs CTA Mode</Title>
                    <Text size="xs" color="gray">
                      CTA Mode is a more generative mode where you use a
                      combination of CTAs and Voice to control your messaging.
                      Template mode is more controlled. Feel free to toggle this
                      persona to your preference.{" "}
                    </Text>
                    <Switch
                      label="Template Mode Enabled"
                      onLabel="ON"
                      offLabel="OFF"
                      mt="xs"
                      checked={currentProject?.template_mode}
                      onClick={() => {
                        fetch(
                          `${API_URL}/client/archetype/${currentProject?.id}/toggle_template_mode`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${userToken}`,
                            },
                            body: JSON.stringify({
                              template_mode: !currentProject?.template_mode,
                            }),
                          }
                        ).then((res) => {
                          getFreshCurrentProject(
                            userToken,
                            currentProject?.id as number
                          ).then((project: any) => {
                            showNotification({
                              title: "Success",
                              message: `Template mode ${
                                project?.template_mode ? "enabled" : "disabled"
                              }`,
                              color: "green",
                              icon: <IconCheck size="1rem" />,
                            });
                            setCurrentProject(project);
                          });
                        });
                      }}
                    />
                  </Card>
                </Container>
              </Tabs.Panel>

              <Tabs.Panel value="simulate" pt="xs">
                <LinkedInConvoSimulator
                  personaId={archetypeID as number}
                  sequenceSetUpMode={true}
                />
              </Tabs.Panel>
              <Tabs.Panel value="analytics" pt="xs">
                {!loading && bumpBuckets.current && (
                  <Stack mx="md">
                    {/* Table for Step 1 */}
                    <Flex>
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle="First / Initial Followup"
                        bucketViewDescription="Prospects who have accepted your connection request."
                        bumpBucket={bumpBuckets.current?.ACCEPTED}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Step 2 */}
                    <Flex mt="md">
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle="Second Followup"
                        bucketViewDescription="This is followup #2"
                        bumpBucket={bumpBuckets.current?.BUMPED[1]}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Step 3 */}
                    <Flex mt="md">
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle="Third Followup"
                        bucketViewDescription="This is followup #3"
                        bumpBucket={bumpBuckets.current?.BUMPED[2]}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Step 4 */}
                    <Flex mt="md">
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle="Fourth Followup"
                        bucketViewDescription="This is followup #4"
                        bumpBucket={bumpBuckets.current?.BUMPED[3]}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Questions & Objections */}
                    <Flex mt="md">
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle="Questions & Objections"
                        bucketViewDescription="Prospects who have responded with a question or objection."
                        bumpBucket={bumpBuckets.current?.ACTIVE_CONVO}
                        persona={currentProject?.name}
                      />
                    </Flex>
                  </Stack>
                )}
              </Tabs.Panel>
            </Tabs>
          </Box>
        </Flex>
      </Flex>
    </>
  );
}
