import { currentProjectState } from '@atoms/personaAtoms';
import { prospectDrawerOpenState } from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import PersonaDetailsPatterns from "@common/persona/details/PersonaDetailsPatterns";
import { API_URL } from "@constants/data";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";
import {
  Avatar,
  Badge,
  Text,
  Button,
  Group,
  ScrollArea,
  Select,
  Table,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconPencil } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { valueToColor } from "@utils/general";
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src";

export default function VoicesSection(props: { personas?: Archetype[] }) {
  const theme = useMantineTheme();
  const [searchParams] = useSearchParams();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const prospectDrawerOpened = useRecoilValue(prospectDrawerOpenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-voices`],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/message_generation/stack_ranked_configurations` + (currentProject?.id ? `?archetype_id=${currentProject?.id}` : ``) ,
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
      return res?.data.sort((a: any, b: any) => a.priority - b.priority) ?? [];
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const create = searchParams.get('create');
    if(create){
      openContextModal({
        modal: "voiceBuilder",
        title: <Title order={3}>Voice Builder</Title>,
        innerProps: { },
      });
    }
  }, []);

  return (
    <>
      <Group position="right">
        <Button
          size="md"
          onClick={() => {
            openContextModal({
              modal: "voiceBuilder",
              title: <Title order={3}>Voice Builder</Title>,
              innerProps: { },
            });
          }}
        >
          Add New Voice
        </Button>
      </Group>

      <ScrollArea>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Name</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item: any) => (
                <tr key={item.name}>
                  <td>
                    <Avatar
                      size={40}
                      color={valueToColor(theme, item.name)}
                      radius={40}
                    >
                      #{item.priority}
                    </Avatar>
                  </td>
                  <td>
                    <Group spacing="sm">
                      <div>
                        <Text fz="sm" fw={500}>
                          {item.name}
                        </Text>
                        <Text fz="xs" c="dimmed"></Text>
                      </div>
                    </Group>
                  </td>

                  <td>
                    <Badge
                      color={
                        item.generated_message_type == "LINKEDIN"
                          ? "blue"
                          : "orange"
                      }
                    >
                      {item.generated_message_type}
                    </Badge>
                  </td>
                  <td>
                    {item.active ? (
                      <Badge fullWidth color="green">
                        Active
                      </Badge>
                    ) : (
                      <Badge color="gray">Disabled</Badge>
                    )}
                  </td>
                  <td>
                    <Button
                      color="grape"
                      rightIcon={<IconPencil size="0.9rem" />}
                      onClick={() => {
                        openContextModal({
                          modal: "voiceEditor",
                          title: <Title order={3}>Voice Editor</Title>,
                          innerProps: {
                            persona_id: item.archetype_id,
                            voiceId: item.id,
                          },
                        });
                      }}
                    >
                      Edit Voice
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ScrollArea>
      {prospectDrawerOpened && <ProspectDetailsDrawer zIndex={1000} />}
    </>
  );
}
