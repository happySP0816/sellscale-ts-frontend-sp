import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import PageFrame from '@common/PageFrame';
import EmailBlockPreview from '@common/emails/EmailBlockPreview';
import { EmailBlocksDND } from '@common/emails/EmailBlocksDND';
import PersonaSelect from '@common/persona/PersonaSplitSelect';
import { Button, Card, Flex, LoadingOverlay, Text, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import getEmailBlocks from '@utils/requests/getEmailBlocks';
import getPersonas from '@utils/requests/getPersonas';
import patchEmailBlocks from '@utils/requests/patchEmailBlocks';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

export default function EmailBlocksPage(props: { personaId?: number }) {
  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState)

  const personaId = currentProject?.id !== undefined ? currentProject.id : props.personaId ? props.personaId : -1;

  return (
    <PageFrame>
      <Card w='100%' withBorder>
        <Title order={3}>Email Block Builder</Title>
        <Text>Use the interface on the left to 'create' and 'stack' blocks. These blocks will be used to influence how the AI generates emails.</Text>
        <Flex w='100%' mt={10} gap={25}>
          <Flex w='50%'>
            <EmailBlocksDND archetypeId={personaId} autosave/>
          </Flex>
          <Flex w='50%' direction='column'>
            <EmailBlockPreview archetypeId={personaId} />
          </Flex>
        </Flex>
      </Card>
    </PageFrame>
  );
}
