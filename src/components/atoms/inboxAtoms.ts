import { atom } from "recoil";

const openedProspectIdState = atom({
  key: "inbox-opened-prospect-id",
  default: -1,
});

const openedOutboundChannelState = atom({
  key: "inbox-opened-outbound-channel",
  default: 'linkedin',
});

export {
  openedProspectIdState,
  openedOutboundChannelState,
};
