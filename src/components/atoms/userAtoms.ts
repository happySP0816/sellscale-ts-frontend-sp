import { atom } from "recoil";

const userNameState = atom({
  key: "user-name",
  default: '',
});

const userEmailState = atom({
  key: "user-email",
  default: '',
});

const userTokenState = atom({
  key: "user-token",
  default: '',
});

export {
  userNameState,
  userEmailState,
  userTokenState,
};
