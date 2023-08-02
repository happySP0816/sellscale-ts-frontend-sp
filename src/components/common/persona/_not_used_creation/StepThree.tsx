import ComingSoonCard from '@common/library/ComingSoonCard';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import { TextInput, Tabs } from '@mantine/core';
import FileDropAndPreview from '@modals/upload-prospects/FileDropAndPreview';
import { useState } from 'react';
import ProspectUploadAndPreview from './ProspectUploadAndPreview';
import Pulse from '../Pulse';
import { ArchetypeCreation } from '@modals/CreatePersonaModal';

export default function StepThree(props: { persona: ArchetypeCreation }) {

  return (
    <>
      {/* <Pulse
        personaOverview={{
          active: props.persona.active,
          id: props.persona.id,
          name: props.persona.archetype,
          num_prospects: props.persona.performance.total_prospects,
          num_unused_email_prospects: props.persona.performance.total_prospects,
          num_unused_li_prospects: props.persona.performance.total_prospects,
          icp_matching_prompt: props.persona.icp_matching_prompt,
          is_unassigned_contact_archetype: props.persona.is_unassigned_contact_archetype,

          uploads: props.persona.uploads,
        }}
      /> */}
    </>
  );
}
