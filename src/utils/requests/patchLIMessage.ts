import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Updates LI message
 * @param userToken
 * @param messageID
 * @param update 
 * @returns - MsgResponse
 */
export async function patchLIMessage(
  userToken: string,
  messageID: number,
  update: string,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "message_id": messageID,
        "update": update,
      }),
    }
  );
  const result = await getResponseJSON("patch_li_message", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Successfully updated message`
  };
}
