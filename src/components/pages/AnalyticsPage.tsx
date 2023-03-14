import EmailAnalyticsTable from "@common/analytics/EmailAnalyticsTable";
import PageFrame from "@common/PageFrame";
import { Tabs } from "@mantine/core";
import { setPageTitle } from "@utils/documentChange";

export default function AnalyticsPage() {
  setPageTitle("Analytics");

  return (
    <PageFrame>
      <Tabs defaultValue="email" px="xs">
        <Tabs.List grow position="center">
          <Tabs.Tab value="email">Email</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="email" pt="xs">
          <EmailAnalyticsTable />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
