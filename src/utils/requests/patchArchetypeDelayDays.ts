import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies a bump framework
 * @param userToken 
 * @param archetypeID
 * @param delayDays
 * @returns - MsgResponse
 */
export async function patchArchetypeDelayDays(
  userToken: string, 
  archetypeID: number, 
  delayDays: number
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/message_delay`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        delay_days: delayDays,
      })
    }
  );
  return await processResponse(response);

}
