import {
  Text,
  Paper,
  Textarea,
  Divider,
  Button,
  Card,
  Title,
  Loader,
  Flex,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";
import ProspectSelect from "@common/library/ProspectSelect";
import { API_URL } from "@constants/data";
import { logout } from "@auth/core";
import { useQuery } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";

export default function VoiceEditorModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  persona_id: number;
  voiceId: number;
}>) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-voice`],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/message_generation/stack_ranked_configurations/${innerProps.voiceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      return res;
    },
    refetchOnWindowFocus: false,
  });

  const [prompt, setPrompt] = useState(data?.data?.computed_prompt);
  const [promptChanged, setPromptChanged] = useState(false);
  const [selectedProspectId, setSelectedProspectId]: any = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [generatedSample, setGeneratedSample] = useState("");

  const generateSample = () => {
    setLoadingSample(true);
    setGeneratedSample("");
    showNotification({
      title: "Generating sample...",
      message: "Wait a few seconds while we generate a sample message",
      color: "blue",
      autoClose: 5000,
    });
    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration/generate_completion_for_prospect`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospect_id: selectedProspectId,
          computed_prompt: prompt,
        }),
      }
    )
      .then((res) => {
        const data = res.json();
        return data;
      })
      .then((data) => {
        setGeneratedSample(data?.completion);
        showNotification({
          title: "Sample generated",
          message: "The sample message was generated successfully",
          color: "green",
          autoClose: 5000,
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingSample(false);
      });
  };

  const saveUpdatedPrompt = () => {
    setSavingPrompt(true);
    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration_tool/update_computed_prompt`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_prompt: prompt,
          configuration_id: innerProps.voiceId,
        }),
      }
    )
      .then((res) => {
        if (res.status === 401) {
          logout();
        }
        setPromptChanged(false);
        setSavingPrompt(false);
      })
      .finally(() => {
        setSavingPrompt(false);
        setPromptChanged(false);
        refetch();
        showNotification({
          title: "Prompt updated",
          message: "The prompt was updated successfully",
          color: "green",
          autoClose: 5000,
        });
      });
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <LoadingOverlay visible={loading} />
      <Text>
        This is the raw prompt that will be used to generate LinkedIn messages
        for this voice. You can edit the prompt below then use the 'Simulation'
        section to test this voice on a prospect.
      </Text>

      <Divider mt="md" mb="md" />

      <Textarea
        minRows={15}
        label="Raw Voice Prompt"
        description="This is the raw prompt use by SellScale to generate messages in this voice"
        placeholder="Raw voice prompt..."
        defaultValue={prompt}
        onChange={(e) => {
          setPrompt(e.currentTarget.value);
          setPromptChanged(true);
        }}
      />
      <Button
        color="green"
        mt="sm"
        disabled={!promptChanged}
        onClick={() => {
          saveUpdatedPrompt();
        }}
        loading={savingPrompt}
      >
        Save Prompt
      </Button>

      <Card mt="md" p="md" withBorder>
        <Title order={4}>Simulate Voice</Title>
        <Text>
          Use the simulation section to test this voice on a prospect. You can
          select a persona then hit 'Generate' to see what the message would
          look like.
        </Text>
        <Flex direction="row">
          <Box sx={{ width: "80%" }}>
            <ProspectSelect
              onChange={(prospect) => {
                setSelectedProspectId(prospect?.id);
              }}
              personaId={innerProps.persona_id}
            />
          </Box>
          <Box pt="md">
            <Button
              color="grape"
              mt="xl"
              ml="lg"
              onClick={() => generateSample()}
              disabled={!selectedProspectId}
              loading={loadingSample}
            >
              Generate
            </Button>
          </Box>
        </Flex>

        {generatedSample && (
          <Textarea
            mt="lg"
            minRows={4}
            label="Sample Generated Message"
            description="This is the sample message generated by SellScale using the prompt above."
            placeholder="Sample message..."
            defaultValue={generatedSample}
            contentEditable={false}
          />
        )}
      </Card>
    </Paper>
  );
}
