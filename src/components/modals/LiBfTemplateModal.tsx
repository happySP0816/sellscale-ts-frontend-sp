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
import { Archetype, PersonaOverview } from 'src';
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
import _ from 'lodash';
import { useDebouncedValue, useDidUpdate, useDisclosure, useTimeout } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronUp,
  IconRotateRectangle,
  IconSettings,
  IconWashMachine,
} from '@tabler/icons';
import { IconRobot } from '@tabler/icons';

export default function LiBfTemplateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  message: string;
  handleSubmit: (message: string) => void;
}>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      message: innerProps.message ?? '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    await innerProps.handleSubmit(values.message);
    setLoading(false);
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
            <Box style={{ position: 'relative' }}>
              <Textarea
                placeholder='Instructions'
                minRows={3}
                autosize
                variant='filled'
                // defaultValue={bf.description}
                // onChange={(e) => {
                //   form.setFieldValue('promptInstructions', e.target.value);
                //   setChanged(true);
                // }}
                // onBlur={() => {
                //   setEditing(false);
                // }}
                // onClick={(e) => {
                //   e.preventDefault();
                //   e.stopPropagation();
                // }}
                {...form.getInputProps('message')}
              />
            </Box>

            <Box>
              <Button disabled={loading} type='submit'>
                Update
              </Button>
            </Box>
          </Stack>
        </Card>
      </form>
    </Paper>
  );
}
