import React from "react";
import { useRecoilValue } from "recoil";
import { userDataState } from "@atoms/userAtoms";
import CampaignReview from "@pages/CampaignReview/CampaignReviewLinkedin";
import CampaignChannelPage from "@pages/CampaignChannelPage";
import { Card } from "@mantine/core";

interface TaskHandlerReviewCampaignData {
  data: {
    campaign_id: number;
    campaign_notes?: string;
  };
  onTaskComplete?: () => void;
  taskType?: string;
}

export const TaskHandlerReviewCampaign = (
  props: TaskHandlerReviewCampaignData
) => {
  const hideEmail = props.taskType == "LINKEDIN_CAMPAIGN_REVIEW";
  const hideLinkedIn = props.taskType == "EMAIL_CAMPAIGN_REVIEW";

  return (
    <>
      <CampaignChannelPage
        cType={hideEmail ? "email" : "linkedin"}
        campaignId={props.data.campaign_id}
        hideEmail={hideEmail}
        hideLinkedIn={hideLinkedIn}
        hideAssets
        hideHeader
      />
    </>
  );
};
