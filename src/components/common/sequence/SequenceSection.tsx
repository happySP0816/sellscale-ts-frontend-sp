import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import ProspectSelect from "@common/library/ProspectSelect";
import { API_URL } from "@constants/data";
import {
  Group,
  Box,
  Paper,
  Stack,
  ActionIcon,
  Text,
  Divider,
  Title,
  Card,
  Badge,
  Button,
  Avatar,
  useMantineTheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import {
  IconDots,
  IconMessages,
  IconPencil,
  IconReload,
} from "@tabler/icons-react";
import { proxyURL, valueToColor, nameToInitials, testDelay } from "@utils/general";
import getLiProfile from "@utils/requests/getLiProfile";
import _, { set } from "lodash";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

export default function SequenceSection() {
  const [activeCard, setActiveCard] = useState(0);
  return (
    <Card padding="lg" radius="md" withBorder>
      <Group
        position="apart"
        p="xs"
        spacing={0}
        sx={{ alignItems: "flex-start" }}
      >
        <Box sx={{ flexBasis: "35%" }}>
          <Stack>
            <FrameworkCard
              title="Invite Request"
              bodyTitle="Intro Message"
              bodyText="Say hello and introduce myself as a sales rep"
              active={activeCard === 0}
              onClick={() => setActiveCard(0)}
            />
            <Text c="dimmed" ta="center" fz="sm">
              ------- After accepting invite -------
            </Text>
            <FrameworkCard
              title="Step 1"
              badgeText="If no reply from prospect."
              bodyTitle="Follow Up #1"
              bodyText="Say hello and introduce myself as a sales rep"
              footer={
                <Text fz={14}>
                  wait for{" "}
                  <Text fw={550} span>
                    3
                  </Text>{" "}
                  days, then:
                </Text>
              }
              active={activeCard === 1}
              onClick={() => setActiveCard(1)}
              onClickEdit={() => {
                console.log("clicked edit");
              }}
            />
            <FrameworkCard
              title="Step 2"
              badgeText="If no reply from prospect."
              bodyTitle="Follow Up #2"
              bodyText="Say hello and introduce myself as a sales rep"
              footer={
                <Text fz={14}>
                  wait for{" "}
                  <Text fw={550} span>
                    3
                  </Text>{" "}
                  days, then:
                </Text>
              }
              active={activeCard === 2}
              onClick={() => setActiveCard(2)}
              onClickEdit={() => {
                console.log("clicked edit");
              }}
            />
            <FrameworkCard
              title="Step 3"
              badgeText="If no reply from prospect."
              bodyTitle="Follow Up #3"
              bodyText="Say hello and introduce myself as a sales rep"
              active={activeCard === 3}
              onClick={() => setActiveCard(3)}
              onClickEdit={() => {
                console.log("clicked edit");
              }}
            />
          </Stack>
        </Box>
        <Box sx={{ flexBasis: "65%" }}>
          <IntroMessageSection />
        </Box>
      </Group>
    </Card>
  );
}

function IntroMessageSection() {
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) return <></>;
  return (
    <Stack ml="xl" spacing={0}>
      <Group position="apart">
        <Group>
          <Title order={3}>Intro Message</Title>
          <Badge color="green">4 CTAs Active</Badge>
        </Group>
        <ProspectSelect personaId={currentProject.id} onChange={() => {}} />
      </Group>
      <Box my={5}>
        <Text fz="xs" c="dimmed">
          Your initial outreach message on LinkedIn, this message has a 300
          character limit.
        </Text>
      </Box>
      <Stack pt={20} spacing={5}>
        <Group position="apart">
          <Text fz="sm" fw={500} c="dimmed">
            EXAMPLE MESSAGE:
          </Text>
          <Button
            size="xs"
            variant="light"
            leftIcon={<IconReload size="1.1rem" />}
          >
            REGENERATE
          </Button>
        </Group>
        <LiExampleInvitation message="Once upon a time, in a small village nestled between rolling hills and dense forests, there lived a young girl named Eliza. She was known throughout the village for her boundless curiosity and adventurous spirit. Eliza's favorite place in the world was the forest that bordered her village. She spent her days exploring the woods, discovering hidden streams, and befriending the creatures that called it home." />
        <Group mt='sm' position="apart">
          <Group spacing={5}>
          <Button size='xs'>Edit CTAs</Button>
          <Button color='green' variant="outline" size='xs'>Edit Personalization Settings</Button>
          </Group>
          <Button radius='xl' size='xs'>Train Your AI</Button>
        </Group>
      </Stack>
    </Stack>
  );
}

