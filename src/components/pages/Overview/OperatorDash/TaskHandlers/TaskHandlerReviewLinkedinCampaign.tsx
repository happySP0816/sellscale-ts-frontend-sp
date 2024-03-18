import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import CampaignReview from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerReviewCampaignData {
    data: {
        campaign_id: number;
        campaign_notes?: string;
    },
    onTaskComplete?: () => void;
    taskType?: string;
}

export const TaskHandlerReviewCampaign = (props: TaskHandlerReviewCampaignData) => {
    const userData = useRecoilValue(userDataState)

    if (props.taskType == 'EMAIL_CAMPAIGN_REVIEW') {
        return (
            <CampaignReview onTaskComplete={props.onTaskComplete} campaignId={props.data.campaign_id} campaignType='EMAIL' campaignNotes={props.data.campaign_notes} />
        );
    }

    return (
        <CampaignReview onTaskComplete={props.onTaskComplete} campaignId={props.data.campaign_id} campaignType='LINKEDIN' campaignNotes={props.data.campaign_notes}/>
    );
}