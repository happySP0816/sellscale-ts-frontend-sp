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
  Box,
  Image,
  Group,
  Radio,
  TextInput,
  Checkbox,
  Select,
  Accordion,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import EmailSequenceStepModal from "@modals/EmailSequenceStepModal";
import ManageEmailSubjectLineTemplatesModal from "@modals/ManageEmailSubjectLineTemplatesModal";
import {
  IconBook,
  IconCheck,
  IconEdit,
  IconFingerprint,
  IconList,
  IconMessages,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUser,
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
import {
  EmailReplyFramework,
  EmailSequenceStep,
  MsgResponse,
  SubjectLineTemplate,
} from "src";
import DOMPurify from "dompurify";
import NewUIEmailSequencing from "./EmailSequencing/NewUIEmailSequencing";
import NylasConnectedCard from "@common/settings/NylasConnectedCard";
import {
  getEmailReplyFrameworks,
  patchEmailReplyFrameworks,
} from "@utils/requests/emailReplies";
import { valueToColor } from "@utils/general";
import React from "react";
import { JSONContent } from "@tiptap/react";
import DynamicRichTextArea from "@common/library/DynamicRichTextArea";
import CreateEmailReplyFrameworkModal from "@modals/CreateEmailReplyFrameworkModal";

import IconImg from "@assets/images/icon.svg";
import { PullProspectEmailsCardPage } from "@common/credits/PullProspectEmailsCardPage";
import PullProspectEmailsCard from "@common/credits/PullProspectEmailsCard";
import { postEmailTrackingSettings } from "@utils/requests/emailTrackingSettings";
import { DataTable } from "mantine-datatable";
import {
  getEmailAccounts,
  toggleEmailAccounts,
} from "@utils/requests/smartlead";

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

  const [subjectLineTemplates, setSubjectLineTemplates] = useState<
    SubjectLineTemplate[]
  >();

  const [showAll, setShowAll] = useState(false);
  const [
    editSequenceStepModalOpened,
    { open: openEdit, close: closeEdit },
  ] = useDisclosure();
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
                      {template.step.title}
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
                            __html: DOMPurify.sanitize(template.step.template),
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
                      title={template.step.title}
                      isDefault={template.step.default}
                      sequence={template.step.template}
                      onFinish={async (
                        title,
                        sequence,
                        isDefault,
                        status,
                        substatus
                      ) => {
                        const result = await patchSequenceStep(
                          userToken,
                          template.step.id,
                          status ?? "",
                          title,
                          sequence,
                          template.step.bumped_count,
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
  const [
    editSequenceStepModalOpened,
    { open: openEdit, close: closeEdit },
  ] = useDisclosure();
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
                          checked={template.step.default}
                          thumbIcon={
                            template.step.default ? (
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
                              backgroundColor: template.step.default
                                ? theme.colors.teal[theme.fn.primaryShade()]
                                : theme.colors.red[theme.fn.primaryShade()],
                            },
                          }}
                        />
                        <Flex direction="column" ml="xl">
                          <Text fw="bold" fz="lg">
                            {template.step.title}
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
                                  __html: DOMPurify.sanitize(
                                    template.step.template
                                  ),
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
                      status={template.step.overall_status}
                      archetypeID={props.archetypeID || -1}
                      bumpedCount={template.step.bumped_count}
                      title={template.step.title}
                      isDefault={template.step.default}
                      sequence={template.step.template}
                      onFinish={async (
                        title,
                        sequence,
                        isDefault,
                        status,
                        substatus
                      ) => {
                        const result = await patchSequenceStep(
                          userToken,
                          template.step.id,
                          status ?? "",
                          title,
                          sequence,
                          template.step.bumped_count || 0,
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

export default function EmailSequencingPage(props: {
  predefinedPersonaId?: number;
  onPopulateSequenceSteps?: (buckets: EmailSequenceStepBuckets) => void;
  hideTitle?: boolean;
}) {
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );
  const archetypeID = currentProject?.id || -1;
  const [userData, setUserData] = useRecoilState(userDataState);

  const [
    addNewSequenceStepOpened,
    { open: openSequenceStep, close: closeSequenceStep },
  ] = useDisclosure();

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
  const [
    sequenceBucketsState,
    setSequenceBucketsState,
  ] = useState<EmailSequenceStepBuckets>(sequenceBuckets.current);

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
      const status = bumpFramework.step.overall_status;
      if (status === "PROSPECTED") {
        newsequenceBuckets.PROSPECTED.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.PROSPECTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.PROSPECTED.templates.push(bumpFramework);
        }
      } else if (status === "ACCEPTED") {
        newsequenceBuckets.ACCEPTED.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.ACCEPTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACCEPTED.templates.push(bumpFramework);
        }
      } else if (status === "BUMPED") {
        const bumpCount = bumpFramework.step.bumped_count as number;
        if (!(bumpCount in newsequenceBuckets.BUMPED)) {
          newsequenceBuckets.BUMPED[bumpCount] = {
            total: 0,
            templates: [],
          };
        }
        newsequenceBuckets.BUMPED[bumpCount].total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.BUMPED[bumpCount].templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.BUMPED[bumpCount].templates.push(bumpFramework);
        }
      } else if (status === "ACTIVE_CONVO") {
        newsequenceBuckets.ACTIVE_CONVO.total += 1;
        if (bumpFramework.step.default) {
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

  useEffect(() => {
    triggerGetEmailSubjectLineTemplates();
    triggerGetEmailSequenceSteps();
  }, [archetypeID]);

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
            <Tabs.Tab value="replies" icon={<IconBook size="0.8rem" />}>
              Replies
            </Tabs.Tab>
            <Tabs.Tab value="settings" icon={<IconWashMachine size="0.8rem" />}>
              Settings
            </Tabs.Tab>

            <Tabs.Tab
              value="email-scraper"
              icon={<IconFingerprint size="0.8rem" />}
              ml="auto"
            >
              Email Scraper
            </Tabs.Tab>

            {currentProject.smartlead_campaign_id && (
              <Tabs.Tab
                value="smartlead"
                icon={<IconMessages size="0.8rem" />}
                ml="auto"
              >
                Beta - Variants
              </Tabs.Tab>
            )}
          </Tabs.List>
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
          <Tabs.Panel value="replies">
            <EmailReplyFrameworkView
              userToken={userToken}
              archetypeID={archetypeID}
            />
          </Tabs.Panel>{" "}
          <Tabs.Panel value="settings">
            <Box maw="800px" mt="md" ml="auto" mr="auto">
              <EmailSettingsView userToken={userToken} />
              {/* <NylasConnectedCard
                connected={userData ? userData.nylas_connected : false} showSmartlead={true}
              /> */}
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value="email-scraper">
            <PullProspectEmailsCard archetype_id={archetypeID} />
          </Tabs.Panel>
        </Tabs>
      </Card.Section>
    </Flex>
  );
}

interface SmartLeadEmailAccount {
  id: number;
  active: boolean;
  smartlead_account_id: string;
  email_address: string;
  aws_username: string;
  smartlead_reputation: number;
  warming?: Record<string, any>;
}

const EmailSettingsView = (props: { userToken: string }) => {
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  const [selectedRecords, setSelectedRecords] = useState<
    SmartLeadEmailAccount[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [trackingLoading, setTrackingLoading] = useState(false);
  const [openTracking, setOpenTracking] = useState(
    currentProject?.email_open_tracking_enabled == null ||
      currentProject?.email_open_tracking_enabled == undefined
      ? true
      : (currentProject?.email_open_tracking_enabled as boolean)
  );
  const [linkTracking, setLinkTracking] = useState(
    currentProject?.email_link_tracking_enabled == null ||
      currentProject?.email_link_tracking_enabled == undefined
      ? true
      : (currentProject?.email_link_tracking_enabled as boolean)
  );

  const { data: smartlead_inboxes, refetch } = useQuery({
    queryKey: [`query-get-all-smartlead-inboxes`],
    queryFn: async () => {
      if (!currentProject) {
        return [];
      }

      const response = await getEmailAccounts(userToken, currentProject.id);
      const results =
        response.status === "success"
          ? (response.data as SmartLeadEmailAccount[])
          : [];

      setSelectedRecords(results.filter((record) => record.warming));

      setLoading(false);
      return results;
    },
  });

  const saveInboxChanges = async () => {
    if (!currentProject) {
      return;
    }

    setLoading(true);

    const activeAccounts = selectedRecords;
    // Any smartlead_inboxes that aren't in activeAccounts are inactive
    const inactiveAccounts =
      smartlead_inboxes?.filter(
        (record) =>
          !activeAccounts.map((record) => record.id).includes(record.id)
      ) ?? [];

    await toggleEmailAccounts(
      userToken,
      currentProject.id,
      inactiveAccounts.map((r) => r.smartlead_account_id),
      false
    );

    await toggleEmailAccounts(
      userToken,
      currentProject.id,
      activeAccounts.map((r) => r.smartlead_account_id),
      true
    );

    showNotification({
      id: "save-inbox-changes",
      title: `Updated`,
      message: `Saved Active Inboxes`,
      color: "blue",
      autoClose: 1000,
    });

    refetch();
  };

  console.log(smartlead_inboxes);

  const triggerPostEmailTrackingSettings = async (
    openTracking: boolean,
    linkTracking: boolean
  ) => {
    setTrackingLoading(true);
    const result = await postEmailTrackingSettings(
      props.userToken,
      currentProject?.smartlead_campaign_id as number,
      openTracking,
      linkTracking
    );
    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Could not post tracking settings.",
        color: "red",
        autoClose: false,
      });
    } else {
      showNotification({
        title: "Success",
        message: "Tracking settings updated.",
        color: "green",
        autoClose: true,
      });
    }

    if (result.status === "success") {
      setOpenTracking(openTracking);
      setLinkTracking(linkTracking);
    }

    setTrackingLoading(false);
  };

  return (
    <>
      <Text fw={600} size={20}>
        Email Settings
      </Text>
      <Divider my="md" />
      <Text size="lg" fw={500}>
        Tracking - Campaign
      </Text>
      <Checkbox
        label="Track Email Opens"
        description="Enable to track when an email is opened by the recipient. May affect deliverability."
        mt="sm"
        checked={openTracking}
        onChange={() => {
          triggerPostEmailTrackingSettings(!openTracking, linkTracking);
        }}
        disabled={trackingLoading}
      />
      <Checkbox
        label="Track Link Clicks"
        description="Enable to track when a link in an email is clicked by the recipient. May affect deliverability."
        defaultChecked
        mt="sm"
        checked={linkTracking}
        onChange={() => {
          triggerPostEmailTrackingSettings(openTracking, !linkTracking);
        }}
        disabled={trackingLoading}
      />

      <Box pt={10}>
        <Group>
          <Text size="lg" fw={500}>
            Inboxes
          </Text>
          <Button
            size="xs"
            compact
            loading={loading}
            onClick={saveInboxChanges}
          >
            Save
          </Button>
        </Group>
        <Box>
          <DataTable
            withBorder
            borderRadius="sm"
            withColumnBorders
            striped
            highlightOnHover
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
            records={smartlead_inboxes || []}
            columns={[
              {
                accessor: "aws_username",
                title: "Name",
                render: ({ aws_username }) => (
                  <Text weight={700}>{aws_username}</Text>
                ),
              },
              {
                accessor: "email_address",
                title: "Email",
                render: ({ email_address }) => (
                  <Text weight={700}>{email_address}</Text>
                ),
              },
              {
                accessor: "smartlead_reputation",
                title: "Reputation",
                render: ({ smartlead_reputation }) => (
                  <Text weight={700}>{smartlead_reputation}%</Text>
                ),
              },
            ]}
            onRowClick={({ email_address }) =>
              console.log(`You clicked on ${email_address}`)
            }
          />
        </Box>
      </Box>
    </>
  );
};

const EmailReplyFrameworkView = (props: {
  userToken: string;
  archetypeID: number | null;
}) => {
  const theme = useMantineTheme();

  const [fetchingReplyFrameworks, setFetchingReplyFrameworks] = useState(false);
  const [replyFrameworks, setReplyFrameworks] = useState<EmailReplyFramework[]>(
    []
  );

  const [isSellScaleFramework, setIsSellScaleFramework] = useState(false);
  const [
    selectedFramework,
    _setSelectedFramework,
  ] = useState<EmailReplyFramework>();
  const setSelectedFramework = (framework: EmailReplyFramework) => {
    _setSelectedFramework(framework);
    setIsSellScaleFramework(false);
    if (
      framework.client_archetype_id === null &&
      framework.client_sdr_id === null
    ) {
      setIsSellScaleFramework(true);
    }
  };

  const [
    createFrameworkOpened,
    {
      open: openCreateFramework,
      close: closeCreateFramework,
      toggle: toggleCreateFramework,
    },
  ] = useDisclosure(false);

  const [editTitle, setEditTitle] = useState(false);
  const [editTemplate, setEditTemplate] = useState(false);
  const [editAdditionalInfo, setEditAdditionalInfo] = useState(false);

  let templateBody = "";
  const [template, _setTemplate] = React.useState<string>(templateBody);
  const templateRichRaw = React.useRef<JSONContent | string>("");
  const [patchingTemplate, setPatchingTemplate] = useState(false);

  const triggerPatchTemplate = async () => {
    setPatchingTemplate(true);

    if (!selectedFramework) {
      showNotification({
        title: "Error",
        message: "No framework selected.",
        color: "red",
        autoClose: false,
      });
      return;
    }

    const result = await patchEmailReplyFrameworks(
      props.userToken,
      selectedFramework?.id as number,
      null,
      null,
      null,
      template,
      null,
      null
    );
    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Could not patch template.",
        color: "red",
        autoClose: false,
      });
    } else {
      showNotification({
        title: "Success",
        message: "Template patched.",
        color: "green",
        autoClose: true,
      });
      setSelectedFramework({
        ...selectedFramework,
        template: template,
      });
    }

    setPatchingTemplate(false);
  };

  const triggerGetEmailReplyFrameworks = async () => {
    setFetchingReplyFrameworks(true);

    const result = await getEmailReplyFrameworks(props.userToken, []);

    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Could not get reply frameworks.",
        color: "red",
        autoClose: false,
      });
    } else {
      setReplyFrameworks(result.data.data as EmailReplyFramework[]);
      setSelectedFramework(result.data.data[0] as EmailReplyFramework);
      _setTemplate(result.data.data[0].template);
      templateRichRaw.current = result.data.data[0].template;
    }

    setFetchingReplyFrameworks(false);
  };

  useEffect(() => {
    triggerGetEmailReplyFrameworks();
  }, []);

  return (
    <Flex mt="md" w={"100%"} gap={"50px"}>
      <Flex w="40%" direction="column">
        <Button
          variant="outline"
          mb="md"
          leftIcon={<IconPlus />}
          onClick={openCreateFramework}
          style={{ borderStyle: "dashed", fontSize: "16px" }}
          size="lg"
          fw={"sm"}
        >
          Create New Framework
        </Button>
        <Radio.Group value={selectedFramework?.id + ""}>
          <LoadingOverlay visible={fetchingReplyFrameworks} />
          <Group mt="xs">
            {replyFrameworks.map((item: any, i: number) => {
              const splitted_substatus = item.substatus?.replace(
                "ACTIVE_CONVO_",
                ""
              );

              return (
                <>
                  {(!replyFrameworks[i - 1] ||
                    item.substatus !== replyFrameworks[i - 1].substatus) && (
                    <Divider
                      label={
                        <Flex align={"center"} gap={4}>
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              background: valueToColor(
                                theme,
                                splitted_substatus || "ACTIVE_CONVO"
                              ),
                              borderRadius: "100%",
                            }}
                          ></div>
                          <Text color="gray" fw={600}>
                            {splitted_substatus || "ACTIVE_CONVERSATION"}
                          </Text>
                        </Flex>
                      }
                      labelPosition="left"
                      w={"100%"}
                    />
                  )}

                  <label
                    htmlFor={item?.title}
                    style={{
                      outline: `${
                        selectedFramework?.id === item?.id
                          ? " 0.125rem solid #228be6"
                          : " 0.0625rem solid #ced4da"
                      }`,
                      borderRadius: "8px",
                      padding: "10px 14px",
                      width: "100%",
                    }}
                  >
                    <Flex align={"center"} gap={10} justify={"space-between"}>
                      <Flex align={"center"}>
                        <Radio
                          value={item?.id + ""}
                          id={item?.title}
                          size="xs"
                          onClick={() => {
                            setSelectedFramework(item);
                            // setBlockList(item?.transformer_blocklist);
                          }}
                          mr="sm"
                        />
                        <Text fw={600} mt={2}>
                          {item?.title}
                        </Text>
                      </Flex>
                      {!item.client_archetype_id && !item.client_sdr_id && (
                        <Tooltip label="SellScale AI Default Framework">
                          <Image
                            width={10}
                            fit="contain"
                            src={IconImg}
                            alt="SellScale Sight"
                          />
                        </Tooltip>
                      )}
                    </Flex>
                  </label>
                </>
              );
            })}
          </Group>
        </Radio.Group>
      </Flex>

      <Flex w={"100%"} direction="column" gap={"xl"}>
        <Flex w={"100%"} justify={"space-between"} align={"center"} mt="md">
          <Text
            size={"24px"}
            fw={600}
            color="gray"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            inline
            mr="md"
          >
            {editTitle ? (
              <TextInput
                size="md"
                value={selectedFramework?.title}
                onChange={(e) => {
                  if (!selectedFramework) {
                    return;
                  }
                  setSelectedFramework({
                    ...selectedFramework,
                    title: e.target.value,
                  });
                }}
                w="400px"
              />
            ) : (
              <span style={{ color: "black" }}>{selectedFramework?.title}</span>
            )}
            <Flex ml="4px">
              {isSellScaleFramework ? (
                <Tooltip label="SellScale frameworks are AI trained over time and can't be edited. Please create a new framework to edit.">
                  <Image
                    width={20}
                    fit="contain"
                    src={IconImg}
                    alt="SellScale Sight"
                  />
                </Tooltip>
              ) : (
                <>
                  {editTitle ? (
                    <IconCheck
                      onClick={() => setEditTitle(!editTitle)}
                      style={{ cursor: "pointer" }}
                      size={"1rem"}
                    />
                  ) : (
                    <IconPencil
                      onClick={() => setEditTitle(!editTitle)}
                      style={{ cursor: "pointer" }}
                      size={"1rem"}
                    />
                  )}
                </>
              )}
            </Flex>
          </Text>
          <Checkbox label="Default Framework" defaultChecked mr="20px" />
        </Flex>
        <Flex w="100%" gap={"xl"}>
          <Flex direction="column" w="100%">
            <Text color="gray" fw={600}>
              SUB-STATUS
            </Text>
            <Select
              description=" "
              placeholder=" "
              data={[selectedFramework?.substatus || "ACTIVE_CONVO"]}
              defaultValue={selectedFramework?.substatus}
              disabled
              maw="300px"
            />
          </Flex>
        </Flex>
        <Flex direction="column">
          <Text fw={600}>TEMPLATE</Text>
          <Text fw={400} fz="xs" mb="2px">
            Template to be fed to GPT. Include [[brackets]] for AI instructions.
            Everything else will be followed exactly.
          </Text>
          {editTemplate ? (
            <>
              <Box>
                <DynamicRichTextArea
                  height={400}
                  onChange={(value, rawValue) => {
                    templateRichRaw.current = rawValue;
                    _setTemplate(value);
                  }}
                  value={templateRichRaw.current}
                  signifyCustomInsert={false}
                  inserts={[]}
                />
              </Box>
              <Flex mt="sm" justify={"flex-end"}>
                <Button
                  mr="sm"
                  color="red"
                  onClick={() => {
                    _setTemplate(templateBody || "");
                    templateRichRaw.current = selectedFramework?.template || "";
                    setEditTemplate(false);
                  }}
                  disabled={patchingTemplate}
                >
                  Cancel
                </Button>
                <Button
                  color="green"
                  onClick={() => {
                    triggerPatchTemplate();
                    setEditTemplate(false);
                  }}
                  loading={patchingTemplate}
                >
                  Save
                </Button>
              </Flex>
            </>
          ) : (
            <Box
              sx={() => ({
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
                backgroundColor: "#F5F5F5",
              })}
              px="md"
              py="xs"
              onClick={() => {
                if (isSellScaleFramework) {
                  return;
                }
                setEditTemplate(true);
              }}
            >
              <Text fz="sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedFramework?.template as string
                    ),
                  }}
                />
              </Text>
              <Flex h="0px" w="100%" mt="40px">
                <Button
                  leftIcon={<IconEdit size="1.0rem" />}
                  variant="outline"
                  pos="relative"
                  bottom="40px"
                  left="88%"
                  h="32px"
                  onClick={() => {
                    setEditTemplate(true);
                  }}
                  disabled={isSellScaleFramework}
                >
                  Edit
                </Button>
              </Flex>
            </Box>
          )}
        </Flex>

        <Accordion defaultValue="additional-information">
          <Accordion.Item
            key="additional-information"
            value="additional-information"
          >
            <Accordion.Control icon={<IconSettings size="1rem" />}>
              Advanced Controls - Coming Soon
            </Accordion.Control>
            <Accordion.Panel>
              <Flex
                style={{
                  border: "0.0625rem solid #ced4da",
                  borderRadius: "8px",
                }}
                align={"center"}
                px="md"
                py={"8px"}
                justify={"space-between"}
              >
                <Text color="gray" fw={600}>
                  USER ACCOUNT RESEARCH:
                </Text>
                <Switch
                  checked={selectedFramework?.use_account_research}
                  onChange={(e) => {
                    if (!selectedFramework) {
                      return;
                    }
                    setSelectedFramework({
                      ...selectedFramework,
                      use_account_research: e.currentTarget.checked,
                    });
                  }}
                />
              </Flex>
              {/* {selectedFramework?.use_account_research && (
                <PersonalizationSection
                  blocklist={selectedFramework?.research_blocklist}
                  onItemsChange={async (items) => {
                    setList(items.filter((x) => !x.checked).map((x) => x.id));
                    // Update transformer blocklist
                    // const result = await patchBumpFramework(
                  }}
                />
              )} */}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Flex>
      <CreateEmailReplyFrameworkModal
        modalOpened={createFrameworkOpened}
        openModal={openCreateFramework}
        closeModal={closeCreateFramework}
        backFunction={triggerGetEmailReplyFrameworks}
        archetypeID={props.archetypeID || -1}
      />
    </Flex>
  );
};
