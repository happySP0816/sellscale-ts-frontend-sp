import { Title, Text, Paper, Container, Checkbox, Stack, Flex } from '@mantine/core';

export default function SlackNotifications() {
  return (
    <Paper withBorder m='xs' p='md' radius='md'>
      <Title order={5}>Customize Notifications - Coming Soon</Title>
      <Flex>
        <Flex w='50%' direction='column' mt='xs'>
          <Text>LinkedIn</Text>
          <Stack mt='md'>
            <Checkbox
              label="Accepted Notifications"
              defaultChecked
              disabled
            />
            <Checkbox
              label="Replied Notifications"
              disabled
            />
            <Checkbox
              label="Demo Set Notifications"
              disabled
            />
            <Checkbox
              label="AI Responses Notifications"
              disabled
            />
          </Stack>
        </Flex>
        <Flex w='50%' direction='column' mt='xs'>
          <Text>Email</Text>
          <Stack mt='md'>
            <Checkbox
              label="Opened Notifications"
              defaultChecked
              disabled
            />
            <Checkbox
              label="Replied Notifications"
              disabled
            />
            <Checkbox
              label="Demo Set Notifications"
              disabled
            />
            <Checkbox
              label="AI Responses Notifications"
              disabled
            />
          </Stack>
        </Flex>
      </Flex>
    </Paper>
  );
}
