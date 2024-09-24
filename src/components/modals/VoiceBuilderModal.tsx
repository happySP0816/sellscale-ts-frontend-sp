import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Title,
  Flex,
  Textarea,
  LoadingOverlay,
  Card,
  Select,
  Skeleton,
  Box,
  Container,
  Divider,
  Loader,
  ScrollArea,
  Stack,
} from '@mantine/core';
import { ContextModalProps, openConfirmModal, openContextModal } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { Archetype } from 'src';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import createCTA from '@utils/requests/createCTA';
import { IconRefresh, IconUser } from '@tabler/icons';
import {
  createVoice,
  createVoiceBuilderOnboarding,
  deleteSample,
  generateSamples,
  getVoiceBuilderDetails,
  getVoiceOnboardings,
  updateSample,
} from '@utils/requests/voiceBuilder';
import { currentProjectState } from '@atoms/personaAtoms';

export const STARTING_INSTRUCTIONS = `
You are a sales representative that writes short messages to prospects to start outreach to them. 
You are goint to create an outreach message based on a set of samples I give you. You are called the "voice emulator."

Follow instructions to generate a short intro message:
- If mentioning title, colloquialize it (i.e. make Vice President -> VP)
- If they are a Doctor or Physician, refer to them by Dr. title (followed by last name)
- Ensure that you mention key personalized elements
- Tie in the sentences together to make sure it's cohesive
- Smoothly embed the call-to-action into the end of message.
- Include a friendly greeting in the beginning.

You are to generate a message with a similar voice and tone as the below message samples. Each samples will have some meta data that 
you will find useful:

  - SDR name: I will provide the SDR name, which is the sales representative name for the sample message.
  - Company Name: The company that the SDR works for.
  - CTA used: CTA is the Call to Action. It is the kind of strategy that you are going for. Something like "We would like to use your opinion in testing our product" will be considered a Feedback-based CTA.
  - Research Points: These are points that represents the personalizers we are using in the samples or messages. For example, the school that the prospect attended is one such research point or personalizers.
   - Prospect name: The name for the prospect.
   - Prospect Title: Prospect Title.
   - Prospect Company: The Company where the prospect works at.

   IMPORTANT: this is a message for LinkedIn. Therefore, we do not want formal messages. This includes messages that has a formal greeting or sign off. Do not include sign offs like: "Best, ..."
  
  Finally, it is critical that you keep your messages to at most 300 characters.

  We will provide you with a CTA and some personalizers, as well as the SDR name and company name, and you are to generate a message using that information with a similar voice as the examples below:
`;

export const MSG_GEN_AMOUNT = 6;
// export const MAX_EDITING_PHASES = 3;

