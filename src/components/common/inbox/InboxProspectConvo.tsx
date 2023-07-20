import { currentConvoMessageState, openedOutboundChannelState, openedProspectIdState, selectedBumpFrameworkState } from '@atoms/inboxAtoms';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import TextWithNewlines from '@common/library/TextWithNewlines';
import loaderWithText from '@common/library/loaderWithText';
import {
  Button,
  Flex,
  Group,
  Paper,
  Title,
  Text,
  Textarea,
  useMantineTheme,
  Divider,
  Tabs,
  ActionIcon,
  Badge,
  Container,
  Avatar,
  Stack,
  ScrollArea,
  LoadingOverlay,
  Center,
  Box,
  Loader,
  Skeleton,
} from '@mantine/core';
import { IconExternalLink, IconWriting, IconSend, IconBrandLinkedin, IconMail, IconDots } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { convertDateToCasualTime, convertDateToLocalTime } from '@utils/general';
import { getConversation } from '@utils/requests/getConversation';
import { getProspectByID } from '@utils/requests/getProspectByID';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { LinkedInMessage, Prospect } from 'src';
import { labelizeConvoSubstatus } from './utils';
import { readLiMessages } from '@utils/requests/readMessages';
import ProspectDetailsCalendarLink from '@common/prospectDetails/ProspectDetailsCalendarLink';
import ProspectDetailsOptionsMenu from '@common/prospectDetails/ProspectDetailsOptionsMenu';
import { getAutoBumpMessage } from '@utils/requests/autoBumpMessage';
import _ from 'lodash';
import InboxProspectConvoSendBox from './InboxProspectConvoSendBox';
import InboxProspectConvoBumpFramework from './InboxProspectConvoBumpFramework';
import { AiMetaDataBadge } from '@common/persona/LinkedInConversationEntry';
import { NAV_HEADER_HEIGHT } from '@nav/MainHeader';
import { INBOX_PAGE_HEIGHT } from '@pages/InboxPage';
import { getBumpFrameworks, getSingleBumpFramework } from '@utils/requests/getBumpFrameworks';

export function ProspectConvoMessage(props: {
  img_url: string;
  name: string;
  message: string;
  timestamp: string;
  is_me: boolean;
  aiGenerated: boolean;
  bumpFrameworkId?: number;
  bumpFrameworkTitle?: string;
  bumpFrameworkDescription?: string;
  bumpFrameworkLength?: string;
  accountResearchPoints?: string[];
  cta?: string;
}) {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const [bumpNumberConverted, setBumpNumberConverted] = useState<number | undefined>(undefined);
  const [bumpNumberUsed, setBumpNumberUsed] = useState<number | undefined>(undefined);

  const triggerGetSingleBumpFramework = async (id: number) => {
    const result = await getSingleBumpFramework(userToken, id);
    if (result) {
      setBumpNumberConverted(result.data.bump_framework.etl_num_times_converted);
      setBumpNumberUsed(result.data.bump_framework.etl_num_times_used);
    }
  }

  useEffect(() => {
    if (props.bumpFrameworkId) {
      triggerGetSingleBumpFramework(props.bumpFrameworkId);
    }
  }, [])

  return (
    <Container py={5}>
      <Flex gap={0} wrap='nowrap'>
        <div style={{ flexBasis: '10%' }}>
          <Avatar size='md' radius='xl' m={5} src={props.img_url} />
        </div>
        <div style={{ flexBasis: '90%' }}>
          <Stack spacing={5}>
            <Group position='apart'>
              <Group spacing={10}>
                <Title order={6}>{props.name}</Title>
                {props.aiGenerated && (
                  <AiMetaDataBadge
                    location={{ position: 'relative' }}
                    bumpFrameworkId={props.bumpFrameworkId || 0}
                    bumpFrameworkTitle={props.bumpFrameworkTitle || ''}
                    bumpFrameworkDescription={props.bumpFrameworkDescription || ''}
                    bumpFrameworkLength={props.bumpFrameworkLength || ''}
                    bumpNumberConverted={bumpNumberConverted}
                    bumpNumberUsed={bumpNumberUsed}
                    accountResearchPoints={props.accountResearchPoints || []}
                    cta={props.cta || ''}
                  />
                )}
              </Group>
              <Text weight={400} size={11} c='dimmed' pr={10}>
                {props.timestamp}
              </Text>
            </Group>
            <TextWithNewlines style={{ fontSize: '0.875rem' }}>{props.message}</TextWithNewlines>
          </Stack>
        </div>
      </Flex>
    </Container>
  );
}

export const HEADER_HEIGHT = 102;

