import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { getLIMessagesQueuedForOutreach } from "@utils/requests/getMessagesQueuedForOutreach";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { Card, Center, Flex, Loader, Paper, ScrollArea, Stack, Title, Text, Avatar, Badge } from "@mantine/core";

import LinkedinQueuedMessageItem from "./LinkedinQueuedMessageItem";
import { getUpcomingGenerations } from "@utils/requests/getUpcomingGenerations";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { IconChevronUp, IconSelector } from "@tabler/icons";
import { sortBy } from "lodash";

const LI_MESSAGE_PAGE_LIMIT = 5;

type MessageType = {
  prospect_id: number;
  full_name: string;
  title: string;
  company: string;
  img_url: string;
  message_id: number;
  completion: string;
  icp_fit_score: number;
  icp_fit_reason: string;
  archetype: string;
};

type UpcomingGeneration = {
  active: boolean;
  archetype: string;
  contact_count: number;
  email_active: boolean;
  id: number;
  linkedin_active: boolean;
  sdr_img_url: string;
  sdr_name: string;
  daily_sla_count: number
}

const UpcomingGenerationsView = () => {
  const userToken = useRecoilValue(userTokenState);
  const [isFetching, setIsFetching] = useState(false);
  const [upcomingGenerations, setUpcomingGenerations] = useState<UpcomingGeneration[]>([]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'archetype',
    direction: 'desc',
  });

  const triggerGetUpcomingGenerations = async () => {
    setIsFetching(true);

    const response = await getUpcomingGenerations(
      userToken,
      true,
      true,
    );
    const archetypes = response.status === "success" ? response.data : [];
    let linkedinActiveArchetypes = []
    for (const archetype of archetypes) {
      if (archetype.linkedin_active) {
        linkedinActiveArchetypes.push(archetype)
      }
    }
    setUpcomingGenerations(linkedinActiveArchetypes);

    setIsFetching(false);
  }

  useEffect(() => {
    triggerGetUpcomingGenerations();
  }, []);

  useEffect(() => {
    const pageData = sortBy(upcomingGenerations, sortStatus.columnAccessor);
    setUpcomingGenerations(sortStatus.direction === "desc" ? pageData.reverse() : pageData)
  }, [sortStatus])


  return (
    <>
      <Title order={4}>Upcoming Generations</Title>
      <DataTable
        withBorder
        borderRadius={4}
        fetching={isFetching}
        records={upcomingGenerations}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        sortIcons={{
          sorted: <IconChevronUp size={14} />,
          unsorted: <IconSelector size={14} />,
        }}
        noRecordsText="No upcoming generations"
        columns={[
          {
            accessor: "archetype",
            title: "Campaign",
            sortable: true,
          },
          {
            accessor: "sdr_name",
            title: "SDR",
            sortable: true,
            render: ({ sdr_name, sdr_img_url }) => {
              const firstName = sdr_name.split(" ")[0];
              return (
                <Flex>
                  <Avatar src={sdr_img_url} radius="xl" size="sm" mr='sm' />
                  <Text>{firstName}</Text>
                </Flex>
              )
            }
          },
          {
            accessor: "id",
            title: "Scheduled For",
            render: () => {
              return (
                <Text>Tonight, 11:59pm</Text>
              )
            }
          },
          {
            accessor: "daily_sla_count",
            title: "Status",
            render: ({ daily_sla_count }) => {
              return (
                <Badge color='green.9'>Generating: {daily_sla_count}</Badge>
              )
            }
          }
        ]}

      />
    </>
  )
}

export default function LinkedinQueuedMessages(props: { all?: boolean }) {
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useDebouncedState(0, 300);
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const allMessages = useRef<MessageType[]>([]);

  const [scrollPosition, onScrollPositionChange] = useDebouncedState(
    { x: 0, y: 0 },
    300
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const outerScrollRef = useRef<HTMLDivElement>(null);
  const totalItems = useRef<number>(-1);

  const triggerGetMessagesQueuedForOutreach = async () => {
    setIsFetching(true);

    const response = await getLIMessagesQueuedForOutreach(
      userToken,
      LI_MESSAGE_PAGE_LIMIT,
      (page - 1) * LI_MESSAGE_PAGE_LIMIT
    );
    const messages =
      response.status === "success" ? response.data.messages : [];
    totalItems.current =
      response.status === "success" ? response.data.total_count : -1;
    allMessages.current = allMessages.current.concat(messages);

    setIsFetching(false);
  };

  useDidUpdate(() => {
    triggerGetMessagesQueuedForOutreach();
  }, [page]);

  useEffect(() => {
    if (
      !scrollRef.current ||
      !outerScrollRef.current ||
      (totalItems.current !== -1 &&
        allMessages.current.length >= totalItems.current)
    ) {
      return;
    }
    const maxScroll =
      scrollRef.current.scrollHeight - outerScrollRef.current.scrollHeight;
    if (scrollPosition.y >= maxScroll - 150 && !isFetching) {
      setPage(page + 1);
    }
  }, [scrollPosition]);

  return (
    <ScrollArea
      h="100vh"
      onScrollPositionChange={onScrollPositionChange}
      ref={outerScrollRef}
      viewportRef={scrollRef}
      w='100%'
    >
      <Stack p='md'>
        <UpcomingGenerationsView />
        <Title order={4}>{userData.sdr_name}'s Queued Messages</Title>
        {allMessages.current && allMessages.current.length > 0 ? (
          allMessages.current?.map((messageItem: MessageType, i: number) => {
            return (
              <div key={i}>
                <LinkedinQueuedMessageItem
                  prospect_id={messageItem.prospect_id}
                  full_name={messageItem.full_name}
                  title={messageItem.title}
                  company={messageItem.company}
                  img_url={messageItem.img_url}
                  message_id={messageItem.message_id}
                  completion={messageItem.completion}
                  index={i}
                  icp_fit_score={messageItem.icp_fit_score}
                  icp_fit_reason={messageItem.icp_fit_reason}
                  archetype={messageItem.archetype}
                  refresh={triggerGetMessagesQueuedForOutreach}
                />
              </div>
            );
          })
        ) : (
          <Card m="md">No messages queued for outreach... yet!</Card>
        )}
      </Stack>
      <Center my={20} sx={{ visibility: isFetching ? "visible" : "hidden" }}>
        <Loader variant="dots" />
      </Center>
    </ScrollArea>
  );
}
