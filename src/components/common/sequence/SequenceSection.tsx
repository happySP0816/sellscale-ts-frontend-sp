import {
  currentProjectState,
  uploadDrawerOpenState,
} from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { logout, getFreshCurrentProject } from "@auth/core";
import ModalSelector from "@common/library/ModalSelector";
import ProspectSelect from "@common/library/ProspectSelect";
import VoiceSelect from "@common/library/VoiceSelect";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import VoicesSection from "@common/voice_builder/VoicesSection";
import { API_URL } from "@constants/data";
import PersonaUploadDrawer from "@drawers/PersonaUploadDrawer";
import { C, co, ct, ex } from "@fullcalendar/core/internal-common";
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
  Tabs,
  Grid,
  Checkbox,
  Flex,
  MantineColor,
  Select,
  Collapse,
  Container,
  Progress,
  ThemeIcon,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  useDebouncedValue,
  useDisclosure,
  useHover,
  usePrevious,
} from "@mantine/hooks";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import {
  IconBrain,
  IconCheck,
  IconCircle2Filled,
  IconCopy,
  IconDots,
  IconEdit,
  IconMessages,
  IconPencil,
  IconPlus,
  IconReload,
  IconTools,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  proxyURL,
  valueToColor,
  nameToInitials,
  testDelay,
} from "@utils/general";
import { generateBumpLiMessage } from "@utils/requests/generateBumpLiMessage";
import { getArchetypeConversion } from "@utils/requests/getArchetypeConversion";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import getChannels from "@utils/requests/getChannels";
import getLiProfile from "@utils/requests/getLiProfile";
import {
  createLiConvoSim,
  generateInitialMessageForLiConvoSim,
  getLiConvoSim,
} from "@utils/requests/linkedinConvoSimulation";
import { patchBumpFramework } from "@utils/requests/patchBumpFramework";
import toggleCTA from "@utils/requests/toggleCTA";
import {
  updateBlocklist,
  updateInitialBlocklist,
} from "@utils/requests/updatePersonaBlocklist";
import { useDebouncedCallback } from "@utils/useDebouncedCallback";
import _, { set } from "lodash";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BumpFramework, CTA } from "src";
import TextWithNewline from "@common/library/TextWithNewlines";
import { getAcceptanceRates } from "@utils/requests/getAcceptanceRates";
import { showNotification } from "@mantine/notifications";
import {
  IconArrowRight,
  IconBulb,
  IconChevronRight,
  IconCircle,
  IconCircleMinus,
  IconRobot,
  IconSettings,
  IconTrash,
} from "@tabler/icons";
import {
  useLocation,
  unstable_usePrompt,
  useNavigate,
  unstable_useBlocker,
} from "react-router-dom";
import { deleteCTA } from "@utils/requests/createCTA";
import { patchArchetypeDelayDays } from "@utils/requests/patchArchetypeDelayDays";
import { patchArchetypeBumpAmount } from "@utils/requests/patchArchetypeBumpAmount";

