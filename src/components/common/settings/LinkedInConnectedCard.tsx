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
  Flex,
  Card,
  Tooltip,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LinkedInAuthOption from "./LinkedInAuthOption";
import { getBrowserExtensionURL, proxyURL } from "@utils/general";
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
  const userData = useRecoilValue(userDataState);
  console.log('userData', userData)

  const [loadingConnection, setLoadingConnection] = useState(false);
  const [liProfile, setLiProfile] = useState<null | any>(null);

  const { classes } = useStyles();

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`li-profile-self`],
    queryFn: async () => {
      const result = await getLiProfile(userToken);
      return result.status === "success" ? result.data : null;
    },
  });

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Stack>
        <div>
          <Group>
            <Title order={3}>LinkedIn Integration</Title>
            {props.connected ? (
              <Badge
                size="xl"
                variant="filled"
                color="blue"
                pr={3}
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="white"
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
              By being connected to LinkedIn, SellScale is able to send
              connections, read, and respond to your contact's conversations.
            </Text>
          ) : (
            <>
              <Text fz="sm" pt="xs">
                With our browser extension you can sync and automate your
                LinkedIn account directly with SellScale!
              </Text>
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
            {!data && (
              <Center w="100%" h={100}>
                <Stack align="center">
                  <Loader variant="dots" size="xl" />
                  <Text c="dimmed" fz="sm" fs="italic">Fetching LinkedIn details...</Text>
                </Stack>
              </Center>
            )}
            {data && (
              <Card withBorder shadow="sm">
                <Group noWrap spacing={10} align="flex-start" pt="xs">
                  <Avatar
                    src={
                      proxyURL(data.miniProfile.picture["com.linkedin.common.VectorImage"]
                        .rootUrl +
                        data.miniProfile.picture["com.linkedin.common.VectorImage"]
                          .artifacts[2].fileIdentifyingUrlPathSegment)
                    }
                    size={94}
                    radius="md"
                  />
                  <div>
                    <Title order={3}>
                      {data.miniProfile.firstName} {data.miniProfile.lastName}
                    </Title>

                    <Group noWrap spacing={10} mt={3}>
                      <IconBriefcase
                        stroke={1.5}
                        size={16}
                        className={classes.icon}
                      />
                      <Text size="xs" color="dimmed">
                        {data.miniProfile.occupation}
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
                        href={`https://www.linkedin.com/in/${data.miniProfile.publicIdentifier}`}
                      >
                        linkedin.com/in/{data.miniProfile.publicIdentifier}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Card>
            )}
            <Flex mt='lg' direction='column'>
              <Flex align='center'>
                <Title order={3}>
                  Warming Status:
                </Title>
                <Flex ml='md'>
                  {
                    userData.warmup_linkedin_complete ? (
                      <Tooltip label="Your LinkedIn account is sending at full capacity!" withArrow withinPortal>
                        <Badge size='lg' color='green'>
                          Fully Warm
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Tooltip label='Your LinkedIn account is still being warmed up' withArrow withinPortal>
                        <Badge size='lg' color='orange'>
                          Warming Up
                        </Badge>
                      </Tooltip>
                    )
                  }
                </Flex>
              </Flex>
              <Flex mt='xs'>
                <Text fw='bold'>Current LinkedIn volume:</Text>
                <Text ml='md' fw='bold'>{userData.weekly_li_outbound_target} connections per week</Text>
              </Flex>
              <Text mt='xs'>In order to protect your LinkedIn, our AI follows a set of outbound heuristics specific to your account. This enables us to slowly "warm up" your LinkedIn account before sending full volume outbound.</Text>
              <Text mt='xs'>The following is your "warm up" schedule, if you would like to make adjustments, please contact a SellScale team member:</Text>
              <Text mt='md'>
                <ul>
                  <Flex>
                    <Text fw='bold' w='150px'>Week 0:</Text>
                    <Text>
                      {userData.warmup_linkedin_schedule?.week_0_sla || 5} connections
                    </Text>
                  </Flex>
                </ul>
                <ul>
                  <Flex>
                  <Text fw='bold' w='150px'>Week 1:</Text>
                    <Text>
                      {userData.warmup_linkedin_schedule?.week_1_sla || 25} connections
                    </Text>
                  </Flex>
                </ul>
                <ul>
                  <Flex>
                  <Text fw='bold' w='150px'>Week 2:</Text>
                    <Text>
                      {userData.warmup_linkedin_schedule?.week_2_sla || 50} connections
                    </Text>
                  </Flex>
                </ul>
                <ul>
                  <Flex>
                  <Text fw='bold' w='150px'>Week 3:</Text>
                    <Text>
                      {userData.warmup_linkedin_schedule?.week_3_sla || 75} connections
                    </Text>
                  </Flex>
                </ul>
                <ul>
                  <Flex>
                  <Text fw='bold' w='150px'>Week 4:</Text>
                    <Text>
                      {userData.warmup_linkedin_schedule?.week_4_sla || 90} connections
                    </Text>
                  </Flex>
                </ul>


              </Text>
            </Flex>
          </div>
        )}
      </Stack>
    </Paper>
  );
}
