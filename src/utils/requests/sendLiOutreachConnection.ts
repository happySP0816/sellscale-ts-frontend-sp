import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Sends a LinkedIn outreach connection request to a prospect
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function sendLiOutreachConnection(
  userToken: string,
  prospectId: number,
  message: string
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/send_outreach_connection`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
      })
    }
  );

  return await processResponse(response);

}
