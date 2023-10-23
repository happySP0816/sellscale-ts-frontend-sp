import React from "react";
import createPersona from "@utils/requests/createPersona";
import { Button, Card, Text, Title } from "@mantine/core";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from '@atoms/personaAtoms';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { navigateToPage } from '@utils/documentChange';

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
  const navigate = useNavigate();

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
    showNotification({
      title: "Persona created!",
      message: "You can now find contacts to reach out to... redirecting now...",
      color: "teal",
    });

    setTimeout(
      () => {
        window.location.href = `/contacts/find?campaign_id=${result.data}`;
      }, 3000
    )
    

    setCurrentProject(result.data)
    return result.data as number;
  };

  return (
    <Card>
      <Button
        disabled={
          !props.createPersona?.name ||
          !props.createPersona.contactObjective
        }
        onClick={() => createPersonaHandler()}
        loading={creatingPersona}
      >
        Create Persona
      </Button>
    </Card>
  );
}
//
