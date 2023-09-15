
import { userTokenState } from '@atoms/userAtoms';
import { Box, Button, Title, Group } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { useRecoilValue } from 'recoil';
import { PersonaOverview } from 'src';

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
              innerProps: { },
            });
          }}
        >
          Go to Voice Builder
        </Button>
      </Group>
    </Box>
  )

}
