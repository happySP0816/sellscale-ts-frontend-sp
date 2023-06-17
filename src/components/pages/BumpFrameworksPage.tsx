import { userTokenState } from "@atoms/userAtoms";
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
  ScrollArea
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import CreateBumpFrameworkModal from "@modals/CreateBumpFrameworkModal";
import { IconBook, IconCheck, IconDots, IconEdit, IconList, IconPlus, IconUserPlus, IconX } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { valueToColor } from "@utils/general";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import getPersonas from "@utils/requests/getPersonas";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BumpFramework, MsgResponse } from "src";


const bumpFrameworkLengthMarks = [
  { value: 0, label: "Short", api_label: "SHORT" },
  { value: 50, label: "Medium", api_label: "MEDIUM" },
  { value: 100, label: "Long", api_label: "LONG" },
];


type BumpFrameworkBuckets = {
  ACCEPTED: {
    total: number;
    frameworks: BumpFramework[];
  },
  BUMPED: Record<string, {
    total: number;
    frameworks: BumpFramework[];
  }>,
  ACTIVE_CONVO: {
    total: number;
    frameworks: BumpFramework[];
  },
}


function BumpBucketView(props: {
  bumpBucket: {
    total: number;
    frameworks: BumpFramework[];
  },
  bucketViewTitle: string,
  bucketViewDescription: string,
  status: string,
  dataChannels: MsgResponse | undefined,
  archetypeID: number | null,
  afterCreate: () => void,
  afterEdit: () => void,
  bumpedCount?: number,
}) {
  const theme = useMantineTheme();

  const [createBFModalOpened, { open, close }] = useDisclosure();
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <Card shadow="sm" padding="sm" withBorder w='100%'>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Title order={5}>
              {props.bucketViewTitle}
            </Title>
            <Text ml='sm' size='xs'>
              {props.bucketViewDescription}
            </Text>
          </Flex>
          <Tooltip label="Create a new Bump Framework" withinPortal>
            <ActionIcon onClick={open}>
              <IconPlus size='1.25rem' />
            </ActionIcon>
          </Tooltip>
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
        </Flex>
        <Card.Section><Divider mt='sm' /></Card.Section>

        {/* Bump Frameworks */}
        <Card.Section px='xs'>
          {
            props.bumpBucket && Object.keys(props.bumpBucket).length === 0 ? (
              // No Bump Frameworks
              <Text>
                Please create a Bump Framework using the + button above.
              </Text>
            ) : (
              <>
                {
                  props.bumpBucket.frameworks.map((framework, index) => {
                    // Show only the first Bump Framework of not showing all
                    if (index > 0 && !showAll) {
                      return <></>
                    }

                    return (
                      <>
                        <Flex justify='space-between' align='center' pt='xs'>
                          <Flex direction='row' align='center'>
                            <Switch
                              ml='md'
                              onLabel="Default"
                              offLabel="Default"
                              checked={framework.default}
                              thumbIcon={
                                framework.default ? (
                                  <IconCheck size="0.8rem" color={theme.colors.teal[theme.fn.primaryShade()]} stroke={3} />
                                ) : (
                                  <IconX size="0.8rem" color={theme.colors.red[theme.fn.primaryShade()]} stroke={3} />
                                )
                              }
                              disabled={true}
                              styles={{
                                label: {
                                  backgroundColor: framework.default ? theme.colors.teal[theme.fn.primaryShade()] : theme.colors.red[theme.fn.primaryShade()],
                                }
                              }}
                            />
                            <Flex direction='column' ml='xl'>
                              <Text fw="bold" fz="lg">
                                {framework.title}
                              </Text>
                              <Text maw='50rem'>{framework.description}</Text>
                            </Flex>
                          </Flex>
                          <Tooltip label="Edit Bump Framework" withinPortal>
                            <ActionIcon
                              onClick={() => {
                                console.log(framework.id, framework.overall_status, framework.title, framework.description, framework.bump_length, framework.default, framework.bumped_count)
                                openContextModal({
                                  modal: "editBumpFramework",
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
                                  }
                                })
                              }}
                            >
                              <IconEdit size='1.25rem' />
                            </ActionIcon>
                          </Tooltip>
                        </Flex>
                        <Card.Section><Divider mt='sm' /></Card.Section>
                      </>
                    )
                  })
                }
                {
                  props.bumpBucket.frameworks.length > 1 &&
                  <Card.Section>
                    <Flex justify='center'>
                      <Button
                        variant='subtle'
                        styles={{
                          root: {
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                          }
                        }}
                        onClick={() => setShowAll(!showAll)}
                      >
                        {
                          showAll ? "Hide" : `Show all ${props.bumpBucket.total} frameworks...`
                        }

                      </Button>
                    </Flex>
                  </Card.Section>
                }

              </>
            )
          }
        </Card.Section>

      </Card>

    </>
  )
}

