import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import SchedulingReview from '@pages/SchedulingReview';
import { ProspectDetails } from '@pages/ProspectDetail';

interface TaskHandlerViewProspectData {
  data: {
    prospect_id: number;
    prospect_full_name: string;
  };
  onTaskComplete?: () => void;
}

export const TaskHandlerViewProspect = (props: TaskHandlerViewProspectData) => {
  return <ProspectDetails prospectId={props.data.prospect_id} />;
};
