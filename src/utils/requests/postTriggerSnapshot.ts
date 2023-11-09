import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Toggles the snapshot trigger
 * @param userToken
 * @param clientID
 * @returns - MsgResponse
 */
export default async function postTriggerSnapshot(userToken: string, clientID?: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email/warmup/snapshots`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientID,
      }),
    }
  );
  return await processResponse(response);
}
