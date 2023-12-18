import { userDataState, userTokenState } from '@atoms/userAtoms';
import PersonaSelect from '@common/persona/PersonaSplitSelect';
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { openConfirmModal, openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import CreateBumpFrameworkModal from '@modals/CreateBumpFrameworkModal';
import CloneBumpFrameworkModal from '@modals/CloneBumpFrameworkModal';
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
  IconWashMachine,
  IconX,
} from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { formatToLabel, valueToColor } from '@utils/general';
import { getBumpFrameworks } from '@utils/requests/getBumpFrameworks';
import getChannels from '@utils/requests/getChannels';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BumpFramework, MsgResponse } from 'src';
import { currentProjectState } from '@atoms/personaAtoms';
import LinkedInConvoSimulator from '@common/simulators/linkedin/LinkedInConvoSimulator';
import { DataTable } from 'mantine-datatable';
import TextWithNewline from '@common/library/TextWithNewlines';
import postToggleAutoBump from '@utils/requests/postToggleAutoBump';
import PersonaDetailsCTAs from '@common/persona/details/PersonaDetailsCTAs';
import VoicesSection from '@common/voice_builder/VoicesSection';
import SequenceSection, { PersonalizationSection } from '@common/sequence/SequenceSection';
import LinkedInConnectedCard from '@common/settings/LinkedInIntegrationCard';
import { getFreshCurrentProject } from '@auth/core';
import { API_URL } from '@constants/data';
import { postBumpDeactivate } from '@utils/requests/postBumpDeactivate';
import { patchBumpFramework } from '@utils/requests/patchBumpFramework';

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
  const [cloneBFModalOpened, { open: openClone, close: closeClone }] = useDisclosure();
  const [showAll, setShowAll] = useState(false);

  return (
    <Box w='100%'>
      <Card shadow='sm' padding='sm' withBorder w='100%'>
        {/* Header */}
        <Flex justify='space-between' align='center'>
          <Flex align='center'>
            <Title order={5}>{props.bucketViewTitle}</Title>
            <Text ml='sm' size='xs'>
              {props.bucketViewDescription}
            </Text>
          </Flex>
          <Flex>
            <Tooltip label='Clone an existing Bump Framework' withinPortal>
              <ActionIcon onClick={openClone}>
                <IconFolders size='1.25rem' />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Create a new Bump Framework' withinPortal>
              <ActionIcon onClick={open}>
                <IconPlus size='1.25rem' />
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
          <Divider mt='sm' />
        </Card.Section>

        {/* Bump Frameworks */}
        <Card.Section px='xs'>
          {props.bumpBucket && props.bumpBucket.total === 0 ? (
            // No Bump Frameworks
            <Flex justify='center' align='center'>
              <Text my='md'>Please create a Bump Framework using the + button above.</Text>
            </Flex>
          ) : (
            <>
              {props.bumpBucket.frameworks.map((framework, index) => {
                // Show only the first Bump Framework of not showing all
                if (index > 0 && !showAll) {
                  return <></>;
                }

                let bumpConversionRate;
                if (framework.etl_num_times_converted && framework.etl_num_times_used) {
                  bumpConversionRate = (framework.etl_num_times_converted / framework.etl_num_times_used) * 100;
                }

                return (
                  <>
                    <Flex justify='space-between' align='center' pt='xs'>
                      <Flex direction='row' align='center'>
                        <Flex direction='column' align='center' justify='center' ml='md'>
                          <Switch
                            onLabel='Default'
                            offLabel='Default'
                            checked={framework.default === true}
                            thumbIcon={
                              framework.default === true ? (
                                <IconCheck size='0.8rem' color={theme.colors.teal[theme.fn.primaryShade()]} stroke={3} />
                              ) : (
                                <IconX size='0.8rem' color={theme.colors.red[theme.fn.primaryShade()]} stroke={3} />
                              )
                            }
                            disabled={true}
                            styles={{
                              label: {
                                backgroundColor:
                                  framework.default === true ? theme.colors.teal[theme.fn.primaryShade()] : theme.colors.red[theme.fn.primaryShade()],
                              },
                            }}
                          />

                          <Tooltip
                            label={`Prospects reply to this bump directly, ${bumpConversionRate?.toFixed(2) || 'an unknown '}% of the time`}
                            withinPortal
                            withArrow
                          >
                            <Badge mt='xs' variant='outline' size='xs' color={'green'}>
                              {bumpConversionRate?.toFixed(2) || 'N/A'}%
                            </Badge>
                          </Tooltip>
                        </Flex>
                        <Flex direction='column' ml='xl'>
                          <Flex direction='row'>
                            <Text fw='bold' fz='lg' mr='8px'>
                              {framework.title}
                            </Text>
                            {framework.use_account_research && (
                              <Tooltip withArrow withinPortal label='This BumpFramework will use Account Research'>
                                <div>
                                  <IconSearch size='.75rem' stroke='2px' />
                                </div>
                              </Tooltip>
                            )}
                          </Flex>
                          <TextWithNewline breakheight='6px' style={{ fontSize: '80%' }}>
                            {framework.description}
                          </TextWithNewline>
                        </Flex>
                      </Flex>
                      <Tooltip label='Edit Bump Framework' withinPortal>
                        <ActionIcon
                          onClick={() => {
                            openContextModal({
                              modal: 'editBumpFramework',
                              title: <Title order={3}>Edit: {framework.title}</Title>,
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
                                useAccountResearch: framework.use_account_research,
                                transformerBlocklist: framework.transformer_blocklist,
                              },
                            });
                          }}
                        >
                          <IconEdit size='1.25rem' />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                    <Card.Section>
                      <Divider mt='sm' />
                    </Card.Section>
                  </>
                );
              })}
              {props.bumpBucket.frameworks.length > 1 && (
                <Card.Section>
                  <Flex justify='center'>
                    <Button
                      variant='subtle'
                      styles={{
                        root: {
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        },
                      }}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? 'Hide' : `Show all ${props.bumpBucket.total} frameworks...`}
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
          <Card padding='sm' w='100%' mb='12px' mt='12px'>
            <Card.Section px='xs'>
              <Flex align={'center'} justify={'center'} w='100%'>
                <Tooltip label={`Prospect will be snoozed for ${framework.bump_delay_days} days after bump is sent`} withinPortal>
                  <Badge mt='12px' size='md' color={valueToColor(theme, formatToLabel(framework.bump_delay_days + ''))} variant='filled'>
                    Snooze for {framework.bump_delay_days} day
                    {framework.bump_delay_days > 1 ? 's' : ''}
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

function QuestionObjectionLibraryCard(props: { archetypeID: number | null; bumpFramework: BumpFramework; afterEdit: () => void }) {
  const theme = useMantineTheme();

  const splitted_substatus = props.bumpFramework?.substatus?.replace('ACTIVE_CONVO_', '');

  return (
    <>
      <Card withBorder p='sm' radius='md'>
        <Card.Section px='md' pt='md'>
          <Flex justify='space-between' align='center'>
            <Title order={5}>{props.bumpFramework.title}</Title>
            <ActionIcon
              onClick={() => {
                openContextModal({
                  modal: 'editBumpFramework',
                  title: <Title order={3}>Edit: {props.bumpFramework.title}</Title>,
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
                    useAccountResearch: props.bumpFramework.use_account_research,
                    transformerBlocklist: props.bumpFramework.transformer_blocklist,
                  },
                });
              }}
            >
              <IconEdit size='1.25rem' />
            </ActionIcon>
          </Flex>
        </Card.Section>

        <Card.Section>
          <Divider my='xs' />
        </Card.Section>
        <Flex mih='100px' align='center'>
          <TextWithNewline>{props.bumpFramework.description}</TextWithNewline>
        </Flex>

        <Card.Section>
          <Divider my='xs' />
        </Card.Section>

        <Text fz='xs'>For convos with status labeled:</Text>
        <Badge color={valueToColor(theme, splitted_substatus || 'ACTIVE_CONVO')}>{splitted_substatus || 'ACTIVE_CONVO'}</Badge>
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
    <Flex direction='column' w='100%'>
      <Flex>
        <Title order={5}>{props.bucketViewTitle}</Title>
        <Text ml='sm' fz='sm' color='gray'>
          - {props.bucketViewDescription}
        </Text>
      </Flex>

      {props.bumpBucket?.frameworks?.length > 0 ? (
        <DataTable
          mt='sm'
          withBorder
          shadow='sm'
          borderRadius='sm'
          highlightOnHover
          records={props.bumpBucket.frameworks}
          columns={[
            {
              accessor: 'title',
              title: 'Title',
              sortable: true,
              width: '50%',
              render: ({ title, description }) => {
                return (
                  <HoverCard
                    withinPortal
                    withArrow
                    width='460px'
                    styles={{
                      dropdown: {
                        padding: '12px',
                        border: '1px solid green',
                      },
                    }}
                  >
                    <HoverCard.Target>
                      <Text>{title}</Text>
                    </HoverCard.Target>
                    <HoverCard.Dropdown p='md'>
                      <Title order={3}>{title}</Title>
                      <Badge mt='xs' size='sm'>
                        {props.persona}
                      </Badge>
                      <Flex mt='md'>
                        <TextWithNewline breakheight='10px'>{description}</TextWithNewline>
                      </Flex>
                    </HoverCard.Dropdown>
                  </HoverCard>
                );
              },
            },
            {
              accessor: 'etl_num_times_used',
              title: 'Times Used',
              sortable: true,
              render: ({ etl_num_times_used }) => (etl_num_times_used ? etl_num_times_used : 0),
            },
            {
              accessor: 'etl_num_times_converted',
              title: 'Times Converted',
              sortable: true,
              render: ({ etl_num_times_converted }) => (etl_num_times_converted ? etl_num_times_converted : 0),
            },
            {
              accessor: 'etl_conversion_rate',
              title: 'Conversion Rate',
              sortable: true,
              render: ({ etl_num_times_used, etl_num_times_converted }) => {
                if (etl_num_times_used && etl_num_times_converted) {
                  const percentage = (etl_num_times_converted / etl_num_times_used) * 100;
                  return `${percentage.toFixed(2)}%`;
                }
                return `0%`;
              },
            },
          ]}
        />
      ) : (
        <Flex justify='center' mt='xl'>
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

  const [addNewSequenceStepOpened, { open: openSequenceStep, close: closeSequenceStep }] = useDisclosure();
  const [addNewQuestionObjectionOpened, { open: openQuestionObjection, close: closeQuestionObjection }] = useDisclosure();
  const [maximumBumpSoftLock, setMaximumBumpSoftLock] = useState(false);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);
  const archetypeID = currentProject?.id || -1;
  const [collapseSimulation, setCollapseSimulator] = useState(true);
  const [numActiveCTAs, setNumActiveCTAs] = useState(0);

  const [data, setData] = useState<any>({} || undefined);
  const [edit, setEdit] = useState(false);
  const [blocklist, setBlockList] = useState<any>([]);
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
    { value: 0, label: 'Short', api_label: 'SHORT' },
    { value: 50, label: 'Medium', api_label: 'MEDIUM' },
    { value: 100, label: 'Long', api_label: 'LONG' },
  ];

  const { data: dataChannels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  const triggerToggleAutoBump = async () => {
    let status = userData.auto_bump;
    let old_status;
    if (status == true) {
      status = 'Disabled';
      old_status = 'Enabled';
    } else {
      status = 'Enabled';
      old_status = 'Disabled';
    }

    const result = await postToggleAutoBump(userToken);

    if (result.status === 'success') {
      setUserData({ ...userData, auto_bump: !userData.auto_bump });
      showNotification({
        title: `AutoBump ${status}`,
        message: `AutoBump has been ${status.toLower()}. You can ${old_status.toLowerCase()} it at any time.`,
        color: 'green',
        icon: <IconCheck size='1rem' />,
      });
    } else {
      showNotification({
        title: 'Error',
        message: 'Something went wrong. Please try again later.',
        color: 'red',
        icon: <IconAlertTriangle size='1rem' />,
      });
    }
  };

  const triggerGetBumpFrameworks = async () => {
    setLoading(true);

    const result = await getBumpFrameworks(userToken, [], [], [archetypeID]);

    if (result.status !== 'success') {
      setLoading(false);
      showNotification({
        title: 'Error',
        message: 'Could not get bump frameworks for archetype ID ' + archetypeID,
        color: 'red',
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
    for (const bumpFramework of result.data.bump_frameworks as BumpFramework[]) {
      const status = bumpFramework.overall_status;
      if (status === 'ACCEPTED') {
        newBumpBuckets.ACCEPTED.total += 1;
        if (bumpFramework.default) {
          newBumpBuckets.ACCEPTED.frameworks.unshift(bumpFramework);
        } else {
          newBumpBuckets.ACCEPTED.frameworks.push(bumpFramework);
        }
      } else if (status === 'BUMPED') {
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
      } else if (status === 'ACTIVE_CONVO') {
        newBumpBuckets.ACTIVE_CONVO.total += 1;
        if (bumpFramework.default) {
          newBumpBuckets.ACTIVE_CONVO.frameworks.unshift(bumpFramework);
        } else {
          newBumpBuckets.ACTIVE_CONVO.frameworks.push(bumpFramework);
        }
      }
    }
    bumpBuckets.current = newBumpBuckets;

    setData(bumpBuckets.current?.ACTIVE_CONVO.frameworks[0]);

    // BumpFrameworks have been updated, submit event to parent
    if (props.onPopulateBumpFrameworks) {
      props.onPopulateBumpFrameworks(newBumpBuckets);
    }

    setLoading(false);
  };

  const triggerPostBumpDeactivate = async () => {
    setLoading(true);
    setDeactivateState(true);

    const result = await postBumpDeactivate(userToken, data?.id);
    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Bump Framework deactivated successfully',
        color: theme.colors.green[7],
      });
      setLoading(false);
      alert('Bump Framework deactivated successfully');
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
    setDeactivateState(false);
  };

  const triggerEditBumpFramework = async () => {
    setLoading(true);

    const result = await patchBumpFramework(
      userToken,
      data.id,
      data.overall_status,
      data.title,
      data.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
      data.bumped_count,
      data.bump_delay_days,
      data.default,
      data.use_account_research,
      blocklist
    );

    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Bump Framework updated successfully',
        color: theme.colors.green[7],
      });
      setLoading(false);
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    triggerGetBumpFrameworks();
  }, [archetypeID, deactivateState]);

  useEffect(() => {
    let length = bumpFrameworkLengthMarks.find((marks) => marks.api_label === data.bumpLength)?.value;
    if (length == null) {
      length = 50;
    }

    setBumpLengthValue(length);
  }, []);

  return (
    <>
      <Flex direction='column'>
        {/* <LoadingOverlay visible={loading} /> */}
        {!props.hideTitle && (
          <Flex justify='space-between'>
            <Title mb='xs'>LinkedIn Setup</Title>
          </Flex>
        )}

        <Flex direction={'row'}>
          <Box w={'100%'}>
            <Tabs keepMounted={false} color='blue' variant='outline' defaultValue={props.defaultTab || 'sequence'} orientation='horizontal'>
              <Tabs.List>
                {/* <Tabs.Tab value='ctas' icon={<IconList size='0.8rem' />}>
                  CTAs
                </Tabs.Tab> */}
                <Tabs.Tab value='sequence' icon={<IconList size='0.8rem' />}>
                  Sequence
                </Tabs.Tab>
                <Tabs.Tab value='replies' icon={<IconBook size='0.8rem' />}>
                  Replies
                </Tabs.Tab>
                <Tabs.Tab value='settings' icon={<IconWashMachine size='0.8rem' />}>
                  Settings
                </Tabs.Tab>
                <Tooltip label='Run advanced simulation'>
                  <Tabs.Tab value='simulate' ml='auto' icon={<IconTool size='0.8rem' />} />
                </Tooltip>
                {/* <Tabs.Tab value='analytics' icon={<IconAnalyze size='0.8rem' />}>
                  Analytics
                </Tabs.Tab> */}
              </Tabs.List>

              <Tabs.Panel value='sequence' pt='xs'>
                {!loading ? (
                  <SequenceSection />
                ) : (
                  <Flex justify='center' mt='xl'>
                    <Loader />
                  </Flex>
                )}
              </Tabs.Panel>

              <Tabs.Panel value='settings' pt='xs'>
                <Container maw='800px' ml='auto' mr='auto'>
                  <LinkedInConnectedCard connected={userData ? userData.li_voyager_connected : false} />
                  {/* Auto bump component */}
                  <Card withBorder mt='xs' radius={'md'}>
                    <Title order={4}>Autobump</Title>
                    <Text size='xs' color='gray'>
                      By enabling AutoBump, SellScale will automatically send follow-up messages to prospects who do not respond to your initial message.
                    </Text>
                    <Switch
                      label='AutoBump'
                      onLabel='ON'
                      offLabel='OFF'
                      size='xs'
                      mt='xs'
                      styles={{
                        labelWrapper: {
                          cursor: 'pointer',
                        },
                        label: {
                          cursor: 'pointer',
                        },
                        track: {
                          cursor: 'pointer',
                        },
                      }}
                      checked={userData.auto_bump}
                      onChange={(e) => {
                        let status = userData.auto_bump;
                        let old_status;
                        if (status == true) {
                          status = 'Disable';
                          old_status = 'enable';
                        } else {
                          status = 'Enable';
                          old_status = 'disable';
                        }
                        openConfirmModal({
                          title: (
                            <Flex direction='row' align='center' justify='space-between'>
                              <Title order={3}>AutoBump</Title>
                              <Badge color={userData.auto_bump ? 'green' : 'red'} variant='filled' ml='sm'>
                                {userData.auto_bump ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </Flex>
                          ),
                          children: (
                            <>
                              <Text fz='sm'>
                                AutoBump is SellScale AI's system for automatically sending follow-up messages to prospects. AutoBumps are sent when a prospect
                                does not respond to a message, and are sent at random times between 9am and 5pm in your timezone on workdays.
                              </Text>
                              <Card mt='sm' mb='md' withBorder shadow='sm'>
                                <Text fw='bold'>
                                  Please test your bump frameworks before enabling AutoBump. AutoBump will always use your default bump framework, so make sure
                                  it is working as expected.
                                </Text>
                              </Card>

                              <Text mt='md' fz='sm'>
                                AutoBumps using personalized bump frameworks see a significant increase in response rates.
                              </Text>
                            </>
                          ),
                          labels: { confirm: status, cancel: 'Cancel' },
                          cancelProps: { color: 'gray' },
                          confirmProps: {
                            color: userData.auto_bump ? 'red' : 'pink',
                          },
                          onCancel: () => {},
                          onConfirm: () => {
                            triggerToggleAutoBump();
                          },
                        });
                      }}
                    />
                  </Card>
                  <Card withBorder mt='xs' radius={'md'}>
                    <Title order={4}>Template Mode vs CTA Mode</Title>
                    <Text size='xs' color='gray'>
                      CTA Mode is a more generative mode where you use a combination of CTAs and Voice to control your messaging. Template mode is more
                      controlled. Feel free to toggle this persona to your preference.{' '}
                    </Text>
                    <Switch
                      label='Template Mode Enabled'
                      onLabel='ON'
                      offLabel='OFF'
                      mt='xs'
                      checked={currentProject?.template_mode}
                      onClick={() => {
                        fetch(`${API_URL}/client/archetype/${currentProject?.id}/toggle_template_mode`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${userToken}`,
                          },
                          body: JSON.stringify({
                            template_mode: !currentProject?.template_mode,
                          }),
                        }).then((res) => {
                          getFreshCurrentProject(userToken, currentProject?.id as number).then((project: any) => {
                            showNotification({
                              title: 'Success',
                              message: `Template mode ${project?.template_mode ? 'enabled' : 'disabled'}`,
                              color: 'green',
                              icon: <IconCheck size='1rem' />,
                            });
                            setCurrentProject(project);
                          });
                        });
                      }}
                    />
                  </Card>
                </Container>
              </Tabs.Panel>

              <Tabs.Panel value='simulate' pt='xs'>
                <LinkedInConvoSimulator personaId={archetypeID as number} sequenceSetUpMode={true} />
              </Tabs.Panel>

              <Tabs.Panel value='replies' pt='xs'>
                {!loading ? (
                  <Flex mt='md' w={'100%'} gap={'50px'}>
                    <Flex w='40%' direction='column'>
                      {/* <Text mt='xs'>Automate your replies by editing the response frameworks below.</Text>
                      <Button variant='outline' w='30%' mb='md' ml='auto' onClick={openQuestionObjection}>
                        Add another reply framework
                      </Button> */}
                      <Button
                        variant='outline'
                        mb='md'
                        leftIcon={<IconPlus />}
                        onClick={openQuestionObjection}
                        style={{ borderStyle: 'dashed', fontSize: '16px' }}
                        size='lg'
                        fw={'sm'}
                      >
                        Create New Framework
                      </Button>
                      <Radio.Group value={data?.id}>
                        <Group mt='xs'>
                          {bumpBuckets.current?.ACTIVE_CONVO.frameworks.map((item: any, i: number) => {
                            const splitted_substatus = item.substatus?.replace('ACTIVE_CONVO_', '');

                            return (
                              <>
                                {(!bumpBuckets.current?.ACTIVE_CONVO.frameworks[i - 1] ||
                                  item.substatus !== bumpBuckets.current?.ACTIVE_CONVO.frameworks[i - 1].substatus) && (
                                  <Divider
                                    label={
                                      <Flex align={'center'} gap={4}>
                                        <div
                                          style={{
                                            width: '10px',
                                            height: '10px',
                                            background: valueToColor(theme, splitted_substatus || 'ACTIVE_CONVO'),
                                            borderRadius: '100%',
                                          }}
                                        ></div>
                                        <Text color='gray' fw={600}>
                                          {splitted_substatus || 'ACTIVE_CONVERSATION'}
                                        </Text>
                                      </Flex>
                                    }
                                    labelPosition='left'
                                    w={'100%'}
                                  />
                                )}

                                <label
                                  htmlFor={item?.title}
                                  style={{
                                    outline: `${data?.id === item?.id ? ' 0.125rem solid #228be6' : ' 0.0625rem solid #ced4da'}`,
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    width: '100%',
                                  }}
                                >
                                  <Flex align={'center'} gap={10}>
                                    <Radio
                                      value={item?.id}
                                      id={item?.title}
                                      size='xs'
                                      onClick={() => {
                                        setData(item);
                                      }}
                                    />
                                    <Text fw={600} mt={2}>
                                      {item?.title}
                                    </Text>
                                  </Flex>
                                </label>
                              </>
                            );
                          })}
                        </Group>
                      </Radio.Group>
                    </Flex>

                    <Flex w={'100%'} direction='column' gap={'xl'}>
                      <Flex w={'100%'} justify={'space-between'} align={'center'}>
                        <Text
                          size={'24px'}
                          fw={600}
                          color='gray'
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          inline
                        >
                          Edit Framework:{' '}
                          {edit ? (
                            <TextInput
                              size='md'
                              value={data?.title}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  title: e.target.value,
                                })
                              }
                              w='400px'
                            />
                          ) : (
                            <span style={{ color: 'black' }}>{data?.title}</span>
                          )}
                          <IconPencil onClick={() => setEdit(!edit)} style={{ cursor: 'pointer' }} />
                        </Text>
                        <Checkbox label='Default Framework' defaultChecked />
                      </Flex>
                      <Flex w='100%' justify={'space-between'} gap={'xl'}>
                        <Flex direction='column' w='100%'>
                          <Text color='gray' fw={600}>
                            REPLY FRAMEWORK TITLE:
                          </Text>
                          <TextInput
                            description=' '
                            placeholder='reply framework'
                            value={data?.title}
                            w={'100%'}
                            size='md'
                            // onChange={(e) =>
                            //   setData({
                            //     ...data,
                            //     title: e.target.value,
                            //   })
                            // }
                          />
                        </Flex>
                        <Flex direction='column' w='100%'>
                          <Text color='gray' fw={600}>
                            SUB-STATUS
                          </Text>
                          <Select
                            description=' '
                            placeholder='Pick value'
                            data={data?.active_transformers ? data?.active_transformers : []}
                            defaultValue={data?.active_transformers && data?.active_transformers[0]}
                            // onChange={(e) => setData({
                            //   ...data,

                            // })}
                            w={'100%'}
                            size='md'
                          />
                        </Flex>
                      </Flex>
                      <Flex direction='column'>
                        <Text color='gray' fw={600}>
                          PROMPT INSTRUCTION
                        </Text>
                        <Textarea
                          size='md'
                          description=' '
                          placeholder='These are instructions the AI will read to craft a personalized message.'
                          minRows={6}
                          value={data?.description}
                          onChange={(e) =>
                            setData({
                              ...data,
                              description: e.target.value,
                            })
                          }

                          // {...data?.getInputProps('description')}
                        />
                      </Flex>
                      <Flex gap={'xl'}>
                        <Button variant='filled' color='red' w={'100%'} size='lg' onClick={() => triggerPostBumpDeactivate()}>
                          Deactivate
                        </Button>
                        <Button variant='filled' w={'100%'} size='lg' onClick={() => triggerEditBumpFramework()}>
                          Save Framework
                        </Button>
                      </Flex>
                      <label>
                        <Flex
                          style={{
                            border: '0.0625rem solid #ced4da',
                            borderRadius: '8px',
                          }}
                          align={'center'}
                          px='md'
                          py={'8px'}
                          justify={'space-between'}
                        >
                          <Text color='gray' fw={600}>
                            USER ACCOUNT RESEARCH:
                          </Text>
                          <Switch
                            checked={data?.use_account_research}
                            onChange={(e) => {
                              setData({
                                ...data,
                                use_account_research: e.currentTarget.checked,
                              });
                            }}
                          />
                        </Flex>
                      </label>
                      {data?.use_account_research && (
                        <PersonalizationSection
                          blocklist={blocklist}
                          // setList={setBlockList}
                          onItemsChange={async (items) => {
                            // Update transformer blocklist
                            setBlockList(items.filter((x) => !x.checked));
                            const result = await patchBumpFramework(
                              userToken,
                              data.id,
                              data.overall_status,
                              data.title,
                              data.description,
                              bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
                              data.bumped_count,
                              data.bump_delay_days,
                              data.default,
                              data.use_account_research,
                              items.filter((x) => !x.checked).map((x) => x.id)
                            );
                          }}
                        />
                      )}
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
                      {Object.keys(bumpBuckets.current?.ACTIVE_CONVO.frameworks).map((qno, index) => {
                        return (
                          <Grid.Col span={6}>
                            <QuestionObjectionLibraryCard
                              bumpFramework={bumpBuckets.current?.ACTIVE_CONVO.frameworks[index]}
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
                )}
              </Tabs.Panel>

              <Tabs.Panel value='analytics' pt='xs'>
                {!loading && bumpBuckets.current && (
                  <Stack mx='md'>
                    {/* Table for Step 1 */}
                    <Flex>
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle='First / Initial Followup'
                        bucketViewDescription='Prospects who have accepted your connection request.'
                        bumpBucket={bumpBuckets.current?.ACCEPTED}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Step 2 */}
                    <Flex mt='md'>
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle='Second Followup'
                        bucketViewDescription='This is followup #2'
                        bumpBucket={bumpBuckets.current?.BUMPED[1]}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Step 3 */}
                    <Flex mt='md'>
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle='Third Followup'
                        bucketViewDescription='This is followup #3'
                        bumpBucket={bumpBuckets.current?.BUMPED[2]}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Step 4 */}
                    <Flex mt='md'>
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle='Fourth Followup'
                        bucketViewDescription='This is followup #4'
                        bumpBucket={bumpBuckets.current?.BUMPED[3]}
                        persona={currentProject?.name}
                      />
                    </Flex>

                    {/* Table for Questions & Objections */}
                    <Flex mt='md'>
                      <BumpFrameworkAnalysisTable
                        bucketViewTitle='Questions & Objections'
                        bucketViewDescription='Prospects who have responded with a question or objection.'
                        bumpBucket={bumpBuckets.current?.ACTIVE_CONVO}
                        persona={currentProject?.name}
                      />
                    </Flex>
                  </Stack>
                )}
              </Tabs.Panel>
            </Tabs>
          </Box>
          {/* <Card withBorder ml='xs' w={collapseSimulation ? '15%' : '40%'}>
            {!collapseSimulation ? (
              <Button
                variant='outline'
                size='xs'
                color='gray'
                mb='xs'
                rightIcon={<IconArrowRight />}
                onClick={() => {
                  setCollapseSimulator(!collapseSimulation);
                }}
              >
                Hide
              </Button>
            ) : (
              <Button
                variant='outline'
                size='xs'
                color='gray'
                mb='xs'
                leftIcon={<IconArrowLeft />}
                onClick={() => {
                  setCollapseSimulator(!collapseSimulation);
                }}
              >
                Show
              </Button>
            )}

            {collapseSimulation && (
              <Card withBorder>
                <Text color='#42b9f5'>Show Conversation Simulator</Text>
                <IconMessage color='#42b9f5' size='3rem' />
              </Card>
            )}

            <Container opacity={collapseSimulation ? 0 : 1}>
              <LinkedInConvoSimulator personaId={archetypeID as number} sequenceSetUpMode={true} />
            </Container>
          </Card> */}
        </Flex>
      </Flex>
    </>
  );
}

/*


 <ScrollArea>
                    <Flex direction='column' ml='md'>
                      <Card mb='md' withBorder>
                        <Card.Section p='md'>
                          <Flex align='center'>
                            <Title order={5}>Connection Request</Title>
                            <Text fz='xs' ml='sm'>
                              300 Character Linkedin Invite
                            </Text>
                          </Flex>
                        </Card.Section>
                        <Card.Section mb='md'>
                          <Divider />
                        </Card.Section>

                        <Accordion defaultValue="">
                          <Accordion.Item value="ctas">
                            <Accordion.Control>
                              <Flex align='left' >
                                <Container>
                                  <IconChecklist size='2rem' />
                                </Container>
                                <Container w='80%'>
                                  <Text fw='600'>Set Call-To-Actions</Text>
                                  <Text size='xs'>These are the last 120 characters of your LinkedIn connection message.</Text>
                                  <Badge color={numActiveCTAs == 0 ? 'red' : 'green'} mt='xs'>
                                    {numActiveCTAs} CTAs active
                                  </Badge>
                                </Container>
                              </Flex>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <PersonaDetailsCTAs onCTAsLoaded={(data) => setNumActiveCTAs(data.filter((x: any) => x.active).length)} />
                            </Accordion.Panel>
                          </Accordion.Item>

                          <Accordion.Item value="voices">
                            <Accordion.Control>
                              <Flex align='left' >
                                <Container>
                                  <IconChartBubble size='2rem' />
                                </Container>
                                <Container  w='80%'>
                                  <Text fw='600'>Voice (optional)</Text>
                                  <Text size='xs'>Create 4-6 sample messages for the AI to learn from else the AI will use the default voice</Text>
                                </Container>
                              </Flex>
                            </Accordion.Control>
                            <Accordion.Panel pt='sm'>
                              <VoicesSection />

                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                        
                      </Card>

                      <Divider label='After prospect accepts invite' labelPosition='center' mt='md' mb='md' />

                      
                      <BumpBucketView
                        bumpBucket={bumpBuckets.current?.ACCEPTED}
                        bucketViewTitle={'LinkedIn DM #1'}
                        bucketViewDescription={'If no reply from prospect.'}
                        status={'ACCEPTED'}
                        dataChannels={dataChannels}
                        archetypeID={archetypeID}
                        afterCreate={triggerGetBumpFrameworks}
                        afterEdit={triggerGetBumpFrameworks}
                        afterClone={triggerGetBumpFrameworks}
                      />

                      
                      {Object.keys(bumpBuckets.current?.BUMPED).map((bumpCount) => {
                        const bumpCountInt = parseInt(bumpCount);
                        const bumpBucket = bumpBuckets.current?.BUMPED[bumpCountInt];

                        const bumpToFollowupMap: Record<string, string> = {
                          '1': '2',
                          '2': '3',
                          '3': '4',
                          '4': '5',
                          '5': '6',
                        }
                        const followupString = bumpToFollowupMap[bumpCount];
                        if (followupString == undefined) {
                          return;
                        }
                        return (
                          <Flex mt='md' w='100%'>
                            <BumpBucketView
                              bumpBucket={bumpBucket}
                              bucketViewTitle={`LinkedIn DM #${followupString}`}
                              bucketViewDescription={`If no reply from prospect.`}
                              status={'BUMPED'}
                              dataChannels={dataChannels}
                              archetypeID={archetypeID}
                              afterCreate={triggerGetBumpFrameworks}
                              afterEdit={triggerGetBumpFrameworks}
                              bumpedCount={bumpCountInt}
                              afterClone={triggerGetBumpFrameworks}
                            />
                          </Flex>
                        );
                      })}}
                    </Flex>
                  </ScrollArea>


*/
