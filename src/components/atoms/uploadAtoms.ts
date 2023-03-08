import { atom } from "recoil";

const prospectUploadDrawerOpenState = atom({
  key: "prospect-upload-drawer-open",
  default: false,
});

const prospectUploadDrawerIdState = atom({
  key: "prospect-upload-drawer-id",
  default: -1,
});

export {
  prospectUploadDrawerOpenState,
  prospectUploadDrawerIdState,
};
