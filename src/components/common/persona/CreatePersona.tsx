import React from "react";
import createPersona from "@utils/requests/createPersona";
import { Button, Card, Text, Title } from "@mantine/core";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from '@atoms/personaAtoms';

type PropsType = {
  createPersona: {
    name: string;
    ctas: string[];
    fitReason: string;
    icpMatchingPrompt: string;
    contactObjective: string;
    contractSize: number;
  };
};

export default function CreatePersona(props: PropsType) {
  const [creatingPersona, setCreatingPersona] = React.useState(false);
  const [userToken] = useRecoilState(userTokenState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState)

  const createPersonaHandler = async () => {
    setCreatingPersona(true);
    const result = await createPersona(
      userToken,
      props.createPersona.name,
      props.createPersona.ctas,
      {
        fitReason: props.createPersona.fitReason,
        icpMatchingPrompt: props.createPersona.icpMatchingPrompt,
        contactObjective: props.createPersona.contactObjective,
        contractSize: props.createPersona.contractSize,
      }
    );
    if (result.status === "error") {
      console.error("Failed to create persona & CTAs");
      return;
    }
    setCreatingPersona(false);
    window.location.reload();
    setCurrentProject(result.data)
    return result.data as number;
  };

  return (
    <Card>
      <Title order={5}>Upload Prospects Later</Title>
      <Text size="sm">
        Create a persona without any prospects added. You can add prospects
        later.
      </Text>
      <Button
        disabled={
          !props.createPersona?.name ||
          !props.createPersona?.ctas ||
          !props.createPersona?.fitReason ||
          !props.createPersona.icpMatchingPrompt ||
          !props.createPersona.contactObjective
        }
        onClick={() => createPersonaHandler()}
        loading={creatingPersona}
        mt="md"
      >
        Create Persona
      </Button>
    </Card>
  );
}
//
