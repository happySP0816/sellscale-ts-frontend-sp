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
import CalendarSection from "@common/home/CalendarSection";
import { currentProjectState } from "@atoms/personaAtoms";

export default function ContactsPage() {
  setPageTitle("Contacts");

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

  const currentProject = useRecoilValue(currentProjectState);
  if(!currentProject) {
    return <></>;
  }

  return (
    <PageFrame>
      <AllContactsSection />
    </PageFrame>
  );
}
