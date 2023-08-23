import {
  currentConvoChannelState,
  currentConvoEmailMessageState,
  currentConvoLiMessageState,
  fetchingProspectIdState,
  openedProspectIdState,
  openedProspectLoadingState,
  selectedBumpFrameworkState,
  selectedEmailThread,
} from "@atoms/inboxAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import TextWithNewlines from "@common/library/TextWithNewlines";
import loaderWithText from "@common/library/loaderWithText";
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
  Select,
  Tooltip,
} from "@mantine/core";
import {
  IconExternalLink,
  IconWriting,
  IconSend,
  IconBrandLinkedin,
  IconMail,
  IconDots,
  IconPointFilled,
  IconArrowsDiagonal,
  IconPlus,
  IconArrowBigLeftFilled,
  IconPencilPlus,
  IconPencil,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  convertDateToCasualTime,
  convertDateToLocalTime,
  proxyURL,
} from "@utils/general";
import { getConversation } from "@utils/requests/getConversation";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Channel,
  EmailMessage,
  EmailThread,
  LinkedInMessage,
  Prospect,
  ProspectDetails,
  ProspectShallow,
} from "src";
import { labelizeConvoSubstatus } from "./utils";
import { readLiMessages } from "@utils/requests/readMessages";
import ProspectDetailsCalendarLink from "@common/prospectDetails/ProspectDetailsCalendarLink";
import ProspectDetailsOptionsMenu from "@common/prospectDetails/ProspectDetailsOptionsMenu";
import { getAutoBumpMessage } from "@utils/requests/autoBumpMessage";
import _, { set } from "lodash";
import InboxProspectConvoSendBox from "./InboxProspectConvoSendBox";
import InboxProspectConvoBumpFramework from "./InboxProspectConvoBumpFramework";
import { AiMetaDataBadge } from "@common/persona/LinkedInConversationEntry";
import { NAV_HEADER_HEIGHT } from "@nav/MainHeader";
import { INBOX_PAGE_HEIGHT } from "@pages/InboxPage";
import {
  getBumpFrameworks,
  getSingleBumpFramework,
} from "@utils/requests/getBumpFrameworks";
import { getEmailMessages, getEmailThreads } from "@utils/requests/getEmails";
import { openComposeEmailModal } from "@common/prospectDetails/ProspectDetailsViewEmails";
import { currentProjectState } from "@atoms/personaAtoms";
import { useHover } from "@mantine/hooks";
import DOMPurify from "dompurify";
import { getEmailSequenceSteps } from "@utils/requests/emailSequencing";

