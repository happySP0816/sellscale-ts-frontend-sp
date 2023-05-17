import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function sendEmail(userToken: string, prospectId: number, subject: string, body: string, aiGenerated: boolean, reply_to_message_id?: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
        body,
        ai_generated: aiGenerated,
        reply_to_message_id: reply_to_message_id,
      }),
    }
  );
  return await processResponse(response, 'data');

}
