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
  prospectId: number,
  check_for_update?: boolean
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/voyager/conversation?prospect_id=${prospectId}&check_for_update=${check_for_update === undefined ? true : check_for_update}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response);
}
