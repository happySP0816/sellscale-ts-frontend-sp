import { MantineProvider, ColorSchemeProvider, LoadingOverlay, ColorScheme } from "@mantine/core";

import Layout from "./nav/Layout";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import { useRecoilState, useRecoilValue } from "recoil";
import { navConfettiState, navLoadingState } from "@atoms/navAtoms";
import SpotlightWrapper from "@nav/SpotlightWrapper";
import UploadProspectsModal from "@modals/UploadProspectsModal";
import SendLinkedInCredentialsModal from "@modals/SendLinkedInCredentialsModal";
import InstructionsLinkedInCookieModal from "@modals/InstructionsLinkedInCookieModal";
import CreateNewCTAModal from "@modals/CreateNewCTAModal";
import logotrial from "../components/PersonaCampaigns/Logo-Trial-3.gif";
import ViewEmailModal from "@modals/ViewEmailModal";
import { useEffect, useRef, useState } from "react";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import SequenceWriterModal from "@modals/SequenceWriterModal";
import CTAGeneratorModal from "@modals/CTAGeneratorModal";
import { API_URL } from '@constants/data';
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
import { getFreshCurrentProject, getCurrentPersonaId, isLoggedIn } from "@auth/core";
import { removeQueryParam } from "@utils/documentChange";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { PersonaOverview } from "src";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";
import { prospectDrawerIdState, prospectDrawerOpenState } from "@atoms/prospectAtoms";
import { useViewportSize } from "@mantine/hooks";
import Confetti from "react-confetti";
import LiTemplateModal from "@modals/LiTemplateModal";
import { SOCKET_SERVICE_URL } from "@constants/data";
import { socketState } from "@atoms/socketAtoms";
import SalesNavURLModal from "@modals/SalesNavURLModal";
import FrameworkReplies from "@modals/FrameworkReplies";

import { io } from "socket.io-client";
import MultiChannelModal from "@modals/MultiChannelModal";
import LiBfTemplateModal from "@modals/LiBfTemplateModal";
import EditTriggerModal from "@modals/EditTriggerModal";
import ComposeGenericEmailModal from "@modals/ComposeGenericEmailModal";
import { CreateEmailReplyFrameworkContextModal } from "@modals/CreateEmailReplyFrameworkModal";
import MakeReminderCardModal from "@modals/MakeReminderCardModal";
import SellscaleChat from "./chat/sellscaleChat";
import AutoSpitModal from "@modals/SegmentV2/AutoSpitModal";
import SplitSegmentModal from "@modals/SegmentV2/SplitSegmentModal";
import SegmentEditPrefilterModal from "@modals/SegmentV2/SegmentEditPrefilterModal";
import ClearSegmentModal from "@modals/SegmentV2/ClearSegmentModal";
import DeleteSegmentModal from "@modals/SegmentV2/DeleteSegmentModal";
import DuplicateCampaignModal from "@modals/DuplicateCampaignModal";

import posthog from "posthog-js";
import WebsiteIntentSplitModal from "@modals/WebsiteIntentsplitModal";
import ChampionChangeModal from "@modals/ChampionChangeModal";
import CampaignPersonalizersModal from "@modals/CampaignLandingV2/CampaignPersonalizersModal";
import CampaignContactsModal from "@modals/CampaignLandingV2/CampaignContactsModal";
import CampaignTemplateModal from "@modals/CampaignLandingV2/CampaignTemplateModal";
import CampaignTemplateEditModal from "@modals/CampaignLandingV2/CampaignTemplateEditModal";
import CampaignTemplatesModal from "@modals/CampaignLandingV2/CampainTemplates";
import AssignConversationAIModal from "@modals/AssignConversationAIModa";
import SimulatepersonalizerModal from "@modals/CampaignLandingV2/SimulatePersonalizerModal";
import CampaignDrilldownModal from "@modals/CampaignLandingV2/CampaignDrilldownModal";
import AddQuestionModal from "@modals/CampaignLandingV2/QuestionModal";
import CreateSegmentV3Modal from "@modals/SegmentV3/CreateSemgentV3Modal";
import SelectSonarModal from "@modals/SelectSonarModal";
import CreateFundraiseSonarmodal from "@modals/Sonarmodal/CreateFundraiseSonarModal";
import AnalyticsModal from "@modals/AnalyticsModal";
import CycleAnalyticsModal from "@modals/CycleAnalyticsModal";
import AddSegmentModal from "@modals/website/AddSegmentModal";
import StrategyCreateModal from "@modals/AIBrain/StrategyCreateModal";
import StrategyEditModal from "@modals/AIBrain/StrategyEditModal";
import StrategyPreviewModal from "@modals/AIBrain/StrategyPreviewModal";

