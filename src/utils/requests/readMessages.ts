import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Indicate that LI messages have been read
 * @param userToken
 * @param messageID
 * @param update 
 * @returns - MsgResponse
 */
export async function readLiMessages(
  userToken: string,
  prospectId: number,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/li_conversation/prospect/read_messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "prospect_id": prospectId,
      }),
    }
  );
  return await processResponse(response, 'data');
}
