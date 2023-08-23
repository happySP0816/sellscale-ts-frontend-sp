import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Title,
  Flex,
  Textarea,
  LoadingOverlay,
  Menu,
  Container,
  Box,
  ActionIcon,
  Stack,
  ScrollArea,
  Badge,
  Center,
  ThemeIcon,
  TextInput,
  Checkbox,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import CTAGeneratorExample from "@common/cta_generator/CTAGeneratorExample";
import { DateInput } from "@mantine/dates";
import { currentProjectState } from "@atoms/personaAtoms";
import { isLoggedIn } from "@auth/core";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { useNavigate } from "react-router-dom";
import {
  IconArrowsLeftRight,
  IconCopy,
  IconDots,
  IconMessageCircle,
  IconPhoto,
  IconPower,
  IconSearch,
  IconSettings,
  IconStack3,
  IconTrash,
} from "@tabler/icons";
import { useHover } from "@mantine/hooks";
import { navigateToPage } from "@utils/documentChange";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import displayNotification from "@utils/notificationFlow";
import { PersonaBasicForm } from "@common/persona/PersonaBrain";
import { clonePersona } from "@utils/requests/clonePersona";

export default function ClonePersonaModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ persona: PersonaOverview }>) {
  const theme = useMantineTheme();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  // Persona Basics
  const basics = useRef<{
    personaName: string;
    personaFitReason: string;
    personaICPMatchingInstructions: string;
    personaContactObjective: string;
  }>();

  // Clone Options
  const [cloneCTAs, setCloneCTAs] = useState(true);
  const [cloneBumpFrameworks, setCloneBumpFrameworks] = useState(true);
  const [cloneVoices, setCloneVoices] = useState(true);
  const [cloneEmailBlocks, setCloneEmailBlocks] = useState(true);

  return (
    <Paper
      p={0}
      h={"70vh"}
      style={{
        position: "relative",
      }}
    >
      <Stack>
        <PersonaBasicForm
          personaName={"Copy of " + innerProps.persona.name}
          personaFitReason={innerProps.persona.persona_fit_reason}
          personaICPMatchingInstructions={innerProps.persona.icp_matching_prompt}
          personaContactObjective={innerProps.persona.persona_contact_objective}
          personaContractSize={innerProps.persona.contract_size}
          onUpdate={(data) => {
            basics.current = data;
          }}
        />

        <Box>
          <Text>
            What sections would you like to clone from the existing persona?
          </Text>
          <Stack my='sm' spacing={10}>
            <Checkbox
              checked={cloneCTAs}
              onChange={(event) => setCloneCTAs(event.currentTarget.checked)}
              label="CTAs"
            />
            <Checkbox
              checked={cloneBumpFrameworks}
              onChange={(event) =>
                setCloneBumpFrameworks(event.currentTarget.checked)
              }
              label="Bump Frameworks"
            />
            <Checkbox
              checked={cloneVoices}
              onChange={(event) => setCloneVoices(event.currentTarget.checked)}
              label="Voices"
            />
            <Checkbox
              checked={cloneEmailBlocks}
              onChange={(event) =>
                setCloneEmailBlocks(event.currentTarget.checked)
              }
              label="Email Blocks"
            />
          </Stack>

          <Box m='sm'>
            <Center>
              <Button
                variant="light"
                loading={loading}
                leftIcon={<IconCopy size='0.9rem' />}
                onClick={async () => {
                  if(!basics.current) { return; }

                  setLoading(true);
                  const response = await clonePersona(userToken, innerProps.persona.id, basics.current, {
                    ctas: cloneCTAs,
                    bumpFrameworks: cloneBumpFrameworks,
                    voices: cloneVoices,
                    emailBlocks: cloneEmailBlocks,
                  });
                  if(response.status === 'success') {
                    // Success!
                  }
                  setLoading(false);
                  
                  context.closeModal(id);
                }}
              >Create Clone</Button>
            </Center>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
