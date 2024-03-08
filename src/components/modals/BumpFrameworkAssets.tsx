import React, { useState, useEffect } from 'react';
import {
  Badge,
  Modal,
  Select,
  Button,
  Group,
  Text,
  CloseButton,
  Flex,
  Box,
  Card,
  Divider,
  Title,
} from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';

const BumpFrameworkAssets: React.FC<{ bump_framework_id: number }> = ({ bump_framework_id }) => {
  const [opened, setOpened] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [attachedAssets, setAttachedAssets] = useState([]);
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    fetchAssets();
    fetchAttachedAssets();
  }, [bump_framework_id]); // Re-run these functions if bump_framework_id changes

  const fetchAssets = () => {
    const archetype_id = currentProject?.id;
    fetch(`${API_URL}/client/all_assets/${archetype_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + userToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const transformedData = data.data.map((asset: any) => ({
          value: asset.id.toString(),
          label: asset.title,
        }));
        setSelectedAsset(transformedData[0]?.value);
        setAssets(transformedData);
      })
      .catch((error) => console.error('Failed to fetch assets', error));
  };

  const fetchAttachedAssets = () => {
    fetch(
      `${API_URL}/bump_framework/get_all_asset_mapping?bump_framework_id=${bump_framework_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + userToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setAttachedAssets(data.mappings);
      })
      .catch((error) => console.error('Failed to fetch attached assets', error));
  };

  const addAsset = () => {
    fetch(`${API_URL}/bump_framework/create_asset_mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + userToken,
      },
      body: JSON.stringify({
        bump_framework_id: bump_framework_id,
        asset_id: selectedAsset,
      }),
    })
      .then((response) => {
        if (response.ok) {
          fetchAttachedAssets(); // Refresh the list of attached assets
        } else {
          alert('Failed to add asset.');
        }
      })
      .catch((error) => console.error('Failed to add asset', error));
  };

  const removeAsset = (assetMappingId: number) => {
    fetch(`${API_URL}/bump_framework/delete_asset_mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + userToken,
      },
      body: JSON.stringify({
        bump_framework_step_to_asset_mapping_id: assetMappingId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          fetchAttachedAssets(); // Refresh the list of attached assets
        } else {
          alert('Failed to remove asset.');
        }
      })
      .catch((error) => console.error('Failed to remove asset', error));
  };

  console.log(attachedAssets);

  return (
    <>
      <Badge color='blue' ml='xs' variant='outline' size='xs' onClick={() => setOpened(true)}>
        {attachedAssets.length} used assets
      </Badge>
      <Modal opened={opened} onClose={() => setOpened(false)} title='Select an asset'>
        <Select
          withinPortal
          data={assets}
          placeholder='Select an asset'
          onChange={(value: string | null) => setSelectedAsset(value || '')}
          nothingFound='No options'
        />
        <Button onClick={addAsset} mt='xs'>
          Add Asset to Step
        </Button>

        <Divider mt='md' mb='xs' />

        <Title order={4} mb='xs'>
          Attached Assets
        </Title>

        {attachedAssets.length === 0 && (
          <Text color='gray' mt='xs'>
            No assets attached to this step.
          </Text>
        )}

        <Group spacing='xs' mt='xs'>
          {attachedAssets.map((asset: any) => (
            <Card key={asset.mapping_id} withBorder w='100%'>
              <Flex>
                <CloseButton mr='xs' mt='xs' onClick={() => removeAsset(asset.mapping_id)} />
                <Box>
                  <Text>{asset.asset_key}</Text>
                  <Text fz='xs' color='gray'>
                    {asset.asset_value.substring(0, 50)}
                    {asset.asset_value.length > 50 ? '...' : ''}
                  </Text>
                </Box>
              </Flex>
            </Card>
          ))}
        </Group>
      </Modal>
    </>
  );
};

export default BumpFrameworkAssets;