import { Modal, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { voiceBuilderMessagesState } from '@atoms/voiceAtoms';
import { logout } from '@auth/core';
import TrainYourAi from '@common/voice_builder/TrainYourAi';
import { API_URL } from '@constants/data';
import { count } from 'console';
import _ from 'lodash';
import { useInterval } from '@mantine/hooks';

const VoiceBuilderModal: React.FC<{
  opened: boolean;
  onClose: () => void;
}> = ({ opened, onClose }) => {
  const blue = '#228be6';

  return (
    <Modal.Root opened={opened} onClose={onClose} fullScreen closeOnClickOutside>
      <Modal.Overlay blur={3} color='gray.2' opacity={0.5} />
      <Modal.Content sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Modal.Header
          md-px={'1.5rem'}
          px={'1rem'}
          sx={{
            background: blue,
            display: 'flex',
          }}
          h={'3.5rem'}
        >
          <Modal.Title
            fz={'1.2rem'}
            fw={600}
            sx={{
              color: '#FFFFFF',
            }}
            w='50vw'
            ta='center'
          >
            Train your voice module
          </Modal.Title>
        </Modal.Header>

        <Modal.Body p={0}>
          <VoiceBuilderSection opened={opened} onClose={onClose} />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default VoiceBuilderModal;

export function VoiceBuilderSection(props: {
  opened?: boolean;
  onClose?: () => void;
  archetypeId?: number;
  regenOffset?: number;
}) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [loading, setLoading] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(voiceBuilderMessagesState);

  const [voiceBuilderOnboardingId, setVoiceBuilderOnboardingId] = useState<number>(-1);

  const [count, setCount] = useState(0);
  const interval = useInterval(() => setCount((s) => s + 1), 1000);

  const archetypeId = props.archetypeId ?? useRecoilValue(currentProjectState)?.id;

  const setLatestVoiceOnboarding = async () => {
    if (!archetypeId) return;

    const response = await getVoiceOnboardings(userToken, archetypeId);
    if (response.status === 'success') {
      const onboardings = response.data.sort((a: any, b: any) => {
        return b.id - a.id;
      });
      if (onboardings.length > 0) {
        setVoiceBuilderOnboardingId(onboardings[0].id);

        const detailsResponse = await getVoiceBuilderDetails(userToken, onboardings[0].id);
        if (detailsResponse.status === 'success') {
          if (detailsResponse.data.sample_info.length > 0) {
            // Sort the samples by id
            let details = detailsResponse.data.sample_info.sort((a: any, b: any) => {
              return a.id - b.id;
            });
            setVoiceBuilderMessages(
              details.map((item: any) => {
                return {
                  id: item.id,
                  value: item.sample_completion,
                  prospect: item.prospect,
                  meta_data: item.meta_data,
                  problems: item.sample_problems,
                  highlighted_words: item.highlighted_words,
                };
              })
            );
            return true;
          }
        }
      }
    }
    return false;
  };

  const setNewVoiceOnboarding = async () => {
    if (!archetypeId) return;

    const response = await createVoiceBuilderOnboarding(
      userToken,
      'LINKEDIN',
      `${STARTING_INSTRUCTIONS}`,
      archetypeId
    );
    if (response.status === 'success') {
      setVoiceBuilderOnboardingId(response.data.id);
      await generateMessages(response.data.id);
      return true;
    }
    return false;
  };

  const { isFetching } = useQuery({
    queryKey: [`query-get-voice-onboarding`],
    queryFn: async () => {
      const success = await setLatestVoiceOnboarding();
      if (!success) {
        return await setNewVoiceOnboarding();
      } else {
        return true;
      }
    },
    enabled: props.opened && !!archetypeId,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!props.opened) {
      setCount(0);
      setVoiceBuilderMessages([]);
    }
  }, [props.opened]);

  useEffect(() => {
    if (loading) {
      interval.start();
    } else {
      interval.stop();
    }
  }, [loading]);

  // Generate sample messages
  const generateMessages = async (voiceBuilderOnboardingId: number) => {
    setCount(0);
    setLoading(true);
    // Clone so we don't have to deal with async global state changes bs
    const currentMessages = _.cloneDeep(voiceBuilderMessages);

    // // Delete all samples that are empty
    // for (const message of currentMessages) {
    //   if (message.value === "") {
    //     await deleteSample(userToken, message.id);
    //   } else {
    //     await updateSample(userToken, message.id, message.value);
    //   }
    // }

    // Delete all old samples
    for (const message of currentMessages) {
      await deleteSample(userToken, message.id);
    }

    // Generate new samples
    const response = await generateSamples(userToken, voiceBuilderOnboardingId, MSG_GEN_AMOUNT);

    if (response.status === 'success') {
      // Sort the samples by id
      let details = response.data.sort((a: any, b: any) => {
        return a.id - b.id;
      });
      // Replace global state with only new samples
      setVoiceBuilderMessages(
        details.map((item: any) => {
          return {
            id: item.id,
            value: item.sample_completion,
            prospect: item.prospect,
            meta_data: item.meta_data,
            problems: item.sample_problems,
            highlighted_words: item.highlighted_words,
          };
        })
      );

      // If we didn't get samples, try again
      if (response.data.length === 0) {
        await generateMessages(voiceBuilderOnboardingId);
      }
    }

    if (response?.data?.length > 0) {
      setLoading(false);
    }
  };

  // Finalize voice building and create voice
  const completeVoice = async () => {
    setLoadingOverlay(true);
    // Clone so we don't have to deal with async global state changes bs
    const currentMessages = _.cloneDeep(voiceBuilderMessages);

    // Delete all samples that are empty
    for (const message of currentMessages) {
      if (message.value === '') {
        await deleteSample(userToken, message.id);
      } else {
        await updateSample(userToken, message.id, message.value);
      }
    }

    const response = await createVoice(userToken, voiceBuilderOnboardingId);

    const configId = response.data.id;

    if (true) {
      // Also create and send the first campaign

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await fetch(`${API_URL}/campaigns/instant`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_type: 'LINKEDIN',
          client_archetype_id: archetypeId,
          campaign_start_date: new Date().toISOString(),
          campaign_end_date: nextWeek.toISOString(),
          priority_rating: 10,
          config_id: configId,
          messages: currentMessages
            .filter((m) => m.value.trim())
            .map((message) => {
              return {
                prospect_id: message.prospect?.id,
                message: message.value,
                cta_id: message.meta_data?.cta?.id,
              };
            }),
        }),
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
    }

    setLoadingOverlay(false);
    if (response.status === 'success') {
      queryClient.refetchQueries(['query-voices']);
      props.onClose?.();
    }
  };

  const openCompleteModal = () =>
    openConfirmModal({
      title: (
        <Title order={2} ta='center'>
          Congrats!
        </Title>
      ),
      children: (
        <Stack>
          <Box>
            <Text size='lg' ta='center'>
              You've edited your voice:
            </Text>
            <Text size='lg' fw={700} ta='center'>
              "{userData.sdr_name.trim().split(' ')[0]}'s Voice"
            </Text>
          </Box>
          <Box>
            <Text size='lg' ta='center'>
              The AI will study your samples to mimick your voice.
            </Text>
          </Box>
          <Box>
            <Text size='lg' ta='center'>
              Come back to this module any time to edit.
            </Text>
          </Box>
        </Stack>
      ),
      labels: { confirm: 'Okay', cancel: 'Cancel' },
      onConfirm: async () => {
        await completeVoice();
      },
      onCancel: () => {},
    });

  const borderGray = '#E9ECEF';

  return (
    <Box>
      <Group style={{ position: 'absolute', top: props.regenOffset ?? 10, right: 5 }}>
        <Button
          variant='light'
          color='white'
          radius='xl'
          compact
          leftIcon={<IconRefresh size='1rem' />}
          loading={(isFetching || loading) && voiceBuilderMessages.length > 0}
          onClick={() => {
            generateMessages(voiceBuilderOnboardingId);
          }}
        >
          Regenerate
        </Button>
        <ActionIcon
          variant='outline'
          size={'sm'}
          onClick={props.onClose}
          sx={{ borderColor: borderGray, borderRadius: 999 }}
        >
          <IconX color='#FFFFFF' />
        </ActionIcon>
      </Group>

      {isFetching || loading ? (
        <div style={{ position: 'relative' }}>
          <ScrollArea style={{ position: 'relative', height: 410 }}>
            <Container>
              <Text pt={15} px={2} fz='sm' fw={400}>
                We'll have you edit {MSG_GEN_AMOUNT} sample messages to your style.
              </Text>
              <Divider my='sm' />
            </Container>

            <Container w='100%'>
              {<Loader mx='auto' variant='dots' />}
              <Text color='blue'>Generating messages ...</Text>
              {count > 2 && <Text color='blue'>Researching prospects ...</Text>}
              {count > 3 && <Text color='blue'>Writing sample copy ...</Text>}
              {count > 5 && <Text color='blue'>Applying previous edits ...</Text>}
              {count > 7 && <Text color='blue'>Finalizing messages ...</Text>}
              {count > 9 && <Text color='blue'>Almost there ...</Text>}
              {count > 15 && <Text color='blue'>Making final touches ...</Text>}
            </Container>
            {/* {!loadingMsgGen &&
            voiceBuilderMessages.map((item) => (
              <ItemComponent
                key={item.id}
                id={item.id}
                defaultValue={item.value}
              />
            ))} */}
          </ScrollArea>
        </div>
      ) : (
        <>
          {voiceBuilderMessages.length > 0 && (
            <TrainYourAi
              messages={voiceBuilderMessages.filter((msg) => msg.value)}
              onComplete={async () => {
                openCompleteModal();
              }}
              refreshMessages={setLatestVoiceOnboarding}
            />
          )}
        </>
      )}
    </Box>
  );
}
