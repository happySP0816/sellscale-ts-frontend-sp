import React, { useState } from 'react';
import { Box, Button, Card, Text, Title, LoadingOverlay } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';
import { getUserInfo, logout } from '@auth/core';

const AccountSettings: React.FC = () => {
    const [userData, setUserData] = useRecoilState(userDataState);
  const [sdrActive, setSdrActive] = useState<boolean>(userData?.active);
  const [loading, setLoading] = useState<boolean>(false);

  const userToken = useRecoilValue(userTokenState);

  const fetchUserInfo = async () => {
    const info = await getUserInfo(userToken);
    setUserData(info);
    setSdrActive(info.active);
  }

    const handleActivate = async (userToken: string) => {
        setLoading(true);
        const response = await fetch(
            `${API_URL}/client/sdr/activate_seat`,
            {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${userToken}`,
                'Content-Type': 'application/json',
                }
            })
        
        const json = await response.json();
        showNotification({
            title: json.status,
            message: json.message,
        });

        fetchUserInfo()
        setLoading(false);
    };

  const handleDeactivate = async (userToken: string) => {
    setLoading(true);
    const response = await fetch(
      `${API_URL}/client/sdr/deactivate_seat`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const json = await response.json();
    showNotification({
      title: json.status,
      message: json.message,
    });

    fetchUserInfo()

    setLoading(false);
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Box position="relative">
        <LoadingOverlay visible={loading} />
        <Title order={4}>Danger Zone: Toggle Seat</Title>
        <Text color="dimmed" size="sm" mt="sm">
          Deactivate the SDR seat to prevent any future AI activity. Reactivate it when you’re ready to resume AI activity.
        </Text>
        <Box mt="md">
          {sdrActive ? (
            <Button
              color="red"
              onClick={() => handleDeactivate(userToken)}
              disabled={loading}
              leftIcon={<IconPlayerPause size={18} />}
            >
              Deactivate SDR
            </Button>
          ) : (
            <Button
              color="green"
              onClick={() => handleActivate(userToken)}
              disabled={loading}
              leftIcon={<IconPlayerPlay size={18} />}
            >
              Activate SDR
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default AccountSettings;
