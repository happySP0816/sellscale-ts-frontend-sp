import { currentProjectState, uploadDrawerOpenState } from "@atoms/personaAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import Pulse from "./Pulse";
import { Box, Button, Flex, Stack, Tabs } from "@mantine/core";
import { IconMessageCircle, IconRobot, IconRuler, IconSettings } from "@tabler/icons";
import PulseBarChart from "@common/charts/PulseBarChart";
import { userTokenState } from '@atoms/userAtoms';
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';
import { IconUpload } from '@tabler/icons-react';
import UploadDetailsDrawer from '@drawers/UploadDetailsDrawer';
import { prospectUploadDrawerIdState, prospectUploadDrawerOpenState } from '@atoms/uploadAtoms';
import { useState } from 'react';
import { getAllUploads } from '@utils/requests/getPersonas';
import PersonaUploadDrawer from '@drawers/PersonaUploadDrawer';
import { ProjectSelect } from "@common/library/ProjectSelect";

export const PulseWrapper = () => {
  const currentProject = useRecoilValue(currentProjectState);

  const userToken = useRecoilValue(userTokenState);
  const currentProjectId = currentProject?.id;
  const navigate = useNavigate();

  const [uploads, setUploads] = useState<any[]>([]);
  const [fetchedUploads, setFetchedUploads] = useState(false);

  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );
  const [prospectUploadDrawerId, setProspectUploadDrawerId] = useRecoilState(
    prospectUploadDrawerIdState
  );

  const openUploadProspects = () => {
    setUploadDrawerOpened(true);
  };

  return (
    <div>
      <Box m='md'>
        <Box>
          <Flex direction={'row'} mb='xs'>
            <ProjectSelect onClick={(persona) => {
              navigateToPage(navigate, `/prioritize` + (persona ? `/${persona.id}` : ''));
            }} />
            {currentProject?.id && (
                  <Button
                    variant="filled"
                    color="teal"
                    radius="md"
                    ml="auto"
                    mr="0"
                    rightIcon={<IconUpload size={14} />}
                    onClick={openUploadProspects}
                  >
                    Upload New Prospects
                  </Button>
                )}
          </Flex>
          </Box>
        {currentProject?.id && <iframe 
            src={`https://sellscale.retool.com/embedded/public/d26f8f26-7d77-4827-b53e-1ae2c0eda0c8#authToken=${userToken}&archetype_id=${currentProjectId}`}
            style={{ width: '100%', height: '1000px', border: 'none' }}
          />}
        
      </Box>
      <PersonaUploadDrawer
        personaOverviews={currentProject ? [currentProject] : []}
        afterUpload={() => {}}
      />
     </div>
  );
};
