import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import { PersonaBasicForm } from "@common/persona/PersonaBrain";
import { PersonaCompanyInfo } from "@common/persona/settings/PersonaCompanyInfo";
import { PersonaMessaging } from "@common/persona/settings/PersonaMessaging";
import { PersonaUserSettings } from "@common/persona/settings/PersonaUserSettings";
import { PersonaGeneral } from "@common/persona/settings/PersonalGeneral";
import { API_URL } from "@constants/data";
import {
  Card,
  Container,
  Flex,
  Tabs,
  Title,
  Text,
  Button,
  Badge,
  Tooltip,
  TextInput,
  LoadingOverlay,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import PageTitle from "@nav/PageTitle";
import { IconBrain, IconBuilding, IconMessage, IconSettings, IconUser } from "@tabler/icons";
import { activatePersona } from "@utils/requests/postPersonaActivation";
import { deactivatePersona } from "@utils/requests/postPersonaDeactivation";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function PersonaSettingsPage() {
  const userToken = useRecoilValue(userTokenState);

  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const [loading, setLoading] = useState(false);

  if (currentProject == null) {
    return null;
  }

  return (
    <PageFrame>
      <Container p="sm">
        <LoadingOverlay visible={loading} />
        <PageTitle title={`${currentProject.name} - Settings`} />
        <Tabs defaultValue="general" orientation="vertical">
          <Tabs.List>
            <Tabs.Tab value="general" icon={<IconSettings size="0.8rem" />}>
              Persona Info
            </Tabs.Tab>
            <Tabs.Tab value="company" icon={<IconBuilding size="0.8rem" />}>
              Company Info
            </Tabs.Tab>
            <Tabs.Tab value="user" icon={<IconUser size="0.8rem" />}>
              User Info
            </Tabs.Tab>
            <Tabs.Tab value="messaging" icon={<IconMessage size="0.8rem" />}>
              Messaging
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            <Flex ml="md" direction="column">
              <PersonaGeneral />
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="company">
            <Flex ml='md'>
              <PersonaCompanyInfo />
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="user">
            <Flex ml='md'>
              <PersonaUserSettings />
            </Flex>
          </Tabs.Panel>

          <Tabs.Panel value="messaging">
            <Flex ml='md'>
              <PersonaMessaging />
            </Flex>
          </Tabs.Panel>

        </Tabs>
      </Container>
    </PageFrame>
  );
}
