import {
  Button,
  Flex,
  Paper,
  Textarea,
  Checkbox,
  Loader
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import {useState} from "react";
import createPersonaWithVoice from "@utils/requests/createPersonaWithVoice";
import {showNotification} from "@mantine/notifications";
import {useRecoilState} from "recoil";
import {currentProjectState} from "@atoms/personaAtoms";

export default function CreateCampaignWithVoiceModal({ context, id, innerProps }: ContextModalProps<{ title: string, userToken: string, voice_id: number }>) {
  const [voiceOptions, setVoiceOptions] = useState({
      cta: true,
      voice: true,
      followUp: true,
      personalizers: true,
    }
  )

  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  const [additionalContext, setAdditionalContext] = useState("");

  const [loading, setLoading] = useState(false);

  const onClickCreateCampaign = async () => {
    setLoading(true);
    showNotification({
      title: "Creating Campaign and Generating Voices",
      message: "We are automatically creating your campaign and generating the CTAs and sequences. This might take awhile.",
      color: "orange",
      autoClose: 5000,
    });
    const response = await createPersonaWithVoice(
      innerProps.userToken,
      innerProps.title,
      innerProps.voice_id,
      voiceOptions.cta,
      voiceOptions.voice,
      voiceOptions.followUp,
      additionalContext,
    )

    setLoading(false);

    if (response.status === "error") {
      console.error("Failed to create campaign");
      return;
    }

    showNotification({
      title: "Campaign created!",
      message: "Your campaign has been created successfully.",
      color: "teal",
    });

    if (response.data) {
      window.location.href = `/campaign_v2/${response.data as number}`;
      return response.data as number;

    }

    setCurrentProject(response.data);

    context.closeContextModal(id);

    window.location.reload();

    return response.data as number;
  }

  return (
    <Paper>
      <Flex gap={"md"} mt={"sm"} direction={'column'}>
        <Textarea
          placeholder="Enter additional context here..."
          label="Additional Context"
          description="Enter any additional context for the campaign that we will can use to create the campaign."
          withAsterisk
          required
          onChange={(event) => setAdditionalContext(event.currentTarget.value)}
        />
        <Checkbox checked={voiceOptions.cta}
                  label={'Create with CTAs'}
                  onClick={() => setVoiceOptions({...voiceOptions, cta: !voiceOptions.cta})}
        />
        <Checkbox checked={voiceOptions.voice}
                  label={'Create with Few Shot/Voice'}
                  onClick={() => setVoiceOptions({...voiceOptions, voice: !voiceOptions.voice})}
        />
        <Checkbox checked={voiceOptions.followUp}
                  label={'Create with Follow Up'}
                  onClick={() => setVoiceOptions({...voiceOptions, followUp: !voiceOptions.followUp})}
        />
        <Checkbox checked={voiceOptions.personalizers && false}
                  disabled label={'Create with Personalizers'}
                  onClick={() => setVoiceOptions({...voiceOptions, personalizers: !voiceOptions.personalizers})}
        />
      </Flex>
      <Flex gap={"md"} mt={"lg"}>
        <Button variant="outline" color="gray"
                fullWidth
                disabled={loading}
                onClick={() => context.closeContextModal(id)}>
          Go Back to Create Campaign
        </Button>
        <Button fullWidth
                onClick={() => onClickCreateCampaign()}
                disabled={loading || additionalContext === ""}
        >
          {!loading && "Create Campaign"}
          {loading && <Loader />}
        </Button>
      </Flex>
    </Paper>
  );
}
