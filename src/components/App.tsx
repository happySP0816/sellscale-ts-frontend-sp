import {
  MantineProvider,
  ColorSchemeProvider,
  LoadingOverlay,
  ColorScheme,
} from "@mantine/core";

import Layout from "./nav/Layout";
import { Outlet } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import { useRecoilValue } from "recoil";
import { navLoadingState } from "@atoms/navAtoms";
import SpotlightWrapper from "@nav/SpotlightWrapper";
import UploadProspectsModal from "@modals/UploadProspectsModal";
import SendLinkedInCredentialsModal from "@modals/SendLinkedInCredentialsModal";
import InstructionsLinkedInCookieModal from "@modals/InstructionsLinkedInCookieModal";
import CreateNewCTAModal from "@modals/CreateNewCTAModal";
import ViewEmailModal from "@modals/ViewEmailModal";
import { useEffect, useState } from "react";
import { userDataState } from "@atoms/userAtoms";
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

export default function App() {
  // Site light or dark mode
  const isSystemDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedSiteTheme = localStorage.getItem("site-theme");
  const currentColorScheme: ColorScheme =
    savedSiteTheme != null
      ? savedSiteTheme === "dark"
        ? "dark"
        : "light"
      : isSystemDarkMode
      ? "dark"
      : "light";

  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    currentColorScheme
  );
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
              clientProduct: ClientProductModal,
              demoFeedbackDetails: DemoFeedbackDetailsModal,
            }}
            modalProps={{
              closeOnClickOutside: false,
              size: "lg",
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
