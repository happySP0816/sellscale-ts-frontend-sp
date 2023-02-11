import { Drawer, Title, Text, Center, Button } from "@mantine/core";
import { useRecoilState } from "recoil";
import { linkedInCTAsDrawerOpenState } from "../atoms/personaAtoms";


export default function PersonaUploadDrawer(props: {}) {

  const [opened, setOpened] = useRecoilState(linkedInCTAsDrawerOpenState);

  return (
    <Drawer
    opened={opened}
    onClose={() => setOpened(false)}
    title={<Title order={2}>LinkedIn CTAs</Title>}
    padding="xl"
    size="xl"
    position="right"
  >

    <Text>Test text</Text>
    
  </Drawer>
  );

}
