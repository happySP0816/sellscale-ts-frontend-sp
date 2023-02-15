
import PageFrame from "@common/PageFrame";
import CampaignTable from "@common/campaigns/CampaignTable";
import { useLoaderData } from "react-router-dom";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { campaignDrawerIdState, campaignDrawerOpenState } from "@atoms/campaignAtoms";

export default function CampaignsPage() {

  const { campaignId } = useLoaderData() as { campaignId: string };
  const [_opened, setOpened] = useRecoilState(campaignDrawerOpenState);
  const [_campaignId, setCampaignId] = useRecoilState(campaignDrawerIdState);
  useEffect(() => {
    if(campaignId && campaignId.trim().length > 0){
      setCampaignId(+campaignId.trim())
      setOpened(true);
    }
  }, [campaignId]);

  return (
    <PageFrame>
      <CampaignTable />
    </PageFrame>
  );
}
