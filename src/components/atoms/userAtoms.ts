import { atom } from "recoil";

const userNameState = atom({
  key: "user-name",
  default: localStorage.getItem("user-name") || '',
});

const userEmailState = atom({
  key: "user-email",
  default: localStorage.getItem("user-email") || '',
});

const userTokenState = atom({
  key: "user-token",
  default: localStorage.getItem("user-token") || '',
});

export {
  userNameState,
  userEmailState,
  userTokenState,
};
