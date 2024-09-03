import {
  MantineProvider,
  ColorSchemeProvider,
  LoadingOverlay,
  ColorScheme,
  Title,
  Flex,
  Modal,
  Textarea,
  Paper,
  Text,
  SimpleGrid,
  Kbd,
  Button,
} from "@mantine/core";

import Layout from "./nav/Layout";
import {
  Outlet,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ModalsProvider, openContextModal } from "@mantine/modals";
import { useRecoilState, useRecoilValue } from "recoil";
import { navConfettiState, navLoadingState } from "@atoms/navAtoms";
import SpotlightWrapper from "@nav/SpotlightWrapper";
import UploadProspectsModal from "@modals/UploadProspectsModal";
import SendLinkedInCredentialsModal from "@modals/SendLinkedInCredentialsModal";
import InstructionsLinkedInCookieModal from "@modals/InstructionsLinkedInCookieModal";
import CreateNewCTAModal from "@modals/CreateNewCTAModal";
import logotrial from "../components/PersonaCampaigns/Logo-Trial-3.gif";
import ViewEmailModal from "@modals/ViewEmailModal";
import React, { useEffect, useRef, useState } from "react";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import SequenceWriterModal from "@modals/SequenceWriterModal";
import CTAGeneratorModal from "@modals/CTAGeneratorModal";
import { API_URL } from "@constants/data";
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
import {
  getFreshCurrentProject,
  getCurrentPersonaId,
  isLoggedIn,
} from "@auth/core";
import { removeQueryParam } from "@utils/documentChange";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { PersonaOverview } from "src";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
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
import SplitSegmentModal from "@modals/SegmentV3/SplitSegmentModal";
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
import SelectStrategyModal from "@modals/SelectStrategyModal";
import PreFiltersV2EditModal from "@modals/PrefiltersV2/PrefilterV2EditModal";
import ResetSegmentModal from "@modals/SegmentV3/ResetSegmentModal";
import SellScaleAssistModal from "@modals/SellScaleAssistModal";
import { IconWand } from "@tabler/icons";
import ICPRoutingCreateModal from "@modals/website/ICPRoutingCreateModal";
import CreateCampaignWithVoiceModal from "@modals/CreateCampaignWithVoiceModal";
import CreateVisitorBucketModal from "@modals/website/CreateVisitorBucketModal";
import ConnectSegmentModal from "@modals/SegmentV3/ConnectSegmentModal";
import StrategyDeleteModal from "@modals/AIBrain/StrategyDeleteModal";
import CampaignFilterModal from "@modals/CampaignFilterModal";
import AccountContactFiltersModal from "@modals/AccountContactFiltersModal";
import OverrideProspectsModal from "@modals/OverrideProspectsModal";

export const socket = io(SOCKET_SERVICE_URL); //'http://localhost:3000');

