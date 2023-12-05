import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get Smartlead prospects that have replied conversations
 * @param userToken
 * @returns - MsgResponse
 */
export async function getSmartleadProspectConvo(
  userToken: string,
  prospectID: number,
  smartleadCampaignID: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/prospect/conversation?prospect_id=${prospectID}&smartlead_campaign_id=${smartleadCampaignID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}
