import {
  Modal,
  Stack,
  TextInput,
  Title,
  Text,
  Textarea,
  Group,
  Checkbox,
  Button,
} from '@mantine/core';
import { useState } from 'react';

export function RequestCampaignModal(props: {
  opened: boolean;
  onClose: () => void;
  onRequest: (name: string, description: string, liEnabled: boolean, emailEnabled: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [liEnabled, setLiEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <Modal
      opened={props.opened}
      onClose={() => {
        props.onClose();
      }}
      size='sm'
      padding='md'
      title={<Title order={3}>Request Campaign</Title>}
    >
      <Stack>
        <Text c='dimmed'>
          Create a new campaign request. This will create an `AI Request` that SellScale will
          complete within 24-48 hours.
        </Text>
        <TextInput
          label='Campaign Name'
          placeholder='Campaign Name'
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Textarea
          label='What do you want to say?'
          description='Feel free to copy sequence below and/or general ideas & offers.'
          placeholder='I want to send a campaign to my leads about...'
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        <Group>
          <Checkbox
            label='Create LinkedIn'
            checked={liEnabled}
            onChange={(e) => setLiEnabled(e.currentTarget.checked)}
          />
          <Checkbox
            label='Create Email'
            checked={emailEnabled}
            onChange={(e) => setEmailEnabled(e.currentTarget.checked)}
          />
        </Group>
        <Button
          fullWidth
          onClick={() => {
            props.onRequest(name, description, liEnabled, emailEnabled);
            props.onClose();
          }}
        >
          Request Campaign
        </Button>
      </Stack>
    </Modal>
  );
}
