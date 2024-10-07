import React, { useRef, useState } from "react";
import createPersona from "@utils/requests/createPersona";
import {
  Button,
  Card,
  Divider,
  Flex,
  Paper,
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
import { PersonaOverview, ResearchPointType } from "src";
import { IconBrandLinkedin, IconMailOpened } from "@tabler/icons";
import Hook from "@pages/channels/components/Hook";
import { closeAllModals, closeModal, openContextModal } from "@mantine/modals";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import {SequencesV2} from '@pages/CampaignV2/SequencesV2'


type PropsType = {
  createPersona: {
    name: string;
    ctas: string[];
    fitReason: string;
    icpMatchingPrompt: string;
    contactObjective: string;
    contractSize: number;
    templateMode: boolean;
    purpose: string;
    selectedSegmentId: number;
    override_archetype_id: number | undefined;
    connectedStrategyId: number|undefined;
    autoGenerationPayload?: {
      findSampleProspects?: boolean;
      writeEmailSequenceDraft?: boolean;
      writeLISequenceDraft?: boolean;
      emailSequenceOpened?: boolean;
      emailSequenceKeywords?: string[];
      liSequenceOpened?: boolean;
      liGeneralAngle?: string;
      emailGeneralAngle?: string;
      liSequenceKeywords?: string[];
      liAssetIngestor?: string;
      emailAssetIngestor?: string;
      liCtaGenerator?: boolean;
      ctaTarget?: string;
      selectedVoice?: number;
      numStepsEmail: number,
      numStepsLinkedin: number,
      withData: string,
      numVarianceEmail: number,
      numVarianceLinkedin: number,
      liPainPoint?: string;
      liSequenceState?: {
        howItWorks: boolean;
        varyIntroMessages: boolean;
        breakupMessage: boolean;
        uniqueOffer: boolean;
        conferenceOutreach: boolean;
        cityChat: boolean;
        formerWorkAlum: boolean;
        feedbackBased: boolean;
      };
      emailSequenceState?: {
        howItWorks: boolean;
        varyIntroMessages: boolean;
        breakupMessage: boolean;
        uniqueOffer: boolean;
        conferenceOutreach: boolean;
        cityChat: boolean;
        formerWorkAlum: boolean;
        feedbackBased: boolean;
      };
    };
    assetIds?: number[];
  };
};

export default function CreatePersona(props: PropsType) {
  const [creatingPersona, setCreatingPersona] = React.useState(false);
  const [userToken] = useRecoilState(userTokenState);
  const sequencesRef = useRef(null);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectState
  );
  const [connectionType, setConnectionType] = useState<string | undefined>(
    undefined
  ); // ["RANDOM", "ALL_PROSPECTS", "OPENED_EMAIL_PROSPECTS_ONLY", "CLICKED_LINK_PROSPECTS_ONLY"
  const navigate = useNavigate();

  const [emailChecked, setEmailChecked] = useState(false);
  const [linkedinChecked, setLinkedinChecked] = useState(false);

  const createPersonaHandler = async (
    linkedinChecked?: boolean,
    emailChecked?: boolean,
    autoGenerationPayload?: PropsType["createPersona"]["autoGenerationPayload"]
  ) => {
    setCreatingPersona(true);
    let result;
    try{
    result = await createPersona(
      userToken,
      props.createPersona.name,
      props.createPersona.ctas,
      {
        fitReason: props.createPersona.fitReason,
        icpMatchingPrompt: props.createPersona.icpMatchingPrompt,
        contactObjective: props.createPersona.contactObjective,
        contractSize: props.createPersona.contractSize,
        template_mode: props.createPersona.templateMode,
        linkedinChecked,
        emailChecked,
        connectionType,
        purpose: props.createPersona.purpose,
      },
      autoGenerationPayload,
      props.createPersona.connectedStrategyId,
      props.createPersona.override_archetype_id,
      props.createPersona.selectedSegmentId,
      props.createPersona?.assetIds,
    );
    } catch (e) {
      console.error("Failed to create persona & CTAs", e);
      setCreatingPersona(false);
      return;
    } finally {
      setCreatingPersona(false);
    }
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
    // setTimeout(() => {
    //   window.location.href = "/contacts/overview";
    // }, 3000);

    //this needs to be cleaned up. what a mess.


    //short circuit to enter the user into the campaign shell.
    if (result.data && !window.location.href.includes('selix')) {
      const response = await getPersonasOverview(userToken);
      const results =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];


      const currentPersonaId = result?.data as number;
      let activeProject = null;
      if (currentPersonaId) {
        activeProject = results.find(
          (project) => project.id === +currentPersonaId
        );
      }
      if (!activeProject) {
        activeProject = results.find((project) => project.active);
      }
      if (!activeProject) {
        activeProject = null;
      }

      setCurrentProject(activeProject);
      window.location.href = `/campaign_v2/${result.data as number}`;
      return result.data as number;
    }

    //do not reload the page if we are in selix actually i think we will never get to this first case. 
    if (!window.location.href.includes('selix')){

      const response = await getPersonasOverview(userToken);
      const results =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];


      const currentPersonaId = result?.data as number;
      let activeProject = null;
      if (currentPersonaId) {
        activeProject = results.find(
          (project) => project.id === +currentPersonaId
        );
      }
      if (!activeProject) {
        activeProject = results.find((project) => project.active);
      }
      if (!activeProject) {
        activeProject = null;
      }

      setCurrentProject(activeProject);


    window.location.reload();
    } else  {

      // if (!isLoggedIn()) return;
      const response = await getPersonasOverview(userToken);
      const results =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];


      const currentPersonaId = result?.data as number;
      let activeProject = null;
      if (currentPersonaId) {
        activeProject = results.find(
          (project) => project.id === +currentPersonaId
        );
      }
      if (!activeProject) {
        activeProject = results.find((project) => project.active);
      }
      if (!activeProject) {
        activeProject = null;
      }

      setCurrentProject(activeProject);

      //set sequences for the current project

      console.log('sequences ref is', sequencesRef)

      if (sequencesRef?.current && 'refetchSequenceData' in sequencesRef.current) {
        await (sequencesRef.current as any).refetchSequenceData(+currentPersonaId); // Invoke the method
      }


      console.log('current project')
      openContextModal({
        modal: "campaignTemplateEditModal",
        title: <Title order={3}>Sequence Builder</Title>,
        innerProps: {
          // sequenceType: innerProps.sequenceType,
          // emailSubjectLines: emailSubjectLines,
          // emailSequenceData: innerProps.emailSequenceData,
          // linkedinSequenceData: innerProps.linkedinSequenceData,
          // setEmailSubjectLines: setEmailSubjectLines,
          // addedTemplate: asset,
          // stagingData: innerProps.stagingData,
          // refetchSequenceData: innerProps.refetchSequenceData,
          // currentStepNum: innerProps.currentStepNum,
          // createTemplateBuilder: innerProps.createTemplateBuilder,
          // setCreateTemplateBuilder: innerProps.setCreateTemplateBuilder,
          // setSequences: innerProps.setSequences,
          campaignId: result.data as number,
          // cType: innerProps.cType,
          // addToStagingData: innerProps.addToStagingData,
        },
        centered: true,
        styles: {
          content: {
            minWidth: "1100px",
          },
        },
        onClose: () => {
          try {
            console.log("refetching sequence data");
            // innerProps.refetchSequenceData(currentProject?.id);
          } catch (e) {
            console.log("error is", e);
          }
        },
      });
    }

    setCurrentProject(result.data);

    return result.data as number;
  };

  return (
    <Card>
      <SequencesV2 showComponent={false} ref={sequencesRef} />
      <Flex direction={"column"} mb="md"></Flex>
      <Flex align={"center"} justify={"space-between"} gap={"lg"}>
        <Button
          // disabled={!props.createPersona?.name || !props.createPersona.contactObjective}
          // onClick={() => createPersonaHandler()}
          // loading={creatingPersona}
          onClick={() => {
            closeAllModals();
          }}
          fullWidth
          variant="outline"
          color="gray"
        >
          Cancel
        </Button>
        <Button
          disabled={(window.location.href.includes('/campaigns') && !props.createPersona?.name)}
          onClick={() => createPersonaHandler(linkedinChecked, emailChecked, props.createPersona?.autoGenerationPayload)}
          loading={creatingPersona}
          fullWidth
        >
          {window.location.href.includes('/campaign_v2') || window.location.href.includes('selix') ? 'Generate Sequences' : 'Create Campaign'}
        </Button>
      </Flex>
    </Card>
  );
}
//
