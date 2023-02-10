import { createContext } from 'react';

export type PersonaDrawer = {
  readonly type: string,
  readonly opened: boolean,
}

const PersonaDrawerContext = createContext<{ personaDrawer: PersonaDrawer, setPersonaDrawer: (personaDrawer: PersonaDrawer) => void }>({
  personaDrawer: {
    type: '',
    opened: false,
  },
  setPersonaDrawer: (u: PersonaDrawer) => {},
});

export { PersonaDrawerContext };
