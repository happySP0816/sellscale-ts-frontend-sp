

import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Updates a persona blocklist
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function updateBlocklist(
  userToken: string,
  personaId: number,
  blocklist: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/set_transformer_blocklist`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_archetype_id: personaId,
        new_blocklist: blocklist,
      })
    }
  );

  return await processResponse(response);
}


/**
 * Updates a persona initial blocklist
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function updateInitialBlocklist(
  userToken: string,
  personaId: number,
  blocklist: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/set_transformer_blocklist_initial`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_archetype_id: personaId,
        new_blocklist: blocklist,
      })
    }
  );

  return await processResponse(response);
}
