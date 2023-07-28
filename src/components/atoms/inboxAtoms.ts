import { atom } from "recoil";
import { BumpFramework, Channel, EmailMessage, LinkedInMessage, ProspectEmail } from "src";

const openedProspectIdState = atom({
  key: "inbox-opened-prospect-id",
  default: -1,
});

const openedBumpFameworksState = atom({
  key: "inbox-opened-bump-framework-modal",
  default: false,
});

const fetchingProspectIdState = atom({
  key: "inbox-fetching-prospect-id",
  default: -1,
});

const nurturingModeState = atom({
  key: "inbox-nurturing-mode",
  default: false,
});

const selectedBumpFrameworkState = atom({
  key: "inbox-selected-bump-framework",
  default: undefined as BumpFramework | undefined,
});

const currentConvoChannelState = atom({
  key: "inbox-current-convo-channel",
  default: 'LINKEDIN' as Channel,
});
const currentConvoLiMessageState = atom({
  key: "inbox-current-convo-li-messages",
  default: undefined as LinkedInMessage[] | undefined,
});
const currentConvoEmailMessageState = atom({
  key: "inbox-current-convo-email-messages",
  default: undefined as EmailMessage[] | undefined,
});

export {
  openedProspectIdState,
  openedBumpFameworksState,
  nurturingModeState,
  selectedBumpFrameworkState,
  currentConvoChannelState,
  currentConvoLiMessageState,
  currentConvoEmailMessageState,
  fetchingProspectIdState
};
