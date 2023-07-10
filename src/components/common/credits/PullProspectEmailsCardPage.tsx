import { currentProjectState } from '@atoms/personaAtoms'
import PageFrame from '@common/PageFrame';
import { useRecoilState } from 'recoil'
import PullProspectEmailsCard from './PullProspectEmailsCard';

export const PullProspectEmailsCardPage = () => {
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  if (!currentProject) {
    return null
  }

  return (
    <PageFrame>
      <PullProspectEmailsCard archetype_id={currentProject?.id}/>
    </PageFrame>
  );
}