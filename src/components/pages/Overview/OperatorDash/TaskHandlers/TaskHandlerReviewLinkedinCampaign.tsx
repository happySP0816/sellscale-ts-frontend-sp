import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import CampaignReviewLinkedin from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerReviewLinkedinCampaignData {
    data: {
        campaign_id: number;
    },
    onTaskComplete?: () => void;
}

export const TaskHandlerReviewLinkedinCampaign = (props: TaskHandlerReviewLinkedinCampaignData) => {
    const userData = useRecoilValue(userDataState)

    return (
        <CampaignReviewLinkedin onTaskComplete={props.onTaskComplete} campaignId={props.data.campaign_id} />
    );
}