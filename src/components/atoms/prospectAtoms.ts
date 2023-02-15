import { atom } from "recoil";

const prospectDrawerOpenState = atom({
  key: "prospect-drawer-open",
  default: false,
});

const prospectSelectorTypeState = atom({
  key: "prospect-selector-type",
  default: 'all',
});

export {
  prospectDrawerOpenState,
  prospectSelectorTypeState,
};
