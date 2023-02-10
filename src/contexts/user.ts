import { createContext } from 'react';

export type User = {
  readonly localId: string,
}

const UserContext = createContext<{ user: User, setUser: (user: User) => void }>({
  user: {
    localId: '',
  },
  setUser: (u: User) => {},
});

export { UserContext };
