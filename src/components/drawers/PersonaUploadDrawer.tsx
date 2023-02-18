import { Drawer, Title, Text, Button, Group, FileButton, useMantineTheme } from "@mantine/core";
import { Dropzone, DropzoneProps, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconX, IconPhoto, IconFileDescription } from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { temp_delay } from "../../utils/general";
import displayNotification from "../../utils/notificationFlow";
import {
  currentPersonaIdState,
  uploadDrawerOpenState,
} from "../atoms/personaAtoms";

export default function PersonaUploadDrawer(props: {}) {
  const [opened, setOpened] = useRecoilState(uploadDrawerOpenState);
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );
  const theme = useMantineTheme();

  const isUploading = useRef(false);

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

      <Group position="center">
        <Dropzone
          loading={isUploading.current}
          onDrop={(files: any) => console.log("accepted files", files)}
          onReject={(files: any) => console.log("rejected files", files)}
          accept={[MIME_TYPES.csv]}
          {...props}
        >
          <Group
            position="center"
            spacing="xl"
            style={{ minHeight: 220, pointerEvents: "none" }}
          >
            <Dropzone.Accept>
              <IconUpload
                size={80}
                stroke={1.5}
                color={
                  theme.colors[theme.primaryColor][
                    theme.colorScheme === "dark" ? 4 : 6
                  ]
                }
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                size={80}
                stroke={1.5}
                color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileDescription size={80} stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text align="center" size="xl" inline>
                Drag CSVs here or click to select files
              </Text>
              <Text align="center" size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 5mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Group>

      <Text align="center" pb="xs" c="dimmed" fs="italic" fz="sm">
        CSVs of Email + LinkedIn
      </Text>
    </Drawer>
  );
}
