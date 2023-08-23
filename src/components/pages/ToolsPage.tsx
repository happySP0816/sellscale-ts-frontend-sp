import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { userDataState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import DemoFeedbackChart from "@common/charts/DemoFeedbackChart";
import AllContactsSection from "@common/home/AllContactsSection";
import DashboardSection from "@pages/DashboardPage";
import RecentActivitySection from "@common/home/RecentActivitySection";
import { Tabs } from "@mantine/core";
import {
  IconActivity,
  IconAddressBook,
  IconCalendarEvent,
  IconCheckbox,
  IconClipboardData,
  IconMilitaryRank,
} from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import CalendarSection from "@common/home/CalendarSection";
import PersonaFilters from "@common/persona/PersonaFilters";
import { currentProjectState } from "@atoms/personaAtoms";
import CustomResearchPointCard from "@common/persona/CustomResearchPointCard";
import CampaignTable from "@common/campaigns/CampaignTable";
import { IconFilterDollar } from "@tabler/icons-react";
import PipelineSection from "@common/home/PipelineSection";

export default function ToolsPage() {
  setPageTitle("Tools");

  const { tabId } = useLoaderData() as {
    tabId: string;
  };

  const currentProject = useRecoilValue(currentProjectState);
  if(!currentProject) {
    return <></>;
  }

  return (
    <PageFrame>
      <Tabs value={tabId} px="xs" color="teal">
        <Tabs.List sx={{ display: "none" }}>
          <Tabs.Tab value="filters" icon={<IconCheckbox size="1.1rem" />}>
            Filters
          </Tabs.Tab>
          <Tabs.Tab
            value="custom-data-point-importer"
            icon={<IconActivity size="1.1rem" />}
          >
            Custom Data Point Importer
          </Tabs.Tab>
          <Tabs.Tab
            value="demo-feedback"
            icon={<IconClipboardData size="1.1rem" />}
          >
            Demo Feedback Repository
          </Tabs.Tab>
          <Tabs.Tab value="calendar" icon={<IconCalendarEvent size="1.1rem" />}>
            Demo Calendar
          </Tabs.Tab>
          <Tabs.Tab value="campaigns" icon={<IconMilitaryRank size="1.1rem" />}>
            Campaigns
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="filters" pt="xs">
          {tabId === "filters" && <PersonaFilters />}
        </Tabs.Panel>
        <Tabs.Panel value="custom-data-point-importer" pt="xs">
          {tabId === "custom-data-point-importer" && <CustomResearchPointCard />}
        </Tabs.Panel>
        <Tabs.Panel value="demo-feedback" pt="xs">
          {tabId === "demo-feedback" && <DemoFeedbackChart />}
        </Tabs.Panel>
        <Tabs.Panel value="calendar" pt="xs">
          {tabId === "calendar" && <CalendarSection />}
        </Tabs.Panel>
        <Tabs.Panel value="campaigns" pt="xs">
          {tabId === "campaigns" && <CampaignTable />}
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
