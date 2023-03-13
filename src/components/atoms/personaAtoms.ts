import { atom } from "recoil";

const uploadDrawerOpenState = atom({
  key: "persona-upload-drawer-open",
  default: false,
});

const detailsDrawerOpenState = atom({
  key: "persona-details-drawer-open",
  default: false,
});

const currentPersonaIdState = atom({
  key: "persona-current-id",
  default: -1,
});

export {
  uploadDrawerOpenState,
  detailsDrawerOpenState,
  currentPersonaIdState,
};
