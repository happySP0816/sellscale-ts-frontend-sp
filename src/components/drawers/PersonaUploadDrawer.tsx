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
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import displayNotification from "../../utils/notificationFlow";
import {
  currentPersonaIdState,
  uploadDrawerOpenState,
} from "../atoms/personaAtoms";
import Papa from "papaparse";

async function uploadCSV(archetype_id: number, userToken: string, payload: File): Promise<{ status: string, title: string, message: string, extra?: any }> {

  const read = new FileReader();
  read.readAsBinaryString(payload);

  const csvStr = await new Promise((res, rej) => {
    read.onloadend = function(){
      res(read.result as string);
    }
  }) as string;
  const csvData = Papa.parse(csvStr, { header: true });
  if(csvData.errors.length > 0){
    return { status: 'error', title: `${csvData.errors[0].type} Error [${csvData.errors[0].row}]`, message: csvData.errors[0].message };
  }

  return await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/add_prospect_from_csv_payload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetype_id,
        csv_payload: csvData.data,
      }),
    }
  ).then(async (r) => {
    if(r.status === 200){
      return { status: 'success', title: `Success`, message: `Contacts added to persona.` };
    } else {
      return { status: 'error', title: `Error (${r.status})`, message: await r.text() };
    }
  }).catch((err) => {
    console.log(err);
    return { status: 'error', title: `Error while uploading`, message: err.message };
  });

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
        return await uploadCSV(currentPersonaId, userToken, file);
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
