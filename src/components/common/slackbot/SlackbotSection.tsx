import { Title, Text, Paper, Container } from '@mantine/core';

export default function SlackbotSection() {
  return (
    <Paper withBorder m='xs' p='md' radius='md'>
      <Title order={2}>Integrate SellScale with your Slack</Title>
      <Text>With our Slack bot, you can view and manage your outbound all from within Slack!</Text>

      <Container mt='sm'>
        <a href='https://slack.com/oauth/v2/authorize?client_id=3939139709313.5400273876564&scope=commands,chat:write,chat:write.public&user_scope='>
          <img
            alt='Add to Slack'
            height='40'
            width='139'
            src='https://platform.slack-edge.com/img/add_to_slack.png'
            srcSet='https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x'
          />
        </a>
      </Container>
    </Paper>
  );
}
