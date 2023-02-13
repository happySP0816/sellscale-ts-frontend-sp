import { atom } from "recoil";

const userIdState = atom({
  key: "user-id",
  default: '0',
});

const userNameState = atom({
  key: "user-name",
  default: { first: 'Unknown', last: 'User' },
});

const userEmailState = atom({
  key: "user-email",
  default: 'unknown@sellscale.com',
});

export {
  userIdState,
  userNameState,
  userEmailState,
};