function LiExampleInvitation(props: { message: string }) {
  const MAX_MESSAGE_SHOW_LENGTH = 75;

  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [liSDR, setLiSDR] = useState<any>();
  const [showFullMessage, setShowFullMessage] = useState(true);

  const {hovered: startHovered, ref: startRef} = useHover();
  const {hovered: endHovered, ref: endRef} = useHover();

  useEffect(() => {
    (async () => {
      const result = await getLiProfile(userToken);
      if (result.status === "success") {
        setLiSDR(result.data);
      }
    })();
  }, []);



  // Animation for typing
  const [curMessage, setCurMessage] = useState("");
  const animationPlaying = useRef(false);
  useEffect(() => {
    if(animationPlaying.current) return;
    setCurMessage("");
    (async () => {
      animationPlaying.current = true;
      const orginalMessage = props.message.trim();
      for(let i = 0; i < orginalMessage.length; i++) {
        await testDelay(i === orginalMessage.length - 1 ? 300 : 2);
        setCurMessage((prev) => {
          return prev+orginalMessage[i];
        });
      }
      animationPlaying.current = false;
    })();
  }, [liSDR]);


  // Get SDR data from LinkedIn 
  const imgURL =
    liSDR?.miniProfile.picture["com.linkedin.common.VectorImage"].rootUrl +
    liSDR?.miniProfile.picture["com.linkedin.common.VectorImage"].artifacts[
      liSDR?.miniProfile.picture["com.linkedin.common.VectorImage"].artifacts
        .length - 1
    ].fileIdentifyingUrlPathSegment;
  const name = liSDR?.miniProfile.firstName + " " + liSDR?.miniProfile.lastName;
  const title = liSDR?.miniProfile.occupation;

  // Split message into start and CTA (and handle cut off)
  let message = props.message.trim();
  const sentences = message.split(/(?<=[.!?])\s+/gm);

  let endMessage = sentences[sentences.length - 1];
  let startMessage = message.replace(endMessage, "");

  let cutEndMessage = endMessage;
  let cutStartMessage = startMessage;
  if (startMessage.length <= MAX_MESSAGE_SHOW_LENGTH) {
    cutEndMessage = _.truncate(endMessage, {
      length: MAX_MESSAGE_SHOW_LENGTH - startMessage.length,
    });
  } else {
    cutStartMessage = _.truncate(startMessage, {
      length: MAX_MESSAGE_SHOW_LENGTH,
    });
    cutEndMessage = "";
  }

  endMessage = endMessage.trim();
  startMessage = startMessage.trim();
  cutEndMessage = cutEndMessage.trim();
  cutStartMessage = cutStartMessage.trim();

  // Trim for animation playing
  if(animationPlaying.current) {
    if(curMessage.length > startMessage.length) {
      endMessage = _.truncate(endMessage, {
        length: curMessage.length - startMessage.length,
        omission: '█',
      });
    } else {
      startMessage = _.truncate(startMessage, {
        length: curMessage.length,
        omission: '█',
      });
      endMessage = '';
    }
  }

  return (
    <Box
      sx={{
        border: "1px dashed #339af0",
        borderRadius: "0.5rem",
      }}
      p="sm"
      h={250}
    >
      <Group spacing={10} sx={{ alignItems: "flex-start" }} noWrap>
        <Box w={55}>
          <Avatar
            src={proxyURL(imgURL)}
            alt={`${name}'s Profile Picture`}
            color={valueToColor(theme, name)}
            radius="xl"
            size="lg"
          >
            {nameToInitials(name)}
          </Avatar>
        </Box>
        <Stack w="100%">
          <Group position="apart" noWrap>
            <Box>
              <Text fw={550}>{name}</Text>
              <Text fz="xs" c="dimmed" truncate>
                {_.truncate(title, { length: 65 })}
              </Text>
            </Box>
            <Group spacing={0}>
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                radius="xl"
                sx={{
                  cursor: "not-allowed",
                }}
              >
                Ignore
              </Button>
              <Button
                size="xs"
                variant="outline"
                radius="xl"
                sx={{
                  cursor: "not-allowed",
                }}
              >
                Accept
              </Button>
            </Group>
          </Group>
          <Box
            sx={{
              border: "2px solid #e2e2e2",
              borderRadius: "0.5rem",
              position: "relative",
            }}
            px="sm"
            pt="sm"
            pb={5}
          >
            <ActionIcon
              sx={{
                position: "absolute",
                top: 5,
                right: 5,
                cursor: "not-allowed",
              }}
              radius="xl"
            >
              <IconDots size="1.125rem" />
            </ActionIcon>
            <Box>
              {showFullMessage || animationPlaying.current ? (
                <Text fz="xs">
                  <Text ref={startRef} span
                    sx={{
                      color: startHovered || animationPlaying.current ? theme.colors.green[8] : undefined,
                      backgroundColor: startHovered || animationPlaying.current ? theme.colors.green[0] : undefined,
                      cursor: 'pointer',
                    }}
                  >{startMessage}</Text>
                  <Text ref={endRef} ml={5} span
                    sx={{
                      color: endHovered || animationPlaying.current ? theme.colors.blue[8] : undefined,
                      backgroundColor: endHovered || animationPlaying.current ? theme.colors.blue[0] : undefined,
                      cursor: 'pointer',
                    }}
                  >{endMessage}</Text>
                  <Text
                    ml={5}
                    fw={600}
                    onClick={() => setShowFullMessage(false)}
                    sx={{
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    span
                  >
                    See less
                  </Text>
                </Text>
              ) : (
                <Text fz="xs">
                  <Text ref={startRef} span
                    sx={{
                      color: startHovered ? theme.colors.green[8] : undefined,
                      backgroundColor: startHovered ? theme.colors.green[0] : undefined,
                      cursor: 'pointer',
                    }}
                  >{cutStartMessage}</Text>
                  <Text ref={endRef} ml={5} span
                    sx={{
                      color: endHovered ? theme.colors.blue[8] : undefined,
                      backgroundColor: endHovered ? theme.colors.blue[0] : undefined,
                      cursor: 'pointer',
                    }}
                  >{cutEndMessage}</Text>
                  <Text
                    ml={5}
                    fw={600}
                    onClick={() => setShowFullMessage(true)}
                    sx={{
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    span
                  >
                    See more
                  </Text>
                </Text>
              )}
            </Box>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              radius="xl"
              sx={{
                cursor: "not-allowed",
              }}
              ml={-8}
              compact
            >
              Reply to {liSDR?.miniProfile.firstName}
            </Button>
          </Box>
        </Stack>
      </Group>
    </Box>
  );
}

function FrameworkCard(props: {
  active: boolean;
  title: string;
  bodyTitle: string;
  bodyText: string;
  footer?: ReactNode;
  badgeText?: string;
  onClick: () => void;
  onClickEdit?: () => void;
}) {
  const { hovered, ref } = useHover();

  return (
    <Card
      ref={ref}
      p={0}
      radius="md"
      withBorder
      onClick={props.onClick}
      sx={(theme) => ({
        cursor: "pointer",
        backgroundColor: props.active
          ? theme.fn.lighten(
              theme.fn.variant({ variant: "filled", color: "blue" })
                .background!,
              0.95
            )
          : hovered
          ? theme.fn.lighten(
              theme.fn.variant({ variant: "filled", color: "blue" })
                .background!,
              0.99
            )
          : undefined,
        borderColor:
          props.active || hovered
            ? theme.colors.blue[5] + "!important"
            : undefined,
      })}
    >
      <Stack spacing={0}>
        <Group position="apart" px={15} py={10} noWrap>
          <Group spacing={0} noWrap>
            <ActionIcon
              variant="transparent"
              color="blue"
              sx={{
                cursor: "default",
              }}
            >
              <IconMessages size="1.1rem" />
            </ActionIcon>
            <Text fw={500} sx={{ whiteSpace: "nowrap" }}>
              {props.title}
            </Text>
            {props.badgeText && (
              <Badge
                color="gray"
                size="sm"
                ml={10}
                styles={{ root: { textTransform: "initial", fontWeight: 500 } }}
              >
                {props.badgeText}
              </Badge>
            )}
          </Group>
          {props.onClickEdit && (
            <ActionIcon
              radius="xl"
              onClick={(e) => {
                e.stopPropagation();
                props.onClickEdit && props.onClickEdit();
              }}
            >
              <IconPencil size="1.1rem" />
            </ActionIcon>
          )}
        </Group>
        <Divider />
        <Box px={20} py={10}>
          <Title order={4} fw={600}>
            {props.bodyTitle}
          </Title>
          <Text fz={12} c="dimmed" truncate>
            {_.truncate(props.bodyText, {
              length: 40,
            })}
          </Text>
        </Box>
        {props.footer && (
          <>
            <Divider />
            <Box px={20} py={10}>
              {props.footer}
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
