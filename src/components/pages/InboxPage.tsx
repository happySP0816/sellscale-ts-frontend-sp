import { userTokenState, userDataState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import InboxProspectConvo from "@common/inbox/InboxProspectConvo";
import InboxProspectDetails from "@common/inbox/InboxProspectDetails";
import InboxProspectList from "@common/inbox/InboxProspectList";
import { API_URL } from "@constants/data";
import { Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { setPageTitle } from "@utils/documentChange";
import { useRecoilValue } from "recoil";
import { Prospect } from "src";


export default function InboxPage() {
  setPageTitle("Inbox");

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-dash-get-prospects`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/prospect/get_prospects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "SELLSCALE",
          limit: 10000, // TODO: Maybe use pagination method instead
          status: ["DEMO", "ACTIVE_CONVO"],
          show_purgatory: "ALL",
        }),
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.prospects) {
        return [];
      }
      return res.prospects as Prospect[];
    },
    refetchOnWindowFocus: false,
  });
  const prospects = data ?? [];
  
  return (
    <Grid columns={100} gutter={0}>
      <Grid.Col span={27} >
        <InboxProspectList prospects={prospects} />
      </Grid.Col>
      <Grid.Col span={46}>
        <InboxProspectConvo prospects={prospects} />
      </Grid.Col>
      <Grid.Col span={27}>
        <InboxProspectDetails prospects={prospects} />
      </Grid.Col>
    </Grid>
  );

}
