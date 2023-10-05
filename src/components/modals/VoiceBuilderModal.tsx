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
} from "@mantine/core";
import {
  ContextModalProps,
  openConfirmModal,
  openContextModal,
} from "@mantine/modals";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import { IconRefresh, IconUser } from "@tabler/icons";
import {
  createVoice,
  createVoiceBuilderOnboarding,
  deleteSample,
  generateSamples,
  getVoiceBuilderDetails,
  getVoiceOnboardings,
  updateSample,
} from "@utils/requests/voiceBuilder";
import { currentProjectState } from "@atoms/personaAtoms";

export const STARTING_INSTRUCTIONS = `Follow instructions to generate a short intro message:
- If mentioning title, colloquialize it (i.e. make Vice President -> VP)
- If they are a Doctor or Physician, refer to them by Dr. title (followed by last name)
- Ensure that you mention key personalized elements
- Tie in the sentences together to make sure it's cohesive
- Smoothly embed the call-to-action into the end of message.
- Include a friendly greeting in the beginning.`;
export const MSG_GEN_AMOUNT = 6;
// export const MAX_EDITING_PHASES = 3;

import { Modal, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { voiceBuilderMessagesState } from "@atoms/voiceAtoms";
import { logout } from "@auth/core";
import TrainYourAi from "@common/voice_builder/TrainYourAi";
import { API_URL } from "@constants/data";
import { count } from "console";
import _ from "lodash";
import { useInterval } from "@mantine/hooks";

const VoiceBuilderModal: React.FC<{
  opened: boolean;
  close: () => void;
}> = ({ opened, close }) => {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [loading, setLoading] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(
    voiceBuilderMessagesState
  );

  const [voiceBuilderOnboardingId, setVoiceBuilderOnboardingId] =
    useState<number>(-1);

  const [count, setCount] = useState(0);
  const interval = useInterval(() => setCount((s) => s + 1), 1000);

  const currentProject = useRecoilValue(currentProjectState);

  const setLatestVoiceOnboarding = async () => {
    if (!currentProject) return;

    const response = await getVoiceOnboardings(userToken, currentProject.id);
    if (response.status === "success") {
      const onboardings = response.data.sort((a: any, b: any) => {
        return b.id - a.id;
      });
      if (onboardings.length > 0) {
        setVoiceBuilderOnboardingId(onboardings[0].id);

        const detailsResponse = await getVoiceBuilderDetails(
          userToken,
          onboardings[0].id
        );
        if (detailsResponse.status === "success") {
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
                  highlighted_words: item.highlighted_words
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
    if (!currentProject) return;

    const response = await createVoiceBuilderOnboarding(
      userToken,
      "LINKEDIN",
      `${STARTING_INSTRUCTIONS}`,
      currentProject.id
    );
    if (response.status === "success") {
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
    enabled: opened && !!currentProject,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if(!opened) {
      setCount(0);
      setVoiceBuilderMessages([]);
    }
  }, [opened]);

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
    const response = await generateSamples(
      userToken,
      voiceBuilderOnboardingId,
      MSG_GEN_AMOUNT
    );

    if (response.status === "success") {
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
            highlighted_words: item.highlighted_words
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
      if (message.value === "") {
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_type: "LINKEDIN",
          client_archetype_id: currentProject?.id,
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
    if (response.status === "success") {
      queryClient.refetchQueries(["query-voices"]);
      close();
    }
  };

  const openCompleteModal = () =>
    openConfirmModal({
      title: (
        <Title order={2} ta="center">
          Congrats!
        </Title>
      ),
      children: (
        <Stack>
          <Box>
            <Text size="lg" ta="center">
              You've edited your voice:
            </Text>
            <Text size="lg" fw={700} ta="center">
              "{userData.sdr_name.split(" ")[0]}'s Voice"
            </Text>
          </Box>
          <Box>
            <Text size="lg" ta="center">
              The AI will study your samples to mimick your voice.
            </Text>
          </Box>
          <Box>
            <Text size="lg" ta="center">
              Come back to this module any time to edit.
            </Text>
          </Box>
        </Stack>
      ),
      labels: { confirm: "Create", cancel: "Cancel" },
      onConfirm: async () => {
        await completeVoice();
      },
      onCancel: () => {},
    });

  const borderGray = "#E9ECEF";
  const blue = "#228be6";

  return (
    <Modal.Root opened={opened} onClose={close} fullScreen closeOnClickOutside>
      <Modal.Overlay blur={3} color="gray.2" opacity={0.5} />
      <Modal.Content sx={{ borderRadius: "8px", overflow: "hidden" }}>
        <Modal.Header
          md-px={"1.5rem"}
          px={"1rem"}
          sx={{
            background: blue,
            display: "flex",
          }}
          h={"3.5rem"}
        >
          <Modal.Title
            fz={"1.2rem"}
            fw={600}
            sx={{
              color: "#FFFFFF",
            }}
            w="50vw"
            ta="center"
          >
            Train your voice module
          </Modal.Title>
          <Group>
            <Button variant="light" color="white" radius="xl" compact leftIcon={<IconRefresh size='1rem' />}
              loading={(isFetching || loading) && voiceBuilderMessages.length > 0}
              onClick={() => {
                generateMessages(voiceBuilderOnboardingId);
              }}
            >
              Regenerate
            </Button>
            <ActionIcon
              variant="outline"
              size={"sm"}
              onClick={close}
              sx={{ borderColor: borderGray, borderRadius: 999 }}
            >
              <IconX color="#FFFFFF" />
            </ActionIcon>
          </Group>
        </Modal.Header>

        <Modal.Body p={0}>
          {isFetching || loading ? (
            <div style={{ position: "relative" }}>
              <ScrollArea style={{ position: "relative", height: 410 }}>
                <Container>
                  <Text pt={15} px={2} fz="sm" fw={400}>
                    We'll have you edit {MSG_GEN_AMOUNT} sample messages to your style.
                  </Text>
                  <Divider my="sm" />
                </Container>

                <Container w="100%">
                  {<Loader mx="auto" variant="dots" />}
                  <Text color="blue">Generating messages ...</Text>
                  {count > 2 && (
                    <Text color="blue">Researching prospects ...</Text>
                  )}
                  {count > 3 && (
                    <Text color="blue">Writing sample copy ...</Text>
                  )}
                  {count > 5 && (
                    <Text color="blue">Applying previous edits ...</Text>
                  )}
                  {count > 7 && (
                    <Text color="blue">Finalizing messages ...</Text>
                  )}
                  {count > 9 && <Text color="blue">Almost there ...</Text>}
                  {count > 15 && (
                    <Text color="blue">Making final touches ...</Text>
                  )}
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
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default VoiceBuilderModal;
