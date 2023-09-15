import ComingSoonCard from '@common/library/ComingSoonCard';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import { TextInput, Tabs } from '@mantine/core';
import FileDropAndPreview from '@modals/upload-prospects/FileDropAndPreview';
import { useState } from 'react';
import ProspectUploadAndPreview from './ProspectUploadAndPreview';
import Pulse from '../../src/components/common/persona/Pulse';
import { useRecoilValue } from 'recoil';
import { personaCreationState } from '@atoms/personaAtoms';

export default function StepFive(props: { onChange: (data: {
}) => void }) {

  const creationData = useRecoilValue(personaCreationState);

  return (
    <>
    <ComingSoonCard />
    </>
  );
}
