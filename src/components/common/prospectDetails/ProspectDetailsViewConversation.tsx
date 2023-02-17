import { LinkedInConversationEntry } from "@common/persona/LinkedInConversationEntry";
import { Button, Flex, Card, Text, Group, ScrollArea } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons";
import { slice } from "lodash";

import { useState } from "react";
import { LinkedInMessage } from "src/main";

type ProspectDetailsViewConversationPropsType = {
  conversation_entry_list: LinkedInMessage[],
  conversation_url: string,
};

const LOAD_CHUNK_SIZE = 5;

export default function ProspectDetailsViewConversation(
  props: ProspectDetailsViewConversationPropsType
) {
  const [msgCount, setMsgCount] = useState(1);

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
          {`Last Updated: ${new Date(messages[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        </Text>
      </Group>

      <ScrollArea
        style={{ height: (msgCount > 2) ? 500 : 'inherit', maxHeight: 500 }}
      >
        {slice(props.conversation_entry_list, 0, msgCount).map((message, index) => (
          <LinkedInConversationEntry
            key={`message-${index}`}
            postedAt={new Date(message.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            body={message.message}
            name={message.author}
            image={
              false // TODO: Support LinkedIn props.profile_pic
                ? message.profile_url
                : `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(`${message.first_name} ${message.last_name}`)}`
            }
            isLatest={index===0}
          />
        ))}
      </ScrollArea>
      <Flex>
        <Button disabled={msgCount >= props.conversation_entry_list.length} variant="outline" color="gray" fullWidth mt="md" onClick={() => setMsgCount((prev) => prev+LOAD_CHUNK_SIZE)}>
          Load more
        </Button>
        <Button
          variant="outline"
          fullWidth
          mt="md"
          ml="md"
          color="teal"
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href={props.conversation_url}
          rightIcon={<IconExternalLink size={14} />}
        >
          View Conversation
        </Button>
      </Flex>
    </Card>
  );
}
