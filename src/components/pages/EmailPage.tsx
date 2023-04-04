import { userDataState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import EmailAnalyticsTable from "@common/analytics/EmailAnalyticsTable";
import CampaignTable from "@common/campaigns/CampaignTable";
import AllContactsSection from "@common/home/AllContactsSection";
import RecActionsSection from "@common/home/RecActionsSection";
import RecentActivitySection from "@common/home/RecentActivitySection";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "@common/persona/details/PersonaDetailsTransformers";
import SequenceSection from "@common/sequence/SequenceSection";
import { Tabs } from "@mantine/core";
import { setPageTitle } from "@utils/documentChange";
import { useRecoilValue } from "recoil";

export default function EmailPage() {
  setPageTitle("Email");

  const userData = useRecoilValue(userDataState);

  return (
    <PageFrame>
      <Tabs defaultValue="sequences" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="sequences">Sequences</Tabs.Tab>
          <Tabs.Tab value="personalizations">Personalizations</Tabs.Tab>
          <Tabs.Tab value="campaign-history">Campaign History</Tabs.Tab>
          <Tabs.Tab value="email-details">Sequence Analysis</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="sequences" pt="xs">
          <SequenceSection />
        </Tabs.Panel>
        <Tabs.Panel value="personalizations" pt="xs">
          <PersonaDetailsTransformers channel="EMAIL" />
        </Tabs.Panel>
        <Tabs.Panel value="campaign-history" pt="xs">
          <CampaignTable type="EMAIL" />
        </Tabs.Panel>
        <Tabs.Panel value="email-details" pt="xs">
          <EmailAnalyticsTable />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );

}
