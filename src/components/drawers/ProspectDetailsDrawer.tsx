import { Drawer, LoadingOverlay, ScrollArea, Title } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { useQuery } from "react-query";
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
      if (prospectId === -1) {
        return null;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/prospect/${prospectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
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
      title={
        <Title order={2}>
          {data?.prospect_info ? data.prospect_info.details.full_name : ""}
        </Title>
      }
      padding="xl"
      size="xl"
      position="right"
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.prospect_info && !isFetching && (
        <ScrollArea
          style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
        >
          <ProspectDetailsSummary
            full_name={data.prospect_info.details.full_name}
            title={data.prospect_info.details.title}
            email={data.prospect_info.email.email}
            linkedin={data.prospect_info.li.li_profile}
            profile_pic={data.prospect_info.details.profile_pic}
          />
          <ProspectDetailsChangeStatus
            currentStatus={data.prospect_info.details.status}
            prospectId={data.prospect_info.details.id}
          />
          {data.prospect_info.li?.li_conversation_thread?.length > 0 && (
            <ProspectDetailsViewConversation
              conversation_entry_list={
                data.prospect_info.li.li_conversation_thread
              }
              conversation_url={data.prospect_info.li.li_conversation_url}
            />
          )}
          <ProspectDetailsNotes
            currentStatus={data.prospect_info.details.status}
            prospectId={data.prospect_info.details.id}
            notes={data.prospect_info.details.notes}
          />
          {data.prospect_info.company.name && (
            <ProspectDetailsCompany
              logo={data.prospect_info.company.logo}
              company_name={data.prospect_info.company.name}
              location={data.prospect_info.company.location}
              description={data.prospect_info.company.description}
              employee_count={data.prospect_info.company.employee_count}
              tagline={data.prospect_info.company.tagline}
              tags={data.prospect_info.company.tags}
              website_url={data.prospect_info.company.url}
            />
          )}
        </ScrollArea>
      )}
    </Drawer>
  );
}
