import { atom } from "recoil";

const campaignDrawerOpenState = atom({
  key: "campaign-drawer-open",
  default: false,
});

export {
  campaignDrawerOpenState,
};
