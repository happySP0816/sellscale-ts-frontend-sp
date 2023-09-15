import ComingSoonCard from "@common/library/ComingSoonCard";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { TextInput, Tabs } from "@mantine/core";
import FileDropAndPreview from "@modals/upload-prospects/FileDropAndPreview";
import { useEffect, useState } from "react";
import ProspectUploadAndPreview from "./ProspectUploadAndPreview";
import { useRecoilValue } from "recoil";
import { personaCreationState } from "@atoms/personaAtoms";

export default function StepOne(props: {
  onChange: (data: { name: string; fileJSON: any[] }) => void;
}) {
  const creationData = useRecoilValue(personaCreationState);

  const [personaName, setPersonaName] = useState(
    creationData.persona.archetype
  );
  const [fileJSON, setFileJSON] = useState<any[]>(
    creationData.persona.fileJSON
  );

  useEffect(() => {
    props.onChange({ name: personaName, fileJSON: fileJSON });
  }, [personaName, fileJSON]);

  return (
    <>
      <TextInput
        label="Persona Name"
        placeholder="Name your persona"
        value={personaName}
        onChange={(e) => {
          setPersonaName(e.currentTarget.value);
        }}
      />

      <Tabs defaultValue="from-file" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="from-file">Import from File</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="from-file" pt="xs">
          <ProspectUploadAndPreview
            onFileUpload={(jsonData) => setFileJSON(jsonData)}
            onColumnChange={(jsonData) => setFileJSON(jsonData)}
          />
        </Tabs.Panel>
        <Tabs.Panel value="from-crm" pt="xs">
          <ComingSoonCard h={200} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