export default function SequenceSection() {
  const [activeCard, setActiveCard] = useState(0);

  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);

  const [loading, setLoading] = useState(false);

  const [conversionRate, setConversionRate] = useState(0);
  const [replyRate, setReplyRate] = useState(0);

  const triggerGetArchetypeConversion = async () => {
    if (!currentProject) return;

    const result = await getArchetypeConversion(userToken, currentProject.id);
    const data = result.data;

    setConversionRate((data.li_opened / data.li_sent) * 100);
    setReplyRate((data.li_replied / data.li_sent) * 100);
    console.log(data);
  };

  useEffect(() => {
    triggerGetArchetypeConversion();
  }, []);

  const { data, refetch } = useQuery({
    queryKey: [`query-get-bump-frameworks`],
    queryFn: async () => {
      if (!currentProject) return [];
      const result = await getBumpFrameworks(
        userToken,
        [],
        [],
        [currentProject?.id]
      );
      if (result.status !== "success") return [];
      return result.data.bump_frameworks as BumpFramework[];
    },
  });
  const bumpFrameworks = data ?? [];
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isModalBlockerVisible, setIsModalBlockerVisible] = useState(false);
  const [nextActiveCardIndex, setNextActiveCardIndex] = useState(0);
  const [prospectId, setProspectId] = useState<number>(-1);

  let blocker = unstable_useBlocker(isDataChanged);

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
  const bf0Delay = useRef(bf0?.bump_delay_days ?? 2);
  const bf1Delay = useRef(bf1?.bump_delay_days ?? 2);
  const bf2Delay = useRef(bf2?.bump_delay_days ?? 2);

  let bf0Conversion =
    bf0 && bf0?.etl_num_times_converted && bf0?.etl_num_times_used
      ? (bf0.etl_num_times_converted / bf0.etl_num_times_used) * 100
      : undefined;
  let bf1Conversion =
    bf1 && bf1?.etl_num_times_converted && bf1?.etl_num_times_used
      ? (bf1.etl_num_times_converted / bf1.etl_num_times_used) * 100
      : undefined;
  let bf2Conversion =
    bf2 && bf2?.etl_num_times_converted && bf2?.etl_num_times_used
      ? (bf2.etl_num_times_converted / bf2.etl_num_times_used) * 100
      : undefined;
  let bf3Conversion =
    bf3 && bf3?.etl_num_times_converted && bf3?.etl_num_times_used
      ? (bf3.etl_num_times_converted / bf3.etl_num_times_used) * 100
      : undefined;
  // const bf0Conversion = replyRate * 0.5;
  // const bf1Conversion = replyRate * 0.3;
  // const bf2Conversion = replyRate * 0.2;
  // const bf3Conversion = replyRate * 0.1;

  const bump_amount = currentProject?.li_bump_amount ?? 3;
  console.log(bump_amount)

  const closeModal = () => {
    setIsModalBlockerVisible(false);
    if (blocker && blocker.reset) {
      blocker.reset();
    }
  };

  const updateBumpAmount = async (bumpAmount: number) => {
    if (!currentProject) return;
    setLoading(true);
    const response = await patchArchetypeBumpAmount(
      userToken,
      currentProject.id,
      bumpAmount
    );
    if (response.status === "success") {
      setCurrentProject(
        await getFreshCurrentProject(userToken, currentProject.id)
      );
    }
    setLoading(false);
  };

  const onSetActiveCard = (cardNumber: number) => {
    setNextActiveCardIndex(cardNumber);
    if (isDataChanged) {
      setIsModalBlockerVisible(true);
    } else {
      setActiveCard(cardNumber);
    }
  };

  const bumpConversionColor = (
    bf: BumpFramework | undefined,
    conversion: number | undefined
  ) => {
    return bf &&
      conversion &&
      bf?.etl_num_times_used &&
      conversion > 5 &&
      bf?.etl_num_times_used > 10
      ? "green"
      : !bf?.etl_num_times_used ||
        (bf?.etl_num_times_used && bf?.etl_num_times_used < 10)
      ? "gray"
      : "red";
  };

  if (!currentProject) {
    return null;
  }

  return (
    <>
      <Modal.Root
        opened={isModalBlockerVisible || blocker.state === "blocked"}
        onClose={closeModal}
        centered
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Flex w={"100%"} justify={"center"} align={"center"}>
              <Modal.Title>
                <Text color="yellow" size={"1.25rem"} fw={500}>
                  Warning: Unsaved Change
                </Text>
              </Modal.Title>
            </Flex>
          </Modal.Header>
          <Modal.Body>
            <Text size={"1rem"} color="gray.8">
              Are you sure you want to dismiss these edits? Save before navigate
              away
            </Text>

            <Flex justify={"space-between"} gap={"1rem"} mt={"1rem"}>
              <Button
                variant="filled"
                color="yellow"
                fullWidth
                onClick={() => {
                  setIsDataChanged(false);
                  setIsModalBlockerVisible(false);

                  if (nextActiveCardIndex !== activeCard) {
                    setActiveCard(nextActiveCardIndex);
                  }
                  if (blocker && blocker?.proceed) {
                    blocker.proceed();
                  }
                }}
              >
                Dismiss
              </Button>
              <Button
                variant="outline"
                color="blue"
                fullWidth
                onClick={closeModal}
              >
                Close
              </Button>
            </Flex>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <Card padding="lg" radius="md" withBorder>
        <Group
          position="apart"
          p="xs"
          spacing={0}
          sx={{ alignItems: "flex-start" }}
          noWrap
        >
          <Box sx={{ flexBasis: "35%", position: 'relative' }}>
          <LoadingOverlay visible={loading} />
            <Stack>
              <FrameworkCard
                title="Connection Request"
                bodyTitle="Invite Message"
                // bodyText="Say hello and introduce myself as a sales rep"
                active={activeCard === 0}
                conversion={conversionRate}
                onClick={() => onSetActiveCard(0)}
                footer={
                  <Center sx={{ cursor: "pointer" }}>
                    <Group spacing={2}>
                      <Text fz={14}>wait for</Text>
                      <NumberInput
                        placeholder="# Days"
                        variant="filled"
                        hideControls
                        sx={{ border: "solid 1px #777; border-radius: 4px;" }}
                        m={3}
                        min={0}
                        max={99}
                        w={bf0Delay.current > 9 ? 50 : 32}
                        size="xs"
                        defaultValue={0}
                        onChange={async (value) => {
                          if (!currentProject) {
                            showNotification({
                              title: "Error",
                              message: "No campaign selected",
                              color: "red",
                            });
                            return;
                          }
                          const result = await patchArchetypeDelayDays(
                            userToken,
                            currentProject.id,
                            value || 0
                          );
                          if (result.status === "success") refetch();
                        }}
                      />
                      <Text fz={14}>days, then:</Text>
                    </Group>
                  </Center>
                }
              />
              {/* <Divider
                variant="dashed"
                label={
                  <>
                    <Text c="dimmed" ta="center" fz="sm">
                      Accepted Invite
                    </Text>
                  </>
                }
                labelPosition="center"
                mx={50}
              /> */}
              <Divider
                variant="solid"
                label={
                  <Tooltip
                    label={
                      replyRate > 0.5
                        ? "Your reply rates are above industry standards (0.5%). Congrats!"
                        : "Your reply rates are below industry standards (0.5%). Consider changing your bumps"
                    }
                    withinPortal
                    withArrow
                  >
                    <Badge
                      ml="4px"
                      variant="dot"
                      color={
                        isNaN(replyRate)
                          ? "grey"
                          : replyRate > 0.5
                          ? "green"
                          : "red"
                      }
                    >
                      Replied:{" "}
                      {!isNaN(replyRate) ? replyRate.toFixed(1) + "%" : "TBD"}
                    </Badge>
                  </Tooltip>
                }
                labelPosition="center"
                mx={10}
              />
              {bump_amount >= 1 && (
                <FrameworkCard
                  title="Follow-Up 1"
                  badgeText={`Reply ${
                    bf0Conversion ? bf0Conversion.toFixed(0) + "%" : "TBD"
                  }`}
                  badgeColor={bumpConversionColor(bf0, bf0Conversion)}
                  timesUsed={bf0?.etl_num_times_used ?? 0}
                  timesConverted={bf0?.etl_num_times_converted ?? 0}
                  badgeHoverText={
                    bf0 && bf0Conversion
                      ? `${bf0.etl_num_times_converted} / ${bf0.etl_num_times_used} prospects`
                      : "Not enough data, " +
                        (bf0?.etl_num_times_converted || 0) +
                        " / " +
                        (bf0?.etl_num_times_used || 0)
                  }
                  bodyTitle={bf0?.title ?? ""}
                  // bodyText={bf0?.description ?? ""}
                  footer={
                    <Center>
                      <Group spacing={2}>
                        <Text fz={14}>wait for</Text>
                        <NumberInput
                          defaultValue={bf0Delay.current}
                          placeholder="# Days"
                          variant="filled"
                          hideControls
                          sx={{ border: "solid 1px #777; border-radius: 4px;" }}
                          m={3}
                          min={1}
                          max={99}
                          w={bf0Delay.current > 9 ? 50 : 30}
                          size="xs"
                          onChange={async (value) => {
                            if (!bf0) return;
                            bf0Delay.current = value || 2;
                            const result = await patchBumpFramework(
                              userToken,
                              bf0.id,
                              bf0.overall_status,
                              bf0.title,
                              bf0.description,
                              bf0.bump_length,
                              bf0.bumped_count,
                              bf0Delay.current,
                              bf0.default,
                              bf0.use_account_research,
                              bf0.transformer_blocklist
                            );
                            if (result.status === "success") refetch();
                          }}
                        />
                        <Text fz={14}>days, then:</Text>
                      </Group>
                    </Center>
                  }
                  active={activeCard === 1}
                  onClick={() => onSetActiveCard(1)}
                  canEdit
                  editProps={{
                    title: "Choose Bump Framework for Follow-Up 1",
                    bumpedCount: 0,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) => bf.overall_status === "ACCEPTED"
                    ),
                    activeBumpFrameworkId: bf0?.id ?? -1,
                  }}
                />
              )}

              {bump_amount >= 2 && (
                <FrameworkCard
                  title="Follow-Up 2"
                  badgeText={`Reply ${
                    bf1Conversion ? bf1Conversion.toFixed(0) + "%" : "TBD"
                  }`}
                  timesUsed={bf1?.etl_num_times_used ?? 0}
                  timesConverted={bf1?.etl_num_times_converted ?? 0}
                  badgeHoverText={
                    bf1 && bf1Conversion
                      ? `${bf1.etl_num_times_converted} / ${bf1.etl_num_times_used} prospects`
                      : "Not enough data, " +
                        (bf1?.etl_num_times_converted || 0) +
                        " / " +
                        (bf1?.etl_num_times_used || 0)
                  }
                  badgeColor={bumpConversionColor(bf1, bf1Conversion)}
                  bodyTitle={bf1?.title ?? ""}
                  // bodyText={bf1?.description ?? ""}
                  footer={
                    <Center>
                      <Group spacing={2}>
                        <Text fz={14}>wait for</Text>
                        <NumberInput
                          defaultValue={bf1Delay.current}
                          placeholder="# Days"
                          variant="filled"
                          hideControls
                          sx={{ border: "solid 1px #777; border-radius: 4px;" }}
                          m={3}
                          min={1}
                          max={99}
                          w={bf1Delay.current > 9 ? 50 : 30}
                          size="xs"
                          onChange={async (value) => {
                            if (!bf1) return;
                            bf1Delay.current = value || 2;
                            const result = await patchBumpFramework(
                              userToken,
                              bf1.id,
                              bf1.overall_status,
                              bf1.title,
                              bf1.description,
                              bf1.bump_length,
                              bf1.bumped_count,
                              bf1Delay.current,
                              bf1.default,
                              bf1.use_account_research,
                              bf1.transformer_blocklist
                            );
                            if (result.status === "success") refetch();
                          }}
                        />
                        <Text fz={14}>days, then:</Text>
                      </Group>
                    </Center>
                  }
                  active={activeCard === 2}
                  onClick={() => onSetActiveCard(2)}
                  canEdit
                  editProps={{
                    title: "Choose Bump Framework for Follow-Up 2",
                    bumpedCount: 1,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) =>
                        bf.overall_status === "BUMPED" && bf.bumped_count === 1
                    ),
                    activeBumpFrameworkId: bf1?.id ?? -1,
                  }}
                  canRemove={bump_amount === 2}
                  onRemove={() => updateBumpAmount(1)}
                />
              )}

              {bump_amount >= 3 && (
                <FrameworkCard
                  title="Follow-Up 3"
                  badgeText={`Reply ${
                    bf2Conversion ? bf2Conversion.toFixed(0) + "%" : "TBD"
                  }`}
                  timesUsed={bf2?.etl_num_times_used ?? 0}
                  timesConverted={bf2?.etl_num_times_converted ?? 0}
                  badgeColor={bumpConversionColor(bf2, bf2Conversion)}
                  badgeHoverText={
                    bf2 && bf2Conversion
                      ? `${bf2.etl_num_times_converted} / ${bf2.etl_num_times_used} prospects`
                      : "Not enough data, " +
                        (bf2?.etl_num_times_converted || 0) +
                        " / " +
                        (bf2?.etl_num_times_used || 0)
                  }
                  bodyTitle={bf2?.title ?? ""}
                  // bodyText={bf2?.description ?? ""}
                  footer={
                    <Center>
                      <Group spacing={2}>
                        <Text fz={14}>wait for</Text>
                        <NumberInput
                          defaultValue={bf2Delay.current}
                          placeholder="# Days"
                          variant="filled"
                          hideControls
                          sx={{ border: "solid 1px #777; border-radius: 4px;" }}
                          m={3}
                          min={2}
                          max={99}
                          w={bf2Delay.current > 9 ? 50 : 30}
                          size="xs"
                          onChange={async (value) => {
                            if (!bf2) return;
                            bf2Delay.current = value || 2;
                            const result = await patchBumpFramework(
                              userToken,
                              bf2.id,
                              bf2.overall_status,
                              bf2.title,
                              bf2.description,
                              bf2.bump_length,
                              bf2.bumped_count,
                              bf2Delay.current,
                              bf2.default,
                              bf2.use_account_research,
                              bf2.transformer_blocklist
                            );
                            if (result.status === "success") refetch();
                          }}
                        />
                        <Text fz={14}>days, then:</Text>
                      </Group>
                    </Center>
                  }
                  active={activeCard === 3}
                  onClick={() => onSetActiveCard(3)}
                  canEdit
                  editProps={{
                    title: "Choose Bump Framework for Follow-Up 3",
                    bumpedCount: 2,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) =>
                        bf.overall_status === "BUMPED" && bf.bumped_count === 2
                    ),
                    activeBumpFrameworkId: bf2?.id ?? -1,
                  }}
                  canRemove={bump_amount === 3}
                  onRemove={() => updateBumpAmount(2)}
                />
              )}

              {bump_amount >= 4 && (
                <FrameworkCard
                  title="Follow-Up 4"
                  badgeText={`Reply ${
                    bf3Conversion ? bf3Conversion.toFixed(0) + "%" : "TBD"
                  }`}
                  badgeColor={bumpConversionColor(bf3, bf3Conversion)}
                  timesUsed={bf3?.etl_num_times_used ?? 0}
                  timesConverted={bf3?.etl_num_times_converted ?? 0}
                  badgeHoverText={
                    bf3 && bf3Conversion
                      ? `${bf3.etl_num_times_converted} / ${bf3.etl_num_times_used} prospects`
                      : "Not enough data, " +
                        (bf3?.etl_num_times_converted || 0) +
                        " / " +
                        (bf3?.etl_num_times_used || 0)
                  }
                  bodyTitle={bf3?.title ?? ""}
                  // bodyText={bf3?.description ?? ""}
                  active={activeCard === 4}
                  onClick={() => onSetActiveCard(4)}
                  canEdit
                  editProps={{
                    title: "Choose Bump Framework for Follow-Up 4",
                    bumpedCount: 3,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) =>
                        bf.overall_status === "BUMPED" && bf.bumped_count === 3
                    ),
                    activeBumpFrameworkId: bf3?.id ?? -1,
                  }}
                  canRemove={bump_amount === 4}
                  onRemove={() => updateBumpAmount(3)}
                />
              )}

              {bump_amount < 4 && (
                <Center>
                  <Stack spacing={5}><Text ta="center" fw={200} c='dimmed' fz='xl'>|</Text>
                  <Button
                    variant="subtle"
                    radius="md"
                    compact
                    onClick={() => updateBumpAmount(bump_amount + 1)}
                  >
                    Add Step
                  </Button>
                  </Stack>
                </Center>
              )}
            </Stack>
          </Box>
          <Box sx={{ flexBasis: "65%" }}>
            {activeCard === 0 && (
              <IntroMessageSection
                prospectId={prospectId}
                setProspectId={setProspectId}
              />
            )}
            {activeCard === 1 && bf0 && (
              <FrameworkSection
                framework={bf0}
                bumpCount={0}
                setIsDataChanged={setIsDataChanged}
                prospectId={prospectId}
                setProspectId={setProspectId}
              />
            )}
            {activeCard === 2 && bf1 && (
              <FrameworkSection
                framework={bf1}
                bumpCount={1}
                setIsDataChanged={setIsDataChanged}
                prospectId={prospectId}
                setProspectId={setProspectId}
              />
            )}
            {activeCard === 3 && bf2 && (
              <FrameworkSection
                framework={bf2}
                bumpCount={2}
                setIsDataChanged={setIsDataChanged}
                prospectId={prospectId}
                setProspectId={setProspectId}
              />
            )}
            {activeCard === 4 && bf3 && (
              <FrameworkSection
                framework={bf3}
                bumpCount={3}
                setIsDataChanged={setIsDataChanged}
                prospectId={prospectId}
                setProspectId={setProspectId}
              />
            )}
          </Box>
        </Group>
        <PersonaUploadDrawer
          personaOverviews={currentProject ? [currentProject] : []}
          afterUpload={() => {}}
        />
      </Card>
    </>
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
          <Tooltip label="Edit" withinPortal>
            <ActionIcon radius="xl">
              <IconPencil size="1.1rem" />
            </ActionIcon>
          </Tooltip>
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

