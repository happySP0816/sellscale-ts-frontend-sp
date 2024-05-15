import { userTokenState } from '@atoms/userAtoms';
import LoadingStream from '@common/library/LoadingStream';
import {
  Box,
  Title,
  Text,
  LoadingOverlay,
  Group,
  Paper,
  Stack,
  Autocomplete,
  Loader,
  Button,
  Divider,
  Select,
  NumberInput,
  Textarea,
  ScrollArea,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { generateSequence, generateSequencePiece } from '@utils/requests/generateSequence';
import { getClientArchetypes } from '@utils/requests/getClientArchetypes';
import { getClients } from '@utils/requests/getClients';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Client, Archetype } from 'src';

export default function SequenceStreaming() {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);
  const [bigLoading, setBigLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [archetypeId, setArchetypeId] = useState<number | null>(null);

  const [genId, setGenId] = useState('');
  const [result, setResult] = useState('');
  const [sequenceType, setSequenceType] = useState('EMAIL');
  const [additionalPrompting, setAdditionalPrompting] = useState('');

  const { data: clients, isFetching: isFetchingClients } = useQuery({
    queryKey: [`query-get-clients`],
    queryFn: async () => {
      const result = await getClients(userToken);
      return result.status === 'success'
        ? (result.data as Client[]).sort((a, b) => a.company.localeCompare(b.company))
        : [];
    },
  });

  const { data: archetypes, isFetching: isFetchingCampaigns } = useQuery({
    queryKey: [`query-get-archetypes`, { clientId }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { clientId }] = queryKey;
      const result = await getClientArchetypes(userToken, clientId);
      return result.status === 'success'
        ? (result.data as Archetype[]).sort((a, b) => a.archetype.localeCompare(b.archetype))
        : [];
    },
    enabled: !!clientId,
  });

  return (
    <Box p='lg'>
      <LoadingOverlay visible={bigLoading} />
      <Group align='start' grow noWrap>
        <Paper maw='30vw' style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Stack h='90vh' p='lg'>
            <Title order={3}>Sequence Streamer</Title>
            <Autocomplete
              disabled={clients === undefined}
              label={
                <Group position='apart'>
                  <Text>Client</Text>
                  {clients === undefined && isFetchingClients && (
                    <Loader variant='dots' size='xs' />
                  )}
                </Group>
              }
              placeholder='Clients'
              data={clients?.map((client) => ({ value: client.company })) ?? []}
              onChange={(value) => {
                const client = clients?.find((c) => c.company === value);
                setClientId(client?.id ?? null);
              }}
            />
            <Autocomplete
              disabled={archetypes === undefined}
              label={
                <Group position='apart'>
                  <Text>Campaigns</Text>
                  {archetypes === undefined && isFetchingCampaigns && (
                    <Loader variant='dots' size='xs' />
                  )}
                </Group>
              }
              placeholder='Campaigns'
              data={
                archetypes?.map((archetype) => ({
                  value: archetype.archetype,
                })) ?? []
              }
              onChange={(value) => {
                const archetype = archetypes?.find((c) => c.archetype === value);
                setArchetypeId(archetype?.id ?? null);
                // @ts-ignore, might be a bug here in the future
                setCurrentProject(archetype);
              }}
            />
            <Divider my={5} />

            <Group grow noWrap>
              <Select
                label='Gen Type'
                placeholder='Type'
                data={[
                  { value: 'LINKEDIN-CTA', label: 'LinkedIn Initial (CTA)' },
                  { value: 'LINKEDIN-TEMPLATE', label: 'LinkedIn Initial (Template)' },
                  { value: 'LINKEDIN-FOLLOWUP', label: 'LinkedIn Follow-Up' },
                  { value: 'EMAIL-INIT', label: 'Email Initial' },
                  { value: 'EMAIL-FOLLOWUP', label: 'Email Follow-Up' },
                ]}
                miw={200}
                value={sequenceType}
                onChange={(value) => {
                  setResult('');
                  setSequenceType(value ?? '');
                }}
              />
            </Group>

            <Textarea
              label='Additional Prompting'
              placeholder='Extra prompt instructions'
              value={additionalPrompting}
              onChange={(e) => setAdditionalPrompting(e.currentTarget.value)}
            />

            <Button
              my={5}
              variant='filled'
              fullWidth
              onClick={async () => {
                setResult('');

                if (!clientId || !archetypeId || !sequenceType) return;

                setLoading(true);

                setGenId(crypto.randomUUID());
                const result = await generateSequencePiece(
                  userToken,
                  clientId,
                  archetypeId,
                  sequenceType,
                  additionalPrompting,
                  genId
                );
                if (result.status === 'success') {
                  setResult(result.data);
                }

                setLoading(false);
              }}
            >
              Generate Sequence
            </Button>
          </Stack>
        </Paper>
        <Box>
          {loading ? (
            <LoadingStream
              event='generate_sequence_piece'
              roomId={genId}
              label='Generating Sequence...'
              h={'90vh'}
            />
          ) : (
            <ScrollArea h={'90vh'}>
              <Textarea value={result} onChange={() => {}} readOnly autosize />
            </ScrollArea>
          )}
        </Box>
      </Group>
    </Box>
  );
}
