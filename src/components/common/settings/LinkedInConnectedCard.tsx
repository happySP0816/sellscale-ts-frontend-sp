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
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconBrandLinkedin,
  IconBriefcase,
  IconCloudDownload,
  IconCookie,
  IconKey,
  IconPassword,
  IconRefreshDot,
  IconSocial,
  IconX,
} from "@tabler/icons";
import { clearAuthTokens } from "@utils/requests/clearAuthTokens";
import { useRecoilState, useRecoilValue } from "recoil";
import { useQueryClient } from "@tanstack/react-query";
import LinkedInAuthOption from "./LinkedInAuthOption";
import { getBrowserExtensionURL } from "@utils/general";
import { useEffect, useState } from "react";
import getLiProfile from "@utils/requests/getLiProfile";

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

export default function LinkedInConnectedCard(props: { connected: boolean }) {
  const usingFirefox = navigator.userAgent.search("Firefox") >= 0;
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  const [loadingConnection, setLoadingConnection] = useState(false);
  const [liProfile, setLiProfile] = useState<null | any>(null);

  const { classes } = useStyles();

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Stack>
        <div>
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
                      if (result.status === "success") {
                        showNotification({
                          id: "linkedin-disconnect-success",
                          title: "Success",
                          message:
                            "You have successfully disconnected your LinkedIn account.",
                          color: "blue",
                          autoClose: 5000,
                        });
                      } else {
                        showNotification({
                          id: "linkedin-disconnect-failure",
                          title: "Failure",
                          message:
                            "There was an error disconnecting your LinkedIn account. Please contact an admin.",
                          color: "red",
                          autoClose: false,
                        });
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
              By being connected to LinkedIn, SellScale is able to send
              connections, read, and respond to your prospect conversations.
            </Text>
          ) : (
            <>
              <Text fz="sm" pt="xs">
                With our browser extension you can sync and automate your
                LinkedIn account directly with SellScale!
              </Text>
              {/* 
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
          */}
              <Center>
                <Button
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={getBrowserExtensionURL(usingFirefox)}
                  my={20}
                  variant="outline"
                  size="md"
                  color="green"
                  rightIcon={<IconCloudDownload size="1rem" />}
                >
                  Install {usingFirefox ? "Firefox" : "Chrome"} Extension
                </Button>
              </Center>
            </>
          )}
        </div>
        {props.connected && (
          <div>
            <Button
              variant="light"
              loading={loadingConnection}
              size="xs"
              leftIcon={<IconRefreshDot size="1rem" />}
              onClick={async () => {
                setLoadingConnection(true);
                const result = await getLiProfile(userToken);
                if (result.status === "success") {
                  setLoadingConnection(false);
                  console.log(result);
                  setLiProfile(result.extra);
                }
              }}
            >
              Check Connection
            </Button>
            {liProfile && (
              <Group noWrap spacing={10} align="flex-start" pt="xs">
                <Avatar
                  src={
                    liProfile.miniProfile.picture[
                      "com.linkedin.common.VectorImage"
                    ].rootUrl +
                    liProfile.miniProfile.picture[
                      "com.linkedin.common.VectorImage"
                    ].artifacts[2].fileIdentifyingUrlPathSegment
                  }
                  size={94}
                  radius="md"
                />
                <div>
                  <Title order={3}>
                    {liProfile.miniProfile.firstName}{" "}
                    {liProfile.miniProfile.lastName}
                  </Title>

                  <Group noWrap spacing={10} mt={3}>
                    <IconBriefcase
                      stroke={1.5}
                      size={16}
                      className={classes.icon}
                    />
                    <Text size="xs" color="dimmed">
                      {liProfile.miniProfile.occupation}
                    </Text>
                  </Group>

                  <Group noWrap spacing={10} mt={5}>
                    <IconSocial
                      stroke={1.5}
                      size={16}
                      className={classes.icon}
                    />
                    <Text
                      size="xs"
                      color="dimmed"
                      component="a"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.linkedin.com/in/${liProfile.miniProfile.publicIdentifier}`}
                    >
                      linkedin.com/in/{liProfile.miniProfile.publicIdentifier}
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
