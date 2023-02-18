import { atom } from "recoil";

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

const prospectSelectorTypeState = atom({
  key: "prospect-selector-type",
  default: 'all',
});

const prospectStatusesState = atom({
  key: "prospect-statuses",
  default: [] as string[],
});

export {
  prospectDrawerOpenState,
  prospectSelectorTypeState,
  prospectStatusesState,
  prospectDrawerIdState,
  prospectDrawerCurrentStatusState,
};
