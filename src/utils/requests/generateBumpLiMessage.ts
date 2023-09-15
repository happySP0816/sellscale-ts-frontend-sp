import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generate bump LI message for a prospect
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function generateBumpLiMessage(userToken: string, prospectId: number, bumpFrameworkId: number, bumpCount: number, useCache: boolean): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/message_generation/generate_bump_li_message`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectId,
        bump_framework_id: bumpFrameworkId,
        bump_count: bumpCount,
        use_cache: useCache,
      })
    }
  );

  return await processResponse(response, 'data');

}
