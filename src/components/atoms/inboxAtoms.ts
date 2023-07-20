import { atom } from "recoil";
import { BumpFramework, LinkedInMessage } from "src";

const openedProspectIdState = atom({
  key: "inbox-opened-prospect-id",
  default: -1,
});

const openedOutboundChannelState = atom({
  key: "inbox-opened-outbound-channel",
  default: 'linkedin',
});

const openedBumpFameworksState = atom({
  key: "inbox-opened-bump-framework-modal",
  default: false,
});

const nurturingModeState = atom({
  key: "inbox-nurturing-mode",
  default: false,
});

const selectedBumpFrameworkState = atom({
  key: "inbox-selected-bump-framework",
  default: undefined as BumpFramework | undefined,
});

const currentConvoMessageState = atom({
  key: "inbox-current-convo-messages",
  default: undefined as LinkedInMessage[] | undefined,
});

export {
  openedProspectIdState,
  openedOutboundChannelState,
  openedBumpFameworksState,
  nurturingModeState,
  selectedBumpFrameworkState,
  currentConvoMessageState,
};
