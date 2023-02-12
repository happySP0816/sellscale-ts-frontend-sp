import { Drawer, ScrollArea } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { prospectDrawerOpenState } from "../atoms/personaAtoms";
import { faker } from "@faker-js/faker";
import { useQuery } from "react-query";
import { percentageToColor, temp_delay } from "../../utils/general";
import { chunk } from "lodash";
import { IconPencil, IconTrashX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { closeAllModals, openModal } from "@mantine/modals";
import ProspectDetailsSummary from "../common/prospectDetails/ProspectDetailsSummary";
import ProspectDetailsChangeStatus from "../common/prospectDetails/ProspectDetailsChangeStatus";
import ProspectDetailsCompany from "../common/prospectDetails/ProspectDetailsCompany";
import ProspectDetailsNotes from "../common/prospectDetails/ProspectDetailsNotes";
import ProspectDetailsViewConversation from "../common/prospectDetails/ProspectDetailsViewConversation";

const PAGE_SIZE = 20;

const PROSPECT_DETAILS = {
  details: {
    id: 4042,
    full_name: "Ayesha Tariq Mahmood",
    title: "Head of People Operations & Development l Product Owner - Arbisoft",
    status: "DEMO_SET",
    profile_pic: null,
    ai_responses_disabled: null,
    notes: [],
    persona: "Zaheer - HR leaders",
  },
  li: {
    li_conversation_url:
      "https://www.linkedin.com/messaging/thread/2-OWViOTk2NmQtZjg4Yy00MzE3LWFhZmQtMDJkNDc3OTg4MmMzXzAxMw==",
    li_conversation_thread: [],
    li_profile: "linkedin.com/in/ayesha-tariq-mahmood",
  },
  email: { email: null, email_status: "" },
  company: {
    logo:
      "https://media-exp1.licdn.com/dms/image/C4D0BAQGx8nN_y90A7Q/company-logo_400_400/0/1644584625800?e=1675296000&v=beta&t=cQg_ueisrQekizV9k9_YpW_xpiNKGl1wtG92aBKHBv4",
    name: "Arbisoft",
    location: "MCKINNEY TX, TX",
    tags: [
      "Rapid Application Development",
      "Enterprise Applications",
      "3D Applications",
      "Mobile App Development",
      "Automated Data Scraping",
      "Cloud Applications",
      "data services",
      "SaaS",
      "Python",
      "web app development",
      "software quality assurance",
      "custom software development",
      "Dedicated team",
    ],
    tagline: "Imagine . Build . Test . Repeat",
    description:
      "Arbisoft is one of the fastest growing software services companies in South East Asia. We have managed to rapidly build and grow a world class team of engineers ready to take on diverse and challenging technology development projects. We create software that are used and loved by millions of users, in sectors like Education, Technology, Healthcare, Services and more.\r\n\r\nThe Arbisoft formula...\r\nImagine. Build. Test. Repeat.",
    url: "https://www.arbisoft.com",
    employee_count: 889,
  },
};

export default function ProspectDetailsDrawer(props: {}) {
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      padding="xl"
      size="xl"
      position="right"
    >
      <ScrollArea
        style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
      >
        <ProspectDetailsSummary
          full_name={PROSPECT_DETAILS.details.full_name}
          status={PROSPECT_DETAILS.details.status}
          title={PROSPECT_DETAILS.details.title}
          profile_pic={PROSPECT_DETAILS.details.profile_pic}
        />
        <ProspectDetailsChangeStatus
          currentStatus={PROSPECT_DETAILS.details.status}
          prospectId={PROSPECT_DETAILS.details.id}
        />
        <ProspectDetailsViewConversation conversation_entry_list={[]} />
        <ProspectDetailsNotes
          currentStatus={PROSPECT_DETAILS.details.status}
          prospectId={PROSPECT_DETAILS.details.id}
        />
        <ProspectDetailsCompany
          logo={PROSPECT_DETAILS.company.logo}
          company_name={PROSPECT_DETAILS.company.name}
          location={PROSPECT_DETAILS.company.location}
          description={PROSPECT_DETAILS.company.description}
          employee_count={PROSPECT_DETAILS.company.employee_count}
          tagline={PROSPECT_DETAILS.company.tagline}
          tags={PROSPECT_DETAILS.company.tags}
          website_url={PROSPECT_DETAILS.company.url}
        />
      </ScrollArea>
    </Drawer>
  );
}
