import {
  Button,
  Card,
  Container,
  Flex,
  LoadingOverlay,
  Text,
  Title,
} from "@mantine/core";
import PersonaSplitSelect from "./PersonaSplitSelect";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import displayNotification from "@utils/notificationFlow";
import { MsgResponse } from "src";
type PropsType = {
  archetype_id: number;
};

export default function PersonaBrain(props: PropsType) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedPersona, setFetchedPersona] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(false);

  const [personaName, setPersonaName] = useState("");
  const [loadingPersonaDescription, setLoadingPersonaDescription] = useState(
    false
  );
  const [personaDescription, setPersonaDescription] = useState("");
  const [loadingPersonaFitReason, setLoadingPersonaFitReason] = useState(false);
  const [personaFitReason, setPersonaFitReason] = useState("");
  const [
    personaICPMatchingInstructions,
    setPersonaICPMatchingInstructions,
  ] = useState("");
  const [needsSave, setNeedsSave] = useState(false);

  const fetchPersonaDetails = async () => {
    setLoadingPersona(true);
    await fetch(`${API_URL}/client/archetype/${props.archetype_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((persona) => {
        setPersonaName(persona.archetype);
        setPersonaDescription(persona.persona_description);
        setPersonaFitReason(persona.persona_fit_reason);
        setPersonaICPMatchingInstructions(persona.icp_matching_prompt);
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
      `${API_URL}/client/archetype/${props.archetype_id}/update_description_and_fit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updated_persona_name: personaName,
          updated_persona_description: personaDescription,
          updated_persona_fit_reason: personaFitReason,
          updated_persona_icp_matching_prompt: personaICPMatchingInstructions,
        }),
      }
    )
      .then((res) => res.json())
      .then((persona) => {
        setPersonaName(persona.archetype);
        setPersonaDescription(persona.persona_description);
        setPersonaFitReason(persona.persona_fit_reason);
        setPersonaICPMatchingInstructions(persona.icp_matching_prompt);
      })
      .catch((err) => {
        console.log(err);
      });
    setLoadingPersona(false);
    fetchPersonaDetails();
  };

  useEffect(() => {
    if (!fetchedPersona) {
      fetchPersonaDetails();
      setFetchedPersona(true);
    }
  }, [fetchedPersona]);

  const generatePersonaDescription = async (): Promise<MsgResponse> => {
    setLoadingPersonaDescription(true);
    const res = await fetch(
      `${API_URL}/client/archetype/generate_persona_description`,
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
            message: "Persona description generated successfully",
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Failed to generate persona description",
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
    setPersonaDescription(res.data.description);
    setLoadingPersonaDescription(false);
    setNeedsSave(true);
    return res as MsgResponse;
  };

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
    setNeedsSave(true);
    return res as MsgResponse;
  };

  return (
    <Flex>
      <Container>
        <Card>
          <LoadingOverlay visible={loadingPersona} overlayBlur={2} />
          <Title order={4}>Persona Brain</Title>
          <Text size="sm" mb="lg">
            This is what SellScale knows about this persona. Adjust the
            information below to improve the accuracy of SellScale's
            recommendations, message generations, email generations, and more.
          </Text>
          <TextAreaWithAI
            label="Persona Name"
            description='Give a short name to this persona. For example, "Sales Manager" or "Marketing Director"'
            minRows={1}
            value={personaName}
            onChange={(e) => {
              setPersonaName(e.currentTarget.value);
              setNeedsSave(true);
            }}
          ></TextAreaWithAI>
          <TextAreaWithAI
            label="Persona Description"
            description="Describe the persona using details like their job title, company size, industry, and more"
            minRows={4}
            value={personaDescription}
            onChange={(e) => {
              setPersonaDescription(e.currentTarget.value);
              setNeedsSave(true);
            }}
            loadingAIGenerate={loadingPersonaDescription}
            onAIGenerateClicked={async () => {
              await displayNotification(
                "generate-persona-description",
                generatePersonaDescription,
                {
                  title: "Generating persona description...",
                  message: "This may take a few seconds.",
                  color: "teal",
                },
                {
                  title: "Persona description generated!",
                  message: "Your persona description has been generated.",
                  color: "teal",
                },
                {
                  title: "Failed to generate persona description",
                  message: "Please try again or contact SellScale team.",
                  color: "red",
                }
              );
            }}
          ></TextAreaWithAI>
          <TextAreaWithAI
            label="Persona Fit Reason"
            description="Explain why this persona is a good fit for your product or service"
            minRows={4}
            value={personaFitReason}
            onChange={(e) => {
              setPersonaFitReason(e.currentTarget.value);
              setNeedsSave(true);
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
          ></TextAreaWithAI>
          <TextAreaWithAI
            label="Persona ICP Matching Instructions"
            description="Explain how to match a prospect to this persona's ICP. Include details like seniority, tiers, company size, other notes, etc."
            minRows={4}
            value={personaICPMatchingInstructions}
            onChange={(e) => {
              setPersonaICPMatchingInstructions(e.currentTarget.value);
              setNeedsSave(true);
            }}
          ></TextAreaWithAI>
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
