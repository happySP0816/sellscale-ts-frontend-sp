import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  LoadingOverlay,
  NumberInput,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import displayNotification from "@utils/notificationFlow";
import { MsgResponse } from "src";
import { showNotification } from "@mantine/notifications";
import { currentProjectState } from "@atoms/personaAtoms";
type PropsType = {
  archetype_id?: number;
};

export default function PersonaBrain(props: PropsType) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedPersona, setFetchedPersona] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(false);

  const [personaName, setPersonaName] = useState("");
  const [loadingPersonaFitReason, setLoadingPersonaFitReason] = useState(false);
  const [personaFitReason, setPersonaFitReason] = useState("");
  const [personaICPMatchingInstructions, setPersonaICPMatchingInstructions] =
    useState("");
  const [personaContactObjective, setPersonaContactObjective] = useState("");
  const [personaContractSize, setPersonaContractSize] = useState(0);
  const [needsSave, setNeedsSave] = useState(false);

  const currentProject = useRecoilValue(currentProjectState);

  const archetype_id = props.archetype_id || currentProject?.id;

  const fetchPersonaDetails = async () => {
    setLoadingPersona(true);
    await fetch(`${API_URL}/client/archetype/${archetype_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((persona) => {
        setPersonaName(persona.archetype);
        setPersonaFitReason(persona.persona_fit_reason);
        setPersonaICPMatchingInstructions(persona.icp_matching_prompt);
        setPersonaContactObjective(persona.persona_contact_objective);

        setFetchedPersona(true);
      })
      .catch((err) => {
        console.log(err);
      });
    setLoadingPersona(false);
    setNeedsSave(false);
  };

  const savePersonaDetails = async () => {
    setLoadingPersona(true);
    await fetch(
      `${API_URL}/client/archetype/${archetype_id}/update_description_and_fit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updated_persona_name: personaName,
          updated_persona_fit_reason: personaFitReason,
          updated_persona_icp_matching_prompt: personaICPMatchingInstructions,
          updated_persona_contact_objective: personaContactObjective,
        }),
      }
    )
      .then((res) => res.json())
      .then((persona) => {
        setPersonaName(persona.archetype);
        setPersonaFitReason(persona.persona_fit_reason);
        setPersonaICPMatchingInstructions(persona.icp_matching_prompt);
        showNotification({
          title: "Success",
          message: "Persona details saved",
          color: "blue",
        });
      })
      .catch((err) => {
        console.log(err);
      });
    setLoadingPersona(false);
    fetchPersonaDetails();
  };

  useEffect(() => {
    fetchPersonaDetails();
  }, [archetype_id]);

  if (!archetype_id) {
    return <></>;
  }

  return (
    <Flex>
      <Container mt="md">
        <Card>
          <LoadingOverlay visible={loadingPersona} overlayBlur={2} />
          <Title order={4}>Persona Brain</Title>
          <Text size="sm" mb="lg">
            This is what SellScale knows about this persona. Adjust the
            information below to improve the accuracy of SellScale's
            recommendations, message generations, email generations, and more.
          </Text>

          {fetchedPersona && (
            <PersonaBasicForm
              personaName={personaName}
              personaFitReason={personaFitReason}
              personaICPMatchingInstructions={personaICPMatchingInstructions}
              personaContactObjective={personaContactObjective}
              personaContractSize={personaContractSize}
              onUpdate={(data) => {
                setPersonaName(data.personaName);
                setPersonaFitReason(data.personaFitReason);
                setPersonaICPMatchingInstructions(
                  data.personaICPMatchingInstructions
                );
                setPersonaContactObjective(data.personaContactObjective);
                setPersonaContractSize(data.personaContractSize);
                setNeedsSave(true);
              }}
            />
          )}

          <Button
            color="blue"
            variant="light"
            mt="md"
            disabled={!needsSave}
            onClick={savePersonaDetails}
          >
            Save Persona Information
          </Button>
          <Button
            color="red"
            variant="outline"
            mt="md"
            ml="lg"
            onClick={fetchPersonaDetails}
            hidden={!needsSave}
          >
            Cancel Edits
          </Button>
        </Card>
      </Container>
    </Flex>
  );
}

