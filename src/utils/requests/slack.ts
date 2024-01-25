import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get the Slack Channels that the user is connected to
 * @param userToken
 * @returns - MsgResponse
 */
export async function getConnectedSlackChannels(
  userToken: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/slack/channels`,
    // `http://127.0.0.1:5000/slack/channels`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}