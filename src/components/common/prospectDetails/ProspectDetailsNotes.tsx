import { prospectDrawerNotesState, prospectDrawerOpenState } from "@atoms/prospectAtoms";
import { userNameState, userTokenState } from "@atoms/userAtoms";
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

import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ProspectNote } from "src/main";

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

async function addProspectNote(
  prospectId: number,
  userToken: string,
  newNote: string
): Promise<{ status: string, title: string, message: string, extra?: any }> {
  return await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/add_note`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectId,
        note: newNote,
      }),
    }
  ).then(async (r) => {
    const res = await r.json();
    if(r.status === 200){
      return { status: 'success', title: `Success`, message: `Added note.`, extra: res.prospect_note_id };
    } else {
      return { status: 'error', title: `Error (${r.status})`, message: res.message };
    }
  }).catch((e) => {
    console.error(e);
    return { status: 'error', title: `Error while adding note`, message: e.message };
  });
}

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
                  props.prospectId,
                  userToken,
                  newNote
                );
                if(result.status === 'success' && result.extra) {
                  setNotes((prev) => [...prev,
                    {id: result.extra as number, note: newNote, prospect_id: props.prospectId, created_at: new Date().toISOString()}
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
