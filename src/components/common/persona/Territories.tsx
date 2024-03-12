import React, { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import {
  Table,
  Button,
  Title,
  Text,
  Tooltip,
  Group,
  Container,
  Box,
  Card,
  Flex,
  Paper,
  Switch,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { API_URL } from '@constants/data';
import { updateClientSDR } from '@utils/requests/updateClientSDR';
import { syncLocalStorage } from '@auth/core';
import { showNotification } from '@mantine/notifications';

interface Territory {
  id: number;
  name: string;
  territory_name: string;
  img_url: string;
  num_results: number;
  title: string;
}

const Territories: React.FC = () => {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [territories, setTerritories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [fetchTerritories, setFetchTerritories] = useState(false);
  const modals = useModals();
  const [autoScrape, setAutoScrape] = useState(userData?.meta_data?.apollo_auto_scrape ?? []);

  const updateAutoScrape = async (value: boolean) => {
    showNotification({
      title: 'Updating...',
      message: 'Auto Scrape setting is being updated.',
      color: 'green',
      autoClose: 2000,
    });

    setAutoScrape(value);
    const response = await updateClientSDR(userToken, undefined, undefined, undefined, undefined, {
      ...(userData?.meta_data ?? {}),
      apollo_auto_scrape: value,
    });
    await syncLocalStorage(userToken, setUserData);
  };

  useEffect(() => {
    // Replace `{API_URL}` with your actual API URL
    fetch(`${API_URL}/contacts/territories`, {
      headers: new Headers({
        Authorization: `Bearer ${userToken}`,
      }),
    })
      .then((response) => response.json())
      .then((data) => setTerritories(data.territories))
      .catch((error) => console.error('Failed to fetch territories', error));
  }, [userToken, fetchTerritories]);

  const rows = territories.map((territory: Territory) => (
    <tr key={territory.id}>
      <td>
        <Flex>
          <Tooltip label={territory.name} position='bottom'>
            {territory.img_url ? (
              <img
                src={territory.img_url}
                alt={territory.name}
                style={{ borderRadius: '2px', height: 40, width: 40 }}
              />
            ) : (
              <Box
                style={{ borderRadius: '2px', height: 40, width: 40, backgroundColor: 'lightgray' }}
              />
            )}
          </Tooltip>
          <Box ml='xs'>
            <Text fw='500' fz='sm'>
              {territory.name}
            </Text>
            <Text fz='10px' color='gray'>
              {territory.title?.substring(0, 30)} {territory.title?.length > 30 ? '...' : ''}
            </Text>
          </Box>
        </Flex>
      </td>
      <td>
        <Text
          color={
            territory.territory_name.includes('Not defined') || territory.territory_name.length == 0
              ? 'red'
              : 'black'
          }
        >
          {territory.territory_name.includes('Not defined') || territory.territory_name.length == 0
            ? '❌ Not defined'
            : territory.territory_name}
        </Text>
      </td>
      <td>
        {territory.territory_name.includes('Not defined') ||
        territory.territory_name.length == 0 ? (
          <Text color='red'>❌ Not defined</Text>
        ) : (
          <Text>
            {territory.num_results?.toLocaleString()} {territory.num_results ? 'contacts' : ''}
          </Text>
        )}
      </td>
      <td>
        <Tooltip
          label={
            territory.id !== userData.id
              ? '❌ You can only edit your own territory'
              : 'Click to Edit Territory'
          }
          position='left'
        >
          <Box>
            <Button
              size='xs'
              disabled={territory.id !== userData.id}
              onClick={setEditMode.bind(this, !editMode)}
            >
              Edit Territory
            </Button>
          </Box>
        </Tooltip>
      </td>
    </tr>
  ));

  return (
    <Box>
      <Box pl='xl' pr='xl' mb='48px'>
        <Flex pb='xl' pt='xl'>
          <Box>
            <Title order={1}>Territory Management</Title>
            <Text size='sm'>
              Territories are used to define high level TAM and filters for our AI to segment from.
            </Text>
          </Box>
          <Group position='right' style={{ marginBottom: 20 }} ml='auto'>
            <Button
              onClick={() => {
                setEditMode(!editMode);
                setFetchTerritories(!fetchTerritories);
              }}
            >
              {editMode ? 'View all Territories' : 'Edit my Territory'}
            </Button>
          </Group>
        </Flex>

        {!editMode ? (
          <Card withBorder p='0'>
            <Table highlightOnHover withColumnBorders>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Rep</th>
                  <th style={{ width: '40%' }}>Territory</th>
                  <th style={{ width: '25%' }}># Contacts</th>
                  <th style={{ width: '15%' }}>Edit</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </Card>
        ) : (
          <>
            <iframe
              src={`https://sellscale.retool.com/embedded/public/80a08f60-8b0d-4ff8-a90a-c22cdcd3a4be#authToken=${userToken}`}
              style={{ width: '100%', height: window.innerHeight + 120 }}
              frameBorder={0}
            />
          </>
        )}
      </Box>

      <Box px='xl'>
        <Paper p='md' withBorder={true}>
          <Title order={3}>Auto Scrape</Title>
          <Text fz='sm'>
            Automatically scrape 100 prospects per hour from this territory slice. Prospects will be
            placed in Unassisgned Campaign.
          </Text>
          <Switch
            checked={autoScrape}
            onChange={(e) => updateAutoScrape(e.currentTarget.checked)}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default Territories;
