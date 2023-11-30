import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Flex,
  Title,
  Text,
  Card,
  LoadingOverlay,
  useMantineTheme,
  Button,
  Tabs,
  Divider,
  ActionIcon,
  Tooltip,
  Switch,
  Loader,
  ScrollArea,
  Box,
  Grid,
  Center,
  Group,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import EmailSequenceStepModal from "@modals/EmailSequenceStepModal";
import ManageEmailSubjectLineTemplatesModal from "@modals/ManageEmailSubjectLineTemplatesModal";
import {
  IconCheck,
  IconEdit,
  IconMessages,
  IconPlus,
  IconSearch,
  IconWashMachine,
  IconX,
} from "@tabler/icons";
import { IconMessageUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  createEmailSequenceStep,
  getEmailSequenceSteps,
  patchSequenceStep,
} from "@utils/requests/emailSequencing";
import { getEmailSubjectLineTemplates } from "@utils/requests/emailSubjectLines";
import getChannels from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { EmailSequenceStep, MsgResponse, SubjectLineTemplate } from "src";
import DOMPurify from "dompurify";
import NewUIEmailSequencing from "./EmailSequencing/NewUIEmailSequencing";
import NylasConnectedCard from "@common/settings/NylasConnectedCard";
import SmartleadVisualizer from "@common/sequence/SmartleadSequence";
import { getSmartleadSequence } from "@utils/requests/getSmartleadSequences";

type EmailSequenceStepBuckets = {
  PROSPECTED: {
    total: number;
    templates: EmailSequenceStep[];
  };
  ACCEPTED: {
    total: number;
    templates: EmailSequenceStep[];
  };
  BUMPED: Record<
    string,
    {
      total: number;
      templates: EmailSequenceStep[];
    }
  >;
  ACTIVE_CONVO: {
    total: number;
    templates: EmailSequenceStep[];
  };
};

