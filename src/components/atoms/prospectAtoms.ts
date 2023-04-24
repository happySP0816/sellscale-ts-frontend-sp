import { atom } from "recoil";
import { Channel, ProspectNote } from "src";

const prospectDrawerOpenState = atom({
  key: "prospect-drawer-open",
  default: false,
});

const prospectDrawerIdState = atom({
  key: "prospect-drawer-id",
  default: -1,
});

const prospectDrawerNotesState = atom({
  key: "prospect-drawer-notes",
  default: [] as ProspectNote[],
});

const prospectDrawerStatusesState = atom({
  key: "prospect-drawer-statuses",
  default: { overall: '', linkedin: '', email: '' },
});

const prospectSelectorTypeState = atom({
  key: "prospect-selector-type",
  default: 'all',
});

const prospectChannelState = atom({
  key: "prospect-channel",
  default: 'SELLSCALE' as Channel,
});

const prospectShowPurgatoryState = atom({
  key: "prospect-show-purgatory",
  default: false,
});

export {
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectChannelState,
  prospectDrawerIdState,
  prospectDrawerNotesState,
  prospectDrawerStatusesState,
  prospectShowPurgatoryState,
};
