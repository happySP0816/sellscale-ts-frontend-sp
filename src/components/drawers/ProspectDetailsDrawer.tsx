import { Drawer, LoadingOverlay, ScrollArea, Title } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { prospectDrawerIdState, prospectDrawerOpenState } from "@atoms/prospectAtoms";
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
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";

export default function ProspectDetailsDrawer() {
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const prospectId = useRecoilValue(prospectDrawerIdState);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-details-${prospectId}`],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/prospect/${prospectId}`,
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );
      if(response.status === 401){ logout() }
      const res = await response.json();

      return res;
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      title={<Title order={2}>{(data?.details) ? data.details.full_name : ''}</Title>}
      padding="xl"
      size="xl"
      position="right"
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.details && !isFetching && (
        <ScrollArea
          style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
        >
          <ProspectDetailsSummary
            full_name={data.details.full_name}
            title={data.details.title}
            email={data.email.email}
            linkedin={data.li.li_profile}
            profile_pic={data.details.profile_pic}
          />
          <ProspectDetailsChangeStatus
            currentStatus={data.details.status}
            prospectId={data.details.id}
          />
          <ProspectDetailsViewConversation conversation_entry_list={[]} />
          <ProspectDetailsNotes
            currentStatus={data.details.status}
            prospectId={data.details.id}
          />
          <ProspectDetailsCompany
            logo={data.company.logo}
            company_name={data.company.name}
            location={data.company.location}
            description={data.company.description}
            employee_count={data.company.employee_count}
            tagline={data.company.tagline}
            tags={data.company.tags}
            website_url={data.company.url}
          />
        </ScrollArea>
      )}
    </Drawer>
  );
}
