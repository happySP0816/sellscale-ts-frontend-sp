import SlackbotSection from './SlackbotSection';
import SlackNotifications from './SlackNotifications';
import SlackWebhookSection from './SlackWebhookSection';

export default function SlackSettings() {
  return (
    <>
      <SlackbotSection />
      <SlackWebhookSection />
      <SlackNotifications />
    </>
  );
}
