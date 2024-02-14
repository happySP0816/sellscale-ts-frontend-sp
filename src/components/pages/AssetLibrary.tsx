import { useState, useEffect } from 'react';
import { Modal, Title, Button, Group, TextInput, SimpleGrid, Card, Text, Box, Flex, Divider, Badge, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconCirclePlus, IconMinus, IconTrash } from '@tabler/icons';
import { currentProjectState } from '@atoms/personaAtoms';

type Asset = {
    id: string;
  asset_key: string;
  asset_value: string;
  asset_reason: string;
  client_archetype_ids: number[];
};

export default function AssetLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [opened, setOpened] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);
  const currentProjectId = currentProject?.id || -1;
  const [showUsedAssetsOnly, setShowUsedAssetsOnly] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    const response = await fetch(`${API_URL}/client/get_assets`, {
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

  const deleteAsset = async (asset_id: string) => {
    const response = await fetch(`${API_URL}/client/asset`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ asset_id }),
    });

    if (response.ok) {
      showNotification({
        title: 'Success',
        message: 'Asset deleted successfully',
        color: 'green',
      });
      fetchAssets();
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to delete asset',
        color: 'red',
      });
    }
  }

  const toggleCampaignIdInAsset = async (asset_id: string) => {
    const client_archetype_id = currentProjectId;
    const response = await fetch(`${API_URL}/client/toggle_archetype_id_in_asset_ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ asset_id, client_archetype_id }),
    });

    if (response.ok) {
      showNotification({
        title: 'Success',
        message: 'Asset updated successfully',
        color: 'green',
      });
      fetchAssets();
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to update asset',
        color: 'red',
      });
    }
  }


  const form = useForm({
    initialValues: {
      asset_key: '',
      asset_value: '',
      asset_reason: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    const response = await fetch(`${API_URL}/client/create_archetype_asset`, {
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

  const filteredAssets = assets.filter(asset => !showUsedAssetsOnly || asset.client_archetype_ids && asset.client_archetype_ids.includes(currentProjectId))

  return (
    <Box p='lg'>
        <Box w='100%' sx={{ display: 'flex' }}>
            <Box>
                <Title order={3}>
                    {userData.client_name}'s Asset Library
                </Title>
                <Text fz='sm' color='gray'>
                    These are the assets that have been imported into the system for {userData.client_name}. 
                    <br/>- Click on `Add New Asset` to add a new asset to the library. 
                    <br/>- To use assets in this campaign, click on the `Click to Use` button.
                    <br/>- To remove an asset from the library, click on the `Delete` button.
                </Text>
            </Box>
            <Box ml='auto' mr='0' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <Button 
                    w='300px'
                    mt='xs'
                    size='md'
                    onClick={() => setOpened(true)}
                    color='grape'>Add New Asset <IconCirclePlus style={{marginLeft: 4}} />
                    </Button>
                <Switch 
                    w='100%'
                    size='md' mt='lg' 
                    label={showUsedAssetsOnly ? 'Show Used Assets Only' : 'Show All Assets'}
                    color='blue' checked={showUsedAssetsOnly} onChange={() => setShowUsedAssetsOnly(!showUsedAssetsOnly)} />
            </Box>
        </Box>

       <Divider mt='md' mb='md' />
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
      {
        filteredAssets.length === 0 && <Box mt='60px' mb='60px' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <IconCirclePlus size={48} color='gray' />
                <Title order={4} color='gray'>
                    No Assets Found
                </Title>
                <Text color='gray'>
                    Please add some assets to the library by clicking the button above.
                </Text>
        </Box>
      }
      <SimpleGrid cols={4} spacing="lg" mt="lg">
            {filteredAssets.map((asset, index) => {
                const assetUsed = asset.client_archetype_ids && asset.client_archetype_ids.includes(currentProjectId);

                return (
                    <Card key={index} padding="lg" h='230px' sx={{border: assetUsed ? '2px solid #2F98C1' : '2px solid #E0E0E0', position: 'relative'}}>
                        <Badge color={assetUsed ? 'blue' : 'gray'
                        } size='sm' mb='xs' variant={assetUsed ? 'filled' : 'outline'}>
                            {assetUsed && <IconCheck size={12} style={{marginRight: 8}} />}
                            {assetUsed ? 'Used in Campaign' : 'Not Used'}
                        </Badge>
                        <Text weight={600} fz='md'>{asset.asset_key.length > 15 ? asset.asset_key.slice(0, 15) + '...' : asset.asset_key}</Text>
                        <Text size="sm" style={{ marginBottom: 10 }}>{asset.asset_value.length > 105 ? asset.asset_value.slice(0, 105) + '...' : asset.asset_value}</Text>
                        <Text size="xs" color='gray'>{asset.asset_reason}</Text>

                        <Flex mt='md' justify='flex-end' sx={{position: 'absolute', bottom: 10, right: 0, padding: '0 16px'}}>
                            <Button color={assetUsed ? 'gray' : 'blue'} size="xs" variant="outline" onClick={() => {
                                toggleCampaignIdInAsset(asset.id);
                            }} mr='xs'>
                                {
                                    assetUsed ?
                                    <IconMinus size={12} style={{marginRight: 8}} />
                                    :
                                    <IconCirclePlus size={12} style={{marginRight: 8}} />
                                }
                                {assetUsed ? 'Stop using' : 'Click to Use'}
                            </Button>
                        <Button size="xs" color="red" onClick={() => deleteAsset(asset.id)} variant="outline">
                            <IconTrash size={12} style={{marginRight: 8}} />
                            Delete
                        </Button>
                        </Flex>
                    </Card>
                )
            }   
        )}
      </SimpleGrid>
    </Box>
  );
}
