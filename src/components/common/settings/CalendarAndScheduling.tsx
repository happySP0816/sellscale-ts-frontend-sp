import {
  Card,
  Paper,
  TextInput,
  Input,
  Text,
  Title,
  ActionIcon,
  Flex,
  Button,
  LoadingOverlay,
  Notification,
  Select,
  Badge,
  Divider,
  Avatar,
  Anchor,
  Overlay,
  AspectRatio,
  Box,
} from '@mantine/core';
import { IconCheck, IconCircleCheck, IconCopy, IconEdit, IconInfoCircle, IconLink, IconPencil, IconX } from '@tabler/icons';
import { useEffect, useState } from 'react';

import { patchSchedulingLink } from '@utils/requests/patchSchedulingLink';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';
import { API_URL } from '@constants/data';
import { IconCalendarShare, IconCircleCheckFilled, IconInfoHexagon, IconInfoTriangle, IconPointFilled } from '@tabler/icons-react';

const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z]{2,})+(?:\/[\w\-\.\?\=\&]*)*$/i;

const REDIRECT_URI = `https://app.sellscale.com/authcalendly`;
const CALENDLY_CLIENT_ID = 'SfpOyr5Hq4QrjnZwoKtM0n_vOW_hZ6ppGpxHgmnW70U';

export default function CalendarAndScheduling() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [updated, setUpdated] = useState<boolean>(false);

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
      setUpdated(true);
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
      <Card mt='md' padding='lg' radius='md' withBorder>
        <LoadingOverlay visible={isLoading} />
        <Flex gap={4} align={'center'}>
          <Text fz='lg' fw='bold'>
            Scheduling Link
          </Text>
          {updated && <IconCircleCheck color='green' size={'1.2rem'} />}
        </Flex>
        <Text mt='sm' fz='sm'>
          Whenever SellScale AI detects a high propensity prospect who is interested in scheduling a time with you, the AI will use this link to book on your
          calendar. Needs to be a valid URL (Calendly, Chron, Hubspot, etc).
        </Text>
        <Divider mt={'sm'} />
        <Flex align={'end'} gap={'sm'} justify={'space-between'} w={'100%'}>
          <Input.Wrapper
            label={
              <Text color='gray' tt={'uppercase'}>
                calendar link
              </Text>
            }
            error={error}
            mt='sm'
            w={'100%'}
          >
            <Input
              placeholder='https://calendly.com/yourname'
              value={schedulingLink}
              disabled={!isEditing}
              onChange={handleUrlChange}
              rightSection={<IconCopy size={'1rem'} />}
              // withAsterisk
            />
          </Input.Wrapper>
          <Button leftIcon={<IconPencil size={'0.9rem'} />} onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </Flex>
        {/* {!isEditing && (
          <Flex justify='flex-end' mt='xs'>
            <ActionIcon color='dark' variant='transparent' onClick={() => setIsEditing(true)}>
              <IconEdit size='1.125rem' />
            </ActionIcon>
          </Flex>
          )} */}

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
        <Flex direction={'column'} gap={2} mt={'sm'}>
          <Text color='gray' tt={'uppercase'}>
            example message
          </Text>
          <Flex style={{ border: '1px solid #dee2e6', borderRadius: '8px' }} align={'center'} justify={'center'}>
            <Box pos='relative'>
              <LoadingOverlay
                visible={!userData.scheduling_link}
                zIndex={1000}
                overlayBlur={2}
                loader={
                  <Notification
                    withCloseButton={false}
                    icon={<IconInfoTriangle size='0.8rem' />}
                    title='Scheduling link is not set'
                    color='red'
                    withBorder
                    bg={'#fff6f5'}
                    style={{ border: '1px solid #f9c5c4' }}
                    w={'fit-content'}
                    fw={500}
                  >
                    <Text size={'xs'}>Integrate Calendar to schedule meetings using SellScale AI.</Text>
                  </Notification>
                }
              />
              <Flex p={'sm'} gap={'sm'}>
                <Avatar src={userData.img_url} radius={'xl'} size={'lg'} />
                <Flex direction={'column'} gap={'sm'}>
                  <Text fw={'700'} size={'sm'} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {userData.sdr_name}
                    <Text color='gray' fw={500}>
                      <IconPointFilled size={'0.5rem'} style={{ marginRight: '5' }} />
                      {'5:04 PM'}
                    </Text>
                  </Text>
                  <Text size={'sm'} color='gray' fw={500}>
                    {'Hi Brandon'}
                  </Text>
                  <Text size={'sm'} color='gray' fw={500}>
                    {
                      "Hope you're doing great! Just wanted to quickly check in and see if you might have a few minutes to chat about some cool stuff we're working on."
                    }
                  </Text>
                  <Text size={'sm'} style={{ display: 'flex', gap: 5 }} color='gray' fw={500}>
                    You can pick a time that works for your here:{' '}
                    <Anchor href={userData.scheduling_link} target='_blank' fw={500}>
                      {userData.scheduling_link}
                    </Anchor>
                  </Text>
                  <Text size={'sm'} color='gray' fw={500}>
                    Looking forward to it!
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Card>
      {/* <Card>
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
      </Card> */}

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
