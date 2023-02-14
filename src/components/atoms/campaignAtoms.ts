import { atom } from "recoil";
import { Campaign } from "src/main";

const campaignDrawerOpenState = atom({
  key: "campaign-drawer-open",
  default: false,
});

const activeCampaignState = atom({
  key: "active-campaign",
  default: null as Campaign | null,
});

export {
  campaignDrawerOpenState,
  activeCampaignState,
};
