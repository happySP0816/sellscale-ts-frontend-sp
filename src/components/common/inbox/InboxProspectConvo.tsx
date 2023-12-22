import {
  bumpFrameworkSelectedSubstatusState,
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
import loaderWithText from "@common/library/loaderWithText";
import {
  Button,
  Flex,
  Group,
  Title,
  Text,
  useMantineTheme,
  Divider,
  Tabs,
  ActionIcon,
  Badge,
  Avatar,
  Stack,
  ScrollArea,
  LoadingOverlay,
  Center,
  Box,
  Skeleton,
  Tooltip,
  Card,
  Container,
} from "@mantine/core";
import {
  IconExternalLink,
  IconBrandLinkedin,
  IconMail,
  IconArrowBigLeftFilled,
  IconEdit,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconClock,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  convertDateToCasualTime,
  convertDateToLocalTime,
  nameToInitials,
  proxyURL,
  valueToColor,
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
  ProspectDetails,
  ProspectShallow,
} from "src";
import { labelizeConvoSubstatus } from "./utils";
import { readLiMessages } from "@utils/requests/readMessages";
import ProspectDetailsCalendarLink from "@common/prospectDetails/ProspectDetailsCalendarLink";
import ProspectDetailsOptionsMenu from "@common/prospectDetails/ProspectDetailsOptionsMenu";
import { getAutoBumpMessage } from "@utils/requests/autoBumpMessage";
import _ from "lodash";
import InboxProspectConvoSendBox from "./InboxProspectConvoSendBox";
import InboxProspectConvoBumpFramework from "./InboxProspectConvoBumpFramework";
import { INBOX_PAGE_HEIGHT } from "@pages/InboxPage";
import { getBumpFrameworks, getSingleBumpFramework } from "@utils/requests/getBumpFrameworks";
import { getEmailMessages, getEmailThreads } from "@utils/requests/getEmails";
import { openComposeEmailModal } from "@common/prospectDetails/ProspectDetailsViewEmails";
import { currentProjectState } from "@atoms/personaAtoms";
import { useHover } from "@mantine/hooks";
import DOMPurify from "dompurify";
import { getEmailSequenceSteps } from "@utils/requests/emailSequencing";
import { getSmartleadProspectConvo } from "@utils/requests/getSmartleadProspectConvo";
import RichTextArea from "@common/library/RichTextArea";
import { JSONContent } from "@tiptap/react";
import { showNotification } from "@mantine/notifications";
import postSmartleadReply from "@utils/requests/postSmartleadReply";
import { IconArrowLeft, IconChevronUp } from "@tabler/icons";
import { getBumpFrameworksSequence } from "@utils/requests/getBumpFrameworksSequence";
import TextWithNewlines from "@common/library/TextWithNewlines";
import { AiMetaDataBadge } from "@common/persona/LinkedInConversationEntry";
import { useNavigate } from "react-router-dom";

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
      if (elements.length > 0) {
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
    });
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
              <TextWithNewlines
                style={{ fontSize: "0.875rem" }}
                breakheight="12px"
              >
                {finalMessage}
              </TextWithNewlines>
            </Stack>
          </div>
        </Flex>
      </Container>
    </>
  );
}

export let HEADER_HEIGHT = 190;