function IntroMessageSection(props: {
  prospectId: number;
  setProspectId: (prospectId: number) => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const queryClient = useQueryClient();

  const prospectId = props.prospectId;
  const setProspectId = props.setProspectId;

  // const [prospectId, setProspectId] = useState<number>();
  const [message, setMessage] = useState("");
  const [messageMetaData, setMessageMetaData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [noProspectsFound, setNoProspectsFound] = useState(false);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );

  const [hoveredCTA, setHoveredCTA] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>("none");
  const { hovered: hoveredPersonSettingsBtn, ref: refPersonSettingsBtn } =
    useHover<HTMLButtonElement>();
  const { hovered: hoveredYourCTAsBtn, ref: refYourCTAsBtn } =
    useHover<HTMLButtonElement>();

  const [personalizationItemsCount, setPersonalizationItemsCount] =
    useState<number>();
  const [ctasItemsCount, setCtasItemsCount] = useState<number>();

  const openPersonalizationSettings = () => {
    setActiveTab("personalization");
  };
  const openCTASettings = () => {
    setActiveTab("ctas");
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
      setMessageMetaData(convoResponse.data.messages[0].meta_data);
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
          <Title order={3}>Invite Message</Title>
          {/* {ctasItemsCount !== undefined && (
            <Badge color="blue" fw={500}>{ctasItemsCount} CTAs Active</Badge>
          )} */}
        </Group>
        <VoiceSelect
          personaId={currentProject.id}
          onChange={(voice) => {}}
          onFinishLoading={(voices) => {}}
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
                  No prospects found to show example message.
                </Text>
                <Center>
                  <Box>
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
                  </Box>
                </Center>
              </Stack>
            </Center>
          </Box>
        ) : (
          <Box>
            <Group position="apart" pb="0.3125rem">
              <Text fz="sm" fw={500} c="dimmed">
                EXAMPLE INVITE MESSAGE:
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
                  selectedProspect={prospectId}
                  autoSelect
                  includeDrawer
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
                  startHovered={
                    activeTab === "personalization" || hoveredPersonSettingsBtn
                      ? true
                      : undefined
                  }
                  endHovered={
                    activeTab === "ctas" || hoveredYourCTAsBtn
                      ? true
                      : undefined
                  }
                  onClickStart={openPersonalizationSettings}
                  onClickEnd={openCTASettings}
                  onHoveredEnd={(hovered) => setHoveredCTA(hovered)}
                />
              )}
            </Box>
          </Box>
        )}

        <Tabs
          value={activeTab}
          onTabChange={setActiveTab}
          pt="sm"
          variant="pills"
          keepMounted={true}
          radius="md"
          defaultValue="none"
          allowTabDeactivation
        >
          <Tabs.List>
            <Tabs.Tab
              ref={refPersonSettingsBtn}
              value="personalization"
              color="teal.5"
              rightSection={
                <>
                  {personalizationItemsCount ? (
                    <Badge
                      w={16}
                      h={16}
                      sx={{ pointerEvents: "none" }}
                      variant="filled"
                      size="xs"
                      p={0}
                      color="teal.6"
                    >
                      {personalizationItemsCount}
                    </Badge>
                  ) : (
                    <></>
                  )}
                </>
              }
              sx={(theme) => ({
                "&[data-active]": {
                  backgroundColor: theme.colors.teal[0] + "!important",
                  borderRadius: theme.radius.md + "!important",
                  color: theme.colors.teal[8] + "!important",
                },
                border: "solid 1px " + theme.colors.teal[5] + "!important",
              })}
            >
              Edit Personalization
            </Tabs.Tab>
            <Tabs.Tab
              ref={refYourCTAsBtn}
              value="ctas"
              color="blue.4"
              rightSection={
                <>
                  {ctasItemsCount ? (
                    <Badge
                      w={16}
                      h={16}
                      sx={{ pointerEvents: "none" }}
                      variant="filled"
                      size="xs"
                      p={0}
                      color="blue.5"
                    >
                      {ctasItemsCount}
                    </Badge>
                  ) : (
                    <></>
                  )}
                </>
              }
              sx={(theme) => ({
                "&[data-active]": {
                  backgroundColor: theme.colors.blue[0] + "!important",
                  borderRadius: theme.radius.md + "!important",
                  color: theme.colors.blue[8] + "!important",
                },
                border: "solid 1px " + theme.colors.blue[4] + "!important",
              })}
            >
              Edit CTAs
            </Tabs.Tab>
            {/* <Tabs.Tab value="voice" ml="auto">
              Train Your AI
            </Tabs.Tab> */}
          </Tabs.List>

          <Tabs.Panel value="personalization">
            <PersonalizationSection
              blocklist={currentProject.transformer_blocklist_initial ?? []}
              onItemsChange={async (items) => {
                setPersonalizationItemsCount(
                  items.filter((x: any) => x.checked).length
                );

                // Update transformer blocklist
                const result = await updateInitialBlocklist(
                  userToken,
                  currentProject.id,
                  items.filter((x) => !x.checked).map((x) => x.id)
                );

                setCurrentProject(
                  await getFreshCurrentProject(userToken, currentProject.id)
                );
              }}
            />
          </Tabs.Panel>
          <Tabs.Panel value="ctas">
            <CtaSection
              onCTAsLoaded={(data) => {
                setCtasItemsCount(data.filter((x: any) => x.active).length);
              }}
              outlineCTA={hoveredCTA ? messageMetaData.cta : undefined}
            />
          </Tabs.Panel>
          {/* <Tabs.Panel value="voice">
            <VoicesSection />
          </Tabs.Panel> */}
        </Tabs>
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
  onHoveredEnd?: (hovered: boolean) => void;
}) {
  const MAX_MESSAGE_SHOW_LENGTH = 75;
  const MIN_CTA_ASSUMED_LENGTH = 80;

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
    props.onHoveredEnd && props.onHoveredEnd(endHovered);
  }, [_endHovered]);

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
  if (endMessage.length < MIN_CTA_ASSUMED_LENGTH) {
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
          <Box>
            {showFullMessage || animationPlaying.current ? (
              <Text fz="xs">
                <Text
                  ref={startRef}
                  span
                  sx={{
                    color:
                      startHovered || animationPlaying.current
                        ? theme.colors.teal[8]
                        : undefined,
                    backgroundColor:
                      startHovered || animationPlaying.current
                        ? theme.colors.teal[0]
                        : undefined, //theme.colors.teal[0]+"99",
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
                    color: startHovered ? theme.colors.teal[8] : undefined,
                    backgroundColor: startHovered
                      ? theme.colors.teal[0]
                      : undefined, //theme.colors.teal[0]+"99",
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
                      ? theme.colors.teal[8]
                      : undefined,
                  backgroundColor:
                    hovered || animationPlaying.current
                      ? theme.colors.teal[0]
                      : undefined, //theme.colors.teal[0]+"99",
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
                  color: hovered ? theme.colors.teal[8] : undefined,
                  backgroundColor: hovered ? theme.colors.teal[0] : undefined, //theme.colors.teal[0]+"99",
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
  bodyText?: string;
  footer?: ReactNode;
  conversion?: number;
  timesUsed?: number;
  timesConverted?: number;
  badgeText?: string;
  badgeHoverText?: string;
  onClick: () => void;
  canEdit?: boolean;
  editProps?: {
    title: string;
    bumpedCount: number;
    bumpedFrameworks: BumpFramework[];
    activeBumpFrameworkId: number;
  };
  canRemove?: boolean;
  onRemove?: () => void;
  badgeColor?: string;
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
          </Group>
          {props.conversion !== undefined && (
            <Tooltip
              label={
                props.conversion > 9.0
                  ? "Your open rates are above industry standards (9%). Congrats!"
                  : props.conversion <= 9.0 && props.conversion > 0.0
                  ? "Your open rates are below industry standards (9%). Try changing your message to improve from your current " +
                    Math.round(props.conversion * 10) / 10 +
                    "%."
                  : "Not enough data, " +
                    props.timesConverted +
                    " / " +
                    props.timesUsed +
                    " prospects have been bumped."
              }
              withArrow
              withinPortal
            >
              <Badge
                variant="dot"
                color={
                  isNaN(props.conversion)
                    ? "grey"
                    : props.conversion > 9.0
                    ? "green"
                    : "red"
                }
              >
                Opened:{" "}
                {!isNaN(props.conversion)
                  ? Math.trunc(props.conversion) + "%"
                  : "TBD"}
              </Badge>
            </Tooltip>
          )}
          {props.badgeText && (
            <Tooltip
              label={props.badgeHoverText}
              openDelay={100}
              withArrow
              withinPortal
              disabled={!props.badgeHoverText}
            >
              <Badge
                ml="auto"
                color={props.badgeColor || "gray"}
                size="sm"
                styles={{
                  root: { textTransform: "initial", fontWeight: 500 },
                }}
              >
                {props.badgeText}
              </Badge>
            </Tooltip>
          )}
          <Group spacing={3}>
            {props.canEdit && props.editProps && (
              <BumpFrameworkSelect {...props.editProps} />
            )}
            {props.canRemove && props.onRemove && (
              <Tooltip label="Remove" withinPortal>
                <ActionIcon radius="xl" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  props.onRemove!();
                }}>
                  <IconCircleMinus size="1.2rem" />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
        <Divider />
        <Box px={20} py={10}>
          <Title order={4} fw={600}>
            {props.bodyTitle}
          </Title>
          {props.bodyText && (
            <Tooltip
              label={props.bodyText}
              maw={500}
              openDelay={500}
              position="bottom"
              withArrow
              withinPortal
              multiline
              disabled={props.bodyText.length < 150}
            >
              <Text fz={12} c="dimmed" truncate>
                {_.truncate(props.bodyText, {
                  length: 50,
                })}
              </Text>
            </Tooltip>
          )}
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
  setIsDataChanged: (val: boolean) => void;
  prospectId: number;
  setProspectId: (prospectId: number) => void;
}) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const queryClient = useQueryClient();

  const prospectId = props.prospectId;
  const setProspectId = props.setProspectId;

  // const [prospectId, setProspectId] = useState<number>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);
  const [changed, setChanged] = useState(false);

  const [noProspectsFound, setNoProspectsFound] = useState(false);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );

  const [humanReadableContext, setHumanReadableContext] = useState<
    string | undefined
  >(props.framework.bump_framework_human_readable_prompt);
  const [contextQuestion, setContextQuestion] = useState(
    props.framework.bump_framework_human_readable_prompt
  );
  const [opened, { toggle }] = useDisclosure(false);

  const [activeTab, setActiveTab] = useState<string | null>("none");
  const [descriptionEditState, setDescriptionEditState] = useState(false);
  const [personalizationItemsCount, setPersonalizationItemsCount] =
    useState<number>();

  let { hovered: hovered, ref: ref } = useHover();

  const form = useForm({
    initialValues: {
      frameworkName: props.framework.title,
      bumpLength: props.framework.bump_length,
      delayDays: props.framework.bump_delay_days,
      promptInstructions: props.framework.description,
      useAccountResearch: props.framework.use_account_research,
      additionalContext: props.framework.additional_context,
      bumpFrameworkTemplateName: props.framework.bump_framework_template_name,
      bumpFrameworkHumanReadablePrompt:
        props.framework.bump_framework_human_readable_prompt,
    },
  });
  const [debouncedForm] = useDebouncedValue(form.values, 200);
  const prevDebouncedForm = usePrevious(debouncedForm);
  const [
    moreAdditionInformationOpened,
    { toggle: moreAdditionInformationToggle },
  ] = useDisclosure(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  useEffect(() => {
    props.setIsDataChanged(changed);
  }, [changed]);
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
      values.useAccountResearch,
      props.framework.transformer_blocklist,
      values.additionalContext,
      values.bumpFrameworkTemplateName,
      values.bumpFrameworkHumanReadablePrompt
    );
    await queryClient.refetchQueries({
      queryKey: [`query-get-bump-frameworks`],
    });
    setChanged(false);

    return result.status === "success";
  };

  // useEffect(() => {
  //   saveSettings(debouncedForm);
  //   if (
  //     debouncedForm.useAccountResearch &&
  //     !prevDebouncedForm?.useAccountResearch
  //   ) {
  //     //setActiveTab('personalization');
  //   }
  //   if (!debouncedForm.useAccountResearch && activeTab === "personalization") {
  //     setActiveTab("none");
  //   }
  // }, [debouncedForm]);

  const openPersonalizationSettings = () => {
    if (form.values.useAccountResearch) {
      setActiveTab("personalization");
    }
  };

  const getFollowUpMessage = async (prospectId: number, useCache: boolean) => {
    if (!currentProject) return null;
    setLoading(true);
    setMessage("");

    const result = await generateBumpLiMessage(
      userToken,
      prospectId,
      props.framework.id,
      props.bumpCount,
      useCache
    );

    setLoading(false);
    return result.status === "success" ? result.data.message : null;
  };

  const [BUMP_FRAMEWORK_OPTIONS, setBUMP_FRAMEWORK_OPTIONS] = useState<any>({});

  const getBumpFrameworkTemplates = async () => {
    fetch(`${API_URL}/bump_framework/bump_framework_templates`, {
      method: "GET",
    })
      .then((res) => {
        const data = res.json();
        console.log(data);
        return data;
      })
      .then((j) => {
        let options: any = {};
        const data = j["bump_framework_templates"];
        console.log(data);
        data.forEach((template: any) => {
          options[template.tag] = {
            name: template.name,
            raw_prompt: template.raw_prompt,
            human_readable_prompt: template.human_readable_prompt,
            length: template.length,
          };
        });
        console.log(options);

        setBUMP_FRAMEWORK_OPTIONS(options);
      });
  };

  useEffect(() => {
    getBumpFrameworkTemplates();
    console.log("getBumpFrameworkTemplates");
  }, []);

  const autoCompleteWithBrain = () => {
    setAiGenerating(true);
    fetch(`${API_URL}/ml/fill_prompt_from_brain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        prompt: form.values.additionalContext,
        archetype_id: currentProject?.id || -1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        form.setFieldValue("additionalContext", data.data);
        setChanged(true);
      })
      .finally(() => {
        setAiGenerating(false);
      });
  };

  // When prospect changes, get the bump message
  useEffect(() => {
    if (!prospectId) return;
    getFollowUpMessage(prospectId, true).then((msg) => {
      if (msg) {
        setMessage(msg);
      }
    });
  }, [prospectId]);

  if (!currentProject) return <></>;

  return (
    <>
      <Stack ml="xl" spacing={0}>
        <Group position="apart">
          <Group>
            <Title order={3}>
              Follow-Up {props.bumpCount + 1}: {props.framework.title}
            </Title>
          </Group>
        </Group>
        <Box my={5}>
          <Text fz="xs" c="dimmed">
            A follow up message to send to prospects who have not replied to
            your previous messages.
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
                      No prospects found to show example message.
                    </Text>
                    <Center>
                      <Box>
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
                      </Box>
                    </Center>
                  </Stack>
                </Center>
              </Box>
            ) : (
              <Box>
                <Group position="apart" pb="0.3125rem">
                  <Text fz="sm" fw={500} c="dimmed">
                    EXAMPLE FOLLOW-UP MESSAGE:
                  </Text>
                  <Group>
                    <Button
                      size="xs"
                      variant="subtle"
                      compact
                      leftIcon={<IconReload size="0.75rem" />}
                      onClick={() => {
                        if (prospectId) {
                          getFollowUpMessage(prospectId, false).then((msg) => {
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
                      selectedProspect={prospectId}
                      autoSelect
                      includeDrawer
                    />
                  </Group>
                </Group>
                <Box
                  sx={{
                    border: "1px dashed #339af0",
                    borderRadius: "0.5rem",
                  }}
                  p="sm"
                  mih={150}
                >
                  {message && (
                    <LiExampleMessage
                      message={message}
                      hovered={
                        hovered || activeTab === "personalization"
                          ? true
                          : undefined
                      }
                      onClick={openPersonalizationSettings}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>

          <Button
            color="green"
            w="200px"
            ml="auto"
            disabled={!changed}
            onClick={() => {
              saveSettings(debouncedForm);
              showNotification({
                message: "Settings Saved",
                color: "green",
              });
              props.setIsDataChanged(false);
            }}
          >
            Save Settings
          </Button>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section
              sx={{
                flexDirection: "row",
                display: "flex",
                gap: "1rem",
              }}
              p="xs"
              withBorder
            >
              <Box ml="xs" mt="4px" w="50%">
                <Text fz="sm" fw={500} c="dimmed">
                  FRAMEWORK NAME:
                </Text>
                <TextInput
                  placeholder="Name"
                  variant="filled"
                  {...form.getInputProps("frameworkName")}
                  onChange={(e) => {
                    form.setFieldValue("frameworkName", e.target.value);
                    setChanged(true);
                  }}
                />
              </Box>

              <Flex align={"end"} w={"50%"}>
                <Select
                  withinPortal
                  ml="auto"
                  mr="xs"
                  w="100%"
                  placeholder="Select different template"
                  searchable
                  clearable
                  data={Object.keys(BUMP_FRAMEWORK_OPTIONS)
                    .map((key: any) => {
                      return {
                        value: key,
                        label: BUMP_FRAMEWORK_OPTIONS[key].name,
                      };
                    })
                    .concat([
                      { value: "make-your-own", label: "🛠 Make your own" },
                    ])}
                  onChange={(value: any) => {
                    if (value === "make-your-own") {
                      form.setFieldValue("bumpFrameworkTemplateName", "");
                      form.setFieldValue(
                        "bumpFrameworkHumanReadablePrompt",
                        "Describe your custom framework here..."
                      );
                      form.setFieldValue("additionalContext", "");
                      form.setFieldValue("promptInstructions", "");
                      setContextQuestion("");

                      setChanged(true);

                      toggle();
                      return;
                    }

                    const framework = BUMP_FRAMEWORK_OPTIONS[value];
                    if (!framework) {
                      form.setFieldValue("bumpFrameworkTemplateName", "");
                      form.setFieldValue(
                        "bumpFrameworkHumanReadablePrompt",
                        ""
                      );
                      form.setFieldValue("additionalContext", "");
                      setContextQuestion("");
                      return;
                    }

                    const name = framework.name;
                    const raw_prompt = framework.raw_prompt;
                    const human_readable_prompt =
                      framework.human_readable_prompt;
                    const length = framework.length;

                    form.setFieldValue("bumpFrameworkTemplateName", value);
                    form.setFieldValue(
                      "bumpFrameworkHumanReadablePrompt",
                      human_readable_prompt
                    );

                    setHumanReadableContext(human_readable_prompt);

                    form.setFieldValue("promptInstructions", raw_prompt);
                    form.setFieldValue("frameworkName", name);
                    form.setFieldValue("bumpLength", length);
                    setChanged(true);
                  }}
                />
              </Flex>
            </Card.Section>

            <Box
              pt={"xs"}
              pb={descriptionEditState ? "xs" : "md"}
              pos={"relative"}
            >
              <ActionIcon
                pos={"absolute"}
                right={0}
                top={"xs"}
                sx={{ zIndex: 10 }}
                onClick={() => setDescriptionEditState((p) => !p)}
              >
                <IconPencil />
              </ActionIcon>
              {descriptionEditState ? (
                <Textarea
                  label="Human Readable Description"
                  {...form.getInputProps("bumpFrameworkHumanReadablePrompt")}
                  onChange={(e) => {
                    form.setFieldValue(
                      "bumpFrameworkHumanReadablePrompt",
                      e.target.value
                    );
                    setChanged(true);
                  }}
                />
              ) : (
                <Group>{form.values.bumpFrameworkHumanReadablePrompt}</Group>
              )}
            </Box>
          </Card>

          {form.values.promptInstructions.includes("Answer:") && (
            <Alert
              icon={<IconBulb size="1rem" />}
              variant="outline"
              onClick={toggle}
              sx={{ cursor: "pointer" }}
            >
              <Text color="blue" fz="12px">
                Note: This framework requires you fill out additional context in
                the prompt. Please press 'Advanced Settings'
              </Text>
            </Alert>
          )}

          <form
            onChange={() => {
              setChanged(true);
            }}
          >
            {/* todo(Aakash) - remove this START */}
            {/* {false && form.values.additionalContext && (
              <Box mb="xs">
                <Group>
                  <Button
                    onClick={moreAdditionInformationToggle}
                    variant="white"
                    color="gray.6"
                    m={0}
                    p={0}
                    fs={"1.25rem"}
                  >
                    <IconChevronRight
                      style={{
                        transform: moreAdditionInformationOpened
                          ? "rotate(90deg)"
                          : "",
                      }}
                    />
                    More Info requested ⚠️
                  </Button>
                </Group>
                <Collapse in={moreAdditionInformationOpened}>
                  <Box w="100%">
                    <Textarea
                      minRows={7}
                      label="Make your answer better by providing additional text"
                      {...form.getInputProps("additionalContext")}
                    />
                    <Button
                      color="grape"
                      size="xs"
                      mt="xs"
                      ml="auto"
                      leftIcon={<IconRobot size="0.8rem" />}
                      onClick={() => autoCompleteWithBrain()}
                      loading={aiGenerating}
                    >
                      AI Complete Context
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            )} */}
            {/* todo(Aakash) - remove this END */}

            <Box maw={"100%"} mx="auto">
              <Group>
                <Button
                  onClick={toggle}
                  w="100%"
                  color="black"
                  variant="outline"
                  leftIcon={<IconTools size={"0.8rem"} />}
                >
                  {opened ? "Hide Advanced Settings" : "Show Advanced Settings"}
                </Button>
              </Group>
              <Collapse in={opened} mt={"xs"}>
                <Card withBorder mb="xs">
                  <Group grow>
                    <Box>
                      <Text fz="sm" fw={500} c="dimmed">
                        MESSAGE LENGTH:
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
                  <Box mt="xs">
                    <Text fz="sm" fw={500} c="dimmed">
                      RAW PROMPT INSTRUCTIONS:
                    </Text>
                    <Textarea
                      placeholder="Instructions"
                      minRows={7}
                      variant="filled"
                      {...form.getInputProps("promptInstructions")}
                    />
                  </Box>
                  <Tabs
                    value={activeTab}
                    onTabChange={setActiveTab}
                    pt="sm"
                    variant="pills"
                    keepMounted={true}
                    radius="md"
                    allowTabDeactivation
                    sx={{ position: "relative" }}
                  >
                    <Tabs.List>
                      <Tooltip
                        label="Account Research Required"
                        disabled={form.values.useAccountResearch}
                        openDelay={500}
                        withArrow
                      >
                        <Tabs.Tab
                          value="personalization"
                          color="teal.5"
                          rightSection={
                            <>
                              {personalizationItemsCount &&
                              form.values.useAccountResearch ? (
                                <Badge
                                  w={16}
                                  h={16}
                                  sx={{ pointerEvents: "none" }}
                                  variant="filled"
                                  size="xs"
                                  p={0}
                                  color="teal.6"
                                >
                                  {personalizationItemsCount}
                                </Badge>
                              ) : (
                                <></>
                              )}
                            </>
                          }
                          disabled={!form.values.useAccountResearch}
                          sx={(theme) => ({
                            "&[data-active]": {
                              backgroundColor:
                                theme.colors.teal[0] + "!important",
                              borderRadius: theme.radius.md + "!important",
                              color: theme.colors.teal[8] + "!important",
                            },
                          })}
                        >
                          Personalization Settings
                        </Tabs.Tab>
                      </Tooltip>
                    </Tabs.List>
                    <Box sx={{ position: "absolute", top: 20, right: 0 }}>
                      <Switch
                        {...form.getInputProps("useAccountResearch", {
                          type: "checkbox",
                        })}
                        color="teal"
                        size="sm"
                        label="Use Account Research"
                        labelPosition="left"
                      />
                    </Box>

                    <Tabs.Panel value="personalization">
                      <PersonalizationSection
                        blocklist={props.framework.transformer_blocklist}
                        onItemsChange={async (items) => {
                          setPersonalizationItemsCount(
                            items.filter((x: any) => x.checked).length
                          );

                          // Update transformer blocklist
                          const result = await patchBumpFramework(
                            userToken,
                            props.framework.id,
                            props.framework.overall_status,
                            props.framework.title,
                            props.framework.description,
                            props.framework.bump_length,
                            props.framework.bumped_count,
                            props.framework.bump_delay_days,
                            props.framework.default,
                            props.framework.use_account_research,
                            items.filter((x) => !x.checked).map((x) => x.id),
                            props.framework.additional_context,
                            props.framework.bump_framework_template_name,
                            props.framework.bump_framework_human_readable_prompt
                          );

                          await queryClient.refetchQueries({
                            queryKey: [`query-get-bump-frameworks`],
                          });
                        }}
                      />
                    </Tabs.Panel>
                  </Tabs>
                </Card>
              </Collapse>
            </Box>
          </form>
        </Stack>
      </Stack>
    </>
  );
}

const PersonalizationSection = (props: {
  blocklist: string[];
  onItemsChange: (items: any[]) => void;
}) => {
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  const [acceptanceRates, setAcceptanceRates] = useState<any>();

  const [prospectItems, setProspectItems] = useState([
    {
      title: "Personal Bio",
      id: "LINKEDIN_BIO_SUMMARY",
      checked: !props.blocklist.includes("LINKEDIN_BIO_SUMMARY"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "LINKEDIN_BIO_SUMMARY"
      ),
    },
    {
      title: "List Of Past Jobs",
      id: "LIST_OF_PAST_JOBS",
      checked: !props.blocklist.includes("LIST_OF_PAST_JOBS"),
      disabled:
        !!currentProject?.transformer_blocklist?.includes("LIST_OF_PAST_JOBS"),
    },
    {
      title: "Years of Experience",
      id: "YEARS_OF_EXPERIENCE",
      checked: !props.blocklist.includes("YEARS_OF_EXPERIENCE"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "YEARS_OF_EXPERIENCE"
      ),
    },
    {
      title: "Current Experience",
      id: "CURRENT_EXPERIENCE_DESCRIPTION",
      checked: !props.blocklist.includes("CURRENT_EXPERIENCE_DESCRIPTION"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "CURRENT_EXPERIENCE_DESCRIPTION"
      ),
    },
    {
      title: "Education History",
      id: "COMMON_EDUCATION",
      checked: !props.blocklist.includes("COMMON_EDUCATION"),
      disabled:
        !!currentProject?.transformer_blocklist?.includes("COMMON_EDUCATION"),
    },
    {
      title: "Recommendations",
      id: "RECENT_RECOMMENDATIONS",
      checked: !props.blocklist.includes("RECENT_RECOMMENDATIONS"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "RECENT_RECOMMENDATIONS"
      ),
    },
    {
      title: "Patents",
      id: "RECENT_PATENTS",
      checked: !props.blocklist.includes("RECENT_PATENTS"),
      disabled:
        !!currentProject?.transformer_blocklist?.includes("RECENT_PATENTS"),
    },
    {
      title: "Years at Current Job",
      id: "YEARS_OF_EXPERIENCE_AT_CURRENT_JOB",
      checked: !props.blocklist.includes("YEARS_OF_EXPERIENCE_AT_CURRENT_JOB"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "YEARS_OF_EXPERIENCE_AT_CURRENT_JOB"
      ),
    },
    {
      title: "Custom Data Points",
      id: "CUSTOM",
      checked: !props.blocklist.includes("CUSTOM"),
      disabled: !!currentProject?.transformer_blocklist?.includes("CUSTOM"),
    },
  ]);

  const [companyItems, setCompanyItems] = useState([
    {
      title: "Company Description",
      id: "CURRENT_JOB_DESCRIPTION",
      checked: !props.blocklist.includes("CURRENT_JOB_DESCRIPTION"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "CURRENT_JOB_DESCRIPTION"
      ),
    },
    {
      title: "Company Specialites",
      id: "CURRENT_JOB_SPECIALTIES",
      checked: !props.blocklist.includes("CURRENT_JOB_SPECIALTIES"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "CURRENT_JOB_SPECIALTIES"
      ),
    },
    {
      title: "General Company News",
      id: "SERP_NEWS_SUMMARY",
      checked: !props.blocklist.includes("SERP_NEWS_SUMMARY"),
      disabled:
        !!currentProject?.transformer_blocklist?.includes("SERP_NEWS_SUMMARY"),
    },
    {
      title: "Negative Company News",
      id: "SERP_NEWS_SUMMARY_NEGATIVE",
      checked: !props.blocklist.includes("SERP_NEWS_SUMMARY_NEGATIVE"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "SERP_NEWS_SUMMARY_NEGATIVE"
      ),
    },
    {
      title: "Website Info",
      id: "GENERAL_WEBSITE_TRANSFORMER",
      checked: !props.blocklist.includes("GENERAL_WEBSITE_TRANSFORMER"),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        "GENERAL_WEBSITE_TRANSFORMER"
      ),
    },
  ]);

  const { data, isFetching } = useQuery({
    queryKey: [`query-get-acceptance-rates`],
    queryFn: async () => {
      const result = await getAcceptanceRates(userToken);
      return result.status === "success" ? result.data : undefined;
    },
  });

  const allItems = prospectItems
    .map((x) => {
      return {
        ...x,
        type: "PROSPECT",
        accepted: getAcceptanceRate(x.id),
      };
    })
    .concat(
      companyItems.map((x) => {
        return {
          ...x,
          type: "COMPANY",
          accepted: getAcceptanceRate(x.id),
        };
      })
    )
    .sort((a, b) => {
      if (a.accepted === null && b.accepted === null) return 0;
      if (a.accepted === null) return 1;
      if (b.accepted === null) return -1;
      return b.accepted - a.accepted;
    });

  function getAcceptanceRate(itemId: string) {
    if (!data) return null;
    for (const d of data) {
      if (d.research_point_type === itemId) {
        return Math.round(d["avg. acceptance %"] * 100) as number;
      }
    }
    return null;
  }

  useEffect(() => {
    props.onItemsChange([...prospectItems, ...companyItems]);
  }, []);

  function setProfileChecked(itemId: string, checked: boolean) {
    setProspectItems((prev) => {
      const items = [...prev];
      items.map((i) => {
        if (i.id === itemId) {
          i.checked = checked;
        }
        return i;
      });
      props.onItemsChange([...items, ...companyItems]);
      return items;
    });
  }

  function setCompanyChecked(itemId: string, checked: boolean) {
    setCompanyItems((prev) => {
      const items = [...prev];
      items.map((i) => {
        if (i.id === itemId) {
          i.checked = checked;
        }
        return i;
      });
      props.onItemsChange([...prospectItems, ...items]);
      return items;
    });
  }

  return (
    <Flex direction="column" pt="md">
      <Card shadow="md" radius={"md"} mb={"1rem"}>
        <Group position="apart">
          <Box>
            <Title fw={300} order={4}>
              Acceptance Rate by Personalization
            </Title>
          </Box>
          <Box sx={{ textAlign: "right" }} ml="auto" pb="sm">
            <Badge
              leftSection={<IconCircle size="0.7rem" />}
              color="grape"
              size="xs"
            >
              Account Data
            </Badge>
            <br />
            <Badge
              leftSection={<IconCircle size="0.7rem" />}
              color="green"
              mt="xs"
              size="xs"
            >
              Contact Data
            </Badge>
          </Box>
        </Group>
        <Flex direction={"column"} gap={"0.5rem"}>
          {allItems.map((item) => (
            <ProcessBar
              id={item.id}
              title={item.title}
              percent={item.accepted || 0}
              checked={item.checked}
              onPressItem={
                item.type === "PROSPECT" ? setProfileChecked : setCompanyChecked
              }
              color={item.type === "PROSPECT" ? "teal" : "grape"}
            />
          ))}
        </Flex>
      </Card>

      {/* <PersonalizationCard
        title="Prospect-Based"
        items={prospectItems}
        onPressItem={setProfileChecked}
      />

      <PersonalizationCard
        title="Company-Based"
        items={companyItems}
        onPressItem={setAccountChecked}
        isPurple
      /> */}
    </Flex>
  );
};

const ProcessBar: React.FC<{
  id: string;
  title: string;
  disabled?: boolean;
  percent: number;
  checked?: boolean;
  color?: string;
  onPressItem: (itemId: string, checked: boolean) => void;
}> = ({
  id,
  title,
  percent,
  color = "green",
  disabled,
  checked,
  onPressItem,
}) => {
  return (
    <Flex align={"center"} gap={"0.5rem"}>
      <Flex sx={{ flex: 4 }} gap={"0.25rem"} align={"center"}>
        <Checkbox
          size={"sm"}
          label={<Text fw={300}>{title}</Text>}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onPressItem(id, event.currentTarget.checked)}
          color={color}
          variant="outline"
        />
        <Flex sx={{ flex: 1 }}>
          <Divider w={"100%"} color={"#E9ECEF"} />
        </Flex>
        <Tooltip label="Historical Acceptance Rate" withArrow>
          <Button
            variant={"light"}
            fw={700}
            size="xs"
            color={color}
            radius="xl"
            h="auto"
            fz={"0.625rem"}
            py={"0.125rem"}
            px={"0.25rem"}
          >
            {percent}%
          </Button>
        </Tooltip>
      </Flex>
      <Flex direction={"column"} sx={{ flex: 6 }}>
        <Progress value={percent} color={color} size={"lg"} radius="xl" />
      </Flex>
    </Flex>
  );
};

export const PersonalizationCard: React.FC<{
  title: string;
  isPurple?: boolean;
  items: { title: string; checked: boolean; disabled: boolean }[];
  onPressItem: (
    item: { title: string; checked: boolean; disabled: boolean },
    checked: boolean
  ) => void;
}> = ({ title, isPurple, items, onPressItem }) => {
  return (
    <Card shadow="xs" radius={"md"} mb={"1rem"}>
      <Card.Section>
        <Flex
          align={"center"}
          justify={"space-between"}
          bg={`${isPurple ? "grape" : "teal"}.0`}
          py={"0.5rem"}
          px={"1rem"}
          gap={"0.5rem"}
        >
          <Text fw={"400"} fz="xs" color={"${isPurple ? 'grape' : 'teal'}.8"}>
            {title}
          </Text>
        </Flex>
      </Card.Section>
      <Grid gutter={"1.5rem"} py={"1rem"}>
        {items.map((item) => {
          return (
            <Grid.Col xs={12} md={6} xl={4} key={item.title}>
              <Flex align={"center"} gap={"0.25rem"}>
                <Checkbox
                  size={"xs"}
                  label={item.title}
                  checked={item.checked}
                  disabled={item.disabled}
                  onChange={(event) =>
                    onPressItem(item, event.currentTarget.checked)
                  }
                  color={`${isPurple ? "grape" : "teal"}`}
                  variant="outline"
                />
              </Flex>
            </Grid.Col>
          );
        })}
      </Grid>
    </Card>
  );
};

const CtaSection = (props: {
  onCTAsLoaded: (ctas: CTA[]) => void;
  outlineCTA?: string;
}) => {
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-cta-data-${currentProject?.id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `${API_URL}/client/archetype/${currentProject?.id}/get_ctas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.ctas) {
        return [];
      }

      let pageData = (res.ctas as CTA[]).map((cta) => {
        let totalResponded = 0;
        if (cta.performance) {
          for (const status in cta.performance.status_map) {
            if (status !== "SENT_OUTREACH" && status !== "NOT_INTERESTED") {
              totalResponded += cta.performance.status_map[status];
            }
          }
        }
        return {
          ...cta,
          percentage: cta.performance?.total_count
            ? Math.round((totalResponded / cta.performance.total_count) * 100)
            : 0,
          total_responded: totalResponded,
          total_count: cta.performance?.total_count,
        };
      });
      props.onCTAsLoaded(pageData);
      if (!pageData) {
        return [];
      } else {
        return _.sortBy(pageData, ["active", "percentage", "id"]).reverse();
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject,
  });

  return (
    <Box pt="md" sx={{ position: "relative" }}>
      <LoadingOverlay visible={isFetching} zIndex={10} />
      {data &&
        data.map((e, index) => (
          <CTAOption
            data={{
              id: e.id,
              label: e.text_value,
              description: "",
              checked: e.active,
              outlined: !!props.outlineCTA && props.outlineCTA === e.text_value,
              tags: [
                {
                  label: "Acceptance:",
                  highlight: e.percentage + "%",
                  color: "blue",
                  variant: "subtle",
                  hovered:
                    "Prospects: " + e.total_responded + "/" + e.total_count,
                },
                // {
                //   label: "Prospects:",
                //   highlight: e.total_responded + "/" + e.total_count,
                //   color: "indigo",
                //   variant: "subtle",
                // },
                {
                  label: e.cta_type,
                  highlight: "",
                  color: valueToColor(theme, e.cta_type),
                  variant: "light",
                },
              ],
            }}
            key={index}
            onToggle={async (enabled) => {
              const result = await toggleCTA(userToken, e.id);
              if (result.status === "success") {
                await refetch();
              }
            }}
            onClickEdit={() => {
              openContextModal({
                modal: "editCTA",
                title: <Title order={3}>Edit CTA</Title>,
                innerProps: {
                  personaId: currentProject?.id,
                  cta: e,
                },
              });
            }}
            onClickDelete={async () => {
              const response = await deleteCTA(userToken, e.id);
              if (response.status === "success") {
                showNotification({
                  title: "Success",
                  message: "CTA has been deleted",
                  color: "blue",
                });
              }
              refetch();
            }}
          />
        ))}

      <Button
        sx={{
          position: "absolute",
          top: -25,
          right: 5,
        }}
        variant={"filled"}
        size="sm"
        compact
        color={"blue"}
        radius="xl"
        fw={"500"}
        leftIcon={<IconPlus size={"0.75rem"} />}
        onClick={() => {
          openContextModal({
            modal: "createNewCTA",
            title: <Title order={3}>Create CTA</Title>,
            innerProps: {
              personaId: currentProject?.id,
            },
          });
        }}
      >
        Add CTA
      </Button>
    </Box>
  );
};

