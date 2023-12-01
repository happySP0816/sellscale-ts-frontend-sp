import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Sync Smartlead Contacts
 * @param userToken
 * @returns - MsgResponse
 */
export async function syncSmartleadContacts(
  userToken: string,
  archetype_id: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/smartlead/sync_prospects_to_campaign`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archetype_id: archetype_id,
    }),
  });
  return await processResponse(response, 'data');
}