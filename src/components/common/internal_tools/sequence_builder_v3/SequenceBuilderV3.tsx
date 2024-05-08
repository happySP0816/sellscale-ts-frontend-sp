import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import CTAGenerator from '@common/sequence/CTAGenerator';
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
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilState, useRecoilValue } from 'recoil';
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
  const [_currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  const [openedAssetLibrary, setOpenedAssetLibrary] = useState(false);
  const [sequenceType, setSequenceType] = useState('EMAIL');
  const [numSteps, setNumSteps] = useState(3);
  const [additionalPrompting, setAdditionalPrompting] = useState('');

  const totalGenerated = useRef(0);

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
                // @ts-ignore, might be a bug here in the future
                setCurrentProject(archetype);
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
                setResults([]);

                if (!clientId || !archetypeId || !sequenceType || !numSteps) return;

                setLoading(true);

                for (let i = 0; i < EXAMPLE_COUNT; i++) {
                  for (let j = 0; j < numSteps; j++) {
                    await generateSequence(
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
                          setResults((prev) => [
                            ...prev,
                            ...data.map((m) => {
                              return m;
                            }),
                          ]);
                        } else {
                          showNotification({
                            title: 'Error',
                            message: response.message,
                            color: 'red',
                          });
                          setLoading(false);
                        }

                        totalGenerated.current += 1;

                        showNotification({
                          title: 'Success',
                          message: 'Successfully generated step #' + (j + 1),
                          color: 'teal',
                        });

                        if (totalGenerated.current === EXAMPLE_COUNT * numSteps) {
                          showNotification({
                            title: 'Success',
                            message: 'Successfully generated sequence',
                            color: 'teal',
                          });
                          setLoading(false);
                          totalGenerated.current = 0;
                        }
                      })
                      .catch((e) => {
                        showNotification({
                          title: 'Error',
                          message: `Failed to generate sequence: ${e}`,
                          color: 'red',
                        });
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
                    title: 'Add to Sequence',
                    children: (
                      <Text size='sm'>
                        Are you sure you want to add to the current sequence with the selected
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
                onClick={(text, assets, remove, uuid) => {
                  if (remove) {
                    setSelectedData((prev) => ({
                      ...prev,
                      subject_lines: prev.subject_lines.filter((s) => s.uuid !== uuid),
                    }));
                  } else {
                    setSelectedData((prev) => ({
                      ...prev,
                      subject_lines: [
                        ...prev.subject_lines,
                        {
                          text,
                          assets,
                          uuid,
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
              onClick={(step_num, text, assets, remove, uuid, angle) => {
                if (remove) {
                  setSelectedData((prev) => ({
                    ...prev,
                    steps: prev.steps.filter((s) => s.uuid !== uuid),
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
                        uuid,
                        angle,
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
        title={<Title order={3}>Asset Library</Title>}
        size='70dvw'
      >
        <AssetLibraryRetool authToken={sdrAccessToken} projectId={archetypeId ?? undefined} />
      </Modal>
    </Box>
  );
}

function TitleGenerationSection(props: {
  isCTAs: boolean;
  results: MessageResult[];
  onClick: (text: string, assets: number[], remove: boolean, uuid: string) => void;
  selectedData: SelectedData;
}) {
  const subjects = props.results
    .map((message) =>
      message.result.map((m) => ({
        subject: props.isCTAs ? m.message : m.subject,
        assets: m.asset_ids
          .map((id) => message.assets.find((a) => a.id == id))
          .filter((a) => a) as Asset[],
        uuid: m.uuid,
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
          {props.isCTAs ? (
            <CTAGenerator />
          ) : (
            <>
              {subjects.map((subject, index) => (
                <Group key={index} py={5} noWrap>
                  <Box w='100%'>
                    <Textarea
                      w='100%'
                      m='auto'
                      autosize
                      onChange={(e) => {
                        props.onClick(
                          e.currentTarget.value,
                          subject.assets.map((a) => a.id),
                          true,
                          subject.uuid
                        );
                      }}
                    >
                      {subject.subject}
                    </Textarea>
                    {/* uuid */}
                    <Text color='gray' size='xs'>
                      {subject.uuid}
                    </Text>
                  </Box>
                  <Box>
                    <Button
                      w={200}
                      variant={
                        props.selectedData.subject_lines.find((s) => s.uuid === subject.uuid)
                          ? 'filled'
                          : 'outline'
                      }
                      onClick={() => {
                        props.onClick(
                          subject.subject,
                          subject.assets.map((a) => a.id),
                          !!props.selectedData.subject_lines.find((s) => s.uuid === subject.uuid),
                          subject.uuid
                        );
                      }}
                    >
                      {props.selectedData.subject_lines.find((s) => s.uuid === subject.uuid)
                        ? 'Selected'
                        : 'Use'}
                    </Button>
                  </Box>
                </Group>
              ))}
            </>
          )}
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
    asset_ids: number[];
    uuid: string;
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
  subject_lines: { text: string; assets: number[]; uuid: string }[];
  steps: { step_num: number; text: string; assets: number[]; angle: string; uuid: string }[];
}

function StepGenerationSection(props: {
  isCTAs: boolean;
  results: MessageResult[];
  onClick: (
    step_num: number,
    text: string,
    assets: number[],
    remove: boolean,
    uuid: string,
    angle: string
  ) => void;
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
                            props.selectedData.steps.find((s) => s.uuid === msg.uuid)
                              ? 'filled'
                              : 'outline'
                          }
                          onClick={() => {
                            props.onClick(
                              message.step_num,
                              msg.message,
                              msg.asset_ids,
                              !!props.selectedData.steps.find((s) => s.uuid === msg.uuid),
                              msg.uuid,
                              msg.angle
                            );
                          }}
                        >
                          {props.selectedData.steps.find((s) => s.uuid === msg.uuid)
                            ? 'Selected'
                            : 'Use'}
                        </Button>
                        <Text fs='italic' fz='sm'>
                          {msg.angle}
                        </Text>
                        <Text color='gray' size='xs'>
                          {msg.uuid}
                        </Text>
                        <Group>
                          {msg.asset_ids
                            .map((id) => message.assets.find((a) => a.id == id))
                            .map((asset, index) => (
                              <HoverCard width={280} shadow='md' openDelay={500}>
                                <HoverCard.Target>
                                  <Badge
                                    key={index}
                                    color='blue'
                                    variant='light'
                                    styles={{
                                      root: { textTransform: 'initial' },
                                    }}
                                  >
                                    {asset?.tag} - {asset?.title}
                                  </Badge>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                  <Text size='sm'>{asset?.value}</Text>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            ))}
                        </Group>
                      </Stack>

                      <Paper withBorder px={10} w={400}>
                        <Text fz='sm'>
                          <Textarea
                            w='100%'
                            m='auto'
                            autosize
                            onChange={(e) => {
                              props.onClick(
                                message.step_num,
                                e.currentTarget.value,
                                msg.asset_ids,
                                true,
                                msg.uuid,
                                msg.angle
                              );
                            }}
                          >
                            {msg.message}
                          </Textarea>
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
