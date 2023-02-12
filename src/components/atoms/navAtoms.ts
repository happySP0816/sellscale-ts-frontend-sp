import { atom } from "recoil";

const navTabState = atom({
  key: "nav-tab",
  default: 'home',
});

export {
  navTabState
};
