import FlexSeparate from "@common/library/FlexSeparate";
import {
  ActionIcon,
  Badge,
  Text,
  CloseButton,
  Group,
  Paper,
  Title,
  Stack,
  Button,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconCloudDownload,
  IconCookie,
  IconKey,
  IconPassword,
  IconX,
} from "@tabler/icons";
import LinkedInAuthOption from "./LinkedInAuthOption";

export default function LinkedInConnectedCard(props: { connected: boolean }) {
  const usingFirefox = navigator.userAgent.search("Firefox") >= 0;

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Group>
        <Title order={3}>LinkedIn Account</Title>
        {props.connected ? (
          <Badge
            size="xl"
            variant="filled"
            color="blue"
            pr={3}
            rightSection={
              <ActionIcon
                size="xs"
                color="blue"
                radius="xl"
                variant="transparent"
              >
                <IconX size={15} />
              </ActionIcon>
            }
            styles={{ root: { textTransform: "initial" } }}
          >
            Connected
          </Badge>
        ) : (
          <Badge
            size="xl"
            variant="filled"
            color="red"
            styles={{ root: { textTransform: "initial" } }}
          >
            Not Connected
          </Badge>
        )}
      </Group>
      {props.connected ? (
        <Text fz="sm" pt="xs">
          By being connected to LinkedIn, SellScale is able to send connections,
          read, and respond to your prospect conversations.
        </Text>
      ) : (
        <>
          <Text fz="sm" pt="xs">
            Connect to LinkedIn to let our systems automatically send outreach
            and start conversations for you!
          </Text>
          <Stack pt="lg">

            <LinkedInAuthOption
              num={1}
              time="~30 seconds"
              text="Enter LinkedIn credentials"
              button={
                <Button
                  variant="light"
                  size="xs"
                  rightIcon={<IconKey size="1rem" />}
                  onClick={() => {
                    openContextModal({
                      modal: 'sendLinkedInCredentials',
                      title: (<Title order={3}>LinkedIn Credentials</Title>),
                      innerProps: {},
                    });
                  }}
                >
                  Enter credentials
                </Button>
              }
            />

            <LinkedInAuthOption
              num={2}
              time="~3 minutes"
              text="Manually paste in Cookie"
              button={
                <Button
                  variant="light"
                  size="xs"
                  rightIcon={<IconCookie size="1rem" />}
                  onClick={() => {
                    openContextModal({
                      modal: 'sendLinkedInCookie',
                      title: (<Title order={3}>Find Your LinkedIn Cookie</Title>),
                      innerProps: {},
                    });
                  }}
                >
                  View instructions
                </Button>
              }
            />

            <LinkedInAuthOption
              num={3}
              time="coming soon"
              text={`Install ${usingFirefox ? "Firefox" : "Chrome"} Extension`}
              button={
                <Button
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled
                  href={
                    usingFirefox
                      ? "https://addons.mozilla.org/en-US/firefox/extensions/"
                      : "https://chrome.google.com/webstore/category/extensions"
                  }
                  variant="light"
                  size="xs"
                  rightIcon={<IconCloudDownload size="1rem" />}
                >
                  Install Extension
                </Button>
              }
            />
          </Stack>
        </>
      )}
    </Paper>
  );
}