export function ProspectConvoMessage(props: {
  id: number;
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
  initialMessageId?: number;
  initialMessageCTAId?: number;
  initialMessageCTAText?: string;
  initialMessageResearchPoints?: string[];
  initialMessageStackRankedConfigID?: number;
  initialMessageStackRankedConfigName?: string;
  cta?: string;
}) {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const uniqueId = `prospect-convo-message-${props.id}`;
  const [finalMessage, setFinalMessage] = useState<string>(props.message);

  const [bumpNumberConverted, setBumpNumberConverted] = useState<
    number | undefined
  >(undefined);
  const [bumpNumberUsed, setBumpNumberUsed] = useState<number | undefined>(
    undefined
  );

  const triggerGetSingleBumpFramework = async (id: number) => {
    const result = await getSingleBumpFramework(userToken, id);
    if (result) {
      setBumpNumberConverted(
        result.data.bump_framework.etl_num_times_converted
      );
      setBumpNumberUsed(result.data.bump_framework.etl_num_times_used);
    }
  };

  useEffect(() => {
    if (props.bumpFrameworkId) {
      triggerGetSingleBumpFramework(props.bumpFrameworkId);
    }
  }, []);


  // const replyMatch = props.message.match(/>On .+[AM|PM] .+ wrote:<br>/gm);
  // let realMessage = props.message;
  // let replyMessage = "";
  // if(replyMatch && replyMatch.length > 0){
  //   const parts = props.message.split(replyMatch[0]);
  //   realMessage = parts[0];
  //   replyMessage = parts[1];
  // }
  //console.log(realMessage, replyMessage);

  useLayoutEffect(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(`.gmail_quote`);
      if(elements.length > 0){
        const parent = elements[0].parentNode;
        if (parent) {
          // TODO: Add collapse button
          const newElement = document.createElement("div");
          parent.insertBefore(newElement.cloneNode(true), elements[0]);
          parent.removeChild(elements[0]);
        }
      }
    
      const element = document.getElementById(uniqueId);
      if (element) {
        setFinalMessage(element.innerHTML);
      }
    })
  }, []);

  return (
    <>
      {/* Hidden section for dom html parsing */}
      <div
        id={uniqueId}
        style={{ display: "none" }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(props.message),
        }}
      />
    <Container py={5} sx={{ flex: 1 }}>
      <Flex gap={0} wrap="nowrap">
        <div style={{ flexBasis: "10%" }}>
          <Avatar size="md" radius="xl" m={5} src={proxyURL(props.img_url)} />
        </div>
        <div style={{ flexBasis: "90%" }}>
          <Stack spacing={5}>
            <Group position="apart">
              <Group spacing={10}>
                <Title order={6}>{props.name}</Title>
                {props.aiGenerated && (
                  <AiMetaDataBadge
                    location={{ position: "relative" }}
                    bumpFrameworkId={props.bumpFrameworkId || 0}
                    bumpFrameworkTitle={props.bumpFrameworkTitle || ""}
                    bumpFrameworkDescription={
                      props.bumpFrameworkDescription || ""
                    }
                    bumpFrameworkLength={props.bumpFrameworkLength || ""}
                    bumpNumberConverted={bumpNumberConverted}
                    bumpNumberUsed={bumpNumberUsed}
                    accountResearchPoints={props.accountResearchPoints || []}
                    initialMessageId={props.initialMessageId || 0}
                    initialMessageCTAId={props.initialMessageCTAId || 0}
                    initialMessageCTAText={props.initialMessageCTAText || ""}
                    initialMessageResearchPoints={
                      props.initialMessageResearchPoints || []
                    }
                    initialMessageStackRankedConfigID={
                      props.initialMessageStackRankedConfigID || 0
                    }
                    initialMessageStackRankedConfigName={
                      props.initialMessageStackRankedConfigName || ""
                    }
                    cta={props.cta || ""}
                  />
                )}
              </Group>
              <Text weight={400} size={11} c="dimmed" pr={10}>
                {props.timestamp}
              </Text>
            </Group>
            <TextWithNewlines style={{ fontSize: "0.875rem" }}>
              {finalMessage}
            </TextWithNewlines>
          </Stack>
        </div>
      </Flex>
    </Container>
    </>
  );
}

export const HEADER_HEIGHT = 102;

