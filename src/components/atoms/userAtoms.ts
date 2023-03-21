import { atom } from "recoil";

const userTokenState = atom({
  key: "user-token",
  default: localStorage.getItem("user-token") || '',
});

const userDataState = atom({
  key: "user-data",
  default: JSON.parse(localStorage.getItem("user-data") ?? '{}') || {},
});

export {
  userTokenState,
  userDataState,
};
