import { userTokenState } from "@atoms/userAtoms";
import ComingSoonCard from "@common/library/ComingSoonCard";
import { Stack, Title, Group, LoadingOverlay, Card, Button, ScrollArea, Loader, Center } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import getEngagementFeedItems from "@utils/requests/getEngagementFeedItems";
import EngagementFeedItem from "./EngagementFeedItem";
import { useEffect } from "react";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import { testDelay } from "@utils/general";

const ENGAGEMENT_FEED_PAGE_LIMIT = 5;


type EngagementFeedItemType = {
  channel_type: string,
  client_sdr_id: number,
  engagement_type: string,
  prospect_id: number,
  viewed: boolean,
  prospect_name: string | null,
  prospect_title: string | null,
  prospect_company: string | null,
  prospect_img_url: string | null,
  sdr_img_url: string | null,
  engagement_metadata: any
}


export default function RecentActivitySection() {
  const [page, setPage] = useDebouncedState(0, 300);
  const userToken = useRecoilValue(userTokenState);
  const [isFetching, setIsFetching] = useState(false);
  const allEngagementFeedItems = useRef<EngagementFeedItemType[]>([]);

  const [scrollPosition, onScrollPositionChange] = useDebouncedState({ x: 0, y: 0 }, 300);
  const scrollRef = useRef<HTMLDivElement>(null);
  const outerScrollRef = useRef<HTMLDivElement>(null);
  const totalItems = useRef<number>(-1);

  useDidUpdate(() => {
    setIsFetching(true);
    (async () => {
      const response = await getEngagementFeedItems(userToken, ENGAGEMENT_FEED_PAGE_LIMIT, (page - 1) * ENGAGEMENT_FEED_PAGE_LIMIT)
      const engagement_feed_items = response.status === 'success' ? response.data.engagement_feed_items : [];
      totalItems.current = response.status === 'success' ? response.data.total_count : -1;
      allEngagementFeedItems.current = allEngagementFeedItems.current.concat(engagement_feed_items);
      setIsFetching(false);
    })();
  }, [page]);

  useEffect(() => {
    if(
      !scrollRef.current ||
      !outerScrollRef.current ||
      (totalItems.current !== -1 && allEngagementFeedItems.current.length >= totalItems.current)
    ){ return; }
    const maxScroll = scrollRef.current.scrollHeight - outerScrollRef.current.scrollHeight;
    if(scrollPosition.y >= (maxScroll - 150) && !isFetching){
      setPage(page + 1);
    }
  }, [scrollPosition]);

  return (
    <ScrollArea h='85vh' onScrollPositionChange={onScrollPositionChange} ref={outerScrollRef} viewportRef={scrollRef}>
      <Stack>
        {
          allEngagementFeedItems.current && allEngagementFeedItems.current.length > 0 ?

          allEngagementFeedItems.current?.map((engagement_feed_item: EngagementFeedItemType, i: number) => {
              return (
                <div key={i}>
                  <EngagementFeedItem
                    channelType={engagement_feed_item.channel_type}
                    clientSDRID={engagement_feed_item.client_sdr_id}
                    engagementType={engagement_feed_item.engagement_type}
                    prospectID={engagement_feed_item.prospect_id}
                    viewed={engagement_feed_item.viewed}
                    prospectName={engagement_feed_item.prospect_name}
                    prospectTitle={engagement_feed_item.prospect_title}
                    prospectCompany={engagement_feed_item.prospect_company}
                    prospectImgURL={engagement_feed_item.prospect_img_url}
                    sdrImgURL={engagement_feed_item.sdr_img_url}
                    engagementMetadata={engagement_feed_item.engagement_metadata}
                  />
                </div>
              )
            })

            :
            (
              <Card m="md">
                No recent engagements... yet!
              </Card>
            )
        }
      </Stack>
      <Center my={20} sx={{ visibility: isFetching ? "visible" : "hidden" }}>
        <Loader variant="dots" />
      </Center>
    </ScrollArea>
  )

}
