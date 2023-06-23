import { prospectDrawerNotesState, prospectDrawerOpenState } from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
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
import { splitName } from "@utils/general";
import displayNotification from "@utils/notificationFlow";
import { addProspectNote } from "@utils/requests/prospectNotes";

import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { MsgResponse, ProspectNote } from "src";

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
  const [newNote, setNewNote] = useState('');
  const [viewAllNotes, setViewAllNotes] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [notes, setNotes] = useRecoilState(prospectDrawerNotesState);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart">
        <Text weight={700} size="lg">
          Notes
        </Text>
      </Group>
      <Text mb="xs" fz="sm" c="dimmed">Write down details about this prospect (meeting dates, considerations, etc).</Text>
      {notes.length > 0 && (
        <Timeline active={1} bulletSize={24} lineWidth={2} m='xs'>
          {notes.map(
            (note, index) =>
              (index === 0 || viewAllNotes) && (
                <Timeline.Item
                  key={`timeline-item-${index}`}
                  bullet={<IconGitBranch size={12} />}
                >
                  <Text size="sm">{note.note}</Text>
                  <Text size="xs" color="dimmed" mt={4}>
                    {new Date(note.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </Timeline.Item>
              )
          )}
        </Timeline>
      )}

      <Flex gap="xs">
        <Button
          disabled={viewAllNotes || notes.length <= 1}
          color="blue"
          variant="outline"
          onClick={() => setViewAllNotes((o: boolean) => !o)}
        >
          View all notes
        </Button>
        <Button
          color="blue"
          variant="outline"
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
          onBlur={(e) => setNewNote(e.target.value)}
        />
        <Button
          color="blue"
          variant="outline"
          mt="md"
          onClick={async () => {
            await displayNotification(
              "add-prospect-note",
              async () => {
                let result = await addProspectNote(
                  userToken,
                  props.prospectId,
                  newNote
                );
                if(result.status === 'success' && result.data) {
                  setNotes((prev) => [...prev,
                    {id: result.data as number, note: newNote, prospect_id: props.prospectId, created_at: new Date().toISOString()}
                  ]);
                  setOpened(false);
                }
                return result;
              },
              {
                title: `Adding Note`,
                message: `Working with servers...`,
                color: "teal",
              },
              {
                title: `Added!`,
                message: `You new note has been added.`,
                color: "teal",
              },
              {
                title: `Error while adding note!`,
                message: `Please try again later.`,
                color: "red",
              }
            );
          }}
        >
          Save Note
        </Button>
      </Modal>
    </Card>
  );
}
