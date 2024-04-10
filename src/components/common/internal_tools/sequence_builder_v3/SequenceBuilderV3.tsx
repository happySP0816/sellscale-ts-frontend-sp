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
  Loader,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import AssetLibraryRetool from '@pages/AssetLibraryRetool';
import { useQuery } from '@tanstack/react-query';
import { addSequence, generateSequence } from '@utils/requests/generateSequence';
import { getClientArchetypes } from '@utils/requests/getClientArchetypes';
import { getClientSdrAccess } from '@utils/requests/getClientSdrAccess';
import { getClients } from '@utils/requests/getClients';
import _, { set } from 'lodash';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilValue } from 'recoil';
import { Archetype, Client } from 'src';

const EXAMPLE_COUNT = 1;

export default function SequenceBuilderV3() {
  const userToken = useRecoilValue(userTokenState);

  const [selectedData, setSelectedData] = useState<SelectedData>({
    subject_lines: [],
    steps: [],
  });

  const [loading, setLoading] = useState(false);
  const [bigLoading, setBigLoading] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [archetypeId, setArchetypeId] = useState<number | null>(null);
  const [openedAssetLibrary, setOpenedAssetLibrary] = useState(false);
  const [sequenceType, setSequenceType] = useState('EMAIL');
  const [numSteps, setNumSteps] = useState(3);
  const [additionalPrompting, setAdditionalPrompting] = useState('');

  const onAddSequence = async () => {
    if (!clientId || !archetypeId || !sequenceType) return;

    setBigLoading(true);
    const result = await addSequence(
      userToken,
      clientId,
      archetypeId,
      sequenceType,
      selectedData.subject_lines,
      selectedData.steps
    );
    setBigLoading(false);

    showNotification({
      title: result.status === 'success' ? 'Success' : 'Error',
      message: result.status === 'success' ? 'Added sequence to campaign' : 'Failed to add',
      color: result.status === 'success' ? 'teal' : 'red',
    });
  };

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
      <LoadingOverlay visible={bigLoading} />
      <Group align='start' grow noWrap>
        <Paper maw='30vw' style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Stack h='90vh' p='lg'>
            <Title order={3}>Sequence Builder V3</Title>
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
                  setResults([]);
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

                for (let i = 0; i < EXAMPLE_COUNT; i++) {
                  for (let j = 0; j < numSteps; j++) {
                    generateSequence(
                      userToken,
                      clientId,
                      archetypeId,
                      sequenceType,
                      j + 1,
                      additionalPrompting
                    )
                      .then((response) => {
                        if (response.status === 'success') {
                          const data = response.data as MessageResult[];
                          setResults((prev) => [...prev, ...data]);
                        } else {
                          showNotification({
                            title: 'Error',
                            message: response.message,
                            color: 'red',
                          });
                          setLoading(false);
                        }

                        // Finish loading
                        if (i === EXAMPLE_COUNT - 1 && j === numSteps - 1) {
                          setLoading(false);
                        }
                      })
                      .catch(() => {
                        setLoading(false);
                      });
                  }
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
              <Button
                radius='lg'
                onClick={async () => {
                  modals.openConfirmModal({
                    title: 'Override Sequence',
                    children: (
                      <Text size='sm'>
                        Are you sure you want to override the current sequence with the selected
                        options?
                      </Text>
                    ),
                    labels: { confirm: 'Confirm', cancel: 'Cancel' },
                    onCancel: () => {},
                    onConfirm: async () => await onAddSequence(),
                  });
                }}
              >
                Add Sequence
              </Button>
            </Group>
            {sequenceType !== 'LINKEDIN-TEMPLATE' && (
              <TitleGenerationSection
                isCTAs={sequenceType === 'LINKEDIN-CTA'}
                results={results}
                onClick={(text, assets, remove) => {
                  if (remove) {
                    setSelectedData((prev) => ({
                      ...prev,
                      subject_lines: prev.subject_lines.filter((s) => s.text !== text),
                    }));
                  } else {
                    setSelectedData((prev) => ({
                      ...prev,
                      subject_lines: [
                        ...prev.subject_lines,
                        {
                          text,
                          assets,
                        },
                      ],
                    }));
                  }
                }}
                selectedData={selectedData}
              />
            )}
            <StepGenerationSection
              isCTAs={sequenceType === 'LINKEDIN-CTA'}
              results={results}
              onClick={(step_num, text, assets, remove) => {
                if (remove) {
                  setSelectedData((prev) => ({
                    ...prev,
                    steps: prev.steps.filter((s) => s.text !== text),
                  }));
                } else {
                  setSelectedData((prev) => ({
                    ...prev,
                    steps: [
                      ...prev.steps,
                      {
                        step_num,
                        text,
                        assets,
                      },
                    ],
                  }));
                }
              }}
              selectedData={selectedData}
            />
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

function TitleGenerationSection(props: {
  isCTAs: boolean;
  results: MessageResult[];
  onClick: (text: string, assets: number[], remove: boolean) => void;
  selectedData: SelectedData;
}) {
  const subjects = props.results
    .map((message) =>
      message.result.map((m) => ({
        subject: props.isCTAs ? m.message : m.subject,
        assets: message.assets,
      }))
    )
    .flat()
    .filter((s) => s.subject.trim());

  return (
    <Stack spacing={5}>
      <Title order={5}>
        {props.isCTAs ? 'CTAs' : 'Subject Lines'} ({subjects.length})
      </Title>
      <Paper p='lg'>
        <ScrollArea h={200}>
          {subjects.map((subject, index) => (
            <Group key={index} py={5} noWrap>
              <Textarea w='100%' m='auto' readOnly autosize>
                {subject.subject}
              </Textarea>
              <Box>
                <Button
                  w={200}
                  variant={
                    props.selectedData.subject_lines.find((s) => s.text === subject.subject)
                      ? 'filled'
                      : 'outline'
                  }
                  onClick={() => {
                    props.onClick(
                      subject.subject,
                      subject.assets.map((a) => a.id),
                      !!props.selectedData.subject_lines.find((s) => s.text === subject.subject)
                    );
                  }}
                >
                  {props.selectedData.subject_lines.find((s) => s.text === subject.subject)
                    ? 'Selected'
                    : 'Use'}
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
  }[];
  step_num: number;
}

interface Asset {
  id: number;
  tag: string;
  title: string;
  value: string;
}

interface SelectedData {
  subject_lines: { text: string; assets: number[] }[];
  steps: { step_num: number; text: string; assets: number[] }[];
}

function StepGenerationSection(props: {
  isCTAs: boolean;
  results: MessageResult[];
  onClick: (step_num: number, text: string, assets: number[], remove: boolean) => void;
  selectedData: SelectedData;
}) {
  const steps = _.groupBy(props.results, (r) => r.step_num);

  return (
    <Paper p='lg'>
      <Tabs variant='pills' defaultValue={props.isCTAs ? 'step-2' : 'step-1'}>
        <Tabs.List>
          {Object.keys(steps)
            .filter((step_num) => (props.isCTAs ? step_num !== '1' : true))
            .map((step_num, index) => (
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
                        <Button
                          w={200}
                          variant={
                            props.selectedData.steps.find((s) => s.text === msg.message)
                              ? 'filled'
                              : 'outline'
                          }
                          onClick={() => {
                            props.onClick(
                              message.step_num,
                              msg.message,
                              message.assets.map((a) => a.id),
                              !!props.selectedData.steps.find((s) => s.text === msg.message)
                            );
                          }}
                        >
                          {props.selectedData.steps.find((s) => s.text === msg.message)
                            ? 'Selected'
                            : 'Use'}
                        </Button>
                        <Text fs='italic' fz='sm'>
                          {msg.angle}
                        </Text>
                        <Group>
                          {message.assets.map((asset, index) => (
                            <HoverCard width={280} shadow='md' openDelay={500}>
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

                      <Paper withBorder px={10} w={400}>
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
