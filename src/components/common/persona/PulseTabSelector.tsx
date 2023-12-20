import { Tabs, Tooltip } from "@mantine/core";
import { PulseWrapper } from "./PulseWrapper";
import ICPFilters from "./ICPFilter/ICPFilters";
import { currentProjectState } from "@atoms/personaAtoms";
import { getCurrentPersonaId, getFreshCurrentProject } from "@auth/core";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { useLoaderData, useNavigate } from 'react-router-dom';
import { PersonaOverview } from 'src';
import { getPersonasOverview } from '@utils/requests/getPersonas';
import { navigateToPage } from "@utils/documentChange";
import UploadOverview from './UploadOverview';
import { IconChartArcs, IconChartAreaLine, IconTable, IconTarget, IconWashMachine } from '@tabler/icons';

const PulseTabSelector = () => {
  const userToken = useRecoilValue(userTokenState);
  const navigate = useNavigate();

  // const { archetypeId } = useLoaderData() as {
  //   archetypeId: number;
  // };
  const { prospectId } = useLoaderData() as {
    prospectId: number;
  };
  useEffect(() => {
    if(prospectId) {
      navigateToPage(navigate, "/contacts", new URLSearchParams({ prospect_id: prospectId+'' }));
    }
  }, []);
  /*
  Tab to switch between old view and new view of Prospect Scoring
  return (
    <Tabs defaultValue="new_view">
      <Tabs.List>
        <Tabs.Tab value="new_view">
          <IconTarget
            size="0.8rem"
            style={{ marginRight: "8px", marginTop: "4px" }}
          />
          Prospect Scoring
        </Tabs.Tab>
        <Tooltip label="Old View" position="bottom" withArrow withinPortal>
          <Tabs.Tab value="old_view" ml="auto">
            <IconWashMachine
              size="0.8rem"
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
          </Tabs.Tab>
        </Tooltip>
      </Tabs.List>

      <Tabs.Panel value="old_view">
        <PulseWrapper />
      </Tabs.Panel>
      <Tabs.Panel value="new_view">
        <ICPFilters />
      </Tabs.Panel>
    </Tabs>
  );
  */

  return (<ICPFilters />);
};

export default PulseTabSelector;
