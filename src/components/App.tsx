import {
  MantineProvider,
  ColorSchemeProvider,
  LoadingOverlay,
  ColorScheme,
} from "@mantine/core";

import Layout from "./nav/Layout";
import { Outlet, useSearchParams } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import { useRecoilState, useRecoilValue } from "recoil";
import { navLoadingState } from "@atoms/navAtoms";
import SpotlightWrapper from "@nav/SpotlightWrapper";
import UploadProspectsModal from "@modals/UploadProspectsModal";
import SendLinkedInCredentialsModal from "@modals/SendLinkedInCredentialsModal";
import InstructionsLinkedInCookieModal from "@modals/InstructionsLinkedInCookieModal";
import CreateNewCTAModal from "@modals/CreateNewCTAModal";
import ViewEmailModal from "@modals/ViewEmailModal";
import { useEffect, useState } from "react";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import SequenceWriterModal from "@modals/SequenceWriterModal";
import CTAGeneratorModal from "@modals/CTAGeneratorModal";
import ManagePulsePrompt from "@modals/ManagePulsePromptModal";
import ViewEmailThreadModal from "@modals/ViewEmailThreadModal";
import ManageBumpFramework from "@modals/ManageBumpFrameworkModal";
import ComposeEmailModal from "@modals/ComposeEmailModal";
import { Notifications } from "@mantine/notifications";
import ClientProductModal from "@modals/ClientProductModal";
import CopyCTAsModal from "@modals/CopyCTAsModal";
import EditCTAModal from "@modals/EditCTAModal";
import DemoFeedbackDetailsModal from "@modals/DemoFeedbackDetailsModal";
import VoiceBuilderModal from "@modals/VoiceBuilderModal";
import EditBumpFrameworkModal from "@modals/EditBumpFrameworkModal";
import EditEmailSequenceStepModal from "@modals/EditEmailSequenceStepModal";
import VoiceEditorModal from "@modals/VoiceEditorModal";
import AccountModal from "@modals/AccountModal";
import AddProspectModal from "@modals/AddProspectModal";
import SendLiOutreachModal from "@modals/SendOutreachModal";
import SendOutreachModal from "@modals/SendOutreachModal";
import PersonaSelectModal from "@modals/PersonaSelectModal";
import ClonePersonaModal from "@modals/ClonePersonaModal";
import ConfirmModal from "@modals/ConfirmModal";
import PatchEmailSubjectLineModal from "@modals/PatchEmailSubjectLineModal";
import { CreateBumpFrameworkContextModal } from "@modals/CreateBumpFrameworkModal";
import { CloneBumpFrameworkContextModal } from "@modals/CloneBumpFrameworkModal";
import { currentProjectState } from "@atoms/personaAtoms";
import { getFreshCurrentProject, getCurrentPersonaId } from "@auth/core";
import { removeQueryParam } from "@utils/documentChange";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { PersonaOverview } from "src";

export default function App() {
  // Site light or dark mode
  const isSystemDarkMode = false; // window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedSiteTheme = localStorage.getItem("site-theme");
  const currentColorScheme: ColorScheme =
    savedSiteTheme != null
      ? savedSiteTheme === "dark"
        ? "dark"
        : "light"
      : isSystemDarkMode
      ? "dark"
      : "light";

  const [colorScheme, setColorScheme] =
    useState<ColorScheme>(currentColorScheme);
  const toggleColorScheme = (value?: ColorScheme) => {
    let nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    localStorage.setItem("site-theme", nextColorScheme);
  };

  const userData = useRecoilValue(userDataState);

  // Fill in Crisp widget w/ info
  useEffect(() => {
    if (!userData) {
      return;
    }
    if (userData.sdr_email) {
      // @ts-ignore
      $crisp.push(["set", "user:email", [userData.sdr_email]]);
    }
    if (userData.sdr_name) {
      // @ts-ignore
      $crisp.push(["set", "user:nickname", [userData.sdr_name]]);
    }
    if (userData.client?.company) {
      // @ts-ignore
      $crisp.push(["set", "user:company", [userData.client.company]]);
    }
  }, [userData]);

  const loading = useRecoilValue(navLoadingState);

  // Select the last used project
  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  // Set persona query param
  const [searchParams] = useSearchParams();
  useEffect(() => {
    (async () => {
      const persona_id = searchParams.get("campaign_id");
      if (persona_id) {
        // Set to query param persona
        const project = await getFreshCurrentProject(userToken, +persona_id);
        setCurrentProject(project);
        removeQueryParam("campaign_id");
      } else {
        // Set to last used persona
        const currentPersonaId = getCurrentPersonaId();
        if (!currentProject && currentPersonaId) {
          const project = await getFreshCurrentProject(
            userToken,
            +currentPersonaId
          );
          setCurrentProject(project);
        } else {
          // Set to first persona
          const response = await getPersonasOverview(userToken);
          const result =
                response.status === "success"
                  ? (response.data as PersonaOverview[])
                  : [];
          if (result.length > 0){
            setCurrentProject(result[0]);
          }
        }
      }
    })();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{
          colorScheme: colorScheme,
          other: {
            charcoal: "#333333",
            primaryHeadingSize: 45,
            fontWeights: {
              bold: 700,
              extraBold: 900,
            },
          },
          fontFamily: "Poppins, sans-serif",
          fontFamilyMonospace:
            "source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace",
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <SpotlightWrapper>
          <ModalsProvider
            modals={{
              uploadProspects: UploadProspectsModal,
              sendLinkedInCredentials: SendLinkedInCredentialsModal,
              sendLinkedInCookie: InstructionsLinkedInCookieModal,
              createNewCTA: CreateNewCTAModal,
              copyCTAs: CopyCTAsModal,
              editCTA: EditCTAModal,
              viewEmail: ViewEmailModal,
              composeEmail: ComposeEmailModal,
              sequenceWriter: SequenceWriterModal,
              ctaGenerator: CTAGeneratorModal,
              managePulsePrompt: ManagePulsePrompt,
              viewEmailThread: ViewEmailThreadModal,
              manageBumpFramework: ManageBumpFramework,
              patchEmailSubjectLine: PatchEmailSubjectLineModal,
              clientProduct: ClientProductModal,
              demoFeedbackDetails: DemoFeedbackDetailsModal,
              editBumpFramework: EditBumpFrameworkModal,
              editEmailSequenceStepModal: EditEmailSequenceStepModal,
              voiceEditor: VoiceEditorModal,
              account: AccountModal,
              addProspect: AddProspectModal,
              sendOutreach: SendOutreachModal,
              personaSelect: PersonaSelectModal,
              clonePersona: ClonePersonaModal,
              confirm: ConfirmModal,
              createBumpFramework: CreateBumpFrameworkContextModal,
              cloneBumpFramework: CloneBumpFrameworkContextModal,
            }}
            modalProps={{
              closeOnClickOutside: false,
              size: "xl",
            }}
          >
            <Notifications position="top-right" />
            <LoadingOverlay visible={loading} overlayBlur={4} />
            <Layout>
              {/* Outlet is where react-router will render child routes */}
              <Outlet />
            </Layout>
          </ModalsProvider>
        </SpotlightWrapper>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
