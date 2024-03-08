import { VoiceBuilderSection } from '@modals/VoiceBuilderModal';

interface TaskHandlerVoiceBuilderData {
  data: {
    campaign_id: number;
  };
  onTaskComplete?: () => void;
}

export const TaskHandlerVoiceBuilder = (props: TaskHandlerVoiceBuilderData) => {
  if (!props.data.campaign_id) {
    return <></>;
  }

  return <VoiceBuilderSection archetypeId={props.data.campaign_id} regenOffset={65} />;
};
