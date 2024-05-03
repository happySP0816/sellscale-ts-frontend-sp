import { userDataState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";

export default function AssetIngestor(props: { personaId?: number }) {
  const userData = useRecoilValue(userDataState);
  return (
    <>
      <iframe
        title="Asset Ingestor"
        src={`https://sellscale.retool.com/embedded/public/d925cdf6-7a91-4f34-b417-d888dbf611a5#client_id=${userData?.client?.id}&personaId=${props.personaId}`}
        width="100%"
        height="650px"
        style={{
          outline: "none",
          border: "none",
        }}
      ></iframe>
    </>
  ); // Retool Editing Link: https://sellscale.retool.com/editor/ff591a22-ed5a-11ee-8429-333a5a2330be/Internal%20Modules/Auto%20Create%20Client%20Assets#client_id=1
}
