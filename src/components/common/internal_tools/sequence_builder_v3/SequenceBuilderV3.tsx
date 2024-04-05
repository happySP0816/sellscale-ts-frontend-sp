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
  Badge,
  HoverCard,
  ScrollArea,
} from '@mantine/core';
import AssetLibraryRetool from '@pages/AssetLibraryRetool';
import { useQuery } from '@tanstack/react-query';
import { generateSequence } from '@utils/requests/generateSequence';
import { getClientArchetypes } from '@utils/requests/getClientArchetypes';
import { getClientSdrAccess } from '@utils/requests/getClientSdrAccess';
import { getClients } from '@utils/requests/getClients';
import _ from 'lodash';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import { Archetype, Client } from 'src';

const EXAMPLE_COUNT = 1;

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

  const [results, setResults] = useState<MessageResult[]>([]);

  return (
    <Box p='lg'>
      <Group align='start' grow noWrap>
        <Paper maw='30vw' style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
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
                  { value: 'EMAIL', label: 'Email' },
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

                for (let j = 0; j < EXAMPLE_COUNT; j++) {
                  generateSequence(
                    userToken,
                    clientId,
                    archetypeId,
                    sequenceType,
                    numSteps,
                    additionalPrompting
                  ).then((response) => {
                    if (response.status === 'success') {
                      const data = response.data as MessageResult[];
                      setResults(data);
                    }

                    // Finish loading
                    if (j === EXAMPLE_COUNT - 1) setLoading(false);
                  });
                }
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
            <TitleGenerationSection results={results} />
            <StepGenerationSection results={results} />
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

function TitleGenerationSection(props: { results: MessageResult[] }) {
  const subjects = props.results
    .map((message) => message.result.map((m) => m.subject))
    .flat()
    .filter((s) => s.trim());

  const used = false;

  return (
    <Stack spacing={5}>
      <Title order={5}>CTAs / Subject Lines ({subjects.length})</Title>
      <Paper p='lg'>
        <ScrollArea h={200}>
          {subjects.map((subject, index) => (
            <Group key={index} py={5} noWrap>
              <Textarea w='100%' m='auto' readOnly autosize>
                {subject}
              </Textarea>
              <Box>
                <Button w={200} variant={used ? 'filled' : 'outline'}>
                  {used ? 'Used' : 'Use'}
                </Button>
              </Box>
            </Group>
          ))}
        </ScrollArea>
      </Paper>
    </Stack>
  );
}

interface MessageResult {
  assets: Asset[];
  result: {
    angle: string;
    angle_description: string;
    subject: string;
    message: string;
    used?: boolean;
  }[];
  step_num: number;
}

interface Asset {
  id: number;
  tag: string;
  title: string;
  value: string;
}

function StepGenerationSection(props: { results: MessageResult[] }) {
  const steps = _.groupBy(props.results, (r) => r.step_num);

  return (
    <Paper p='lg'>
      <Tabs variant='pills' defaultValue='step-1'>
        <Tabs.List>
          {Object.keys(steps).map((step_num, index) => (
            <Tabs.Tab key={index} value={`step-${step_num}`}>
              Step {step_num}
              {/* {steps[step_num].filter((m) => !m.result.find((mm) => mm.used)).length} /{' '}
              {steps[step_num].length}) */}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Divider my={5} />

        {Object.keys(steps).map((step_num, index) => (
          <Tabs.Panel key={index} value={`step-${step_num}`}>
            <Stack spacing={10}>
              {steps[step_num].map((message, index) => (
                <Stack key={index}>
                  {message.result.map((msg, index) => (
                    <Group key={index} spacing={10} align='start' noWrap>
                      <Stack p={10} w={400}>
                        <Button w={200} variant={msg.used ? 'filled' : 'outline'}>
                          {msg.used ? 'Used' : 'Use'}
                        </Button>
                        <Text fs='italic' fz='sm'>
                          {msg.angle}
                        </Text>
                        <Group>
                          {message.assets.map((asset, index) => (
                            <HoverCard width={280} shadow='md'>
                              <HoverCard.Target>
                                <Badge
                                  key={index}
                                  color='blue'
                                  variant='light'
                                  styles={{ root: { textTransform: 'initial' } }}
                                >
                                  {asset.tag} - {asset.title}
                                </Badge>
                              </HoverCard.Target>
                              <HoverCard.Dropdown>
                                <Text size='sm'>{asset.value}</Text>
                              </HoverCard.Dropdown>
                            </HoverCard>
                          ))}
                        </Group>
                      </Stack>

                      <Paper withBorder px={10}>
                        <Text fz='sm'>
                          <ReactMarkdown>{msg.message}</ReactMarkdown>
                        </Text>
                      </Paper>
                    </Group>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Paper>
  );
}
