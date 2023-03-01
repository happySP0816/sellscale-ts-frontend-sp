import { atom } from "recoil";
import { ProspectNote } from "src/main";

const prospectDrawerOpenState = atom({
  key: "prospect-drawer-open",
  default: false,
});

const prospectDrawerIdState = atom({
  key: "prospect-drawer-id",
  default: -1,
});

const prospectDrawerCurrentStatusState = atom({
  key: "prospect-drawer-current-status",
  default: 'UNKNOWN',
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
  default: '',
});

export {
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectStatusesState,
  prospectChannelState,
  prospectDrawerIdState,
  prospectDrawerCurrentStatusState,
  prospectDrawerNotesState,
};
