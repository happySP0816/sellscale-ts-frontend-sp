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
  Tabs,
  Container,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";
import ProspectSelect from "@common/library/ProspectSelect";
import { API_URL } from "@constants/data";
import { logout } from "@auth/core";
import { useQuery } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";
import { setDatasets } from "react-chartjs-2/dist/utils";
import { IconBrandOnedrive, IconChartTreemap, IconTool } from '@tabler/icons';
import { IconChartBubble } from '@tabler/icons-react';

export default function VoiceEditorModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  persona_id: number;
  voiceId: number;
}>) {
  const userToken = useRecoilValue(userTokenState);

  const [promptChanged, setPromptChanged] = useState(false);
  const [selectedProspectId, setSelectedProspectId]: any = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [generatedSample, setGeneratedSample] = useState("");

  const [fetchedPromptData, setFetchedPromptData] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prompt, setPrompt] = useState("");

  const completionMatchingRegex = /completion: .*/g;
  const matches = prompt.matchAll(completionMatchingRegex);

  var completions = []
  for (var match of matches){
    var completion = match[0].replaceAll("completion: ", "");
    completions.push(completion);
  }

  const instructionMatchingRegex = /^(.*?)\bprompt\b/s
  const instructionMatches = prompt.match(instructionMatchingRegex);
  const instruction = instructionMatches && instructionMatches[1].replaceAll("prompt: ", "");

  console.log("SWAG")
  console.log(completions)
  console.log(instruction)

  useEffect(() => {
    if (!fetchedPromptData) {
      fetchPromptData();
    }
  }, []);

  const fetchPromptData = () => {
    setIsFetching(true);

    const response = fetch(
      `${API_URL}/message_generation/stack_ranked_configurations/${innerProps.voiceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    )
      .then((res) => {
        if (res.status === 401) {
          logout();
        }
        return res.json();
      })
      .then((j) => {
        setPrompt(j.data?.computed_prompt);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

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
      <LoadingOverlay visible={isFetching} />
      <Text>
        This is the raw prompt that will be used to generate LinkedIn messages
        for this voice. You can edit the prompt below then use the 'Simulation'
        section to test this voice on a prospect.
      </Text>

      <Divider mt="md" mb="md" />

    
      <Tabs defaultValue="advanced">
        <Tabs.List>
          <Tabs.Tab value="edit_voice" icon={<IconChartBubble size="0.8rem" />}>Edit Voice Instruction & Samples</Tabs.Tab>
          <Tabs.Tab value="advanced" ml="auto" icon={<IconTool size="0.8rem" />}>Advanced</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="edit_voice" pt="xs">
          <Flex direction='row'>
            <Textarea
                w='40%'
                minRows={21}
                label="Instruction"
                description="This is the instruction that will be used to generate messages in this voice"
                placeholder="Raw voice prompt..."
                defaultValue={instruction || ""}
                size='xs'
                onChange={(e) => {
                  console.log("Instruction changed")
                  
                  if (instruction) { 
                    setPrompt(
                      prompt.replaceAll(instruction, e.currentTarget.value)
                    )
                    console.log(prompt)
                  }
                 
                }}
              />  
              <Card sx={{maxHeight: '450px', overflowY: 'scroll', width: '60%'}} m='sm' withBorder>
                <Text>
                  Completions ({completions.length} total completions)
                </Text>
                <Text size='xs'>
                  These are the completions that will be used to generate messages in this voice.
                  Edit the completions below to change how messages are generated.
                </Text>
                {
                  completions.map((completion, index) => {
                      return (
                        <Textarea
                          w='100%'
                          icon={<IconChartTreemap size="0.8rem" />}
                          minRows={8}
                          mt="sm"
                          size='xs'
                          label={`Sample ${index + 1}`}
                          placeholder="Raw voice prompt..."
                          defaultValue={completion || ""}
                          onChange={(e) => {
                            console.log("Completion changed")
                            console.log("Before: ")
                            console.log(completion)

                            console.log("After: ")
                            console.log(e.currentTarget.value)
                          }}
                          />
                      )
                  })
                }
                
              </Card>
          </Flex>
          
        </Tabs.Panel>

        <Tabs.Panel value="advanced" pt="xs">
          <Card withBorder>
            <Textarea
              minRows={15}
              label="Raw Voice Prompt"
              description="This is the raw prompt use by SellScale to generate messages in this voice"
              placeholder="Raw voice prompt..."
              value={prompt}
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
          </Card>
        </Tabs.Panel>
    
      </Tabs>
     
    

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
