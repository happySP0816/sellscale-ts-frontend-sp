import { Tabs } from "@mantine/core";
import { PulseWrapper } from "./PulseWrapper";
import ICPFilters from "./ICPFilter/ICPFilters";
import { currentProjectState } from "@atoms/personaAtoms";
import { getCurrentPersonaId, getFreshCurrentProject } from "@auth/core";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

const PulseTabSelector = () => {
  const userToken = useRecoilValue(userTokenState);

  // Select the last used project
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  useEffect(() => {
    (async () => {
      const currentPersonaId = getCurrentPersonaId();
      if (!currentProject && currentPersonaId) {
        const project = await getFreshCurrentProject(
          userToken,
          +currentPersonaId
        );
        setCurrentProject(project);
      }
    })();
  }, []);

  return (
    <Tabs defaultValue="old_view">
      <Tabs.List>
        <Tabs.Tab value="old_view">Old View</Tabs.Tab>
        <Tabs.Tab value="new_view">New View</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="old_view">
        <PulseWrapper />
      </Tabs.Panel>
      <Tabs.Panel value="new_view">
        <ICPFilters />
      </Tabs.Panel>
    </Tabs>
  );
};

export default PulseTabSelector;
