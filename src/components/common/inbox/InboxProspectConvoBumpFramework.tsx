import { openedBumpFameworksState, selectedBumpFrameworkState } from '@atoms/inboxAtoms';
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
} from '@mantine/core';

import { getBumpFrameworks } from '@utils/requests/getBumpFrameworks';
import { currentProjectState } from '@atoms/personaAtoms';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BumpFramework, EmailSequenceStep, LinkedInMessage, ProspectShallow } from 'src';
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
import { IconEdit } from '@tabler/icons';
import TextWithNewline from '@common/library/TextWithNewlines';
import { valueToColor } from '@utils/general';

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
    bumpFramework?.bump_length || 'MEDIUM',
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
    [], // EmailSequenceStep?.account_research?
  )

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

}


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

function QuestionObjectionLibraryCard(props: {
  archetypeID: number | null;
  bumpFramework: BumpFramework;
  afterEdit: () => void;
}) {
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


        <Text fz='xs'>
          For convos with status labeled:
        </Text>
        <Badge color={valueToColor(theme, splitted_substatus || "ACTIVE_CONVO")}>{splitted_substatus || "ACTIVE_CONVO"}</Badge>
      </Card>
    </>
  );
}


export default function InboxProspectConvoBumpFramework(props: {
  prospect: ProspectShallow;
  messages: LinkedInMessage[];
  onClose?: () => void;
  onPopulateBumpFrameworks?: (buckets: BumpFrameworkBuckets) => void;
}) {

  const [open, setOpen] = useRecoilState(openedBumpFameworksState);

  const userToken = useRecoilValue(userTokenState);

  const [prospectDrawerStatuses, setProspectDrawerStatuses] = useRecoilState(prospectDrawerStatusesState);


  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);
  const archetypeID = 8;


  const [addNewQuestionObjectionOpened, { open: openQuestionObjection, close: closeQuestionObjection }] =
    useDisclosure();

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

  useEffect(() => {
    triggerGetBumpFrameworks();
  }, [archetypeID]);

  return (
    <Modal
      size="calc(100vw - 3rem)"
      opened={open}
      onClose={() => {
        setOpen(false);
        props.onClose && props.onClose();
      }}
      title={<Title order={4}>Message Generation Config</Title>}
    >
      {!loading ? (
        <Flex direction='column'>
          <Flex w='100%'>
            <Text mt='xs'>
              Automate your replies by editing the response frameworks below.
            </Text>
            <Button variant='outline' w='30%' mb='md' ml='auto' onClick={openQuestionObjection}>
              Add another reply framework
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
    </Modal>
  );
}