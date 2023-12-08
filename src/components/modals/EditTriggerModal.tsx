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
  Checkbox,
  NumberInput,
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

export default function EditTriggerModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  title: string;
  active: boolean;
  interval: number;
  onSave: (title: string, active: boolean, interval: number) => void;
}>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      title: innerProps.title,
      active: innerProps.active,
      interval: innerProps.interval,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    innerProps.onSave(values.title, values.active, values.interval);

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

        <TextInput placeholder='Title' label='Title' {...form.getInputProps('title')} />

        <NumberInput placeholder='Interval' label='Interval' {...form.getInputProps('interval')} />

        <Checkbox mt='md' label='Active' {...form.getInputProps('active', { type: 'checkbox' })} />

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
            <Button variant='light' radius='md' type='submit' ml='auto' mr='auto' size='md'>
              Update
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
