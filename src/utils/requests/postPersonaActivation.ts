import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Deactivates a persona
 * @param userToken
 * @param archetypeID
 * @returns - MsgResponse
 */
export async function activatePersona(userToken: string, archetypeID: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response);
}
