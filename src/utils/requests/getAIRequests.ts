import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all AI Requests for a specific user.
 * @param userToken - The user's authentication token.
 * @param clientSdrId - The user's SDR ID.
 * @returns - MsgResponse
 */
export async function getAIRequests(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ai_requests/user`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}