export function PersonaBasicForm(props: {
  personaName: string;
  personaFitReason: string;
  personaICPMatchingInstructions: string;
  personaContactObjective: string;
  personaContractSize: number;
  onUpdate: (data: {
    personaName: string;
    personaFitReason: string;
    personaICPMatchingInstructions: string;
    personaContactObjective: string;
    personaContractSize: number;
  }) => void;
}) {
  const [userToken] = useRecoilState(userTokenState);

  const [personaName, setPersonaName] = useState(props.personaName);
  const [loadingPersonaFitReason, setLoadingPersonaFitReason] = useState(false);
  const [personaFitReason, setPersonaFitReason] = useState(
    props.personaFitReason
  );
  const [personaICPMatchingInstructions, setPersonaICPMatchingInstructions] =
    useState(props.personaICPMatchingInstructions);
  const [personaContactObjective, setPersonaContactObjective] = useState(
    props.personaContactObjective
  );
  const [personaContractSize, setPersonaContractSize] = useState(
    props.personaContractSize
  );

  const generatePersonaBuyReason = async (): Promise<MsgResponse> => {
    setLoadingPersonaFitReason(true);
    const res = await fetch(
      `${API_URL}/client/archetype/generate_persona_buy_reason`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona_name: personaName,
        }),
      }
    )
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: "Success",
            message: "Persona buying reason generated successfully",
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Failed to generate persona buying reason",
            data: {},
          };
        }
      })
      .catch((e) => {
        return {
          status: "error",
          title: "Error",
          message: e.message,
          data: {},
        };
      });
    setPersonaFitReason(res.data.description);
    setLoadingPersonaFitReason(false);
    sendUpdate();
    return res as MsgResponse;
  };

  const sendUpdate = (hardcodeKey?: string, hardcodeValue?: any) => {
    let update: any = {
      personaName: personaName,
      personaFitReason: personaFitReason,
      personaICPMatchingInstructions: personaICPMatchingInstructions,
      personaContactObjective: personaContactObjective,
      personaContractSize: personaContractSize,
    }
    if (hardcodeKey && hardcodeValue) {
      update[hardcodeKey] = hardcodeValue
    }
    props.onUpdate(update)
  };

  // useEffect(() => {
  //   sendUpdate();
  // }, []);

  return (
    <Box>
      <TextAreaWithAI
        label="Descriptive Persona Name"
        description='Give a short name to this persona. For example, "Sales Manager" or "Marketing Director". The AI will use this name when generating messages and splitting prospects.'
        minRows={1}
        value={personaName}
        onChange={(e) => {
          setPersonaName(e.currentTarget.value)
          sendUpdate(
            "personaName",
            e.currentTarget.value
          );
        }}
      />
      {/* <TextAreaWithAI
          label="Persona Profile"
          description="Generated profile of this persona"
          minRows={4}
          value={''}
          onChange={(e) => {
          }}
        /> */}
      <TextAreaWithAI
        label="Why do they buy your product?"
        description="Explain why this persona is a good fit for your product or service. This will be used by the AI to generate emails and messages."
        minRows={4}
        value={personaFitReason}
        onChange={(e) => {
          setPersonaFitReason(e.currentTarget.value);
          sendUpdate(
            "personaFitReason",
            e.currentTarget.value
          );
        }}
        loadingAIGenerate={loadingPersonaFitReason}
        onAIGenerateClicked={async () => {
          await displayNotification(
            "generate-persona-buy-reason",
            generatePersonaBuyReason,
            {
              title: "Generating persona buying reason...",
              message: "This may take a few seconds.",
              color: "teal",
            },
            {
              title: "Persona buying reason generated!",
              message: "Your persona buying reason has been generated.",
              color: "teal",
            },
            {
              title: "Failed to generate persona buying reason",
              message: "Please try again or contact SellScale team.",
              color: "red",
            }
          );
        }}
      />
      {/* TODO(AAKASH) delete component below if no use by July 20, 2023 */}
      {false && (
        <TextAreaWithAI
          label="Rich Persona Description"
          description="Explain how to match a prospect to this persona's ICP. Include details like seniority, tiers, company size, other notes, etc. Note that the AI will use this information to rank your prospects."
          minRows={4}
          value={personaICPMatchingInstructions}
          onChange={(e) => {
            setPersonaICPMatchingInstructions(e.currentTarget.value);
            sendUpdate(
              "personaICPMatchingInstructions",
              e.currentTarget.value
            );
          }}
        />
      )}
      <TextAreaWithAI
        label="Persona contact objective"
        description="Explain what you want to achieve when contacting this persona. For example, you may want to schedule a demo, or you may want to get a referral. The AI will use this information to generate messages."
        minRows={4}
        value={personaContactObjective}
        onChange={(e) => {
          setPersonaContactObjective(e.currentTarget.value);
          sendUpdate(
            "personaContactObjective",
            e.currentTarget.value
          );
        }}
      />
      <NumberInput
        label="Annual Contract Value (ACV)"
        value={personaContractSize}
        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        formatter={(value) =>
          !Number.isNaN(parseFloat(value))
            ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
            : "$ "
        }
        onChange={(value) => {
          setPersonaContractSize(value || 0);
          sendUpdate(
            "personaContractSize",
            value || 0
          );
        }}
      />
    </Box>
  );
}
