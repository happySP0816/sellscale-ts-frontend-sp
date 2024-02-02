import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import CampaignReview from '@pages/CampaignReview/CampaignReviewLinkedin';

interface TaskHandlerSegmentCreationData {
    data: {
        segment_name?: string;
        enrichment_label?: string;
        enrichment_value?: string;
    },
    onTaskComplete?: () => void;
}

export const TaskHandlerSegmentCreation = (props: TaskHandlerSegmentCreationData) => {
    const userToken = useRecoilValue(userTokenState)

    const segmentName = props.data['segment_name'] || '';
    const enrichment_label = props.data['enrichment_label'] || '';
    const enrichment_value = props.data['enrichment_value'] || '';

    return (
        <>
            {console.log('segmentName', segmentName)}
            {console.log('enrichments', enrichment_label, enrichment_value)}
            <iframe 
                src={'https://sellscale.retool.com/embedded/public/3bcba3d6-fedb-4f07-a9fe-0506594f79f1#authToken=' + userToken + '&segmentName=' + segmentName + '&enrichment_label=' + enrichment_label + '&enrichment_value=' + enrichment_value}
                width={'100%'}
                height={window.innerHeight - 30}
                frameBorder={0}
                allowFullScreen
            />
        </>

    );
}