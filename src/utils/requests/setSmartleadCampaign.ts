import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Set smartlead campaign
 * @param userToken
 * @returns - MsgResponse
 */
export async function setSmartleadCampaign(userToken: string, archetype_id: number, campaign_id: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/smart_email/set_campaign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archetype_id: archetype_id,
      campaign_id: campaign_id,
    }),
  });
  return await processResponse(response, 'data');
}