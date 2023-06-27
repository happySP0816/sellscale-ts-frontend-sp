import { atom } from "recoil";

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

export {
  openedProspectIdState,
  openedOutboundChannelState,
  openedBumpFameworksState,
  nurturingModeState,
};
