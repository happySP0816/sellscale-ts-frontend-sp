import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Replies to a prospect using smartlead
 * @param userToken
 * @param prospectID
 * @param emailBody
 * @returns - MsgResponse
 */
export default async function postSmartleadReply(userToken: string, prospectID: number, emailBody: string, scheduledSendDate?: Date): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/prospect/conversation`,
    // `http://127.0.0.1:5000/smartlead/prospect/conversation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectID,
        email_body: emailBody,
        scheduled_send_date: scheduledSendDate,
      }),
    }
  );
  return await processResponse(response);
}