interface Tag {
  label: string;
  highlight?: string;
  color: MantineColor;
  hovered?: string;
  variant: "subtle" | "filled" | "light";
}

interface TabOption {
  id: number;
  label: string;
  description: string;
  checked: boolean;
  tags: Tag[];
  outlined?: boolean;
}

const CTAOption: React.FC<{
  data: TabOption;
  onToggle: (value: boolean) => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
}> = ({ data, onToggle, onClickEdit, onClickDelete }) => {
  return (
    <Card
      shadow="xs"
      radius={"md"}
      py={10}
      mb={5}
      sx={(theme) => ({
        border: data.outlined
          ? "1px solid " + theme.colors.blue[4]
          : "1px solid transparent",
      })}
    >
      <Flex direction={"column"} w={"100%"}>
        <Flex gap={"0.5rem"} mb={"0.75rem"} justify={"space-between"}>
          <Flex wrap={"wrap"} gap={"0.5rem"} align={"center"}>
            {data.tags.map((e) => (
              <Tooltip
                disabled={!e.hovered}
                label={e.hovered}
                withArrow
                withinPortal
              >
                <Button
                  key={e.label}
                  variant={e.variant}
                  size="xs"
                  color={e.color}
                  radius="xl"
                  h="auto"
                  fz={"0.75rem"}
                  py={"0.125rem"}
                  px={"0.25rem"}
                  fw={"400"}
                >
                  {e.label}
                  {e.highlight && (
                    <strong style={{ paddingLeft: 5 }}> {e.highlight}</strong>
                  )}
                </Button>
              </Tooltip>
            ))}
          </Flex>

          <Flex wrap={"wrap"} gap={"1rem"} align={"center"}>
            {/* <Menu shadow="md" width={200} withinPortal withArrow>
              <Menu.Target>
                <ActionIcon radius="xl" size="sm">
                  <IconPencil size="1.0rem" />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item icon={<IconEdit size={14} />} onClick={onClickEdit}>
                  Edit
                </Menu.Item>
                <Menu.Item
                  icon={<IconTrash size={14} />}
                  onClick={onClickDelete}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu> */}
            <ActionIcon radius="xl" size="sm" onClick={onClickEdit}>
              <IconPencil size="1.0rem" />
            </ActionIcon>
            <ActionIcon radius="xl" size="sm" onClick={onClickDelete}>
              <IconTrash size="1.0rem" />
            </ActionIcon>
            <Switch
              checked={data.checked}
              color={"blue"}
              size="xs"
              onChange={({ currentTarget: { checked } }) => onToggle(checked)}
            />
          </Flex>
        </Flex>

        <Text fw={"400"} fz={"0.75rem"} color={"gray.8"}>
          {data.label}
        </Text>
        {/* <Text
          fw={"500"}
          fz={"0.75rem"}
          color={"gray.5"}
          dangerouslySetInnerHTML={{ __html: data.description }}
        ></Text> */}
      </Flex>
    </Card>
  );
};
