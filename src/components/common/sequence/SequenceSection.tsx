import {
  currentProjectState,
  uploadDrawerOpenState,
} from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import ModalSelector from "@common/library/ModalSelector";
import ProspectSelect from "@common/library/ProspectSelect";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import VoicesSection from "@common/voice_builder/VoicesSection";
import { API_URL } from "@constants/data";
import PersonaUploadDrawer from "@drawers/PersonaUploadDrawer";
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
  TextInput,
  SegmentedControl,
  Textarea,
  Switch,
  NumberInput,
  Modal,
  Menu,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useHover } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconCheck,
  IconCopy,
  IconDots,
  IconMessages,
  IconPencil,
  IconPlus,
  IconReload,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  proxyURL,
  valueToColor,
  nameToInitials,
  testDelay,
} from "@utils/general";
import { generateBumpLiMessage } from "@utils/requests/generateBumpLiMessage";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import getLiProfile from "@utils/requests/getLiProfile";
import {
  createLiConvoSim,
  generateInitialMessageForLiConvoSim,
  getLiConvoSim,
} from "@utils/requests/linkedinConvoSimulation";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import { useDebouncedCallback } from "@utils/useDebouncedCallback";
import _, { set } from "lodash";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
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

  const bf0 = bumpFrameworks.find(
    (bf) => bf.overall_status === "ACCEPTED" && bf.active && bf.default
  );
  const bf1 = bumpFrameworks.find(
    (bf) =>
      bf.overall_status === "BUMPED" &&
      bf.bumped_count === 1 &&
      bf.active &&
      bf.default
  );
  const bf2 = bumpFrameworks.find(
    (bf) =>
      bf.overall_status === "BUMPED" &&
      bf.bumped_count === 2 &&
      bf.active &&
      bf.default
  );
  const bf3 = bumpFrameworks.find(
    (bf) =>
      bf.overall_status === "BUMPED" &&
      bf.bumped_count === 3 &&
      bf.active &&
      bf.default
  );

  return (
    <Card padding="lg" radius="md" withBorder>
      <Group
        position="apart"
        p="xs"
        spacing={0}
        sx={{ alignItems: "flex-start" }}
        noWrap
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
              title="Invite Accepted"
              badgeText="If no reply from prospect."
              bodyTitle={bf0?.title ?? ""}
              bodyText={bf0?.description ?? ""}
              footer={
                <Text fz={14}>
                  wait for{" "}
                  <Text fw={550} span>
                    {bf0?.bump_delay_days ?? -1}
                  </Text>{" "}
                  days, then:
                </Text>
              }
              active={activeCard === 1}
              onClick={() => setActiveCard(1)}
              canEdit
              editProps={{
                title: "Choose Bump Framework for Invite Accepted",
                bumpedCount: 0,
                bumpedFrameworks: bumpFrameworks.filter(
                  (bf) => bf.overall_status === "ACCEPTED"
                ),
                activeBumpFrameworkId: bf0?.id ?? -1,
              }}
            />

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
              active={activeCard === 2}
              onClick={() => setActiveCard(2)}
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
              active={activeCard === 3}
              onClick={() => setActiveCard(3)}
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
              active={activeCard === 4}
              onClick={() => setActiveCard(4)}
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
          {activeCard === 0 && <IntroMessageSection />}
          {activeCard === 1 && bf0 && (
            <FrameworkSection framework={bf0} bumpCount={0} />
          )}
          {activeCard === 2 && bf1 && (
            <FrameworkSection framework={bf1} bumpCount={1} />
          )}
          {activeCard === 3 && bf2 && (
            <FrameworkSection framework={bf2} bumpCount={2} />
          )}
          {activeCard === 4 && bf3 && (
            <FrameworkSection framework={bf3} bumpCount={3} />
          )}
        </Box>
      </Group>
      <PersonaUploadDrawer
        personaOverviews={currentProject ? [currentProject] : []}
        afterUpload={() => {}}
      />
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
          <Menu shadow="md" width={200} withArrow>
            <Menu.Target>
              <Button variant="subtle" compact>
                New Framework
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                icon={<IconPlus size={14} />}
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
                Create New
              </Menu.Item>
              <Menu.Item
                icon={<IconCopy size={14} />}
                onClick={() => {
                  openContextModal({
                    modal: "cloneBumpFramework",
                    title: "Clone Bump Framework",
                    innerProps: {
                      openModal: () => {},
                      closeModal: () => {},
                      backFunction: () => {},
                      status: props.bumpedFrameworks.find(
                        (bf) => bf.id === props.activeBumpFrameworkId
                      )?.overall_status,
                      archetypeID: currentProject?.id,
                      bumpedCount: props.bumpedCount,
                      showStatus: true,
                    },
                  });
                }}
              >
                Copy from Existing
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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

  const [numActiveCTAs, setNumActiveCTAs] = useState(-1);
  const [openedCTAs, { open: openCTAs, close: closeCTAs }] =
    useDisclosure(false);

  const [openedVoices, { open: openVoices, close: closeVoices }] =
    useDisclosure(false);

  const [prospectId, setProspectId] = useState<number>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [noProspectsFound, setNoProspectsFound] = useState(false);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );

  let { hovered: startHovered, ref: startRef } = useHover();
  let { hovered: endHovered, ref: endRef } = useHover();

  const openPersonalizationSettings = () => {};
  const openCTASettings = () => {
    openCTAs();
  };

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
          {numActiveCTAs !== -1 && (
            <Badge color="green">{numActiveCTAs} CTAs Active</Badge>
          )}
        </Group>
      </Group>
      <Box my={5}>
        <Text fz="xs" c="dimmed">
          Your initial outreach message on LinkedIn, this message has a 300
          character limit.
        </Text>
      </Box>
      <Stack pt={20} spacing={5} sx={{ position: "relative" }}>
        <LoadingOverlay visible={loading || prospectsLoading} zIndex={10} />
        {noProspectsFound ? (
          <Box
            sx={{
              border: "1px dashed #339af0",
              borderRadius: "0.5rem",
            }}
            p="sm"
            mih={100}
          >
            <Center h={100}>
              <Stack>
                <Text ta="center" c="dimmed" fs="italic" fz="sm">
                  No prospects found!
                </Text>
                <Button
                  variant="filled"
                  color="teal"
                  radius="md"
                  ml="auto"
                  mr="0"
                  size="xs"
                  rightIcon={<IconUpload size={14} />}
                  onClick={() => setUploadDrawerOpened(true)}
                >
                  Upload New Prospects
                </Button>
              </Stack>
            </Center>
          </Box>
        ) : (
          <Box>
            <Group position="apart" pb="0.3125rem">
              <Text fz="sm" fw={500} c="dimmed">
                EXAMPLE MESSAGE:
              </Text>
              <Group>
                <Button
                  size="xs"
                  variant="subtle"
                  compact
                  leftIcon={<IconReload size="0.75rem" />}
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
                  Regenerate
                </Button>
                <ProspectSelect
                  personaId={currentProject.id}
                  onChange={(prospect) => {
                    if (prospect) {
                      setProspectId(prospect.id);
                    }
                  }}
                  onFinishLoading={(prospects) => {
                    setProspectsLoading(false);
                    if (prospects.length === 0) setNoProspectsFound(true);
                  }}
                  autoSelect
                />
              </Group>
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
          </Box>
        )}
        <Group mt="sm" position="apart">
          <Group spacing={5}>
            <Box>
              <Box ref={startRef}>
                <Button
                  color="green"
                  variant="outline"
                  size="xs"
                  onClick={openPersonalizationSettings}
                  disabled
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
          <Button radius="xl" size="xs" onClick={openVoices}>
            Train Your AI
          </Button>
        </Group>
      </Stack>
      <Modal
        opened={openedCTAs}
        onClose={closeCTAs}
        title={<Title order={3}>Your Call-to-Actions</Title>}
        size="xl"
      >
        <PersonaDetailsCTAs
          onCTAsLoaded={(data) =>
            setNumActiveCTAs(data.filter((x: any) => x.active).length)
          }
        />
      </Modal>
      <Modal
        opened={openedVoices}
        onClose={closeVoices}
        title={<Title order={3}>Your Voices</Title>}
        size="xl"
      >
        <VoicesSection />
      </Modal>
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
                  onClick={props.onClickStart}
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
                  onClick={props.onClickEnd}
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
                  onClick={props.onClickStart}
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
                  onClick={props.onClickEnd}
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
            Reply to{" "}
            {liSDR?.miniProfile.firstName || userData.sdr_name.split(" ")[0]}
          </Button>
        </Box>
      </Stack>
    </Group>
  );
}

