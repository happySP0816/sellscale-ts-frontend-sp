import { userTokenState } from "@atoms/userAtoms";
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

export default function VoiceSelect(props: {
  personaId: number;
  onChange: (voice: any | undefined) => void;
  autoSelect?: boolean;
  onFinishLoading?: (voices: any[]) => void;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [selectedVoice, setSelectedVoice] = useState<any>();

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
        const voice = voices.find((v) => v.active && v.archetype_id);
        if (voice) {
          setSelectedVoice(voice);
          props.onChange(voice);
        }
      }
      return voices;
    },
    refetchOnWindowFocus: false,
  });
  const voices = data ?? [];

  return (
    <>
      <ModalSelector
        selector={{
          content: (
            <Text>
              {selectedVoice ? `Using ${_.truncate(selectedVoice.name)}` : "Start Campaign"}
            </Text>
          ),
          buttonProps: {
            variant: "filled",
            color: "indigo",
          },
          onClick: () => {
            if (selectedVoice) {
              openContextModal({
                modal: "voiceEditor",
                title: <Title order={3}>Voice Editor</Title>,
                innerProps: {
                  persona_id: selectedVoice?.archetype_id,
                  voiceId: selectedVoice?.id,
                },
              });
            } else {
              openContextModal({
                modal: "voiceBuilder",
                title: <Title order={3}>Finalize Campaign Voice</Title>,
                innerProps: {},
              });
            }
          },
          noChange: !selectedVoice,
        }}
        title={{
          name: "Select Voice",
          rightSection: (
            <Button
              variant="subtle"
              compact
              onClick={() => {
                openContextModal({
                  modal: "voiceBuilder",
                  title: <Title order={3}>Voice Builder</Title>,
                  innerProps: {},
                });
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
                <td>
                  <Avatar
                    size={40}
                    color={valueToColor(theme, voices.indexOf(voice) + 1 + "")}
                    radius={40}
                  >
                    #{voices.indexOf(voice) + 1}
                  </Avatar>
                </td>
                <td>
                  <Group spacing="sm">
                    <div>
                      <Text fz="sm" fw={500}>
                        {voice.name}
                      </Text>
                      <Text fz="xs" c="dimmed"></Text>
                    </div>
                  </Group>
                </td>
                {/* <td>
                    <Button
                      color="grape"
                      rightIcon={<IconPencil size="0.9rem" />}
                      onClick={() => {
                        openContextModal({
                          modal: "voiceEditor",
                          title: <Title order={3}>Voice Editor</Title>,
                          innerProps: {
                            persona_id: voice.archetype_id,
                            voiceId: voice.id,
                          },
                        });
                      }}
                    >
                      Edit Voice
                    </Button>
                  </td> */}
              </tr>
            ),
            rightSection: (
              <Group noWrap>
                <Box>
                  <Badge
                    color={
                      voice.generated_message_type == "LINKEDIN"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {voice.generated_message_type}
                  </Badge>
                </Box>
                <Box>
                  {voice.active ? (
                    <Badge fullWidth color="green">
                      Active
                    </Badge>
                  ) : (
                    <Badge color="gray">Disabled</Badge>
                  )}
                </Box>
              </Group>
            ),
            onClick: () => {
              setSelectedVoice(voice);
              props.onChange(voice);
            },
          };
        })}
      />
    </>
  );
}
