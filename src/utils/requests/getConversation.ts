import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("get-linkedin-convo", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: result.data_status,
    extra: result.data,
  };
}