function EmailInitialOutboundView(props: {
  initialOutboundBucket: {
    total: number;
    templates: EmailSequenceStep[];
  };
  archetypeID: number | null;
  afterCreate: () => void;
  afterEdit: () => void;
}) {
  const userToken = useRecoilValue(userTokenState);

  const [subjectLineTemplates, setSubjectLineTemplates] =
    useState<SubjectLineTemplate[]>();

  const [showAll, setShowAll] = useState(false);
  const [editSequenceStepModalOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure();
  const [
    createSequenceStepModalOpened,
    { open: openCreate, close: closeCreate },
  ] = useDisclosure();

  const [
    manageSubjectLineOpened,
    { open: openManageSubject, close: closeManageSubject },
  ] = useDisclosure();

  const [editModalData, setEditModalData] = useState<{
    title: string;
    sequence: string;
    isDefault: boolean;
  }>();

  return (
    <>
      <Card shadow="sm" padding="sm" withBorder w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Title order={5}>Email 1</Title>
            <Text ml="sm" size="xs">
              Hyperpersonalized cold outreach sent to the prospect.
            </Text>
          </Flex>
          <Flex>
            <Tooltip label={"Create a template"} withArrow withinPortal>
              <ActionIcon onClick={openCreate}>
                <IconPlus size={"1rem"} />
              </ActionIcon>
            </Tooltip>
            <EmailSequenceStepModal
              modalOpened={createSequenceStepModalOpened}
              openModal={openCreate}
              closeModal={closeCreate}
              type={"CREATE"}
              backFunction={props.afterCreate}
              status={"PROSPECTED"}
              archetypeID={props.archetypeID || -1}
              bumpedCount={0}
              isDefault={true}
              onFinish={async (
                title,
                sequence,
                isDefault,
                status,
                substatus
              ) => {
                const result = await createEmailSequenceStep(
                  userToken,
                  props.archetypeID || -1,
                  status ?? "",
                  title,
                  sequence,
                  0,
                  isDefault,
                  substatus
                );
                return result.status === "success";
              }}
            />
          </Flex>
        </Flex>
        <Card.Section>
          <Divider mt="sm" />
          <Flex px="md" direction="column">
            {/* Subject Line */}
            <Flex
              direction="row"
              mt="sm"
              mb="6px"
              align="center"
              justify="space-between"
            >
              <Flex>
                <Title order={5}>Subject Line: </Title>
                <Text
                  ml="12px"
                  mr="4px"
                  variant="gradient"
                  gradient={{ from: "pink", to: "purple", deg: 45 }}
                >
                  {/* {randomSubjectLineTemplate
                    ? randomSubjectLineTemplate?.subject_line.slice(0, 40) +
                      "..."
                    : "Add a Subject Line!"} */}
                </Text>
              </Flex>
              <Flex>
                <Tooltip
                  label="Edit or create a subject line"
                  withinPortal
                  withArrow
                >
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    onClick={openManageSubject}
                  >
                    <IconEdit size={"1rem"} />
                  </ActionIcon>
                </Tooltip>
              </Flex>
              {/* <ManageEmailSubjectLineTemplatesModal
                modalOpened={manageSubjectLineOpened}
                openModal={openManageSubject}
                closeModal={closeManageSubject}
                backFunction={triggerGetEmailSubjectLineTemplates}
                archetypeID={props.archetypeID}
              /> */}
            </Flex>

            <Divider mt="6px" />

            {props.initialOutboundBucket?.templates?.length === 0 && (
              <Flex my="sm" justify={"space-between"} align="center">
                <Card withBorder w="100%" mr="xs">
                  <Flex justify={"center"}>
                    Add an email body template above
                  </Flex>
                </Card>
              </Flex>
            )}

            {/* Body */}
            {props.initialOutboundBucket?.templates?.map((template, index) => {
              if (index > 0 && !showAll) {
                return <></>;
              }

              return (
                <>
                  <Flex align="center" mt="8px">
                    <Title order={5}>Body:</Title>
                    <Text
                      ml="12px"
                      mr="4px"
                      variant="gradient"
                      gradient={{ from: "purple", to: "pink", deg: 45 }}
                    >
                      {template.title}
                    </Text>
                  </Flex>
                  <Flex
                    direction="row"
                    mb="md"
                    align="center"
                    justify="space-between"
                  >
                    <Box
                      sx={() => ({
                        border: "1px solid #E0E0E0",
                        borderRadius: "8px",
                        backgroundColor: "#F5F5F5",
                      })}
                      px="md"
                      mt="sm"
                    >
                      <Text fz="sm">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(template.template),
                          }}
                        />
                      </Text>
                    </Box>
                    <Tooltip label="Edit Body" withinPortal>
                      <ActionIcon
                        onClick={() => {
                          openEdit();
                        }}
                      >
                        <IconEdit size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                    <EmailSequenceStepModal
                      modalOpened={editSequenceStepModalOpened}
                      openModal={openEdit}
                      closeModal={closeEdit}
                      type="EDIT"
                      backFunction={props.afterEdit}
                      status="PROSPECTED"
                      archetypeID={props.archetypeID || -1}
                      bumpedCount={0}
                      title={template.title}
                      isDefault={template.default}
                      sequence={template.template}
                      onFinish={async (
                        title,
                        sequence,
                        isDefault,
                        status,
                        substatus
                      ) => {
                        const result = await patchSequenceStep(
                          userToken,
                          template.id,
                          status ?? "",
                          title,
                          sequence,
                          template.bumped_count,
                          isDefault
                        );
                        return result.status === "success";
                      }}
                    />
                  </Flex>
                </>
              );
            })}
            {props.initialOutboundBucket.templates.length > 1 && (
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
                      : `Show all ${props.initialOutboundBucket.total} frameworks...`}
                  </Button>
                </Flex>
              </Card.Section>
            )}
          </Flex>
        </Card.Section>
      </Card>
    </>
  );
}

