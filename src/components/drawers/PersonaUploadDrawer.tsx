import { Drawer, Title, Text, Button, Group, FileButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { temp_delay } from "../../utils/general";
import displayNotification from "../../utils/notificationFlow";
import { currentPersonaIdState, uploadDrawerOpenState } from "../atoms/personaAtoms";

export default function PersonaUploadDrawer(props: {}) {
  const [opened, setOpened] = useRecoilState(uploadDrawerOpenState);
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(currentPersonaIdState);
  
  const isUploading = useRef(false);
  const resetRef = useRef<() => void>(null);

  const uploadFile = async (file: File) => {
    if (isUploading.current) {
      return;
    }
    isUploading.current = true;

    await displayNotification(
      "make-active-persona",
      async () => {
        console.log(file);
        await temp_delay(1000);
        return Math.random() < 0.75;
      },
      {
        title: `Uploading Persona`,
        message: `Working with servers...`,
        color: "teal",
      },
      {
        title: `Uploaded!`,
        message: `Very cool 👍`,
        color: "teal",
      },
      {
        title: `Error while uploading!`,
        message: `Test 25% chance of failure!`,
        color: "red",
      }
    );

    resetRef.current?.();
    isUploading.current = false;
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        setCurrentPersonaId(-1);
        setOpened(false);
      }}
      title={<Title order={2}>Upload Persona</Title>}
      padding="xl"
      size="xl"
      position="right"
    >
      <Text pb="xs">
        <span className="font-bold">LinkedIn: </span>
        <span>X/Y prospects available</span>
      </Text>
      <Text pb="xs">
        <span className="font-bold">Email: </span>
        <span>X/Y prospects available</span>
      </Text>

      <Group position="center">
        <FileButton resetRef={resetRef} onChange={uploadFile} accept=".csv">
          {(props) =>
            <Button
              {...props}
              variant="outline"
              color="teal"
            >Upload image</Button>
          }
        </FileButton>
      </Group>

      <Text align="center" pb="xs" c="dimmed" fs="italic" fz="sm">
        CSV of Email + LinkedIn
      </Text>
    </Drawer>
  );
}
