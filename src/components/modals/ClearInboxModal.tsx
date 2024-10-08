import { openedProspectIdState } from "@atoms/inboxAtoms";
import { userTokenState } from "@atoms/userAtoms";
import InboxProspectDetails, { StatusBlockButton } from "@common/inbox/InboxProspectDetails";
import { InboxClearingData } from "@common/inbox/InboxProspectListRestruct";
import { labelizeConvoSubstatus } from "@common/inbox/utils";
import ProspectDemoDateSelector from "@common/prospectDetails/ProspectDemoDateSelector";
import { updateChannelStatus } from "@common/prospectDetails/ProspectDetailsChangeStatus";
import { API_URL } from "@constants/data";
import { cu } from "@fullcalendar/core/internal-common";
import { Accordion, ActionIcon, Avatar, Badge, Box, Button, Center, createStyles, Divider, Flex, Loader, Modal, Paper, Popover, Radio, rem, ScrollArea, SegmentedControl, SimpleGrid, Stack, Tabs, TabsValue, Text, Textarea, TextInput, useMantineTheme } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { closeAllModals, ContextModalProps, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAlarm, IconArrowLeft, IconArrowRight, IconArrowsUp, IconBrandLinkedin, IconBriefcase, IconCalendarEvent, IconDoorExit, IconMail, IconSend, IconTrash, IconX } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { QueryClient, useQuery } from "@tanstack/react-query";
import displayNotification from "@utils/notificationFlow";
import { getProspectByID } from "@utils/requests/getProspectByID";
import postSmartleadReply from "@utils/requests/postSmartleadReply";
import { sendLinkedInMessage } from "@utils/requests/sendMessage";
import { setDemoSetProspect } from "@utils/requests/setDemoSetProspect";
import { snoozeProspect, snoozeProspectEmail } from "@utils/requests/snoozeProspect";
import { update } from "lodash";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Channel, ProspectDetails } from "src";

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },

  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: 40,
    gap: rem(4),
    width: "100%",
    backgroundColor: theme.white,
    border: `solid 1px ${theme.colors.gray[4]}`,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "scale(1.05)",
    },
  },
}));

