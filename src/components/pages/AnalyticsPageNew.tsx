import PageFrame from '@common/PageFrame'
import ComingSoonCard from '@common/library/ComingSoonCard';
import ScrapingReport from '@common/persona/ScrapingReport';
import TAMGraphV2 from '@common/persona/TAMGraphV2';
import SettingUsage from '@common/settings/SettingUsage';
import { Tabs } from '@mantine/core';

const AnalyticsPageNew = () => {
  return (
    <PageFrame>
      <Tabs defaultValue="usage" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="usage">Usage</Tabs.Tab>
          <Tabs.Tab value="tam">TAM</Tabs.Tab>
          <Tabs.Tab value="scraping">Scraping</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tam" pt="xs">
          <TAMGraphV2 />
        </Tabs.Panel>
        <Tabs.Panel value="usage" pt="xs">
          <SettingUsage />
        </Tabs.Panel>
        <Tabs.Panel value="scraping" pt="xs">
          <ScrapingReport />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>  
  );
}

export default AnalyticsPageNew;