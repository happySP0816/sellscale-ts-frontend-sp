import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import CampaignReview from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerRequestCampaign {
    data: {},
    onTaskComplete?: () => void;
    taskId: number;
}

export const TaskHandlerRequestCampaign = (props: TaskHandlerRequestCampaign) => {
    const userToken = useRecoilValue(userTokenState)

    return (
        <>
        <iframe 
            src={'https://sellscale.retool.com/embedded/public/0b9b727e-9fe2-4e4d-86dd-97ef65dde166#authToken=' + userToken + "&taskId=" + props.taskId}
            width={'100%'}
            height={window.innerHeight - 30}
            frameBorder={0}
            allowFullScreen
        />
        </>
    );
}