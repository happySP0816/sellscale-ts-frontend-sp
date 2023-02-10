import { List, ThemeIcon, Text, Container, Stack, Flex, Title, useMantineTheme, Drawer, Group, Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useContext, useState } from "react";
import { SCREEN_SIZES } from "../../constants/data";
import { PersonaDrawerContext } from "../../contexts/personaDrawer";
import { UserContext } from "../../contexts/user";
import PageFrame from "../common/PageFrame";
import PersonaCard from "../common/persona/PersonaCard";

const PERSONAS = [{ name: "Persona 1" }, { name: "Persona 2" }, { name: "Persona 3" }]

export default function AboutPage() {

  const theme = useMantineTheme();
  const personaDrawerContext = useContext(PersonaDrawerContext);
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  const [openedUploadDrawer, setOpenedUploadDrawer] = useState(false);
  const [openedLinkedInCTAsDrawer, setOpenedLinkedInCTAsDrawer] = useState(false);

  return (
    <Container>
      <PageFrame>
      <PersonaCard

        name={'Test'}
        active={true}
      />
        {PERSONAS.map((persona) => (
          <PersonaCard
            key={persona.name}
            name={persona.name}
          />
        ))}
      </PageFrame>
    </Container>
  );

}
