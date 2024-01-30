import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import SchedulingFeedbackReview from '@pages/SchedulingFeedbackReview';

interface TaskHandlerSchedulingFeedbackData {
  data: {
    prospect_id: number;
    prospect_full_name: string;
    prospect_demo_date_formatted: string;
  };
  onTaskComplete?: () => void;
}

export const TaskHandlerSchedulingFeedback = (props: TaskHandlerSchedulingFeedbackData) => {
  const userToken = useRecoilValue(userTokenState);

  return (
    <SchedulingFeedbackReview
      prospect_id={props.data.prospect_id}
      prospect_full_name={props.data.prospect_full_name}
      prospect_demo_date_formatted={props.data.prospect_demo_date_formatted}
    />
  );
};
