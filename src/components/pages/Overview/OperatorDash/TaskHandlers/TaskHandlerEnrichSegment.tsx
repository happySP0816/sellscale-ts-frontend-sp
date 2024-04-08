import React from 'react';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';

interface TaskHandlerEnrichSegment {
  data: {
    segment_id: number;
  };
  onTaskComplete?: () => void;
  taskId?: number;
}

export const TaskHandlerEnrichSegment = (props: TaskHandlerEnrichSegment) => {
  const userToken = useRecoilValue(userTokenState);

  return (
    <iframe
      src={
        'https://sellscale.retool.com/embedded/public/376f96d0-7005-4bbc-a637-1b4920b79d60#authToken=' +
        userToken +
        '&segmentId=' +
        props.data['segment_id'] +
        '&taskId=' +
        props.taskId
      }
      width={'100%'}
      height={window.innerHeight - 30}
      frameBorder={0}
      allowFullScreen
    />
  );
};