export default function ProspectConvo(props: { prospects: ProspectShallow[] }) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const sendBoxRef = useRef<any>();
  // We keep a map of the prospectId to the bump framework ref in order to fix ref bugs for generating messages via btn
  const bumpFrameworksRef = useRef<Map<number, any>>(new Map());

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const openedProspectId = useRecoilValue(openedProspectIdState);
  const currentProject = useRecoilValue(currentProjectState);

  const [hasGeneratedMessage, setHasGeneratedMessage] = useState(false);
  const [openedConvoBox, setOpenedConvoBox] = useState(false);

  // This is used to fix a bug with the hacky way we're doing message loading now
  const currentMessagesProspectId = useRef(-1);

  const [openedProspectLoading, setOpenedProspectLoading] = useRecoilState(
    openedProspectLoadingState
  );

  const [fetchingProspectId, setFetchingProspectId] = useRecoilState(
    fetchingProspectIdState
  );

  const [selectedBumpFramework, setBumpFramework] = useRecoilState(
    selectedBumpFrameworkState
  );
  const [selectedThread, setSelectedThread] =
    useRecoilState(selectedEmailThread);

  const [openedOutboundChannel, setOpenedOutboundChannel] = useRecoilState(
    currentConvoChannelState
  );
  const [currentConvoLiMessages, setCurrentConvoLiMessages] = useRecoilState(
    currentConvoLiMessageState
  );
  const [currentConvoEmailMessages, setCurrentConvoEmailMessages] =
    useRecoilState(currentConvoEmailMessageState);
  const [emailThread, setEmailThread] = useState<EmailThread>();

  const prospect = _.cloneDeep(
    props.prospects.find((p) => p.id === openedProspectId)
  );

  const isConversationOpened =
    openedOutboundChannel === "LINKEDIN" ||
    (openedOutboundChannel === "EMAIL" && emailThread);

  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () =>
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });

  const { data, isFetching } = useQuery({
    queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
    queryFn: async () => {
      const response = await getProspectByID(userToken, openedProspectId);
      return response.status === "success"
        ? (response.data as ProspectDetails)
        : undefined;
    },
    enabled: openedProspectId !== -1,
  });

  const { data: threads, isFetching: isFetchingThreads } = useQuery({
    queryKey: [`query-prospect-email-threads-${openedProspectId}`],
    queryFn: async () => {
      const response = await getEmailThreads(
        userToken,
        openedProspectId,
        10,
        0
      );
      const threads =
        response.status === "success" ? (response.data as EmailThread[]) : [];

      if (threads.length > 0) {
        const sortedThreads = threads.sort((a: any, b: any) => {
          return (
            new Date(b.last_message_timestamp).getTime() -
            new Date(a.last_message_timestamp).getTime()
          );
        });
        setEmailThread(sortedThreads[0]);
        return sortedThreads;
      } else {
        setEmailThread(undefined);
        return [];
      }
    },
    enabled: openedProspectId !== -1 && openedOutboundChannel === "EMAIL",
    refetchOnWindowFocus: false,
  });

  const { isFetching: isFetchingMessages, refetch } = useQuery({
    queryKey: [
      `query-get-dashboard-prospect-${openedProspectId}-convo-${openedOutboundChannel}`,
      { emailThread },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { emailThread }] = queryKey;

      setCurrentConvoEmailMessages(undefined);
      setCurrentConvoLiMessages(undefined);
      setHasGeneratedMessage(false);

      // For Email //
      if (openedOutboundChannel === "EMAIL" && emailThread) {
        const response = await getEmailMessages(
          userToken,
          openedProspectId,
          emailThread.nylas_thread_id
        );
        const finalMessages =
          response.status === "success"
            ? (response.data.reverse() as EmailMessage[])
            : [];
        setCurrentConvoEmailMessages(finalMessages);
        return finalMessages;
      }

      // For LinkedIn //
      const result = await getConversation(userToken, openedProspectId, false);
      getConversation(userToken, openedProspectId, true).then(
        (updatedResult) => {
          const finalMessages =
            updatedResult.status === "success"
              ? (updatedResult.data.data.reverse() as LinkedInMessage[])
              : [];
          if (openedProspectId === currentMessagesProspectId.current) {
            setCurrentConvoLiMessages(finalMessages);
          }
          setFetchingProspectId(-1);
        }
      );

      // Indicate messages as read
      readLiMessages(userToken, openedProspectId).then((readLiResult) => {
        if (readLiResult.status === "success" && readLiResult.data.updated) {
        }
      });

      // Refetch the prospect list
      queryClient.refetchQueries({
        queryKey: [`query-dash-get-prospects`],
      });
      queryClient.refetchQueries({
        queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
      });

      // Set if we have an auto bump message generated
      if (openedOutboundChannel === "LINKEDIN") {
        getAutoBumpMessage(userToken, openedProspectId).then(
          (autoBumpMsgResponse) => {
            if (autoBumpMsgResponse.status === "success") {
              sendBoxRef.current?.setAiGenerated(true);
              sendBoxRef.current?.setMessageDraft(
                autoBumpMsgResponse.data.message,
                autoBumpMsgResponse.data.bump_framework,
                autoBumpMsgResponse.data.account_research_points
              );
              sendBoxRef.current?.setAiMessage(
                autoBumpMsgResponse.data.message
              );
              setHasGeneratedMessage(true);
            }
          }
        );
      }

      // Update the bump frameworks
      triggerGetBumpFrameworks();

      const finalMessages =
        result.status === "success"
          ? (result.data.data.reverse() as LinkedInMessage[])
          : [];
      setCurrentConvoLiMessages(finalMessages);
      return finalMessages;
    },
    enabled:
      openedProspectId !== -1 &&
      (openedOutboundChannel !== "EMAIL" || !!threads),
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
    sendBoxRef.current?.setMessageDraft("");
    sendBoxRef.current?.setAiMessage("");
    currentMessagesProspectId.current = openedProspectId;
  }, [openedProspectId]);

  // The prospect is no longer loading if we are not fetching any data
  useEffect(() => {
    if (!isFetching && !isFetchingThreads && !isFetchingMessages) {
      setOpenedProspectLoading(false);
    }
  }, [isFetching, isFetchingThreads, isFetchingMessages]);

  const triggerGetBumpFrameworks = async () => {
    setBumpFramework(undefined);

    if (!prospect) {
      return;
    }

    if (openedOutboundChannel === "LINKEDIN") {
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

      if (result.status === "success") {
        sendBoxRef.current?.setBumpFrameworks(result.data.bump_frameworks);
      }
    } else {
      // TODO: In the future need to add substatuses for Objection Library
      const result = await getEmailSequenceSteps(
        userToken,
        [prospect.overall_status],
        [],
        [prospect.archetype_id]
      );

      if (result.status === "success") {
        sendBoxRef.current?.setEmailSequenceSteps(result.data.bump_frameworks);
      }
    }
  };

  // // On load we should get the bump frameworks
  // useEffect(() => {
  //   triggerGetBumpFrameworks();
  // }, [])

  const statusValue = data?.details?.linkedin_status || "ACTIVE_CONVO";

  const linkedin_public_id =
    data?.li.li_profile?.split("/in/")[1]?.split("/")[0] ?? "";

  // Disable AI based on SDR settings
  let ai_disabled =
    !prospect ||
    (prospect.li_last_message_from_prospect !== null &&
      userData.disable_ai_on_prospect_respond);
  if (userData.disable_ai_on_message_send) {
    if (openedOutboundChannel === "EMAIL") {
      const human_sent_msg = currentConvoEmailMessages?.find(
        (msg) => !msg.ai_generated && msg.from_sdr
      );
      if (human_sent_msg !== undefined) {
        ai_disabled = true;
      }
    } else {
      const human_sent_msg = currentConvoLiMessages?.find(
        (msg) => !msg.ai_generated && msg.connection_degree == "You"
      );
      if (human_sent_msg !== undefined) {
        ai_disabled = true;
      }
    }
  }

  if (!openedProspectId || openedProspectId == -1) {
    return (
      <Flex
        direction="column"
        align="left"
        p="sm"
        mt="lg"
        h={`calc(${INBOX_PAGE_HEIGHT} - 100px)`}
      >
        <Skeleton height={50} circle mb="xl" />
        <Skeleton height={8} radius="xl" />
        <Skeleton height={50} mt={12} />
        <Skeleton height={50} mt={12} />
        <Skeleton height={40} w="50%" mt={12} />
        <Skeleton height={50} mt={12} />
        <Skeleton height={20} w="80%" mt={12} />
      </Flex>
    );
  }

  return (
    <Flex gap={0} direction="column" wrap="nowrap" h={"100%"} bg="white">
      <div style={{ height: HEADER_HEIGHT, position: "relative" }}>
        <Group position="apart" p={15} h={66} sx={{ flexWrap: "nowrap" }}>
          <div style={{ overflow: "hidden" }}>
            <Title order={3} truncate>
              {data?.details.full_name}
            </Title>
            <Text weight={300} fs="italic" size={10} c="dimmed" truncate>
              {prospect &&
              new Date(prospect.hidden_until).getTime() >
                new Date().getTime() ? (
                <>
                  Snoozed Until:{" "}
                  {convertDateToLocalTime(new Date(prospect.hidden_until))}
                </>
              ) : (
                <>Last Updated: {convertDateToCasualTime(new Date())}</>
              )}
            </Text>
          </div>
          <Group sx={{ flexWrap: "nowrap" }}>
            <Badge size="lg" color={"blue"}>
              {labelizeConvoSubstatus(statusValue, data?.details?.bump_count)}
            </Badge>
            <ProspectDetailsOptionsMenu
              prospectId={openedProspectId}
              archetypeId={prospect?.archetype_id || -1}
              aiEnabled={
                ai_disabled ? undefined : !prospect?.deactivate_ai_engagement
              }
              refetch={refetch}
            />
          </Group>
        </Group>
        <Tabs
          variant="outline"
          defaultValue="LINKEDIN"
          radius={theme.radius.md}
          h={36}
          value={openedOutboundChannel}
          onTabChange={(value) => {
            if (value) {
              sendBoxRef.current?.setAiGenerated(false);
              sendBoxRef.current?.setAiMessage("");
              sendBoxRef.current?.setMessageDraft("");
              setOpenedOutboundChannel(value as Channel);

              // Pretty bad to set timeout, but we need this channel to update
              setTimeout(refetch, 1);

              if (value === "EMAIL") {
                queryClient.refetchQueries({
                  queryKey: [
                    `query-prospect-email-threads-${openedProspectId}`,
                  ],
                });
              }
            }
          }}
        >
          <Tabs.List px={20}>
            {prospect?.li_public_id && (
              <Tabs.Tab
                value="LINKEDIN"
                icon={<IconBrandLinkedin size="0.8rem" />}
              >
                LinkedIn
              </Tabs.Tab>
            )}
            {prospect?.email && (
              <Tabs.Tab value="EMAIL" icon={<IconMail size="0.8rem" />}>
                Email
              </Tabs.Tab>
            )}
          </Tabs.List>
        </Tabs>
        {statusValue === "ACTIVE_CONVO_SCHEDULING" && (
          <div style={{ position: "absolute", bottom: 7, right: 15 }}>
            <ProspectDetailsCalendarLink
              calendarLink={userData.scheduling_link}
              width="250px"
            />
          </div>
        )}
      </div>
      <div
        style={{
          height: `calc((${INBOX_PAGE_HEIGHT} - ${HEADER_HEIGHT}px)*1.00)`,
          alignItems: "stretch",
          position: "relative",
        }}
      >
        {isConversationOpened &&
          (ai_disabled || prospect?.deactivate_ai_engagement) && (
            <Badge
              variant="filled"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 100,
              }}
              color="red"
            >
              AI Disabled
            </Badge>
          )}
        <ScrollArea
          h={`calc((${INBOX_PAGE_HEIGHT} - ${HEADER_HEIGHT}px)*1.00)`}
          viewportRef={viewport}
          sx={{ position: "relative" }}
        >
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <LoadingOverlay
              loader={loaderWithText("")}
              visible={isFetching || isFetchingThreads || isFetchingMessages}
            />
            {openedOutboundChannel === "EMAIL" && isConversationOpened && (
              <Group
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 100,
                }}
              >
                <Badge
                  variant="filled"
                  sx={{
                    cursor: "pointer",
                  }}
                  color="dark"
                  leftSection={<IconArrowBigLeftFilled size="0.5rem" />}
                  styles={{ root: { textTransform: "initial" } }}
                  onClick={() => setEmailThread(undefined)}
                >
                  Back to Threads
                </Badge>
                <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  padding: '0px 5px',
                }}
                >
                  <Title order={5}>{_.truncate(emailThread?.subject, { length: 36 })}</Title>
                </Box>
              </Group>
            )}
            {openedOutboundChannel === "LINKEDIN" &&
              currentConvoLiMessages &&
              currentConvoLiMessages.map((msg, i) => (
                <ProspectConvoMessage
                  key={i}
                  id={i}
                  img_url={msg.img_url}
                  name={`${msg.first_name} ${msg.last_name}`}
                  message={msg.message}
                  timestamp={convertDateToCasualTime(new Date(msg.date))}
                  is_me={msg.connection_degree === "You"}
                  aiGenerated={msg.ai_generated}
                  bumpFrameworkId={msg.bump_framework_id}
                  bumpFrameworkTitle={msg.bump_framework_title}
                  bumpFrameworkDescription={msg.bump_framework_description}
                  bumpFrameworkLength={msg.bump_framework_length}
                  accountResearchPoints={msg.account_research_points}
                  initialMessageId={msg.initial_message_id}
                  initialMessageCTAId={msg.initial_message_cta_id}
                  initialMessageCTAText={msg.initial_message_cta_text}
                  initialMessageResearchPoints={
                    msg.initial_message_research_points
                  }
                  initialMessageStackRankedConfigID={
                    msg.initial_message_stack_ranked_config_id
                  }
                  initialMessageStackRankedConfigName={
                    msg.initial_message_stack_ranked_config_name
                  }
                  cta={""}
                />
              ))}
            {openedOutboundChannel === "LINKEDIN" &&
              currentConvoLiMessages &&
              currentConvoLiMessages.length === 0 && (
                <Center h={400}>
                  <Text fz="sm" fs="italic" c="dimmed">
                    No conversation history found.
                  </Text>
                </Center>
              )}

            {openedOutboundChannel === "EMAIL" && currentConvoEmailMessages && (
              <Box mt={30}>
                {currentConvoEmailMessages.map((msg, i) => (
                  <Box key={i} sx={{ display: "flex", overflowX: "hidden" }}>
                    <ProspectConvoMessage
                      id={i}
                      img_url={""}
                      name={
                        msg.message_from.length > 0
                          ? msg.message_from[0].name ||
                            msg.message_from[0].email
                          : "Unknown"
                      }
                      message={msg.body}
                      timestamp={convertDateToCasualTime(
                        new Date(msg.date_received)
                      )}
                      is_me={msg.from_sdr}
                      aiGenerated={msg.ai_generated || false}
                      bumpFrameworkId={undefined}
                      bumpFrameworkTitle={undefined}
                      bumpFrameworkDescription={undefined}
                      bumpFrameworkLength={undefined}
                      accountResearchPoints={[]}
                      initialMessageId={undefined}
                      initialMessageCTAId={undefined}
                      initialMessageCTAText={undefined}
                      initialMessageResearchPoints={[]}
                      initialMessageStackRankedConfigID={undefined}
                      initialMessageStackRankedConfigName={undefined}
                      cta={""}
                    />
                  </Box>
                ))}
              </Box>
            )}
            {openedOutboundChannel === "EMAIL" && (
              <>
                {emailThread ? (
                  <>
                    {currentConvoEmailMessages &&
                      currentConvoEmailMessages.length === 0 && (
                        <Center h={400}>
                          <Text fz="sm" fs="italic" c="dimmed">
                            No conversation history found.
                          </Text>
                        </Center>
                      )}
                  </>
                ) : (
                  <>
                    {prospect && (
                      <EmailThreadsSection
                        prospect={prospect}
                        threads={threads || []}
                        onThreadClick={(thread) => {
                          setEmailThread(thread);
                        }}
                      />
                    )}
                  </>
                )}
              </>
            )}

            <Box
              sx={{ width: "100%", height: openedConvoBox ? "250px" : "50px" }}
            ></Box>
          </div>
        </ScrollArea>

        {isConversationOpened && (
          <>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                visibility: openedConvoBox ? "visible" : "hidden",
              }}
            >
              <InboxProspectConvoSendBox
                ref={sendBoxRef}
                email={prospect?.email || ""}
                linkedin_public_id={linkedin_public_id}
                prospectId={openedProspectId}
                nylasMessageId={
                  currentConvoEmailMessages &&
                  currentConvoEmailMessages.length > 0
                    ? currentConvoEmailMessages[
                        currentConvoEmailMessages.length - 1
                      ].nylas_message_id
                    : undefined
                }
                scrollToBottom={scrollToBottom}
                minimizedSendBox={() => setOpenedConvoBox(false)}
              />
            </Box>
            <Box
              sx={{
                position: "absolute",
                bottom: 5,
                right: 5,
                visibility: openedConvoBox ? "hidden" : "visible",
              }}
            >
              <Button
                size="xs"
                radius="md"
                color="dark"
                rightIcon={<IconArrowsDiagonal size="1rem" />}
                onClick={() => {
                  setOpenedConvoBox(true);
                }}
              >
                Send Message
                {hasGeneratedMessage && (
                  <Box
                    pt={2}
                    px={2}
                    sx={(theme) => ({
                      color: theme.colors.blue[4],
                    })}
                  >
                    <IconPointFilled size="0.9rem" />
                  </Box>
                )}
              </Button>
            </Box>
          </>
        )}
      </div>
      {prospect && (
        <InboxProspectConvoBumpFramework
          prospect={prospect}
          messages={currentConvoLiMessages || []}
          onClose={() => {
            triggerGetBumpFrameworks();
          }}
        />
      )}
    </Flex>
  );
}

