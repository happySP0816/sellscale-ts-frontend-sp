import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  createStyles,
  useMantineTheme,
  Text,
  Flex,
  Badge,
  Select,
  Loader,
  Card,
  Box,
  LoadingOverlay,
  TextInput,
  Title,
  Avatar,
  Button,
  Group,
  Menu,
  Switch,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { valueToColor } from "@utils/general";
import { getArchetypeProspects } from "@utils/requests/getArchetypeProspects";
import { useState, useEffect, forwardRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ProspectShallow } from "src";
import ModalSelector from "./ModalSelector";
import {
  ICPFitPillOnly,
  icpFitToColor,
} from "@common/pipeline/ICPFitAndReason";
import {
  IconCopy,
  IconPencil,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useDebouncedState } from "@mantine/hooks";
import _ from "lodash";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";
import {
  prospectDrawerOpenState,
  prospectDrawerIdState,
} from "@atoms/prospectAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { currentProjectState } from "@atoms/personaAtoms";
import { useQuery } from "@tanstack/react-query";
import { openContextModal } from "@mantine/modals";
import VoiceBuilderModal from "@modals/VoiceBuilderModal";
import { IconCheck, IconX } from "@tabler/icons";
import postEditStackRankedConfigurationName from "@utils/requests/postEditStackRankedConfigurationName";
import { showNotification } from "@mantine/notifications";

interface VoiceName {
  id: number,
  name: string,
  editingName: boolean,
}

export interface Voices {
  id: number,
  name: string,
  full_name: string,
  created_at: string,
  always_enable: boolean,
  icp_fit: number,
  active: boolean,
  voice_builder_onboarding_id: number,
}

