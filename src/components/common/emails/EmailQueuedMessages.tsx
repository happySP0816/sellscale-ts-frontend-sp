import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { Card, LoadingOverlay, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import EmailQueuedMessageItem from "./EmailQueuedMessageItem";

export default function EmailQueuedMessages() {
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-queued-emails-prospects-all`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/prospect/get_prospects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "EMAIL",
          limit: 99,
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

      console.log("YEEEE");
      console.log(res);

      let prospects = res.prospects.filter(
        (prospect: any) =>
          prospect.email_data &&
          prospect.email_data.date_scheduled_to_send &&
          prospect.email_data.outreach_status === "QUEUED_FOR_OUTREACH"
      );
      return prospects.sort((a: any, b: any) => {
        return (
          new Date(a.email_data.date_scheduled_to_send).getTime() -
          new Date(b.email_data.date_scheduled_to_send).getTime()
        );
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div style={{ position: "relative" }}>
      <LoadingOverlay visible={isFetching} />
      <Stack>
        {data && data.length > 0 ? (
          <>
            {data &&
              data.map((prospect: any, index: number) => (
                <EmailQueuedMessageItem
                  key={index}
                  prospect_id={prospect.id}
                  full_name={prospect.full_name}
                  title={prospect.title}
                  company={prospect.company}
                  img_url={prospect.img_url}
                  subject={
                    prospect.email_data.personalized_subject_line.completion
                  }
                  body={prospect.email_data.personalized_body.completion}
                  date_scheduled_to_send={
                    prospect.email_data.date_scheduled_to_send
                  }
                />
              ))}
          </>
        ) : (
          <Card m="md">No emails queued for outreach... yet!</Card>
        )}
      </Stack>
    </div>
  );
}
