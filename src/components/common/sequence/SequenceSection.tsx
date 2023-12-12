import { currentProjectState, uploadDrawerOpenState } from '@atoms/personaAtoms';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { getFreshCurrentProject } from '@auth/core';
import ModalSelector from '@common/library/ModalSelector';
import ProspectSelect from '@common/library/ProspectSelect';
import VoiceSelect from '@common/library/VoiceSelect';
import PersonaDetailsCTAs from '@common/persona/details/PersonaDetailsCTAs';
import VoicesSection from '@common/voice_builder/VoicesSection';
import { API_URL } from '@constants/data';
import PersonaUploadDrawer from '@drawers/PersonaUploadDrawer';
import { TypeAnimation } from 'react-type-animation';

import { C, co, ct, ex } from '@fullcalendar/core/internal-common';
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
  Loader,
  Image,
  HoverCard,
  FocusTrap,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure, useHover, usePrevious } from '@mantine/hooks';
import sellScaleLogo from './assets/logo.jpg';
import { modals, openConfirmModal, openContextModal } from '@mantine/modals';
import {
  IconBrain,
  IconCheck,
  IconChevronCompactDown,
  IconCircle2Filled,
  IconCopy,
  IconDots,
  IconEdit,
  IconMessages,
  IconPencil,
  IconPlus,
  IconReload,
  IconTablePlus,
  IconTools,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { proxyURL, valueToColor, nameToInitials, testDelay } from '@utils/general';
import { generateBumpLiMessage } from '@utils/requests/generateBumpLiMessage';
import { getArchetypeConversion } from '@utils/requests/getArchetypeConversion';
import { getBumpFrameworks } from '@utils/requests/getBumpFrameworks';
import getChannels from '@utils/requests/getChannels';
import getLiProfile from '@utils/requests/getLiProfile';
import {
  createLiConvoSim,
  generateInitialMessageForLiConvoSim,
  getLiConvoSim,
} from '@utils/requests/linkedinConvoSimulation';
import { patchBumpFramework } from '@utils/requests/patchBumpFramework';
import { updateBlocklist, updateInitialBlocklist } from '@utils/requests/updatePersonaBlocklist';
import { useDebouncedCallback } from '@utils/useDebouncedCallback';
import _, { set } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BumpFramework } from 'src';
import TextWithNewline from '@common/library/TextWithNewlines';
import { getAcceptanceRates } from '@utils/requests/getAcceptanceRates';
import { showNotification } from '@mantine/notifications';
import {
  IconArrowRight,
  IconArrowsExchange,
  IconBulb,
  IconChevronDown,
  IconChevronRight,
  IconCircle,
  IconCircleMinus,
  IconQuestionMark,
  IconRobot,
  IconSearch,
  IconSettings,
  IconSwitch,
  IconTool,
  IconTrash,
} from '@tabler/icons';
import { useLocation, unstable_usePrompt, useNavigate, useBlocker } from 'react-router-dom';
import { patchArchetypeDelayDays } from '@utils/requests/patchArchetypeDelayDays';
import { patchArchetypeBumpAmount } from '@utils/requests/patchArchetypeBumpAmount';
import { CtaSection } from './CtaSection';
import CTAGenerator from './CTAGenerator';
import { deterministicMantineColor } from '@utils/requests/utils';
import moment from 'moment';
import {
  createLiTemplate,
  getLiTemplates,
  updateLiTemplate,
} from '@utils/requests/linkedinTemplates';
import DOMPurify from 'isomorphic-dompurify';
import InitialMessageTemplateSelector from './InitialMessageTemplateSelector';
import LinkedinInitialMessageTemplate from './LinkedinInitialMessageTemplate';
import { CTAGeneratorSuggestedModal } from '@modals/CTAGeneratorSuggestedModal';
import { createBumpFramework } from '@utils/requests/createBumpFramework';

