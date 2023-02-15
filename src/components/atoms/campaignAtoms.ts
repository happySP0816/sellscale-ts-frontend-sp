import { atom } from "recoil";

const campaignDrawerOpenState = atom({
  key: "campaign-drawer-open",
  default: false,
});

const campaignDrawerIdState = atom({
  key: "campaign-drawer-id",
  default: -1,
});

export {
  campaignDrawerOpenState,
  campaignDrawerIdState,
};
