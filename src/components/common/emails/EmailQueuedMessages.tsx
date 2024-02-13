import { userDataState, userTokenState } from "@atoms/userAtoms";
import { ActionIcon, Badge, Box, Button, Flex, HoverCard, Text, TextInput, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import EmailQueuedMessageItem from "./EmailQueuedMessageItem";
import { currentProjectState } from "@atoms/personaAtoms";
import { getScheduledEmails } from "@utils/requests/getScheduledEmails";
import { useEffect, useRef, useState } from "react";
import { DataTable } from "mantine-datatable";
import { Prospect } from "src";
import { IconEdit, IconPencil, IconSearch } from "@tabler/icons";
import DOMPurify from "dompurify";
import { DateTimePicker } from "@mantine/dates";
import { patchScheduledEmails } from "@utils/requests/patchScheduledEmail";
import { showNotification } from "@mantine/notifications";
import { useForceUpdate } from "@mantine/hooks";
import { UpcomingGenerationsView } from '@common/messages/LinkedinQueuedMessages';

export default function EmailQueuedMessages(props: { all?: boolean }) {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState)
  const currentProject = useRecoilValue(currentProjectState);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (search === '') {
      setMessages(data || []);
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

      console.log(messages)

      return messages as any[]
    },
    refetchOnWindowFocus: false,
  });

  const triggerModifyScheduledDate = async (scheduleID: number, newTime: Date | string) => {

    const result = await patchScheduledEmails(
      userToken,
      scheduleID,
      newTime
    )
    if (result.status === 'success') {
      showNotification({
        title: 'Updated',
        message: 'Successfully updated the scheduled date and future dates',
        color: 'green',
        autoClose: 5000,
      });
      refetch()
      forceUpdate();
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
        autoClose: 5000,
      });
    }

  }

  return (
    <Flex w='100%' align='left' justify={'center'} direction='column'>
      <UpcomingGenerationsView showEmailActive />
      <Title order={4} mt='lg' mb='xs'>{userData.sdr_name}'s Queued Emails</Title>
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
        records={messages}
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
            title: "Estimated Send Time",
            render: ({ date_scheduled, id }) => {
              // Convert the time string to SDRs timezone
              const date = new Date(date_scheduled);
              const month = date.toLocaleString('default', { month: 'long' });
              const day = date.getDate();
              const hours = date.getHours();
              const minutes = date.getMinutes();

              // Get today's date
              const today = new Date();

              const [value, setValue] = useState<Date>(date);

              useEffect(() => {
                setValue(date)
              }, [date_scheduled])

              const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${hours >= 12 ? 'PM' : 'AM'}`;
              const formattedDate = `${month} ${day} - ${formattedTime}`;

              return (
                <>
                  <>
                    <DateTimePicker
                      placeholder={formattedDate}
                      value={value}
                      onChange={(value) => {
                        if (!value) {
                          setValue(date)
                        }
                        setValue(value as Date)
                      }}
                      submitButtonProps={{
                        onClick: () => {
                          triggerModifyScheduledDate(id, value)
                        }
                      }}
                      popoverProps={{
                        withArrow: true,
                        arrowPosition: 'center',
                        withinPortal: true
                      }}
                      defaultValue={date}
                      hideOutsideDates
                      valueFormat={"MMMM D, YYYY - h:mm A"}
                      maw={300}
                      minDate={today}
                    />
                  </>
                  {/* <Flex align='center'>
                    <Text mr='4px'>
                      {formattedDate}
                    </Text>
                    <ActionIcon>
                      <IconPencil size={12} />
                    </ActionIcon>
                  </Flex> */}
                </>
              )
            }
          },
          {
            accessor: "",
            title: "Email Type",
            render: (data) => {
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
          },
          {
            accessor: "",
            title: "Preview",
            render: (data) => {
              let subject_line = data.subject_line;
              let body = data.body;
              const disabled = subject_line == null && body == null;

              return (
                <HoverCard
                  width={disabled ? 400 : 600}
                  shadow="md"
                  withinPortal
                  withArrow
                >
                  <HoverCard.Target>
                    {
                      disabled ? (
                        <Text>
                          Generating soon...
                        </Text>
                      ) : (
                        <Button
                          variant='outline'
                          size='xs'
                          disabled={disabled}
                        >
                          See Preview
                        </Button>
                      )
                    }
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    {
                      disabled ? (
                        <Text size="sm">
                          Preview not available yet! Messages generate 24 hours before sending.
                        </Text>
                      ) : (
                        <>
                          <Text size="sm">
                            Subject Line:
                          </Text>
                          <Box
                            sx={() => ({
                              border: '1px solid #E0E0E0',
                              borderRadius: '8px',
                              backgroundColor: '#F5F5F5',
                            })}
                            p='xs'
                            my='xs'
                          >
                            <Text fz='sm'>
                              {subject_line.completion}
                            </Text>
                          </Box>
                          <Text size="sm">
                            Body:
                          </Text>
                          <Box
                            sx={() => ({
                              border: '1px solid #E0E0E0',
                              borderRadius: '8px',
                              backgroundColor: '#F5F5F5',
                            })}
                            px='md'
                            mt='sm'
                          >
                            <Text fz="sm">
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body.completion) }} />
                            </Text>
                          </Box>
                        </>
                      )
                    }
                  </HoverCard.Dropdown>
                </HoverCard>
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
