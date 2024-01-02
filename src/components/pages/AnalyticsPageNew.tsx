import PageFrame from '@common/PageFrame';
import DemoFeedbackChartV2 from '@common/charts/DemoFeedbackChart';
import DemoFeedbackCard from '@common/demo_feedback/DemoFeedbackCard';
import ComingSoonCard from '@common/library/ComingSoonCard';
import RejectionAnalysis from '@common/persona/RejectionAnalysis';
import ScrapingReport from '@common/persona/ScrapingReport';
import TAMGraphV2 from '@common/persona/TAMGraphV2';
import SettingUsage from '@common/settings/SettingUsage';
import { Tabs } from '@mantine/core';

const AnalyticsPageNew = () => {
  return (
    <PageFrame>
      <Tabs defaultValue='usage' px='xs' color='teal'>
        <Tabs.List>
          <Tabs.Tab value='usage'>Usage</Tabs.Tab>
          <Tabs.Tab value='tam'>TAM</Tabs.Tab>
          <Tabs.Tab value='scraping'>Scraping</Tabs.Tab>
          <Tabs.Tab value='rejection_analysis'>Rejection Analysis</Tabs.Tab>
          <Tabs.Tab value='demo-feedback'>Demo Feedback</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='tam' pt='xs'>
          <TAMGraphV2 />
        </Tabs.Panel>
        <Tabs.Panel value='usage' pt='xs'>
          <SettingUsage />
        </Tabs.Panel>
        <Tabs.Panel value='scraping' pt='xs'>
          <ScrapingReport />
        </Tabs.Panel>
        <Tabs.Panel value='rejection_analysis' pt='xs'>
          <RejectionAnalysis />
        </Tabs.Panel>
        <Tabs.Panel value='demo-feedback' pt='xs'>
          <DemoFeedbackChartV2 />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
};

export default AnalyticsPageNew;
