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
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import {
  IconUpload,
  IconX,
  IconPhoto,
  IconFileDescription,
} from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { convertCSVtoJSON, temp_delay } from "../../utils/general";
import displayNotification from "../../utils/notificationFlow";
import {
  currentPersonaIdState,
  uploadDrawerOpenState,
} from "../atoms/personaAtoms";

async function uploadCSV(
  archetype_id: number,
  userToken: string,
  payload: File
) {

  console.log(payload);

  const read = new FileReader();
  read.readAsBinaryString(payload);

  const contents = await new Promise((res, rej) => {
    read.onloadend = function(){
      res(read.result as string);
    }
  }) as string;

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/add_prospect_from_csv_payload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: -1, // USE UserToken instead
        archetype_id: archetype_id,
        csv_payload: convertCSVtoJSON(contents),
      }),
    }
  );
  return response;
}

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
      "make-active-persona",
      async () => {
        const response = await uploadCSV(currentPersonaId, userToken, file)
        return response?.status === 200;
      },
      {
        title: `Uploading Contacts to Persona`,
        message: `Working with servers...`,
        color: "teal",
      },
      {
        title: `Uploaded!`,
        message: `Added contacts to persona.`,
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
        <FileButton resetRef={resetRef} onChange={uploadFile} accept=".csv">
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
