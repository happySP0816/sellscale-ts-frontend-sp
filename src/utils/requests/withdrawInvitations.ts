

import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * 
 * @param userToken 
 * @param prospectIDs
 * @returns - MsgResponse
 */
export async function withdrawInvitations(userToken: string, prospectIDs: number[]): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/bulk_action/withdraw`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_ids: prospectIDs,
      }),
    }
  );
  return await processResponse(response);

}
