import { userTokenState } from "@atoms/userAtoms";
import { StatusBlockButton } from "@common/inbox/InboxProspectDetails";
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
import displayNotification from "@utils/notificationFlow";
import { setDemoSetProspect } from "@utils/requests/setDemoSetProspect";
import { snoozeProspect, snoozeProspectEmail } from "@utils/requests/snoozeProspect";
import { update } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { Channel } from "src";

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
  
  const [handoffText, setHandoffText] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [overview, setOverview] = useState("");
  const [loadingAiGeneratedMessage, setLoadingAiGeneratedMessage] = useState(false);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
    getSuggestedMessageAndAction(inboxClearingData[selectedNum]);
  }, [selectedNum, tabValue]);

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
          <Text fw={500} w={"30%"}>
            Inbox Status
          </Text>
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
              <Text fw={500} size={"sm"}>
                Chat Preview
              </Text>
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
            {!loadingAiGeneratedMessage &&  inboxClearingData[selectedNum].prospect_info.status === "ACTIVE_CONVO_REVIVAL" && showSendWidget && !inboxClearingData[selectedNum].cleared && (
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
        <Stack w={"35%"}>
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
            <Flex align={"center"} gap={"sm"} mt={"sm"}>
              <Avatar src={inboxClearingData[selectedNum].prospect_info.avatar} size={"md"} radius={"xl"} />
              <Stack spacing={0}>
                <Text>{inboxClearingData[selectedNum].prospect_info.name}</Text>
                <Flex align={"center"} gap={"xs"}>
                  <IconBriefcase size={"1rem"} color="gray" />
                  <Text size={"sm"} color="gray" fw={500}>
                    {inboxClearingData[selectedNum].prospect_info.title}, {inboxClearingData[selectedNum].prospect_info.company}
                  </Text>
                </Flex>
              </Stack>
            </Flex>
          </Paper>
          <Paper withBorder radius={"sm"} p={"sm"} h={"100%"}>
            <Stack>
              <Text size={"md"} fw={600}>
                AI Recommendation
              </Text>
              <Divider />
              <Text fw={600}>Chat Overview:</Text>
              {loadingAiGeneratedMessage ? (
                <Loader size="sm" />
              ) : (
                <Text fw={500} color="gray" size={"sm"}>
                  {overview}
                </Text>
              )}
              <Text fw={500}>Recommended Action:</Text>
              <Button color="grape" leftIcon={<IconSend size={"1rem"} />}>
                {recommendedAction}
              </Button>
              {/* <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  if (selectedNum < inboxClearingData.length - 1) setSelectedNum((item) => item + 1);
                }}
              >
                Snooze
              </Button> */}
              <Box style={{ flexBasis: "15%" }} p={10} px={"md"}>
              <Accordion
                disableChevronRotation
                chevron={
                  <Badge size="md" color={"blue"}>
                    {labelizeConvoSubstatus(
                      inboxClearingData[selectedNum].prospect_info.status,
                      (tabValue !== null && tabValue !== undefined && (inboxClearingData[selectedNum] as any)?.[tabValue]?.length) ?? 0
                    )}
                  </Badge>
                }
                defaultValue="customization"
                styles={(theme) => ({
                  content: {
                    padding: 0,
                    "&[data-active]": {
                      backgroundColor: "transparent",
                    },
                  },
                  chevron: {
                    margin: 0,
                    width: "auto",
                  },
                  label: {
                    fontSize: theme.fontSizes.sm,

                    padding: 0,
                  },
                  item: {
                    border: "0px",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  },
                  panel: {
                    paddingTop: "8px",
                  },
                  control: {
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                    padding: `0 !important`,
                    backgroundColor: "transparent",
                    paddingLeft: theme.spacing.sm,
                    paddingRight: theme.spacing.sm,
                  },
                })}
              >
                <Accordion.Item value="customization">
                  <Accordion.Control>
                    <Flex gap={5} align="end" wrap="nowrap">
                      <Text fw={700} fz={"sm"}>
                        Lead Status:
                      </Text>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {!inboxClearingData[selectedNum].prospect_info.status.startsWith("DEMO_") ? (
                      // <Flex direction={"column"} gap={"md"}>
                      <SimpleGrid cols={2}>
                        <StatusBlockButton
                          title="Snooze"
                          icon={
                            <IconAlarm
                              color={theme.colors.yellow[6]}
                              size={24}
                            />
                          }
                          onClick={async () => {
                            setOpenedSnoozeModal(true);
                          }}
                        />
                        <Box>
                          <StatusBlockButton
                            title="Demo Set"
                            icon={
                              <IconCalendarEvent
                                color={theme.colors.green[6]}
                                size={24}
                              />
                            }
                            onClick={async () => {
                              setDemoSetType("DIRECT");
                              // if (!prospect) return;

                              await setDemoSetProspect(
                                userToken,
                                inboxClearingData[selectedNum].prospect_info.id,
                                "DIRECT",
                                handoffText
                              );
                              changeStatus("DEMO_SET", false);
                            }}
                          />
                        </Box>
                        {/* <Popover
                          width={250}
                          position="bottom"
                          withArrow
                          shadow="md"
                          opened={openedDemoSetPopover}
                          onChange={(opened) => {
                            setOpenedDemoSetPopover(opened);
                          }}
                        >
                          <Popover.Target>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Stack spacing={10}>
                              <Title order={5}>Select Demo Set Type</Title>
                              <Divider />
                              <Radio
                                checked={demoSetType === "DIRECT"}
                                onChange={() => {
                                  setDemoSetType("DIRECT");
                                }}
                                label="Set Directly"
                              />
                              <Divider />
                              <Radio
                                checked={demoSetType === "HANDOFF"}
                                onChange={() => {
                                  setDemoSetType("HANDOFF");
                                }}
                                label="Lead Handoff"
                              />
                              {demoSetType === "HANDOFF" && (
                                <Textarea
                                  placeholder="Describe what happened..."
                                  value={handoffText}
                                  onChange={(event) => {
                                    setHandoffText(event.currentTarget.value);
                                  }}
                                />
                              )}
                              <Button
                                variant="filled"
                                onClick={async () => {
                                  if (!prospect) return;
                                  await setDemoSetProspect(
                                    userToken,
                                    prospect.id,
                                    demoSetType,
                                    handoffText
                                  );
                                  if (demoSetType === "HANDOFF") {
                                    await changeStatus("DEMO_SET", false);
                                    await changeStatus("DEMO_WON", false);
                                  } else {
                                    await changeStatus("DEMO_SET", false);
                                  }

                                  setOpenedDemoSetPopover(false);
                                }}
                              >
                                Set Status
                              </Button>
                            </Stack>
                          </Popover.Dropdown>
                        </Popover> */}
                        <Popover
                          opened={openedNotInterestedPopover}
                          width={430}
                          position="bottom"
                          arrowSize={12}
                          withArrow
                          shadow="md"
                          onChange={(opened) => {
                            setOpenedNotInterestedPopover(opened);
                          }}
                        >
                          <Popover.Target>
                            <Button
                              loading={loadingNotInterested}
                              variant="outlined"
                              className={classes.item}
                              leftIcon={
                                <IconX color={theme.colors.red[6]} size={24} />
                              }
                              onClick={() => {
                                setOpenedNotInterestedPopover(true);
                              }}
                            >
                              Not Interested
                            </Button>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Flex direction={"column"} gap={"md"}>
                              <Text size="sm" fw={600}>
                                Select reason for disinterest:
                              </Text>
                              <Radio.Group
                                withAsterisk
                                onChange={(value) => {
                                  setNotInterestedDisqualificationReason(value);
                                }}
                              >
                                <Flex direction={"column"} gap={"sm"}>
                                  <Radio
                                    value="No Need"
                                    label="No Need"
                                    size="xs"
                                    checked={
                                      notInterestedDisqualificationReason ===
                                      "No Need"
                                    }
                                  />
                                  <Radio
                                    value="Unconvinced"
                                    label="Unconvinced"
                                    size="xs"
                                    checked={
                                      notInterestedDisqualificationReason ===
                                      "Unconvinced"
                                    }
                                  />
                                  <Radio
                                    value="Timing not right"
                                    label="Timing not right"
                                    size="xs"
                                    checked={
                                      notInterestedDisqualificationReason ===
                                      "Timing not right"
                                    }
                                  />
                                  <Radio
                                    value="Unresponsive"
                                    label="Unresponsive"
                                    size="xs"
                                    checked={
                                      notInterestedDisqualificationReason ===
                                      "Unresponsive"
                                    }
                                  />
                                  <Radio
                                    value="Using a competitor"
                                    label="Using a competitor"
                                    size="xs"
                                    checked={
                                      notInterestedDisqualificationReason ===
                                      "Competitor"
                                    }
                                  />
                                  <Radio
                                    value="Unsubscribe"
                                    label="Unsubscribe"
                                    size="xs"
                                    checked={
                                      notInterestedDisqualificationReason ===
                                      "Unsubscribe"
                                    }
                                  />
                                  <Radio
                                    value="OTHER -"
                                    label="Other"
                                    size="xs"
                                    checked={notInterestedDisqualificationReason?.includes(
                                      "OTHER -"
                                    ) ?? false}
                                  />
                                </Flex>
                              </Radio.Group>
                              {notInterestedDisqualificationReason?.includes(
                                "OTHER"
                              ) && (
                                <TextInput
                                  placeholder="Enter reason here"
                                  radius={"md"}
                                  onChange={(event) => {
                                    setNotInterestedDisqualificationReason(
                                      "OTHER - " + event.currentTarget.value
                                    );
                                  }}
                                />
                              )}

                              <Button
                                color={
                                  notInterestedDisqualificationReason
                                    ? "red"
                                    : "gray"
                                }
                                leftIcon={<IconTrash size={24} />}
                                radius={"md"}
                                onClick={async () => {
                                  setLoadingNotInterested(true);
                                  setOpenedNotInterestedPopover(false);
                                  await changeStatus(
                                    "NOT_INTERESTED",
                                    true,
                                    notInterestedDisqualificationReason
                                  );
                                  setLoadingNotInterested(false);
                                }}
                              >
                                Mark Not Interested
                              </Button>
                            </Flex>
                          </Popover.Dropdown>
                        </Popover>
                        <Popover
                          opened={openedNotQualifiedPopover}
                          width={430}
                          position="bottom"
                          arrowSize={12}
                          withArrow
                          shadow="md"
                          onChange={(opened) => {
                            setOpenedNotQualifiedPopover(opened);
                          }}
                        >
                          <Popover.Target>
                            <Button
                              loading={loadingNotQualified}
                              variant="outlined"
                              className={classes.item}
                              leftIcon={
                                <IconTrash
                                  color={theme.colors.red[6]}
                                  size={24}
                                />
                              }
                              onClick={() => {
                                setOpenedNotQualifiedPopover(true);
                              }}
                            >
                              Not Qualified
                            </Button>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Flex direction={"column"} gap={"md"}>
                              <Text size="sm" fw={600}>
                                Select reason for disqualification:
                              </Text>
                              <Radio.Group
                                withAsterisk
                                onChange={(value) => {
                                  setNotQualifiedDisqualificationReason(value);
                                }}
                              >
                                <Flex direction={"column"} gap={"sm"}>
                                  <Radio
                                    value="Not a decision maker."
                                    label="Not a decision maker"
                                    size="xs"
                                  />
                                  <Radio
                                    value="Poor account fit"
                                    label="Poor account fit"
                                    size="xs"
                                  />
                                  <Radio
                                    value='Contact is "open to work"'
                                    label='Contact is "open to work"'
                                    size="xs"
                                  />
                                  <Radio
                                    value="Competitor"
                                    label="Competitor"
                                    size="xs"
                                  />
                                  <Radio
                                    value="OTHER -"
                                    label="Other"
                                    size="xs"
                                    checked
                                  />
                                </Flex>
                              </Radio.Group>

                              {notQualifiedDisqualificationReason?.includes(
                                "OTHER"
                              ) && (
                                <TextInput
                                  placeholder="Enter reason here"
                                  radius={"md"}
                                  onChange={(event) => {
                                    setNotQualifiedDisqualificationReason(
                                      "OTHER - " + event.currentTarget.value
                                    );
                                  }}
                                />
                              )}

                              <Button
                                color={
                                  notQualifiedDisqualificationReason
                                    ? "red"
                                    : "gray"
                                }
                                leftIcon={<IconTrash size={24} />}
                                radius={"md"}
                                onClick={async () => {
                                  setLoadingNotQualified(true);
                                  setOpenedNotQualifiedPopover(false);
                                  await changeStatus(
                                    "NOT_QUALIFIED",
                                    true,
                                    notQualifiedDisqualificationReason
                                  );
                                  setLoadingNotQualified(false);
                                }}
                              >
                                Disqualify
                              </Button>
                            </Flex>
                          </Popover.Dropdown>
                        </Popover>
                      </SimpleGrid>
                    ) : (
                      // </Flex>
                      <Stack spacing={10}>
                        <Box>
                          {/* <Text>
                            {prospect?.meta_data?.demo_set?.description}
                          </Text> */}
{/* 
                          {(!demoFeedbacks || demoFeedbacks.length === 0) && (
                            <Box mb={10} mt={10}>
                              <ProspectDemoDateSelector
                                prospectId={openedProspectId}
                              />
                            </Box>
                          )}

                          {data && demoFeedbacks && demoFeedbacks.length > 0 && (
                            <ScrollArea h="250px">
                              {demoFeedbacks?.map((feedback, index) => (
                                <div style={{ marginBottom: 10 }}>
                                  <DemoFeedbackCard
                                    prospect={data.data}
                                    index={index + 1}
                                    demoFeedback={feedback}
                                    refreshDemoFeedback={refreshDemoFeedback}
                                  />
                                </div>
                              ))}
                            </ScrollArea>
                          )} */}
                          {/* <Button
                            variant="light"
                            radius="md"
                            fullWidth
                            onClick={() => {
                              setDrawerProspectId(openedProspectId);
                              setDemosDrawerOpened(true);
                            }}
                          >
                            {demoFeedbacks && demoFeedbacks.length > 0
                              ? "Add"
                              : "Give"}{" "}
                            Demo Feedback
                          </Button>

                          <DemoFeedbackDrawer
                            refetch={() => {
                              refetchState();
                            }}
                          /> */}
                        </Box>
                      </Stack>
                    )}
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Box>
            </Stack>
          </Paper>
        </Stack>
      </Flex>
    </Paper>
  );
}
