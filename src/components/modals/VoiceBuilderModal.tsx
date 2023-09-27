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




import { Modal, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

const VoiceBuilderModal: React.FC<{
  opened: boolean;
  close: () => void;
}> = ({ opened, close }) => {

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
            w='50vw'
            ta='center'
          >
            Train your voice module
          </Modal.Title>
          <ActionIcon
            variant="outline"
            size={"sm"}
            onClick={close}
            sx={{ borderColor: borderGray, borderRadius: 999 }}
          >
            <IconX color="#FFFFFF" />
          </ActionIcon>
        </Modal.Header>

        <Modal.Body p={0}>

        <LoadingOverlay visible={loading} />
      {loading && (
        <Skeleton height={500}>
        </Skeleton>
      )}

      {canBuildVoice && (
        <VoiceBuilderFlow
          persona={currentProject}
          voiceBuilderOnboardingId={voiceBuilderOnboardingId}
          createCampaign
          onComplete={() => {
            queryClient.refetchQueries(["query-voices"]);
            close();
          }}
        />
      )}
      {!canBuildVoice && voiceBuilderOnboardingId !== -1 && (
        <Text color="red" size="sm" mt="sm">
          This persona needs at least 3 CTA in order to build a voice for it.
        </Text>
      )}

        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default VoiceBuilderModal;
