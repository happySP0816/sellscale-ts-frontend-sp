import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Exchanges Slack Auth Code for
 *
 * @returns - MSGResponse
 */
export default async function exchangeSlackAuthCode(
  userToken: string,
  slackCode: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/slack/authentication/exchange`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: slackCode,
      }),
    }
  );
  return await processResponse(response);
}
