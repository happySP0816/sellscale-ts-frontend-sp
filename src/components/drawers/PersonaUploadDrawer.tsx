import { Drawer, Title, Text, Center, Button } from "@mantine/core";
import { useRef } from "react";
import { useRecoilState } from "recoil";
import { temp_delay } from "../../utils/general";
import displayNotification from "../../utils/notificationFlow";
import { uploadDrawerOpenState } from "../atoms/personaAtoms";


export default function PersonaUploadDrawer(props: {}) {

  const [opened, setOpened] = useRecoilState(uploadDrawerOpenState);
  const isUploading = useRef(false);

  const upload = async () => {
    if(isUploading.current) { return; }
    isUploading.current = true;

    await displayNotification(
      'make-active-persona',
      async () => {
        await temp_delay(1000);
        return Math.random() < 0.75;
      },
      {
        title: `Uploading Persona`,
        message: `Working with servers...`,
        color: 'teal',
      },
      {
        title: `Uploaded!`,
        message: `Very cool 👍`,
        color: 'teal',
      },
      {
        title: `Error while uploading!`,
        message: `Test 25% chance of failure!`,
        color: 'red',
      },
    );

    isUploading.current = false;
  }

  return (
    <Drawer
    opened={opened}
    onClose={() => setOpened(false)}
    title={<Title order={2}>Upload Persona</Title>}
    padding="xl"
    size="xl"
    position="right"
  >
    <Text pb='xs'><span className="font-bold">LinkedIn: </span><span>220/400 prospects available</span></Text>
    <Text pb='xs'><span className="font-bold">Email: </span><span>220/400 prospects available</span></Text>

    <Center my='xs'>
      <Button variant="outline" color="teal" onClick={() => {upload()}}>
        Upload Now
      </Button>
    </Center>

    <Text align="center" pb='xs' c="dimmed" fs="italic" fz="sm">CSV of Email + LinkedIn</Text>
    
  </Drawer>
  );

}
