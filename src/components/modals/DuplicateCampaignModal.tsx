import { userDataState, userTokenState } from '@atoms/userAtoms';
import {
  Button,
  Text,
  Paper,
  useMantineTheme,
  Box,
  Stack,
  Center,
  Group,
  TextInput,
  Select,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { clonePersona } from '@utils/requests/clonePersona';
import { getClientArchetypes } from '@utils/requests/getClientArchetypes';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Archetype } from 'src';

export default function DuplicateCampaignModal({ context, id, innerProps }: ContextModalProps<{}>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [archetypeId, setArchetypeId] = useState<number>();

  const { data: archetypes, isFetching } = useQuery({
    queryKey: [`query-get-archetypes-for-dupe`],
    queryFn: async () => {
      const result = await getClientArchetypes(userToken, userData?.client?.id);
      return result.status === 'success'
        ? (result.data as Archetype[]).sort((a, b) => a.archetype.localeCompare(b.archetype))
        : [];
    },
    enabled: !!userData?.client?.id,
  });

  const onDuplicateCampaign = async () => {
    const archetype = archetypes?.find((a) => a.id === archetypeId);
    if (!archetype) return;

    setLoading(true);
    const response = await clonePersona(
      userToken,
      archetype.id,
      {
        personaName: name.trim() || archetype.archetype,
        personaFitReason: '',
        personaICPMatchingInstructions: archetype.icp_matching_prompt,
        personaContactObjective: '',
      },
      {
        ctas: true,
        bumpFrameworks: true,
        voices: true,
        emailBlocks: true,
        icpFilters: true,
        emailSteps: true,
        liInitMsg: true,
      }
    );
    setLoading(false);

    if (response.status === 'success') {
      showNotification({
        title: 'Campaign Created',
        message: 'Successfully duplicated campaign',
        color: theme.colors.green[6],
      });
      context.closeAll();
    }
  };

  return (
    <Paper
      p={0}
      h={'20vh'}
      style={{
        position: 'relative',
      }}
    >
      <Stack spacing={10} justify='space-between' h='100%'>
        <Group noWrap grow>
          <TextInput
            label='Name'
            placeholder='Campaign Name'
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Select
            searchable
            withinPortal
            label='Campaign to Duplicate'
            placeholder='Select Campaign'
            data={
              archetypes
                ?.filter((a) => !a.is_unassigned_contact_archetype)
                .map((a) => ({
                  value: `${a.id}`,
                  label: a.archetype,
                })) ?? []
            }
            onChange={(value) => {
              if (!value) return;
              setArchetypeId(parseInt(value));
            }}
          />
        </Group>
        <Button
          loading={isFetching || loading}
          disabled={!archetypeId}
          fullWidth
          onClick={onDuplicateCampaign}
        >
          Duplicate Campaign
        </Button>
      </Stack>
    </Paper>
  );
}
