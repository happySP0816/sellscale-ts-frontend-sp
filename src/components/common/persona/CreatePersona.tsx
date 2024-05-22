import React, { useState } from "react";
import createPersona from "@utils/requests/createPersona";
import {
  Button,
  Card,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { navigateToPage } from "@utils/documentChange";
import { createLiTemplate } from "@utils/requests/linkedinTemplates";
import { WindowScrollController } from "@fullcalendar/core/internal";
import { useQuery } from "@tanstack/react-query";
import getResearchPointTypes from "@utils/requests/getResearchPointTypes";
import { ResearchPointType } from "src";
import { IconBrandLinkedin, IconMailOpened } from "@tabler/icons";
import Hook from "@pages/channels/components/Hook";

type PropsType = {
  createPersona: {
    name: string;
    ctas: string[];
    fitReason: string;
    icpMatchingPrompt: string;
    contactObjective: string;
    contractSize: number;
    templateMode: boolean;
  };
};

export default function CreatePersona(props: PropsType) {
  const [creatingPersona, setCreatingPersona] = React.useState(false);
  const [userToken] = useRecoilState(userTokenState);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );
  const navigate = useNavigate();

  const [emailChecked, setEmailChecked] = useState(false);
  const [linkedinChecked, setLinkedinChecked] = useState(false);

  const { data: researchPointTypes } = useQuery({
    queryKey: [`query-get-research-point-types`],
    queryFn: async () => {
      const response = await getResearchPointTypes(userToken);
      return response.status === "success"
        ? (response.data as ResearchPointType[])
        : [];
    },
    refetchOnWindowFocus: false,
  });

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
        template_mode: props.createPersona.templateMode,
      }
    );
    if (result.status === "error") {
      console.error("Failed to create persona & CTAs");
      return;
    }
    setCreatingPersona(false);
    showNotification({
      title: "Campaign created!",
      message: "Your campaign has been created successfully.",
      color: "teal",
    });

    // Create default template
    if (props.createPersona.templateMode) {
      await createLiTemplate(
        userToken,
        result.data,
        "Great to connect!",
        `Hi [first name]! [personalization related to them]. It’s great to connect.`,
        true,
        // researchPointTypes?.map((rpt) => rpt.name) || [], WE SHOULD LET THE BACKEND USE THE DEFAULT RESEARCH POINTS
        [],
        ""
      );
    }

    // setTimeout(() => {
    //   window.location.href = "/contacts/overview";
    // }, 3000);

    window.location.reload();

    setCurrentProject(result.data);
    return result.data as number;
  };

  return (
    <Card>
      <Flex direction={"column"} mb="md">
        <Text fw={500} size={"sm"}>
          Sequence
        </Text>
        <Flex align={"center"} gap={emailChecked && linkedinChecked ? 0 : "lg"}>
          <Switch
            miw={240}
            labelPosition="left"
            onChange={(e) => setEmailChecked(e.target.checked)}
            label={
              <Flex gap={4} align={"center"}>
                <IconMailOpened size={"1.2rem"} fill="#3B85EF" color="white" />
                <Text color="#3B85EF" fw={500}>
                  Email
                </Text>
              </Flex>
            }
            w={"100%"}
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "7px",
                borderRadius: "4px",
                background: "white",
              },
              body: {
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              },
            }}
          />
          {emailChecked && linkedinChecked && (
            <>
              <Divider
                w={"100%"}
                variant="dashed"
                labelPosition="center"
                label={<Hook linkedLeft={false} linkedRight={false} />}
              />
              <Select
                size="sm"
                // value={selectedConnectionType}
                miw={170}
                data={[
                  {
                    label: "[❌] No Connection",
                    value: "RANDOM",
                  },
                  {
                    label: "[📧 → 🤝] Sent Only - ",
                    value: "ALL_PROSPECTS",
                  },
                  {
                    label: "[👀 → 🤝] Opened Only - ",
                    value: "OPENED_EMAIL_PROSPECTS_ONLY",
                  },
                  {
                    label: "[⚡️ → 🤝] Clicked Only - ",
                    value: "CLICKED_LINK_PROSPECTS_ONLY",
                  },
                ]}
                placeholder="Connect sequences"
                withinPortal
              />
              <Divider
                w={"100%"}
                variant="dashed"
                labelPosition="center"
                label={<Hook linkedLeft={false} linkedRight={false} />}
              />
            </>
          )}
          <Switch
            labelPosition="left"
            onChange={(e) => setLinkedinChecked(e.target.checked)}
            label={
              <Flex gap={4} align={"center"}>
                <IconBrandLinkedin
                  size={"1.4rem"}
                  fill="#3B85EF"
                  color="white"
                />
                <Text color="#3B85EF" fw={500}>
                  Linkedin
                </Text>
              </Flex>
            }
            miw={240}
            w={"100%"}
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "7px",
                borderRadius: "4px",
                background: "white",
              },
              body: {
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              },
            }}
          />
        </Flex>
      </Flex>
      <Flex align={"center"} justify={"space-between"} gap={"lg"}>
        <Button
          // disabled={!props.createPersona?.name || !props.createPersona.contactObjective}
          // onClick={() => createPersonaHandler()}
          // loading={creatingPersona}
          fullWidth
          variant="outline"
          color="gray"
        >
          Cancel
        </Button>
        <Button
          // disabled={!props.createPersona?.name || !props.createPersona.contactObjective}
          onClick={() => createPersonaHandler()}
          loading={creatingPersona}
          fullWidth
        >
          Create Campaign
        </Button>
      </Flex>
    </Card>
  );
}
//
