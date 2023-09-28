import { atom } from "recoil";
import { Prospect, ProspectICP } from "src";

const filterRuleSetState = atom({
  key: "icp-filter-rule-set",
  default: {} as Record<string, any>,
});
const filterProspectsState = atom({
  key: "icp-filter-prospects",
  default: [] as ProspectICP[],
});

export {
  filterRuleSetState,
  filterProspectsState,
};
