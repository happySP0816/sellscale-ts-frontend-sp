import { atom } from "recoil";

const navTabState = atom({
  key: "nav-tab",
  default: 'dashboard',
});

const navLoadingState = atom({
  key: "nav-loading",
  default: false,
});

export {
  navTabState,
  navLoadingState,
};
