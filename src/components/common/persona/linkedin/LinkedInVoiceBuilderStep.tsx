
import { userTokenState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import ComingSoonCard from '@common/library/ComingSoonCard';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import { API_URL } from '@constants/data';
import { TextInput, Tabs, Box, Button, Flex, Select, Switch, Title, Group } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { ArchetypeCreation } from '@modals/CreatePersonaModal';
import { IconUser, IconPencil, IconTrashX } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { deleteCTA } from '@utils/requests/createCTA';
import toggleCTA from '@utils/requests/toggleCTA';
import { chunk, sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CTA, Archetype, PersonaOverview } from 'src';

const PAGE_SIZE = 10;

export default function LinkedInVoiceBuilderStep(props: { persona: PersonaOverview, personas: PersonaOverview[] }) {
  
  const userToken = useRecoilValue(userTokenState);

  return (
    <Box>
      <Group position='center'>
        <Button
          size='md'
          onClick={() => {
            openContextModal({
              modal: 'voiceBuilder',
              title: <Title order={3}>Voice Builder</Title>,
              innerProps: {
                predefinedPersonaId: props.persona.id,
                personas: props.personas,
              },
            });
          }}
        >
          Go to Voice Builder
        </Button>
      </Group>
    </Box>
  )

}