export default function SequenceSection() {
  const [activeCard, setActiveCard] = useState(0);

  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

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
      const result = await getBumpFrameworks(userToken, [], [], [currentProject?.id]);
      if (result.status !== 'success') return [];
      return result.data.bump_frameworks as BumpFramework[];
    },
  });
  const bumpFrameworks = data ?? [];
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [isModalBlockerVisible, setIsModalBlockerVisible] = useState(false);
  const [nextActiveCardIndex, setNextActiveCardIndex] = useState(0);
  const [prospectId, setProspectId] = useState<number>(-1);

  let blocker = useBlocker(isDataChanged);

  const bf0 = bumpFrameworks.find(
    (bf) => bf.overall_status === 'ACCEPTED' && bf.active && bf.default
  );
  const bf1 = bumpFrameworks.find(
    (bf) => bf.overall_status === 'BUMPED' && bf.bumped_count === 1 && bf.active && bf.default
  );
  const bf2 = bumpFrameworks.find(
    (bf) => bf.overall_status === 'BUMPED' && bf.bumped_count === 2 && bf.active && bf.default
  );
  const bf3 = bumpFrameworks.find(
    (bf) => bf.overall_status === 'BUMPED' && bf.bumped_count === 3 && bf.active && bf.default
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

  const bump_amount = currentProject?.li_bump_amount ?? 3;
  console.log(bump_amount);

  const closeModal = () => {
    setIsModalBlockerVisible(false);
    if (blocker && blocker.reset) {
      blocker.reset();
    }
  };

  const updateBumpAmount = async (bumpAmount: number) => {
    if (!currentProject) return;
    setLoading(true);
    const response = await patchArchetypeBumpAmount(userToken, currentProject.id, bumpAmount);
    if (response.status === 'success') {
      setCurrentProject(await getFreshCurrentProject(userToken, currentProject.id));
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

  const bumpConversionColor = (bf: BumpFramework | undefined, conversion: number | undefined) => {
    return bf &&
      conversion &&
      bf?.etl_num_times_used &&
      conversion > 5 &&
      bf?.etl_num_times_used > 10
      ? 'green'
      : !bf?.etl_num_times_used || (bf?.etl_num_times_used && bf?.etl_num_times_used < 10)
      ? 'gray'
      : 'red';
  };

  const getReplyPillText = (bf: BumpFramework | undefined, bfConversion: number | undefined) => {
    return bf && bf.etl_num_times_used && bf.etl_num_times_used >= 10
      ? (bfConversion ? bfConversion?.toFixed(0) : 0) + '%'
      : 'TBD';
  };

  if (!currentProject) {
    return null;
  }

  return (
    <>
      <Modal.Root
        opened={isModalBlockerVisible || blocker.state === 'blocked'}
        onClose={closeModal}
        centered
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Flex w={'100%'} justify={'center'} align={'center'}>
              <Modal.Title>
                <Text color='yellow' size={'1.25rem'} fw={500}>
                  Warning: Unsaved Change
                </Text>
              </Modal.Title>
            </Flex>
          </Modal.Header>
          <Modal.Body>
            <Text size={'1rem'} color='gray.8'>
              Are you sure you want to dismiss these edits? Save before navigate away
            </Text>

            <Flex justify={'space-between'} gap={'1rem'} mt={'1rem'}>
              <Button
                variant='filled'
                color='yellow'
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
              <Button variant='outline' color='blue' fullWidth onClick={closeModal}>
                Close
              </Button>
            </Flex>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <Card padding='lg' radius='md' withBorder>
        <Group position='apart' p='xs' spacing={0} sx={{ alignItems: 'flex-start' }} noWrap>
          <Box sx={{ flexBasis: '35%', position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <Stack>
              <FrameworkCard
                title='Connection Request'
                bodyTitle='Invite Message'
                // bodyText="Say hello and introduce myself as a sales rep"
                active={activeCard === 0}
                conversion={conversionRate}
                onClick={() => onSetActiveCard(0)}
                footer={
                  <Center sx={{ cursor: 'pointer' }}>
                    <Group spacing={2}>
                      <Text fz={14}>wait for</Text>
                      <NumberInput
                        placeholder='# Days'
                        variant='filled'
                        hideControls
                        sx={{ border: 'solid 1px #777; border-radius: 4px;' }}
                        m={3}
                        min={0}
                        max={99}
                        w={bf0Delay.current > 9 ? 50 : 32}
                        size='xs'
                        defaultValue={currentProject?.first_message_delay_days ?? 0}
                        onChange={async (value) => {
                          if (!currentProject) {
                            showNotification({
                              title: 'Error',
                              message: 'No campaign selected',
                              color: 'red',
                            });
                            return;
                          }
                          const result = await patchArchetypeDelayDays(
                            userToken,
                            currentProject.id,
                            value || 0
                          );
                          if (result.status === 'success') refetch();
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
                variant='solid'
                label={
                  <Tooltip
                    label={
                      replyRate > 0.5
                        ? 'Your reply rates are above industry standards (0.5%). Congrats!'
                        : 'Your reply rates are below industry standards (0.5%). Consider changing your bumps'
                    }
                    withinPortal
                    withArrow
                  >
                    <Badge
                      ml='4px'
                      variant='dot'
                      color={isNaN(replyRate) ? 'grey' : replyRate > 0.5 ? 'green' : 'red'}
                    >
                      Replied: {!isNaN(replyRate) ? replyRate.toFixed(1) + '%' : 'TBD'}
                    </Badge>
                  </Tooltip>
                }
                labelPosition='center'
                mx={10}
              />
              {bump_amount >= 1 && (
                <FrameworkCard
                  title='Follow-Up 1'
                  badgeText={`Reply ${getReplyPillText(bf0, bf0Conversion)}`}
                  badgeColor={bumpConversionColor(bf0, bf0Conversion)}
                  timesUsed={bf0?.etl_num_times_used ?? 0}
                  timesConverted={bf0?.etl_num_times_converted ?? 0}
                  badgeHoverText={
                    bf0 && bf0Conversion
                      ? `${bf0.etl_num_times_converted} / ${bf0.etl_num_times_used} prospects`
                      : (bf0 && bf0.etl_num_times_used && bf0.etl_num_times_used < 20
                          ? 'Not enough data, '
                          : '') +
                        (bf0?.etl_num_times_converted || 0) +
                        ' / ' +
                        (bf0?.etl_num_times_used || 0)
                  }
                  bodyTitle={bf0?.title ?? ''}
                  // bodyText={bf0?.description ?? ""}
                  footer={
                    <Center>
                      <Group spacing={2}>
                        <Text fz={14}>wait for</Text>
                        <NumberInput
                          defaultValue={bf0Delay.current}
                          placeholder='# Days'
                          variant='filled'
                          hideControls
                          sx={{ border: 'solid 1px #777; border-radius: 4px;' }}
                          m={3}
                          min={1}
                          max={99}
                          w={bf0Delay.current > 9 ? 50 : 30}
                          size='xs'
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
                            if (result.status === 'success') refetch();
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
                    title: 'Choose Bump Framework for Follow-Up 1',
                    bumpedCount: 0,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) => bf.overall_status === 'ACCEPTED'
                    ),
                    activeBumpFrameworkId: bf0?.id ?? -1,
                    overallStatus: 'ACCEPTED',
                  }}
                />
              )}

              {bump_amount >= 2 && (
                <FrameworkCard
                  title='Follow-Up 2'
                  badgeText={`Reply ${getReplyPillText(bf1, bf1Conversion)}`}
                  timesUsed={bf1?.etl_num_times_used ?? 0}
                  timesConverted={bf1?.etl_num_times_converted ?? 0}
                  badgeHoverText={
                    bf1 && bf1Conversion
                      ? `${bf1.etl_num_times_converted} / ${bf1.etl_num_times_used} prospects`
                      : (bf1 && bf1.etl_num_times_used && bf1.etl_num_times_used < 20
                          ? 'Not enough data, '
                          : '') +
                        (bf1?.etl_num_times_converted || 0) +
                        ' / ' +
                        (bf1?.etl_num_times_used || 0)
                  }
                  badgeColor={bumpConversionColor(bf1, bf1Conversion)}
                  bodyTitle={bf1?.title ?? ''}
                  // bodyText={bf1?.description ?? ""}
                  footer={
                    <Center>
                      <Group spacing={2}>
                        <Text fz={14}>wait for</Text>
                        <NumberInput
                          defaultValue={bf1Delay.current}
                          placeholder='# Days'
                          variant='filled'
                          hideControls
                          sx={{ border: 'solid 1px #777; border-radius: 4px;' }}
                          m={3}
                          min={1}
                          max={99}
                          w={bf1Delay.current > 9 ? 50 : 30}
                          size='xs'
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
                            if (result.status === 'success') refetch();
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
                    title: 'Choose Bump Framework for Follow-Up 2',
                    bumpedCount: 1,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) => bf.overall_status === 'BUMPED' && bf.bumped_count === 1
                    ),
                    activeBumpFrameworkId: bf1?.id ?? -1,
                    overallStatus: 'BUMPED',
                  }}
                  canRemove={bump_amount === 2}
                  onRemove={() => updateBumpAmount(1)}
                />
              )}

              {bump_amount >= 3 && (
                <FrameworkCard
                  title='Follow-Up 3'
                  badgeText={`Reply ${getReplyPillText(bf2, bf2Conversion)}`}
                  timesUsed={bf2?.etl_num_times_used ?? 0}
                  timesConverted={bf2?.etl_num_times_converted ?? 0}
                  badgeColor={bumpConversionColor(bf2, bf2Conversion)}
                  badgeHoverText={
                    bf2 && bf2Conversion
                      ? `${bf2.etl_num_times_converted} / ${bf2.etl_num_times_used} prospects`
                      : (bf2 && bf2.etl_num_times_used && bf2.etl_num_times_used < 20
                          ? 'Not enough data, '
                          : '') +
                        (bf2?.etl_num_times_converted || 0) +
                        ' / ' +
                        (bf2?.etl_num_times_used || 0)
                  }
                  bodyTitle={bf2?.title ?? ''}
                  // bodyText={bf2?.description ?? ""}
                  footer={
                    <Center>
                      <Group spacing={2}>
                        <Text fz={14}>wait for</Text>
                        <NumberInput
                          defaultValue={bf2Delay.current}
                          placeholder='# Days'
                          variant='filled'
                          hideControls
                          sx={{ border: 'solid 1px #777; border-radius: 4px;' }}
                          m={3}
                          min={2}
                          max={99}
                          w={bf2Delay.current > 9 ? 50 : 30}
                          size='xs'
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
                            if (result.status === 'success') refetch();
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
                    title: 'Choose Bump Framework for Follow-Up 3',
                    bumpedCount: 2,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) => bf.overall_status === 'BUMPED' && bf.bumped_count === 2
                    ),
                    activeBumpFrameworkId: bf2?.id ?? -1,
                    overallStatus: 'BUMPED',
                  }}
                  canRemove={bump_amount === 3}
                  onRemove={() => updateBumpAmount(2)}
                />
              )}

              {bump_amount >= 4 && (
                <FrameworkCard
                  title='Follow-Up 4'
                  badgeText={`Reply ${getReplyPillText(bf3, bf3Conversion)}`}
                  badgeColor={bumpConversionColor(bf3, bf3Conversion)}
                  timesUsed={bf3?.etl_num_times_used ?? 0}
                  timesConverted={bf3?.etl_num_times_converted ?? 0}
                  badgeHoverText={
                    bf3 && bf3Conversion
                      ? `${bf3.etl_num_times_converted} / ${bf3.etl_num_times_used} prospects`
                      : (bf3 && bf3.etl_num_times_used && bf3.etl_num_times_used < 20
                          ? 'Not enough data, '
                          : '') +
                        (bf3?.etl_num_times_converted || 0) +
                        ' / ' +
                        (bf3?.etl_num_times_used || 0)
                  }
                  bodyTitle={bf3?.title ?? ''}
                  // bodyText={bf3?.description ?? ""}
                  active={activeCard === 4}
                  onClick={() => onSetActiveCard(4)}
                  canEdit
                  editProps={{
                    title: 'Choose Bump Framework for Follow-Up 4',
                    bumpedCount: 3,
                    bumpedFrameworks: bumpFrameworks.filter(
                      (bf) => bf.overall_status === 'BUMPED' && bf.bumped_count === 3
                    ),
                    activeBumpFrameworkId: bf3?.id ?? -1,
                    overallStatus: 'BUMPED',
                  }}
                  canRemove={bump_amount === 4}
                  onRemove={() => updateBumpAmount(3)}
                />
              )}

              {bump_amount < 4 && (
                <Center>
                  <Stack spacing={5}>
                    <Text ta='center' fw={200} c='dimmed' fz='xl'>
                      |
                    </Text>
                    <Button
                      variant='subtle'
                      radius='md'
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
          <Box sx={{ flexBasis: '65%' }}>
            {activeCard === 0 && (
              <IntroMessageSection prospectId={prospectId} setProspectId={setProspectId} />
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
  overallStatus: string;
}) {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const { data: dataChannels } = useQuery({
    queryKey: [`query-get-channels-campaign-prospects`],
    queryFn: async () => {
      return await getChannels(userToken);
    },
    refetchOnWindowFocus: false,
  });

  const { data: frameworkTemplates } = useQuery({
    queryKey: [`query-get-bump-framework-templates`],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/bump_framework/bump_framework_templates?bumped_count=${props.bumpedCount}&overall_status=${props.overallStatus}`,
        {
          method: 'GET',
        }
      );
      const result = await res.json();

      const data = result.bump_framework_templates as {
        name: string;
        raw_prompt: string;
        human_readable_prompt: string;
        length: string;
        tag: string;
        bumped_counts: number[];
        overall_statuses: string[];
        transformer_blocklist: string[];
        labels: string[];
        tone: string;
      }[];
      return data.map((template) => {
        return {
          name: template.name,
          prompt: template.raw_prompt,
          human_readable_prompt: template.human_readable_prompt,
          length: template.length,
          tag: template.tag,
          bumped_counts: template.bumped_counts,
          overall_statuses: template.overall_statuses,
          transformer_blocklist: template.transformer_blocklist,
          labels: template.labels,
          tone: template.tone,
        };
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <ModalSelector
        selector={{
          override: (
            <Tooltip label='Edit' withinPortal>
              <ActionIcon radius='xl'>
                <IconPencil size='1.1rem' />
              </ActionIcon>
            </Tooltip>
          ),
        }}
        title={{
          name: props.title,
          rightSection: (
            <Menu shadow='md' width={200} withArrow>
              <Menu.Target>
                <Button variant='subtle' compact>
                  New Framework
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  icon={<IconPlus size={14} />}
                  onClick={() => {
                    openContextModal({
                      modal: 'createBumpFramework',
                      title: 'Create Bump Framework',
                      innerProps: {
                        modalOpened: true,
                        openModal: () => {},
                        closeModal: () => {},
                        backFunction: () => {},
                        dataChannels: dataChannels,
                        status: props.overallStatus,
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
                      modal: 'cloneBumpFramework',
                      title: 'Clone Bump Framework',
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
            <Box w='100px' sx={{ justifyContent: 'center', textAlign: 'center' }}>
              <Badge size='sm' variant='filled' ml='6px'>
                {bf.etl_num_times_converted !== undefined && bf.etl_num_times_used !== undefined
                  ? Math.round(
                      (bf.etl_num_times_converted / (bf.etl_num_times_used + 0.0001)) * 1000
                    ) /
                      10 +
                    '%'
                  : ''}
              </Badge>
              <Text mt='xs' fz='xs'>
                {bf.etl_num_times_converted + ' / ' + bf.etl_num_times_used + ' times'}
              </Text>
              <Text fz='xs' color='gray'>
                {moment(bf.created_at).format('MMM DD, YYYY')}
              </Text>
            </Box>
          ),
          content: (
            <Box>
              <Text fz='sm' fw={500}>
                {bf.title}
              </Text>
              <Text fz='xs' c='dimmed'>
                {bf.description}
              </Text>
            </Box>
          ),
          rightSection: (
            <Box ml='auto'>
              <Switch
                checked={bf.default}
                onChange={(checked) => {
                  setLoading(true);
                  const result = patchBumpFramework(
                    userToken,
                    bf.id,
                    bf.overall_status,
                    bf.title,
                    bf.description,
                    bf.bump_length,
                    bf.bumped_count,
                    bf.bump_delay_days,
                    !bf.default,
                    bf.use_account_research,
                    bf.transformer_blocklist
                  )
                    .then(() => {
                      showNotification({
                        title: 'Success',
                        message: 'Bump Framework enabled',
                        color: 'green',
                      });
                    })
                    .finally(() => {
                      (async () => {
                        await queryClient.refetchQueries({
                          queryKey: [`query-get-bump-frameworks`],
                        });
                        setLoading(false);
                      })();
                    });
                }}
              />
              {loading && <Loader size='xs' mt='xs' />}
            </Box>
          ),
        }))}
        size={800}
        activeItemId={props.activeBumpFrameworkId}
      />
      {/* Create New Framework */}
      <ModalSelector
        selector={{
          override: (
            <Tooltip label='Create New Framework' withinPortal>
              <ActionIcon radius='xl'>
                <IconPlus size='1.1rem' />
              </ActionIcon>
            </Tooltip>
          ),
        }}
        title={{
          name: 'Choose a Template',
          rightSection: (
            <Button
              variant='outline'
              radius='md'
              size='xs'
              leftIcon={<IconTool size='1rem' />}
              onClick={() => {
                openContextModal({
                  modal: 'createBumpFramework',
                  title: 'Make your own framework',
                  innerProps: {
                    modalOpened: true,
                    openModal: () => {},
                    closeModal: () => {
                      queryClient.refetchQueries({
                        queryKey: [`query-get-bump-frameworks`],
                      });
                      modals.closeAll();
                    },
                    backFunction: () => {},
                    dataChannels: dataChannels,
                    status: props.overallStatus,
                    archetypeID: currentProject?.id,
                    bumpedCount: props.bumpedCount,
                    initialValues: {
                      title: '',
                      description: '',
                      default: false,
                      bumpDelayDays: 2,
                      useAccountResearch: true,
                      bumpLength: '1 week',
                      human_readable_prompt: '',
                    },
                  },
                });
              }}
            >
              Make a Custom Framework
            </Button>
          ),
        }}
        showSearchbar
        size={600}
        loading={false}
        zIndex={200}
        items={
          frameworkTemplates
            ?.filter((f) => {
              return (
                (props.overallStatus === 'ACCEPTED' && f.overall_statuses?.includes('ACCEPTED')) ||
                (props.overallStatus === 'BUMPED' &&
                  f.overall_statuses?.includes('BUMPED') &&
                  f.bumped_counts.includes(props.bumpedCount)) ||
                !f.overall_statuses
              );
            })
            .map((template, index) => {
              return {
                id: index,
                name: template.name + template.tone + template.labels?.join(''),
                content: (
                  <Flex>
                    <Text ml='sm' size='sm' fw='500' mt='4px' mr='lg'>
                      {template.name}
                    </Text>
                    {template.tone && (
                      <Badge
                        size='xs'
                        mt='7px'
                        variant='filled'
                        color={deterministicMantineColor(template.tone || '')}
                      >
                        {template.tone}
                      </Badge>
                    )}
                    <Box ml='md'>
                      {template.labels?.map((x) => {
                        return (
                          <Badge size='xs' variant='outline' mr='4px' mt='4px' color='gray'>
                            {x}
                          </Badge>
                        );
                      })}
                    </Box>
                  </Flex>
                ),
                onClick: async () => {
                  // openContextModal({
                  //   modal: 'createBumpFramework',
                  //   title: 'Create Bump Framework',
                  //   innerProps: {
                  //     modalOpened: true,
                  //     openModal: () => {},
                  //     closeModal: () => {
                  //       queryClient.refetchQueries({
                  //         queryKey: [`query-get-bump-frameworks`],
                  //       });
                  //       modals.closeAll();
                  //     },
                  //     backFunction: () => {},
                  //     dataChannels: dataChannels,
                  //     status: props.overallStatus,
                  //     archetypeID: currentProject?.id,
                  //     bumpedCount: props.bumpedCount,
                  //     initialValues: {
                  //       title: template.name,
                  //       description: template.prompt,
                  //       default: true,
                  //       bumpDelayDays: 2,
                  //       useAccountResearch: true,
                  //       bumpLength: template.length,
                  //       human_readable_prompt: template.human_readable_prompt,
                  //       transformerBlocklist: template.transformer_blocklist,
                  //     },
                  //   },
                  // });
                  const result = await createBumpFramework(
                    userToken,
                    currentProject?.id ?? -1,
                    props.overallStatus,
                    template.name,
                    template.prompt,
                    template.length,
                    props.bumpedCount,
                    2,
                    true,
                    props.overallStatus,
                    true,
                    template.human_readable_prompt,
                    template.transformer_blocklist
                  );
                  if (result.status === 'success') {
                    showNotification({
                      title: 'Success',
                      message: 'Bump Framework created successfully',
                      color: 'green',
                    });
                  } else {
                    showNotification({
                      title: 'Error',
                      message: result.message,
                      color: 'red',
                    });
                  }
                  modals.closeAll();

                  queryClient.refetchQueries({
                    queryKey: [`query-get-bump-frameworks`],
                  });
                },
              };
            }) ?? []
        }
      />
    </>
  );
}

function IntroMessageSection(props: {
  prospectId: number;
  setProspectId: (prospectId: number) => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);
  const queryClient = useQueryClient();

  const prospectId = props.prospectId;
  const setProspectId = props.setProspectId;

  // const [prospectId, setProspectId] = useState<number>();
  const [message, setMessage] = useState('');
  const [messageMetaData, setMessageMetaData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [noProspectsFound, setNoProspectsFound] = useState(false);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(uploadDrawerOpenState);

  const [hoveredCTA, setHoveredCTA] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>('none');
  const { hovered: hoveredPersonSettingsBtn, ref: refPersonSettingsBtn } =
    useHover<HTMLButtonElement>();
  const { hovered: hoveredYourCTAsBtn, ref: refYourCTAsBtn } = useHover<HTMLButtonElement>();

  const [personalizationItemsCount, setPersonalizationItemsCount] = useState<number>();
  const [ctasItemsCount, setCtasItemsCount] = useState<number>();

  const openPersonalizationSettings = () => {
    setActiveTab('personalization');
  };
  const openCTASettings = () => {
    setActiveTab('ctas');
  };
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const theme = useMantineTheme();

  const [ctaModalOpened, setCtaModalOpened] = useState(false);

  const [humanFeedbackForTemplateChanged, setHumanFeedbackForTemplateChanged] =
    useState<boolean>(false);
  const [humanFeedbackForTemplate, setHumanFeedbackForTemplate] = useState<string>();

  const [templateActivesShow, setTemplateActivesShow] = useState([true]);

  const { data: templates, isFetching: isFetchingTemplates } = useQuery({
    queryKey: [`query-get-li-templates`],
    queryFn: async () => {
      const response = await getLiTemplates(userToken, currentProject!.id);

      if (response.data?.length > 0) {
        setSelectedTemplateId(response.data[0].id);
        setHumanFeedbackForTemplate(response.data[0].additional_instructions);
      }
      return response.status === 'success' ? (response.data as Record<string, any>[]) : [];
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject && !!currentProject.template_mode,
  });

  const getIntroMessage = async (
    prospectId: number,
    forceRegenerate: boolean = false,
    selectedTemplateId?: number
  ) => {
    if (!currentProject) return null;
    setLoading(true);
    setMessage('');

    let convoResponse = await getLiConvoSim(userToken, undefined, prospectId);
    if (convoResponse.status !== 'success' || forceRegenerate) {
      // If convo doesn't exist, create it
      const createResponse = await createLiConvoSim(userToken, currentProject.id, prospectId);
      if (createResponse.status !== 'success') {
        setLoading(false);
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
        return null;
      }
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        userToken,
        createResponse.data,
        selectedTemplateId
      );
      if (initMsgResponse.status !== 'success') {
        setLoading(false);
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
        return null;
      }
      convoResponse = await getLiConvoSim(userToken, createResponse.data);
    } else if (convoResponse.data.messages.length === 0) {
      // If convo exists but no messages, generate initial message
      const initMsgResponse = await generateInitialMessageForLiConvoSim(
        userToken,
        convoResponse.data.simulation.id
      );
      if (initMsgResponse.status !== 'success') {
        setLoading(false);
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
        return null;
      }
      convoResponse = await getLiConvoSim(userToken, convoResponse.data.simulation.id);
    }

    setLoading(false);
    setTimeout(() => {
      setShowFeedback(true);
    }, 2000);
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
    getIntroMessage(prospectId, false, selectedTemplateId).then((msg) => {
      if (msg) {
        setMessage(msg);
      }
    });
  }, [prospectId, selectedTemplateId]);

  if (!currentProject) return <></>;
  return (
    <Stack ml='xl' spacing={0}>
      <Group position='apart'>
        <Group>
          <Title order={3}>Invite Message</Title>
          {/* {ctasItemsCount !== undefined && (
            <Badge color="blue" fw={500}>{ctasItemsCount} CTAs Active</Badge>
          )} */}
        </Group>
        {!currentProject.template_mode && (
          <VoiceSelect
            personaId={currentProject.id}
            onChange={(voice) => {}}
            onFinishLoading={(voices) => {}}
            autoSelect
          />
        )}
      </Group>
      <Box my={5}>
        <Text fz='xs' c='dimmed'>
          Your initial outreach message on LinkedIn, this message has a 300 character limit.
        </Text>
      </Box>
      <Stack pt={20} spacing={5} sx={{ position: 'relative' }}>
        <LoadingOverlay visible={loading || prospectsLoading} zIndex={10} />
        {noProspectsFound ? (
          <Box
            sx={{
              border: '1px dashed #339af0',
              borderRadius: '0.5rem',
            }}
            p='sm'
            mih={100}
          >
            <Center h={100}>
              <Stack>
                <Text ta='center' c='dimmed' fs='italic' fz='sm'>
                  No prospects found to show example message.
                </Text>
                <Center>
                  <Box>
                    <Button
                      variant='filled'
                      color='teal'
                      radius='md'
                      ml='auto'
                      mr='0'
                      size='xs'
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
            <Group position='apart' pb='0.3125rem'>
              <Text fz='sm' fw={500} c='dimmed'>
                EXAMPLE INVITE MESSAGE:
              </Text>
              <Group>
                <Button
                  size='xs'
                  variant='subtle'
                  compact
                  leftIcon={<IconReload size='0.75rem' />}
                  onClick={() => {
                    if (prospectId) {
                      getIntroMessage(prospectId, true, selectedTemplateId).then((msg) => {
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
                border: '1px dashed #339af0',
                borderRadius: '0.5rem',
              }}
              p='sm'
              h={250}
            >
              {message && (
                <LiExampleInvitation
                  message={message}
                  startHovered={
                    activeTab === 'personalization' || hoveredPersonSettingsBtn ? true : undefined
                  }
                  endHovered={activeTab === 'ctas' || hoveredYourCTAsBtn ? true : undefined}
                  onClickStart={openPersonalizationSettings}
                  onClickEnd={openCTASettings}
                  onHoveredEnd={(hovered) => setHoveredCTA(hovered)}
                />
              )}
            </Box>
          </Box>
        )}

        {currentProject.template_mode && showFeedback && (
          <>
            <Card mb='16px'>
              <Card.Section
                sx={{
                  backgroundColor: theme.colors.grape[6],
                  flexDirection: 'row',
                  display: 'flex',
                }}
                p='xs'
              >
                <Text color='white' mt='4px' size='sm'>
                  <IconBulb size='1.2rem' color='white' />
                  <span style={{ marginLeft: '8px' }}>
                    FINE TUNING: Feel free to give me feedback on improving the message
                  </span>
                </Text>
              </Card.Section>
              <Card.Section
                sx={{ border: 'solid 2px ' + theme.colors.grape[6] + ' !important' }}
                p='8px'
              >
                <Textarea
                  variant='unstyled'
                  pl={'8px'}
                  pr={'8px'}
                  size='xs'
                  minRows={3}
                  placeholder='- make it shorter&#10;-use this fact&#10;-mention the value prop'
                  value={humanFeedbackForTemplate}
                  onChange={(e) => {
                    const value = e.target.value;

                    setHumanFeedbackForTemplate(value);
                    setHumanFeedbackForTemplateChanged(true);
                  }}
                />
              </Card.Section>
            </Card>
            {humanFeedbackForTemplateChanged && (
              <Box
                sx={{ justifyContent: 'right', textAlign: 'right' }}
                onClick={() => {
                  updateLiTemplate(
                    userToken,
                    currentProject.id,
                    selectedTemplateId || -1,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    humanFeedbackForTemplate
                  )
                    .then((res) => {
                      queryClient.invalidateQueries({
                        queryKey: [`query-get-li-templates`],
                      });
                    })
                    .then((res) => {
                      setHumanFeedbackForTemplateChanged(false);
                      setHumanFeedbackForTemplate('');
                      showNotification({
                        title: 'Success',
                        message: 'Feedback saved. Try regenerating.',
                        color: 'green',
                      });
                    });
                }}
              >
                <Button color='green'>Save Feedback</Button>
              </Box>
            )}
          </>
        )}

        {currentProject.template_mode ? (
          <>
            <CTAGeneratorSuggestedModal
              templateMode={true}
              generatedCTAs={[]}
              modalOpened={ctaModalOpened}
              closeModal={() => {
                setCtaModalOpened(false);
              }}
              formValue={{
                company: userData.client?.company || '',
                persona: currentProject?.name || '',
                proposition: currentProject?.cta_framework_action || '',
              }}
              onTemplateSelected={(template: LinkedinInitialMessageTemplate) => {
                createLiTemplate(
                  userToken,
                  currentProject.id,
                  template.name,
                  template.raw_prompt,
                  false,
                  [],
                  ''
                ).then((res) => {
                  queryClient.refetchQueries({
                    queryKey: [`query-get-li-templates`],
                  });
                });
              }}
            />
            {isFetchingTemplates ? (
              <Box>
                <Loader
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </Box>
            ) : (
              <Stack>
                <Stack mt='xs'>
                  {templates
                    ?.filter((t: any) => templateActivesShow.includes(t.active))
                    .sort((a: any, b: any) =>
                      a.active != b.active ? -(a.active - b.active) : a.title - b.title
                    )
                    .map((template, index) => (
                      <Paper
                        key={index}
                        p='md'
                        mih={80}
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          border:
                            selectedTemplateId === template.id
                              ? 'solid 1px #339af0 !important'
                              : '',
                          backgroundColor:
                            selectedTemplateId === template.id ? '#339af008 !important' : '',
                          flexDirection: 'row',
                          display: 'flex',
                        }}
                        withBorder
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setHumanFeedbackForTemplate(template.additional_instructions);
                        }}
                      >
                        <Box
                          miw='100px'
                          mah={80}
                          sx={{
                            border: 'solid 1px #339af022',
                            backgroundColor: '#339af022',
                            padding: '8px',
                            borderRadius: '4px',
                            textAlign: 'center',
                          }}
                          mt='xl'
                          mr='md'
                        >
                          <Text fw='bold' fz='md' color='blue' mt='xs'>
                            {Math.round(
                              (template.times_accepted / (template.times_used + 0.0001)) * 100
                            )}
                            % reply
                          </Text>
                          <Text color='blue' size='xs'>
                            {template.times_accepted} / {template.times_used} times
                          </Text>
                        </Box>

                        <Box mr={40} w='100%'>
                          <Flex>
                            <Text
                              size='sm'
                              fw='600'
                              mb='xs'
                              sx={{ textTransform: 'uppercase' }}
                              color='gray'
                              variant='outline'
                            >
                              {template.title}
                            </Text>
                            {/* Hovercard for transformers */}
                            {template.research_points && template.research_points.length > 0 && (
                              <HoverCard width={280} shadow='md'>
                                <HoverCard.Target>
                                  <Badge
                                    leftSection={
                                      <IconSearch size='0.8rem' style={{ marginTop: 4 }} />
                                    }
                                    color='lime'
                                    variant='filled'
                                    ml='xs'
                                    size='xs'
                                  >
                                    {template.research_points.length} Research Points
                                  </Badge>
                                </HoverCard.Target>
                                <HoverCard.Dropdown
                                  style={{ backgroundColor: 'rgb(34, 37, 41)', padding: 0 }}
                                >
                                  <Paper
                                    style={{
                                      backgroundColor: 'rgb(34, 37, 41)',
                                      color: 'white',
                                      padding: 10,
                                    }}
                                  >
                                    <TextWithNewline style={{ fontSize: '12px' }}>
                                      {'<b>Active Research Points:</b>\n- ' +
                                        template.research_points
                                          .map((rp: any) => rp.replaceAll('_', ' ').toLowerCase())
                                          .join('\n- ')}
                                    </TextWithNewline>
                                  </Paper>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            )}
                            {template.additional_instructions && (
                              <HoverCard width={280} shadow='md'>
                                <HoverCard.Target>
                                  <Badge
                                    leftSection={<IconBulb size='0.8rem' />}
                                    color='grape'
                                    variant='filled'
                                    ml='xs'
                                    size='xs'
                                  >
                                    Fine Tuned
                                  </Badge>
                                </HoverCard.Target>
                                <HoverCard.Dropdown
                                  style={{ backgroundColor: 'rgb(34, 37, 41)', padding: 0 }}
                                >
                                  <Paper
                                    style={{
                                      backgroundColor: 'rgb(34, 37, 41)',
                                      color: 'white',
                                      padding: 10,
                                    }}
                                  >
                                    <TextWithNewline style={{ fontSize: '12px' }}>
                                      {'<b>Additional Instructions:</b>\n' +
                                        template.additional_instructions}
                                    </TextWithNewline>
                                  </Paper>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            )}
                          </Flex>
                          <Card
                            withBorder
                            w='100%'
                            sx={{
                              backgroundColor: selectedTemplateId == template.id ? '' : '#fbfbfb',
                            }}
                          >
                            <Text style={{ fontSize: '0.9rem', lineHeight: 2 }}>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    template.message
                                      .replaceAll(
                                        '[[',
                                        "<span style='margin-left: 6px; margin-right: 6px; background-color: " +
                                          theme.colors['blue'][5] +
                                          "; padding: 2px; color: white; padding-left: 8px; padding-right: 8px; border-radius: 4px;'>✨ "
                                      )
                                      .replaceAll(']]', '</span>') as string
                                  ),
                                }}
                              />
                            </Text>
                          </Card>
                        </Box>

                        <Box sx={{ justifyContent: 'right' }} ml='auto'>
                          <Switch
                            sx={{ cursor: 'pointer' }}
                            checked={template.active}
                            onChange={(e) => {
                              updateLiTemplate(
                                userToken,
                                currentProject.id,
                                template.id,
                                template.title,
                                template.message,
                                e.target.checked
                              ).then((res) => {
                                queryClient.invalidateQueries({
                                  queryKey: [`query-get-li-templates`],
                                });
                              });
                            }}
                          />
                          <Button
                            mt='xs'
                            variant='subtle'
                            radius='xl'
                            size='sm'
                            compact
                            onClick={() => {
                              openContextModal({
                                modal: 'liTemplate',
                                title: 'Edit Template',
                                innerProps: {
                                  mode: 'EDIT',
                                  editProps: {
                                    templateId: template.id,
                                    title: template.title,
                                    message: template.message,
                                    active: template.active,
                                    humanFeedback: template.additional_instructions,
                                    researchPoints: template.research_points,
                                  },
                                },
                              });
                            }}
                          >
                            Edit
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                </Stack>
                <Button
                  onClick={() => {
                    if (templateActivesShow.length === 1) {
                      setTemplateActivesShow([true, false]);
                    } else {
                      setTemplateActivesShow([true]);
                    }
                  }}
                  color='gray'
                  variant='subtle'
                  leftIcon={
                    <IconChevronDown
                      size='1rem'
                      style={{
                        transform: templateActivesShow.length === 1 ? '' : 'rotate(180deg)',
                      }}
                    />
                  }
                >
                  Show{' '}
                  {templateActivesShow.includes(true) ? 'All Templates' : 'Active Templates Only'}
                </Button>
              </Stack>
            )}

            <Flex sx={{ justifyContent: 'right' }}>
              <Button
                onClick={() => setCtaModalOpened(true)}
                size='sm'
                variant='outline'
                color='lime'
                mr='sm'
                compact
              >
                Brainstorm Templates
              </Button>
              <InitialMessageTemplateSelector
                onSelect={(template: LinkedinInitialMessageTemplate) => {
                  showNotification({
                    title: '🤖 Generating...',
                    message: 'Generating custom "' + template.name + '" template...',
                    color: 'blue',
                  });

                  fetch(`${API_URL}/linkedin_template/adjust_template_for_client`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      template_id: template.id,
                    }),
                  })
                    .then((res) => {
                      return res.json();
                    })
                    .then((res) => {
                      const adjustedTemplate = res['adjusted_template'];
                      openContextModal({
                        modal: 'liTemplate',
                        title: 'Create Template',
                        innerProps: {
                          mode: 'CREATE',
                          editProps: {
                            title: template.name,
                            message: adjustedTemplate,
                            active: true,
                            humanFeedback: '',
                            researchPoints: [],
                          },
                        },
                      });
                    });
                }}
              />
              <Stack spacing={5}>
                <Button
                  variant='outline'
                  radius='md'
                  compact
                  color='orange'
                  onClick={() => {
                    openContextModal({
                      modal: 'liTemplate',
                      title: 'Create Template',
                      innerProps: {
                        mode: 'CREATE',
                      },
                    });
                  }}
                >
                  Create New
                </Button>
              </Stack>
            </Flex>
          </>
        ) : (
          <Tabs
            value={activeTab}
            onTabChange={setActiveTab}
            pt='sm'
            variant='pills'
            keepMounted={true}
            radius='md'
            defaultValue='none'
            allowTabDeactivation
          >
            <Tabs.List>
              <Tabs.Tab
                ref={refPersonSettingsBtn}
                value='personalization'
                color='teal.5'
                rightSection={
                  <>
                    {personalizationItemsCount ? (
                      <Badge
                        w={16}
                        h={16}
                        sx={{ pointerEvents: 'none' }}
                        variant='filled'
                        size='xs'
                        p={0}
                        color='teal.6'
                      >
                        {personalizationItemsCount}
                      </Badge>
                    ) : (
                      <></>
                    )}
                  </>
                }
                sx={(theme) => ({
                  '&[data-active]': {
                    backgroundColor: theme.colors.teal[0] + '!important',
                    borderRadius: theme.radius.md + '!important',
                    color: theme.colors.teal[8] + '!important',
                  },
                  border: 'solid 1px ' + theme.colors.teal[5] + '!important',
                })}
              >
                Edit Personalization
              </Tabs.Tab>
              <Tabs.Tab
                ref={refYourCTAsBtn}
                value='ctas'
                color='blue.4'
                rightSection={
                  <>
                    {ctasItemsCount ? (
                      <Badge
                        w={16}
                        h={16}
                        sx={{ pointerEvents: 'none' }}
                        variant='filled'
                        size='xs'
                        p={0}
                        color='blue.5'
                      >
                        {ctasItemsCount}
                      </Badge>
                    ) : (
                      <></>
                    )}
                  </>
                }
                sx={(theme) => ({
                  '&[data-active]': {
                    backgroundColor: theme.colors.blue[0] + '!important',
                    borderRadius: theme.radius.md + '!important',
                    color: theme.colors.blue[8] + '!important',
                  },
                  border: 'solid 1px ' + theme.colors.blue[4] + '!important',
                })}
              >
                Edit CTAs
              </Tabs.Tab>
              {/* <Tabs.Tab value="voice" ml="auto">
              Train Your AI
            </Tabs.Tab> */}
            </Tabs.List>

            <Tabs.Panel value='personalization'>
              <PersonalizationSection
                blocklist={currentProject.transformer_blocklist_initial ?? []}
                onItemsChange={async (items) => {
                  setPersonalizationItemsCount(items.filter((x: any) => x.checked).length);

                  // Update transformer blocklist
                  const result = await updateInitialBlocklist(
                    userToken,
                    currentProject.id,
                    items.filter((x) => !x.checked).map((x) => x.id)
                  );

                  setCurrentProject(await getFreshCurrentProject(userToken, currentProject.id));
                }}
              />
            </Tabs.Panel>
            <Tabs.Panel value='ctas'>
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
        )}
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
  const currentProject = useRecoilValue(currentProjectState);

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
      if (result.status === 'success') {
        setLiSDR(result.data);
      }
    })();
  }, []);

  // Animation for typing
  const [curMessage, setCurMessage] = useState('');
  const animationPlaying = useRef(false);
  useEffect(() => {
    if (animationPlaying.current) return;
    setCurMessage('');
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
    ? liSDR.miniProfile?.picture['com.linkedin.common.VectorImage'].rootUrl +
      liSDR.miniProfile?.picture['com.linkedin.common.VectorImage'].artifacts[
        liSDR.miniProfile?.picture['com.linkedin.common.VectorImage'].artifacts.length - 1
      ].fileIdentifyingUrlPathSegment
    : userData.img_url;
  const name = liSDR
    ? liSDR.miniProfile?.firstName + ' ' + liSDR.miniProfile?.lastName
    : userData.sdr_name;
  const title = liSDR ? liSDR.miniProfile?.occupation : userData.sdr_title;

  // Split message into start and CTA (and handle cut off)
  let message = props.message.trim();
  const sentences = message.split(/(?<=[.!?])\s+/gm);

  // If the last sentence is too short, the CTA is probably the last two sentences
  let endMessage = sentences[sentences.length - 1];
  if (endMessage.length < MIN_CTA_ASSUMED_LENGTH) {
    endMessage = sentences[sentences.length - 2] + ' ' + endMessage;
  }

  let startMessage = message.replace(endMessage, '');

  // Don't split for template mode
  if (currentProject?.template_mode) {
    startMessage = message;
    endMessage = '';
  }

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
    cutEndMessage = '';
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
    <Group spacing={10} sx={{ alignItems: 'flex-start' }} noWrap>
      <Box w={55}>
        <Avatar
          src={proxyURL(imgURL)}
          alt={`${name}'s Profile Picture`}
          color={valueToColor(theme, name)}
          radius='xl'
          size='lg'
        >
          {nameToInitials(name)}
        </Avatar>
      </Box>
      <Stack w='100%'>
        <Group position='apart' noWrap>
          <Box>
            <Text fw={550}>{name}</Text>
            <Text fz='xs' c='dimmed' truncate>
              {_.truncate(title, { length: 65 })}
            </Text>
          </Box>
          <Group spacing={0} noWrap>
            <Button
              size='xs'
              variant='subtle'
              color='gray'
              radius='xl'
              sx={{
                cursor: 'not-allowed',
              }}
            >
              Ignore
            </Button>
            <Button
              size='xs'
              variant='outline'
              radius='xl'
              sx={{
                cursor: 'not-allowed',
              }}
            >
              Accept
            </Button>
          </Group>
        </Group>
        <Box
          sx={{
            border: '2px solid #e2e2e2',
            borderRadius: '0.5rem',
            position: 'relative',
          }}
          px='sm'
          pt='sm'
          pb={5}
        >
          <Box>
            {showFullMessage || animationPlaying.current ? (
              <Text fz='xs'>
                <Text
                  ref={startRef}
                  span
                  sx={{
                    color:
                      startHovered || animationPlaying.current ? theme.colors.teal[8] : undefined,
                    backgroundColor:
                      startHovered || animationPlaying.current ? theme.colors.teal[0] : undefined, //theme.colors.teal[0]+"99",
                    cursor: 'pointer',
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
                      endHovered || animationPlaying.current ? theme.colors.blue[8] : undefined,
                    backgroundColor:
                      endHovered || animationPlaying.current ? theme.colors.blue[0] : undefined, //theme.colors.blue[0]+"99",
                    cursor: 'pointer',
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
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  span
                >
                  See less
                </Text>
              </Text>
            ) : (
              <Text fz='xs'>
                <Text
                  ref={startRef}
                  span
                  sx={{
                    color: startHovered ? theme.colors.teal[8] : undefined,
                    backgroundColor: startHovered ? theme.colors.teal[0] : undefined, //theme.colors.teal[0]+"99",
                    cursor: 'pointer',
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
                    backgroundColor: endHovered ? theme.colors.blue[0] : undefined, //theme.colors.blue[0]+"99",
                    cursor: 'pointer',
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
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  span
                >
                  See more
                </Text>
              </Text>
            )}
          </Box>
          <Button
            size='xs'
            variant='subtle'
            color='gray'
            radius='xl'
            sx={{
              cursor: 'not-allowed',
            }}
            ml={-8}
            compact
          >
            Reply to {liSDR?.miniProfile?.firstName || userData.sdr_name.trim().split(' ')[0]}
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
  onAnimatonComplete?: () => void;
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
      if (result.status === 'success') {
        setLiSDR(result.data);
      }
    })();
  }, []);

  // Animation for typing
  const [curMessage, setCurMessage] = useState('');
  const animationPlaying = useRef(false);
  useEffect(() => {
    if (animationPlaying.current) return;
    setCurMessage('');
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
      props.onAnimatonComplete && props.onAnimatonComplete();
    })();
  }, []);

  // Get SDR data from LinkedIn
  const imgURL = liSDR
    ? liSDR.miniProfile?.picture['com.linkedin.common.VectorImage'].rootUrl +
      liSDR.miniProfile?.picture['com.linkedin.common.VectorImage'].artifacts[
        liSDR.miniProfile?.picture['com.linkedin.common.VectorImage'].artifacts.length - 1
      ].fileIdentifyingUrlPathSegment
    : userData.img_url;
  const name = liSDR
    ? liSDR.miniProfile?.firstName + ' ' + liSDR.miniProfile?.lastName
    : userData.sdr_name;
  const title = liSDR ? liSDR.miniProfile?.occupation : userData.sdr_title;

  // Format message
  let message = props.message.trim();

  // Trim for animation playing
  if (animationPlaying.current) {
    message = _.truncate(message, {
      length: curMessage.length,
      omission: '█',
    });
  }

  return (
    <Group spacing={10} sx={{ alignItems: 'flex-start' }} noWrap>
      <Box w={55}>
        <Avatar
          src={proxyURL(imgURL)}
          alt={`${name}'s Profile Picture`}
          color={valueToColor(theme, name)}
          radius='xl'
          size='lg'
        >
          {nameToInitials(name)}
        </Avatar>
      </Box>
      <Stack w='100%' spacing={3}>
        <Group position='apart' noWrap>
          <Box>
            <Text fw={550}>{name}</Text>
          </Box>
        </Group>
        <Box>
          {animationPlaying.current ? (
            <Text fz='xs'>
              <Text
                ref={ref}
                span
                sx={{
                  color: hovered || animationPlaying.current ? theme.colors.teal[8] : undefined,
                  backgroundColor:
                    hovered || animationPlaying.current ? theme.colors.teal[0] : undefined, //theme.colors.teal[0]+"99",
                  cursor: 'pointer',
                }}
              >
                {message}
              </Text>
            </Text>
          ) : (
            <Text fz='xs'>
              <Text
                ref={ref}
                span
                sx={{
                  color: hovered ? theme.colors.teal[8] : undefined,
                  backgroundColor: hovered ? theme.colors.teal[0] : undefined, //theme.colors.teal[0]+"99",
                  cursor: 'pointer',
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
    overallStatus: string;
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
      radius='md'
      withBorder
      onClick={() => {
        props.onClick();
        if (noBumpFramework) {
          // TODO: Open modal to select bump framework
        }
      }}
      sx={(theme) => ({
        cursor: 'pointer',
        backgroundColor: props.active
          ? theme.fn.lighten(
              theme.fn.variant({ variant: 'filled', color: 'blue' }).background!,
              0.95
            )
          : hovered
          ? theme.fn.lighten(
              theme.fn.variant({ variant: 'filled', color: 'blue' }).background!,
              0.99
            )
          : undefined,
        borderColor: props.active || hovered ? theme.colors.blue[5] + '!important' : undefined,
      })}
    >
      <Stack spacing={0}>
        <Group position='apart' px={15} py={10} noWrap>
          <Group spacing={0} noWrap>
            <ActionIcon
              variant='transparent'
              color='blue'
              sx={{
                cursor: 'default',
              }}
            >
              <IconMessages size='1.1rem' />
            </ActionIcon>
            <Text fw={500} sx={{ whiteSpace: 'nowrap' }}>
              {props.title}
            </Text>
          </Group>
          {props.conversion !== undefined && (
            <Tooltip
              label={
                props.conversion > 9.0
                  ? 'Your open rates are above industry standards (9%). Congrats!'
                  : props.conversion <= 9.0 && props.conversion > 0.0
                  ? 'Your open rates are below industry standards (9%). Try changing your message to improve from your current ' +
                    Math.round(props.conversion * 10) / 10 +
                    '%.'
                  : (props.timesUsed && props.timesUsed < 20 ? 'Not enough data, ' : '') +
                    props.timesConverted +
                    ' / ' +
                    props.timesUsed +
                    ' prospects have been bumped.'
              }
              withArrow
              withinPortal
            >
              <Badge
                variant='dot'
                color={isNaN(props.conversion) ? 'grey' : props.conversion > 9.0 ? 'green' : 'red'}
              >
                Opened: {!isNaN(props.conversion) ? Math.trunc(props.conversion) + '%' : 'TBD'}
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
                ml='auto'
                color={props.badgeColor || 'gray'}
                size='sm'
                styles={{
                  root: { textTransform: 'initial', fontWeight: 500 },
                }}
              >
                {props.badgeText}
              </Badge>
            </Tooltip>
          )}
          <Group spacing={3}>
            {props.canEdit && props.editProps && <BumpFrameworkSelect {...props.editProps} />}
            {props.canRemove && props.onRemove && (
              <Tooltip label='Remove' withinPortal>
                <ActionIcon
                  radius='xl'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onRemove!();
                  }}
                >
                  <IconCircleMinus size='1.2rem' />
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
              position='bottom'
              withArrow
              withinPortal
              multiline
              disabled={props.bodyText.length < 150}
            >
              <Text fz={12} c='dimmed' truncate>
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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [prospectsLoading, setProspectsLoading] = useState(true);
  const [changed, setChanged] = useState(false);

  const [noProspectsFound, setNoProspectsFound] = useState(false);
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(uploadDrawerOpenState);

  const [humanReadableContext, setHumanReadableContext] = useState<string | undefined>(
    props.framework.bump_framework_human_readable_prompt
  );
  const [contextQuestion, setContextQuestion] = useState(
    props.framework.bump_framework_human_readable_prompt
  );
  const [opened, { toggle }] = useDisclosure(false);

  const [activeTab, setActiveTab] = useState<string | null>('none');
  const [descriptionEditState, setDescriptionEditState] = useState(false);
  const [personalizationItemsCount, setPersonalizationItemsCount] = useState<number>();
  const [personalizationItemIds, setPersonalizationItemIds] = useState(
    props.framework.transformer_blocklist
  );
  const [showUserFeedback, setShowUserFeedback] = useState(props.framework.human_feedback !== null);
  const [feedbackChanged, setFeedbackChanged] = useState(false);

  const [initialFrameworkId, setInitialFrameworkId] = useState<number>(props.framework.id);

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
      bumpFrameworkHumanReadablePrompt: props.framework.bump_framework_human_readable_prompt,
      humanFeedback: props.framework.human_feedback,
    },
  });

  useEffect(() => {
    if (initialFrameworkId !== props.framework.id) {
      setInitialFrameworkId(props.framework.id);
      form.setValues({
        frameworkName: props.framework.title,
        bumpLength: props.framework.bump_length,
        delayDays: props.framework.bump_delay_days,
        promptInstructions: props.framework.description,
        useAccountResearch: props.framework.use_account_research,
        additionalContext: props.framework.additional_context,
        bumpFrameworkTemplateName: props.framework.bump_framework_template_name,
        bumpFrameworkHumanReadablePrompt: props.framework.bump_framework_human_readable_prompt,
        humanFeedback: props.framework.human_feedback,
      });
      setPersonalizationItemIds(props.framework.transformer_blocklist);
    }
  }, [props.framework.id]);

  const [debouncedForm] = useDebouncedValue(form.values, 200);
  const prevDebouncedForm = usePrevious(debouncedForm);
  const [moreAdditionInformationOpened, { toggle: moreAdditionInformationToggle }] =
    useDisclosure(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [editing, setEditing] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);
  useEffect(() => {
    props.setIsDataChanged(changed);
  }, [changed]);
  const [titleInEditingMode, setTitleInEditingMode] = useState(false);
  const saveSettings = async (values: typeof form.values) => {
    setSavingSettings(true);
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
      personalizationItemIds,
      values.additionalContext,
      values.bumpFrameworkTemplateName,
      values.bumpFrameworkHumanReadablePrompt,
      values.humanFeedback
    );
    await queryClient.refetchQueries({
      queryKey: [`query-get-bump-frameworks`],
    });

    showNotification({
      title: 'Settings Saved ✅',
      message: 'Hit Regenerate to see your new message.',
      color: 'green',
    });

    setSavingSettings(false);
    setChanged(false);

    return result.status === 'success';
  };

  const openPersonalizationSettings = () => {
    if (form.values.useAccountResearch) {
      setActiveTab('personalization');
    }
  };

  const getFollowUpMessage = async (prospectId: number, useCache: boolean) => {
    if (!currentProject) return null;
    setLoading(true);
    setMessage('');

    setShowUserFeedback(false);

    const result = await generateBumpLiMessage(
      userToken,
      prospectId,
      props.framework.id,
      props.bumpCount,
      useCache
    );

    setLoading(false);
    return result.status === 'success' ? result.data.message : null;
  };

  const autoCompleteWithBrain = () => {
    setAiGenerating(true);
    fetch(`${API_URL}/ml/fill_prompt_from_brain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        prompt: form.values.additionalContext,
        archetype_id: currentProject?.id || -1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        form.setFieldValue('additionalContext', data.data);
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

  const onAnimatonComplete = () => {
    setTimeout(() => {
      setShowUserFeedback(true);
    }, 500);
  };

  if (!currentProject) return <></>;

  return (
    <>
      <Stack ml='xl' spacing={0}>
        <Group position='apart'>
          <Group></Group>
        </Group>
        <Card padding='lg' radius='md'>
          <Card.Section
            sx={{
              flexDirection: 'row',
              display: 'flex',
              gap: '1rem',
            }}
            w='100%'
          >
            <Box mt='4px' w='100%' sx={{}}>
              <Title order={5} color='gray' mr='xs' fw='400'>
                Follow-Up {props.bumpCount + 1}:
              </Title>

              <Flex direction='row'>
                {!titleInEditingMode ? (
                  <Title order={3} onClick={() => setTitleInEditingMode((p) => !p)}>
                    <span style={{ color: 'black', cursor: 'pointer' }}>
                      {form.values.frameworkName}
                    </span>
                  </Title>
                ) : (
                  <TextInput
                    w='75%'
                    placeholder='Name'
                    variant='filled'
                    {...form.getInputProps('frameworkName')}
                    onChange={(e) => {
                      form.setFieldValue('frameworkName', e.target.value);
                      setChanged(true);
                    }}
                  />
                )}
                <ActionIcon
                  ml='8px'
                  mt='8px'
                  size='1rem'
                  sx={{ zIndex: 10, opacity: 0.7 }}
                  onClick={() => setTitleInEditingMode((p) => !p)}
                >
                  <IconEdit />
                </ActionIcon>
              </Flex>
            </Box>
          </Card.Section>

          <Card.Section mt='xs' w='100%'>
            <Flex direction='row'>
              {descriptionEditState ? (
                <Textarea
                  w='100%'
                  fz='xs'
                  {...form.getInputProps('bumpFrameworkHumanReadablePrompt')}
                  onChange={(e) => {
                    form.setFieldValue('bumpFrameworkHumanReadablePrompt', e.target.value);
                    setChanged(true);
                  }}
                />
              ) : (
                <Text
                  fz='xs'
                  c='dimmed'
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setDescriptionEditState((p) => !p)}
                >
                  <span style={{ fontWeight: 'bold' }}>Goal:</span>{' '}
                  {form.values.bumpFrameworkHumanReadablePrompt}
                </Text>
              )}
              <ActionIcon
                size='1rem'
                ml='8px'
                sx={{ zIndex: 10, opacity: 0.7 }}
                onClick={() => setDescriptionEditState((p) => !p)}
              >
                <IconEdit />
              </ActionIcon>
            </Flex>
          </Card.Section>
        </Card>
        <Stack pt={20} spacing={15}>
          <Box sx={{ position: 'relative' }}>
            <LoadingOverlay visible={loading || prospectsLoading} zIndex={10} />
            {noProspectsFound ? (
              <Box
                sx={{
                  border: '1px dashed #339af0',
                  borderRadius: '0.5rem',
                }}
                p='sm'
                mih={100}
              >
                <Center h={100}>
                  <Stack>
                    <Text ta='center' c='dimmed' fs='italic' fz='sm'>
                      No prospects found to show example message.
                    </Text>
                    <Center>
                      <Box>
                        <Button
                          variant='filled'
                          color='teal'
                          radius='md'
                          ml='auto'
                          mr='0'
                          size='xs'
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
                <Group position='apart' pb='0.3125rem'>
                  <Text fz='xs' fw={500} c='dimmed' sx={{ opacity: 0.8 }}>
                    EXAMPLE GENERATION:
                  </Text>
                  <Group>
                    <Button
                      size='xs'
                      variant='subtle'
                      compact
                      leftIcon={<IconReload size='0.75rem' />}
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
                    border: '1px dashed #339af0',
                    borderRadius: '0.5rem',
                  }}
                  p='sm'
                  mih={150}
                >
                  {message && (
                    <LiExampleMessage
                      message={message}
                      hovered={hovered || activeTab === 'personalization' ? true : undefined}
                      onClick={openPersonalizationSettings}
                      onAnimatonComplete={onAnimatonComplete}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {changed && (
            <Group position='right'>
              <Center>
                <Button
                  variant='default'
                  w='200px'
                  ml='auto'
                  loading={savingSettings}
                  disabled={!changed}
                  onClick={() => {
                    form.reset();
                    setChanged(false);
                  }}
                >
                  Cancel
                </Button>
              </Center>
              <Center>
                <Button
                  color='green'
                  w='200px'
                  ml='auto'
                  loading={savingSettings}
                  disabled={!changed}
                  onClick={() => {
                    showNotification({
                      title: 'Saving Settings...',
                      message: 'This may take a few seconds.',
                      color: 'blue',
                    });
                    saveSettings(debouncedForm);
                    props.setIsDataChanged(false);

                    // close advanced settings
                    if (opened) {
                      toggle();
                    }
                  }}
                >
                  Save Settings
                </Button>
              </Center>
            </Group>
          )}

          {form.values.promptInstructions.includes('Answer:') && (
            <Alert
              icon={<IconBulb size='1rem' />}
              variant='outline'
              onClick={toggle}
              sx={{ cursor: 'pointer' }}
            >
              <Text color='blue' fz='12px'>
                Note: This framework requires you fill out additional context in the prompt. Please
                press 'Advanced Settings'
              </Text>
            </Alert>
          )}

          <form
            onChange={() => {
              setChanged(true);
            }}
          >
            {showUserFeedback && (
              <>
                <Card mb='16px'>
                  <Card.Section
                    sx={{
                      backgroundColor: theme.colors.grape[6],
                      flexDirection: 'row',
                      display: 'flex',
                    }}
                    p='xs'
                  >
                    <Text color='white' mt='4px' size='sm'>
                      <IconBulb size='1.2rem' color='white' />
                      <span style={{ marginLeft: '8px' }}>
                        FINE TUNING: Feel free to give me feedback on improving the message.
                      </span>
                    </Text>
                  </Card.Section>
                  <Card.Section
                    sx={{ border: 'solid 2px ' + theme.colors.grape[6] + ' !important' }}
                    p='8px'
                  >
                    <Textarea
                      variant='unstyled'
                      pl={'8px'}
                      pr={'8px'}
                      size='xs'
                      minRows={3}
                      placeholder='- make it shorter&#10;-use this fact&#10;-mention the value prop'
                      {...form.getInputProps('humanFeedback')}
                    />
                  </Card.Section>
                </Card>
              </>
            )}

            <Paper
              p='md'
              mih={80}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                border: 'solid 1px #339af0 !important',
                backgroundColor: '#339af008 !important',
                flexDirection: 'row',
                display: 'flex',
              }}
              withBorder
              onClick={() => {
                // setSelectedTemplateId(template.id);
                // setHumanFeedbackForTemplate(template.additional_instructions);
              }}
            >
              <Box
                miw='100px'
                mah={80}
                sx={{
                  border: 'solid 1px #339af022',
                  backgroundColor: '#339af022',
                  padding: '8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
                mt='xl'
                mr='md'
              >
                <Text fw='bold' fz='md' color='blue' mt='xs'>
                  {props.framework.etl_num_times_used != null &&
                    props.framework.etl_num_times_converted != null &&
                    Math.round(
                      (props.framework.etl_num_times_converted /
                        (props.framework.etl_num_times_used + 0.0001)) *
                        100
                    )}
                  % reply
                </Text>
                <Text size='8px' color='blue' fz={'xs'} fw='500'>
                  ({props.framework.etl_num_times_converted}/{props.framework.etl_num_times_used}{' '}
                  times)
                </Text>
              </Box>

              <Box mr={40} w='100%'>
                <Flex>
                  <Text
                    size='sm'
                    fw='600'
                    mb='xs'
                    sx={{ textTransform: 'uppercase' }}
                    color='gray'
                    variant='outline'
                  >
                    {props.framework.title}
                  </Text>
                  {/* Hovercard for transformers */}

                  <HoverCard width={280} shadow='md'>
                    <HoverCard.Target>
                      <Badge
                        leftSection={<IconSearch size='0.8rem' style={{ marginTop: 4 }} />}
                        color='lime'
                        variant={
                          props.framework.active_transformers &&
                          props.framework.active_transformers.length > 0
                            ? 'filled'
                            : 'outline'
                        }
                        ml='xs'
                        size='xs'
                        onClick={() => {
                          toggle();
                        }}
                      >
                        {props.framework.active_transformers &&
                        props.framework.active_transformers.length > 0
                          ? props.framework.active_transformers.length + ' Research Points'
                          : '0 Research Points'}
                      </Badge>
                    </HoverCard.Target>
                    <HoverCard.Dropdown style={{ backgroundColor: 'rgb(34, 37, 41)', padding: 0 }}>
                      <Paper
                        style={{
                          backgroundColor: 'rgb(34, 37, 41)',
                          color: 'white',
                          padding: 10,
                        }}
                      >
                        <TextWithNewline style={{ fontSize: '12px' }}>
                          {props.framework.active_transformers.length > 0
                            ? '<b>Active Research Points:</b>\n- ' +
                              props.framework.active_transformers
                                .map((rp: any) => rp.replaceAll('_', ' ').toLowerCase())
                                .join('\n- ')
                            : 'Click to activate more research points'}
                        </TextWithNewline>
                      </Paper>
                    </HoverCard.Dropdown>
                  </HoverCard>

                  {props.framework.human_feedback && (
                    <HoverCard width={280} shadow='md'>
                      <HoverCard.Target>
                        <Badge
                          leftSection={<IconBulb size='0.8rem' />}
                          color='grape'
                          variant='filled'
                          ml='xs'
                          size='xs'
                        >
                          Fine Tuned
                        </Badge>
                      </HoverCard.Target>
                      <HoverCard.Dropdown
                        style={{ backgroundColor: 'rgb(34, 37, 41)', padding: 0 }}
                      >
                        <Paper
                          style={{
                            backgroundColor: 'rgb(34, 37, 41)',
                            color: 'white',
                            padding: 10,
                          }}
                        >
                          <TextWithNewline style={{ fontSize: '12px' }}>
                            {'<b>Additional Instructions:</b>\n' + props.framework.human_feedback}
                          </TextWithNewline>
                        </Paper>
                      </HoverCard.Dropdown>
                    </HoverCard>
                  )}
                </Flex>
                <Card withBorder w='100%' sx={{}}>
                  {editing ? (
                    <FocusTrap active={true}>
                      <Textarea
                        placeholder='Instructions'
                        minRows={3}
                        autosize
                        variant='filled'
                        {...form.getInputProps('promptInstructions')}
                        onBlur={() => {
                          setEditing(false);
                        }}
                      />
                    </FocusTrap>
                  ) : (
                    <Text style={{ fontSize: '0.9rem', lineHeight: 2 }}>
                      <div
                        onClick={() => {
                          setEditing(true);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            form.values.promptInstructions
                              .replaceAll(
                                '[[',
                                "<span style='margin-left: 6px; margin-right: 6px; background-color: " +
                                  theme.colors['blue'][5] +
                                  "; padding: 2px; color: white; padding-left: 8px; padding-right: 8px; border-radius: 4px;'>✨ "
                              )
                              .replaceAll(']]', '</span>')
                              .replaceAll(
                                '\n',
                                `<br style="display: block; content: ' '; margin: 10px 0 "/>`
                              ) as string
                          ),
                        }}
                      />
                    </Text>
                  )}
                </Card>
              </Box>

              {/* <Box sx={{ justifyContent: 'right' }} ml='auto'>
                <Button
                  mt='xs'
                  variant='subtle'
                  radius='xl'
                  size='sm'
                  compact
                  onClick={() => {
                    setEditing((prev) => !prev);
                  }}
                >
                  {editing ? 'Save' : 'Edit'}
                </Button>
              </Box> */}
            </Paper>
          </form>
          <Modal opened={opened} onClose={toggle} size='lg'>
            <Box w='100%' mb='md'>
              <Title order={4}>"{form.values.frameworkName}" Research Points</Title>
              <Text color='gray'>
                {props.framework.active_transformers.length} research points enabled.
              </Text>
              <Divider />
              <PersonalizationSection
                blocklist={props.framework.transformer_blocklist}
                onItemsChange={async (items) => {
                  setPersonalizationItemsCount(items.filter((x) => x.checked).length);
                  setPersonalizationItemIds(items.filter((x) => !x.checked).map((x) => x.id));
                }}
                onChanged={() => {
                  setChanged(true);
                }}
              />

              <Button
                w='100%'
                mt='md'
                onClick={() => {
                  toggle();
                  setChanged(true);
                  saveSettings(debouncedForm);
                }}
                sx={{
                  display: changed ? 'block' : 'none',
                }}
              >
                Save and Close
              </Button>
            </Box>
          </Modal>
        </Stack>
      </Stack>
    </>
  );
}

export const RESEARCH_POINTS = [
  'LINKEDIN_BIO_SUMMARY',
  'LIST_OF_PAST_JOBS',
  'YEARS_OF_EXPERIENCE',
  'CURRENT_EXPERIENCE_DESCRIPTION',
  'COMMON_EDUCATION',
  'RECENT_RECOMMENDATIONS',
  'RECENT_PATENTS',
  'YEARS_OF_EXPERIENCE_AT_CURRENT_JOB',
  'CUSTOM',
  'CURRENT_JOB_DESCRIPTION',
  'CURRENT_JOB_SPECIALTIES',
  'CURRENT_JOB_INDUSTRY',
  'SERP_NEWS_SUMMARY',
  'SERP_NEWS_SUMMARY_NEGATIVE',
  'GENERAL_WEBSITE_TRANSFORMER',
];

export const PersonalizationSection = (props: {
  blocklist: string[];
  onItemsChange: (items: any[]) => void;
  onChanged?: () => void;
  title?: string;
  hideAnalytics?: boolean;
}) => {
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  const [acceptanceRates, setAcceptanceRates] = useState<any>();

  const [prospectItems, setProspectItems] = useState([
    {
      title: 'Personal Bio',
      id: 'LINKEDIN_BIO_SUMMARY',
      checked: !props.blocklist.includes('LINKEDIN_BIO_SUMMARY'),
      disabled: !!currentProject?.transformer_blocklist?.includes('LINKEDIN_BIO_SUMMARY'),
    },
    {
      title: 'List Of Past Jobs',
      id: 'LIST_OF_PAST_JOBS',
      checked: !props.blocklist.includes('LIST_OF_PAST_JOBS'),
      disabled: !!currentProject?.transformer_blocklist?.includes('LIST_OF_PAST_JOBS'),
    },
    {
      title: 'Years of Experience',
      id: 'YEARS_OF_EXPERIENCE',
      checked: !props.blocklist.includes('YEARS_OF_EXPERIENCE'),
      disabled: !!currentProject?.transformer_blocklist?.includes('YEARS_OF_EXPERIENCE'),
    },
    {
      title: 'Current Experience',
      id: 'CURRENT_EXPERIENCE_DESCRIPTION',
      checked: !props.blocklist.includes('CURRENT_EXPERIENCE_DESCRIPTION'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_EXPERIENCE_DESCRIPTION'),
    },
    {
      title: 'Education History',
      id: 'COMMON_EDUCATION',
      checked: !props.blocklist.includes('COMMON_EDUCATION'),
      disabled: !!currentProject?.transformer_blocklist?.includes('COMMON_EDUCATION'),
    },
    {
      title: 'Recommendations',
      id: 'RECENT_RECOMMENDATIONS',
      checked: !props.blocklist.includes('RECENT_RECOMMENDATIONS'),
      disabled: !!currentProject?.transformer_blocklist?.includes('RECENT_RECOMMENDATIONS'),
    },
    {
      title: 'Patents',
      id: 'RECENT_PATENTS',
      checked: !props.blocklist.includes('RECENT_PATENTS'),
      disabled: !!currentProject?.transformer_blocklist?.includes('RECENT_PATENTS'),
    },
    {
      title: 'Years at Current Job',
      id: 'YEARS_OF_EXPERIENCE_AT_CURRENT_JOB',
      checked: !props.blocklist.includes('YEARS_OF_EXPERIENCE_AT_CURRENT_JOB'),
      disabled: !!currentProject?.transformer_blocklist?.includes(
        'YEARS_OF_EXPERIENCE_AT_CURRENT_JOB'
      ),
    },
    {
      title: 'Custom Data Points',
      id: 'CUSTOM',
      checked: !props.blocklist.includes('CUSTOM'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CUSTOM'),
    },
  ]);

  const [companyItems, setCompanyItems] = useState([
    {
      title: 'Company Description',
      id: 'CURRENT_JOB_DESCRIPTION',
      checked: !props.blocklist.includes('CURRENT_JOB_DESCRIPTION'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_JOB_DESCRIPTION'),
    },
    {
      title: 'Company Specialites',
      id: 'CURRENT_JOB_SPECIALTIES',
      checked: !props.blocklist.includes('CURRENT_JOB_SPECIALTIES'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_JOB_SPECIALTIES'),
    },
    {
      title: 'Company Industry',
      id: 'CURRENT_JOB_INDUSTRY',
      checked: !props.blocklist.includes('CURRENT_JOB_INDUSTRY'),
      disabled: !!currentProject?.transformer_blocklist?.includes('CURRENT_JOB_INDUSTRY'),
    },
    {
      title: 'General Company News',
      id: 'SERP_NEWS_SUMMARY',
      checked: !props.blocklist.includes('SERP_NEWS_SUMMARY'),
      disabled: !!currentProject?.transformer_blocklist?.includes('SERP_NEWS_SUMMARY'),
    },
    {
      title: 'Negative Company News',
      id: 'SERP_NEWS_SUMMARY_NEGATIVE',
      checked: !props.blocklist.includes('SERP_NEWS_SUMMARY_NEGATIVE'),
      disabled: !!currentProject?.transformer_blocklist?.includes('SERP_NEWS_SUMMARY_NEGATIVE'),
    },
    {
      title: 'Website Info',
      id: 'GENERAL_WEBSITE_TRANSFORMER',
      checked: !props.blocklist.includes('GENERAL_WEBSITE_TRANSFORMER'),
      disabled: !!currentProject?.transformer_blocklist?.includes('GENERAL_WEBSITE_TRANSFORMER'),
    },
  ]);

  const { data, isFetching } = useQuery({
    queryKey: [`query-get-acceptance-rates`],
    queryFn: async () => {
      const result = await getAcceptanceRates(userToken);
      return result.status === 'success' ? result.data : undefined;
    },
  });

  const allItems = prospectItems
    .map((x) => {
      return {
        ...x,
        type: 'PROSPECT',
        accepted: getAcceptanceRate(x.id),
      };
    })
    .concat(
      companyItems.map((x) => {
        return {
          ...x,
          type: 'COMPANY',
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
    if (props.hideAnalytics) return null;
    for (const d of data) {
      if (d.research_point_type === itemId) {
        return Math.round(d['avg. acceptance %'] * 100) as number;
      }
    }
    return null;
  }

  useEffect(() => {
    if (props.hideAnalytics) return;
    const allItems = [...prospectItems, ...companyItems];
    props.onItemsChange(allItems);
  }, []);

  const markAll = (newLabel: boolean) => {
    setProspectItems((prev) => {
      const items = [...prev];
      items.map((i) => {
        i.checked = newLabel;
        return i;
      });
      return items;
    });

    setCompanyItems((prev) => {
      const items = [...prev];
      items.map((i) => {
        i.checked = newLabel;
        return i;
      });
      return items;
    });

    setTimeout(() => {
      props.onItemsChange([...prospectItems, ...companyItems]);
      props.onChanged && props.onChanged();
    }, 1000);
  };

  function setProfileChecked(itemId: string, checked: boolean) {
    setProspectItems((prev) => {
      const items = [...prev];
      items.map((i) => {
        if (i.id === itemId) {
          i.checked = checked;
        }
        return i;
      });
      props.onItemsChange([...prospectItems, ...companyItems]);
      props.onChanged && props.onChanged();
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
      props.onItemsChange([...prospectItems, ...companyItems]);
      props.onChanged && props.onChanged();
      return items;
    });
  }

  return (
    <Flex direction='column'>
      <Card radius={'md'} mb={'1rem'}>
        <Group position='apart'>
          <Box>
            <Title fw={300} order={4}>
              {props.title ?? 'Acceptance Rate by Personalization'}
            </Title>
          </Box>
          <Box sx={{ textAlign: 'right' }} ml='auto' pb='sm'>
            <Badge leftSection={<IconCircle size='0.7rem' />} color='grape' size='xs'>
              Account Data
            </Badge>
            <br />
            <Badge leftSection={<IconCircle size='0.7rem' />} color='green' mt='xs' size='xs'>
              Contact Data
            </Badge>
          </Box>
        </Group>
        <Checkbox
          checked={allItems.every((x) => x.checked)}
          label={'Select All Frameworks'}
          mb='md'
          onClick={(event) => markAll(event.currentTarget.checked)}
        />
        <Flex direction={'column'} gap={'0.5rem'}>
          {allItems.map((item) => (
            <ProcessBar
              id={item.id}
              title={item.title}
              percent={item.accepted || 0}
              checked={item.checked}
              onPressItem={item.type === 'PROSPECT' ? setProfileChecked : setCompanyChecked}
              color={item.type === 'PROSPECT' ? 'teal' : 'grape'}
              hideAnalytics={props.hideAnalytics}
            />
          ))}
        </Flex>
      </Card>
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
  hideAnalytics?: boolean;
}> = ({
  id,
  title,
  percent,
  color = 'green',
  disabled,
  checked,
  onPressItem,
  hideAnalytics = false,
}) => {
  return (
    <Flex align={'center'} gap={'0.5rem'}>
      <Flex sx={{ flex: 4 }} gap={'0.25rem'} align={'center'}>
        <Checkbox
          size={'sm'}
          label={<Text fw={300}>{title}</Text>}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onPressItem(id, event.currentTarget.checked)}
          color={color}
          variant='outline'
        />
        <Flex sx={{ flex: 1 }}>
          <Divider w={'100%'} color={'#E9ECEF'} />
        </Flex>
        <Tooltip label='Historical Acceptance Rate' withArrow>
          <Button
            variant={'light'}
            fw={700}
            size='xs'
            color={color}
            radius='xl'
            h='auto'
            fz={'0.625rem'}
            py={'0.125rem'}
            px={'0.25rem'}
          >
            {hideAnalytics ? 'Not Available' : percent + '%'}
          </Button>
        </Tooltip>
      </Flex>
      {!hideAnalytics && (
        <Flex direction={'column'} sx={{ flex: 6 }}>
          <Progress value={percent} color={color} size={'lg'} radius='xl' />
        </Flex>
      )}
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
    <Card shadow='xs' radius={'md'} mb={'1rem'}>
      <Card.Section>
        <Flex
          align={'center'}
          justify={'space-between'}
          bg={`${isPurple ? 'grape' : 'teal'}.0`}
          py={'0.5rem'}
          px={'1rem'}
          gap={'0.5rem'}
        >
          <Text fw={'400'} fz='xs' color={"${isPurple ? 'grape' : 'teal'}.8"}>
            {title}
          </Text>
        </Flex>
      </Card.Section>
      <Grid gutter={'1.5rem'} py={'1rem'}>
        {items.map((item) => {
          return (
            <Grid.Col xs={12} md={6} xl={4} key={item.title}>
              <Flex align={'center'} gap={'0.25rem'}>
                <Checkbox
                  size={'xs'}
                  label={item.title}
                  checked={item.checked}
                  disabled={item.disabled}
                  onChange={(event) => onPressItem(item, event.currentTarget.checked)}
                  color={`${isPurple ? 'grape' : 'teal'}`}
                  variant='outline'
                />
              </Flex>
            </Grid.Col>
          );
        })}
      </Grid>
    </Card>
  );
};
