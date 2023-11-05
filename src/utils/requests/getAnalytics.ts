import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all sequences for a user
 * @param userToken
 * @returns - MsgResponse
 */
export async function getAnalytics(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/analytics/client_campaign_analytics`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "analytics");
}