function LiExampleMessage(props: {
  message: string;
  hovered?: boolean;
  onClick?: () => void;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [liSDR, setLiSDR] = useState<any>();

  let { hovered: _hovered, ref } = useHover();

  const hovered = props.hovered ?? _hovered;

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

  // Format message
  let message = props.message.trim();

  // Trim for animation playing
  if (animationPlaying.current) {
    message = _.truncate(message, {
      length: curMessage.length,
      omission: "█",
    });
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
      <Stack w="100%" spacing={3}>
        <Group position="apart" noWrap>
          <Box>
            <Text fw={550}>{name}</Text>
          </Box>
        </Group>
        <Box>
          {animationPlaying.current ? (
            <Text fz="xs">
              <Text
                ref={ref}
                span
                sx={{
                  color:
                    hovered || animationPlaying.current
                      ? theme.colors.green[8]
                      : undefined,
                  backgroundColor:
                    hovered || animationPlaying.current
                      ? theme.colors.green[0]
                      : undefined, //theme.colors.green[0]+"99",
                  cursor: "pointer",
                }}
              >
                {message}
              </Text>
            </Text>
          ) : (
            <Text fz="xs">
              <Text
                ref={ref}
                span
                sx={{
                  color: hovered ? theme.colors.green[8] : undefined,
                  backgroundColor: hovered ? theme.colors.green[0] : undefined, //theme.colors.green[0]+"99",
                  cursor: "pointer",
                }}
                onClick={props.onClick}
              >
                {message}
              </Text>
            </Text>
          )}
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

  const currentProject = useRecoilValue(currentProjectState);
  const noBumpFramework = props.editProps?.activeBumpFrameworkId === -1;

  return (
    <Card
      ref={ref}
      p={0}
      radius="md"
      withBorder
      onClick={() => {
        props.onClick();
        if (noBumpFramework) {
          // TODO: Open modal to select bump framework
        }
      }}
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

function FrameworkSection(props: {
  framework: BumpFramework;
  bumpCount: number;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [prospectId, setProspectId] = useState<number>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [noProspectsFound, setNoProspectsFound] = useState(false);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );

  let { hovered: hovered, ref: ref } = useHover();

  const form = useForm({
    initialValues: {
      frameworkName: props.framework.title,
      bumpLength: props.framework.bump_length,
      delayDays: props.framework.bump_delay_days,
      promptInstructions: props.framework.description,
      useAccountResearch: props.framework.use_account_research,
    },
  });

  const saveSettings = async (values: typeof form.values) => {
    const result = await patchBumpFramework(
      userToken,
      props.framework.id,
      props.framework.overall_status,
      values.frameworkName,
      values.promptInstructions,
      values.bumpLength,
      props.bumpCount,
      values.delayDays,
      props.framework.default,
      values.useAccountResearch
    );
    return result.status === "success";
  };

  const openPersonalizationSettings = () => {};

  const getFollowUpMessage = async (prospectId: number) => {
    if (!currentProject) return null;
    setLoading(true);
    setMessage("");

    const result = await generateBumpLiMessage(
      userToken,
      prospectId,
      props.framework.id,
      props.bumpCount
    );

    setLoading(false);
    return result.status === "success" ? result.data.message : null;
  };

  // When prospect changes, get the bump message
  useEffect(() => {
    if (!prospectId) return;
    getFollowUpMessage(prospectId).then((msg) => {
      console.log(msg);
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
          <Title order={3}>
            Step {props.bumpCount + 1}: {props.framework.title}
          </Title>
        </Group>
      </Group>
      <Box my={5}>
        <Text fz="xs" c="dimmed">
          A follow up message to send to prospects who have not replied to your
          previous messages.
        </Text>
      </Box>
      <Stack pt={20} spacing={15}>
        <Box sx={{ position: "relative" }}>
          <LoadingOverlay visible={loading || prospectsLoading} zIndex={10} />
          {noProspectsFound ? (
            <Box
              sx={{
                border: "1px dashed #339af0",
                borderRadius: "0.5rem",
              }}
              p="sm"
              mih={100}
            >
              <Center h={100}>
                <Stack>
                  <Text ta="center" c="dimmed" fs="italic" fz="sm">
                    No prospects found!
                  </Text>
                  <Button
                    variant="filled"
                    color="teal"
                    radius="md"
                    ml="auto"
                    mr="0"
                    size="xs"
                    rightIcon={<IconUpload size={14} />}
                    onClick={() => setUploadDrawerOpened(true)}
                  >
                    Upload New Prospects
                  </Button>
                </Stack>
              </Center>
            </Box>
          ) : (
            <Box>
              <Group position="apart" pb="0.3125rem">
                <Text fz="sm" fw={500} c="dimmed">
                  EXAMPLE MESSAGE:
                </Text>
                <Group>
                  <Button
                    size="xs"
                    variant="subtle"
                    compact
                    leftIcon={<IconReload size="0.75rem" />}
                    onClick={() => {
                      if (prospectId) {
                        getFollowUpMessage(prospectId).then((msg) => {
                          if (msg) {
                            setMessage(msg);
                          }
                        });
                      }
                    }}
                  >
                    Regenerate
                  </Button>
                  <ProspectSelect
                    personaId={currentProject.id}
                    onChange={(prospect) => {
                      if (prospect) {
                        setProspectId(prospect.id);
                      }
                    }}
                    onFinishLoading={(prospects) => {
                      setProspectsLoading(false);
                      if (prospects.length === 0) setNoProspectsFound(true);
                    }}
                    autoSelect
                  />
                </Group>
              </Group>
              <Box
                sx={{
                  border: "1px dashed #339af0",
                  borderRadius: "0.5rem",
                }}
                p="sm"
                mih={100}
              >
                {message && (
                  <LiExampleMessage
                    message={message}
                    hovered={hovered ? true : undefined}
                    onClick={openPersonalizationSettings}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
        <form onSubmit={form.onSubmit((values) => saveSettings(values))}>
          <Group grow>
            <Box>
              <Text fz="sm" fw={500} c="dimmed">
                FRAMEWORK NAME:
              </Text>
              <TextInput
                placeholder="Name"
                variant="filled"
                {...form.getInputProps("frameworkName")}
              />
            </Box>
            <Box>
              <Text fz="sm" fw={500} c="dimmed">
                BUMP LENGTH:
              </Text>
              <SegmentedControl
                data={[
                  { label: "Short", value: "SHORT" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "Long", value: "LONG" },
                ]}
                {...form.getInputProps("bumpLength")}
              />
            </Box>
            <Box>
              <Text fz="sm" fw={500} c="dimmed">
                DELAY DAYS:
              </Text>
              <NumberInput
                placeholder="Days to Wait"
                variant="filled"
                {...form.getInputProps("delayDays")}
              />
            </Box>
          </Group>
          <Box>
            <Text fz="sm" fw={500} c="dimmed">
              PROMPT INSTRUCTIONS:
            </Text>
            <Textarea
              placeholder="Instructions"
              minRows={7}
              variant="filled"
              {...form.getInputProps("promptInstructions")}
            />
          </Box>
          <Box>
            <Group position="apart">
              <Box ref={ref}>
                <Button
                  color="green"
                  variant="outline"
                  size="xs"
                  onClick={openPersonalizationSettings}
                  disabled
                >
                  Edit Personalization Settings
                </Button>
              </Box>
              <Box>
                <Switch
                  {...form.getInputProps("useAccountResearch", {
                    type: "checkbox",
                  })}
                  color="green"
                  size="sm"
                  label="Use Account Research"
                  labelPosition="left"
                />
              </Box>
            </Group>
          </Box>
          <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
        </form>
      </Stack>
    </Stack>
  );
}
