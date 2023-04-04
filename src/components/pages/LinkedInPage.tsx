import { userDataState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import CampaignTable from "@common/campaigns/CampaignTable";
import AllContactsSection from "@common/home/AllContactsSection";
import RecActionsSection from "@common/home/RecActionsSection";
import RecentActivitySection from "@common/home/RecentActivitySection";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "@common/persona/details/PersonaDetailsTransformers";
import { Tabs } from "@mantine/core";
import { setPageTitle } from "@utils/documentChange";
import { useRecoilValue } from "recoil";

export default function LinkedInPage() {
  setPageTitle("LinkedIn");

  const userData = useRecoilValue(userDataState);

  return (
    <PageFrame>
      <Tabs defaultValue="ctas" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="ctas">CTAs</Tabs.Tab>
          <Tabs.Tab value="personalizations">Personalizations</Tabs.Tab>
          <Tabs.Tab value="campaign-history">Campaign History</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="ctas" pt="xs">
          <PersonaDetailsCTAs />
        </Tabs.Panel>
        <Tabs.Panel value="personalizations" pt="xs">
          <PersonaDetailsTransformers channel="LINKEDIN" />
        </Tabs.Panel>
        <Tabs.Panel value="campaign-history" pt="xs">
          <CampaignTable />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );

}
