import { userDataState, userTokenState } from '@atoms/userAtoms';
import { Title, Text, Paper, Container, TextInput, Button, Loader, Flex } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { getSDR } from '@utils/requests/getClientSDR';
import { patchSlackWebhook } from '@utils/requests/patchSlackWebhook';
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
      <Title order={3}>Add custom Slack Webhook</Title>
      <Text>We provide Slack connection channels to send you alerts, but if you have a custom Webhook for your channel, add it here.</Text>

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
      </Flex>

    </Paper>
  );
}
