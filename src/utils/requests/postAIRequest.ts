import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Submits AI content to the backend.
 * @param userToken - The token for user authorization.
 * @param aiRequest - The AI Request to be submitted.
 * @returns - MsgResponse
 */
export async function postAIRequest(userToken: string, aiRequest: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ai_requests/feedback`, 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ content: aiRequest }) 
    }
  );

  return await processResponse(response, 'data');
}
