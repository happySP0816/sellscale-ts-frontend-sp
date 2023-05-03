import { atom } from "recoil";

const schedulingDrawerOpenState = atom({
  key: "dash-scheduling-drawer-open",
  default: false,
});

const questionsDrawerOpenState = atom({
  key: "dash-questions-drawer-open",
  default: false,
});

const demosDrawerOpenState = atom({
  key: "dash-demos-drawer-open",
  default: false,
});

const dashCardSeeAllDrawerOpenState = atom({
  key: "dash-see-all-drawer-open",
  default: false,
});

export {
  schedulingDrawerOpenState,
  questionsDrawerOpenState,
  demosDrawerOpenState,
  dashCardSeeAllDrawerOpenState,
};