export const socket = io(SOCKET_SERVICE_URL); //'http://localhost:3000');

socket.on("connect", () => {
  console.log(`Socket connected: ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log(`Socket disconnected: ${socket.id}`);
});

export default function App() {
  // Site light or dark mode
  const isSystemDarkMode = false; // window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedSiteTheme = localStorage.getItem("site-theme");
  const currentColorScheme: ColorScheme = savedSiteTheme != null ? (savedSiteTheme === "dark" ? "dark" : "light") : isSystemDarkMode ? "dark" : "light";

  const [colorScheme, setColorScheme] = useState<ColorScheme>(currentColorScheme);
  const toggleColorScheme = (value?: ColorScheme) => {
    let nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    localStorage.setItem("site-theme", nextColorScheme);
  };

  const userData = useRecoilValue(userDataState);
  const location = useLocation();
  const [socket, setSocket] = useRecoilState(socketState);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === '\'') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'TEXTAREA' || (activeElement.tagName === 'DIV' && activeElement.getAttribute('role') === 'textbox') || (activeElement.tagName === 'INPUT' && (activeElement as HTMLInputElement).type === 'text') || (activeElement.classList.contains('mantine-Textarea-input') && activeElement.tagName === 'TEXTAREA') || (activeElement.classList.contains('mantine-Input-input') && activeElement.tagName === 'TEXTAREA') || (activeElement.classList.contains('tiptap') && activeElement.classList.contains('ProseMirror')))) {
          previousFocusedElementRef.current = activeElement;

          const contextInfo = getContextualInformation(activeElement);

          const popover = document.createElement('div');
          popover.style.position = 'fixed';
          popover.style.top = '10px';
          popover.style.left = '50%';
          popover.style.transform = 'translateX(-50%)';
          popover.style.zIndex = '10000';
          popover.style.backgroundColor = 'white';
          popover.style.border = '1px solid #ccc';
          popover.style.padding = '10px';
          popover.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
          document.body.appendChild(popover);
          (popoverRef as React.MutableRefObject<HTMLDivElement | null>).current = popover;

          const title = document.createElement('div');
          title.textContent = 'Sellscale Quick Prompt';
          title.style.fontStyle = 'italic';
          title.style.fontFamily = 'Arial';
          title.style.marginBottom = '5px';
          popover.appendChild(title);

          const textarea = document.createElement('textarea');
          textarea.style.width = '300px';
          textarea.style.height = 'auto';
          textarea.style.resize = 'none';
          textarea.style.overflow = 'hidden';
          textarea.value = ''; // Ensure the textarea is completely clear when opened
          textarea.addEventListener('input', handleInput);
          textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              if (popoverRef.current) {
                document.body.removeChild(popoverRef.current);
                if (previousFocusedElementRef.current) {
                  (previousFocusedElementRef.current as HTMLTextAreaElement).value = '';
                  (previousFocusedElementRef.current as HTMLTextAreaElement).style.color = 'black';
                  (previousFocusedElementRef.current as HTMLTextAreaElement).focus();
                }
              }
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!textarea.dataset.enterPressed) {
                textarea.dataset.enterPressed = 'true';
                showLoadingGif(popover);
                typeUserInput(previousFocusedElementRef.current, textarea.value, popover, contextInfo);
              }
            } else if (e.metaKey && e.key === 'Enter') {
              e.preventDefault();
              acceptGeneration(popover, textarea);
            } else if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault();
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              textarea.value = textarea.value.substring(0, start) + "\n" + textarea.value.substring(end);
              textarea.selectionStart = textarea.selectionEnd = start + 1;
            }
          });
          popover.appendChild(textarea);
          textarea.focus();

          const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
              document.body.removeChild(popoverRef.current);
              document.removeEventListener('click', handleClickOutside);
              if (previousFocusedElementRef.current) {
                (previousFocusedElementRef.current as HTMLTextAreaElement).value = '';
                (previousFocusedElementRef.current as HTMLTextAreaElement).style.color = 'black';
              }
            }
          };

          document.addEventListener('click', handleClickOutside);
        }
      } else if (event.metaKey && event.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === 'TEXTAREA') {
          activeElement.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const showLoadingGif = (popover: HTMLDivElement) => {
    const loadingGif = document.createElement('img');
    loadingGif.src = logotrial;
    loadingGif.style.display = 'block';
    loadingGif.style.margin = '10px auto';
    loadingGif.style.width = '50px';
    popover.appendChild(loadingGif);
  };

  const typeUserInput = (element: HTMLElement | null, userInput: string, popover: HTMLDivElement, contextInfo: any) => {
    if (!element) return;
    let index = 0;

    fetch(`${API_URL}/ml/quick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ userInput, contextInfo }),
    })
    .then(response => response.json())
    .then(res => {
      console.log('Response JSON:', res);
      const interval = setInterval(() => {
        if (index < res.response.length) {
          if (element.classList.contains('tiptap') && element.classList.contains('ProseMirror')) {
            element.textContent += res.response.charAt(index);
          } else {
            (element as HTMLTextAreaElement).value += res.response.charAt(index);
          }
          index += 1;
        } else {
          clearInterval(interval);
          removeLoadingGifAndAddButton(popover, element);
          if (element.classList.contains('tiptap') && element.classList.contains('ProseMirror')) {
            element.focus();
          }
        }
      }, 10);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const removeLoadingGifAndAddButton = (popover: HTMLDivElement, element: HTMLElement) => {
    const loadingGif = popover.querySelector('img');
    if (loadingGif) {
      popover.removeChild(loadingGif);
    }

    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.style.backgroundColor = '#87CEEB';
    acceptButton.style.color = 'white';
    acceptButton.style.border = 'none';
    acceptButton.style.padding = '5px 10px';
    acceptButton.style.cursor = 'pointer';
    acceptButton.style.borderRadius = '4px';
    acceptButton.addEventListener('click', () => {
      acceptGeneration(popover, element);
    });
    popover.appendChild(acceptButton);

    (element as HTMLTextAreaElement).style.color = 'green';
  };

  const acceptGeneration = (popover: HTMLDivElement, element: HTMLElement) => {
    if (previousFocusedElementRef.current) {
      const event = new Event('input', { bubbles: true });
      (previousFocusedElementRef.current as HTMLTextAreaElement).value = (element as HTMLTextAreaElement).value;
      previousFocusedElementRef.current.dispatchEvent(event);
    }
    (element as HTMLTextAreaElement).style.color = 'black';
    document.body.removeChild(popover);
  };

  const getContextualInformation = (element: HTMLElement): string => {
    const MAX_PARENT_COUNT = 6;
    let context = '';
    let currentElement: HTMLElement | null = element;
    let parentCount = 0;

    while (currentElement && parentCount < MAX_PARENT_COUNT) {
      const textContent = currentElement.textContent?.trim();
      if (textContent) {
        context = `${textContent} ${context}`;
      }
      currentElement = currentElement.parentElement;
      parentCount++;
    }

    return context.trim();
  };
  // Socket.IO Connection
  // useEffect(() => {
  //   if (!socket) setSocket();
  // }, []);

  // Fill in Crisp widget w/ info
  // useEffect(() => {
  //   if (!userData) {
  //     return;
  //   }
  //   if (userData.sdr_email) {
  //     // @ts-ignore
  //     $crisp.push(["set", "user:email", [userData.sdr_email]]);
  //   }
  //   if (userData.sdr_name) {
  //     // @ts-ignore
  //     $crisp.push(["set", "user:nickname", [userData.sdr_name]]);
  //   }
  //   if (userData.client?.company) {
  //     // @ts-ignore
  //     $crisp.push(["set", "user:company", [userData.client.company]]);
  //   }
  // }, [userData]);

  useEffect(() => {
    if (userData.sdr_name) {
      // @ts-ignore
      window.pylon = {
        chat_settings: {
          app_id: "e816a937-d49b-46b8-8fa4-8796031cdc15",
          email: userData.sdr_email,
          name: userData.sdr_name,
          avatar_url: userData.img_url,
        },
      };
    }
  }, [userData]);

  const loading = useRecoilValue(navLoadingState);
  const [confetti, setConfetti] = useRecoilState(navConfettiState);

  const { height, width } = useViewportSize();

  const [drawerProspectId, setDrawerProspectId] = useRecoilState(prospectDrawerIdState);
  const [drawerOpened, setDrawerOpened] = useRecoilState(prospectDrawerOpenState);

  // Select the last used project
  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] = useRecoilState(currentProjectState);

  useEffect(() => {
    posthog.setPersonPropertiesForFlags({ distinct_id: userData?.id }, false);
  });

  // Set persona query param
  const [searchParams] = useSearchParams();
  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) {
        return;
      }

      // If there is a prospect query param, open the prospect drawer
      const prospect_id = searchParams.get("prospect_id");
      if (prospect_id) {
        setDrawerProspectId(+prospect_id);
        setDrawerOpened(true);
        removeQueryParam("prospect_id");
      }

      // If there is a persona query param, set the current project to that
      const persona_id = searchParams.get("campaign_id");
      if (persona_id) {
        // Set to query param persona
        const project = await getFreshCurrentProject(userToken, +persona_id);
        setCurrentProject(project);
        //removeQueryParam('campaign_id');
      } else {
        // Set to last used persona
        const currentPersonaId = getCurrentPersonaId();
        if (!currentProject && currentPersonaId) {
          const project = await getFreshCurrentProject(userToken, +currentPersonaId);
          setCurrentProject(project);
        } else if (!currentPersonaId) {
          // Set to first persona
          const response = await getPersonasOverview(userToken);
          const result = response.status === "success" ? (response.data as PersonaOverview[]) : [];
          if (result.length > 0) {
            setCurrentProject(result[0]);
          }
        }
      }
    })();
  }, [location]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
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
          fontFamilyMonospace: "source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace",
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
              composeGenericEmail: ComposeGenericEmailModal,
              makeReminderCard: MakeReminderCardModal,
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
              createEmailReplyFramework: CreateEmailReplyFrameworkContextModal,
              cloneBumpFramework: CloneBumpFrameworkContextModal,
              liTemplate: LiTemplateModal,
              liBfTemplate: LiBfTemplateModal,
              salesNavURL: SalesNavURLModal,
              frameworkReplies: FrameworkReplies,
              multiChannel: MultiChannelModal,
              editTrigger: EditTriggerModal,
              autosplitsegment: AutoSpitModal,
              splitSegment: SplitSegmentModal,
              segmentprefilter: SegmentEditPrefilterModal,
              clearsegment: ClearSegmentModal,
              deletesegment: DeleteSegmentModal,
              duplicateCampaign: DuplicateCampaignModal,
              websiteintentsplit: WebsiteIntentSplitModal,
              championChange: ChampionChangeModal,
              campaignPersonalizersModal: CampaignPersonalizersModal,
              campaignContactsModal: CampaignContactsModal,
              campaignTemplateModal: CampaignTemplateModal,
              campaignTemplateEditModal: CampaignTemplateEditModal,
              campaignTemplates: CampaignTemplatesModal,
              assignConversationAIModal: AssignConversationAIModal,
              simulatepersonalizerModal: SimulatepersonalizerModal,
              campaignDrilldownModal: CampaignDrilldownModal,
              addQuestionModal: AddQuestionModal,
              createsegmentV3: CreateSegmentV3Modal,
              selectsonarModal: SelectSonarModal,
              createfundraiseModal: CreateFundraiseSonarmodal,
              analyticModal: AnalyticsModal,
              cycleanalyticModal: CycleAnalyticsModal,
              createSegmentModal: AddSegmentModal,
              createStrategy: StrategyCreateModal,
              editStrategy: StrategyEditModal,
              previewStrategy: StrategyPreviewModal,
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
            <SellscaleChat />
            <Confetti
              width={width}
              height={height}
              run={!!confetti}
              recycle={false}
              numberOfPieces={confetti ?? 0}
              onConfettiComplete={() => setConfetti(null)}
            />
            {isLoggedIn() && <ProspectDetailsDrawer />}
          </ModalsProvider>
        </SpotlightWrapper>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
