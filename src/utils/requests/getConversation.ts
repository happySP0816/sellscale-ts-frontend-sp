import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get a conversation with a prospect
 * @param userToken
 * @param prospectId
 * @returns - MsgResponse
 */
export async function getConversation(
  userToken: string,
  prospectId: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/voyager/conversation?prospect_id=${prospectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response);
}
