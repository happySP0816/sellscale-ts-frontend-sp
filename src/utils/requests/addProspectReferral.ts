import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Updates a prospect
 * @param userToken 
 * @param prospectId 
 * @param referred_id - ID of the referred prospect
 * @returns - MsgResponse
 */
export async function addProspectReferral(
  userToken: string,
  prospectId: number,
  referredId: number
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/add_referral`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referred_id: referredId,
        metadata: undefined,
      })
    }
  );

  return await processResponse(response);

}
