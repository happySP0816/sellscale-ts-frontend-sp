import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { Card, Flex, Title, Text, Tooltip, Badge, Button, Divider, Box } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { activatePersona } from "@utils/requests/postPersonaActivation";
import { deactivatePersona } from "@utils/requests/postPersonaDeactivation";
import { useRecoilState, useRecoilValue } from "recoil";
import { PersonaBasicForm } from "../PersonaBrain";
import { useRef } from "react";
import { API_URL } from "@constants/data";

export const PersonaGeneral = () => {
  const userToken = useRecoilValue(userTokenState);

  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);

  // Persona Basics
  const basics = useRef<{
    personaName: string;
    personaFitReason: string;
    personaICPMatchingInstructions: string;
    personaContactObjective: string;
    personaContractSize: number;
    personaCTAFrameworkCompany: string;
    personaCTAFrameworkPersona: string;
    personaCTAFrameworkAction: string;
    personaUseCases: string;
    personaFilters: string;
    personaLookalikeProfile1: string;
    personaLookalikeProfile2: string;
    personaLookalikeProfile3: string;
    personaLookalikeProfile4: string;
    personaLookalikeProfile5: string;
  }>();

  const triggerActivatePersona = async () => {
    if (currentProject == null) {
      alert("No current project");
      return;
    }
    
    const result = await activatePersona(userToken, currentProject?.id);
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
  };

  const triggerBasicPersonaDeactivation = async () => {

    if (currentProject == null) {
      alert("No current project");
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
  };

  const triggerHardPersonaDeactivation = async () => {
    if (currentProject == null) {
      alert("No current project");
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
  };


  if (!currentProject) { return null; }

  return (
    <>
      {/* Customization */}
      <Card withBorder w="100%" mb="sm">
        {/* <Title order={4}>Customization</Title> */}
        {/* <Box sx={{maxHeight: '650px', overflowY: 'scroll'}}> */}
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
            personaCTAFrameworkCompany={
              currentProject.cta_framework_company
            }
            personaCTAFrameworkPersona={
              currentProject.cta_framework_persona
            }
            personaCTAFrameworkAction={
              currentProject.cta_framework_action
            }
            personaUseCases={currentProject.use_cases}
            personaFilters={currentProject.filters}
            personaLookalikeProfile1={
              currentProject.lookalike_profile_1
            }
            personaLookalikeProfile2={
              currentProject.lookalike_profile_2
            }
            personaLookalikeProfile3={
              currentProject.lookalike_profile_3
            }
            personaLookalikeProfile4={
              currentProject.lookalike_profile_4
            }
            personaLookalikeProfile5={
              currentProject.lookalike_profile_5
            }
            onUpdate={(data) => {
              basics.current = data;
              console.log(data.personaName)
            }}
          />
        {/* </Box> */}
        <Flex justify='flex-end'>
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
                    updated_cta_framework_company: basics.current?.personaCTAFrameworkCompany,
                    updated_cta_framework_persona: basics.current?.personaCTAFrameworkPersona,
                    updated_cta_framework_action: basics.current?.personaCTAFrameworkAction,
                    updated_use_cases: basics.current?.personaUseCases,
                    updated_filters: basics.current?.personaFilters,
                    updated_lookalike_profile_1: basics.current?.personaLookalikeProfile1,
                    updated_lookalike_profile_2: basics.current?.personaLookalikeProfile2,
                    updated_lookalike_profile_3: basics.current?.personaLookalikeProfile3,
                    updated_lookalike_profile_4: basics.current?.personaLookalikeProfile4,
                    updated_lookalike_profile_5: basics.current?.personaLookalikeProfile5,
                  }),
                }
              );
              if (response.ok) {
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
        </Flex>
      </Card>

      <Divider mt='lg' mb='lg' />


      {/* Danger Zone */}
      <Card withBorder shadow="sm" w="100%" sx={{backgroundColor: '#f8f9fa'}}>
        <Title order={4}>Persona Toggle</Title>
        <Text size='xs'>This section is recommended for SellScale internal use only.</Text>
        <Card mt='sm' withBorder radius='sm' style={{border: '1px solid gray;', backgroundColor: '#f8f9fa'}}>
          <Flex justify="space-between" align="center">
            <Flex direction="column" maw="500px">
              <Flex align="center">
                <Text>Status:</Text>
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
              <Button
                color="red"
                disabled={!currentProject.active}
                ml='xs'
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
    </>
  )
}

function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}
