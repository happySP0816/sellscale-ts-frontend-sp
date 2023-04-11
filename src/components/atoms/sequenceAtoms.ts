import { atom } from "recoil";

const sequenceDrawerOpenState = atom({
  key: "sequence-drawer-open",
  default: false,
});

export {
  sequenceDrawerOpenState,
};
