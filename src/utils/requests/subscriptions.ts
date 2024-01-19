import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Get all subscriptions for the user
 * @param userToken
 * @returns - MsgResponse
 */
export async function getSubscriptions(
  userToken: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/subscriptions/`,
    // `http://127.0.0.1:5000/subscriptions/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}


/**
 * Activate a subscription
 * @param userToken
 * @param slackNotificationID
 * @returns - MsgResponse
 */
export async function activateSubscription(
  userToken: string,
  slackNotificationID?: number | null
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/subscriptions/activate`,
    // `http://127.0.0.1:5000/subscriptions/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slack_notification_id: slackNotificationID,
      }),
    }
  );

  return await processResponse(response, "data");
}


/**
 * Deactivate a subscription
 * @param userToken
 * @param subscriptionID
 * @returns - MsgResponse
 */
export async function deactivateSubscription(
  userToken: string,
  subscriptionID: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/subscriptions/deactivate`,
    // `http://127.0.0.1:5000/subscriptions/deactivate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription_id: subscriptionID,
      }),
    }
  );
  return await processResponse(response, "data");
}
