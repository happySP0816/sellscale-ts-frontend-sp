import ComingSoonCard from "@common/library/ComingSoonCard";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { TextInput, Tabs } from "@mantine/core";
import FileDropAndPreview from "@modals/upload-prospects/FileDropAndPreview";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { personaCreationState } from "@atoms/personaAtoms";
import EmailBlocksPage from "@pages/EmailBlocksPage";

export default function PersonaEmailSetup(props: { personaId: number }) {
  return (
    <>
      <EmailBlocksPage personaId={props.personaId} />
    </>
  );
}
