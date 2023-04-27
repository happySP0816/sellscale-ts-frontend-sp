import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets LI messages queued for outreach
 * @param userToken
 * @param limit
 * @param offset 
 * @returns - MsgResponse
 */
export async function getLIMessagesQueuedForOutreach(
  userToken: string,
  limit: number,
  offset: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  const result = await getResponseJSON("get_li_messages_queued_for_outreach", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Retrieved LI messages queued for outreach`,
    extra: {
      "messages": result.messages,
      "total_count": result.total_count,
    },
  };
}
