import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Tests a slack notification
 * @param userToken
 * @param slackNotificationID
 * @returns - MsgResponse
 */
export async function postTestSlackNotification(
  userToken: string,
  slackNotificationID: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/slack_notification/test`,
    // `http://127.0.0.1:5000/slack_notification/test`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slack_notification_id: slackNotificationID,
      }),
    }
  );
  return await processResponse(response, "message");
}