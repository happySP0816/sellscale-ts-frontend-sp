import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import CampaignReview from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerReviewSegment {
    data: {
        segment_id: number;
    },
    onTaskComplete?: () => void;
}

export const TaskHandlerReviewSegment = (props: TaskHandlerReviewSegment) => {
    const userToken = useRecoilValue(userTokenState)

    return (
        <iframe 
            src={'https://sellscale.retool.com/embedded/public/9aea3067-84d7-4afa-9aa8-3eda4450d04b#authToken=' + userToken + "&segmentId=" + props.data['segment_id']}
            width={'100%'}
            height={window.innerHeight - 30}
            frameBorder={0}
            allowFullScreen
        />
    );
}