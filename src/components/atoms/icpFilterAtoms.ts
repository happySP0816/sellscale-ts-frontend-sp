import { atom } from "recoil";
import { Prospect } from "src";

const filterRuleSetState = atom({
  key: "icp-filter-rule-set",
  default: {} as Record<string, any>,
});

export {
  filterRuleSetState,
};
