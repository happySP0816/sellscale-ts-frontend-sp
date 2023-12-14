import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Modifies the ICP Prompt for a given archetype
 * @param userToken
 * @param archetypeID
 * @returns - MsgResponse
 */
export default async function postCreateSmartleadCampaign(userToken: string, archetypeID: number): Promise<MsgResponse> {
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
      }),
    }
  );
  return await processResponse(response, 'data');
}
