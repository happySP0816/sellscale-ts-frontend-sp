import { Drawer, Flex, Tabs, Title } from "@mantine/core";
import FileDropAndPreview from "@modals/upload-prospects/FileDropAndPreview";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype, PersonaOverview } from "src";
import {
  currentProjectState,
  uploadDrawerOpenState,
} from "../atoms/personaAtoms";
import ComingSoonCard from "@common/library/ComingSoonCard";
import CreatePersona from "@common/persona/CreatePersona";
import LinkedInURLUpload from "@modals/upload-prospects/LinkedInURLUpload";
import SalesNavigatorComponent from '@pages/SalesNavigatorPage';

export default function PersonaUploadDrawer(props: {
  personaOverviews: PersonaOverview[] | undefined;
  afterUpload: () => void;
}) {
  const [opened, setOpened] = useRecoilState(uploadDrawerOpenState);
  const currentProject = useRecoilValue(currentProjectState);

  const persona = props.personaOverviews?.find(
    (persona) => persona.id === currentProject?.id
  );
  if (!persona) {
    return <></>;
  }

  const closeDrawer = () => {
    setOpened(false);
  };

  return (
    <Drawer
      opened={opened}
      onClose={closeDrawer}
      title={<Title order={3}>Upload - {persona.name}</Title>}
      padding="xl"
      size="lg"
      position="right"
    >
      <Tabs defaultValue="from-file" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="from-file">Import from File</Tabs.Tab>
          <Tabs.Tab value="from-link">Import One Prospect</Tabs.Tab>
          <Tabs.Tab value="from-sales-nav">Import From Sales Nav</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="from-file" pt="xs">
          <FileDropAndPreview
            personaId={persona.id + ""}
            onUploadSuccess={closeDrawer}
          />
        </Tabs.Panel>
        <Tabs.Panel value="from-link" pt="xs">
          <Flex w='100%' my='md'>
            <LinkedInURLUpload afterUpload={props.afterUpload}/>
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel value="from-sales-nav" pt="xs">
          <Flex w='100%' my='md'>
            <SalesNavigatorComponent showPersonaSelect />
          </Flex>
        </Tabs.Panel>
        {/* <Tabs.Panel value="from-crm" pt="xs">
          <ComingSoonCard h={200} />
        </Tabs.Panel> */}
      </Tabs>
    </Drawer>
  );
}

/*
export default function PersonaUploadDrawer(props: {}) {
  const [opened, setOpened] = useRecoilState(uploadDrawerOpenState);
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
      size="lg"
      position="right"
    >
      <Container m="sm">
        <Text c="dimmed" fs="italic" align="center">
          Upload a CSV of Email + LinkedIn prospects.
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
