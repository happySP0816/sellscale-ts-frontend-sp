import { atom } from "recoil";

const uploadDrawerOpenState = atom({
  key: "persona-upload-drawer-open",
  default: false,
});

const prospectDrawerOpenState = atom({
  key: "prospect-drawer-open",
  default: false,
});

const linkedInCTAsDrawerOpenState = atom({
  key: "persona-linkedin-ctas-drawer-open",
  default: false,
});

const activePersonaState = atom({
  key: "active-persona",
  default: "1",
});

export {
  uploadDrawerOpenState,
  prospectDrawerOpenState,
  linkedInCTAsDrawerOpenState,
  activePersonaState,
};