function EmailThreadsSection(props: {
  prospect: ProspectShallow;
  threads: EmailThread[];
  onThreadClick?: (thread: EmailThread) => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);

  return (
    <Stack m="md" spacing={5}>
      <Group position="apart">
        <Title order={5}>Threads ({props.threads.length})</Title>
        <Tooltip label="Compose New Thread" position="left" withArrow>
          <ActionIcon
            color="blue"
            variant="filled"
            onClick={() => {
              openComposeEmailModal(
                userToken,
                props.prospect.id,
                currentProject?.id || -1,
                "",
                props.prospect.email,
                userData.sdr_email,
                "",
                "",
                ""
              );
            }}
          >
            <IconPencil size="1.125rem" />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Stack py={4} spacing={0}>
        {props.threads.map((thread, i) => (
          <Box key={i}>
            <EmailThreadsOption
              thread={thread}
              onClick={() => {
                props.onThreadClick && props.onThreadClick(thread);
              }}
            />
            <Divider m={0} />
          </Box>
        ))}
      </Stack>
      {props.threads.length === 0 && (
        <Center h={400}>
          <Text fz="sm" fs="italic" c="dimmed">
            No threads found.
          </Text>
        </Center>
      )}
    </Stack>
  );
}

function EmailThreadsOption(props: {
  thread: EmailThread;
  onClick?: () => void;
}) {
  const theme = useMantineTheme();

  const { hovered, ref } = useHover();

  return (
    <Box>
      <Box
        py={5}
        sx={{
          position: 'relative',
          backgroundColor: hovered ? theme.colors.gray[1] : "transparent",
          cursor: "pointer",
        }}
        onClick={() => {
          props.onClick && props.onClick();
        }}
      >
        <Flex ref={ref} gap={10} wrap="nowrap" w={"100%"} h={30}>
          <Box>
            <Stack spacing={0}>
              <Text fz={11} fw={700} span truncate>
                {_.truncate(props.thread.subject, { length: 50 })}
              </Text>
              <Text fz={9} span truncate>
                {_.truncate(props.thread.snippet, { length: 110 })}
              </Text>
            </Stack>
          </Box>
        </Flex>
        <Text
          sx={{
            position: 'absolute',
            top: 5,
            right: 5,
          }}
          weight={400} size={8} c="dimmed"
        >
          {convertDateToCasualTime(new Date(props.thread.last_message_timestamp))}
        </Text>
      </Box>
      <Divider m={0} />
    </Box>
  );
}
