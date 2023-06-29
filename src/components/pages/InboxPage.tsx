import { nurturingModeState } from "@atoms/inboxAtoms";
import { prospectShowPurgatoryState } from "@atoms/prospectAtoms";
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
  const nurturingMode = useRecoilValue(nurturingModeState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-dash-get-prospects`,
      { nurturingMode },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { nurturingMode }] =
        queryKey;

      const response = await fetch(`${API_URL}/prospect/get_prospects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "SELLSCALE",
          limit: 10000, // TODO: Maybe use pagination method instead
          status: nurturingMode ? ['ACCEPTED', 'BUMPED'] : ['ACTIVE_CONVO', 'DEMO'],
          show_purgatory: 'ALL',
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

  if (prospects.length > 0) {
    setPageTitle(`Inbox (${prospects.length})`);
  }
  
  return (
    <Grid columns={100} gutter={0}>
      <Grid.Col span={27} >
        <InboxProspectList prospects={prospects} isFetching={isFetching} />
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
