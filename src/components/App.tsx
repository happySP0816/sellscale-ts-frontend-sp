import {
  MantineProvider,
  ColorSchemeProvider,
  LoadingOverlay,
} from "@mantine/core";

import Layout from "./nav/Layout";
import { Outlet } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { useRecoilValue } from "recoil";
import { navLoadingState } from "@atoms/navAtoms";
import SpotlightWrapper from "@nav/SpotlightWrapper";
import UploadProspectsModal from "@modals/UploadProspectsModal";
import SendLinkedInCredentialsModal from "@modals/SendLinkedInCredentialsModal";
import InstructionsLinkedInCookieModal from "@modals/InstructionsLinkedInCookieModal";
import CreateNewCTAModal from "@modals/CreateNewCTAModal";
import ViewEmailModal from "@modals/ViewEmailModal";
import { useEffect } from "react";
import { userDataState } from "@atoms/userAtoms";
import SequenceWriterModal from "@modals/SequenceWriterModal";
import CTAGeneratorModal from "@modals/CTAGeneratorModal";
import ManagePulsePrompt from "@modals/ManagePulsePromptModal";
import ViewEmailThreadModal from "@modals/ViewEmailThreadModal";

export default function App() {
  /* For if we want to support light mode & dark mode:
  // Site light or dark mode
  const isSystemDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedSiteTheme = localStorage.getItem('site-theme');
  const currentColorScheme: ColorScheme = (savedSiteTheme != null) ?
    ((savedSiteTheme === 'dark') ? 'dark' : 'light') :
    ((isSystemDarkMode) ? 'dark' : 'light');

  const [colorScheme, setColorScheme] = useState<ColorScheme>(currentColorScheme);
  const toggleColorScheme = (value?: ColorScheme) => {
    let nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    localStorage.setItem('site-theme', nextColorScheme);
  };
  */

  const userData = useRecoilValue(userDataState);

  // Fill in Crisp widget w/ info
  useEffect(() => {
    if(!userData) { return; }
    if(userData.sdr_email) {
      // @ts-ignore
      $crisp.push(["set", "user:email", [userData.sdr_email]]);
    }
    if(userData.sdr_name){
      // @ts-ignore
      $crisp.push(["set", "user:nickname", [userData.sdr_name]]);
    }
    if(userData.client?.company){
      // @ts-ignore
      $crisp.push(["set", "user:company", [userData.client.company]]);
    }
  }, [userData]);

  const loading = useRecoilValue(navLoadingState);

  return (
    <ColorSchemeProvider colorScheme={"dark"} toggleColorScheme={() => {}}>
      <MantineProvider
        theme={{
          colorScheme: "dark",
          colors: {
            "scale-green": [
              "#75FF00",
              "#75FA00",
              "#75FA00",
              "#60CD00",
              "#60CD00",
              "#60CD00",
              "#52AF00",
              "#52AF00",
              "#52AF00",
              "#52AF00",
            ],
            "scale-pink": [
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
              "#EA5CF6",
            ],
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
              viewEmail: ViewEmailModal,
              sequenceWriter: SequenceWriterModal,
              ctaGenerator: CTAGeneratorModal,
              managePulsePrompt: ManagePulsePrompt,
              viewEmailThread: ViewEmailThreadModal,
            }}
            modalProps={{
              closeOnClickOutside: false,
              size: "lg",
            }}
          >
            <NotificationsProvider position="top-right">
              <LoadingOverlay visible={loading} overlayBlur={4} />
              <Layout>
                {/* Outlet is where react-router will render child routes */}
                <Outlet />
              </Layout>
            </NotificationsProvider>
          </ModalsProvider>
        </SpotlightWrapper>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
