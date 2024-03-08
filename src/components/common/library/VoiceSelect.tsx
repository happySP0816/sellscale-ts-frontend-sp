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
        const voice = voices.find((v) => v.active && v.archetype_id && !v.always_enable)
        const baselineVoice = voices.find((v) => v.active && !v.archetype_id && v.always_enable)
        console.log(voices)
        console.log(baselineVoice)
        if (voice) {
          setSelectedVoice(voice);
          props.onChange(voice);
        }
        if (baselineVoice) {
          setBaselineVoice(baselineVoice);
          props.onChange(baselineVoice);
        }
      }
      return voices;
    },
    refetchOnWindowFocus: false,
  });
  const voices = data ?? [];

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

  return (
    <>
      <ModalSelector
        selector={{
          content: (
            <>
              <Text>
                {selectedVoice
                  ? `Using ${_.truncate(
                      userData.sdr_name.trim().split(" ")[0]
                    )}'s Voice`
                  : baselineVoice ? `Using Baseline Voice` : `Train Voice`}
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
                title: <Title order={3}>Voice Editor: {selectedVoice.name}</Title>,
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
                      <Text fz="sm" fw={500}>
                        {`${voice.name} (#${voice.id})`}
                      </Text>
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
                      voice.always_enable ? "blue" : icpFitToColor(voice.icp_fit)
                    }
                    sx={{
                      display: voice.always_enable ? "inline-block" : "none",
                    }}
                    size='sm'
                    mt='4px'
                  >
                    {voice.always_enable ? "Baseline Voice" : ""}
                  </Badge>
                </Box>
                <Tooltip label={voice.always_enable ? "Since this is a baseline voice, it cannot be disabled." : "This voice is only active for this persona."} withinPortal>
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
