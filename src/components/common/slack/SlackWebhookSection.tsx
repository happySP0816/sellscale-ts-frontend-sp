import { userDataState, userTokenState } from '@atoms/userAtoms';
import { Title, Text, Paper, Container, TextInput, Button, Loader, Flex, Box } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { getSDR } from '@utils/requests/getClientSDR';
import { patchSlackWebhook } from '@utils/requests/patchSlackWebhook';
import { sendTestSlackWebhook } from '@utils/requests/sendTestSlackWebhook';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

export default function SlackbotSection() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [loading, setLoading] = useState<boolean>(false);

  const [webhook, setWebhook] = useState<string>(userData.pipeline_notifications_webhook_url);

  const triggerPatchSlackWebhook = async () => {
    setLoading(true)

    const result = await patchSlackWebhook(userToken, webhook)
    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Slack Webhook updated',
        color: 'green',
        autoClose: 5000,
      })
    } else {
      showNotification({
        title: 'Error',
        message: 'Slack Webhook not updated',
        color: 'red',
        autoClose: 5000,
      })
    }
    triggerGetSDR()

    setLoading(false)
  }

  const triggerSendSlackWebhook = async () => {
    setLoading(true)

    const result = await sendTestSlackWebhook(userToken)
    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Sent notification to Slack',
        color: 'green',
        autoClose: 5000,
      })
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to send notification to Slack',
        color: 'red',
        autoClose: 5000,
      })
    }

    setLoading(false)
  }

  const triggerGetSDR = async () => {
    setLoading(true)

    const result = await getSDR(userToken)
    if (result.status === 'success') {
      setUserData({ userData, ...result.data.sdr_info, pipeline_notifications_webhook_url: result.data.sdr_info.pipeline_notifications_webhook_url || '' })
    }

    setLoading(false)
  }

  useEffect(() => {
    triggerGetSDR()
  }, [])

  return (
    <Paper withBorder m='xs' p='md' radius='md'>
      <Title order={3}>Setup Slack Channel for Company Pipeline</Title>
      <Text>Set up a company pipeline channel via Slack below to let users known of live notifications.</Text>

      <Flex direction='column'>
        {
          loading ? <Loader variant='dots' mt='md'/> :
            <TextInput mt='sm'
              value={webhook}
              placeholder='https://hooks.slack.com/services/...'
              onChange={(event) => setWebhook(event.currentTarget.value)}
              error={webhook && (webhook?.startsWith("https://hooks.slack.com/services/") ? false : 'Please enter a valid Slack Webhook URL')}
            />
        }

        <Button
          disabled={webhook === userData.pipeline_notifications_webhook_url}
          mt='md'
          onClick={() => triggerPatchSlackWebhook()}
          loading={loading}
        >
          Save
        </Button>

        {userData.pipeline_notifications_webhook_url && (
          <Box>
            <Button onClick={triggerSendSlackWebhook}>
              Send Test Notification
            </Button>
          </Box>
        )}
      </Flex>

    </Paper>
  );
}