function EmailSequenceStepView(props: {
  sequenceBucket: {
    total: number;
    templates: EmailSequenceStep[];
  };
  sequenceStepTitle: string;
  sequenceStepDescription: string;
  status: string;
  dataChannels: MsgResponse | undefined;
  archetypeID: number | null;
  afterCreate: () => void;
  afterEdit: () => void;
  bumpedCount?: number;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [createSequenceStepModalOpened, { open, close }] = useDisclosure();
  const [editSequenceStepModalOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure();
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <Card shadow="sm" padding="sm" withBorder w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Title order={5}>{props.sequenceStepTitle}</Title>
            <Text ml="sm" size="xs">
              {props.sequenceStepDescription}
            </Text>
          </Flex>
          <Tooltip label="Create a new Template" withinPortal>
            <ActionIcon onClick={open}>
              <IconPlus size="1.25rem" />
            </ActionIcon>
          </Tooltip>
          <EmailSequenceStepModal
            modalOpened={createSequenceStepModalOpened}
            openModal={open}
            closeModal={close}
            type={"CREATE"}
            backFunction={props.afterCreate}
            dataChannels={props.dataChannels}
            status={props.status}
            archetypeID={props.archetypeID || -1}
            bumpedCount={props.bumpedCount}
            isDefault={true}
            onFinish={async (title, sequence, isDefault, status, substatus) => {
              const result = await createEmailSequenceStep(
                userToken,
                props.archetypeID || -1,
                status ?? "",
                title,
                sequence,
                props.bumpedCount || 0,
                isDefault,
                substatus
              );
              return result.status === "success";
            }}
          />
        </Flex>
        <Card.Section>
          <Divider mt="sm" />
        </Card.Section>

        {/* Sequence Steps */}
        <Card.Section px="xs">
          {props.sequenceBucket &&
          Object.keys(props.sequenceBucket).length === 0 ? (
            // No Sequence Steps
            <Text>Please create a Sequence Step using the + button above.</Text>
          ) : (
            <>
              {props.sequenceBucket?.templates?.map((template, index) => {
                // Show only the first Sequence Step of not showing all
                if (index > 0 && !showAll) {
                  return <></>;
                }

                return (
                  <>
                    <Flex justify="space-between" align="center" pt="xs">
                      <Flex direction="row" align="center">
                        <Switch
                          ml="md"
                          onLabel="Default"
                          offLabel="Default"
                          checked={template.default}
                          thumbIcon={
                            template.default ? (
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
                              backgroundColor: template.default
                                ? theme.colors.teal[theme.fn.primaryShade()]
                                : theme.colors.red[theme.fn.primaryShade()],
                            },
                          }}
                        />
                        <Flex direction="column" ml="xl">
                          <Text fw="bold" fz="lg">
                            {template.title}
                          </Text>

                          <Box
                            sx={() => ({
                              border: "1px solid #E0E0E0",
                              borderRadius: "8px",
                              backgroundColor: "#F5F5F5",
                            })}
                            px="md"
                            mt="sm"
                          >
                            <Text fz="sm">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(template.template),
                                }}
                              />
                            </Text>
                          </Box>
                        </Flex>
                      </Flex>
                      <Tooltip label="Edit Template" withinPortal>
                        <ActionIcon onClick={openEdit}>
                          <IconEdit size="1.25rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                    <EmailSequenceStepModal
                      modalOpened={editSequenceStepModalOpened}
                      openModal={openEdit}
                      closeModal={closeEdit}
                      type={"EDIT"}
                      backFunction={props.afterEdit}
                      status={template.overall_status}
                      archetypeID={props.archetypeID || -1}
                      bumpedCount={template.bumped_count}
                      title={template.title}
                      isDefault={template.default}
                      sequence={template.template}
                      onFinish={async (
                        title,
                        sequence,
                        isDefault,
                        status,
                        substatus
                      ) => {
                        const result = await patchSequenceStep(
                          userToken,
                          template.id,
                          status ?? "",
                          title,
                          sequence,
                          template.bumped_count || 0,
                          isDefault
                        );
                        return result.status === "success";
                      }}
                    />
                    <Card.Section>
                      <Divider mt="sm" />
                    </Card.Section>
                  </>
                );
              })}
              {props.sequenceBucket.templates.length > 1 && (
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
                        : `Show all ${props.sequenceBucket.total} frameworks...`}
                    </Button>
                  </Flex>
                </Card.Section>
              )}
            </>
          )}
        </Card.Section>
      </Card>
    </>
  );
}

// function QuestionObjectionLibraryCard(props: {
//   archetypeID: number | null;
//   bumpFramework: EmailSequenceStep;
//   afterEdit: () => void;
// }) {
//   const theme = useMantineTheme();

//   const splitted_substatus = props.bumpFramework.substatus.split('ACTIVE_CONVO_')[1];

//   return (
//     <>
//       <Card withBorder p='sm' radius='md'>
//         <Card.Section px='md' pt='md'>
//           <Flex justify='space-between' align='center'>
//             <Title order={5}>{props.bumpFramework.title}</Title>
//             <ActionIcon
//               onClick={() => {
//                 openContextModal({
//                   modal: 'editBumpFramework',
//                   title: <Title order={3}>Edit: {props.bumpFramework.title}</Title>,
//                   innerProps: {
//                     bumpFrameworkID: props.bumpFramework.id,
//                     overallStatus: props.bumpFramework.overall_status,
//                     title: props.bumpFramework.title,
//                     description: props.bumpFramework.description,
//                     bumpLength: props.bumpFramework.bump_length,
//                     default: props.bumpFramework.default,
//                     onSave: props.afterEdit,
//                     bumpedCount: props.bumpFramework.bumped_count,
//                   },
//                 });
//               }}
//             >
//               <IconEdit size='1.25rem' />
//             </ActionIcon>
//           </Flex>
//         </Card.Section>

