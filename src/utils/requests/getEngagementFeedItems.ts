import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";

export default async function getEngagementFeedItems(userToken: string, limit: number, offset: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/daily_notifications/engagement/feed?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  const result = await getResponseJSON("engagement-feed-get", response);
  if(isMsgResponse(result)) { return result; }

  return {
    status: 'success',
    title: `Success`,
    message: `Received engagement feed items`,
    extra: {
      engagement_feed_items: result.engagement_feed_items,
      total_count: result.total_count,
    }
  };
}
