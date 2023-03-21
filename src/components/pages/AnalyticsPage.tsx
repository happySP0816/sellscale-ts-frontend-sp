import EmailAnalyticsTable from "@common/analytics/EmailAnalyticsTable";
import PageFrame from "@common/PageFrame";
<<<<<<< HEAD
import { Tabs } from "@mantine/core";
import PageTitle from "@nav/PageTitle";
=======
import { Center, Tabs, Title } from "@mantine/core";
>>>>>>> a9413e5 (Made schlep changes)
import { setPageTitle } from "@utils/documentChange";

export default function AnalyticsPage() {
  setPageTitle("Analytics");

  return (
    <PageFrame>
      <PageTitle title='Analytics' mb={false} />
      <Tabs defaultValue="email" px="xs">
        <Tabs.List>
          <Tabs.Tab value="linkedin">LinkedIn</Tabs.Tab>
          <Tabs.Tab value="email">Email</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="linkedin" pt="xs">
            <Center><Title order={2} fs="italic">Coming soon!</Title></Center>
        </Tabs.Panel>
        <Tabs.Panel value="email" pt="xs">
          <EmailAnalyticsTable />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
