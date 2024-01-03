import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Title,
  Flex,
  Textarea,
  LoadingOverlay,
  Card,
  Container,
  Box,
  Select,
  Image,
  Switch,
  Stack,
  Collapse,
  TextInput,
} from '@mantine/core';
import { ContextModalProps, openContextModal } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { Archetype, BumpFramework, PersonaOverview } from 'src';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import createCTA from '@utils/requests/createCTA';
import CTAGeneratorExample from '@common/cta_generator/CTAGeneratorExample';
import { DateInput } from '@mantine/dates';
import { API_URL } from '@constants/data';
import {
  createLiTemplate,
  detectLiTemplateResearch,
  updateLiTemplate,
} from '@utils/requests/linkedinTemplates';
import { currentProjectState } from '@atoms/personaAtoms';
import { PersonalizationSection, RESEARCH_POINTS } from '@common/sequence/SequenceSection';
import { TypeAnimation } from 'react-type-animation';
import sellScaleLogo from '../common/sequence/assets/logo.jpg';
import _, { set } from 'lodash';
import { useDebouncedValue, useDidUpdate, useDisclosure, useTimeout } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronUp,
  IconRotateRectangle,
  IconSettings,
  IconWashMachine,
} from '@tabler/icons';
import { IconRobot } from '@tabler/icons';
import { patchBumpFramework } from '@utils/requests/patchBumpFramework';

export default function LiBfTemplateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  mode: 'CREATE' | 'EDIT';
  editProps?: {
    templateId: number;
    bf: BumpFramework;
    title: string;
    message: string;
    active: boolean;
    humanFeedback: string;
    blockList: string[];
  };
}>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [opened, { toggle, open }] = useDisclosure(false);

  const [loadingResearch, setLoadingResearch] = useState(false);
  const [researchPoints, setResearchPoints] = useState<string[]>(
    innerProps.editProps?.blockList ?? []
  );

  console.log(researchPoints);

  const showUserFeedback = true;

  const form = useForm({
    initialValues: {
      title: innerProps.editProps?.title ?? '',
      message: innerProps.editProps?.message ?? '',
      active: innerProps.editProps?.active === undefined ? true : innerProps.editProps.active,
      humanFeedback: innerProps.editProps?.humanFeedback ?? '',
    },
  });

  const autoDetectResearchPoints = async () => {
    if (!currentProject) return;
    setLoadingResearch(true);
    const response = await detectLiTemplateResearch(
      userToken,
      currentProject.id,
      undefined,
      form.values.message
    );
    if (response.status === 'success') {
      console.log(response.data);
      setResearchPoints(response.data);
      open();
    }
    setLoadingResearch(false);
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (innerProps.mode === 'CREATE') {
      await createTemplate(values);
    } else {
      await updateTemplate(values);
    }
  };

  const createTemplate = async (values: typeof form.values) => {
    if (!currentProject) return;

    await queryClient.refetchQueries({
      queryKey: [`query-get-bump-frameworks`],
    });
    context.closeModal(id);
  };

  const updateTemplate = async (values: typeof form.values) => {
    if (!currentProject) return;

    const result = await patchBumpFramework(
      userToken,
      innerProps.editProps?.templateId ?? -1,
      innerProps.editProps?.bf.overall_status ?? '',
      values.title,
      values.message,
      innerProps.editProps?.bf.bump_length ?? '',
      innerProps.editProps?.bf.bumped_count ?? -1,
      innerProps.editProps?.bf.bump_delay_days ?? -1,
      values.active,
      true,
      researchPoints,
      null,
      null,
      null,
      values.humanFeedback ?? ''
    );
    await queryClient.refetchQueries({
      queryKey: [`query-get-bump-frameworks`],
    });
    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />

        <Card withBorder>
          <Stack>
            <TextInput label='Name' placeholder='Name' required {...form.getInputProps('title')} />

            <Box style={{ position: 'relative' }}>
              <Textarea
                label='Template'
                required
                description='Use [[personalization]] to add personalization into your message.'
                minRows={4}
                placeholder='Template outline'
                {...form.getInputProps('message')}
              />
              {form.values['message'].length > 300 && (
                <Text color='red' mt='0px' fz='xs' align='right'>
                  Message is too long ({form.values['message'].length} / 300 characters)
                </Text>
              )}
              <Button
                loading={loadingResearch}
                variant='light'
                size='xs'
                compact
                style={{
                  position: 'absolute',
                  top: 15,
                  right: 0,
                }}
                leftIcon={<IconRotateRectangle size='0.9rem' />}
                onClick={() => {
                  autoDetectResearchPoints();
                }}
              >
                Autodetect Research Points
              </Button>
            </Box>

            <Collapse in={opened}>
              <Box mih={500} sx={{ position: 'relative' }}>
                {loadingResearch ? (
                  <LoadingOverlay visible />
                ) : (
                  <PersonalizationSection
                    title='Enabled Research Points'
                    blocklist={researchPoints}
                    onItemsChange={async (items) => {
                      const newItems = items.filter((x) => !x.checked).map((x) => x.id);
                      setResearchPoints(newItems);
                    }}
                    onChanged={() => {}}
                  />
                )}
              </Box>
              {showUserFeedback && (
                <Card mb='16px'>
                  <Card.Section
                    sx={{
                      backgroundColor: '#59a74f',
                      flexDirection: 'row',
                      display: 'flex',
                    }}
                    p='sm'
                  >
                    <Text color='white' mt='4px'>
                      Feel free to give me feedback on improving the message
                    </Text>
                  </Card.Section>
                  <Card.Section sx={{ border: 'solid 2px #59a74f !important' }} p='8px'>
                    <Textarea
                      variant='unstyled'
                      pl={'8px'}
                      pr={'8px'}
                      minRows={3}
                      placeholder='- make it shorter&#10;-use this fact&#10;-mention the value prop'
                      {...form.getInputProps('humanFeedback')}
                    />
                  </Card.Section>
                </Card>
              )}
            </Collapse>
            <Button
              variant='light'
              color='gray'
              leftIcon={
                opened ? <IconChevronUp size={'0.9rem'} /> : <IconChevronDown size={'0.9rem'} />
              }
              onClick={() => toggle()}
            >
              {opened ? 'Hide' : 'Show'} Settings
            </Button>

            <Box>
              <Button disabled={loading || form.values['message'].length > 300} type='submit'>
                {innerProps.mode === 'CREATE' ? 'Create' : 'Update'}
              </Button>
            </Box>
          </Stack>
        </Card>
      </form>
    </Paper>
  );
}
