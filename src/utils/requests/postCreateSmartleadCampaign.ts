import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Creates a new smartlead campaign
 * @param userToken
 * @param archetypeID
 * @param sync
 * @returns - MsgResponse
 */
export default async function postCreateSmartleadCampaign(userToken: string, archetypeID: number, sync: boolean): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/campaigns/create`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetypeID,
        sync_to_archetype: sync,
      }),
    }
  );
  return await processResponse(response, 'data');
}
