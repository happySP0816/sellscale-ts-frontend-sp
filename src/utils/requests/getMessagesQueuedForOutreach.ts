import { MsgResponse } from "src";
import { processResponse } from "./utils";
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
  return processResponse(response);
}
