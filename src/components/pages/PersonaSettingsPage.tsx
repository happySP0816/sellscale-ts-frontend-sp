import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import { PersonaBasicForm } from "@common/persona/PersonaBrain";
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
import { IconSettings } from "@tabler/icons";
import { activatePersona } from "@utils/requests/postPersonaActivation";
import { deactivatePersona } from "@utils/requests/postPersonaDeactivation";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function PersonaSettingsPage() {
  const userToken = useRecoilValue(userTokenState);

  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const [loading, setLoading] = useState(false);

  // Persona Basics
  const basics = useRef<{
    personaName: string;
    personaFitReason: string;
    personaICPMatchingInstructions: string;
    personaContactObjective: string;
    personaContractSize: number;
  }>();

  const triggerActivatePersona = async () => {
    setLoading(true);

    if (currentProject == null) {
      setLoading(false);
      return;
    }

    const result = await activatePersona(userToken, currentProject.id);
    if (result.status === "success") {
      showNotification({
        title: "Persona Activated",
        message: "Your persona has been activated.",
        color: "green",
      });
      setCurrentProject({ ...currentProject, active: true });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error activating your persona.",
        color: "red",
      });
    }

    setLoading(false);
  };

  const triggerBasicPersonaDeactivation = async () => {
    setLoading(true);

    if (currentProject == null) {
      setLoading(false);
      return;
    }

    const result = await deactivatePersona(userToken, currentProject.id, false);
    if (result.status === "success") {
      showNotification({
        title: "Persona Deactivated",
        message: "Your persona has been deactivated.",
        color: "blue",
      });
      setCurrentProject({ ...currentProject, active: false });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error deactivating your persona.",
        color: "red",
      });
    }

    setLoading(false);
  };

  const triggerHardPersonaDeactivation = async () => {
    setLoading(true);

    if (currentProject == null) {
      setLoading(false);
      return;
    }

    const result = await deactivatePersona(userToken, currentProject.id, true);
    if (result.status === "success") {
      showNotification({
        title: "Persona Deactivated",
        message: "Your persona has been deactivated.",
        color: "blue",
      });
      setCurrentProject({ ...currentProject, active: false });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error deactivating your persona.",
        color: "red",
      });
    }

    setLoading(false);
  };

  if (currentProject == null) {
    return null;
  }

  return (
    <PageFrame>
      <Container p="sm">
        <LoadingOverlay visible={loading} />
        <PageTitle title="Persona Settings" />
        <Tabs defaultValue="general" orientation="vertical">
          <Tabs.List>
            <Tabs.Tab value="general" icon={<IconSettings size="0.8rem" />}>
              General
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            <Flex ml="md" direction="column">
              <Card withBorder w="100%" mb="sm">
                <Title order={4}>General</Title>
                <Flex justify="space-between" align="center">
                  <Flex direction="column" maw="500px">
                    <Flex>
                      <Text>
                        Persona Name: <b>{currentProject.name}</b>
                      </Text>
                    </Flex>
                    <Flex align="center">
                      <Text>Persona Status:</Text>
                      <Tooltip
                        withArrow
                        withinPortal
                        label={
                          currentProject.active
                            ? "Your persona is active and is creating and sending messages."
                            : "Your persona is inactive and is not creating or sending messages."
                        }
                      >
                        <Badge
                          size="sm"
                          variant="filled"
                          color={currentProject.active ? "green" : "red"}
                          ml="6px"
                        >
                          {currentProject.active ? "Active" : "Inactive"}
                        </Badge>
                      </Tooltip>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Button
                      color="green"
                      disabled={currentProject.active}
                      onClick={() => {
                        triggerActivatePersona();
                      }}
                    >
                      Activate
                    </Button>
                  </Flex>
                </Flex>
              </Card>
              <Card withBorder w="100%" mb="sm">
                <Title order={4}>Customization</Title>
                <PersonaBasicForm
                  personaName={currentProject.name}
                  personaFitReason={currentProject.persona_fit_reason}
                  personaICPMatchingInstructions={
                    currentProject.icp_matching_prompt
                  }
                  personaContactObjective={
                    currentProject.persona_contact_objective
                  }
                  personaContractSize={currentProject.contract_size}
                  onUpdate={(data) => {
                    basics.current = data;
                  }}
                />
                <Button
                  mt="xs"
                  onClick={async () => {
                    const response = await fetch(
                      `${API_URL}/client/archetype/${currentProject.id}/update_description_and_fit`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${userToken}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          updated_persona_name: basics.current?.personaName,
                          updated_persona_fit_reason: basics.current?.personaFitReason,
                          updated_persona_icp_matching_prompt: basics.current?.personaICPMatchingInstructions,
                          updated_persona_contact_objective: basics.current?.personaContactObjective,
                          updated_persona_contract_size: basics.current?.personaContractSize,
                        }),
                      }
                    );
                    if(response.ok){
                      showNotification({
                        title: "Success",
                        message: "Persona details saved",
                        color: "blue",
                      });
                    }
                  }}
                >
                  Save Changes
                </Button>
              </Card>
              <Card withBorder shadow="sm" w="100%">
                <Title order={4}>Danger Zone</Title>
                <Card
                  mt="sm"
                  withBorder
                  radius="sm"
                  style={{ border: "1px solid #FAA0A0" }}
                >
                  <Flex justify="space-between" align="center">
                    <Flex direction="column" maw="500px">
                      <Title order={5}>Deactivate Persona</Title>
                      <Text fw="light" fz="sm" lh="1.2rem" mt="2px">
                        Deactivating your persona will stop any further
                        campaigns and messages. You can reactivate at any time.
                      </Text>
                    </Flex>
                    <Flex>
                      <Button
                        color="red"
                        disabled={!currentProject.active}
                        onClick={() => {
                          openConfirmModal({
                            title: (
                              <Title order={3}>
                                Deactivate Persona - {currentProject.name}
                              </Title>
                            ),
                            children: (
                              <>
                                <Text fs="italic">
                                  Please read the deactivation options below
                                  carefully.
                                </Text>
                                <Text mt="md">
                                  <b>Basic Deactivate:</b> Deactivating this
                                  persona will prevent any new message
                                  generation, but Prospects still in the
                                  pipeline will continue to receive messages.
                                </Text>
                                <Text mt="xs">
                                  <b>Hard Deactivate:</b> Hard deactivating this
                                  persona will wipe all messages from the
                                  pipeline and stop any and all contact with
                                  Prospects. Hard deactivating may take a few
                                  minutes.
                                </Text>
                                {/* <TextInput
                                  label='Confirm Deactivation'
                                  description='Please type in the name of the persona to confirm deactivation.'
                                  mt='md'
                                  withAsterisk
                                  value={dangerZoneConfirmation}
                                  onChange={(e) => setDangerZoneConfirmation(e.currentTarget.value)}
                                  error={
                                    (dangerZoneConfirmation && dangerZoneConfirmation !== currentProject.name) ? "Please type in the name of the persona to confirm deactivation." : null
                                  }
                                /> */}
                              </>
                            ),
                            labels: {
                              confirm: "Basic Deactivate",
                              cancel: "Hard Deactivate",
                            },
                            cancelProps: { color: "red", variant: "outline" },
                            confirmProps: { color: "red" },
                            onCancel: () => {
                              triggerHardPersonaDeactivation();
                            },
                            onConfirm: () => {
                              triggerBasicPersonaDeactivation();
                            },
                          });
                        }}
                      >
                        Deactivate
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              </Card>
            </Flex>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </PageFrame>
  );
}
