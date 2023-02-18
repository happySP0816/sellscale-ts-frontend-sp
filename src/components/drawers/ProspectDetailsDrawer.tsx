import { Drawer, LoadingOverlay, ScrollArea, Title } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectDrawerCurrentStatusState,
} from "@atoms/prospectAtoms";
import { useQuery } from "react-query";
import ProspectDetailsSummary from "../common/prospectDetails/ProspectDetailsSummary";
import ProspectDetailsChangeStatus from "../common/prospectDetails/ProspectDetailsChangeStatus";
import ProspectDetailsCompany from "../common/prospectDetails/ProspectDetailsCompany";
import ProspectDetailsNotes from "../common/prospectDetails/ProspectDetailsNotes";
import ProspectDetailsViewConversation from "../common/prospectDetails/ProspectDetailsViewConversation";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";

async function getChannelOptions(prospectId: number, userToken: string){
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/get_valid_channel_types?prospect_id=${prospectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const res = await response.json();
  return res.choices;
}

async function getChannelStatusOptions(prospectId: number, userToken: string, channelType: string){
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/get_valid_next_prospect_statuses?prospect_id=${prospectId}&channel_type=${channelType}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const res = await response.json();
  return res;
}

export default function ProspectDetailsDrawer() {
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [currentStatus, setCurrentStatus] = useRecoilState(prospectDrawerCurrentStatusState);
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

      const channelOptions = await getChannelOptions(prospectId, userToken);
      for(let channelOption of channelOptions){
        const channelStatusOptions = await getChannelStatusOptions(prospectId, userToken, channelOption.value);
        channelOption.status_options = channelStatusOptions;
      }

      console.log(channelOptions);

      setCurrentStatus(res.prospect_info.details.status);

      return { main: res, channelOptions };
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
          {data?.main.prospect_info ? data.main.prospect_info.details.full_name : ""}
        </Title>
      }
      padding="xl"
      size="xl"
      position="right"
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.main.prospect_info && !isFetching && (
        <ScrollArea
          style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
        >
          <ProspectDetailsSummary
            full_name={data.main.prospect_info.details.full_name}
            title={data.main.prospect_info.details.title}
            email={data.main.prospect_info.email.email}
            linkedin={data.main.prospect_info.li.li_profile}
            profile_pic={data.main.prospect_info.details.profile_pic}
          />
          {data.channelOptions.length > 0 && (
            <ProspectDetailsChangeStatus
              prospectId={data.main.prospect_info.details.id}
              channelOptions={data.channelOptions}
            />
          )}
          {data.main.prospect_info.li?.li_conversation_thread?.length > 0 && (
            <ProspectDetailsViewConversation
              conversation_entry_list={
                data.main.prospect_info.li.li_conversation_thread
              }
              conversation_url={data.main.prospect_info.li.li_conversation_url}
            />
          )}
          <ProspectDetailsNotes
            currentStatus={data.main.prospect_info.details.status}
            prospectId={data.main.prospect_info.details.id}
            notes={data.main.prospect_info.details.notes}
          />
          {data.main.prospect_info.company.name && (
            <ProspectDetailsCompany
              logo={data.main.prospect_info.company.logo}
              company_name={data.main.prospect_info.company.name}
              location={data.main.prospect_info.company.location}
              description={data.main.prospect_info.company.description}
              employee_count={data.main.prospect_info.company.employee_count}
              tagline={data.main.prospect_info.company.tagline}
              tags={data.main.prospect_info.company.tags}
              website_url={data.main.prospect_info.company.url}
            />
          )}
        </ScrollArea>
      )}
    </Drawer>
  );
}
