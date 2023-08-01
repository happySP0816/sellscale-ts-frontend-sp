import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Bulk Action - Move
 * Moves prospects from one persona to another
 * @param userToken 
 * @param targetPersonaID
 * @param prospectIDs
 * @returns - MsgResponse
 */
export async function postBulkActionMove(userToken: string, targetPersonaID: number, prospectIDs: number[]): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/bulk_action/move`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_archetype_id: targetPersonaID,
        prospect_ids: prospectIDs,
      })
    }
  );
  return await processResponse(response);

}

