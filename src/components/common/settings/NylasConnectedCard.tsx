import { userDataState, userTokenState } from "@atoms/userAtoms";
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
  Center,
  createStyles,
  Avatar,
  Container,
  LoadingOverlay,
  Loader,
  useMantineTheme,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconBrandLinkedin,
  IconBriefcase,
  IconCloudDownload,
  IconCookie,
  IconKey,
  IconMail,
  IconPassword,
  IconPlugConnected,
  IconRefreshDot,
  IconSocial,
  IconX,
} from "@tabler/icons";
import { clearAuthTokens } from "@utils/requests/clearAuthTokens";
import { useRecoilState, useRecoilValue } from "recoil";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LinkedInAuthOption from "./LinkedInAuthOption";
import { formatToLabel, getBrowserExtensionURL, nameToInitials, valueToColor } from "@utils/general";
import { useEffect, useState } from "react";
import getLiProfile from "@utils/requests/getLiProfile";
import getNylasClientID from "@utils/requests/getNylasClientID";
import { clearNylasTokens } from "@utils/requests/clearNylasTokens";
import getNylasAccountDetails from "@utils/requests/getNylasAccountDetails";

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

const REDIRECT_URI = `${window.location.origin}/settings`;

export default function NylasConnectedCard(props: { connected: boolean }) {
  
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  const { classes } = useStyles();

  const { data: nylasClientId, isFetching } = useQuery({
    queryKey: [`nylas-profile-self`],
    queryFn: async () => {
      const result = await getNylasClientID(userToken);
      return result.status === "success" ? result.data : null;
    },
  });

  const { data } = useQuery({
    queryKey: [`nylas-account-details`],
    queryFn: async () => {
      const result = await getNylasAccountDetails(userToken);
      return result.status === "success" ? result.data : null;
    },
  });

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Stack>
        <div>
          <Group>
            <Title order={3}>Email and Calendar Integration</Title>
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
                      const result = await clearNylasTokens(userToken);
                      if (result.status === "success") {
                        showNotification({
                          id: "nylas-disconnect-success",
                          title: "Success",
                          message:
                            "You have successfully disconnected your email.",
                          color: "blue",
                          autoClose: 5000,
                        });
                      } else {
                        showNotification({
                          id: "nylas-disconnect-failure",
                          title: "Failure",
                          message:
                            "There was an error disconnecting your email. Please contact an admin.",
                          color: "red",
                          autoClose: false,
                        });
                      }
                      queryClient.invalidateQueries({
                        queryKey: ["query-get-accounts-connected"],
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
              By connecting your email, SellScale is able to manage, read, and respond to your contact's conversations.
            </Text>
          ) : (
            <>
              <Text fz="sm" pt="xs">
                By connecting your email, SellScale is able to manage, read, and respond to your contact's conversations.
              </Text>
              <Center>
                <Button
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={nylasClientId ? `https://api.nylas.com/oauth/authorize?client_id=${nylasClientId}&redirect_uri=${REDIRECT_URI}&response_type=code` : ''}
                  my={20}
                  variant="outline"
                  size="md"
                  color="pink"
                  rightIcon={<IconPlugConnected size="1rem" />}
                  loading={isFetching}
                >
                  Connect Email & Calendar
                </Button>
              </Center>
            </>
          )}
        </div>

        {props.connected && (
          <div>
            {!data && (
              <Center w="100%" h={100}>
                <Stack align="center">
                  <Loader variant="dots" size="xl" />
                  <Text c="dimmed" fz="sm" fs="italic">Fetching Email details...</Text>
                </Stack>
              </Center>
            )}
            {data && (
              <Group noWrap spacing={10} align="flex-start" pt="xs">
                <Avatar
                  src=""
                  color={valueToColor(theme, `${data.name}, ${data.email_address}`)}
                  size={94}
                  radius="md"
                >{nameToInitials(data.name)}</Avatar>
                <div>
                  <Title order={3}>
                    {data.name}
                  </Title>

                  <Group noWrap spacing={10} mt={3}>
                    <IconSocial
                      stroke={1.5}
                      size={16}
                      className={classes.icon}
                    />
                    <Text size="xs" color="dimmed">
                      {formatToLabel(data.provider)}
                    </Text>
                  </Group>

                  <Group noWrap spacing={10} mt={5}>
                    <IconMail
                      stroke={1.5}
                      size={16}
                      className={classes.icon}
                    />
                    <Text
                      size="xs"
                      color="dimmed"
                      component="a"
                      href={`mailto:${data.email_address}`}
                    >
                      {data.email_address}
                    </Text>
                  </Group>
                </div>
              </Group>
            )}
          </div>
        )}
      </Stack>
    </Paper>
  );
}
