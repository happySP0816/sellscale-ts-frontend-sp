import { Flex, Tabs, Text, Loader, Overlay } from '@mantine/core';
import SlackbotSection from './SlackbotSection';
import SlackWebhookSection from './SlackWebhookSection';
import { useState } from 'react';

export default function SlackSettings() {
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setPageLoading] = useState(false);

  return (
    <>
      {loading && (
        <Overlay opacity={0.6} color="#000" zIndex={999}>
          <Flex align="center" justify="center" style={{ height: '100vh' }}>
            <Loader size="lg" variant="dots" />
          </Flex>
        </Overlay>
      )}
      <Flex style={{ border: '1px solid #dee2e6', borderRadius: '6px' }} direction={'column'} p={'lg'} mx={'sm'} bg='white'>
        <Flex direction={'column'} px={'sm'} mb={'md'}>
          <Text fw={600} size={28}>
            Slack Connection
          </Text>
          <Text>Get real time alerts and visibility into company and people activities</Text>
        </Flex>
        <Tabs value={activeTab} defaultValue='setup'>
          <Tabs.List mx={'sm'}>
            <Tabs.Tab onClick={() => setActiveTab('setup')} value='setup'>Setup</Tabs.Tab>
            <Tabs.Tab onClick={() => setActiveTab('advanced_setup')} value='advanced_setup'>Advanced Setup</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='setup' pt={'sm'}>
            <SlackbotSection />
          </Tabs.Panel>
          <Tabs.Panel value='advanced_setup' pt={'sm'}>
            <SlackWebhookSection setActiveTab={setActiveTab} setPageLoading={setPageLoading} />
          </Tabs.Panel>
        </Tabs>
      </Flex>
    </>
  );
}
