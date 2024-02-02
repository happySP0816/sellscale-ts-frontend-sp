import { Flex, Tabs, Text } from '@mantine/core';
import SlackbotSection from './SlackbotSection';
import SlackWebhookSection from './SlackWebhookSection';

export default function SlackSettings() {
  return (
    <>
      <Flex style={{ border: '1px solid #dee2e6', borderRadius: '6px' }} direction={'column'} p={'lg'} mx={'sm'} bg='white'>
        <Flex direction={'column'} px={'sm'} mb={'md'}>
          <Text fw={600} size={28}>
            Slack Connection
          </Text>
          <Text>Get real time alerts and visibility into company and people activities</Text>
        </Flex>
        <Tabs defaultValue='setup'>
          <Tabs.List mx={'sm'}>
            <Tabs.Tab value='setup'>Setup</Tabs.Tab>
            <Tabs.Tab value='advanced_setup'>Advanced Setup</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='setup' pt={'sm'}>
            <SlackbotSection />
          </Tabs.Panel>
          <Tabs.Panel value='advanced_setup' pt={'sm'}>
            <SlackWebhookSection />
          </Tabs.Panel>
        </Tabs>
      </Flex>
    </>
  );
}
