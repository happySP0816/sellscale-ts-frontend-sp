import { Button, Flex, Card, Text, Group } from "@mantine/core";

import { useState } from "react";
import { LinkedinConversationEntry } from "../persona/LinkedinConversationEntry";

type ProspectDetailsViewConversationPropsType = {
  conversation_entry_list: {
    message: string;
    date: string;
    sender: string;
    sender_profile_picture: string;
  }[];
};

export default function ProspectDetailsViewConversation(
  props: ProspectDetailsViewConversationPropsType
) {
  const [opened, setOpened] = useState(false);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart">
        <Text weight={700} size="lg">
          Linkedin Conversation
        </Text>
      </Group>
      <Group position="apart" mb="xs">
        <Text weight={200} size="xs">
          Last Updated: December 22, 2023
        </Text>
      </Group>

      <Text weight={700} size="xs" mb="xs">
        Latest Message Sent
      </Text>
      <LinkedinConversationEntry
        postedAt="December 22, 2023"
        body="Hello, I am interested in your services. Please contact me."
        name="aakash adesara"
        image="https://www.aakashadesara.com/static/media/aakash.5bcfcf4fa4edb7582323.jpeg"
      />
      <Flex>
        <Button variant="outline" color="gray" fullWidth mt="md">
          Load more
        </Button>
        <Button variant="outline" fullWidth mt="md" ml="md" color="teal">
          View Conversation
        </Button>
      </Flex>
    </Card>
  );
}
