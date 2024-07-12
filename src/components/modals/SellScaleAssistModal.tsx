import { Button, Flex, Kbd, Paper, SimpleGrid, Text, Textarea } from "@mantine/core";
import logotrial from "../../components/PersonaCampaigns/Logo-Trial-3.gif";
import { useState } from "react";

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
      title: "Email Linkedin",
      keyboard: 9,
    },
    {
      title: "Email Email",
      keyboard: 0,
    },
  ]);

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
            backdropFilter: "blur(5px)",
          }}
        >
          <img src={logotrial} style={{ width: 80, height: 80 }} />
        </div>
      )}
      <Textarea minRows={3} placeholder="Write prompt and press Enter to generate" onKeyDown={handleKeyDown} />
      {isAccpet && (
        <div className="w-full justify-end flex">
          <Button onClick={handleAccept} color="green" mr={0} mt={"md"}>
            Accept
          </Button>
        </div>
      )}

      <Paper radius={"sm"} bg={"#fbfcfe"} p={"sm"} mt={"sm"}>
        <Text size={"sm"} color="gray">
          Auto activate one of the hotkeys by pressing 0-9
        </Text>
        <SimpleGrid cols={2} mt={"sm"}>
          {keyData.map((item, index) => {
            return (
              <Paper withBorder px={"sm"} py={4} key={index}>
                <Flex justify={"space-between"} align={"center"}>
                  <Text fw={500} size={"sm"}>
                    {item.title}
                  </Text>
                  <Text color="gray" size={"sm"} fw={500} className="flex items-center gap-1">
                    Press <Kbd>{item.keyboard}</Kbd>
                  </Text>
                </Flex>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Paper>
    </div>
  );
}