type LiStepProgress = "COMPLETE" | "INCOMPLETE" | "COMING_SOON" | "OPTIONAL";
type Props = {
  prospects: ProspectShallow[];
  onTabChange?: (tab: string) => void;
  openConvoBox?: boolean;
  hideTitle?: boolean;
  showBackToInbox?: boolean;
  currentEmailStatus?: string;
};
export default function ProspectConvo(props: Props) {
  const [stepThreeComplete, setStepThreeComplete] =
    useState<LiStepProgress>("INCOMPLETE");
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
  const [openedConvoBox, setOpenedConvoBox]: any = useState(
    props.openConvoBox || true
  );

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
    useRecoilState(selectedEmailThread); // PLEASE PROTECT THIS AND USE IT

  const [openedOutboundChannel, setOpenedOutboundChannel] = useRecoilState(
    currentConvoChannelState
  );
  const [currentConvoLiMessages, setCurrentConvoLiMessages] = useRecoilState(
    currentConvoLiMessageState
  );
  const [currentConvoEmailMessages, setCurrentConvoEmailMessages] =
    useRecoilState(currentConvoEmailMessageState);
  const [emailThread, setEmailThread] = useState<EmailThread>();
  const [bumpFrameworksSequence, setBumpFrameworksSequence] = useState([]);

  const prospect = _.cloneDeep(
    props.prospects.find((p) => p.id === openedProspectId)
  );

  const isConversationOpened =
    openedOutboundChannel === "LINKEDIN" ||
    (openedOutboundChannel === "EMAIL" && emailThread) ||
    openedOutboundChannel !== "SMARTLEAD";

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
        setSelectedThread(sortedThreads[0]);
        return sortedThreads;
      } else {
        setEmailThread(undefined);
        setSelectedThread(undefined);
        return [];
      }
    },
    enabled: openedProspectId !== -1 && openedOutboundChannel === "EMAIL",
    refetchOnWindowFocus: false,
  });

  const INBOX_HEIGHT = props.hideTitle ? "70vh" : INBOX_PAGE_HEIGHT;

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

  let HEADER_HEIGHT = props.hideTitle ? 65 : 110;

  const [conversationdetail, setConversationDetail] = useState<boolean[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [smartleadEmailConversation, setSmartleadEmailConversation] = useState<
    any[]
  >([]);

  const [substatus, setOpenBumpFrameworksSubstatus] =
    useRecoilState(bumpFrameworkSelectedSubstatusState);

  // We use this to store the value of the text area
  const [messageDraft, _setMessageDraft] = useState("");
  // We use this to store the raw value of the rich text editor
  const messageDraftRichRaw = useRef<JSONContent | string>();

  // We use this to set the value of the text area (for both rich text and normal text)
  const setMessageDraft = (value: string) => {
    messageDraftRichRaw.current = value;
    _setMessageDraft(value);
  };
  // For email we have to use this ref instead, otherwise the textbox does a weird refocusing.
  const messageDraftEmail = useRef("");
  const triggerGetSmartleadProspectConvo = async () => {
    if (!prospect) return;

    const response = await getSmartleadProspectConvo(
      userToken,
      prospect.id,
      null
    );
    let conversation = response?.data?.conversation;

    // Sort results by time ascending
    conversation = conversation.sort((a: any, b: any) => {
      if (a.time === null) {
        return 1; // Move null to the bottom
      }
      if (b.time === null) {
        return -1; // Move null to the bottom
      }

      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
    setSmartleadEmailConversation(conversation);
  };
  const triggerPostSmartleadReply = async () => {
    setSendingMessage(true);

    if (!prospect) {
      return;
    }

    const prospectid = prospect.id;
    const response = await postSmartleadReply(
      userToken,
      prospectid,
      messageDraftEmail.current
    );
    if (response.status !== "success") {
      showNotification({
        title: "Error",
        message: "Failed to send email",
        color: "red",
      });
    } else {
      showNotification({
        title: "Success",
        message:
          "Email sent. It may take a few minutes to appear in your inbox.",
        color: "green",
      });
      messageDraftEmail.current = "";
      messageDraftRichRaw.current = "";
      setMessageDraft("");
    }

    setSendingMessage(false);

    triggerGetSmartleadProspectConvo();
  };

  const handleConvertDate = (date: string) => {
    const timestamp = date;
    const dateObject = new Date(timestamp);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = dateObject.toLocaleDateString("en-US", options);

    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();

    // Convert hours to 12-hour format and determine AM/PM
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12

    // Add leading zero to minutes if needed
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    // Combine the formatted date and time components
    const formattedDateTime = `${formattedDate} - ${formattedHours}:${formattedMinutes}${ampm}`;

    return formattedDateTime;
  };

  useEffect(() => {
    scrollToBottom();
    if (isFetchingMessages) {
      triggerGetBumpFrameworks();
      getBumpFrameworkSequence();
    }
  }, [isFetchingMessages]);

  useEffect(() => {
    sendBoxRef.current?.setAiGenerated(false);
    sendBoxRef.current?.setMessageDraft("");
    sendBoxRef.current?.setAiMessage("");
    currentMessagesProspectId.current = openedProspectId;
    setSmartleadEmailConversation([]);
    triggerGetSmartleadProspectConvo();
  }, [openedProspectId]);

  // The prospect is no longer loading if we are not fetching any data
  useEffect(() => {
    if (!isFetching && !isFetchingThreads && !isFetchingMessages) {
      setOpenedProspectLoading(false);
    }
  }, [isFetching, isFetchingThreads, isFetchingMessages]);

  const triggerGetBumpFrameworks = async () => {
    if (selectedBumpFramework?.substatus !== prospect?.linkedin_status) {
      setBumpFramework(undefined);
      setOpenBumpFrameworksSubstatus(prospect?.linkedin_status);
    }
    
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

  const getBumpFrameworkSequence = async () => {
    if (!prospect) {
      return;
    }

    const result = await getBumpFrameworksSequence(
      userToken,
      prospect.archetype_id
    );

    if (result.status === "success") {
      setBumpFrameworksSequence(result.data.data);
    }
    
  };

  // // On load we should get the bump frameworks
  // useEffect(() => {
  //   triggerGetBumpFrameworks();
  // }, [])

  let statusValue = data?.details?.linkedin_status || "ACTIVE_CONVO";
  if (
    openedOutboundChannel === "EMAIL" ||
    openedOutboundChannel === "SMARTLEAD"
  ) {
    statusValue = props.currentEmailStatus || "ACTIVE_CONVO";
  }

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
  const navigate = useNavigate();
  if (!openedProspectId || openedProspectId === -1) {
    return (
      <Flex
        direction="column"
        align="left"
        p="sm"
        mt="lg"
        h={`calc(${INBOX_HEIGHT} - 100px)`}
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
    <Flex gap={0} direction="column" wrap="nowrap" h={"100%"}>
      <div style={{ height: HEADER_HEIGHT, position: "relative" }}>
        <></>
        {!props.hideTitle && (
          <Group
            position="apart"
            p={15}
            h={66}
            sx={{ flexWrap: "nowrap" }}
            bg={"white"}
          >
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
        )}

        <Tabs
          variant="outline"
          defaultValue="LINKEDIN"
          radius={theme.radius.md}
          value={openedOutboundChannel}
          styles={(theme) => ({
            root: {
              backgroundColor: "white",
            },
            tabsList: {
              paddingLeft: "0 !important",
              paddingRight: "0 !important",
              // height: HEADER_HEIGHT,
              justifyContent: "space-evenly",
            },
            tabLabel: {
              fontWeight: 500,
            },
            tab: {
              flex: 1,
              paddingLeft: 24,
              paddingRight: 24,
              borderRight: `1px solid ${theme.colors.gray[4]}`,
              borderRadius: 0,
              "&[data-active]": {
                borderLeftWidth: 0,
                borderTopWidth: 0,
                borderBottom: `3px solid ${
                  theme.colors.blue[theme.fn.primaryShade()]
                }`,
              },
              "&:last-of-type": {
                borderRightWidth: 0,
              },
            },
          })}
          onTabChange={(value) => {
            if (value) {
              sendBoxRef.current?.setAiGenerated(false);
              sendBoxRef.current?.setAiMessage("");
              sendBoxRef.current?.setMessageDraft("");
              setOpenedOutboundChannel(value as Channel);
              setOpenedConvoBox(value === "LINKEDIN")

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
            props.onTabChange && props.onTabChange(value as string);
          }}
        >
          <Tabs.List px={20}>
            {props.showBackToInbox && (
              <Tabs.Tab
                value="back_to"
                onClick={() => {
                  navigate("/inbox");
                }}
              >
                <Flex align={"center"}>
                  <ActionIcon color="blue">
                    <IconArrowLeft size={"1rem"} />
                  </ActionIcon>
                  <Flex>
                    <Text>Inbox/</Text>
                    <Text fw={700}>{data?.details.full_name}</Text>
                  </Flex>
                </Flex>
              </Tabs.Tab>
            )}
            {prospect?.li_public_id && (
              <Tabs.Tab
                value="LINKEDIN"
                icon={<IconBrandLinkedin size="0.8rem" />}
              >
                LinkedIn <Badge>{currentConvoLiMessages?.length}</Badge>
              </Tabs.Tab>
            )}
            {prospect?.email && (
              <Tabs.Tab value="EMAIL" icon={<IconMail size="0.8rem" />}>
                Email
              </Tabs.Tab>
            )}
            {smartleadEmailConversation.length > 0 && (
              <Tabs.Tab value="SMARTLEAD" icon={<IconMail size="0.8rem" />}>
                Email - Beta
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
          height: `calc((${INBOX_HEIGHT} - ${HEADER_HEIGHT}px)*1.00)`,
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
          h={`calc((${INBOX_HEIGHT} - ${HEADER_HEIGHT}px)*1.0)`}
          viewportRef={viewport}
          sx={{
            position: "relative",
            paddingBottom: openedOutboundChannel === "LINKEDIN" ? 20 : 0,
            paddingTop: 10,
          }}
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
                  onClick={() => {
                    setEmailThread(undefined);
                    setSelectedThread(undefined);
                  }}
                >
                  Back to Threads
                </Badge>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    padding: "0px 5px",
                  }}
                >
                  <Title order={5}>
                    {_.truncate(emailThread?.subject, { length: 36 })}
                  </Title>
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
                  // isLastMsgInSequent={
                  //   !currentConvoLiMessages[i + 1] ||
                  //   (currentConvoLiMessages[i + 1] &&
                  //     currentConvoLiMessages[i + 1].author !== msg.author)
                  // }
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
                      // isLastMsgInSequent={
                      //   !currentConvoEmailMessages[i + 1] ||
                      //   (currentConvoEmailMessages[i + 1] &&
                      //     currentConvoEmailMessages[i + 1].client_sdr_id !==
                      //       msg.client_sdr_id)
                      // }
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
                          setSelectedThread(thread);
                        }}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {openedOutboundChannel === "SMARTLEAD" && (
              <>
                {smartleadEmailConversation.map((message, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", overflowX: "hidden" }}
                  >
                    <Flex
                      p="sm"
                      justify={message.type === "SENT" ? "end" : "start"}
                      w="100%"
                    >
                      {message?.type !== "SENT" ? (
                        <Avatar
                          mx={"xs"}
                          mt="xs"
                          src={prospect?.img_url}
                          color={valueToColor(theme, prospect?.full_name)}
                          size={"40px"}
                          radius={"100%"}
                        >
                          {nameToInitials(prospect?.full_name)}
                        </Avatar>
                      ) : (
                        <></>
                      )}
                      <Flex
                        direction={"column"}
                        // align={message.type === "SENT" ? "end" : "start"}
                        w="80%"
                      >
                        <Card
                          my="sm"
                          withBorder
                          shadow="sm"
                          radius="md"
                          key={message.id}
                          right={"0px"}
                          style={{
                            maxWidth: "600px",
                            minWidth: "100%",
                          }}
                        >
                          <Card.Section
                            bg={message.type === "SENT" ? "blue" : "#dcdbdd"}
                            p={14}
                            px={20}
                          >
                            <Flex justify="space-between">
                              <Text
                                color={
                                  message.type !== "SENT"
                                    ? "#9a9a9d"
                                    : "#85b3f5"
                                }
                                fw={500}
                              >
                                {message.type == "SENT" ? "To" : "From"}
                                {": "}
                                <span
                                  style={{
                                    color:
                                      message.type === "SENT"
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  {prospect?.full_name}
                                </span>
                              </Text>
                              <Flex gap={30} align="center">
                                <Text
                                  color={
                                    message.type !== "SENT"
                                      ? "#9a9a9d"
                                      : "#85b3f5"
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  <IconArrowBackUp size={20} /> Reply
                                </Text>
                                <Text
                                  color={
                                    message.type !== "SENT"
                                      ? "#9a9a9d"
                                      : "#85b3f5"
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  <IconArrowForwardUp size={20} /> Forward
                                </Text>
                              </Flex>
                            </Flex>
                          </Card.Section>
                          <Card.Section px={24} py={20}>
                            {message.subject && (
                              <>
                                <Text color="gray" fw={500}>
                                  Subject:{" "}
                                  <span style={{ color: "black" }}>
                                    {message.subject || "..."}
                                  </span>
                                </Text>
                                <Divider mt={10} />
                              </>
                            )}
                            <Text
                              fz="md"
                              color="black"
                              style={{
                                display: "flex",
                                // alignItems: "end",
                                flexDirection: "column",
                              }}
                            >
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    message.email_body
                                  ),
                                }}
                                className={`${
                                  conversationdetail[index]
                                    ? ""
                                    : "line-clamp-4"
                                }`}
                              />
                              <Button
                                onClick={() => {
                                  const newState = [...conversationdetail];
                                  newState[index] = !newState[index];
                                  setConversationDetail(newState);
                                }}
                                // rightIcon={<IconArrowDown />}
                                bg="#dcdbdd"
                                radius="xl"
                                mt="sm"
                                size="xs"
                                w="100px"
                              >
                                {conversationdetail[index]
                                  ? "Less more"
                                  : "Read more"}
                              </Button>
                            </Text>
                          </Card.Section>
                        </Card>
                        <Text
                          align={message?.type === "SENT" ? "end" : "start"}
                          color="#9a9a9d"
                          size={12}
                        >
                          {handleConvertDate(message.time)}
                        </Text>
                      </Flex>
                      {message?.type !== "SENT" ? (
                        <></>
                      ) : (
                        <Avatar
                          mt="xs"
                          mx="xs"
                          src={userData.img_url}
                          color={valueToColor(theme, prospect?.full_name)}
                          size={"40px"}
                          radius={"100%"}
                        >
                          {nameToInitials(prospect?.full_name)}
                        </Avatar>
                      )}
                    </Flex>
                  </Box>
                ))}
                <RichTextArea
                  onChange={(value, rawValue) => {
                    messageDraftRichRaw.current = rawValue;
                    messageDraftEmail.current = value;
                  }}
                  value={messageDraftRichRaw.current}
                  height={200}
                />
                <Flex justify="flex-end" mt="md">
                  <Button
                    color="blue"
                    disabled={sendingMessage}
                    loading={sendingMessage}
                    leftIcon={<IconClock />}
                    onClick={() => {
                      triggerPostSmartleadReply();
                    }}
                  >
                    Send and Snooze
                  </Button>
                </Flex>
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
                width: "100%",
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
                bottom: 0,
                right: 0,
                visibility: openedConvoBox ? "hidden" : "visible",
                width: "100%",
              }}
            >
              <Button
                size="xs"
                w={"100%"}
                color="dark"
                sx={{
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
                rightIcon={<IconChevronUp size="1rem" />}
                onClick={() => {
                  setOpenedConvoBox(true);
                }}
                styles={{
                  inner: {
                    justifyContent: "space-between",
                  },
                }}
              >
                {/* Send Message
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
                )} */}

                <Flex wrap="nowrap" align="center">
                  <Text color="white" fz={14} fw={500}>
                    {openedOutboundChannel === "LINKEDIN"
                      ? "Message via LinkedIn "
                      : "Reply via Email "}
                  </Text>
                  <Text
                    size="xs"
                    fs="italic"
                    color="gray.3"
                    ml="xs"
                    component="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={
                      openedOutboundChannel === "LINKEDIN"
                        ? `https://www.linkedin.com/in/${linkedin_public_id}`
                        : `mailto:${prospect?.email || ""}`
                    }
                  >
                    {openedOutboundChannel === "LINKEDIN"
                      ? `linkedin.com/in/${_.truncate(linkedin_public_id, {
                          length: 20,
                        })}`
                      : prospect?.email || ""}{" "}
                    <IconExternalLink size="0.65rem" />
                  </Text>
                </Flex>
              </Button>
            </Box>
          </>
        )}
      </div>
      {prospect && (
        <InboxProspectConvoBumpFramework
          prospect={prospect}
          bumpFrameworksSequence={bumpFrameworksSequence}
          messages={currentConvoLiMessages || []}
          onClose={() => {
            triggerGetBumpFrameworks();
          }}
          onPopulateBumpFrameworks={(buckets) => {
            if (
              buckets.ACCEPTED.total > 0 ||
              Object.values(buckets.BUMPED).find((d) => d.total > 0) ||
              buckets.ACTIVE_CONVO.total > 0
            ) {
              setStepThreeComplete("COMPLETE");
            }
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
                currentProject?.id || props.prospect.archetype_id || -1,
                props.prospect.email_status,
                props.prospect.overall_status,
                props.prospect.email,
                userData.sdr_email,
                "",
                "",
                ""
              );
            }}
          >
            <IconEdit size="1.125rem" />
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
          position: "relative",
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
            position: "absolute",
            top: 5,
            right: 5,
          }}
          weight={400}
          size={8}
          c="dimmed"
        >
          {convertDateToCasualTime(
            new Date(props.thread.last_message_timestamp)
          )}
        </Text>
      </Box>
      <Divider m={0} />
    </Box>
  );
}
