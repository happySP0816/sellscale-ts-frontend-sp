import {
  createStyles,
  Card,
  Text,
  Timeline,
  Button,
  Group,
  Flex,
  Modal,
  Textarea,
} from "@mantine/core";
import { IconGitBranch } from "@tabler/icons";

import { useState } from "react";

const mockdata = [
  {
    note: "Accepted my invite. We scheduled a call for next week.",
    date: "March 23rd, 2022 (latest note)",
  },
  {
    note: "We met! Was a good meeting. Meeting his team next week.",
    date: "March 30th, 2022",
  },
  {
    note: "Met with his team. They're interested in a demo.",
    date: "April 1st, 2022",
  },
];
const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: 90,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: `${theme.shadows.md} !important`,
      transform: "scale(1.05)",
    },
  },
}));

type ProspectDetailsChangeStatusProps = {
  currentStatus: string;
  prospectId: number;
};

export default function ProspectDetailsNotes(
  props: ProspectDetailsChangeStatusProps
) {
  const { classes, theme } = useStyles();
  const [opened, setOpened] = useState(false);
  const [viewAllNotes, setViewAllNotes] = useState(false);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart" mb="xs">
        <Text weight={700} size="lg">
          Notes
        </Text>
      </Group>
      <Timeline active={1} bulletSize={24} lineWidth={2}>
        {mockdata.map(
          (item: any, i: number) =>
            (i == 0 || viewAllNotes) && (
              <Timeline.Item bullet={<IconGitBranch size={12} />}>
                <Text size="sm">{item.note}</Text>
                <Text size="xs" color="dimmed" mt={4}>
                  {item.date}
                </Text>
              </Timeline.Item>
            )
        )}
      </Timeline>

      <Flex>
        <Button
          color="blue"
          variant="outline"
          mt="md"
          onClick={() => setViewAllNotes((o: boolean) => !o)}
        >
          View all notes
        </Button>
        <Button
          color="blue"
          variant="outline"
          mt="md"
          ml="md"
          onClick={() => setOpened(true)}
        >
          Create New Note
        </Button>
      </Flex>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create New Note"
      >
        <Textarea
          placeholder="Add a note here..."
          label="New Note"
          withAsterisk
        />
        <Button
          color="blue"
          variant="outline"
          mt="md"
          onClick={() => {
            setOpened(false);
          }}
        >
          Save Note
        </Button>
      </Modal>
    </Card>
  );
}
