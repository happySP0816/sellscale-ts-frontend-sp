import { Flex, Tabs, Text, Loader, Overlay } from "@mantine/core";
import SlackbotSection from "../slack/SlackbotSection";
import SlackWebhookSection from "../slack/SlackWebhookSection";
import { useState } from "react";
import MicrosoftTeamsWebhookSection from "./MicrosoftTeamsWebhookSection";

export default function MicrosoftTeamsSettings() {
  const [activeTab, setActiveTab] = useState("setup");
  const [loading, setPageLoading] = useState(false);

  return (
    <>
      {loading && (
        <Overlay opacity={0.6} color="#000" zIndex={999}>
          <Flex align="center" justify="center" style={{ height: "100vh" }}>
            <Loader size="lg" variant="dots" />
          </Flex>
        </Overlay>
      )}
      <Flex
        style={{ border: "1px solid #dee2e6", borderRadius: "6px" }}
        direction={"column"}
        p={"lg"}
        mx={"sm"}
        bg="white"
      >
        <Flex direction={"column"} px={"sm"} mb={"md"}>
          <Text fw={600} size={28}>
            Microsoft Teams Connection
          </Text>
          <Text>
            Get real time alerts and visibility into company and people
            activities
          </Text>
        </Flex>
        <MicrosoftTeamsWebhookSection
          setActiveTab={setActiveTab}
          setPageLoading={setPageLoading}
        />
      </Flex>
    </>
  );
}
