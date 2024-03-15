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
  Switch,
  Tooltip,
} from '@mantine/core';
import { ContextModalProps, openConfirmModal } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { Archetype } from 'src';
import ProspectSelect from '@common/library/ProspectSelect';
import { API_URL } from '@constants/data';
import { logout } from '@auth/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import { setDatasets } from 'react-chartjs-2/dist/utils';
import {
  IconAlertCircle,
  IconBrandOnedrive,
  IconChartTreemap,
  IconTool,
  IconTrash,
} from '@tabler/icons';
import { IconChartBubble } from '@tabler/icons-react';
import { AiMetaDataBadge } from '@common/persona/LinkedInConversationEntry';

function metaDataFromPrompt(prompt: string) {
  let s = prompt.split('>notes: ')[1].replace('<>response:', '');
  let s_parts = s.split(/\\n/gm);

  const cta = s_parts[s_parts.length - 1].substring(1).trim();
  const research = s
    .replace(cta, '')
    .trim()
    .split(/\\n/gm)
    .map((s) => (s.charAt(0) == '-' ? s.substring(1).trim() : s.substring(0).trim()))
    .filter((s) => s.length > 0);

  return {
    research,
    cta,
  };
}

export default function VoiceEditorModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  persona_id: number;
  voiceId: number;
}>) {
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  const [promptChanged, setPromptChanged] = useState(false);
  const [selectedProspectId, setSelectedProspectId]: any = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [generatedSample, setGeneratedSample] = useState('');

  const [fetchedPromptData, setFetchedPromptData] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [stackRankedConfigurationData, setStackRankedConfigurationData] = useState<any>({});

  const [randomFlag, setRandomFlag] = useState(false);

  const [editViewMode, setEditViewMode] = useState('advanced');

  const [stackRankedConfigurationDataChanged, setStackRankedConfigurationDataChanged] =
    useState(false);

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!fetchedPromptData) {
      fetchPromptData();
    }
  }, []);

  const updateActive = (active: boolean) => {
    fetch(`${API_URL}/message_generation/stack_ranked_configuration_tool/set_active`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        configuration_id: innerProps.voiceId,
        set_active: active,
      }),
    }).then((res) => {
      queryClient.invalidateQueries({
        queryKey: [`query-voices`],
      });
      fetchPromptData();
    });
  };

  const fetchPromptData = () => {
    setIsFetching(true);

    const response = fetch(
      `${API_URL}/message_generation/stack_ranked_configurations/${innerProps.voiceId}`,
      {
        method: 'GET',
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
        setEnabled(j.data?.active);
        setStackRankedConfigurationData(j.data);
        setPrompt(j.data?.computed_prompt);
        if (j.data?.prompt_1) {
          setEditViewMode('edit_voice');
        }
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const generateSample = () => {
    setLoadingSample(true);
    setGeneratedSample('');
    showNotification({
      title: 'Generating sample...',
      message: 'Wait a few seconds while we generate a sample message',
      color: 'blue',
      autoClose: 5000,
    });
    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration/generate_completion_for_prospect`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
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
          title: 'Sample generated',
          message: 'The sample message was generated successfully',
          color: 'green',
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
    fetch(`${API_URL}/message_generation/stack_ranked_configuration_tool/update_computed_prompt`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_prompt: prompt,
        configuration_id: innerProps.voiceId,
      }),
    })
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
          title: 'Prompt updated',
          message: 'The prompt was updated successfully',
          color: 'green',
          autoClose: 5000,
        });
      });
  };

  const deleteStackRankedSample = (
    promptToDelete: string,
    completionToDelete: string,
    stackRankedConfigurationId: number
  ) => {
    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer ' + userToken);
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      prompt_to_delete: promptToDelete,
      completion_to_delete: completionToDelete,
      stack_ranked_configuration_id: stackRankedConfigurationId,
    });

    var requestOptions: any = {
      method: 'DELETE',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch(`${API_URL}/message_generation/stack_ranked_config/delete_sample`, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))
      .finally(() => {
        fetchPromptData();
        showNotification({
          title: 'Sample Deleted',
          message: 'The sample was deleted successfully',
          color: 'green',
          autoClose: 5000,
        });
      });
  };

  const saveStackRankedConfigurationData = () => {
    setSavingPrompt(true);

    fetch(
      `${API_URL}/message_generation/stack_ranked_configuration_tool/update_stack_ranked_configuration_data`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuration_id: innerProps.voiceId,
          instruction: stackRankedConfigurationData?.instruction,
          completion_1: stackRankedConfigurationData?.completion_1,
          completion_2: stackRankedConfigurationData?.completion_2,
          completion_3: stackRankedConfigurationData?.completion_3,
          completion_4: stackRankedConfigurationData?.completion_4,
          completion_5: stackRankedConfigurationData?.completion_5,
          completion_6: stackRankedConfigurationData?.completion_6,
          completion_7: stackRankedConfigurationData?.completion_7,
        }),
      }
    )
      .then((res) => {
        if (res.status === 401) {
          logout();
        }
        setStackRankedConfigurationDataChanged(false);
        setSavingPrompt(false);
      })
      .finally(() => {
        setSavingPrompt(false);
        setStackRankedConfigurationDataChanged(false);
        showNotification({
          title: 'Voice Saved',
          message: 'Your updated voice was saved successfully',
          color: 'green',
          autoClose: 5000,
        });
        fetchPromptData();
      });
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
      }}
    >
      <LoadingOverlay visible={isFetching} />

      <Card mt='md' p='md' withBorder sx={{ border: 'solid 2px #BF55EC !important' }}>
        <Title order={4}>Simulate Voice</Title>
        <Text>
          Use the simulation section to test this voice on a prospect. You can select a persona then
          hit 'Generate' to see what the message would look like.
        </Text>
        <Divider mt='xs' sx={{ opacity: 0.3 }} />
        <Flex direction='row' mt='xs'>
          <Container
            sx={{ width: '100%', flexDirection: 'row', display: 'flex', justifyContent: 'center' }}
          >
            <ProspectSelect
              onChange={(prospect) => {
                setSelectedProspectId(prospect?.id);
              }}
              personaId={innerProps.persona_id}
            />
            <Button
              color='grape'
              size='xs'
              ml='xs'
              // ml="lg"
              onClick={() => generateSample()}
              disabled={!selectedProspectId}
              loading={loadingSample}
            >
              Generate Sample Message
            </Button>
          </Container>
        </Flex>

        {generatedSample && (
          <Textarea
            mt='lg'
            minRows={4}
            label='Sample Generated Message'
            description='This is the sample message generated by SellScale using the prompt above.'
            placeholder='Sample message...'
            defaultValue={generatedSample}
            contentEditable={false}
          />
        )}
      </Card>

      <Title mt='md' order={4}>
        Edit Voice Samples
      </Title>

      <Text mt='xs'>
        Edit the samples and instructions below to change how messages are generated in this voice.
      </Text>

      {true && ( // !stackRankedConfigurationData?.name?.includes('Baseline')
        <Box pt='sm' sx={{ flexDirection: 'row', display: 'flex' }}>
          <Switch
            label='Active'
            checked={enabled}
            mt='xs'
            onChange={(event) => {
              updateActive(event.currentTarget.checked);
            }}
          />
          <Button
            color='green'
            ml='auto'
            disabled={!stackRankedConfigurationDataChanged}
            onClick={() => {
              setStackRankedConfigurationDataChanged(false);
              saveStackRankedConfigurationData();
            }}
            loading={savingPrompt}
          >
            Save Configuration
          </Button>
        </Box>
      )}

      <Divider mt='md' mb='md' />
      <Tabs value={editViewMode}>
        <Tabs.List>
          {editViewMode === 'edit_voice' && (
            <Tabs.Tab value='edit_voice' icon={<IconChartBubble size='0.8rem' />}>
              Edit Voice Instruction & Samples
            </Tabs.Tab>
          )}
          {editViewMode === 'advanced' && (
            <Tabs.Tab value='advanced' icon={<IconTool size='0.8rem' />}>
              Advanced Edit Mode
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value='edit_voice' pt='xs'>
          <Flex direction='row'>
            <Textarea
              w='40%'
              minRows={21}
              label='Instruction'
              description='This is the instruction that will be used to generate messages in this voice'
              defaultValue={stackRankedConfigurationData?.instruction?.replace(
                'Follow instructions to generate a short intro message:\n',
                ''
              )}
              size='xs'
              onChange={(e) => {
                setStackRankedConfigurationDataChanged(true);

                if (stackRankedConfigurationData?.instruction) {
                  stackRankedConfigurationData.instruction =
                    'Follow instructions to generate a short intro message:\n' +
                    e.currentTarget.value;
                  setStackRankedConfigurationData(stackRankedConfigurationData);
                }
              }}
            />
            <Card sx={{ maxHeight: '450px', overflowY: 'scroll', width: '60%' }} m='sm' withBorder>
              <Text>Completions</Text>
              <Text size='xs'>
                These are the completions that will be used to generate messages in this voice. Edit
                the completions below to change how messages are generated.
              </Text>
              {[1, 2, 3, 4, 5, 6, 7].map((i, index) => {
                const promptKey = 'prompt_' + i;
                const completionKey = 'completion_' + i;

                if (!stackRankedConfigurationData[promptKey]) {
                  return null;
                }

                const meta_data = metaDataFromPrompt(stackRankedConfigurationData[promptKey]);

                return (
                  <Box w='100%'>
                    <AiMetaDataBadge
                      location={{ position: 'relative', top: 35, left: 70 }}
                      bumpFrameworkId={0}
                      bumpFrameworkTitle={''}
                      bumpFrameworkDescription={''}
                      bumpFrameworkLength={''}
                      bumpNumberConverted={undefined}
                      bumpNumberUsed={undefined}
                      accountResearchPoints={meta_data.research || []}
                      initialMessageId={-1}
                      initialMessageCTAId={0}
                      initialMessageCTAText={meta_data.cta || ''}
                      initialMessageResearchPoints={meta_data.research || []}
                      initialMessageStackRankedConfigID={undefined}
                      initialMessageStackRankedConfigName={'Baseline Linkedin'}
                      cta={meta_data.cta || ''}
                    />
                    <Tooltip label='Remove this sample from voice.'>
                      <Button
                        size='xs'
                        variant='subtle'
                        sx={{
                          position: 'relative',
                          top: 38,
                          left: 70,
                        }}
                        onClick={() => {
                          openConfirmModal({
                            title: 'Delete this sample?',
                            children: (
                              <Text>
                                Are you sure you want to delete this sample? This will remove it
                                from the voice and it will no longer be used to generate messages.
                              </Text>
                            ),
                            labels: { confirm: 'Confirm', cancel: 'Cancel' },
                            onCancel: () => {},
                            onConfirm: () => {
                              deleteStackRankedSample(
                                promptKey,
                                completionKey,
                                stackRankedConfigurationData.id
                              );
                            },
                          });
                        }}
                      >
                        <IconTrash size='0.8rem' />
                      </Button>
                    </Tooltip>
                    <Textarea
                      w='100%'
                      icon={<IconChartTreemap size='0.8rem' />}
                      minRows={5}
                      mt='sm'
                      size='xs'
                      label={`Sample ${index + 1}`}
                      placeholder='Raw voice prompt...'
                      defaultValue={stackRankedConfigurationData[completionKey]}
                      onChange={(e) => {
                        setStackRankedConfigurationDataChanged(true);

                        stackRankedConfigurationData[completionKey] = e.currentTarget.value;
                        setStackRankedConfigurationData(stackRankedConfigurationData);

                        setRandomFlag(!randomFlag);
                      }}
                      error={
                        stackRankedConfigurationData[completionKey].length > 300
                          ? 'Completion is too long. Please shorten it to 300 characters or less.'
                          : null
                      }
                    />
                    <Text
                      size='xs'
                      mt='xs'
                      align='right'
                      color={
                        stackRankedConfigurationData[completionKey].length > 300 ? 'red' : 'gray'
                      }
                    >
                      {stackRankedConfigurationData[completionKey]?.length} / 300
                    </Text>
                  </Box>
                );
              })}
            </Card>
          </Flex>
        </Tabs.Panel>

        <Tabs.Panel value='advanced' pt='xs'>
          <Card withBorder>
            <Card withBorder mb='xs'>
              <IconAlertCircle size='1.2rem' color='red' />
              <Text color='red' weight={700} size='xs'>
                WARNING: This voice was made using the old voice builder so it will need to be
                edited using the raw prompt. Please contact a SellScale engineer if you need help
                fixing this voice.
              </Text>
            </Card>
            <Textarea
              minRows={15}
              label='Raw Voice Prompt'
              description='This is the raw prompt use by SellScale to generate messages in this voice'
              placeholder='Raw voice prompt...'
              value={prompt}
              onChange={(e) => {
                setPrompt(e.currentTarget.value);
                setPromptChanged(true);
              }}
            />
            <Button
              color='green'
              mt='sm'
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
    </Paper>
  );
}
