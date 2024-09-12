import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Text,
  Title,
  LoadingOverlay,
  Divider,
  TextInput,
  Flex,
} from '@mantine/core';
import { IconFile, IconPencil, IconPlayerPause, IconPlayerPlay, IconX } from '@tabler/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';
import { getUserInfo, logout } from '@auth/core';

const Advanced: React.FC = () => {
  const [userData, setUserData] = useRecoilState(userDataState);
  const [sdrActive, setSdrActive] = useState<boolean>(userData?.active);
  const [loading, setLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(true);
  const [editAccount, setEditAccount] = useState({
    name: userData.sdr_name,
    title: userData.sdr_title,
    email: userData.sdr_email,
  });

  const userToken = useRecoilValue(userTokenState);

  // PATCH /client/sdr - update sdr info
  const handleSave = async () => {
    setEdit(true);

    setLoading(true);
    const response = await fetch(`${API_URL}/client/sdr`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editAccount),
    });

    const json = await response.json();

    setLoading(false);

    showNotification({
      title: 'Account Info Updated',
      message: 'Your account info has been updated successfully',
    });
  };

  const fetchUserInfo = async () => {
    const info = await getUserInfo(userToken);
    if (info) {
      setUserData(info);
      setSdrActive(info.active);
    }
  };

  const handleActivate = async (userToken: string) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/client/sdr/activate_seat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();
    showNotification({
      title: json.status,
      message: json.message,
    });

    fetchUserInfo();
    setLoading(false);
  };

  const handleDeactivate = async (userToken: string) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/client/sdr/deactivate_seat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();
    showNotification({
      title: json.status,
      message: json.message,
    });

    fetchUserInfo();

    setLoading(false);
  };

  return (
    <>
      <Card shadow='sm' p='lg' radius='md' withBorder>
        <Title order={3}>Advanced Settings</Title>
        <Flex direction='column' gap={'sm'} mt={'md'}>
          <Flex gap={'md'} align={'center'} mt={'md'}>
      
            <Button
              w={'fit-content'}
              onClick={() => {
                const backgroundUploadElement = document.getElementById('background-upload');
                if (backgroundUploadElement) {
                  backgroundUploadElement.click();
                }
              }}
            >
              Set App Background
            </Button>
            {localStorage.getItem('backgroundImage') && (
              <Button
                w={'fit-content'}
                onClick={() => {
                  localStorage.removeItem('backgroundImage');
                  window.location.reload();
                }}
                color='red'
                variant='outline'
              >
                Clear App Background
              </Button>
            )}
            <input
              type="file"
              id="background-upload"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result?.toString().split(',')[1];
                    if (base64String) {
                      localStorage.setItem('backgroundImage', base64String);
                      window.location.reload();
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {!edit && (
              <Button
                onClick={() => {
                  setEdit(true);
                  setEditAccount({
                    name: userData.sdr_name,
                    title: userData.sdr_title,
                    email: userData.sdr_email,
                  });
                }}
                color='red'
                variant='outline'
              >
                Cancel Edit
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
 
    </>
  );
};

export default Advanced;
