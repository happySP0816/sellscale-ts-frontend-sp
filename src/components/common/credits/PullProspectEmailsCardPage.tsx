import { currentProjectState } from '@atoms/personaAtoms'
import PageFrame from '@common/PageFrame';
import { useRecoilState, useRecoilValue } from 'recoil'
import PullProspectEmailsCard from './PullProspectEmailsCard';

export const PullProspectEmailsCardPage = () => {
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) {
    return null
  }

  return (
    <PageFrame>
      <PullProspectEmailsCard archetype_id={currentProject?.id}/>
    </PageFrame>
  );
}