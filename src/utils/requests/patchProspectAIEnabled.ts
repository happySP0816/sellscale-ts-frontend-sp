import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies a persona filter on an Archetype
 * @param userToken 
 * @param prospectID
 * @returns - MsgResponse
 */
export async function patchProspectAIEnabled(
  userToken: string,
  prospectID: number,
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectID}/ai_engagement`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      }
    }
  );

  return await processResponse(response);

}
