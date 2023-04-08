import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Send LinkedIn message to prospect
 * @param userToken 
 * @param prospectId 
 * @param message 
 * @returns - MsgResponse
 */
export async function sendLinkedInMessage(userToken: string, prospectId: number, message: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voyager/send_message`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "prospect_id": prospectId,
        "message": message,
      }),
    }
  );
  const result = await getResponseJSON("send-linkedin-message", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Sent message` };

}
