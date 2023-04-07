import { prospectDrawerIdState, prospectDrawerOpenState } from "@atoms/prospectAtoms";
import { userDataState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import AllContactsSection from "@common/home/AllContactsSection";
import RecActionsSection from "@common/home/RecActionsSection";
import RecentActivitySection from "@common/home/RecentActivitySection";
import { Tabs } from "@mantine/core";
import { IconActivity, IconAddressBook, IconCheckbox } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";

export default function HomePage() {
  setPageTitle("");

  const { prospectId } = useLoaderData() as { prospectId: string };
  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  useEffect(() => {
    if(prospectId && prospectId.trim().length > 0){
      setProspectId(+prospectId.trim())
      setOpened(true);
    }
  }, [prospectId]);

  return (
    <PageFrame>
      <Tabs defaultValue="all-contacts" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="all-contacts" icon={<IconAddressBook size="1.1rem" />}>All Contacts</Tabs.Tab>
          <Tabs.Tab value="rec-actions" icon={<IconCheckbox size="1.1rem" />}>Recommended Actions</Tabs.Tab>
          <Tabs.Tab value="recent-activity" icon={<IconActivity size="1.1rem" />}>Recent Activity</Tabs.Tab>
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
