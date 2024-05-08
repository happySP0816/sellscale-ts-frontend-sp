import { atom } from 'recoil';
import { ClientSDR } from 'src';

const userTokenState = atom({
  key: 'user-token',
  default: localStorage.getItem('user-token') || '',
});

const userDataState = atom({
  key: 'user-data',
  default: (JSON.parse(localStorage.getItem('user-data') ?? '{}') || {}) as ClientSDR,
});

const adminDataState = atom({
  key: 'admin-data',
  default: (JSON.parse(localStorage.getItem('admin-data') ?? '{}') || {}) as ClientSDR | null,
});

export { userTokenState, userDataState, adminDataState };
