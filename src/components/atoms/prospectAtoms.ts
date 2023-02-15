import { atom } from "recoil";

const prospectDrawerOpenState = atom({
  key: "prospect-drawer-open",
  default: false,
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
};
