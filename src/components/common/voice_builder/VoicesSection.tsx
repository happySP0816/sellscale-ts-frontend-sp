import { userTokenState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import PersonaDetailsPatterns from '@common/persona/details/PersonaDetailsPatterns';
import { API_URL } from '@constants/data';
import { Avatar, Badge, Text, Button, Group, ScrollArea, Select, Table, Title, useMantineTheme } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { valueToColor } from '@utils/general';
import { useRecoilValue } from 'recoil';
import { Archetype } from 'src';

export default function VoicesSection(props: { personas?: Archetype[] }) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-voices`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/message_generation/stack_ranked_configurations`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      return res?.data.sort((a: any, b: any) => (a.priority - b.priority)) ?? [];
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <>
      <Group position='right'>
        <Button
          size='md'
          onClick={() => {
            openContextModal({
              modal: 'voiceBuilder',
              title: <Title order={3}>Voice Builder</Title>,
              innerProps: {
                personas: props.personas,
              },
            });
          }}
        >
          Add Voice
        </Button>
      </Group>

      <ScrollArea>
        <Table verticalSpacing='sm'>
          <thead>
            <tr>
              <th>Priority</th>
              <th>Name</th>
              <th>Persona</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((item: any) => (
              <tr key={item.name}>
                <td>
                  <Avatar size={40} color={valueToColor(theme, item.name)} radius={40}>#{item.priority}</Avatar>
                </td>
                <td>
                  <Group spacing='sm'>
                    <div>
                      <Text fz='sm' fw={500}>
                        {item.name}
                      </Text>
                      <Text fz='xs' c='dimmed'>
                        
                      </Text>
                    </div>
                  </Group>
                </td>

                <td>{item.archetype_id ? `#${item.archetype_id}` : 'N/A'}</td>
                <td>{item.generated_message_type}</td>
                <td>
                  {item.active ? (
                    <Badge fullWidth>Active</Badge>
                  ) : (
                    <Badge color='gray' fullWidth>
                      Disabled
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </>
  );
}
