import { userTokenState } from "@atoms/userAtoms";
import { Badge, Flex, LoadingOverlay, Text, TextInput } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import EmailQueuedMessageItem from "./EmailQueuedMessageItem";
import { currentProjectState } from "@atoms/personaAtoms";
import { getScheduledEmails } from "@utils/requests/getScheduledEmails";
import { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import { Prospect } from "src";
import { IconSearch } from "@tabler/icons";

export default function EmailQueuedMessages(props: { all?: boolean }) {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (search === '') {
      setMessages(data);
      return;
    }
    const filtered = messages.filter((message: any) => {
      const p = message.prospect as Prospect;
      return p.full_name.toLowerCase().includes(search.toLowerCase());
    })

    setMessages(filtered);
  }, [search])

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-scheduled-emails`],
    queryFn: async () => {

      const response = await getScheduledEmails(
        userToken,
        null,
        true
      );

      let messages = response.status === 'success' ? response.data.schedule : [];
      
      // Sort the messages on date scheduled
      messages = messages.sort((a: any, b: any) => {
        return new Date(a.date_scheduled).getTime() - new Date(b.date_scheduled).getTime();
      })
      setMessages(messages);

      return messages
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Flex w='100%' align='left' justify={'center'} direction='column'>
      <LoadingOverlay visible={isFetching} />
      <TextInput
        rightSection={<IconSearch size={14} />}
        placeholder="Search by prospect name"
        mb='xs'
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <DataTable
        minHeight={200}
        withBorder
        verticalAlignment="center"
        loaderColor="purple"
        fetching={isFetching}
        noRecordsText="No emails queued for outreach... yet!"
        records={messages ?? []}
        highlightOnHover
        columns={[
          {
            accessor: "prospect",
            title: "Prospect",
            render: ({ prospect }) => {
              const p = prospect as Prospect;
              return (
                <Text>
                  {p.full_name}
                </Text>
              )
            }
          },
          {
            accessor: "date_scheduled",
            title: "Date Scheduled",
            render: ({ date_scheduled }) => {
              // Convert the time string to SDRs timezone
              const date = new Date(date_scheduled);
              const month = date.toLocaleString('default', { month: 'long' });
              const day = date.getDate();
              const hours = date.getHours();
              const minutes = date.getMinutes();

              const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${hours >= 12 ? 'PM' : 'AM'}`;
              const formattedDate = `${month} ${day} - ${formattedTime}`;

              return (
                <Text>
                  {formattedDate}
                </Text>
              )
            }
          },
          {
            accessor: "",
            title: "Email Type",
            render: ( data ) => {
              // Determine the type
              let type = data.email_type;
              if (type === 'INITIAL_EMAIL') {
                type = 'Initial Email';
              } else {
                // Get the status of the template
                const body_template = data.body_template
                const overall_status = body_template.overall_status;
                if (overall_status === 'ACCEPTED') {
                  type = 'Follow Up #1'
                } else {
                  // Get bump count
                  const bumped_count = body_template.bumped_count;
                  type = `Follow Up #${bumped_count + 1}`;
                }
              }

              return (
                <Badge
                  color={type === 'Initial Email' ? 'teal' : 'grape'}
                >
                  {type}
                </Badge>
                // <Text>
                //   {subject_line_template.subject_line}
                // </Text>
              )
            }
          }
        ]}
      />
      {/* <Stack>
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
      </Stack> */}
    </Flex>
  );
}
