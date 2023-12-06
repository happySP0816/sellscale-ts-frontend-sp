import { openedProspectIdState } from "@atoms/inboxAtoms";
import { userTokenState } from "@atoms/userAtoms";
import InboxProspectDetails from "@common/inbox/InboxProspectDetails";
import InboxProspectList, {
  ProspectConvoCard,
} from "@common/inbox/InboxProspectList";
import RichTextArea from "@common/library/RichTextArea";
import {
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Text,
  Loader,
  Title,
  Box,
  ScrollArea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconList, IconWorld } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { JSONContent } from "@tiptap/react";
import { setPageTitle } from "@utils/documentChange";
import { getSmartleadProspectConvo } from "@utils/requests/getSmartleadProspectConvo";
import { getSmartleadRepliedProspects } from "@utils/requests/getSmartleadRepliedProspects";
import postSmartleadReply from "@utils/requests/postSmartleadReply";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export const INBOX_PAGE_HEIGHT = `100vh`; //`calc(100vh - ${NAV_HEADER_HEIGHT}px)`;

// OH GOD THIS IS A MESS
export default function InboxSmartleadPage(props: {
  setNumberLeads: (number: number) => void;
  all?: boolean;
}) {
  setPageTitle("Inbox");

  const userToken = useRecoilValue(userTokenState);
  const [fetchingProspects, setFetchingProspects] = useState(false);
  const [fetchingConversation, setFetchingConversation] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [prospects, setProspects] = useState([]);
  const [conversation, setConversation] = useState<any>(null);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );

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

  const triggerGetSmartleadRepliedProspects = async () => {
    setFetchingProspects(true);

    const response = await getSmartleadRepliedProspects(userToken);
    const repliedProspects = response.data.replied_prospects;

    console.log("repliedProspects", repliedProspects);
    setProspects(repliedProspects);
    props.setNumberLeads(repliedProspects.length);

    // Sort by ID
    repliedProspects.sort((a: any, b: any) => {
      return a.prospect_id - b.prospect_id;
    });

    setFetchingProspects(false);
  };

  const triggerGetSmartleadProspectConvo = async (prospectID?: any) => {
    setFetchingConversation(true);

    if (!selectedProspect) {
      return;
    }

    const prospectid = prospectID || selectedProspect.prospect_id;
    const smartleadCampaignID = selectedProspect.smartlead_campaign_id;
    const response = await getSmartleadProspectConvo(
      userToken,
      prospectid,
      smartleadCampaignID
    );

    setConversation(response.data.conversation);

    setFetchingConversation(false);
  };

  const triggerPostSmartleadReply = async () => {
    setSendingMessage(true);

    if (!selectedProspect) {
      return;
    }

    const prospectid = selectedProspect.prospect_id;
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

    };

    setSendingMessage(false);

    triggerGetSmartleadProspectConvo();
  };

  useEffect(() => {
    triggerGetSmartleadRepliedProspects();
  }, []);

  return (
    <Grid
      columns={100}
      gutter={0}
      h={INBOX_PAGE_HEIGHT}
      sx={{ overflow: "hidden" }}
    >
      <Grid.Col span={27}>
        <Flex direction="column" w="100%">
          {prospects.map((prospect: any) => {
            return (
              <Flex
                w="100%"
                onClick={() => {
                  console.log("clicked", prospect);
                  setSelectedProspect(prospect);
                  triggerGetSmartleadProspectConvo(prospect.prospect_id);
                }}
              >
                <ProspectConvoCard
                  id={prospect.prospect_id}
                  name={prospect.prospect_name}
                  title={prospect.prospect_title}
                  img_url={prospect.prospect_img_url}
                  latest_msg={""}
                  latest_msg_time={""}
                  icp_fit={prospect.prospect_icp_ift_score}
                  new_msg_count={0}
                  latest_msg_from_sdr={false}
                  opened={prospect.prospect_id === openedProspectId}
                />
              </Flex>
            );
          })}
        </Flex>
      </Grid.Col>
      {prospects.length > 0 ? (
        <>
          <Grid.Col span={46}>
            {fetchingConversation ? (
              <Flex
                w="100%"
                h="60vh"
                my="xl"
                align={"center"}
                justify={"center"}
                direction="column"
              >
                <Loader color="purple" />
                <Text color="purple" mt="md">
                  Fetching conversation, please wait...
                </Text>
              </Flex>
            ) : (
              <ScrollArea h="100vh" pb="lg">
                {conversation && (
                  <>
                    {conversation.map((message: any) => {
                      return (
                        <Card my="sm">
                          <Box
                            sx={() => ({
                              border: "1px solid #E0E0E0",
                              borderRadius: "8px",
                              backgroundColor: "#F5F5F5",
                            })}
                            p="md"
                            mt="sm"
                          >
                            <Text fz="sm">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    message.email_body
                                  ),
                                }}
                              />
                            </Text>
                          </Box>
                        </Card>
                      );
                    })}
                    <RichTextArea
                      onChange={(value, rawValue) => {
                        messageDraftRichRaw.current = rawValue;
                        messageDraftEmail.current = value;
                      }}
                      value={messageDraftRichRaw.current}
                      height={200}
                    />
                    <Flex justify={"flex-end"} mt="xs">
                      <Button
                        color="green"
                        onClick={() => {
                          triggerPostSmartleadReply();
                        }}
                      >
                        Reply
                      </Button>
                    </Flex>
                  </>
                )}
              </ScrollArea>
            )}
          </Grid.Col>
          <Grid.Col span={27}>
            <InboxProspectDetails prospects={prospects} />
          </Grid.Col>
        </>
      ) : (
        <Grid.Col span={73}>
          <Container
            w="100%"
            mt="200px"
            sx={{ justifyContent: "center", textAlign: "center" }}
          >
            <Title
              fw="800"
              sx={{
                fontSize: "120px",
                color: "#e3e3e3",
                margin: "0% auto",
                textAlign: "center",
              }}
            >
              <span>Inbox Zero</span>
            </Title>
            <Text>
              <span style={{ fontSize: "24px" }}>
                You have no prospects in your inbox.
              </span>
            </Text>
            <Text mt="md">Try one of these other tabs instead:</Text>
            <Flex justify={"center"} mt="xs">
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/all/inboxes";
                }}
                leftIcon={<IconWorld />}
                color="blue"
                mr="xs"
              >
                Global Inbox
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/all/contacts";
                }}
                leftIcon={<IconWorld />}
                color="grape"
              >
                Contacts
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/all/recent-activity";
                }}
                leftIcon={<IconList />}
                ml="xs"
                color="orange"
              >
                Recent Activity
              </Button>
            </Flex>
          </Container>
        </Grid.Col>
      )}
    </Grid>
  );
}
