import { useRecoilValue } from "recoil";
import PersonaCard from "./PersonaCard";
import { currentProjectState } from "@atoms/personaAtoms";
import { useQuery } from "@tanstack/react-query";
import { isLoggedIn } from "@auth/core";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { PersonaOverview } from "src";
import { userTokenState } from "@atoms/userAtoms";
import PersonaDetailsDrawer from "@drawers/PersonaDetailsDrawer";
import PersonaUploadDrawer from "@drawers/PersonaUploadDrawer";
import UploadDetailsDrawer from "@drawers/UploadDetailsDrawer";

export default function SetupPersonaCard() {

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-persona-setup`,
    ],
    queryFn: async () => {
      if(!isLoggedIn()) return;
      const response = await getPersonasOverview(userToken);
      return response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
    },
    refetchOnWindowFocus: false,
  });

  let currentProject = useRecoilValue(currentProjectState);
  if(!currentProject) {
    return <></>;
  }
  // Use the updated persona if it exists in the data
  if(data){
    let new_currentProject = data.find((persona) => persona.id === currentProject?.id);
    if(new_currentProject) {
      currentProject = new_currentProject;
    }
  }

  return (
    <>
      <PersonaCard
        personaOverview={currentProject}
        refetch={refetch}
        unassignedPersona={false}
        allPersonas={data || []}
      />
      <PersonaDetailsDrawer personaOverviews={data} />
      <PersonaUploadDrawer personaOverviews={data} />
      <UploadDetailsDrawer />
    </>
  )

}
