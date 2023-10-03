import { atom } from "recoil";

const navTabState = atom({
  key: "nav-tab",
  default: '',
});

const navLoadingState = atom({
  key: "nav-loading",
  default: false,
});

const navConfettiState = atom({
  key: "nav-confetti",
  default: null as number | null,
});

export {
  navTabState,
  navLoadingState,
  navConfettiState,
};
