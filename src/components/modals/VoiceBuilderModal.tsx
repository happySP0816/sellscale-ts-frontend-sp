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
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import { IconUser } from "@tabler/icons";
import VoiceBuilderFlow from "@common/voice_builder/VoiceBuilderFlow";
import { createVoiceBuilderOnboarding } from "@utils/requests/voiceBuilder";
import { currentProjectState } from "@atoms/personaAtoms";

export const STARTING_INSTRUCTIONS = `Follow instructions to generate a short intro message:
- If mentioning title, colloquialize it (i.e. make Vice President -> VP)
- If they are a Doctor or Physician, refer to them by Dr. title (followed by last name)
- Ensure that you mention key personalized elements
- Tie in the sentences together to make sure it's cohesive
- Smoothly embed the call-to-action into the end of message.
- Include a friendly greeting in the beginning.`;
export const MSG_GEN_AMOUNT = 6;
export const MAX_EDITING_PHASES = 3;

export default function VoiceBuilderModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const currentProject = useRecoilValue(currentProjectState);

  const [
    voiceBuilderOnboardingId,
    setVoiceBuilderOnboardingId,
  ] = useState<number>(-1);

  useEffect(() => {
    if (!currentProject) return;
    (async () => {
      setLoading(true);
      const response = await createVoiceBuilderOnboarding(
        userToken,
        "LINKEDIN",
        `${STARTING_INSTRUCTIONS}`,
        currentProject.id
      );
      if (response.status === "success") {
        setVoiceBuilderOnboardingId(response.data.id);
      }
      setLoading(false);
    })();
  }, [currentProject]);

  // persona exists, voice builder onboarding id exists, has CTAs, and more than 4 samples
  const canBuildVoice =
    currentProject &&
    voiceBuilderOnboardingId !== -1;
    // && currentProject.ctas.length >= 2
    

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <LoadingOverlay visible={loading} />
      {loading && (
        <Skeleton height={500}>
        </Skeleton>
      )}

      {canBuildVoice && (
        <VoiceBuilderFlow
          persona={currentProject}
          voiceBuilderOnboardingId={voiceBuilderOnboardingId}
        />
      )}
      {!canBuildVoice && voiceBuilderOnboardingId !== -1 && (
        <Text color="red" size="sm" mt="sm">
          This persona needs at least 3 CTA in order to build a voice for it.
        </Text>
      )}
    </Paper>
  );
}
