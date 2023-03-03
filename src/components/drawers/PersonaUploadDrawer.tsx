import {
  Drawer,
  Title,
} from "@mantine/core";
import FileDropAndPreview from "@modals/upload-prospects/FileDropAndPreview";
import { useRecoilState } from "recoil";
import { Archetype } from "src/main";
import {
  currentPersonaIdState,
  uploadDrawerOpenState,
} from "../atoms/personaAtoms";

export default function PersonaUploadDrawer(props: { personas: Archetype[] | undefined }) {
  const [opened, setOpened] = useRecoilState(uploadDrawerOpenState);
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );

  const persona = props.personas?.find((persona) => persona.id === currentPersonaId);
  if(!persona) {
    return (<>Failed to find persona with ID: "{currentPersonaId}"</>)
  }

  const closeDrawer = () => {
    setCurrentPersonaId(-1);
    setOpened(false);
  }

  return (
    <Drawer
      opened={opened}
      onClose={closeDrawer}
      title={<Title order={3}>Upload to {persona.archetype}</Title>}
      padding="xl"
      size="xl"
      position="right"
    >
      <FileDropAndPreview personaId={persona.id+''} onUploadSuccess={closeDrawer} />
    </Drawer>
  );
}

/*
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
*/