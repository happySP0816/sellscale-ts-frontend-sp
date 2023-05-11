import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

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
  return await processResponse(response);
}
