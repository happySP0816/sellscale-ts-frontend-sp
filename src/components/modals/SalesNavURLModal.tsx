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
  Box,
  Switch,
  Select,
  TextInput,
} from '@mantine/core';
import { ContextModalProps, openContextModal } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { Archetype, CTA } from 'src';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import createCTA, { updateCTA } from '@utils/requests/createCTA';
import { DateInput } from '@mantine/dates';
import { API_URL } from '@constants/data';
import { currentProjectState } from '@atoms/personaAtoms';
import { updateICPFiltersBySalesNavURL } from '@utils/requests/icpScoring';

export default function SalesNavURLModal({ context, id, innerProps }: ContextModalProps<{}>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const currentProject = useRecoilValue(currentProjectState);

  const form = useForm({
    initialValues: {
      url: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!currentProject) return;
    setLoading(true);

    const response = await updateICPFiltersBySalesNavURL(userToken, currentProject.id, values.url);

    setLoading(false);

    if (response.status === 'success' && response.data) {
      showNotification({
        id: 'filters-updated',
        title: 'ICP filters successfully updated',
        message: 'Please allow some time for it to propagate through our systems.',
        color: 'blue',
        autoClose: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: [`get-icp-filters`],
      });
    } else {
      showNotification({
        id: 'filters-updated-error',
        title: 'Error while updating ICP filters',
        message: 'Please contact an administrator.',
        color: 'red',
        autoClose: false,
      });
    }

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

        <Text fz='sm'>
          Copy-paste a Sales Navigator URL below to auto-insert all the search queries into the
          filters on the left.
        </Text>
        <Text fz='sm'>Note: Copy the raw URL, not a saved leads URL.</Text>

        <Flex direction='column'>
          <TextInput
            mt='md'
            required
            placeholder={`Sales Nav URL`}
            withAsterisk
            {...form.getInputProps('url')}
          />
        </Flex>

        {error && (
          <Text color='red' size='sm' mt='sm'>
            {error}
          </Text>
        )}

        {
          <Group>
            <Anchor component='button' type='button' color='dimmed' size='sm'>
              {/* Need help? */}
            </Anchor>
            <Button
              variant='light'
              radius='md'
              type='submit'
              ml='auto'
              mr='auto'
              size='md'
              disabled={form.values.url.trim().length === 0}
            >
              Import
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
