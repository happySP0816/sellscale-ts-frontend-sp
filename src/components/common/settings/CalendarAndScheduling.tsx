import {
  Card,
  Paper,
  TextInput,
  Text,
  Title,
  ActionIcon,
  Flex,
  Button,
  LoadingOverlay,
  Notification,
  Select,
  Badge,
} from '@mantine/core';
import { IconCheck, IconEdit, IconX } from '@tabler/icons';
import { useEffect, useState } from 'react';

import { patchSchedulingLink } from '@utils/requests/patchSchedulingLink';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';
import { API_URL } from '@constants/data';
import { IconCalendarShare } from '@tabler/icons-react';

const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z]{2,})+(?:\/[\w\-\.\?\=\&]*)*$/i;

const REDIRECT_URI = `https://app.sellscale.com/authcalendly`;
const CALENDLY_CLIENT_ID = 'SfpOyr5Hq4QrjnZwoKtM0n_vOW_hZ6ppGpxHgmnW70U';

export default function CalendarAndScheduling() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [timeZone, setTimeZone] = useState<string>(userData.timezone);

  const [schedulingLink, setSchedulingLink] = useState<string>(userData.scheduling_link || '');

  useEffect(() => {
    if (timeZone && timeZone !== userData.timezone) {
      (async () => {
        const response = await fetch(`${API_URL}/client/sdr/timezone`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timezone: timeZone,
          }),
        });
        setUserData({ ...userData, timezone: timeZone });
        showNotification({
          id: 'change-sdr-timezone',
          title: 'Time Zone Updated',
          message: `Your time zone has been updated.`,
          color: 'green',
          autoClose: 2000,
        });
      })();
    }
  }, [timeZone]);

  function handleUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;
    setSchedulingLink(value);

    if (value && !urlRegex.test(value)) {
      setError('Please enter a valid URL');
    } else {
      setError('');
    }
  }

  const triggerPatchSchedulingLink = async () => {
    setIsLoading(true);

    if (error) {
      showNotification({
        title: 'Error',
        message: 'Please enter a valid URL',
        color: 'red',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    } else if (!schedulingLink) {
      showNotification({
        title: 'Error',
        message: 'Please enter a URL',
        color: 'red',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    } else if (schedulingLink === userData.scheduling_link) {
      showNotification({
        title: 'Error',
        message: 'Please enter a different URL',
        color: 'red',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    const response = await patchSchedulingLink(userToken, schedulingLink);
    setIsLoading(false);

    if (response.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Scheduling link updated successfully',
        color: 'teal',
        autoClose: 3000,
      });
      setUserData({ ...userData, scheduling_link: schedulingLink });
      setIsEditing(false);
    } else {
      showNotification({
        title: 'Error',
        message: 'Could not update scheduling link, please try again or contact support',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  return (
    <Paper withBorder m='xs' p='md' radius='md'>
      <Title order={3}>Calendar Integration</Title>
      <Card mt='md'>
        <LoadingOverlay visible={isLoading} />
        {userData.scheduling_link ? (
          <Notification
            closeButtonProps={{ opacity: 0 }}
            icon={<IconCheck size='1.1rem' />}
            title='Scheduling link is set'
            color='green'
            mb='sm'
            withBorder
          />
        ) : (
          <Notification
            closeButtonProps={{ opacity: 0 }}
            icon={<IconX size='1.1rem' />}
            title='Scheduling link is not set'
            color='red'
            mb='sm'
            withBorder
          />
        )}
        <Text fz='lg' fw='bold'>
          Scheduling Link
        </Text>
        <Text mt='sm' fz='sm'>
          Whenever SellScale AI detects a high propensity prospect who is interested in scheduling a time with you, the
          AI will use this link to book on your calendar.
        </Text>
        <Text mt='xs' fz='xs'>
          Needs to be a valid URL (Calendly, Chron, Hubspot, etc).
        </Text>
        <TextInput
          mt='sm'
          label='Scheduling Link'
          placeholder='https://calendly.com/yourname'
          value={schedulingLink}
          error={error}
          disabled={!isEditing}
          onChange={handleUrlChange}
          withAsterisk
        />
        {!isEditing && (
          <Flex justify='flex-end' mt='xs'>
            <ActionIcon color='dark' variant='transparent' onClick={() => setIsEditing(true)}>
              <IconEdit size='1.125rem' />
            </ActionIcon>
          </Flex>
        )}
        {isEditing && (
          <Flex justify='space-between' mt='sm'>
            <Button
              variant='light'
              color='red'
              onClick={() => {
                setIsEditing(false);
                setError('');
                setSchedulingLink(userData.scheduling_link || '');
              }}
            >
              Cancel
            </Button>
            <Button variant='light' color='green' onClick={triggerPatchSchedulingLink}>
              Save
            </Button>
          </Flex>
        )}
      </Card>
      <Card>
        <Text fz='lg' fw='bold'>
          Calendly Integration
        </Text>
        <Text my='sm' fz='sm'>
          Using Calendly, SellScale AI will automatically book meetings on your calendar.
        </Text>
        {userData.calendly_connected ? (
          <Badge size='xl' variant='filled' color='blue' styles={{ root: { textTransform: 'initial' } }}>
            Calendly Connected
          </Badge>
        ) : (
          <Button
            w={300}
            mx='auto'
            component='a'
            target='_blank'
            rel='noopener noreferrer'
            href={`https://auth.calendly.com/oauth/authorize?client_id=${CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`}
            my={20}
            variant='outline'
            size='md'
            color='blue'
            rightIcon={<IconCalendarShare size='1rem' />}
          >
            Connect to Calendly
          </Button>
        )}
      </Card>

      <Card>
        <Text fz='lg' fw='bold'>
          Time Zone
        </Text>
        <Text mt='sm' fz='sm'>
          This time zone should be set to the time zone for the majority of your prospects.
        </Text>
        <Select
          mt='md'
          withinPortal
          /* @ts-ignore */
          data={Intl.supportedValuesOf('timeZone')}
          placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
          searchable
          clearable
          nothingFound='Time zone not found'
          value={timeZone}
          onChange={(value) => setTimeZone(value as string)}
        />
      </Card>
    </Paper>
  );
}
