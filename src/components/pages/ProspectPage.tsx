import {
  List,
  ThemeIcon,
  Text,
  Container,
  Stack,
  Flex,
  Title,
  useMantineTheme,
  Drawer,
  Group,
  Button,
  Paper,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useContext, useState } from "react";
import { useRecoilState } from "recoil";
import { SCREEN_SIZES } from "../../constants/data";
import { UserContext } from "../../contexts/user";
import {
  activePersonaState,
  linkedInCTAsDrawerOpenState,
  uploadDrawerOpenState,
} from "../atoms/personaAtoms";
import PageFrame from "../common/PageFrame";
import PersonaCard from "../common/persona/PersonaCard";
import LinkedInCTAsDrawer from "../drawers/LinkedInCTAsDrawer";
import PersonaUploadDrawer from "../drawers/PersonaUploadDrawer";

const PERSONAS = [
  { value: "1", name: "Heads of Marketing" },
  { value: "2", name: "VIP Tandem List - Manafacturing" },
  { value: "3", name: "Executive Designers" },
];

export default function AboutPage() {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  const [activePersona, setActivePersona] = useRecoilState(activePersonaState);

  return (
    <>
      <PageFrame>
        <Paper withBorder p="md" radius="md">
          {PERSONAS.filter((persona) => persona.value === activePersona).map(
            (persona) => (
              // Should always be only 1 active card
              <PersonaCard
                key={persona.value}
                value={persona.value}
                name={persona.name}
                active={true}
              />
            )
          )}
          {PERSONAS.filter((persona) => persona.value !== activePersona).map(
            (persona) => (
              <PersonaCard
                key={persona.value}
                value={persona.value}
                name={persona.name}
              />
            )
          )}
        </Paper>
      </PageFrame>
      <LinkedInCTAsDrawer />
      <PersonaUploadDrawer />
    </>
  );
}
