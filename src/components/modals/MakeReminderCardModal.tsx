import { userDataState, userTokenState } from '@atoms/userAtoms';
import FlexSeparate from '@common/library/FlexSeparate';
import RichTextArea from '@common/library/RichTextArea';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  TextInput,
  Flex,
  Group,
  Center,
  Button,
  Textarea,
  LoadingOverlay,
  Collapse,
  Card,
  Select,
  Tooltip,
  Box,
  Stack,
  MultiSelect,
} from '@mantine/core';
import { ContextModalProps, closeAllModals, openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconPlus, IconSend, IconSettings, IconWriting } from '@tabler/icons';
import { IconSettingsFilled } from '@tabler/icons-react';
import { JSONContent } from '@tiptap/react';
import { addDashReminderCard } from '@utils/requests/addDashReminderCard';
import { postGenerateInitialEmail } from '@utils/requests/emailMessageGeneration';
import { getEmailSequenceSteps } from '@utils/requests/emailSequencing';
import { sendEmail, sendGenericEmail } from '@utils/requests/sendEmail';
import DOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProspectShallow } from 'src';

interface MakeReminderCardType extends Record<string, unknown> {
  prospect: ProspectShallow;
  onCreate: (prospect: ProspectShallow, reason: string) => void;
  onCancel: () => void;
}

export default function MakeReminderCardModal({
  context,
  id,
  innerProps,
}: ContextModalProps<MakeReminderCardType>) {
  const userToken = useRecoilValue(userTokenState);

  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);

  const [prospectLine, setProspectLine] = useState(
    `${innerProps.prospect.full_name}, ${innerProps.prospect.title}`
  );
  const [reason, setReason] = useState('');

  const onCreateTask = async () => {
    setLoading(true);

    const response = await addDashReminderCard(userToken, innerProps.prospect.id, reason);

    innerProps.onCreate(innerProps.prospect, reason);

    if (response.status !== 'success') {
      showNotification({
        title: 'Error',
        message: 'Could not create task.',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    showNotification({
      title: 'Success',
      message: 'Task created.',
      color: 'green',
    });
    setLoading(false);

    closeAllModals();
    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        minHeight: 400,
      }}
    >
      <Stack>
        <Text>
          Sets a notification for the rep to take a look at this prospect. Will notify via Slack.
        </Text>
        <Box>
          <TextInput label='Prospect' value={prospectLine} onChange={(e) => {}} readOnly />
        </Box>
        <Box>
          <TextInput
            label='Reason for reminder card'
            value={reason}
            onChange={(e) => {
              setReason(e.currentTarget.value);
            }}
          />
        </Box>
      </Stack>

      <Flex pt={10}>
        <Button
          radius='xl'
          leftIcon={<IconPlus size='0.9rem' />}
          loading={loading}
          onClick={onCreateTask}
        >
          Create Task
        </Button>
      </Flex>
    </Paper>
  );
}
