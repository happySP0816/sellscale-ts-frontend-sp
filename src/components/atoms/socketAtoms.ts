import { atom } from "recoil";
import { Socket } from "socket.io-client";

const socketState = atom({
  key: 'socket',
  default: null as Socket | null,
});

export { socketState };