export default function ProspectConvo(props: { prospects: Prospect[] }) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const sendBoxRef = useRef<any>();
  // We keep a map of the prospectId to the bump framework ref in order to fix ref bugs for generating messages via btn
  const bumpFrameworksRef = useRef<Map<number, any>>(new Map());

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const openedProspectId = useRecoilValue(openedProspectIdState);
  const [openedOutboundChannel, setOpenedOutboundChannel] = useRecoilState(openedOutboundChannelState);
  const [selectedBumpFramework, setBumpFramework] = useRecoilState(selectedBumpFrameworkState);
  const [currentConvoMessages, setCurrentConvoMessages] = useRecoilState(currentConvoMessageState);

  const prospect = _.cloneDeep(props.prospects.find((p) => p.id === openedProspectId));

  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });

  const { data, isFetching } = useQuery({
    queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
    queryFn: async () => {
      const response = await getProspectByID(userToken, openedProspectId);
      return response.status === 'success' ? response.data : [];
    },
    enabled: openedProspectId !== -1,
  });

  const { isFetching: isFetchingMessages, refetch } = useQuery({
    queryKey: [`query-get-dashboard-prospect-${openedProspectId}-convo-${openedOutboundChannel}`],
    queryFn: async () => {
      // TODO: We don't handle email messages yet
      if (openedOutboundChannel === 'email') {
        return [];
      }

      const result = await getConversation(userToken, openedProspectId);
      // Indicate messages as read
      const readLiResult = await readLiMessages(userToken, openedProspectId);
      if (readLiResult.status === 'success' && readLiResult.data.updated) { }

      // Refetch the prospect list
      queryClient.refetchQueries({
        queryKey: [`query-dash-get-prospects`],
      });
      queryClient.refetchQueries({
        queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
      });


      // Set if we have an auto bump message generated
      const autoBumpMsgResponse = await getAutoBumpMessage(userToken, openedProspectId);
      if (autoBumpMsgResponse.status === 'success') {
        sendBoxRef.current?.setAiGenerated(true);
        sendBoxRef.current?.setMessageDraft(
          autoBumpMsgResponse.data.message,
          autoBumpMsgResponse.data.bump_framework,
          autoBumpMsgResponse.data.account_research_points
        );
        sendBoxRef.current?.setAiMessage(autoBumpMsgResponse.data.message);
      }

      const finalMessages = result.status === 'success' ? (result.data.data.reverse() as LinkedInMessage[]) : [];
      setCurrentConvoMessages(finalMessages);
      return finalMessages;
    },
    enabled: openedProspectId !== -1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    scrollToBottom();
    if (isFetchingMessages) {
      triggerGetBumpFrameworks();
    }
  }, [isFetchingMessages]);

  useEffect(() => {
    sendBoxRef.current?.setAiGenerated(false);
    sendBoxRef.current?.setMessageDraft('');
    sendBoxRef.current?.setAiMessage('');
  }, [openedProspectId]);

  const triggerGetBumpFrameworks = async () => {
    setBumpFramework(undefined);

    if (!prospect) {
      return;
    }

    // This needs changing in the future to be more rigid
    let substatuses: string[] = [];
    if (prospect.linkedin_status?.includes("ACTIVE_CONVO_")) {
      substatuses = [prospect.linkedin_status];
    }

    const result = await getBumpFrameworks(
      userToken,
      [prospect.overall_status],
      substatuses,
      [prospect.archetype_id]
    );
    if (result.status === 'success') {
      sendBoxRef.current?.setBumpFrameworks(result.data.bump_frameworks);
    }
  }

  // // On load we should get the bump frameworks
  // useEffect(() => {
  //   triggerGetBumpFrameworks();
  // }, [])

  const statusValue = data?.details?.linkedin_status || 'ACTIVE_CONVO';

  const linkedin_public_id = data?.li.li_profile?.split('/in/')[1]?.split('/')[0] ?? '';

  // Disable AI based on SDR settings
  let ai_disabled = !prospect || (prospect.li_last_message_from_prospect !== null && userData.disable_ai_on_prospect_respond);
  if (userData.disable_ai_on_message_send) {
    const human_sent_msg = currentConvoMessages?.find(msg => !msg.ai_generated && msg.connection_degree == 'You')
    if (human_sent_msg !== undefined) {
      ai_disabled = true
    }
  }

  if (!openedProspectId || openedProspectId == -1) {
    return (
      <Flex
        direction='column'
        align='left'
        p='sm'
        mt='lg'
        h={`calc(${INBOX_PAGE_HEIGHT} - 100px)`}
      >
        <Skeleton height={50} circle mb="xl" />
        <Skeleton height={8} radius="xl" />
        <Skeleton height={50} mt={12}  />
        <Skeleton height={50} mt={12} />
        <Skeleton height={40} w='50%' mt={12} />
        <Skeleton height={50} mt={12} />
        <Skeleton height={20} w='80%' mt={12} />
      </Flex>
    );
  }

  return (
    <Flex gap={0} direction='column' wrap='nowrap' h={'100%'} bg='white'>
      <div style={{ height: HEADER_HEIGHT, position: 'relative' }}>
        <Group position='apart' p={15} h={66} sx={{ flexWrap: 'nowrap' }}>
          <div style={{ overflow: 'hidden' }}>
            <Title order={3} truncate>
              {data?.details.full_name}
            </Title>
            <Text weight={300} fs='italic' size={10} c='dimmed' truncate>
              {(prospect && new Date(prospect.hidden_until).getTime() > new Date().getTime()) ? (
                <>Snoozed Until: {convertDateToLocalTime(new Date(prospect.hidden_until))}</>
              ) : (
                <>Last Updated: {convertDateToCasualTime(new Date())}</>
              )}
            </Text>
          </div>
          <Group sx={{ flexWrap: 'nowrap' }}>
            <Badge size='lg' color={'blue'}>
              {labelizeConvoSubstatus(statusValue, data?.details?.bump_count)}
            </Badge>
            <ProspectDetailsOptionsMenu
              prospectId={openedProspectId}
              archetypeId={prospect?.archetype_id || -1}
              aiEnabled={ai_disabled ? undefined : !prospect?.deactivate_ai_engagement}
              refetch={refetch}
            />
          </Group>
        </Group>
        <Tabs
          variant='outline'
          defaultValue='linkedin'
          radius={theme.radius.md}
          h={36}
          value={openedOutboundChannel}
          onTabChange={(value) => {
            if (value) {
              setOpenedOutboundChannel(value);
            }
          }}
        >
          <Tabs.List px={20}>
            <Tabs.Tab value='linkedin' icon={<IconBrandLinkedin size='0.8rem' />}>
              LinkedIn
            </Tabs.Tab>
            <Tabs.Tab value='email' icon={<IconMail size='0.8rem' />}>
              Email
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        {statusValue === 'ACTIVE_CONVO_SCHEDULING' && (
          <div style={{ position: 'absolute', bottom: 7, right: 15 }}>
            <ProspectDetailsCalendarLink calendarLink={userData.scheduling_link} width='250px' />
          </div>
        )}
      </div>
      <div
        style={{
          height: `calc((${INBOX_PAGE_HEIGHT} - ${HEADER_HEIGHT}px)*0.70)`,
          alignItems: 'stretch',
          position: 'relative',
        }}
      >
        {(ai_disabled || prospect?.deactivate_ai_engagement) && <Badge variant="filled" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }} color="red">AI Disabled</Badge>}
        <ScrollArea h={`calc((${INBOX_PAGE_HEIGHT} - ${HEADER_HEIGHT}px)*0.70)`} viewportRef={viewport}>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <LoadingOverlay loader={loaderWithText('')} visible={isFetchingMessages} />
            {currentConvoMessages &&
              currentConvoMessages.map((msg, i) => (
                <ProspectConvoMessage
                  key={i}
                  img_url={msg.img_url}
                  name={`${msg.first_name} ${msg.last_name}`}
                  message={msg.message}
                  timestamp={convertDateToCasualTime(new Date(msg.date))}
                  is_me={msg.connection_degree === 'You'}
                  aiGenerated={msg.ai_generated}
                  bumpFrameworkId={msg.bump_framework_id}
                  bumpFrameworkTitle={msg.bump_framework_title}
                  bumpFrameworkDescription={msg.bump_framework_description}
                  bumpFrameworkLength={msg.bump_framework_length}
                  accountResearchPoints={msg.account_research_points}
                  cta={''}
                />
              ))}
            {currentConvoMessages && currentConvoMessages.length === 0 && (
              <Center h={400}>
                <Text fz='sm' fs='italic' c='dimmed'>
                  No conversation history found.
                </Text>
              </Center>
            )}
            <Box sx={{ width: '100%', height: '50px' }}>

            </Box>
          </div>
        </ScrollArea>
      </div>
      <Stack style={{ height: `calc((${INBOX_PAGE_HEIGHT} - ${HEADER_HEIGHT}px)*0.30)` }} justify='flex-end'>
        <InboxProspectConvoSendBox
          ref={sendBoxRef}
          linkedin_public_id={linkedin_public_id}
          prospectId={openedProspectId}
          messages={currentConvoMessages || []}
          scrollToBottom={scrollToBottom}
        />
      </Stack>
      {prospect && (
        <InboxProspectConvoBumpFramework
          prospect={prospect}
          messages={currentConvoMessages || []}
        />
      )}
    </Flex>
  );
}
