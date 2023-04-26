import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Snoozed a prospect for a given number of days
 * @param userToken 
 * @param prospectId 
 * @param days 
 * @returns - MsgResponse
 */
export async function snoozeProspect(userToken: string, prospectId: number, days: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/send_to_purgatory?days=${days}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("send-to-purgatory", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Snoozed for ${days}` };

}
