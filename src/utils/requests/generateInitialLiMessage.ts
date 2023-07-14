import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generate initial LI message for a prospect
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function generateInitialLiMessage(userToken: string, prospectId: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/message_generation/generate_init_li_message`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectId,
      })
    }
  );

  return await processResponse(response, 'data');

}
