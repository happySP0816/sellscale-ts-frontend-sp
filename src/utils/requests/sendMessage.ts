import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Send LinkedIn message to prospect
 * @param userToken
 * @param prospectId
 * @param message
 * @param purgatory
 * @returns - MsgResponse
 */
export async function sendLinkedInMessage(
  userToken: string,
  prospectId: number,
  message: string,
  purgatory?: boolean
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/voyager/send_message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prospect_id: prospectId,
      message: message,
      purgatory: purgatory ?? true,
    }),
  });
  return await processResponse(response);
}