//         <Card.Section>
//           <Divider my='xs' />
//         </Card.Section>
//         <Flex mih='100px' align='center'>
//           <Text>{props.bumpFramework.description}</Text>
//         </Flex>

//         <Card.Section>
//           <Divider my='xs' />
//         </Card.Section>
//         <Badge color={valueToColor(theme, splitted_substatus)}>{splitted_substatus}</Badge>
//       </Card>
//     </>
//   );
// }

export default function EmailSequencingPage(props: {
  predefinedPersonaId?: number;
  onPopulateSequenceSteps?: (buckets: EmailSequenceStepBuckets) => void;
  hideTitle?: boolean;
}) {
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const archetypeID = currentProject?.id || -1;
  const [userData, setUserData] = useRecoilState(userDataState);

  const [
    addNewSequenceStepOpened,
    { open: openSequenceStep, close: closeSequenceStep },
  ] = useDisclosure();
  // const [addNewQuestionObjectionOpened, { open: openQuestionObjection, close: closeQuestionObjection }] =
  //   useDisclosure();

  if (currentProject === undefined || currentProject === null) {
    return <></>;
  }

  const [subjectLineTemplates, setSubjectLineTemplates] = useState<
    SubjectLineTemplate[]
  >([]);

  const triggerGetEmailSubjectLineTemplates = async () => {
    const result = await getEmailSubjectLineTemplates(
      userToken,
      currentProject?.id as number,
      false
    );
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }

    const templates = result.data
      .subject_line_templates as SubjectLineTemplate[];

    setSubjectLineTemplates(templates);
    return;
  };

  const sequenceBuckets = useRef<EmailSequenceStepBuckets>({
    PROSPECTED: {
      total: 0,
      templates: [],
    },
    ACCEPTED: {
      total: 0,
      templates: [],
    },
    BUMPED: {},
    ACTIVE_CONVO: {
      total: 0,
      templates: [],
    },
  } as EmailSequenceStepBuckets);
  const [sequenceBucketsState, setSequenceBucketsState] =
    useState<EmailSequenceStepBuckets>(sequenceBuckets.current);

  const { data: dataChannels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  const triggerGetEmailSequenceSteps = async () => {
    setLoading(true);

    const result = await getEmailSequenceSteps(
      userToken,
      [],
      [],
      [archetypeID as number]
    );

    if (result.status !== "success") {
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Could not get sequence steps.",
        color: "red",
        autoClose: false,
      });
      return;
    }

    // Populate bump buckets
    let newsequenceBuckets = {
      PROSPECTED: {
        total: 0,
        templates: [],
      },
      ACCEPTED: {
        total: 0,
        templates: [],
      },
      BUMPED: {},
      ACTIVE_CONVO: {
        total: 0,
        templates: [],
      },
    } as EmailSequenceStepBuckets;
    for (const bumpFramework of result.data
      .sequence_steps as EmailSequenceStep[]) {
      const status = bumpFramework.overall_status;
      if (status === "PROSPECTED") {
        newsequenceBuckets.PROSPECTED.total += 1;
        if (bumpFramework.default) {
          newsequenceBuckets.PROSPECTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.PROSPECTED.templates.push(bumpFramework);
        }
      } else if (status === "ACCEPTED") {
        newsequenceBuckets.ACCEPTED.total += 1;
        if (bumpFramework.default) {
          newsequenceBuckets.ACCEPTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACCEPTED.templates.push(bumpFramework);
        }
      } else if (status === "BUMPED") {
        const bumpCount = bumpFramework.bumped_count as number;
        if (!(bumpCount in newsequenceBuckets.BUMPED)) {
          newsequenceBuckets.BUMPED[bumpCount] = {
            total: 0,
            templates: [],
          };
        }
        newsequenceBuckets.BUMPED[bumpCount].total += 1;
        if (bumpFramework.default) {
          newsequenceBuckets.BUMPED[bumpCount].templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.BUMPED[bumpCount].templates.push(bumpFramework);
        }
      } else if (status === "ACTIVE_CONVO") {
        newsequenceBuckets.ACTIVE_CONVO.total += 1;
        if (bumpFramework.default) {
          newsequenceBuckets.ACTIVE_CONVO.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACTIVE_CONVO.templates.push(bumpFramework);
        }
      }
    }
    sequenceBuckets.current = newsequenceBuckets;
    setSequenceBucketsState(newsequenceBuckets);

    // BumpFrameworks have been updated, submit event to parent
    if (props.onPopulateSequenceSteps) {
      props.onPopulateSequenceSteps(newsequenceBuckets);
    }

    setLoading(false);
  };

  const [smartleadSequence, setSmartleadSequence] = useState<any[]>([]);
  const triggerGetSmartleadSequenceSteps = async () => {
    if (!currentProject.smartlead_campaign_id) {
      return;
    }
    setLoading(true);

    const result = await getSmartleadSequence(
      userToken,
      currentProject.smartlead_campaign_id
    );

    if (result.status !== "success") {
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Could not get beta sequence variants.",
        color: "red",
        autoClose: false,
      });
      return;
    } else {
      setSmartleadSequence(result.data.sequence);
    }
  };

  useEffect(() => {
    triggerGetEmailSequenceSteps();
  }, [archetypeID]);

  useEffect(() => {
    triggerGetEmailSubjectLineTemplates();
    triggerGetEmailSequenceSteps();

    if (currentProject.smartlead_campaign_id) {
      triggerGetSmartleadSequenceSteps();
    }
  }, []);

  return (
    <Flex direction="column">
      <LoadingOverlay visible={loading} />
      {!props.hideTitle && <Title>Email Setup</Title>}

      <Card.Section px="md">
        <Tabs
          color="blue"
          variant="outline"
          defaultValue="sequence"
          orientation="horizontal"
        >
          <Tabs.List>
            {/* <Tabs.Tab
                value="qnolibrary"
                icon={<IconMessages size="0.8rem" />}
              >
                Conversation
              </Tabs.Tab> */}
            <Tabs.Tab value="sequence" icon={<IconMessages size="0.8rem" />}>
              Email Sequence
            </Tabs.Tab>
            <Tabs.Tab
              value="email_settings"
              icon={<IconWashMachine size="0.8rem" />}
            >
              Settings
            </Tabs.Tab>

            {currentProject.smartlead_campaign_id && (
              <Tabs.Tab value="smartlead" icon={<IconMessages size="0.8rem" />}>
                Beta - Variants
              </Tabs.Tab>
            )}
          </Tabs.List>
          <Tabs.Panel value="email_settings">
            <Box maw="800px" ml="auto" mr="auto">
              <NylasConnectedCard
                connected={userData ? userData.nylas_connected : false}
              />
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value="qnolibrary">
            <Card withBorder shadow="xs" mt="md">
              <Flex w="100%" align="center" justify="center">
                Coming soon!
              </Flex>
            </Card>
            {/* {!loading ? (
              <Flex direction='column' ml='xs'>
                <Flex align='center' w='100%' justify='center'>
                  <Button variant='outline' mb='md' w='50%' onClick={openQuestionObjection}>
                    Add another type of reply
                  </Button>
                </Flex>

                <CreateBumpFrameworkModal
                  modalOpened={addNewQuestionObjectionOpened}
                  openModal={openQuestionObjection}
                  closeModal={closeQuestionObjection}
                  backFunction={triggerGetBumpFrameworks}
                  status='ACTIVE_CONVO'
                  dataChannels={dataChannels}
                  archetypeID={archetypeID}
                />
                <Grid>
                  {Object.keys(sequenceBuckets.current?.ACTIVE_CONVO.frameworks).map((qno, index) => {
                    return (
                      <Grid.Col span={6}>
                        <QuestionObjectionLibraryCard
                          bumpFramework={sequenceBuckets.current?.ACTIVE_CONVO.frameworks[index]}
                          archetypeID={archetypeID}
                          afterEdit={triggerGetBumpFrameworks}
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Flex>
            ) : (
              <Flex justify='center'>
                <Loader />
              </Flex>
            )} */}
          </Tabs.Panel>{" "}
          <Tabs.Panel value="sequence">
            <NewUIEmailSequencing
              userToken={userToken}
              archetypeID={archetypeID}
              templateBuckets={sequenceBucketsState}
              subjectLines={subjectLineTemplates}
              refetch={async () => {
                await triggerGetEmailSequenceSteps();
                await triggerGetEmailSubjectLineTemplates();
              }}
              loading={loading}
              addNewSequenceStepOpened={addNewSequenceStepOpened}
              closeSequenceStep={closeSequenceStep}
              openSequenceStep={openSequenceStep}
            />
          </Tabs.Panel>
          {currentProject.smartlead_campaign_id && (
            <Tabs.Panel value="smartlead">
              <SmartleadVisualizer data={smartleadSequence} />
            </Tabs.Panel>
          )}
        </Tabs>
      </Card.Section>
    </Flex>
  );
}
