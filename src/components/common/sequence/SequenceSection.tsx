import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import ModalSelector from "@common/library/ModalSelector";
import ProspectSelect from "@common/library/ProspectSelect";
import { API_URL } from "@constants/data";
import { ex } from "@fullcalendar/core/internal-common";
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
  LoadingOverlay,
  Tooltip,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconDots,
  IconMessages,
  IconPencil,
  IconReload,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  proxyURL,
  valueToColor,
  nameToInitials,
  testDelay,
} from "@utils/general";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import getLiProfile from "@utils/requests/getLiProfile";
import {
  createLiConvoSim,
  generateInitialMessageForLiConvoSim,
  getLiConvoSim,
} from "@utils/requests/linkedinConvoSimulation";
import _, { set } from "lodash";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { BumpFramework } from "src";

export default function SequenceSection() {
  const [activeCard, setActiveCard] = useState(0);

  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);

  useEffect(() => {
    if (!currentProject) return;
    (async () => {
      const result = await getBumpFrameworks(
        userToken,
        [],
        [],
        [currentProject?.id]
      );
      if (result.status !== "success") return;
      setBumpFrameworks(result.data.bump_frameworks as BumpFramework[]);
    })();
  }, []);

  const bf1 = bumpFrameworks.find(
    (bf) => bf.overall_status === "BUMPED" && bf.bumped_count === 1 && bf.active
  );
  const bf2 = bumpFrameworks.find(
    (bf) => bf.overall_status === "BUMPED" && bf.bumped_count === 2 && bf.active
  );
  const bf3 = bumpFrameworks.find(
    (bf) => bf.overall_status === "BUMPED" && bf.bumped_count === 3 && bf.active
  );

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
              bodyTitle={bf1?.title ?? ""}
              bodyText={bf1?.description ?? ""}
              footer={
                <Text fz={14}>
                  wait for{" "}
                  <Text fw={550} span>
                    {bf1?.bump_delay_days ?? -1}
                  </Text>{" "}
                  days, then:
                </Text>
              }
              active={activeCard === 1}
              onClick={() => setActiveCard(1)}
              canEdit
              editProps={{
                title: "Choose Bump Framework for Step 1",
                bumpedCount: 1,
                bumpedFrameworks: bumpFrameworks.filter(
                  (bf) =>
                    bf.overall_status === "BUMPED" && bf.bumped_count === 1
                ),
                activeBumpFrameworkId: bf1?.id ?? -1,
              }}
            />
            <FrameworkCard
              title="Step 2"
              badgeText="If no reply from prospect."
              bodyTitle={bf2?.title ?? ""}
              bodyText={bf2?.description ?? ""}
              footer={
                <Text fz={14}>
                  wait for{" "}
                  <Text fw={550} span>
                    {bf2?.bump_delay_days ?? -1}
                  </Text>{" "}
                  days, then:
                </Text>
              }
              active={activeCard === 2}
              onClick={() => setActiveCard(2)}
              canEdit
              editProps={{
                title: "Choose Bump Framework for Step 2",
                bumpedCount: 2,
                bumpedFrameworks: bumpFrameworks.filter(
                  (bf) =>
                    bf.overall_status === "BUMPED" && bf.bumped_count === 2
                ),
                activeBumpFrameworkId: bf2?.id ?? -1,
              }}
            />
            <FrameworkCard
              title="Step 3"
              badgeText="If no reply from prospect."
              bodyTitle={bf3?.title ?? ""}
              bodyText={bf3?.description ?? ""}
              active={activeCard === 3}
              onClick={() => setActiveCard(3)}
              canEdit
              editProps={{
                title: "Choose Bump Framework for Step 3",
                bumpedCount: 3,
                bumpedFrameworks: bumpFrameworks.filter(
                  (bf) =>
                    bf.overall_status === "BUMPED" && bf.bumped_count === 3
                ),
                activeBumpFrameworkId: bf3?.id ?? -1,
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

function BumpFrameworkSelect(props: {
  title: string;
  bumpedCount: number;
  bumpedFrameworks: BumpFramework[];
  activeBumpFrameworkId: number;
}) {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const theme = useMantineTheme();

  const { data: dataChannels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  return (
    <ModalSelector
      selector={{
        override: (
          <ActionIcon radius="xl">
            <IconPencil size="1.1rem" />
          </ActionIcon>
        ),
      }}
      title={{
        name: props.title,
        rightSection: (
          <Button
            variant="subtle"
            compact
            onClick={() => {
              openContextModal({
                modal: "createBumpFramework",
                title: "Create Bump Framework",
                innerProps: {
                  modalOpened: true,
                  openModal: () => {},
                  closeModal: () => {},
                  backFunction: () => {},
                  dataChannels: dataChannels,
                  status: undefined,
                  archetypeID: currentProject?.id,
                  bumpedCount: props.bumpedCount,
                },
              });
            }}
          >
            New Template
          </Button>
        ),
      }}
      loading={false}
      items={props.bumpedFrameworks.map((bf) => ({
        id: bf.id,
        name: bf.title,
        onClick: () => {},
        leftSection: (
          <Badge
            size="sm"
            variant="filled"
            color={valueToColor(theme, bf.bump_length)}
            ml="6px"
          >
            {bf.bump_length}
          </Badge>
        ),
        content: (
          <Box>
            <Text fz="sm" fw={500}>
              {bf.title}
            </Text>
            <Text fz="xs" c="dimmed">
              {bf.description}
            </Text>
          </Box>
        ),
        rightSection: <></>,
      }))}
      size={800}
      activeItemId={props.activeBumpFrameworkId}
    />
  );
}

function IntroMessageSection() {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [prospectId, setProspectId] = useState<number>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);

  let { hovered: startHovered, ref: startRef } = useHover();
  let { hovered: endHovered, ref: endRef } = useHover();

  const openPersonalizationSettings = () => {};
  const openCTASettings = () => {};

  const getIntroMessage = async (prospectId: number) => {
    if (!currentProject) return null;
    setLoading(true);
    setMessage("");

    let convoResponse = await getLiConvoSim(userToken, undefined, prospectId);
    if (convoResponse.status !== "success") {
      // If convo doesn't exist, create it
      const createResponse = await createLiConvoSim(
        userToken,
        currentProject.id,
        prospectId
      );
      if (createResponse.status !== "success") {
        setLoading(false);
        return null;
      }
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        userToken,
        createResponse.data
      );
      if (initMsgResponse.status !== "success") {
        setLoading(false);
        return null;
      }
      convoResponse = await getLiConvoSim(userToken, createResponse.data);
    } else if (convoResponse.data.messages.length === 0) {
      // If convo exists but no messages, generate initial message
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        userToken,
        convoResponse.data.simulation.id
      );
      if (initMsgResponse.status !== "success") {
        setLoading(false);
        return null;
      }
      convoResponse = await getLiConvoSim(
        userToken,
        convoResponse.data.simulation.id
      );
    }

    setLoading(false);
    try {
      return convoResponse.data.messages[0].message;
    } catch (e) {
      return null;
    }
  };

  // When prospect changes, get the intro message
  useEffect(() => {
    if (!prospectId) return;
    getIntroMessage(prospectId).then((msg) => {
      if (msg) {
        setMessage(msg);
      }
    });
  }, [prospectId]);

  if (!currentProject) return <></>;
  return (
    <Stack ml="xl" spacing={0}>
      <Group position="apart">
        <Group>
          <Title order={3}>Intro Message</Title>
          <Badge color="green">4 CTAs Active</Badge>
        </Group>
        <ProspectSelect
          personaId={currentProject.id}
          onChange={(prospect) => {
            if (prospect) {
              setProspectId(prospect.id);
            }
          }}
          onFinishLoading={() => {
            setProspectsLoading(false);
          }}
          autoSelect
        />
      </Group>
      <Box my={5}>
        <Text fz="xs" c="dimmed">
          Your initial outreach message on LinkedIn, this message has a 300
          character limit.
        </Text>
      </Box>
      <Stack pt={20} spacing={5} sx={{ position: "relative" }}>
        <LoadingOverlay visible={loading || prospectsLoading} zIndex={10} />
        <Group position="apart">
          <Text fz="sm" fw={500} c="dimmed">
            EXAMPLE MESSAGE:
          </Text>
          <Button
            size="xs"
            variant="light"
            leftIcon={<IconReload size="1.1rem" />}
            onClick={() => {
              if (prospectId) {
                getIntroMessage(prospectId).then((msg) => {
                  if (msg) {
                    setMessage(msg);
                  }
                });
              }
            }}
          >
            REGENERATE
          </Button>
        </Group>
        <Box
          sx={{
            border: "1px dashed #339af0",
            borderRadius: "0.5rem",
          }}
          p="sm"
          h={250}
        >
          {message && (
            <LiExampleInvitation
              message={message}
              startHovered={startHovered ? true : undefined}
              endHovered={endHovered ? true : undefined}
              onClickStart={openPersonalizationSettings}
              onClickEnd={openCTASettings}
            />
          )}
        </Box>
        <Group mt="sm" position="apart">
          <Group spacing={5}>
            <Box>
              <Box ref={startRef}>
                <Button
                  color="green"
                  variant="outline"
                  size="xs"
                  onClick={openPersonalizationSettings}
                >
                  Edit Personalization Settings
                </Button>
              </Box>
            </Box>
            <Box>
              <Box ref={endRef}>
                <Button variant="outline" size="xs" onClick={openCTASettings}>
                  Edit CTAs
                </Button>
              </Box>
            </Box>
          </Group>
          <Button radius="xl" size="xs">
            Train Your AI
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}

function LiExampleInvitation(props: {
  message: string;
  startHovered?: boolean;
  endHovered?: boolean;
  onClickStart?: () => void;
  onClickEnd?: () => void;
}) {
  const MAX_MESSAGE_SHOW_LENGTH = 75;

  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [liSDR, setLiSDR] = useState<any>();
  const [showFullMessage, setShowFullMessage] = useState(true);

  let { hovered: _startHovered, ref: startRef } = useHover();
  let { hovered: _endHovered, ref: endRef } = useHover();

  const startHovered = props.startHovered ?? _startHovered;
  const endHovered = props.endHovered ?? _endHovered;

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
    if (animationPlaying.current) return;
    setCurMessage("");
    (async () => {
      animationPlaying.current = true;
      const orginalMessage = props.message.trim();
      for (let i = 0; i < orginalMessage.length; i++) {
        await testDelay(i === orginalMessage.length - 1 ? 300 : 2);
        setCurMessage((prev) => {
          return prev + orginalMessage[i];
        });
      }
      animationPlaying.current = false;
    })();
  }, []);

  // Get SDR data from LinkedIn
  const imgURL = liSDR
    ? liSDR.miniProfile.picture["com.linkedin.common.VectorImage"].rootUrl +
      liSDR.miniProfile.picture["com.linkedin.common.VectorImage"].artifacts[
        liSDR.miniProfile.picture["com.linkedin.common.VectorImage"].artifacts
          .length - 1
      ].fileIdentifyingUrlPathSegment
    : userData.img_url;
  const name = liSDR
    ? liSDR.miniProfile.firstName + " " + liSDR.miniProfile.lastName
    : userData.sdr_name;
  const title = liSDR ? liSDR.miniProfile.occupation : userData.sdr_title;

  // Split message into start and CTA (and handle cut off)
  let message = props.message.trim();
  const sentences = message.split(/(?<=[.!?])\s+/gm);

  // If the last sentence is too short, the CTA is probably the last two sentences
  let endMessage = sentences[sentences.length - 1];
  if (endMessage.length < 50) {
    endMessage = sentences[sentences.length - 2] + " " + endMessage;
  }

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
  if (animationPlaying.current) {
    if (curMessage.length > startMessage.length) {
      endMessage = _.truncate(endMessage, {
        length: curMessage.length - startMessage.length,
        omission: "█",
      });
    } else {
      startMessage = _.truncate(startMessage, {
        length: curMessage.length,
        omission: "█",
      });
      endMessage = "";
    }
  }

  return (
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
          <Group spacing={0} noWrap>
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
                <Text
                  ref={startRef}
                  span
                  sx={{
                    color:
                      startHovered || animationPlaying.current
                        ? theme.colors.green[8]
                        : undefined,
                    backgroundColor:
                      startHovered || animationPlaying.current
                        ? theme.colors.green[0]
                        : undefined, //theme.colors.green[0]+"99",
                    cursor: "pointer",
                  }}
                >
                  {startMessage}
                </Text>
                <Text
                  ref={endRef}
                  ml={5}
                  span
                  sx={{
                    color:
                      endHovered || animationPlaying.current
                        ? theme.colors.blue[8]
                        : undefined,
                    backgroundColor:
                      endHovered || animationPlaying.current
                        ? theme.colors.blue[0]
                        : undefined, //theme.colors.blue[0]+"99",
                    cursor: "pointer",
                  }}
                >
                  {endMessage}
                </Text>
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
                <Text
                  ref={startRef}
                  span
                  sx={{
                    color: startHovered ? theme.colors.green[8] : undefined,
                    backgroundColor: startHovered
                      ? theme.colors.green[0]
                      : undefined, //theme.colors.green[0]+"99",
                    cursor: "pointer",
                  }}
                >
                  {cutStartMessage}
                </Text>
                <Text
                  ref={endRef}
                  ml={5}
                  span
                  sx={{
                    color: endHovered ? theme.colors.blue[8] : undefined,
                    backgroundColor: endHovered
                      ? theme.colors.blue[0]
                      : undefined, //theme.colors.blue[0]+"99",
                    cursor: "pointer",
                  }}
                >
                  {cutEndMessage}
                </Text>
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
  canEdit?: boolean;
  editProps?: {
    title: string;
    bumpedCount: number;
    bumpedFrameworks: BumpFramework[];
    activeBumpFrameworkId: number;
  };
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
          {props.canEdit && props.editProps && (
            <BumpFrameworkSelect {...props.editProps} />
          )}
        </Group>
        <Divider />
        <Box px={20} py={10}>
          <Title order={4} fw={600}>
            {props.bodyTitle}
          </Title>
          <Tooltip
            label={props.bodyText}
            maw={500}
            openDelay={500}
            position="bottom"
            withArrow
            withinPortal
            multiline
          >
            <Text fz={12} c="dimmed" truncate>
              {_.truncate(props.bodyText, {
                length: 50,
              })}
            </Text>
          </Tooltip>
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
