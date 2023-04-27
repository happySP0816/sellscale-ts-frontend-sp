import { Card, Paper, TextInput, Text, Title, ActionIcon, Flex, Button, LoadingOverlay, Notification } from "@mantine/core";
import { IconCheck, IconEdit, IconX } from "@tabler/icons";
import { useState } from "react";

import { patchSchedulingLink } from "@utils/requests/patchSchedulingLink";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";


const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z]{2,})+(?:\/[\w\-\.\?\=\&]*)*$/i;


export default function CalendarAndScheduling() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [schedulingLink, setSchedulingLink] = useState<string>(userData.scheduling_link || '');

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
      })
      setIsLoading(false);
      return;
    } else if (!schedulingLink) {
      showNotification({
        title: 'Error',
        message: 'Please enter a URL',
        color: 'red',
        autoClose: 3000,
      })
      setIsLoading(false);
      return;
    } else if (schedulingLink === userData.scheduling_link) {
      showNotification({
        title: 'Error',
        message: 'Please enter a different URL',
        color: 'red',
        autoClose: 3000,
      })
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
      })
      setUserData({ ...userData, scheduling_link: schedulingLink });
      setIsEditing(false);
    } else {
      showNotification({
        title: 'Error',
        message: 'Could not update scheduling link, please try again or contact support',
        color: 'red',
        autoClose: 3000,
      })
    }
  }

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Title order={3}>Calendar and Scheduling</Title>
      <Card mt='md'>
        <LoadingOverlay visible={isLoading} />
        {
          userData.scheduling_link ?
            <Notification
              closeButtonProps={{ opacity: 0 }}
              icon={<IconCheck size="1.1rem" />}
              title="Scheduling link is set"
              bg={"gray"}
              color="green"
              mb="sm"
            /> :
            <Notification
              closeButtonProps={{ opacity: 0 }}
              icon={<IconX size="1.1rem" />}
              title="Scheduling link is not set"
              bg={"gray"}
              color="red"
              mb="sm"
            />
        }
        <Text fz='lg' fw='bold'>Scheduling Link</Text>
        <Text mt='sm' fz='sm'>Whenever SellScale AI detects a high propensity prospect who is interested in scheduling a time with you, the AI will use this link to book on your calendar.</Text>
        <Text mt='xs' fz='xs'>Needs to be a valid URL (Calendly, Chron, Hubspot, etc).</Text>
        <TextInput
          mt='sm'
          label="Scheduling Link"
          placeholder="https://calendly.com/yourname"
          value={schedulingLink}
          error={error}
          disabled={!isEditing}
          onChange={handleUrlChange}
          withAsterisk
        />
        {!isEditing &&
          <Flex justify='flex-end' mt='xs'>
            <ActionIcon color='dark' variant='transparent' onClick={() => setIsEditing(true)}>
              <IconEdit size="1.125rem" />
            </ActionIcon>
          </Flex>
        }
        {isEditing &&
          <Flex justify='space-between' mt='sm'>
            <Button
              variant='light'
              color='red'
              onClick={() => {
                setIsEditing(false)
                setError('')
                setSchedulingLink(userData.scheduling_link || '')
              }}
            >
              Cancel
            </Button>
            <Button
              variant='light'
              color='green'
              onClick={triggerPatchSchedulingLink}
            >
              Save
            </Button>
          </Flex>
        }
      </Card>
    </Paper>
  )
}