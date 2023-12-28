import { bumpFrameworkSelectedSubstatusState, openedBumpFameworksState, selectedBumpFrameworkState } from '@atoms/inboxAtoms';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import {
  Button,
  Flex,
  Title,
  Text,
  useMantineTheme,
  Divider,
  ActionIcon,
  Badge,
  Modal,
  Grid,
  Card,
  Loader,
  Radio,
  Group,
  ScrollArea,
  Box,
  Checkbox,
} from '@mantine/core';
import {
  IconLock,
  IconExternalLink
} from "@tabler/icons";
import { getBumpFrameworks } from '@utils/requests/getBumpFrameworks';
import { currentProjectState } from '@atoms/personaAtoms';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BumpFramework, EmailSequenceStep, LinkedInMessage, PersonaOverview, ProspectShallow } from 'src';
import { showNotification } from '@mantine/notifications';
import { postBumpGenerateEmailResponse, postBumpGenerateResponse } from '@utils/requests/postBumpGenerateResponse';
import _ from 'lodash';
import { API_URL } from '@constants/data';
import { prospectDrawerStatusesState } from '@atoms/prospectAtoms';
import { useDisclosure } from '@mantine/hooks';
import CreateBumpFrameworkModal from '@modals/CreateBumpFrameworkModal';
import { useQuery } from '@tanstack/react-query';
import getChannels from '@utils/requests/getChannels';
import { openContextModal } from '@mantine/modals';
import { IconEdit, IconPencil, IconPlus } from '@tabler/icons';
import TextWithNewline from '@common/library/TextWithNewlines';
import { valueToColor } from '@utils/general';
import { getPersonasOverview } from '@utils/requests/getPersonas';
import { isLoggedIn } from '@auth/core';
import { useNavigate } from 'react-router-dom';

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

export const generateAIFollowup = async (userToken: string, prospectId: number, bumpFramework: BumpFramework | undefined) => {
  const result = await postBumpGenerateResponse(
    userToken,
    prospectId,
    bumpFramework?.id,
    bumpFramework?.account_research?.join('\n') || '',
    bumpFramework?.bump_length || 'MEDIUM'
  );

  if (result.status === 'success') {
    showNotification({
      id: 'generate-ai-followup-success',
      title: 'Success',
      message: 'Message generated.',
      color: 'green',
      autoClose: true,
    });
    return { msg: result.data.message, aiGenerated: true };
  } else {
    showNotification({
      id: 'generate-ai-followup-error',
      title: 'Error',
      message: 'Failed to generate message. Please try again later.',
      color: 'red',
      autoClose: false,
    });
    return { msg: '', aiGenerated: false };
  }
};

export const generateAIEmailReply = async (userToken: string, prospectId: number, emailThreadID: string, emailSequenceStep: EmailSequenceStep | undefined) => {
  const result = await postBumpGenerateEmailResponse(
    userToken,
    prospectId,
    emailThreadID,
    emailSequenceStep?.id,
    [] // EmailSequenceStep?.account_research?
  );

  if (result.status === 'success') {
    showNotification({
      id: 'generate-ai-followup-success',
      title: 'Success',
      message: 'Message generated.',
      color: 'green',
      autoClose: true,
    });
    return { message: result.data.message, aiGenerated: true };
  } else {
    showNotification({
      id: 'generate-ai-followup-error',
      title: 'Error',
      message: 'Failed to generate message. Please try again later.',
      color: 'red',
      autoClose: false,
    });
    return { message: '', aiGenerated: false };
  }
};

export const autoFillBumpFrameworkAccountResearch = (userToken: string, prospectId: number) => {
  return fetch(`${API_URL}/research/personal_research_points?prospect_id=` + prospectId, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })
    .then((res) => {
      return res.json();
    })
    .then(async (res) => {
      let research_str = '';
      for (var i = 0; i < res.length; i++) {
        research_str += `- ${res[i].reason}\n`;
      }
      return research_str.trim();
    })
    .catch((err) => {
      console.log(err);
      return '';
    });
};

