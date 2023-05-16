import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function sendEmail(userToken: string, prospectId: number, subject: string, body: string, aiGenerated: boolean): Promise<MsgResponse> {

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
      }),
    }
  );
  return await processResponse(response, 'data');

}
