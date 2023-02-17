import { atom } from "recoil";

const uploadDrawerOpenState = atom({
  key: "persona-upload-drawer-open",
  default: false,
});

const linkedInCTAsDrawerOpenState = atom({
  key: "persona-linkedin-ctas-drawer-open",
  default: false,
});

const currentPersonaIdState = atom({
  key: "persona-current-id",
  default: -1,
});

export {
  uploadDrawerOpenState,
  linkedInCTAsDrawerOpenState,
  currentPersonaIdState,
};
