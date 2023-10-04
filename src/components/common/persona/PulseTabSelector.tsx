import { Tabs } from "@mantine/core";
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

  return (
    <ICPFilters />
  );
};

export default PulseTabSelector;
