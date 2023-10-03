import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  LoadingOverlay,
  NumberInput,
  Text,
  TextInput,
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
  const [personaCTAFrameworkCompany, setPersonaCTAFrameworkCompany] = useState(
    ""
  );
  const [personaCTAFrameworkPersona, setPersonaCTAFrameworkPersona] = useState(
    ""
  );
  const [personaCTAFrameworkAction, setPersonaCTAFrameworkAction] = useState(
    ""
  );
  const [personaUseCases, setPersonaUseCases] = useState("");
  const [personaFilters, setPersonaFilters] = useState("");
  const [personaLookalikeProfile1, setPersonaLookalikeProfile1] = useState("");
  const [personaLookalikeProfile2, setPersonaLookalikeProfile2] = useState("");
  const [personaLookalikeProfile3, setPersonaLookalikeProfile3] = useState("");
  const [personaLookalikeProfile4, setPersonaLookalikeProfile4] = useState("");
  const [personaLookalikeProfile5, setPersonaLookalikeProfile5] = useState("");

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
        setPersonaContractSize(persona.contract_size);
        setPersonaCTAFrameworkCompany(persona.cta_framework_company);
        setPersonaCTAFrameworkPersona(persona.cta_framework_persona);
        setPersonaCTAFrameworkAction(persona.cta_framework_action);
        setPersonaUseCases(persona.use_cases);
        setPersonaFilters(persona.filters);
        setPersonaLookalikeProfile1(persona.lookalike_profile_1);
        setPersonaLookalikeProfile2(persona.lookalike_profile_2);
        setPersonaLookalikeProfile3(persona.lookalike_profile_3);
        setPersonaLookalikeProfile4(persona.lookalike_profile_4);
        setPersonaLookalikeProfile5(persona.lookalike_profile_5);

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
          updated_persona_contract_size: personaContractSize,
          updated_cta_framework_company: personaCTAFrameworkCompany,
          updated_cta_framework_persona: personaCTAFrameworkPersona,
          updated_cta_framework_action: personaCTAFrameworkAction,
          updated_use_cases: personaUseCases,
          updated_filters: personaFilters,
          updated_lookalike_profile_1: personaLookalikeProfile1,
          updated_lookalike_profile_2: personaLookalikeProfile2,
          updated_lookalike_profile_3: personaLookalikeProfile3,
          updated_lookalike_profile_4: personaLookalikeProfile4,
          updated_lookalike_profile_5: personaLookalikeProfile5,
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
              personaCTAFrameworkCompany={personaCTAFrameworkCompany}
              personaCTAFrameworkPersona={personaCTAFrameworkPersona}
              personaCTAFrameworkAction={personaCTAFrameworkAction}
              personaUseCases={personaUseCases}
              personaFilters={personaFilters}
              personaLookalikeProfile1={personaLookalikeProfile1}
              personaLookalikeProfile2={personaLookalikeProfile2}
              personaLookalikeProfile3={personaLookalikeProfile3}
              personaLookalikeProfile4={personaLookalikeProfile4}
              personaLookalikeProfile5={personaLookalikeProfile5}
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
  onUpdate: (data: {
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
  const [personaCTAFrameworkCompany, setPersonaCTAFrameworkCompany] = useState(
    props.personaCTAFrameworkCompany
  );
  const [personaCTAFrameworkPersona, setPersonaCTAFrameworkPersona] = useState(
    props.personaCTAFrameworkPersona
  );
  const [personaCTAFrameworkAction, setPersonaCTAFrameworkAction] = useState( 
    props.personaCTAFrameworkAction
  );
  const [personaUseCases, setPersonaUseCases] = useState(props.personaUseCases);
  const [personaFilters, setPersonaFilters] = useState(props.personaFilters);
  const [personaLookalikeProfile1, setPersonaLookalikeProfile1] = useState(
    props.personaLookalikeProfile1
  );
  const [personaLookalikeProfile2, setPersonaLookalikeProfile2] = useState(
    props.personaLookalikeProfile2
  );
  const [personaLookalikeProfile3, setPersonaLookalikeProfile3] = useState(
    props.personaLookalikeProfile3
  );
  const [personaLookalikeProfile4, setPersonaLookalikeProfile4] = useState(
    props.personaLookalikeProfile4
  );
  const [personaLookalikeProfile5, setPersonaLookalikeProfile5] = useState(
    props.personaLookalikeProfile5
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
      personaCTAFrameworkCompany: personaCTAFrameworkCompany,
      personaCTAFrameworkPersona: personaCTAFrameworkPersona,
      personaCTAFrameworkAction: personaCTAFrameworkAction,
      personaUseCases: personaUseCases,
      personaFilters: personaFilters,
      personaLookalikeProfile1: personaLookalikeProfile1,
      personaLookalikeProfile2: personaLookalikeProfile2,
      personaLookalikeProfile3: personaLookalikeProfile3,
      personaLookalikeProfile4: personaLookalikeProfile4,
      personaLookalikeProfile5: personaLookalikeProfile5,
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
      <Flex w='100%' mb='sm'>
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
      </Flex>
      <Flex w='100%' mb='sm'>
        <TextAreaWithAI
          label="Why do they buy your product?"
          description="Explain why this persona is a good fit for your product or service. This will be used by the AI to generate emails and messages."
          minRows={8}
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
      </Flex>
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
      <Flex w='100%' mb='md'>
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
      </Flex>
      <Text fw='500' size='sm' mb='xs'>Fill in this one sentence framework exactly</Text>
      <Flex w='100%' mb='md'>
        <TextInput
          placeholder="Company"
          value={personaCTAFrameworkCompany}
          onChange={(e) => {
            setPersonaCTAFrameworkCompany(e.currentTarget.value);
            sendUpdate(
              "personaCTAFrameworkCompany",
              e.currentTarget.value
            );
          }}
          />
        <Text mt='4px' ml='xs' mr='xs' >helps</Text>
        <TextInput
          placeholder="Persona"
          value={personaCTAFrameworkPersona}
          onChange={(e) => {
            setPersonaCTAFrameworkPersona(e.currentTarget.value);
            sendUpdate(
              "personaCTAFrameworkPersona",
              e.currentTarget.value
            );
          }}
          />
        <Text mt='4px' mr='xs' ml='xs'>with</Text>
        <TextInput
          placeholder="Action"
          value={personaCTAFrameworkAction}
          onChange={(e) => {
            setPersonaCTAFrameworkAction(e.currentTarget.value);
            sendUpdate(
              "personaCTAFrameworkAction",
              e.currentTarget.value
            );
          }}
          />
        
      </Flex>
      <Flex w='100%' mb='md'>
        <TextAreaWithAI
          label="Use Cases"
          description="List use cases this persona cares about."
          placeholder='- Use Case 1: Connect to your HRIS software ...'
          minRows={3}
          value={personaUseCases}
          onChange={(e) => {
            setPersonaUseCases(e.currentTarget.value);
            sendUpdate(
              "personaUseCases",
              e.currentTarget.value
            );
          }}
        />
      </Flex>
       <Flex w='100%' mb='md'>
        <TextAreaWithAI
          label="Persona Filters"
          description="(e.g., seniority, titles, company type, company size, industries)"
          placeholder='Seniority: ex. Executive, Directors, VPs \ Titles/profile keywords: ex. Chief Revenue, Account Executive, Business Development \ Company Type: ex. Technology \ Company Size: ex. 200 - 1000 employees \ Industries: ex. Internet, IT'
          minRows={3}
          value={personaFilters}
          onChange={(e) => {
            setPersonaFilters(e.currentTarget.value);
            sendUpdate(
              "personaFilters",
              e.currentTarget.value
            );
          }}
        />
      </Flex>

      <Text fw='500' size='sm' >Lookalike LinkedIn Profiles</Text>
      <Text size='sm' mb='xs' fz='sm'>Paste in at least 3 who you haven't contacted.</Text>
      <TextInput
        placeholder='Lookalike Profile #1'
        value={personaLookalikeProfile1}
        mt='xs'
        onChange={(e) => {
          setPersonaLookalikeProfile1(e.currentTarget.value);
          sendUpdate(
            "personaLookalikeProfile1",
            e.currentTarget.value
          );
        }}
      />
      <TextInput
        placeholder='Lookalike Profile #2'
        value={personaLookalikeProfile2}
        mt='xs'
        onChange={(e) => {
          setPersonaLookalikeProfile2(e.currentTarget.value);
          sendUpdate(
            "personaLookalikeProfile2",
            e.currentTarget.value
          );
        }}
      />
      <TextInput
        placeholder='Lookalike Profile #3'
        value={personaLookalikeProfile3}
        mt='xs'
        onChange={(e) => {
          setPersonaLookalikeProfile3(e.currentTarget.value);
          sendUpdate(
            "personaLookalikeProfile3",
            e.currentTarget.value
          );
        }}
      />
      <TextInput
        placeholder='Lookalike Profile #4'
        value={personaLookalikeProfile4}
        mt='xs'
        onChange={(e) => {
          setPersonaLookalikeProfile4(e.currentTarget.value);
          sendUpdate(
            "personaLookalikeProfile4",
            e.currentTarget.value
          );
        }}
      />
      <TextInput
        placeholder='Lookalike Profile #5'
        value={personaLookalikeProfile5}
        mt='xs'
        onChange={(e) => {
          setPersonaLookalikeProfile5(e.currentTarget.value);
          sendUpdate(
            "personaLookalikeProfile5",
            e.currentTarget.value
          );
        }}
      />

      <Flex mb='md' mt='sm'>
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
      </Flex>
    </Box>
  );
}
