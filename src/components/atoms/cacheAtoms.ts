import { atom } from "recoil";

const companyImageCacheState = atom({
  key: "company-image-cache",
  default: new Map<string, string>(),
});

export {
  companyImageCacheState,
};
