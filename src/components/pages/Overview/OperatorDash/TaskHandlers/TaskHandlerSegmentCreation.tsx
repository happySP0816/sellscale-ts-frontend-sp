import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import CampaignReviewLinkedin from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerSegmentCreationData {
    data: {},
    onTaskComplete?: () => void;
}

export const TaskHandlerSegmentCreation = (props: TaskHandlerSegmentCreationData) => {
    const userToken = useRecoilValue(userTokenState)

    return (
        <iframe 
            src={'https://sellscale.retool.com/embedded/public/3bcba3d6-fedb-4f07-a9fe-0506594f79f1#authToken=' + userToken}
            width={'100%'}
            height={window.innerHeight - 30}
            frameBorder={0}
            allowFullScreen
        />

    );
}