import { userDataState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import AllContactsSection from "@common/home/AllContactsSection";
import RecActionsSection from "@common/home/RecActionsSection";
import RecentActivitySection from "@common/home/RecentActivitySection";
import { Tabs } from "@mantine/core";
import { setPageTitle } from "@utils/documentChange";
import { useRecoilValue } from "recoil";

export default function HomePage() {
  setPageTitle("Home");

  const userData = useRecoilValue(userDataState);

  return (
    <PageFrame>
      <Tabs defaultValue="all-contacts" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="all-contacts">All Contacts</Tabs.Tab>
          <Tabs.Tab value="rec-actions">Recommended Actions</Tabs.Tab>
          <Tabs.Tab value="recent-activity">Recent Activity</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="all-contacts" pt="xs">
          <AllContactsSection />
        </Tabs.Panel>
        <Tabs.Panel value="rec-actions" pt="xs">
          <RecActionsSection />
        </Tabs.Panel>
        <Tabs.Panel value="recent-activity" pt="xs">
          <RecentActivitySection />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
