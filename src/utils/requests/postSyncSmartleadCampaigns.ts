import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Syncs the smartlead campaigns
 * @param userToken
 * @returns - MsgResponse
 */
export default async function postSyncSmartleadCampaigns(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/campaigns`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await processResponse(response);
}
