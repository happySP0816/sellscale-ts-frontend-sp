import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import ComingSoonCard from '@common/library/ComingSoonCard';
import { Card } from '@mantine/core';
import { useRecoilValue } from 'recoil';

export default function AssetLibraryRetool(props: { authToken?: string; projectId?: number }) {
  const authToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const currentProjectId = currentProject?.id;

  const url = encodeURI(
    'https://sellscale.retool.com/embedded/public/035e7bc0-da4c-4913-a028-5c49e0d457fc#auth_token=' +
      (props.authToken ?? authToken) +
      '&campaign_id=' +
      (props.projectId ?? currentProjectId)
  );
  console.log(url);

  return (
    <Card>
      <iframe
        src={url}
        width='100%'
        height={window.innerHeight + 200}
        style={{ border: 'none' }}
        title='Asset Library Retool'
      />
    </Card>
  );
}
