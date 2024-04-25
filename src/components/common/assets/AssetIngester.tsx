import { userDataState } from '@atoms/userAtoms';
import { useRecoilValue } from 'recoil';

export default function AssetIngester(props: {}) {
  const userData = useRecoilValue(userDataState);
  return (
    <iframe
      title='Asset Ingester'
      src={`https://sellscale.retool.com/embedded/public/d925cdf6-7a91-4f34-b417-d888dbf611a5#client_id=${userData?.client?.id}`}
      width='100%'
      height='800px'
    ></iframe>
  ); // Retool Editing Link: https://sellscale.retool.com/editor/ff591a22-ed5a-11ee-8429-333a5a2330be/Internal%20Modules/Auto%20Create%20Client%20Assets#client_id=1
}
