import { Box, Flex, Kbd, Paper, SimpleGrid, Text, Textarea } from "@mantine/core";
import { useState } from "react";

export default function SellScaleAssistModal() {
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
    <Box>
      <Textarea minRows={3} placeholder="Write prompt and press Enter to generate" />
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
    </Box>
  );
}
