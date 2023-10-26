import { atom } from "recoil";
import { ProspectICP } from "src";

const filterRuleSetState = atom({
  key: "icp-filter-rule-set",
  default: {} as Record<string, any>,
});
const filterProspectsState = atom({
  key: "icp-filter-prospects",
  default: [] as ProspectICP[],
});

const filterDrawerOpenState = atom({
  key: 'filter-drawer-open',
  default: false,
});

export { filterRuleSetState, filterProspectsState, filterDrawerOpenState };
