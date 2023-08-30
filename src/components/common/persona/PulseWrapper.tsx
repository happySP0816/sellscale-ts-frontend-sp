import { currentProjectState } from "@atoms/personaAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import Pulse from "./Pulse";
import { Box, Stack, Tabs } from "@mantine/core";
import { IconMessageCircle, IconRobot, IconRuler, IconSettings } from "@tabler/icons";
import PulseBarChart from "@common/charts/PulseBarChart";
import { userTokenState } from '@atoms/userAtoms';

export const PulseWrapper = () => {
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) return null;

  const userToken = useRecoilValue(userTokenState);
  const currentProjectId = currentProject.id;

  return (
    <Box m='md'>
      <iframe 
          src={`https://sellscale.retool.com/embedded/public/d26f8f26-7d77-4827-b53e-1ae2c0eda0c8#authToken=${userToken}&archetype_id=${currentProjectId}`}
          style={{ width: '100%', height: '1000px', border: 'none' }}
        />
    </Box>
  );
};
