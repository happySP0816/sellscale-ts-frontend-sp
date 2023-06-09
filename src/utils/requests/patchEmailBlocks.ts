import { logout } from "@auth/core";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies an email block
 * @param userToken
 * @param archetypeId
 * @param emailBlocks
 * @returns - MsgResponse
 */
export default async function patchEmailBlocks(userToken: string, archetypeId: number, emailBlocks: string[]): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeId}/email_blocks`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "email_blocks": emailBlocks
      })
    }
  );
  return await processResponse(response);

}
