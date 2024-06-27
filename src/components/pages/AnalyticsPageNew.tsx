import PageFrame from "@common/PageFrame";
import DemoFeedbackChartV2 from "@common/charts/DemoFeedbackChart";
import DemoFeedbackCard from "@common/demo_feedback/DemoFeedbackCard";
import ComingSoonCard from "@common/library/ComingSoonCard";
import RejectionAnalysis from "@common/persona/RejectionAnalysis";
import ScrapingReport from "@common/persona/ScrapingReport";
import TAMGraphV2 from "@common/persona/TAMGraphV2";
import SettingUsage from "@common/settings/SettingUsage";
import { Alert, Box, Button, Group, Image, Tabs, Title, rem } from "@mantine/core";
import MessagingAnalytics from "../AnalyticsPage/MessagingAnalytics";
import AiActivityLogs from "../AnalyticsPage/AiActivityLogs";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import Personas from "@common/persona/Personas";
import SequencePreviewMock from "./sequence_preview_mock.png";
import { modals } from "@mantine/modals";
import AssetIngestor from "@common/assets/AssetIngester";
import Sequence from "./Sequence/Sequence";
import { IconBooks } from "@tabler/icons";
import SequenceBuilderV3 from "@common/internal_tools/sequence_builder_v3/SequenceBuilderV3";
import SequenceBuilderV3ClientFacing from "@common/internal_tools/sequence_builder_v3/SequenceBuilderV3ClientFacing";
import AIBrainStrategy from "./AIBrainStrategy";

const AnalyticsPageNew = () => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const campaignId = currentProject?.id;
  return (
    <PageFrame>
      <Tabs
        defaultValue="intakes"
        px="xs"
        styles={(theme) => ({
          tab: {
            borderBottom: `2px solid transparent`,
            "&[data-active]": {
              borderBottom: `2px solid ${theme.colors.blue[theme.fn.primaryShade()]}`,
              color: theme.colors.blue[theme.fn.primaryShade()],
            },
            paddingTop: rem(16),
            paddingBottom: rem(16),

            color: theme.colors.gray[6],
          },
          panel: {
            marginTop: rem(16),
            paddingLeft: `${rem(0)} !important`,
          },
          tabLabel: {
            fontWeight: 600,
          },
        })}
      >
        <Tabs.List>
          {/* <Tabs.Tab value='chatbot'>Chatbot</Tabs.Tab> */}
          {/* <Tabs.Tab value="usage">Usage</Tabs.Tab> */}
          <Tabs.Tab value="intakes">Intakes </Tabs.Tab>
          <Tabs.Tab value="assets">Assets </Tabs.Tab>
          <Tabs.Tab value="sequences">Sequences </Tabs.Tab>
          <Tabs.Tab value="strategy">Strategies </Tabs.Tab>
          <Tabs.Tab value="tam" ml="auto">
            TAM
          </Tabs.Tab>
          <Tabs.Tab value="rejection_analysis">Rejection Analysis</Tabs.Tab>
          {/* <Tabs.Tab value="scraping">Scraping</Tabs.Tab> */}
          {/* <Tabs.Tab value="demo-feedback">Demo Feedback</Tabs.Tab> */}
          {/* <Tabs.Tab value='message-analytics'>Messaging Analytics </Tabs.Tab> */}
          {/* <Tabs.Tab value='ai-activity-logs'>AI Activity Logs </Tabs.Tab> */}
        </Tabs.List>
        <Tabs.Panel value="chatbot" pt="xs">
          <iframe
            src={"https://sellscale.retool.com/embedded/public/2fe5bcbd-17cd-4432-9a3e-6d8908703034#authToken=" + userToken}
            width={"100%"}
            height={window.innerHeight - 30}
            frameBorder={0}
            allowFullScreen
          />
        </Tabs.Panel>
        <Tabs.Panel value="tam" pt="xs">
          <TAMGraphV2 />
        </Tabs.Panel>
        <Tabs.Panel value="usage" pt="xs">
          <SettingUsage />
        </Tabs.Panel>
        <Tabs.Panel value="scraping" pt="xs">
          <ScrapingReport />
        </Tabs.Panel>
        <Tabs.Panel value="rejection_analysis" pt="xs">
          <RejectionAnalysis />
        </Tabs.Panel>
        <Tabs.Panel value="demo-feedback" pt="xs">
          <DemoFeedbackChartV2 />
        </Tabs.Panel>
        <Tabs.Panel value="message-analytics" pt="xs">
          <MessagingAnalytics />
        </Tabs.Panel>
        <Tabs.Panel value="ai-activity-logs" pt="xs">
          <AiActivityLogs />
        </Tabs.Panel>
        <Tabs.Panel value="intakes" pt="xs">
          <Personas />
        </Tabs.Panel>
        <Tabs.Panel value="sequences" pt="xs">
          <SequenceBuilderV3ClientFacing />
        </Tabs.Panel>
        <Tabs.Panel value="strategy" pt="xs">
          <AIBrainStrategy />
        </Tabs.Panel>
        <Tabs.Panel value="assets" pt="xs">
          <Group position="right" pr={40}>
            <Button
              onClick={() => {
                modals.openConfirmModal({
                  size: "70dvw",
                  title: <Title order={3}>Asset Ingestor</Title>,
                  children: <AssetIngestor />,
                  labels: { confirm: "Finish", cancel: "Close" },
                });
              }}
              color="teal"
              leftIcon={<IconBooks size="0.9rem" />}
            >
              Ingest assets
            </Button>
          </Group>
          <iframe
            src={"https://sellscale.retool.com/embedded/public/035e7bc0-da4c-4913-a028-5c49e0d457fc#auth_token=" + userToken}
            width={"100%"}
            height={window.innerHeight - 30}
            frameBorder={0}
            allowFullScreen
          />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
};

export default AnalyticsPageNew;
