import { Box, Tabs, Title } from "@mantine/core";
import { useState } from "react";
import WebsiteOverview from "./WebsiteOverview";
import ICPRouting from "./ICPRouting";

export default function WebsitePage() {
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  const handleTabChange = (value: string | null) => {
    setActiveTab(value);
  };

  return (
    <Box px={60} py={"xl"}>
      <Title order={2}>Website</Title>
      <Tabs value={activeTab} onTabChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="icp_routing">ICP Routing</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <WebsiteOverview setActiveTab={setActiveTab} />
        </Tabs.Panel>
        <Tabs.Panel value="icp_routing">
          <ICPRouting/>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
