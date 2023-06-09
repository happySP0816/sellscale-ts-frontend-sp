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
} from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import BumpFrameworksPage from "./BumpFrameworksPage";
import CalendarSection from "@common/home/CalendarSection";

export default function HomePage() {
  setPageTitle("");

  const { tabId, prospectId } = useLoaderData() as {
    tabId: string;
    prospectId: string;
  };
  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  useEffect(() => {
    if (prospectId && prospectId.trim().length > 0) {
      setProspectId(+prospectId.trim());
      setOpened(true);
    }
  }, [prospectId]);

  return (
    <PageFrame>
      <Tabs value={tabId} px="xs" color="teal">
        <Tabs.List sx={{ display: "none" }}>
          <Tabs.Tab value="dashboard" icon={<IconCheckbox size="1.1rem" />}>
            Dashboard
          </Tabs.Tab>
          <Tabs.Tab
            value="all-contacts"
            icon={<IconAddressBook size="1.1rem" />}
          >
            Pipeline
          </Tabs.Tab>
          <Tabs.Tab
            value="recent-activity"
            icon={<IconActivity size="1.1rem" />}
          >
            Recent Activity
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
        </Tabs.List>

        <Tabs.Panel value="all-contacts" pt="xs">
          {tabId === "all-contacts" && <AllContactsSection />}
        </Tabs.Panel>
        <Tabs.Panel value="dashboard" pt="xs">
          {tabId === "dashboard" && <DashboardSection />}
        </Tabs.Panel>
        <Tabs.Panel value="recent-activity" pt="xs">
          <RecentActivitySection />
        </Tabs.Panel>
        <Tabs.Panel value="demo-feedback" pt="xs">
          {tabId === "demo-feedback" && <DemoFeedbackChart />}
        </Tabs.Panel>
        <Tabs.Panel value="calendar" pt="xs">
          {tabId === "calendar" && <CalendarSection />}
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
