import { Button, Flex, Kbd, Paper, SimpleGrid, Text, Textarea } from "@mantine/core";
import logotrial from "../../components/PersonaCampaigns/Logo-Trial-3.gif";
import { useState, useRef, useEffect } from "react";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

export default function SellScaleAssistModal(props: any) {
  const { isLoading, handleKeyDown, handleAccept, isAccpet } = props;
  const [keyData, setKeyData] = useState([
    {
      title: "Linkedin CTA",
      keyboard: 1,
    },
    {
      title: "Linkedin Initial Message",
      keyboard: 2,
    },
    {
      title: "Linkedin Follow Up",
      keyboard: 3,
    },
    {
      title: "Linkedin Break Up",
      keyboard: 4,
    },
    {
      title: "Linkedin Subject",
      keyboard: 5,
    },
    {
      title: "Email Initial Message",
      keyboard: 6,
    },
    {
      title: "Email Follow Up",
      keyboard: 7,
    },
    {
      title: "Email Break Up",
      keyboard: 8,
    },
    {
      title: "Linkedin Message",
      keyboard: 9,
    },
    {
      title: "Email Message",
      keyboard: 0,
    },
  ]);

  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "'") {
        const activeElement = document.activeElement as HTMLElement;
        if (
          activeElement &&
          (activeElement.tagName === "TEXTAREA" ||
            (activeElement.tagName === "DIV" &&
              (activeElement.getAttribute("role") === "textbox" || activeElement.getAttribute("contenteditable") === "true")) ||
            (activeElement.tagName === "INPUT" && (activeElement as HTMLInputElement).type === "text") ||
            (activeElement.classList.contains("mantine-Textarea-input") && activeElement.tagName === "TEXTAREA") ||
            (activeElement.classList.contains("mantine-Input-input") && activeElement.tagName === "TEXTAREA") ||
            (activeElement.classList.contains("tiptap") && activeElement.classList.contains("ProseMirror")))
        ) {
          previousFocusedElementRef.current = activeElement;
        }
        open();
      } else if (event.metaKey && event.key === "Enter") {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.tagName === "TEXTAREA") {
          activeElement.blur();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  }, [open]);

  const getContextualInformation = (): string => {
    let context = "Here is the conversation, I reached out first: \n";
    const messageElements = document.querySelectorAll('div[style="font-size: 0.875rem;"], div.line-clamp-4');
    let lineClampCount = 0;
    let fontSizeCount = 0;

    messageElements.forEach((messageElement) => {
      if (messageElement.classList.contains("line-clamp-4")) {
        lineClampCount++;
      } else if (messageElement.getAttribute("style") === "font-size: 0.875rem;") {
        fontSizeCount++;
      }
    });

    if (lineClampCount > fontSizeCount) {
      context += "These are emails, please try to follow my tone as close as possible, do not use markdown. use newlines for formatting. \n";
    } else if (fontSizeCount > lineClampCount) {
      context += "These are LinkedIn messages, so please be more casual, or try to follow my tone as close as possible.: \n";
    }

    messageElements.forEach((messageElement) => {
      const messageText = messageElement.innerHTML?.trim();
      if (messageText) {
        context += ` ${messageText} \n`;
      }
    });

    return context;
  };

  return (
    <div style={{ position: "relative" }}>
      {isLoading && (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1000,
          }}
        >
          <img src={logotrial} style={{ width: 80, height: 80 }} />
        </div>
      )}
      <Textarea ref={textareaRef} minRows={3} placeholder="Enter your prompt and press Enter to generate, or use one of the hotkeys" onKeyDown={handleKeyDown} />
      {isAccpet && (
        <div className="w-full justify-end flex">
          <Button onClick={handleAccept} color="green" mr={0} mt={"md"}>
            Accept
          </Button>
        </div>
      )}

      {!isLoading && !isAccpet && <Paper radius={"sm"} bg={"#fbfcfe"} p={"sm"} mt={"sm"}>
        {/* <Text size={"sm"} color="gray">
          Auto activate one of the hotkeys by pressing 0-9
        </Text> */}
        <SimpleGrid cols={2} mt={"sm"}>
          {keyData.map((item, index) => {
            return (
              <Paper withBorder px={"sm"} py={4} key={index}>
                <Flex justify={"space-between"} align={"center"}>
                  <Text fw={500} size={"sm"}>
                    {item.title}
                  </Text>
                  <Text color="gray" size={"sm"} fw={500} className="flex items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
                    Press <Kbd>{navigator.platform.includes('Win') ? 'Windows' : '⌘'} + {item.keyboard}</Kbd>
                  </Text>
                </Flex>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Paper>}
    </div>
  );
}
