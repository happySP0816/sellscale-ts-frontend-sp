import { atom } from "recoil";

const voiceBuilderMessagesState = atom({
  key: "voice-builder-messages",
  default: [] as { id: number, value: string, saved: boolean }[],
});

export {
  voiceBuilderMessagesState,
};
