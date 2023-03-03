import { userTokenState } from "@atoms/userAtoms";
import { LinkedInConversationEntry } from "@common/persona/LinkedInConversationEntry";
import {
  Button,
  Flex,
  Card,
  Text,
  Group,
  ScrollArea,
  Textarea,
} from "@mantine/core";
import { IconExternalLink, IconMail, IconRobot } from "@tabler/icons";
import { slice } from "lodash";
import displayNotification from "@utils/notificationFlow";

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { LinkedInMessage } from "src/main";

type ProspectDetailsViewConversationPropsType = {
  conversation_entry_list: LinkedInMessage[];
  conversation_url: string;
  prospect_id: number;
};

const LOAD_CHUNK_SIZE = 5;

export default function ProspectDetailsViewConversation(
  props: ProspectDetailsViewConversationPropsType
) {
  const [msgCount, setMsgCount] = useState(1);
  const userToken = useRecoilValue(userTokenState);
  const [messageDraft, setMessageDraft] = useState("");

  const sendFollowUp = async () => {
    await displayNotification(
      "asend-woz-message",
      async () => {
        let result: any = await fetch(
          `${process.env.REACT_APP_API_URI}/li_conversation/prospect/send_woz_message`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              new_message: messageDraft,
              prospect_id: props.prospect_id,
            }),
          }
        ).then(async (e) => {
          setMessageDraft("");
          return {
            status: "success",
            title: `Success`,
            message: `Status updated.`,
          };
        });
        return result;
      },
      {
        title: `Scheduling message...`,
        message: `Queuing your message to be sent.`,
        color: "teal",
      },
      {
        title: `Scheduled!`,
        message: `Your message will be sent shortly.`,
        color: "teal",
      },
      {
        title: `Error while sending message!`,
        message: `Please contact SellScale engineering team.`,
        color: "red",
      }
    );
  };

  const generateAIFollowup = () => {
    setMessageDraft("loading ...");
    fetch(
      `${process.env.REACT_APP_API_URI}/li_conversation/prospect/generate_response`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospect_id: props.prospect_id,
        }),
      }
    )
      .then((e) => {
        return e.json();
      })
      .then((resp) => setMessageDraft(resp["message"]));
  };

  // Sorted by date
  const messages = props.conversation_entry_list.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart">
        <Text weight={700} size="lg">
          Linkedin Conversation
        </Text>
      </Group>
      <Group position="apart" mb="xs">
        <Text weight={200} size="xs">
          {`Last Updated: ${new Date(messages[0].date).toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
              year: "numeric",
            }
          )}`}
        </Text>
      </Group>

      <ScrollArea
        style={{ height: msgCount > 2 ? 500 : "inherit", maxHeight: 300 }}
      >
        {slice(props.conversation_entry_list, 0, msgCount).map(
          (message, index) => (
            <LinkedInConversationEntry
              key={`message-${index}`}
              postedAt={new Date(message.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              body={message.message}
              name={message.author}
              image={
                false // TODO: Support LinkedIn props.profile_pic
                  ? message.profile_url
                  : `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                      `${message.first_name} ${message.last_name}`
                    )}`
              }
              isLatest={index === 0}
            />
          )
        )}
      </ScrollArea>
      <Flex>
        <Button
          disabled={msgCount >= props.conversation_entry_list.length}
          variant="outline"
          color="gray"
          mt="sm"
          onClick={() => setMsgCount((prev) => prev + LOAD_CHUNK_SIZE)}
        >
          Load more
        </Button>
        {msgCount > 1 && (
          <Button
            variant="outline"
            color="gray"
            mt="sm"
            ml="sm"
            onClick={() => setMsgCount((prev) => 1)}
          >
            Less
          </Button>
        )}
        <Button
          variant="outline"
          mt="sm"
          ml="sm"
          color="teal"
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href={props.conversation_url}
          rightIcon={<IconExternalLink size={14} />}
        >
          Open Conversation
        </Button>
      </Flex>

      <Textarea
        mt="sm"
        minRows={5}
        placeholder="Write a follow up message here..."
        label="Follow Up Message"
        withAsterisk
        onChange={(e) => {
          setMessageDraft(e.target?.value);
        }}
        value={messageDraft}
      />
      <Flex>
        {/* <Button
          variant="outline"
          mt="sm"
          color="violet"
          component="a"
          mr="sm"
          target="_blank"
          fullWidth
          rel="noopener noreferrer"
          rightIcon={<IconRobot size={14} />}
          onClick={() => {
            generateAIFollowup();
          }}
        >
          Generate AI Follow Up
        </Button> */}
        <Button
          variant="outline"
          mt="sm"
          color="blue"
          component="a"
          target="_blank"
          fullWidth
          rel="noopener noreferrer"
          rightIcon={<IconMail size={14} />}
          onClick={sendFollowUp}
        >
          Schedule
        </Button>
      </Flex>
    </Card>
  );
}