socket.on("connect", () => {
  console.log(`Socket connected: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  console.log(`Socket disconnected: ${socket.id}`);
  console.log("reason: ", reason);
});

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
  const location = useLocation();
  const [socket, setSocket] = useRecoilState(socketState);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  const [suggestion, setSuggestion] = useState<string>("");
  const [showSuggestion, setShowSuggestion] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const acceptRef = useRef<boolean>(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const suggestionInputRef = useRef<string>("");
  const previousValueRef = useRef<string>("");

  /*Autocomplete */

  const handleInputWithSuggestion = (event: Event) => {
    if (
      userData?.client_name !== "SellScale" &&
      userData?.client_name !== "DailyDropout.fyi"
    ) {
      return;
    }
    //do not run the autocomplete if we're on the login page:
    if (window.location.pathname === "/login") {
      return;
    }

    const target = event.target as HTMLTextAreaElement | HTMLElement;
    if (target instanceof HTMLTextAreaElement) {
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    let currentValue: string;
    let previousValue: string;

    //tiptap prose mirror (rich text editor) needs to be handled differently
    if (
      target.classList.contains("tiptap") &&
      target.classList.contains("ProseMirror")
    ) {
      currentValue = target.innerText;
      previousValue = previousValueRef.current;
      previousValueRef.current = currentValue;
    } else if (target instanceof HTMLTextAreaElement) {
      currentValue = target.value;
      previousValue = previousValueRef.current;
      previousValueRef.current = currentValue;
    } else {
      return;
    }

    if (currentValue?.length < previousValue?.length) {
      // User deleted some data, do not trigger autocomplete
      setSuggestion("");
      setShowSuggestion(false);
      return;
    }

    const cursorAtEnd =
      target instanceof HTMLTextAreaElement
        ? target.selectionStart === currentValue.length
        : true;
    const endsWithNewline = currentValue.endsWith("\n");
    const cursorBeforeNewline =
      target instanceof HTMLTextAreaElement
        ? currentValue[target.selectionStart] === "\n"
        : false;

    if (!cursorAtEnd && !endsWithNewline && !cursorBeforeNewline) {
      // Do not trigger autocomplete if not at the end, doesn't end with a newline, or not before a newline
      setSuggestion("");
      setShowSuggestion(false);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      const userInput =
        "please give a completion for the following text, only the completion, do not premise it with anything and certainly do not write what I already wrote. Here is the text you will need to complete: " +
        currentValue;
      if (userInput.trim() === "") {
        setSuggestion("");
        setShowSuggestion(false);
        return;
      }

      try {
        // Create and show the loading GIF
        const loadingGif = document.createElement("img");
        loadingGif.src = logotrial;
        loadingGif.style.position = "fixed";
        loadingGif.style.top = "10px";
        loadingGif.style.right = "10px";
        loadingGif.style.width = "50px";
        loadingGif.style.zIndex = "10000";
        document.body.appendChild(loadingGif);

        const response = await fetch(`${API_URL}/ml/quick`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ userInput, contextInfo: "N/A" }),
        });

        // Remove the loading GIF after fetching
        if (loadingGif.parentNode) {
          loadingGif.parentNode.removeChild(loadingGif);
        }

        const data = await response.json();
        suggestionInputRef.current = data.response;
        setSuggestion(data.response);
        setShowSuggestion(true);

        // Show suggestion immediately
        if (target instanceof HTMLTextAreaElement) {
          const start = target.selectionStart;
          const end = target.selectionEnd;
          target.value =
            target.value.substring(0, start) +
            data.response +
            target.value.substring(end);
          target.selectionStart = start;
          target.selectionEnd = start + data.response.length;
        } else if (
          target.classList.contains("tiptap") &&
          target.classList.contains("ProseMirror")
        ) {
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(target);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
          if (!popoverRef.current) {
            target.textContent += data.response;
          } else {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(target);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
            selection
              ?.getRangeAt(0)
              .insertNode(document.createTextNode(data.response));
            selection?.collapseToEnd();
          }

          // Highlight the inserted text
          const getTextNodesUnder = (node: Node) => {
            const textNodes = [];
            const walker = document.createTreeWalker(
              node,
              NodeFilter.SHOW_TEXT
            );
            let n;
            while ((n = walker.nextNode())) {
              textNodes.push(n);
            }
            return textNodes;
          };

          const textNodes = getTextNodesUnder(target);
          const textContent = textNodes
            .map((node) => node.textContent)
            .join("");
          const textLength = textContent.length;

          if (textLength === 0) {
            console.log("ProseMirror instance is empty.");
            return;
          }

          const startOffset = textLength - data.response.length;
          const endOffset = textLength;

          let currentOffset = 0;
          let startNode, endNode, startNodeOffset, endNodeOffset;

          for (const node of textNodes) {
            const nodeLength = node.textContent?.length ?? 0;
            if (currentOffset + nodeLength >= startOffset && !startNode) {
              startNode = node;
              startNodeOffset = startOffset - currentOffset;
            }
            if (currentOffset + nodeLength >= endOffset) {
              endNode = node;
              endNodeOffset = endOffset - currentOffset;
              break;
            }
            currentOffset += nodeLength;
          }

          const endRange = document.createRange();
          if (startNode && endNode && startNodeOffset && endNodeOffset) {
            endRange.setStart(startNode, startNodeOffset);
            endRange.setEnd(endNode, endNodeOffset);
          } else {
            console.error("Error: startNode or endNode is undefined.");
          }

          selection?.removeAllRanges();
          selection?.addRange(endRange);
        }

        // Reset suggestion for the next request
        setSuggestion("");
        setShowSuggestion(false);
      } catch (error) {
        console.error("Error fetching autocomplete suggestion:", error);
        setSuggestion("");
        setShowSuggestion(false);
      }
    }, 1500);
  };

  const handleKeyDownWithSuggestion = (event: KeyboardEvent) => {
    const target = event.target as HTMLTextAreaElement | HTMLElement;

    if (event.key === "Tab" && suggestionInputRef.current) {
      event.preventDefault();
      if (target instanceof HTMLTextAreaElement) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        target.value =
          target.value.substring(0, start) +
          suggestionInputRef.current +
          target.value.substring(end);
        target.selectionStart = target.selectionEnd =
          start + suggestionInputRef.current.length;
      } else if (
        target.classList.contains("tiptap") &&
        target.classList.contains("ProseMirror")
      ) {
        const selection = window.getSelection();
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(suggestionInputRef.current));
          selection.collapseToEnd();
        }
      }
      suggestionInputRef.current = "";
      setSuggestion("");
      setShowSuggestion(false);
    } else if (event.key !== "Tab") {
      setShowSuggestion(false);
    }
  };

  // useEffect(() => {
  //   let lastKeyPressed: string | null = null;

  //   const handleInput = (event: Event) => {
  //     const activeElement = document.activeElement as HTMLElement;
  //     if (
  //       activeElement &&
  //       (activeElement.tagName === "TEXTAREA" ||
  //         (activeElement.tagName === "DIV" && (activeElement.getAttribute("role") === "textbox" || activeElement.getAttribute("contenteditable") === "true")) ||
  //         (activeElement.tagName === "INPUT" && (activeElement as HTMLInputElement).type === "text") ||
  //         (activeElement.classList.contains("mantine-Textarea-input") && activeElement.tagName === "TEXTAREA") ||
  //         (activeElement.classList.contains("mantine-Input-input") && activeElement.tagName === "TEXTAREA") ||
  //         (activeElement.classList.contains("tiptap") && activeElement.classList.contains("ProseMirror")))
  //     ) {
  //       // Ensure the suggestion component does not run within the quick prompt
  //       if (!popoverRef.current) {
  //         activeElement.addEventListener("input", (e) => {
  //           if (lastKeyPressed !== "Backspace" && lastKeyPressed !== "Delete") {
  //             handleInputWithSuggestion(e);
  //           }
  //         });
  //         activeElement.addEventListener("keydown", handleKeyDownWithSuggestion);
  //         activeElement.addEventListener("keydown", (e) => {
  //           lastKeyPressed = e.key;
  //           if (e.key === "Tab") {
  //             e.preventDefault();
  //             handleKeyDownWithSuggestion(e as unknown as KeyboardEvent);
  //           }
  //         });
  //       }
  //     }
  //   };

  //   document.addEventListener("focusin", handleInput);

  //   return () => {
  //     document.removeEventListener("focusin", handleInput);
  //   };
  // }, [showSuggestion, suggestion]);

  /* Quick Prompt */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modalElement = document.querySelector(
        ".mantine-Paper-root.mantine-Modal-content"
      );
      if (
        acceptRef.current === true &&
        modalElement &&
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        handleAccept();
      }
      if (event.metaKey && event.key === "'") {
        const activeElement = document.activeElement as HTMLElement;
        if (
          activeElement &&
          (activeElement.tagName === "TEXTAREA" ||
            (activeElement.tagName === "DIV" &&
              (activeElement.getAttribute("role") === "textbox" ||
                activeElement.getAttribute("contenteditable") === "true")) ||
            (activeElement.tagName === "INPUT" &&
              (activeElement as HTMLInputElement).type === "text") ||
            (activeElement.classList.contains("mantine-Textarea-input") &&
              activeElement.tagName === "TEXTAREA") ||
            (activeElement.classList.contains("mantine-Input-input") &&
              activeElement.tagName === "TEXTAREA") ||
            (activeElement.classList.contains("tiptap") &&
              activeElement.classList.contains("ProseMirror")))
        ) {
          previousFocusedElementRef.current = activeElement;
        }
        if (
          previousFocusedElementRef.current &&
          document.contains(previousFocusedElementRef.current)
        ) {
          open();
        }
      } else if (event.metaKey && event.key === "Enter") {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === "TEXTAREA") {
          activeElement.blur();
        }
      }
      // if (event.key.length === 1 && !isNaN(Number(event.key))) {
      //   alert(`You are pressed ${event.key}`);
      // }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  ////
  const onKeyDown = (e: any) => {
    if (e.target.value.length === 0 && e.key >= "0" && e.key <= "9") {
      const keyIndex = parseInt(e.key, 10);
      const keyItem = keyData.find((item) => item.keyboard === keyIndex);
      if (keyItem) {
        setLoading(true);
        typeUserInput(
          previousFocusedElementRef.current,
          keyItem.prompt,
          getContextualInformation()
        );
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      setLoading(true);
      e.preventDefault();
      const contextInfo = getContextualInformation();
      console.log(previousFocusedElementRef.current);
      typeUserInput(
        previousFocusedElementRef.current,
        e.target.value,
        contextInfo
      );
    }
  };

  const handleAccept = () => {
    if (previousFocusedElementRef.current) {
      const event = new Event("input", { bubbles: true });

      previousFocusedElementRef.current.dispatchEvent(event);
      previousFocusedElementRef.current.focus();
      setTimeout(() => {
        (previousFocusedElementRef.current as HTMLTextAreaElement).value += " ";
        setTimeout(() => {
          (previousFocusedElementRef.current as HTMLTextAreaElement).value = (
            previousFocusedElementRef.current as HTMLTextAreaElement
          ).value.trim();
        }, 20);
      }, 20);
    }
    const element: HTMLElement | null = previousFocusedElementRef.current;
    if (element) element.style.color = "black";
    acceptRef.current = false;
    close();
  };
  ////

  // const typeUserInput = (element: HTMLElement | null, userInput: string, popover: HTMLDivElement, contextInfo: any) => {
  const typeUserInput = (
    element: HTMLElement | null,
    userInput: string,
    contextInfo: any
  ) => {
    if (!element) return;
    let index = 0;

    fetch(`${API_URL}/ml/quick`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ userInput, contextInfo }),
    })
      .then((response) => response.json())
      .then((res) => {
        console.log("Response JSON:", res);
        const interval = setInterval(() => {
          if (index < res.response.length) {
            const char = res.response.charAt(index);
            if (
              element.classList.contains("tiptap") &&
              element.classList.contains("ProseMirror")
            ) {
              element.style.color = "green";
              element.innerText =
                element.innerText + (index === 0 && char === " " ? "" : char);
            } else {
              const textarea = element as HTMLTextAreaElement;
              const value = textarea.value || "";
              const start = textarea.selectionStart;
              textarea.value =
                value.slice(0, start) + char + value.slice(start);
              textarea.selectionStart = textarea.selectionEnd = start + 1;

              // Reset React16 internal value tracker
              const tracker = (textarea as any)._valueTracker;
              if (tracker) {
                tracker.setValue(value);
              }
              element.style.color = "green";
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
            }
            index += 1;
          } else {
            clearInterval(interval);
            setLoading(false);
            acceptRef.current = true;
            // removeLoadingGifAndAddButton(popover, element);
            // element.focus();
          }
        }, 1);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // const getContextualInformation = (element: HTMLElement): string => {
  const getContextualInformation = (): string => {
    let context = "";
    // if (window.location.href.includes("/inbox")) {
    context = "Here is the conversation, I reached out first: \n";
    const messageElements = document.querySelectorAll(
      'div[style="font-size: 0.875rem;"], div.line-clamp-4'
    );
    let lineClampCount = 0;
    let fontSizeCount = 0;

    messageElements.forEach((messageElement) => {
      if (messageElement.classList.contains("line-clamp-4")) {
        lineClampCount++;
      } else if (
        messageElement.getAttribute("style") === "font-size: 0.875rem;"
      ) {
        fontSizeCount++;
      }
    });

    if (lineClampCount > fontSizeCount) {
      context +=
        "These are emails, please try to follow my tone as close as possible, do not use markdown. use newlines for formatting. \n";
    } else if (fontSizeCount > lineClampCount) {
      context +=
        "These are LinkedIn messages, so please be more casual, or try to follow my tone as close as possible.: \n";
    }

    messageElements.forEach((messageElement) => {
      const messageText = messageElement.innerHTML?.trim();
      if (messageText) {
        context += ` ${messageText} \n`;
      }
    });

    return context;
    // }
    // const MAX_PARENT_COUNT = 6;
    // let currentElement: HTMLElement | null = element;
    // let parentCount = 0;

    // while (currentElement && parentCount < MAX_PARENT_COUNT) {
    //   const textContent = currentElement.textContent?.trim();
    //   if (textContent) {
    //     context = `${textContent} ${context}`;
    //   }
    //   currentElement = currentElement.parentElement;
    //   parentCount++;
    // }
    // let ret = context.trim();
    // return ret;
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

  const [drawerProspectId, setDrawerProspectId] = useRecoilState(
    prospectDrawerIdState
  );
  const [drawerOpened, setDrawerOpened] = useRecoilState(
    prospectDrawerOpenState
  );

  // Select the last used project
  const userToken = useRecoilValue(userTokenState);
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);

  useEffect(() => {
    posthog.setPersonPropertiesForFlags({ distinct_id: userData?.id }, false);
  });

  // Set persona query param
  const [searchParams] = useSearchParams();
  const params2 = useParams();

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
      const persona_id = searchParams.get("campaign_id")
        ? searchParams.get("campaign_id")
        : params2.campaign_id;
      if (persona_id) {
        // Set to query param persona
        const project = await getFreshCurrentProject(userToken, +persona_id);
        setCurrentProject(project);
        //removeQueryParam('campaign_id');
      } else {
        // Set to last used persona
        const currentPersonaId = getCurrentPersonaId();
        if (!currentProject && currentPersonaId) {
          const project = await getFreshCurrentProject(
            userToken,
            +currentPersonaId
          );
          setCurrentProject(project);
        } else if (!currentPersonaId) {
          // Set to first persona
          const response = await getPersonasOverview(userToken);
          const result =
            response.status === "success"
              ? (response.data as PersonaOverview[])
              : [];
          if (result.length > 0) {
            setCurrentProject(result[0]);
          }
        }
      }
    })();
  }, [location, params2]);

  const [opened, { open, close }] = useDisclosure(false);

  const [keyData, setKeyData] = useState([
    {
      title: "Linkedin CTA",
      keyboard: 1,
      prompt:
        "Please write a compelling call-to-action for LinkedIn. Do not use any placeholders.",
    },
    {
      title: "Linkedin Initial Message",
      keyboard: 2,
      prompt:
        "Please draft an engaging initial message for LinkedIn. Do not use any placeholders.",
    },
    {
      title: "Linkedin Follow Up",
      keyboard: 3,
      prompt:
        "Please create a follow-up message for LinkedIn. Do not use any placeholders.",
    },
    {
      title: "Linkedin Break Up",
      keyboard: 4,
      prompt:
        "Please write a break-up message for LinkedIn. Do not use any placeholders.",
    },
    {
      title: "Linkedin Subject",
      keyboard: 5,
      prompt:
        "Please provide a subject line for a LinkedIn message.  Do not use any placeholders.",
    },
    {
      title: "Email Initial Message",
      keyboard: 6,
      prompt:
        "Please draft an initial email message. Do not use any placeholders.",
    },
    {
      title: "Email Follow Up",
      keyboard: 7,
      prompt:
        "Please create a follow-up email message. Do not use any placeholders.",
    },
    {
      title: "Email Break Up",
      keyboard: 8,
      prompt:
        "Please write a break-up email message. Do not use any placeholders.",
    },
    {
      title: "Email Linkedin",
      keyboard: 9,
      prompt:
        "Please draft an email response that references LinkedIn. Do not use any placeholders.",
    },
    {
      title: "Email Email",
      keyboard: 0,
      prompt:
        "Please draft an email message response given the context. Do not use any placeholders.",
    },
  ]);

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
              resetsegment: ResetSegmentModal,
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
              deleteStrategy: StrategyDeleteModal,
              previewStrategy: StrategyPreviewModal,
              strategySelectModal: SelectStrategyModal,
              createCampaignWithVoiceModal: CreateCampaignWithVoiceModal,
              prefilterEditModal: PreFiltersV2EditModal,
              assistmodal: SellScaleAssistModal,
              createICProutingModal: ICPRoutingCreateModal,
              createvisitorbucketmodal: CreateVisitorBucketModal,
              connectSegment: ConnectSegmentModal,
              campaignFilter: CampaignFilterModal,
              accountcontactFilterModal: AccountContactFiltersModal,
              overrideProspectsModal: OverrideProspectsModal,
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
          <Modal
            opened={opened}
            size={600}
            onClose={handleAccept}
            title={
              <Flex align={"center"} gap={"xs"}>
                <IconWand size={"1.4rem"} color="#d33ff1" />
                <Title order={3}>SellScale Writing Assist</Title>
              </Flex>
            }
            styles={{
              inner: {
                zIndex: 1000,
              },
              overlay: {
                backgroundColor: "transparent",
              },
            }}
          >
            <SellScaleAssistModal
              isLoading={isLoading}
              handleKeyDown={onKeyDown}
              isAccpet={acceptRef.current}
              handleAccept={handleAccept}
            />
          </Modal>
        </SpotlightWrapper>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
