import React, { forwardRef, useImperativeHandle } from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import CampaignReview from '@pages/CampaignReview/CampaignReviewLinkedin';
import CampaignChannelPage from '@pages/CampaignChannelPage';
import { Card } from '@mantine/core';
import postTogglePersonaActive from '@utils/requests/postTogglePersonaActive';

interface TaskHandlerReviewCampaignData {
  data: {
    campaign_id: number;
    campaign_notes?: string;
  };
  onTaskComplete?: () => void;
  taskType?: string;
}

export default forwardRef(function TaskHandlerReviewCampaign(
  props: TaskHandlerReviewCampaignData,
  ref
) {
  const userToken = useRecoilValue(userTokenState);

  useImperativeHandle(
    ref,
    () => {
      return {
        triggerTaskComplete: async () => {
          if (props.taskType === 'BOTH_CAMPAIGN_REVIEW') {
            await postTogglePersonaActive(userToken, props.data.campaign_id, 'linkedin', true);
            await postTogglePersonaActive(userToken, props.data.campaign_id, 'email', true);
          } else {
            await postTogglePersonaActive(
              userToken,
              props.data.campaign_id,
              props.taskType == 'LINKEDIN_CAMPAIGN_REVIEW' ? 'linkedin' : 'email',
              true
            );
          }
        },
      };
    },
    [userToken]
  );

  const hideEmail = props.taskType == 'LINKEDIN_CAMPAIGN_REVIEW';
  const hideLinkedIn = props.taskType == 'EMAIL_CAMPAIGN_REVIEW';

  return (
    <>
      <CampaignChannelPage
        cType={hideEmail ? 'email' : 'linkedin'}
        campaignId={props.data.campaign_id}
        hideEmail={hideEmail}
        hideLinkedIn={hideLinkedIn}
        hideAssets
        hideHeader
      />
    </>
  );
});
