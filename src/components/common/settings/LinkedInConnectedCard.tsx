import { userTokenState } from "@atoms/userAtoms";
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
import { showNotification } from "@mantine/notifications";
import {
  IconCloudDownload,
  IconCookie,
  IconKey,
  IconPassword,
  IconX,
} from "@tabler/icons";
import { clearAuthTokens } from "@utils/requests/clearAuthTokens";
import { useRecoilValue } from "recoil";
import { useQueryClient } from "@tanstack/react-query";
import LinkedInAuthOption from "./LinkedInAuthOption";

export default function LinkedInConnectedCard(props: { connected: boolean }) {
  const usingFirefox = navigator.userAgent.search("Firefox") >= 0;
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

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
                onClick={async () => {
                  const result = await clearAuthTokens(userToken);
                  if(result.status === 'success'){
                    showNotification({
                      id: 'linkedin-disconnect-success',
                      title: 'Success',
                      message: 'You have successfully disconnected your LinkedIn account.',
                      color: 'blue',
                      autoClose: 5000,
                    });
                  } else {
                    showNotification({
                      id: 'linkedin-disconnect-failure',
                      title: 'Failure',
                      message: 'There was an error disconnecting your LinkedIn account. Please contact an admin.',
                      color: 'red',
                      autoClose: false,
                    })
                  }
                  queryClient.invalidateQueries({
                    queryKey: ["query-get-linkedin-connected"],
                  });
                }}
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
              time="~3 seconds"
              text={`Install ${usingFirefox ? "Firefox" : "Chrome"} Extension`}
              button={
                <Button
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={
                    usingFirefox
                      ? "https://addons.mozilla.org/en-US/firefox/addon/sellscale-browser-extension/"
                      : "https://chrome.google.com/webstore/detail/sellscale-browser-extensi/hicchmdfaadkadnmmkdjmcilgaplfeoa/"
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
