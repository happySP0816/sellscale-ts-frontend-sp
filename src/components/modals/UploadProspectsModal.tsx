import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Avatar,
  Stack,
  Select,
  Collapse,
  Divider,
  Container,
  Center,
  ActionIcon,
  TextInput,
  Flex,
  Textarea,
  FocusTrap,
  LoadingOverlay,
  Tabs,
  NumberInput,
  SegmentedControl,
  Box,
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropzone, DropzoneProps, MIME_TYPES } from '@mantine/dropzone';
import {
  IconUpload,
  IconX,
  IconTrashX,
  IconFileDescription,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconUsers,
  IconSettings,
} from '@tabler/icons';
import { DataTable } from 'mantine-datatable';
import FileDropAndPreview from './upload-prospects/FileDropAndPreview';
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import { Archetype, MsgResponse } from 'src';
import ComingSoonCard from '@common/library/ComingSoonCard';
import { API_URL } from '@constants/data';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import displayNotification from '@utils/notificationFlow';
import CreatePersona from '@common/persona/CreatePersona';
import { getSinglePersona } from '@utils/requests/getPersonas';
import { set } from 'lodash';

export default function UploadProspectsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ mode: 'ADD-ONLY' | 'ADD-CREATE' | 'CREATE-ONLY' }>) {
  const theme = useMantineTheme();
  const userData = useRecoilValue(userDataState);
  const [personas, setPersonas] = useState<{ value: string; label: string; group: string | undefined }[]>([]);
  const defaultPersonas = useRef<{ value: string; label: string; group: string | undefined }[]>([]);
  const [createdPersona, setCreatedPersona] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const [openedCTAs, setOpenedCTAs] = useState(false);
  const [newCTAText, setNewCTAText] = useState('');
  const addCTAInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [ctas, setCTAs] = useState<{ id: number; cta: string }[]>([]);

  const [advancedOpened, setAdvancedOpened] = useState(false);

  const [description, setDescription] = useState('');
  const [fitReason, setFitReason] = useState('');
  const [icpMatchingPrompt, setICPMatchingPrompt] = useState('Describe your persona here ...');

  const [contactObjective, setContactObjective] = useState('Set up a discovery call in order to identify a pain point');

  const [personaContractSize, setPersonaContractSize] = useState(userData.client.contract_size);
  const [templateMode, setTemplateMode] = useState<string>('template');

  const addNewCTA = () => {
    if (newCTAText.length > 0) {
      const cta = {
        id: ctas.length > 0 ? ctas[ctas.length - 1].id + 1 : 0,
        cta: newCTAText,
      };
      setCTAs((current) => [...current, cta]);
      setNewCTAText('');
    }
  };
  const deleteCTA = (id: number) => {
    setCTAs((current) => current.filter((cta) => cta.id !== id));
  };
  const editCTA = (id: number) => {
    setNewCTAText(ctas.filter((cta) => cta.id === id)[0].cta);
    deleteCTA(id);
    addCTAInputRef.current?.focus();
  };

  const [loadingPersonaBuyReasonGeneration, setLoadingPersonaBuyReasonGeneration] = useState(false);
  const generatePersonaBuyReason = async (): Promise<MsgResponse> => {
    setLoadingPersonaBuyReasonGeneration(true);
    const res = await fetch(`${API_URL}/client/archetype/generate_persona_buy_reason`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona_name: createdPersona,
      }),
    })
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: 'success',
            title: 'Success',
            message: 'Persona buying reason generated successfully',
            data: await r.json(),
          };
        } else {
          return {
            status: 'error',
            title: `Error (${r.status})`,
            message: 'Failed to generate persona buying reason',
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: 'error',
          title: 'Error',
          message: e.message,
          data: {},
        };
      });
    setLoadingPersonaBuyReasonGeneration(false);
    setFitReason(res.data.description);
    return res as MsgResponse;
  };

  const [loadingICPMatchingPromptGeneration, setLoadingICPMatchingPromptGeneration] = useState(false);
  const generateICPMatchingPrompt = async (): Promise<MsgResponse> => {
    setLoadingICPMatchingPromptGeneration(true);
    const res = await fetch(`${API_URL}/client/archetype/generate_persona_icp_matching_prompt`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona_name: selectedPersona,
        persona_buy_reason: fitReason,
      }),
    })
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: 'success',
            title: 'Success',
            message: 'ICP matching prompt generated successfully',
            data: await r.json(),
          };
        } else {
          return {
            status: 'error',
            title: `Error (${r.status})`,
            message: 'Failed to generate ICP matching prompt',
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: 'error',
          title: 'Error',
          message: e.message,
          data: {},
        };
      });
    setLoadingICPMatchingPromptGeneration(false);
    setICPMatchingPrompt(res.data.description);
    return res as MsgResponse;
  };

  const userToken = useRecoilValue(userTokenState);
  // Fetch personas
  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-personas-active-data`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/client/archetype/get_archetypes`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.archetypes) {
        return [];
      }

      // Sort alphabetically by archetype (name)
      return (res.archetypes as Archetype[])
        .sort((a, b) => {
          if (a.active && !b.active) {
            return -1;
          } else if (!a.active && b.active) {
            return 1;
          } else {
            return a.archetype.localeCompare(b.archetype);
          }
        })
        .filter((persona) => persona.active);
    },
    refetchOnWindowFocus: false,
  });
  // After fetch, set default personas and set personas if they haven't been set yet
  if (data && (innerProps.mode === 'ADD-ONLY' || innerProps.mode === 'ADD-CREATE')) {
    defaultPersonas.current = data.map((persona) => ({
      value: persona.id + '',
      label: persona.archetype,
      group: undefined, //persona.active ? "Active" : "Inactive",
    }));
  }
  useEffect(() => {
    if (personas.length === 0 && defaultPersonas.current.length > 0) {
      setPersonas(defaultPersonas.current);
      setSelectedPersona(defaultPersonas.current[0].value);
    }
  }, [defaultPersonas.current]);

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      }}
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      <Stack spacing='xl'>
        {!isFetching && (
          <>
            {innerProps.mode === 'CREATE-ONLY' ? (
              <TextInput
                placeholder='eg. C-Suite Sales Leaders in tech companies'
                label='Descriptive Name'
                value={createdPersona}
                required
                onChange={(e) => setCreatedPersona(e.currentTarget.value)}
              />
            ) : (
              <Select
                label={'Set Persona'}
                defaultValue={
                  defaultPersonas.current.length === 1 ||
                  (defaultPersonas.current.length > 1 &&
                    defaultPersonas.current[0].group === 'Active' &&
                    defaultPersonas.current[1].group === 'Inactive')
                    ? defaultPersonas.current[0].value
                    : undefined
                }
                data={personas}
                placeholder={
                  innerProps.mode === 'ADD-ONLY'
                    ? 'Select a persona for the prospects'
                    : 'Select or create a persona for the prospects'
                }
                nothingFound={'Nothing found'}
                icon={<IconUsers size={14} />}
                searchable
                creatable={innerProps.mode === 'ADD-CREATE'}
                clearable
                getCreateLabel={(query) => (
                  <>
                    <span style={{ fontWeight: 700 }}>New Persona: </span>
                    {query}
                  </>
                )}
                onCreate={(query) => {
                  // value = ID if selected, name if created
                  const item = { value: query, label: query, group: undefined }; // group: "Active"
                  setPersonas((current) => [...current, item]);
                  setCreatedPersona(query);
                  return item;
                }}
                onChange={(value) => {
                  // If created persona exists and is one of the existing personas, clear it
                  if (
                    createdPersona.length > 0 &&
                    personas.filter((personas) => personas.value === value).length > 0
                  ) {
                    setPersonas(defaultPersonas.current);
                    setCreatedPersona('');
                  }
                  setSelectedPersona(value);
                }}
              />
            )}
          </>
        )}

        {innerProps.mode === 'CREATE-ONLY' && (
          <Stack spacing={10}>
            <Divider
              my={0}
              labelPosition='center'
              color='gray'
              label={
                <Button
                  variant={advancedOpened ? 'light' : 'subtle'}
                  rightIcon={<IconSettings size='1rem' />}
                  onClick={() => {
                    setAdvancedOpened((prev) => !prev);
                  }}
                  compact
                  color='gray'
                >
                  Advanced
                </Button>
              }
            />
            <Collapse in={advancedOpened}>
              <Stack spacing={10}>
                <TextAreaWithAI
                  withAsterisk
                  value={fitReason}
                  onChange={(e) => setFitReason(e.target.value)}
                  placeholder='The AI will use this reasoning to reach out to prospects and explain why they are a good fit for your product.'
                  label='Why would this persona buy your product?'
                  description='This information is used by the AI to construct value prop messages'
                  loadingAIGenerate={loadingPersonaBuyReasonGeneration}
                  onAIGenerateClicked={async () => {
                    await displayNotification(
                      'generate-persona-buy-reason',
                      generatePersonaBuyReason,
                      {
                        title: 'Generating persona fit reason...',
                        message: 'This may take a few seconds.',
                        color: 'teal',
                      },
                      {
                        title: 'Persona fit reason generated!',
                        message: 'Your persona fit reason has been generated.',
                        color: 'teal',
                      },
                      {
                        title: 'Failed to generate persona fit reason',
                        message: 'Please try again or contact SellScale team.',
                        color: 'red',
                      }
                    );
                  }}
                />
                {/* {false && (
                  <TextAreaWithAI
                    withAsterisk
                    value={
                      icpMatchingPrompt ||
                      'Role(s): \nSeniority: \nLocations: \nOther Notes:\n-\n-\n-\nTiers:\n- VERY HIGH FIT: \n- HIGH FIT: \n- MEDIUM FIT: \n- LOW FIT: \n- VERY LOW FIT:'
                    }
                    onChange={(e) => setICPMatchingPrompt(e.target.value)}
                    description='Describe the roles, seniority, location, tiers, and other notes to rank prospects in this persona.'
                    minRows={4}
                    label='Describe how you want to rank the prospects in this persona.'
                    loadingAIGenerate={loadingICPMatchingPromptGeneration}
                    onAIGenerateClicked={async () => {
                      await displayNotification(
                        'generate-icp-matching-prompt',
                        generateICPMatchingPrompt,
                        {
                          title: 'Generating ICP matching prompt...',
                          message: 'This may take a few seconds.',
                          color: 'teal',
                        },
                        {
                          title: 'ICP matching prompt generated!',
                          message: 'Your persona fit reason has been generated.',
                          color: 'teal',
                        },
                        {
                          title: 'Failed to generate ICP matching prompt',
                          message: 'Please try again or contact SellScale team.',
                          color: 'red',
                        }
                      );
                    }}
                  />
                )} */}
                <Textarea
                  withAsterisk
                  value={contactObjective}
                  label='Contact Objective'
                  description='Describe the objective of the outreach.'
                  placeholder='To get a demo scheduled with the goal of potentially integrating our product into their workflow.'
                  onChange={(e) => setContactObjective(e.target.value)}
                />

                <Box>
                  <Text fz='sm' fw={500}>Gen Mode</Text>
                  <SegmentedControl
                    value={templateMode}
                    onChange={setTemplateMode}
                    data={[
                      { label: 'CTA-based', value: 'cta' },
                      { label: 'Template-based', value: 'template' },
                    ]}
                  />
                </Box>

                <NumberInput
                  label='Annual Contract Value (ACV)'
                  value={personaContractSize}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value))
                      ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                      : '$ '
                  }
                  onChange={(value) => {
                    setPersonaContractSize(value || 0);
                  }}
                />

                <FileDropAndPreview
                  personaId={createdPersona.length > 0 ? null : selectedPersona}
                  createPersona={
                    createdPersona.length > 0
                      ? {
                          name: createdPersona,
                          ctas: ctas.map((cta) => cta.cta),
                          description: description,
                          fitReason: fitReason,
                          icpMatchingPrompt: icpMatchingPrompt,
                          contactObjective: contactObjective,
                          contractSize: personaContractSize,
                        }
                      : undefined
                  }
                  onUploadSuccess={async (archetypeId) => {
                    //const response = await getSinglePersona(userToken, archetypeId);
                    window.location.reload();
                  }}
                />
              </Stack>
            </Collapse>
          </Stack>
        )}

        <CreatePersona
          createPersona={{
            name: createdPersona,
            ctas: ctas.map((cta) => cta.cta),
            fitReason: fitReason,
            icpMatchingPrompt: icpMatchingPrompt,
            contactObjective: contactObjective,
            contractSize: personaContractSize,
            templateMode: templateMode === 'template',
          }}
        />

        {/* {createdPersona.length > 0 &&
          false && ( // TODO: Re-enable?
            <Container mx={2} my={0} p={0}>
              <Text
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => setOpenedCTAs((prev) => !prev)}
              >
                <Text fw={500} size='sm'>
                  Call-to-Actions (CTAs)
                </Text>
                {openedCTAs ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
              </Text>
              <Divider mb={0} />
              <Collapse in={openedCTAs}>
                <Text c='dimmed' fz='xs'>
                  If a LinkedIn message is generated using this persona, one of your CTAs will be randomly selected and
                  added to the end of the message.
                </Text>
                {ctas.length > 0 && (
                  <DataTable
                    highlightOnHover
                    columns={[
                      {
                        accessor: 'cta',
                        title: '',
                      },
                      {
                        accessor: 'id',
                        title: '',
                        render: ({ id }) => (
                          <Group position='right' spacing={0}>
                            <ActionIcon color='blue' variant='transparent' onClick={() => editCTA(id)}>
                              <IconPencil size={18} />
                            </ActionIcon>
                            <ActionIcon color='red' variant='transparent' onClick={() => deleteCTA(id)}>
                              <IconTrashX size={18} />
                            </ActionIcon>
                          </Group>
                        ),
                      },
                    ]}
                    records={ctas}
                  />
                )}
                <Divider my={0} />
                <Flex justify='center' align='center'>
                  <div style={{ flex: '5 0 0' }}>
                    <Textarea
                      pl={8}
                      variant='unstyled'
                      placeholder='Write a new CTA'
                      autosize
                      minRows={1}
                      ref={addCTAInputRef}
                      onChange={(e) => setNewCTAText(e.currentTarget.value)}
                      value={newCTAText}
                    />
                  </div>
                  <Center style={{ flex: '1 0 0' }}>
                    <ActionIcon sx={{ flex: '1 0 0' }} color='green' variant='transparent' onClick={addNewCTA}>
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Center>
                </Flex>
              </Collapse>
              <Divider mt={0} />
            </Container>
          )} */}

        {/* <Tabs defaultValue='from-empty' px='xs' color='teal'>
          <Tabs.List>
            <Tabs.Tab value='from-empty'>Upload Prospects Later</Tabs.Tab>
            <Tabs.Tab value='from-file'>Import from File</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='from-file' pt='xs'>
            <FileDropAndPreview
              personaId={createdPersona.length > 0 ? null : selectedPersona}
              createPersona={
                createdPersona.length > 0
                  ? {
                      name: createdPersona,
                      ctas: ctas.map((cta) => cta.cta),
                      description: description,
                      fitReason: fitReason,
                      icpMatchingPrompt: icpMatchingPrompt,
                      contactObjective: contactObjective,
                      contractSize: personaContractSize,
                    }
                  : undefined
              }
              onUploadSuccess={async (archetypeId) => {
                //const response = await getSinglePersona(userToken, archetypeId);
                window.location.reload();
              }}
            />
          </Tabs.Panel>
          <Tabs.Panel value='from-crm' pt='xs'>
            <ComingSoonCard h={200} />
          </Tabs.Panel>
          <Tabs.Panel value='from-empty' pt='xs'>
            <CreatePersona
              createPersona={{
                name: createdPersona,
                ctas: ctas.map((cta) => cta.cta),
                fitReason: fitReason,
                icpMatchingPrompt: icpMatchingPrompt,
                contactObjective: contactObjective,
                contractSize: personaContractSize,
              }}
            />
          </Tabs.Panel>
        </Tabs> */}
      </Stack>
    </Paper>
  );
}
