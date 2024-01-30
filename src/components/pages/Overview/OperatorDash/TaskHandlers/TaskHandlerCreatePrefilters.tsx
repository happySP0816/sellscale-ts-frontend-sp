import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import CampaignReviewLinkedin from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerCreatePrefilters {
    data: {},
    onTaskComplete?: () => void;
}

export const TaskHandlerCreatePrefilters = (props: TaskHandlerCreatePrefilters) => {
    const userToken = useRecoilValue(userTokenState)

    return (
        <iframe 
            src={'https://sellscale.retool.com/embedded/public/80a08f60-8b0d-4ff8-a90a-c22cdcd3a4be#authToken=' + userToken}
            width={'100%'}
            height={window.innerHeight - 30}
            frameBorder={0}
            allowFullScreen
        />

    );
}