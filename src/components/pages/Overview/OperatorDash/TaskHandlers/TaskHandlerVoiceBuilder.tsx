import { VoiceBuilderSection } from '@modals/VoiceBuilderModal';

interface TaskHandlerVoiceBuilderData {
  data: {
    campaign_id: number;
  };
  onTaskComplete?: () => void;
}

export const TaskHandlerVoiceBuilder = (props: TaskHandlerVoiceBuilderData) => {
  return <VoiceBuilderSection archetypeId={props.data.campaign_id} regenOffset={65} />;
};