export default function ClearInboxModal({ inboxClearingData, setInboxClearingData }: { inboxClearingData: InboxClearingData[], setInboxClearingData: React.Dispatch<React.SetStateAction<InboxClearingData[]>> }) {

  const [selectedNum, setSelectedNum] = useState(0);
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [showSendWidget, setShowSendWidget] = useState(true);
  const [tabValue, setTabValue] = useState<TabsValue>("linkedin");
  const [aiGeneratedMessage, setAiGeneratedMessage] = useState("Looking forward to our discussion on revival strategies on Tuesday at 3 PM EST! Let me know if you have any questions beforehand.");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [demoSetType, setDemoSetType] = useState("DIRECT");
  const [openedSnoozeModal, setOpenedSnoozeModal] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [openedDemoSetPopover, setOpenedDemoSetPopover] = useState(false);
  const [openedNotInterestedPopover, setOpenedNotInterestedPopover] = useState(false);
  const [openedNotQualifiedPopover, setOpenedNotQualifiedPopover] = useState(false);
  const [loadingNotInterested, setLoadingNotInterested] = useState(false);
  const [loadingNotQualified, setLoadingNotQualified] = useState(false);
  const [notInterestedDisqualificationReason, setNotInterestedDisqualificationReason] = useState<string | null>(null);
  const [notQualifiedDisqualificationReason, setNotQualifiedDisqualificationReason] = useState<string | null>(null);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );
  
  const [handoffText, setHandoffText] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [overview, setOverview] = useState("");
  const [loadingAiGeneratedMessage, setLoadingAiGeneratedMessage] = useState(false);

  const { data: prospectDetails } = useQuery({
    queryKey: [
      `query-get-dashboard-prospect-${openedProspectId}`,
      { openedProspectId },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { openedProspectId }] = queryKey;

      const response = await getProspectByID(userToken, openedProspectId);
      return response.status === "success"
        ? (response.data as ProspectDetails)
        : undefined;
    },
    enabled: openedProspectId !== -1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
    getSuggestedMessageAndAction(inboxClearingData[selectedNum]);
    setOpenedProspectId(inboxClearingData[selectedNum].prospect_info.id);
  }, [selectedNum, tabValue]);

  const queryClient = new QueryClient();

  const sendMessage = async () => {
    setLoadingAiGeneratedMessage(true);

    // Delete the auto bump message if it exists
    // await deleteAutoBumpMessage(userToken, props.prospectId);

    const prospectId = inboxClearingData[selectedNum].prospect_info.id;

    // Hack to update the prospect list to temp show they're in purgatory
    // setTempHiddenProspects(tempHiddenProspects.concat([props.prospectId]));

    if (tabValue === "linkedin") {
      const msg = aiGeneratedMessage;
      // setMessageDraft("");
      // showNotification({
      //   id: "send-linkedin-message",
      //   title: scheduleDay ? "Scheduling message..." : "Sending message ...",
      //   message: "Message is sending. Do not refresh the page.",
      //   color: "blue",
      //   autoClose: 7000,
      // });
      // setTimeout(() => setFetchingProspectId(-1), 15000);

      sendLinkedInMessage(
        userToken,
        prospectId,
        msg,//message
        true, //ai generated
        true, // purgatory
        undefined, // bump_framework_id
        undefined, // bump_framework_title
        undefined, // bump_framework_description
        undefined, // bump_framework_length
        undefined, // account_research_points
        moment().add(3, 'days').toDate(), // purgatory_date
        new Date() // scheduled_send_date
      ).then(() => {
        queryClient.refetchQueries({
          queryKey: [`query-get-dashboard-prospect-${prospectId}-convo-${tabValue.toUpperCase()}`],
        });
      });
      if (true) {
        // let yourMessage = _.cloneDeep(currentConvoLiMessages || [])
        //   .reverse()
        //   .find((msg) => msg.connection_degree === "You");
        if (false) {
          // yourMessage.message = msg;
          // yourMessage.date = new Date().toUTCString();
          // yourMessage.ai_generated = false;
          // yourMessage.is_sending = true;
          // setCurrentConvoLiMessages([
          //   ...(currentConvoLiMessages || []),
          //   yourMessage,
          // ]);
        } else {
          queryClient.refetchQueries({
            queryKey: [`query-get-dashboard-prospect-${prospectId}-convo-${tabValue.toUpperCase()}`],
          });
          queryClient.refetchQueries({
            queryKey: ["query-prospects-list"],
          });
        }
        // showNotification({
        //   id: "send-linkedin-message-complete",
        //   title: scheduleDay ? "Message Scheduled" : "Message Sent",
        //   message: "",
        //   color: "green",
        // });
      } else {
        showNotification({
          id: "send-linkedin-message-error",
          title: "Error",
          message: "Failed to send message. Please try again later.",
          color: "red",
          autoClose: false,
        });
      }
    } else if (tabValue === "email") {
      const prospectid = inboxClearingData[selectedNum].prospect_info.id;
      const response = await postSmartleadReply(
        userToken, // User authentication token
        prospectid, // ID of the prospect
        aiGeneratedMessage, // The body of the email
        new Date(), // Scheduled send date
        [], // CC email addresses
        [] // BCC email addresses
      );

      queryClient.refetchQueries({
        queryKey: [`query-get-dashboard-prospect-${prospectId}-convo-${'SMARTLEAD'}`],
      });

      // if (props?.triggerGetSmartleadProspectConvo) {
      //   props?.triggerGetSmartleadProspectConvo();
      // }
      // setScheduleDay(undefined);
    } 

    // setTimeout(() => {
    //   if (scheduledMessageRef.current) {
    //     (scheduledMessageRef.current as any).refreshScheduledMessages();
    //   }
    // }, 200);

    

    // setMsgLoading(false);
    // setAiGenerated(false);
    // setTimeout(() => props.scrollToBottom && props.scrollToBottom(), 100);
    markProspectAsRevival(prospectId);

    queryClient.refetchQueries({
      queryKey: ["query-prospects-list"],
    });


    setLoadingAiGeneratedMessage(false);
  };

  const changeStatus = async (
    status: string,
    changeProspect?: boolean,
    disqualification_reason?: string | null
  ) => {
    if (
      tabValue === 'email'
    ) {
      // HARD CODE IN THE EMAIL FOR NOW
      const response = await updateChannelStatus(
        inboxClearingData[selectedNum].prospect_info.id,
        userToken,
        "EMAIL",
        status,
        false,
        false,
        disqualification_reason
      );
      if (response.status !== "success") {
        showNotification({
          title: "Error",
          message: "There was an error changing the status",
          color: "red",
          autoClose: 5000,
        });
        return;
      } else {
        const formatted_status = status
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, function (c) {
            return c.toUpperCase();
          });
        showNotification({
          title: "Status changed",
          message: `Prospect's status has been changed to ${formatted_status}`,
          color: "green",
          autoClose: 5000,
        });
      }
      // if (props.refetchSmartleadProspects) {
      //   props.refetchSmartleadProspects();
      // }
    } else {
      await updateChannelStatus(
        inboxClearingData[selectedNum].prospect_info.id,
        userToken,
        (tabValue?.toUpperCase() || 'LINKEDIN') as Channel,
        status,
        false,
        false,
        disqualification_reason
      );
    }

    // refetchState();
    // if (changeProspect) {
    //   setOpenedProspectId(-1);
    // }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [inboxClearingData[selectedNum].email.length, inboxClearingData[selectedNum].linkedin.length]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [selectedNum, tabValue]);

  const markProspectAsRevival = async (prospectId: number) => {
    const response = await updateChannelStatus(
      prospectId,
      userToken,
      tabValue === "email" ? "EMAIL" : "LINKEDIN",
      "ACTIVE_CONVO_REVIVAL",
      true,
      false,
      null
    );

    if (response.status !== "success") {
      showNotification({
        title: "Error",
        message: "There was an error marking the prospect as revival",
        color: "red",
        autoClose: 5000,
      });
      return;
    } else {
      showNotification({
        title: "Prospect has been snoozed for 3 days.",
        message: `Next steps: revival / wait for response `,
        color: "green",
        autoClose: 5000,
      });
    }
  }

  const getSuggestedMessageAndAction = async (inboxClearingData: InboxClearingData) => {
    setLoadingAiGeneratedMessage(true);
    try {
      const response = await fetch(`${API_URL}/sight_inbox/suggestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ prospect_info: inboxClearingData, tabType: tabValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();

      setRecommendedAction(data.data.recommended_action);
      setAiGeneratedMessage(data.data.recommended_message);
      setOverview(data.data.overview);
      
    } catch (error) {
      console.error("Error fetching suggested message and action:", error);
    } finally {
      setLoadingAiGeneratedMessage(false);
    }
  }



  

  const handleSendMessage = () => {

    sendMessage();

    setShowSendWidget(false);

    setInboxClearingData((prevData: InboxClearingData[]) => {
      const updatedData = [...prevData];
      const updatedProspect = { ...updatedData[selectedNum] };

      if (tabValue === "email") {
        updatedProspect.email = [
          ...updatedProspect.email,
          {
            message: aiGeneratedMessage,
            sender: "me",
            time_sent: new Date().toISOString(),
          },
        ];
      } else if (tabValue === "linkedin") {
        updatedProspect.linkedin = [
          ...updatedProspect.linkedin,
          {
            message: aiGeneratedMessage,
            sender: "me",
            time_sent: new Date().toISOString(),
          },
        ];
      }

      updatedProspect.prospect_info = {
        ...updatedProspect.prospect_info,
        status: "REPLY",
      };
      updatedData[selectedNum].cleared = true;
      updatedData[selectedNum] = updatedProspect;
      return updatedData;
    });
  };

  return (
    <Paper>
      <Modal
          opened={openedSnoozeModal}
          onClose={() => setOpenedSnoozeModal(false)}
          title="Snooze Prospect"
        >
          <Center>
            <DatePicker
              minDate={new Date()}
              onChange={async (date) => {
                if (!date) {
                  return;
                }
                let timeDiff = date.getTime() - new Date().getTime();
                let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                if (true) {
                  await displayNotification(
                    "snooze-prospect-email",
                    async () => {
                      let result = await snoozeProspectEmail(
                        userToken,
                        inboxClearingData[selectedNum].prospect_info.id,
                        daysDiff
                      );
                      return result;
                    },
                    {
                      title: `Snoozing prospect for ${daysDiff} days...`,
                      message: `Working with servers...`,
                      color: "teal",
                    },
                    {
                      title: `Snoozed!`,
                      message: `Your prospect has been snoozed from outreach for ${daysDiff} days.`,
                      color: "green",
                    },
                    {
                      title: `Error while snoozing your prospect.`,
                      message: `Please try again later.`,
                      color: "red",
                    }
                  );
                  setOpenedSnoozeModal(false);
                  // if (!props.noProspectResetting) {
                  //   setOpenedProspectId(-1);
                  // }
                  // if (props.refetchSmartleadProspects) {
                  //   props.refetchSmartleadProspects();
                  // }

                  // refetchState();
                  return;
                }

                await displayNotification(
                  "snooze-prospect",
                  async () => {
                    let result = await snoozeProspect(
                      userToken,
                      inboxClearingData[selectedNum].prospect_info.id,
                      daysDiff
                    );
                    return result;
                  },
                  {
                    title: `Snoozing prospect for ${daysDiff} days...`,
                    message: `Working with servers...`,
                    color: "teal",
                  },
                  {
                    title: `Snoozed!`,
                    message: `Your prospect has been snoozed from outreach for ${daysDiff} days.`,
                    color: "teal",
                  },
                  {
                    title: `Error while snoozing your prospect.`,
                    message: `Please try again later.`,
                    color: "red",
                  }
                );
                setOpenedSnoozeModal(false);
                // if (!props.noProspectResetting) {
                //   setOpenedProspectId(-1);
                // }
                // queryClient.refetchQueries({
                //   queryKey: [`query-dash-get-prospects`],
                // });
                // queryClient.refetchQueries({
                //   queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
                // });
                // location.reload();
                // refetchState();
              }}
            />
          </Center>
        </Modal>
      <Paper p={"sm"} withBorder radius={"sm"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} justify={"flex-start"} w={"30%"}>
            <Text fw={500}>
              Inbox Status
            </Text>
            <Badge ml="sm" color="blue" variant="light">
              {inboxClearingData[selectedNum].prospect_info.status}
            </Badge>
          </Flex>
          <Flex align={"center"} gap={4} w={"70%"}>
            {inboxClearingData.map((item, index) => {
              return (
                <div
                  style={{
                    backgroundColor: item.prospect_info.status === 'REPLY' ? "#228be6" : "#ebf1fd",
                    width: `${100 / inboxClearingData.length}%`,
                    height: "8px",
                    border: index === selectedNum ? "2px solid lightgreen" : "none" // Add border around the current selectedNum
                  }}
                  key={index}
                  className="rounded-sm"
                ></div>
              );
            })}
            <div className="ml-2">
              <Badge
                color={inboxClearingData.length === inboxClearingData.filter((item) => item.prospect_info.status === 'REPLY').length ? "green" : "gray"}
                variant={inboxClearingData.length === inboxClearingData.filter((item) => item.prospect_info.status === 'REPLY').length ? "filled" : "outline"}
              >
                {inboxClearingData.filter((item) => item.prospect_info.status === 'REPLY').length > 0
                  ? `${Math.floor((inboxClearingData.filter((item) => item.prospect_info.status === 'REPLY').length / inboxClearingData.length) * 100)}% Cleared`
                  : "0% cleared"}
              </Badge>
            </div>
          </Flex>
        </Flex>
      </Paper>
      <Flex gap={"md"} mt={"md"}>
        <Paper withBorder radius={"sm"} p={"sm"} w={"65%"} h={585}>
          <Flex align={"center"} justify={"space-between"}>
            <Box w={"100%"} mt={8}>
              <Flex align={"center"} gap={"sm"}>
                <Box
                  sx={(theme) => ({
                    backgroundColor: theme.colors.blue[0],
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                  })}
                >
                  <Text size={"sm"}>👤 {inboxClearingData[selectedNum].prospect_info.client_sdr_name}</Text>
                </Box>
              </Flex>
              <Divider size="sm" mt={4} />
            </Box>
            <Flex align={"center"} gap={"sm"} w={275}>
              <Tabs defaultValue="linkedin" w={"100%"} onTabChange={(value) => setTabValue(value)}>
                <Tabs.List>
                  <Tabs.Tab disabled={!inboxClearingData[selectedNum].linkedin.length} value="linkedin" icon={<IconBrandLinkedin size="0.8rem" />}>
                    Linkedin
                  </Tabs.Tab>
                  <Tabs.Tab disabled={!inboxClearingData[selectedNum].email.length} value="email" icon={<IconMail size="0.8rem" />}>
                    Email
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="gallery" pt="xs">
                  Gallery tab content
                </Tabs.Panel>

                <Tabs.Panel value="messages" pt="xs">
                  Messages tab content
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="xs">
                  Settings tab content
                </Tabs.Panel>
              </Tabs>
            </Flex>
          </Flex>
          <div className="relative" style={{ height: inboxClearingData[selectedNum].prospect_info.status === "ACTIVE_CONVO_REVIVAL" ? 525 : 520 }}>
            <ScrollArea viewportRef={scrollAreaRef} h={"100%"} style={{ paddingBottom: inboxClearingData[selectedNum].prospect_info.status === "ACTIVE_CONVO_REVIVAL" ? 100 : 0 }}>
              {(tabValue === "linkedin" ? inboxClearingData[selectedNum].linkedin : inboxClearingData[selectedNum].email).map((item, index) => {
                return (
                  <div className={`w-full flex flex-col items-end mt-4 relative`}>
                    {item.sender === 'you' ? (
                      <Flex direction={"column"} w={"100%"}>
                        <Flex align={"start"} gap={"sm"}>
                          <Avatar src={inboxClearingData[selectedNum].prospect_info.avatar} size={"md"} radius={"xl"} />
                          <Paper withBorder radius={"sm"} p={"md"} w={"100%"}>
                            <Text size={"sm"}>{item.message}</Text>
                          </Paper>
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex direction={"column"} mt={"xs"} w={"91%"} align={"flex-end"}>
                        <Flex align={"start"} gap={"sm"}>
                          <Paper withBorder radius={"lg"} p={"md"} bg={"blue"} className="rounded-br-none">
                            <Text size={"sm"} color="white">
                              {item.message}
                            </Text>
                          </Paper>
                        </Flex>
                        <Text size={"xs"} fw={500} color="gray" mt={"xs"}>
                          <Text size={"xs"} fw={500} color="gray" mt={"xs"}>
                            {new Date(item.time_sent).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}
                          </Text>
                        </Text>
                      </Flex>
                    )}
                  </div>
                );
              })}
            </ScrollArea>
            {!loadingAiGeneratedMessage &&  showSendWidget && !inboxClearingData[selectedNum].cleared && (
              <Box className="absolute w-full bottom-0">
                <Paper
                  withBorder
                  radius={"md"}
                  ml={-1}
                  py={3}
                  px={"xs"}
                  w={"fit-content"}
                  bg={"grape"}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                >
                  <Flex align={"center"} gap={"4px"}>
                    <IconSparkles size={"0.8rem"} fill="white" color="white" />
                    <Text size={"xs"} color="white">
                      AI Generated
                    </Text>
                  </Flex>
                </Paper>
                <Textarea
                  placeholder="Type your message here..."
                  value={aiGeneratedMessage}
                  defaultValue={
                    "Looking forward to our discussion on revival strategies on Tuesday at 3 PM EST! Let me know if you have any questions beforehand."
                  }
                  onChange={(event) => setAiGeneratedMessage(event.currentTarget.value)}
                  minRows={3} // Increased minRows to make the textarea larger
                  mt={-2}
                  styles={{
                    input: {
                      borderColor: "#be4bdb",
                      background: "#f7f8fa",
                    },
                  }}
                />
                <Button
                  variant="filled"
                  size="xs"
                  color="grape"
                  style={{ position: "absolute", bottom: "10px", right: "10px" }}
                  rightIcon={<IconSend size="1rem" />}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </Box>
            )} {
              loadingAiGeneratedMessage && (
                <Box className="absolute w-full bottom-0 flex justify-center items-center" style={{ height: '100px' }}>
                  <Loader />
                </Box>
              )
            }
          </div>
        </Paper>
        <Stack w={"40%"}>
          <Paper withBorder radius={"sm"} p={"sm"}>
            <Flex align={"center"} justify={"space-between"}>
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => {
                  if (selectedNum > 0) setSelectedNum((item) => item - 1); setShowSendWidget(true);
                }}
                disabled={selectedNum <= 0}
                w={46}
              >
                <IconArrowLeft size={"1rem"} />
              </ActionIcon>
              <Text size={"sm"} fw={500}>
                {selectedNum + 1} / {inboxClearingData.length}
              </Text>
              <ActionIcon
                variant="filled"
                color="blue"
                w={46}
                onClick={() => {
                  if (selectedNum < inboxClearingData.length - 1) setSelectedNum((item) => item + 1); setShowSendWidget(true);
                }}
                disabled={selectedNum >= inboxClearingData.length - 1}
              >
                <IconArrowRight size={"1rem"} />
              </ActionIcon>
            </Flex>
            <Badge size="xs" color="gray" variant="outline">
                      Previously:{" "}
                      {prospectDetails?.details?.previous_status
                        ?.replaceAll("ACTIVE_CONVO_", "")
                        .replaceAll("_", " ")}
                    </Badge>
            <ScrollArea style={{ height: '500px' }}>
              <InboxProspectDetails />
            </ScrollArea>
          </Paper>
    
        </Stack>
      </Flex>
    </Paper>
  );
}
