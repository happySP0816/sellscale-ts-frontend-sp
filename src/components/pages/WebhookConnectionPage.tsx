import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Divider, Flex, Text, Title, TextInput, Switch, Code, Paper, Group, Collapse, SimpleGrid, Loader } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { userTokenState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';

const eventTypes = [
  { label: 'On Demo Set', value: 'on_demo_set', subtitle: 'When a demo is set with a prospect', disabled: false, apiEndpoint: '/set_on_demo_set_webhook', getEndpoint: '/get_client_webhooks' },
  // Add the other event types here with their respective endpoints if available
];

const examplePayload = `{
  "prospect_full_name": "John Doe",
  "prospect_email": "johndoe@example.com",
  "prospect_linkedin_url": "https://linkedin.com/in/johndoe",
  "prospect_title": "Software Engineer",
  "prospect_location": "San Francisco, CA",
  "prospect_status": "Interested",
  "company": "Tech Innovations Inc.",
  "company_url": "https://techinnovations.com",
  "company_location": "San Francisco, CA",
  "company_colloquialized_name": "Tech Innovations"
}`;

const WebhookConnectionPage = () => {
  const [webhookUrls, setWebhookUrls]: any = useState({ on_demo_set: '' });
  const [isLoading, setIsLoading] = useState(true);
  const userToken = useRecoilValue(userTokenState);

  const [showInstructions, setShowInstructions] = useState(false);
const [showExamplePayload, setShowExamplePayload] = useState(false);

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await fetch(`${API_URL}/webhooks/get_client_webhooks`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        setWebhookUrls((current: any) => ({ ...current, on_demo_set: data.on_demo_set || '' }));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch webhooks", error);
        setIsLoading(false);
      }
    };

    fetchWebhooks();
  }, []);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>, eventType: string) => {
    setWebhookUrls({ ...webhookUrls, [eventType]: event.target.value });
  };

  const saveWebhookUrl = async (eventType: string) => {
    const event = eventTypes.find(e => e.value === eventType);
    if (event && event.apiEndpoint) {
      try {
        const response = await fetch(`${API_URL}/webhooks${event.apiEndpoint}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ [`${eventType}_webhook`]: webhookUrls[eventType] }),
        });
        if (response.ok) {
          showNotification({ title: 'Success', message: 'Webhook URL saved successfully', color: 'teal' });
        } else {
            showNotification({ title: 'Error', message: 'Failed to save webhook URL', color: 'red' });
        }
      } catch (error) {
        console.error("Failed to save webhook URL", error);
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  console.log(webhookUrls);

  return (
    <Card>
      <Title order={1} mb="md">Webhook Connections</Title>
        <Text size="sm" mb="lg">
            Webhooks allow external services to be notified when certain events happen. Below, you can set up and manage webhook URLs for different events.
        </Text>

        <Flex>
            <Button variant="light" color="blue" mb="md" onClick={() => {setShowInstructions(!showInstructions); setShowExamplePayload(false)}}>
                What is a webhook?
            </Button>
            <Button ml='xs' variant="light" color="green" onClick={() => {setShowExamplePayload(!showExamplePayload); setShowInstructions(false)}}>
                Show Example Payload
            </Button>
        </Flex>
        <Box mt='xs' mb='xs'>
            <Collapse in={showInstructions}>
                <Paper shadow="xs" p="md" withBorder>
                Webhooks are user-defined HTTP callbacks that are triggered by specific events. When such an event occurs, the source site makes an HTTP request to the URL configured for the webhook. This allows for real-time data transmission between applications.
                </Paper>
            </Collapse>
            <Collapse in={showExamplePayload}>
                <Prism language="json" colorScheme="dark">
                    {examplePayload}
                </Prism>
            </Collapse>
        </Box>

        <Group position="center">
            
        </Group>
        

        <SimpleGrid cols={1} spacing="lg">
        {eventTypes.map((eventType) => (
          <Card key={eventType.value} shadow="sm" p="lg" withBorder>
            <Flex align="center" justify="space-between" mb="md">
              <Box>
                <Text weight={500}>{eventType.label} {
                  eventType.disabled && "(Coming soon ⚠️)"
                }</Text>
                <Text size="sm" color="gray">
                  {eventType.subtitle}
                </Text>
              </Box>
            </Flex>
            <Flex>
              <TextInput
                w="100%"
                placeholder="Enter webhook URL"
                value={webhookUrls[eventType.value]}
                onChange={(event) => handleUrlChange(event, eventType.value)}
                disabled={eventType.disabled}
              />
              <Button ml='xs' onClick={() => saveWebhookUrl(eventType.value)}>
                Save
              </Button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
    </Card>
  );
};

export default WebhookConnectionPage;