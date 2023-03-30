import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Send LinkedIn message to prospect
 * @param userToken 
 * @param prospectId 
 * @param message 
 * @returns - MsgResponse
 */
export async function sendLinkedInMessage(userToken: string, prospectId: number, message: string): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/voyager/send_message`,
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
