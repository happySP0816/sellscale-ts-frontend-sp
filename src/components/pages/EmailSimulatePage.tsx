import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import ComingSoonCard from "@common/library/ComingSoonCard";
import { setPageTitle } from "@utils/documentChange";
import { useLoaderData } from "react-router-dom";
import { useRecoilValue } from "recoil";



export default function EmailPage() {
  setPageTitle("Email Simulator");

  const userData = useRecoilValue(userDataState);

  const currentProject = useRecoilValue(currentProjectState);
  if(!currentProject) {
    return <></>;
  }

  return (
    <PageFrame>
      <ComingSoonCard h={500} />
    </PageFrame>
  )
}