function QuestionObjectionLibraryCard(props: {
  archetypeID: number | null,
  bumpFramework: BumpFramework,
  afterEdit: () => void,
}) {
  const theme = useMantineTheme();

  const splitted_substatus = props.bumpFramework.substatus.split("ACTIVE_CONVO_")[1]

  return (
    <>
      <Card withBorder p='sm' radius='md'>
        <Card.Section px='md' pt='md'>
          <Flex justify='space-between' align='center'>
            <Title order={5}>
              {props.bumpFramework.title}
            </Title>
            <ActionIcon onClick={() => {
              openContextModal({
                modal: "editBumpFramework",
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
                }
              })
            }}>
              <IconEdit size='1.25rem' />
            </ActionIcon>
          </Flex>
        </Card.Section>

        <Card.Section><Divider my='xs' /></Card.Section>
        <Flex mih='100px' align='center'>
          <Text>
            {props.bumpFramework.description}
          </Text>
        </Flex>


        <Card.Section><Divider my='xs' /></Card.Section>
        <Badge
          color={valueToColor(theme, splitted_substatus)}
        >
          {splitted_substatus}
        </Badge>

      </Card>
    </>
  )
}


export default function BumpFrameworksPage() {
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [archetypeID, setArchetypeID] = useState<number | null>(null);
  const [addNewSequenceStepOpened, { open: openSequenceStep, close: closeSequenceStep }] = useDisclosure();
  const [addNewQuestionObjectionOpened, { open: openQuestionObjection, close: closeQuestionObjection }] = useDisclosure();

  const bumpBuckets = useRef<BumpFrameworkBuckets>({
    ACCEPTED: {
      total: 0,
      frameworks: [],
    },
    BUMPED: {},
    ACTIVE_CONVO: {
      total: 0,
      frameworks: [],
    }
  } as BumpFrameworkBuckets);

  const { data: dataChannels } = useQuery({
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
      bumped_count: 0,
    },
  });

  const triggerGetPersonas = async () => {
    const result = await getPersonas(userToken);
    console.log('got personas')

    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Could not get personas",
        color: "red",
      });
      return;
    }

    const personas = result.data;
    for (const persona of personas) {
      if (persona.active) {
        setArchetypeID(persona.id)
        break;
      }
    }

    return
  }

  const triggerGetBumpFrameworks = async (
  ) => {
    setLoading(true);

    console.log('triggeringGET', archetypeID)
    const result = await getBumpFrameworks(
      userToken,
      [],
      [],
      [archetypeID as number]
    );

    if (result.status !== "success") {
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Could not get bump frameworks.",
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
      BUMPED: {},
      ACTIVE_CONVO: {
        total: 0,
        frameworks: [],
      }
    } as BumpFrameworkBuckets;
    for (const bumpFramework of result.data.bump_frameworks as BumpFramework[]) {
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
          newBumpBuckets.BUMPED[bumpCount] = {
            total: 0,
            frameworks: [],
          }
        }
        newBumpBuckets.BUMPED[bumpCount].total += 1;
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
    bumpBuckets.current = newBumpBuckets
    console.log('buckets', newBumpBuckets)

    setLoading(false);
  };

  useEffect(() => {
    triggerGetPersonas();
  }, [])

  useEffect(() => {
    triggerGetBumpFrameworks();
  }, [archetypeID]);

  return (
    <>
      <Flex direction="column">
        <LoadingOverlay visible={loading} />
        <Title>Bump Frameworks</Title>
        <Flex mt="md">
          <PersonaSelect
            disabled={false}
            onChange={(archetype) => {
              if (archetype.length == 0) {
                return;
              }
              setArchetypeID(archetype[0].archetype_id);
            }}
            defaultValues={archetypeID ? [archetypeID] : []}
            selectMultiple={false}
            label="Select Persona"
            description="Select the persona whose bump frameworks you want to view."
          />
        </Flex>

        <Tabs
          color="blue"
          variant='outline'
          defaultValue="sequence"
          my='lg'
          orientation='vertical'
        >
          <Tabs.List>
            <Tabs.Tab
              value="sequence"
              icon={<IconList size="0.8rem" />}
            >
              Sequence
            </Tabs.Tab>
            <Tabs.Tab
              value='qnolibrary'
              icon={<IconBook size="0.8rem" />}
            >
              Questions & Objections Library
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='sequence'>
            {
              !loading ? (
                <ScrollArea>
                  <Flex direction='column' ml='md'>
                    {/* Accepted */}
                    <BumpBucketView
                      bumpBucket={bumpBuckets.current?.ACCEPTED}
                      bucketViewTitle={"Accepted Invitation"}
                      bucketViewDescription={"Prospects who have accepted your connection request."}
                      status={"ACCEPTED"}
                      dataChannels={dataChannels}
                      archetypeID={archetypeID}
                      afterCreate={triggerGetBumpFrameworks}
                      afterEdit={triggerGetBumpFrameworks}
                    />

                    {/* Bumped (map) */}
                    {
                      Object.keys(bumpBuckets.current?.BUMPED).map((bumpCount) => {
                        const bumpCountInt = parseInt(bumpCount);
                        const bumpBucket = bumpBuckets.current?.BUMPED[bumpCountInt];
                        if (bumpCount === '0' || !bumpBucket) {
                          return;
                        }
                        return (
                          <Flex mt='md' w='100%'>
                            <BumpBucketView
                              bumpBucket={bumpBucket}
                              bucketViewTitle={`Bumped ${bumpCount} times`}
                              bucketViewDescription={`Prospects who have been bumped ${bumpCountInt - 1} time(s).`}
                              status={"BUMPED"}
                              dataChannels={dataChannels}
                              archetypeID={archetypeID}
                              afterCreate={triggerGetBumpFrameworks}
                              afterEdit={triggerGetBumpFrameworks}
                              bumpedCount={bumpCountInt}
                            />
                          </Flex>
                        )
                      })
                    }

                    {/* Add another to sequence */}
                    <Flex justify='center'>
                      <Button
                        variant='outline'
                        mt='md'
                        w='50%'
                        onClick={openSequenceStep}
                      >
                        Add another sequence step
                      </Button>
                      <CreateBumpFrameworkModal
                        modalOpened={addNewSequenceStepOpened}
                        openModal={openSequenceStep}
                        closeModal={closeSequenceStep}
                        backFunction={triggerGetBumpFrameworks}
                        dataChannels={dataChannels}
                        status={'BUMPED'}
                        archetypeID={archetypeID}
                        bumpedCount={Object.keys(bumpBuckets.current?.BUMPED).length + 1}
                      />
                    </Flex>
                  </Flex>
                </ScrollArea>
              ) : (
                <Flex justify='center' mt='xl'>
                  <Loader />
                </Flex>
              )

            }

          </Tabs.Panel>

          <Tabs.Panel value="qnolibrary">
            {
              !loading ? (
                <Flex direction='column' ml='xs'>
                  <Flex align='center' w='100%' justify='center'>
                    <Button
                      variant='outline'
                      mb='md'
                      w='50%'
                      onClick={openQuestionObjection}
                    >
                      Add another question/objection
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
                    {
                      Object.keys(bumpBuckets.current?.ACTIVE_CONVO.frameworks).map((qno, index) => {
                        return (
                          <Grid.Col span={6}>
                            <QuestionObjectionLibraryCard
                              bumpFramework={bumpBuckets.current?.ACTIVE_CONVO.frameworks[index]}
                              archetypeID={archetypeID}
                              afterEdit={triggerGetBumpFrameworks}
                            />
                          </Grid.Col>
                        )
                      })
                    }
                  </Grid>
                </Flex>
              ) : (
                <Flex justify='center'>
                  <Loader />
                </Flex>
              )
            }
          </Tabs.Panel>
        </Tabs>
      </Flex >
    </>
  );
}