export default function InboxProspectConvoBumpFramework(props: {
  prospect: ProspectShallow;
  messages: LinkedInMessage[];
  bumpFrameworksSequence?: { Description: string; Title: string; project_id: string }[]
  onClose?: () => void;
  onPopulateBumpFrameworks?: (buckets: BumpFrameworkBuckets) => void;
}) {
  const theme = useMantineTheme();
  const [open, setOpen] = useRecoilState(openedBumpFameworksState);
  const [substatus, setSubstatus] = useRecoilState(bumpFrameworkSelectedSubstatusState);

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [prospectDrawerStatuses, setProspectDrawerStatuses] = useRecoilState(prospectDrawerStatusesState);

  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  const [data, setData] = useState<any>({} || undefined);
  const [edit, setEdit] = useState(false);
  const [blocklist, setBlockList] = useState<any>([]);
  const [list, setList] = useState<any>([]);
  const [deactivateState, setDeactivateState] = useState(false);
  const [projects, setProjects] = useState<PersonaOverview[]>([]);

  const [fetched, setFetched] = useState(false);

  const navigate = useNavigate();

  const [addNewQuestionObjectionOpened, { open: openQuestionObjection, close: closeQuestionObjection }] = useDisclosure();

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) return;
      const response = await getPersonasOverview(userToken);
      const result =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      setProjects(result);
    })();
  }, []);


  const unassignedPersona = projects.find(
    (project) => project.is_unassigned_contact_archetype
  );

  const archetypeID = unassignedPersona?.id || -1


  const { data: dataChannels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

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

  const triggerGetBumpFrameworks = async () => {
    setLoading(true);

    let substatuses = []
    if (substatus) {
      substatuses.push(substatus)
    }

    const result = await getBumpFrameworks(userToken, [], substatuses, []);
    if (result.status !== 'success') {
      showNotification({
        title: 'Error',
        message: 'Could not get bump frameworks for archetype ID ' + archetypeID,
        color: 'red',
        autoClose: false,
      });
      return;
    }
    setLoading(false);

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
    const sortedActiveConvo = _.sortBy(newBumpBuckets.ACTIVE_CONVO.frameworks, (obj) => obj.substatus);
    newBumpBuckets.ACTIVE_CONVO.frameworks = sortedActiveConvo;

    bumpBuckets.current = newBumpBuckets;

    setData(bumpBuckets.current?.ACTIVE_CONVO.frameworks[0]);
    setBlockList(bumpBuckets.current?.ACTIVE_CONVO.frameworks[0].transformer_blocklist);

    // BumpFrameworks have been updated, submit event to parent
    if (props.onPopulateBumpFrameworks) {
      props.onPopulateBumpFrameworks(newBumpBuckets);
    }

    setLoading(false);
  };
  // Update the prospectDrawerStatusesState global var for the bump framework modal (since it uses it)
  // useEffect(() => {
  //   if (open) {
  //     setProspectDrawerStatuses({
  //       overall: props.prospect.overall_status,
  //       linkedin: props.prospect.linkedin_status,
  //       email: props.prospect.email_status,
  //     })
  //   }
  // }, [open]);

  const handleScroll = (e: any, id: number) => {
    const element = document.getElementById(`${String(id) + 'co'}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  function QuestionObjectionLibraryCard(props: { archetypeID: number | null; bumpFramework: BumpFramework; afterEdit: () => void; id: string }) {
    const theme = useMantineTheme();

    const splitted_substatus = props.bumpFramework?.substatus?.replace('ACTIVE_CONVO_', '');

    return (
      <>
        <div id={props.id ? String(props.id + 'co') : undefined}>
          <Card
            withBorder
            p='sm'
            radius='md'
            id={props.id}
            style={{
              outline: `${props.bumpFramework?.id === data.id ? ' 0.125rem solid #228be6' : ' 0.0625rem solid #ced4da'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              width: '100%',
              marginBottom: '20px',
            }}
          >
            <Card.Section px='md' pt='md'>
              <Flex justify='space-between' align='center'>
                <Box>
                  <Title order={5}>{props.bumpFramework.title}</Title>
                  {
                    !props.bumpFramework.client_archetype_id && props.bumpFramework.default && (
                      <Badge size='xs' color='gray'>
                        SellScale Default Framework
                      </Badge>
                    )
                  }
                </Box>
                <ActionIcon
                  disabled={
                    !props.bumpFramework.client_archetype_id && props.bumpFramework.default
                  }
                  onClick={() => {
                    openContextModal({
                      modal: 'editBumpFramework',
                      title: (
                        <Flex align={'center'} justify={'space-between'}>
                          <Text
                            size={'24px'}
                            fw={600}
                            color='gray'
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            mr={'20rem'}
                          >
                            Edit Framework
                          </Text>
                        </Flex>
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
                        useAccountResearch: props.bumpFramework.use_account_research,
                        transformerBlocklist: props.bumpFramework.transformer_blocklist,
                      },
                    });
                  }}
                >
                  <IconPencil size='1.25rem' />
                </ActionIcon>
              </Flex>
            </Card.Section>

            <Card.Section style={{ display: 'flex', justifyContent: 'center' }}>
              <Divider my='xs' w={'90%'} />
            </Card.Section>
            <Flex align='center'>
              <TextWithNewline>{props.bumpFramework.description}</TextWithNewline>
            </Flex>

            <Card.Section style={{ display: 'flex', justifyContent: 'center' }}>
              <Divider my='xs' w={'90%'} />
            </Card.Section>

            {/* <Text fz='xs'>For convos with status labeled:</Text> */}
            <Badge color={valueToColor(theme, splitted_substatus || 'ACTIVE_CONVO')}>{splitted_substatus || 'ACTIVE_CONVO'}</Badge>
          </Card>
        </div>
      </>
    );
  }
  useEffect(() => {
    triggerGetBumpFrameworks();
  }, [archetypeID, substatus]);

  const [selectedBumpFramework, setBumpFramework] = useRecoilState(
    selectedBumpFrameworkState
  );

  return (
    <Modal
      size='60rem'
      centered
      opened={open}
      onClose={() => {
        setOpen(false);
        props.onClose && props.onClose();
      }}
      title={<Title order={4}>Realtime Response Engine</Title>}
    >
      {!loading ? (
        <Flex w={'100%'} gap={'30px'}>
          <Flex w='40%' direction='column' mt={'md'}>
            {/* <Text mt='xs'>
              Automate your replies by editing the response frameworks below.
            </Text>
            <Button variant='outline' w='30%' mb='md' ml='auto' onClick={openQuestionObjection}>
              Add another reply framework
            </Button> */}
            <Box>
              <Button
                variant='outline'
                mb='md'
                leftIcon={<IconPlus />}
                onClick={openQuestionObjection}
                style={{ borderStyle: 'dashed', fontSize: '16px' }}
                size='lg'
                fw={'sm'}
                w={'100%'}
              >
                Create New Framework
              </Button>
            </Box>
            <ScrollArea scrollbarSize={6}>
              <Box px={10}>
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
                            htmlFor={item?.id ? String(item?.id) : undefined}
                            key={i}
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
                                id={item?.id ? String(item?.id) : undefined}
                                size='xs'
                                onClick={(e) => {
                                  setData(item);
                                  setBlockList(item?.transformer_blocklist);
                                  handleScroll(e, item?.id);
                                  setBumpFramework(item);
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
              </Box>
              <Box px={10} mt={10}>
                {!!props.bumpFrameworksSequence?.length && (
                  <>
                    <Flex
                      justify={'space-between'}
                      align={'center'}
                      gap={4}
                    >
                      <Divider
                        label={
                          <Flex align={'center'} gap={4}>
                            <div
                              style={{
                                width: '10px',
                                height: '10px',
                                background: 'yellow',
                                borderRadius: '100%',
                              }}
                            ></div>
                            <Text color='gray' fw={600}>
                              CONTINUE THE SEQUENCE
                            </Text>
                          </Flex>
                        }
                        labelPosition='left'
                        w={'100%'}
                      />
                      <Flex className='cursor-pointer' gap={4} align={'center'} onClick={() => navigate('/setup/linkedin')}>
                        <Text size={13} color='blue'>
                          Edit
                        </Text>
                        <IconExternalLink width={15} style={{ color: 'blue' }} />
                      </Flex>
                    </Flex>
                    {props.bumpFrameworksSequence?.map((sequence) => (
                      <Flex
                        p={'10px 14px'}
                        my={'10px'}
                        fz={12}
                        justify={'space-between'}
                        align={'center'}
                        bg={'#edf1f7'}
                        style={{
                          outline: '0.0625rem solid #ced4da',
                          borderRadius: '8px',
                        }}
                      >{sequence.Title}
                        <IconLock width={13} color='grey' />
                      </Flex>
                    ))}
                  </>
                )}
              </Box>
            </ScrollArea>
          </Flex>

          <ScrollArea scrollbarSize={6} mt={'sm'} w={'60%'}>
            <Flex w={'100%'} direction='column' gap={'xl'} px={10} mt={'sm'}>
              {bumpBuckets.current?.ACTIVE_CONVO.frameworks.map((qno: any, index) => {

                // only show qnos with same stats
                if (qno.substatus !== data?.substatus && qno?.overall_status === 'ACTIVE_CONVO') return null;

                return (
                  <>
                    <QuestionObjectionLibraryCard
                      id={String(qno?.id) + 'co'}
                      bumpFramework={bumpBuckets.current?.ACTIVE_CONVO.frameworks[index]}
                      archetypeID={archetypeID}
                      afterEdit={triggerGetBumpFrameworks}
                    />
                  </>
                );
              })}
              {/* TODO(Aakash) - Bring this back on Jan 5th, 2024 */}
              {/* {props.bumpFrameworksSequence?.map((sequence) => (
                <div>
                  <Card
                    withBorder
                    p='sm'
                    radius='md'
                    style={{
                      outline: '0.0625rem solid #ced4da',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      width: '100%',
                      marginBottom: '20px',
                    }}
                  >
                    <Card.Section px='md' pt='md'>
                      <Flex justify='space-between' align='center'>
                        <Title order={5}>{sequence.Title}</Title>
                      </Flex>
                    </Card.Section>

                    <Card.Section style={{ display: 'flex', justifyContent: 'center' }}>
                      <Divider my='xs' w={'90%'} />
                    </Card.Section>
                    <Flex align='center'>
                      <TextWithNewline>{sequence.Description}</TextWithNewline>
                    </Flex>

                    <Card.Section style={{ display: 'flex', justifyContent: 'center' }}>
                      <Divider my='xs' w={'90%'} />
                    </Card.Section>

                    <Badge color={valueToColor(theme, 'ACTIVE_CONVO')}>CONTINUE THE SEQUENCE</Badge>
                  </Card>
                </div>
              ))} */}
            </Flex>
          </ScrollArea>

          <CreateBumpFrameworkModal
            modalOpened={addNewQuestionObjectionOpened}
            openModal={openQuestionObjection}
            closeModal={closeQuestionObjection}
            backFunction={triggerGetBumpFrameworks}
            status='ACTIVE_CONVO'
            dataChannels={dataChannels}
            archetypeID={archetypeID}
          />
          {/* <Grid>
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
          </Grid> */}
        </Flex>
      ) : (
        <Flex justify='center'>
          <Loader />
        </Flex>
      )}
    </Modal>
  );
}
