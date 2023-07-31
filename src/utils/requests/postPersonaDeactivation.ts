import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Deactivates a persona
 * @param userToken
 * @param archetypeID
 * @param hardDeactivate
 * @returns - MsgResponse
 */
export async function deactivatePersona(userToken: string, archetypeID: number, hardDeactivate: boolean = false): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/deactivate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hard_deactivate: hardDeactivate,
      }),
    }
  );
  return await processResponse(response);
}
