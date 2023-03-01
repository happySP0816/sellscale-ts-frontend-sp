import { userTokenState } from "@atoms/userAtoms";
import { getUserInfo } from "@auth/core";
import {
  Drawer,
  Title,
  Text,
  Button,
  Group,
  FileButton,
  useMantineTheme,
  Center,
  SimpleGrid,
  Container,
} from "@mantine/core";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconFileDescription,
} from "@tabler/icons";
import { convertFileToJSON } from "@utils/fileProcessing";
import uploadProspects from "@utils/requests/uploadProspects";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
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
  const userToken = useRecoilValue(userTokenState);

  const theme = useMantineTheme();

  const isUploading = useRef(false);
  const resetRef = useRef<() => void>(null);

  const uploadFile = async (file: File) => {
    if (isUploading.current) {
      return;
    }
    isUploading.current = true;

    await displayNotification(
      "uploading-prospects",
      async () => {
        const json = await convertFileToJSON(file);
        if(json instanceof DOMException) {
          return { status: 'error', title: `Error while uploading`, message: json.message };
        } else {
          return await uploadProspects(currentPersonaId, userToken, json);
        }
      },
      {
        title: `Uploading Prospects to Persona`,
        message: `Working with servers...`,
        color: "teal",
      },
      {
        title: `Uploaded!`,
        message: `Added prospects to persona.`,
        color: "teal",
      },
      {
        title: `Error while uploading!`,
        message: `Please try again later.`,
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
      title={<Title order={2}>Upload to Persona</Title>}
      padding="xl"
      size="xl"
      position="right"
    >
      <Container m="sm">
        <Text c="dimmed" fs="italic" align="center">
          Upload a CSV of Email + LinkedIn contacts.
        </Text>
      </Container>
      <Center>
        <FileButton resetRef={resetRef} onChange={uploadFile}>
          {(props) => (
            <Button {...props} variant="outline" color="teal">
              Upload File
            </Button>
          )}
        </FileButton>
      </Center>
    </Drawer>
  );
}
