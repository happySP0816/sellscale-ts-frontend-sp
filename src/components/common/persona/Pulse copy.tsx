import { currentProjectState } from '@atoms/personaAtoms';
import { useRecoilState } from 'recoil';
import Pulse from './Pulse';
import { Box } from '@mantine/core';

export const PulseWrapper = () => {
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  if (!currentProject) return null;

  return (
    <Box m='lg'>
      <Pulse personaOverview={currentProject} />
    </Box>
  )
}