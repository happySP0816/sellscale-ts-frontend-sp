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
  smartleadCampaignID: number | null
): Promise<MsgResponse> {
  let url = `${API_URL}/smartlead/prospect/conversation?prospect_id=${prospectID}`;
  if (smartleadCampaignID) {
    url += `&smartlead_campaign_id=${smartleadCampaignID}`;
  }
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}
