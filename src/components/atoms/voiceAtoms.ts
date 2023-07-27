import { atom } from "recoil";
import { Prospect } from "src";

const voiceBuilderMessagesState = atom({
  key: "voice-builder-messages",
  default: [] as { id: number, value: string, prospect: Prospect | null, meta_data: any }[],
});

export {
  voiceBuilderMessagesState,
};
