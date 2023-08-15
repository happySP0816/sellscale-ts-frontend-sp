import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Sends a test slack webhook messafor for a client
 * @param userToken
 * @param webhook
 * @returns - MsgResponse
 */
export async function sendTestSlackWebhook(
  userToken: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/test_webhook`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return await processResponse(response);
}
