import { atom } from "recoil";
import { Channel, ProspectNote } from "src/main";

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

const prospectSelectorTypeState = atom({
  key: "prospect-selector-type",
  default: 'all',
});

const prospectStatusesState = atom({
  key: "prospect-statuses",
  default: [] as string[],
});

const prospectChannelState = atom({
  key: "prospect-channel",
  default: 'SELLSCALE' as Channel,
});

export {
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectStatusesState,
  prospectChannelState,
  prospectDrawerIdState,
  prospectDrawerNotesState,
};
