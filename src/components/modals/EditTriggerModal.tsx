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
  Avatar,
  Popover,
  ActionIcon,
  Stack,
} from '@mantine/core';
import { ContextModalProps, openContextModal } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { Archetype, CTA, Trigger } from 'src';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import createCTA, { updateCTA } from '@utils/requests/createCTA';
import { DateInput } from '@mantine/dates';
import { API_URL } from '@constants/data';
import EmojiPicker from 'emoji-picker-react';
import { ProjectSelect } from '@common/library/ProjectSelect';

export default function EditTriggerModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  trigger: Trigger;
  onSave: (newTrigger: Trigger) => void;
}>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const [emoji, setEmoji] = useState<string>(innerProps.trigger.emoji);
  const [campaignId, setCampaignId] = useState<number>(innerProps.trigger.client_archetype_id);

  const form = useForm({
    initialValues: {
      title: innerProps.trigger.name,
      active: innerProps.trigger.active,
      interval: innerProps.trigger.interval_in_minutes,
      description: innerProps.trigger.description,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    innerProps.onSave({
      active: values.active,
      blocks: [],
      client_archetype_id: campaignId,
      description: values.description,
      emoji: emoji,
      id: innerProps.trigger.id,
      interval_in_minutes: values.interval,
      keyword_blacklist: {},
      last_run: '',
      name: values.title,
      next_run: '',
      trigger_config: {},
      trigger_type: '',
    } satisfies Trigger);

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

        <Stack>
          <ProjectSelect
            onClick={(persona) => {
              setCampaignId(persona.id);
            }}
          />

          <Popover position='bottom' withArrow shadow='md' withinPortal>
            <Popover.Target>
              <ActionIcon
                variant='subtle'
                color={'gray'}
                radius='xl'
                size='sm'
                sx={{ backgroundColor: '#ffffff22' }}
              >
                <Text fz='lg'>{emoji}</Text>
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <EmojiPicker
                onEmojiClick={(event: any, _: any) => {
                  const emoji = event.emoji;
                  setEmoji(emoji);
                }}
              />
            </Popover.Dropdown>
          </Popover>

          <TextInput placeholder='Title' label='Title' {...form.getInputProps('title')} />

          <NumberInput
            placeholder='Interval (in minutes)'
            label='Interval'
            {...form.getInputProps('interval')}
          />

          <Checkbox
            mt='md'
            label='Active'
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <Textarea
            placeholder='Description'
            label='Description'
            {...form.getInputProps('description')}
            autosize
          />
        </Stack>

        {error && (
          <Text color='red' size='sm' mt='sm'>
            {error}
          </Text>
        )}

        {
          <Group pt='md'>
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
