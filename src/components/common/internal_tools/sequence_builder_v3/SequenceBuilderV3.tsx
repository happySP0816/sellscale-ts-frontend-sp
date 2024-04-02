import { userTokenState } from '@atoms/userAtoms';
import {
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Stack,
  Tabs,
  TextInput,
  Title,
  Tooltip,
  Text,
  Select,
  Autocomplete,
  Modal,
  Textarea,
  NumberInput,
  LoadingOverlay,
} from '@mantine/core';
import AssetLibraryRetool from '@pages/AssetLibraryRetool';
import { useQuery } from '@tanstack/react-query';
import { generateSequence } from '@utils/requests/generateSequence';
import { getClientArchetypes } from '@utils/requests/getClientArchetypes';
import { getClientSdrAccess } from '@utils/requests/getClientSdrAccess';
import { getClients } from '@utils/requests/getClients';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Archetype, Client } from 'src';

export default function SequenceBuilderV3() {
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [archetypeId, setArchetypeId] = useState<number | null>(null);
  const [openedAssetLibrary, setOpenedAssetLibrary] = useState(false);
  const [sequenceType, setSequenceType] = useState('');
  const [numSteps, setNumSteps] = useState(3);
  const [additionalPrompting, setAdditionalPrompting] = useState('');

  const { data: clients } = useQuery({
    queryKey: [`query-get-clients`],
    queryFn: async () => {
      const result = await getClients(userToken);
      return result.status === 'success'
        ? (result.data as Client[]).sort((a, b) => a.company.localeCompare(b.company))
        : [];
    },
  });

  const { data: archetypes } = useQuery({
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

  const { data: sdrAccessToken } = useQuery({
    queryKey: [`query-get-sdr-access`, { clientId }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { clientId }] = queryKey;
      const result = await getClientSdrAccess(userToken, clientId);
      return result.status === 'success' ? result.data.token : null;
    },
    enabled: !!clientId,
  });

  return (
    <Box p='lg'>
      <LoadingOverlay visible={loading} />
      <Group align='start' grow noWrap>
        <Paper maw='30vw'>
          <Stack h='90vh' p='lg'>
            <Title order={3}>Sequence Builder V3</Title>
            <Autocomplete
              disabled={clients === undefined}
              label='Client'
              placeholder='Clients'
              data={clients?.map((client) => ({ value: client.company })) ?? []}
              onChange={(value) => {
                const client = clients?.find((c) => c.company === value);
                setClientId(client?.id ?? null);
              }}
            />
            <Autocomplete
              disabled={archetypes === undefined}
              label='Campaign'
              placeholder='Campaigns'
              data={
                archetypes?.map((archetype) => ({
                  value: archetype.archetype,
                })) ?? []
              }
              onChange={(value) => {
                const archetype = archetypes?.find((c) => c.archetype === value);
                setArchetypeId(archetype?.id ?? null);
              }}
            />
            <Button
              my={5}
              variant='outline'
              fullWidth
              onClick={() => {
                setOpenedAssetLibrary(true);
              }}
            >
              Open Assets
            </Button>

            <Divider my={5} />

            <Group grow noWrap>
              <Select
                label='Sequence Type'
                placeholder='Type'
                data={[
                  { value: 'LINKEDIN-CTA', label: 'LinkedIn (CTAs)' },
                  { value: 'LINKEDIN-TEMPLATE', label: 'LinkedIn (Templates)' },
                  { value: 'Email', label: 'Email' },
                ]}
                miw={200}
                value={sequenceType}
                onChange={(value) => {
                  setSequenceType(value ?? '');
                }}
              />
              <NumberInput
                placeholder='X Steps'
                label='# Steps'
                hideControls
                value={numSteps}
                onChange={(value) => setNumSteps(value || 0)}
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
                if (!clientId || !archetypeId || !sequenceType || !numSteps) return;

                setLoading(true);
                await generateSequence(
                  userToken,
                  clientId,
                  archetypeId,
                  sequenceType,
                  numSteps,
                  additionalPrompting
                );
                setLoading(false);
              }}
            >
              Generate Sequence
            </Button>
          </Stack>
        </Paper>
        <Box maw='60vw'>
          <Stack h='90vh' p='lg'>
            <Group position='apart' noWrap>
              <Title order={3}>Generated Sequence</Title>
              <Button radius='lg'>Add Sequence</Button>
            </Group>
            <TitleGenerationSection />
            <StepGenerationSection />
          </Stack>
        </Box>
      </Group>
      <Modal
        opened={openedAssetLibrary}
        onClose={() => {
          setOpenedAssetLibrary(false);
        }}
        title='Asset Library'
        size='lg'
      >
        <AssetLibraryRetool authToken={sdrAccessToken} projectId={archetypeId ?? undefined} />
      </Modal>
    </Box>
  );
}

function TitleGenerationSection(props: {}) {
  return (
    <Stack spacing={5}>
      <Title order={5}>CTAs / Subject Lines (2)</Title>
      <Paper p='lg'>dwd</Paper>
    </Stack>
  );
}

function StepGenerationSection(props: {}) {
  return (
    <Paper p='lg'>
      <Tabs variant='pills' defaultValue='gallery'>
        <Tabs.List>
          <Tabs.Tab value='gallery'>Step 1 (3)</Tabs.Tab>
          <Tabs.Tab value='messages'>Step 2 (0)</Tabs.Tab>
          <Tabs.Tab value='settings'>Step 3 (2)</Tabs.Tab>
        </Tabs.List>
        <Divider my={5} />

        <Tabs.Panel value='gallery'>Gallery tab content</Tabs.Panel>

        <Tabs.Panel value='messages'>Messages tab content</Tabs.Panel>

        <Tabs.Panel value='settings'>Settings tab content</Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
