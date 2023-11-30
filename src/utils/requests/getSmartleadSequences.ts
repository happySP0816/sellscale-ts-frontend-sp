import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get Smartlead sequence for a given campaign
 * @param userToken
 * @returns - MsgResponse
 */
export async function getSmartleadSequence(
  userToken: string,
  campaignID: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/campaigns/sequence?campaign_id=${campaignID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}
