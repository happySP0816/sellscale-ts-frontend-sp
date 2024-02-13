import { useState, useEffect } from 'react';
import { Modal, Button, Group, TextInput, SimpleGrid, Card, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';

type Asset = {
  asset_key: string;
  asset_value: string;
  asset_reason: string;
};

export default function AssetLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [opened, setOpened] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const response = await fetch(`${API_URL}/get_assets`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    if (data.message === 'Success') {
      setAssets(data.data);
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to fetch assets',
        color: 'red',
      });
    }
  };

  const form = useForm({
    initialValues: {
      asset_key: '',
      asset_value: '',
      asset_reason: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const response = await fetch(`${API_URL}/create_archetype_asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      showNotification({
        title: 'Success',
        message: 'Asset created successfully',
        color: 'green',
      });
      setOpened(false);
      form.reset();
      fetchAssets();
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to create asset',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Button onClick={() => setOpened(true)}>Add Asset</Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add New Asset"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Asset Title"
            placeholder="Title"
            {...form.getInputProps('asset_key')}
            required
          />
          <TextInput
            label="Asset Value"
            placeholder="Value"
            {...form.getInputProps('asset_value')}
            required
          />
          <TextInput
            label="Asset Reason"
            placeholder="Reason"
            {...form.getInputProps('asset_reason')}
            required
          />
          <Group position="right" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Modal>
      <SimpleGrid cols={4} spacing="lg" mt="lg">
        {assets.map((asset, index) => (
          <Card key={index} shadow="sm" padding="lg">
            <Text weight={500}>{asset.asset_key}</Text>
            <Text size="sm" style={{ marginBottom: 10 }}>{asset.asset_value}</Text>
            <Text size="xs">{asset.asset_reason}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
