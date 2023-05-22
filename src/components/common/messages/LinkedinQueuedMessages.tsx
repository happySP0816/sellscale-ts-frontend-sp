import { userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { getLIMessagesQueuedForOutreach } from "@utils/requests/getMessagesQueuedForOutreach";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { Card, Center, Loader, ScrollArea, Stack } from "@mantine/core";

import LinkedinQueuedMessageItem from "./LinkedinQueuedMessageItem";

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
};

export default function LinkedinQueuedMessages() {
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useDebouncedState(0, 300);
  const userToken = useRecoilValue(userTokenState);
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
    console.log(totalItems.current, allMessages.current.length);
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
    >
      <Stack>
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
