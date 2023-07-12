import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { Card, LoadingOverlay, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import EmailQueuedMessageItem from "./EmailQueuedMessageItem";
import { Prospect } from "src";
import { getProspects } from "@utils/requests/getProspects";
import { currentProjectState } from "@atoms/personaAtoms";

export default function EmailQueuedMessages(props: { all?: boolean }) {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-queued-emails-prospects-all`],
    queryFn: async () => {

      const response = await getProspects(
        userToken,
        undefined,
        "EMAIL",
        99,
        undefined,
        'ALL',
        props.all ? undefined : currentProject?.id,
      );
      let prospects = response.status === 'success' ? response.data as Prospect[] : [];

      prospects = prospects.filter(
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
                  refresh={refetch}
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
