import { Button, Flex, Kbd, Paper, SimpleGrid, Text, Textarea } from "@mantine/core";
import logotrial from "../../components/PersonaCampaigns/Logo-Trial-3.gif";
import { useState, useRef, useEffect } from "react";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

export default function SellScaleAssistModal(props: any) {
  const { isLoading, handleKeyDown, handleAccept, isAccpet } = props;

  const [suggestion, setSuggestion] = useState("");
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  }, [open]);

  return (
    <div style={{ position: "relative", minHeight: "80px" }}>
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
      {(!isLoading && !isAccpet) && (
        <Textarea
          ref={textareaRef}
          minRows={3}
          placeholder="Enter your prompt and press Enter to generate, or use one of the hotkeys"
          onKeyDown={handleKeyDown}
          onChange={(e) => setSuggestion(e.target.value)}
        />
      )}
      {isAccpet && (
        <div className="w-full justify-center flex">
          <Button onClick={handleAccept} color="green" mr={0} mt={"md"} style={{ backgroundColor: "#28a745", color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>
             Accept {"\u23CE"}
          </Button>
        </div>
      )}

      {!isLoading && !isAccpet && suggestion === '' &&  <Paper radius={"sm"} bg={"#fbfcfe"} p={"sm"} mt={"sm"}>
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
                    Press <Kbd>{item.keyboard}</Kbd>
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