export default function VoiceSelect(props: {
  personaId: number;
  onChange: (voice: any | undefined) => void;
  autoSelect?: boolean;
  onFinishLoading?: (voices: any[]) => void;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);
  const [selectedVoice, setSelectedVoice] = useState<any>();
  const [baselineVoice, setBaselineVoice] = useState<any>();

  const [voiceBuilderOpen, setVoiceBuilderOpen] = useState(false);

  const [voicesNames, setVoicesNames] = useState<VoiceName[]>( []);

  const triggerEditVoiceNameWrapper = async (voice_id: number) => {
    const voice = voicesNames.find(voice => voice.id === voice_id);

    if (voice) {
      const success = await triggerEditVoiceName(voice.id, voice.name);
      if (success) {
        setVoicesNames(prevState => {
          return prevState.map(item => {
            if (item.id === voice_id) {
              return {...item, editingName: false}
            }

            return item;
          })
        });
      }
    }
  }

  const setName = function (voice_id: number, name: string) {
    setVoicesNames(prevState => {
      return prevState.map(item => {
        if (item.id === voice_id) {
          return {...item, name: name}
        }

        return {...item};
      })
    })
  }

  const setEditingName = function (voice_id: number, editingName: boolean) {
    setVoicesNames(prevState => {
      return prevState.map(item => {
        if (item.id === voice_id) {
          return {...item, editingName: editingName}
        }

        return {...item};
      })
    })
  }


  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-voices`],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/message_generation/stack_ranked_configurations` +
          (currentProject?.id ? `?archetype_id=${currentProject?.id}` : ``),
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
      const voices = (res?.data.sort(
        (a: any, b: any) => b.priority - a.priority
      ) ?? []) as any[];
      props.onFinishLoading && props.onFinishLoading(voices);
      if (props.autoSelect) {
        const voice = voices.find(
          (v) => v.active && v.archetype_id && !v.always_enable
        );
        const baselineVoice = voices.find(
          (v) => v.active && !v.archetype_id && v.always_enable
        );
        console.log(voices);
        console.log(baselineVoice);
        if (voice) {
          setSelectedVoice(voice);
          props.onChange(voice);
        }
        if (baselineVoice) {
          setBaselineVoice(baselineVoice);
          props.onChange(baselineVoice);
        }
      }
      return voices as Voices[];
    },
    refetchOnWindowFocus: false,
  });
  const voices = data ?? [];

  useEffect(() => {
    if (data) {
      const newArray: VoiceName[] = []
      data.forEach(item => {
        newArray.push({id: item.id, name: item.name, editingName: false});
      })

      setVoicesNames(newArray);
    }
  }, [data]);

  const updateActive = async (voiceId: number, active: boolean) => {
    return await fetch(
      `${API_URL}/message_generation/stack_ranked_configuration_tool/set_active`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configuration_id: voiceId,
          set_active: active,
        }),
      }
    );
  };

  const triggerEditVoiceName = async (voiceId: number, name: string) => {
    const result = await postEditStackRankedConfigurationName(
      userToken,
      voiceId,
      name
    );
    if (result.status === "success") {
      refetch();
      showNotification({
        title: "Success",
        message: "Voice name updated successfully.",
      });
    }

    return result.status === "success";
  };

  return (
    <>
      <ModalSelector
        selector={{
          content: (
            <>
              <Text>
                {selectedVoice
                  ? `${selectedVoice.name}`
                  : baselineVoice
                  ? `Using Baseline Voice`
                  : `Train Voice`}
              </Text>
            </>
          ),
          buttonProps: {
            variant: "filled",
            color: "indigo",
          },
          onClick: () => {
            if (selectedVoice) {
              openContextModal({
                modal: "voiceEditor",
                title: (
                  <Title order={3}>Voice Editor: {selectedVoice.name}</Title>
                ),
                innerProps: {
                  persona_id: selectedVoice?.archetype_id,
                  voiceId: selectedVoice?.id,
                },
              });
            } else {
              setVoiceBuilderOpen(true);
            }
          },
          noChange: !selectedVoice && !baselineVoice,
        }}
        title={{
          name: "Select Voice",
          rightSection: (
            <Button
              variant="subtle"
              compact
              onClick={() => {
                setVoiceBuilderOpen(true);
              }}
            >
              New Voice
            </Button>
          ),
        }}
        size={600}
        loading={isFetching}
        activeItemId={selectedVoice?.id}
        items={voices.map((voice) => {
          const voiceName = voicesNames.find(item => item.id === voice.id);
          const editing_name = voiceName?.editingName;
          const edited_name = voiceName?.name;

          return {
            id: voice.id,
            name: voice.full_name,
            content: (
              <tr key={voice.name}>
                {/* <td>
                  <Avatar
                    size={40}
                    color={valueToColor(theme, voices.indexOf(voice) + 1 + "")}
                    radius={40}
                  >
                    #{voices.indexOf(voice) + 1}
                  </Avatar>
                </td> */}
                <td>
                  <Group spacing="sm">
                    <div>
                      <Flex direction="row" align="center">
                        {editing_name ? (
                          <Flex>
                            <TextInput
                              size="xs"
                              defaultValue={voice.name}
                              w="200px"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={(e) => {
                                setName(voice.id, e.currentTarget.value);
                              }}
                            />
                            <ActionIcon
                              size="sm"
                              ml="4px"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerEditVoiceNameWrapper(voice.id);
                              }}
                            >
                              <IconCheck
                                size="1rem"
                                color={
                                  theme.colors.teal[theme.fn.primaryShade()]
                                }
                                stroke={3}
                              />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              ml="4px"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingName(voice.id, false);
                                setName(voice.id, voice.name);
                              }}
                            >
                              <IconX
                                size="1rem"
                                color={
                                  theme.colors.red[theme.fn.primaryShade()]
                                }
                                stroke={3}
                              />
                            </ActionIcon>
                          </Flex>
                        ) : (
                          <>
                            <Text fz="sm" fw={500}>
                              {voice.name}
                            </Text>
                            <ActionIcon
                              variant="subtle"
                              size="sm"
                              ml="2px"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingName(voice.id, true);
                              }}
                            >
                              <IconPencil size={12} />
                            </ActionIcon>
                          </>
                        )}
                      </Flex>

                      <Text fz="xs" c="dimmed">
                        {new Date(voice.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        ) ?? "Unknown Date"}
                      </Text>
                    </div>
                  </Group>
                </td>
              </tr>
            ),
            rightSection: (
              <Group noWrap>
                <Box>
                  <Badge
                    color={
                      voice.always_enable
                        ? "blue"
                        : icpFitToColor(voice.icp_fit)
                    }
                    sx={{
                      display: voice.always_enable ? "inline-block" : "none",
                    }}
                    size="sm"
                    mt="4px"
                  >
                    {voice.always_enable ? "Baseline Voice" : ""}
                  </Badge>
                </Box>
                <Tooltip
                  label={
                    voice.always_enable
                      ? "Since this is a baseline voice, it cannot be disabled."
                      : "This voice is only active for this persona."
                  }
                  withinPortal
                >
                  <Switch
                    onLabel="ON"
                    offLabel="OFF"
                    disabled={voice.always_enable}
                    checked={voice.active}
                    onChange={async (event) => {
                      for (let v of voices) {
                        if (v.active) {
                          await updateActive(v.id, false);
                        }
                      }

                      await updateActive(voice.id, !voice.active);
                      refetch();
                    }}
                  />
                </Tooltip>
              </Group>
            ),
            onClick: () => {
              setSelectedVoice(voice);
              props.onChange(voice);
            },
          };
        })}
      />
      <VoiceBuilderModal
        opened={voiceBuilderOpen}
        onClose={() => {
          setVoiceBuilderOpen(false);
        }}
      />
    </>
  );
}
